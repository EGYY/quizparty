import { create } from 'zustand';
import type { UserSummary } from '@quizparty/shared';

// NOTE: FSD import rules — useAppStore must only be called as a React hook
// (inside components/custom hooks) at the widget or page layer.
// Outside of React (API callbacks, HTTP interceptors), use the static accessor:
//   useAppStore.getState().accessToken     — read state
//   useAppStore.getState().setAuth(...)    — call actions
// This is Zustand's recommended pattern for non-React access.
// See: shared/api/http.ts, shared/api/auth.ts, features/auth/api/admin-auth.ts

type AppStore = {
  accessToken: string | undefined;
  currentUser: UserSummary | undefined;
  isAuthReady: boolean;
  setAuth: (accessToken: string, user: UserSummary) => void;
  clearAuth: () => void;
  setAuthReady: (value: boolean) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  accessToken: undefined,
  currentUser: undefined,
  isAuthReady: false,
  setAuth: (accessToken, user) => set({ accessToken, currentUser: user, isAuthReady: true }),
  clearAuth: () => set({ accessToken: undefined, currentUser: undefined, isAuthReady: true }),
  setAuthReady: (value) => set({ isAuthReady: value }),
}));
