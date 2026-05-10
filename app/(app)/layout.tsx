"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { ToastContainer } from "@/components/Toast";
import { useAuthStore } from "@/stores/authStore";
import { useTaskStore } from "@/stores/taskStore";
import { useFamilyStore } from "@/stores/familyStore";
import { useCreditStore } from "@/stores/creditStore";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, profile, family } = useAuthStore();
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const fetchAssignments = useTaskStore((s) => s.fetchAssignments);
  const fetchMembers = useFamilyStore((s) => s.fetchMembers);
  const fetchCredits = useCreditStore((s) => s.fetchCredits);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && profile && family) {
      fetchTasks(family.id);
      fetchAssignments(profile.id, family.id);
      fetchMembers(family.id);
      fetchCredits(profile.id);
    }
  }, [isLoggedIn, profile?.id, family?.id]);

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  const showNav =
    pathname === "/home" ||
    pathname === "/tasks" ||
    pathname === "/history" ||
    pathname === "/stats" ||
    pathname === "/family";

  return (
    <div className="flex flex-col min-h-dvh">
      <main className={`flex-1 ${showNav ? "pb-20" : ""}`}>{children}</main>
      {showNav && <BottomNav />}
      <ToastContainer />
    </div>
  );
}
