type IconName =
  | "check" | "arrow" | "play" | "pause" | "plus" | "search"
  | "chevron-r" | "chevron-d" | "flame" | "dot" | "x";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 16, color = "currentColor" }: IconProps) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "check":     return <svg {...common}><polyline points="5 12 10 17 19 7" /></svg>;
    case "arrow":     return <svg {...common}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></svg>;
    case "play":      return <svg {...common}><polygon points="7 5 19 12 7 19 7 5" fill={color} stroke="none" /></svg>;
    case "pause":     return <svg {...common}><rect x="7" y="5" width="3.5" height="14" fill={color} stroke="none" /><rect x="13.5" y="5" width="3.5" height="14" fill={color} stroke="none" /></svg>;
    case "plus":      return <svg {...common}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
    case "search":    return <svg {...common}><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>;
    case "chevron-r": return <svg {...common}><polyline points="9 6 15 12 9 18" /></svg>;
    case "chevron-d": return <svg {...common}><polyline points="6 9 12 15 18 9" /></svg>;
    case "flame":     return <svg {...common}><path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0 1 1 2 2 2 0-2-1-4 0-6Z" /></svg>;
    case "dot":       return <svg {...common}><circle cx="12" cy="12" r="2" fill={color} stroke="none" /></svg>;
    case "x":         return <svg {...common}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
    default:          return null;
  }
}
