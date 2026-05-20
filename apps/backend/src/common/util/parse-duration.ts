/**
 * Парсит human-readable длительности ('15m', '30d', '500ms', '2h', '90s') в
 * миллисекунды. Используется для JWT/Player-token TTL из env. Неизвестный
 * формат — fallback 15 минут.
 */
export function parseDurationMs(value: string): number {
  const match = /^(\d+)(ms|s|m|h|d)?$/.exec(value.trim());
  if (!match || !match[1]) return 15 * 60 * 1000;

  const amount = Number(match[1]);
  const unit = match[2] ?? 'ms';
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * (multipliers[unit] ?? 1);
}
