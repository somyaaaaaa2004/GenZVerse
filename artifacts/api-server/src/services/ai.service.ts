import { prisma } from "@workspace/db";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

type PlatformContext = {
  name: string;
  level: number;
  xp: number;
  streak: number;
  goals: string[];
  interests: string[];
  challenges: Array<{ title: string; category: string; xpReward: number }>;
  communities: Array<{ name: string; category: string; slug: string }>;
  squads: Array<{ name: string; category: string }>;
  outfits: Array<{ title: string; styleTag: string }>;
};

async function loadPlatformContext(userId: string): Promise<PlatformContext> {
  const [user, challenges, communities, squads, outfits] = await Promise.all([
    prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        displayName: true,
        username: true,
        goals: true,
        interests: true,
        level: true,
        xp: true,
        currentStreak: true,
      },
    }),
    prisma.challenge.findMany({
      where: { isActive: true },
      orderBy: { participantCount: "desc" },
      take: 8,
      select: { title: true, category: true, xpReward: true },
    }),
    prisma.community.findMany({
      orderBy: { memberCount: "desc" },
      take: 8,
      select: { name: true, category: true, slug: true },
    }),
    prisma.squad.findMany({
      orderBy: { memberCount: "desc" },
      take: 8,
      select: { name: true, category: true },
    }),
    prisma.outfit.findMany({
      orderBy: { likeCount: "desc" },
      take: 6,
      select: { title: true, styleTag: true },
    }),
  ]);

  return {
    name: user?.displayName || user?.username || "friend",
    level: user?.level ?? 1,
    xp: user?.xp ?? 0,
    streak: user?.currentStreak ?? 0,
    goals: user?.goals ?? [],
    interests: user?.interests ?? [],
    challenges,
    communities,
    squads,
    outfits,
  };
}

function detectIntent(message: string) {
  const m = message.toLowerCase();
  if (/(fitness|workout|gym|run|steps|health|exercise)/.test(m)) return "fitness";
  if (/(streetwear|outfit|fashion|style|y2k|clothes|wear)/.test(m)) return "fashion";
  if (/(xp|level|rank|leaderboard|points)/.test(m)) return "xp";
  if (/(lonely|friends|social|community|belong)/.test(m)) return "social";
  if (/(plan|week|schedule|routine|productivity)/.test(m)) return "planner";
  if (/(study|exam|learn|coding|career)/.test(m)) return "learning";
  if (/(budget|money|finance|save)/.test(m)) return "finance";
  if (/(travel|trip|vacation)/.test(m)) return "travel";
  if (/(meditat|mental|stress|anxiety|wellness|sleep)/.test(m)) return "wellness";
  if (/(squad|team)/.test(m)) return "squad";
  if (/(challenge)/.test(m)) return "challenge";
  return "general";
}

function formatList(items: string[]) {
  return items.map((i) => `- ${i}`).join("\n");
}

