import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, Activity, Target, Users, Bot, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">GenZVerse</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium hidden md:flex">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button className="font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
                Enter Universe
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 relative">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              <span>The Social OS for Ambitious Gen Z</span>
            </div>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter uppercase mb-6 leading-[0.9]">
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70">
                Your Life.
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                Your Verse.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              Level up your reality. Track your growth, join elite squads, and conquer life with your AI twin by your side.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95">
                  Start Building <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-border bg-background/50 backdrop-blur-sm hover:bg-muted/50 transition-all">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Floating Dashboard Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 rounded-xl" />
            <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-2xl shadow-2xl overflow-hidden p-2">
              <div className="rounded-lg border border-border/50 bg-background overflow-hidden aspect-[16/9] relative">
                {/* Mockup UI Elements */}
                <div className="absolute top-4 left-4 right-4 flex gap-4">
                  <div className="w-64 h-32 rounded-xl bg-card border border-border/50 p-4 shadow-sm flex flex-col justify-between">
                    <span className="text-muted-foreground text-sm font-medium">Life Score</span>
                    <span className="text-4xl font-display font-bold text-primary">87</span>
                  </div>
                  <div className="w-64 h-32 rounded-xl bg-card border border-border/50 p-4 shadow-sm flex flex-col justify-between">
                    <span className="text-muted-foreground text-sm font-medium">Productivity</span>
                    <span className="text-4xl font-display font-bold text-secondary">78</span>
                  </div>
                  <div className="w-64 h-32 rounded-xl bg-card border border-border/50 p-4 shadow-sm flex flex-col justify-between">
                    <span className="text-muted-foreground text-sm font-medium">Social</span>
                    <span className="text-4xl font-display font-bold text-accent">82</span>
                  </div>
                </div>
                <div className="absolute top-40 left-4 right-4 h-64 rounded-xl bg-muted/30 border border-border/50" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">The Operating System</h2>
            <p className="text-muted-foreground text-lg">Everything you need to optimize your existence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "AI Digital Twin", icon: Bot, color: "text-primary", bg: "bg-primary/10" },
              { title: "Social Squads", icon: Users, color: "text-secondary", bg: "bg-secondary/10" },
              { title: "Life Analytics", icon: Activity, color: "text-accent", bg: "bg-accent/10" },
              { title: "Daily Challenges", icon: Target, color: "text-orange-500", bg: "bg-orange-500/10" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`h-12 w-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">Gamify your progress and conquer goals with an ecosystem designed for high performers.</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 -z-10" />
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-8">READY TO BUILD?</h2>
          <Link href="/signup">
            <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 hover:-translate-y-1 transition-all">
              Create Your Universe
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
