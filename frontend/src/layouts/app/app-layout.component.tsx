'use client';

import LoginGuard from '@components/login-guard/login-guard';
import { ConfirmationDialogContextProvider, GuiProvider } from '@sk-web-gui/react';
import { useLocalStorage } from '@utils/use-localstorage.hook';
import { ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const colorScheme = useLocalStorage(useShallow((state) => state.colorScheme));

  return (
    <GuiProvider colorScheme={colorScheme}>
      <ConfirmationDialogContextProvider>
        <LoginGuard>{children}</LoginGuard>
      </ConfirmationDialogContextProvider>
    </GuiProvider>
  );
};

export default AppLayout;
