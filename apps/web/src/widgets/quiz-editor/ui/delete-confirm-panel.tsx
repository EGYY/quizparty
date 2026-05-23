import { MoreVertical, Trash2 } from 'lucide-react';
import { Button, IconButton } from '@shared/ui';
import styles from './delete-confirm-panel.module.scss';

export function DeleteConfirmActions({
  isDeleting,
  onDelete,
}: {
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <>
      <strong>Удалить квиз?</strong>
      <span>Действие нельзя будет отменить.</span>
      <Button disabled={isDeleting} variant="danger" onClick={onDelete}>
        <Trash2 size={15} />
        {isDeleting ? 'Удаляем…' : 'Удалить'}
      </Button>
    </>
  );
}

export function DeleteConfirmPanel({
  isDeleting,
  isOpen,
  onDelete,
  onToggle,
}: {
  isDeleting: boolean;
  isOpen: boolean;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <div className={styles.mobileDanger}>
      <IconButton aria-expanded={isOpen} label="Дополнительные действия" onClick={onToggle}>
        <MoreVertical size={18} />
      </IconButton>
      {isOpen ? (
        <div className={styles.mobileDangerPanel}>
          <DeleteConfirmActions isDeleting={isDeleting} onDelete={onDelete} />
        </div>
      ) : null}
    </div>
  );
}
