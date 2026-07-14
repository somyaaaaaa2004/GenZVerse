import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ArrowRight, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, ApiError } from "@/lib/api/client";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <Zap className="h-5 w-5 text-purple-400" />
          <span className="font-display text-white font-bold">GENZVERSE</span>
        </Link>

        {!sent ? (
          <>
            <h2 className="font-display text-2xl text-white mb-2">Reset Password</h2>
            <p className="text-white/50 text-sm mb-6">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-white/70">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border-white/10 text-white mt-2" required />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Sending..." : <>Send Reset Link <Mail className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
            <h2 className="font-display text-2xl text-white">Check Your Email</h2>
            <p className="text-white/50 text-sm">If an account exists for {email}, a reset link has been sent.</p>
          </div>
        )}

        <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-purple-400">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </motion.div>
    </div>
  );
}
