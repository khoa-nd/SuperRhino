import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getClient() {
  return createClient(supabaseUrl, supabaseKey);
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function generateFamilyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "RHINO-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ─── Auth ──────────────────────────────────────────

async function handleLogin(body: Record<string, unknown>) {
  const { username, password } = body as { username: string; password: string };
  if (!username || !password) {
    return NextResponse.json({ success: false, error: "Username and password required" }, { status: 400 });
  }

  const db = getClient();
  const salt = `superrhino-${username.trim().toLowerCase()}-salt-2024`;
  const hash = await hashPassword(password + salt);

  const { data: profile, error } = await db
    .from("profiles")
    .select("*")
    .eq("username", username.trim().toLowerCase())
    .single();

  if (error || !profile) {
    return NextResponse.json({ success: false, error: "Invalid username or password" }, { status: 401 });
  }

  if (profile.password_hash !== hash) {
    return NextResponse.json({ success: false, error: "Invalid username or password" }, { status: 401 });
  }

  let family = null;
  if (profile.family_id) {
    const { data: fam } = await db
      .from("families")
      .select("*")
      .eq("id", profile.family_id)
      .single();
    family = fam;
  }

  return NextResponse.json({ success: true, profile, family });
}

async function handleRegister(body: Record<string, unknown>) {
  const { username, displayName, password, familyCode, familyName, createFamily } = body as {
    username: string; displayName: string; password: string;
    familyCode?: string; familyName?: string; createFamily: boolean;
  };

  if (!username || !displayName || !password) {
    return NextResponse.json({ success: false, error: "All fields required" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const db = getClient();

  const { data: existing } = await db
    .from("profiles")
    .select("id")
    .eq("username", username.trim().toLowerCase())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: false, error: "Username already taken" }, { status: 409 });
  }

  const salt = `superrhino-${username.trim().toLowerCase()}-salt-2024`;
  const hash = await hashPassword(password + salt);
  const userId = generateId();

  let family = null;
  let familyId: string | null = null;

  if (createFamily) {
    const code = generateFamilyCode();
    family = {
      id: generateId(),
      name: familyName?.trim() || `${displayName.trim()}'s Family`,
      code,
      created_by: userId,
      created_at: new Date().toISOString(),
    };
    familyId = family.id;

    const { error: famErr } = await db.from("families").insert(family);
    if (famErr) {
      return NextResponse.json({ success: false, error: "Failed to create family" }, { status: 500 });
    }
  } else {
    if (!familyCode) {
      return NextResponse.json({ success: false, error: "Family code required" }, { status: 400 });
    }

    const { data: existingFam, error: famErr } = await db
      .from("families")
      .select("*")
      .eq("code", familyCode.trim().toUpperCase())
      .single();

    if (famErr || !existingFam) {
      return NextResponse.json({ success: false, error: "Invalid family code" }, { status: 404 });
    }

    family = existingFam;
    familyId = existingFam.id;
  }

  const profile = {
    id: userId,
    username: username.trim().toLowerCase(),
    display_name: displayName.trim(),
    family_id: familyId,
    password_hash: hash,
    is_family_creator: createFamily,
    created_at: new Date().toISOString(),
  };

  const { error: profErr } = await db.from("profiles").insert(profile);
  if (profErr) {
    return NextResponse.json({ success: false, error: "Failed to create profile" }, { status: 500 });
  }

  return NextResponse.json({ success: true, profile, family });
}

// ─── Family ────────────────────────────────────────

async function handleGetFamily(body: Record<string, unknown>) {
  const { familyId } = body as { familyId: string };
  const db = getClient();

  const { data: family, error } = await db
    .from("families")
    .select("*")
    .eq("id", familyId)
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 404 });

  const { data: members } = await db
    .from("profiles")
    .select("*")
    .eq("family_id", familyId);

  return NextResponse.json({ success: true, family, members });
}

// ─── Tasks ─────────────────────────────────────────

async function handleGetTasks(body: Record<string, unknown>) {
  const { familyId } = body as { familyId: string };
  const db = getClient();

  const { data: tasks, error } = await db
    .from("tasks")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, tasks });
}

