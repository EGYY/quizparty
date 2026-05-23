import type { QuizDraft } from '@quizparty/shared';
import type { DraftErrors, MobileEditorView } from '../../model/types';
import { MetaPanel } from '../meta/meta-panel';
import { QuestionNav } from '../question-nav';
import styles from '../quiz-editor.module.scss';

export function EditorSidebar({
  allErrors,
  canEditStatus,
  draft,
  errors,
  mobileSectionClass,
  pendingCoverFile,
  safeIndex,
  showErrors,
  setField,
  onAdd,
  onCoverFileChange,
  onSelect,
}: {
  allErrors: DraftErrors;
  canEditStatus: boolean;
  draft: QuizDraft;
  errors: DraftErrors;
  mobileSectionClass: (view: MobileEditorView, extraClass?: string) => string;
  pendingCoverFile: File | undefined;
  safeIndex: number;
  showErrors: boolean;
  setField: <K extends keyof QuizDraft>(field: K, value: QuizDraft[K]) => void;
  onAdd: () => void;
  onCoverFileChange: (file: File | undefined) => void;
  onSelect: (index: number) => void;
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={mobileSectionClass('quiz')}>
        <MetaPanel
          canEditStatus={canEditStatus}
          draft={draft}
          errors={errors}
          pendingCoverFile={pendingCoverFile}
          setField={setField}
          onCoverFileChange={onCoverFileChange}
        />
      </div>
      <div className={mobileSectionClass('question')}>
        <QuestionNav
          draft={draft}
          errors={allErrors}
          selectedIndex={safeIndex}
          showErrors={showErrors}
          onAdd={onAdd}
          onSelect={onSelect}
        />
      </div>
    </aside>
  );
}
