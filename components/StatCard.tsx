import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({ icon: Icon, label, value, color = "text-gold-400" }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-card border border-white/5">
      <div className={`${color} opacity-80`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-xs text-text-muted">{label}</div>
        <div className="text-lg font-bold font-display text-text-primary">{value}</div>
      </div>
    </div>
  );
}
