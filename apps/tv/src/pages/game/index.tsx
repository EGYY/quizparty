import type { TvRoute } from '@app/navigation';
import { usePreventRemove } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';
import { s, sv } from '@shared/config/scale';
import { Screen } from '@shared/ui/screen';
import { useMusicPaused } from '@shared/ui/music-provider';
import { useSoundEffectsMuted } from '@shared/ui/sound-effects-provider';
import { HostCharacter } from '@widgets/host-character';
import { RemoteHints } from '@widgets/remote-hints';
import { StageBackground } from '@widgets/stage-background';
import {
  BackHandler,
  Platform,
  StyleSheet,
  TVEventControl,
  View,
} from 'react-native';
import { MediaReadyContext } from '@shared/ui/media-ready-context';
import { useGamePage } from './model/use-game-page';
import { GameErrorBanner } from './ui/game-error-banner';
import { GamePauseOverlay } from './ui/game-pause-overlay';
import { GameSurface } from './ui/game-surface';
import { GameTopBar } from './ui/game-top-bar';

export function GamePage({
  route,
}: {
  route: Extract<TvRoute, { name: 'game' }>;
}) {
  const { game, hasImmersiveChrome, navigation, playerCount } =
    useGamePage(route);
  const isPausablePhase =
    game.gameState.phase === 'question' || game.gameState.phase === 'reveal';
  const isPaused =
    game.gameState.phase === 'question' || game.gameState.phase === 'reveal'
      ? Boolean(game.gameState.isPaused)
      : false;

  const resumeGame = game.resumeGame;
  const pauseGame = game.pauseGame;
  const endGame = game.endGame;
  const allowNavigationRef = useRef(false);
  const lastRemoteToggleAtRef = useRef(0);
  const pauseControlsRef = useRef({
    isPausablePhase,
    isPaused,
    pauseGame,
    resumeGame,
  });

  useEffect(() => {
    pauseControlsRef.current = {
      isPausablePhase,
      isPaused,
      pauseGame,
      resumeGame,
    };
  }, [isPausablePhase, isPaused, pauseGame, resumeGame]);
  useMusicPaused(isPaused);
  useSoundEffectsMuted(isPaused);

  const togglePauseFromRemote = useCallback(() => {
    const now = Date.now();
    if (now - lastRemoteToggleAtRef.current < 250) return true;
    lastRemoteToggleAtRef.current = now;

    const { isPausablePhase, isPaused, pauseGame, resumeGame } =
      pauseControlsRef.current;
    if (!isPausablePhase) return false;
    if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
    return true;
  }, []);

  const handleEndGame = useCallback(() => {
    allowNavigationRef.current = true;
    endGame();
    navigation.home();
  }, [endGame, navigation]);

  useEffect(() => {
    if (!game.roomClosed) return;
    allowNavigationRef.current = true;
    navigation.home();
  }, [game.roomClosed, navigation]);

  useEffect(() => {
    if (!Platform.isTVOS) return;

    TVEventControl.enableTVMenuKey();

    return () => {
      TVEventControl.disableTVMenuKey();
    };
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      return togglePauseFromRemote();
    });

    return () => sub.remove();
  }, [togglePauseFromRemote]);

  usePreventRemove(!allowNavigationRef.current && isPausablePhase, () => {
    togglePauseFromRemote();
  });

  return (
    <MediaReadyContext.Provider value={game.signalMediaReady}>
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
              onChooseQuiz={handleEndGame}
              onPlayAgain={game.playAgain}
              reactions={game.recentReactions}
            />

            {isPaused ? (
              <GamePauseOverlay
                onEndGame={handleEndGame}
                onResume={game.resumeGame}
              />
            ) : null}
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
    </MediaReadyContext.Provider>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: s(58),
    paddingTop: sv(44),
  },
});
