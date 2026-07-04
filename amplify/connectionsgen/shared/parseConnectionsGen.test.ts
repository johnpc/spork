import { describe, it, expect } from 'vitest';
import { parseConnectionsGen } from './parseConnectionsGen';

describe('parseConnectionsGen', () => {
  it('extracts groups from a valid tool_use block', () => {
    const body = {
      content: [
        {
          type: 'tool_use',
          name: 'generate_connections',
          input: {
            groups: [
              { theme: 'Fruits', words: ['apple', 'banana', 'cherry', 'date'], level: 0 },
              { theme: 'Colors', words: ['red', 'blue', 'green', 'yellow'], level: 1 },
            ],
          },
        },
      ],
    };
    const cand = parseConnectionsGen(body);
    expect(cand.groups).toHaveLength(2);
    expect(cand.groups[0].theme).toBe('Fruits');
    expect(cand.groups[0].words).toEqual(['apple', 'banana', 'cherry', 'date']);
  });

  it('throws when no generate_connections block', () => {
    expect(() => parseConnectionsGen({ content: [] })).toThrow('no generate_connections');
  });

  it('throws when groups missing', () => {
    const body = {
      content: [{ type: 'tool_use', name: 'generate_connections', input: {} }],
    };
    expect(() => parseConnectionsGen(body)).toThrow('missing groups array');
  });
});
