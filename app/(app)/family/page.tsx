"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useFamilyStore } from "@/stores/familyStore";
import { useCreditStore } from "@/stores/creditStore";
import { useStreakStore } from "@/stores/streakStore";
import { CreditBadge } from "@/components/CreditBadge";
import { StreakCounter } from "@/components/StreakCounter";
import { EmptyState } from "@/components/EmptyState";
import { Copy, Check } from "lucide-react";
import { showToast } from "@/components/Toast";

export default function FamilyPage() {
  const { profile, family } = useAuthStore();
  const getMembersByFamily = useFamilyStore((s) => s.getMembersByFamily);
  const getBalance = useCreditStore((s) => s.getBalance);
  const streaks = useStreakStore((s) => s.streaks);

  const [copied, setCopied] = useState(false);

  if (!profile || !family) return null;

  const members = getMembersByFamily(family.id);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(family.code);
    setCopied(true);
    showToast("Family code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-black font-display text-text-primary mb-6">Family</h1>

      <div className="p-4 rounded-2xl bg-surface-card border border-white/5 mb-6">
        <h2 className="text-lg font-bold font-display text-text-primary mb-1">{family.name}</h2>
        <p className="text-xs text-text-muted mb-4">{members.length} member{members.length !== 1 ? "s" : ""}</p>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-hover border border-white/5">
          <span className="text-xs text-text-muted flex-shrink-0">Code:</span>
          <code className="flex-1 text-sm font-mono font-bold text-gold-400 tracking-wider">{family.code}</code>
          <button onClick={handleCopyCode} className="p-1.5 rounded-lg bg-gold-500/15 text-gold-400 hover:bg-gold-500/25 transition-colors">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <p className="text-[11px] text-text-muted mt-3 text-center">Share this code to invite family members</p>
      </div>

      <h2 className="text-sm font-bold font-display text-text-primary mb-3">Members</h2>

      {members.length === 0 ? (
        <EmptyState icon="👥" title="No members" description="Invite family members using the code above" />
      ) : (
        <div className="flex flex-col gap-2">
          {members.map((member) => {
            const balance = getBalance(member.id);
            const streak = streaks.find((s) => s.user_id === member.id);
            return (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-card border border-white/5">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gold-500/15 text-gold-400 font-bold text-sm flex-shrink-0">
                  {member.display_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{member.display_name}</span>
                    {member.id === profile.id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold-500/15 text-gold-400">You</span>
                    )}
                    {member.is_family_creator && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400">Creator</span>
                    )}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">@{member.username}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <CreditBadge amount={balance} size="sm" />
                  {streak && <StreakCounter current={streak.current_count} longest={streak.longest_count} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
