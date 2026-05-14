import type { TvRoute } from '@app/navigation';
import { useTvNavigation } from '@app/navigation';
import { useTvGameRealtime } from '@entities/game';
import { colors, radii, spacing } from '@shared/config/theme';
import {
  connectionLabels,
  getConnectionStyle,
} from '@shared/lib/connection-status';
import { Focusable } from '@shared/ui/focusable';
import { Screen } from '@shared/ui/screen';
import { HostCharacter } from '@widgets/host-character';
import { RemoteHints } from '@widgets/remote-hints';
import { StageBackground } from '@widgets/stage-background';
import { StyleSheet, Text, View } from 'react-native';
import { GameSurface } from './ui/game-surface';

export function GamePage({
  route,
}: {
  route: Extract<TvRoute, { name: 'game' }>;
}) {
  const navigation = useTvNavigation();
  const game = useTvGameRealtime({
    playerId: route.playerId,
    room: route.room,
  });
  const playerCount = game.lobbyState?.players.length ?? 0;
  const isQuestionPhase = game.gameState.phase === 'question';
  const isRevealPhase = game.gameState.phase === 'reveal';
  const isFinalPhase = game.gameState.phase === 'final';
  const hasImmersiveChrome = isQuestionPhase || isRevealPhase || isFinalPhase;

  return (
    <Screen>
      <StageBackground>
        <View style={styles.content}>
          {!hasImmersiveChrome ? (
            <View style={styles.topBar}>
              <View>
                <Text style={styles.roomCode}>
                  Комната {route.room.roomCode}
                </Text>
                <Text numberOfLines={1} style={styles.quizTitle}>
                  {route.quiz.title}
                </Text>
              </View>
              <View style={styles.topMeta}>
                <View style={styles.playerBadge}>
                  <Text style={styles.playerBadgeLabel}>Игроки</Text>
                  <Text style={styles.playerBadgeValue}>{playerCount}</Text>
                </View>
                <View
                  style={[
                    styles.connectionBadge,
                    getConnectionStyle(game.connectionStatus),
                  ]}
                >
                  <Text style={styles.connectionText}>
                    {connectionLabels[game.connectionStatus]}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {game.error ? (
            <View style={styles.errorBanner}>
              <Text numberOfLines={2} style={styles.errorText}>
                {game.error}
              </Text>
              <Focusable onPress={game.reconnect} style={styles.retryButton}>
                <Text style={styles.retryText}>Повторить</Text>
              </Focusable>
            </View>
          ) : null}

          <GameSurface
            gameState={game.gameState}
            onChooseQuiz={navigation.home}
            onPlayAgain={game.playAgain}
            reactions={game.recentReactions}
          />
        </View>

        {!hasImmersiveChrome ? (
          <HostCharacter
            mood={game.gameState.phase === 'final' ? 'party' : 'thinking'}
          />
        ) : null}

        {!hasImmersiveChrome ? (
          <RemoteHints
          // hints={['OK действие', 'Back назад', 'Реакции с телефона']}
          />
        ) : null}
      </StageBackground>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 58,
    paddingTop: 44,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roomCode: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '900',
  },
  quizTitle: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '900',
  },
  topMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  playerBadge: {
    minWidth: 120,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: 'rgba(24, 23, 35, 0.8)',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  playerBadgeLabel: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '800',
  },
  playerBadgeValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  connectionBadge: {
    minWidth: 130,
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  connectionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  errorBanner: {
    position: 'absolute',
    left: 58,
    right: 58,
    top: 142,
    zIndex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderColor: colors.red,
    borderRadius: radii.md,
    borderWidth: 2,
    backgroundColor: 'rgba(59, 24, 36, 0.88)',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  errorText: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  retryButton: {
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
});
