import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { s, sf, sv } from '@shared/config/scale';
import { qrPanelPalette as palette } from '../config';

export const RoomCodeCard = memo(function RoomCodeCard({
  roomCode,
}: {
  roomCode: string;
}) {
  return (
    <View style={styles.codeCard}>
      <View style={styles.decorLineLeft}>
        <View style={styles.decorLine} />
        <View style={[styles.decorLine, styles.decorLineSmall]} />
      </View>

      <Text style={styles.codeLabel}>Код комнаты:</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.codeValue}>
        {roomCode}
      </Text>

      <View style={styles.decorLineRight}>
        <View style={styles.decorLine} />
        <View style={[styles.decorLine, styles.decorLineSmall]} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  codeCard: {
    width: s(380),
    minHeight: sv(122),
    marginTop: sv(18),
    paddingVertical: sv(18),
    paddingHorizontal: s(26),
    borderRadius: s(24),
    backgroundColor: 'rgba(24, 22, 28, 0.96)',
    borderWidth: s(2),
    borderColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.goldGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: s(18),
    elevation: s(14),
  },
  codeLabel: {
    color: palette.textMuted,
    fontSize: sf(23),
    lineHeight: sv(28),
    fontWeight: '900',
    letterSpacing: s(0.4),
    marginBottom: sv(2),
  },
  codeValue: {
    color: palette.gold,
    fontSize: sf(54),
    lineHeight: sv(64),
    fontWeight: '900',
    letterSpacing: s(2.5),
    textShadowColor: 'rgba(255, 200, 80, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(18),
  },
  decorLineLeft: {
    position: 'absolute',
    left: s(18),
    top: sv(28),
    gap: s(8),
    transform: [{ rotate: '18deg' }],
  },
  decorLineRight: {
    position: 'absolute',
    right: s(18),
    top: sv(28),
    gap: s(8),
    transform: [{ rotate: '-18deg' }],
  },
  decorLine: {
    width: s(28),
    height: sv(3),
    borderRadius: 999,
    backgroundColor: palette.orange,
  },
  decorLineSmall: {
    width: s(16),
    opacity: 0.8,
  },
});

