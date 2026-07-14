import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Trophy, Search } from "lucide-react";
import { dataApi } from "@/lib/api/client";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

type SquadItem = {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  memberCount?: number;
  xp?: number;
  isFeatured?: boolean;
  tags?: string[];
  coverUrl?: string | null;
  avatarUrl?: string | null;
};

export default function Squads() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"featured" | "all">("all");

  const featuredQuery = useQuery({
    queryKey: ["squads", "featured"],
    queryFn: () => dataApi.getFeaturedSquads(),
  });
  const allQuery = useQuery({
    queryKey: ["squads", "all"],
    queryFn: async () => {
      const res = await dataApi.getSquads(1, 40);
      return Array.isArray(res) ? res : (res as { data?: unknown[] }).data ?? [];
    },
  });

  const squads = useMemo(() => {
    const featured = (featuredQuery.data ?? []) as SquadItem[];
    const listed = (allQuery.data ?? []) as SquadItem[];
    const merged = new Map<string, SquadItem>();
    for (const s of [...listed, ...featured]) merged.set(s.id, s);
    let items = [...merged.values()];
    if (sort === "featured") items = items.filter((s) => s.isFeatured);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(needle) ||
          s.category.toLowerCase().includes(needle) ||
          (s.description ?? "").toLowerCase().includes(needle) ||
          (s.tags ?? []).some((t) => t.toLowerCase().includes(needle)),
      );
    }
    return items.sort((a, b) => Number(b.memberCount ?? 0) - Number(a.memberCount ?? 0));
  }, [featuredQuery.data, allQuery.data, q, sort]);

  const loading = featuredQuery.isLoading || allQuery.isLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl uppercase">Squads</h1>
        <p className="text-muted-foreground mt-2">Join squads and grow with your crew.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search squads" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant={sort === "all" ? "default" : "outline"} onClick={() => setSort("all")}>Popular</Button>
          <Button variant={sort === "featured" ? "default" : "outline"} onClick={() => setSort("featured")}>Featured</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : squads.length === 0 ? (
        <Empty className="border border-border bg-card">
          <EmptyTitle>No squads yet</EmptyTitle>
          <EmptyDescription>Run the database seed to populate squads.</EmptyDescription>
        </Empty>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {squads.map((squad) => (
            <motion.div key={squad.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden bg-card border-border rounded-2xl">
                {squad.coverUrl ? (
                  <img src={squad.coverUrl} alt="" className="h-24 w-full object-cover" />
                ) : (
                  <div className="h-24 bg-gradient-to-r from-purple-700/40 to-pink-700/40" />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center overflow-hidden">
                      {squad.avatarUrl ? (
                        <img src={squad.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Users className="h-5 w-5 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold">{squad.name}</h3>
                      <p className="text-xs text-muted-foreground">{squad.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{squad.description ?? ""}</p>
                  <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                    <span>{Number(squad.memberCount ?? 0)} members</span>
                    <span className="flex items-center gap-1"><Trophy className="h-3 w-3" />{Number(squad.xp ?? 0)} XP</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
