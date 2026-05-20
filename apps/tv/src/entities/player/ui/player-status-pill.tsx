import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  LobbyPlayerStatus,
  PlayerConnectionStatus,
  type Player,
} from '@quizparty/shared';
import type { PlayerTone } from '../model/player-card';
import { s, sf, sv } from '@shared/config/scale';
import { colors } from '@shared/config/theme';

type Props = {
  player: Player;
  tone: PlayerTone;
};

function getStatusLabel(player: Player): string {
  if (player.connectionStatus === PlayerConnectionStatus.DISCONNECTED)
    return 'Отключён';
  if (player.lobbyStatus === LobbyPlayerStatus.READY) return '✓ Готов';
  return '⏳ Ждёт';
}

export const PlayerStatusPill = memo(function PlayerStatusPill({
  player,
  tone,
}: Props) {
  const statusStyle =
    tone === 'ready'
      ? styles.status_ready
      : tone === 'offline'
        ? styles.status_offline
        : styles.status_waiting;

  return (
    <View style={[styles.statusPill, statusStyle]}>
      <Text
        style={[
          styles.statusText,
          tone === 'offline' && styles.statusText_offline,
        ]}
      >
        {getStatusLabel(player)}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  statusPill: {
    minWidth: s(96),
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: sv(5),
    paddingHorizontal: s(12),
  },
  status_ready: { backgroundColor: 'rgba(92, 196, 86, 0.52)' },
  status_waiting: { backgroundColor: 'rgba(94, 215, 255, 0.2)' },
  status_offline: { backgroundColor: 'rgba(244, 162, 97, 0.18)' },
  statusText: {
    color: colors.text,
    fontSize: sf(13),
    fontWeight: '900',
  },
  statusText_offline: { color: colors.coral },
});
