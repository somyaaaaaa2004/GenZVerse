import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ApiError } from "@/lib/api/client";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^A-Za-z0-9]/, "Must include a special character"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const inviteCode = params.code ?? searchParams.get("inviteCode") ?? searchParams.get("code") ?? undefined;
  const emailInviteToken = searchParams.get("emailInvite") ?? undefined;
  const prefillEmail = searchParams.get("email") ?? "";
  const { signup } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: prefillEmail, password: "" },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsPending(true);
    try {
      await signup(data.email, data.password, data.fullName, inviteCode, emailInviteToken);
      toast({
        title: "Account created",
        description: "Welcome to GenZVerse! Check your email to verify your account.",
      });
      navigate("/onboarding", { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Signup failed";
      toast({ title: "Signup failed", description: msg, variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505]">
      <div className="relative z-10 w-full max-w-md px-4">
        <Link to="/">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">GENZ<span className="text-purple-400">VERSE</span></span>
          </div>
        </Link>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="font-display text-3xl font-bold text-white mb-6">CREATE ACCOUNT</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {(["fullName", "email", "password"] as const).map((name) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-xs uppercase">{name === "fullName" ? "Full Name" : name}</FormLabel>
                    <FormControl>
                      {name === "password" ? (
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} className="bg-white/5 border-white/10 text-white h-12 rounded-xl pr-12" {...field} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      ) : (
                        <Input className="bg-white/5 border-white/10 text-white h-12 rounded-xl" {...field} />
                      )}
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />
              ))}
              <Button type="submit" disabled={isPending} className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl">
                {isPending ? "Creating..." : <>Start Your Journey <ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-white/40">
            Already in the verse? <Link to="/login" className="text-purple-400">Log in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
