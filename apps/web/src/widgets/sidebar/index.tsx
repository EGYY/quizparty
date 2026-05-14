import { memo, type ReactNode } from 'react';
import { ClipboardList, FilePenLine, Gauge, LogOut, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logoutAdmin } from '@shared/api/auth';
import { logoMarkUrl } from '@shared/lib/assets';

const NAV_ITEMS: Array<{ path: string; label: string; icon: ReactNode; exact?: boolean }> = [
  { path: '/admin', label: 'Дашборд', icon: <Gauge size={18} />, exact: true },
  { path: '/admin/quizzes', label: 'Квизы', icon: <ClipboardList size={18} /> },
  { path: '/admin/editor', label: 'Редактор', icon: <FilePenLine size={18} /> },
  { path: '/admin/review', label: 'Ревью', icon: <ShieldCheck size={18} /> },
];

function NavButton({
  active,
  icon,
  onClick,
  children,
}: {
  active: boolean;
  icon: ReactNode;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button className={active ? 'nav-button active' : 'nav-button'} type="button" onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}

export const Sidebar = memo(function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path: string, exact?: boolean) =>
    exact ? pathname === path : pathname.startsWith(path);

  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <img alt="" className="brand-mark-image" src={logoMarkUrl} />
        <div>
          <p className="eyebrow">QuizParty</p>
          <strong>Content Tool</strong>
        </div>
      </div>

      <nav className="nav-stack">
        {NAV_ITEMS.map(({ path, label, icon, exact }) => (
          <NavButton
            key={path}
            active={isActive(path, exact)}
            icon={icon}
            onClick={() => {
              void navigate(path);
            }}
          >
            {label}
          </NavButton>
        ))}
      </nav>

      <button
        className="ghost-button sidebar-logout"
        type="button"
        onClick={() => {
          void logoutAdmin().then(() => {
            void navigate('/admin/login', { replace: true });
          });
        }}
      >
        <LogOut size={18} />
        Выйти
      </button>
    </aside>
  );
});
