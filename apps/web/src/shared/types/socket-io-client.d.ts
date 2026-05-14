declare module 'socket.io-client' {
  export type Socket = {
    connected: boolean;
    connect: () => Socket;
    disconnect: () => Socket;
    emit: (event: string, payload?: unknown) => Socket;
    io: {
      on: (event: string, listener: (...args: unknown[]) => void) => void;
    };
    on: (event: string, listener: (...args: any[]) => void) => Socket;
  };

  export function io(uri: string, options?: Record<string, unknown>): Socket;
}
