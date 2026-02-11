import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
  setDark: (dark: boolean) => void
}

// Light-only theme - dark mode has been removed.
// The interface is preserved for backward compatibility.
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set(() => {
        // Always stay in light mode
        document.documentElement.classList.remove('dark')
        return { isDark: false }
      }),
      setDark: (_dark: boolean) => set(() => {
        // Always stay in light mode
        document.documentElement.classList.remove('dark')
        return { isDark: false }
      }),
    }),
    {
      name: 'leftist-monitor-theme',
      onRehydrateStorage: () => () => {
        // Always ensure light mode on page load
        document.documentElement.classList.remove('dark')
      },
    }
  )
)
