import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TvGameConnectionStatus } from '@entities/game';
import { colors, spacing } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import {
  connectionLabels,
  getConnectionStyle,
} from '@shared/lib/connection-status';

export const GameTopBar = memo(function GameTopBar({
  connectionStatus,
  playerCount,
  quizTitle,
  roomCode,
}: {
  connectionStatus: TvGameConnectionStatus;
  playerCount: number;
  quizTitle: string;
  roomCode: string;
}) {
  return (
    <View style={styles.topBar}>
      <View>
        <Text style={styles.roomCode}>Комната {roomCode}</Text>
        <Text numberOfLines={1} style={styles.quizTitle}>
          {quizTitle}
        </Text>
      </View>
      <View style={styles.topMeta}>
        <View style={styles.playerBadge}>
          <Text style={styles.playerBadgeLabel}>Игроки</Text>
          <Text style={styles.playerBadgeValue}>{playerCount}</Text>
        </View>
        <View
          style={[styles.connectionBadge, getConnectionStyle(connectionStatus)]}
        >
          <Text style={styles.connectionText}>
            {connectionLabels[connectionStatus]}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sv(20),
  },
  roomCode: {
    color: colors.gold,
    fontSize: sf(22),
    fontWeight: '900',
  },
  quizTitle: {
    color: colors.text,
    fontSize: sf(42),
    fontWeight: '900',
  },
  topMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  playerBadge: {
    minWidth: s(120),
    borderColor: colors.border,
    borderRadius: s(22),
    borderWidth: s(1),
    backgroundColor: 'rgba(24, 23, 35, 0.8)',
    paddingHorizontal: s(18),
    paddingVertical: sv(10),
  },
  playerBadgeLabel: {
    color: colors.textMuted,
    fontSize: sf(15),
    fontWeight: '800',
  },
  playerBadgeValue: {
    color: colors.text,
    fontSize: sf(28),
    fontWeight: '900',
  },
  connectionBadge: {
    minWidth: s(130),
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: s(16),
    paddingVertical: sv(12),
  },
  connectionText: {
    color: colors.text,
    fontSize: sf(16),
    fontWeight: '900',
  },
});
