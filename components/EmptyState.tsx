import { CategoryTabs } from "./CategoryTabs";
import type { TaskCategory } from "@/lib/types";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = "📋",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-5xl mb-4 opacity-60">{icon}</span>
      <h3 className="text-lg font-semibold font-display text-text-primary mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-text-muted max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
