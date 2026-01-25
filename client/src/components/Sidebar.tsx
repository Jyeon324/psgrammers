import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Code2,
  LayoutDashboard,
  History,
  LogOut,
  Terminal,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Problems", href: "/problems", icon: Code2 },
    { label: "Solutions", href: "/solutions", icon: History },
  ];

  return (
    <div className="h-screen w-64 bg-secondary/30 border-r border-white/5 flex flex-col backdrop-blur-xl fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Terminal className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            AlgoArena
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer text-sm font-medium",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="bg-gradient-to-br from-card to-card/50 rounded-xl p-4 border border-white/5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">System Online</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ready to compile C++ code. Happy coding!
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
