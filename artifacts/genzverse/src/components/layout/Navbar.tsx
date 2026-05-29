import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar";
import { Bell, Search, Settings, User, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "Alex sent you a friend request", time: "2m ago", unread: true },
  { id: 2, text: "New challenge available: 30-Day Run", time: "1h ago", unread: true },
  { id: 3, text: "Your squad reached 500 XP", time: "3h ago", unread: false },
  { id: 4, text: "StyleVerse: New drop from Adidas", time: "5h ago", unread: false },
  { id: 5, text: "Weekly AI insights are ready", time: "1d ago", unread: false },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#050505]/90 backdrop-blur-xl">
      <div className="flex h-20 items-center px-6 gap-6">
        <Sidebar isMobile={true} />
        
        <div className="flex-1 flex items-center gap-4">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              type="search"
              placeholder="Search your universe..."
              className="w-full h-11 bg-white/5 border-white/10 pl-10 text-white placeholder:text-white/40 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 h-10 w-10 rounded-xl">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#EC4899] shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-[#111111] border-white/10 mr-4 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#181818]">
                <span className="font-display text-xl">NOTIFICATIONS</span>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllRead} className="h-8 text-xs text-white/50 hover:text-white">
                    Mark all read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                <div className="flex flex-col">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-4 border-b border-white/5 flex gap-3 items-start hover:bg-white/5 transition-colors cursor-pointer ${n.unread ? "bg-primary/5" : ""}`}>
                      <div className="mt-1">
                        {n.unread ? (
                          <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-white/20" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className={`text-sm ${n.unread ? "text-white font-medium" : "text-white/70"}`}>{n.text}</p>
                        <p className="text-xs text-white/40">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-white/10 bg-[#181818]">
                <Button variant="ghost" className="w-full text-xs font-bold tracking-widest uppercase text-white/50 hover:text-white">
                  See all notifications
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <Avatar className="h-10 w-10 border-2 border-transparent hover:border-[#D9FF00] transition-colors">
                  <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#111111] border-white/10 mr-4 rounded-2xl shadow-2xl p-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-white leading-none">{user?.fullName}</p>
                  <p className="text-xs text-white/50 leading-none">@{user?.username}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild className="p-3 focus:bg-white/10 cursor-pointer rounded-xl">
                <Link href="/dashboard/profile" className="flex items-center w-full">
                  <User className="mr-3 h-4 w-4 text-white/70" />
                  <span className="font-medium text-white">Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="p-3 focus:bg-white/10 cursor-pointer rounded-xl">
                <Link href="/dashboard/settings" className="flex items-center w-full">
                  <Settings className="mr-3 h-4 w-4 text-white/70" />
                  <span className="font-medium text-white">Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="p-3 focus:bg-red-500/20 cursor-pointer rounded-xl text-red-400" onClick={() => logout()}>
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-medium">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}