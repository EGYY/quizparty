import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { authSessionSchema, loginRequestSchema, registerRequestSchema } from '@quizparty/shared';
import type { AuthSession, LoginRequest, RegisterRequest } from '@quizparty/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedRequest } from './auth.types';
import { AuthSessionDto, LoginRequestDto, RegisterRequestDto, UserSummaryDto } from './auth.dto';

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

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiOperation({ summary: 'Login with email + password' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({ status: 200, type: AuthSessionDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Rate limited (5/min)' })
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
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

  @ApiOperation({ summary: 'Register new author account' })
  @ApiBody({ type: RegisterRequestDto })
  @ApiResponse({ status: 201, type: AuthSessionDto })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 429, description: 'Rate limited (3/min)' })
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async register(
    @Body(new ZodValidationPipe(registerRequestSchema)) body: RegisterRequest,
    @Req() request: RequestLike,
    @Res({ passthrough: true }) response: ResponseLike,
  ): Promise<AuthSession> {
    const session = await this.auth.register(body);
    this.setRefreshCookie(response, session.refreshToken, request);
    return authSessionSchema.parse({
      accessToken: session.accessToken,
      user: session.user,
    });
  }

  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Reads `quizparty_refresh` httpOnly cookie. Set automatically by login/register.',
  })
  @ApiResponse({ status: 200, type: AuthSessionDto })
  @ApiResponse({ status: 401, description: 'Missing or expired refresh cookie' })
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

  @ApiOperation({ summary: 'Logout — clears refresh cookie' })
  @ApiResponse({ status: 200, schema: { example: { ok: true } } })
  @Post('logout')
  async logout(
    @Req() request: RequestLike,
    @Res({ passthrough: true }) response: ResponseLike,
  ): Promise<{ ok: true }> {
    await this.auth.logout(this.readRefreshCookie(request));
    response.clearCookie(this.auth.refreshCookieName, { path: '/api/auth' });
    return { ok: true };
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, type: UserSummaryDto })
  @ApiResponse({ status: 401, description: 'No valid access token' })
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
