import { memo, useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { s, sf, sv } from '@shared/config/scale';
import { PANEL_H, PANEL_W, qrPanelPalette as palette } from './config';
import { buildQrSvgPath, createQrMatrix, getJoinUrlLabel } from './lib/qr';
import { PhoneIcon } from './ui/phone-icon';
import { QrCodeView } from './ui/qr-code-view';
import { RoomCodeCard } from './ui/room-code-card';

type Props = {
  joinUrl: string;
  qrVisible: boolean;
  roomCode: string;
};

export const QrPanel = memo(
  function QrPanel({ joinUrl, qrVisible, roomCode }: Props) {
    const { height } = useWindowDimensions();
    const qrMatrix = useMemo(() => createQrMatrix(joinUrl), [joinUrl]);
    const svgPath = useMemo(() => buildQrSvgPath(qrMatrix), [qrMatrix]);
    const joinUrlLabel = useMemo(() => getJoinUrlLabel(joinUrl), [joinUrl]);
    const rootStyle = useMemo(
      () => [styles.root, { marginTop: height / 2 - PANEL_H / 2 - sv(100) }],
      [height],
    );

    return (
      <View style={rootStyle}>
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

            <QrCodeView
              qrMatrix={qrMatrix}
              qrVisible={qrVisible}
              svgPath={svgPath}
            />

            <View style={styles.urlBlock}>
              <Text style={styles.urlText}>
                Открой <Text style={styles.urlAccent}>{joinUrlLabel}</Text>
              </Text>
              <Text style={styles.urlText}>и введи код комнаты</Text>
            </View>
          </View>
        </View>

        <RoomCodeCard roomCode={roomCode} />
      </View>
    );
  },
  (prev, next) =>
    prev.joinUrl === next.joinUrl &&
    prev.roomCode === next.roomCode &&
    prev.qrVisible === next.qrVisible,
);

const styles = StyleSheet.create({
  root: {
    width: s(530),
    alignItems: 'center',
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
});
