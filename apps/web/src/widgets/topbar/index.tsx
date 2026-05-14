import { memo } from 'react';
import { Bell, Search } from 'lucide-react';
import type { UserSummary } from '@quizparty/shared';
import { adminAvatarUrl } from '@shared/lib/assets';

export const Topbar = memo(function Topbar({ user }: { user: UserSummary | undefined }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Admin / Author</p>
        <h2>{user?.displayName ?? 'QuizParty Admin'}</h2>
      </div>
      <div className="topbar-actions">
        <div className="search-box">
          <Search size={18} />
          <input aria-label="Поиск по квизам" placeholder="Поиск по квизам" />
        </div>
        <button className="icon-button" type="button" title="Уведомления">
          <Bell size={18} />
        </button>
        <img alt="" className="admin-avatar" src={user?.avatarUrl ?? adminAvatarUrl} />
      </div>
    </header>
  );
});
