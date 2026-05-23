import { memo } from 'react';
import { Bell } from 'lucide-react';
import { Role, type UserSummary } from '@quizparty/shared';
import { adminAvatarUrl } from '@shared/lib';
import { Eyebrow, IconButton, SearchField } from '@shared/ui';
import styles from './topbar.module.scss';

export const Topbar = memo(function Topbar({ user }: { user: UserSummary | undefined }) {
  const roleLabel = user?.role === Role.ADMIN ? 'Admin Console' : 'Author Console';

  return (
    <header className={styles.topbar}>
      <div>
        <Eyebrow>{roleLabel}</Eyebrow>
        <h2>{user?.displayName ?? 'QuizParty Admin'}</h2>
      </div>
      <div className={styles.topbarActions}>
        <SearchField label="Поиск по квизам" placeholder="Поиск по квизам" />
        <IconButton
          disabled
          label="Уведомления пока недоступны"
          title="Уведомления пока недоступны"
        >
          <Bell size={18} />
        </IconButton>
        <img alt="" className={styles.adminAvatar} src={user?.avatarUrl ?? adminAvatarUrl} />
      </div>
    </header>
  );
});
