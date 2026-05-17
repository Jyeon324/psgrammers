import { useRef, useState, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Loader2, Play, CheckCircle2, AlertCircle, AlertTriangle, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useRunCode } from "@/hooks/use-compiler";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Problem, TestCase } from "@shared/schema";

interface IDEProps {
  problem?: Problem;
}

type SupportedLanguage = "cpp" | "java" | "python" | "javascript";
type CustomTestCase = { id: number; input: string; expectedOutput: string };
type CustomTestResult = { success: boolean | null; output: string };

const LANGUAGE_CONFIG: Record<SupportedLanguage, { label: string; monacoId: string; extension: string; defaultCode: string }> = {
  cpp: {
    label: "C++",
    monacoId: "cpp",
    extension: "cpp",
    defaultCode: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

int main() {
    // Write your code here
    cout << "Hello World!" << endl;
    return 0;
}
`,
  },
  java: {
    label: "Java",
    monacoId: "java",
    extension: "java",
    defaultCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Write your code here
        System.out.println("Hello World!");
    }
}
`,
  },
  python: {
    label: "Python",
    monacoId: "python",
    extension: "py",
    defaultCode: `import sys
input = sys.stdin.readline

# Write your code here
print("Hello World!")
`,
  },
  javascript: {
    label: "JavaScript",
    monacoId: "javascript",
    extension: "js",
    defaultCode: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];

rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    // Write your code here
    console.log("Hello World!");
});
`,
  },
};

const EMPTY_TEST_CASES: TestCase[] = [];
const DEFAULT_CUSTOM_TEST_CASES: CustomTestCase[] = [{ id: 1, input: "", expectedOutput: "" }];

const DISABLE_SUGGEST_OPTIONS = {
  quickSuggestions: { other: false, comments: false, strings: false },
  suggestOnTriggerCharacters: false,
  acceptSuggestionOnEnter: "off" as const,
  tabCompletion: "off" as const,
  wordBasedSuggestions: "off" as const,
  parameterHints: { enabled: false },
  inlineSuggest: { enabled: false },
  snippetSuggestions: "none" as const,
  suggest: {
    preview: false,
    showWords: false,
    showSnippets: false,
    showClasses: false,
    showColors: false,
    showConstants: false,
    showConstructors: false,
    showCustomcolors: false,
    showDeprecated: false,
    showEnumMembers: false,
    showEnums: false,
    showEvents: false,
    showFields: false,
    showFiles: false,
    showFolders: false,
    showFunctions: false,
    showIcons: false,
    showInterfaces: false,
    showIssues: false,
    showKeywords: false,
    showMethods: false,
    showModules: false,
    showOperators: false,
    showProperties: false,
    showReferences: false,
    showStatusBar: false,
    showStructs: false,
    showTypeParameters: false,
    showUnits: false,
    showUsers: false,
    showValues: false,
    showVariables: false,
  },
};

const normalizeOutput = (str: string | null | undefined) => {
  if (!str) return "";
  return str
    .trim()
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .filter(line => line.trim() !== "")
    .join('\n');
};

const loadCustomTestCases = (storageScope: string) => {
  const saved = localStorage.getItem(`${storageScope}_custom_cases`);
  if (!saved) return DEFAULT_CUSTOM_TEST_CASES;

  try {
    const parsed = JSON.parse(saved) as CustomTestCase[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CUSTOM_TEST_CASES;

    return parsed.map((testCase, index) => ({
      id: Number.isFinite(testCase.id) ? testCase.id : index + 1,
      input: testCase.input ?? "",
      expectedOutput: testCase.expectedOutput ?? "",
    }));
  } catch {
    return DEFAULT_CUSTOM_TEST_CASES;
  }
};

const getRunErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.trim()) {
    return `에러: ${error.message}`;
  }
  return "에러: 코드 실행에 실패했습니다.";
};

export function IDE({ problem }: IDEProps) {
  const storageScope = problem ? `problem_${problem.id}` : "standalone_ide";
  const hasProblem = Boolean(problem);
  const testCases = problem?.testCases ?? EMPTY_TEST_CASES;

  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(`${storageScope}_lang`);
    return (saved as SupportedLanguage) || "cpp";
  });
  const [showLangMenu, setShowLangMenu] = useState(false);

  const langConfig = LANGUAGE_CONFIG[language];

  const [code, setCode] = useState(() => {
    const savedCode = localStorage.getItem(`${storageScope}_code_${language}`);
    return savedCode || langConfig.defaultCode;
  });

  useEffect(() => {
    localStorage.setItem(`${storageScope}_code_${language}`, code);
  }, [code, storageScope, language]);

  useEffect(() => {
    localStorage.setItem(`${storageScope}_lang`, language);
  }, [language, storageScope]);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    if (newLang === language) return;
    const savedCode = localStorage.getItem(`${storageScope}_code_${newLang}`);
    setCode(savedCode || LANGUAGE_CONFIG[newLang].defaultCode);
    setLanguage(newLang);
    setShowLangMenu(false);
  };

  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'output' | 'input' | 'samples'>(hasProblem ? 'samples' : 'input');
  const [customInput, setCustomInput] = useState("");
  const [customTestCases, setCustomTestCases] = useState<CustomTestCase[]>(() => loadCustomTestCases(storageScope));
  const [customTestResults, setCustomTestResults] = useState<Record<number, CustomTestResult>>({});
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; output: string } | null>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<number | null>(null);

  const editorRef = useRef<any>(null);
  const runCode = useRunCode();

  useEffect(() => {
    if (testCases.length > 0 && selectedTestCase === null) {
      setSelectedTestCase(testCases[0].sampleNumber);
      setCustomInput(testCases[0].input);
    }
  }, [testCases, selectedTestCase]);

  useEffect(() => {
    if (!hasProblem) {
      localStorage.setItem(`${storageScope}_custom_cases`, JSON.stringify(customTestCases));
    }
  }, [customTestCases, hasProblem, storageScope]);

  const handleEditorDidMount: OnMount = (editor, monaco: Monaco) => {
    editorRef.current = editor;
    editor.updateOptions(DISABLE_SUGGEST_OPTIONS);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => null);
  };

  const handleRunAll = async () => {
    if (testCases.length === 0) return;

    setIsRunningAll(true);
    setTestResults({});
    setActiveTab('samples');

    for (const tc of testCases) {
      if (!tc.sampleNumber) continue;

      try {
        const result = await runCode.mutateAsync({
          code,
          language,
          input: tc.input || ""
        });

        const output = result.success ? (result.output || "") : (result.error || result.output || "실행 오류");
        const isCorrect = normalizeOutput(output) === normalizeOutput(tc.expectedOutput);

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
    const tc = testCases.find((t: TestCase) => t.sampleNumber === sampleNum);
    if (tc) {
      setSelectedTestCase(sampleNum);
      setCustomInput(tc.input);
    }
  };

  const handleAddCustomTestCase = () => {
    setCustomTestCases(prev => {
      const nextId = Math.max(0, ...prev.map(testCase => testCase.id)) + 1;
      return [...prev, { id: nextId, input: "", expectedOutput: "" }];
    });
  };

  const handleRemoveCustomTestCase = (id: number) => {
    setCustomTestCases(prev => {
      if (prev.length === 1) return prev;
      return prev.filter(testCase => testCase.id !== id);
    });
    setCustomTestResults(prev => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleUpdateCustomTestCase = (id: number, field: keyof Omit<CustomTestCase, "id">, value: string) => {
    setCustomTestCases(prev => prev.map(testCase => (
      testCase.id === id ? { ...testCase, [field]: value } : testCase
    )));
    setCustomTestResults(prev => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleRunCustomTestCases = async () => {
    setIsRunning(true);
    setIsRunningAll(true);
    setActiveTab('output');
    setOutput("");
    setCustomTestResults({});

    try {
      for (const testCase of customTestCases) {
        try {
          const result = await runCode.mutateAsync({
            code,
            language,
            input: testCase.input,
          });

          const actualOutput = result.success ? (result.output || "") : (result.error || result.output || "실행 오류");
          const hasExpectedOutput = testCase.expectedOutput.trim().length > 0;
          const success = !result.success
            ? false
            : hasExpectedOutput
              ? normalizeOutput(actualOutput) === normalizeOutput(testCase.expectedOutput)
              : null;

          setCustomTestResults(prev => ({
            ...prev,
            [testCase.id]: { success, output: actualOutput },
          }));
        } catch (error) {
          setCustomTestResults(prev => ({
            ...prev,
            [testCase.id]: { success: false, output: getRunErrorMessage(error) },
          }));
        }
      }
    } finally {
      setIsRunning(false);
      setIsRunningAll(false);
    }
  };

  const handleRun = async () => {
    if (!hasProblem) {
      await handleRunCustomTestCases();
      return;
    }

    setIsRunning(true);
    setActiveTab('output');
    setOutput("");
    setTestResults({});
    try {
      const result = await runCode.mutateAsync({
        code,
        language,
        input: customInput
      });

      if (result.success) {
        setOutput(result.output || "");
      } else {
        setOutput(result.error || result.output || "실행 오류");
      }
    } catch (error) {
      setOutput(getRunErrorMessage(error));
    } finally {
      setIsRunning(false);
    }
  };

  const currentTestCase = testCases.find((t: TestCase) => t.sampleNumber === selectedTestCase);
  const expectedOutput = currentTestCase?.expectedOutput;
  const isInputMatched = Boolean(currentTestCase) && customInput.trim() === currentTestCase?.input?.trim();

  const isError = output.startsWith("에러:") || output === "실행 오류" || output.includes("Error:") || output.includes("RuntimeException");
  const isCorrect = !isError && isInputMatched && normalizeOutput(output) === normalizeOutput(expectedOutput);

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl border border-white/5">
      <div className="h-14 bg-[#252526] border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-mono border border-blue-500/20 flex items-center gap-1.5 hover:bg-blue-500/20 transition-colors"
            >
              main.{langConfig.extension}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showLangMenu && (
              <div className="absolute top-full left-0 mt-1 bg-[#252526] border border-white/10 rounded-md shadow-xl z-50 min-w-[140px]">
                {(Object.entries(LANGUAGE_CONFIG) as [SupportedLanguage, typeof langConfig][]).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleLanguageChange(key)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-xs font-mono hover:bg-white/10 transition-colors flex items-center justify-between",
                      key === language ? "text-blue-400" : "text-gray-300"
                    )}
                  >
                    <span>{config.label}</span>
                    <span className="text-muted-foreground">.{config.extension}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasProblem && (
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
          )}
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
        </div>
      </div>

      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={65}>
          <Editor
            height="100%"
            language={langConfig.monacoId}
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
              ...DISABLE_SUGGEST_OPTIONS,
            }}
          />
        </ResizablePanel>

        <ResizableHandle className="bg-white/5 hover:bg-primary/50 transition-colors h-1" />

        <ResizablePanel defaultSize={35} minSize={15}>
          <div className="h-full flex flex-col bg-[#1e1e1e]">
            <div className="flex border-b border-white/5 bg-[#252526]">
              {hasProblem && (
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
              )}
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
              {hasProblem && activeTab === 'samples' && (
                <div className="space-y-4 pb-8">
                  <div className="flex flex-wrap gap-2">
                    {testCases.map((tc: TestCase) => {
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
                        <pre className="p-4 bg-black/50 rounded-md border border-white/10 text-xs font-mono whitespace-pre-wrap">
                          {testCases.find((t: TestCase) => t.sampleNumber === selectedTestCase)?.input}
                        </pre>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-muted-foreground uppercase">예상 출력</label>
                        <pre className="p-4 bg-black/50 rounded-md border border-white/10 text-xs font-mono whitespace-pre-wrap text-green-400/80">
                          {testCases.find((t: TestCase) => t.sampleNumber === selectedTestCase)?.expectedOutput}
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
                hasProblem ? (
                  <textarea
                    className="w-full h-full min-h-[150px] bg-transparent resize-none focus:outline-none font-mono text-sm text-gray-300 placeholder:text-muted-foreground/50"
                    placeholder="프로그램에 전달할 입력값을 여기에 작성하세요..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                  />
                ) : (
                  <div className="space-y-4 pb-8">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-semibold text-white">테스트 케이스</h2>
                        <p className="text-xs text-muted-foreground">입력과 예상 출력을 원하는 만큼 추가하세요.</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-white/10 text-gray-200 hover:bg-white/10"
                        onClick={handleAddCustomTestCase}
                      >
                        <Plus className="w-4 h-4" />
                        추가
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {customTestCases.map((testCase, index) => {
                        const result = customTestResults[testCase.id];
                        const hasExpectedOutput = testCase.expectedOutput.trim().length > 0;

                        return (
                          <div
                            key={testCase.id}
                            className={cn(
                              "rounded-lg border bg-black/20 p-4 space-y-3",
                              result?.success === true && "border-green-500/30",
                              result?.success === false && "border-red-500/30",
                              result?.success === null && "border-blue-500/30",
                              !result && "border-white/10"
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">예제 {index + 1}</span>
                                {result && (
                                  <span className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                    result.success === true && "bg-green-500/10 text-green-400",
                                    result.success === false && "bg-red-500/10 text-red-400",
                                    result.success === null && "bg-blue-500/10 text-blue-400"
                                  )}>
                                    {result.success === true ? "일치" : result.success === false ? "불일치" : "비교 없음"}
                                  </span>
                                )}
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
                                onClick={() => handleRemoveCustomTestCase(testCase.id)}
                                disabled={customTestCases.length === 1}
                                aria-label={`예제 ${index + 1} 삭제`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground uppercase font-semibold">예제 입력 {index + 1}</label>
                                <textarea
                                  className="min-h-[108px] w-full resize-none rounded-md border border-white/10 bg-black/40 p-3 font-mono text-xs text-gray-200 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                                  placeholder="입력값"
                                  value={testCase.input}
                                  onChange={(e) => handleUpdateCustomTestCase(testCase.id, "input", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground uppercase font-semibold">예제 출력 {index + 1}</label>
                                <textarea
                                  className="min-h-[64px] w-full resize-none rounded-md border border-white/10 bg-black/40 p-3 font-mono text-xs text-green-300 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                                  placeholder="예상 출력"
                                  value={testCase.expectedOutput}
                                  onChange={(e) => handleUpdateCustomTestCase(testCase.id, "expectedOutput", e.target.value)}
                                />
                              </div>
                            </div>

                            {!hasExpectedOutput && (
                              <p className="text-xs text-muted-foreground">예상 출력을 비워두면 실행 결과만 보여줍니다.</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}

              {activeTab === 'output' && (
                !hasProblem ? (
                  <div className="space-y-4 pb-8">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-semibold text-white">실행 결과</h2>
                        <p className="text-xs text-muted-foreground">각 테스트 케이스의 실제 출력과 예상 출력을 비교합니다.</p>
                      </div>
                      {isRunningAll && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          실행 중
                        </div>
                      )}
                    </div>

                    {customTestCases.map((testCase, index) => {
                      const result = customTestResults[testCase.id];
                      const hasExpectedOutput = testCase.expectedOutput.trim().length > 0;

                      return (
                        <div
                          key={testCase.id}
                          className={cn(
                            "rounded-lg border bg-black/20 p-4 space-y-4",
                            result?.success === true && "border-green-500/30",
                            result?.success === false && "border-red-500/30",
                            result?.success === null && "border-blue-500/30",
                            !result && "border-white/10"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">예제 {index + 1}</span>
                              {result ? (
                                <span className={cn(
                                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                  result.success === true && "bg-green-500/10 text-green-400",
                                  result.success === false && "bg-red-500/10 text-red-400",
                                  result.success === null && "bg-blue-500/10 text-blue-400"
                                )}>
                                  {result.success === true ? "일치" : result.success === false ? "불일치" : "비교 없음"}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">아직 실행 전</span>
                              )}
                            </div>
                            {result?.success === true && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                            {result?.success === false && <AlertCircle className="w-4 h-4 text-red-400" />}
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-[10px] text-muted-foreground uppercase font-semibold">예상 출력</label>
                              <pre className="min-h-[72px] rounded-md border border-white/10 bg-black/40 p-3 font-mono text-xs whitespace-pre-wrap text-green-300">
                                {hasExpectedOutput ? testCase.expectedOutput : "(예상 출력 없음)"}
                              </pre>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] text-muted-foreground uppercase font-semibold">실행 결과</label>
                              <pre className={cn(
                                "min-h-[72px] rounded-md border border-white/10 bg-black/40 p-3 font-mono text-xs whitespace-pre-wrap",
                                result?.success === true && "text-green-300",
                                result?.success === false && "text-red-300",
                                result?.success === null && "text-gray-300",
                                !result && "text-muted-foreground"
                              )}>
                                {result ? (result.output || "(출력 없음)") : "실행 버튼을 눌러 결과를 확인하세요."}
                              </pre>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                <div className="space-y-4">
                  {output && expectedOutput && isInputMatched && !isRunning && (
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border",
                      isError
                        ? "bg-red-500/20 border-red-500/40 text-red-400"
                        : isCorrect
                          ? "bg-green-500/10 border-green-500/20 text-green-400"
                          : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                    )}>
                      {isError ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isCorrect ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {isError
                          ? "런타임 에러 또는 실행 실패"
                          : isCorrect
                            ? "결과가 일치합니다!"
                            : "결과가 다릅니다."}
                      </span>
                    </div>
                  )}
                  {currentTestCase && !isInputMatched && (
                    <div className="bg-secondary/20 p-3 rounded border border-white/5 space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">사용한 입력 (Current Input)</div>
                      <pre className="text-xs font-mono text-muted-foreground truncate italic">{customInput || "(입력 없음)"}</pre>
                    </div>
                  )}
                  {expectedOutput ? (
                    <div className="grid grid-cols-2 gap-4 font-mono">
                      <div className="space-y-2">
                        <label className="text-[10px] text-muted-foreground uppercase font-semibold">예상 결과 (Expected Output)</label>
                        <pre className="p-4 pb-8 bg-black/50 rounded-md border border-white/10 text-xs font-mono whitespace-pre-wrap text-green-400/80">
                          {expectedOutput}
                        </pre>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-muted-foreground uppercase font-semibold">실행 결과 (Actual Result)</label>
                        {isRunning ? (
                          <div className="p-4 pb-8 bg-black/50 rounded-md border border-white/10 text-xs font-mono text-muted-foreground flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>실행 중...</span>
                          </div>
                        ) : (
                          <pre className={cn(
                            "p-4 pb-8 bg-black/50 rounded-md border border-white/10 text-xs font-mono whitespace-pre-wrap",
                            isCorrect ? "text-green-400" : "text-red-400"
                          )}>
                            {output || "(결과 없음)"}
                          </pre>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="font-mono text-sm">
                      <div className="text-[10px] text-muted-foreground uppercase mb-2 font-semibold">실행 결과 (Result)</div>
                      {isRunning ? (
                        <div className="p-4 pb-8 bg-black/50 rounded-md border border-white/10 text-xs font-mono text-muted-foreground flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>실행 중...</span>
                        </div>
                      ) : output ? (
                        <pre className="p-4 pb-8 bg-black/50 rounded-md border border-white/10 text-xs font-mono whitespace-pre-wrap text-gray-300">
                          {output}
                        </pre>
                      ) : (
                        <div className="text-muted-foreground italic py-2">실행 버튼을 눌러 결과를 확인하세요...</div>
                      )}
                    </div>
                  )}
                </div>
                )
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
