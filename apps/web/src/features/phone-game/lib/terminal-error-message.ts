import { ErrorCode } from '@quizparty/shared';

export function terminalErrorMessage(code: ErrorCode): string | undefined {
  switch (code) {
    case ErrorCode.ROOM_NOT_FOUND:
      return 'Комната не найдена. Проверьте код на экране TV.';
    case ErrorCode.ROOM_FULL:
      return 'Комната заполнена — больше игроков не вмещается.';
    case ErrorCode.GAME_ALREADY_STARTED:
      return 'Игра уже идёт — присоединиться сейчас нельзя.';
    case ErrorCode.QUIZ_NOT_FOUND:
    case ErrorCode.QUIZ_NOT_APPROVED:
      return 'Квиз недоступен. Попросите ведущего выбрать другой.';
    case ErrorCode.PLAYER_NOT_FOUND:
      return 'Сессия игрока недействительна. Зайдите в комнату заново.';
    default:
      return undefined;
  }
}
