import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Terminal, Code2, Cpu, Trophy, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function Landing() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Redirect to="/dashboard" />;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-40 right-0 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Nav */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Terminal className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            AlgoArena
          </span>
        </div>
        <Button variant="outline" className="border-primary/20 hover:bg-primary/10 hover:text-primary" asChild>
          <a href="/api/login">Sign In</a>
        </Button>
      </nav>

      {/* Hero */}
      <main className="container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            Master Algorithms <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              Without Distractions
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A premium coding environment integrated with Baekjoon Online Judge. 
            Write, compile, and manage your C++ solutions in a modern IDE built for performance.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-300" asChild>
              <a href="/api/login">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-full bg-white/5 border border-white/10 hover:bg-white/10">
              View Problem Set
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          {[
            {
              icon: Code2,
              title: "Modern C++ IDE",
              desc: "Monaco editor with intellisense, syntax highlighting, and dark mode."
            },
            {
              icon: Cpu,
              title: "Instant Compilation",
              desc: "Run your code on our cloud servers with immediate feedback and output."
            },
            {
              icon: Trophy,
              title: "Problem Sync",
              desc: "Seamlessly import problems from BOJ and track your progress by tier."
            }
          ].map((feature, i) => (
            <div key={i} className="glass-panel p-8 rounded-2xl hover:-translate-y-1 transition-transform duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
