import type { ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth';
import { SyncProvider } from '@/features/sync';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <HashRouter>
      <AuthProvider>
        <SyncProvider>{children}</SyncProvider>
      </AuthProvider>
    </HashRouter>
  );
}
