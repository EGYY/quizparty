const coverMap: Record<string, string> = {
  cinema: '/assets/covers/cinema.svg',
  music: '/assets/covers/music.svg',
  history: '/assets/covers/history.svg',
  science: '/assets/covers/science.svg',
  games: '/assets/covers/games.svg',
  party: '/assets/covers/party.svg',
};

export function resolveAssetUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  if (url.includes('assets.quizparty.local')) {
    const key = Object.keys(coverMap).find((candidate) => url.includes(candidate));
    return key ? coverMap[key] : '/assets/covers/party.svg';
  }

  return url;
}

export const defaultCoverUrl = '/assets/covers/party.svg';
export const adminAvatarUrl = '/assets/avatars/admin.svg';
export const logoMarkUrl = '/assets/brand/logo-mark.svg';
export const popcornMascotUrl = '/assets/brand/popcorn-mascot.svg';
export const quizPartyLogoUrl = '/assets/brand/quizparty-logo.png';
export const phonePopcornMascotUrl = '/assets/phone/popcorn-mascot.png';
export const phoneQuestionFallbackUrl = '/assets/phone/web-question-fallback.png';
