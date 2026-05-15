import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@shared/config/theme';
import { Focusable } from '@shared/ui/focusable';
import { s, sf, sv } from '@shared/config/scale';

type Props = {
  startLabel: string;
  isStarting: boolean;
  onStart: () => void;
  onBack: () => void;
};

export const LobbyActions = memo(function LobbyActions({
  startLabel,
  isStarting,
  onStart,
  onBack,
}: Props) {
  return (
    <View style={styles.actions}>
      <View style={styles.startBtnWrap}>
        <Focusable
          hasTVPreferredFocus
          onPress={onStart}
          style={[styles.startBtn, isStarting && styles.startBtn_starting]}
        >
          <Text style={styles.startText}>{startLabel}</Text>
        </Focusable>
      </View>

      <Focusable onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>Назад</Text>
      </Focusable>
    </View>
  );
});

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(12),
    marginTop: sv(16),
  },
  startBtnWrap: { flex: 1, maxWidth: s(480) },
  startBtn: {
    alignItems: 'center',
    borderColor: colors.gold,
    borderRadius: 999,
    borderWidth: s(4),
    backgroundColor: '#f36f4d',
    paddingVertical: sv(18),
    paddingHorizontal: s(40),
    shadowColor: colors.gold,
    shadowOpacity: 0.88,
    shadowRadius: s(30),
    shadowOffset: { width: 0, height: 0 },
  },
  startBtn_starting: {
    backgroundColor: '#5a3fa0',
    borderColor: colors.purple,
    shadowColor: colors.purple,
  },
  startText: {
    color: colors.text,
    fontSize: sf(34),
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.32)',
    textShadowOffset: { width: 0, height: sv(2) },
    textShadowRadius: s(4),
  },
  backBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255,224,168,0.26)',
    borderRadius: 999,
    borderWidth: s(2),
    backgroundColor: 'rgba(30,27,44,0.92)',
    paddingHorizontal: s(20),
    paddingVertical: sv(18),
    minWidth: s(130),
    marginLeft: 8,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: sf(30),
    fontWeight: '900',
  },
});
