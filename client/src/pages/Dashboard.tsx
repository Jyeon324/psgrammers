import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useSolutions } from "@/hooks/use-solutions";
import { Card } from "@/components/ui/card";
import { Activity, CheckCircle2, Clock, Code2, Award, Tag } from "lucide-react";
import { format, startOfYear, eachDayOfInterval, isSameDay } from "date-fns";
import { Link } from "wouter";
import { ActivityCalendar } from "react-activity-calendar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Solution } from "@shared/schema";
import { cn } from "@/lib/utils";

const TIER_COLORS: Record<string, string> = {
  "Unrated": "#adbac7",
  "Bronze": "#ad5600",
  "Silver": "#435f7a",
  "Gold": "#ec9a00",
  "Platinum": "#27e2a4",
  "Diamond": "#00b4fc",
  "Ruby": "#ff0062"
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

export default function Dashboard() {
  const { user } = useAuth();
  const { data: solutions, isLoading } = useSolutions();

  // 1. Prepare Heatmap Data
  const calendarData = solutions ? solutions.reduce((acc: any[], sol: Solution) => {
    const date = format(new Date(sol.createdAt!), 'yyyy-MM-dd');
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.count += 1;
      existing.level = Math.min(4, Math.floor(existing.count / 2) + 1);
    } else {
      acc.push({ date, count: 1, level: 1 });
    }
    return acc;
  }, []) : [];

  // 2. Prepare Tier Stats
  const tierStats = solutions ? Object.entries(
    solutions.reduce((acc: Record<string, number>, sol: Solution) => {
      const tierGroup = getTierGroup(sol.problem?.tier || 0);
      acc[tierGroup] = (acc[tierGroup] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, fill: TIER_COLORS[name] })) : [];

  // 3. Prepare Tag Stats
  const tagStats = solutions ? (Object.entries(
    solutions.reduce((acc: Record<string, number>, sol: Solution) => {
      const tags = sol.problem?.category?.split(",") || [];
      tags.forEach((tag: string) => {
        if (tag.trim()) acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {})
  ) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value })) : [];

  const stats = [
    { label: "Total Solved", value: solutions?.length || 0, icon: CheckCircle2, color: "text-green-500 bg-green-500/10" },
    { label: "Activity Level", value: calendarData.length > 0 ? "Active" : "New", icon: Activity, color: "text-blue-500 bg-blue-500/10" },
    { label: "Top Tags", value: tagStats[0]?.name || "None", icon: Tag, color: "text-purple-500 bg-purple-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Welcome back, {user?.firstName || 'Coder'}</h1>
          <p className="text-muted-foreground">Keep up the great work! You've solved {solutions?.length || 0} problems.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 border-white/5 bg-secondary/10 backdrop-blur-sm hover:bg-secondary/20 transition-all cursor-default">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1 tracking-tight">{isLoading ? "..." : stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Heatmap Section */}
        <Card className="p-8 mb-8 border-white/5 bg-secondary/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Learning Activity</h2>
          </div>
          <div className="flex justify-center overflow-x-auto py-2">
            {!isLoading && (
              <ActivityCalendar
                data={calendarData}
                theme={{
                  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                }}
                labels={{
                  totalCount: "{{count}} problems solved in 2024",
                }}
              />
            )}
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
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#adbac7' }} />
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

        {/* Recent Solutions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Recent Solutions</h2>
            <Link href="/solutions" className="text-sm text-primary hover:underline font-semibold">View All History</Link>
          </div>

          <div className="bg-secondary/10 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading history...</div>
            ) : solutions?.length === 0 ? (
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
                  {solutions?.slice(0, 5).map((solution: any) => (
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
                        {solution.createdAt && format(new Date(solution.createdAt), 'MMM d, p')}
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
