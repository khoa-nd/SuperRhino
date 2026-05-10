import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Streak } from "@/lib/types";

interface StreakState {
  streaks: Streak[];
  updateLocalStreak: (userId: string, count: number, longest: number) => void;
  getStreak: (userId: string) => Streak | null;
  getAllStreaks: () => (Streak & { display_name: string })[];
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      streaks: [],

      updateLocalStreak: (userId, count, longest) =>
        set((s) => {
          const existing = s.streaks.find((st) => st.user_id === userId);
          const today = new Date().toISOString().split("T")[0];
          if (existing) {
            return {
              streaks: s.streaks.map((st) =>
                st.user_id === userId
                  ? {
                      ...st,
                      current_count: count,
                      longest_count: Math.max(st.longest_count, longest),
                      last_activity_date: today,
                    }
                  : st
              ),
            };
          }
          return {
            streaks: [
              ...s.streaks,
              {
                id: crypto.randomUUID(),
                user_id: userId,
                streak_type: "daily",
                current_count: count,
                longest_count: longest,
                last_activity_date: today,
                freeze_used: 0,
              },
            ],
          };
        }),

      getStreak: (userId) => {
        return get().streaks.find((s) => s.user_id === userId) || null;
      },

      getAllStreaks: () => {
        return get()
          .streaks
          .map((s) => {
            const { useFamilyStore } = require("@/stores/familyStore");
            const member = useFamilyStore.getState().getMember(s.user_id);
            return { ...s, display_name: member?.display_name || "Unknown" };
          })
          .sort((a, b) => b.current_count - a.current_count);
      },
    }),
    { name: "superrhino-streaks" }
  )
);
