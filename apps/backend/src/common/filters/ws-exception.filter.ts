import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ErrorCode, ServerEvent } from '@quizparty/shared';
import type { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: WsException, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<Socket>();
    const error = exception.getError();
    client.emit(ServerEvent.ERROR, error);
  }
}

@Catch()
export class WsFallbackExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WsFallbackExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'ws') return;
    const client = host.switchToWs().getClient<Socket>();
    this.logger.error(
      'Unhandled WS exception',
      exception instanceof Error ? exception.stack : String(exception),
    );
    client.emit(ServerEvent.ERROR, {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Unexpected server error',
    });
  }
}
