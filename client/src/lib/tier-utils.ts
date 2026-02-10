export interface TierInfo {
  label: string;
  color: string;
}

export function getTierInfo(tier: number): TierInfo {
  if (tier === 0) return { label: "Unrated", color: "text-gray-400 border-gray-400/30 bg-gray-400/10" };
  if (tier <= 5) return { label: "Bronze", color: "text-orange-400 border-orange-400/30 bg-orange-400/10" };
  if (tier <= 10) return { label: "Silver", color: "text-slate-300 border-slate-300/30 bg-slate-300/10" };
  if (tier <= 15) return { label: "Gold", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" };
  if (tier <= 20) return { label: "Platinum", color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10" };
  if (tier <= 25) return { label: "Diamond", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" };
  return { label: "Ruby", color: "text-pink-500 border-pink-500/30 bg-pink-500/10" };
}

export function getTierGroup(tier: number): string {
  return getTierInfo(tier).label;
}

export const TIER_COLORS: Record<string, string> = {
  "Unrated": "#adbac7",
  "Bronze": "#ad5600",
  "Silver": "#435f7a",
  "Gold": "#ec9a00",
  "Platinum": "#27e2a4",
  "Diamond": "#00b4fc",
  "Ruby": "#ff0062",
};
