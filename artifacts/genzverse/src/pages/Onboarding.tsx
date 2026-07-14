import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { userApi } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";

const INTERESTS = ["Design", "Tech", "Fitness", "Music", "Finance", "Travel", "Photography", "Reading", "Gaming", "Fashion", "Cooking", "Business"];
const GOALS = ["Level Up My Career", "Build Better Habits", "Expand My Social Circle", "Learn New Skills", "Track My Finances", "Express My Style", "Find My Community", "Get Fit & Healthy"];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    interests: [] as string[],
    goals: [] as string[],
  });

  const handleComplete = async () => {
    setIsPending(true);
    try {
      await userApi.completeOnboarding({
        displayName: formData.displayName || undefined,
        interests: formData.interests,
        goals: formData.goals,
      });
      await refreshUser();
      toast({ title: "Welcome to GenZVerse!" });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to complete onboarding";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg bg-white/5 border border-white/10 rounded-2xl p-8">
        {step === 1 && (
          <div className="space-y-4">
            <h1 className="font-display text-3xl text-white uppercase">About You</h1>
            <div>
              <Label className="text-white/70">Display Name</Label>
              <Input value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="bg-white/5 border-white/10 text-white mt-2" />
            </div>
            <Button onClick={() => setStep(2)} className="w-full">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h1 className="font-display text-3xl text-white uppercase">Interests</h1>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button key={i} onClick={() => toggleInterest(i)} className={`px-3 py-1.5 rounded-full text-sm border ${formData.interests.includes(i) ? "bg-[#D9FF00] text-black border-[#D9FF00]" : "border-white/20 text-white/60"}`}>{i}</button>
              ))}
            </div>
            <Button onClick={() => setStep(3)} className="w-full">Continue</Button>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h1 className="font-display text-3xl text-white uppercase">Goals</h1>
            <div className="grid gap-2">
              {GOALS.map((g) => (
                <button key={g} onClick={() => toggleGoal(g)} className={`p-3 rounded-xl text-left border ${formData.goals.includes(g) ? "border-[#D9FF00] bg-[#D9FF00]/10 text-white" : "border-white/10 text-white/60"}`}>{g}</button>
              ))}
            </div>
            <Button onClick={() => setStep(4)} className="w-full">Continue</Button>
          </div>
        )}
        {step === 4 && (
          <div className="text-center space-y-6">
            <Sparkles className="h-12 w-12 text-[#D9FF00] mx-auto" />
            <h1 className="font-display text-3xl text-white uppercase">You're Ready!</h1>
            <Button onClick={handleComplete} disabled={isPending} className="w-full bg-[#D9FF00] text-black font-bold">
              {isPending ? "Setting up..." : <>Enter GenZVerse <Check className="ml-2 h-4 w-4" /></>}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
