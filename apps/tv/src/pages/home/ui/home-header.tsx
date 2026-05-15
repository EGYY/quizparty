import { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { quizPartyLogo } from '@shared/assets/images';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

export const HomeHeader = memo(function HomeHeader() {
  return (
    <View style={styles.header}>
      <View>
        <Image
          resizeMode="contain"
          source={quizPartyLogo}
          style={styles.logo}
        />
        <Text style={styles.subtitle}>Выберите квиз для вечеринки 🎉</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: sv(16),
  },
  logo: {
    width: s(400),
    height: sv(152),
    marginLeft: s(-20),
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: sf(22),
    fontWeight: '800',
    marginLeft: s(18),
    marginBottom: sv(4),
  },
});
