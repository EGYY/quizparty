import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getPlayerTone, type PlayerSlot } from '../model/player-card';
import { EmptyPlayerSlot } from './empty-player-slot';
import { PlayerAvatarBlock } from './player-avatar-block';
import { PlayerStatusPill } from './player-status-pill';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

export const PlayerCard = memo(function PlayerCard({
  slot,
  index,
}: {
  slot: PlayerSlot;
  index: number;
}) {
  const isFirst = index === 0;

  if (slot.kind === 'empty') {
    return <EmptyPlayerSlot />;
  }

  const player = slot.player;
  const tone = getPlayerTone(player);
  const cardStyle =
    tone === 'ready'
      ? styles.card_ready
      : tone === 'offline'
        ? styles.card_offline
        : styles.card_waiting;

  return (
    <View style={[styles.card, cardStyle]}>
      {isFirst ? (
        <Text style={styles.crown}>👑</Text>
      ) : (
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
      )}

      <PlayerAvatarBlock player={player} tone={tone} />

      <Text numberOfLines={1} style={styles.name}>
        {player.nickname}
      </Text>

      <PlayerStatusPill player={player} tone={tone} />
    </View>
  );
});

const CARD_W = s(200);
const CARD_H = sv(200);

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    alignItems: 'center',
    borderRadius: s(22),
    borderWidth: s(3),
    backgroundColor: 'rgba(20, 22, 40, 0.94)',
    paddingTop: sv(8),
    paddingHorizontal: s(10),
    paddingBottom: sv(12),
  },
  card_ready: {
    borderColor: '#a7f47a',
    shadowColor: '#a7f47a',
    shadowOpacity: 0.6,
    shadowRadius: s(18),
    shadowOffset: { width: 0, height: 0 },
  },
  card_waiting: {
    borderColor: 'rgba(94, 215, 255, 0.55)',
    shadowColor: colors.blue,
    shadowOpacity: 0.15,
    shadowRadius: s(8),
    shadowOffset: { width: 0, height: 0 },
  },
  card_offline: {
    borderColor: 'rgba(255, 122, 144, 0.35)',
    opacity: 0.6,
  },
  crown: {
    position: 'absolute',
    top: sv(-18),
    left: s(10),
    fontSize: sf(26),
    lineHeight: sv(30),
  },
  numberBadge: {
    position: 'absolute',
    left: s(8),
    top: sv(8),
    width: s(22),
    height: s(22),
    borderRadius: s(11),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 209, 102, 0.18)',
  },
  numberText: {
    color: colors.gold,
    fontSize: sf(13),
    fontWeight: '900',
  },
  name: {
    color: colors.text,
    fontSize: sf(18),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: sv(8),
  },
});
