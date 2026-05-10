"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ListTodo,
  BarChart3,
  Clock,
  Users,
} from "lucide-react";

const tabs = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/tasks", icon: ListTodo, label: "Tasks" },
  { path: "/history", icon: Clock, label: "History" },
  { path: "/stats", icon: BarChart3, label: "Stats" },
  { path: "/family", icon: Users, label: "Family" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/5 backdrop-blur-xl safe-area-bottom z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = pathname === path || pathname.startsWith(path + "/");
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 ${
                active
                  ? "text-gold-400"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
