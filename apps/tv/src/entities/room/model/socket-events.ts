import type { Dispatch } from 'react';
import {
  ServerEvent,
  gameEndEventSchema,
  gameStartingEventSchema,
  nextRoundCountdownEventSchema,
  reactionWindowEventSchema,
  roundEndEventSchema,
  roundStartEventSchema,
  timerTickEventSchema,
} from '@quizparty/shared';
import type { GameEndEvent, TimerTickEvent } from '@quizparty/shared';
import type { Socket } from 'socket.io-client';
import {
  buildQuestionLive,
  buildRevealLive,
  buildStartingLive,
} from './live-status';
import type { LobbyRealtimeAction } from './reducer';

type RoomSocketEventHandlers = {
  applyError: (payload: unknown) => void;
  applyLobbyState: (payload: unknown) => void;
  applyReaction: (payload: unknown) => void;
  dispatch: Dispatch<LobbyRealtimeAction>;
};

export function attachRoomGameEvents(
  socket: Socket,
  {
    applyError,
    applyLobbyState,
    applyReaction,
    dispatch,
  }: RoomSocketEventHandlers,
): void {
  socket.on(ServerEvent.LOBBY_STATE, applyLobbyState);
  socket.on(ServerEvent.REACTION_RECEIVED, applyReaction);
  socket.on(ServerEvent.ERROR, applyError);
  socket.on(ServerEvent.GAME_STARTING, (payload: unknown) => {
    const parsed = gameStartingEventSchema.safeParse(payload);
    if (parsed.success)
      dispatch({
        type: 'live/statusChanged',
        liveStatus: buildStartingLive(parsed.data),
      });
  });
  socket.on(ServerEvent.ROUND_START, (payload: unknown) => {
    const parsed = roundStartEventSchema.safeParse(payload);
    if (parsed.success)
      dispatch({
        type: 'live/statusChanged',
        liveStatus: buildQuestionLive(parsed.data),
      });
  });
  socket.on(ServerEvent.TIMER_TICK, (payload: unknown) => {
    const parsed = timerTickEventSchema.safeParse(payload);
    if (parsed.success) {
      const event: TimerTickEvent = parsed.data;
      dispatch({
        type: 'live/statusChanged',
        liveStatus: {
          kind: 'question',
          label: 'Текущий вопрос',
          remainingSeconds: event.remainingSeconds,
          totalSeconds: event.totalSeconds,
        },
      });
    }
  });
  socket.on(ServerEvent.ROUND_END, (payload: unknown) => {
    const parsed = roundEndEventSchema.safeParse(payload);
    if (parsed.success)
      dispatch({
        type: 'live/statusChanged',
        liveStatus: buildRevealLive(parsed.data),
      });
  });
  socket.on(ServerEvent.REACTION_WINDOW_OPEN, (payload: unknown) => {
    const parsed = reactionWindowEventSchema.safeParse(payload);
    if (parsed.success)
      dispatch({
        type: 'live/statusChanged',
        liveStatus: buildRevealLive(parsed.data),
      });
  });
  socket.on(ServerEvent.NEXT_ROUND_COUNTDOWN, (payload: unknown) => {
    const parsed = nextRoundCountdownEventSchema.safeParse(payload);
    if (parsed.success)
      dispatch({
        type: 'live/statusChanged',
        liveStatus: buildRevealLive(parsed.data),
      });
  });
  socket.on(ServerEvent.GAME_END, (payload: unknown) => {
    const parsed = gameEndEventSchema.safeParse(payload);
    const event: GameEndEvent | undefined = parsed.success
      ? parsed.data
      : undefined;
    dispatch({
      type: 'live/statusChanged',
      liveStatus: {
        kind: 'finished',
        label: event?.leaderboard.length ? 'Игра завершена' : 'Финал',
      },
    });
  });
}

export function attachRoomLobbyLiveEvents(
  socket: Socket,
  dispatch: Dispatch<LobbyRealtimeAction>,
): void {
  socket.on(ServerEvent.GAME_STARTING, (payload: unknown) => {
    const parsed = gameStartingEventSchema.safeParse(payload);
    if (parsed.success)
      dispatch({
        type: 'live/statusChanged',
        liveStatus: buildStartingLive(parsed.data),
      });
  });
  socket.on(ServerEvent.REACTION_WINDOW_OPEN, (payload: unknown) => {
    const parsed = reactionWindowEventSchema.safeParse(payload);
    if (parsed.success)
      dispatch({
        type: 'live/statusChanged',
        liveStatus: buildRevealLive(parsed.data),
      });
  });
  socket.on(ServerEvent.GAME_END, () =>
    dispatch({
      type: 'live/statusChanged',
      liveStatus: { kind: 'finished', label: 'Игра завершена' },
    }),
  );
}
