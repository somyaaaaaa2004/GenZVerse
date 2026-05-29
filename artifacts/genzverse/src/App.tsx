import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Squads from "@/pages/Squads";
import Communities from "@/pages/Communities";
import Challenges from "@/pages/Challenges";
import AICompanion from "@/pages/AICompanion";
import StyleVerse from "@/pages/StyleVerse";
import Marketplace from "@/pages/Marketplace";
import LifeWrapped from "@/pages/LifeWrapped";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...rest }: any) {
  return (
    <Route {...rest}>
      {(params) => (
        <DashboardLayout>
          <Component params={params} />
        </DashboardLayout>
      )}
    </Route>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // If logged in and on landing/login/signup, redirect appropriately
    if (isAuthenticated && !isLoading && (location === "/" || location === "/login" || location === "/signup")) {
      if (user && !user.onboardingCompleted) {
        setLocation("/onboarding");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, location, user, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/onboarding" component={Onboarding} />
      
      {/* Protected Dashboard Routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/dashboard/squads" component={Squads} />
      <ProtectedRoute path="/dashboard/communities" component={Communities} />
      <ProtectedRoute path="/dashboard/challenges" component={Challenges} />
      <ProtectedRoute path="/dashboard/ai-companion" component={AICompanion} />
      <ProtectedRoute path="/dashboard/styleverse" component={StyleVerse} />
      <ProtectedRoute path="/dashboard/marketplace" component={Marketplace} />
      <ProtectedRoute path="/dashboard/life-wrapped" component={LifeWrapped} />
      <ProtectedRoute path="/dashboard/profile" component={Profile} />
      <ProtectedRoute path="/dashboard/settings" component={Settings} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="genzverse-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
