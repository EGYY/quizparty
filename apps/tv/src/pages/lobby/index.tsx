import type { TvRoute } from '@app/navigation';
import { useTvNavigation } from '@app/navigation';
import { useToast } from '@app/toast-provider';
import { useLobbyRealtime } from '@entities/room';
import { GamePhase, PlayerConnectionStatus } from '@quizparty/shared';
import { quizPartyLogo } from '@shared/assets/images';
import { soundMainTheme } from '@shared/assets/sounds';
import { colors } from '@shared/config/theme';
import {
  connectionLabels,
  getConnectionStyle,
} from '@shared/lib/connection-status';
import { AnimatedReactionBubble } from '@shared/ui/animated-reaction-bubble';
import { Focusable } from '@shared/ui/focusable';
import { useMusicTrack } from '@shared/ui/music-provider';
import { Screen } from '@shared/ui/screen';
import { HostCharacter } from '@widgets/host-character';
import { PlayerRoster } from '@widgets/player-roster';
import { QrPanel } from '@widgets/qr-panel';
import { RemoteHints } from '@widgets/remote-hints';
import { StageBackground } from '@widgets/stage-background';
import { useEffect, useMemo, useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

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

  const startLabel =
    lobby.liveStatus.kind === 'starting'
      ? `Старт через ${lobby.liveStatus.remainingSeconds}с`
      : lobby.liveStatus.kind === 'question'
        ? `Раунд: ${lobby.liveStatus.remainingSeconds}с`
        : isStarting
          ? 'Игра стартует...'
          : '▶  Начать игру';

  const mascotSpeech = getMascotSpeech(
    connectedPlayers.length,
    lobby.state.maxPlayers,
  );

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
          {/* Левая колонка QR-панель*/}
          <QrPanel
            joinUrl={lobby.state.joinUrl}
            qrVisible={lobby.state.qrVisible}
            roomCode={lobby.state.roomCode}
          />

          {/* Центр - лого -> статус -> сетка -> кнопки */}
          <View style={styles.center}>
            {/* Лого */}
            <View style={styles.logoRow}>
              <Image
                resizeMode="contain"
                source={quizPartyLogo}
                style={styles.logo}
              />
              <View
                style={[
                  styles.connectionBadge,
                  getConnectionStyle(lobby.connectionStatus),
                ]}
              >
                <Text style={styles.connectionDot}>●</Text>
                <Text style={styles.connectionText}>
                  {connectionLabels[lobby.connectionStatus]}
                </Text>
              </View>
            </View>

            {/* Статусная строка */}
            <View style={styles.statusRow}>
              {/* Счётчик игроков */}
              <View style={styles.playerPill}>
                <Text style={styles.playerPillIcon}>👥</Text>
                <Text style={styles.playerPillLabel}>Игроки</Text>
                <Text style={styles.playerPillCount}>
                  {connectedPlayers.length}
                </Text>
                <Text style={styles.playerPillSep}>/</Text>
                <Text style={styles.playerPillMax}>
                  {lobby.state.maxPlayers}
                </Text>
              </View>

              {/* Live-статус */}
              {lobby.error ? (
                <View style={styles.errorPill}>
                  <Text numberOfLines={1} style={styles.errorText}>
                    ⚠ {lobby.error}
                  </Text>
                  <Focusable onPress={lobby.reconnect} style={styles.retryBtn}>
                    <Text style={styles.retryText}>Повторить</Text>
                  </Focusable>
                </View>
              ) : (
                <View style={styles.livePill}>
                  <Text style={styles.livePillIcon}>🕐</Text>
                  <Text style={styles.livePillLabel}>
                    {lobby.liveStatus.label}
                  </Text>
                  {lobby.liveStatus.kind === 'question' ||
                  lobby.liveStatus.kind === 'starting' ||
                  lobby.liveStatus.kind === 'reveal' ? (
                    <Text style={styles.liveCountdown}>
                      {lobby.liveStatus.remainingSeconds}с
                    </Text>
                  ) : null}
                </View>
              )}
            </View>

            {/* Сетка игроков */}
            <View style={styles.rosterArea}>
              <PlayerRoster
                maxPlayers={lobby.state.maxPlayers}
                players={lobby.state.players}
              />
            </View>

            {/* Распорка */}
            <View style={styles.spacer} />

            {/* Кнопки: Начать / Назад */}
            <View style={styles.actions}>
              <View style={[styles.startBtnWrap]}>
                <Focusable
                  hasTVPreferredFocus
                  onPress={lobby.startGame}
                  style={[
                    styles.startBtn,
                    isStarting && styles.startBtn_starting,
                  ]}
                >
                  <Text style={styles.startText}>{startLabel}</Text>
                </Focusable>
              </View>

              <Focusable onPress={navigation.back} style={styles.backBtn}>
                <Text style={styles.backText}>← Назад</Text>
              </Focusable>
            </View>
          </View>
        </View>

        {/* Персонаж с репликой */}
        <HostCharacter mood="party" speech={mascotSpeech} />

        {/* Реакции */}
        <View pointerEvents="none" style={styles.reactionsLayer}>
          {lobby.recentReactions.slice(0, 5).map(reaction => (
            <AnimatedReactionBubble key={reaction.id} reaction={reaction} />
          ))}
        </View>

        <RemoteHints
        // hints={['OK старт', 'Back к квизу', 'QR для телефона']}
        />
      </StageBackground>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    gap: 26,
    paddingLeft: 44,
    paddingRight: 44,
    paddingTop: 28,
    paddingBottom: 22,
  },

  // ══ Center ══
  center: {
    flex: 1,
    flexDirection: 'column',
  },

  // ── Logo row ──
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logo: {
    width: 300,
    height: 108,
    marginTop: -4,
    marginLeft: -8,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderColor: 'rgba(255, 224, 168, 0.16)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  connectionDot: { color: colors.mint, fontSize: 10 },
  connectionText: { color: colors.text, fontSize: 15, fontWeight: '900' },

  // ── Status row: два пилюля ──
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  playerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderColor: 'rgba(255, 209, 102, 0.35)',
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: 'rgba(22, 20, 36, 0.92)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: colors.gold,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  playerPillIcon: { fontSize: 18 },
  playerPillLabel: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: '900',
  },
  playerPillCount: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: 'rgba(255,209,102,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  playerPillSep: { color: colors.textMuted, fontSize: 17, fontWeight: '900' },
  playerPillMax: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: '900',
  },

  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderColor: 'rgba(255, 224, 168, 0.22)',
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: 'rgba(22, 20, 36, 0.88)',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  livePillIcon: { fontSize: 17 },
  livePillLabel: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: '900',
  },
  liveCountdown: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(255,209,102,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },

  errorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderColor: colors.red,
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: 'rgba(59, 24, 36, 0.88)',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  errorText: {
    color: colors.coral,
    fontSize: 15,
    fontWeight: '800',
    flexShrink: 1,
  },
  retryBtn: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryText: { color: colors.text, fontSize: 13, fontWeight: '900' },

  // ── Roster area ──
  rosterArea: {
    marginTop: 120,
    flexShrink: 0,
  },

  // ── Spacer ──
  spacer: { flex: 1 },

  // ── Actions ──
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  startBtnWrap: { flex: 1, maxWidth: 480 },
  startBtn: {
    alignItems: 'center',
    borderColor: colors.gold,
    borderRadius: 999,
    borderWidth: 4,
    backgroundColor: '#f36f4d',
    paddingVertical: 18,
    paddingHorizontal: 40,
    shadowColor: colors.gold,
    shadowOpacity: 0.88,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  startBtn_starting: {
    backgroundColor: '#5a3fa0',
    borderColor: colors.purple,
    shadowColor: colors.purple,
  },
  startText: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.32)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  backBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255,224,168,0.26)',
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: 'rgba(30,27,44,0.92)',
    paddingHorizontal: 20,
    paddingVertical: 18,
    minWidth: 130,
  },
  backText: { color: colors.textSecondary, fontSize: 21, fontWeight: '900' },

  // ── Reactions overlay ──
  reactionsLayer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 2,
    width: 200,
    height: 400,
  },
});
