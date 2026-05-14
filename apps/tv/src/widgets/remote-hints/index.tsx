import { memo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Text as SvgText,
  Stop,
} from 'react-native-svg';
import { colors, spacing } from '@shared/config/theme';

type RemoteHintsProps = {
  style?: ViewStyle;
};

export const RemoteHints = memo(function RemoteHints({
  style,
}: RemoteHintsProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.hint}>
        <DPadIcon />
        <Text style={styles.text}>Навигация</Text>
      </View>

      <View style={styles.hint}>
        <RemoteOkIcon />
        <Text style={styles.text}>Выбрать</Text>
      </View>

      <View style={styles.hint}>
        <RemoteBackIcon />
        <Text style={styles.text}>Назад</Text>
      </View>
    </View>
  );
});

const DPadIcon = memo(function DPadIcon() {
  return (
    <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
      <Path
        d="M20 4H28C29.6 4 31 5.4 31 7V17H41C42.6 17 44 18.4 44 20V28C44 29.6 42.6 31 41 31H31V41C31 42.6 29.6 44 28 44H20C18.4 44 17 42.6 17 41V31H7C5.4 31 4 29.6 4 28V20C4 18.4 5.4 17 7 17H17V7C17 5.4 18.4 4 20 4Z"
        fill="rgba(255,255,255,0.08)"
        stroke="#DDE5FF"
        strokeWidth={2.4}
        strokeLinejoin="round"
      />

      <Circle cx={24} cy={24} r={6.2} fill="#F2F6FF" />

      <Path d="M24 10L28 16H20L24 10Z" fill="#F2F6FF" />
      <Path d="M24 38L20 32H28L24 38Z" fill="#F2F6FF" />
      <Path d="M10 24L16 20V28L10 24Z" fill="#F2F6FF" />
      <Path d="M38 24L32 28V20L38 24Z" fill="#F2F6FF" />
    </Svg>
  );
});

const RemoteOkIcon = memo(function RemoteOkIcon() {
  return (
    <Svg width={58} height={58} viewBox="0 0 58 58" fill="none">
      <Defs>
        <LinearGradient id="okGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#B5FF8A" />
          <Stop offset="100%" stopColor="#50D64E" />
        </LinearGradient>
      </Defs>

      <Circle
        cx={29}
        cy={29}
        r={24}
        fill="rgba(70, 255, 90, 0.08)"
        stroke="rgba(111, 255, 103, 0.35)"
        strokeWidth={8}
      />

      <Circle
        cx={29}
        cy={29}
        r={23}
        fill="rgba(8, 20, 18, 0.92)"
        stroke="url(#okGradient)"
        strokeWidth={2.8}
      />

      <TextSvg x={29} y={35} text="OK" color="#8FFF75" />
    </Svg>
  );
});

export const RemoteBackIcon = memo(function RemoteBackIcon() {
  return (
    <Svg width={58} height={58} viewBox="0 0 58 58" fill="none">
      <Circle cx={29} cy={29} r={25} fill="rgba(255, 60, 60, 0.12)" />

      <Circle
        cx={29}
        cy={29}
        r={22}
        fill="rgba(18, 12, 22, 0.95)"
        stroke="#FF4B4B"
        strokeWidth={3}
      />

      <Path
        d="M36 29H23"
        stroke="#FFFFFF"
        strokeWidth={3.4}
        strokeLinecap="round"
      />

      <Path
        d="M28 22L21 29L28 36"
        stroke="#FFFFFF"
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
/**
 * Маленький SVG-текст для OK.
 * Если хочешь без Svg.Text, можно заменить на Path,
 * но так проще поддерживать.
 */
const TextSvg = memo(function TextSvg({
  x,
  y,
  text,
  color,
}: {
  x: number;
  y: number;
  text: string;
  color: string;
}) {
  return (
    <SvgText
      x={x}
      y={y}
      fill={color}
      fontSize={18}
      fontWeight="900"
      textAnchor="middle"
    >
      {text}
    </SvgText>
  );
});

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    left: 58,
    right: 58,
    bottom: 34,
    maxWidth: 700,

    minHeight: 74,
    paddingHorizontal: 34,
    paddingVertical: 12,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderRadius: 999,
    backgroundColor: 'rgba(8, 10, 28, 0.82)',
    borderWidth: 1.5,
    borderColor: 'rgba(120, 150, 255, 0.42)',

    shadowColor: '#536DFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 18,

    elevation: 14,
  },

  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  text: {
    color: colors.text ?? '#F4F2FF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
    letterSpacing: 0.3,

    textShadowColor: 'rgba(255, 255, 255, 0.22)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
