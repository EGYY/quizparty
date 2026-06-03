import { countdownSeconds } from './use-countdown';

describe('countdownSeconds', () => {
  it('uses server time plus local elapsed time when a server sync is provided', () => {
    expect(
      countdownSeconds(20_000, 1_900_000_000_500, {
        localStartedAt: 1_900_000_000_000,
        serverStartedAt: 10_000,
      }),
    ).toBe(10);
  });

  it('falls back to local time without a server sync', () => {
    expect(
      countdownSeconds(20_000, 15_200, {
        localStartedAt: 15_000,
        serverStartedAt: undefined,
      }),
    ).toBe(5);
  });
});
