import { forwardRef, useCallback, useRef, type ReactNode } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, shadows } from '@shared/config/theme';

const SPRING_CONFIG = {
  damping: 18,
  mass: 0.6,
  stiffness: 200,
  useNativeDriver: true,
  // Prevents this animation from blocking React's interaction tracking,
  // which would delay processing of the next D-pad event.
  isInteraction: false,
} as const;

// Pre-computed native style objects — created once at module load, shared across
// every Focusable instance. Passed to setNativeProps which bypasses the React
// reconciler entirely: no setState → no re-render → children stay untouched.
//
// shadows.focus already uses Platform.select (elevation on Android, shadow* on iOS).
// On blur we reset only what we set: borderColor + elevation/shadowOpacity.
const FOCUSED_NATIVE_STYLE = {
  borderColor: colors.gold,
  ...shadows.focus,
};

const BLURRED_NATIVE_STYLE = Platform.select({
  android: { borderColor: 'transparent', elevation: 0 },
  // shadowOpacity: 0 is the cheapest way to hide iOS shadow without removing
  // the other shadow props (avoids a second setNativeProps on re-focus).
  default: { borderColor: 'transparent', shadowOpacity: 0 },
});

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
  const scale = useRef(new Animated.Value(1)).current;
  // Separate ref for the Animated.View so we can call setNativeProps on it
  // without going through React state or the Animated value system.
  const animatedViewRef = useRef<View>(null);

  const animate = useCallback(
    (toValue: number) => {
      Animated.spring(scale, { toValue, ...SPRING_CONFIG }).start();
    },
    [scale],
  );

  const handleFocus = useCallback(() => {
    animatedViewRef.current?.setNativeProps({ style: FOCUSED_NATIVE_STYLE });
    onFocus?.();
    animate(1.045);
  }, [animate, onFocus]);

  const handleBlur = useCallback(() => {
    animatedViewRef.current?.setNativeProps({ style: BLURRED_NATIVE_STYLE });
    animate(1);
  }, [animate]);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      onPress?.(event);
    },
    [onPress],
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
        ref={animatedViewRef}
        style={[styles.base, style, { transform: [{ scale }] }]}
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
});
