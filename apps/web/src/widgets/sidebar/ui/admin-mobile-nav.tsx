import { memo, type ReactNode } from 'react';
import { ClipboardList, FilePenLine, Gauge, LogOut, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Role } from '@quizparty/shared';
import { logoutAdmin } from '@features/auth';
import { useAppStore } from '@shared/model/app-store';
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

function useVisibleNavItems() {
  const currentUser = useAppStore((state) => state.currentUser);
  return NAV_ITEMS.filter((item) => !item.adminOnly || currentUser?.role === Role.ADMIN);
}

export const AdminMobileNav = memo(function AdminMobileNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const navItems = useVisibleNavItems();

  const isActive = (path: string, exact?: boolean) =>
    exact ? pathname === path : pathname.startsWith(path);

  return (
    <nav className={styles.mobileBottomNav} aria-label="Основная навигация админки">
      {navItems.map(({ path, label, icon, exact }) => {
        const active = isActive(path, exact);

        return (
          <button
            aria-current={active ? 'page' : undefined}
            className={
              active
                ? `${styles.mobileNavButton ?? ''} ${styles.mobileNavButtonActive ?? ''}`
                : (styles.mobileNavButton ?? '')
            }
            key={path}
            type="button"
            onClick={() => {
              void navigate(path);
            }}
          >
            {icon}
            <span>{label}</span>
          </button>
        );
      })}
      <button
        className={styles.mobileNavButton}
        type="button"
        onClick={() => {
          void logoutAdmin().then(() => {
            void navigate('/admin/login', { replace: true });
          });
        }}
      >
        <LogOut size={18} />
        <span>Выйти</span>
      </button>
    </nav>
  );
});
