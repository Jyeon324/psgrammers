import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useSolutions } from "@/hooks/use-solutions";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, Activity, Tag, Clock, Award } from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval, isSameDay } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// Custom Minimal Heatmap to avoid library crashes
function CustomHeatmap({ data }: { data: any[] }) {
  const today = startOfDay(new Date());
  const startDate = subDays(today, 180); // Last 6 months

  const days = eachDayOfInterval({ start: startDate, end: today });

  return (
    <div className="flex flex-wrap gap-1 justify-center max-w-full overflow-hidden p-1">
      {days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const entry = data.find(d => d.date === dateStr);
        const count = entry?.count || 0;

        // GitHub-like color scaling
        let color = "bg-[#161b22]"; // Empty
        if (count >= 5) color = "bg-[#39d353]";
        else if (count >= 3) color = "bg-[#26a641]";
        else if (count >= 2) color = "bg-[#006d32]";
        else if (count >= 1) color = "bg-[#0e4429]";

        return (
          <div
            key={dateStr}
            className={cn("w-3 h-3 rounded-[2px] transition-colors hover:ring-1 hover:ring-white/20", color)}
            title={`${dateStr}: ${count} problems`}
          />
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: solutions, isLoading } = useSolutions();

  let calendarData: any[] = [];
  let tierStats: any[] = [];
  let tagStats: any[] = [];

  const TIER_COLORS: Record<string, string> = {
    "Unrated": "#adbac7", "Bronze": "#ad5600", "Silver": "#435f7a",
    "Gold": "#ec9a00", "Platinum": "#27e2a4", "Diamond": "#00b4fc", "Ruby": "#ff0062"
  };

  const getTierGroup = (level: number) => {
    if (level === 0) return "Unrated";
    if (level <= 5) return "Bronze";
    if (level <= 10) return "Silver";
    if (level <= 15) return "Gold";
    if (level <= 20) return "Platinum";
    if (level <= 25) return "Diamond";
    return "Ruby";
  };

  if (solutions) {
    // 1. Prepare Heatmap Data
    calendarData = solutions.reduce((acc: any[], sol: any) => {
      if (!sol.createdAt) return acc;
      try {
        const d = new Date(sol.createdAt);
        if (isNaN(d.getTime())) return acc;
        const date = format(d, 'yyyy-MM-dd');
        const existing = acc.find(d => d.date === date);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ date, count: 1 });
        }
      } catch (e) { }
      return acc;
    }, []);

    // 2. Prepare Tier Stats
    tierStats = Object.entries(
      solutions.reduce((acc: Record<string, number>, sol: any) => {
        const tierGroup = getTierGroup(sol.problem?.tier || 0);
        acc[tierGroup] = (acc[tierGroup] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value, fill: TIER_COLORS[name] || "#ccc" }));

    // 3. Prepare Tag Stats
    tagStats = (Object.entries(
      solutions.reduce((acc: Record<string, number>, sol: any) => {
        const tags = sol.problem?.category?.split(",") || [];
        tags.forEach((tag: string) => {
          const trimmed = tag.trim();
          if (trimmed) acc[trimmed] = (acc[trimmed] || 0) + 1;
        });
        return acc;
      }, {})
    ) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
  }

  const topStats = [
    { label: "Total Solved", value: solutions?.length || 0, icon: CheckCircle2, color: "text-green-500 bg-green-500/10" },
    { label: "Activity Days", value: calendarData.length, icon: Activity, color: "text-blue-500 bg-blue-500/10" },
    { label: "Top Category", value: tagStats[0]?.name || "None", icon: Tag, color: "text-purple-500 bg-purple-500/10" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Welcome back, {user?.firstName || 'Coder'}</h1>
          <p className="text-muted-foreground">You've successfully solved {solutions?.length || 0} problems.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {topStats.map((stat, i) => (
            <Card key={i} className="p-6 border-white/5 bg-secondary/10 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Heatmap Section */}
        <Card className="p-8 mb-8 border-white/5 bg-secondary/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Learning Activity (Last 6 Months)</h2>
          </div>
          <div className="flex justify-center overflow-x-auto py-2">
            <CustomHeatmap data={calendarData} />
          </div>
        </Card>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 border-white/5 bg-secondary/10 h-[350px]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Tier Distribution</h3>
            <div className="h-full">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={tierStats}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tierStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-[10px]">
                {tierStats.map(tier => (
                  <div key={tier.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.fill }} />
                    <span className="text-muted-foreground uppercase">{tier.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 border-white/5 bg-secondary/10 h-[350px]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Problem Categories</h3>
            <div className="h-full">
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={tagStats} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#adbac7' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Solutions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Recent Solutions</h2>
            <Link href="/solutions" className="text-sm text-primary hover:underline font-semibold">View All History</Link>
          </div>

          <div className="bg-secondary/10 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
            {!solutions || solutions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground italic">No solutions yet. Time to conquer some problems!</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-black/40 text-[10px] uppercase text-muted-foreground font-bold tracking-tighter">
                  <tr>
                    <th className="px-6 py-4">Problem</th>
                    <th className="px-6 py-4">Tier</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {solutions.slice(0, 5).map((solution: any) => (
                    <tr key={solution.id} className="hover:bg-white/5 transition-colors text-sm">
                      <td className="px-6 py-4 font-medium max-w-[200px] truncate">
                        {solution.problem?.title || `Problem #${solution.problemId}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold" style={{ color: TIER_COLORS[getTierGroup(solution.problem?.tier || 0)] }}>
                          <Award className="w-3.5 h-3.5" />
                          <span className="text-[11px] uppercase tracking-tighter">{getTierGroup(solution.problem?.tier || 0)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
                          solution.status === 'solved' ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                        )}>
                          {solution.status || 'Solved'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs text-right opacity-70">
                        {(() => {
                          if (!solution.createdAt) return "";
                          try {
                            return format(new Date(solution.createdAt), 'MMM d, p');
                          } catch (e) { return ""; }
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
