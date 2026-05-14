import { Outlet } from 'react-router-dom';
import { useAppStore } from '@shared/model/app-store';
import { Sidebar } from '@widgets/sidebar';
import { Topbar } from '@widgets/topbar';

export function AdminLayout() {
  const currentUser = useAppStore((state) => state.currentUser);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="workspace">
        <Topbar user={currentUser} />
        <Outlet />
      </main>
    </div>
  );
}
