import { memo } from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
import { qrPanelPalette as palette } from '../config';

export const PhoneIcon = memo(function PhoneIcon(props: SvgProps) {
  return (
    <Svg width={42} height={42} viewBox="0 0 42 42" fill="none" {...props}>
      <Path
        d="M25.2 5.8L13.4 8.7C12.3 9 11.7 10.1 12 11.2L17.3 32.2C17.6 33.3 18.7 33.9 19.8 33.6L31.6 30.7C32.7 30.4 33.3 29.3 33 28.2L27.7 7.2C27.4 6.1 26.3 5.5 25.2 5.8Z"
        stroke={palette.text}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.3 11.2L25.3 9.2"
        stroke={palette.gold}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <Path
        d="M20.2 29.2L24.2 28.2"
        stroke={palette.gold}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </Svg>
  );
});

