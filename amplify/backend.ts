import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { generateDeckStarter } from './deckgen/start/resource';
import { deckgenWorker } from './deckgen/worker/resource';
import { regenerateMedia } from './deckgen/regenerate/resource';

/**
 * SPORK backend. The AI deck-generation pipeline is an async worker (not
 * Step Functions): the generateDeck mutation's starter Lambda creates a DRAFT
 * Deck + GenerationRun and async-invokes the worker, which calls Bedrock
 * (Claude cards + Stability images) and Polly (audio), writing card media to S3
 * and Card rows straight to DynamoDB. A linear job, so a worker beats stoop's
 * map-reduce Step Functions with far less infra. IAM grants mirror stoop's
 * addToRolePolicy blocks.
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  generateDeckStarter,
  deckgenWorker,
  regenerateMedia,
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
