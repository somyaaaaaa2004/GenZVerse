import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetFeaturedCommunities, useGetCommunities } from "@workspace/api-client-react";
import { Users, TrendingUp, Zap, Globe, Dumbbell, Shirt, Camera, DollarSign, Gamepad2, ArrowRight } from "lucide-react";

const CATEGORIES = ["All", "AI", "Startups", "Fitness", "Fashion", "Photography", "Finance", "Gaming"];

const CATEGORY_TILES = [
  { name: "Gaming", icon: Gamepad2, color: "from-purple-600 to-indigo-600", members: "12.4K" },
  { name: "Fashion", icon: Shirt, color: "from-pink-600 to-rose-600", members: "8.7K" },
  { name: "Entrepreneurs", icon: TrendingUp, color: "from-emerald-600 to-teal-600", members: "5.3K" },
  { name: "Wellness", icon: Dumbbell, color: "from-amber-500 to-orange-600", members: "9.1K" },
  { name: "Tech", icon: Zap, color: "from-cyan-500 to-blue-600", members: "14.2K" },
  { name: "Finance", icon: DollarSign, color: "from-yellow-500 to-amber-600", members: "6.8K" },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function Communities() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: featured } = useGetFeaturedCommunities();
  const { data: communities } = useGetCommunities();

  const displayFeatured = featured && featured.length > 0 ? featured : [
    { id: 1, name: "AI Builders", description: "Builders pushing the limits of artificial intelligence", memberCount: 4200 },
    { id: 2, name: "Gen Z Startups", description: "Young founders changing the world one idea at a time", memberCount: 3100 },
    { id: 3, name: "Aesthetic Fit", description: "Fashion meets function, style meets grind", memberCount: 5800 },
  ];

  const displayCommunities = communities && communities.length > 0 ? communities : [
    { id: 4, name: "Deep Focus", description: "Productivity and deep work community", memberCount: 1200 },
    { id: 5, name: "Film Photography", description: "Analog souls in a digital world", memberCount: 890 },
    { id: 6, name: "Crypto & DeFi", description: "Web3 and decentralized finance", memberCount: 2100 },
    { id: 7, name: "Mindfulness", description: "Mental health and daily practices", memberCount: 1600 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] pb-12">
      {/* Live ticker */}
      <div className="mb-6 py-2 px-4 bg-[#D9FF00]/10 border border-[#D9FF00]/20 rounded-xl flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-[#D9FF00] shadow-[0_0_8px_rgba(217,255,0,0.8)] animate-pulse" />
        <span className="text-[#D9FF00] text-sm font-bold">2.4K members online right now</span>
        <Globe className="h-4 w-4 text-[#D9FF00]/60 ml-auto" />
      </div>

      <motion.div initial="hidden" animate="show" variants={stagger} className="mb-8">
        <motion.p variants={fadeUp} className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-1">Discover</motion.p>
        <motion.h1 variants={fadeUp} className="font-display text-5xl text-white uppercase tracking-tight">
          Communities <span className="text-[#EC4899]">You'll Love</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="text-white/40 mt-2">From gaming to self-care — there's a community for every part of you</motion.p>
      </motion.div>

      {/* Category Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeCategory === cat
                ? "bg-[#D9FF00] text-black"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Featured */}
      <motion.div initial="hidden" animate="show" variants={stagger} className="mb-10">
        <motion.p variants={fadeUp} className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Featured Communities</motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayFeatured.map((c, i) => {
            const gradients = ["from-purple-900 to-indigo-900", "from-pink-900 to-rose-900", "from-cyan-900 to-blue-900"];
            return (
              <motion.div key={c.id} variants={fadeUp}>
                <Card className={`p-6 bg-gradient-to-br ${gradients[i % gradients.length]} border-white/10 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
                  <div className="absolute top-3 right-3 bg-[#D9FF00] text-black text-xs font-bold px-2 py-0.5 rounded-lg">TRENDING</div>
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display text-2xl text-white uppercase">{c.name}</h3>
                  <p className="text-white/60 text-sm mt-1 mb-4">{c.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-sm">{(c.memberCount / 1000).toFixed(1)}K members</span>
                    <Button size="sm" className="bg-white text-black font-bold rounded-xl hover:bg-white/90">Join <ArrowRight className="ml-1 h-3 w-3" /></Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Category Grid */}
      <motion.div initial="hidden" animate="show" variants={stagger} className="mb-10">
        <motion.p variants={fadeUp} className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Browse Categories</motion.p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORY_TILES.map((tile) => (
            <motion.div key={tile.name} variants={fadeUp}>
              <Card className={`p-4 bg-gradient-to-br ${tile.color} border-0 rounded-2xl cursor-pointer hover:scale-105 transition-transform text-center`}>
                <tile.icon className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="font-display text-lg text-white uppercase">{tile.name}</p>
                <p className="text-white/60 text-xs">{tile.members} members</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* All Communities */}
      <motion.div initial="hidden" animate="show" variants={stagger}>
        <motion.p variants={fadeUp} className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Trending Communities</motion.p>
        <div className="space-y-3">
          {displayCommunities.map((c) => (
            <motion.div key={c.id} variants={fadeUp}>
              <Card className="p-4 bg-[#111111] border-white/10 rounded-2xl hover:border-white/20 transition-all flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white">{c.name}</p>
                  <p className="text-white/40 text-sm truncate">{c.description}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-white font-bold text-sm">{c.memberCount.toLocaleString()}</p>
                    <p className="text-white/30 text-xs">members</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl font-bold">Explore</Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
