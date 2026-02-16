import { useRef, useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useProblem } from "@/hooks/use-problems";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { IDE } from "@/components/IDE";
import { TierBadge } from "@/components/TierBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Loader2, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import "katex/dist/katex.min.css";
import renderMathInElement from "katex/contrib/auto-render";

export default function Solve() {
  const { id } = useParams();
  const { data: problem, isLoading, error } = useProblem(Number(id));
  const containerRef = useRef<HTMLDivElement>(null);
  const [showMetadata, setShowMetadata] = useState(false);

  useEffect(() => {
    if (problem && containerRef.current) {
      // Delay slightly to ensure dangerouslySetInnerHTML has finished
      const timer = setTimeout(() => {
        renderMathInElement(containerRef.current!, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
          ],
          throwOnError: false
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [problem]);

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
        <Link href="/"><Button>Go Back</Button></Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background text-foreground overflow-hidden flex flex-col">
      {/* Top Bar */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-secondary/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <h1 className="font-bold text-lg truncate max-w-md">{problem.title}</h1>
          {showMetadata && <TierBadge tier={problem.tier || 0} />}
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 hover:bg-white/5"
            onClick={() => setShowMetadata(!showMetadata)}
            title={showMetadata ? "알고리즘/난이도 숨기기" : "알고리즘/난이도 표시"}
          >
            {showMetadata ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
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
            <div className="h-full overflow-y-auto p-8 custom-scrollbar" ref={containerRef}>
              <div className="prose prose-invert max-w-none prose-headings:font-bold prose-p:text-muted-foreground prose-code:text-primary prose-pre:bg-secondary/50">
                <div className="flex items-center gap-2 mb-6">
                  <span className="font-mono text-sm text-muted-foreground">ID: {problem.bojId}</span>
                  {showMetadata && (
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">{problem.category || '알고리즘'}</span>
                  )}
                </div>

                {problem.description ? (
                  <>
                    <section className="mb-8">
                      <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">문제 설명</h3>
                      <div
                        className="problem-html"
                        dangerouslySetInnerHTML={{ __html: problem.description }}
                      />
                    </section>

                    {problem.inputDescription && (
                      <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">입력</h3>
                        <div
                          className="problem-html"
                          dangerouslySetInnerHTML={{ __html: problem.inputDescription }}
                        />
                      </section>
                    )}

                    {problem.outputDescription && (
                      <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">출력</h3>
                        <div
                          className="problem-html"
                          dangerouslySetInnerHTML={{ __html: problem.outputDescription }}
                        />
                      </section>
                    )}
                  </>
                ) : (
                  <>
                    <h3>Description</h3>
                    <p>
                      이 문제는 현재 메타데이터만 동기화된 상태입니다. 상세 내용을 보려면 아래 버튼을 눌러 동기화를 다시 진행하거나 백준에서 직접 확인해주세요.
                    </p>
                  </>
                )}

                <div className="mt-8">
                  <a
                    href={`https://www.acmicpc.net/problem/${problem.bojId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      백준에서 직접 보기 <ExternalLink className="ml-2 w-4 h-4" />
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
              <IDE key={problem.id} problem={problem} />
            </div>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>
    </div>
  );
}
