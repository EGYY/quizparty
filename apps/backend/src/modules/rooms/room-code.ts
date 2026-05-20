import { randomInt } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
// 'QUIZ-' (5) + MAX_SIGNIFICANT (7) = 12 — верхняя граница roomCode по схеме.
const MAX_SIGNIFICANT = 7;

export function createRoomCode(length = 6): string {
  const count = Math.min(Math.max(1, length), MAX_SIGNIFICANT);
  let code = '';

  for (let index = 0; index < count; index += 1) {
    code += ALPHABET.charAt(randomInt(ALPHABET.length));
  }

  return `QUIZ-${code}`;
}
