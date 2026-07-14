import { useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Bookmark, Heart, Plus, Play, Pause, Copy, Trash2 } from "lucide-react";
import { challengeApi } from "@/lib/api/client";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

export default function Challenges() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const challengesQuery = useInfiniteQuery({
    queryKey: ["challenges", "list", search, category],
    queryFn: ({ pageParam }) =>
      challengeApi.list({
        q: search || undefined,
        category: category || undefined,
        cursor: pageParam,
        limit: 12,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      challengeApi.create({
        title: "Custom Challenge",
        description: "Track your daily progress and build consistency.",
        category: "Custom",
        challengeType: "DAILY",
        goal: 7,
        xpReward: 120,
        difficulty: "MEDIUM",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["challenges", "list"] }),
  });
  const joinMutation = useMutation({
    mutationFn: (id: string) => challengeApi.join(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["challenges", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });
  const checkinMutation = useMutation({
    mutationFn: (id: string) => challengeApi.checkin(id, { progress: 1 }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["challenges", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "activity"] });
    },
  });
  const bookmarkMutation = useMutation({
    mutationFn: (id: string) => challengeApi.bookmark(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["challenges", "list"] }),
  });
  const likeMutation = useMutation({
    mutationFn: (id: string) => challengeApi.like(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["challenges", "list"] }),
  });
  const duplicateMutation = useMutation({
    mutationFn: (id: string) => challengeApi.duplicate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["challenges", "list"] }),
  });
  const pauseMutation = useMutation({
    mutationFn: ({ id, paused }: { id: string; paused: boolean }) =>
      paused ? challengeApi.resume(id) : challengeApi.pause(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["challenges", "list"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => challengeApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["challenges", "list"] }),
  });

  const isLoading = challengesQuery.isLoading;
  const items = useMemo(
    () => challengesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [challengesQuery.data],
  ) as Array<Record<string, unknown>>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-white uppercase">Challenges</h1>
        <p className="text-white/50 mt-2">Complete challenges to earn XP and level up.</p>
        <div className="mt-4 grid md:grid-cols-3 gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search challenges..."
            className="bg-white/5 border-white/10 text-white"
          />
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Filter by category"
            className="bg-white/5 border-white/10 text-white"
          />
          <Button className="bg-[#D9FF00] text-black" onClick={() => createMutation.mutate()}>
            <Plus className="h-4 w-4 mr-1" /> Create Challenge
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 bg-white/5 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <Empty className="border border-white/10 bg-[#111]">
          <EmptyTitle className="text-white">No active challenges</EmptyTitle>
          <EmptyDescription className="text-white/50">Check back soon for new challenges.</EmptyDescription>
        </Empty>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <motion.div key={String(c.id)} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="p-5 bg-[#111] border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#D9FF00]/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-[#D9FF00]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{String(c.title)}</h3>
                  <p className="text-sm text-white/50">{String(c.description ?? "")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#D9FF00]">+{Number(c.xpReward ?? 0)} XP</p>
                    <p className="text-xs text-white/30">
                      {String(c.difficulty)} · {Number(c.daysLeft ?? 0)}d left
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-2 text-xs text-white/50">
                  <div>
                    Progress: {Number(c.progress ?? 0)}/{Number(c.goal ?? 1)} (
                    {Number(c.completion ?? 0)}%)
                  </div>
                  <div>Participants: {Number(c.participantCount ?? 0)}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-[#D9FF00] text-black"
                    onClick={() => joinMutation.mutate(String(c.id))}
                    disabled={Boolean(c.joined) || joinMutation.isPending}
                  >
                    <Play className="h-3 w-3 mr-1" /> {c.joined ? "Joined" : "Join"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white"
                    onClick={() => checkinMutation.mutate(String(c.id))}
                    disabled={!Boolean(c.joined) || Boolean(c.completed) || checkinMutation.isPending}
                  >
                    Check-in
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white"
                    onClick={() => bookmarkMutation.mutate(String(c.id))}
                  >
                    <Bookmark className="h-3 w-3 mr-1" /> Bookmark
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white"
                    onClick={() => likeMutation.mutate(String(c.id))}
                  >
                    <Heart className="h-3 w-3 mr-1" /> Like
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white"
                    onClick={() =>
                      pauseMutation.mutate({ id: String(c.id), paused: Boolean(c.isPaused) })
                    }
                  >
                    <Pause className="h-3 w-3 mr-1" /> {c.isPaused ? "Resume" : "Pause"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white"
                    onClick={() => duplicateMutation.mutate(String(c.id))}
                  >
                    <Copy className="h-3 w-3 mr-1" /> Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/40 text-red-300"
                    onClick={() => deleteMutation.mutate(String(c.id))}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      {challengesQuery.hasNextPage && (
        <Button
          variant="outline"
          className="w-full border-white/20 text-white"
          onClick={() => challengesQuery.fetchNextPage()}
        >
          Load more challenges
        </Button>
      )}
    </div>
  );
}
