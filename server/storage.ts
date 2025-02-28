
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  users, User, InsertUser, 
  messages, Message, InsertMessage,
  groups, Group, InsertGroup,
  groupMembers, GroupMember, InsertGroupMember,
  reactions, Reaction, InsertReaction,
  media, Media, InsertMedia
} from "@shared/schema";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@0.0.0.0:5432/chat";
const client = postgres(connectionString);
const db = drizzle(client);

class Storage {
  // User methods
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserById(clerkId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(users.clerkId.equals(clerkId));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUserStatus(clerkId: string, isOnline: boolean): Promise<void> {
    await db.update(users)
      .set({ 
        isOnline, 
        lastSeen: isOnline ? undefined : new Date() 
      })
      .where(users.clerkId.equals(clerkId));
  }

  async updateUserTheme(clerkId: string, theme: string): Promise<void> {
    await db.update(users)
      .set({ theme })
      .where(users.clerkId.equals(clerkId));
  }

  async updateUserStatus(clerkId: string, status: string): Promise<void> {
    await db.update(users)
      .set({ status })
      .where(users.clerkId.equals(clerkId));
  }

  // Message methods
  async getMessages(recipientId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(messages.receiverId.equals(recipientId))
      .or(messages.senderId.equals(recipientId));
  }

  async getGroupMessages(groupId: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(messages.groupId.equals(groupId));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async editMessage(id: number, content: string): Promise<Message> {
    const result = await db.update(messages)
      .set({ 
        content, 
        isEdited: true, 
        editedAt: new Date() 
      })
      .where(messages.id.equals(id))
      .returning();
    return result[0];
  }

  async deleteMessage(id: number): Promise<void> {
    await db.update(messages)
      .set({ isDeleted: true })
      .where(messages.id.equals(id));
  }

  async markAsRead(id: number): Promise<void> {
    await db.update(messages)
      .set({ isRead: true })
      .where(messages.id.equals(id));
  }

  // Group methods
  async getGroups(): Promise<Group[]> {
    return await db.select().from(groups);
  }

  async getGroupById(id: number): Promise<Group | undefined> {
    const result = await db.select().from(groups).where(groups.id.equals(id));
    return result[0];
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const result = await db.insert(groups).values(group).returning();
    return result[0];
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    const memberGroups = await db.select({
      groupId: groupMembers.groupId
    })
    .from(groupMembers)
    .where(groupMembers.userId.equals(userId));
    
    const groupIds = memberGroups.map(g => g.groupId);
    
    if (groupIds.length === 0) return [];
    
    return await db.select()
      .from(groups)
      .where(groups.id.in(groupIds));
  }

  // Group Member methods
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return await db.select()
      .from(groupMembers)
      .where(groupMembers.groupId.equals(groupId));
  }

  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const result = await db.insert(groupMembers).values(member).returning();
    return result[0];
  }

  async removeGroupMember(groupId: number, userId: string): Promise<void> {
    await db.delete(groupMembers)
      .where(groupMembers.groupId.equals(groupId))
      .and(groupMembers.userId.equals(userId));
  }

  async isGroupAdmin(groupId: number, userId: string): Promise<boolean> {
    const result = await db.select()
      .from(groupMembers)
      .where(groupMembers.groupId.equals(groupId))
      .and(groupMembers.userId.equals(userId))
      .and(groupMembers.isAdmin.equals(true));
    
    return result.length > 0;
  }

  // Reaction methods
  async getReactions(messageId: number): Promise<Reaction[]> {
    return await db.select()
      .from(reactions)
      .where(reactions.messageId.equals(messageId));
  }

  async addReaction(reaction: InsertReaction): Promise<Reaction> {
    const result = await db.insert(reactions).values(reaction).returning();
    return result[0];
  }

  async removeReaction(messageId: number, userId: string, emoji: string): Promise<void> {
    await db.delete(reactions)
      .where(reactions.messageId.equals(messageId))
      .and(reactions.userId.equals(userId))
      .and(reactions.emoji.equals(emoji));
  }

  // Media methods
  async getMediaForMessage(messageId: number): Promise<Media[]> {
    return await db.select()
      .from(media)
      .where(media.messageId.equals(messageId));
  }

  async addMedia(mediaItem: InsertMedia): Promise<Media> {
    const result = await db.insert(media).values(mediaItem).returning();
    return result[0];
  }
}

export const storage = new Storage();
