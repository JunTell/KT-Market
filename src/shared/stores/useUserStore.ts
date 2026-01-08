import { create } from 'zustand'

interface UserData {
  id: string
  email: string
  isAdmin: boolean
}

interface UserState {
  user: UserData | null
  isLoading: boolean
  setUser: (user: UserData | null) => void
  clearUser: () => void
  setLoading: (isLoading: boolean) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  clearUser: () => set({ user: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}))