import { prisma } from "@workspace/db";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { env } from "../config/env.js";

export async function listOutfits(userId: string, opts: { styleTag?: string; cursor?: string; limit?: number }) {
  const limit = Math.min(opts.limit ?? 20, 50);
  const items = await prisma.outfit.findMany({
    where: {
      ...(opts.styleTag ? { styleTag: opts.styleTag } : {}),
      ...(opts.cursor ? { createdAt: { lt: new Date(opts.cursor) } } : {}),
    },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      likes: { where: { userId }, select: { id: true } },
      bookmarks: { where: { userId }, select: { id: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });

  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;
  return {
    items: page.map((o) => ({
      id: o.id,
      title: o.title,
      brand: o.brand,
      description: o.description,
      imageUrl: o.imageUrl,
      styleTag: o.styleTag,
      price: o.price,
      likeCount: o.likeCount,
      shareCount: o.shareCount,
      commentCount: o._count.comments,
      liked: o.likes.length > 0,
      bookmarked: o.bookmarks.length > 0,
      createdAt: o.createdAt,
      user: o.user,
    })),
    nextCursor: hasMore ? page[page.length - 1]?.createdAt.toISOString() ?? null : null,
  };
}

export async function getStyleDna(userId: string) {
  const liked = await prisma.outfitLike.findMany({
    where: { userId },
    include: { outfit: { select: { styleTag: true } } },
    take: 100,
  });
  const counts = new Map<string, number>();
  for (const row of liked) {
    const tag = row.outfit.styleTag;
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
  const palette: Record<string, string> = {
    Streetwear: "#7C3AED",
    Vintage: "#EC4899",
    Y2K: "#D9FF00",
    Minimalist: "#06B6D4",
    Techwear: "#F97316",
  };
  const dna = [...counts.entries()]
    .map(([label, n]) => ({
      label,
      pct: Math.round((n / total) * 100),
      color: palette[label] ?? "#7C3AED",
    }))
    .sort((a, b) => b.pct - a.pct);

  if (dna.length === 0) {
    return [
      { label: "Streetwear", pct: 35, color: "#7C3AED" },
      { label: "Vintage", pct: 25, color: "#EC4899" },
      { label: "Y2K", pct: 20, color: "#D9FF00" },
      { label: "Minimalist", pct: 15, color: "#06B6D4" },
      { label: "Techwear", pct: 5, color: "#F97316" },
    ];
  }
  return dna;
}

export async function createOutfit(
  userId: string,
  data: {
    title: string;
    brand?: string;
    description?: string;
    imageUrl: string;
    styleTag: string;
    price?: number;
  },
) {
  return prisma.outfit.create({
    data: {
      userId,
      title: data.title,
      brand: data.brand,
      description: data.description,
      imageUrl: data.imageUrl,
      styleTag: data.styleTag,
      price: data.price ?? 0,
    },
  });
}

export async function toggleOutfitLike(userId: string, outfitId: string) {
  const outfit = await prisma.outfit.findUnique({ where: { id: outfitId } });
  if (!outfit) throw new NotFoundError("Outfit not found");

  const existing = await prisma.outfitLike.findUnique({
    where: { outfitId_userId: { outfitId, userId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.outfitLike.delete({ where: { id: existing.id } }),
      prisma.outfit.update({ where: { id: outfitId }, data: { likeCount: { decrement: 1 } } }),
    ]);
    return { liked: false };
  }

  await prisma.$transaction([
    prisma.outfitLike.create({ data: { outfitId, userId } }),
    prisma.outfit.update({ where: { id: outfitId }, data: { likeCount: { increment: 1 } } }),
  ]);

  if (outfit.userId !== userId) {
    await prisma.notification.create({
      data: {
        userId: outfit.userId,
        type: "LIKE_RECEIVED",
        title: "Someone liked your outfit",
        body: outfit.title,
        data: { outfitId },
      },
    }).catch(() => undefined);
  }

  return { liked: true };
}

export async function toggleOutfitBookmark(userId: string, outfitId: string) {
  const outfit = await prisma.outfit.findUnique({ where: { id: outfitId } });
  if (!outfit) throw new NotFoundError("Outfit not found");
  const existing = await prisma.outfitBookmark.findUnique({
    where: { outfitId_userId: { outfitId, userId } },
  });
  if (existing) {
    await prisma.outfitBookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false };
  }
  await prisma.outfitBookmark.create({ data: { outfitId, userId } });
  return { bookmarked: true };
}

export async function shareOutfit(userId: string, outfitId: string, platform: string) {
  const outfit = await prisma.outfit.findUnique({ where: { id: outfitId } });
  if (!outfit) throw new NotFoundError("Outfit not found");
  await prisma.$transaction([
    prisma.outfitShare.create({ data: { outfitId, userId, platform } }),
    prisma.outfit.update({ where: { id: outfitId }, data: { shareCount: { increment: 1 } } }),
  ]);
  const url = `${env.APP_URL}/dashboard/styleverse?outfit=${outfitId}`;
  return { url, shareCount: outfit.shareCount + 1 };
}

export async function listOutfitComments(outfitId: string) {
  return prisma.outfitComment.findMany({
    where: { outfitId },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function addOutfitComment(userId: string, outfitId: string, content: string) {
  const text = content.trim();
  if (!text) throw new ValidationError("Comment cannot be empty");
  const outfit = await prisma.outfit.findUnique({ where: { id: outfitId } });
  if (!outfit) throw new NotFoundError("Outfit not found");

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.outfitComment.create({
      data: { outfitId, userId, content: text },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });
    await tx.outfit.update({ where: { id: outfitId }, data: { commentCount: { increment: 1 } } });
    return created;
  });

  if (outfit.userId !== userId) {
    await prisma.notification.create({
      data: {
        userId: outfit.userId,
        type: "COMMENT_RECEIVED",
        title: "New comment on your outfit",
        body: text.slice(0, 120),
        data: { outfitId },
      },
    }).catch(() => undefined);
  }

  return comment;
}

export async function getTrendingStyles() {
  const groups = await prisma.outfit.groupBy({
    by: ["styleTag"],
    _count: { styleTag: true },
    orderBy: { _count: { styleTag: "desc" } },
    take: 6,
  });
  return groups.map((g) => ({ name: g.styleTag, count: g._count.styleTag }));
}
