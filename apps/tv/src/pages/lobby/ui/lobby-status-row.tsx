import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LobbyLiveStatus } from '@entities/room';
import { colors } from '@shared/config/theme';
import { Focusable } from '@shared/ui/focusable';
import { s, sf, sv } from '@shared/config/scale';

type Props = {
  connectedCount: number;
  maxPlayers: number;
  liveStatus: LobbyLiveStatus;
  error: string | null;
  onReconnect: () => void;
};

export const LobbyStatusRow = memo(function LobbyStatusRow({
  connectedCount,
  maxPlayers,
  liveStatus,
  error,
  onReconnect,
}: Props) {
  return (
    <View style={styles.statusRow}>
      <View style={styles.playerPill}>
        <Text style={styles.playerPillIcon}>👥</Text>
        <Text style={styles.playerPillLabel}>Игроки</Text>
        <Text style={styles.playerPillCount}>{connectedCount}</Text>
        <Text style={styles.playerPillSep}>/</Text>
        <Text style={styles.playerPillMax}>{maxPlayers}</Text>
      </View>

      {error ? (
        <View style={styles.errorPill}>
          <Text numberOfLines={1} style={styles.errorText}>
            ⚠ {error}
          </Text>
          <Focusable onPress={onReconnect} style={styles.retryBtn}>
            <Text style={styles.retryText}>Повторить</Text>
          </Focusable>
        </View>
      ) : (
        <View style={styles.livePill}>
          <Text style={styles.livePillIcon}>🕐</Text>
          <Text style={styles.livePillLabel}>{liveStatus.label}</Text>
          {liveStatus.kind === 'question' ||
          liveStatus.kind === 'starting' ||
          liveStatus.kind === 'reveal' ? (
            <Text style={styles.liveCountdown}>
              {liveStatus.remainingSeconds}с
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
  },
  playerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(7),
    borderColor: 'rgba(255, 209, 102, 0.35)',
    borderRadius: 999,
    borderWidth: s(2),
    backgroundColor: 'rgba(22, 20, 36, 0.92)',
    paddingHorizontal: s(18),
    paddingVertical: sv(10),
    shadowColor: colors.gold,
    shadowOpacity: 0.18,
    shadowRadius: s(10),
    shadowOffset: { width: 0, height: 0 },
  },
  playerPillIcon: { fontSize: sf(20) },
  playerPillLabel: {
    color: colors.textSecondary,
    fontSize: sf(20),
    fontWeight: '900',
  },
  playerPillCount: {
    color: colors.gold,
    fontSize: sf(20),
    fontWeight: '900',
    textShadowColor: 'rgba(255,209,102,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(7),
  },
  playerPillSep: {
    color: colors.textMuted,
    fontSize: sf(20),
    fontWeight: '900',
  },
  playerPillMax: {
    color: colors.textSecondary,
    fontSize: sf(20),
    fontWeight: '900',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    borderColor: 'rgba(255, 224, 168, 0.22)',
    borderRadius: 999,
    borderWidth: s(2),
    backgroundColor: 'rgba(22, 20, 36, 0.88)',
    paddingHorizontal: s(18),
    paddingVertical: sv(10),
  },
  livePillIcon: { fontSize: sf(20) },
  livePillLabel: {
    color: colors.textSecondary,
    fontSize: sf(20),
    fontWeight: '900',
  },
  liveCountdown: {
    color: colors.gold,
    fontSize: sf(20),
    fontWeight: '900',
    textShadowColor: 'rgba(255,209,102,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(7),
  },
  errorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    borderColor: colors.red,
    borderRadius: 999,
    borderWidth: s(2),
    backgroundColor: 'rgba(59, 24, 36, 0.88)',
    paddingHorizontal: s(18),
    paddingVertical: sv(10),
  },
  errorText: {
    color: colors.coral,
    fontSize: sf(15),
    fontWeight: '800',
    flexShrink: 1,
  },
  retryBtn: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: s(12),
    paddingVertical: sv(6),
  },
  retryText: { color: colors.text, fontSize: sf(13), fontWeight: '900' },
});
