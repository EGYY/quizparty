import { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Player } from '@quizparty/shared';
import type { PlayerTone } from '../model/player-card';
import { getPhoneAvatarSource } from '@shared/config/phone-avatars';
import { s, sf, sv } from '@shared/config/scale';
import { colors } from '@shared/config/theme';

type Props = {
  player: Player;
  tone: PlayerTone;
};

function getInitials(nickname: string): string {
  return nickname.trim().slice(0, 1).toUpperCase() || '?';
}

export const PlayerAvatarBlock = memo(function PlayerAvatarBlock({
  player,
  tone,
}: Props) {
  const avatarSource = getPhoneAvatarSource(player.avatarId);
  const avatarBg =
    tone === 'ready'
      ? styles.avatarBg_ready
      : tone === 'offline'
        ? styles.avatarBg_offline
        : styles.avatarBg_waiting;

  return (
    <View style={[styles.avatar, avatarBg]}>
      {avatarSource ? (
        <Image source={avatarSource} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarInitial}>{getInitials(player.nickname)}</Text>
      )}
    </View>
  );
});

const AVATAR = s(90);

const styles = StyleSheet.create({
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: sv(12),
    marginBottom: sv(10),
  },
  avatarBg_ready: { backgroundColor: '#dce9aa' },
  avatarBg_waiting: { backgroundColor: '#9bd8f4' },
  avatarBg_offline: { backgroundColor: '#5f5963' },
  avatarImage: { width: AVATAR, height: AVATAR },
  avatarInitial: {
    color: colors.textDark,
    fontSize: sf(40),
    fontWeight: '900',
  },
});
