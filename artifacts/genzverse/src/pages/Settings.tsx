import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import {
  User, Palette, Bell, Lock, Shield, Link2, Bot, Database,
  Moon, Sun, Monitor, CheckCircle2, Trash2, Download, LogOut
} from "lucide-react";

const TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "security", label: "Security", icon: Shield },
  { id: "connected", label: "Connected", icon: Link2 },
  { id: "ai", label: "AI Preferences", icon: Bot },
  { id: "data", label: "Data & Export", icon: Database },
];

const CONNECTED_ACCOUNTS = [
  { name: "Google", color: "from-red-500 to-orange-500", connected: false },
  { name: "Discord", color: "from-indigo-500 to-violet-500", connected: true },
  { name: "Instagram", color: "from-pink-500 to-rose-500", connected: false },
  { name: "LinkedIn", color: "from-blue-600 to-cyan-600", connected: false },
];

const SESSIONS = [
  { device: "MacBook Pro (Chrome)", location: "Mumbai, India", time: "Now · Current", current: true },
  { device: "iPhone 15 (Safari)", location: "Mumbai, India", time: "2 hours ago" },
  { device: "iPad Pro (Chrome)", location: "Delhi, India", time: "3 days ago" },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("appearance");
  const [theme, setTheme] = useState("dark");
  const [notifications, setNotifications] = useState({
    friendRequests: true, communityInvites: true, squadInvites: true,
    marketplace: false, comments: true, likes: false, challenges: true, aiInsights: true,
  });

  return (
    <div className="min-h-screen bg-[#050505] pb-12">
      <div className="mb-6">
        <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-1">Configure</p>
        <h1 className="font-display text-5xl text-white uppercase tracking-tight">Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Nav */}
        <div className="lg:w-56 flex-shrink-0">
          <Card className="bg-[#111111] border-white/10 rounded-2xl overflow-hidden p-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 last:mb-0 ${
                  activeTab === tab.id
                    ? "bg-[#D9FF00]/10 text-white border border-[#D9FF00]/30"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon className={`h-4 w-4 flex-shrink-0 ${activeTab === tab.id ? "text-[#D9FF00]" : ""}`} />
                {tab.label}
              </button>
            ))}
            <div className="border-t border-white/5 mt-2 pt-2">
              <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            </div>
          </Card>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "appearance" && (
                <Card className="bg-[#111111] border-white/10 rounded-2xl p-6 space-y-6">
                  <div>
                    <h3 className="font-display text-2xl text-white uppercase mb-1">Appearance</h3>
                    <p className="text-white/40 text-sm">Customize how GenZVerse looks</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-3">Theme</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "dark", label: "Dark", icon: Moon },
                        { id: "light", label: "Light", icon: Sun },
                        { id: "system", label: "System", icon: Monitor },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                            theme === t.id ? "border-[#D9FF00] bg-[#D9FF00]/5" : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <t.icon className={`h-6 w-6 ${theme === t.id ? "text-[#D9FF00]" : "text-white/40"}`} />
                          <span className={`text-sm font-bold ${theme === t.id ? "text-white" : "text-white/40"}`}>{t.label}</span>
                          {theme === t.id && <CheckCircle2 className="h-4 w-4 text-[#D9FF00]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-3">Accent Color</p>
                    <div className="flex gap-3">
                      {["#D9FF00", "#7C3AED", "#EC4899", "#06B6D4"].map((c) => (
                        <button key={c} className="h-10 w-10 rounded-xl border-2 border-white/20 hover:border-white/50 transition-all" style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === "account" && (
                <Card className="bg-[#111111] border-white/10 rounded-2xl p-6 space-y-5">
                  <div>
                    <h3 className="font-display text-2xl text-white uppercase mb-1">Account</h3>
                    <p className="text-white/40 text-sm">Update your profile details</p>
                  </div>
                  {[
                    { id: "fullName", label: "Full Name", defaultValue: user?.fullName || "" },
                    { id: "username", label: "Username", defaultValue: user?.username || "" },
                    { id: "email", label: "Email", defaultValue: user?.email || "" },
                  ].map((f) => (
                    <div key={f.id} className="space-y-2">
                      <Label className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase">{f.label}</Label>
                      <Input defaultValue={f.defaultValue} className="bg-white/5 border-white/10 text-white h-11 rounded-xl" />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase">Bio</Label>
                    <textarea
                      rows={3}
                      placeholder="Tell the world about yourself..."
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-purple-500 placeholder:text-white/30"
                    />
                  </div>
                  <Button className="bg-[#D9FF00] text-black font-bold rounded-xl px-8">Save Changes</Button>
                </Card>
              )}

              {activeTab === "notifications" && (
                <Card className="bg-[#111111] border-white/10 rounded-2xl p-6 space-y-4">
                  <div>
                    <h3 className="font-display text-2xl text-white uppercase mb-1">Notifications</h3>
                    <p className="text-white/40 text-sm">Choose what you hear about</p>
                  </div>
                  {Object.entries(notifications).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm font-medium text-white capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <Switch
                        checked={val}
                        onCheckedChange={(v) => setNotifications(prev => ({ ...prev, [key]: v }))}
                      />
                    </div>
                  ))}
                </Card>
              )}

              {activeTab === "privacy" && (
                <Card className="bg-[#111111] border-white/10 rounded-2xl p-6 space-y-4">
                  <div>
                    <h3 className="font-display text-2xl text-white uppercase mb-1">Privacy</h3>
                    <p className="text-white/40 text-sm">Control who can see your content</p>
                  </div>
                  {[
                    { label: "Profile Visibility", options: ["Public", "Friends Only", "Private"] },
                    { label: "Activity Visibility", options: ["Public", "Friends Only", "Private"] },
                    { label: "Friends List", options: ["Public", "Friends Only", "Hidden"] },
                  ].map((s) => (
                    <div key={s.label} className="space-y-2 border-b border-white/5 pb-4 last:border-0">
                      <p className="text-sm font-bold text-white">{s.label}</p>
                      <div className="flex gap-2 flex-wrap">
                        {s.options.map((o) => (
                          <button key={o} className="px-4 py-1.5 rounded-xl text-xs font-bold border border-white/10 text-white/50 hover:border-[#D9FF00]/50 hover:text-white transition-all first:bg-[#D9FF00]/10 first:border-[#D9FF00]/30 first:text-white">{o}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </Card>
              )}

              {activeTab === "security" && (
                <Card className="bg-[#111111] border-white/10 rounded-2xl p-6 space-y-5">
                  <div>
                    <h3 className="font-display text-2xl text-white uppercase mb-1">Security</h3>
                    <p className="text-white/40 text-sm">Keep your account safe</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="font-bold text-white text-sm">Two-Factor Authentication</p>
                      <p className="text-white/40 text-xs">Add an extra layer of security</p>
                    </div>
                    <Switch />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-3">Active Sessions</p>
                    <div className="space-y-2">
                      {SESSIONS.map((s, i) => (
                        <div key={i} className={`p-4 rounded-xl flex items-center gap-3 ${s.current ? "bg-[#D9FF00]/5 border border-[#D9FF00]/20" : "bg-white/5"}`}>
                          <Monitor className={`h-5 w-5 flex-shrink-0 ${s.current ? "text-[#D9FF00]" : "text-white/40"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{s.device}</p>
                            <p className="text-xs text-white/40">{s.location} · {s.time}</p>
                          </div>
                          {!s.current && <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10 text-xs">Revoke</Button>}
                          {s.current && <span className="text-xs font-bold text-[#D9FF00] bg-[#D9FF00]/10 px-2 py-0.5 rounded-lg">Current</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === "connected" && (
                <Card className="bg-[#111111] border-white/10 rounded-2xl p-6 space-y-4">
                  <div>
                    <h3 className="font-display text-2xl text-white uppercase mb-1">Connected Accounts</h3>
                    <p className="text-white/40 text-sm">Link your social accounts</p>
                  </div>
                  {CONNECTED_ACCOUNTS.map((a) => (
                    <div key={a.name} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center font-bold text-white text-sm flex-shrink-0`}>
                        {a.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{a.name}</p>
                        <p className="text-xs text-white/40">{a.connected ? "Connected" : "Not connected"}</p>
                      </div>
                      <Button
                        size="sm"
                        className={a.connected
                          ? "border border-red-500/30 text-red-400 bg-transparent hover:bg-red-500/10 rounded-xl text-xs"
                          : "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 rounded-xl text-xs font-bold"
                        }
                      >
                        {a.connected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  ))}
                </Card>
              )}

              {activeTab === "ai" && (
                <Card className="bg-[#111111] border-white/10 rounded-2xl p-6 space-y-5">
                  <div>
                    <h3 className="font-display text-2xl text-white uppercase mb-1">AI Preferences</h3>
                    <p className="text-white/40 text-sm">Personalize your AI companion</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase">Coaching Style</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["Motivational", "Analytical", "Balanced"].map((s, i) => (
                        <button key={s} className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${i === 2 ? "border-[#D9FF00] bg-[#D9FF00]/5 text-white" : "border-white/10 text-white/40 hover:border-white/30"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {["Daily AI insights", "Weekly goal summaries", "Personalized recommendations", "Progress notifications"].map((s) => (
                    <div key={s} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm font-medium text-white">{s}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                  <Button className="bg-[#D9FF00] text-black font-bold rounded-xl px-8">Save Preferences</Button>
                </Card>
              )}

              {activeTab === "data" && (
                <Card className="bg-[#111111] border-white/10 rounded-2xl p-6 space-y-4">
                  <div>
                    <h3 className="font-display text-2xl text-white uppercase mb-1">Data & Export</h3>
                    <p className="text-white/40 text-sm">Manage your GenZVerse data</p>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <Download className="h-6 w-6 text-white/60 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">Download Your Data</p>
                      <p className="text-xs text-white/40">Export all your activity, posts, and profile data</p>
                    </div>
                    <Button size="sm" className="bg-[#D9FF00] text-black font-bold rounded-xl text-xs">Export</Button>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <Trash2 className="h-6 w-6 text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">Delete Account</p>
                      <p className="text-xs text-red-400/70">Permanently delete your account and all data</p>
                    </div>
                    <Button size="sm" className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs hover:bg-red-500/30">Delete</Button>
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
