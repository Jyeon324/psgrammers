import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useProblems, useSyncProblem } from "@/hooks/use-problems";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2, ArrowRight } from "lucide-react";
import { TierBadge } from "@/components/TierBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const syncSchema = z.object({
  bojId: z.coerce.number().min(1000, "Invalid BOJ ID"),
});

export default function Problems() {
  const [search, setSearch] = useState("");
  const { data: problems, isLoading } = useProblems({ search });
  const [open, setOpen] = useState(false);
  
  const syncProblem = useSyncProblem();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof syncSchema>>({
    resolver: zodResolver(syncSchema),
    defaultValues: { bojId: 1000 },
  });

  const onSync = async (data: z.infer<typeof syncSchema>) => {
    try {
      await syncProblem.mutateAsync(data);
      toast({ title: "Success", description: "Problem synced successfully" });
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Problems</h1>
            <p className="text-muted-foreground">Practice and solve algorithms.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search problems..." 
                className="pl-9 bg-secondary/20 border-white/10 focus:border-primary/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Sync Problem
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Sync from BOJ</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSync)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="bojId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Problem ID</FormLabel>
                          <FormControl>
                            <Input placeholder="1000" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={syncProblem.isPending}>
                      {syncProblem.isPending ? "Syncing..." : "Add to Library"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {problems?.map((problem) => (
              <div 
                key={problem.id}
                className="group flex items-center justify-between p-6 bg-secondary/20 rounded-xl border border-white/5 hover:border-primary/30 hover:bg-secondary/30 transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  <div className="text-2xl font-mono font-bold text-muted-foreground/30 w-16 group-hover:text-primary/50 transition-colors">
                    {problem.bojId}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {problem.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <TierBadge tier={problem.tier || 0} />
                      <span className="text-sm text-muted-foreground">{problem.category || 'Uncategorized'}</span>
                    </div>
                  </div>
                </div>
                
                <Link href={`/solve/${problem.id}`}>
                  <Button variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Solve <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))}
            
            {problems?.length === 0 && (
              <div className="text-center py-20 text-muted-foreground bg-secondary/10 rounded-xl border-dashed border border-white/10">
                No problems found. Sync one to get started!
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
