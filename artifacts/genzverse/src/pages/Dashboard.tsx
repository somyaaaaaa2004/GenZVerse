import { useGetDashboardStats, useGetDashboardActivity } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { Flame, Zap, Target, TrendingUp, TrendingDown, CheckCircle2, Users, BookOpen, Sun, ArrowRight, Bot } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

const SCORE_CARDS = [
  { key: "lifeScore", label: "Life Score", color: "#D9FF00", bg: "from-[#D9FF00]/20 to-transparent", trend: +12 },
  { key: "productivityScore", label: "Productivity", color: "#7C3AED", bg: "from-purple-600/20 to-transparent", trend: +8 },
  { key: "socialScore", label: "Social", color: "#EC4899", bg: "from-pink-500/20 to-transparent", trend: -3 },
  { key: "learningScore", label: "Learning", color: "#06B6D4", bg: "from-cyan-500/20 to-transparent", trend: +5 },
  { key: "financeScore", label: "Finance", color: "#F59E0B", bg: "from-amber-500/20 to-transparent", trend: +2 },
  { key: "styleScore", label: "Style", color: "#F97316", bg: "from-orange-500/20 to-transparent", trend: +7 },
];

const SQUAD_DATA = [
  { name: "Startup Squad", members: 12, online: 4, xp: 2400 },
  { name: "Fitness & Grind", members: 8, online: 2, xp: 1800 },
  { name: "Creator Studio", members: 15, online: 7, xp: 3100 },
];

const ACTIVITY_ICONS: Record<string, typeof CheckCircle2> = {
  task: CheckCircle2,
  squad: Users,
  read: BookOpen,
  morning: Sun,
  upgrade: Zap,
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useGetDashboardActivity();

  const statsValues: Record<string, number> = {
    lifeScore: stats?.lifeScore || 87,
    productivityScore: stats?.productivityScore || 76,
    socialScore: stats?.socialScore || 82,
    learningScore: stats?.learningScore || 68,
    financeScore: stats?.financeScore || 54,
    styleScore: stats?.styleScore || 71,
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-12">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger}
        className="mb-8"
      >
        <motion.p variants={fadeUp} className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-1">
          Your Universe
        </motion.p>
        <motion.h1 variants={fadeUp} className="font-display text-5xl text-white uppercase tracking-tight">
          Welcome Back,{" "}
          <span className="text-[#D9FF00]">{user?.fullName?.split(" ")[0] || user?.username || "Legend"}</span>
        </motion.h1>

        {/* Quick stats row */}
        <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mt-4">
          {[
            { icon: Flame, label: `${stats?.streak || 7} Day Streak`, color: "text-orange-400", bg: "bg-orange-500/10" },
            { icon: Zap, label: `Level ${stats?.level || 12}`, color: "text-[#D9FF00]", bg: "bg-[#D9FF00]/10" },
            { icon: Target, label: `${stats?.xp || 2450} XP`, color: "text-purple-400", bg: "bg-purple-500/10" },
            { icon: CheckCircle2, label: "14 Tasks Done", color: "text-cyan-400", bg: "bg-cyan-500/10" },
          ].map((s) => (
            <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${s.bg} border border-white/5`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-sm font-bold text-white">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Score Cards Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-36 bg-white/5 rounded-2xl" />)}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
        >
          {SCORE_CARDS.map((card) => {
            const value = statsValues[card.key];
            return (
              <motion.div key={card.key} variants={fadeUp}>
                <Card className={`p-5 bg-[#111111] border-white/10 rounded-2xl relative overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} pointer-events-none`} />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase">{card.label}</p>
                      <p className="font-display text-5xl mt-1" style={{ color: card.color }}>{value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {card.trend >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                        <span className={`text-xs font-bold ${card.trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {card.trend >= 0 ? "+" : ""}{card.trend}%
                        </span>
                      </div>
                    </div>
                    <div className="w-16 h-16">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          innerRadius="60%"
                          outerRadius="100%"
                          data={[{ value, fill: card.color }]}
                          startAngle={90}
                          endAngle={90 - (value / 100) * 360}
                        >
                          <RadialBar background={{ fill: "#ffffff10" }} dataKey="value" />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Two column: Activity + Squads */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger}
        className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8"
      >
        {/* Activity Feed */}
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl text-white uppercase">Recent Activity</h2>
            <span className="text-white/30 text-xs font-bold tracking-widest uppercase">This Week</span>
          </div>
          <Card className="bg-[#111111] border-white/10 rounded-2xl overflow-hidden">
            {activitiesLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 bg-white/5 rounded-xl" />)}
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {(activities && activities.length > 0 ? activities : [
                  { id: 1, description: "Completed Morning Routine challenge", xpEarned: 50, createdAt: new Date().toISOString(), type: "morning" },
                  { id: 2, description: "Read 20 pages of Atomic Habits", xpEarned: 30, createdAt: new Date().toISOString(), type: "read" },
                  { id: 3, description: "Joined Startup Squad session", xpEarned: 20, createdAt: new Date().toISOString(), type: "squad" },
                  { id: 4, description: "Leveled up to Level 12", xpEarned: 100, createdAt: new Date().toISOString(), type: "upgrade" },
                  { id: 5, description: "Completed Daily Challenge: Run 5K", xpEarned: 75, createdAt: new Date().toISOString(), type: "task" },
                ]).map((activity) => {
                  const Icon = ACTIVITY_ICONS[(activity as Record<string, string>).type as string] || CheckCircle2;
                  return (
                    <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-[#181818] border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-white/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{activity.description}</p>
                        <p className="text-xs text-white/30">{new Date(activity.createdAt).toLocaleDateString()}</p>
                      </div>
                      {activity.xpEarned ? (
                        <span className="text-xs font-bold text-black bg-[#D9FF00] px-2 py-0.5 rounded-lg flex-shrink-0">+{activity.xpEarned} XP</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Squad Activity */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl text-white uppercase">My Squads</h2>
            <Link href="/dashboard/squads">
              <span className="text-[#D9FF00] text-xs font-bold tracking-widest uppercase flex items-center gap-1 hover:opacity-80 cursor-pointer">
                View All <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
          <div className="space-y-3">
            {SQUAD_DATA.map((squad) => (
              <Card key={squad.name} className="p-4 bg-[#111111] border-white/10 rounded-2xl hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{squad.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      <span className="text-xs text-white/40">{squad.online} online · {squad.members} members</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-black bg-[#D9FF00] px-2 py-1 rounded-lg">{(squad.xp / 1000).toFixed(1)}K XP</span>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* AI Companion Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-5 bg-gradient-to-r from-purple-900/40 to-pink-900/20 border-purple-500/30 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-1">AI Companion</p>
              <Input
                placeholder="Ask your AI twin anything..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10"
              />
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 h-10 px-5 rounded-xl font-bold shrink-0">
              Ask
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
