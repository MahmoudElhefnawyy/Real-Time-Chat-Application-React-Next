
import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  isOnline: boolean("is_online").default(false),
  status: text("status"),
  lastSeen: timestamp("last_seen").defaultNow(),
  theme: text("theme").default("light"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  senderId: text("sender_id").notNull(),
  receiverId: text("receiver_id"),
  groupId: integer("group_id"),
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").default(false),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
  replyToId: integer("reply_to_id"),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: text("created_by").notNull(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  userId: text("user_id").notNull(),
  isAdmin: boolean("is_admin").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  userId: text("user_id").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // image, file, etc.
  name: text("name"),
  size: integer("size"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  clerkId: true,
  username: true,
  avatarUrl: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  senderId: true,
  receiverId: true,
  groupId: true,
  replyToId: true,
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
  avatarUrl: true,
  createdBy: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  groupId: true,
  userId: true,
  isAdmin: true,
});

export const insertReactionSchema = createInsertSchema(reactions).pick({
  messageId: true,
  userId: true,
  emoji: true,
});

export const insertMediaSchema = createInsertSchema(media).pick({
  messageId: true,
  url: true,
  type: true,
  name: true,
  size: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export type User = typeof users.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type Reaction = typeof reactions.$inferSelect;
export type Media = typeof media.$inferSelect;
