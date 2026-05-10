import type { Task } from "@/lib/types";
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from "@/lib/types";
import { CreditBadge } from "./CreditBadge";
import { CheckCircle, ShieldCheck, UserPlus, AlertTriangle, Ban } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onLog?: (task: Task) => void;
  onAssign?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onCancel?: (task: Task) => void;
  showActions?: boolean;
  currentUserId?: string;
}

function isOverdue(task: Task): boolean {
  if (task.cancelled_by) return false;
  if (!task.due_date) return false;
  const today = new Date().toISOString().split("T")[0];
  return task.due_date < today;
}

function formatDueDate(dateStr: string): { text: string; overdue: boolean } {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (dateStr === today) return { text: "Today", overdue: false };
  if (dateStr === tomorrow) return { text: "Tomorrow", overdue: false };
  if (dateStr === yesterday) return { text: "Yesterday", overdue: true };
  if (dateStr < today) return { text: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }), overdue: true };
  return { text: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }), overdue: false };
}

export function TaskCard({
  task, onLog, onAssign, onEdit, onDelete, onCancel,
  showActions = true, currentUserId,
}: TaskCardProps) {
  const cat = CATEGORY_CONFIG[task.category] || { label: task.category, emoji: "📋" };
  const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const overdue = isOverdue(task);
  const dueDate = task.due_date ? formatDueDate(task.due_date) : null;
  const isCancelled = !!task.cancelled_by;
  const isMine = currentUserId === task.assignee_id;
  const isCreator = currentUserId === task.created_by;

  const actions: { key: string; show: boolean; btn: React.ReactNode }[] = [
    {
      key: "log",
      show: !!(onLog && isMine),
      btn: (
        <button onClick={() => onLog?.(task)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-500/20 text-green-400 active:bg-green-500/30 transition-colors" title="Done">
          <CheckCircle size={16} />
        </button>
      ),
    },
    {
      key: "assign",
      show: !!(onAssign && isCreator),
      btn: (
        <button onClick={() => onAssign?.(task)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-gold-500/20 text-gold-400 active:bg-gold-500/30 transition-colors" title="Assign">
          <UserPlus size={16} />
        </button>
      ),
    },
    {
      key: "edit",
      show: !!(onEdit && isCreator),
      btn: (
        <button onClick={() => onEdit?.(task)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 active:bg-blue-500/30 transition-colors" title="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
        </button>
      ),
    },
    {
      key: "cancel",
      show: !!(onCancel && isCreator),
      btn: (
        <button onClick={() => onCancel?.(task)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 active:bg-red-500/30 transition-colors" title="Cancel">
          <Ban size={16} />
        </button>
      ),
    },
  ];

  const visibleActions = actions.filter((a) => a.show);

  return (
    <div className={`group rounded-xl border transition-colors ${
      isCancelled ? "bg-surface-card/40 border-white/5 opacity-50" :
      overdue ? "bg-red-500/5 border-red-500/20 hover:border-red-500/30" :
      "bg-surface-card border-white/5 hover:border-gold-500/20"
    }`}>
      <div className="flex items-start gap-3 p-3">
        {/* Emoji + Credits stacked */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-lg text-lg"
            style={{ backgroundColor: task.color + "20" }}
          >
            {task.emoji}
          </div>
          {!isCancelled && (
            <CreditBadge amount={task.credits} size="sm" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium leading-snug line-clamp-2 ${
            isCancelled ? "text-text-muted line-through" :
            overdue ? "text-red-400" : "text-text-primary"
          }`}>
            {task.name}
          </div>

          <div className="flex items-center flex-wrap gap-2 mt-1">
            <span className="text-xs text-text-muted">{cat.emoji} {cat.label}</span>

            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${pri.bg}`}>
              {task.priority === "important" && <AlertTriangle size={9} className="inline mr-0.5" />}
              {pri.label}
            </span>

            {dueDate && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                dueDate.overdue ? "bg-red-500/15 text-red-400" : "bg-blue-500/10 text-blue-400"
              }`}>
                {dueDate.overdue ? "Overdue: " : "Due: "}{dueDate.text}
              </span>
            )}

            {task.requires_verification && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                <ShieldCheck size={10} /> Verify
              </span>
            )}

            {isCancelled && (
              <span className="flex items-center gap-0.5 text-[10px] text-text-muted">
                <Ban size={10} /> Cancelled
              </span>
            )}

            {isMine && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold-500/10 text-gold-400 font-medium">
                Assigned to you
              </span>
            )}
          </div>
        </div>

        {/* Action buttons — 2x2 grid */}
        {showActions && !isCancelled && visibleActions.length > 0 && (
          <div className="grid grid-cols-2 gap-1 flex-shrink-0">
            {visibleActions.map((a) => (
              <div key={a.key}>{a.btn}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
