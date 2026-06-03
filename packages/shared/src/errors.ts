/** Коды ошибок WebSocket. Клиент получает их в событии ServerEvent.ERROR. */
export enum ErrorCode {
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ROOM_FULL = 'ROOM_FULL',
  QUIZ_NOT_FOUND = 'QUIZ_NOT_FOUND',
  QUIZ_NOT_APPROVED = 'QUIZ_NOT_APPROVED',
  PLAYER_NOT_FOUND = 'PLAYER_NOT_FOUND',
  /** Действие разрешено только хосту комнаты. */
  HOST_ONLY = 'HOST_ONLY',
  GAME_ALREADY_STARTED = 'GAME_ALREADY_STARTED',
  GAME_NOT_STARTED = 'GAME_NOT_STARTED',
  ANSWER_ALREADY_SUBMITTED = 'ANSWER_ALREADY_SUBMITTED',
  /** Игрок пытается ответить до открытия окна ответов (режим REACTION)
   *  или пока медиа ещё загружается. */
  ANSWER_TOO_EARLY = 'ANSWER_TOO_EARLY',
  /** Игрок пытается ответить после истечения времени раунда. */
  ANSWER_TOO_LATE = 'ANSWER_TOO_LATE',
  REACTION_RATE_LIMITED = 'REACTION_RATE_LIMITED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
