import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { AuthenticatedRequest } from './auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers?.authorization;
    const token = readBearerToken(Array.isArray(authorization) ? authorization[0] : authorization);

    if (!token) throw new UnauthorizedException('Missing bearer token');

    request.user = await this.auth.verifyAccessToken(token);
    return true;
  }
}

function readBearerToken(authorization: string | undefined): string | undefined {
  if (!authorization) return undefined;

  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) return undefined;
  return token;
}
