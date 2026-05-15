import { Image, StyleSheet, Text, View } from 'react-native';
import { quizPartyLogo } from '@shared/assets/images';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

export function FinalHeader() {
  return (
    <View style={[styles.header]}>
      <Image
        resizeMode="contain"
        source={quizPartyLogo}
        style={[styles.logo]}
      />
      <View style={styles.titleWrap}>
        <Text style={[styles.title]}>Игра окончена</Text>
        <View style={[styles.ribbon]}>
          <Text style={[styles.ribbonText]}>
            Вот это игра! Вы настоящие знатоки!
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: sv(168),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(42),
    zIndex: 2,
  },
  logo: {
    width: s(310),
    height: sv(98),
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingRight: s(180),
  },
  title: {
    color: colors.gold,
    fontSize: sf(76),
    lineHeight: sv(86),
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 141, 62, 0.82)',
    textShadowOffset: { width: 0, height: sv(4) },
    textShadowRadius: s(9),
  },
  ribbon: {
    minWidth: s(660),
    alignItems: 'center',
    borderColor: 'rgba(244, 166, 91, 0.56)',
    borderRadius: 999,
    borderWidth: s(2),
    backgroundColor: 'rgba(20, 30, 54, 0.94)',
    marginTop: sv(2),
    paddingHorizontal: s(36),
    paddingVertical: sv(11),
  },
  ribbonText: {
    color: colors.text,
    fontSize: sf(25),
    fontWeight: '900',
    textAlign: 'center',
  },
});
