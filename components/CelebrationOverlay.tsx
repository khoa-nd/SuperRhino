"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface CelebrationOverlayProps {
  show: boolean;
  message: string;
  onComplete?: () => void;
}

export function CelebrationOverlay({
  show,
  message,
  onComplete,
}: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<
    { x: number; y: number; color: string; delay: number; size: number }[]
  >([]);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const colors = ["#d4a853", "#e0be6a", "#ecd387", "#f5e6b8", "#4ade80", "#60a5fa"];
      const newParticles = Array.from({ length: 30 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        size: Math.random() * 8 + 4,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" />
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute animate-celebrate"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${p.delay}s`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: "50%",
            opacity: 0.8,
          }}
        />
      ))}
      <div className="relative flex flex-col items-center gap-4 animate-scale-in">
        <Sparkles size={48} className="text-gold-400" />
        <p className="text-xl font-bold font-display text-center text-gold-300">
          {message}
        </p>
      </div>
    </div>
  );
}
