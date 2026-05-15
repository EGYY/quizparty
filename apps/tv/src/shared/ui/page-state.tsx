import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { Focusable } from '@shared/ui/focusable';

export function PageState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Focusable onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Focusable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sv(420),
    gap: spacing.md,
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: sf(38),
    fontWeight: '900',
  },
  message: {
    maxWidth: s(720),
    color: colors.textSecondary,
    fontSize: sf(22),
    lineHeight: sv(32),
    textAlign: 'center',
  },
  action: {
    minWidth: s(220),
    alignItems: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actionText: {
    color: colors.textDark,
    fontSize: sf(20),
    fontWeight: '900',
  },
});
