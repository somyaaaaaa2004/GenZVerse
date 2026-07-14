import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { socialApi } from "@/lib/api/client";
import { Search, UserPlus, Check, X, Users } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function Social() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [debounced, setDebounced] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const requestsQuery = useQuery({
    queryKey: ["social", "friendRequests"],
    queryFn: () => socialApi.getFriendRequests(),
  });

  const usersQuery = useInfiniteQuery({
    queryKey: ["social", "searchUsers", debounced],
    queryFn: ({ pageParam }) => socialApi.searchUsers(debounced, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: debounced.length > 0,
  });

  const users = useMemo(
    () => usersQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [usersQuery.data],
  );

  const requestMutation = useMutation({
    mutationFn: (recipientId: string) => socialApi.sendFriendRequest(recipientId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["social", "searchUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["social", "friendRequests"] }),
      ]);
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => socialApi.acceptFriendRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social", "friendRequests"] }),
  });
  const declineMutation = useMutation({
    mutationFn: (id: string) => socialApi.declineFriendRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social", "friendRequests"] }),
  });
  const cancelMutation = useMutation({
    mutationFn: (id: string) => socialApi.cancelFriendRequest(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["social", "friendRequests"] }),
        queryClient.invalidateQueries({ queryKey: ["social", "searchUsers"] }),
      ]);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-white uppercase">Social Network</h1>
        <p className="text-white/50 mt-2">Find people, add friends, and grow your community graph.</p>
      </div>

      <Card className="bg-[#111] border-white/10 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, name, email (if allowed), or user ID..."
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-[#111] border-white/10 p-4 lg:col-span-2 space-y-3">
          <h2 className="text-white font-bold">Search Results</h2>
          {usersQuery.isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 bg-white/5 rounded-xl" />)}
            </div>
          ) : debounced.length === 0 ? (
            <p className="text-white/40 text-sm">Start typing to discover users.</p>
          ) : users.length === 0 ? (
            <p className="text-white/40 text-sm">No users found.</p>
          ) : (
            <>
              {users.map((u) => (
                <div key={u.id} className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                      {(u.displayName || u.username || "?").charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate">{u.displayName || u.username || "Unknown"}</p>
                      <p className="text-xs text-white/40 truncate">@{u.username || "no-username"} · lvl {u.level} · {u.xp ?? "hidden"} XP</p>
                      <p className="text-xs text-white/30">
                        {u.mutualFriends} mutual friends · {u.mutualCommunities} mutual communities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/dashboard/profile/${u.id}`}>
                      <Button size="sm" variant="outline" className="border-white/20 text-white">
                        View
                      </Button>
                    </Link>
                    {u.relationship === "FRIEND" ? (
                      <Button size="sm" variant="outline" className="border-emerald-400/40 text-emerald-300">
                        Friends
                      </Button>
                    ) : u.relationship === "REQUEST_SENT" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white/60"
                        disabled={!u.outgoingRequestId || cancelMutation.isPending}
                        onClick={() => u.outgoingRequestId && cancelMutation.mutate(u.outgoingRequestId)}
                      >
                        Cancel
                      </Button>
                    ) : u.relationship === "REQUEST_RECEIVED" ? (
                      <Button size="sm" variant="outline" className="border-[#D9FF00]/40 text-[#D9FF00]">
                        Respond in requests
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-[#D9FF00] text-black font-bold"
                        disabled={requestMutation.isPending}
                        onClick={() => requestMutation.mutate(u.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {usersQuery.hasNextPage && (
                <Button
                  variant="outline"
                  className="w-full border-white/15 text-white"
                  onClick={() => usersQuery.fetchNextPage()}
                >
                  Load more
                </Button>
              )}
            </>
          )}
        </Card>

        <Card className="bg-[#111] border-white/10 p-4 space-y-3">
          <h2 className="text-white font-bold flex items-center gap-2"><Users className="h-4 w-4" /> Friend Requests</h2>
          {(requestsQuery.data?.incoming ?? []).length === 0 ? (
            <p className="text-white/40 text-sm">No incoming requests.</p>
          ) : (
            requestsQuery.data!.incoming.map((r) => (
              <div key={r.id} className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <p className="text-sm text-white font-medium">{r.sender.displayName || r.sender.username}</p>
                <p className="text-xs text-white/40">@{r.sender.username || "unknown"} · lvl {r.sender.level}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" className="bg-[#D9FF00] text-black" onClick={() => acceptMutation.mutate(r.id)}>
                    <Check className="h-3 w-3 mr-1" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/20 text-white" onClick={() => declineMutation.mutate(r.id)}>
                    <X className="h-3 w-3 mr-1" /> Decline
                  </Button>
                </div>
              </div>
            ))
          )}
          {(requestsQuery.data?.outgoing ?? []).length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">Outgoing requests</h3>
              <div className="space-y-2">
                {requestsQuery.data!.outgoing.map((r) => (
                  <div key={r.id} className="p-2 rounded-lg border border-white/10 flex items-center justify-between">
                    <span className="text-xs text-white/70">{r.recipient.displayName || r.recipient.username}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 border-white/20 text-white/70"
                      onClick={() => cancelMutation.mutate(r.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

