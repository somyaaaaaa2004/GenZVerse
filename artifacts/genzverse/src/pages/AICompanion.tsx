import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Send, Sparkles, Target, TrendingUp, Calendar, Lightbulb, Brain, Trash2 } from "lucide-react";
import { aiApi } from "@/lib/api/client";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

const QUICK_ACTIONS = [
  { label: "Help me plan my week", icon: Calendar },
  { label: "I want to improve my fitness", icon: Target },
  { label: "I want streetwear", icon: Sparkles },
  { label: "I want more XP", icon: TrendingUp },
  { label: "I feel lonely", icon: Brain },
  { label: "Suggest a study plan", icon: Lightbulb },
];

function renderMarkdownLite(text: string) {
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    if (line.startsWith("### ")) return <h4 key={idx} className="font-bold mt-2">{line.slice(4)}</h4>;
    if (line.startsWith("## ") || line.startsWith("**") && line.endsWith("**") && !line.includes(" ")) {
      // skip
    }
    if (/^\*\*.+\*\*$/.test(line.trim())) {
      return <p key={idx} className="font-bold mt-2">{line.replace(/\*\*/g, "")}</p>;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return <li key={idx} className="ml-4 list-disc">{line.slice(2)}</li>;
    }
    if (/^\d+\.\s/.test(line)) {
      return <li key={idx} className="ml-4 list-decimal">{line.replace(/^\d+\.\s/, "")}</li>;
    }
    if (line.startsWith("|")) {
      return <p key={idx} className="font-mono text-xs whitespace-pre-wrap">{line}</p>;
    }
    if (!line.trim()) return <br key={idx} />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={idx} className="leading-relaxed">
        {parts.map((p, i) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={i}>{p.slice(2, -2)}</strong>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </p>
    );
  });
}

export default function AICompanion() {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(QUICK_ACTIONS.map((q) => q.label));
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["ai", "messages"],
    queryFn: () => aiApi.getMessages(),
  });

  const { data: insights } = useQuery({
    queryKey: ["ai", "insights"],
    queryFn: () => aiApi.getInsights(),
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => aiApi.sendMessage(content),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ai", "messages"] });
      setInput("");
      if (data.suggestions?.length) setSuggestions(data.suggestions);
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => aiApi.clearMessages(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ai", "messages"] }),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMutation.isPending]);

  const sendMessage = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sendMutation.isPending) return;
    sendMutation.mutate(content);
  };

  const insightCards = useMemo(
    () => [
      { label: "Streak", value: insights?.currentStreak ?? 0 },
      { label: "Life Score", value: insights?.lifeScore ?? 0 },
      { label: "Weekly Activity", value: insights?.weeklyActivityCount ?? 0 },
      { label: "Level", value: insights?.level ?? 1 },
    ],
    [insights],
  );

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs font-bold tracking-[0.3em] uppercase mb-1">Your Digital Twin</p>
          <h1 className="font-display text-5xl text-foreground uppercase tracking-tight">
            AI <span className="text-purple-500">Companion</span>
          </h1>
        </div>
        <Button variant="outline" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending}>
          <Trash2 className="h-4 w-4 mr-2" /> Clear chat
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col bg-card border-border rounded-2xl overflow-hidden min-h-[520px]">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold">GenZVerse AI</p>
                <p className="text-xs text-emerald-500">Online · Remembers context · Platform-aware</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <Skeleton className="h-24 rounded-xl" />
              ) : messages.length === 0 ? (
                <Empty>
                  <EmptyTitle>Start a conversation</EmptyTitle>
                  <EmptyDescription>
                    Ask about fitness, StyleVerse, XP, communities, weekly plans, and more.
                  </EmptyDescription>
                </Empty>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-lime text-black"
                          : "bg-muted text-foreground border border-border"
                      }`}
                    >
                      {m.role === "assistant" ? renderMarkdownLite(m.content) : m.content}
                    </div>
                  </div>
                ))
              )}
              {sendMutation.isPending && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl bg-muted border border-border text-sm animate-pulse">
                    Thinking…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t border-border space-y-2">
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 4).map((s) => (
                  <Button key={s} size="sm" variant="outline" onClick={() => sendMessage(s)} disabled={sendMutation.isPending}>
                    {s}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <Button onClick={() => sendMessage()} disabled={sendMutation.isPending || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-card border-border rounded-2xl">
            <h3 className="font-bold mb-3">Quick actions</h3>
            <div className="grid grid-cols-1 gap-2">
              {QUICK_ACTIONS.map((a) => (
                <Button
                  key={a.label}
                  variant="outline"
                  className="justify-start"
                  onClick={() => sendMessage(a.label)}
                  disabled={sendMutation.isPending}
                >
                  <a.icon className="h-4 w-4 mr-2" /> {a.label}
                </Button>
              ))}
            </div>
          </Card>
          <Card className="p-4 bg-card border-border rounded-2xl">
            <h3 className="font-bold mb-3">Your pulse</h3>
            <div className="grid grid-cols-2 gap-2">
              {insightCards.map((c) => (
                <div key={c.label} className="rounded-xl border border-border p-3">
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="text-xl font-bold">{c.value}</p>
                </div>
              ))}
            </div>
            {insights?.recommendations?.challenges?.length ? (
              <div className="mt-4 space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Suggested challenges</p>
                {insights.recommendations.challenges.map((c) => (
                  <p key={c.title} className="text-sm">{c.title} · {c.category}</p>
                ))}
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
