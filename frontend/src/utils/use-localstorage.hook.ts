import 'dotenv';
import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';
import { ColorSchemeMode } from '@sk-web-gui/react';
import { LocalStorage } from '@interfaces/localstorage';

export const useLocalStorage = create(
  persist<LocalStorage>(
    (set) => ({
      colorScheme: ColorSchemeMode.System,
      setColorScheme: (colorScheme) => set(() => ({ colorScheme })),
    }),
    {
      name: `locker-management-store`,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
