/**
 * Минимальный in-memory дублёр ioredis для интеграционных тестов.
 * Поддерживает ровно те операции, что используют withRedisLock /
 * RoomStateService / AuthService: set (+NX), get, del, eval(release-script).
 */
export class RedisFake {
  private readonly store = new Map<string, string>();

  set(key: string, value: string, ...rest: unknown[]): 'OK' | null {
    if (rest.includes('NX') && this.store.has(key)) {
      return null;
    }
    this.store.set(key, value);
    return 'OK';
  }

  get(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  del(key: string): number {
    return this.store.delete(key) ? 1 : 0;
  }

  // Эмуляция release-скрипта: удалить ключ только если значение == токен.
  eval(_script: string, _numKeys: number, key: string, token: string): number {
    if (this.store.get(key) === token) {
      this.store.delete(key);
      return 1;
    }
    return 0;
  }

  ping(): 'PONG' {
    return 'PONG';
  }

  keys(prefix = ''): string[] {
    return [...this.store.keys()].filter((key) => key.startsWith(prefix));
  }

  get size(): number {
    return this.store.size;
  }
}
