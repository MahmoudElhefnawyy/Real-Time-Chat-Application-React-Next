import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertMessageSchema, 
  insertGroupSchema, 
  insertGroupMemberSchema, 
  insertReactionSchema,
  insertMediaSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users", async (_req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.get("/api/users/:clerkId", async (req, res) => {
    const user = await storage.getUserById(req.params.clerkId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Invalid user data" });
      return;
    }
    const user = await storage.createUser(result.data);
    res.json(user);
  });

  app.put("/api/users/:clerkId/status", async (req, res) => {
    const { isOnline } = req.body;
    if (typeof isOnline !== 'boolean') {
      res.status(400).json({ error: "Invalid status data" });
      return;
    }
    await storage.updateUserStatus(req.params.clerkId, isOnline);
    res.json({ success: true });
  });

  app.put("/api/users/:clerkId/theme", async (req, res) => {
    const { theme } = req.body;
    if (typeof theme !== 'string') {
      res.status(400).json({ error: "Invalid theme data" });
      return;
    }
    await storage.updateUserTheme(req.params.clerkId, theme);
    res.json({ success: true });
  });

  app.put("/api/users/:clerkId/status-message", async (req, res) => {
    const { status } = req.body;
    if (typeof status !== 'string') {
      res.status(400).json({ error: "Invalid status message" });
      return;
    }
    await storage.updateUserStatus(req.params.clerkId, status);
    res.json({ success: true });
  });

  // Message routes
  app.get("/api/messages/:userId", async (req, res) => {
    const messages = await storage.getMessages(req.params.userId);
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    const result = insertMessageSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Invalid message data" });
      return;
    }
    const message = await storage.createMessage(result.data);
    res.json(message);
  });

  app.put("/api/messages/:id", async (req, res) => {
    const { content } = req.body;
    if (typeof content !== 'string') {
      res.status(400).json({ error: "Invalid message content" });
      return;
    }
    const message = await storage.editMessage(parseInt(req.params.id), content);
    res.json(message);
  });

  app.delete("/api/messages/:id", async (req, res) => {
    await storage.deleteMessage(parseInt(req.params.id));
    res.json({ success: true });
  });

  app.put("/api/messages/:id/read", async (req, res) => {
    await storage.markAsRead(parseInt(req.params.id));
    res.json({ success: true });
  });

  // Group routes
  app.get("/api/groups", async (_req, res) => {
    const groups = await storage.getGroups();
    res.json(groups);
  });

  app.get("/api/groups/:id", async (req, res) => {
    const group = await storage.getGroupById(parseInt(req.params.id));
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }
    res.json(group);
  });

  app.get("/api/users/:userId/groups", async (req, res) => {
    const groups = await storage.getUserGroups(req.params.userId);
    res.json(groups);
  });

  app.post("/api/groups", async (req, res) => {
    const result = insertGroupSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Invalid group data" });
      return;
    }
    const group = await storage.createGroup(result.data);
    res.json(group);
  });

  app.get("/api/groups/:id/messages", async (req, res) => {
    const messages = await storage.getGroupMessages(parseInt(req.params.id));
    res.json(messages);
  });

  // Group members routes
  app.get("/api/groups/:id/members", async (req, res) => {
    const members = await storage.getGroupMembers(parseInt(req.params.id));
    res.json(members);
  });

  app.post("/api/groups/:id/members", async (req, res) => {
    const groupId = parseInt(req.params.id);
    const result = insertGroupMemberSchema.safeParse({
      groupId,
      userId: req.body.userId,
      role: 'member' // Default role for new members
    });

    if (!result.success) {
      res.status(400).json({ error: "Invalid member data" });
      return;
    }

    try {
      const member = await storage.addGroupMember(result.data);

      // Get updated group info
      const updatedGroup = await storage.getGroupById(groupId);

      res.json({ 
        member,
        group: updatedGroup
      });
    } catch (error) {
      console.error('Error adding group member:', error);
      res.status(500).json({ error: "Failed to add member to group" });
    }
  });

  app.delete("/api/groups/:groupId/members/:userId", async (req, res) => {
    const groupId = parseInt(req.params.groupId);
    const { userId } = req.params;

    await storage.removeGroupMember(groupId, userId);
    res.json({ success: true });
  });

  // Reaction routes
  app.get("/api/messages/:id/reactions", async (req, res) => {
    const reactions = await storage.getReactions(parseInt(req.params.id));
    res.json(reactions);
  });

  app.post("/api/reactions", async (req, res) => {
    const result = insertReactionSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Invalid reaction data" });
      return;
    }
    const reaction = await storage.addReaction(result.data);
    res.json(reaction);
  });

  app.delete("/api/messages/:messageId/reactions", async (req, res) => {
    const messageId = parseInt(req.params.messageId);
    const { userId, emoji } = req.body;

    if (typeof userId !== 'string' || typeof emoji !== 'string') {
      res.status(400).json({ error: "Invalid reaction data" });
      return;
    }

    await storage.removeReaction(messageId, userId, emoji);
    res.json({ success: true });
  });

  // Media routes
  app.get("/api/messages/:id/media", async (req, res) => {
    const mediaItems = await storage.getMediaForMessage(parseInt(req.params.id));
    res.json(mediaItems);
  });

  app.post("/api/media", async (req, res) => {
    const result = insertMediaSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Invalid media data" });
      return;
    }
    const mediaItem = await storage.addMedia(result.data);
    res.json(mediaItem);
  });

  const httpServer = createServer(app);

  // WebSocket server setup with authentication
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws',
    clientTracking: true,
    verifyClient: (info, callback) => {
      // Skip authentication in development
      if (process.env.NODE_ENV === 'development') {
        callback(true);
        return;
      }

      const url = new URL(info.req.url!, 'ws://localhost');
      const apiKey = url.searchParams.get('apiKey');

      // Verify API key
      if (apiKey === process.env.WEBSOCKET_API_KEY) {
        callback(true);
      } else {
        callback(false, 401, 'Unauthorized');
      }
    }
  });

  console.log('WebSocket server initialized and listening on path: /ws');

  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received message type:', message.type);

        switch (message.type) {
          case 'typing':
            // Broadcast typing indicator to all other clients
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
              }
            });
            break;

          case 'message':
            console.log('Processing chat message:', {
              senderId: message.senderId,
              groupId: message.groupId,
              hasReceiver: !!message.receiverId
            });

            // Store message if persistence is required
            if (message.persist !== false) {
              try {
                await storage.createMessage({
                  content: message.content,
                  senderId: message.senderId,
                  receiverId: message.receiverId,
                  groupId: message.groupId,
                  replyToId: message.replyToId
                });
              } catch (error) {
                console.error('Failed to store message:', error);
              }
            }

            // Broadcast message to all other clients
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
              }
            });
            break;

          case 'presence':
            console.log('Processing presence update:', {
              userId: message.userId,
              isOnline: message.isOnline
            });

            // Broadcast presence update to all other clients
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
              }
            });
            break;

          default:
            console.log('Received unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket client error:', error);
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}