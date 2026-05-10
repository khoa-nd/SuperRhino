"use client";

import { useState } from "react";

interface CancelDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function CancelDialog({
  open, title, message, onConfirm, onCancel: onDismiss,
}: CancelDialogProps) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm(reason.trim() || "");
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onDismiss} />
      <div className="relative bg-surface-elevated rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl animate-scale-in">
        <h3 className="text-lg font-bold font-display text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-4">{message}</p>

        <div className="mb-5">
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Reason (optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you cancelling?"
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-white/10 text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none text-sm"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-text-secondary hover:bg-white/10 text-sm font-medium"
          >
            Keep
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-semibold"
          >
            Cancel Task
          </button>
        </div>
      </div>
    </div>
  );
}
