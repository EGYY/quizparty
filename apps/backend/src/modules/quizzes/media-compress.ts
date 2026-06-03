import { execFile } from 'node:child_process';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { MediaType } from '@quizparty/shared';
import sharp from 'sharp';

const FFMPEG_TIMEOUT_MS = 120_000;

export interface CompressResult {
  buffer: Buffer;
  extension: string;
}

async function compressImage(buffer: Buffer, mimetype: string): Promise<CompressResult> {
  const instance =
    mimetype === 'image/gif'
      ? sharp(buffer, { animated: true })
      : sharp(buffer).resize({
          width: 1920,
          height: 1920,
          fit: 'inside',
          withoutEnlargement: true,
        });

  const compressed = await instance.webp({ quality: 82, effort: 4 }).toBuffer();
  return { buffer: compressed, extension: 'webp' };
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile('ffmpeg', args, { timeout: FFMPEG_TIMEOUT_MS }, (error) => {
      if (error) reject(error instanceof Error ? error : new Error('ffmpeg process failed'));
      else resolve();
    });
  });
}

async function compressAudio(buffer: Buffer, inputExt: string): Promise<CompressResult> {
  const id = randomUUID();
  const inPath = join(tmpdir(), `qp-${id}-in${inputExt}`);
  const outPath = join(tmpdir(), `qp-${id}-out.mp3`);

  await writeFile(inPath, buffer);
  try {
    await runFfmpeg([
      '-i',
      inPath,
      '-c:a',
      'libmp3lame',
      '-b:a',
      '128k',
      '-ac',
      '2',
      '-y',
      outPath,
    ]);
    const result = await readFile(outPath);
    return { buffer: result, extension: 'mp3' };
  } finally {
    await Promise.all([
      unlink(inPath).catch(() => undefined),
      unlink(outPath).catch(() => undefined),
    ]);
  }
}

async function compressVideo(buffer: Buffer, inputExt: string): Promise<CompressResult> {
  const id = randomUUID();
  const inPath = join(tmpdir(), `qp-${id}-in${inputExt}`);
  const outPath = join(tmpdir(), `qp-${id}-out.mp4`);

  await writeFile(inPath, buffer);
  try {
    await runFfmpeg([
      '-i',
      inPath,
      '-vf',
      'scale=1280:720:force_original_aspect_ratio=decrease',
      '-c:v',
      'libx264',
      '-crf',
      '28',
      '-preset',
      'fast',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-movflags',
      '+faststart',
      '-y',
      outPath,
    ]);
    const result = await readFile(outPath);
    return { buffer: result, extension: 'mp4' };
  } finally {
    await Promise.all([
      unlink(inPath).catch(() => undefined),
      unlink(outPath).catch(() => undefined),
    ]);
  }
}

export async function compressMedia(
  buffer: Buffer,
  mimetype: string,
  mediaType: MediaType,
  originalExtension: string,
): Promise<CompressResult | null> {
  try {
    if (mediaType === MediaType.IMAGE) {
      return await compressImage(buffer, mimetype);
    }
    if (mediaType === MediaType.AUDIO) {
      return await compressAudio(buffer, `.${originalExtension}`);
    }
    if (mediaType === MediaType.VIDEO) {
      return await compressVideo(buffer, `.${originalExtension}`);
    }
    return null;
  } catch {
    return null;
  }
}
