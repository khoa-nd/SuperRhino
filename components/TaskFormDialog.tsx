"use client";

import { useState } from "react";
import type { TaskCategory, TaskPriority } from "@/lib/types";
import { TASK_CATEGORIES, CATEGORY_CONFIG, TASK_PRIORITIES, PRIORITY_CONFIG } from "@/lib/types";
import { X, Calendar, AlertTriangle } from "lucide-react";

const EMOJI_OPTIONS = [
  "💪", "🧹", "🍽️", "🛒", "📚", "🏋️", "🧘", "💻", "📊", "📝",
  "🧺", "🪴", "🐕", "👨‍🍳", "💳", "🧽", "🗑️", "🛏️", "🚗", "📋",
  "🎯", "⏰", "💡", "🎨", "✂️", "🔧", "📞", "✉️", "🏠",
];

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string; emoji: string; credits: number;
    category: TaskCategory; requires_verification: boolean;
    visibility: "private" | "shared"; due_date: string | null;
    priority: TaskPriority;
  }) => void;
  initial?: {
    name: string; emoji: string; credits: number;
    category: TaskCategory; requires_verification: boolean;
    visibility: "private" | "shared"; due_date: string | null;
    priority: TaskPriority;
  };
  title?: string;
}

export function TaskFormDialog({
  open, onClose, onSave, initial,
  title = "Create Task",
}: TaskFormDialogProps) {
  const today = new Date().toISOString().split("T")[0];

  const [name, setName] = useState(initial?.name || "");
  const [emoji, setEmoji] = useState(initial?.emoji || "💪");
  const [credits, setCredits] = useState(initial?.credits || 3);
  const [category, setCategory] = useState<TaskCategory>(initial?.category || "home");
  const [requiresVerification, setRequiresVerification] = useState(initial?.requires_verification || false);
  const [visibility, setVisibility] = useState<"private" | "shared">(initial?.visibility || "private");
  const [dueDate, setDueDate] = useState(initial?.due_date || "");
  const [hasDueDate, setHasDueDate] = useState(!!initial?.due_date);
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority || "medium");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(), emoji, credits, category,
      requires_verification: requiresVerification, visibility,
      due_date: hasDueDate ? dueDate || today : null,
      priority,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-elevated rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto border border-white/10 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold font-display">{title}</h2>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        {/* Emoji + Name */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-14 h-14 rounded-xl bg-surface-card border border-white/10 text-2xl flex items-center justify-center"
            >
              {emoji}
            </button>
            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-2 grid grid-cols-7 gap-1 p-2 bg-surface-card rounded-xl border border-white/10 z-10 shadow-xl">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center hover:bg-surface-hover ${
                      emoji === e ? "bg-gold-500/20 ring-1 ring-gold-500/50" : ""
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What task?"
              className="w-full px-3.5 py-3 rounded-xl bg-surface-card border border-white/10 text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Category + Priority Row */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-text-muted mb-1.5">Category</label>
            <div className="flex gap-1 flex-wrap">
              {TASK_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    category === cat ? "bg-gold-500 text-navy-950" : "bg-surface-card text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  {CATEGORY_CONFIG[cat].emoji} {CATEGORY_CONFIG[cat].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-muted mb-1.5">Priority</label>
          <div className="flex gap-1.5">
            {TASK_PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  priority === p
                    ? `${PRIORITY_CONFIG[p].bg} border-current/30`
                    : "bg-surface-card text-text-muted border-white/5 hover:bg-surface-hover"
                }`}
              >
                {p === "important" && <AlertTriangle size={12} />}
                {PRIORITY_CONFIG[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* Credits + Due Date Row */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Credits: <span className="text-gold-400 font-bold">{credits}</span>
            </label>
            <input
              type="range" min={1} max={10} value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              className="w-full accent-gold-500"
            />
            <div className="flex justify-between text-[10px] text-text-muted"><span>1</span><span>10</span></div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-text-muted mb-1.5">Due Date</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHasDueDate(!hasDueDate)}
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  hasDueDate ? "bg-gold-500/20 text-gold-400 border border-gold-500/30" : "bg-surface-card text-text-muted border border-white/5"
                }`}
              >
                <Calendar size={16} />
              </button>
              {hasDueDate && (
                <input
                  type="date"
                  value={dueDate || today}
                  min={today}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 px-2.5 py-2 rounded-lg bg-surface-card border border-white/10 text-text-primary text-xs focus:border-gold-500/50 focus:outline-none"
                />
              )}
            </div>
          </div>
        </div>

        {/* Verification + Visibility Toggles */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-text-primary">Require Verification</div>
            <div className="text-xs text-text-muted">Someone must confirm completion</div>
          </div>
          <button
            onClick={() => setRequiresVerification(!requiresVerification)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              requiresVerification ? "bg-gold-500" : "bg-surface-hover"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                requiresVerification ? "translate-x-5.5" : "translate-x-0.5"
              }`}
              style={{ left: 0 }}
            />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-text-muted mb-1.5">Visibility</label>
          <div className="flex gap-2">
            <button
              onClick={() => setVisibility("private")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                visibility === "private"
                  ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                  : "bg-surface-card text-text-secondary border border-white/5"
              }`}
            >
              🔒 Private
            </button>
            <button
              onClick={() => setVisibility("shared")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                visibility === "shared"
                  ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                  : "bg-surface-card text-text-secondary border border-white/5"
              }`}
            >
              👥 Shared
            </button>
          </div>
        </div>

        {/* Self-assign hint */}
        <p className="text-[11px] text-text-muted mb-4 text-center">
          Task will be assigned to you. You can reassign it later.
        </p>

        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full py-3 rounded-xl bg-gold-500 text-navy-950 font-bold font-display text-sm disabled:opacity-40 hover:bg-gold-400 transition-colors"
        >
          Save Task
        </button>
      </div>
    </div>
  );
}
