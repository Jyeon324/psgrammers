import { useState, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useProblems, useSyncProblem, useDeleteProblem } from "@/hooks/use-problems";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2, ArrowRight, Trash2, Filter, ArrowUpDown } from "lucide-react";
import { TierBadge } from "@/components/TierBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const syncSchema = z.object({
  bojId: z.coerce.number().min(1000, "Invalid BOJ ID"),
});

type SortOption = "id" | "level" | "title";

export default function Problems() {
  const [search, setSearch] = useState("");
  const [sortBy, setBy] = useState<SortOption>("id");
  const [filterTier, setFilterTier] = useState<string>("all");

  const { data: rawProblems, isLoading } = useProblems({ search });
  const [open, setOpen] = useState(false);

  const syncProblem = useSyncProblem();
  const deleteProblem = useDeleteProblem();
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

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this problem? All associated solutions will also be deleted.")) return;
    try {
      await deleteProblem.mutateAsync(id);
      toast({ title: "Deleted", description: "Problem removed from library" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredAndSortedProblems = useMemo(() => {
    if (!rawProblems) return [];

    let result = [...rawProblems];

    // Tier Filter
    if (filterTier !== "all") {
      const tierRange = filterTier.split("-").map(Number);
      result = result.filter(p => (p.tier || 0) >= tierRange[0] && (p.tier || 0) <= tierRange[1]);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "id") return a.bojId - b.bojId;
      if (sortBy === "level") return (b.tier || 0) - (a.tier || 0);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [rawProblems, sortBy, filterTier]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 tracking-tight">Problems</h1>
              <p className="text-muted-foreground">Practice and solve algorithms.</p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-lg shadow-primary/20">
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

          <div className="flex flex-wrap items-center gap-4 p-4 bg-secondary/10 rounded-xl border border-white/5 backdrop-blur-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or ID..."
                className="pl-9 bg-black/20 border-white/10 focus:border-primary/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" /> Sort
              </span>
              <Select value={sortBy} onValueChange={(v) => setBy(v as SortOption)}>
                <SelectTrigger className="w-32 bg-black/20 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">ID</SelectItem>
                  <SelectItem value="level">Level</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                <Filter className="w-3 h-3" /> Tier
              </span>
              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger className="w-40 bg-black/20 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="1-5">Bronze</SelectItem>
                  <SelectItem value="6-10">Silver</SelectItem>
                  <SelectItem value="11-15">Gold</SelectItem>
                  <SelectItem value="16-20">Platinum</SelectItem>
                  <SelectItem value="21-30">Diamond+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedProblems.map((problem) => (
              <div
                key={problem.id}
                className="group flex items-center justify-between p-6 bg-secondary/10 rounded-xl border border-white/5 hover:border-primary/30 hover:bg-secondary/20 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-center gap-6">
                  <div className="text-2xl font-mono font-bold text-muted-foreground/20 w-16 group-hover:text-primary/40 transition-colors">
                    {problem.bojId}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors tracking-tight">
                      {problem.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <TierBadge tier={problem.tier || 0} />
                      <div className="flex gap-1">
                        {problem.category?.split(',').map((tag: string, idx: number) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-muted-foreground font-medium border border-white/5">
                            {tag.trim()}
                          </span>
                        )) || <span className="text-xs text-muted-foreground/50 italic">No tags</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(problem.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Link href={`/solve/${problem.id}`}>
                    <Button variant="secondary" className="group/btn">
                      Solve <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {filteredAndSortedProblems.length === 0 && (
              <div className="text-center py-20 text-muted-foreground bg-secondary/5 rounded-xl border-dashed border border-white/10 italic">
                No problems matching your selection. Try adjusting filters or sync a new problem!
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
