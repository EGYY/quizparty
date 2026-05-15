import { Image, StyleSheet, Text, View } from 'react-native';
import type { LeaderboardEntry } from '@quizparty/shared';
import { PlayerAvatar } from '@entities/player';
import { finalPodiums } from '@shared/assets/images';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

type PodiumSlot = 'first' | 'second' | 'third';

export function WinnersPodium({
  first,
  second,
  third,
}: {
  first?: LeaderboardEntry;
  second?: LeaderboardEntry;
  third?: LeaderboardEntry;
}) {
  return (
    <View style={[styles.scene]}>
      <Image
        resizeMode="contain"
        source={finalPodiums}
        style={[styles.podiumImage]}
      />
      {second ? <PodiumWinner player={second} slot="second" /> : null}
      {first ? <PodiumWinner player={first} slot="first" /> : null}
      {third ? <PodiumWinner player={third} slot="third" /> : null}
    </View>
  );
}

function PodiumWinner({
  player,
  slot,
}: {
  player: LeaderboardEntry;
  slot: PodiumSlot;
}) {
  const slotStyles = getPodiumSlotStyles(slot);

  return (
    <View style={[styles.winner, slotStyles.position]}>
      <PlayerAvatar
        player={player}
        style={[styles.winnerAvatar, slotStyles.avatar]}
        textStyle={[styles.winnerInitial]}
      />
      <View style={[styles.winnerPlate, slotStyles.plate]}>
        <Text numberOfLines={1} style={[styles.winnerName]}>
          {player.nickname}
        </Text>
        <Text style={[styles.winnerScore]}>{player.score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: s(1040),
    position: 'relative',
  },
  podiumImage: {
    position: 'absolute',
    left: s(40),
    bottom: sv(24),
    width: s(980),
    height: sv(298),
    zIndex: 2,
  },

  winner: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  winner_first: {
    left: s(426),
    bottom: sv(258),
  },
  winner_second: {
    left: s(106),
    bottom: sv(205),
  },
  winner_third: {
    left: s(742),
    bottom: sv(176),
  },
  winnerAvatar: {
    width: s(154),
    height: s(154),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderColor: 'rgba(255, 255, 255, 0.76)',
    borderRadius: s(77),
    borderWidth: s(5),
    backgroundColor: 'rgba(255, 209, 102, 0.88)',
  },
  winnerAvatar_first: {
    width: s(214),
    height: s(214),
    borderRadius: s(107),
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.78,
    shadowRadius: s(24),
    shadowOffset: { width: 0, height: 0 },
  },
  winnerAvatar_second: {
    borderColor: '#cfe7ff',
  },
  winnerAvatar_third: {
    borderColor: '#ffb36b',
  },
  winnerInitial: {
    color: colors.textDark,
    fontSize: sf(68),
    fontWeight: '900',
  },
  winnerPlate: {
    minWidth: s(220),
    alignItems: 'center',
    borderColor: 'rgba(255, 224, 168, 0.5)',
    borderRadius: s(16),
    borderWidth: s(3),
    marginTop: sv(-16),
    paddingHorizontal: s(22),
    paddingVertical: sv(12),
  },
  winnerPlate_first: {
    backgroundColor: 'rgba(90, 56, 17, 0.96)',
  },
  winnerPlate_second: {
    backgroundColor: 'rgba(15, 46, 83, 0.96)',
  },
  winnerPlate_third: {
    backgroundColor: 'rgba(84, 38, 20, 0.96)',
  },
  winnerName: {
    color: colors.text,
    fontSize: sf(31),
    fontWeight: '900',
  },
  winnerScore: {
    color: colors.gold,
    fontSize: sf(44),
    lineHeight: sv(52),
    fontWeight: '900',
  },
});

function getPodiumSlotStyles(slot: PodiumSlot) {
  if (slot === 'first') {
    return {
      avatar: styles.winnerAvatar_first,
      plate: styles.winnerPlate_first,
      position: styles.winner_first,
    };
  }

  if (slot === 'second') {
    return {
      avatar: styles.winnerAvatar_second,
      plate: styles.winnerPlate_second,
      position: styles.winner_second,
    };
  }

  return {
    avatar: styles.winnerAvatar_third,
    plate: styles.winnerPlate_third,
    position: styles.winner_third,
  };
}
