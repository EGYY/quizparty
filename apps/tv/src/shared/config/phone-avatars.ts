import type { ImageSourcePropType } from 'react-native';
import {
  avatar01,
  avatar02,
  avatar03,
  avatar04,
  avatar05,
  avatar06,
  avatar07,
  avatar08,
  hostPresenter,
} from '@shared/assets/images';

const avatarImages: Record<string, ImageSourcePropType> = {
  'avatar-01': avatar01,
  'avatar-02': avatar02,
  'avatar-03': avatar03,
  'avatar-04': avatar04,
  'avatar-05': avatar05,
  'avatar-06': avatar06,
  'avatar-07': avatar07,
  'avatar-08': avatar08,
  'popcorn-mascot': hostPresenter,
};

export function getPhoneAvatarSource(
  avatarId: string | undefined,
): ImageSourcePropType | undefined {
  if (!avatarId) return undefined;
  return avatarImages[avatarId];
}
