import { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { TvConnectionStatus } from '@shared/lib/connection-status';
import {
  connectionLabels,
  getConnectionStyle,
} from '@shared/lib/connection-status';
import { quizPartyLogo } from '@shared/assets/images';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

export const LobbyHeader = memo(function LobbyHeader({
  connectionStatus,
}: {
  connectionStatus: TvConnectionStatus;
}) {
  return (
    <View style={styles.logoRow}>
      <Image resizeMode="contain" source={quizPartyLogo} style={styles.logo} />
      <View
        style={[styles.connectionBadge, getConnectionStyle(connectionStatus)]}
      >
        <Text style={styles.connectionDot}>●</Text>
        <Text style={styles.connectionText}>
          {connectionLabels[connectionStatus]}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sv(12),
  },
  logo: {
    width: s(350),
    height: sv(158),
    marginTop: sv(-4),
    marginLeft: s(-8),
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    borderRadius: 999,
    borderColor: 'rgba(255, 224, 168, 0.16)',
    borderWidth: s(1),
    paddingHorizontal: s(14),
    paddingVertical: sv(8),
  },
  connectionDot: { color: colors.mint, fontSize: sf(16) },
  connectionText: { color: colors.text, fontSize: sf(20), fontWeight: '900' },
});
