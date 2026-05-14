export enum ClientEvent {
  JOIN_LOBBY = 'join_lobby',
  SET_PLAYER_INFO = 'set_player_info',
  SET_READY = 'set_ready',
  SEND_REACTION = 'send_reaction',
  SUBMIT_ANSWER = 'submit_answer',
  START_GAME = 'start_game',
  RESTART_GAME = 'restart_game',
  CHOOSE_NEXT_QUIZ = 'choose_next_quiz',
  HIDE_QR = 'hide_qr',
}

export enum ServerEvent {
  LOBBY_STATE = 'lobby_state',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  PLAYER_UPDATED = 'player_updated',
  REACTION_RECEIVED = 'reaction_received',
  HOST_TRANSFERRED = 'host_transferred',
  GAME_STARTING = 'game_starting',
  ROUND_START = 'round_start',
  TIMER_TICK = 'timer_tick',
  ANSWER_ACCEPTED = 'answer_accepted',
  ANSWER_PROGRESS = 'answer_progress',
  ROUND_END = 'round_end',
  REACTION_WINDOW_OPEN = 'reaction_window_open',
  REACTION_WINDOW_CLOSED = 'reaction_window_closed',
  NEXT_ROUND_COUNTDOWN = 'next_round_countdown',
  GAME_END = 'game_end',
  ROOM_SETTINGS_UPDATED = 'room_settings_updated',
  ERROR = 'error',
}

export enum GamePhase {
  HOME = 'HOME',
  LOBBY = 'LOBBY',
  STARTING = 'STARTING',
  ROUND_INTRO = 'ROUND_INTRO',
  QUESTION = 'QUESTION',
  ANSWER_REVEAL = 'ANSWER_REVEAL',
  REACTION_WINDOW = 'REACTION_WINDOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum GameMode {
  FAST = 'FAST',
  CLASSIC = 'CLASSIC',
}

export enum QuizStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum Role {
  ADMIN = 'ADMIN',
  AUTHOR = 'AUTHOR',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}

export enum PlayerConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
}

export enum LobbyPlayerStatus {
  READY = 'READY',
  WAITING = 'WAITING',
  DISCONNECTED = 'DISCONNECTED',
}

export enum QuizCategory {
  ALL = 'ALL',
  CINEMA = 'CINEMA',
  MUSIC = 'MUSIC',
  HISTORY = 'HISTORY',
  SCIENCE = 'SCIENCE',
  GAMES = 'GAMES',
  SPORTS = 'SPORTS',
  PARTY = 'PARTY',
  KIDS = 'KIDS',
  ADULT = 'ADULT',
  ART = 'ART',
}

export enum ReviewRejectionReason {
  LOW_COVER_QUALITY = 'LOW_COVER_QUALITY',
  GRAMMAR_ERRORS = 'GRAMMAR_ERRORS',
  FACTUAL_ERRORS = 'FACTUAL_ERRORS',
  DUPLICATE_OR_SIMILAR_QUESTIONS = 'DUPLICATE_OR_SIMILAR_QUESTIONS',
  RULE_VIOLATION = 'RULE_VIOLATION',
  INSUFFICIENT_QUESTIONS = 'INSUFFICIENT_QUESTIONS',
  INVALID_MEDIA = 'INVALID_MEDIA',
}

export enum AdminSort {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  TITLE = 'TITLE',
}

export enum QualityWarningCode {
  LOW_IMAGE_QUALITY = 'LOW_IMAGE_QUALITY',
  TOO_FEW_QUESTIONS = 'TOO_FEW_QUESTIONS',
  LONG_QUESTIONS = 'LONG_QUESTIONS',
  RULE_VIOLATIONS = 'RULE_VIOLATIONS',
  MISSING_COVER = 'MISSING_COVER',
  INCOMPLETE_ANSWERS = 'INCOMPLETE_ANSWERS',
}
