import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { INITIAL_USERS } from '@/data/users';

interface AuthState {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  switchUserById: (userId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: INITIAL_USERS[0], // Imran Qureshi (Owner)
      setCurrentUser: (user) => set({ currentUser: user }),
      switchRole: (role) => {
        const target = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
        set({ currentUser: target });
      },
      switchUserById: (userId) => {
        const target = INITIAL_USERS.find((u) => u.id === userId) || INITIAL_USERS[0];
        set({ currentUser: target });
      },
    }),
    {
      name: 'propertyos-auth-storage',
    }
  )
);

