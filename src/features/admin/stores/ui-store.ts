import { create } from 'zustand'

interface AdminUIState {
    isSidebarOpen: boolean
    toggleSidebar: () => void
    openSidebar: () => void
    closeSidebar: () => void
    setSidebarOpen: (isOpen: boolean) => void
}

export const useAdminUIStore = create<AdminUIState>((set) => ({
    isSidebarOpen: false,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    openSidebar: () => set({ isSidebarOpen: true }),
    closeSidebar: () => set({ isSidebarOpen: false }),
    setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}))
