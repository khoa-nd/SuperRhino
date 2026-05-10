"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTaskStore } from "@/stores/taskStore";
import { useFamilyStore } from "@/stores/familyStore";
import { useCreditStore } from "@/stores/creditStore";
import { useStreakStore } from "@/stores/streakStore";
import { TaskCard } from "@/components/TaskCard";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import { AssignDialog } from "@/components/AssignDialog";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CancelDialog } from "@/components/CancelDialog";
import { EmptyState } from "@/components/EmptyState";
import { showToast } from "@/components/Toast";
import { Plus } from "lucide-react";
import type { TaskCategory, TaskPriority, Task } from "@/lib/types";

export default function TasksPage() {
  const { profile, family } = useAuthStore();
  const { tasks, addTask, updateTask, deleteTask, cancelTask, assignTask } = useTaskStore();
  const members = useFamilyStore((s) => s.members);
  const logTask = useCreditStore((s) => s.logTask);
  const updateLocalStreak = useStreakStore((s) => s.updateLocalStreak);
  const getStreak = useStreakStore((s) => s.getStreak);

  const [category, setCategory] = useState<TaskCategory | "all">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [assigningTask, setAssigningTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [cancellingTask, setCancellingTask] = useState<Task | null>(null);

  if (!profile || !family) return null;

  const activeTasks = tasks.filter((t) => !t.cancelled_by);
  const cancelledTasks = tasks.filter((t) => t.cancelled_by);

  const filteredTasks = activeTasks.filter((t) => {
    if (t.created_by === profile.id || t.visibility === "shared" || t.assignee_id === profile.id) {
      return category === "all" || t.category === category;
    }
    return false;
  });

  const handleCreate = async (data: {
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
        family_id: family.id,
        created_by: profile.id,
        assignee_id: profile.id,
      });
      showToast("Task created!");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleEdit = async (data: {
    name: string; emoji: string; credits: number;
    category: TaskCategory; requires_verification: boolean;
    visibility: "private" | "shared"; due_date: string | null;
    priority: TaskPriority;
  }) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, data);
      showToast("Task updated!");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    try {
      await deleteTask(deletingTask.id);
      showToast("Task deleted!", "info");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
    setDeletingTask(null);
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

  const handleLog = async (task: Task) => {
    try {
      const credits = await logTask(task.id, profile.id);
      const currentStreak = getStreak(profile.id);
      updateLocalStreak(
        profile.id,
        currentStreak ? currentStreak.current_count + 1 : 1,
        Math.max(currentStreak?.longest_count || 0, (currentStreak?.current_count || 0) + 1)
      );
      showToast(`${task.emoji} Done! +${credits} Credits`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleAssign = async (memberId: string) => {
    if (!assigningTask) return;
    try {
      await assignTask(assigningTask.id, profile.id, memberId, assigningTask.due_date || undefined);
      showToast("Task assigned!");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
    setAssigningTask(null);
  };

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black font-display text-text-primary">Tasks</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-sm hover:bg-gold-400 transition-colors"
        >
          <Plus size={18} /> New
        </button>
      </div>

      <div className="mb-4">
        <CategoryTabs active={category} onChange={setCategory} />
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No tasks here"
          description="Create a new task or switch categories"
          action={
            <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-sm">
              Create Task
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUserId={profile.id}
              onLog={handleLog}
              onAssign={(t) => setAssigningTask(t)}
              onEdit={task.created_by === profile.id ? (t) => setEditingTask(t) : undefined}
              onDelete={task.created_by === profile.id ? (t) => setDeletingTask(t) : undefined}
              onCancel={task.created_by === profile.id ? (t) => setCancellingTask(t) : undefined}
              showActions
            />
          ))}
        </div>
      )}

      {/* Cancelled tasks section */}
      {cancelledTasks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-bold font-display text-text-muted uppercase tracking-wider mb-3">
            Cancelled Tasks
          </h2>
          <div className="flex flex-col gap-2">
            {cancelledTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUserId={profile.id}
                showActions={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {assigningTask && (
        <AssignDialog
          open={!!assigningTask}
          onClose={() => setAssigningTask(null)}
          members={members}
          taskName={assigningTask.name}
          currentUserId={profile.id}
          onAssign={handleAssign}
        />
      )}

      <TaskFormDialog open={showCreate} onClose={() => setShowCreate(false)} onSave={handleCreate} />

      {editingTask && (
        <TaskFormDialog
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleEdit}
          initial={{
            name: editingTask.name,
            emoji: editingTask.emoji,
            credits: editingTask.credits,
            category: editingTask.category,
            requires_verification: editingTask.requires_verification,
            visibility: editingTask.visibility,
            due_date: editingTask.due_date,
            priority: editingTask.priority,
          }}
          title="Edit Task"
        />
      )}

      <ConfirmDialog
        open={!!deletingTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeletingTask(null)}
      />

      <CancelDialog
        open={!!cancellingTask}
        title="Cancel Task"
        message={`Cancel "${cancellingTask?.name}"? It will still be tracked in your history.`}
        onConfirm={handleCancelTask}
        onCancel={() => setCancellingTask(null)}
      />
    </div>
  );
}
