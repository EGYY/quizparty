import type { TvRoute } from '@app/navigation';
import { s, sv } from '@shared/config/scale';
import { Screen } from '@shared/ui/screen';
import { HostCharacter } from '@widgets/host-character';
import { RemoteHints } from '@widgets/remote-hints';
import { StageBackground } from '@widgets/stage-background';
import { StyleSheet, View } from 'react-native';
import { useGamePage } from './model/use-game-page';
import { GameErrorBanner } from './ui/game-error-banner';
import { GameSurface } from './ui/game-surface';
import { GameTopBar } from './ui/game-top-bar';

export function GamePage({
  route,
}: {
  route: Extract<TvRoute, { name: 'game' }>;
}) {
  const { game, hasImmersiveChrome, navigation, playerCount } =
    useGamePage(route);

  return (
    <Screen>
      <StageBackground>
        <View style={styles.content}>
          {!hasImmersiveChrome ? (
            <GameTopBar
              connectionStatus={game.connectionStatus}
              playerCount={playerCount}
              quizTitle={route.quiz.title}
              roomCode={route.room.roomCode}
            />
          ) : null}

          {game.error ? (
            <GameErrorBanner
              error={game.error}
              onReconnect={game.reconnect}
            />
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
    paddingHorizontal: s(58),
    paddingTop: sv(44),
  },
});
