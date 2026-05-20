import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { s, sf } from '@shared/config/scale';
import {
  QR_BOX_SIZE,
  QR_INNER_SIZE,
  QR_PADDING,
  qrPanelPalette as palette,
} from '../config';
import type { QrMatrix } from '../lib/qr';

export const QrCodeView = memo(function QrCodeView({
  qrMatrix,
  qrVisible,
  svgPath,
}: {
  qrMatrix: QrMatrix;
  qrVisible: boolean;
  svgPath: string;
}) {
  return (
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
  );
});

const styles = StyleSheet.create({
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
});

