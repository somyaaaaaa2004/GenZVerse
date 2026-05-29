import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Bot, Send, Mic, Sparkles, Target, TrendingUp, Calendar, Lightbulb, Zap, Brain } from "lucide-react";

const INITIAL_MESSAGES = [
  { id: 1, role: "ai", text: "Hey! I'm your AI twin. I know your goals, habits, and what makes you tick. Ready to level up today?" },
  { id: 2, role: "user", text: "Yeah, what should I focus on today?" },
  { id: 3, role: "ai", text: "Based on your week, I'd prioritize: 1) Complete the 5K run challenge — you're 60% there, 2) 30min deep work on your startup idea, 3) Check in with Startup Squad. You're on a 7-day streak — don't break it!" },
];

const QUICK_ACTIONS = [
  { label: "Create Weekly Plan", icon: Calendar, color: "text-purple-400" },
  { label: "Suggest New Skills", icon: Brain, color: "text-cyan-400" },
  { label: "Analyze Progress", icon: TrendingUp, color: "text-emerald-400" },
  { label: "Generate Goals", icon: Target, color: "text-pink-400" },
];

const INSIGHTS = [
  { text: "Your productivity peaks on Tuesdays — schedule your hardest tasks then", icon: Lightbulb },
  { text: "You've completed 87% of this week's goals. You're close to a personal best!", icon: Zap },
  { text: "Adding 30min deep work sessions could boost your learning score by 15%", icon: Brain },
];

const GOALS = [
  { name: "Read 12 Books", progress: 75, color: "#7C3AED" },
  { name: "Workout 4x/week", progress: 60, color: "#EC4899" },
  { name: "Ship Side Project", progress: 30, color: "#D9FF00" },
];

export default function AICompanion() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { id: messages.length + 1, role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        role: "ai",
        text: "I'm analyzing that for you. Based on your current trajectory and goals, I recommend focusing on consistency over intensity. Small daily wins compound into massive results over time.",
      }]);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-6">
      <div className="mb-6">
        <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-1">Your Digital Twin</p>
        <h1 className="font-display text-5xl text-white uppercase tracking-tight">
          AI <span className="text-[#7C3AED]">Companion</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Chat Panel */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col bg-[#111111] border-white/10 rounded-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full bg-purple-500/30"
                />
              </div>
              <div>
                <h3 className="font-display text-xl text-white uppercase">AI Companion</h3>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs text-white/40">Online · Knows you deeply</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}
                  >
                    {msg.role === "ai" && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "ai"
                        ? "bg-gradient-to-br from-purple-900/60 to-pink-900/40 border border-purple-500/20 text-white"
                        : "bg-[#1a1a1a] border border-white/10 text-white"
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-end">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-purple-900/40 border border-purple-500/20 px-4 py-3 rounded-2xl flex gap-1">
                      {[0, 0.2, 0.4].map((d, i) => (
                        <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d }} className="h-2 w-2 rounded-full bg-purple-400" />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask anything about your goals, habits, or life..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl"
                />
                <Button variant="ghost" size="icon" className="h-12 w-12 text-white/40 hover:text-white border border-white/10 rounded-xl">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button onClick={sendMessage} className="h-12 px-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 rounded-xl font-bold">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Quick Actions */}
          <Card className="bg-[#111111] border-white/10 rounded-2xl p-4">
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-3">Quick Actions</p>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((a) => (
                <button key={a.label} className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left">
                  <a.icon className={`h-5 w-5 flex-shrink-0 ${a.color}`} />
                  <span className="text-sm font-medium text-white">{a.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* AI Insights */}
          <Card className="bg-[#111111] border-white/10 rounded-2xl p-4">
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-3">AI Insights</p>
            <div className="space-y-3">
              {INSIGHTS.map((ins, i) => (
                <div key={i} className="flex gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <ins.icon className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/70 leading-relaxed">{ins.text}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Goals */}
          <Card className="bg-[#111111] border-white/10 rounded-2xl p-4">
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-3">Goal Coach</p>
            <div className="space-y-4">
              {GOALS.map((g) => (
                <div key={g.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{g.name}</span>
                    <span className="text-xs font-bold" style={{ color: g.color }}>{g.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${g.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: g.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
