"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";
import { useTaskStore } from "@/stores/taskStore";
import { useCreditStore } from "@/stores/creditStore";
import { useStreakStore } from "@/stores/streakStore";
import { CreditBadge } from "@/components/CreditBadge";
import { StreakCounter } from "@/components/StreakCounter";
import { AssignmentCard } from "@/components/AssignmentCard";
import { TaskCard } from "@/components/TaskCard";
import { CancelDialog } from "@/components/CancelDialog";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import { VoiceTaskButton } from "@/components/VoiceTaskButton";
import { EmptyState } from "@/components/EmptyState";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { showToast } from "@/components/Toast";
import { LogOut, ShieldCheck, AlertTriangle, Plus } from "lucide-react";
import type { Task, TaskCategory, TaskPriority } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const { profile, family, logout } = useAuthStore();
  const tasks = useTaskStore((s) => s.tasks);
  const assignments = useTaskStore((s) => s.assignments);
  const addTask = useTaskStore((s) => s.addTask);
  const updateAssignmentStatus = useTaskStore((s) => s.updateAssignmentStatus);
  const cancelTask = useTaskStore((s) => s.cancelTask);
  const rejectAssignment = useTaskStore((s) => s.rejectAssignment);
  const logTaskCredit = useCreditStore((s) => s.logTask);
  const getBalance = useCreditStore((s) => s.getBalance);
  const getTodayLogs = useCreditStore((s) => s.getTodayLogs);
  const updateLocalStreak = useStreakStore((s) => s.updateLocalStreak);
  const getStreak = useStreakStore((s) => s.getStreak);

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [cancellingTask, setCancellingTask] = useState<Task | null>(null);
  const [rejectingAssignmentId, setRejectingAssignmentId] = useState<string | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);

  if (!profile) return null;

  const balance = getBalance(profile.id);
  const todayLogs = getTodayLogs(profile.id);
  const streak = getStreak(profile.id);

  const pendingAssignments = assignments.filter(
    (a) => a.assignee_id === profile.id && a.status === "pending"
  );
  const needsVerification = assignments.filter(
    (a) => a.assigner_id === profile.id && a.status === "completed"
  );

  // Overdue tasks
  const today = new Date().toISOString().split("T")[0];
  const overdueTasks = tasks.filter((t) => {
    if (t.cancelled_by) return false;
    if (t.assignee_id !== profile.id) return false;
    if (!t.due_date) return false;
    return t.due_date < today;
  });

  // My active tasks (only mine, not cancelled)
  const myActiveTasks = tasks
    .filter((t) => !t.cancelled_by && (t.created_by === profile.id || t.assignee_id === profile.id))
    .slice(0, 6);

  const todayCount = todayLogs.length;

  const handleLogTask = async (task: Task) => {
    try {
      const credits = await logTaskCredit(task.id, profile.id);
      const currentStreak = getStreak(profile.id);
      updateLocalStreak(
        profile.id,
        currentStreak ? currentStreak.current_count + 1 : 1,
        Math.max(currentStreak?.longest_count || 0, (currentStreak?.current_count || 0) + 1)
      );
      setCelebrationMessage(`+${credits} Credits!`);
      setShowCelebration(true);
      showToast(`${task.emoji} ${task.name} completed! +${credits} Credits`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleCompleteAssignment = async (assignmentId: string) => {
    try {
      const assignment = assignments.find((a) => a.id === assignmentId);
      if (!assignment) return;
      const credits = await logTaskCredit(assignment.task_id, profile.id, assignmentId);
      updateAssignmentStatus(assignmentId, "completed");
      const currentStreak = getStreak(profile.id);
      updateLocalStreak(
        profile.id,
        currentStreak ? currentStreak.current_count + 1 : 1,
        Math.max(currentStreak?.longest_count || 0, (currentStreak?.current_count || 0) + 1)
      );
      showToast(`Done! +${credits} Credits — awaiting verification`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleVerify = async (assignmentId: string) => {
    try {
      const creditStore = await import("@/stores/creditStore");
      await creditStore.useCreditStore.getState().verifyTask(assignmentId, profile.id);
      updateAssignmentStatus(assignmentId, "verified");
      showToast("Task verified!");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleCancelAssignment = async (assignmentId: string) => {
    setRejectingAssignmentId(assignmentId);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingAssignmentId) return;
    try {
      await rejectAssignment(rejectingAssignmentId, profile.id, reason || undefined);
      showToast("Assignment rejected", "info");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
    setRejectingAssignmentId(null);
  };

  const handleCancelTask = async (reason: string) => {
    if (!cancellingTask) return;
    try {
      await cancelTask(cancellingTask.id, profile.id, reason || undefined);
      showToast("Task cancelled", "info");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
    setCancellingTask(null);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleVoiceTask = async (title: string) => {
    try {
      const hue = Math.floor(Math.random() * 360);
      await addTask({
        name: title,
        emoji: "🎙️",
        credits: 3,
        category: "personal",
        requires_verification: false,
        visibility: "private",
        due_date: null,
        priority: "medium",
        color: `oklch(0.65 0.15 ${hue})`,
        family_id: family?.id || "",
        created_by: profile.id,
        assignee_id: profile.id,
      });
      showToast(`Task created: "${title}" — edit it in Tasks tab`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to create task", "error");
    }
  };

  const handleCreateTask = async (data: {
    name: string; emoji: string; credits: number;
    category: TaskCategory; requires_verification: boolean;
    visibility: "private" | "shared"; due_date: string | null;
    priority: TaskPriority;
  }) => {
    try {
      const hue = Math.floor(Math.random() * 360);
      await addTask({
        name: data.name,
        emoji: data.emoji,
        credits: data.credits,
        category: data.category,
        requires_verification: data.requires_verification,
        visibility: data.visibility,
        due_date: data.due_date,
        priority: data.priority,
        color: `oklch(0.65 0.15 ${hue})`,
        family_id: family?.id || "",
        created_by: profile.id,
        assignee_id: profile.id,
      });
      showToast("Task created!");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">
            {family?.name || "My"}
          </h1>
          <p className="text-lg font-bold font-display text-text-primary">
            Hi, {profile.display_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreditBadge amount={balance} size="md" />
          <button onClick={() => setShowLogoutConfirm(true)} className="p-2 text-text-muted hover:text-red-400 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Rhino + Streak */}
      <div className="flex items-center justify-between mb-6 p-4 rounded-2xl bg-surface-card border border-white/5">
        <div className="flex items-center gap-4">
          <Image src="/logo-256.png" alt="SuperRhino" width={60} height={60} className="drop-shadow-md" />
          <div>
            <p className="text-sm text-text-secondary mb-1">
              {todayCount > 0 ? `${todayCount} task${todayCount > 1 ? "s" : ""} today` : "No tasks yet today"}
            </p>
            {streak && <StreakCounter current={streak.current_count} longest={streak.longest_count} />}
          </div>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-sm hover:bg-gold-400 transition-colors flex-shrink-0"
        >
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Overdue Tasks — highlighted section */}
      {overdueTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold font-display text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} />
            Overdue
          </h2>
          <div className="flex flex-col gap-2">
            {overdueTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUserId={profile.id}
                onLog={handleLogTask}
                showActions
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold font-display text-text-primary mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold-500" />
            Pending Assignments
          </h2>
          <div className="flex flex-col gap-2">
            {pendingAssignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                currentUserId={profile.id}
                onComplete={handleCompleteAssignment}
                onCancel={handleCancelAssignment}
              />
            ))}
          </div>
        </div>
      )}

      {/* Needs Verification */}
      {needsVerification.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold font-display text-text-primary mb-3 flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-400" />
            Needs Verification
          </h2>
          <div className="flex flex-col gap-2">
            {needsVerification.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                currentUserId={profile.id}
                onVerify={handleVerify}
                onCancel={handleCancelAssignment}
              />
            ))}
          </div>
        </div>
      )}

      {/* My Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold font-display text-text-primary">My Tasks</h2>
          <button onClick={() => router.push("/tasks")} className="text-xs text-gold-400 hover:text-gold-300 transition-colors">
            View all →
          </button>
        </div>
        {myActiveTasks.length === 0 ? (
          <EmptyState icon="📋" title="No tasks yet" description="Create tasks in the Tasks tab" />
        ) : (
          <div className="flex flex-col gap-2">
            {myActiveTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUserId={profile.id}
                onLog={handleLogTask}
                onCancel={task.created_by === profile.id ? (t) => setCancellingTask(t) : undefined}
                showActions
              />
            ))}
          </div>
        )}
      </div>

      {/* Celebration */}
      <CelebrationOverlay show={showCelebration} message={celebrationMessage} onComplete={() => setShowCelebration(false)} />

      {/* Logout confirm */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-surface-elevated rounded-2xl p-6 max-w-sm w-full mx-4 border border-white/10 animate-scale-in">
            <h3 className="text-lg font-bold font-display mb-2">Log Out?</h3>
            <p className="text-sm text-text-secondary mb-6">You'll need to log back in to access your family.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-text-secondary hover:bg-white/10 text-sm font-medium">Cancel</button>
              <button onClick={handleLogout} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-semibold">Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* New Task Dialog */}
      <TaskFormDialog
        open={showNewTask}
        onClose={() => setShowNewTask(false)}
        onSave={handleCreateTask}
      />

      {/* Voice Task Button — centered above bottom nav */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30">
        <VoiceTaskButton onCreateTask={handleVoiceTask} />
      </div>

      {/* Cancel/reject dialogs */}
      <CancelDialog
        open={!!cancellingTask}
        title="Cancel Task"
        message={`Cancel "${cancellingTask?.name}"? It stays tracked in history.`}
        onConfirm={handleCancelTask}
        onCancel={() => setCancellingTask(null)}
      />

      <CancelDialog
        open={!!rejectingAssignmentId}
        title="Reject Assignment"
        message="Reject this assigned task? You can optionally give a reason."
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectingAssignmentId(null)}
      />
    </div>
  );
}
