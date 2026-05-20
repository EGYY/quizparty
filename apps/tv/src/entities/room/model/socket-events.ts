import type { Dispatch } from 'react';
import { ServerEvent } from '@quizparty/shared';
import type { LobbyState } from '@quizparty/shared';
import type { TvSocket } from '@shared/lib/socket';
import {
  buildQuestionLive,
  buildRevealLive,
  buildStartingLive,
} from './live-status';
import type { LobbyRealtimeAction } from './reducer';

type GameSocketAttachParams = {
  /** Вызывается при LOBBY_STATE от game-сокета (личный ответ с playerId/playerToken). */
  onLobbyState: (data: LobbyState) => void;
  dispatch: Dispatch<LobbyRealtimeAction>;
};

export function attachRoomGameEvents(
  socket: TvSocket,
  { onLobbyState, dispatch }: GameSocketAttachParams,
): void {
  socket.on(ServerEvent.LOBBY_STATE, onLobbyState);
  socket.on(ServerEvent.REACTION_RECEIVED, data => {
    dispatch({ type: 'reaction/received', reaction: data });
  });
  socket.on(ServerEvent.ERROR, data => {
    dispatch({ type: 'connection/error', message: data.message });
  });
  socket.on(ServerEvent.GAME_STARTING, data => {
    dispatch({
      type: 'live/statusChanged',
      liveStatus: buildStartingLive(data),
    });
  });
  socket.on(ServerEvent.ROUND_START, data => {
    dispatch({
      type: 'live/statusChanged',
      liveStatus: buildQuestionLive(data),
    });
  });
  socket.on(ServerEvent.TIMER_TICK, data => {
    dispatch({
      type: 'live/statusChanged',
      liveStatus: {
        kind: 'question',
        label: 'Текущий вопрос',
        remainingSeconds: data.remainingSeconds,
        totalSeconds: data.totalSeconds,
      },
    });
  });
  socket.on(ServerEvent.ROUND_END, data => {
    dispatch({ type: 'live/statusChanged', liveStatus: buildRevealLive(data) });
  });
  socket.on(ServerEvent.REACTION_WINDOW_OPEN, data => {
    dispatch({ type: 'live/statusChanged', liveStatus: buildRevealLive(data) });
  });
  socket.on(ServerEvent.NEXT_ROUND_COUNTDOWN, data => {
    dispatch({ type: 'live/statusChanged', liveStatus: buildRevealLive(data) });
  });
  socket.on(ServerEvent.GAME_END, data => {
    dispatch({
      type: 'live/statusChanged',
      liveStatus: {
        kind: 'finished',
        label: data.leaderboard.length ? 'Игра завершена' : 'Финал',
      },
    });
  });
}

export function attachRoomLobbyLiveEvents(
  socket: TvSocket,
  dispatch: Dispatch<LobbyRealtimeAction>,
): void {
  socket.on(ServerEvent.GAME_STARTING, data => {
    dispatch({
      type: 'live/statusChanged',
      liveStatus: buildStartingLive(data),
    });
  });
  socket.on(ServerEvent.REACTION_WINDOW_OPEN, data => {
    dispatch({ type: 'live/statusChanged', liveStatus: buildRevealLive(data) });
  });
  socket.on(ServerEvent.GAME_END, _data => {
    dispatch({
      type: 'live/statusChanged',
      liveStatus: { kind: 'finished', label: 'Игра завершена' },
    });
  });
}
