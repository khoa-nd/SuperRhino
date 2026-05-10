"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-dvh px-6 py-12">
      <div className="flex flex-col items-center gap-8 max-w-sm w-full animate-fade-in">
        {/* Logo + Title */}
        <div className="flex flex-col items-center gap-5">
          <Image
            src="/logo-256.png"
            alt="SuperRhino"
            width={120}
            height={120}
            priority
            className="drop-shadow-lg"
          />
          <h1
            className="text-4xl font-black font-display text-text-primary tracking-[0.15em] uppercase"
            style={{ letterSpacing: "0.15em" }}
          >
            Super<span style={{ color: "#ffd23f" }}>Rhino</span>
          </h1>
          <p className="text-sm text-text-secondary text-center leading-relaxed max-w-xs">
            Track tasks, build streaks, and keep your family accountable — together.
          </p>
        </div>

        {/* Feature highlights - no border */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {[
            { emoji: "💎", label: "Earn\nCredits" },
            { emoji: "🔥", label: "Build\nStreaks" },
            { emoji: "👥", label: "Family\nTeamwork" },
          ].map(({ emoji, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-[11px] text-text-secondary text-center whitespace-pre-line leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full mt-2">
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3.5 rounded-xl bg-gold-500 text-navy-950 font-bold font-display text-sm hover:bg-gold-400 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/register")}
            className="w-full py-3.5 rounded-xl bg-surface-card text-text-secondary font-medium text-sm hover:bg-surface-hover border border-white/5 transition-colors"
          >
            Sign Up
          </button>
        </div>

        <p className="text-xs text-text-muted text-center">
          New here? Create an account to get started with your family.
        </p>
      </div>
    </div>
  );
}
