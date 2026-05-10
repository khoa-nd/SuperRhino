import type { Task, TaskAssignment, Profile } from "@/lib/types";
import { useTaskStore } from "@/stores/taskStore";
import { useFamilyStore } from "@/stores/familyStore";
import { CreditBadge } from "./CreditBadge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface AssignmentCardProps {
  assignment: TaskAssignment;
  currentUserId: string;
  onComplete?: (assignmentId: string) => void;
  onVerify?: (assignmentId: string) => void;
  onCancel?: (assignmentId: string) => void;
}

export function AssignmentCard({
  assignment,
  currentUserId,
  onComplete,
  onVerify,
  onCancel,
}: AssignmentCardProps) {
  const tasks = useTaskStore((s) => s.tasks);
  const getMember = useFamilyStore((s) => s.getMember);

  const task = tasks.find((t) => t.id === assignment.task_id);
  const assigner = getMember(assignment.assigner_id);
  const assignee = getMember(assignment.assignee_id);

  if (!task) return null;

  const isAssignee = assignment.assignee_id === currentUserId;
  const isAssigner = assignment.assigner_id === currentUserId;
  const isPending = assignment.status === "pending";
  const isCompleted = assignment.status === "completed";
  const isVerified = assignment.status === "verified";

  const statusBadge = () => {
    if (isVerified)
      return (
        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
          <CheckCircle size={10} /> Verified
        </span>
      );
    if (isCompleted)
      return (
        <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
          <Clock size={10} /> Needs Verification
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
        <Clock size={10} /> Pending
      </span>
    );
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-card border border-white/5">
      <div
        className="flex items-center justify-center w-11 h-11 rounded-xl text-xl flex-shrink-0"
        style={{ backgroundColor: task.color + "20" }}
      >
        {task.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-text-primary truncate">{task.name}</div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
          {assigner && <span>From {assigner.display_name}</span>}
          {assignee && !isAssignee && <span>→ {assignee.display_name}</span>}
          {isAssignee && <span>Assigned to you</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <CreditBadge amount={task.credits} size="sm" />
        {statusBadge()}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {isAssignee && isPending && onComplete && (
          <button
            onClick={() => onComplete(assignment.id)}
            className="p-2 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25"
            title="Mark as done"
          >
            <CheckCircle size={18} />
          </button>
        )}
        {isAssigner && isCompleted && onVerify && (
          <button
            onClick={() => onVerify(assignment.id)}
            className="p-2 rounded-lg bg-gold-500/15 text-gold-400 hover:bg-gold-500/25"
            title="Verify"
          >
            <CheckCircle size={18} />
          </button>
        )}
        {(isAssigner || isAssignee) && (isPending || isCompleted) && onCancel && (
          <button
            onClick={() => onCancel(assignment.id)}
            className="p-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25"
            title="Cancel"
          >
            <XCircle size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
