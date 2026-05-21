import { memo, type ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { homeBackground } from '@shared/assets/images';
import { colors } from '@shared/config/theme';
import { s, sv } from '@shared/config/scale';

export const StageBackground = memo(function StageBackground({
  children,
}: {
  children: ReactNode;
}) {
  // Plain View + absolute Image instead of ImageBackground.
  // ImageBackground wraps children in an extra View internally (root → Image →
  // children container = 3 nodes). This layout saves one View in the hierarchy.
  return (
    <View style={styles.root}>
      <Image
        resizeMode="cover"
        source={homeBackground}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.vignette} />
      <View style={styles.leftShade} />
      <View style={styles.starOne} />
      <View style={styles.starTwo} />
      <View style={styles.starThree} />
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgNight,
  },
  vignette: {
    ...StyleSheet.absoluteFill,
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
