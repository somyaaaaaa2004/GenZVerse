import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { authApi } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    let cancelled = false;

    async function completeOAuth() {
      try {
        const session = await authApi.establishSessionFromCookies();
        if (cancelled) return;
        setUser(session.user);
        const next = searchParams.get("next") ?? "/dashboard";
        navigate(next, { replace: true });
      } catch {
        if (!cancelled) {
          navigate("/login?error=oauth_failed", { replace: true });
        }
      }
    }

    completeOAuth();
    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="text-center space-y-4">
        <Spinner className="size-8 text-purple-400 mx-auto" />
        <p className="text-white/60 text-sm">Completing sign in…</p>
      </div>
    </div>
  );
}
