import type { CreditTransaction } from "@/lib/types";
import type { Profile } from "@/lib/types";
import { Trophy, Medal } from "lucide-react";

interface LeaderboardProps {
  entries: {
    profile: Profile;
    credits: number;
    streak: number;
  }[];
}

export function Leaderboard({ entries }: LeaderboardProps) {
  const sorted = [...entries].sort((a, b) => b.credits - a.credits);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Trophy size={16} className="text-gold-400" />;
      case 1:
        return <Medal size={16} className="text-zinc-300" />;
      case 2:
        return <Medal size={16} className="text-amber-600" />;
      default:
        return <span className="text-xs text-text-muted w-4 text-center">{rank + 1}</span>;
    }
  };

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        No data yet — start completing tasks!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((entry, i) => {
        const maxCredits = sorted[0]?.credits || 1;
        const barWidth = Math.max((entry.credits / maxCredits) * 100, 2);

        return (
          <div
            key={entry.profile.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-card border border-white/5"
          >
            <div className="flex-shrink-0 w-5">{getRankIcon(i)}</div>

            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gold-500/15 text-gold-400 flex items-center justify-center font-bold text-sm">
              {entry.profile.display_name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-text-primary truncate">
                  {entry.profile.display_name}
                </span>
                <span className="text-sm font-bold font-display text-gold-400">
                  {entry.credits}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden">
                <div
                  className="h-full rounded-full bg-gold-500 transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
