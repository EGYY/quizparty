import type { RoundStartEvent } from '@quizparty/shared';
import { buildInitialTimer } from './event-mappers';

const roundStart = (
  overrides: Partial<RoundStartEvent> = {},
): RoundStartEvent => ({
  roundNumber: 1,
  totalRounds: 5,
  serverTime: 10_000,
  roundEndTime: 40_000,
  question: {
    id: '00000000-0000-4000-8000-000000000101',
    quizId: '00000000-0000-4000-8000-000000000001',
    questionText: 'Question?',
    options: ['A', 'B', 'C', 'D'],
    order: 0,
  },
  ...overrides,
});

describe('buildInitialTimer', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(25_200);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('builds initial remaining and total seconds from round timestamps', () => {
    expect(buildInitialTimer(roundStart())).toEqual({
      remainingSeconds: 15,
      totalSeconds: 30,
      serverTime: 25_200,
    });
  });

  it('clamps remaining seconds to zero and total seconds to one', () => {
    expect(
      buildInitialTimer(
        roundStart({
          serverTime: 40_000,
          roundEndTime: 20_000,
        }),
      ),
    ).toEqual({
      remainingSeconds: 0,
      totalSeconds: 1,
      serverTime: 25_200,
    });
  });
});
