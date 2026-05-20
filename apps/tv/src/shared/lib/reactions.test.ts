import type { ReactionEvent } from '@quizparty/shared';
import { prependRecentReaction } from './reactions';

const reaction = (id: string, emoji = '🔥'): ReactionEvent =>
  ({
    id,
    emoji,
    playerId: `00000000-0000-4000-8000-0000000000${id}`,
    createdAt: '2026-05-20T00:00:00.000Z',
  });

describe('prependRecentReaction', () => {
  it('prepends a new reaction and keeps existing order', () => {
    const result = prependRecentReaction(
      [reaction('01'), reaction('02')],
      reaction('03'),
    );

    expect(result.map(item => item.id)).toEqual(['03', '01', '02']);
  });

  it('dedupes by reaction id and moves the newest payload to the front', () => {
    const result = prependRecentReaction(
      [reaction('01', '👍'), reaction('02')],
      reaction('01', '🎉'),
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: '01', emoji: '🎉' });
    expect(result.map(item => item.id)).toEqual(['01', '02']);
  });

  it('keeps only the requested number of recent reactions', () => {
    const result = prependRecentReaction(
      [reaction('01'), reaction('02'), reaction('03')],
      reaction('04'),
      3,
    );

    expect(result.map(item => item.id)).toEqual(['04', '01', '02']);
  });
});
