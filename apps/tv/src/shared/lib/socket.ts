import { io, type Socket } from 'socket.io-client';
import { clientEventSchemas, serverEventSchemas } from '@quizparty/shared';
import type { ClientEvent, ServerEvent } from '@quizparty/shared';
import type { z } from 'zod';
import { SOCKET_BASE_URL } from '@shared/config/env';

export type TvSocketNamespace = 'game' | 'lobby';

type ClientSchemaMap = typeof clientEventSchemas;
type ServerSchemaMap = typeof serverEventSchemas;

type Inferred<S> = S extends z.ZodTypeAny ? z.infer<S> : undefined;

export type ClientEventPayload<E extends ClientEvent> =
  E extends keyof ClientSchemaMap ? Inferred<ClientSchemaMap[E]> : never;

export type ServerEventData<E extends ServerEvent> =
  E extends keyof ServerSchemaMap ? Inferred<ServerSchemaMap[E]> : never;

type EmitArgs<E extends ClientEvent> =
  ClientEventPayload<E> extends undefined
    ? []
    : [payload: ClientEventPayload<E>];

// socket.io-client типизирует .on() через перегрузки, которые не сужаются для
// динамически выбираемого имени события. Каст локализован здесь — публичный API
// обёртки остаётся полностью типизированным.
type RawEventSink = {
  on: (event: string, listener: (...args: unknown[]) => void) => unknown;
};

export type TvSocket = {
  readonly raw: Socket;
  readonly connected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: <E extends ClientEvent>(event: E, ...args: EmitArgs<E>) => void;
  on: <E extends ServerEvent>(
    event: E,
    handler: (data: ServerEventData<E>) => void,
  ) => void;
  onConnect: (cb: () => void) => void;
  onDisconnect: (cb: () => void) => void;
  onConnectError: (cb: (error: Error) => void) => void;
  onReconnectAttempt: (cb: () => void) => void;
  onReconnect: (cb: () => void) => void;
};

const TV_SOCKET_OPTIONS = {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 700,
  timeout: 8000,
};

function isNetworkDebugEnabled(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    (globalThis as { __DEV__?: boolean }).__DEV__ === true
  );
}

function describeSocketError(error: Error): Record<string, unknown> {
  const richError = error as Error & {
    data?: unknown;
    description?: unknown;
    context?: unknown;
    type?: unknown;
  };
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    type: richError.type,
    description: richError.description,
    context: richError.context,
    data: richError.data,
  };
}

/**
 * Типобезопасная обёртка над socket.io-client для TV-приложения.
 * Валидирует все входящие серверные события через Zod-схемы из @quizparty/shared.
 * Невалидные события молча отбрасываются.
 */
export function createTvSocket(namespace: TvSocketNamespace): TvSocket {
  const url = `${SOCKET_BASE_URL}/${namespace}`;
  if (isNetworkDebugEnabled()) {
    console.info('[TV SOCKET] create', { namespace, url });
  }

  const raw: Socket = io(url, TV_SOCKET_OPTIONS);

  return {
    raw,
    get connected() {
      return raw.connected;
    },
    connect: () => raw.connect(),
    disconnect: () => raw.disconnect(),
    emit: (event, ...args) => {
      if (args.length) raw.emit(event, args[0]);
      else raw.emit(event);
    },
    on: (event, handler) => {
      const schema = serverEventSchemas[event];
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
    onConnect: cb => raw.on('connect', cb),
    onDisconnect: cb => raw.on('disconnect', cb),
    onConnectError: cb =>
      raw.on('connect_error', error => {
        if (isNetworkDebugEnabled()) {
          console.warn('[TV SOCKET] connect_error', {
            namespace,
            url,
            error: describeSocketError(error),
          });
        }
        cb(error);
      }),
    onReconnectAttempt: cb => raw.io.on('reconnect_attempt', cb),
    onReconnect: cb => raw.io.on('reconnect', cb),
  };
}
