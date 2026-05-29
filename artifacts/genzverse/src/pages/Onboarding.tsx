import { useState } from "react";
import { useLocation } from "wouter";
import { useCompleteOnboarding } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const INTERESTS = ["Design", "Tech", "Fitness", "Music", "Finance", "Travel", "Photography", "Reading", "Gaming", "Fashion", "Cooking", "Business"];
const GOALS = ["Level Up My Career", "Build Better Habits", "Expand My Social Circle", "Learn New Skills", "Track My Finances", "Express My Style", "Find My Community", "Get Fit & Healthy"];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { user, login } = useAuth();
  const completeMutation = useCompleteOnboarding();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    age: "",
    occupation: "",
    interests: [] as string[],
    goals: [] as string[]
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleComplete = () => {
    completeMutation.mutate(
      {
        data: {
          username: formData.username || `user_${Math.floor(Math.random() * 10000)}`,
          age: parseInt(formData.age) || undefined,
          occupation: formData.occupation,
          interests: formData.interests,
          goals: formData.goals
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Welcome to GenZVerse!" });
          // Force a user state refresh by reading from auth
          setLocation("/dashboard");
          window.location.reload(); // Simple way to reset state
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.error || "Failed to complete onboarding", variant: "destructive" });
        }
      }
    );
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl relative">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-12 bg-primary" : i < step ? "w-8 bg-primary/50" : "w-8 bg-muted"}`} />
            ))}
          </div>
          <span className="text-muted-foreground text-sm font-medium">Step {step} of 4</span>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-card border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl"
        >
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold">Tell us about yourself</h2>
              <p className="text-muted-foreground">Let's set up your profile.</p>
              
              <div className="space-y-4">
                <div>
                  <Label>Username</Label>
                  <Input 
                    placeholder="@username" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input 
                    type="number" 
                    placeholder="22" 
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>What do you do?</Label>
                  <Input 
                    placeholder="Student, Designer, Developer..." 
                    value={formData.occupation}
                    onChange={e => setFormData({...formData, occupation: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <Button onClick={handleNext} className="w-full h-12 text-lg mt-8 rounded-full">
                Continue <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold">What are you into?</h2>
              <p className="text-muted-foreground">Select your interests to personalize your feed.</p>
              
              <div className="flex flex-wrap gap-3 mt-8">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-6 py-3 rounded-full border transition-all text-sm font-medium ${
                      formData.interests.includes(interest)
                        ? "bg-primary text-primary-foreground border-primary scale-105 shadow-lg shadow-primary/20"
                        : "bg-background/50 border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <Button onClick={handleNext} className="w-full h-12 text-lg mt-8 rounded-full" disabled={formData.interests.length === 0}>
                Continue <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold">Set your goals</h2>
              <p className="text-muted-foreground">What do you want to achieve?</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {GOALS.map(goal => (
                  <div
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      formData.goals.includes(goal)
                        ? "bg-primary/10 border-primary"
                        : "bg-background border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="font-medium">{goal}</span>
                    {formData.goals.includes(goal) && <Check className="h-5 w-5 text-primary" />}
                  </div>
                ))}
              </div>

              <Button onClick={handleNext} className="w-full h-12 text-lg mt-8 rounded-full" disabled={formData.goals.length === 0}>
                Continue <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-6 py-8">
              <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-accent mx-auto flex items-center justify-center animate-pulse">
                <Sparkles className="h-12 w-12 text-primary-foreground" />
              </div>
              <h2 className="text-4xl font-display font-bold">Your Universe is Ready</h2>
              <p className="text-xl text-muted-foreground">Your digital twin has been initialized.</p>
              
              <Button 
                onClick={handleComplete} 
                disabled={completeMutation.isPending}
                className="w-full h-14 text-xl mt-8 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95"
              >
                {completeMutation.isPending ? "Entering..." : "Enter GenZVerse"}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