async function handleCreateTask(body: Record<string, unknown>) {
  const task = body.task as Record<string, unknown>;
  const db = getClient();

  const newTask = {
    id: generateId(),
    name: task.name,
    emoji: task.emoji || "💪",
    credits: task.credits || 3,
    category: task.category || "home",
    requires_verification: task.requires_verification || false,
    visibility: task.visibility || "private",
    color: task.color || "#4a9eff",
    family_id: task.family_id,
    created_by: task.created_by,
    assignee_id: task.assignee_id || task.created_by,
    due_date: task.due_date || null,
    priority: task.priority || "medium",
    cancel_reason: null,
    cancelled_by: null,
    cancelled_at: null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await db.from("tasks").insert(newTask).select().single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, task: data });
}

async function handleUpdateTask(body: Record<string, unknown>) {
  const { id, updates } = body as { id: string; updates: Record<string, unknown> };
  const db = getClient();

  const { data, error } = await db
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, task: data });
}

async function handleDeleteTask(body: Record<string, unknown>) {
  const { id } = body as { id: string };
  const db = getClient();

  const { error } = await db.from("tasks").delete().eq("id", id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

async function handleCancelTask(body: Record<string, unknown>) {
  const { taskId, userId, reason } = body as { taskId: string; userId: string; reason?: string };
  const db = getClient();

  const now = new Date().toISOString();

  const { data, error } = await db
    .from("tasks")
    .update({
      cancel_reason: reason || null,
      cancelled_by: userId,
      cancelled_at: now,
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, task: data });
}

// ─── Assignments ───────────────────────────────────

async function handleAssignTask(body: Record<string, unknown>) {
  const { taskId, assignerId, assigneeId, dueDate } = body as {
    taskId: string; assignerId: string; assigneeId: string; dueDate?: string;
  };
  const db = getClient();

  // Update task's assignee
  await db.from("tasks").update({ assignee_id: assigneeId, due_date: dueDate || null }).eq("id", taskId);

  const assignment = {
    id: generateId(),
    task_id: taskId,
    assigner_id: assignerId,
    assignee_id: assigneeId,
    status: "pending",
    due_date: dueDate || null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await db.from("task_assignments").insert(assignment).select().single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, assignment: data });
}

async function handleGetAssignments(body: Record<string, unknown>) {
  const { userId, familyId } = body as { userId: string; familyId: string };
  const db = getClient();

  const { data: assignments, error } = await db
    .from("task_assignments")
    .select("*")
    .or(`assignee_id.eq.${userId},assigner_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, assignments });
}

async function handleRejectAssignment(body: Record<string, unknown>) {
  const { assignmentId, userId, reason } = body as {
    assignmentId: string; userId: string; reason?: string;
  };
  const db = getClient();

  const { error } = await db
    .from("task_assignments")
    .update({
      status: "cancelled",
      cancel_reason: reason || null,
      cancelled_by: userId,
    })
    .eq("id", assignmentId);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// ─── Task Logging & Credits ────────────────────────

async function handleLogTask(body: Record<string, unknown>) {
  const { taskId, userId, assignmentId } = body as {
    taskId: string; userId: string; assignmentId?: string;
  };
  const db = getClient();

  const { data: task, error: taskErr } = await db
    .from("tasks")
    .select("credits, name")
    .eq("id", taskId)
    .single();

  if (taskErr || !task) {
    return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
  }

  const logId = generateId();
  const now = new Date().toISOString();

  const taskLog = {
    id: logId,
    task_id: taskId,
    user_id: userId,
    assigner_id: null,
    status: "completed",
    created_at: now,
  };

  const { error: logErr } = await db.from("task_logs").insert(taskLog);
  if (logErr) return NextResponse.json({ success: false, error: logErr.message }, { status: 500 });

  if (assignmentId) {
    await db.from("task_assignments").update({ status: "completed" }).eq("id", assignmentId);
  }

  const transaction = {
    id: generateId(),
    user_id: userId,
    amount: task.credits,
    task_log_id: logId,
    label: task.name,
    created_at: now,
  };

  const { error: txErr } = await db.from("credit_transactions").insert(transaction);
  if (txErr) return NextResponse.json({ success: false, error: txErr.message }, { status: 500 });

  // Update streak
  const today = new Date().toISOString().split("T")[0];
  const { data: streak } = await db.from("streaks").select("*").eq("user_id", userId).maybeSingle();

  if (streak) {
    const daysSince = Math.floor(
      (new Date(today).getTime() - new Date(streak.last_activity_date).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const newCount = daysSince === 1 ? streak.current_count + 1 : 1;
    await db
      .from("streaks")
      .update({
        current_count: newCount,
        longest_count: Math.max(streak.longest_count, newCount),
        last_activity_date: today,
      })
      .eq("user_id", userId);
  } else {
    await db.from("streaks").insert({
      id: generateId(),
      user_id: userId,
      streak_type: "daily",
      current_count: 1,
      longest_count: 1,
      last_activity_date: today,
      freeze_used: 0,
    });
  }

  return NextResponse.json({ success: true, credits: task.credits, taskLog, transaction });
}

async function handleVerifyTask(body: Record<string, unknown>) {
  const { assignmentId, assignerId } = body as { assignmentId: string; assignerId: string };
  const db = getClient();

  const { data: assignment, error: asgnErr } = await db
    .from("task_assignments")
    .select("*")
    .eq("id", assignmentId)
    .single();

  if (asgnErr || !assignment) {
    return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
  }

  if (assignment.assigner_id !== assignerId) {
    return NextResponse.json({ success: false, error: "Only the assigner can verify" }, { status: 403 });
  }

  if (assignment.status !== "completed") {
    return NextResponse.json({ success: false, error: "Task not completed yet" }, { status: 400 });
  }

  await db.from("task_assignments").update({ status: "verified" }).eq("id", assignmentId);

  return NextResponse.json({ success: true });
}

async function handleCancelAssignment(body: Record<string, unknown>) {
  const { assignmentId, userId, reason } = body as {
    assignmentId: string; userId: string; reason?: string;
  };
  const db = getClient();

  await db
    .from("task_assignments")
    .update({
      status: "cancelled",
      cancel_reason: reason || null,
      cancelled_by: userId,
    })
    .eq("id", assignmentId);

  return NextResponse.json({ success: true });
}

// ─── Credits & Activity ────────────────────────────

async function handleGetCredits(body: Record<string, unknown>) {
  const { userId } = body as { userId: string };
  const db = getClient();

  const { data: transactions, error } = await db
    .from("credit_transactions")
    .select("amount")
    .eq("user_id", userId);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const balance = (transactions || []).reduce((sum, t) => sum + t.amount, 0);
  return NextResponse.json({ success: true, balance, transactions: transactions || [] });
}

async function handleGetActivity(body: Record<string, unknown>) {
  const { userId, familyId } = body as { userId: string; familyId: string };
  const db = getClient();

  const { data: logs } = await db
    .from("task_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: transactions } = await db
    .from("credit_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ success: true, taskLogs: logs || [], transactions: transactions || [] });
}

// ─── Main Handler ──────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body as { action: string };

    switch (action) {
      case "login": return handleLogin(body);
      case "register": return handleRegister(body);
      case "get_family": return handleGetFamily(body);
      case "get_tasks": return handleGetTasks(body);
      case "create_task": return handleCreateTask(body);
      case "update_task": return handleUpdateTask(body);
      case "delete_task": return handleDeleteTask(body);
      case "cancel_task": return handleCancelTask(body);
      case "assign_task": return handleAssignTask(body);
      case "get_assignments": return handleGetAssignments(body);
      case "reject_assignment": return handleRejectAssignment(body);
      case "log_task": return handleLogTask(body);
      case "verify_task": return handleVerifyTask(body);
      case "cancel_assignment": return handleCancelAssignment(body);
      case "get_credits": return handleGetCredits(body);
      case "get_activity": return handleGetActivity(body);
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
