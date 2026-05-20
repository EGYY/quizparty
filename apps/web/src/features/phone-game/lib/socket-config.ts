export const socketBaseUrl = import.meta.env.VITE_SOCKET_BASE_URL || window.location.origin;

export const socketOptions = {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 700,
  timeout: 8000,
};
