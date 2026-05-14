export function hashString(value: string): number {
  return value.split('').reduce((acc, char) => {
    return (acc * 31 + char.charCodeAt(0)) >>> 0;
  }, 2166136261);
}
