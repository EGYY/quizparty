import { createZodDto } from 'nestjs-zod';
import {
  authSessionSchema,
  loginRequestSchema,
  registerRequestSchema,
  userSummarySchema,
} from '@quizparty/shared';

export class LoginRequestDto extends createZodDto(loginRequestSchema) {}
export class RegisterRequestDto extends createZodDto(registerRequestSchema) {}
export class AuthSessionDto extends createZodDto(authSessionSchema) {}
export class UserSummaryDto extends createZodDto(userSummarySchema) {}
