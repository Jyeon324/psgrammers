import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: number;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const getTierInfo = (t: number) => {
    if (t === 0) return { label: "Unrated", color: "text-gray-400 border-gray-400/30 bg-gray-400/10" };
    if (t <= 5) return { label: "Bronze", color: "text-orange-400 border-orange-400/30 bg-orange-400/10" };
    if (t <= 10) return { label: "Silver", color: "text-slate-300 border-slate-300/30 bg-slate-300/10" };
    if (t <= 15) return { label: "Gold", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" };
    if (t <= 20) return { label: "Platinum", color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10" };
    if (t <= 25) return { label: "Diamond", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" };
    return { label: "Ruby", color: "text-pink-500 border-pink-500/30 bg-pink-500/10" };
  };

  const info = getTierInfo(tier);
  const roman = ["I", "II", "III", "IV", "V"];
  // Calculate level within tier (5 to 1)
  const level = tier > 0 ? 5 - ((tier - 1) % 5) : ""; 

  return (
    <div className={cn(
      "px-2.5 py-1 rounded-md border text-xs font-mono font-semibold flex items-center gap-1.5 w-fit",
      info.color,
      className
    )}>
      <span className="uppercase tracking-wider">{info.label}</span>
      {tier > 0 && <span className="opacity-70">{roman[level as any - 1]}</span>}
    </div>
  );
}
