import { QuizCategory } from '@quizparty/shared';
import type { QuizDetail } from '@quizparty/shared';
import { request } from '@shared/api/tv';
import {
  invalidateApprovedQuizzes,
  listApprovedQuizzes,
} from './list-approved-quizzes';

jest.mock('@shared/api/tv', () => ({
  request: jest.fn(),
}));

const quiz = (id: string): QuizDetail =>
  ({
    id,
    title: `Quiz ${id}`,
    category: QuizCategory.MUSIC,
  }) as QuizDetail;

describe('listApprovedQuizzes cache', () => {
  const requestMock = request as jest.MockedFunction<typeof request>;

  beforeEach(() => {
    jest.restoreAllMocks();
    requestMock.mockReset();
    invalidateApprovedQuizzes();
  });

  it('coalesces concurrent requests for the same category', async () => {
    const data = [quiz('1')];
    let resolveRequest: ((value: QuizDetail[]) => void) | undefined;
    const pending = new Promise<QuizDetail[]>(resolve => {
      resolveRequest = resolve;
    });
    requestMock.mockReturnValue(pending);

    const first = listApprovedQuizzes(QuizCategory.MUSIC);
    const second = listApprovedQuizzes(QuizCategory.MUSIC);
    resolveRequest?.(data);

    await expect(first).resolves.toBe(data);
    await expect(second).resolves.toBe(data);
    expect(requestMock).toHaveBeenCalledTimes(1);
    expect(requestMock).toHaveBeenCalledWith(
      '/quizzes/approved?category=MUSIC',
    );
  });

  it('serves cached data until TTL expires', async () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000);
    requestMock.mockResolvedValueOnce([quiz('cached')]);

    await expect(listApprovedQuizzes(QuizCategory.ALL)).resolves.toEqual([
      quiz('cached'),
    ]);
    await expect(listApprovedQuizzes(QuizCategory.ALL)).resolves.toEqual([
      quiz('cached'),
    ]);
    expect(requestMock).toHaveBeenCalledTimes(1);

    nowSpy.mockReturnValue(61_001);
    requestMock.mockResolvedValueOnce([quiz('fresh')]);

    await expect(listApprovedQuizzes(QuizCategory.ALL)).resolves.toEqual([
      quiz('fresh'),
    ]);
    expect(requestMock).toHaveBeenCalledTimes(2);
  });

  it('can invalidate a single category cache entry', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    requestMock
      .mockResolvedValueOnce([quiz('music')])
      .mockResolvedValueOnce([quiz('science')])
      .mockResolvedValueOnce([quiz('music-fresh')]);

    await listApprovedQuizzes(QuizCategory.MUSIC);
    await listApprovedQuizzes(QuizCategory.SCIENCE);
    invalidateApprovedQuizzes(QuizCategory.MUSIC);

    await expect(listApprovedQuizzes(QuizCategory.MUSIC)).resolves.toEqual([
      quiz('music-fresh'),
    ]);
    await expect(listApprovedQuizzes(QuizCategory.SCIENCE)).resolves.toEqual([
      quiz('science'),
    ]);
    expect(requestMock).toHaveBeenCalledTimes(3);
  });
});
