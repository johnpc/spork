/**
 * The quiz-gen worker Lambda — async-invoked by the generateQuiz starter for
 * GENERATIVE modes. Claude writes the answers (tool-forced); PICTURE_BOX also
 * draws one image per answer (Bedrock Stability → sharp resize → S3). Writes the
 * Answer rows and flips Quiz + GenerationRun to DRAFT_READY (or FAILED).
 * backend.ts grants Bedrock + S3 + Quiz/Answer/GenerationRun writes. Reuses the
 * deckgen sharp layer (native module, can't be bundled).
 */
import { defineFunction } from '@aws-amplify/backend';
import { SHARP_LAYER_ARN } from '../../deckgen/worker/resource';

export const quizgenWorker = defineFunction({
  name: 'quizgen-worker',
  entry: './handler.ts',
  timeoutSeconds: 900, // picture modes: one image per answer
  memoryMB: 1024,
  // Co-locate with the starter (data stack) so the starter→worker invoke grant
  // and the worker's table writes don't span stacks (circular-dependency fix).
  resourceGroupName: 'data',
  layers: { sharp: SHARP_LAYER_ARN },
});
