import type { Dispatch, MutableRefObject } from 'react';
import { ServerEvent } from '@quizparty/shared';
import type { RoundStartEvent } from '@quizparty/shared';
import type { TvSocket } from '@shared/lib/socket';
import type { TvGameRealtimeAction } from './reducer';

type AttachTvGameEventsParams = {
  currentRoundRef: MutableRefObject<RoundStartEvent | undefined>;
  dispatch: Dispatch<TvGameRealtimeAction>;
};

export function attachTvGameEvents(
  socket: TvSocket,
  { currentRoundRef, dispatch }: AttachTvGameEventsParams,
): void {
  socket.on(ServerEvent.LOBBY_STATE, data => {
    dispatch({ type: 'lobby/stateReceived', state: data });
  });
  socket.on(ServerEvent.REACTION_RECEIVED, data => {
    dispatch({ type: 'reaction/received', reaction: data });
  });
  socket.on(ServerEvent.ERROR, data => {
    dispatch({ type: 'connection/error', message: data.message });
  });
  socket.on(ServerEvent.GAME_STARTING, data => {
    dispatch({ type: 'game/starting', event: data });
  });
  socket.on(ServerEvent.ROUND_START, data => {
    currentRoundRef.current = data;
    dispatch({ type: 'game/roundStarted', round: data });
  });
  socket.on(ServerEvent.TIMER_TICK, data => {
    if (!currentRoundRef.current) return;
    dispatch({ type: 'game/timerTicked', timer: data });
  });
  socket.on(ServerEvent.ANSWER_PROGRESS, data => {
    dispatch({ type: 'game/answerProgressed', progress: data });
  });
  socket.on(ServerEvent.ROUND_END, data => {
    dispatch({
      type: 'game/roundEnded',
      round: currentRoundRef.current,
      roundEnd: data,
    });
  });
  socket.on(ServerEvent.REACTION_WINDOW_OPEN, data => {
    dispatch({ type: 'game/reactionWindowOpened', reactionWindow: data });
  });
  socket.on(ServerEvent.NEXT_ROUND_COUNTDOWN, data => {
    dispatch({ type: 'game/nextRoundCountdown', nextRound: data });
  });
  socket.on(ServerEvent.GAME_END, data => {
    dispatch({ type: 'game/ended', event: data });
  });
}
