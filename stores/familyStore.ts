import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/lib/types";
import { apiGetFamily } from "@/lib/api";

interface FamilyState {
  members: Profile[];
  loading: boolean;
  fetchMembers: (familyId: string) => Promise<void>;
  getMember: (id: string) => Profile | undefined;
  getMembersByFamily: (familyId: string) => Profile[];
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      members: [],
      loading: false,

      fetchMembers: async (familyId) => {
        set({ loading: true });
        try {
          const data = await apiGetFamily(familyId);
          set({ members: data.members, loading: false });
        } catch {
          set({ loading: false });
        }
      },

      getMember: (id) => {
        return get().members.find((m) => m.id === id);
      },

      getMembersByFamily: (familyId) => {
        return get().members.filter((m) => m.family_id === familyId);
      },
    }),
    { name: "superrhino-family" }
  )
);
