import { Image, StyleSheet, Text, View } from 'react-native';
import type { LeaderboardEntry } from '@quizparty/shared';
import { PlayerAvatar } from '@entities/player';
import { finalPodiums } from '@shared/assets/images';
import { colors } from '@shared/config/theme';

type PodiumSlot = 'first' | 'second' | 'third';

export function WinnersPodium({
  compact,
  first,
  second,
  third,
}: {
  compact: boolean;
  first?: LeaderboardEntry;
  second?: LeaderboardEntry;
  third?: LeaderboardEntry;
}) {
  return (
    <View style={[styles.scene, compact && styles.scene_compact]}>
      <Image
        resizeMode="contain"
        source={finalPodiums}
        style={[styles.podiumImage, compact && styles.podiumImage_compact]}
      />
      {second ? (
        <PodiumWinner compact={compact} player={second} slot="second" />
      ) : null}
      {first ? (
        <PodiumWinner compact={compact} player={first} slot="first" />
      ) : null}
      {third ? (
        <PodiumWinner compact={compact} player={third} slot="third" />
      ) : null}
    </View>
  );
}

function PodiumWinner({
  compact,
  player,
  slot,
}: {
  compact: boolean;
  player: LeaderboardEntry;
  slot: PodiumSlot;
}) {
  const slotStyles = getPodiumSlotStyles(slot);

  return (
    <View
      style={[
        styles.winner,
        slotStyles.position,
        compact && slotStyles.positionCompact,
      ]}
    >
      <PlayerAvatar
        player={player}
        style={[
          styles.winnerAvatar,
          slotStyles.avatar,
          compact && styles.winnerAvatar_compact,
          compact && slot === 'first' && styles.winnerAvatar_first_compact,
        ]}
        textStyle={[
          styles.winnerInitial,
          compact && styles.winnerInitial_compact,
        ]}
      />
      <View
        style={[
          styles.winnerPlate,
          slotStyles.plate,
          compact && styles.winnerPlate_compact,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[styles.winnerName, compact && styles.winnerName_compact]}
        >
          {player.nickname}
        </Text>
        <Text
          style={[styles.winnerScore, compact && styles.winnerScore_compact]}
        >
          {player.score}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: 1040,
    position: 'relative',
  },
  scene_compact: {
    width: 742,
  },
  podiumImage: {
    position: 'absolute',
    left: 40,
    bottom: 24,
    width: 980,
    height: 298,
    zIndex: 2,
  },
  podiumImage_compact: {
    left: 20,
    bottom: 16,
    width: 702,
    height: 213,
  },
  winner: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  winner_first: {
    left: 426,
    bottom: 258,
  },
  winner_second: {
    left: 106,
    bottom: 205,
  },
  winner_third: {
    left: 742,
    bottom: 176,
  },
  winner_first_compact: {
    left: 304,
    bottom: 169,
  },
  winner_second_compact: {
    left: 82,
    bottom: 113,
  },
  winner_third_compact: {
    left: 524,
    bottom: 88,
  },
  winnerAvatar: {
    width: 154,
    height: 154,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderColor: 'rgba(255, 255, 255, 0.76)',
    borderRadius: 77,
    borderWidth: 5,
    backgroundColor: 'rgba(255, 209, 102, 0.88)',
  },
  winnerAvatar_first: {
    width: 214,
    height: 214,
    borderRadius: 107,
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.78,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  winnerAvatar_second: {
    borderColor: '#cfe7ff',
  },
  winnerAvatar_third: {
    borderColor: '#ffb36b',
  },
  winnerAvatar_compact: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 4,
  },
  winnerAvatar_first_compact: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  winnerInitial: {
    color: colors.textDark,
    fontSize: 68,
    fontWeight: '900',
  },
  winnerInitial_compact: {
    fontSize: 46,
  },
  winnerPlate: {
    minWidth: 220,
    alignItems: 'center',
    borderColor: 'rgba(255, 224, 168, 0.5)',
    borderRadius: 16,
    borderWidth: 3,
    marginTop: -16,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  winnerPlate_compact: {
    minWidth: 152,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: -11,
    paddingHorizontal: 13,
    paddingVertical: 7,
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
    fontSize: 31,
    fontWeight: '900',
  },
  winnerName_compact: {
    fontSize: 21,
  },
  winnerScore: {
    color: colors.gold,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '900',
  },
  winnerScore_compact: {
    fontSize: 29,
    lineHeight: 34,
  },
});

function getPodiumSlotStyles(slot: PodiumSlot) {
  if (slot === 'first') {
    return {
      avatar: styles.winnerAvatar_first,
      plate: styles.winnerPlate_first,
      position: styles.winner_first,
      positionCompact: styles.winner_first_compact,
    };
  }

  if (slot === 'second') {
    return {
      avatar: styles.winnerAvatar_second,
      plate: styles.winnerPlate_second,
      position: styles.winner_second,
      positionCompact: styles.winner_second_compact,
    };
  }

  return {
    avatar: styles.winnerAvatar_third,
    plate: styles.winnerPlate_third,
    position: styles.winner_third,
    positionCompact: styles.winner_third_compact,
  };
}
