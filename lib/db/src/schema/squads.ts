import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const squadsTable = pgTable("squads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  memberCount: integer("member_count").notNull().default(1),
  onlineCount: integer("online_count").notNull().default(0),
  xp: integer("xp").notNull().default(0),
  category: text("category").notNull(),
  avatarUrl: text("avatar_url"),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdById: integer("created_by_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSquadSchema = createInsertSchema(squadsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSquad = z.infer<typeof insertSquadSchema>;
export type Squad = typeof squadsTable.$inferSelect;
