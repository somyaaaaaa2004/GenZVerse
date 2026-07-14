import { motion } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/lib/api/client";
import { AreaChart, Area, RadialBarChart, RadialBar, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Share2, Trophy, Users, Zap, Target, Download } from "lucide-react";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useToast } from "@/hooks/use-toast";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function downloadCanvas(canvas: HTMLCanvasElement, filename: string, type: "image/png" | "image/jpeg") {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL(type, 0.95);
  link.click();
}

export default function LifeWrapped() {
  const { toast } = useToast();
  const [shareOpen, setShareOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["life-wrapped"],
    queryFn: () => profileApi.getLifeWrapped(),
  });

  const year = (data?.year as number) ?? new Date().getFullYear();
  const monthlyXp = (data?.monthlyXp as Array<{ month: number; xp: number }>) ?? [];
  const chartData = MONTHS.map((label, i) => ({
    month: label,
    xp: monthlyXp.find((m) => m.month === i + 1)?.xp ?? 0,
  }));

  const scores = (data?.scores as Record<string, number>) ?? {};
  const scoreRings = [
    { name: "Life", value: scores.life ?? 0, fill: "#D9FF00" },
    { name: "Productivity", value: scores.productivity ?? 0, fill: "#7C3AED" },
    { name: "Social", value: scores.social ?? 0, fill: "#EC4899" },
    { name: "Learning", value: scores.learning ?? 0, fill: "#06B6D4" },
  ];

  const topMoments = (data?.topMoments as Array<{
    id: string;
    description: string;
    createdAt: string;
    xpEarned: number | null;
  }>) ?? [];

  const shareUrl = `${window.location.origin}/dashboard/life-wrapped`;
  const shareText = encodeURIComponent(
    `My GenZVerse Life Wrapped ${year}: Level ${data?.level ?? 1}, ${data?.xp ?? 0} XP, ${data?.challengesCompleted ?? 0} challenges. ${shareUrl}`,
  );

  const buildShareCard = (format: "image/png" | "image/jpeg") => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const grd = ctx.createLinearGradient(0, 0, 1080, 1920);
    grd.addColorStop(0, "#12061f");
    grd.addColorStop(0.5, "#1a0b2e");
    grd.addColorStop(1, "#050505");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = "#D9FF00";
    ctx.font = "bold 64px sans-serif";
    ctx.fillText("GENZVERSE", 80, 160);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 72px sans-serif";
    ctx.fillText(`LIFE WRAPPED ${year}`, 80, 300);
    ctx.font = "48px sans-serif";
    ctx.fillText(`Level ${data?.level ?? 1}`, 80, 420);
    ctx.fillText(`${data?.xp ?? 0} XP`, 80, 500);
    ctx.fillText(`${data?.challengesCompleted ?? 0} Challenges`, 80, 580);
    ctx.fillText(`${data?.friendsCount ?? 0} Friends`, 80, 660);
    ctx.fillText(`${data?.achievementsEarned ?? 0} Achievements`, 80, 740);
    ctx.fillText(`${data?.communitiesJoined ?? 0} Communities`, 80, 820);
    ctx.fillStyle = "#EC4899";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("Scores", 80, 960);
    ctx.fillStyle = "#ffffff";
    ctx.font = "36px sans-serif";
    ctx.fillText(`Life ${scores.life ?? 0} · Social ${scores.social ?? 0} · Style ${scores.style ?? 0}`, 80, 1020);
    downloadCanvas(canvas, `genzverse-wrapped-${year}.${format === "image/png" ? "png" : "jpg"}`, format);
    toast({ title: "Downloaded", description: "Share card saved" });
  };

  const openShare = async (platform: string) => {
    const map: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${shareText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${shareText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      instagram: shareUrl,
    };
    if (platform === "instagram") {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied", description: "Paste into Instagram Story" });
      return;
    }
    if (platform === "native" && navigator.share) {
      await navigator.share({ title: "My Life Wrapped", text: decodeURIComponent(shareText), url: shareUrl });
      return;
    }
    window.open(map[platform], "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-48 rounded-2xl mb-8" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10 text-center py-8">
        <p className="text-muted-foreground text-xs font-bold tracking-[0.4em] uppercase mb-3">Your Year in Review</p>
        <h1 className="font-display text-6xl md:text-8xl uppercase tracking-tight">
          <span className="text-foreground">Life </span>
          <span className="bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#D9FF00] bg-clip-text text-transparent">
            Wrapped
          </span>
        </h1>
        <p className="font-display text-4xl text-muted-foreground uppercase mt-1">{year}</p>
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          <Button className="bg-lime text-black font-bold rounded-xl px-6" onClick={() => setShareOpen((v) => !v)}>
            <Share2 className="h-4 w-4 mr-2" /> Share My Wrapped
          </Button>
          <Button variant="outline" onClick={() => buildShareCard("image/png")}>
            <Download className="h-4 w-4 mr-2" /> PNG
          </Button>
          <Button variant="outline" onClick={() => buildShareCard("image/jpeg")}>
            <Download className="h-4 w-4 mr-2" /> JPEG
          </Button>
        </div>
        {shareOpen && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["whatsapp", "instagram", "facebook", "linkedin", "twitter", "native"].map((p) => (
              <Button key={p} variant="outline" size="sm" onClick={() => openShare(p)}>
                {p}
              </Button>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { icon: Zap, label: "XP", value: Number(data?.xp ?? 0) },
          { icon: Trophy, label: "Challenges", value: Number(data?.challengesCompleted ?? 0) },
          { icon: Users, label: "Friends", value: Number(data?.friendsCount ?? 0) },
          { icon: Target, label: "Level", value: Number(data?.level ?? 1) },
        ].map((s) => (
          <Card key={s.label} className="p-4 bg-card border-border rounded-2xl text-center">
            <s.icon className="h-6 w-6 text-lime mx-auto mb-2" />
            <p className="font-display text-3xl">{s.value}</p>
            <p className="text-muted-foreground text-xs uppercase">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-card border-border rounded-2xl mb-8">
        <h2 className="font-display text-xl uppercase mb-4">XP Over Time</h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <XAxis dataKey="month" stroke="#888" />
            <Tooltip />
            <Area type="monotone" dataKey="xp" stroke="#D9FF00" fill="#D9FF0030" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {scoreRings.map((s) => (
          <Card key={s.name} className="p-4 bg-card border-border rounded-2xl">
            <ResponsiveContainer width="100%" height={100}>
              <RadialBarChart data={[s]} innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={4} fill={s.fill} background={{ fill: "#ffffff10" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <p className="text-center text-sm font-bold">{s.name}</p>
            <p className="text-center text-muted-foreground text-xs">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-display text-xl uppercase">Top Moments</h2>
        </div>
        {topMoments.length === 0 ? (
          <div className="p-8">
            <Empty>
              <EmptyTitle>No moments yet</EmptyTitle>
              <EmptyDescription>Complete activities this year to build your wrapped story.</EmptyDescription>
            </Empty>
          </div>
        ) : (
          topMoments.map((m) => (
            <div key={m.id} className="px-5 py-4 border-b border-border last:border-0 flex items-center gap-4">
              <Trophy className="h-5 w-5 text-amber-400" />
              <div className="flex-1">
                <p className="text-sm font-medium">{m.description}</p>
                <p className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</p>
              </div>
              {m.xpEarned ? (
                <span className="text-xs font-bold text-black bg-lime px-2 py-0.5 rounded-lg">+{m.xpEarned} XP</span>
              ) : null}
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
