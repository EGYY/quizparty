import type { ReactionEvent } from '@quizparty/shared';

export function prependRecentReaction(
  current: ReactionEvent[],
  reaction: ReactionEvent,
  limit = 8,
): ReactionEvent[] {
  return [reaction, ...current.filter(item => item.id !== reaction.id)].slice(
    0,
    limit,
  );
}

