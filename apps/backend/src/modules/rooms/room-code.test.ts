import { describe, expect, it } from 'vitest';
import { createRoomCode } from './room-code';

const SAFE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

describe('createRoomCode', () => {
  it('uses QUIZ- prefix + 6 chars from the unambiguous alphabet by default', () => {
    const pattern = new RegExp(`^QUIZ-[${SAFE}]{6}$`);
    for (let i = 0; i < 200; i += 1) {
      expect(createRoomCode()).toMatch(pattern);
    }
  });

  it('respects requested length and caps significant chars at 7', () => {
    expect(createRoomCode(4)).toMatch(new RegExp(`^QUIZ-[${SAFE}]{4}$`));
    expect(createRoomCode(1)).toMatch(new RegExp(`^QUIZ-[${SAFE}]{1}$`));
    expect(createRoomCode(8)).toMatch(new RegExp(`^QUIZ-[${SAFE}]{7}$`));
  });

  it('is sufficiently random (CSPRNG)', () => {
    const codes = new Set(Array.from({ length: 500 }, () => createRoomCode()));
    expect(codes.size).toBeGreaterThan(450);
  });
});
