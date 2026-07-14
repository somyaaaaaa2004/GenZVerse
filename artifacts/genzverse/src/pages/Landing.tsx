import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Zap, ArrowRight, Bot, Users, Trophy, TrendingUp, Shirt, BarChart3, Gift, Sparkles,
  ChevronRight, Star, Flame
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";

const NAV_LINKS = ["Features", "Squads", "Communities", "AI Companion", "Life Wrapped", "Pricing"];

const FEATURES = [
  { icon: Bot, label: "AI Coaching", desc: "Personalized guidance", color: "from-violet-500 to-purple-600" },
  { icon: Users, label: "Social Squads", desc: "Your circle, your people", color: "from-pink-500 to-rose-600" },
  { icon: Trophy, label: "Challenges", desc: "Compete & grow", color: "from-amber-500 to-orange-600" },
  { icon: TrendingUp, label: "Skill Growth", desc: "Learn. Practice. Master.", color: "from-emerald-500 to-teal-600" },
  { icon: Shirt, label: "Style & Thrift", desc: "Express your style", color: "from-cyan-500 to-blue-600" },
  { icon: BarChart3, label: "Analytics", desc: "Track what matters", color: "from-fuchsia-500 to-violet-600" },
  { icon: Gift, label: "Life Wrapped", desc: "Your story in stats", color: "from-rose-500 to-pink-600" },
];

type PublicStats = {
  userCount: number;
  communityCount: number;
  challengeCount: number;
  squadCount: number;
};

type FeaturedSquad = {
  id: string;
  name: string;
  onlineCount: number;
  xp: number;
  category: string;
};

type FeaturedCommunity = {
  id: string;
  name: string;
  memberCount: number;
  category: string;
};

