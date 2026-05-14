import { StyleSheet } from 'react-native';

export const colors = {
  bgNight: '#101426',
  bgDeep: '#17172f',
  bgStage: '#202044',
  panel: 'rgba(27, 29, 56, 0.88)',
  panelSolid: '#242746',
  softCard: '#2e3155',
  border: 'rgba(255, 224, 168, 0.18)',
  gold: '#F6C85A',
  amber: '#f4a261',
  coral: '#ff7a90',
  peach: '#ffb38a',
  purple: '#9b7cff',
  blue: '#5ed7ff',
  mint: '#63e6be',
  pink: '#ff7ac8',
  red: '#ff6b6b',
  text: '#fff8ee',
  textSecondary: '#c9c4d8',
  textMuted: '#8f8aa8',
  textDark: '#1d2038',
};

export const radii = {
  sm: 14,
  md: 20,
  lg: 28,
  xl: 38,
};

export const shadows = StyleSheet.create({
  focus: {
    shadowColor: colors.purple,
    shadowOpacity: 0.72,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  warm: {
    shadowColor: colors.gold,
    shadowOpacity: 0.36,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
});

export const spacing = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 28,
  xl: 42,
  xxl: 64,
};
