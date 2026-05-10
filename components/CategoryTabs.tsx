import type { TaskCategory } from "@/lib/types";
import { CATEGORY_CONFIG, TASK_CATEGORIES } from "@/lib/types";

interface CategoryTabsProps {
  active: TaskCategory | "all";
  onChange: (category: TaskCategory | "all") => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  const items: { key: TaskCategory | "all"; label: string; emoji: string }[] = [
    { key: "all", label: "All", emoji: "📋" },
    ...TASK_CATEGORIES.map((cat) => ({
      key: cat,
      label: CATEGORY_CONFIG[cat].label,
      emoji: CATEGORY_CONFIG[cat].emoji,
    })),
  ];

  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
      {items.map(({ key, label, emoji }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            active === key
              ? "bg-gold-500 text-navy-950"
              : "bg-surface-card text-text-secondary hover:bg-surface-hover"
          }`}
        >
          <span className="text-xs">{emoji}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
