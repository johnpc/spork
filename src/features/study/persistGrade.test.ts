import { describe, it, expect, vi, beforeEach } from 'vitest';

const api = vi.hoisted(() => ({ gradeCard: vi.fn() }));
vi.mock('./studyApi', () => api);

import { persistGrade } from './persistGrade';
import type { QueuedCard } from './buildStudyQueue';

const card = {
  card: { id: 'c1' },
  review: null,
} as unknown as QueuedCard;

describe('persistGrade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not persist for a guest', async () => {
    await persistGrade(false, 'd1', card, 'A', 'A');
    expect(api.gradeCard).not.toHaveBeenCalled();
  });

  it('persists a passing SM-2 grade for a signed-in player on a correct pick', async () => {
    await persistGrade(true, 'd1', card, 'A', 'A');
    expect(api.gradeCard).toHaveBeenCalledWith('d1', 'c1', null, 4);
  });

  it('grades a wrong pick low', async () => {
    await persistGrade(true, 'd1', card, 'B', 'A');
    expect(api.gradeCard).toHaveBeenCalledWith('d1', 'c1', null, expect.any(Number));
    expect(api.gradeCard.mock.calls[0][3]).toBeLessThan(3);
  });
});
