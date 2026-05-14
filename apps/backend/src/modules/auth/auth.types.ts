import type { Role, UserSummary } from '@quizparty/shared';

export type AuthUser = UserSummary;

export type AccessTokenPayload = {
  type: 'access';
  sub: string;
  email: string;
  role: Role;
};

export type RefreshTokenPayload = {
  type: 'refresh';
  sub: string;
  sid: string;
};

export type AuthenticatedRequest = {
  user: AuthUser;
  headers?: Record<string, string | string[] | undefined>;
};
