import {
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { LeaderboardEntry } from '@quizparty/shared';
import { getPhoneAvatarSource } from '@shared/config/phone-avatars';

export function PlayerAvatar({
  player,
  style,
  textStyle,
}: {
  player: Pick<LeaderboardEntry, 'avatarId' | 'nickname'>;
  style: StyleProp<ViewStyle>;
  textStyle: StyleProp<TextStyle>;
}) {
  const avatarSource = getPhoneAvatarSource(player.avatarId);

  return (
    <View style={style}>
      {avatarSource ? (
        <Image
          resizeMode="cover"
          source={avatarSource}
          style={styles.playerAvatarImage}
        />
      ) : (
        <Text style={textStyle}>
          {player.nickname.slice(0, 1).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  playerAvatarImage: {
    width: '100%',
    height: '100%',
  },
});
