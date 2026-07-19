import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth';
import { SyncProvider } from '@/features/sync';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SyncProvider>{children}</SyncProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
