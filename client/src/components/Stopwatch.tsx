import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setSeconds(0);
    setIsRunning(true);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 border border-white/5">
      <span className="font-mono text-sm tabular-nums text-foreground">
        {formatTime(seconds)}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-white/10"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? (
            <Pause className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <Play className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-white/10"
          onClick={handleReset}
        >
          <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
