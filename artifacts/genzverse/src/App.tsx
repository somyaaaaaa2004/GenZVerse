import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuthStore } from "@/stores/authStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Spinner } from "@/components/ui/spinner";
import { useRealtime } from "@/hooks/useRealtime";

const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Squads = lazy(() => import("@/pages/Squads"));
const Communities = lazy(() => import("@/pages/Communities"));
const Challenges = lazy(() => import("@/pages/Challenges"));
const AICompanion = lazy(() => import("@/pages/AICompanion"));
const StyleVerse = lazy(() => import("@/pages/StyleVerse"));
const LifeWrapped = lazy(() => import("@/pages/LifeWrapped"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const Social = lazy(() => import("@/pages/Social"));
const InviteFriends = lazy(() => import("@/pages/InviteFriends"));
const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Spinner className="size-8 text-primary" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.onboardingCompleted ? "/dashboard" : "/onboarding"}
        replace
      />
    );
  }
  return <>{children}</>;
}

function AuthRedirect() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      isAuthenticated &&
      !isLoading &&
      ["/", "/login", "/signup"].includes(location.pathname)
    ) {
      navigate(user?.onboardingCompleted ? "/dashboard" : "/onboarding", {
        replace: true,
      });
    }
  }, [isAuthenticated, isLoading, location.pathname, user, navigate]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <AuthRedirect />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            }
          />
          <Route
            path="/invite/:code"
            element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <OnboardingRoute>
                <Onboarding />
              </OnboardingRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/squads"
            element={
              <ProtectedRoute>
                <Squads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/communities"
            element={
              <ProtectedRoute>
                <Communities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/challenges"
            element={
              <ProtectedRoute>
                <Challenges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/ai-companion"
            element={
              <ProtectedRoute>
                <AICompanion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/styleverse"
            element={
              <ProtectedRoute>
                <StyleVerse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/life-wrapped"
            element={
              <ProtectedRoute>
                <LifeWrapped />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile/:id"
            element={
              <ProtectedRoute>
                <PublicProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/social"
            element={
              <ProtectedRoute>
                <Social />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/invites"
            element={
              <ProtectedRoute>
                <InviteFriends />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    initialize();
  }, [initialize]);
  useRealtime(queryClient, isAuthenticated);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="genzverse-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
