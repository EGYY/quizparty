import { phoneAvatars } from '@entities/player/model';

export function getPhoneAvatar(avatarId: string | undefined) {
  return phoneAvatars.find((avatar) => avatar.id === avatarId);
}
