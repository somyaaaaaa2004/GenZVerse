import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Share2, Sparkles, Bookmark, MessageCircle, Copy } from "lucide-react";
import { ApiError, outfitApi } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const TAG_COLORS: Record<string, string> = {
  Streetwear: "bg-purple-500/20 text-purple-400",
  Vintage: "bg-amber-500/20 text-amber-400",
  Y2K: "bg-pink-500/20 text-pink-400",
  Minimalist: "bg-cyan-500/20 text-cyan-400",
  Techwear: "bg-orange-500/20 text-orange-400",
};

type OutfitCard = {
  id: string;
  title: string;
  brand: string | null;
  description: string | null;
  imageUrl: string;
  styleTag: string;
  price: number | null;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  liked: boolean;
  bookmarked: boolean;
  user: { id: string; username: string | null; displayName: string | null; avatarUrl: string | null };
};

function outfitFallbackImage(outfit: Pick<OutfitCard, "id" | "title" | "styleTag">) {
  const label = encodeURIComponent(outfit.title.slice(0, 28));
  return `https://placehold.co/600x800/111111/D9FF00/png?text=${label}`;
}

export default function StyleVerse() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string | undefined>();
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [shareFor, setShareFor] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const outfitsQuery = useQuery({
    queryKey: ["outfits", filter],
    queryFn: () => outfitApi.list({ styleTag: filter, limit: 24 }),
  });
  const dnaQuery = useQuery({ queryKey: ["outfits", "dna"], queryFn: () => outfitApi.dna() });
  const trendingQuery = useQuery({ queryKey: ["outfits", "trending"], queryFn: () => outfitApi.trending() });
  const commentsQuery = useQuery({
    queryKey: ["outfits", "comments", commentFor],
    queryFn: () => outfitApi.comments(commentFor!),
    enabled: Boolean(commentFor),
  });

  const patchOutfitInCache = (outfitId: string, patch: Partial<OutfitCard>) => {
    qc.setQueriesData<{ items: OutfitCard[]; nextCursor: string | null }>(
      { queryKey: ["outfits"] },
      (prev) => {
        if (!prev?.items) return prev;
        return {
          ...prev,
          items: prev.items.map((item) => (item.id === outfitId ? { ...item, ...patch } : item)),
        };
      },
    );
  };

  const likeMutation = useMutation({
    mutationFn: (id: string) => outfitApi.like(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["outfits"] });
      const current = (outfitsQuery.data?.items ?? []).find((o) => o.id === id);
      if (!current) return;
      patchOutfitInCache(id, {
        liked: !current.liked,
        likeCount: Math.max(0, current.likeCount + (current.liked ? -1 : 1)),
      });
    },
    onError: (err, id) => {
      void qc.invalidateQueries({ queryKey: ["outfits"] });
      toast({
        title: "Like failed",
        description: err instanceof ApiError ? err.message : "Error",
        variant: "destructive",
      });
    },
    onSuccess: (data, id) => {
      const current = (outfitsQuery.data?.items ?? []).find((o) => o.id === id);
      if (!current) {
        void qc.invalidateQueries({ queryKey: ["outfits"] });
        return;
      }
      // Keep optimistic count; just sync liked flag from server
      patchOutfitInCache(id, { liked: data.liked });
      void qc.invalidateQueries({ queryKey: ["outfits"] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: (id: string) => outfitApi.bookmark(id),
    onMutate: async (id) => {
      const current = (outfitsQuery.data?.items ?? []).find((o) => o.id === id);
      if (!current) return;
      patchOutfitInCache(id, { bookmarked: !current.bookmarked });
    },
    onError: () => void qc.invalidateQueries({ queryKey: ["outfits"] }),
    onSuccess: (data, id) => {
      patchOutfitInCache(id, { bookmarked: data.bookmarked });
    },
  });

  const shareMutation = useMutation({
    mutationFn: ({ id, platform }: { id: string; platform: string }) => outfitApi.share(id, platform),
    onSuccess: async (data, vars) => {
      patchOutfitInCache(vars.id, { shareCount: data.shareCount });
      const text = encodeURIComponent(`Check this outfit on GenZVerse: ${data.url}`);
      const map: Record<string, string> = {
        whatsapp: `https://wa.me/?text=${text}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent("StyleVerse fit")}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`,
        instagram: data.url,
      };
      if (vars.platform === "copy" || vars.platform === "instagram") {
        await navigator.clipboard.writeText(data.url);
        toast({ title: "Link copied", description: "Share URL copied to clipboard" });
      } else if (vars.platform === "native" && navigator.share) {
        await navigator.share({ url: data.url, title: "StyleVerse outfit" });
      } else if (map[vars.platform]) {
        window.open(map[vars.platform], "_blank", "noopener,noreferrer");
      }
      setShareFor(null);
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => outfitApi.comment(id, content),
    onSuccess: async (_data, vars) => {
      setCommentText("");
      patchOutfitInCache(vars.id, {
        commentCount:
          ((outfitsQuery.data?.items ?? []).find((o) => o.id === vars.id)?.commentCount ?? 0) + 1,
      });
      await qc.invalidateQueries({ queryKey: ["outfits", "comments", vars.id] });
      toast({ title: "Comment posted" });
    },
  });

  const outfits = (outfitsQuery.data?.items ?? []) as OutfitCard[];
  const dna = dnaQuery.data ?? [];
  const trending = trendingQuery.data ?? [];
  const tags = useMemo(() => ["Streetwear", "Vintage", "Y2K", "Minimalist", "Techwear"], []);

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="mb-8">
        <p className="text-muted-foreground text-xs font-bold tracking-[0.3em] uppercase mb-1">Fashion Universe</p>
        <h1 className="font-display text-5xl text-foreground uppercase tracking-tight">
          Style<span className="text-pink-500">Verse</span>
        </h1>
        <p className="text-muted-foreground mt-2">Like, save, comment, and share real outfits from the community.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-5 bg-card border-border rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-pink-500" />
            <h3 className="font-display text-2xl uppercase">Style DNA</h3>
          </div>
          <div className="space-y-3">
            {dna.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold">{s.label}</span>
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.pct}%` }}
                    className="h-full rounded-full"
                    style={{ background: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-5 bg-card border-border rounded-2xl">
          <h3 className="font-display text-2xl uppercase mb-3">Trending</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant={!filter ? "default" : "outline"} size="sm" onClick={() => setFilter(undefined)}>All</Button>
            {tags.map((t) => (
              <Button key={t} variant={filter === t ? "default" : "outline"} size="sm" onClick={() => setFilter(t)}>
                {t}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {trending.map((t) => (
              <button
                key={t.name}
                onClick={() => setFilter(t.name)}
                className="px-3 py-1.5 rounded-full border border-border text-sm hover:bg-muted"
              >
                {t.name} · {t.count}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {outfitsQuery.isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : outfits.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No outfits yet. Run the database seed to populate StyleVerse.</Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {outfits.map((o) => {
            const imgSrc = brokenImages[o.id] ? outfitFallbackImage(o) : o.imageUrl;
            return (
              <Card key={o.id} className="overflow-hidden bg-card border-border rounded-2xl" data-outfit-id={o.id}>
                <div className="aspect-[4/5] bg-muted relative">
                  <img
                    src={imgSrc}
                    alt={`${o.title}${o.brand ? ` by ${o.brand}` : ""}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={() =>
                      setBrokenImages((prev) => (prev[o.id] ? prev : { ...prev, [o.id]: true }))
                    }
                  />
                  <span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full ${TAG_COLORS[o.styleTag] ?? "bg-black/40 text-white"}`}>
                    {o.styleTag}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-bold leading-tight">{o.title}</p>
                    <p className="text-xs text-pink-400 mt-0.5">{o.brand || "Independent"}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{o.description}</p>
                    <p className="text-sm font-semibold mt-2">
                      {typeof o.price === "number" ? `$${o.price.toFixed(0)}` : "—"}
                      <span className="text-xs font-normal text-muted-foreground ml-2">
                        · {o.likeCount} likes · {o.shareCount} shares
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={o.liked ? "default" : "outline"}
                      onClick={() => likeMutation.mutate(o.id)}
                      disabled={likeMutation.isPending && likeMutation.variables === o.id}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${o.liked ? "fill-current" : ""}`} /> {o.likeCount}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCommentFor(o.id);
                        setShareFor(null);
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" /> {o.commentCount}
                    </Button>
                    <Button
                      size="sm"
                      variant={o.bookmarked ? "default" : "outline"}
                      onClick={() => bookmarkMutation.mutate(o.id)}
                    >
                      <Bookmark className={`h-4 w-4 ${o.bookmarked ? "fill-current" : ""}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShareFor(o.id);
                        setCommentFor(null);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {shareFor === o.id && (
                    <div className="grid grid-cols-2 gap-2">
                      {["whatsapp", "instagram", "facebook", "twitter", "linkedin", "copy", "native"].map((p) => (
                        <Button
                          key={p}
                          size="sm"
                          variant="outline"
                          onClick={() => shareMutation.mutate({ id: o.id, platform: p })}
                        >
                          {p === "copy" ? <><Copy className="h-3 w-3 mr-1" /> Copy</> : p}
                        </Button>
                      ))}
                    </div>
                  )}

                  {commentFor === o.id && (
                    <div className="space-y-2 border-t border-border pt-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Comments for {o.title}
                      </p>
                      <div className="max-h-28 overflow-y-auto space-y-1">
                        {(commentsQuery.data ?? []).map((c) => (
                          <p key={c.id} className="text-xs">
                            <span className="font-semibold">{c.user.displayName || c.user.username}: </span>
                            {c.content}
                          </p>
                        ))}
                        {(commentsQuery.data ?? []).length === 0 && !commentsQuery.isLoading && (
                          <p className="text-xs text-muted-foreground">No comments yet on this outfit.</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder={`Comment on ${o.title}`}
                        />
                        <Button
                          size="sm"
                          disabled={!commentText.trim() || commentMutation.isPending}
                          onClick={() => commentMutation.mutate({ id: o.id, content: commentText })}
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
