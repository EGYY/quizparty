import { GameMode, GamePhase } from '@quizparty/shared';
import type {
  AnswerWindowOpenEvent,
  GamePausedEvent,
  GameResumedEvent,
  RoomClosedEvent,
  RoundStartEvent,
  TimerTickEvent,
} from '@quizparty/shared';
import { initialTvGameRealtimeState, tvGameRealtimeReducer } from './reducer';

const round = {
  roundNumber: 1,
  totalRounds: 3,
  mode: GameMode.CLASSIC,
  serverTime: 10_000,
  roundEndTime: 40_000,
  question: {
    id: '00000000-0000-4000-8000-000000000201',
    quizId: '00000000-0000-4000-8000-000000000101',
    questionText: 'Question?',
    options: ['A', 'B', 'C', 'D'],
    order: 0,
  },
} satisfies RoundStartEvent;

const readingRound = {
  ...round,
  answerStartTime: 17_000,
  roundEndTime: 24_000,
  question: {
    ...round.question,
    options: undefined,
  },
} satisfies RoundStartEvent;

const timer = {
  remainingSeconds: 15,
  totalSeconds: 30,
  serverTime: 25_000,
} satisfies TimerTickEvent;

describe('tvGameRealtimeReducer pause flow', () => {
  it('marks question state as paused and ignores timer ticks while paused', () => {
    const pausedEvent = {
      phase: GamePhase.QUESTION,
      remainingMs: 15_000,
      serverTime: 25_000,
    } satisfies GamePausedEvent;

    const paused = tvGameRealtimeReducer(
      {
        ...initialTvGameRealtimeState,
        gameState: { phase: 'question', round, timer },
      },
      { type: 'game/paused', event: pausedEvent },
    );

    expect(paused.gameState).toMatchObject({
      phase: 'question',
      isPaused: true,
      pause: pausedEvent,
    });

    const ticked = tvGameRealtimeReducer(paused, {
      type: 'game/timerTicked',
      timer: { ...timer, remainingSeconds: 4 },
    });

    expect(ticked.gameState).toMatchObject({
      phase: 'question',
      timer,
    });
  });

  it('resumes question state with the server remaining time', () => {
    const resumedEvent = {
      phase: GamePhase.QUESTION,
      remainingMs: 12_000,
      serverTime: 30_000,
      targetTime: 42_000,
    } satisfies GameResumedEvent;

    const result = tvGameRealtimeReducer(
      {
        ...initialTvGameRealtimeState,
        gameState: {
          phase: 'question',
          round,
          timer,
          isPaused: true,
        },
      },
      { type: 'game/resumed', event: resumedEvent },
    );

    expect(result.gameState).toMatchObject({
      phase: 'question',
      isPaused: false,
      timer: {
        remainingSeconds: 12,
        serverTime: 30_000,
      },
    });
  });

  it('merges answer options when the reaction answer window opens', () => {
    const event = {
      questionId: round.question.id,
      options: ['A', 'B', 'C', 'D'],
      serverTime: 17_000,
      answerStartTime: 17_000,
      roundEndTime: 24_000,
    } satisfies AnswerWindowOpenEvent;

    const result = tvGameRealtimeReducer(
      {
        ...initialTvGameRealtimeState,
        gameState: {
          phase: 'question',
          round: readingRound,
          timer: {
            remainingSeconds: 7,
            totalSeconds: 7,
            serverTime: 10_000,
            stage: 'reading',
          },
        },
      },
      { type: 'game/answerWindowOpened', event },
    );

    expect(result.gameState).toMatchObject({
      phase: 'question',
      round: {
        question: {
          options: event.options,
        },
      },
      timer: {
        remainingSeconds: 7,
        serverTime: 17_000,
        stage: 'answering',
      },
    });
  });

  it('stores room closed event', () => {
    const event = {
      reason: 'HOST_ENDED_GAME',
      roomCode: 'QUIZ-123456',
      serverTime: 30_000,
    } satisfies RoomClosedEvent;

    const result = tvGameRealtimeReducer(initialTvGameRealtimeState, {
      type: 'game/roomClosed',
      event,
    });

    expect(result.roomClosed).toBe(event);
  });
});
