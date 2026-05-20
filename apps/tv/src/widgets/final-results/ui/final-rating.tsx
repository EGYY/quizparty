import { StyleSheet, Text, View } from 'react-native';
import type { LeaderboardEntry } from '@quizparty/shared';
import { PlayerAvatar } from '@entities/player';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

export function FinalRating({ players }: { players: LeaderboardEntry[] }) {
  const density =
    players.length >= 7 ? 'ultra' : players.length >= 5 ? 'dense' : 'regular';

  return (
    <View style={[styles.panel, density === 'ultra' && styles.panel_ultra]}>
      <View style={styles.titlePill}>
        <Text style={[styles.title]}>★ Итоговый рейтинг ★</Text>
      </View>
      {players.length ? (
        players.map(player => (
          <FinalRatingRow
            density={density}
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
  density,
  player,
}: {
  density: 'regular' | 'dense' | 'ultra';
  player: LeaderboardEntry;
}) {
  const isDense = density !== 'regular';
  const isUltra = density === 'ultra';

  return (
    <View
      style={[
        styles.row,
        isDense && styles.row_dense,
        isUltra && styles.row_ultra,
      ]}
    >
      <PlayerAvatar
        player={player}
        style={[
          styles.avatar,
          isDense && styles.avatar_dense,
          isUltra && styles.avatar_ultra,
        ]}
        textStyle={[styles.initial, isDense && styles.initial_dense]}
      />
      <Text style={[styles.rank, isDense && styles.rank_dense]}>
        {player.rank}
      </Text>
      <View style={styles.info}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          numberOfLines={1}
          style={[styles.name, isDense && styles.name_dense]}
        >
          {player.nickname}
        </Text>
        <Text style={[styles.score, isDense && styles.score_dense]}>
          {player.score}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    maxWidth: s(560),
    borderColor: 'rgba(255, 224, 168, 0.36)',
    borderRadius: s(24),
    borderWidth: s(3),
    backgroundColor: 'rgba(18, 21, 38, 0.92)',
    paddingHorizontal: s(22),
    paddingTop: sv(44),
    paddingBottom: sv(16),
  },
  panel_ultra: {
    paddingTop: sv(36),
    paddingBottom: sv(12),
  },
  titlePill: {
    position: 'absolute',
    top: sv(-28),
    alignSelf: 'center',
    borderColor: 'rgba(255, 224, 168, 0.46)',
    borderRadius: 999,
    borderWidth: s(2),
    backgroundColor: 'rgba(27, 29, 50, 0.98)',
    paddingHorizontal: s(34),
    paddingVertical: sv(10),
  },
  title: {
    color: colors.text,
    fontSize: sf(22),
    fontWeight: '900',
  },
  row: {
    minHeight: sv(82),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(14),
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: s(16),
    borderWidth: s(2),
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: sv(10),
    paddingHorizontal: s(16),
  },
  row_dense: {
    minHeight: sv(62),
    gap: s(10),
    borderRadius: s(14),
    marginBottom: sv(7),
    paddingHorizontal: s(12),
  },
  row_ultra: {
    minHeight: sv(52),
    marginBottom: sv(5),
  },
  avatar: {
    width: s(58),
    height: s(58),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderColor: colors.gold,
    borderRadius: s(29),
    borderWidth: s(3),
    backgroundColor: colors.gold,
  },
  avatar_dense: {
    width: s(48),
    height: s(48),
    borderRadius: s(24),
  },
  avatar_ultra: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    borderWidth: s(2),
  },
  initial: {
    color: colors.textDark,
    fontSize: sf(26),
    fontWeight: '900',
  },
  initial_dense: {
    fontSize: sf(22),
  },

  rank: {
    width: s(34),
    color: colors.text,
    fontSize: sf(27),
    fontWeight: '900',
    textAlign: 'center',
  },
  rank_dense: {
    width: s(28),
    fontSize: sf(22),
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: sf(23),
    fontWeight: '900',
  },
  name_dense: {
    fontSize: sf(19),
  },
  score: {
    color: colors.purple,
    fontSize: sf(28),
    fontWeight: '900',
  },
  score_dense: {
    fontSize: sf(22),
  },
  empty: {
    color: colors.textSecondary,
    fontSize: sf(19),
    fontWeight: '800',
    marginBottom: sv(8),
  },
});
