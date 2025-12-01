import { create } from 'zustand'

type User = {
  id: string
  name: string
} | null

type UserState = {
  user: User
  setUser: (user: User) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))