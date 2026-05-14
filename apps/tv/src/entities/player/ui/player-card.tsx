/**
 * PlayerCard — карточка игрока в лобби (4-колоночная сетка).
 *
 * index === 0 → «золотая корона» в верхнем углу (лидер/первый).
 * Тона: ready | waiting | offline | empty.
 */
import { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  LobbyPlayerStatus,
  PlayerConnectionStatus,
  type Player,
} from '@quizparty/shared';
import { getPhoneAvatarSource } from '@shared/config/phone-avatars';
import { colors } from '@shared/config/theme';

type PlayerTone = 'ready' | 'waiting' | 'offline' | 'empty';

export type PlayerSlot =
  | { kind: 'player'; player: Player }
  | { kind: 'empty'; index: number };

export function getPlayerTone(player: Player): PlayerTone {
  if (player.connectionStatus === PlayerConnectionStatus.DISCONNECTED)
    return 'offline';
  if (player.lobbyStatus === LobbyPlayerStatus.READY) return 'ready';
  return 'waiting';
}

function getStatusLabel(player: Player): string {
  if (player.connectionStatus === PlayerConnectionStatus.DISCONNECTED)
    return 'Отключён';
  if (player.lobbyStatus === LobbyPlayerStatus.READY) return '✓ Готов';
  return '⏳ Ждёт';
}

function getInitials(nickname: string): string {
  return nickname.trim().slice(0, 1).toUpperCase() || '?';
}

export const PlayerCard = memo(function PlayerCard({
  slot,
  index,
}: {
  slot: PlayerSlot;
  index: number;
}) {
  const isFirst = index === 0;

  // ── Пустой слот ──────────────────────────────────────────────
  if (slot.kind === 'empty') {
    return (
      <View style={[styles.card, styles.card_empty]}>
        <View style={styles.emptyCircle}>
          <Text style={styles.emptyPlus}>+</Text>
        </View>
        <Text style={styles.emptyLabel}>Ждём{'\n'}игрока</Text>
      </View>
    );
  }

  // ── Игрок ────────────────────────────────────────────────────
  const player = slot.player;
  const tone = getPlayerTone(player);
  const avatarSource = getPhoneAvatarSource(player.avatarId);
  const status = getStatusLabel(player);

  const cardStyle =
    tone === 'ready'
      ? styles.card_ready
      : tone === 'offline'
        ? styles.card_offline
        : styles.card_waiting;

  const avatarBg =
    tone === 'ready'
      ? styles.avatarBg_ready
      : tone === 'offline'
        ? styles.avatarBg_offline
        : styles.avatarBg_waiting;

  const statusStyle =
    tone === 'ready'
      ? styles.status_ready
      : tone === 'offline'
        ? styles.status_offline
        : styles.status_waiting;

  return (
    <View style={[styles.card, cardStyle]}>
      {/* Корона первого игрока */}
      {isFirst ? (
        <Text style={styles.crown}>👑</Text>
      ) : (
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
      )}

      {/* Аватар */}
      <View style={[styles.avatar, avatarBg]}>
        {avatarSource ? (
          <Image source={avatarSource} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarInitial}>
            {getInitials(player.nickname)}
          </Text>
        )}
      </View>

      {/* Ник */}
      <Text numberOfLines={1} style={styles.name}>
        {player.nickname}
      </Text>

      {/* Статус */}
      <View style={[styles.statusPill, statusStyle]}>
        <Text
          style={[
            styles.statusText,
            tone === 'offline' && styles.statusText_offline,
          ]}
        >
          {status}
        </Text>
      </View>
    </View>
  );
});

const CARD_W = 170;
const CARD_H = 218;
const AVATAR = 90;

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 3,
    backgroundColor: 'rgba(20, 22, 40, 0.94)',
    paddingTop: 8,
    paddingHorizontal: 10,
    paddingBottom: 12,
  },

  // ── Тона ──
  card_ready: {
    borderColor: '#a7f47a',
    shadowColor: '#a7f47a',
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  card_waiting: {
    borderColor: 'rgba(94, 215, 255, 0.55)',
    shadowColor: colors.blue,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  card_offline: {
    borderColor: 'rgba(255, 122, 144, 0.35)',
    opacity: 0.6,
  },
  card_empty: {
    borderColor: 'rgba(255, 209, 102, 0.28)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(20, 22, 40, 0.6)',
  },

  // ── Корона / номер ──
  crown: {
    position: 'absolute',
    top: -18,
    left: 10,
    fontSize: 26,
    lineHeight: 30,
  },
  numberBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 209, 102, 0.18)',
  },
  numberText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },

  // ── Аватар ──
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  avatarBg_ready: { backgroundColor: '#dce9aa' },
  avatarBg_waiting: { backgroundColor: '#9bd8f4' },
  avatarBg_offline: { backgroundColor: '#5f5963' },
  avatarImage: { width: AVATAR, height: AVATAR },
  avatarInitial: {
    color: colors.textDark,
    fontSize: 40,
    fontWeight: '900',
  },

  // ── Пустой слот ──
  emptyCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 2,
    borderColor: 'rgba(255, 209, 102, 0.25)',
    borderStyle: 'dashed',
  },
  emptyPlus: {
    color: colors.gold,
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 38,
  },
  emptyLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 19,
  },

  // ── Ник + статус ──
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusPill: {
    minWidth: 96,
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  status_ready: { backgroundColor: 'rgba(92, 196, 86, 0.52)' },
  status_waiting: { backgroundColor: 'rgba(94, 215, 255, 0.2)' },
  status_offline: { backgroundColor: 'rgba(244, 162, 97, 0.18)' },
  statusText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  statusText_offline: { color: colors.coral },
});
