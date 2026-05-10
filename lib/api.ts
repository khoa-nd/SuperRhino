import type { Profile, Family, Task, TaskAssignment, TaskLog, CreditTransaction } from "./types";

const BASE = "/api/superrhino";

async function call(action: string, body: Record<string, unknown> = {}) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Request failed");
  return data;
}

// Auth
export async function apiLogin(username: string, password: string) {
  return call("login", { username, password }) as Promise<{
    success: true; profile: Profile; family: Family | null;
  }>;
}

export async function apiRegister(params: {
  username: string; displayName: string; password: string;
  createFamily: boolean; familyCode?: string; familyName?: string;
}) {
  return call("register", params) as Promise<{
    success: true; profile: Profile; family: Family | null;
  }>;
}

// Family
export async function apiGetFamily(familyId: string) {
  return call("get_family", { familyId }) as Promise<{
    success: true; family: Family; members: Profile[];
  }>;
}

// Tasks
export async function apiGetTasks(familyId: string) {
  return call("get_tasks", { familyId }) as Promise<{ success: true; tasks: Task[] }>;
}

export async function apiCreateTask(task: Record<string, unknown>) {
  return call("create_task", { task }) as Promise<{ success: true; task: Task }>;
}

export async function apiUpdateTask(id: string, updates: Record<string, unknown>) {
  return call("update_task", { id, updates }) as Promise<{ success: true; task: Task }>;
}

export async function apiDeleteTask(id: string) {
  return call("delete_task", { id }) as Promise<{ success: true }>;
}

export async function apiCancelTask(taskId: string, userId: string, reason?: string) {
  return call("cancel_task", { taskId, userId, reason }) as Promise<{ success: true; task: Task }>;
}

// Assignments
export async function apiAssignTask(taskId: string, assignerId: string, assigneeId: string, dueDate?: string) {
  return call("assign_task", { taskId, assignerId, assigneeId, dueDate }) as Promise<{
    success: true; assignment: TaskAssignment;
  }>;
}

export async function apiGetAssignments(userId: string, familyId: string) {
  return call("get_assignments", { userId, familyId }) as Promise<{
    success: true; assignments: TaskAssignment[];
  }>;
}

export async function apiRejectAssignment(assignmentId: string, userId: string, reason?: string) {
  return call("reject_assignment", { assignmentId, userId, reason }) as Promise<{ success: true }>;
}

export async function apiLogTask(taskId: string, userId: string, assignmentId?: string) {
  return call("log_task", { taskId, userId, assignmentId }) as Promise<{
    success: true; credits: number; taskLog: TaskLog; transaction: CreditTransaction;
  }>;
}

export async function apiVerifyTask(assignmentId: string, assignerId: string) {
  return call("verify_task", { assignmentId, assignerId }) as Promise<{ success: true }>;
}

export async function apiCancelAssignment(assignmentId: string, userId: string, reason?: string) {
  return call("cancel_assignment", { assignmentId, userId, reason }) as Promise<{ success: true }>;
}

// Credits & Activity
export async function apiGetCredits(userId: string) {
  return call("get_credits", { userId }) as Promise<{
    success: true; balance: number; transactions: CreditTransaction[];
  }>;
}

export async function apiGetActivity(userId: string, familyId: string) {
  return call("get_activity", { userId, familyId }) as Promise<{
    success: true; taskLogs: TaskLog[]; transactions: CreditTransaction[];
  }>;
}
