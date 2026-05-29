import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGetChallenges } from "@workspace/api-client-react";
import { Flame, Trophy, Target, Zap, Users, Calendar, CheckCircle2, Clock } from "lucide-react";

const TABS = ["Daily", "Weekly", "Monthly", "Friend", "Squad"];

const SAMPLE_CHALLENGES = [
  { id: 1, title: "Morning Run 5K", category: "Fitness", difficulty: "Medium", xp: 75, participants: 1240, daysLeft: 1, progress: 60 },
  { id: 2, title: "Read 30 Pages", category: "Learning", difficulty: "Easy", xp: 40, participants: 3200, daysLeft: 1, progress: 80 },
  { id: 3, title: "No Social Media", category: "Mindset", difficulty: "Hard", xp: 150, participants: 890, daysLeft: 1, progress: 45 },
  { id: 4, title: "Code for 2 Hours", category: "Tech", difficulty: "Medium", xp: 80, participants: 2100, daysLeft: 3, progress: 0 },
  { id: 5, title: "Drink 3L Water", category: "Health", difficulty: "Easy", xp: 30, participants: 5600, daysLeft: 1, progress: 100 },
  { id: 6, title: "Meditate 20min", category: "Wellness", difficulty: "Easy", xp: 50, participants: 4100, daysLeft: 2, progress: 0 },
];

const LEADERBOARD = [
  { rank: 1, name: "Zara K.", xp: 4820, avatar: "ZK" },
  { rank: 2, name: "Dev M.", xp: 4210, avatar: "DM" },
  { rank: 3, name: "Alex R.", xp: 3980, avatar: "AR" },
  { rank: 4, name: "Priya S.", xp: 3740, avatar: "PS" },
  { rank: 5, name: "You", xp: 2450, avatar: "ME", isMe: true },
];

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Hard: "bg-red-500/20 text-red-400 border-red-500/30",
};

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function Challenges() {
  const [activeTab, setActiveTab] = useState("Daily");
  const { data: apiChallenges } = useGetChallenges();

  const challenges = (apiChallenges && apiChallenges.length > 0)
    ? apiChallenges.map((c, i) => ({ ...SAMPLE_CHALLENGES[i % SAMPLE_CHALLENGES.length], ...c }))
    : SAMPLE_CHALLENGES;

  return (
    <div className="min-h-screen bg-[#050505] pb-12">
      <motion.div initial="hidden" animate="show" variants={stagger} className="mb-8">
        <motion.p variants={fadeUp} className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-1">Challenge Center</motion.p>
        <motion.h1 variants={fadeUp} className="font-display text-5xl text-white uppercase tracking-tight">
          Level Up Your <span className="text-[#D9FF00]">Life</span>
        </motion.h1>

        {/* Stats Row */}
        <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-white/5">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-bold text-white">7-Day Streak</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#D9FF00]/10 border border-white/5">
            <Zap className="h-4 w-4 text-[#D9FF00]" />
            <span className="text-sm font-bold text-white">2,450 XP Earned</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-white/5">
            <Trophy className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-bold text-white">34 Challenges Won</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-[#D9FF00] text-black"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenge Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Challenges */}
          <div>
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">In Progress</p>
            <div className="space-y-3">
              {challenges.filter(c => c.progress > 0 && c.progress < 100).slice(0, 2).map((c) => (
                <Card key={c.id} className="p-5 bg-[#111111] border-white/10 rounded-2xl border-l-4 border-l-[#D9FF00]">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{c.category}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${DIFFICULTY_STYLES[c.difficulty] || DIFFICULTY_STYLES.Medium}`}>{c.difficulty}</span>
                      </div>
                      <h3 className="font-display text-xl text-white uppercase">{c.title}</h3>
                    </div>
                    <span className="text-xs font-bold text-black bg-[#D9FF00] px-2 py-1 rounded-lg flex-shrink-0">+{c.xp} XP</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-white/40">
                      <span>Progress</span>
                      <span>{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-2 bg-white/5" />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* All Challenges */}
          <div>
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Available Challenges</p>
            <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-3">
              {challenges.map((c) => (
                <motion.div key={c.id} variants={fadeUp}>
                  <Card className="p-5 bg-[#111111] border-white/10 rounded-2xl hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Target className="h-6 w-6 text-white/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-bold text-white/40 uppercase">{c.category}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${DIFFICULTY_STYLES[c.difficulty] || DIFFICULTY_STYLES.Medium}`}>{c.difficulty}</span>
                          {c.progress === 100 && <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Done</span>}
                        </div>
                        <p className="font-bold text-white">{c.title}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-white/30 flex items-center gap-1"><Users className="h-3 w-3" />{c.participants.toLocaleString()}</span>
                          <span className="text-xs text-white/30 flex items-center gap-1"><Clock className="h-3 w-3" />{c.daysLeft}d left</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-xs font-bold text-black bg-[#D9FF00] px-2 py-1 rounded-lg">+{c.xp} XP</span>
                        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 rounded-xl font-bold text-xs">Accept</Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Leaderboard Sidebar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">This Week</p>
          <Card className="bg-[#111111] border-white/10 rounded-2xl overflow-hidden mb-4">
            <div className="p-4 border-b border-white/5 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#D9FF00]" />
              <h3 className="font-display text-xl text-white uppercase">Leaderboard</h3>
            </div>
            <div className="divide-y divide-white/5">
              {LEADERBOARD.map((u) => (
                <div key={u.rank} className={`p-4 flex items-center gap-3 ${u.isMe ? "bg-[#D9FF00]/5 border-l-2 border-[#D9FF00]" : "hover:bg-white/5"} transition-colors`}>
                  <span className={`font-display text-xl w-6 ${u.rank === 1 ? "text-[#D9FF00]" : "text-white/30"}`}>{u.rank}</span>
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{u.avatar}</span>
                  </div>
                  <span className={`flex-1 text-sm font-bold ${u.isMe ? "text-[#D9FF00]" : "text-white"}`}>{u.name}</span>
                  <span className="text-xs font-bold text-white/50">{u.xp.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Calendar */}
          <Card className="bg-[#111111] border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-purple-400" />
              <h3 className="font-display text-xl text-white uppercase">Streak</h3>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 21 }, (_, i) => (
                <div
                  key={i}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i < 7 ? "bg-[#D9FF00] text-black" :
                    i < 14 ? "bg-[#D9FF00]/40 text-black/60" :
                    "bg-white/5 text-white/20"
                  }`}
                >
                  {i < 7 ? <Flame className="h-3 w-3" /> : "·"}
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs mt-3 text-center">7-day challenge streak — keep it up!</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
