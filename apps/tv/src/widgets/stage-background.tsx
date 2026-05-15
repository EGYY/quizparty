import { memo, type ReactNode } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { homeBackground } from '@shared/assets/images';
import { colors } from '@shared/config/theme';
import { s, sv } from '@shared/config/scale';

export const StageBackground = memo(function StageBackground({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ImageBackground
      resizeMode="cover"
      source={homeBackground}
      style={styles.root}
    >
      <View style={styles.vignette} />
      <View style={styles.leftShade} />
      <View style={styles.starOne} />
      <View style={styles.starTwo} />
      <View style={styles.starThree} />
      {children}
    </ImageBackground>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgNight,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 7, 20, 0.22)',
  },
  leftShade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: s(980),
    backgroundColor: 'rgba(7, 8, 25, 0.15)',
  },
  starOne: {
    position: 'absolute',
    left: s(145),
    top: sv(150),
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    backgroundColor: colors.gold,
  },
  starTwo: {
    position: 'absolute',
    left: s(720),
    top: sv(84),
    width: s(10),
    height: s(10),
    borderRadius: s(5),
    backgroundColor: colors.blue,
  },
  starThree: {
    position: 'absolute',
    right: s(520),
    top: sv(280),
    width: s(7),
    height: s(7),
    borderRadius: s(4),
    backgroundColor: colors.pink,
  },
});
