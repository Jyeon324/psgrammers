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
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; output: string } | null>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);
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

  const handleRunAll = async () => {
    if (!problem.testCases || problem.testCases.length === 0) return;

    setIsRunningAll(true);
    setTestResults({});
    setActiveTab('samples');

    // 순차적으로 실행 (병렬 실행 시 서버 부하 고려)
    for (const tc of problem.testCases) {
      if (!tc.sampleNumber) continue;

      try {
        const result = await runCode.mutateAsync({
          code,
          language: "cpp",
          input: tc.input || ""
        });

        const output = result.success ? (result.output || "") : (result.error || result.output || "실행 오류");
        const isCorrect = output.trim() === tc.expectedOutput?.trim();

        setTestResults(prev => ({
          ...prev,
          [tc.sampleNumber!]: { success: isCorrect, output }
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          [tc.sampleNumber!]: { success: false, output: "에러: 실행 실패" }
        }));
      }
    }
    setIsRunningAll(false);
  };

  const handleSelectSample = (sampleNum: number) => {
    const tc = problem.testCases?.find((t: TestCase) => t.sampleNumber === sampleNum);
    if (tc) {
      setSelectedTestCase(sampleNum);
      setCustomInput(tc.input);
      setActiveTab('input');
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setActiveTab('output');
    setOutput(""); // 실행 시 이전 출력 초기화
    setTestResults({}); // 이전 테스트 결과 초기화
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

  const currentTestCase = problem.testCases?.find((t: TestCase) => t.sampleNumber === selectedTestCase);
  const expectedOutput = currentTestCase?.expectedOutput;
  const isInputMatched = customInput.trim() === currentTestCase?.input?.trim();
  const isCorrect = isInputMatched && output.trim() === expectedOutput?.trim();

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
            className="h-8 bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 border border-purple-600/20"
            onClick={handleRunAll}
            disabled={isRunning || isRunningAll || runCode.isPending}
          >
            {isRunningAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            전체 실행
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 bg-green-600/10 text-green-400 hover:bg-green-600/20 border border-green-600/20"
            onClick={handleRun}
            disabled={isRunning || isRunningAll || runCode.isPending}
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
                    {problem.testCases?.map((tc: TestCase) => {
                      const result = tc.sampleNumber ? testResults[tc.sampleNumber] : null;
                      let statusColor = "bg-secondary text-secondary-foreground hover:bg-secondary/80";
                      if (result) {
                        statusColor = result.success
                          ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30";
                      }

                      return (
                        <Button
                          key={tc.sampleNumber}
                          variant={selectedTestCase === tc.sampleNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSelectSample(tc.sampleNumber!)}
                          className={cn("font-mono border transition-all",
                            selectedTestCase === tc.sampleNumber ? "" : statusColor,
                            result ? "border" : "border-transparent"
                          )}
                        >
                          예제 {tc.sampleNumber}
                          {result && (
                            <span className="ml-2">
                              {result.success ? "✅" : "❌"}
                            </span>
                          )}
                        </Button>
                      )
                    })}
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
                  {testResults[selectedTestCase!] && (
                    <div className="mt-4 p-3 rounded border border-white/5 bg-black/20">
                      <label className="text-[10px] text-muted-foreground uppercase block mb-2">실제 실행 결과</label>
                      <pre className={cn(
                        "text-xs font-mono whitespace-pre-wrap",
                        testResults[selectedTestCase!]!.success ? "text-green-400" : "text-red-400"
                      )}>
                        {testResults[selectedTestCase!]?.output}
                      </pre>
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
                  {output && expectedOutput && isInputMatched && !isRunning && (
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
                  {!isInputMatched && (
                    <div className="bg-secondary/20 p-3 rounded border border-white/5 space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">사용한 입력 (Current Input)</div>
                      <pre className="text-xs font-mono text-muted-foreground truncate italic">{customInput || "(입력 없음)"}</pre>
                    </div>
                  )}
                  <div className="font-mono text-sm">
                    <div className="text-[10px] text-muted-foreground uppercase mb-2 font-semibold">실행 결과 (Result)</div>
                    {output ? (
                      <pre className="text-gray-300 whitespace-pre-wrap py-2 p-3 bg-black/20 rounded border border-white/5">{output}</pre>
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
