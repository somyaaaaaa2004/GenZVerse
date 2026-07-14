import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { socialApi } from "@/lib/api/client";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function PublicProfile() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["social", "publicProfile", id],
    queryFn: () => socialApi.getPublicProfileById(id),
    enabled: Boolean(id),
  });

  const addFriendMutation = useMutation({
    mutationFn: () => socialApi.sendFriendRequest(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["social", "publicProfile", id] });
      void queryClient.invalidateQueries({ queryKey: ["social", "friendRequests"] });
    },
  });

  const data = profileQuery.data as
    | {
        user: { displayName: string | null; username: string | null; bio: string | null; level: number; xp: number | null; isFriend: boolean; avatarUrl: string | null };
      }
    | undefined;

  const initials = useMemo(
    () => (data?.user.displayName || data?.user.username || "U").charAt(0),
    [data],
  );

  return (
    <div className="space-y-6">
      <Link to="/dashboard/social" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to Social
      </Link>
      {profileQuery.isLoading ? (
        <Skeleton className="h-56 bg-white/5 rounded-2xl" />
      ) : !data ? (
        <Card className="bg-[#111] border-white/10 rounded-2xl p-6 text-white/60">Profile unavailable.</Card>
      ) : (
        <Card className="bg-[#111] border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {data.user.avatarUrl ? (
                <img src={data.user.avatarUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
              <div>
                <h1 className="text-white font-display text-3xl uppercase">{data.user.displayName || data.user.username}</h1>
                <p className="text-white/40">@{data.user.username ?? "unknown"}</p>
                <p className="text-white/60 text-sm mt-1">{data.user.bio || "No bio provided."}</p>
              </div>
            </div>
            <Button
              className={data.user.isFriend ? "bg-emerald-500/20 text-emerald-300" : "bg-[#D9FF00] text-black"}
              disabled={addFriendMutation.isPending || data.user.isFriend}
              onClick={() => addFriendMutation.mutate()}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              {data.user.isFriend ? "Friends" : "Add Friend"}
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 p-3 text-white/80">Level: {data.user.level}</div>
            <div className="rounded-xl border border-white/10 p-3 text-white/80">XP: {data.user.xp ?? "Hidden"}</div>
          </div>
        </Card>
      )}
    </div>
  );
}

