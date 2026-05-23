import { phoneAvatars } from '../model';

export function getPhoneAvatar(avatarId: string | undefined) {
  return phoneAvatars.find((avatar) => avatar.id === avatarId);
}
