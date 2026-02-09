import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Problems from "@/pages/Problems";
import Solve from "@/pages/Solve";
import Solutions from "@/pages/Solutions";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen bg-background" />; // Prevent flash
  if (!user) return <Redirect to="/" />;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      
      <Route path="/problems">
        <ProtectedRoute component={Problems} />
      </Route>
      
      <Route path="/solve/:id" component={Solve} />
      
      <Route path="/solutions">
        <ProtectedRoute component={Solutions} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;