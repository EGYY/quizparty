import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';

export class CorsSocketIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly webOrigin: string | string[],
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    return super.createIOServer(port, {
      ...options,
      cors: { origin: this.webOrigin, credentials: true },
    });
  }
}