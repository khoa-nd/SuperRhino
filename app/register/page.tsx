"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, UserPlus } from "lucide-react";
import { showToast } from "@/components/Toast";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isCreatingFamily, setIsCreatingFamily] = useState(true);
  const [familyName, setFamilyName] = useState("");

  const handleRegister = async () => {
    if (!displayName.trim() || !username.trim() || !password.trim()) return;
    try {
      await register({
        username: username.trim(),
        displayName: displayName.trim(),
        password,
        createFamily: isCreatingFamily,
        familyCode: isCreatingFamily ? undefined : joinCode.trim(),
        familyName: isCreatingFamily ? familyName.trim() : undefined,
      });
      showToast(`Account created! Welcome, ${displayName.trim()}!`);
      router.push("/home");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Registration failed", "error");
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
          Create Account
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          Join your family's team
        </p>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex"
              className="w-full px-4 py-3 rounded-xl bg-surface-card border border-white/10 text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alex"
              className="w-full px-4 py-3 rounded-xl bg-surface-card border border-white/10 text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none text-sm"
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
              placeholder="Min 6 characters"
              className="w-full px-4 py-3 rounded-xl bg-surface-card border border-white/10 text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none text-sm"
            />
          </div>

          <div className="flex gap-2 p-1 rounded-xl bg-surface-card">
            <button
              onClick={() => setIsCreatingFamily(true)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                isCreatingFamily
                  ? "bg-gold-500 text-navy-950"
                  : "text-text-muted"
              }`}
            >
              Create Family
            </button>
            <button
              onClick={() => setIsCreatingFamily(false)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                !isCreatingFamily
                  ? "bg-gold-500 text-navy-950"
                  : "text-text-muted"
              }`}
            >
              Join Family
            </button>
          </div>

          {isCreatingFamily ? (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Family Name (optional)
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="The [Name] Family"
                className="w-full px-4 py-3 rounded-xl bg-surface-card border border-white/10 text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none text-sm"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Family Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="RHINO-XXXX"
                className="w-full px-4 py-3 rounded-xl bg-surface-card border border-white/10 text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none text-sm font-mono tracking-wider"
              />
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={
              loading ||
              !displayName.trim() ||
              !username.trim() ||
              !password.trim()
            }
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gold-500 text-navy-950 font-bold font-display text-sm disabled:opacity-40 hover:bg-gold-400 transition-colors"
          >
            <UserPlus size={18} />
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
