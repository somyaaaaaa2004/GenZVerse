import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
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

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    signupMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          setAuthToken(res.token);
          // New users always go to onboarding
          setLocation("/onboarding");
        },
        onError: (err: any) => {
          toast({
            title: "Signup failed",
            description: err.error || "An error occurred during signup",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px]" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96 relative z-10">
          <Link href="/">
            <div className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity cursor-pointer inline-flex">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">GenZVerse</span>
            </div>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/50 backdrop-blur-2xl border border-border/50 p-8 rounded-2xl shadow-xl"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Create Account</h2>
            <p className="text-muted-foreground text-sm mb-8">Start building your universe.</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-full text-base font-medium"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? "Creating..." : "Continue"}
                  {!signupMutation.isPending && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </Form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Log in
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Visual side panel for larger screens */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-muted/20 border-l border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564')] bg-cover bg-center opacity-10 mix-blend-overlay dark:opacity-5" />
        <div className="relative z-10 max-w-lg text-center p-8">
          <h3 className="font-display text-4xl font-bold mb-4 tracking-tight">Your life, gamified.</h3>
          <p className="text-xl text-muted-foreground">Join the elite network of ambitious Gen Z.</p>
        </div>
      </div>
    </div>
  );
}
