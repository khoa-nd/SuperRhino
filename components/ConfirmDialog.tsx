"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-surface-elevated rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl animate-scale-in">
        <h3 className="text-lg font-bold font-display text-text-primary mb-2">
          {title}
        </h3>
        <p className="text-sm text-text-secondary mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-text-secondary hover:bg-white/10 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              variant === "danger"
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "bg-gold-500 text-navy-950 hover:bg-gold-400"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
