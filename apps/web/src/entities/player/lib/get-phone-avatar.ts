import { phoneAvatars } from '@entities/player';

export function getPhoneAvatar(avatarId: string | undefined) {
  return phoneAvatars.find((avatar) => avatar.id === avatarId);
}
