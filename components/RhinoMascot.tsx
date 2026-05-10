type Mood = "neutral" | "happy" | "motivated" | "celebrating";

interface RhinoMascotProps {
  mood?: Mood;
  size?: number;
  className?: string;
}

export function RhinoMascot({
  mood = "neutral",
  size = 120,
  className = "",
}: RhinoMascotProps) {
  const moodColors: Record<Mood, { body: string; horn: string; eye: string }> =
    {
      neutral: { body: "#8899b4", horn: "#d4a853", eye: "#0a1628" },
      happy: { body: "#a0b4d0", horn: "#e0be6a", eye: "#0d1f3c" },
      motivated: { body: "#7ba0d0", horn: "#ecd387", eye: "#0a1628" },
      celebrating: { body: "#6ba0e0", horn: "#f5c842", eye: "#0a1628" },
    };

  const colors = moodColors[mood];
  const scale = size / 120;
  const hornGlow =
    mood === "celebrating" ? { filter: "drop-shadow(0 0 6px #f5c842)" } : {};

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
    >
      {/* Body */}
      <ellipse cx="60" cy="80" rx="38" ry="30" fill={colors.body} />
      {/* Legs */}
      <rect x="32" y="100" width="14" height="18" rx="6" fill={colors.body} />
      <rect x="58" y="100" width="14" height="18" rx="6" fill={colors.body} />
      <rect x="74" y="100" width="14" height="18" rx="6" fill={colors.body} />
      {/* Head */}
      <ellipse cx="60" cy="52" rx="28" ry="24" fill={colors.body} />
      {/* Horn - large */}
      <polygon
        points="48,30 54,30 53,10 49,10"
        fill={colors.horn}
        style={hornGlow}
      />
      {/* Horn - small */}
      <polygon
        points="66,34 72,34 70,18 68,18"
        fill={colors.horn}
        style={hornGlow}
      />
      {/* Ears */}
      <ellipse cx="35" cy="40" rx="8" ry="10" fill={colors.body} />
      <ellipse cx="85" cy="40" rx="8" ry="10" fill={colors.body} />
      {/* Eyes */}
      <circle cx="50" cy="50" r="4" fill={colors.eye} />
      <circle cx="70" cy="50" r="4" fill={colors.eye} />
      {/* Eye highlights */}
      <circle cx="51.5" cy="48.5" r="1.5" fill="white" />
      <circle cx="71.5" cy="48.5" r="1.5" fill="white" />
      {/* Snout */}
      <ellipse cx="60" cy="60" rx="12" ry="8" fill={colors.body} />
      {/* Nostrils */}
      <circle cx="56" cy="60" r="1.5" fill={colors.eye} />
      <circle cx="64" cy="60" r="1.5" fill={colors.eye} />
      {/* Mouth */}
      {mood === "happy" && (
        <path
          d="M54 65 Q60 72 66 65"
          stroke={colors.eye}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {mood === "celebrating" && (
        <path
          d="M53 64 Q60 74 67 64"
          stroke={colors.eye}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {mood === "motivated" && (
        <path
          d="M53 64 L60 70 L67 64"
          stroke={colors.eye}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {mood === "neutral" && (
        <line
          x1="54"
          y1="64"
          x2="66"
          y2="64"
          stroke={colors.eye}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
