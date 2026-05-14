import { useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, shadows } from '@shared/config/theme';
import { useSoundEffects } from '@shared/ui/sound-effects-provider';

export function Focusable({
  children,
  hasTVPreferredFocus,
  onFocus,
  onPress,
  style,
  disabled,
}: {
  children: ReactNode;
  hasTVPreferredFocus?: boolean;
  onFocus?: () => void;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const { playFocus, playSubmit } = useSoundEffects();
  const scale = useRef(new Animated.Value(1)).current;
  const [focused, setFocused] = useState(false);

  const animate = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      friction: 7,
      tension: 130,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      disabled={disabled}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onBlur={() => {
        setFocused(false);
        animate(1);
      }}
      onFocus={() => {
        setFocused(true);
        playFocus();
        onFocus?.();
        animate(1.045);
      }}
      onPress={event => {
        playSubmit();
        onPress?.(event);
      }}
    >
      <Animated.View
        style={[
          styles.base,
          focused && styles.focused,
          focused && shadows.focus,
          style,
          { transform: [{ scale }] },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderColor: 'transparent',
    borderWidth: 3,
  },
  focused: {
    borderColor: colors.gold,
  },
});
