# 🦏 SuperRhino

**Family Task Tracker** — Stay organized, build streaks, and keep your family accountable together.

Built for adults in a family. Track personal goals and household tasks, earn Credits, compete on the leaderboard, and build consistency through daily streaks.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI | React 19, TypeScript 5, Tailwind CSS v4 |
| State | Zustand 5 (persisted) |
| Icons | Lucide React |
| Fonts | Barlow (display) + Inter (body) |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| Hosting | [Vercel](https://vercel.com) |
| Auth | Custom SHA-256 password hashing |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/khoa-nd/SuperRhino.git
cd SuperRhino
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key from Supabase → Project Settings → API |

### 3. Database Setup

Run the schema SQL in your Supabase SQL Editor:

1. Go to **Supabase → SQL Editor**
2. Run `supabase/schema.sql` (creates all tables)
3. Run `supabase/migrate_v2.sql` (adds priority, due date, cancellation fields)

Or use the migration script:

```bash
# Set your DB password first
DB_PASSWORD=yourpassword node supabase/migrate.js
```

### 4. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Task Management** — Create, edit, delete, and assign tasks with categories (Home / Personal / Family / Work)
- **Priority Levels** — Important, Medium, Optional with visual badges
- **Due Dates** — Set deadlines; overdue tasks highlighted in red on the home screen
- **Credit System** — Earn Credits for completing tasks; pure motivational tracking (no spending)
- **Daily Streaks** — Build consistency with streak counters and milestone celebrations
- **Family Leaderboard** — Friendly competition ranked by Credits earned
- **Task Verification** — Optional approval flow where assigners verify completed tasks
- **Assignment System** — Any family member can assign tasks to anyone else
- **Cancel with Reason** — Cancel tasks or reject assignments with optional reason; stays tracked
- **Activity History** — Full feed with date filters (Today / Yesterday / This Week / All)
- **Personal Stats** — Credits earned, tasks completed, category breakdowns
- **PWA Support** — Install as a standalone app on iOS and Android
- **Dark Theme** — Deep navy + gold color palette by default

## Project Structure

```
SuperRhino/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (fonts, PWA meta, theme)
│   ├── page.tsx            # Landing page
│   ├── login/page.tsx      # Login
│   ├── register/page.tsx   # Register + family create/join
│   ├── (app)/              # Authenticated routes
│   │   ├── layout.tsx      # Auth guard + bottom nav
│   │   ├── home/page.tsx   # Dashboard (streaks, overdue, pending, quick tasks)
│   │   ├── tasks/page.tsx  # Task catalog (create, edit, assign, cancel)
│   │   ├── stats/page.tsx  # Leaderboard + personal stats
│   │   ├── history/page.tsx # Activity feed
│   │   └── family/page.tsx # Family code + member list
│   └── api/superrhino/     # Single action-based API endpoint
│       └── route.ts
├── components/             # React components
│   ├── TaskCard.tsx        # Task display with actions
│   ├── TaskFormDialog.tsx  # Create/edit task form
│   ├── AssignmentCard.tsx  # Pending/verified assignment
│   ├── CancelDialog.tsx    # Cancel with reason
│   ├── Leaderboard.tsx     # Family ranking
│   ├── BottomNav.tsx       # 5-tab navigation
│   └── ...
├── stores/                 # Zustand stores (persisted via localStorage)
│   ├── authStore.ts
│   ├── taskStore.ts
│   ├── creditStore.ts
│   ├── familyStore.ts
│   └── streakStore.ts
├── lib/                    # Utilities
│   ├── types.ts            # TypeScript interfaces
│   ├── api.ts              # Client-side API helper
│   ├── auth.ts             # SHA-256 hashing, ID generation
│   └── supabase.ts         # Supabase client
├── supabase/               # Database
│   ├── schema.sql          # Initial schema (7 tables)
│   └── migrate_v2.sql      # v2 enhancements (priority, due dates, cancellation)
├── public/                 # Static assets
│   ├── manifest.json       # PWA manifest
│   ├── icon-192.png        # Android PWA icon
│   ├── icon-512.png        # PWA icon (maskable)
│   ├── apple-touch-icon.png # iOS Home Screen icon
│   └── logo-*.png          # Rhino logo variants
└── img/logo/rhino.png      # Source logo (512×512)
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `families` | Family groups with join codes |
| `profiles` | User accounts (username, password_hash, family_id) |
| `tasks` | Task definitions (name, emoji, credits, priority, due_date, category) |
| `task_assignments` | Task assignments (assigner → assignee, status tracking) |
| `task_logs` | Task completion records |
| `credit_transactions` | Credit earning history |
| `streaks` | Daily streak tracking per user |

## API

Single endpoint `POST /api/superrhino` with action-based routing:

| Action | Description |
|--------|-------------|
| `login` | Authenticate user |
| `register` | Create account + family |
| `get_tasks` | Fetch tasks for family |
| `create_task` | Create a new task |
| `update_task` | Edit task details |
| `delete_task` | Permanently remove task |
| `cancel_task` | Cancel task with optional reason |
| `assign_task` | Assign task to family member |
| `get_assignments` | Fetch assignments |
| `reject_assignment` | Reject assigned task |
| `log_task` | Mark task as done (earns Credits) |
| `verify_task` | Verify completed task |
| `cancel_assignment` | Cancel an assignment |
| `get_credits` | Get credit balance |
| `get_activity` | Fetch activity feed |

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Connect Supabase integration (sets `NEXT_PUBLIC_SUPABASE_URL` automatically)
4. **Manually add** `SUPABASE_SERVICE_ROLE_KEY` in Vercel → Settings → Environment Variables
5. Deploy

## Guiding Philosophy

> *"Strength in consistency. Power in showing up every day."*
