import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Search, TrendingUp, TrendingDown, ShoppingBag, ArrowLeftRight, Bookmark } from "lucide-react";

const FILTER_TABS = ["All", "Clothing", "Shoes", "Accessories", "Vintage"];

const FEATURED_DROPS = [
  { id: 1, name: "Vintage Levi's 501", seller: "Riya M.", price: 45, badge: "RARE FIND", color: "from-indigo-800 to-blue-900", condition: "Vintage" },
  { id: 2, name: "Nike Air Force 1 Low", seller: "Arjun K.", price: 110, badge: "HOT DROP", color: "from-slate-700 to-zinc-800", condition: "Used" },
  { id: 3, name: "Y2K Rhinestone Top", seller: "Zara N.", price: 28, badge: "TRENDING", color: "from-pink-700 to-violet-800", condition: "New" },
];

const PRODUCTS = [
  { id: 4, name: "Corduroy Jacket", seller: "Dev S.", price: 62, color: "from-amber-800 to-orange-900", condition: "Used", trade: true },
  { id: 5, name: "Jordan 1 Retro", seller: "Mia T.", price: 190, color: "from-red-800 to-rose-900", condition: "New", trade: false },
  { id: 6, name: "Crochet Crop Top", seller: "Priya R.", price: 22, color: "from-teal-700 to-cyan-800", condition: "New", trade: true },
  { id: 7, name: "Baggy Cargo Pants", seller: "Sam L.", price: 55, color: "from-stone-700 to-neutral-800", condition: "Used", trade: false },
  { id: 8, name: "Chunky Platform Boots", seller: "Zoe K.", price: 85, color: "from-zinc-700 to-gray-800", condition: "New", trade: true },
  { id: 9, name: "Patchwork Denim Vest", seller: "Leo P.", price: 40, color: "from-sky-800 to-blue-900", condition: "Vintage", trade: false },
];

const ACTIVITY = [
  { text: "Riya listed Vintage Levi's 501", price: "+$45", up: true, time: "2m ago" },
  { text: "Arjun traded Air Force 1 Lows", price: "Trade", up: null, time: "15m ago" },
  { text: "Zara sold Y2K Rhinestone Top", price: "-$28", up: false, time: "1h ago" },
  { text: "Dev listed Corduroy Jacket", price: "+$62", up: true, time: "2h ago" },
  { text: "Mia bought Jordan 1 Retro", price: "-$190", up: false, time: "3h ago" },
  { text: "Sam listed Cargo Pants", price: "+$55", up: true, time: "5h ago" },
  { text: "Zoe listed Platform Boots", price: "+$85", up: true, time: "6h ago" },
  { text: "Leo added Patchwork Denim Vest", price: "+$40", up: true, time: "8h ago" },
];

const TRENDING_ITEMS = [
  { name: "Vintage Denim Jackets", trend: +24 },
  { name: "Platform Sneakers", trend: +18 },
  { name: "Chunky Boots", trend: +12 },
  { name: "Y2K Tops", trend: -5 },
];

const CONDITION_STYLES: Record<string, string> = {
  New: "bg-emerald-500/20 text-emerald-400",
  Used: "bg-amber-500/20 text-amber-400",
  Vintage: "bg-purple-500/20 text-purple-400",
};

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function Marketplace() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="min-h-screen bg-[#050505] pb-12">
      <motion.div initial="hidden" animate="show" variants={stagger} className="mb-6">
        <motion.p variants={fadeUp} className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-1">Buy · Sell · Trade</motion.p>
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center gap-4">
          <h1 className="font-display text-5xl text-white uppercase tracking-tight">
            Market<span className="text-[#D9FF00]">place</span>
          </h1>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search items, sellers, brands..."
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl"
            />
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeFilter === tab ? "bg-[#D9FF00] text-black" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Featured Drops */}
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.p variants={fadeUp} className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Featured Drops</motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FEATURED_DROPS.map((item) => (
                <motion.div key={item.id} variants={fadeUp}>
                  <Card className="bg-[#111111] border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group">
                    <div className={`h-40 bg-gradient-to-br ${item.color} relative flex items-center justify-center`}>
                      <ShoppingBag className="h-12 w-12 text-white/30" />
                      <span className="absolute top-3 left-3 bg-[#D9FF00] text-black text-xs font-bold px-2 py-0.5 rounded-lg">{item.badge}</span>
                      <button className="absolute top-3 right-3 h-7 w-7 bg-black/30 backdrop-blur rounded-lg flex items-center justify-center hover:bg-black/50 transition-colors">
                        <Heart className="h-4 w-4 text-white" />
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-white mb-1">{item.name}</p>
                      <p className="text-white/40 text-xs mb-3">by {item.seller}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-display text-2xl text-white">${item.price}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${CONDITION_STYLES[item.condition]}`}>{item.condition}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 rounded-xl font-bold text-xs">Buy Now</Button>
                        <Button size="sm" variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-xl text-xs">Offer</Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Product Grid */}
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.p variants={fadeUp} className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Browse All</motion.p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PRODUCTS.map((item) => (
                <motion.div key={item.id} variants={fadeUp}>
                  <Card className="bg-[#111111] border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                    <div className={`h-28 bg-gradient-to-br ${item.color} relative flex items-center justify-center`}>
                      <ShoppingBag className="h-8 w-8 text-white/30" />
                      {item.trade && (
                        <span className="absolute bottom-2 left-2 text-xs bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                          <ArrowLeftRight className="h-3 w-3" /> Trade
                        </span>
                      )}
                      <button className="absolute top-2 right-2 h-6 w-6 bg-black/30 rounded-lg flex items-center justify-center">
                        <Bookmark className="h-3 w-3 text-white" />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-white text-sm truncate">{item.name}</p>
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-white/30 text-xs">{item.seller}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xl text-white">${item.price}</span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg ${CONDITION_STYLES[item.condition]}`}>{item.condition}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Activity Feed */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Live Activity</p>
            <Card className="bg-[#111111] border-white/10 rounded-2xl overflow-hidden">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="px-4 py-3 border-b border-white/5 last:border-0 flex items-center gap-3 hover:bg-white/5 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-white/70 flex-1 leading-tight">{a.text}</span>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span className={`text-xs font-bold ${a.up === true ? "text-emerald-400" : a.up === false ? "text-red-400" : "text-cyan-400"}`}>{a.price}</span>
                    <span className="text-[10px] text-white/20">{a.time}</span>
                  </div>
                </div>
              ))}
            </Card>
          </motion.div>

          {/* Trending Items */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-[#111111] border-white/10 rounded-2xl p-4">
              <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-3">Trending Items</p>
              <div className="space-y-3">
                {TRENDING_ITEMS.map((t) => (
                  <div key={t.name} className="flex items-center gap-3">
                    <span className="text-sm text-white flex-1">{t.name}</span>
                    <div className={`flex items-center gap-1 text-xs font-bold ${t.trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {t.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {t.trend >= 0 ? "+" : ""}{t.trend}%
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Wishlist */}
          <Card className="bg-[#111111] border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-white/30 transition-all">
            <Bookmark className="h-8 w-8 text-white/20 mb-2" />
            <p className="font-display text-lg text-white/40 uppercase">Wishlist</p>
            <p className="text-white/20 text-xs mt-1">Save items you love</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
