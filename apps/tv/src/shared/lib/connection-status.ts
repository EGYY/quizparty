import { StyleSheet } from 'react-native';

export type TvConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'offline'
  | 'error';

export const connectionLabels: Record<TvConnectionStatus, string> = {
  connected: 'online',
  connecting: 'подключаемся',
  error: 'ошибка',
  offline: 'offline',
  reconnecting: 'переподключение',
};

export const connectionStyles = StyleSheet.create({
  connected: { backgroundColor: 'rgba(99, 230, 190, 0.2)' },
  connecting: { backgroundColor: 'rgba(255, 209, 102, 0.22)' },
  reconnecting: { backgroundColor: 'rgba(155, 124, 255, 0.22)' },
  offline: { backgroundColor: 'rgba(255, 122, 144, 0.2)' },
  error: { backgroundColor: 'rgba(255, 107, 107, 0.26)' },
});

export function getConnectionStyle(status: TvConnectionStatus) {
  return connectionStyles[status] ?? connectionStyles.error;
}
