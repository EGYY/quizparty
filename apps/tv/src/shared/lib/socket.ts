import { io, type Socket } from 'socket.io-client';
import { SOCKET_BASE_URL } from '@shared/config/env';

export type TvSocketNamespace = 'game' | 'lobby';

const TV_SOCKET_OPTIONS = {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 700,
  timeout: 8000,
};

export function createTvSocket(namespace: TvSocketNamespace): Socket {
  return io(`${SOCKET_BASE_URL}/${namespace}`, TV_SOCKET_OPTIONS);
}
