/** Pure parser for Claude's forced `generate_connections` tool output →
 * ConnectionsCandidate (validated separately). Tolerant of malformed content. */
import type { ConnectionsCandidate } from './validateConnections';

interface ContentBlock {
  type: string;
  name?: string;
  input?: unknown;
}

const strArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : [];

export function parseConnectionsGen(body: { content?: ContentBlock[] }): ConnectionsCandidate {
  const block = body.content?.find(
    (b) => b.type === 'tool_use' && b.name === 'generate_connections',
  );
  if (!block) throw new Error('no generate_connections tool_use block in model response');
  const o = (block.input ?? {}) as Record<string, unknown>;
  if (!Array.isArray(o.groups)) throw new Error('generate_connections missing groups array');
  const groups = o.groups.map((g: unknown) => {
    if (typeof g !== 'object' || g === null) return null;
    const obj = g as Record<string, unknown>;
    return {
      theme: typeof obj.theme === 'string' ? obj.theme : '',
      words: strArr(obj.words),
      level: typeof obj.level === 'number' ? obj.level : 0,
    };
  });
  return { groups: groups.filter((g): g is NonNullable<typeof g> => g !== null) };
}
