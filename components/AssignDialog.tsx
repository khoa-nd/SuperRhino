"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";
import { X } from "lucide-react";

interface AssignDialogProps {
  open: boolean;
  onClose: () => void;
  members: Profile[];
  taskName: string;
  currentUserId: string;
  onAssign: (memberId: string) => void;
}

export function AssignDialog({
  open,
  onClose,
  members,
  taskName,
  currentUserId,
  onAssign,
}: AssignDialogProps) {
  const others = members.filter((m) => m.id !== currentUserId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-elevated rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-sm border border-white/10 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-display">Assign Task</h2>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-text-secondary mb-4">
          Assign <span className="text-text-primary font-medium">"{taskName}"</span> to:
        </p>

        {others.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">
            No other family members to assign to.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {others.map((member) => (
              <button
                key={member.id}
                onClick={() => {
                  onAssign(member.id);
                  onClose();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-card hover:bg-surface-hover border border-white/5 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-gold-500/15 text-gold-400 flex items-center justify-center font-bold text-sm">
                  {member.display_name.charAt(0)}
                </div>
                <span className="font-medium text-text-primary">
                  {member.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
