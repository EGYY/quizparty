import React from 'react';
import Svg, { Path, Circle, SvgProps, Rect } from 'react-native-svg';

type IconProps = SvgProps & {
  size?: number;
  color?: string;
};

type PartyPopperIconProps = IconProps & {
  accentColor?: string;
  strokeWidth?: number;
};

export const LightningIcon = ({
  size = 32,
  color = '#7DD8FF',
  width,
  height,
  ...props
}: IconProps) => {
  return (
    <Svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 32 32"
      fill="none"
      {...props}
    >
      <Path
        d="M18.2 2.5L7.5 17.2C6.95 17.95 7.48 19 8.41 19H14.15L12.3 29.15C12.08 30.35 13.63 31.03 14.35 30.05L24.9 15.65C25.46 14.89 24.92 13.82 23.98 13.82H18.35L20.25 3.42C20.47 2.2 18.92 1.51 18.2 2.5Z"
        fill={color}
      />
    </Svg>
  );
};

export const TrophyIcon = ({
  size = 32,
  color = '#A9D5FF',
  width,
  height,
  ...props
}: IconProps) => {
  return (
    <Svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 32 32"
      fill="none"
      {...props}
    >
      <Path
        d="M9 4.5H23V8H27C27.83 8 28.5 8.67 28.5 9.5V12.2C28.5 15.45 25.97 18.14 22.8 18.42C21.94 20.25 20.38 21.67 18.5 22.35V25.5H22.5C23.33 25.5 24 26.17 24 27V28H8V27C8 26.17 8.67 25.5 9.5 25.5H13.5V22.35C11.62 21.67 10.06 20.25 9.2 18.42C6.03 18.14 3.5 15.45 3.5 12.2V9.5C3.5 8.67 4.17 8 5 8H9V4.5ZM6.5 11V12.2C6.5 13.73 7.43 15.04 8.75 15.6C8.58 14.79 8.5 13.92 8.5 13V11H6.5ZM25.5 11H23.5V13C23.5 13.92 23.42 14.79 23.25 15.6C24.57 15.04 25.5 13.73 25.5 12.2V11Z"
        fill={color}
      />
    </Svg>
  );
};

export const TimerBoltIcon = ({
  size = 32,
  color = '#7DD8FF',
  width,
  height,
  ...props
}: IconProps) => {
  return (
    <Svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 32 32"
      fill="none"
      {...props}
    >
      <Circle
        cx={16}
        cy={17}
        r={10}
        stroke={color}
        strokeWidth={3}
        opacity={0.42}
      />
      <Path
        d="M12 4.5H20"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M16 17L20.2 12.8"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M17.45 7.2L10.3 17.1C9.92 17.63 10.3 18.36 10.95 18.36H14.78L13.58 25C13.42 25.86 14.51 26.34 15.02 25.64L22.08 15.98C22.47 15.45 22.09 14.7 21.43 14.7H17.68L18.9 7.85C19.06 6.99 17.96 6.5 17.45 7.2Z"
        fill={color}
      />
    </Svg>
  );
};

export const PartyPopperIcon = ({
  size = 32,
  color = '#FFFFFF',
  accentColor = '#B56CFF',
  strokeWidth = 2.4,
  width,
  height,
  ...props
}: PartyPopperIconProps) => {
  return (
    <Svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 32 32"
      fill="none"
      {...props}
    >
      <Path
        d="M6.2 24.6L10.45 13.95C10.72 13.28 11.58 13.1 12.1 13.62L18.38 19.9C18.9 20.42 18.72 21.28 18.05 21.55L7.4 25.8C6.64 26.1 5.9 25.36 6.2 24.6Z"
        fill={color}
      />

      <Path
        d="M11.35 16.25L15.75 20.65L8.45 23.55L11.35 16.25Z"
        fill={accentColor}
        opacity={0.75}
      />

      <Path
        d="M18.6 6.5V10.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      <Path
        d="M24.2 9.3L21.55 11.95"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      <Path
        d="M26 16H22.3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      <Path
        d="M13.9 7.6L15 10.2"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />

      <Path
        d="M24.4 20.8L21.8 19.7"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />

      <Circle cx={21.8} cy={5.6} r={1.4} fill={color} />
      <Circle cx={27} cy={12.7} r={1.2} fill={color} />
    </Svg>
  );
};

export const SignalBarsIcon = ({
  size = 32,
  color = '#A8D86F',
  width,
  height,
  ...props
}: IconProps) => {
  return (
    <Svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 32 32"
      fill="none"
      {...props}
    >
      <Rect x={6} y={18} width={5} height={8} rx={1.5} fill={color} />
      <Rect x={14} y={12} width={5} height={14} rx={1.5} fill={color} />
      <Rect x={22} y={6} width={5} height={20} rx={1.5} fill={color} />
    </Svg>
  );
};
