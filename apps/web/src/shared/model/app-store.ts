import { create } from 'zustand';
import type { UserSummary } from '@quizparty/shared';

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
