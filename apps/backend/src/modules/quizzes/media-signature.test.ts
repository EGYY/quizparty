import { describe, expect, it } from 'vitest';
import { fileMatchesMime } from './media-signature';

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
const gif = Buffer.from('GIF89a');
const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBP')]);
const ogg = Buffer.from('OggS....');
const mp3Id3 = Buffer.from('ID3....');
const mp3Sync = Buffer.from([0xff, 0xfb, 0x90, 0x00]);
const mp4 = Buffer.concat([Buffer.from([0, 0, 0, 0]), Buffer.from('ftypisom')]);
const webm = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x00, 0x00]);

describe('fileMatchesMime', () => {
  it('accepts content whose magic bytes match the declared type', () => {
    expect(fileMatchesMime('image/png', png)).toBe(true);
    expect(fileMatchesMime('image/jpeg', jpg)).toBe(true);
    expect(fileMatchesMime('image/gif', gif)).toBe(true);
    expect(fileMatchesMime('image/webp', webp)).toBe(true);
    expect(fileMatchesMime('audio/ogg', ogg)).toBe(true);
    expect(fileMatchesMime('audio/mpeg', mp3Id3)).toBe(true);
    expect(fileMatchesMime('audio/mpeg', mp3Sync)).toBe(true);
    expect(fileMatchesMime('video/mp4', mp4)).toBe(true);
    expect(fileMatchesMime('video/webm', webm)).toBe(true);
  });

  it('rejects spoofed/mismatched or unsupported content', () => {
    expect(fileMatchesMime('image/png', jpg)).toBe(false);
    expect(fileMatchesMime('video/mp4', png)).toBe(false);
    expect(fileMatchesMime('image/svg+xml', png)).toBe(false);
    expect(fileMatchesMime('image/png', Buffer.alloc(0))).toBe(false);
  });
});
