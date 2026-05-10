"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useCreditStore } from "@/stores/creditStore";
import { useFamilyStore } from "@/stores/familyStore";
import { useStreakStore } from "@/stores/streakStore";
import { Leaderboard } from "@/components/Leaderboard";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { Trophy, Flame, Target, Star } from "lucide-react";

export default function StatsPage() {
  const { profile } = useAuthStore();
  const getBalance = useCreditStore((s) => s.getBalance);
  const creditTransactions = useCreditStore((s) => s.creditTransactions);
  const taskLogs = useCreditStore((s) => s.taskLogs);
  const getMembersByFamily = useFamilyStore((s) => s.getMembersByFamily);
  const getAllStreaks = useStreakStore((s) => s.getAllStreaks);

  if (!profile) return null;

  const members = getMembersByFamily(profile.family_id || "");
  const streakData = getAllStreaks();

  const leaderboardEntries = members.map((m) => ({
    profile: m,
    credits: getBalance(m.id),
    streak: streakData.find((s) => s.user_id === m.id)?.current_count || 0,
  }));

  const myLogs = taskLogs.filter((l) => l.user_id === profile.id);
  const myTransactions = creditTransactions.filter((t) => t.user_id === profile.id);

  const today = new Date().toISOString().split("T")[0];
  const todayLogs = myLogs.filter((l) => l.created_at.startsWith(today)).length;
  const thisWeekLogs = myLogs.filter((l) => {
    const d = new Date(l.created_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;
  const totalCredits = myTransactions.reduce((s, t) => s + t.amount, 0);
  const myStreak = streakData.find((s) => s.user_id === profile.id);

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-black font-display text-text-primary mb-6">Stats</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={Trophy} label="Total Credits" value={totalCredits} />
        <StatCard icon={Flame} label="Best Streak" value={myStreak?.longest_count || 0} color="text-orange-400" />
        <StatCard icon={Target} label="Today" value={todayLogs} color="text-blue-400" />
        <StatCard icon={Star} label="This Week" value={thisWeekLogs} color="text-green-400" />
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-bold font-display text-text-primary mb-3 flex items-center gap-2">
          <Trophy size={16} className="text-gold-400" /> Leaderboard
        </h2>
        {leaderboardEntries.length === 0 ? (
          <EmptyState icon="🏆" title="No data yet" description="Complete tasks to see the leaderboard" />
        ) : (
          <Leaderboard entries={leaderboardEntries} />
        )}
      </div>
    </div>
  );
}
