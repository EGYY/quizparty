/**
 * Проверка реальной сигнатуры содержимого файла (magic bytes) вместо доверия
 * клиентскому Content-Type, который тривиально подделывается.
 */
export function fileMatchesMime(mimetype: string, buffer: Buffer): boolean {
  const hex = (start: number, end: number) => buffer.subarray(start, end).toString('hex');
  const ascii = (start: number, end: number) => buffer.subarray(start, end).toString('ascii');

  switch (mimetype) {
    case 'image/png':
      return hex(0, 4) === '89504e47';
    case 'image/jpeg':
      return hex(0, 3) === 'ffd8ff';
    case 'image/gif':
      return ascii(0, 4) === 'GIF8';
    case 'image/webp':
      return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
    case 'audio/mpeg': {
      if (ascii(0, 3) === 'ID3') return true;
      const sync = hex(0, 2);
      return sync.startsWith('ff') && (parseInt(sync.slice(2, 4) || '0', 16) & 0xe0) === 0xe0;
    }
    case 'audio/ogg':
      return ascii(0, 4) === 'OggS';
    case 'video/mp4':
      return ascii(4, 8) === 'ftyp';
    case 'video/webm':
      return hex(0, 4) === '1a45dfa3';
    default:
      return false;
  }
}
