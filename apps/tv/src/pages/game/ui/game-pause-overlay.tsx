import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { Focusable } from '@shared/ui/focusable';

export const GamePauseOverlay = memo(function GamePauseOverlay({
  onEndGame,
  onResume,
}: {
  onEndGame: () => void;
  onResume: () => void;
}) {
  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <Text style={styles.kicker}>Ведущий остановил игру</Text>
        <Text style={styles.title}>Пауза</Text>
        <Text style={styles.subtitle}>
          Можно продолжить с этого же момента или закрыть комнату и выбрать
          новый квиз.
        </Text>

        <View style={styles.actions}>
          <Focusable
            hasTVPreferredFocus
            onPress={onResume}
            style={styles.primaryButton}
          >
            <Text numberOfLines={1} style={styles.primaryText}>
              Продолжить
            </Text>
          </Focusable>
          <Focusable onPress={onEndGame} style={styles.dangerButton}>
            <Text numberOfLines={1} style={styles.dangerText}>
              Закончить игру
            </Text>
          </Focusable>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3, 5, 14, 0.74)',
    paddingHorizontal: s(64),
  },
  panel: {
    width: s(820),
    alignItems: 'center',
    borderColor: 'rgba(255, 209, 102, 0.56)',
    borderRadius: s(30),
    borderWidth: s(3),
    backgroundColor: 'rgba(18, 22, 42, 0.96)',
    paddingHorizontal: s(54),
    paddingVertical: sv(38),
  },
  kicker: {
    color: colors.gold,
    fontSize: sf(20),
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: sf(78),
    lineHeight: sv(86),
    fontWeight: '900',
    marginTop: sv(8),
  },
  subtitle: {
    maxWidth: s(600),
    color: colors.textSecondary,
    fontSize: sf(24),
    lineHeight: sv(31),
    fontWeight: '800',
    textAlign: 'center',
    marginTop: sv(10),
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(18),
    marginTop: sv(32),
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.gold,
    borderRadius: 999,
    borderWidth: s(4),
    backgroundColor: colors.gold,
    minHeight: sv(72),
    minWidth: s(330),
    paddingHorizontal: s(32),
    paddingVertical: sv(16),
  },
  primaryText: {
    color: colors.textDark,
    fontSize: sf(26),
    fontWeight: '900',
    lineHeight: sv(32),
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.22)',
    textShadowOffset: { width: 0, height: sv(1) },
    textShadowRadius: s(2),
  },
  dangerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 122, 144, 0.84)',
    borderRadius: 999,
    borderWidth: s(4),
    backgroundColor: 'rgba(150, 42, 62, 0.92)',
    minHeight: sv(72),
    minWidth: s(330),
    paddingHorizontal: s(32),
    paddingVertical: sv(16),
  },
  dangerText: {
    color: colors.text,
    fontSize: sf(26),
    fontWeight: '900',
    lineHeight: sv(32),
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.34)',
    textShadowOffset: { width: 0, height: sv(2) },
    textShadowRadius: s(3),
  },
});
