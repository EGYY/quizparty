import { memo, type ReactNode } from 'react';
import { ClipboardList, FilePenLine, Gauge, LogOut, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Role } from '@quizparty/shared';
import { logoutAdmin } from '@features/auth';
import { logoMarkUrl } from '@shared/lib';
import { useAppStore } from '@shared/model/app-store';
import { BrandLockup } from '@shared/ui';
import styles from './sidebar.module.scss';

const NAV_ITEMS: Array<{
  path: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
  adminOnly?: boolean;
}> = [
  { path: '/admin', label: 'Дашборд', icon: <Gauge size={18} />, exact: true },
  { path: '/admin/quizzes', label: 'Квизы', icon: <ClipboardList size={18} /> },
  { path: '/admin/editor', label: 'Редактор', icon: <FilePenLine size={18} /> },
  { path: '/admin/review', label: 'Ревью', icon: <ShieldCheck size={18} />, adminOnly: true },
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
    <button
      aria-current={active ? 'page' : undefined}
      className={
        active
          ? `${styles.navButton ?? ''} ${styles.navButtonActive ?? ''}`
          : (styles.navButton ?? '')
      }
      type="button"
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  );
}

function useVisibleNavItems() {
  const currentUser = useAppStore((state) => state.currentUser);
  return NAV_ITEMS.filter((item) => !item.adminOnly || currentUser?.role === Role.ADMIN);
}

export const Sidebar = memo(function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const navItems = useVisibleNavItems();

  const isActive = (path: string, exact?: boolean) =>
    exact ? pathname === path : pathname.startsWith(path);

  return (
    <aside className={styles.sidebar}>
      <BrandLockup eyebrow="QuizParty" logoSrc={logoMarkUrl} title="Content Tool" />

      <nav className={styles.navStack}>
        {navItems.map(({ path, label, icon, exact }) => (
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
        className={`${styles.ghostButton ?? ''} ${styles.sidebarLogout ?? ''}`}
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
