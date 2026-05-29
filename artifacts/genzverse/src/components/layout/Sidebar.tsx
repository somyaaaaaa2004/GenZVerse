import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, UsersRound, Target, Bot, Sparkles, Store, Activity, User, Settings, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Squads", href: "/dashboard/squads", icon: Users },
  { label: "Communities", href: "/dashboard/communities", icon: UsersRound },
  { label: "Challenges", href: "/dashboard/challenges", icon: Target },
  { label: "AI Companion", href: "/dashboard/ai-companion", icon: Bot },
  { label: "StyleVerse", href: "/dashboard/styleverse", icon: Sparkles },
  { label: "Marketplace", href: "/dashboard/marketplace", icon: Store },
  { label: "Life Wrapped", href: "/dashboard/life-wrapped", icon: Activity },
];

const BOTTOM_NAV_ITEMS = [
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ className = "", isMobile = false }: { className?: string, isMobile?: boolean }) {
  const [location] = useLocation();
  const { logout } = useAuth();

  const NavContent = () => (
    <div className="flex flex-col h-full py-6 px-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">GenZVerse</span>
      </div>

      <div className="space-y-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start ${isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="space-y-1 mt-auto">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start ${isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
        <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-background/80 backdrop-blur-xl border-r-border/50">
          <NavContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className={`hidden md:flex flex-col w-64 h-screen border-r border-border/50 bg-background/50 backdrop-blur-xl sticky top-0 ${className}`}>
      <NavContent />
    </div>
  );
}
