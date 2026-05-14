import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { authSessionSchema, loginRequestSchema } from '@quizparty/shared';
import type { AuthSession, LoginRequest } from '@quizparty/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedRequest } from './auth.types';

type ResponseLike = {
  cookie: (
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      maxAge?: number;
      path: string;
      sameSite: 'lax';
      secure: boolean;
    },
  ) => void;
  clearCookie: (name: string, options: { path: string }) => void;
};

type RequestLike = {
  headers?: Record<string, string | string[] | undefined>;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginRequestSchema)) body: LoginRequest,
    @Req() request: RequestLike,
    @Res({ passthrough: true }) response: ResponseLike,
  ): Promise<AuthSession> {
    const session = await this.auth.login(body);
    this.setRefreshCookie(response, session.refreshToken, request);
    return authSessionSchema.parse({
      accessToken: session.accessToken,
      user: session.user,
    });
  }

  @Post('refresh')
  async refresh(
    @Req() request: RequestLike,
    @Res({ passthrough: true }) response: ResponseLike,
  ): Promise<AuthSession> {
    const session = await this.auth.refresh(this.readRefreshCookie(request));
    this.setRefreshCookie(response, session.refreshToken, request);
    return authSessionSchema.parse({
      accessToken: session.accessToken,
      user: session.user,
    });
  }

  @Post('logout')
  async logout(
    @Req() request: RequestLike,
    @Res({ passthrough: true }) response: ResponseLike,
  ): Promise<{ ok: true }> {
    await this.auth.logout(this.readRefreshCookie(request));
    response.clearCookie(this.auth.refreshCookieName, { path: '/api/auth' });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest): AuthSession['user'] {
    return request.user;
  }

  private setRefreshCookie(response: ResponseLike, refreshToken: string, request: RequestLike) {
    response.cookie(this.auth.refreshCookieName, refreshToken, {
      httpOnly: true,
      maxAge: this.auth.refreshCookieMaxAgeMs,
      path: '/api/auth',
      sameSite: 'lax',
      secure: isSecureRequest(request),
    });
  }

  private readRefreshCookie(request: RequestLike): string | undefined {
    const cookieHeader = request.headers?.cookie;
    if (Array.isArray(cookieHeader)) return parseCookie(cookieHeader.join('; '));
    return parseCookie(cookieHeader);
  }
}

function parseCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;

  for (const rawPair of cookieHeader.split(';')) {
    const [rawName, ...rawValue] = rawPair.trim().split('=');
    if (rawName === 'quizparty_refresh') {
      return decodeURIComponent(rawValue.join('='));
    }
  }

  return undefined;
}

function isSecureRequest(request: RequestLike): boolean {
  const forwardedProto = request.headers?.['x-forwarded-proto'];
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
  return process.env.NODE_ENV === 'production' || proto === 'https';
}
