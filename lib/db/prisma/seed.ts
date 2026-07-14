import bcrypt from "bcryptjs";
import {
  PrismaClient,
  ChallengeDifficulty,
  ChallengeType,
  NotificationType,
  SquadPrivacy,
  CommunityVisibility,
  CommunityRole,
  MembershipStatus,
  UserRole,
  AuthProvider,
} from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  "Fitness",
  "Study",
  "Fashion",
  "Photography",
  "Gaming",
  "Reading",
  "Coding",
  "Career",
  "Mental Health",
  "Travel",
  "Music",
  "Social",
] as const;

const STYLE_TAGS = ["Streetwear", "Vintage", "Y2K", "Minimalist", "Techwear"] as const;

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function picsum(seed: string, w = 800, h = 600): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

function avatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=256`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

const DEMO_USERS = [
  {
    email: "aria.chen@demo.genzverse.app",
    username: "aria_chen",
    displayName: "Aria Chen",
    bio: "Fitness coach by day, street photographer by night.",
    country: "Singapore",
    interests: ["Fitness", "Photography", "Fashion"],
    goals: ["Run a marathon", "Grow a community"],
    xp: 4200,
    level: 12,
    currentStreak: 14,
    longestStreak: 30,
  },
  {
    email: "jordan.blake@demo.genzverse.app",
    username: "jblake",
    displayName: "Jordan Blake",
    bio: "Full-stack builder. Shipping side projects weekly.",
    country: "United States",
    interests: ["Coding", "Career", "Gaming"],
    goals: ["Launch a SaaS", "Mentor juniors"],
    xp: 6800,
    level: 18,
    currentStreak: 21,
    longestStreak: 45,
  },
  {
    email: "maya.patel@demo.genzverse.app",
    username: "maya_reads",
    displayName: "Maya Patel",
    bio: "Bookworm · 50 books/year challenge in progress.",
    country: "India",
    interests: ["Reading", "Study", "Mental Health"],
    goals: ["Finish classics list", "Start a book club"],
    xp: 3100,
    level: 9,
    currentStreak: 7,
    longestStreak: 20,
  },
  {
    email: "leo.santos@demo.genzverse.app",
    username: "leostyle",
    displayName: "Leo Santos",
    bio: "Y2K fits and thrift finds. Style is a language.",
    country: "Brazil",
    interests: ["Fashion", "Music", "Social"],
    goals: ["Drop a lookbook", "Collab with brands"],
    xp: 5200,
    level: 14,
    currentStreak: 5,
    longestStreak: 18,
  },
  {
    email: "nina.okonkwo@demo.genzverse.app",
    username: "nina_codes",
    displayName: "Nina Okonkwo",
    bio: "Open source contributor. Hackathon regular.",
    country: "Nigeria",
    interests: ["Coding", "Career", "Study"],
    goals: ["Contribute to React", "Speak at a conference"],
    xp: 7500,
    level: 20,
    currentStreak: 40,
    longestStreak: 60,
  },
  {
    email: "kai.nguyen@demo.genzverse.app",
    username: "kai_travels",
    displayName: "Kai Nguyen",
    bio: "Digital nomad documenting hidden gems.",
    country: "Vietnam",
    interests: ["Travel", "Photography", "Music"],
    goals: ["Visit 30 countries", "Publish a photo essay"],
    xp: 2900,
    level: 8,
    currentStreak: 3,
    longestStreak: 12,
  },
  {
    email: "sofia.rossi@demo.genzverse.app",
    username: "sofia_mind",
    displayName: "Sofia Rossi",
    bio: "Meditation teacher sharing daily calm practices.",
    country: "Italy",
    interests: ["Mental Health", "Fitness", "Reading"],
    goals: ["Lead a retreat", "100-day mindfulness streak"],
    xp: 4600,
    level: 13,
    currentStreak: 28,
    longestStreak: 50,
  },
  {
    email: "ethan.kim@demo.genzverse.app",
    username: "ethanplays",
    displayName: "Ethan Kim",
    bio: "Competitive gamer · ranked grind never stops.",
    country: "South Korea",
    interests: ["Gaming", "Social", "Music"],
    goals: ["Go pro", "Build a squad"],
    xp: 3900,
    level: 11,
    currentStreak: 9,
    longestStreak: 22,
  },
  {
    email: "zara.ahmed@demo.genzverse.app",
    username: "zara_career",
    displayName: "Zara Ahmed",
    bio: "Career coach helping Gen Z land dream roles.",
    country: "United Kingdom",
    interests: ["Career", "Study", "Social"],
    goals: ["Host a webinar", "Write a guide"],
    xp: 5500,
    level: 15,
    currentStreak: 11,
    longestStreak: 25,
  },
  {
    email: "diego.morales@demo.genzverse.app",
    username: "diego_lens",
    displayName: "Diego Morales",
    bio: "Street & portrait photographer. Always chasing light.",
    country: "Mexico",
    interests: ["Photography", "Travel", "Fashion"],
    goals: ["Gallery show", "Teach a workshop"],
    xp: 3400,
    level: 10,
    currentStreak: 6,
    longestStreak: 15,
  },
  {
    email: "luna.park@demo.genzverse.app",
    username: "luna_beats",
    displayName: "Luna Park",
    bio: "Bedroom producer making lo-fi and hyperpop.",
    country: "Canada",
    interests: ["Music", "Gaming", "Social"],
    goals: ["Release an EP", "Play a live set"],
    xp: 2700,
    level: 7,
    currentStreak: 4,
    longestStreak: 10,
  },
  {
    email: "omar.hassan@demo.genzverse.app",
    username: "omar_lift",
    displayName: "Omar Hassan",
    bio: "Calisthenics athlete. Strength is a habit.",
    country: "Egypt",
    interests: ["Fitness", "Mental Health", "Career"],
    goals: ["Muscle-up PR", "Coach a team"],
    xp: 6100,
    level: 16,
    currentStreak: 35,
    longestStreak: 55,
  },
];

type ChallengeSeed = {
  title: string;
  description: string;
  category: (typeof CATEGORIES)[number];
  difficulty: ChallengeDifficulty;
  challengeType: ChallengeType;
  xpReward: number;
  durationDays: number;
};

const CHALLENGE_SEEDS: ChallengeSeed[] = [
  // Fitness
  { title: "30-Day Morning Run", description: "Run at least 2km every morning for 30 days. Track your pace and mood.", category: "Fitness", difficulty: "MEDIUM", challengeType: "DAILY", xpReward: 500, durationDays: 30 },
  { title: "100 Push-Ups Challenge", description: "Accumulate 100 push-ups daily through sets. Form over speed.", category: "Fitness", difficulty: "HARD", challengeType: "DAILY", xpReward: 400, durationDays: 14 },
  { title: "Yoga Flow Week", description: "Complete a 20-minute yoga flow each day this week.", category: "Fitness", difficulty: "EASY", challengeType: "WEEKLY", xpReward: 200, durationDays: 7 },
  { title: "Plank Master", description: "Hold a plank for increasing durations until you hit 5 minutes.", category: "Fitness", difficulty: "HARD", challengeType: "PROGRESS_BASED", xpReward: 350, durationDays: 21 },
  { title: "Steps Streak", description: "Hit 10,000 steps daily for two weeks straight.", category: "Fitness", difficulty: "MEDIUM", challengeType: "DAILY", xpReward: 300, durationDays: 14 },
  // Study
  { title: "Pomodoro Power Hour", description: "Complete 4 focused Pomodoro sessions every weekday.", category: "Study", difficulty: "EASY", challengeType: "DAILY", xpReward: 250, durationDays: 10 },
  { title: "Language Sprint", description: "Practice a new language for 30 minutes daily using apps or flashcards.", category: "Study", difficulty: "MEDIUM", challengeType: "DAILY", xpReward: 400, durationDays: 21 },
  { title: "Exam Ready", description: "Create and complete a full revision schedule for one subject.", category: "Study", difficulty: "HARD", challengeType: "MILESTONE_BASED", xpReward: 600, durationDays: 30 },
  { title: "Note-Taking Mastery", description: "Rewrite class notes using the Cornell method for one week.", category: "Study", difficulty: "EASY", challengeType: "WEEKLY", xpReward: 180, durationDays: 7 },
  { title: "Research Deep Dive", description: "Read and summarize 5 peer-reviewed papers on a topic you choose.", category: "Study", difficulty: "EXPERT", challengeType: "ONE_TIME", xpReward: 800, durationDays: 14 },
  // Fashion
  { title: "Capsule Wardrobe Week", description: "Wear only 10 pieces for 7 days and document each look.", category: "Fashion", difficulty: "MEDIUM", challengeType: "WEEKLY", xpReward: 320, durationDays: 7 },
  { title: "Thrift Flip", description: "Transform one thrifted item into a statement piece.", category: "Fashion", difficulty: "HARD", challengeType: "ONE_TIME", xpReward: 450, durationDays: 10 },
  { title: "Color Story Challenge", description: "Build 5 outfits around a single accent color.", category: "Fashion", difficulty: "EASY", challengeType: "PROGRESS_BASED", xpReward: 220, durationDays: 14 },
  { title: "Streetwear Drop Day", description: "Style and share a full streetwear look with peers for feedback.", category: "Fashion", difficulty: "MEDIUM", challengeType: "ONE_TIME", xpReward: 280, durationDays: 5 },
  { title: "Sustainable Style Month", description: "Buy nothing new — restyle what you own for 30 days.", category: "Fashion", difficulty: "HARD", challengeType: "MONTHLY", xpReward: 700, durationDays: 30 },
  // Photography
  { title: "Golden Hour Hunt", description: "Shoot one golden-hour photo every day for two weeks.", category: "Photography", difficulty: "MEDIUM", challengeType: "DAILY", xpReward: 350, durationDays: 14 },
  { title: "Portrait Series", description: "Capture and edit a 10-portrait series of friends or strangers.", category: "Photography", difficulty: "HARD", challengeType: "MILESTONE_BASED", xpReward: 550, durationDays: 21 },
  { title: "Phone Only Photo Walk", description: "Complete a 1-hour photo walk using only your phone camera.", category: "Photography", difficulty: "EASY", challengeType: "ONE_TIME", xpReward: 150, durationDays: 3 },
  { title: "Black & White Week", description: "Shoot exclusively in monochrome for 7 days.", category: "Photography", difficulty: "MEDIUM", challengeType: "WEEKLY", xpReward: 300, durationDays: 7 },
  { title: "Lightroom Edit Marathon", description: "Fully edit and export 25 raw photos with consistent presets.", category: "Photography", difficulty: "EXPERT", challengeType: "PROGRESS_BASED", xpReward: 650, durationDays: 14 },
  // Gaming
  { title: "Rank Climber", description: "Climb at least 2 ranks in your main competitive game.", category: "Gaming", difficulty: "HARD", challengeType: "COMPETITIVE", xpReward: 500, durationDays: 21 },
  { title: "Squad Scrims", description: "Play 5 coordinated scrims with your squad this week.", category: "Gaming", difficulty: "MEDIUM", challengeType: "COLLABORATIVE", xpReward: 280, durationDays: 7 },
  { title: "Indie Game Discovery", description: "Finish one indie game under 10 hours and write a short review.", category: "Gaming", difficulty: "EASY", challengeType: "ONE_TIME", xpReward: 200, durationDays: 10 },
  { title: "Speedrun Practice", description: "Shave 10% off your PB on any speedrun category.", category: "Gaming", difficulty: "EXPERT", challengeType: "TIME_BASED", xpReward: 750, durationDays: 30 },
  { title: "No-Tilt Week", description: "Play ranked without rage-quitting. Log mood after each session.", category: "Gaming", difficulty: "MEDIUM", challengeType: "WEEKLY", xpReward: 320, durationDays: 7 },
  // Reading
  { title: "7-Day Reading Streak", description: "Read for 30 minutes every day this week.", category: "Reading", difficulty: "EASY", challengeType: "DAILY", xpReward: 180, durationDays: 7 },
  { title: "Genre Switch", description: "Finish a book outside your usual genre.", category: "Reading", difficulty: "MEDIUM", challengeType: "ONE_TIME", xpReward: 250, durationDays: 21 },
  { title: "50 Pages a Day", description: "Read 50 pages daily for two weeks.", category: "Reading", difficulty: "MEDIUM", challengeType: "DAILY", xpReward: 400, durationDays: 14 },
  { title: "Classic Club", description: "Read and discuss one classic novel with your community.", category: "Reading", difficulty: "HARD", challengeType: "COLLABORATIVE", xpReward: 500, durationDays: 30 },
  { title: "Nonfiction Deep Work", description: "Complete a dense nonfiction book and share 10 key takeaways.", category: "Reading", difficulty: "HARD", challengeType: "MILESTONE_BASED", xpReward: 450, durationDays: 28 },
  // Coding
  { title: "Daily LeetCode", description: "Solve one algorithm problem every day for 21 days.", category: "Coding", difficulty: "HARD", challengeType: "DAILY", xpReward: 600, durationDays: 21 },
  { title: "Open Source First PR", description: "Land your first merged pull request on a public repo.", category: "Coding", difficulty: "MEDIUM", challengeType: "ONE_TIME", xpReward: 400, durationDays: 14 },
  { title: "Ship a Side Project", description: "Build and deploy a small app end-to-end in 30 days.", category: "Coding", difficulty: "EXPERT", challengeType: "MILESTONE_BASED", xpReward: 1000, durationDays: 30 },
  { title: "Clean Code Refactor", description: "Refactor a messy module and document before/after improvements.", category: "Coding", difficulty: "MEDIUM", challengeType: "ONE_TIME", xpReward: 300, durationDays: 7 },
  { title: "TypeScript Strict Mode", description: "Enable strict TypeScript and fix all resulting errors in a project.", category: "Coding", difficulty: "HARD", challengeType: "PROGRESS_BASED", xpReward: 550, durationDays: 10 },
  // Career
  { title: "LinkedIn Glow-Up", description: "Refresh your headline, about, and add 3 projects to your profile.", category: "Career", difficulty: "EASY", challengeType: "ONE_TIME", xpReward: 200, durationDays: 5 },
  { title: "Interview Ready", description: "Complete 5 mock interviews with peers or mentors.", category: "Career", difficulty: "HARD", challengeType: "COLLABORATIVE", xpReward: 500, durationDays: 21 },
  { title: "Network Week", description: "Have 3 meaningful coffee chats with people in your field.", category: "Career", difficulty: "MEDIUM", challengeType: "WEEKLY", xpReward: 350, durationDays: 7 },
  { title: "Portfolio Polish", description: "Ship a case-study style portfolio page for your best project.", category: "Career", difficulty: "MEDIUM", challengeType: "ONE_TIME", xpReward: 400, durationDays: 14 },
  { title: "Salary Negotiation Prep", description: "Research comps and script your negotiation talking points.", category: "Career", difficulty: "HARD", challengeType: "ONE_TIME", xpReward: 450, durationDays: 10 },
  // Mental Health
  { title: "Gratitude Journal", description: "Write 3 things you're grateful for every night for 14 days.", category: "Mental Health", difficulty: "EASY", challengeType: "DAILY", xpReward: 220, durationDays: 14 },
  { title: "Digital Sunset", description: "No screens 1 hour before bed for a full week.", category: "Mental Health", difficulty: "MEDIUM", challengeType: "WEEKLY", xpReward: 300, durationDays: 7 },
  { title: "Mindful Morning", description: "Meditate for 10 minutes each morning for 21 days.", category: "Mental Health", difficulty: "MEDIUM", challengeType: "DAILY", xpReward: 400, durationDays: 21 },
  { title: "Anxiety Toolkit", description: "Build and practice a personal grounding routine for two weeks.", category: "Mental Health", difficulty: "HARD", challengeType: "PROGRESS_BASED", xpReward: 450, durationDays: 14 },
  { title: "Social Media Detox", description: "Uninstall social apps for 5 days and log how you feel.", category: "Mental Health", difficulty: "HARD", challengeType: "TIME_BASED", xpReward: 500, durationDays: 5 },
  // Travel
  { title: "Local Explorer", description: "Visit 5 new spots in your city and document each with a photo.", category: "Travel", difficulty: "EASY", challengeType: "PROGRESS_BASED", xpReward: 250, durationDays: 14 },
  { title: "Weekend Getaway Plan", description: "Plan a full budget weekend trip including lodging and itinerary.", category: "Travel", difficulty: "MEDIUM", challengeType: "ONE_TIME", xpReward: 300, durationDays: 7 },
  { title: "Solo Day Trip", description: "Take a solo day trip and share your itinerary and reflections.", category: "Travel", difficulty: "MEDIUM", challengeType: "ONE_TIME", xpReward: 350, durationDays: 10 },
  { title: "Cultural Deep Dive", description: "Spend a day immersing in a culture different from your own.", category: "Travel", difficulty: "HARD", challengeType: "ONE_TIME", xpReward: 400, durationDays: 14 },
  { title: "Travel Journal Month", description: "Keep a travel or wanderlust journal for 30 days.", category: "Travel", difficulty: "EASY", challengeType: "MONTHLY", xpReward: 280, durationDays: 30 },
  // Music
  { title: "Daily Practice Block", description: "Practice your instrument for 25 focused minutes every day.", category: "Music", difficulty: "MEDIUM", challengeType: "DAILY", xpReward: 350, durationDays: 21 },
  { title: "Cover Song Drop", description: "Record and share a cover of a song you love.", category: "Music", difficulty: "HARD", challengeType: "ONE_TIME", xpReward: 450, durationDays: 14 },
  { title: "Playlist Curator", description: "Create 3 themed playlists and get feedback from friends.", category: "Music", difficulty: "EASY", challengeType: "COLLABORATIVE", xpReward: 180, durationDays: 7 },
  { title: "Beat Maker Week", description: "Produce one original beat or loop each day for a week.", category: "Music", difficulty: "HARD", challengeType: "WEEKLY", xpReward: 500, durationDays: 7 },
  { title: "Ear Training Sprint", description: "Complete 15 ear-training sessions in two weeks.", category: "Music", difficulty: "MEDIUM", challengeType: "PROGRESS_BASED", xpReward: 320, durationDays: 14 },
  // Social
  { title: "Compliment Cascade", description: "Give a genuine compliment to someone new each day for a week.", category: "Social", difficulty: "EASY", challengeType: "DAILY", xpReward: 200, durationDays: 7 },
  { title: "Host a Micro-Meetup", description: "Organize a small hangout (3+ people) around a shared interest.", category: "Social", difficulty: "MEDIUM", challengeType: "ONE_TIME", xpReward: 350, durationDays: 14 },
  { title: "Accountability Buddy", description: "Pair up and check in daily with an accountability partner.", category: "Social", difficulty: "MEDIUM", challengeType: "COLLABORATIVE", xpReward: 300, durationDays: 14 },
  { title: "Community Welcome Crew", description: "Welcome 10 new members in a community with helpful intros.", category: "Social", difficulty: "EASY", challengeType: "PROGRESS_BASED", xpReward: 250, durationDays: 10 },
  { title: "Kindness Streak", description: "Perform one intentional act of kindness daily for 21 days.", category: "Social", difficulty: "MEDIUM", challengeType: "DAILY", xpReward: 400, durationDays: 21 },
];

const SQUAD_NAMES = [
  "Iron Hour Collective",
  "Night Coders",
  "Lens & Light",
  "Page Turners United",
  "Ranked Grinders",
  "Style Lab",
  "Calm Collective",
  "Wander Squad",
  "Beat Lab Crew",
  "Career Climbers",
  "Form First Fitness",
  "Study Hive",
  "Y2K Archive",
  "Pixel Painters",
  "Boss Raid Party",
  "Chapter Chasers",
  "Ship It Club",
  "Interview Ready",
  "Breathe & Bloom",
  "City Wanderers",
  "Lo-Fi League",
  "Connect Circle",
  "Sprint Saturdays",
  "Deep Work Den",
  "Thrift Titans",
  "Golden Hour Gang",
  "Duo Queue",
  "Shelf Goals",
  "PR Machine",
  "Offer Season",
  "Mindful Mondays",
  "Passport Club",
  "Studio Sessions",
  "Friend Fuel",
  "Core Crushers",
  "Flashcard Force",
  "Techwear Tribe",
  "Shutter Squad",
  "Lobby Legends",
  "Bookish Bunch",
];

const COMMUNITY_NAMES = [
  { name: "GenZ Fit Lab", category: "Fitness", tags: ["workouts", "habits", "accountability"] },
  { name: "Study With Me Hub", category: "Study", tags: ["pomodoro", "exams", "focus"] },
  { name: "Fit Check Daily", category: "Fashion", tags: ["ootd", "streetwear", "thrift"] },
  { name: "Shutter Stories", category: "Photography", tags: ["portraits", "street", "editing"] },
  { name: "Lobby Legends Lounge", category: "Gaming", tags: ["ranked", "co-op", "esports"] },
  { name: "Between the Lines", category: "Reading", tags: ["books", "reviews", "club"] },
  { name: "Ship Club Devs", category: "Coding", tags: ["opensource", "hackathons", "web"] },
  { name: "Level Up Careers", category: "Career", tags: ["interviews", "resume", "networking"] },
  { name: "Soft Reset", category: "Mental Health", tags: ["mindfulness", "journaling", "rest"] },
  { name: "Roam Mode", category: "Travel", tags: ["budget", "solo", "cityguides"] },
  { name: "Frequency Room", category: "Music", tags: ["production", "covers", "playlists"] },
  { name: "Social Battery", category: "Social", tags: ["meetups", "friends", "events"] },
  { name: "Sunrise Run Club", category: "Fitness", tags: ["running", "outdoors", "streaks"] },
  { name: "STEM Study Circle", category: "Study", tags: ["math", "science", "tutoring"] },
  { name: "Archive Fits", category: "Fashion", tags: ["vintage", "y2k", "styling"] },
  { name: "Analog Hearts", category: "Photography", tags: ["film", "darkroom", "35mm"] },
  { name: "Indie Quest", category: "Gaming", tags: ["indie", "reviews", "speedrun"] },
  { name: "Poetry & Prose", category: "Reading", tags: ["poetry", "fiction", "writing"] },
  { name: "Type-Safe Tribe", category: "Coding", tags: ["typescript", "react", "node"] },
  { name: "First Offer Club", category: "Career", tags: ["newgrads", "internships", "offers"] },
  { name: "Quiet Hours", category: "Mental Health", tags: ["anxiety", "sleep", "boundaries"] },
  { name: "Hidden Maps", category: "Travel", tags: ["hikes", "cafes", "local"] },
  { name: "Bedroom Beats", category: "Music", tags: ["lofi", "daw", "mixing"] },
  { name: "Kindness Network", category: "Social", tags: ["volunteering", "community", "support"] },
  { name: "Mobility Masters", category: "Fitness", tags: ["mobility", "yoga", "recovery"] },
  { name: "Language Lab", category: "Study", tags: ["languages", "immersion", "anki"] },
  { name: "Minimal Wardrobe", category: "Fashion", tags: ["capsule", "minimal", "sustainable"] },
  { name: "Night Walks Photo", category: "Photography", tags: ["night", "urban", "longexposure"] },
  { name: "Cozy Co-op", category: "Gaming", tags: ["casual", "cozy", "multiplayer"] },
  { name: "Nonfiction Nest", category: "Reading", tags: ["nonfiction", "learning", "notes"] },
  { name: "Hack Weekend", category: "Coding", tags: ["sideprojects", "ai", "devops"] },
  { name: "Manager Track", category: "Career", tags: ["leadership", "softskills", "growth"] },
  { name: "Grounding Circle", category: "Mental Health", tags: ["grounding", "cbt", "peersupport"] },
  { name: "Weekend Escapes", category: "Travel", tags: ["weekend", "planning", "budget"] },
  { name: "Open Mic Online", category: "Music", tags: ["live", "performance", "feedback"] },
  { name: "Introvert Socials", category: "Social", tags: ["introverts", "smallgroups", "chats"] },
  { name: "Strength Season", category: "Fitness", tags: ["lifting", "calisthenics", "prs"] },
  { name: "Exam Season HQ", category: "Study", tags: ["finals", "revision", "groups"] },
  { name: "Techwear Forum", category: "Fashion", tags: ["techwear", "functional", "gear"] },
  { name: "Creator Collabs", category: "Social", tags: ["creators", "collabs", "growth"] },
];

const ACHIEVEMENTS = [
  { slug: "first-steps", name: "First Steps", description: "Complete your first challenge.", xpReward: 50 },
  { slug: "streak-7", name: "Week Warrior", description: "Maintain a 7-day streak.", xpReward: 100 },
  { slug: "streak-30", name: "Month Machine", description: "Maintain a 30-day streak.", xpReward: 300 },
  { slug: "social-butterfly", name: "Social Butterfly", description: "Join 5 communities.", xpReward: 150 },
  { slug: "squad-up", name: "Squad Up", description: "Join your first squad.", xpReward: 75 },
  { slug: "style-icon", name: "Style Icon", description: "Get 100 likes on outfits.", xpReward: 200 },
  { slug: "challenge-hunter", name: "Challenge Hunter", description: "Complete 10 challenges.", xpReward: 250 },
  { slug: "level-10", name: "Rising Star", description: "Reach level 10.", xpReward: 200 },
  { slug: "level-20", name: "Veteran", description: "Reach level 20.", xpReward: 400 },
  { slug: "friend-circle", name: "Friend Circle", description: "Make 5 friendships.", xpReward: 120 },
  { slug: "early-adopter", name: "Early Adopter", description: "Joined GenZVerse during seed era.", xpReward: 100 },
  { slug: "featured-creator", name: "Featured Creator", description: "Created a featured community or squad.", xpReward: 180 },
];

/** Curated outfits: each record owns matching title, brand, description, image, price, and sample comments */
const OUTFIT_CATALOG: Array<{
  title: string;
  brand: string;
  description: string;
  styleTag: (typeof STYLE_TAGS)[number];
  price: number;
  /** Deterministic fashion image URL tied to this outfit only */
  imageUrl: string;
  comments: string[];
}> = [
  {
    title: "Oversized Hoodie Drop",
    brand: "Voidwear",
    description: "Heavyweight black oversized hoodie with dropped shoulders and ribbed cuffs.",
    styleTag: "Streetwear",
    price: 89,
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop&q=80",
    comments: ["This Oversized Hoodie Drop drapes perfectly.", "Need this Voidwear drop in charcoal."],
  },
  {
    title: "Cargo Night Run",
    brand: "NightOps",
    description: "Tactical cargo pants with reflective piping for late-night city runs.",
    styleTag: "Streetwear",
    price: 118,
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop&q=80",
    comments: ["Cargo Night Run looks clean with black sneakers.", "NightOps cargos are fire."],
  },
  {
    title: "Sneaker Stack Session",
    brand: "Stride Lab",
    description: "Chunky white sneakers styled with stacked socks and cropped denim.",
    styleTag: "Streetwear",
    price: 145,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop&q=80",
    comments: ["Sneaker Stack Session is my weekend uniform.", "Stride Lab midsoles hit different."],
  },
  {
    title: "Graphic Tee Energy",
    brand: "PrintHouse",
    description: "Relaxed graphic tee with bold typography print and soft cotton wash.",
    styleTag: "Streetwear",
    price: 42,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&q=80",
    comments: ["Graphic Tee Energy goes with everything.", "PrintHouse quality is solid."],
  },
  {
    title: "Thrifted Denim Story",
    brand: "Archive Denim",
    description: "Vintage medium-wash denim jacket with worn fades and brass hardware.",
    styleTag: "Vintage",
    price: 76,
    imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=800&fit=crop&q=80",
    comments: ["Thrifted Denim Story looks authentically aged.", "Archive Denim forever."],
  },
  {
    title: "90s Windbreaker Fit",
    brand: "RetroShell",
    description: "Color-block nylon windbreaker inspired by classic 90s track jackets.",
    styleTag: "Vintage",
    price: 95,
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop&q=80",
    comments: ["That 90s Windbreaker Fit is nostalgic gold.", "RetroShell colors pop."],
  },
  {
    title: "Corduroy Campus Look",
    brand: "Campus Thread",
    description: "Earth-tone corduroy overshirt layered for cool campus mornings.",
    styleTag: "Vintage",
    price: 68,
    imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=800&fit=crop&q=80",
    comments: ["Corduroy Campus Look is peak autumn.", "Campus Thread textures are soft."],
  },
  {
    title: "Polaroid Retro Fit",
    brand: "FilmFrame",
    description: "Soft knit sweater and high-waist trousers with vintage camera accessory vibes.",
    styleTag: "Vintage",
    price: 110,
    imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop&q=80",
    comments: ["Polaroid Retro Fit feels cinematic.", "FilmFrame knit is perfect."],
  },
  {
    title: "Butterfly Clip Era",
    brand: "Y2K Studio",
    description: "Pastel butterfly clips with glitter makeup and metallic bag accents.",
    styleTag: "Y2K",
    price: 34,
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop&q=80",
    comments: ["Butterfly Clip Era is so early 2000s.", "Y2K Studio accessories slap."],
  },
  {
    title: "Low-Rise Neon Night",
    brand: "NeonWave",
    description: "Low-rise jeans paired with a neon crop and platform sneakers for night outs.",
    styleTag: "Y2K",
    price: 128,
    imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop&q=80",
    comments: ["Low-Rise Neon Night owns the club lighting.", "NeonWave glow is unreal."],
  },
  {
    title: "Metallic Mini Moment",
    brand: "Chrome Muse",
    description: "Shimmer metallic mini dress styled with thin straps and evening makeup.",
    styleTag: "Y2K",
    price: 156,
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop&q=80",
    comments: ["Metallic Mini Moment is party-ready.", "Chrome Muse fabric catches every light."],
  },
  {
    title: "Baby Tee Remix",
    brand: "TinyTop Co",
    description: "Fitted baby tee with rhinestone lettering and low-slung belt detailing.",
    styleTag: "Y2K",
    price: 48,
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec9040d?w=600&h=800&fit=crop&q=80",
    comments: ["Baby Tee Remix is tiny but mighty.", "TinyTop Co rhinestones stay put."],
  },
  {
    title: "Monochrome Monday",
    brand: "Lineform",
    description: "All-black tailored set with clean seams and matte finishes.",
    styleTag: "Minimalist",
    price: 210,
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&q=80",
    comments: ["Monochrome Monday is my work uniform.", "Lineform tailoring is precise."],
  },
  {
    title: "Clean Lines Office",
    brand: "Atelier Quiet",
    description: "Ivory blouse and charcoal trousers with sharp, quiet luxury lines.",
    styleTag: "Minimalist",
    price: 188,
    imageUrl: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&h=800&fit=crop&q=80",
    comments: ["Clean Lines Office looks expensive for a reason.", "Atelier Quiet nails neutrals."],
  },
  {
    title: "Neutral Layer Stack",
    brand: "Sandstone",
    description: "Beige and stone layers stacked for breathable everyday minimalism.",
    styleTag: "Minimalist",
    price: 132,
    imageUrl: "https://images.unsplash.com/photo-1523381213434-c91ff40cda7c?w=600&h=800&fit=crop&q=80",
    comments: ["Neutral Layer Stack is calming.", "Sandstone tones photograph beautifully."],
  },
  {
    title: "White Sneaker Reset",
    brand: "Blank Canvas",
    description: "Crisp white leather sneakers as the centerpiece of a pared-back look.",
    styleTag: "Minimalist",
    price: 120,
    imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa4f54bcf5?w=600&h=800&fit=crop&q=80",
    comments: ["White Sneaker Reset cleans up any outfit.", "Blank Canvas leather is premium."],
  },
  {
    title: "Urban Shell Jacket",
    brand: "AeroShell",
    description: "Matte waterproof shell jacket with sealed seams for urban weather.",
    styleTag: "Techwear",
    price: 240,
    imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop&q=80",
    comments: ["Urban Shell Jacket survived the rainstorm.", "AeroShell zippers feel premium."],
  },
  {
    title: "Utility Strap Kit",
    brand: "RigPack",
    description: "Modular strap harness and cargo vest for multi-pocket utility styling.",
    styleTag: "Techwear",
    price: 175,
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop&q=80",
    comments: ["Utility Strap Kit holds my whole day.", "RigPack modular system is genius."],
  },
  {
    title: "Waterproof Commute",
    brand: "RainPath",
    description: "Fully taped raincoat and water-resistant pants for wet-city commuting.",
    styleTag: "Techwear",
    price: 265,
    imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=800&fit=crop&q=80",
    comments: ["Waterproof Commute kept me dry all week.", "RainPath seams never leaked."],
  },
  {
    title: "Modular Pocket Run",
    brand: "Gridwear",
    description: "Running shell with modular zip pockets for phone, keys, and hydration.",
    styleTag: "Techwear",
    price: 198,
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop&q=80",
    comments: ["Modular Pocket Run is built for movers.", "Gridwear pockets click shut perfectly."],
  },
];

async function clearSeedData() {
  // Delete in FK-safe order (children first)
  await prisma.outfitShare.deleteMany();
  await prisma.outfitBookmark.deleteMany();
  await prisma.outfitComment.deleteMany();
  await prisma.outfitLike.deleteMany();
  await prisma.outfit.deleteMany();

  await prisma.userAchievement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.squadMember.deleteMany();
  await prisma.communityMember.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.friendRequest.deleteMany();

  await prisma.challengeBookmark.deleteMany();
  await prisma.challengeLike.deleteMany();
  await prisma.challengeComment.deleteMany();
  await prisma.challengeCheckin.deleteMany();
  await prisma.challengeProgress.deleteMany();
  await prisma.challenge.deleteMany();

  await prisma.squad.deleteMany();
  await prisma.community.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.xpHistory.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.leaderboardEntry.deleteMany();

  // Only delete seed/demo users (keep real users if any)
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: "seed@genzverse.app" },
        { email: { endsWith: "@demo.genzverse.app" } },
      ],
    },
  });
}

async function main() {
  console.log("🌱 GenZVerse seed starting...");

  await clearSeedData();

  const passwordHash = await bcrypt.hash("SeedPass123!", 10);

  // 1. System / seed user
  const seedUser = await prisma.user.upsert({
    where: { email: "seed@genzverse.app" },
    update: {
      passwordHash,
      username: "genzverse",
      displayName: "GenZVerse",
      role: UserRole.ADMIN,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      onboardingCompleted: true,
      xp: 10000,
      level: 25,
      currentStreak: 50,
      longestStreak: 50,
      avatarUrl: avatar("GenZVerse"),
      bannerUrl: picsum("genzverse-banner", 1200, 400),
      bio: "Official GenZVerse seed account — challenges, squads, and communities start here.",
      interests: [...CATEGORIES],
      goals: ["Grow GenZVerse", "Inspire daily habits"],
      authProvider: AuthProvider.EMAIL,
    },
    create: {
      email: "seed@genzverse.app",
      passwordHash,
      username: "genzverse",
      displayName: "GenZVerse",
      role: UserRole.ADMIN,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      onboardingCompleted: true,
      xp: 10000,
      level: 25,
      currentStreak: 50,
      longestStreak: 50,
      avatarUrl: avatar("GenZVerse"),
      bannerUrl: picsum("genzverse-banner", 1200, 400),
      bio: "Official GenZVerse seed account — challenges, squads, and communities start here.",
      interests: [...CATEGORIES],
      goals: ["Grow GenZVerse", "Inspire daily habits"],
      authProvider: AuthProvider.EMAIL,
      presenceStatus: "ONLINE",
      friendsCount: 0,
      challengesCompleted: 40,
      communitiesJoined: 10,
      activityScore: 90,
      lifeScore: 85,
      productivityScore: 88,
      socialScore: 92,
      learningScore: 80,
      styleScore: 70,
    },
  });

  await prisma.userSettings.upsert({
    where: { userId: seedUser.id },
    update: {},
    create: { userId: seedUser.id },
  });

  // 2. Demo users
  const demoUsers = [];
  for (const u of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash,
        username: u.username,
        displayName: u.displayName,
        bio: u.bio,
        country: u.country,
        interests: u.interests,
        goals: u.goals,
        xp: u.xp,
        level: u.level,
        currentStreak: u.currentStreak,
        longestStreak: u.longestStreak,
        avatarUrl: avatar(u.displayName),
        bannerUrl: picsum(`banner-${u.username}`, 1200, 400),
        emailVerified: true,
        emailVerifiedAt: new Date(),
        onboardingCompleted: true,
        timezone: "UTC",
      },
      create: {
        email: u.email,
        passwordHash,
        username: u.username,
        displayName: u.displayName,
        bio: u.bio,
        country: u.country,
        interests: u.interests,
        goals: u.goals,
        xp: u.xp,
        level: u.level,
        currentStreak: u.currentStreak,
        longestStreak: u.longestStreak,
        avatarUrl: avatar(u.displayName),
        bannerUrl: picsum(`banner-${u.username}`, 1200, 400),
        emailVerified: true,
        emailVerifiedAt: new Date(),
        onboardingCompleted: true,
        timezone: "UTC",
        role: UserRole.USER,
        authProvider: AuthProvider.EMAIL,
        friendsCount: 0,
        challengesCompleted: randInt(2, 25),
        communitiesJoined: randInt(1, 8),
        activityScore: randInt(40, 95),
        lifeScore: randInt(40, 95),
        productivityScore: randInt(40, 95),
        socialScore: randInt(40, 95),
        learningScore: randInt(40, 95),
        styleScore: randInt(40, 95),
        invitedById: seedUser.id,
        inviteAcceptedAt: daysAgo(randInt(5, 60)),
      },
    });
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
    demoUsers.push(user);
  }

  const allUsers = [seedUser, ...demoUsers];
  console.log(`✅ Users: 1 seed + ${demoUsers.length} demo`);

  // 3. Challenges (50+)
  const challenges = [];
  for (let i = 0; i < CHALLENGE_SEEDS.length; i++) {
    const c = CHALLENGE_SEEDS[i]!;
    const durationDays = c.durationDays;
    const daysLeft = randInt(1, durationDays);
    const startDate = daysAgo(durationDays - daysLeft);
    const endDate = daysFromNow(daysLeft);
    const creator = allUsers[i % allUsers.length]!;

    const challenge = await prisma.challenge.create({
      data: {
        title: c.title,
        description: c.description,
        category: c.category,
        difficulty: c.difficulty,
        challengeType: c.challengeType,
        xpReward: c.xpReward,
        durationDays,
        daysLeft,
        startDate,
        endDate,
        isActive: true,
        participantCount: randInt(10, 500),
        visibility: "PUBLIC",
        goal: c.challengeType === "DAILY" ? durationDays : randInt(1, 10),
        imageUrl: picsum(`challenge-${slugify(c.title)}`, 800, 450),
        bannerUrl: picsum(`challenge-banner-${i}`, 1200, 400),
        icon: c.category.toLowerCase().replace(/\s+/g, "-"),
        rules: [
          "Be respectful to other participants",
          "Post honest progress check-ins",
          "No cheating on streaks or proofs",
        ],
        rewardText: `${c.xpReward} XP + bragging rights`,
        createdById: creator.id,
      },
    });
    challenges.push(challenge);
  }
  console.log(`✅ Challenges: ${challenges.length}`);

  // 4. Squads (40)
  const squads = [];
  for (let i = 0; i < 40; i++) {
    const name = SQUAD_NAMES[i]!;
    const category = CATEGORIES[i % CATEGORIES.length]!;
    const creator = allUsers[i % allUsers.length]!;
    const isFeatured = i < 10; // 10 featured (>= 8)
    const memberCount = randInt(5, 120);

    const squad = await prisma.squad.create({
      data: {
        name,
        description: `${name} — a ${category.toLowerCase()} squad for Gen Z hustlers who show up daily.`,
        category,
        tags: [category.toLowerCase(), "genz", i % 2 === 0 ? "competitive" : "casual"],
        isFeatured,
        memberCount,
        onlineCount: randInt(0, Math.min(20, memberCount)),
        xp: randInt(500, 50000),
        privacy: SquadPrivacy.PUBLIC,
        avatarUrl: avatar(name),
        coverUrl: picsum(`squad-cover-${i}`, 1200, 400),
        rules: [
          "Respect the grind",
          "Share wins and blockers",
          "No toxicity",
        ],
        createdById: creator.id,
      },
    });
    squads.push(squad);
  }
  console.log(`✅ Squads: ${squads.length} (${squads.filter((s) => s.isFeatured).length} featured)`);

  // 5. Communities (40)
  const communities = [];
  for (let i = 0; i < COMMUNITY_NAMES.length; i++) {
    const c = COMMUNITY_NAMES[i]!;
    const slug = slugify(c.name);
    const creator = allUsers[i % allUsers.length]!;
    const isFeatured = i < 10;

    const community = await prisma.community.create({
      data: {
        name: c.name,
        slug,
        description: `Welcome to ${c.name} — a PUBLIC space for ${c.category} enthusiasts on GenZVerse.`,
        category: c.category,
        tags: c.tags,
        rules: [
          "Be kind and constructive",
          "Stay on topic",
          "No spam or self-promo floods",
          "Report harmful content",
        ],
        isFeatured,
        memberCount: randInt(25, 8000),
        visibility: CommunityVisibility.PUBLIC,
        imageUrl: picsum(`community-${slug}`, 800, 800),
        createdById: creator.id,
      },
    });
    communities.push(community);
  }
  console.log(`✅ Communities: ${communities.length} (${communities.filter((c) => c.isFeatured).length} featured)`);

  // 6. Outfits — one consistent record each (image/title/brand/comments stay paired)
  const outfits = [];
  for (let outfitIdx = 0; outfitIdx < OUTFIT_CATALOG.length; outfitIdx++) {
    const item = OUTFIT_CATALOG[outfitIdx]!;
    const owner = demoUsers[outfitIdx % demoUsers.length]!;
    const outfit = await prisma.outfit.create({
      data: {
        title: item.title,
        brand: item.brand,
        description: item.description,
        imageUrl: item.imageUrl,
        styleTag: item.styleTag,
        price: item.price,
        likeCount: 0,
        shareCount: 0,
        commentCount: 0,
        userId: owner.id,
      },
    });
    outfits.push({ ...outfit, seedComments: item.comments });
  }
  console.log(`✅ Outfits: ${outfits.length}`);

  // 7a. Friendships (bidirectional pairs)
  const friendshipPairs: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [4, 6],
    [5, 7],
    [6, 8],
    [7, 9],
    [8, 10],
    [9, 11],
    [0, 5],
    [1, 6],
    [2, 7],
    [3, 8],
  ];

  for (const [a, b] of friendshipPairs) {
    const userA = demoUsers[a]!;
    const userB = demoUsers[b]!;
    await prisma.friendship.createMany({
      data: [
        { userId: userA.id, friendId: userB.id, isFavorite: a % 3 === 0 },
        { userId: userB.id, friendId: userA.id, isFavorite: b % 3 === 0 },
      ],
      skipDuplicates: true,
    });
  }

  // Friend request samples (pending)
  await prisma.friendRequest.createMany({
    data: [
      {
        senderId: demoUsers[10]!.id,
        recipientId: demoUsers[0]!.id,
        status: "PENDING",
        message: "Loved your photo walk posts — let's connect!",
      },
      {
        senderId: demoUsers[11]!.id,
        recipientId: demoUsers[1]!.id,
        status: "PENDING",
        message: "Fellow builder here. Mind if we link up?",
      },
    ],
    skipDuplicates: true,
  });

  // Update friendsCount roughly
  for (const user of demoUsers) {
    const count = await prisma.friendship.count({ where: { userId: user.id } });
    await prisma.user.update({
      where: { id: user.id },
      data: { friendsCount: count },
    });
  }
  console.log("✅ Friendships & friend requests");

  // 7b. Community members
  const communityMemberData = [];
  for (let i = 0; i < communities.length; i++) {
    const community = communities[i]!;
    const owner = allUsers[i % allUsers.length]!;
    communityMemberData.push({
      communityId: community.id,
      userId: owner.id,
      role: CommunityRole.OWNER,
      status: MembershipStatus.APPROVED,
    });
    // Add a few more members
    for (let j = 1; j <= 4; j++) {
      const member = allUsers[(i + j) % allUsers.length]!;
      if (member.id === owner.id) continue;
      communityMemberData.push({
        communityId: community.id,
        userId: member.id,
        role: j === 1 ? CommunityRole.MODERATOR : CommunityRole.MEMBER,
        status: MembershipStatus.APPROVED,
      });
    }
  }
  await prisma.communityMember.createMany({
    data: communityMemberData,
    skipDuplicates: true,
  });
  console.log(`✅ Community members: ${communityMemberData.length}`);

  // 7c. Squad members
  const squadMemberData = [];
  for (let i = 0; i < squads.length; i++) {
    const squad = squads[i]!;
    const owner = allUsers[i % allUsers.length]!;
    squadMemberData.push({
      squadId: squad.id,
      userId: owner.id,
      role: "OWNER",
    });
    for (let j = 1; j <= 3; j++) {
      const member = allUsers[(i + j) % allUsers.length]!;
      if (member.id === owner.id) continue;
      squadMemberData.push({
        squadId: squad.id,
        userId: member.id,
        role: j === 1 ? "ADMIN" : "MEMBER",
      });
    }
  }
  await prisma.squadMember.createMany({
    data: squadMemberData,
    skipDuplicates: true,
  });
  console.log(`✅ Squad members: ${squadMemberData.length}`);

  // 7d. Achievements catalog + some awards
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { slug: a.slug },
      update: {
        name: a.name,
        description: a.description,
        xpReward: a.xpReward,
        iconUrl: picsum(`achievement-${a.slug}`, 128, 128),
      },
      create: {
        slug: a.slug,
        name: a.name,
        description: a.description,
        xpReward: a.xpReward,
        iconUrl: picsum(`achievement-${a.slug}`, 128, 128),
      },
    });
  }
  const achievementRows = await prisma.achievement.findMany();
  const userAchievementData = [];
  for (let i = 0; i < demoUsers.length; i++) {
    const user = demoUsers[i]!;
    const earned = achievementRows.slice(0, (i % 5) + 2);
    for (const ach of earned) {
      userAchievementData.push({
        userId: user.id,
        achievementId: ach.id,
      });
    }
  }
  // Seed user gets all
  for (const ach of achievementRows) {
    userAchievementData.push({ userId: seedUser.id, achievementId: ach.id });
  }
  await prisma.userAchievement.createMany({
    data: userAchievementData,
    skipDuplicates: true,
  });
  console.log(`✅ Achievements: ${achievementRows.length}, awards: ${userAchievementData.length}`);

  // 7e. Notifications samples
  const notificationData = [
    {
      userId: demoUsers[0]!.id,
      type: NotificationType.FRIEND_REQUEST,
      title: "New friend request",
      body: `${demoUsers[10]!.displayName} sent you a friend request.`,
      data: { fromUserId: demoUsers[10]!.id },
      read: false,
    },
    {
      userId: demoUsers[1]!.id,
      type: NotificationType.SQUAD_JOINED,
      title: "Welcome to the squad",
      body: `You joined ${squads[0]!.name}.`,
      data: { squadId: squads[0]!.id },
      read: true,
    },
    {
      userId: demoUsers[2]!.id,
      type: NotificationType.COMMUNITY_JOINED,
      title: "Community joined",
      body: `You're now a member of ${communities[1]!.name}.`,
      data: { communityId: communities[1]!.id },
      read: false,
    },
    {
      userId: demoUsers[3]!.id,
      type: NotificationType.ACHIEVEMENT,
      title: "Achievement unlocked",
      body: "You earned Style Icon!",
      data: { achievementSlug: "style-icon" },
      read: false,
    },
    {
      userId: demoUsers[4]!.id,
      type: NotificationType.CHALLENGE_COMPLETED,
      title: "Challenge complete",
      body: `You completed "${challenges[0]!.title}" and earned XP.`,
      data: { challengeId: challenges[0]!.id },
      read: true,
    },
    {
      userId: demoUsers[5]!.id,
      type: NotificationType.LIKE_RECEIVED,
      title: "Your outfit got love",
      body: "Someone liked your latest look.",
      data: { outfitId: outfits[0]?.id },
      read: false,
    },
    {
      userId: demoUsers[6]!.id,
      type: NotificationType.LEVEL_UP,
      title: "Level up!",
      body: "You reached a new level. Keep the streak going.",
      data: { level: demoUsers[6]!.level },
      read: false,
    },
    {
      userId: seedUser.id,
      type: NotificationType.SYSTEM,
      title: "Seed complete",
      body: "GenZVerse demo data has been seeded successfully.",
      data: { source: "prisma-seed" },
      read: false,
    },
    {
      userId: demoUsers[7]!.id,
      type: NotificationType.AI_RECOMMENDATION,
      title: "AI tip for you",
      body: "Try a Mental Health daily challenge to balance your grind.",
      data: { category: "Mental Health" },
      read: false,
    },
    {
      userId: demoUsers[8]!.id,
      type: NotificationType.INVITE_RECEIVED,
      title: "You're invited",
      body: `${seedUser.displayName} invited you to explore featured communities.`,
      data: { fromUserId: seedUser.id },
      read: true,
    },
  ];

  await prisma.notification.createMany({ data: notificationData });
  console.log(`✅ Notifications: ${notificationData.length}`);

  // Sample challenge progress for a few users
  const progressData = [];
  for (let i = 0; i < 15; i++) {
    progressData.push({
      challengeId: challenges[i]!.id,
      userId: demoUsers[i % demoUsers.length]!.id,
      progress: randInt(0, 100),
      completed: i % 4 === 0,
      completedAt: i % 4 === 0 ? daysAgo(randInt(1, 5)) : null,
    });
  }
  await prisma.challengeProgress.createMany({
    data: progressData,
    skipDuplicates: true,
  });

  // Outfit likes + comments — always keyed to the same outfitId as the catalog row
  for (let i = 0; i < outfits.length; i++) {
    const outfit = outfits[i]!;
    const likers = demoUsers.filter((u) => u.id !== outfit.userId).slice(0, 2 + (i % 3));
    if (likers.length) {
      await prisma.outfitLike.createMany({
        data: likers.map((u) => ({ outfitId: outfit.id, userId: u.id })),
        skipDuplicates: true,
      });
    }

    const commentAuthors = demoUsers.filter((u) => u.id !== outfit.userId);
    const seedComments = outfit.seedComments ?? [];
    for (let c = 0; c < seedComments.length; c++) {
      const author = commentAuthors[c % commentAuthors.length]!;
      await prisma.outfitComment.create({
        data: {
          outfitId: outfit.id,
          userId: author.id,
          content: seedComments[c]!,
        },
      });
    }

    const [likeCount, commentCount] = await Promise.all([
      prisma.outfitLike.count({ where: { outfitId: outfit.id } }),
      prisma.outfitComment.count({ where: { outfitId: outfit.id } }),
    ]);
    await prisma.outfit.update({
      where: { id: outfit.id },
      data: {
        likeCount,
        commentCount,
        shareCount: i % 4, // small deterministic shares; never borrowed from another outfit
      },
    });
  }

  console.log("🎉 GenZVerse seed finished successfully.");
  console.log({
    seedUser: seedUser.email,
    demoUsers: demoUsers.length,
    challenges: challenges.length,
    squads: squads.length,
    communities: communities.length,
    outfits: outfits.length,
    achievements: achievementRows.length,
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
