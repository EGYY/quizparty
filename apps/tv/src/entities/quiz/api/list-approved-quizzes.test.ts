import { QuizCategory } from '@quizparty/shared';
import type { ApprovedQuizList, QuizDetail } from '@quizparty/shared';
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

const page = (
  items: QuizDetail[],
  overrides: Partial<ApprovedQuizList> = {},
): ApprovedQuizList => ({
  items,
  page: 1,
  pageSize: 24,
  total: items.length,
  hasMore: false,
  ...overrides,
});

describe('listApprovedQuizzes cache', () => {
  const requestMock = request as jest.MockedFunction<typeof request>;

  beforeEach(() => {
    jest.restoreAllMocks();
    requestMock.mockReset();
    invalidateApprovedQuizzes();
  });

  it('coalesces concurrent requests for the same category', async () => {
    const data = [quiz('1')];
    const response = page(data);
    let resolveRequest: ((value: ApprovedQuizList) => void) | undefined;
    const pending = new Promise<ApprovedQuizList>(resolve => {
      resolveRequest = resolve;
    });
    requestMock.mockReturnValue(pending);

    const first = listApprovedQuizzes(QuizCategory.MUSIC);
    const second = listApprovedQuizzes(QuizCategory.MUSIC);
    resolveRequest?.(response);

    await expect(first).resolves.toBe(response);
    await expect(second).resolves.toBe(response);
    expect(requestMock).toHaveBeenCalledTimes(1);
    expect(requestMock).toHaveBeenCalledWith(
      '/quizzes/approved?page=1&pageSize=24&category=MUSIC',
    );
  });

  it('serves cached data until TTL expires', async () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000);
    requestMock.mockResolvedValueOnce(page([quiz('cached')]));

    await expect(listApprovedQuizzes(QuizCategory.ALL)).resolves.toEqual(
      page([quiz('cached')]),
    );
    await expect(listApprovedQuizzes(QuizCategory.ALL)).resolves.toEqual(
      page([quiz('cached')]),
    );
    expect(requestMock).toHaveBeenCalledTimes(1);

    nowSpy.mockReturnValue(61_001);
    requestMock.mockResolvedValueOnce(page([quiz('fresh')]));

    await expect(listApprovedQuizzes(QuizCategory.ALL)).resolves.toEqual(
      page([quiz('fresh')]),
    );
    expect(requestMock).toHaveBeenCalledTimes(2);
  });

  it('can invalidate a single category cache entry', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    requestMock
      .mockResolvedValueOnce(page([quiz('music')]))
      .mockResolvedValueOnce(page([quiz('science')]))
      .mockResolvedValueOnce(page([quiz('music-fresh')]));

    await listApprovedQuizzes(QuizCategory.MUSIC);
    await listApprovedQuizzes(QuizCategory.SCIENCE);
    invalidateApprovedQuizzes(QuizCategory.MUSIC);

    await expect(listApprovedQuizzes(QuizCategory.MUSIC)).resolves.toEqual(
      page([quiz('music-fresh')]),
    );
    await expect(listApprovedQuizzes(QuizCategory.SCIENCE)).resolves.toEqual(
      page([quiz('science')]),
    );
    expect(requestMock).toHaveBeenCalledTimes(3);
  });
});
