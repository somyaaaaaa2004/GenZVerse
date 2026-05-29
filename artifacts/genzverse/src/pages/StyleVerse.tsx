import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Sparkles, TrendingUp, Users, ShoppingBag, Upload } from "lucide-react";

const STYLE_DNA = [
  { label: "Streetwear", pct: 35, color: "#7C3AED" },
  { label: "Vintage", pct: 25, color: "#EC4899" },
  { label: "Y2K", pct: 20, color: "#D9FF00" },
  { label: "Minimalist", pct: 15, color: "#06B6D4" },
  { label: "Techwear", pct: 5, color: "#F97316" },
];

const OUTFITS = [
  { id: 1, name: "Dark Academia Fit", tag: "Vintage", likes: 284, color: "from-amber-900 to-stone-900" },
  { id: 2, name: "Purple Y2K Set", tag: "Y2K", likes: 512, color: "from-purple-700 to-pink-700" },
  { id: 3, name: "Techwear Drop", tag: "Techwear", likes: 198, color: "from-slate-700 to-zinc-800" },
  { id: 4, name: "Oversized Fits", tag: "Streetwear", likes: 341, color: "from-neutral-700 to-neutral-900" },
  { id: 5, name: "Coastal Granny", tag: "Vintage", likes: 167, color: "from-sky-700 to-teal-700" },
  { id: 6, name: "Neon Rave Fit", tag: "Y2K", likes: 623, color: "from-pink-600 to-violet-600" },
  { id: 7, name: "Monochrome Black", tag: "Minimalist", likes: 289, color: "from-zinc-800 to-black" },
  { id: 8, name: "Gorpcore Hike", tag: "Techwear", likes: 145, color: "from-green-800 to-emerald-900" },
  { id: 9, name: "Coquette Aesthetic", tag: "Vintage", likes: 788, color: "from-rose-700 to-pink-800" },
];

const TRENDING = [
  { name: "Y2K Revival", color: "from-pink-600 to-violet-600" },
  { name: "Dark Academia", color: "from-amber-800 to-stone-800" },
  { name: "Coastal Granny", color: "from-sky-600 to-teal-600" },
  { name: "Gorpcore", color: "from-green-700 to-emerald-700" },
];

const STYLE_FRIENDS = [
  { initials: "ZK", name: "Zara K.", match: 94, color: "from-purple-600 to-pink-600" },
  { initials: "DM", name: "Dev M.", match: 87, color: "from-cyan-600 to-blue-600" },
  { initials: "AR", name: "Anika R.", match: 82, color: "from-pink-600 to-rose-600" },
  { initials: "PS", name: "Priya S.", match: 76, color: "from-emerald-600 to-teal-600" },
];

const AI_SUGGESTIONS = [
  "You wear mostly monochrome outfits — try adding earth tones for contrast",
  "Your style DNA shows Vintage at 25% — explore thrift stores in your area",
  "Techwear is trending in your network — consider a lightweight puffer",
];

const TAG_COLORS: Record<string, string> = {
  Streetwear: "bg-purple-500/20 text-purple-400",
  Vintage: "bg-amber-500/20 text-amber-400",
  Y2K: "bg-pink-500/20 text-pink-400",
  Minimalist: "bg-cyan-500/20 text-cyan-400",
  Techwear: "bg-orange-500/20 text-orange-400",
};

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function StyleVerse() {
  return (
    <div className="min-h-screen bg-[#050505] pb-12">
      <motion.div initial="hidden" animate="show" variants={stagger} className="mb-8">
        <motion.p variants={fadeUp} className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-1">Fashion Universe</motion.p>
        <motion.h1 variants={fadeUp} className="font-display text-5xl text-white uppercase tracking-tight">
          Style<span className="text-[#EC4899]">Verse</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="text-white/40 mt-2">Your personal fashion ecosystem</motion.p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Style DNA */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
          <Card className="p-5 bg-[#111111] border-white/10 rounded-2xl h-full">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#EC4899]" />
              <h3 className="font-display text-2xl text-white uppercase">Style DNA</h3>
            </div>
            <div className="space-y-3">
              {STYLE_DNA.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-white">{s.label}</span>
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.pct}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Coach */}
            <div className="mt-6 p-4 bg-gradient-to-br from-pink-900/40 to-purple-900/40 border border-pink-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-pink-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">AI Style Coach</span>
              </div>
              <div className="space-y-2">
                {AI_SUGGESTIONS.map((s, i) => (
                  <p key={i} className="text-xs text-white/60 leading-relaxed border-l-2 border-pink-500/40 pl-2">{s}</p>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Outfit Gallery */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase">Outfit Gallery</p>
            <Button size="sm" className="bg-[#EC4899] text-white border-0 rounded-xl font-bold flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload
            </Button>
          </div>
          <div className="columns-3 gap-3 space-y-3">
            {OUTFITS.map((outfit, i) => (
              <div key={outfit.id} className={`break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer`}>
                <div className={`bg-gradient-to-br ${outfit.color} ${i % 3 === 1 ? "h-48" : "h-36"} relative`}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-3">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity w-full">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-white text-xs font-bold">{outfit.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${TAG_COLORS[outfit.tag] || "bg-white/20 text-white"}`}>{outfit.tag}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button className="h-7 w-7 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center hover:bg-white/40 transition-colors">
                            <Heart className="h-3.5 w-3.5 text-white" />
                          </button>
                          <button className="h-7 w-7 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center hover:bg-white/40 transition-colors">
                            <Share2 className="h-3.5 w-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#111111] px-3 py-2 flex justify-between items-center border-t border-white/5">
                  <span className="text-xs text-white/40">{outfit.likes} likes</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Trending + Style Friends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Trending Styles</p>
          <div className="grid grid-cols-2 gap-3">
            {TRENDING.map((t) => (
              <Card key={t.name} className={`p-5 bg-gradient-to-br ${t.color} border-0 rounded-2xl cursor-pointer hover:scale-105 transition-transform`}>
                <TrendingUp className="h-5 w-5 text-white/80 mb-2" />
                <p className="font-display text-xl text-white uppercase">{t.name}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Style Friends */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Style Friends</p>
          <div className="space-y-3">
            {STYLE_FRIENDS.map((f) => (
              <Card key={f.name} className="p-4 bg-[#111111] border-white/10 rounded-2xl flex items-center gap-3 hover:border-white/20 transition-all">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${f.color} flex items-center justify-center font-bold text-white flex-shrink-0`}>
                  {f.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white">{f.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#EC4899] rounded-full" style={{ width: `${f.match}%` }} />
                    </div>
                    <span className="text-xs font-bold text-[#EC4899]">{f.match}% match</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl text-xs flex-shrink-0">
                  <Users className="h-3 w-3 mr-1" /> Follow
                </Button>
              </Card>
            ))}
            <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> View Thrift Recommendations
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
