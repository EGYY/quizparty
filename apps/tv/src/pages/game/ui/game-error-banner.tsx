import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { Focusable } from '@shared/ui/focusable';

export const GameErrorBanner = memo(function GameErrorBanner({
  error,
  onReconnect,
}: {
  error: string;
  onReconnect: () => void;
}) {
  return (
    <View style={styles.errorBanner}>
      <Text numberOfLines={2} style={styles.errorText}>
        {error}
      </Text>
      <Focusable onPress={onReconnect} style={styles.retryButton}>
        <Text style={styles.retryText}>Повторить</Text>
      </Focusable>
    </View>
  );
});

const styles = StyleSheet.create({
  errorBanner: {
    position: 'absolute',
    left: s(58),
    right: s(58),
    top: sv(142),
    zIndex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderColor: colors.red,
    borderRadius: radii.md,
    borderWidth: s(2),
    backgroundColor: 'rgba(59, 24, 36, 0.88)',
    paddingHorizontal: s(20),
    paddingVertical: sv(12),
  },
  errorText: {
    flex: 1,
    color: colors.text,
    fontSize: sf(18),
    fontWeight: '800',
  },
  retryButton: {
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: s(18),
    paddingVertical: sv(10),
  },
  retryText: {
    color: colors.text,
    fontSize: sf(16),
    fontWeight: '900',
  },
});
