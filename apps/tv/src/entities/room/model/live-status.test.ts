import type {
  GameStartingEvent,
  NextRoundCountdownEvent,
  ReactionWindowEvent,
  RoundEndEvent,
  RoundStartEvent,
} from '@quizparty/shared';
import {
  buildQuestionLive,
  buildRevealLive,
  buildStartingLive,
} from './live-status';

const roundStart = (
  overrides: Partial<RoundStartEvent> = {},
): RoundStartEvent => ({
  roundNumber: 2,
  totalRounds: 7,
  serverTime: 10_000,
  roundEndTime: 55_000,
  question: {
    id: '00000000-0000-4000-8000-000000000101',
    quizId: '00000000-0000-4000-8000-000000000001',
    questionText: 'Question?',
    options: ['A', 'B', 'C', 'D'],
    order: 0,
  },
  ...overrides,
});

describe('lobby live status builders', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(25_200);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('builds starting live status with clamped remaining seconds', () => {
    const event: GameStartingEvent = {
      countdownSeconds: 5,
      serverTime: 25_000,
      startsAt: 29_500,
    };

    expect(buildStartingLive(event)).toEqual({
      kind: 'starting',
      label: 'Игра стартует',
      remainingSeconds: 5,
    });

    expect(buildStartingLive({ ...event, startsAt: 20_000 })).toMatchObject({
      remainingSeconds: 0,
    });
  });

  it('builds question live status from round timings', () => {
    expect(buildQuestionLive(roundStart())).toEqual({
      kind: 'question',
      label: '2 / 7',
      remainingSeconds: 30,
      totalSeconds: 45,
    });
  });

  it('builds reveal live status from next round, reaction window, and empty reveal events', () => {
    const roundEnd: RoundEndEvent = {
      questionId: '00000000-0000-4000-8000-000000000101',
      correctIndex: 1,
      answerStats: [],
      scores: [],
      reactionWindowSeconds: 5,
      nextRoundStartsAt: 30_000,
    };
    const reactionWindow: ReactionWindowEvent = {
      durationSeconds: 5,
      closesAt: 34_100,
      serverTime: 25_000,
    };
    const nextRound: NextRoundCountdownEvent = {
      remainingSeconds: 9,
      nextRoundStartsAt: 36_000,
      serverTime: 25_000,
    };

    expect(buildRevealLive(roundEnd)).toMatchObject({
      kind: 'reveal',
      label: 'Показываем ответ',
      remainingSeconds: 5,
    });
    expect(buildRevealLive(reactionWindow)).toMatchObject({
      remainingSeconds: 9,
    });
    expect(buildRevealLive(nextRound)).toMatchObject({
      remainingSeconds: 11,
    });
    expect(
      buildRevealLive({ ...roundEnd, nextRoundStartsAt: undefined }),
    ).toMatchObject({
      remainingSeconds: 0,
    });
  });
});
