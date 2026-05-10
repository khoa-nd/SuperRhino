import { Flame } from "lucide-react";

interface StreakCounterProps {
  current: number;
  longest: number;
}

export function StreakCounter({ current, longest }: StreakCounterProps) {
  const getFireClass = () => {
    if (current >= 30) return "text-gold-400";
    if (current >= 14) return "text-orange-400";
    if (current >= 7) return "text-amber-400";
    return "text-text-muted";
  };

  return (
    <div className="flex items-center gap-1.5">
      <Flame
        className={getFireClass()}
        size={22}
        fill={current > 0 ? "currentColor" : "none"}
      />
      <span className="text-lg font-bold font-display text-text-primary">
        {current}
      </span>
      {longest > 0 && current < longest && (
        <span className="text-xs text-text-muted">/ {longest}</span>
      )}
    </div>
  );
}
