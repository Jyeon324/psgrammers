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
import type { Problem } from "@shared/schema";

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
  const [activeTab, setActiveTab] = useState<'output' | 'input'>('output');
  const [customInput, setCustomInput] = useState("");
  
  const editorRef = useRef<any>(null);
  const runCode = useRunCode();
  const createSolution = useCreateSolution();
  const { toast } = useToast();

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
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
        setOutput(result.output || "No output");
      } else {
        setOutput(result.error || result.output || "Runtime error");
      }
    } catch (error) {
      setOutput("Error: Failed to execute code.");
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

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl border border-white/5">
      {/* Toolbar */}
      <div className="h-14 bg-[#252526] border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-mono border border-blue-500/20">
            main.cpp
          </div>
          {createSolution.isPending && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
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
            Run Code
          </Button>
          <Button 
            size="sm" 
            className="h-8"
            onClick={handleSubmit}
            disabled={createSolution.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Submit
          </Button>
        </div>
      </div>

      {/* Editor & Terminal */}
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={70}>
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
        
        <ResizablePanel defaultSize={30} minSize={10}>
          <div className="h-full flex flex-col bg-[#1e1e1e]">
            <div className="flex border-b border-white/5">
              <button 
                onClick={() => setActiveTab('output')}
                className={cn(
                  "px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors border-b-2",
                  activeTab === 'output' 
                    ? "text-white border-primary bg-white/5" 
                    : "text-muted-foreground border-transparent hover:text-white"
                )}
              >
                Output
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
                Input (stdin)
              </button>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              {activeTab === 'output' ? (
                <div className="font-mono text-sm">
                  {output ? (
                    <pre className="text-gray-300 whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <div className="text-muted-foreground italic">Run code to see output...</div>
                  )}
                </div>
              ) : (
                <textarea
                  className="w-full h-full min-h-[100px] bg-transparent resize-none focus:outline-none font-mono text-sm text-gray-300 placeholder:text-muted-foreground/50"
                  placeholder="Enter custom input for your program..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                />
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
