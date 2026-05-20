import type { TvRoute } from '@app/navigation';
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
import { StyleSheet, View } from 'react-native';
import { useLobbyPage } from './model/use-lobby-page';
import { LobbyActions } from './ui/lobby-actions';
import { LobbyHeader } from './ui/lobby-header';
import { LobbyStatusRow } from './ui/lobby-status-row';

export function LobbyPage({
  route,
}: {
  route: Extract<TvRoute, { name: 'lobby' }>;
}) {
  useMusicTrack(soundMainTheme);
  const {
    connectedCount,
    handleBack,
    isStarting,
    lobby,
    mascotSpeech,
    startLabel,
  } = useLobbyPage(route);

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
              connectedCount={connectedCount}
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
