export type PendingMedia = {
  cover: File | undefined;
  questions: Record<number, File>;
  revealQuestions: Record<number, File>;
};

export type EditorLoadState =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready' };
