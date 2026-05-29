import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useSignup } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { login: setAuthToken } = useAuth();
  const { toast } = useToast();
  const signupMutation = useSignup();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const onSubmit = (data: SignupFormValues) => {
    signupMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          setAuthToken(res.token);
          setLocation("/onboarding");
        },
        onError: (err: any) => {
          const msg = err?.data?.error ?? err?.message ?? "An error occurred during signup";
          toast({ title: "Signup failed", description: msg, variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505]">
      {/* Neon blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-pink-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
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
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-white tracking-tight mb-1">
              CREATE ACCOUNT
            </h2>
            <p className="text-white/50 text-sm">Start building your universe today.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-xs font-medium uppercase tracking-wider">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-fullname"
                        placeholder="Alex Johnson"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500 focus:ring-purple-500/20 h-12 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-xs font-medium uppercase tracking-wider">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-email"
                        placeholder="you@example.com"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500 focus:ring-purple-500/20 h-12 rounded-xl"
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
                    <FormLabel className="text-white/70 text-xs font-medium uppercase tracking-wider">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          data-testid="input-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500 focus:ring-purple-500/20 h-12 rounded-xl pr-12"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <Button
                data-testid="button-signup"
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full h-12 mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl text-sm tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {signupMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Start Your Journey <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-white/40">
            Already in the verse?{" "}
            <Link href="/login" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
              Log in
            </Link>
          </div>
        </motion.div>

        {/* Social proof */}
        <p className="text-center text-white/30 text-xs mt-6">
          Trusted by 50K+ Gen Z worldwide
        </p>
      </div>
    </div>
  );
}
