import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { AreaChart, Area, RadialBarChart, RadialBar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Share2, Download, Sparkles, Trophy, Users, BookOpen, Zap, Target, Star } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const XP_DATA = [
  { month: "Jan", xp: 820 }, { month: "Feb", xp: 940 }, { month: "Mar", xp: 1100 },
  { month: "Apr", xp: 980 }, { month: "May", xp: 1320 }, { month: "Jun", xp: 1650 },
  { month: "Jul", xp: 1480 }, { month: "Aug", xp: 1820 }, { month: "Sep", xp: 2100 },
  { month: "Oct", xp: 1950 }, { month: "Nov", xp: 2400 }, { month: "Dec", xp: 2450 },
];

const SCORE_RINGS = [
  { name: "Life", value: 87, fill: "#D9FF00" },
  { name: "Productivity", value: 76, fill: "#7C3AED" },
  { name: "Social", value: 82, fill: "#EC4899" },
  { name: "Learning", value: 68, fill: "#06B6D4" },
];

const TOP_MOMENTS = [
  { icon: Trophy, title: "Completed 30-Day Challenge", subtitle: "October · 150 XP earned", color: "from-amber-600 to-orange-600" },
  { icon: Users, title: "Joined 5 New Communities", subtitle: "September · 200 XP earned", color: "from-purple-600 to-indigo-600" },
  { icon: Star, title: "Reached Level 12", subtitle: "November · Major milestone", color: "from-pink-600 to-rose-600" },
];

const HERO_STATS = [
  { icon: BookOpen, label: "Books Read", value: "112", color: "from-purple-700 to-indigo-700" },
  { icon: Zap, label: "Productive Hours", value: "742", color: "from-amber-600 to-orange-600" },
  { icon: Users, label: "New Friends", value: "18", color: "from-pink-600 to-rose-600" },
  { icon: Trophy, label: "Challenges Won", value: "34", color: "from-emerald-600 to-teal-600" },
  { icon: Target, label: "XP Earned", value: "12.4K", color: "from-cyan-600 to-blue-600" },
  { icon: Users, label: "Squads Joined", value: "8", color: "from-violet-600 to-purple-600" },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function LifeWrapped() {
  const [activeMonth, setActiveMonth] = useState("Dec");
  const { data: stats } = useGetDashboardStats();

  return (
    <div className="min-h-screen bg-[#050505] pb-12">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-10 text-center py-8 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-pink-900/20 rounded-3xl" />
        <p className="text-white/40 text-xs font-bold tracking-[0.4em] uppercase mb-3">Your Year in Review</p>
        <h1 className="font-display text-6xl md:text-8xl uppercase tracking-tight relative">
          <span className="text-white">Life </span>
          <span className="bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#D9FF00] bg-clip-text text-transparent">Wrapped</span>
        </h1>
        <p className="font-display text-4xl text-white/40 uppercase mt-1">2024</p>
        <div className="flex justify-center gap-3 mt-6">
          <Button className="bg-[#D9FF00] text-black font-bold rounded-xl px-6">
            <Share2 className="h-4 w-4 mr-2" /> Share My Wrapped
          </Button>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl px-6">
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </div>
      </motion.div>

      {/* Month Selector */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {MONTHS.map((m) => (
          <button
            key={m}
            onClick={() => setActiveMonth(m)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeMonth === m ? "bg-[#D9FF00] text-black" : "bg-white/5 text-white/40 hover:text-white border border-white/10"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Hero Stats */}
      <motion.div initial="hidden" animate="show" variants={stagger} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {HERO_STATS.map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
            <Card className={`p-4 bg-gradient-to-br ${s.color} border-0 rounded-2xl text-center`}>
              <s.icon className="h-6 w-6 text-white/70 mx-auto mb-2" />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="font-display text-3xl text-white"
              >
                {s.value}
              </motion.p>
              <p className="text-white/60 text-xs mt-1">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart + Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* XP Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card className="bg-[#111111] border-white/10 rounded-2xl p-5">
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">XP Growth — 2024</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={XP_DATA}>
                  <defs>
                    <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: "#ffffff30", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: "#181818", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }}
                    cursor={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <Area type="monotone" dataKey="xp" stroke="#7C3AED" fill="url(#xpGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Score Rings */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-[#111111] border-white/10 rounded-2xl p-5 h-full">
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Score Breakdown</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="25%" outerRadius="90%" data={SCORE_RINGS} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" background={{ fill: "#ffffff08" }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {SCORE_RINGS.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: s.fill }} />
                    <span className="text-xs text-white/60">{s.name}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Top Moments */}
      <motion.div initial="hidden" animate="show" variants={stagger} className="mb-10">
        <motion.p variants={fadeUp} className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Top Moments</motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TOP_MOMENTS.map((m) => (
            <motion.div key={m.title} variants={fadeUp}>
              <Card className={`p-6 bg-gradient-to-br ${m.color} border-0 rounded-2xl`}>
                <m.icon className="h-10 w-10 text-white/80 mb-4" />
                <h3 className="font-display text-xl text-white uppercase mb-1">{m.title}</h3>
                <p className="text-white/60 text-sm">{m.subtitle}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Summary + Shareable Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-5 bg-gradient-to-br from-purple-900/40 to-pink-900/30 border-purple-500/30 rounded-2xl h-full">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase">AI Summary</p>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              You had a breakthrough year in 2024. Your productivity increased by 22% in the second half, driven by a consistent deep-work routine you built in June. You connected with 18 new people and completed 34 challenges — placing you in the top 15% of GenZVerse users. Your biggest growth was in Learning (+34%) and Social (+28%). Keep your 7-day streak alive and you're on track for your best January ever.
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-[#111111] border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase">Shareable Card</p>
              <Button size="sm" className="bg-[#D9FF00] text-black font-bold rounded-xl text-xs">
                <Share2 className="h-3 w-3 mr-1" /> Share
              </Button>
            </div>
            <div className="p-6 bg-gradient-to-br from-[#0a0010] to-[#1a0020] relative">
              <div className="absolute top-3 right-3 font-display text-white/10 text-4xl uppercase">2024</div>
              <p className="font-display text-xs text-white/40 uppercase tracking-widest mb-1">GenZVerse · Life Wrapped</p>
              <p className="font-display text-3xl text-white uppercase mb-4">{stats?.lifeScore || 87} Life Score</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "XP", value: "12.4K" },
                  { label: "Challenges", value: "34" },
                  { label: "Level", value: `${stats?.level || 12}` },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-display text-2xl text-[#D9FF00]">{s.value}</p>
                    <p className="text-white/40 text-xs uppercase">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
