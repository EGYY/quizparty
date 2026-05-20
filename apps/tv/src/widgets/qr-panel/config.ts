import { s, sv } from '@shared/config/scale';

export const PANEL_W = s(390);
export const PANEL_H = sv(580);

export const QR_BOX_SIZE = s(292);
export const QR_PADDING = s(16);
export const QR_INNER_SIZE = QR_BOX_SIZE - QR_PADDING * 2;

export const qrPanelPalette = {
  bg: 'rgba(20, 15, 20, 0.94)',
  gold: '#F6C85A',
  goldGlow: '#FFB33D',
  orange: '#D97926',
  text: '#FFF2D7',
  textMuted: '#D7C6AA',
  darkText: '#1B1520',
  qrBg: '#FFF6E8',
  qrDark: '#080812',
} as const;
