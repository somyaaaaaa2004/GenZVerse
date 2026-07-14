import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { dashboardApi } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

export function Navbar() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => dashboardApi.getNotifications(),
    enabled: Boolean(user),
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <Sidebar isMobile />
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                window.location.href = `/dashboard/social?q=${encodeURIComponent(search.trim())}`;
              }
            }}
            placeholder="Search..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-white/60 hover:text-white">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-[#D9FF00] rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-[#111] border-white/10 p-0" align="end">
            <div className="p-4 border-b border-white/5">
              <h4 className="font-bold text-white">Notifications</h4>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-white/40">No notifications yet</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5">
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    {n.body && <p className="text-xs text-white/40 mt-1">{n.body}</p>}
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {user?.displayName?.charAt(0) || user?.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 bg-[#111] border-white/10" align="end">
            <div className="p-2">
              <p className="text-sm font-bold text-white leading-none">{user?.displayName}</p>
              <p className="text-xs text-white/40 mt-1">{user?.email}</p>
            </div>
            <div className="border-t border-white/5 mt-2 pt-2 space-y-1">
              <Link to="/dashboard/profile">
                <Button variant="ghost" className="w-full justify-start text-white/70">Profile</Button>
              </Link>
              <Link to="/dashboard/settings">
                <Button variant="ghost" className="w-full justify-start text-white/70">Settings</Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start text-red-400" onClick={() => logout()}>
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
