import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Zap, ArrowRight, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "email" | "sent";

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Error", description: data.error ?? "Something went wrong", variant: "destructive" });
        return;
      }

      // In dev mode the token is returned directly so the user can use it immediately
      if (data.resetToken) {
        const origin = window.location.origin;
        const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
        setResetLink(`${origin}${base}/reset-password?token=${data.resetToken}`);
      }
      setStep("sent");
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505]">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-pink-600/20 blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        <Link href="/">
          <div className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity cursor-pointer justify-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-tight">
              GENZ<span className="text-purple-400">VERSE</span>
            </span>
          </div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          {step === "email" ? (
            <>
              <div className="mb-8">
                <div className="h-12 w-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-purple-400" />
                </div>
                <h2 className="font-display text-3xl font-bold text-white tracking-tight mb-1">
                  FORGOT PASSWORD?
                </h2>
                <p className="text-white/50 text-sm">
                  No worries — enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/70 text-xs font-medium uppercase tracking-wider">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500 focus:ring-purple-500/20 h-12 rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl text-sm tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Reset Link <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors">
                  <ArrowLeft className="h-3 w-3" /> Back to login
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-[#D9FF00]/10 border border-[#D9FF00]/30 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="h-8 w-8 text-[#D9FF00]" />
                </div>
                <h2 className="font-display text-2xl font-bold text-white tracking-tight mb-2">
                  RESET LINK READY
                </h2>
                <p className="text-white/50 text-sm mb-6">
                  We found your account for <span className="text-white/80 font-medium">{email}</span>.
                  In production, the link would be sent to your email.
                </p>

                {resetLink && (
                  <div className="mb-6 p-4 rounded-xl bg-[#D9FF00]/5 border border-[#D9FF00]/20 text-left">
                    <p className="text-[#D9FF00] text-xs font-semibold uppercase tracking-wider mb-2">
                      🔗 Your Reset Link (dev mode)
                    </p>
                    <p className="text-white/60 text-xs break-all mb-3">{resetLink}</p>
                    <Link href={resetLink.replace(window.location.origin + (import.meta.env.BASE_URL?.replace(/\/$/, "") ?? ""), "")}>
                      <Button className="w-full h-10 bg-[#D9FF00] hover:bg-[#c8ee00] text-black font-bold rounded-lg text-sm">
                        Go to Reset Password →
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="space-y-3 text-left p-4 rounded-xl bg-white/3 border border-white/5">
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider">To enable real email delivery:</p>
                  <div className="space-y-2 text-white/50 text-xs">
                    <p>1. Add <code className="text-purple-400 bg-purple-500/10 px-1 rounded">SMTP_HOST</code>, <code className="text-purple-400 bg-purple-500/10 px-1 rounded">SMTP_USER</code>, <code className="text-purple-400 bg-purple-500/10 px-1 rounded">SMTP_PASS</code> secrets</p>
                    <p>2. Or connect a Resend / SendGrid / Gmail API integration</p>
                    <p>3. The backend route <code className="text-purple-400 bg-purple-500/10 px-1 rounded">/api/auth/forgot-password</code> is already set up — just plug in an email sender</p>
                  </div>
                </div>

                <Link href="/login" className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors mt-6">
                  <ArrowLeft className="h-3 w-3" /> Back to login
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
