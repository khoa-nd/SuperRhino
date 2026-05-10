import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, TaskAssignment, TaskCategory } from "@/lib/types";
import {
  apiGetTasks, apiCreateTask, apiUpdateTask, apiDeleteTask, apiCancelTask,
  apiAssignTask, apiGetAssignments, apiCancelAssignment, apiRejectAssignment,
} from "@/lib/api";

interface TaskState {
  tasks: Task[];
  assignments: TaskAssignment[];
  loading: boolean;

  fetchTasks: (familyId: string) => Promise<void>;
  fetchAssignments: (userId: string, familyId: string) => Promise<void>;
  addTask: (taskData: Record<string, unknown>) => Promise<Task>;
  updateTask: (id: string, updates: Record<string, unknown>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  cancelTask: (taskId: string, userId: string, reason?: string) => Promise<void>;
  assignTask: (taskId: string, assignerId: string, assigneeId: string, dueDate?: string) => Promise<TaskAssignment>;
  updateAssignmentStatus: (id: string, status: TaskAssignment["status"]) => void;
  cancelAssignment: (id: string, userId: string, reason?: string) => Promise<void>;
  rejectAssignment: (id: string, userId: string, reason?: string) => Promise<void>;

  getTasksByCategory: (category: TaskCategory | "all") => Task[];
  getTasksByCreator: (userId: string) => Task[];
  getSharedTasks: () => Task[];
  getAssignmentsForUser: (userId: string) => TaskAssignment[];
  getPendingAssignments: (userId: string) => TaskAssignment[];
  getOverdueTasks: (userId: string) => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      assignments: [],
      loading: false,

      fetchTasks: async (familyId) => {
        try {
          const data = await apiGetTasks(familyId);
          set({ tasks: data.tasks });
        } catch { /* ignore */ }
      },

      fetchAssignments: async (userId, familyId) => {
        try {
          const data = await apiGetAssignments(userId, familyId);
          set({ assignments: data.assignments });
        } catch { /* ignore */ }
      },

      addTask: async (taskData) => {
        const data = await apiCreateTask(taskData);
        set((s) => ({ tasks: [...s.tasks, data.task] }));
        return data.task;
      },

      updateTask: async (id, updates) => {
        const data = await apiUpdateTask(id, updates);
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? data.task : t)),
        }));
      },

      deleteTask: async (id) => {
        await apiDeleteTask(id);
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      },

      cancelTask: async (taskId, userId, reason) => {
        const data = await apiCancelTask(taskId, userId, reason);
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? data.task : t)),
        }));
      },

      assignTask: async (taskId, assignerId, assigneeId, dueDate) => {
        const data = await apiAssignTask(taskId, assignerId, assigneeId, dueDate);
        set((s) => ({
          assignments: [...s.assignments, data.assignment],
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, assignee_id: assigneeId, due_date: dueDate || t.due_date } : t
          ),
        }));
        return data.assignment;
      },

      updateAssignmentStatus: (id, status) =>
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
        })),

      cancelAssignment: async (id, userId, reason) => {
        await apiCancelAssignment(id, userId, reason);
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === id ? { ...a, status: "cancelled" as const } : a
          ),
        }));
      },

      rejectAssignment: async (id, userId, reason) => {
        await apiRejectAssignment(id, userId, reason);
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === id ? { ...a, status: "cancelled" as const } : a
          ),
        }));
      },

      getTasksByCategory: (category) => {
        const { tasks } = get();
        if (category === "all") return tasks.filter((t) => !t.cancelled_by);
        return tasks.filter((t) => t.category === category && !t.cancelled_by);
      },

      getTasksByCreator: (userId) => {
        return get().tasks.filter((t) => t.created_by === userId);
      },

      getSharedTasks: () => {
        return get().tasks.filter((t) => t.visibility === "shared" && !t.cancelled_by);
      },

      getAssignmentsForUser: (userId) => {
        return get().assignments.filter((a) => a.assignee_id === userId);
      },

      getPendingAssignments: (userId) => {
        return get()
          .assignments
          .filter((a) => a.assignee_id === userId && a.status === "pending")
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      },

      getOverdueTasks: (userId) => {
        const today = new Date().toISOString().split("T")[0];
        return get()
          .tasks
          .filter((t) => {
            if (t.cancelled_by) return false;
            if (t.assignee_id !== userId) return false;
            if (!t.due_date) return false;
            if (t.due_date >= today) return false;
            // Check if already completed
            const hasCompletedLog = false; // We'd need logs access, simplified
            return true;
          });
      },
    }),
    { name: "superrhino-tasks" }
  )
);
