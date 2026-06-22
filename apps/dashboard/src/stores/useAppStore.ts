import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      sidebarExpanded: true,
      setSidebarExpanded: (sidebarExpanded) => set({ sidebarExpanded }),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
    }),
    {
      name: 'forgecloud-app-storage',
      partialize: (state) => ({ theme: state.theme, sidebarExpanded: state.sidebarExpanded }), // Persist only theme and sidebar state
    }
  )
);
