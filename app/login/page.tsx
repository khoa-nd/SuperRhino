"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, LogIn } from "lucide-react";
import { showToast } from "@/components/Toast";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;
    try {
      await login(username.trim(), password);
      showToast("Welcome back!");
      router.push("/home");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Login failed", "error");
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-dvh px-6 py-12">
      <button
        onClick={() => router.back()}
        className="self-start mb-6 p-2 -ml-2 text-text-muted hover:text-text-primary"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="flex flex-col items-center flex-1">
        <Image src="/logo-256.png" alt="SuperRhino" width={80} height={80} priority className="drop-shadow-lg mb-2" />
        <h1 className="text-2xl font-black font-display text-text-primary mt-4 mb-1">
          Welcome Back
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          Log in to your account
        </p>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 rounded-xl bg-surface-card border border-white/10 text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl bg-surface-card border border-white/10 text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !username.trim() || !password.trim()}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gold-500 text-navy-950 font-bold font-display text-sm disabled:opacity-40 hover:bg-gold-400 transition-colors"
          >
            <LogIn size={18} />
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}
