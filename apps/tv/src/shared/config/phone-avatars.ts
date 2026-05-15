import type { ImageSourcePropType } from 'react-native';

const avatarImages: Record<string, ImageSourcePropType> = {
  'avatar-01': require('@shared/assets/images/avatars/avatar-01.png'),
  'avatar-02': require('@shared/assets/images/avatars/avatar-02.png'),
  'avatar-03': require('@shared/assets/images/avatars/avatar-03.png'),
  'avatar-04': require('@shared/assets/images/avatars/avatar-04.png'),
  'avatar-05': require('@shared/assets/images/avatars/avatar-05.png'),
  'avatar-06': require('@shared/assets/images/avatars/avatar-06.png'),
  'avatar-07': require('@shared/assets/images/avatars/avatar-07.png'),
  'avatar-08': require('@shared/assets/images/avatars/avatar-08.png'),
  'popcorn-mascot': require('@shared/assets/images/popcorn-mascot.png'),
};

export function getPhoneAvatarSource(
  avatarId: string | undefined,
): ImageSourcePropType | undefined {
  if (!avatarId) return undefined;
  return avatarImages[avatarId];
}
