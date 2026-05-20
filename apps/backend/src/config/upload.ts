import { isAbsolute, resolve } from 'node:path';

/**
 * Единое разрешение корневой директории загрузок: абсолютный путь — как есть,
 * относительный — от cwd процесса. Используется в main.ts и QuizzesService.
 */
export function resolveUploadRoot(configuredDir: string): string {
  return isAbsolute(configuredDir) ? configuredDir : resolve(process.cwd(), configuredDir);
}
