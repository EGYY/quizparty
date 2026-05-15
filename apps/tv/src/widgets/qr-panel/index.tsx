import * as QRCode from 'qrcode';
import React, { memo, useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, SvgProps } from 'react-native-svg';
import { s, sf, sv } from '@shared/config/scale';

type Props = {
  joinUrl: string;
  qrVisible: boolean;
  roomCode: string;
  onToggleQr?: () => void;
};

type QrMatrix = {
  size: number;
  data: boolean[];
};

const PANEL_W = s(390);
const PANEL_H = sv(580);

const QR_BOX_SIZE = s(292);
const QR_PADDING = s(16);
const QR_INNER_SIZE = QR_BOX_SIZE - QR_PADDING * 2;

const palette = {
  bg: 'rgba(20, 15, 20, 0.94)',
  bgSoft: 'rgba(36, 28, 32, 0.92)',

  gold: '#F6C85A',
  goldLight: '#FFE49A',
  goldGlow: '#FFB33D',
  orange: '#D97926',

  text: '#FFF2D7',
  textMuted: '#D7C6AA',
  darkText: '#1B1520',

  qrBg: '#FFF6E8',
  qrDark: '#080812',

  buttonBg: 'rgba(31, 28, 33, 0.88)',
  buttonBorder: 'rgba(255, 225, 150, 0.32)',
};

function createQrMatrix(value: string): QrMatrix {
  const qr = QRCode.create(value, { errorCorrectionLevel: 'M' });

  return {
    size: qr.modules.size,
    data: Array.from(qr.modules.data, Boolean),
  };
}

type IconProps = SvgProps & {
  size?: number;
  color?: string;
};

const PhoneIcon = memo((props: IconProps) => (
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
));

PhoneIcon.displayName = 'PhoneIcon';

const EyeOffIcon = memo(() => (
  <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
    <Path
      d="M4.2 14C6.5 9.8 10 7.7 14 7.7C18 7.7 21.5 9.8 23.8 14C22.9 15.7 21.8 17 20.5 18"
      stroke={palette.textMuted}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11.1 11.5C11.9 10.7 12.9 10.3 14 10.3C16.1 10.3 17.7 11.9 17.7 14C17.7 15.1 17.3 16.1 16.5 16.9"
      stroke={palette.textMuted}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5.5 5.5L22.5 22.5"
      stroke={palette.gold}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  </Svg>
));

EyeOffIcon.displayName = 'EyeOffIcon';

export const QrPanel = memo(
  function QrPanel({ joinUrl, qrVisible, roomCode }: Props) {
    const qrMatrix = useMemo(() => createQrMatrix(joinUrl), [joinUrl]);

    const svgPath = useMemo(() => {
      const size = qrMatrix.size;
      let d = '';
      for (let i = 0; i < qrMatrix.data.length; i++) {
        if (qrMatrix.data[i]) {
          const col = i % size;
          const row = Math.floor(i / size);
          d += `M${col},${row}h1v1h-1Z`;
        }
      }
      return d;
    }, [qrMatrix]);

    const joinUrlLabel = useMemo(() => {
      return joinUrl.replace(/^https?:\/\//, '')?.split('/')?.[0] ?? joinUrl;
    }, [joinUrl]);

    return (
      <View style={styles.root}>
        <View style={styles.panel}>
          <View style={styles.panelBorder} />

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Подключайся</Text>
                <Text style={styles.headerAccent}>с телефона!</Text>
              </View>

              <PhoneIcon width={s(62)} style={styles.phoneIcon} />
            </View>

            <View style={styles.qrFrame}>
              {qrVisible ? (
                <Svg
                  width={QR_INNER_SIZE}
                  height={QR_INNER_SIZE}
                  viewBox={`0 0 ${qrMatrix.size} ${qrMatrix.size}`}
                >
                  <Path d={svgPath} fill={palette.qrDark} />
                </Svg>
              ) : (
                <View style={styles.qrHidden}>
                  <Text style={styles.qrHiddenText}>QR скрыт</Text>
                </View>
              )}
            </View>

            <View style={styles.urlBlock}>
              <Text style={styles.urlText}>
                Открой <Text style={styles.urlAccent}>{joinUrlLabel}</Text>
              </Text>
              <Text style={styles.urlText}>и введи код комнаты</Text>
            </View>
          </View>
        </View>

        <View style={styles.codeCard}>
          <View style={styles.decorLineLeft}>
            <View style={styles.decorLine} />
            <View style={[styles.decorLine, styles.decorLineSmall]} />
          </View>

          <Text style={styles.codeLabel}>Код комнаты:</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.codeValue}>
            {roomCode}
          </Text>

          <View style={styles.decorLineRight}>
            <View style={styles.decorLine} />
            <View style={[styles.decorLine, styles.decorLineSmall]} />
          </View>
        </View>

        {/* <Pressable
          style={({ pressed }) => [
            styles.hideButton,
            pressed && styles.hideButtonPressed,
          ]}
          onPress={onToggleQr}
          disabled={!onToggleQr}
        >
          <EyeOffIcon />
          <Text style={styles.hideButtonText}>
            {qrVisible ? 'Скрыть QR' : 'Показать QR'}
          </Text>
        </Pressable> */}
      </View>
    );
  },
  (prev, next) =>
    prev.joinUrl === next.joinUrl &&
    prev.roomCode === next.roomCode &&
    prev.qrVisible === next.qrVisible &&
    prev.onToggleQr === next.onToggleQr,
);

