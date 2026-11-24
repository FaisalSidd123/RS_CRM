import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { INITIAL_USERS } from '@/data/users';

interface AuthState {
  currentUser: User;
  token: string | null;
  setCurrentUser: (user: User) => void;
  setToken: (token: string | null) => void;
  switchRole: (role: UserRole) => void;
  switchUserById: (userId: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: INITIAL_USERS[0], // Imran Qureshi (Owner)
      token: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      setToken: (token) => set({ token }),
      switchRole: (role) => {
        const target = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
        set({ currentUser: target });
      },
      switchUserById: (userId) => {
        const target = INITIAL_USERS.find((u) => u.id === userId) || INITIAL_USERS[0];
        set({ currentUser: target });
      },
      logout: () => {
        set({ token: null });
      },
      login: async (email: string, password: string) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        // 1. Attempt Real Backend Authentication (Port 5000)
        try {
          const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
          });

          const data = await res.json();

          if (!res.ok || !data.success) {
            return {
              success: false,
              message: data.message || 'Invalid email or password. Please check your credentials.',
            };
          }

          // Backend accepted credentials!
          const backendUser = data.user;
          const matchedInitial = INITIAL_USERS.find(
            (u) =>
              u.email.toLowerCase() === cleanEmail ||
              u.email.split('@')[0] === cleanEmail.split('@')[0] ||
              u.role.toLowerCase() === backendUser.role.toLowerCase()
          );

          const roleCapitalized = (backendUser.role.charAt(0).toUpperCase() +
            backendUser.role.slice(1).toLowerCase()) as UserRole;

          const mappedUser: User = {
            ...(matchedInitial || INITIAL_USERS[0]),
            id: backendUser.id,
            name: backendUser.name,
            email: backendUser.email,
            phone: backendUser.phone,
            role: roleCapitalized,
          };

          set({ currentUser: mappedUser, token: data.token });
          return { success: true, message: `Welcome back, ${mappedUser.name}!` };
        } catch (fetchErr) {
          // 2. Strict Offline/Demo Credential Validation (If backend server is stopped)
          // NEVER allow random passwords!
          const VALID_PASSWORDS: Record<string, string> = {
            'imran@propertyos.pk': 'admin123',
            'imran@crescentrealty.pk': 'admin123',
            'tariq@propertyos.pk': 'admin123',
            'sana@propertyos.pk': 'manager123',
            'sana@crescentrealty.pk': 'manager123',
            'farhan@propertyos.pk': 'manager123',
            'zainab@propertyos.pk': 'manager123',
            'bilal@propertyos.pk': 'agent123',
            'bilal@crescentrealty.pk': 'agent123',
            'ayesha@propertyos.pk': 'agent123',
            'ayesha.k@crescentrealty.pk': 'agent123',
            'usman@propertyos.pk': 'agent123',
            'hamza@propertyos.pk': 'agent123',
          };

          const targetUser = INITIAL_USERS.find(
            (u) =>
              u.email.toLowerCase() === cleanEmail ||
              u.email.split('@')[0] === cleanEmail.split('@')[0]
          );

          if (!targetUser) {
            return { success: false, message: 'Account not found. Please verify your email.' };
          }

          const expectedPass =
            VALID_PASSWORDS[cleanEmail] ||
            (targetUser.role === 'Owner'
              ? 'admin123'
              : targetUser.role === 'Manager'
              ? 'manager123'
              : 'agent123');

          if (cleanPassword !== expectedPass) {
            return {
              success: false,
              message: 'Invalid password. Check your credentials and try again.',
            };
          }

          set({ currentUser: targetUser, token: 'demo-local-token' });
          return { success: true, message: `Welcome back, ${targetUser.name}!` };
        }
      },
    }),
    {
      name: 'propertyos-auth-storage',
    }
  )
);
