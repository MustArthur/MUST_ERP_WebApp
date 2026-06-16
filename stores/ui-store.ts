import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
    sidebarCollapsed: boolean
    mobileNavOpen: boolean
    toggleSidebarCollapsed: () => void
    setMobileNavOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarCollapsed: false,
            mobileNavOpen: false,
            toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
            setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
        }),
        {
            name: 'must-erp-ui',
            // mobileNavOpen should never survive a reload; only persist the desktop preference
            partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
        }
    )
)
