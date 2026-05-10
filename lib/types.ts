export interface Family {
  id: string;
  name: string;
  code: string;
  created_by: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  family_id: string | null;
  password_hash: string;
  is_family_creator: boolean;
  created_at: string;
}

export type TaskPriority = "important" | "medium" | "optional";

export interface Task {
  id: string;
  name: string;
  emoji: string;
  credits: number;
  category: "home" | "personal" | "family" | "work";
  requires_verification: boolean;
  visibility: "private" | "shared";
  color: string;
  family_id: string;
  created_by: string;
  assignee_id: string;
  due_date: string | null;
  priority: TaskPriority;
  cancel_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  assigner_id: string;
  assignee_id: string;
  status: "pending" | "completed" | "verified" | "cancelled";
  due_date: string | null;
  cancel_reason: string | null;
  cancelled_by: string | null;
  created_at: string;
}

export interface TaskLog {
  id: string;
  task_id: string;
  user_id: string;
  assigner_id: string | null;
  status: "completed" | "verified";
  created_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  task_log_id: string;
  label: string;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  streak_type: "daily";
  current_count: number;
  longest_count: number;
  last_activity_date: string;
  freeze_used: number;
}

export interface AppUser {
  profile: Profile;
  family: Family | null;
}

export type TaskCategory = "home" | "personal" | "family" | "work";

export const CATEGORY_CONFIG: Record<
  TaskCategory,
  { label: string; emoji: string }
> = {
  home: { label: "Home", emoji: "🏠" },
  personal: { label: "Personal", emoji: "🎯" },
  family: { label: "Family", emoji: "👨‍👩‍👧‍👦" },
  work: { label: "Work", emoji: "💼" },
};

export const TASK_CATEGORIES: TaskCategory[] = [
  "home",
  "personal",
  "family",
  "work",
];

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; bg: string }
> = {
  important: { label: "Important", color: "#f87171", bg: "bg-red-500/15 text-red-400" },
  medium: { label: "Medium", color: "#fbbf24", bg: "bg-amber-500/15 text-amber-400" },
  optional: { label: "Optional", color: "#8899b4", bg: "bg-white/5 text-text-muted" },
};

export const TASK_PRIORITIES: TaskPriority[] = ["important", "medium", "optional"];
