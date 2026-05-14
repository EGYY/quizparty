import { Image, StyleSheet, Text, View } from 'react-native';
import { quizPartyLogo } from '@shared/assets/images';
import { colors } from '@shared/config/theme';

export function FinalHeader({ compact }: { compact: boolean }) {
  return (
    <View style={[styles.header, compact && styles.header_compact]}>
      <Image
        resizeMode="contain"
        source={quizPartyLogo}
        style={[styles.logo, compact && styles.logo_compact]}
      />
      <View style={styles.titleWrap}>
        <Text style={[styles.title, compact && styles.title_compact]}>
          Игра окончена
        </Text>
        <View style={[styles.ribbon, compact && styles.ribbon_compact]}>
          <Text
            style={[styles.ribbonText, compact && styles.ribbonText_compact]}
          >
            Вот это игра! Вы настоящие знатоки!
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 168,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 42,
    zIndex: 2,
  },
  header_compact: {
    minHeight: 114,
    gap: 24,
  },
  logo: {
    width: 310,
    height: 98,
  },
  logo_compact: {
    width: 218,
    height: 70,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 180,
  },
  title: {
    color: colors.gold,
    fontSize: 76,
    lineHeight: 86,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 141, 62, 0.82)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 9,
  },
  title_compact: {
    fontSize: 52,
    lineHeight: 60,
  },
  ribbon: {
    minWidth: 660,
    alignItems: 'center',
    borderColor: 'rgba(244, 166, 91, 0.56)',
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: 'rgba(20, 30, 54, 0.94)',
    marginTop: 2,
    paddingHorizontal: 36,
    paddingVertical: 11,
  },
  ribbon_compact: {
    minWidth: 450,
    paddingHorizontal: 24,
    paddingVertical: 7,
  },
  ribbonText: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
  },
  ribbonText_compact: {
    fontSize: 17,
  },
});
