import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/50 backdrop-blur-xl">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        <Sidebar isMobile={true} />
        
        <div className="flex-1 flex items-center gap-4">
          <div className="relative w-full max-w-sm hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search your universe..."
              className="w-full bg-muted/50 border-none pl-8 focus-visible:ring-primary/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-secondary"></span>
          </Button>
          {user && (
            <Avatar className="h-8 w-8 ml-2 border border-primary/20">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.username || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user.fullName?.charAt(0) || user.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </header>
  );
}
