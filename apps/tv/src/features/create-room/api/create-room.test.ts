import { Difficulty, GameMode } from '@quizparty/shared';
import { request } from '@shared/api/tv';
import { createRoom } from './create-room';

jest.mock('@shared/api/tv', () => ({
  request: jest.fn(),
}));

describe('createRoom', () => {
  const requestMock = request as jest.MockedFunction<typeof request>;

  beforeEach(() => {
    requestMock.mockReset();
  });

  it('does not retry room creation POST requests', async () => {
    requestMock.mockResolvedValue({
      roomCode: 'QUIZ-123456',
      joinUrl: 'https://tv.test/join/QUIZ-123456',
      settings: {
        quizId: 'quiz-1',
        difficulty: Difficulty.MEDIUM,
        mode: GameMode.CLASSIC,
        questionDurationMs: 30_000,
        revealDurationMs: 8_000,
      },
    });

    await createRoom({
      quizId: 'quiz-1',
      difficulty: Difficulty.MEDIUM,
      mode: GameMode.CLASSIC,
    });

    expect(requestMock).toHaveBeenCalledWith('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        quizId: 'quiz-1',
        difficulty: Difficulty.MEDIUM,
        mode: GameMode.CLASSIC,
      }),
      retry: 0,
    });
  });
});
