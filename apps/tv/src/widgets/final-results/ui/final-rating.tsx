import { StyleSheet, Text, View } from 'react-native';
import type { LeaderboardEntry } from '@quizparty/shared';
import { PlayerAvatar } from '@entities/player';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

export function FinalRating({ players }: { players: LeaderboardEntry[] }) {
  return (
    <View style={[styles.panel]}>
      <View style={styles.titlePill}>
        <Text style={[styles.title]}>★ Итоговый рейтинг ★</Text>
      </View>
      {players.length ? (
        players.map(player => (
          <FinalRatingRow key={player.playerId} player={player} />
        ))
      ) : (
        <Text style={styles.empty}>Все игроки уже на пьедестале</Text>
      )}
    </View>
  );
}

function FinalRatingRow({ player }: { player: LeaderboardEntry }) {
  return (
    <View style={[styles.row]}>
      <PlayerAvatar
        player={player}
        style={[styles.avatar]}
        textStyle={[styles.initial]}
      />
      <Text style={[styles.rank]}>{player.rank}</Text>
      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.name]}>
          {player.nickname}
        </Text>
        <Text style={[styles.score]}>{player.score}</Text>
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
  initial: {
    color: colors.textDark,
    fontSize: sf(26),
    fontWeight: '900',
  },

  rank: {
    width: s(34),
    color: colors.text,
    fontSize: sf(27),
    fontWeight: '900',
    textAlign: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: sf(23),
    fontWeight: '900',
  },
  score: {
    color: colors.purple,
    fontSize: sf(28),
    fontWeight: '900',
  },
  empty: {
    color: colors.textSecondary,
    fontSize: sf(19),
    fontWeight: '800',
    marginBottom: sv(8),
  },
});
