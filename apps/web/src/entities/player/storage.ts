const PLAYER_ID_KEY = 'quizparty.phone.playerId';
const PLAYER_PROFILE_KEY = 'quizparty.phone.profile';
const LAST_ROOM_KEY = 'quizparty.phone.lastRoom';
const PLAYER_TOKENS_KEY = 'quizparty.phone.playerTokens';

export type StoredPhoneProfile = {
  avatarId: string;
  nickname: string;
};

export function getOrCreatePlayerId(): string {
  const existing = window.localStorage.getItem(PLAYER_ID_KEY);
  if (existing) return existing;

  const next = createBrowserUuid();
  window.localStorage.setItem(PLAYER_ID_KEY, next);
  return next;
}

function createBrowserUuid(): string {
  if (typeof window.crypto?.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof window.crypto?.getRandomValues === 'function') {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex
    .slice(6, 8)
    .join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
}

export function readStoredPhoneProfile(): StoredPhoneProfile | undefined {
  const raw = window.localStorage.getItem(PLAYER_PROFILE_KEY);
  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as StoredPhoneProfile;
  } catch {
    return undefined;
  }
}

export function saveStoredPhoneProfile(profile: StoredPhoneProfile): void {
  window.localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify(profile));
}

export function saveLastRoom(room: object): void {
  window.localStorage.setItem(LAST_ROOM_KEY, JSON.stringify(room));
}

export function readLastRoom(): unknown {
  const raw = window.localStorage.getItem(LAST_ROOM_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function clearLastRoom(): void {
  window.localStorage.removeItem(LAST_ROOM_KEY);
}

// Player-token issued by the server on JOIN_LOBBY. Used to reclaim the same
// playerId on reconnect/refresh (anti-spoofing). Keyed by roomCode.

function readAllPlayerTokens(): Record<string, string> {
  const raw = window.localStorage.getItem(PLAYER_TOKENS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function readStoredPlayerToken(roomCode: string): string | undefined {
  return readAllPlayerTokens()[roomCode];
}

export function saveStoredPlayerToken(roomCode: string, token: string): void {
  const all = readAllPlayerTokens();
  all[roomCode] = token;
  window.localStorage.setItem(PLAYER_TOKENS_KEY, JSON.stringify(all));
}

export function clearStoredPlayerToken(roomCode: string): void {
  const all = readAllPlayerTokens();
  if (!(roomCode in all)) return;
  delete all[roomCode];
  window.localStorage.setItem(PLAYER_TOKENS_KEY, JSON.stringify(all));
}
