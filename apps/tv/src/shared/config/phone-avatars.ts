import type { ImageSourcePropType } from 'react-native';
import { WEB_PUBLIC_ORIGIN } from '@shared/config/env';

const avatarIds = [
  'avatar-01',
  'avatar-02',
  'avatar-03',
  'avatar-04',
  'avatar-05',
  'avatar-06',
  'avatar-07',
  'avatar-08',
  'popcorn-mascot',
] as const;

export function getPhoneAvatarSource(
  avatarId: string | undefined,
): ImageSourcePropType | undefined {
  if (
    !avatarId ||
    !avatarIds.includes(avatarId as (typeof avatarIds)[number])
  ) {
    return undefined;
  }

  return { uri: `${WEB_PUBLIC_ORIGIN}/assets/phone/${avatarId}.png` };
}
