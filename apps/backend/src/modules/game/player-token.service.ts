import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { parseDurationMs } from '../../common/util/parse-duration';

const PLAYER_TOKEN_ISSUER = 'quizparty';
const PLAYER_TOKEN_AUDIENCE = 'quizparty-player';

type PlayerTokenPayload = {
  playerId: string;
  roomCode: string;
};

export type PlayerTokenVerification =
  | { ok: true; playerId: string }
  | { ok: false; reason: 'invalid' | 'room_mismatch' | 'player_mismatch' };

/**
 * Серверная подпись токена игрока (HS256 через JwtService).
 * Привязка к (playerId, roomCode) защищает от спуфинга чужого playerId по сокету.
 */
@Injectable()
export class PlayerTokenService {
  private readonly logger = new Logger(PlayerTokenService.name);
  private readonly secret: string;
  private readonly expiresInSeconds: number;
  private readonly strict: boolean;

  constructor(
    config: ConfigService,
    private readonly jwt: JwtService,
  ) {
    this.secret = config.getOrThrow<string>('PLAYER_TOKEN_SECRET');
    this.expiresInSeconds = Math.max(
      1,
      Math.floor(parseDurationMs(config.get<string>('PLAYER_TOKEN_EXPIRES_IN', '1d')) / 1000),
    );
    this.strict = config.get<boolean>('PLAYER_TOKEN_STRICT', false);
  }

  /** STRICT=true — требовать токен для любого известного playerId. */
  get isStrict(): boolean {
    return this.strict;
  }

  sign(playerId: string, roomCode: string): string {
    const payload: PlayerTokenPayload = { playerId, roomCode };
    return this.jwt.sign(payload, {
      secret: this.secret,
      algorithm: 'HS256',
      expiresIn: this.expiresInSeconds,
      issuer: PLAYER_TOKEN_ISSUER,
      audience: PLAYER_TOKEN_AUDIENCE,
    });
  }

  verify(token: string, expected: { playerId: string; roomCode: string }): PlayerTokenVerification {
    let payload: PlayerTokenPayload;
    try {
      payload = this.jwt.verify<PlayerTokenPayload>(token, {
        secret: this.secret,
        algorithms: ['HS256'],
        issuer: PLAYER_TOKEN_ISSUER,
        audience: PLAYER_TOKEN_AUDIENCE,
      });
    } catch (error) {
      this.logger.debug(
        `player-token verification failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { ok: false, reason: 'invalid' };
    }

    if (payload.roomCode !== expected.roomCode) {
      return { ok: false, reason: 'room_mismatch' };
    }
    if (payload.playerId !== expected.playerId) {
      return { ok: false, reason: 'player_mismatch' };
    }
    return { ok: true, playerId: payload.playerId };
  }
}
