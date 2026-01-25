import { Sidebar } from "@/components/Sidebar";
import { useSolutions } from "@/hooks/use-solutions";
import { Loader2, Code2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { TierBadge } from "@/components/TierBadge";

export default function Solutions() {
  const { data: solutions, isLoading } = useSolutions();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-8">Solution History</h1>

        {isLoading ? (
          <div className="flex justify-center p-12">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {solutions?.map((solution: any) => (
              <div 
                key={solution.id}
                className="bg-card p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-primary text-sm font-bold">#{solution.problem?.bojId}</span>
                    <h3 className="font-bold">{solution.problem?.title}</h3>
                    <TierBadge tier={solution.problem?.tier || 0} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                       <Code2 className="w-3 h-3" /> {solution.language}
                    </div>
                    <div className="flex items-center gap-1.5">
                       <Calendar className="w-3 h-3" /> 
                       {solution.createdAt && format(new Date(solution.createdAt), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-sm font-medium">
                    {solution.status || 'Solved'}
                  </div>
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full opacity-50" />
                  </div>
                </div>
              </div>
            ))}
             {solutions?.length === 0 && (
              <div className="text-center py-20 text-muted-foreground bg-secondary/10 rounded-xl border-dashed border border-white/10">
                No solutions yet.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
