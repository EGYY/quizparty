import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { s, sf, sv } from '@shared/config/scale';
import { colors } from '@shared/config/theme';

export const EmptyPlayerSlot = memo(function EmptyPlayerSlot() {
  return (
    <View style={[styles.card, styles.card_empty]}>
      <View style={styles.emptyCircle}>
        <Text style={styles.emptyPlus}>+</Text>
      </View>
      <Text style={styles.emptyLabel}>Ждём{'\n'}игрока</Text>
    </View>
  );
});

const CARD_W = s(200);
const CARD_H = sv(200);

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    alignItems: 'center',
    borderRadius: s(22),
    borderWidth: s(3),
    backgroundColor: 'rgba(20, 22, 40, 0.94)',
    paddingTop: sv(8),
    paddingHorizontal: s(10),
    paddingBottom: sv(12),
  },
  card_empty: {
    borderColor: 'rgba(255, 209, 102, 0.28)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    gap: s(10),
    backgroundColor: 'rgba(20, 22, 40, 0.6)',
  },
  emptyCircle: {
    width: s(62),
    height: s(62),
    borderRadius: s(31),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: s(2),
    borderColor: 'rgba(255, 209, 102, 0.25)',
    borderStyle: 'dashed',
  },
  emptyPlus: {
    color: colors.gold,
    fontSize: sf(30),
    fontWeight: '300',
    lineHeight: sv(38),
  },
  emptyLabel: {
    color: colors.textMuted,
    fontSize: sf(14),
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: sv(19),
  },
});
