import { useRef, useState, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { useRunCode } from "@/hooks/use-compiler";
import { useCreateSolution } from "@/hooks/use-solutions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Problem, TestCase } from "@shared/schema";

interface IDEProps {
  problem: Problem;
}

const DEFAULT_CODE = `#include <iostream>
#include <string>
#include <vector>

using namespace std;

int main() {
    // Write your code here
    cout << "Hello World!" << endl;
    return 0;
}
`;

export function IDE({ problem }: IDEProps) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'output' | 'input' | 'samples'>('samples');
  const [customInput, setCustomInput] = useState("");
  const [selectedTestCase, setSelectedTestCase] = useState<number | null>(null);

  const editorRef = useRef<any>(null);
  const runCode = useRunCode();
  const createSolution = useCreateSolution();
  const { toast } = useToast();

  useEffect(() => {
    if (problem.testCases && problem.testCases.length > 0 && selectedTestCase === null) {
      setSelectedTestCase(problem.testCases[0].sampleNumber);
      setCustomInput(problem.testCases[0].input);
    }
  }, [problem.testCases, selectedTestCase]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleSelectSample = (sampleNum: number) => {
    const tc = problem.testCases?.find((t: TestCase) => t.sampleNumber === sampleNum);
    if (tc) {
      setSelectedTestCase(sampleNum);
      setCustomInput(tc.input);
      setActiveTab('input');
      toast({
        title: `예제 ${sampleNum} 선택됨`,
        description: "입력창이 예제 데이터로 업데이트되었습니다.",
      });
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setActiveTab('output');
    try {
      const result = await runCode.mutateAsync({
        code,
        language: "cpp",
        input: customInput
      });

      if (result.success) {
        setOutput(result.output || "");
      } else {
        setOutput(result.error || result.output || "실행 오류");
      }
    } catch (error) {
      setOutput("에러: 코드 실행에 실패했습니다.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await createSolution.mutateAsync({
        problemId: problem.id,
        code,
        language: "cpp",
        status: "pending" // In a real app, this would trigger a judge
      });
      toast({
        title: "Solution Saved",
        description: "Your code has been saved to your history.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save solution.",
        variant: "destructive"
      });
    }
  };

  const expectedOutput = problem.testCases?.find((t: TestCase) => t.sampleNumber === selectedTestCase)?.expectedOutput;
  const isCorrect = output.trim() === expectedOutput?.trim();

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl border border-white/5">
      {/* Toolbar */}
      <div className="h-14 bg-[#252526] border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-mono border border-blue-500/20">
            main.cpp
          </div>
          {createSolution.isPending && <span className="text-xs text-muted-foreground animate-pulse">저장 중...</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 bg-green-600/10 text-green-400 hover:bg-green-600/20 border border-green-600/20"
            onClick={handleRun}
            disabled={isRunning || runCode.isPending}
          >
            {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            실행
          </Button>
          <Button
            size="sm"
            className="h-8"
            onClick={handleSubmit}
            disabled={createSolution.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            제출
          </Button>
        </div>
      </div>

      {/* Editor & Terminal */}
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={65}>
          <Editor
            height="100%"
            defaultLanguage="cpp"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
            }}
          />
        </ResizablePanel>

        <ResizableHandle className="bg-white/5 hover:bg-primary/50 transition-colors h-1" />

        <ResizablePanel defaultSize={35} minSize={15}>
          <div className="h-full flex flex-col bg-[#1e1e1e]">
            <div className="flex border-b border-white/5 bg-[#252526]">
              <button
                onClick={() => setActiveTab('samples')}
                className={cn(
                  "px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors border-b-2",
                  activeTab === 'samples'
                    ? "text-white border-primary bg-white/5"
                    : "text-muted-foreground border-transparent hover:text-white"
                )}
              >
                예제 선택
              </button>
              <button
                onClick={() => setActiveTab('input')}
                className={cn(
                  "px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors border-b-2",
                  activeTab === 'input'
                    ? "text-white border-primary bg-white/5"
                    : "text-muted-foreground border-transparent hover:text-white"
                )}
              >
                입력 (Input)
              </button>
              <button
                onClick={() => setActiveTab('output')}
                className={cn(
                  "px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors border-b-2",
                  activeTab === 'output'
                    ? "text-white border-primary bg-white/5"
                    : "text-muted-foreground border-transparent hover:text-white"
                )}
              >
                출력 (Output)
              </button>
            </div>

            <ScrollArea className="flex-1 p-4">
              {activeTab === 'samples' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {problem.testCases?.map((tc: TestCase) => (
                      <Button
                        key={tc.sampleNumber}
                        variant={selectedTestCase === tc.sampleNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSelectSample(tc.sampleNumber!)}
                        className="font-mono"
                      >
                        예제 {tc.sampleNumber}
                      </Button>
                    ))}
                  </div>
                  {selectedTestCase && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-muted-foreground uppercase">예제 입력</label>
                        <pre className="p-3 bg-black/30 rounded border border-white/5 text-xs font-mono overflow-x-auto">
                          {problem.testCases?.find((t: TestCase) => t.sampleNumber === selectedTestCase)?.input}
                        </pre>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-muted-foreground uppercase">예상 출력</label>
                        <pre className="p-3 bg-black/30 rounded border border-white/5 text-xs font-mono overflow-x-auto text-green-400/80">
                          {problem.testCases?.find((t: TestCase) => t.sampleNumber === selectedTestCase)?.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'input' && (
                <textarea
                  className="w-full h-full min-h-[150px] bg-transparent resize-none focus:outline-none font-mono text-sm text-gray-300 placeholder:text-muted-foreground/50"
                  placeholder="프로그램에 전달할 입력값을 여기에 작성하세요..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                />
              )}

              {activeTab === 'output' && (
                <div className="space-y-4">
                  {output && expectedOutput && (
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border",
                      isCorrect
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                      {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span className="text-sm font-medium">
                        {isCorrect ? "결과가 일치합니다!" : "결과가 다릅니다."}
                      </span>
                    </div>
                  )}
                  <div className="font-mono text-sm">
                    {output ? (
                      <pre className="text-gray-300 whitespace-pre-wrap py-2">{output}</pre>
                    ) : (
                      <div className="text-muted-foreground italic py-2">실행 버튼을 눌러 결과를 확인하세요...</div>
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
