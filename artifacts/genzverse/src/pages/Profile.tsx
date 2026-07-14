import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/lib/api/client";
import { Users, Trophy, UserPlus, Share2, MessageCircle, CheckCircle2, Zap } from "lucide-react";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const STATS_CARDS = [
  { label: "Life Score", key: "lifeScore", color: "#D9FF00" },
  { label: "Productivity", key: "productivityScore", color: "#7C3AED" },
  { label: "Learning", key: "learningScore", color: "#06B6D4" },
  { label: "Style", key: "styleScore", color: "#EC4899" },
];

function readNumberField(obj: unknown, key: string): number {
  if (!obj || typeof obj !== "object") return 0;
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

const ACTIVITY_ICONS: Record<string, typeof CheckCircle2> = {
  onboarding: CheckCircle2,
  challenge: Trophy,
  squad: Users,
  task: CheckCircle2,
};

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.getProfile(),
  });

  const profileUser = data?.user ?? user;
  const xp = profileUser?.xp ?? 0;
  const level = profileUser?.level ?? 1;
  const xpPct = ((xp % 1000) / 1000) * 100;
  const interests = profileUser?.interests ?? [];
  const displayName = profileUser?.displayName || "User";
  const username = profileUser?.username || "set-username";
  const initial = displayName.charAt(0) || username.charAt(0) || "U";

  return (
    <div className="min-h-screen bg-[#050505] pb-12">
      {/* Header: banner → avatar overlap → identity block below banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <div className="relative">
          {/* Cover banner — top only, never covers text */}
          <div
            className="h-36 sm:h-44 md:h-52 w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#D9FF00]"
            style={
              profileUser?.bannerUrl
                ? {
                    backgroundImage: `url(${profileUser.bannerUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
            aria-hidden
          />

          {/* Avatar overlaps only the bottom edge of the banner */}
          <div className="absolute left-4 sm:left-6 bottom-0 translate-y-1/2 z-10">
            {profileUser?.avatarUrl ? (
              <img
                src={profileUser.avatarUrl}
                alt={`${displayName} avatar`}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-[#050505] object-cover shadow-lg bg-[#111]"
              />
            ) : (
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-[#050505] flex items-center justify-center shadow-lg">
                <span className="font-display text-3xl text-white">{initial}</span>
              </div>
            )}
          </div>
        </div>

        {/* Identity + actions sit fully below the banner (clear of cover) */}
        <div className="pt-14 sm:pt-16 px-1 sm:px-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <h1 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-tight truncate">
                {displayName}
              </h1>
              <p className="text-white/50 text-sm truncate">@{username}</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link to="/dashboard/social">
                <Button size="sm" className="bg-[#D9FF00] text-black font-bold rounded-xl">
                  <UserPlus className="h-4 w-4 mr-1" /> Find Friends
                </Button>
              </Link>
              <Link to="/dashboard/invites">
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 rounded-xl"
                onClick={async () => {
                  const shareUrl = `${window.location.origin}/dashboard/profile`;
                  await navigator.clipboard.writeText(shareUrl);
                  toast({ title: "Copied", description: "Profile link copied" });
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-white/60 text-sm mt-4 leading-relaxed max-w-2xl">
            {profileUser?.bio || "No bio yet."}
          </p>

          <div className="flex items-center gap-3 mt-4 mb-2">
            <span className="text-xs font-bold text-[#D9FF00] bg-[#D9FF00]/10 px-3 py-1 rounded-lg">
              Level {level}
            </span>
            <span className="text-xs text-white/40">{xp} XP</span>
          </div>
          <Progress value={xpPct} className="h-2 bg-white/5 max-w-md" />

          <div className="flex flex-wrap gap-2 mt-4">
            {interests.length > 0 ? (
              interests.map((t) => (
                <span
                  key={t}
                  className="text-xs font-medium text-white/60 bg-white/5 border border-white/10 px-3 py-1 rounded-xl"
                >
                  {t}
                </span>
              ))
            ) : (
              <span className="text-xs text-white/30">No interests added</span>
            )}
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {STATS_CARDS.map((s) => {
            const val = readNumberField(profileUser, s.key);
            return (
              <Card key={s.label} className="p-4 bg-[#111111] border-white/10 rounded-2xl text-center">
                <p className="font-display text-4xl" style={{ color: s.color }}>
                  {val}
                </p>
                <p className="text-white/40 text-xs uppercase tracking-wider mt-1">{s.label}</p>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Achievements</p>
          {isLoading ? (
            <Skeleton className="h-32 bg-white/5 rounded-2xl" />
          ) : (data?.achievements?.length ?? 0) === 0 ? (
            <Empty>
              <EmptyTitle className="text-white">No achievements yet</EmptyTitle>
              <EmptyDescription className="text-white/50">Complete challenges to earn badges.</EmptyDescription>
            </Empty>
          ) : (
            <div className="space-y-3">
              {data!.achievements.map((a) => (
                <Card
                  key={a.id}
                  className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 border-0 rounded-2xl flex items-center gap-4"
                >
                  <Trophy className="h-6 w-6 text-white" />
                  <div>
                    <p className="font-display text-xl text-white uppercase">{a.name}</p>
                    <p className="text-white/60 text-sm">{a.description}</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-white/60 ml-auto" />
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase">Friends</p>
            <span className="text-white/30 text-xs">{profileUser?.friendsCount ?? 0} total</span>
          </div>
          <Card className="bg-[#111111] border-white/10 rounded-2xl p-4 space-y-3">
            {isLoading ? (
              <Skeleton className="h-20 bg-white/5 rounded-xl" />
            ) : (data?.friends?.length ?? 0) === 0 ? (
              <Empty>
                <EmptyTitle className="text-white">No friends yet</EmptyTitle>
                <EmptyDescription className="text-white/50">Send friend requests to grow your network.</EmptyDescription>
              </Empty>
            ) : (
              data!.friends.map((f) => (
                <div key={f.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white text-sm">
                      {(f.displayName || f.username || "?").charAt(0)}
                    </div>
                    {f.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#111111]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{f.displayName || f.username}</p>
                    <p className={`text-xs ${f.isOnline ? "text-emerald-400" : "text-white/30"}`}>
                      {f.isOnline ? "Online now" : "Offline"}
                    </p>
                  </div>
                  <Link to={`/dashboard/profile/${f.id}`}>
                    <Button size="sm" variant="outline" className="border-white/15 text-white/70">
                      View
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

      <div>
        <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Activity Timeline</p>
        <Card className="bg-[#111111] border-white/10 rounded-2xl overflow-hidden">
          {isLoading ? (
            <Skeleton className="h-40 m-4 bg-white/5 rounded-xl" />
          ) : (data?.recentActivity?.length ?? 0) === 0 ? (
            <div className="p-8">
              <Empty>
                <EmptyTitle className="text-white">No activity yet</EmptyTitle>
                <EmptyDescription className="text-white/50">Your timeline will populate as you use GenZVerse.</EmptyDescription>
              </Empty>
            </div>
          ) : (
            data!.recentActivity.map((item) => {
              const Icon = ACTIVITY_ICONS[item.type] || Zap;
              return (
                <div key={item.id} className="px-5 py-4 border-b border-white/5 last:border-0 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[#D9FF00]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{item.description}</p>
                    <p className="text-xs text-white/30">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      </div>
    </div>
  );
}
