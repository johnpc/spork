/**
 * Thin isolation wrappers over Bedrock — the only impure AI units. Mocked in
 * handler tests; all logic (prompt/parse) lives in the pure modules.
 *
 * Claude Haiku 4.5 for generated text; Stability stable-image-core for card
 * illustrations (active low-cost text-to-image).
 *
 * Model choice: our generation tasks are small, tool-forced, schema-bound
 * outputs (answer sets, word ladders, acrostics, trivia decks) — not reasoning-
 * heavy — and every game runs the result through a downstream validator +
 * retry (validateLadder/validateQuizzle/validateAcrostic/verifyMate/retryGen),
 * so the quality floor is enforced in code. Haiku is ~10x cheaper than Opus with
 * no meaningful quality risk here. Chess puzzles are template-backed (Lichess),
 * not LLM-generated. Bump this constant to a stronger model if a task ever needs
 * it — it's the single text-generation entry point for the whole app.
 */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export const TEXT_MODEL_ID = 'us.anthropic.claude-haiku-4-5-20251001-v1:0';
export const IMAGE_MODEL_ID = 'stability.stable-image-core-v1:1';

const client = new BedrockRuntimeClient({});

/** Invoke Claude with a prepared Anthropic body; return decoded JSON. */
export async function invokeText(body: string): Promise<unknown> {
  const res = await client.send(
    new InvokeModelCommand({
      modelId: TEXT_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body,
    }),
  );
  return JSON.parse(new TextDecoder().decode(res.body));
}

/**
 * Generate a square illustration from a prompt; return raw PNG bytes.
 * stable-image-core only supports png/jpeg output (NOT webp), and can't pick
 * pixel dimensions — so it emits a ~1024px PNG and the caller runs it through
 * sharp (resizeWebp) to shrink + convert to a small WebP before storing.
 */
export async function generateImage(prompt: string): Promise<Uint8Array> {
  const res = await client.send(
    new InvokeModelCommand({
      modelId: IMAGE_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({ prompt, aspect_ratio: '1:1', output_format: 'png' }),
    }),
  );
  const body = JSON.parse(new TextDecoder().decode(res.body)) as {
    images?: string[];
    finish_reasons?: (string | null)[];
  };
  const reason = body.finish_reasons?.[0];
  if (reason) throw new Error(`image generation did not complete: ${reason}`);
  const b64 = body.images?.[0];
  if (!b64) throw new Error('Stability response missing image');
  return Buffer.from(b64, 'base64');
}
