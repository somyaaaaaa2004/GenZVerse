import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authApi, ApiError } from "@/lib/api/client";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!token) return;
  }, [token]);

  const passwordStrength = (() => {
    if (newPassword.length === 0) return 0;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "text-red-400", "text-yellow-400", "text-blue-400", "text-[#D9FF00]"][passwordStrength];
  const strengthBarColor = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-[#D9FF00]"][passwordStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({ title: "Error", description: "Invalid reset link — no token found.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    const strongPassword =
      /[a-z]/.test(newPassword) &&
      /[A-Z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[^A-Za-z0-9]/.test(newPassword);
    if (!strongPassword) {
      toast({
        title: "Error",
        description: "Password must include upper, lower, number, and special character.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong";
      toast({ title: "Reset failed", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center max-w-md px-4">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-white mb-2">INVALID LINK</h2>
          <p className="text-white/50 text-sm mb-6">This reset link is missing a token. Please request a new one.</p>
          <Link to="/forgot-password">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl">
              Request New Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505]">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-pink-600/20 blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        <Link to="/">
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
          {success ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-full bg-[#D9FF00]/10 border border-[#D9FF00]/30 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="h-8 w-8 text-[#D9FF00]" />
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">PASSWORD UPDATED!</h2>
              <p className="text-white/50 text-sm mb-1">Your password has been changed successfully.</p>
              <p className="text-white/30 text-xs">Redirecting to login in 3 seconds…</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="font-display text-3xl font-bold text-white tracking-tight mb-1">
                  SET NEW PASSWORD
                </h2>
                <p className="text-white/50 text-sm">
                  Choose a strong new password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/70 text-xs font-medium uppercase tracking-wider">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500 focus:ring-purple-500/20 h-12 rounded-xl pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              i <= passwordStrength ? strengthBarColor : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${strengthColor}`}>{strengthLabel}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70 text-xs font-medium uppercase tracking-wider">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500 focus:ring-purple-500/20 h-12 rounded-xl pr-12 ${
                        confirmPassword && newPassword !== confirmPassword ? "border-red-500/50" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-red-400 text-xs">Passwords don't match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || (!!confirmPassword && newPassword !== confirmPassword)}
                  className="w-full h-12 mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl text-sm tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Update Password <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-white/40 hover:text-white/70 text-sm transition-colors">
                  Back to login
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
