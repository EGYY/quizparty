import { homeBackground } from '@shared/assets/images';
import { s } from '@shared/config/scale';
import { colors } from '@shared/config/theme';
import { memo, type ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

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
        style={styles.backgroundImage}
      />
      <View style={styles.vignette} />
      <View style={styles.leftShade} />
      <View style={styles.content}>{children}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: colors.bgNight,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
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
});
