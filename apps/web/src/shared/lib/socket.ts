import { io, type ManagerOptions, type Socket, type SocketOptions } from 'socket.io-client';
import { clientEventSchemas, serverEventSchemas } from '@quizparty/shared';
import type { ClientEvent, ServerEvent } from '@quizparty/shared';
import type { z } from 'zod';

type ClientSchemaMap = typeof clientEventSchemas;
type ServerSchemaMap = typeof serverEventSchemas;

type Inferred<S> = S extends z.ZodTypeAny ? z.infer<S> : undefined;

export type ClientEventPayload<E extends ClientEvent> = E extends keyof ClientSchemaMap
  ? Inferred<ClientSchemaMap[E]>
  : never;

export type ServerEventData<E extends ServerEvent> = E extends keyof ServerSchemaMap
  ? Inferred<ServerSchemaMap[E]>
  : never;

type EmitArgs<E extends ClientEvent> =
  ClientEventPayload<E> extends undefined ? [] : [payload: ClientEventPayload<E>];

// socket.io-client типизирует .on() через перегрузки, которые не сужаются для
// динамически выбираемого имени события. Каст локализован здесь — публичный API
// обёртки остаётся полностью типизированным и валидируемым.
type RawEventSink = { on: (event: string, listener: (...args: unknown[]) => void) => unknown };

export type GameSocket = {
  readonly raw: Socket;
  readonly connected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: <E extends ClientEvent>(event: E, ...args: EmitArgs<E>) => void;
  on: <E extends ServerEvent>(event: E, handler: (data: ServerEventData<E>) => void) => void;
  onConnect: (cb: () => void) => void;
  onDisconnect: (cb: () => void) => void;
  onConnectError: (cb: (error: Error) => void) => void;
  onReconnectAttempt: (cb: () => void) => void;
  onReconnect: (cb: () => void) => void;
};

/**
 * Тонкая типобезопасная обёртка над socket.io-client: типизирует emit/on по
 * контрактам из @quizparty/shared и валидирует все входящие payload'ы zod-схемами
 * в одном месте. Невалидные серверные события молча отбрасываются.
 */
export function createGameSocket(
  url: string,
  options?: Partial<ManagerOptions & SocketOptions>,
): GameSocket {
  const raw: Socket = io(url, options);

  return {
    raw,
    get connected() {
      return raw.connected;
    },
    connect: () => {
      raw.connect();
    },
    disconnect: () => {
      raw.disconnect();
    },
    emit: (event, ...args) => {
      if (args.length) raw.emit(event, args[0]);
      else raw.emit(event);
    },
    on: (event, handler) => {
      const schema = serverEventSchemas[event];
      // Каст обязателен для tsc проекта apps/web (перегрузки .on() не сужаются).
      (raw as RawEventSink).on(event, (...args: unknown[]) => {
        if (!schema) {
          (handler as (data: undefined) => void)(undefined);
          return;
        }
        const parsed = schema.safeParse(args[0]);
        if (parsed.success) {
          (handler as (data: unknown) => void)(parsed.data);
        }
      });
    },
    onConnect: (cb) => {
      raw.on('connect', cb);
    },
    onDisconnect: (cb) => {
      raw.on('disconnect', cb);
    },
    onConnectError: (cb) => {
      raw.on('connect_error', cb);
    },
    onReconnectAttempt: (cb) => {
      raw.io.on('reconnect_attempt', cb);
    },
    onReconnect: (cb) => {
      raw.io.on('reconnect', cb);
    },
  };
}
