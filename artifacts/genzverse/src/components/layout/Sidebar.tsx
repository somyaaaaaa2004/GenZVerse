import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, UsersRound, Target, Bot, Sparkles, Activity, User, Settings, LogOut, Menu, Zap, Search, UserPlus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Squads", href: "/dashboard/squads", icon: Users },
  { label: "Communities", href: "/dashboard/communities", icon: UsersRound },
  { label: "Challenges", href: "/dashboard/challenges", icon: Target },
  { label: "AI Companion", href: "/dashboard/ai-companion", icon: Bot },
  { label: "StyleVerse", href: "/dashboard/styleverse", icon: Sparkles },
  { label: "Life Wrapped", href: "/dashboard/life-wrapped", icon: Activity },
  { label: "Discover", href: "/dashboard/social", icon: Search },
  { label: "Invites", href: "/dashboard/invites", icon: UserPlus },
];

const BOTTOM_NAV_ITEMS = [
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ className = "", isMobile = false }: { className?: string, isMobile?: boolean }) {
  const location = useLocation();
  const { logout, user } = useAuth();

  const NavContent = () => (
    <div className="flex flex-col h-full py-6 px-4 bg-[#0a0a0a]">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="font-display text-2xl tracking-tight uppercase">
          <span className="text-white">GENZ</span><span className="text-primary">VERSE</span>
        </span>
      </div>

      <div className="space-y-2 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start h-12 rounded-none border-l-2 transition-all ${
                  isActive 
                    ? "border-[#D9FF00] bg-[#D9FF00]/5 text-white font-bold" 
                    : "border-transparent text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-[#D9FF00]" : ""}`} />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="space-y-2 mt-auto mb-6 border-t border-white/5 pt-6">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start h-12 rounded-none border-l-2 transition-all ${
                  isActive 
                    ? "border-[#D9FF00] bg-[#D9FF00]/5 text-white font-bold" 
                    : "border-transparent text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
        <Button 
          variant="ghost" 
          className="w-full justify-start h-12 rounded-none border-l-2 border-transparent text-white/40 hover:text-red-400 hover:bg-red-500/10" 
          onClick={() => logout()}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>

      <div className="mt-auto bg-[#111111] p-4 rounded-2xl border border-white/10 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-primary/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username || ""} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {user?.displayName?.charAt(0) || user?.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.displayName || "User"}</p>
            <p className="text-xs text-white/40 font-display tracking-widest uppercase">Level {user?.level || 1}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <span>XP</span>
            <span>{user?.xp || 0}/1000</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(((user?.xp || 0) / 1000) * 100, 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden text-white">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-[#0a0a0a] border-r-white/10">
          <NavContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className={`hidden md:flex flex-col w-72 h-screen border-r border-white/5 bg-[#0a0a0a] sticky top-0 ${className}`}>
      <NavContent />
    </div>
  );
}
