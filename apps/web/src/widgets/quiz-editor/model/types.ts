import type { QuizDraft, QuizDraftQuestion } from '@quizparty/shared';
import type { SaveState } from '@entities/quiz';

export type QuestionErrors = {
  questionText: string | undefined;
  options: (string | undefined)[];
};

export type DraftErrors = {
  title: string | undefined;
  description: string | undefined;
  cover: string | undefined;
  questions: QuestionErrors[];
};

export type QuizEditorProps = {
  draft: QuizDraft;
  canDelete: boolean;
  canEditStatus: boolean;
  saveState: SaveState;
  isDeleting: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  pendingCoverFile: File | undefined;
  pendingQuestionMediaFiles: Record<number, File>;
  pendingQuestionRevealMediaFiles: Record<number, File>;
  onChange: (draft: QuizDraft) => void;
  onCoverFileChange: (file: File | undefined) => void;
  onQuestionMediaFileChange: (index: number, file: File | undefined) => void;
  onQuestionRevealMediaFileChange: (index: number, file: File | undefined) => void;
  onQuestionRemoved: (index: number) => void;
  onDelete: () => void;
  onSave: () => void;
  onSubmit: () => void;
};

export type QuestionMedia = QuizDraftQuestion['media'];

export type MobileEditorView = 'quiz' | 'question' | 'check' | 'preview';
