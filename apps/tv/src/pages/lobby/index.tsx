import type { TvRoute } from '@app/navigation';
import { useTvNavigation } from '@app/navigation';
import { useToast } from '@app/toast-provider';
import { useLobbyRealtime } from '@entities/room';
import { GamePhase, PlayerConnectionStatus } from '@quizparty/shared';
import { soundMainTheme } from '@shared/assets/sounds';
import { s, sv } from '@shared/config/scale';
import { AnimatedReactionBubble } from '@shared/ui/animated-reaction-bubble';
import { useMusicTrack } from '@shared/ui/music-provider';
import { Screen } from '@shared/ui/screen';
import { HostCharacter } from '@widgets/host-character';
import { PlayerRoster } from '@widgets/player-roster';
import { QrPanel } from '@widgets/qr-panel';
import { RemoteHints } from '@widgets/remote-hints';
import { StageBackground } from '@widgets/stage-background';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { LobbyActions } from './ui/lobby-actions';
import { LobbyHeader } from './ui/lobby-header';
import { LobbyStatusRow } from './ui/lobby-status-row';

function getMascotSpeech(count: number, max: number): string {
  if (count === 0) return 'Ждём первых\nигроков!\nЗови друзей 🎉';
  if (count < Math.min(max, 3)) return `Уже ${count}!\nЗовём ещё\nребят 🚀`;
  if (count < max) return 'Отличная\nкомпания!\nМожно начинать ▶';
  return 'Все на месте!\nЗапускаем\nигру! 🎮';
}

export function LobbyPage({
  route,
}: {
  route: Extract<TvRoute, { name: 'lobby' }>;
}) {
  useMusicTrack(soundMainTheme);
  const navigation = useTvNavigation();
  const toast = useToast();
  const lobby = useLobbyRealtime({ quiz: route.quiz, room: route.room });
  const didNavigate = useRef(false);

  const connectedPlayers = useMemo(
    () =>
      lobby.state.players.filter(
        p => p.connectionStatus === PlayerConnectionStatus.CONNECTED,
      ),
    [lobby.state.players],
  );

  const isStarting =
    lobby.state.phase === GamePhase.STARTING ||
    lobby.liveStatus.kind === 'starting';

  const startLabel = useMemo(() => {
    if (lobby.liveStatus.kind === 'starting')
      return `Старт через ${lobby.liveStatus.remainingSeconds}с`;
    if (lobby.liveStatus.kind === 'question')
      return `Раунд: ${lobby.liveStatus.remainingSeconds}с`;
    if (isStarting) return 'Игра стартует...';
    return '▶  Начать игру';
  }, [lobby.liveStatus, isStarting]);

  const mascotSpeech = useMemo(
    () => getMascotSpeech(connectedPlayers.length, lobby.state.maxPlayers),
    [connectedPlayers.length, lobby.state.maxPlayers],
  );

  const handleBack = useCallback(() => navigation.back(), [navigation]);

  useEffect(() => {
    if (lobby.error) toast.notify(lobby.error, 'error');
  }, [lobby.error, toast]);

  useEffect(() => {
    if (
      lobby.liveStatus.kind !== 'starting' ||
      !lobby.playerId ||
      didNavigate.current
    )
      return;
    didNavigate.current = true;
    navigation.navigate({
      name: 'game',
      playerId: lobby.playerId,
      quiz: route.quiz,
      room: route.room,
    });
  }, [
    lobby.liveStatus.kind,
    lobby.playerId,
    navigation,
    route.quiz,
    route.room,
  ]);

  return (
    <Screen>
      <StageBackground>
        <View style={styles.root}>
          {/* Левая колонка — QR-панель */}
          <QrPanel
            joinUrl={lobby.state.joinUrl}
            qrVisible={lobby.state.qrVisible}
            roomCode={lobby.state.roomCode}
          />

          {/* Центр — лого → статус → сетка → кнопки */}
          <View style={styles.center}>
            <LobbyHeader connectionStatus={lobby.connectionStatus} />

            <LobbyStatusRow
              connectedCount={connectedPlayers.length}
              error={lobby.error}
              liveStatus={lobby.liveStatus}
              maxPlayers={lobby.state.maxPlayers}
              onReconnect={lobby.reconnect}
            />

            <View style={styles.rosterArea}>
              <PlayerRoster
                maxPlayers={lobby.state.maxPlayers}
                players={lobby.state.players}
              />
            </View>

            <View style={styles.spacer} />

            <LobbyActions
              isStarting={isStarting}
              startLabel={startLabel}
              onBack={handleBack}
              onStart={lobby.startGame}
            />
          </View>
        </View>

        <HostCharacter mood="party" speech={mascotSpeech} />

        <View pointerEvents="none" style={styles.reactionsLayer}>
          {lobby.recentReactions.slice(0, 5).map(reaction => (
            <AnimatedReactionBubble key={reaction.id} reaction={reaction} />
          ))}
        </View>

        <RemoteHints />
      </StageBackground>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    gap: s(26),
    paddingLeft: s(44),
    paddingRight: s(44),
    paddingTop: sv(28),
    paddingBottom: sv(22),
  },
  center: {
    flex: 1,
    flexDirection: 'column',
  },
  rosterArea: {
    marginTop: sv(30),
    flexShrink: 0,
  },
  spacer: { flex: 1 },
  reactionsLayer: {
    position: 'absolute',
    right: s(20),
    bottom: sv(20),
    zIndex: 2,
    width: s(200),
    height: sv(400),
  },
});
