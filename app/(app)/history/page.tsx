"use client";

import { useState, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useCreditStore } from "@/stores/creditStore";
import { useTaskStore } from "@/stores/taskStore";
import { useFamilyStore } from "@/stores/familyStore";
import { EmptyState } from "@/components/EmptyState";
import type { TaskLog, CreditTransaction } from "@/lib/types";

type DateFilter = "today" | "yesterday" | "week" | "all";

export default function HistoryPage() {
  const { profile } = useAuthStore();
  const taskLogs = useCreditStore((s) => s.taskLogs);
  const transactions = useCreditStore((s) => s.creditTransactions);
  const tasks = useTaskStore((s) => s.tasks);
  const getMember = useFamilyStore((s) => s.getMember);

  const [filter, setFilter] = useState<DateFilter>("all");

  if (!profile) return null;

  const filterDate = (date: string) => {
    const today = new Date().toISOString().split("T")[0];
    const d = date.split("T")[0];
    switch (filter) {
      case "today": return d === today;
      case "yesterday": {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        return d === yesterday;
      }
      case "week": {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        return date >= weekAgo;
      }
      default: return true;
    }
  };

  const feed = useMemo(() => {
    const items: {
      id: string; type: "task" | "credit"; timestamp: string;
      taskLog?: TaskLog; transaction?: CreditTransaction;
    }[] = [];

    taskLogs.forEach((log) => {
      if (filterDate(log.created_at)) {
        items.push({ id: log.id, type: "task", timestamp: log.created_at, taskLog: log });
      }
    });

    transactions.forEach((tx) => {
      if (filterDate(tx.created_at)) {
        items.push({ id: tx.id, type: "credit", timestamp: tx.created_at, transaction: tx });
      }
    });

    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [taskLogs, transactions, filter]);

  const filters: { key: DateFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "week", label: "This Week" },
  ];

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-black font-display text-text-primary mb-4">History</h1>

      <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === key ? "bg-gold-500 text-navy-950" : "bg-surface-card text-text-secondary hover:bg-surface-hover"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {feed.length === 0 ? (
        <EmptyState icon="📜" title="No activity" description="Your task history will appear here" />
      ) : (
        <div className="flex flex-col gap-2">
          {feed.map((item) => {
            if (item.type === "task" && item.taskLog) {
              const task = tasks.find((t) => t.id === item.taskLog!.task_id);
              const assigner = item.taskLog.assigner_id ? getMember(item.taskLog.assigner_id) : undefined;
              const logUser = getMember(item.taskLog.user_id);

              return (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-card border border-white/5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-lg flex-shrink-0">
                    {task?.emoji || "✅"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{task?.name || "Task"}</div>
                    <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                      <span>{logUser?.display_name || "Someone"}</span>
                      {assigner && <><span>·</span><span>Verified by {assigner.display_name}</span></>}
                      <span>·</span>
                      <span>{new Date(item.taskLog.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.taskLog.status === "verified" ? "bg-green-500/15 text-green-400" : "bg-blue-500/15 text-blue-400"
                    }`}>
                      {item.taskLog.status === "verified" ? "Verified" : "Done"}
                    </span>
                  </div>
                </div>
              );
            }

            if (item.type === "credit" && item.transaction) {
              const logUser = getMember(item.transaction.user_id);
              return (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-card border border-white/5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold-500/10 text-lg flex-shrink-0">💎</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{item.transaction.label}</div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {logUser?.display_name || "Someone"} · {new Date(item.transaction.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-gold-400 font-bold font-display text-sm">+{item.transaction.amount}</span>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
