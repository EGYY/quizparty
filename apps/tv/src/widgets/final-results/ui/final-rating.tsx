import { StyleSheet, Text, View } from 'react-native';
import type { LeaderboardEntry } from '@quizparty/shared';
import { PlayerAvatar } from '@entities/player';
import { colors } from '@shared/config/theme';

export function FinalRating({
  compact,
  players,
}: {
  compact: boolean;
  players: LeaderboardEntry[];
}) {
  return (
    <View style={[styles.panel, compact && styles.panel_compact]}>
      <View style={styles.titlePill}>
        <Text style={[styles.title, compact && styles.title_compact]}>
          ★ Итоговый рейтинг ★
        </Text>
      </View>
      {players.length ? (
        players.map(player => (
          <FinalRatingRow
            compact={compact}
            key={player.playerId}
            player={player}
          />
        ))
      ) : (
        <Text style={styles.empty}>Все игроки уже на пьедестале</Text>
      )}
    </View>
  );
}

function FinalRatingRow({
  compact,
  player,
}: {
  compact: boolean;
  player: LeaderboardEntry;
}) {
  return (
    <View style={[styles.row, compact && styles.row_compact]}>
      <PlayerAvatar
        player={player}
        style={[styles.avatar, compact && styles.avatar_compact]}
        textStyle={[styles.initial, compact && styles.initial_compact]}
      />
      <Text style={[styles.rank, compact && styles.rank_compact]}>
        {player.rank}
      </Text>
      <View style={styles.info}>
        <Text
          numberOfLines={1}
          style={[styles.name, compact && styles.name_compact]}
        >
          {player.nickname}
        </Text>
        <Text style={[styles.score, compact && styles.score_compact]}>
          {player.score}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    maxWidth: 560,
    borderColor: 'rgba(255, 224, 168, 0.36)',
    borderRadius: 24,
    borderWidth: 3,
    backgroundColor: 'rgba(18, 21, 38, 0.92)',
    paddingHorizontal: 22,
    paddingTop: 44,
    paddingBottom: 16,
  },
  panel_compact: {
    maxWidth: 390,
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingTop: 32,
    paddingBottom: 10,
  },
  titlePill: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
    borderColor: 'rgba(255, 224, 168, 0.46)',
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: 'rgba(27, 29, 50, 0.98)',
    paddingHorizontal: 34,
    paddingVertical: 10,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  title_compact: {
    fontSize: 15,
  },
  row: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  row_compact: {
    minHeight: 58,
    gap: 10,
    borderRadius: 12,
    marginBottom: 7,
    paddingHorizontal: 10,
  },
  avatar: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderColor: colors.gold,
    borderRadius: 29,
    borderWidth: 3,
    backgroundColor: colors.gold,
  },
  avatar_compact: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
  },
  initial: {
    color: colors.textDark,
    fontSize: 26,
    fontWeight: '900',
  },
  initial_compact: {
    fontSize: 18,
  },
  rank: {
    width: 34,
    color: colors.text,
    fontSize: 27,
    fontWeight: '900',
    textAlign: 'center',
  },
  rank_compact: {
    width: 22,
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
  },
  name_compact: {
    fontSize: 16,
  },
  score: {
    color: colors.purple,
    fontSize: 28,
    fontWeight: '900',
  },
  score_compact: {
    fontSize: 19,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },
});
