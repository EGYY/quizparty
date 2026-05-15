import { forwardRef, useCallback, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, shadows } from '@shared/config/theme';
import { useSoundEffects } from '@shared/ui/sound-effects-provider';

const SPRING_CONFIG = {
  damping: 18,
  mass: 0.6,
  stiffness: 200,
  useNativeDriver: true,
  // Prevents this animation from blocking React's interaction tracking,
  // which would delay processing of the next D-pad event.
  isInteraction: false,
} as const;

type Props = {
  children: ReactNode;
  hasTVPreferredFocus?: boolean;
  onFocus?: () => void;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export const Focusable = forwardRef<View, Props>(function Focusable(
  { children, hasTVPreferredFocus, onFocus, onPress, style, disabled },
  ref,
) {
  const { playFocus, playSubmit } = useSoundEffects();
  const scale = useRef(new Animated.Value(1)).current;
  const [focused, setFocused] = useState(false);

  const animate = useCallback(
    (toValue: number) => {
      Animated.spring(scale, { toValue, ...SPRING_CONFIG }).start();
    },
    [scale],
  );

  const handleFocus = useCallback(() => {
    setFocused(true);
    playFocus();
    onFocus?.();
    animate(1.045);
  }, [animate, onFocus, playFocus]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    animate(1);
  }, [animate]);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      playSubmit();
      onPress?.(event);
    },
    [onPress, playSubmit],
  );

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onPress={handlePress}
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
});

const styles = StyleSheet.create({
  base: {
    borderColor: 'transparent',
    borderWidth: 3,
  },
  focused: {
    borderColor: colors.gold,
  },
});