function buildIntelligentReply(message: string, ctx: PlatformContext, history: Array<{ role: string; content: string }>) {
  const intent = detectIntent(message);
  const challengeLines = ctx.challenges.slice(0, 4).map((c) => `${c.title} (${c.category}, +${c.xpReward} XP)`);
  const communityLines = ctx.communities.slice(0, 4).map((c) => `${c.name} — ${c.category}`);
  const squadLines = ctx.squads.slice(0, 4).map((s) => `${s.name} — ${s.category}`);
  const outfitLines = ctx.outfits.slice(0, 4).map((o) => `${o.title} (${o.styleTag})`);
  const goals = ctx.goals.length ? ctx.goals.join(", ") : "building consistency";
  const prior = history.filter((h) => h.role === "user").slice(-3).map((h) => h.content);

  const intro = `Hey ${ctx.name} — you're Level ${ctx.level} with ${ctx.xp} XP and a ${ctx.streak}-day streak. I remember you're focused on ${goals}.`;

  switch (intent) {
    case "fitness":
      return `${intro}

Let's build real momentum around fitness. Here's a practical plan:

**This week**
1. Pick one daily movement challenge and check in every day
2. Join a fitness community for accountability
3. Track water + sleep as supporting habits

**Recommended challenges**
${formatList(challengeLines.length ? challengeLines : ["10K Steps Challenge", "Morning Workout Streak", "No Sugar Week"])}

**Communities & squads**
${formatList([...communityLines.slice(0, 2), ...squadLines.slice(0, 2)].length ? [...communityLines.slice(0, 2), ...squadLines.slice(0, 2)] : ["Fitness Freaks squad", "Health community"])}

Want me to generate a 7-day workout + recovery plan next?`;

    case "fashion":
      return `${intro}

Streetwear energy — StyleVerse is where you should play.

**Try these looks**
${formatList(outfitLines.length ? outfitLines : ["Oversized Cargo Fit (Streetwear)", "Monochrome Layering (Minimalist)", "Neon Night Set (Y2K)"])}

**How to level up your style**
- Save 3 outfits that match your vibe
- Share one fit this week for social XP
- Explore the Style DNA tags that match what you already like

Open **StyleVerse** and tap Like / Save on anything that feels like you. Want outfit pairings for a specific occasion?`;

    case "xp":
      return `${intro}

Fastest XP paths right now:

1. Join and check in on active challenges (daily XP)
2. Complete a challenge for the full reward
3. Invite friends (+100 XP per accepted invite)
4. Engage in communities (comments, posts, help)

**High-reward challenges**
${formatList(challengeLines.length ? challengeLines : ["Workout Streak (+150 XP)", "Study Sprint (+120 XP)", "Budget Challenge (+100 XP)"])}

Prior ask context: ${prior.slice(-1)[0] ?? "getting stronger on the platform"}.
Shall I pick one challenge and break it into daily check-ins?`;

    case "social":
      return `${intro}

You're not alone in this — GenZVerse is built for belonging.

**Communities to join tonight**
${formatList(communityLines.length ? communityLines : ["Mental Health Circle", "Music Lounge", "Readers Hub"])}

**Squads with good energy**
${formatList(squadLines.length ? squadLines : ["Night Owls", "Startup Builders", "Travel Tribe"])}

Also: send 1 friend request from Social search, and share your profile invite link.
Want intro message templates for starting conversations?`;

    case "planner":
      return `${intro}

Here's a clean weekly planner:

| Day | Focus | Action |
|---|---|---|
| Mon | Deep work | 90-min focus block + challenge check-in |
| Tue | Fitness | Workout challenge + hydrate goal |
| Wed | Social | Comment in 1 community + message a friend |
| Thu | Learning | Study/coding challenge |
| Fri | Style / creative | StyleVerse save + share |
| Sat | Explore | Join 1 new squad/community |
| Sun | Review | Life Wrapped reflection + set next week goals |

Want this customized for study, fitness, or career mode?`;

    case "learning":
      return `${intro}

Learning mode activated.

**Plan**
- 25/5 focus cycles (Pomodoro)
- One coding or reading challenge
- End-of-day note in AI Companion

**Recommended**
${formatList([...challengeLines, ...communityLines].slice(0, 5))}

I can draft a 14-day study roadmap if you tell me the subject.`;

    case "finance":
      return `${intro}

Budget clarity > vibes.

**7-day money reset**
1. Track every expense for 7 days
2. Cap impulse buys to 1 category
3. Join a finance community for accountability

**On GenZVerse**
${formatList(challengeLines.filter((c) => /budget|finance|money|save/i.test(c)).concat(challengeLines).slice(0, 4))}

Want a starter monthly budget template?`;

    case "travel":
      return `${intro}

Travel energy — let's map it.

**Quick trip planner**
- Destination vibe + budget
- 3 must-do experiences
- Packing list by StyleVerse aesthetic
- Photo challenge while you're there

**Communities / squads**
${formatList([...communityLines, ...squadLines].slice(0, 5))}

Tell me city + days and I'll generate a day-by-day itinerary.`;

    case "wellness":
      return `${intro}

Let's protect your energy.

**Daily wellness stack**
- 5-min morning breathwork
- One walk outside
- Phone-free wind-down
- Sleep target

**Supportive spaces**
${formatList(communityLines.length ? communityLines : ["Mental Health", "Meditation", "Night Owls"])}

I can also give a gentle evening routine if nights are the hard part.`;

    case "squad":
      return `${intro}

**Squads worth joining**
${formatList(squadLines.length ? squadLines : ["Streetwear Club", "Fitness Freaks", "Startup Builders"])}

Join one, introduce yourself, and pick a shared challenge with the squad.`;

    case "challenge":
      return `${intro}

**Challenges trending now**
${formatList(challengeLines.length ? challengeLines : ["10K Steps", "Read 20 Pages", "Meditation Streak"])}

Join one, set a reminder, and check in daily. Completing unlocks XP + streak protection.`;

    default:
      return `${intro}

I can help with fitness plans, StyleVerse outfits, XP strategy, communities, weekly planners, study/career roadmaps, budgets, travel, and wellness.

**Quick picks for you**
${formatList([
  challengeLines[0] ? `Challenge: ${challengeLines[0]}` : "Browse Challenges for XP",
  communityLines[0] ? `Community: ${communityLines[0]}` : "Discover Communities",
  outfitLines[0] ? `StyleVerse: ${outfitLines[0]}` : "Explore StyleVerse looks",
])}

Ask me anything — or try: “plan my week”, “I want streetwear”, “help me get more XP”.`;
  }
}

