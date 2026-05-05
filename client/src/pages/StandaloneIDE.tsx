import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IDE } from "@/components/IDE";

export default function StandaloneIDE() {
  return (
    <div className="h-screen w-full bg-background text-foreground overflow-hidden flex flex-col">
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-secondary/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <h1 className="font-bold text-lg">Standalone IDE</h1>
            <p className="text-xs text-muted-foreground">문제 없이 코드를 실행하는 환경</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-2 bg-[#121212]">
        <IDE />
      </main>
    </div>
  );
}
