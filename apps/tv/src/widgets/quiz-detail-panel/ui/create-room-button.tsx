import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { Focusable } from '@shared/ui/focusable';
import { PartyPopperIcon } from '@shared/assets/icons';

export const CreateRoomButton = memo(function CreateRoomButton({
  isCreating,
  onPress,
}: {
  isCreating: boolean;
  onPress: () => void;
}) {
  return (
    <Focusable
      hasTVPreferredFocus
      disabled={isCreating}
      onPress={onPress}
      style={styles.primary}
    >
      <PartyPopperIcon accentColor={colors.purple} size={s(56)} />
      <Text style={styles.primaryText}>
        {isCreating ? 'Создаём комнату...' : 'Создать комнату'}
      </Text>
    </Focusable>
  );
});

const styles = StyleSheet.create({
  primary: {
    minHeight: sv(90),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(20),
    borderWidth: s(2),
    borderColor: 'rgba(255, 248, 238, 0.78)',
    backgroundColor: colors.purple,
    shadowColor: colors.purple,
    shadowOpacity: 0.76,
    shadowRadius: s(24),
    shadowOffset: { width: 0, height: 0 },
    marginTop: sv(4),
    flexDirection: 'row',
    gap: s(14),
  },
  primaryText: {
    color: colors.text,
    fontSize: sf(28),
    fontWeight: '900',
  },
});
