/**
 * Generate-then-validate with retries. The daily ingester never trusts the LLM:
 * it calls Bedrock, parses + validates the candidate with the SAME pure
 * validator the game's build-time fixture generator uses, and retries on a bad
 * candidate. Returns the validated payload or throws after `attempts` tries.
 * Pure of AWS specifics — `invoke` (the Bedrock call) is injected. Unit-tested
 * with a fake invoke that yields good/bad candidates.
 */
export type Invoke = (body: string) => Promise<unknown>;

export interface Attempt<T> {
  ok: boolean;
  reason?: string;
  value?: T;
}

/** Try up to `attempts` times to produce a valid `T`. `once` does one
 * invoke→parse→validate and returns {ok,value|reason}; throwing counts as a
 * failed attempt (malformed response). */
export async function retryGen<T>(
  label: string,
  attempts: number,
  once: () => Promise<Attempt<T>>,
): Promise<T> {
  let last = 'no attempts';
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await once();
      if (r.ok && r.value !== undefined) return r.value;
      last = r.reason ?? 'invalid';
    } catch (e) {
      last = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(`daily ${label}: no valid puzzle after ${attempts} tries (${last})`);
}
