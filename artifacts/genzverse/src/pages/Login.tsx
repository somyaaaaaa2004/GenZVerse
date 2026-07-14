import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const OAUTH_ERRORS: Record<string, string> = {
  google_auth_failed: "Google sign-in was cancelled or failed.",
  google_state_mismatch: "Google sign-in session expired. Please try again.",
  oauth_failed: "Could not complete Google sign-in. Please try again.",
};

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", rememberMe: false },
  });

  useEffect(() => {
    const error = searchParams.get("error");
    if (error && OAUTH_ERRORS[error]) {
      toast({
        title: "Sign-in failed",
        description: OAUTH_ERRORS[error],
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsPending(true);
    try {
      const user = await login(data.identifier, data.password, data.rememberMe);
      navigate(user.onboardingCompleted ? "/dashboard" : "/onboarding", { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Login failed";
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

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
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-white tracking-tight mb-1">WELCOME BACK.</h2>
            <p className="text-white/50 text-sm">Log in to continue your journey.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-xs font-medium uppercase tracking-wider">
                      Email or Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com or username"
                        className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                        autoComplete="username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-white/70 text-xs font-medium uppercase tracking-wider">Password</FormLabel>
                      <Link to="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300">Forgot password?</Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="bg-white/5 border-white/10 text-white h-12 rounded-xl pr-12"
                          autoComplete="current-password"
                          {...field}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-white/20 data-[state=checked]:bg-purple-600"
                      />
                    </FormControl>
                    <FormLabel className="text-white/60 text-sm font-normal cursor-pointer">
                      Remember me for 30 days
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending} className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl">
                {isPending ? "Logging in..." : <>Sign In <ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-white/40">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-12 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl"
          >
            Continue with Google
          </Button>

          <div className="mt-6 text-center text-sm text-white/40">
            New to the verse? <Link to="/signup" className="text-purple-400 font-medium">Sign up</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
