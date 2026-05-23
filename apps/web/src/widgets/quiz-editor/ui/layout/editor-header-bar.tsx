import { Save, Send, Trash2 } from 'lucide-react';
import type { SaveState } from '@entities/quiz';
import { Button } from '@shared/ui';
import { DeleteConfirmActions, DeleteConfirmPanel } from '../delete-confirm-panel';
import { FieldError } from '../field-error';
import { SaveStateBadge } from '../save-state-badge';
import styles from './editor-header-bar.module.scss';

export function EditorHeaderBar({
  canDelete,
  canSubmit,
  isDeleteOpen,
  isDeleting,
  isSaving,
  isSubmitting,
  saveState,
  showErrors,
  title,
  titleError,
  onDelete,
  onSave,
  onSubmit,
  onTitleChange,
  onToggleDelete,
}: {
  canDelete: boolean;
  canSubmit: boolean;
  isDeleteOpen: boolean;
  isDeleting: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  saveState: SaveState;
  showErrors: boolean;
  title: string;
  titleError: string | undefined;
  onDelete: () => void;
  onSave: () => void;
  onSubmit: () => void;
  onTitleChange: (value: string) => void;
  onToggleDelete: () => void;
}) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <input
          className={`${styles.titleInput}${showErrors && titleError ? ` ${styles.titleInputError}` : ''}`}
          placeholder="Название квиза"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
        {showErrors && titleError ? <FieldError message={titleError} /> : null}
        <SaveStateBadge state={saveState} />
      </div>
      <div className={styles.headerActions}>
        {canDelete ? (
          <Button
            className={styles.desktopDeleteButton}
            disabled={isDeleting}
            variant="danger"
            onClick={onToggleDelete}
          >
            <Trash2 size={15} />
            <span className={styles.btnLabel}>Удалить</span>
          </Button>
        ) : null}
        {canDelete && isDeleteOpen ? (
          <div className={styles.desktopDeleteConfirm}>
            <DeleteConfirmActions isDeleting={isDeleting} onDelete={onDelete} />
          </div>
        ) : null}
        <Button disabled={isSaving} variant="secondary" onClick={onSave}>
          <Save size={15} />
          <span className={styles.btnLabel}>{isSaving ? 'Сохранение…' : 'Сохранить'}</span>
        </Button>
        <Button disabled={!canSubmit || isSubmitting} variant="primary" onClick={onSubmit}>
          <Send size={15} />
          <span className={styles.btnLabel}>{isSubmitting ? 'Отправка…' : 'На ревью'}</span>
        </Button>
      </div>
      {canDelete ? (
        <DeleteConfirmPanel
          isDeleting={isDeleting}
          isOpen={isDeleteOpen}
          onDelete={onDelete}
          onToggle={onToggleDelete}
        />
      ) : null}
    </header>
  );
}
