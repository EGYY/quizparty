import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { Focusable } from '@shared/ui/focusable';

export const QuizDetailCloseButton = memo(function QuizDetailCloseButton({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <View style={styles.closeWrap}>
      <Focusable onPress={onPress} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </Focusable>
    </View>
  );
});

const styles = StyleSheet.create({
  closeWrap: {
    position: 'absolute',
    top: sv(18),
    right: s(18),
    zIndex: 10,
    width: s(56),
    height: s(56),
  },
  closeButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(28),
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: s(1),
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: sf(20),
    fontWeight: '700',
  },
});
