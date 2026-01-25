import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useSolutions } from "@/hooks/use-solutions";
import { Card } from "@/components/ui/card";
import { Activity, CheckCircle2, Clock, Code2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: solutions, isLoading } = useSolutions();

  const stats = [
    { label: "Total Solved", value: solutions?.length || 0, icon: CheckCircle2, color: "text-green-500 bg-green-500/10" },
    { label: "Recent Activity", value: "Active", icon: Activity, color: "text-blue-500 bg-blue-500/10" },
    { label: "Favorite Lang", value: "C++", icon: Code2, color: "text-purple-500 bg-purple-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName || 'Coder'}</h1>
          <p className="text-muted-foreground">Here's your progress overview.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 border-white/5 bg-secondary/20 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{isLoading ? "..." : stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Solutions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Solutions</h2>
            <Link href="/solutions" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          
          <div className="bg-secondary/20 rounded-xl border border-white/5 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading history...</div>
            ) : solutions?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No solutions yet. Start coding!</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-black/20 text-xs uppercase text-muted-foreground font-medium">
                  <tr>
                    <th className="px-6 py-4">Problem</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Language</th>
                    <th className="px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {solutions?.slice(0, 5).map((solution: any) => (
                    <tr key={solution.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium">{solution.problem?.title || `Problem #${solution.problemId}`}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                          {solution.status || 'Solved'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{solution.language}</td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {solution.createdAt && format(new Date(solution.createdAt), 'MMM d, h:mm a')}
                        </div>
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