async function callOpenAI(
  message: string,
  ctx: PlatformContext,
  history: Array<{ role: string; content: string }>,
): Promise<string | null> {
  if (!env.OPENAI_API_KEY) return null;
  try {
    const system = `You are GenZVerse AI Companion — warm, sharp, motivational, never robotic.
You know the GenZVerse platform: Challenges (XP/streaks), Communities, Squads, StyleVerse outfits, Life Wrapped, Invites, Social friends, Dashboard.
Recommend real platform features and items from context when relevant.
Use markdown (headings, bullets, numbered lists). Ask a useful follow-up.
User: ${ctx.name}, Level ${ctx.level}, ${ctx.xp} XP, streak ${ctx.streak}.
Goals: ${ctx.goals.join(", ") || "none"}. Interests: ${ctx.interests.join(", ") || "none"}.
Challenges: ${JSON.stringify(ctx.challenges)}.
Communities: ${JSON.stringify(ctx.communities)}.
Squads: ${JSON.stringify(ctx.squads)}.
Outfits: ${JSON.stringify(ctx.outfits)}.`;

    const messages = [
      { role: "system", content: system },
      ...history.slice(-12).map((h) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        temperature: 0.8,
        messages,
      }),
    });
    if (!res.ok) {
      logger.warn({ status: res.status }, "OpenAI request failed");
      return null;
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return json.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    logger.warn({ err }, "OpenAI error");
    return null;
  }
}

export async function getAiMessages(userId: string, limit = 80) {
  return prisma.aiMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

export async function sendAiMessage(userId: string, content: string) {
  const trimmed = content.trim();
  const [ctx, history] = await Promise.all([
    loadPlatformContext(userId),
    prisma.aiMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 16,
      select: { role: true, content: true },
    }),
  ]);

  await prisma.aiMessage.create({
    data: { userId, role: "user", content: trimmed },
  });

  const chronological = [...history].reverse();
  const llm = await callOpenAI(trimmed, ctx, chronological);
  const reply = llm ?? buildIntelligentReply(trimmed, ctx, chronological);

  const assistant = await prisma.aiMessage.create({
    data: { userId, role: "assistant", content: reply },
  });

  const suggestions = [
    "Plan my week",
    "Recommend challenges for XP",
    "Suggest StyleVerse outfits",
    "Find communities for me",
  ];

  return {
    userMessage: trimmed,
    assistantMessage: assistant,
    suggestions,
  };
}

export async function getAiInsights(userId: string) {
  const [stats, recentXp, activities, challenges, communities] = await Promise.all([
    prisma.user.findFirst({
      where: { id: userId },
      select: {
        goals: true,
        interests: true,
        currentStreak: true,
        lifeScore: true,
        productivityScore: true,
        level: true,
        xp: true,
      },
    }),
    prisma.xpHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.activity.count({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.challenge.findMany({
      where: { isActive: true },
      take: 3,
      orderBy: { participantCount: "desc" },
      select: { title: true, category: true },
    }),
    prisma.community.findMany({
      take: 3,
      orderBy: { memberCount: "desc" },
      select: { name: true, category: true },
    }),
  ]);

  return {
    goals: stats?.goals ?? [],
    interests: stats?.interests ?? [],
    currentStreak: stats?.currentStreak ?? 0,
    lifeScore: stats?.lifeScore ?? 0,
    productivityScore: stats?.productivityScore ?? 0,
    weeklyActivityCount: activities,
    level: stats?.level ?? 1,
    xp: stats?.xp ?? 0,
    recentXp,
    recommendations: {
      challenges,
      communities,
    },
  };
}

export async function clearAiMessages(userId: string) {
  await prisma.aiMessage.deleteMany({ where: { userId } });
  return { success: true };
}