const styles = StyleSheet.create({
  root: {
    width: s(530),
    alignItems: 'center',
    marginTop: Dimensions.get('screen').height / 2 - PANEL_H / 2 - sv(100),
  },

  panel: {
    width: PANEL_W,
    height: PANEL_H,
    borderRadius: s(42),
    backgroundColor: palette.bg,
    overflow: 'visible',

    shadowColor: palette.goldGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: s(30),

    elevation: s(18),
  },
  panelBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: s(42),
    borderWidth: s(3),
    borderColor: palette.gold,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: s(34),
    paddingVertical: sv(34),
  },

  header: {
    width: '100%',
    minHeight: sv(86),
    marginBottom: sv(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(18),
  },

  headerText: {
    alignItems: 'center',
  },

  headerTitle: {
    color: palette.text,
    fontSize: sf(28),
    lineHeight: sv(34),
    fontWeight: '900',
    letterSpacing: s(0.8),
    textAlign: 'center',
  },

  headerAccent: {
    color: palette.gold,
    fontSize: sf(34),
    lineHeight: sv(40),
    fontWeight: '900',
    letterSpacing: s(0.8),
    textAlign: 'center',

    textShadowColor: 'rgba(255, 205, 82, 0.42)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(14),
  },

  phoneIcon: {
    position: 'absolute',
    right: s(10),
    top: sv(-4),
  },

  qrFrame: {
    width: QR_BOX_SIZE,
    height: QR_BOX_SIZE,
    padding: QR_PADDING,
    borderRadius: s(18),
    backgroundColor: palette.qrBg,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: s(16),

    elevation: s(8),
  },

  qrHidden: {
    width: '100%',
    height: '100%',
    borderRadius: s(10),
    backgroundColor: palette.qrBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  qrHiddenText: {
    color: palette.darkText,
    fontSize: sf(28),
    fontWeight: '900',
  },

  urlBlock: {
    marginTop: sv(24),
    alignItems: 'center',
  },

  urlText: {
    color: palette.text,
    fontSize: sf(22),
    lineHeight: sv(30),
    fontWeight: '700',
    textAlign: 'center',
  },

  urlAccent: {
    color: palette.gold,
    fontWeight: '900',
  },

  codeCard: {
    width: s(380),
    minHeight: sv(122),
    marginTop: sv(18),
    paddingVertical: sv(18),
    paddingHorizontal: s(26),
    borderRadius: s(24),
    backgroundColor: 'rgba(24, 22, 28, 0.96)',
    borderWidth: s(2),
    borderColor: palette.gold,

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: palette.goldGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: s(18),

    elevation: s(14),
  },

  codeLabel: {
    color: palette.textMuted,
    fontSize: sf(23),
    lineHeight: sv(28),
    fontWeight: '900',
    letterSpacing: s(0.4),
    marginBottom: sv(2),
  },

  codeValue: {
    color: palette.gold,
    fontSize: sf(54),
    lineHeight: sv(64),
    fontWeight: '900',
    letterSpacing: s(2.5),

    textShadowColor: 'rgba(255, 200, 80, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(18),
  },

  decorLineLeft: {
    position: 'absolute',
    left: s(18),
    top: sv(28),
    gap: s(8),
    transform: [{ rotate: '18deg' }],
  },

  decorLineRight: {
    position: 'absolute',
    right: s(18),
    top: sv(28),
    gap: s(8),
    transform: [{ rotate: '-18deg' }],
  },

  decorLine: {
    width: s(28),
    height: sv(3),
    borderRadius: 999,
    backgroundColor: palette.orange,
  },

  decorLineSmall: {
    width: s(16),
    opacity: 0.8,
  },

  hideButton: {
    marginTop: sv(14),
    minWidth: s(214),
    height: sv(58),
    paddingHorizontal: s(26),
    borderRadius: 999,
    backgroundColor: palette.buttonBg,
    borderWidth: s(2),
    borderColor: palette.buttonBorder,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(12),

    shadowColor: '#000000',
    shadowOffset: { width: 0, height: sv(8) },
    shadowOpacity: 0.35,
    shadowRadius: s(14),

    elevation: s(8),
  },

  hideButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },

  hideButtonText: {
    color: palette.text,
    fontSize: sf(20),
    fontWeight: '900',
  },
});
