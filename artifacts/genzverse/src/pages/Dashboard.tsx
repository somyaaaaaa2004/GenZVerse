import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Flame, Zap, Target, CheckCircle2, Users, BookOpen, Sun, Bot, CalendarDays, Trophy, Bell, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { dashboardApi } from "@/lib/api/client";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

const SCORE_CARDS = [
  { key: "lifeScore", label: "Life Score", color: "#D9FF00" },
  { key: "productivityScore", label: "Productivity", color: "#7C3AED" },
  { key: "socialScore", label: "Social", color: "#EC4899" },
  { key: "learningScore", label: "Learning", color: "#06B6D4" },
  { key: "financeScore", label: "Finance", color: "#F59E0B" },
  { key: "styleScore", label: "Style", color: "#F97316" },
];

const ACTIVITY_ICONS: Record<string, typeof CheckCircle2> = {
  task: CheckCircle2,
  squad: Users,
  read: BookOpen,
  morning: Sun,
  upgrade: Zap,
  onboarding: CheckCircle2,
  challenge: Target,
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => dashboardApi.getOverview(),
  });
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardApi.getStats(),
  });
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: () => dashboardApi.getActivity(),
  });

  return (
    <div className="min-h-screen bg-[#050505] pb-12">
      <div className="mb-8">
        <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-1">Your Universe</p>
        <h1 className="font-display text-5xl text-white uppercase tracking-tight">
          Welcome Back,{" "}
          <span className="text-[#D9FF00]">{user?.displayName?.split(" ")[0] || user?.username || "User"}</span>
        </h1>
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            { icon: Flame, label: `${(overview?.summary as Record<string, number> | undefined)?.currentStreak ?? stats?.streak ?? user?.currentStreak ?? 0} Day Streak` },
            { icon: Zap, label: `Level ${(overview?.summary as Record<string, number> | undefined)?.level ?? stats?.level ?? user?.level ?? 1}` },
            { icon: Target, label: `${(overview?.summary as Record<string, number> | undefined)?.xp ?? stats?.xp ?? user?.xp ?? 0} XP` },
            { icon: CheckCircle2, label: `${(overview?.summary as Record<string, number> | undefined)?.dailyGoals ?? 0}% Daily Goal` },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
              <s.icon className="h-4 w-4 text-[#D9FF00]" />
              <span className="text-sm font-bold text-white">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-36 bg-white/5 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {SCORE_CARDS.map((card) => (
            <Card key={card.key} className="p-5 bg-[#111] border-white/10 rounded-2xl">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">{card.label}</p>
              <p className="font-display text-4xl text-white" style={{ color: card.color }}>
                {stats?.[card.key] ?? 0}
              </p>
            </Card>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        <Card className="bg-[#111] border-white/10 rounded-2xl p-5">
          <p className="text-white/40 text-xs uppercase mb-2">Today's Progress</p>
          {overviewLoading ? <Skeleton className="h-16 bg-white/5 rounded-xl" /> : (
            <>
              <p className="font-display text-4xl text-[#D9FF00]">
                {((overview?.summary as Record<string, number> | undefined)?.todayProgress ?? 0)} XP
              </p>
              <p className="text-sm text-white/50 mt-2">
                Daily goal: {((overview?.summary as Record<string, number> | undefined)?.dailyGoals ?? 0)}%
              </p>
            </>
          )}
        </Card>
        <Card className="bg-[#111] border-white/10 rounded-2xl p-5">
          <p className="text-white/40 text-xs uppercase mb-2">Weekly Report</p>
          {overviewLoading ? <Skeleton className="h-16 bg-white/5 rounded-xl" /> : (
            <>
              <p className="font-display text-4xl text-white">
                {((overview?.productivitySummary as Record<string, number> | undefined)?.weeklyXp ?? 0)}
              </p>
              <p className="text-sm text-white/50 mt-2">XP this week</p>
            </>
          )}
        </Card>
        <Card className="bg-[#111] border-white/10 rounded-2xl p-5">
          <p className="text-white/40 text-xs uppercase mb-2">Achievement Progress</p>
          {overviewLoading ? <Skeleton className="h-16 bg-white/5 rounded-xl" /> : (
            <>
              <p className="font-display text-4xl text-white">
                {((overview?.summary as Record<string, number> | undefined)?.achievementsCount ?? 0)}
              </p>
              <p className="text-sm text-white/50 mt-2">Achievements unlocked</p>
            </>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-8">
        <Card className="bg-[#111] border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl text-white uppercase">Active Challenges</h2>
            <Link to="/dashboard/challenges" className="text-xs text-[#D9FF00]">Open</Link>
          </div>
          {overviewLoading ? (
            <Skeleton className="h-24 bg-white/5 rounded-xl" />
          ) : (((overview?.activeChallenges as Array<Record<string, unknown>> | undefined) ?? []).length === 0 ? (
            <Empty>
              <EmptyTitle className="text-white">No active challenges</EmptyTitle>
              <EmptyDescription className="text-white/50">Join one to start building streaks.</EmptyDescription>
            </Empty>
          ) : (
            <div className="space-y-3">
              {((overview?.activeChallenges as Array<Record<string, unknown>> | undefined) ?? []).slice(0, 5).map((c) => (
                <div key={String(c.id)} className="rounded-xl border border-white/10 p-3">
                  <p className="text-sm font-semibold text-white">{String(c.title)}</p>
                  <p className="text-xs text-white/40">{Number(c.progress ?? 0)}/{Number(c.goal ?? 1)} · {Number(c.completionPercent ?? 0)}%</p>
                </div>
              ))}
            </div>
          ))}
        </Card>
        <Card className="bg-[#111] border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl text-white uppercase">Quick Actions</h2>
            <CalendarDays className="h-4 w-4 text-white/40" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/dashboard/challenges"><Button className="w-full bg-[#D9FF00] text-black"><Trophy className="h-4 w-4 mr-1" /> Challenges</Button></Link>
            <Link to="/dashboard/invites"><Button variant="outline" className="w-full border-white/20 text-white"><UserPlus className="h-4 w-4 mr-1" /> Invite</Button></Link>
            <Link to="/dashboard/social"><Button variant="outline" className="w-full border-white/20 text-white"><Users className="h-4 w-4 mr-1" /> Social</Button></Link>
            <Link to="/dashboard/settings"><Button variant="outline" className="w-full border-white/20 text-white"><Bell className="h-4 w-4 mr-1" /> Settings</Button></Link>
          </div>
        </Card>
      </div>

      <Card className="bg-[#111] border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-display text-xl text-white uppercase">Recent Activity</h2>
          <Link to="/dashboard/challenges" className="text-xs text-[#D9FF00]">View all</Link>
        </div>
        {activitiesLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 bg-white/5 rounded-xl" />)}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8">
            <Empty>
              <EmptyTitle className="text-white">No activity yet</EmptyTitle>
              <EmptyDescription className="text-white/50">Complete challenges and tasks to build your feed.</EmptyDescription>
            </Empty>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {activities.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type] || CheckCircle2;
              return (
                <div key={activity.id} className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[#181818] border border-white/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{activity.description}</p>
                    <p className="text-xs text-white/30">{new Date(activity.createdAt).toLocaleDateString()}</p>
                  </div>
                  {activity.xpEarned ? (
                    <span className="text-xs font-bold text-black bg-[#D9FF00] px-2 py-0.5 rounded-lg">+{activity.xpEarned} XP</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="mt-6 p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-white/10 rounded-2xl flex items-center gap-4">
        <Bot className="h-10 w-10 text-[#D9FF00]" />
        <div className="flex-1">
          <h3 className="font-display text-lg text-white uppercase">AI Companion</h3>
          <p className="text-white/50 text-sm">Get personalized coaching based on your real progress.</p>
        </div>
        <Link to="/dashboard/ai-companion" className="text-sm font-bold text-[#D9FF00]">Open →</Link>
      </Card>
    </div>
  );
}