export default function Landing() {
  const { data: publicStats } = useQuery({
    queryKey: ["public-stats"],
    queryFn: () => apiFetch<PublicStats>("/api/public/stats"),
    staleTime: 60_000,
  });

  const { data: featuredSquads } = useQuery({
    queryKey: ["featured-squads"],
    queryFn: () => apiFetch<FeaturedSquad[]>("/api/squads/featured"),
    staleTime: 60_000,
  });

  const { data: featuredCommunities } = useQuery({
    queryKey: ["featured-communities"],
    queryFn: () => apiFetch<FeaturedCommunity[]>("/api/communities/featured"),
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              GENZ<span className="text-purple-400">VERSE</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <span key={l} className="text-white/50 hover:text-white text-sm cursor-pointer transition-colors">{l}</span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <span className="text-white/60 hover:text-white text-sm cursor-pointer transition-colors">Log In</span>
            </Link>
            <Link to="/signup">
              <button className="h-8 px-4 bg-[#D9FF00] text-black text-sm font-bold rounded-lg hover:bg-[#c8ee00] transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-14 overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-pink-600/15 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 w-full grid lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-6">
                The all-in-one OS for Gen Z
              </p>
              <h1 className="font-display font-black uppercase leading-[0.88] tracking-tighter mb-6">
                <span className="block text-6xl md:text-7xl lg:text-8xl text-white">YOUR LIFE.</span>
                <span className="block text-6xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-[#D9FF00]">
                  YOUR VERSE.
                </span>
              </h1>
              <p className="text-white/50 text-base md:text-lg max-w-md mb-8 leading-relaxed">
                GenZVerse is your <span className="text-purple-400 font-medium">AI-powered</span> social life OS.
                Connect. Grow. Create. Earn. Express.
                All in one <span className="text-[#D9FF00] font-medium">universe</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link to="/signup">
                  <button
                    data-testid="button-hero-cta"
                    className="flex items-center gap-2 h-12 px-7 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
                  >
                    Start Your Journey <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <button className="flex items-center gap-2 h-12 px-7 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all text-sm">
                  Watch Demo
                  <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[7px] border-t-transparent border-b-transparent border-l-white ml-0.5" />
                  </span>
                </button>
              </div>
              {/* Social proof */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["#7C3AED", "#EC4899", "#10B981", "#F59E0B", "#3B82F6"].map((c, i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-[#050505]" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="h-8 w-8 rounded-full bg-white/10 border-2 border-[#050505] flex items-center justify-center text-xs font-bold text-white/70">
                    {publicStats ? `+${publicStats.userCount.toLocaleString()}` : "—"}
                  </div>
                  <span className="text-white/40 text-xs">
                    {publicStats
                      ? `Trusted by ${publicStats.userCount.toLocaleString()}+ users`
                      : "Trusted by the GenZVerse community"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: floating UI card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Build your universe badge */}
            <div className="absolute -top-4 -right-4 z-20 bg-[#D9FF00] text-black font-black text-xs px-3 py-2 rounded-lg rotate-3 uppercase tracking-wider">
              BUILD<br />YOUR<br />UNIVERSE
            </div>

            {/* Main dashboard card */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
              {/* Life Score ring mockup */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Life Score</p>
                  <div className="flex items-end gap-1">
                    <span className="font-display font-black text-5xl text-white">87</span>
                    <span className="text-[#D9FF00] text-sm font-bold mb-1 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" /> 12%
                    </span>
                  </div>
                </div>
                <div className="h-16 w-16 rounded-full border-4 border-purple-500/30 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-purple-500 rotate-[135deg]" />
                  <Flame className="h-6 w-6 text-orange-400" />
                </div>
              </div>

              {/* Today schedule */}
              <div className="space-y-2 mb-4">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Today</p>
                <div className="bg-white/5 rounded-lg px-3 py-3 border border-white/10">
                  <p className="text-white/70 text-sm font-medium">
                    Your schedule is personalized after onboarding.
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    Create your account to start tracking goals, streaks, and tasks.
                  </p>
                </div>
              </div>

              {/* XP / streak */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-3 border border-purple-500/20">
                  <p className="text-purple-300/70 text-xs uppercase tracking-wider">XP</p>
                  <p className="font-display font-bold text-xl text-white">—</p>
                </div>
                <div className="bg-gradient-to-br from-[#D9FF00]/10 to-amber-500/5 rounded-xl p-3 border border-[#D9FF00]/20">
                  <p className="text-[#D9FF00]/70 text-xs uppercase tracking-wider">Streak</p>
                  <p className="font-display font-bold text-xl text-white">—</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-white/30 text-xs font-bold tracking-[0.3em] uppercase mb-3">Everything you need to</p>
            <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight">
              LEVEL UP <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">YOUR LIFE</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-default group"
              >
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center`}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-white text-xs font-bold">{f.label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Digital Twin + Squads ─────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-6">
          {/* AI Twin */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-transparent" />
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, rgba(168,85,247,0.08) 0%, transparent 60%)" }} />
            <div className="relative z-10">
              <h3 className="font-display font-black text-3xl uppercase tracking-tight mb-2 text-white">
                MEET YOUR<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">AI DIGITAL TWIN</span>
              </h3>
              <p className="text-white/50 text-sm mb-8">Your AI twin learns from your life, adapts to you, and helps you become your best self.</p>

              {/* Orb */}
              <div className="flex items-center justify-center my-6 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-48 w-48 rounded-full bg-purple-600/10 blur-2xl" />
                </div>
                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-2 border-purple-500/40 flex items-center justify-center shadow-2xl relative z-10">
                  <div className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-white" />
                    <div className="h-5 w-5 rounded-full bg-white" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-purple-500/40 animate-ping opacity-20" />
                </div>
              </div>

              {/* Chat bubbles */}
              <div className="space-y-2">
                {["How was your day?", "Let's plan your goals", "You got this"].map((msg, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/70 text-sm w-fit ml-auto">
                    {msg}
                  </div>
                ))}
              </div>

              <Link to="/signup">
                <button className="mt-6 flex items-center gap-2 h-10 px-5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors text-sm">
                  Chat With AI <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Squads */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 via-transparent to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-pink-400 text-xs font-bold uppercase tracking-wider">Live Now</span>
              </div>
              <h3 className="font-display font-black text-3xl uppercase tracking-tight mb-2 text-white">
                SQUADS THAT<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">GET YOU</span>
              </h3>
              <p className="text-white/50 text-sm mb-6">Find your people, build your squad, and take on challenges together.</p>

              {/* Squad cards */}
              <div className="space-y-3">
                {(featuredSquads ?? []).length > 0 ? (
                  (featuredSquads ?? []).slice(0, 4).map((squad) => (
                    <div
                      key={squad.id}
                      className="flex items-center gap-3 bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {squad.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {squad.name}
                        </p>
                        <p className="text-white/40 text-xs">
                          {squad.onlineCount.toLocaleString()} online · {squad.category}
                        </p>
                      </div>
                      <span className="text-[#D9FF00] text-xs font-bold">
                        {squad.xp.toLocaleString()} XP
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/[0.04] border border-white/5 rounded-xl px-4 py-4">
                    <p className="text-white/70 text-sm font-semibold">
                      No featured squads yet.
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      Create the first squad after signing up.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-6">
                <div className="flex -space-x-2">
                  {["#7C3AED", "#EC4899", "#10B981", "#F59E0B"].map((c, i) => (
                    <div
                      key={i}
                      className="h-7 w-7 rounded-full border-2 border-[#0a0a0a]"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span className="text-white/40 text-xs">
                  {publicStats
                    ? `${publicStats.squadCount.toLocaleString()} squads created`
                    : "Squads are forming now"}
                </span>
                <Link to="/signup" className="ml-auto">
                  <button className="flex items-center gap-1 text-pink-400 text-xs font-bold hover:text-pink-300 transition-colors">
                    Explore Squads <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Life Wrapped + Communities ───────────────────── */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-6">
          {/* Life Wrapped */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a0533] via-[#120022] to-[#0d0118] border border-purple-500/20 p-8 min-h-[260px] flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-purple-600/20 blur-[80px] pointer-events-none" />
            <div>
              <p className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase mb-2">Spotify Wrapped, but for life</p>
              <h3 className="font-display font-black text-3xl uppercase text-white tracking-tight">
                LIFE<br />WRAPPED
              </h3>
              <p className="text-white/50 text-sm mt-2">Your year. Your story. Your stats. All wrapped up.</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                LIFE WRAPPED 2024
              </div>
              <Link to="/signup">
                <button className="flex items-center gap-1 text-white/60 text-sm hover:text-white transition-colors">
                  See My Wrapped <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Communities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 p-8"
          >
            <h3 className="font-display font-black text-3xl uppercase text-white tracking-tight mb-2">
              COMMUNITIES<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">YOU'LL LOVE</span>
            </h3>
            <p className="text-white/40 text-sm mb-6">From gaming to self-care, fashion to finance — there's a community for every part of you.</p>
            <div className="grid grid-cols-2 gap-3">
              {(featuredCommunities ?? []).length > 0 ? (
                (featuredCommunities ?? []).slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 bg-white/[0.04] border border-white/5 rounded-xl px-3 py-3 hover:border-white/10 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg flex-shrink-0 bg-cyan-500/20">
                      <div className="h-full w-full rounded-lg flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-cyan-400" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold truncate">
                        {c.name}
                      </p>
                      <p className="text-white/40 text-xs">
                        {c.memberCount.toLocaleString()} members · {c.category}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-white/[0.04] border border-white/5 rounded-xl px-4 py-4">
                  <p className="text-white/70 text-sm font-semibold">
                    No featured communities yet.
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    Be the first to create one.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="py-20 mt-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-[#050505] to-pink-900/40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/30 text-xs font-bold tracking-[0.3em] uppercase mb-4">The future is now</p>
          <h2 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tight mb-4 leading-[0.9]">
            READY TO BUILD
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D9FF00] via-[#a8ff00] to-[#D9FF00]">
              YOUR UNIVERSE?
            </span>
          </h2>
          <p className="text-white/40 text-base mb-8">Join GenZVerse today and start your journey.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Link to="/signup">
              <button
                data-testid="button-cta-signup"
                className="flex items-center gap-2 h-14 px-8 bg-[#D9FF00] text-black font-black rounded-xl hover:bg-[#c8ee00] transition-all hover:scale-[1.02] active:scale-[0.98] text-base"
              >
                Get Started Free <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <button className="flex items-center gap-2 h-14 px-8 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-base">
              See How It Works
            </button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex -space-x-2">
              {["#7C3AED", "#EC4899", "#10B981", "#F59E0B", "#3B82F6"].map((c, i) => (
                <div key={i} className="h-7 w-7 rounded-full border-2 border-[#050505]" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-white/40 text-sm ml-1">Join 50K+ Gen Z</span>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-display font-bold text-base text-white tracking-tight">
                  GENZ<span className="text-purple-400">VERSE</span>
                </span>
              </div>
              <p className="text-white/30 text-xs leading-relaxed">
                &copy; 2024 GenZVerse.<br />All rights reserved.
              </p>
            </div>
            {[
              { title: "PRODUCT", links: ["Features", "Roadmap", "Pricing"] },
              { title: "COMPANY", links: ["About Us", "Careers", "Blog"] },
              { title: "RESOURCES", links: ["Help Center", "Privacy", "Terms"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-white/30 text-xs font-bold tracking-[0.2em] uppercase mb-4">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <span className="text-white/50 text-sm hover:text-white transition-colors cursor-pointer">{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="text-white/30 text-xs font-bold tracking-[0.2em] uppercase mb-4">CONNECT</p>
              <div className="flex gap-3">
                {["X", "IG", "TT", "DC"].map((s) => (
                  <div key={s} className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 text-xs font-bold hover:bg-white/10 hover:text-white transition-all cursor-pointer">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
