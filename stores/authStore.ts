import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile, Family } from "@/lib/types";
import { apiLogin, apiRegister } from "@/lib/api";

interface AuthState {
  profile: Profile | null;
  family: Family | null;
  isLoggedIn: boolean;
  loading: boolean;
  _hydrated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (params: {
    username: string; displayName: string; password: string;
    createFamily: boolean; familyCode?: string; familyName?: string;
  }) => Promise<void>;
  logout: () => void;
  updateFamily: (family: Family) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile: null,
      family: null,
      isLoggedIn: false,
      loading: false,
      _hydrated: false,

      login: async (username, password) => {
        set({ loading: true });
        try {
          const data = await apiLogin(username, password);
          set({
            profile: data.profile,
            family: data.family,
            isLoggedIn: true,
            loading: false,
          });
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      register: async (params) => {
        set({ loading: true });
        try {
          const data = await apiRegister(params);
          set({
            profile: data.profile,
            family: data.family,
            isLoggedIn: true,
            loading: false,
          });
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      logout: () =>
        set({ profile: null, family: null, isLoggedIn: false }),

      updateFamily: (family) => set({ family }),
    }),
    {
      name: "superrhino-auth",
      onRehydrateStorage: () => (state) => {
        if (state) {
          useAuthStore.setState({ _hydrated: true });
        }
      },
    }
  )
);
