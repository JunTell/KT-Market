import { create } from 'zustand'

interface UserData {
  id: string
  email: string
  isAdmin: boolean
}

interface UserState {
  user: UserData | null
  setUser: (user: UserData | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))