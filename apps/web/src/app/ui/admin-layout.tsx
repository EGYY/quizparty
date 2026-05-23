import { Outlet } from 'react-router-dom';
import { useAppStore } from '@shared/model/app-store';
import { AdminMobileNav, Sidebar } from '@widgets/sidebar';
import { Topbar } from '@widgets/topbar';
import styles from './admin-layout.module.scss';

export function AdminLayout() {
  const currentUser = useAppStore((state) => state.currentUser);

  return (
    <div className={styles.appShell}>
      <Sidebar />
      <main className={styles.workspace}>
        <Topbar user={currentUser} />
        <Outlet />
      </main>
      <AdminMobileNav />
    </div>
  );
}
