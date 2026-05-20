import type { Dispatch, MutableRefObject } from 'react';
import {
  ServerEvent,
  answerProgressEventSchema,
  gameEndEventSchema,
  gameStartingEventSchema,
  nextRoundCountdownEventSchema,
  reactionWindowEventSchema,
  roundEndEventSchema,
  roundStartEventSchema,
  timerTickEventSchema,
} from '@quizparty/shared';
import type { RoundStartEvent } from '@quizparty/shared';
import type { Socket } from 'socket.io-client';
import { readGameSocketError } from './event-mappers';
import type { TvGameRealtimeAction } from './reducer';

type AttachTvGameEventsParams = {
  applyLobbyState: (payload: unknown) => void;
  applyReaction: (payload: unknown) => void;
  currentRoundRef: MutableRefObject<RoundStartEvent | undefined>;
  dispatch: Dispatch<TvGameRealtimeAction>;
};

export function attachTvGameEvents(
  socket: Socket,
  {
    applyLobbyState,
    applyReaction,
    currentRoundRef,
    dispatch,
  }: AttachTvGameEventsParams,
): void {
  socket.on(ServerEvent.LOBBY_STATE, applyLobbyState);
  socket.on(ServerEvent.REACTION_RECEIVED, applyReaction);
  socket.on(ServerEvent.ERROR, (payload: unknown) => {
    dispatch({
      type: 'connection/error',
      message: readGameSocketError(payload),
    });
  });
  socket.on(ServerEvent.GAME_STARTING, (payload: unknown) => {
    const parsed = gameStartingEventSchema.safeParse(payload);
    if (parsed.success) {
      dispatch({ type: 'game/starting', event: parsed.data });
    }
  });
  socket.on(ServerEvent.ROUND_START, (payload: unknown) => {
    const parsed = roundStartEventSchema.safeParse(payload);
    if (parsed.success) {
      currentRoundRef.current = parsed.data;
      dispatch({ type: 'game/roundStarted', round: parsed.data });
    }
  });
  socket.on(ServerEvent.TIMER_TICK, (payload: unknown) => {
    const parsed = timerTickEventSchema.safeParse(payload);
    if (!parsed.success || !currentRoundRef.current) return;

    dispatch({ type: 'game/timerTicked', timer: parsed.data });
  });
  socket.on(ServerEvent.ANSWER_PROGRESS, (payload: unknown) => {
    const parsed = answerProgressEventSchema.safeParse(payload);
    if (!parsed.success) return;

    dispatch({ type: 'game/answerProgressed', progress: parsed.data });
  });
  socket.on(ServerEvent.ROUND_END, (payload: unknown) => {
    const parsed = roundEndEventSchema.safeParse(payload);
    if (parsed.success) {
      dispatch({
        type: 'game/roundEnded',
        round: currentRoundRef.current,
        roundEnd: parsed.data,
      });
    }
  });
  socket.on(ServerEvent.REACTION_WINDOW_OPEN, (payload: unknown) => {
    const parsed = reactionWindowEventSchema.safeParse(payload);
    if (!parsed.success) return;

    dispatch({
      type: 'game/reactionWindowOpened',
      reactionWindow: parsed.data,
    });
  });
  socket.on(ServerEvent.NEXT_ROUND_COUNTDOWN, (payload: unknown) => {
    const parsed = nextRoundCountdownEventSchema.safeParse(payload);
    if (!parsed.success) return;

    dispatch({ type: 'game/nextRoundCountdown', nextRound: parsed.data });
  });
  socket.on(ServerEvent.GAME_END, (payload: unknown) => {
    const parsed = gameEndEventSchema.safeParse(payload);
    if (parsed.success) {
      dispatch({ type: 'game/ended', event: parsed.data });
    }
  });
}
