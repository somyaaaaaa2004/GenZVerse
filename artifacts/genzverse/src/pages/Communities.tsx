import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UsersRound } from "lucide-react";
import { socialApi } from "@/lib/api/client";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useEffect, useState } from "react";

export default function Communities() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  const discoverQuery = useInfiniteQuery({
    queryKey: ["communities", "discover", debounced],
    queryFn: ({ pageParam }) =>
      socialApi.discoverCommunities({
        q: debounced || undefined,
        sort: "trending",
        cursor: pageParam,
        limit: 12,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const joinMutation = useMutation({
    mutationFn: (communityId: string) => socialApi.joinCommunity(communityId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["communities", "discover"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });

  const isLoading = discoverQuery.isLoading;
  const items = discoverQuery.data?.pages.flatMap((p) => p.items) ?? [];

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-white uppercase">Communities</h1>
        <p className="text-white/50 mt-2">Find your people and grow together.</p>
        <div className="mt-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities, tags, categories..."
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-36 bg-white/5 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <Empty className="border border-white/10 bg-[#111]">
          <EmptyTitle className="text-white">No communities yet</EmptyTitle>
          <EmptyDescription className="text-white/50">Communities will appear here once created.</EmptyDescription>
        </Empty>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5 bg-[#111] border-white/10 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <UsersRound className="h-5 w-5 text-pink-400" />
                  <h3 className="font-bold text-white">{c.name}</h3>
                </div>
                <p className="text-sm text-white/50 line-clamp-2">{c.description ?? ""}</p>
                <p className="text-xs text-white/30 mt-3">{c.memberCount} members · {c.category}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-white/40">
                    {c.visibility === "PUBLIC" ? "Public" : c.visibility === "PRIVATE" ? "Private" : "Invite only"}
                  </div>
                  <Button
                    size="sm"
                    disabled={joinMutation.isPending || c.joined}
                    onClick={() => joinMutation.mutate(c.id)}
                    className={c.joined ? "bg-emerald-500/20 text-emerald-300" : "bg-[#D9FF00] text-black"}
                  >
                    {c.joined ? "Joined" : "Join"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      {discoverQuery.hasNextPage && (
        <Button
          variant="outline"
          className="w-full border-white/20 text-white"
          onClick={() => discoverQuery.fetchNextPage()}
        >
          Load more communities
        </Button>
      )}
    </div>
  );
}
