import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreditTransaction, TaskLog } from "@/lib/types";
import { apiLogTask, apiVerifyTask, apiGetCredits, apiGetActivity } from "@/lib/api";

interface CreditState {
  taskLogs: TaskLog[];
  creditTransactions: CreditTransaction[];
  balances: Record<string, number>;
  loading: boolean;

  logTask: (taskId: string, userId: string, assignmentId?: string) => Promise<number>;
  verifyTask: (assignmentId: string, assignerId: string) => Promise<void>;
  fetchCredits: (userId: string) => Promise<void>;
  fetchActivity: (userId: string, familyId: string) => Promise<void>;
  getBalance: (userId: string) => number;
  getTransactionsForUser: (userId: string) => CreditTransaction[];
  getLogsForUser: (userId: string) => TaskLog[];
  getTodayLogs: (userId: string) => TaskLog[];
}

export const useCreditStore = create<CreditState>()(
  persist(
    (set, get) => ({
      taskLogs: [],
      creditTransactions: [],
      balances: {},
      loading: false,

      logTask: async (taskId, userId, assignmentId) => {
        const data = await apiLogTask(taskId, userId, assignmentId);
        set((s) => ({
          taskLogs: [...s.taskLogs, data.taskLog],
          creditTransactions: [...s.creditTransactions, data.transaction],
          balances: {
            ...s.balances,
            [userId]: (s.balances[userId] || 0) + data.credits,
          },
        }));
        return data.credits;
      },

      verifyTask: async (assignmentId, assignerId) => {
        await apiVerifyTask(assignmentId, assignerId);
      },

      fetchCredits: async (userId) => {
        try {
          const data = await apiGetCredits(userId);
          set((s) => ({
            balances: { ...s.balances, [userId]: data.balance },
            creditTransactions: [
              ...s.creditTransactions.filter((t) => t.user_id !== userId),
              ...data.transactions,
            ],
          }));
        } catch { /* ignore */ }
      },

      fetchActivity: async (userId, familyId) => {
        set({ loading: true });
        try {
          const data = await apiGetActivity(userId, familyId);
          set({ taskLogs: data.taskLogs, creditTransactions: data.transactions, loading: false });
        } catch {
          set({ loading: false });
        }
      },

      getBalance: (userId) => {
        return get().balances[userId] || 0;
      },

      getTransactionsForUser: (userId) => {
        return get()
          .creditTransactions.filter((t) => t.user_id === userId)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
      },

      getLogsForUser: (userId) => {
        return get()
          .taskLogs.filter((l) => l.user_id === userId)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
      },

      getTodayLogs: (userId) => {
        const today = new Date().toISOString().split("T")[0];
        return get().taskLogs.filter(
          (l) => l.user_id === userId && l.created_at.startsWith(today)
        );
      },
    }),
    { name: "superrhino-credits" }
  )
);
