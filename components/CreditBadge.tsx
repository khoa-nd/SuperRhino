interface CreditBadgeProps {
  amount: number;
  size?: "sm" | "md" | "lg";
}

export function CreditBadge({ amount, size = "md" }: CreditBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-lg px-4 py-1.5 gap-2",
  };

  const iconSize = { sm: 10, md: 14, lg: 18 };

  return (
    <div
      className={`inline-flex items-center rounded-full bg-gold-500/15 text-gold-400 font-semibold font-display ${sizeClasses[size]}`}
    >
      <svg
        width={iconSize[size]}
        height={iconSize[size]}
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M8 1l2.5 5 5.5.8-4 3.9.9 5.3L8 13.5 3.1 16l.9-5.3L0 6.8l5.5-.8z" />
      </svg>
      {amount}
    </div>
  );
}
