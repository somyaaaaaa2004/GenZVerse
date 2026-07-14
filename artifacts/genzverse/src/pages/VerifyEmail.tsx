import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const token = searchParams.get("token");
  const email = searchParams.get("email") ?? "";

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token && email ? "verifying" : "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [resendEmail, setResendEmail] = useState(email);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token || !email) return;

    let cancelled = false;

    async function verify() {
      if (!token || !email) return;
      try {
        const result = await authApi.verifyEmail(token, email);
        if (cancelled) return;
        setStatus("success");
        if (isAuthenticated) {
          setUser(result.user);
        }
        toast({
          title: "Email verified",
          description: "Your account is now active.",
        });
        setTimeout(() => {
          navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
        }, 2500);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(err instanceof ApiError ? err.message : "Verification failed");
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token, email, isAuthenticated, navigate, setUser, toast]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setIsResending(true);
    try {
      await authApi.resendVerification(resendEmail.trim().toLowerCase());
      toast({
        title: "Verification email sent",
        description: "Check your inbox for a new verification link.",
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to resend verification email";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8"
      >
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <Zap className="h-5 w-5 text-purple-400" />
          <span className="font-display text-white font-bold">GENZVERSE</span>
        </Link>

        {status === "verifying" && (
          <div className="text-center space-y-3">
            <div className="h-10 w-10 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto" />
            <h2 className="font-display text-2xl text-white">Verifying email…</h2>
            <p className="text-white/50 text-sm">Please wait while we confirm your account.</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
            <h2 className="font-display text-2xl text-white">Email verified!</h2>
            <p className="text-white/50 text-sm">Redirecting you shortly…</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-400 mx-auto" />
            <h2 className="font-display text-2xl text-white">Verification failed</h2>
            <p className="text-white/50 text-sm">{errorMessage}</p>
            <form onSubmit={handleResend} className="space-y-3 text-left">
              <div>
                <Label className="text-white/70">Resend to email</Label>
                <Input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-2"
                  required
                />
              </div>
              <Button type="submit" disabled={isResending} className="w-full">
                {isResending ? "Sending…" : "Resend verification email"}
              </Button>
            </form>
          </div>
        )}

        {status === "idle" && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-white text-center">Verify your email</h2>
            <p className="text-white/50 text-sm text-center">
              Open the verification link from your inbox, or request a new one below.
            </p>
            <form onSubmit={handleResend} className="space-y-3">
              <div>
                <Label className="text-white/70">Email</Label>
                <Input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-2"
                  required
                />
              </div>
              <Button type="submit" disabled={isResending} className="w-full">
                {isResending ? "Sending…" : <>Send verification email <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>
          </div>
        )}

        <Link to="/login" className="block text-center mt-6 text-sm text-purple-400">
          Back to login
        </Link>
      </motion.div>
    </div>
  );
}
