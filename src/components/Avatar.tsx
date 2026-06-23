interface AvatarProps {
  name?: string;
  size?: number;
}

export function Avatar({ name = "U", size = 28 }: AvatarProps) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg, #2C303A, #1C1F26)",
        color: "var(--text-1)", display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: Math.round(size * 0.38), fontWeight: 600, letterSpacing: "0.02em",
        border: "1px solid var(--border)", flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
