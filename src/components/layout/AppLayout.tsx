import { NavLink, Outlet } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { SyncStatus } from '@/components/layout/SyncStatus';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';

const navItems = [
  { to: routes.dashboard, label: 'Dashboard' },
  { to: routes.study, label: 'Study' },
  { to: routes.learn('vocabulary'), label: 'Learn' },
  { to: routes.topics, label: 'Topics' },
  { to: routes.add, label: 'Add' },
  { to: routes.import, label: 'Import' },
  { to: routes.settings, label: 'Settings' },
];

export function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-tight">Ganbatte</span>
            <SyncStatus />
          </div>
          <div className="flex items-center gap-2">
            <NavLink
              to={routes.search}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              Search…
            </NavLink>
            {user ? (
              <Button type="button" onClick={() => signOut()} className="px-3 py-2">
                Sign out
              </Button>
            ) : null}
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
