import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { generateDeckStarter } from './deckgen/start/resource';
import { deckgenWorker } from './deckgen/worker/resource';
import { regenerateMedia } from './deckgen/regenerate/resource';
import { generateQuizStarter } from './quizgen/start/resource';
import { quizgenWorker } from './quizgen/worker/resource';

/**
 * SPORK backend.
 *
 * Flashcards generation is an async worker (not Step Functions): the generateDeck
 * starter creates a DRAFT Deck + GenerationRun and async-invokes the worker,
 * which calls Bedrock (Claude cards + Stability images) and Polly (audio),
 * writing media to S3 and Card rows straight to DynamoDB.
 *
 * Quizzes generation FORKS on mode (see CLAUDE.md): the generateQuiz starter
 * handles template-backed MAP synchronously (no Bedrock/worker — builds the
 * answer set from a shipped fixture). GENERATIVE modes create a DRAFT quiz +
 * RUNNING run and async-invoke the quizgen worker, which calls Claude (answers)
 * + Bedrock Stability (PICTURE_BOX images) and writes Answer rows to DynamoDB.
 *
 * IAM grants mirror stoop's addToRolePolicy blocks.
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  generateDeckStarter,
  deckgenWorker,
  regenerateMedia,
  generateQuizStarter,
  quizgenWorker,
});

const tables = backend.data.resources.tables;
const bucket = backend.storage.resources.bucket;

// Bedrock InvokeModel on the Claude (text) + Stability (image) models.
const bedrockGrant = () =>
  new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: [
      'arn:aws:bedrock:*::foundation-model/anthropic.*',
      'arn:aws:bedrock:*:*:inference-profile/*anthropic.*',
      'arn:aws:bedrock:*::foundation-model/stability.*',
    ],
  });
// Polly SynthesizeSpeech is not resource-scopable — must be '*'.
const pollyGrant = () =>
  new PolicyStatement({ actions: ['polly:SynthesizeSpeech'], resources: ['*'] });

// --- Starter: creates DRAFT Deck + GenerationRun, async-invokes the worker ---
backend.generateDeckStarter.addEnvironment('DECK_TABLE', tables['Deck'].tableName);
backend.generateDeckStarter.addEnvironment(
  'GENERATION_RUN_TABLE',
  tables['GenerationRun'].tableName,
);
backend.generateDeckStarter.addEnvironment(
  'WORKER_FUNCTION_NAME',
  backend.deckgenWorker.resources.lambda.functionName,
);
tables['Deck'].grantWriteData(backend.generateDeckStarter.resources.lambda);
tables['GenerationRun'].grantWriteData(backend.generateDeckStarter.resources.lambda);
backend.deckgenWorker.resources.lambda.grantInvoke(backend.generateDeckStarter.resources.lambda);

// --- Worker: Bedrock + Polly + S3 + Card/Deck/GenerationRun writes ---
const worker = backend.deckgenWorker.resources.lambda;
backend.deckgenWorker.addEnvironment('CARD_TABLE', tables['Card'].tableName);
backend.deckgenWorker.addEnvironment('DECK_TABLE', tables['Deck'].tableName);
backend.deckgenWorker.addEnvironment('GENERATION_RUN_TABLE', tables['GenerationRun'].tableName);
backend.deckgenWorker.addEnvironment('MEDIA_BUCKET', bucket.bucketName);
worker.addToRolePolicy(bedrockGrant());
worker.addToRolePolicy(pollyGrant());
bucket.grantWrite(worker, 'media/decks/*');
tables['Card'].grantWriteData(worker);
tables['Deck'].grantWriteData(worker);
tables['GenerationRun'].grantWriteData(worker);

// --- Regenerate: one card's image/audio (reads Card + Deck, writes media) ---
const regen = backend.regenerateMedia.resources.lambda;
backend.regenerateMedia.addEnvironment('CARD_TABLE', tables['Card'].tableName);
backend.regenerateMedia.addEnvironment('DECK_TABLE', tables['Deck'].tableName);
backend.regenerateMedia.addEnvironment('MEDIA_BUCKET', bucket.bucketName);
regen.addToRolePolicy(bedrockGrant());
regen.addToRolePolicy(pollyGrant());
bucket.grantWrite(regen, 'media/decks/*');
tables['Card'].grantReadWriteData(regen);
tables['Deck'].grantReadData(regen);

// --- Quiz starter: MAP writes Quiz+Answer+GenerationRun synchronously (no LLM);
// generative modes create a DRAFT quiz + RUNNING run and invoke the worker. ---
const quizStarter = backend.generateQuizStarter.resources.lambda;
backend.generateQuizStarter.addEnvironment('QUIZ_TABLE', tables['Quiz'].tableName);
backend.generateQuizStarter.addEnvironment('ANSWER_TABLE', tables['Answer'].tableName);
backend.generateQuizStarter.addEnvironment(
  'GENERATION_RUN_TABLE',
  tables['GenerationRun'].tableName,
);
backend.generateQuizStarter.addEnvironment(
  'WORKER_FUNCTION_NAME',
  backend.quizgenWorker.resources.lambda.functionName,
);
tables['Quiz'].grantWriteData(quizStarter);
tables['Answer'].grantWriteData(quizStarter);
tables['GenerationRun'].grantWriteData(quizStarter);
backend.quizgenWorker.resources.lambda.grantInvoke(quizStarter);

// --- Quiz worker (generative): Claude answers + Stability images (PICTURE_BOX)
// -> S3 + Answer/Quiz/GenerationRun writes. Bedrock + S3 grants like deckgen. ---
const quizWorker = backend.quizgenWorker.resources.lambda;
backend.quizgenWorker.addEnvironment('QUIZ_TABLE', tables['Quiz'].tableName);
backend.quizgenWorker.addEnvironment('ANSWER_TABLE', tables['Answer'].tableName);
backend.quizgenWorker.addEnvironment('GENERATION_RUN_TABLE', tables['GenerationRun'].tableName);
backend.quizgenWorker.addEnvironment('MEDIA_BUCKET', bucket.bucketName);
quizWorker.addToRolePolicy(bedrockGrant());
bucket.grantWrite(quizWorker, 'media/quizzes/*');
tables['Quiz'].grantWriteData(quizWorker);
tables['Answer'].grantWriteData(quizWorker);
tables['GenerationRun'].grantWriteData(quizWorker);
