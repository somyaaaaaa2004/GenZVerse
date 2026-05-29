import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetFeaturedSquads } from "@workspace/api-client-react";
import { Users, Plus, Zap, Trophy, ArrowRight, Crown, Star } from "lucide-react";

const MY_SQUADS = [
  { name: "Startup Squad", desc: "Build the next unicorn together", members: 12, online: 4, xp: 2400, color: "from-purple-600 to-indigo-600" },
  { name: "Fitness & Grind", desc: "Daily workouts, daily gains", members: 8, online: 2, xp: 1800, color: "from-emerald-600 to-teal-600" },
  { name: "Creator Studio", desc: "Content, design, and creativity", members: 15, online: 7, xp: 3100, color: "from-pink-600 to-rose-600" },
];

const LEADERBOARD = [
  { rank: 1, name: "Tech Titans", xp: 8420, icon: Crown },
  { rank: 2, name: "Creator Studio", xp: 6310, icon: Star },
  { rank: 3, name: "Startup Squad", xp: 5200, icon: Trophy },
  { rank: 4, name: "Fitness & Grind", xp: 4180, icon: Zap },
  { rank: 5, name: "Music Makers", xp: 3950, icon: Users },
];

const FEED = [
  { text: "Alex joined Startup Squad", time: "2m ago" },
  { text: "Startup Squad reached 2,400 XP", time: "1h ago" },
  { text: "Priya created a new squad goal", time: "3h ago" },
  { text: "Fitness & Grind completed a challenge", time: "5h ago" },
  { text: "Creator Studio hit 15 members", time: "8h ago" },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function Squads() {
  const { data: featuredSquads } = useGetFeaturedSquads();

  return (
    <div className="min-h-screen bg-[#050505] pb-12">
      <motion.div initial="hidden" animate="show" variants={stagger} className="mb-8">
        <motion.p variants={fadeUp} className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-1">Squad Hub</motion.p>
        <motion.h1 variants={fadeUp} className="font-display text-5xl text-white uppercase tracking-tight">
          Your <span className="text-[#D9FF00]">Squads</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="text-white/40 mt-2">Find your people, conquer together</motion.p>
      </motion.div>

      <motion.div initial="hidden" animate="show" variants={stagger} className="mb-10">
        <motion.p variants={fadeUp} className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">My Squads</motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MY_SQUADS.map((squad) => (
            <motion.div key={squad.name} variants={fadeUp}>
              <Card className="p-5 bg-[#111111] border-white/10 rounded-2xl hover:border-white/20 transition-all group">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${squad.color} mb-4 flex items-center justify-center shadow-lg`}>
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-display text-2xl text-white uppercase">{squad.name}</h3>
                <p className="text-white/40 text-sm mt-1 mb-3">{squad.desc}</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    <span className="text-xs text-white/50">{squad.online} online</span>
                  </div>
                  <span className="text-white/20">·</span>
                  <span className="text-xs text-white/50">{squad.members} members</span>
                  <span className="ml-auto text-xs font-bold text-black bg-[#D9FF00] px-2 py-0.5 rounded-lg">{(squad.xp / 1000).toFixed(1)}K XP</span>
                </div>
                <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold group-hover:border-[#D9FF00]/50 transition-all">
                  View Squad <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            </motion.div>
          ))}
          <motion.div variants={fadeUp}>
            <Card className="p-5 bg-[#111111] border-dashed border-white/20 rounded-2xl hover:border-[#D9FF00]/50 transition-all cursor-pointer h-full flex flex-col items-center justify-center text-center min-h-[200px] group">
              <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-white/20 group-hover:border-[#D9FF00]/50 flex items-center justify-center mb-4 transition-all">
                <Plus className="h-8 w-8 text-white/30 group-hover:text-[#D9FF00] transition-colors" />
              </div>
              <h3 className="font-display text-xl text-white/50 group-hover:text-white uppercase transition-colors">Create Squad</h3>
              <p className="text-white/30 text-sm mt-1">Start your own crew</p>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <motion.div initial="hidden" animate="show" variants={stagger} className="lg:col-span-2">
          <motion.p variants={fadeUp} className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Featured Squads</motion.p>
          <div className="space-y-3">
            {(featuredSquads && featuredSquads.length > 0 ? featuredSquads : [
              { id: 1, name: "Tech Titans", description: "Build the future with code", memberCount: 234, category: "Tech" },
              { id: 2, name: "Hustle Culture", description: "Entrepreneurs grinding daily", memberCount: 189, category: "Business" },
              { id: 3, name: "Fit Nation", description: "Health is wealth squad", memberCount: 312, category: "Fitness" },
              { id: 4, name: "Music Makers", description: "Producers and artists united", memberCount: 156, category: "Music" },
            ]).map((squad) => (
              <motion.div key={squad.id} variants={fadeUp}>
                <Card className="p-4 bg-[#111111] border-white/10 rounded-2xl hover:border-white/20 transition-all flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex-shrink-0 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">{squad.name}</p>
                    <p className="text-white/40 text-sm truncate">{squad.description}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-white/40">{squad.memberCount} members</span>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 rounded-xl font-bold">Join</Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Leaderboard</p>
          <Card className="bg-[#111111] border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-display text-xl text-white uppercase flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#D9FF00]" /> Top Squads
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {LEADERBOARD.map((item) => (
                <div key={item.rank} className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
                  <span className={`font-display text-2xl w-8 text-center ${item.rank === 1 ? "text-[#D9FF00]" : "text-white/30"}`}>{item.rank}</span>
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-600/40 to-pink-600/40 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="flex-1 text-sm font-bold text-white">{item.name}</span>
                  <span className="text-xs font-bold text-[#D9FF00]">{(item.xp / 1000).toFixed(1)}K XP</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Squad Activity Feed</p>
        <Card className="bg-[#111111] border-white/10 rounded-2xl overflow-hidden">
          {FEED.map((item, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
              <div className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.5)] flex-shrink-0" />
              <span className="text-sm text-white/70 flex-1">{item.text}</span>
              <span className="text-xs text-white/30 flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </Card>
      </motion.div>
    </div>
  );
}
