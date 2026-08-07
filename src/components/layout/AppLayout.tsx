import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { SyncStatus } from '@/components/layout/SyncStatus';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { useAuth } from '@/features/auth/hooks/useAuth';

function StudyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4 shrink-0">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M6.5 10.25l2.25 2.25 4.25-4.75"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PracticeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4 shrink-0">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="0.75" fill="currentColor" />
    </svg>
  );
}

function LearnIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4 shrink-0">
      <path
        d="M10 6.1c-1.4-1-3.3-1.35-4.85-1.2v9.4c1.55-.15 3.45.2 4.85 1.2 1.4-1 3.3-1.35 4.85-1.2V4.9c-1.55-.15-3.45.2-4.85 1.2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M10 6.1v9.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4 shrink-0">
      <circle cx="9" cy="9" r="5.75" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const primaryNavItems = [
  { to: routes.study, label: 'Study', icon: StudyIcon },
  { to: routes.practice, label: 'Practice', icon: PracticeIcon },
  { to: routes.learnHub, label: 'Learn', icon: LearnIcon },
  { to: routes.search, label: 'Search', icon: SearchIcon },
];

const moreNavItems = [
  { to: routes.topics, label: 'Topics' },
  { to: routes.add, label: 'Add' },
  { to: routes.import, label: 'Import' },
  { to: routes.settings, label: 'Settings' },
];

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
    isActive
      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  ].join(' ');

const menuItemClassName = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors',
    isActive
      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  ].join(' ');

export function AppLayout() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const isMoreActive = moreNavItems.some(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to={routes.dashboard} className="text-lg font-semibold tracking-tight hover:opacity-80">
            Ganbatte
          </Link>
          <SyncStatus />
        </div>
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-1 px-4 pb-3">
          <div className="flex gap-1 overflow-x-auto">
            {primaryNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                <item.icon />
                {item.label}
              </NavLink>
            ))}
          </div>
          <DropdownMenu label="More" active={isMoreActive}>
            {moreNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={menuItemClassName}>
                {item.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Sign out
                </button>
              </>
            ) : null}
          </DropdownMenu>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
