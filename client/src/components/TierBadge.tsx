import { cn } from "@/lib/utils";
import { getTierInfo } from "@/lib/tier-utils";

interface TierBadgeProps {
  tier: number;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const info = getTierInfo(tier);
  const roman = ["I", "II", "III", "IV", "V"];
  const level = tier > 0 ? 5 - ((tier - 1) % 5) : 0;

  return (
    <div className={cn(
      "px-2.5 py-1 rounded-md border text-xs font-mono font-semibold flex items-center gap-1.5 w-fit",
      info.color,
      className
    )}>
      <span className="uppercase tracking-wider">{info.label}</span>
      {tier > 0 && <span className="opacity-70">{roman[level - 1]}</span>}
    </div>
  );
}
