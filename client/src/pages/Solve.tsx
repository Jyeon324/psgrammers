import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useProblem } from "@/hooks/use-problems";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { IDE } from "@/components/IDE";
import { TierBadge } from "@/components/TierBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function Solve() {
  const { id } = useParams();
  const { data: problem, isLoading, error } = useProblem(Number(id));

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-mono animate-pulse">Initializing Environment...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground gap-4">
        <h1 className="text-2xl font-bold">Problem Not Found</h1>
        <Link href="/problems"><Button>Go Back</Button></Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background text-foreground overflow-hidden flex flex-col">
      {/* Top Bar */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-secondary/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/problems">
            <Button variant="ghost" size="icon" className="hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <h1 className="font-bold text-lg truncate max-w-md">{problem.title}</h1>
          <TierBadge tier={problem.tier || 0} />
        </div>
        
        <div className="flex items-center gap-2">
           <a 
            href={`https://www.acmicpc.net/problem/${problem.bojId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mr-2"
          >
            View on BOJ <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          
          {/* Left: Problem Description */}
          <ResizablePanel defaultSize={40} minSize={20} className="bg-background">
            <div className="h-full overflow-y-auto p-8 custom-scrollbar">
              <div className="prose prose-invert max-w-none prose-headings:font-bold prose-p:text-muted-foreground prose-code:text-primary prose-pre:bg-secondary/50">
                <div className="flex items-center gap-2 mb-6">
                  <span className="font-mono text-sm text-muted-foreground">ID: {problem.bojId}</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">{problem.category || 'Algorithm'}</span>
                </div>
                
                {/* 
                  Ideally, we'd render HTML content here. 
                  Since we don't have the full body content from the schema for simplicity,
                  I'll place a placeholder. In a real app, `problem.content` would be here.
                */}
                <h3>Description</h3>
                <p>
                  This is a practice environment for problem <strong>{problem.title}</strong> (BOJ {problem.bojId}).
                </p>
                <p>
                  Since we are syncing metadata only in this demo, please refer to the official problem statement on Baekjoon Online Judge for the full details, input/output specifications, and examples.
                </p>
                
                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="text-blue-400 m-0 mb-2">Sync Note</h4>
                  <p className="text-sm m-0">
                    The backend scrapes or uses an API to get metadata. Full problem text usually requires parsing HTML which is omitted for this MVP scope.
                  </p>
                </div>

                <div className="mt-8">
                   <a 
                    href={`https://www.acmicpc.net/problem/${problem.bojId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      Open Problem Statement <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="bg-white/5 hover:bg-primary/50 transition-colors w-1" />

          {/* Right: IDE */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="h-full p-2 bg-[#121212]">
              <IDE problem={problem} />
            </div>
          </ResizablePanel>
          
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
