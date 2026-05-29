import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Users, Trophy, Star, UserPlus, Share2, MessageCircle, CheckCircle2, Target, BookOpen, Zap } from "lucide-react";

const INTERESTS = ["AI", "Startups", "Fitness", "Fashion", "Photography", "Finance", "Tech", "Music"];

const ACHIEVEMENTS = [
  { name: "7-Day Streak", desc: "Consistent every day", color: "from-amber-500 to-orange-600", icon: Zap },
  { name: "Top Creator", desc: "Content legend", color: "from-purple-600 to-pink-600", icon: Star },
  { name: "Level 12", desc: "XP master", color: "from-cyan-500 to-blue-600", icon: Trophy },
];

const FRIENDS = [
  { initials: "ZK", name: "Zara K.", status: "online", color: "from-purple-600 to-pink-600" },
  { initials: "DM", name: "Dev M.", status: "online", color: "from-cyan-600 to-blue-600" },
  { initials: "AR", name: "Anika R.", status: "offline", color: "from-pink-600 to-rose-600" },
];

const TIMELINE = [
  { icon: Trophy, text: "Won the 30-Day Challenge", time: "2 days ago", color: "text-amber-400" },
  { icon: Users, text: "Joined AI Builders community", time: "5 days ago", color: "text-purple-400" },
  { icon: Target, text: "Completed Weekly Goal: Read 3 Articles", time: "1 week ago", color: "text-pink-400" },
  { icon: BookOpen, text: "Finished 'Atomic Habits'", time: "2 weeks ago", color: "text-cyan-400" },
  { icon: Zap, text: "Reached 2,000 XP milestone", time: "3 weeks ago", color: "text-[#D9FF00]" },
];

const STATS_CARDS = [
  { label: "Life Score", key: "lifeScore", default: 87, color: "#D9FF00" },
  { label: "Productivity", key: "productivityScore", default: 76, color: "#7C3AED" },
  { label: "Learning", key: "learningScore", default: 68, color: "#06B6D4" },
  { label: "Style", key: "styleScore", default: 71, color: "#EC4899" },
];

export default function Profile() {
  const { user } = useAuth();
  const { data: stats } = useGetDashboardStats();
  const xp = stats?.xp || user?.xp || 2450;
  const level = stats?.level || user?.level || 12;
  const xpPct = ((xp % 1000) / 1000) * 100;

  return (
    <div className="min-h-screen bg-[#050505] pb-12">
      {/* Cover + Avatar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <div className="h-40 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#D9FF00] relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>
        <div className="-mt-12 px-6 flex items-end justify-between flex-wrap gap-4">
          <div className="flex items-end gap-4">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-[#050505] flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              <span className="font-display text-3xl text-white">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
              </span>
            </div>
            <div className="pb-2">
              <h1 className="font-display text-3xl text-white uppercase">{user?.fullName || "User"}</h1>
              <p className="text-white/40 text-sm">@{user?.username || "genzuser"}</p>
            </div>
          </div>
          <div className="flex gap-2 pb-2">
            <Button size="sm" className="bg-[#D9FF00] text-black font-bold rounded-xl">
              <UserPlus className="h-4 w-4 mr-1" /> Add Friend
            </Button>
            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Bio + XP */}
      <div className="mb-6 px-0">
        <p className="text-white/50 text-sm mb-3">Building the future, one day at a time. AI enthusiast, startup founder, fitness grinder.</p>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-bold text-[#D9FF00] bg-[#D9FF00]/10 px-3 py-1 rounded-lg">Level {level}</span>
          <span className="text-xs text-white/40">{xp} / {level * 1000} XP</span>
        </div>
        <Progress value={xpPct} className="h-2 bg-white/5" />
        <div className="flex flex-wrap gap-2 mt-3">
          {INTERESTS.map((t) => (
            <span key={t} className="text-xs font-medium text-white/60 bg-white/5 border border-white/10 px-3 py-1 rounded-xl">{t}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
      >
        {STATS_CARDS.map((s) => {
          const val = (stats as Record<string, number> | undefined)?.[s.key] ?? s.default;
          return (
            <motion.div key={s.label} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <Card className="p-4 bg-[#111111] border-white/10 rounded-2xl text-center">
                <p className="font-display text-4xl" style={{ color: s.color }}>{val}</p>
                <p className="text-white/40 text-xs uppercase tracking-wider mt-1">{s.label}</p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Two Columns: Achievements + Friends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Achievements */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Achievements</p>
          <div className="space-y-3">
            {ACHIEVEMENTS.map((a) => (
              <Card key={a.name} className={`p-4 bg-gradient-to-r ${a.color} border-0 rounded-2xl flex items-center gap-4`}>
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <a.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-display text-xl text-white uppercase">{a.name}</p>
                  <p className="text-white/60 text-sm">{a.desc}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-white/60 ml-auto flex-shrink-0" />
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Friends */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase">Friends</p>
            <span className="text-white/30 text-xs">24 total</span>
          </div>
          <Card className="bg-[#111111] border-white/10 rounded-2xl p-4 space-y-3">
            {FRIENDS.map((f) => (
              <div key={f.name} className="flex items-center gap-3">
                <div className="relative">
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center font-bold text-white text-sm`}>
                    {f.initials}
                  </div>
                  {f.status === "online" && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#111111] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{f.name}</p>
                  <p className={`text-xs ${f.status === "online" ? "text-emerald-400" : "text-white/30"}`}>
                    {f.status === "online" ? "Online now" : "Offline"}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="text-white/40 hover:text-white text-xs">Message</Button>
              </div>
            ))}
            <Button className="w-full bg-[#D9FF00] text-black font-bold rounded-xl mt-2">
              <UserPlus className="h-4 w-4 mr-2" /> Invite Friends
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Activity Timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Activity Timeline</p>
        <Card className="bg-[#111111] border-white/10 rounded-2xl overflow-hidden">
          {TIMELINE.map((item, i) => (
            <div key={i} className="px-5 py-4 border-b border-white/5 last:border-0 flex items-center gap-4 hover:bg-white/5 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{item.text}</p>
                <p className="text-xs text-white/30">{item.time}</p>
              </div>
            </div>
          ))}
        </Card>
      </motion.div>
    </div>
  );
}
