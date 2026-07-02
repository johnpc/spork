/**
 * The deck-gen worker Lambda — async-invoked by the starter. Does the long job:
 * Claude generates the cards, then per card an image (Bedrock) + audio (Polly)
 * are produced to S3 and the Card row is written; finally the Deck/GenerationRun
 * are flipped to DRAFT_READY. Long timeout + modest memory (holds media bytes).
 * backend.ts grants Bedrock + Polly + S3 + table writes.
 */
import { defineFunction } from '@aws-amplify/backend';

/**
 * sharp is a native module — it can't be esbuild-bundled for Lambda. We ship the
 * linux-x64 build as a layer and reference it here; the `sharp` key externalizes
 * it from the bundle so the layer's binary is used at runtime. Republish via
 * `npm run layer:sharp` if the version changes.
 */
export const SHARP_LAYER_ARN = 'arn:aws:lambda:us-west-2:566092841021:layer:spork-sharp:1';

export const deckgenWorker = defineFunction({
  name: 'deckgen-worker',
  entry: './handler.ts',
  timeoutSeconds: 900, // up to 15 min: a large deck × (image + audio) per card
  memoryMB: 1024,
  // Co-locate with the starter (data stack) so the starter→worker invoke grant
  // and the worker's table writes don't span stacks (circular-dependency fix).
  resourceGroupName: 'data',
  layers: { sharp: SHARP_LAYER_ARN },
});
