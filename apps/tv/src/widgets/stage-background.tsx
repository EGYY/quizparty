import { memo, type ReactNode } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { homeBackground } from '@shared/assets/images';
import { colors } from '@shared/config/theme';

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
    width: 980,
    backgroundColor: 'rgba(7, 8, 25, 0.15)',
  },
  starOne: {
    position: 'absolute',
    left: 145,
    top: 150,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  starTwo: {
    position: 'absolute',
    left: 720,
    top: 84,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.blue,
  },
  starThree: {
    position: 'absolute',
    right: 520,
    top: 280,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.pink,
  },
});
