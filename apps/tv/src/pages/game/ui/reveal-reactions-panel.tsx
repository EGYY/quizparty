import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { REACTION_EMOJIS } from '../model/reveal';

export const RevealReactionsPanel = memo(function RevealReactionsPanel() {
  return (
    <View style={styles.reactionsPanel}>
      <Text style={styles.reactionsPanelTitle}>Реакции открыты!</Text>
      <Text style={styles.reactionsPanelText}>
        Покажи, что ты думаешь об этом вопросе!
      </Text>
      <View style={styles.reactionPalette}>
        {REACTION_EMOJIS.map(emoji => (
          <View key={emoji} style={styles.reactionPaletteItem}>
            <Text style={styles.reactionPaletteText}>{emoji}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  reactionsPanel: {
    flex: 1.08,
    minHeight: sv(170),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 224, 168, 0.3)',
    borderRadius: s(24),
    borderWidth: s(2),
    backgroundColor: 'rgba(23, 23, 44, 0.92)',
    paddingHorizontal: s(20),
    paddingVertical: sv(14),
    gap: s(8),
  },
  reactionsPanelTitle: {
    color: colors.gold,
    fontSize: sf(32),
    fontWeight: '900',
  },
  reactionsPanelText: {
    color: colors.text,
    fontSize: sf(16),
    fontWeight: '800',
    textAlign: 'center',
  },
  reactionPalette: { flexDirection: 'row', gap: s(10), marginTop: sv(8) },
  reactionPaletteItem: {
    width: s(50),
    height: s(50),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(25),
    backgroundColor: 'rgba(155, 124, 255, 0.26)',
  },
  reactionPaletteText: { fontSize: sf(28) },
});
