export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: string;
  isRead: boolean;
}

export interface MockUser {
  id: string;
  username: string;
  avatarUrl: string;
  isOnline: boolean;
}

export const mockUsers: MockUser[] = [
  {
    id: "1",
    username: "Alice Smith",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    isOnline: true,
  },
  {
    id: "2",
    username: "Bob Johnson",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    isOnline: false,
  },
  {
    id: "3",
    username: "Charlie Brown",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    isOnline: true,
  },
];

export const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hey there! How are you?",
    senderId: "1",
    receiverId: "2",
    senderName: "Alice Smith",
    senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    timestamp: new Date().toISOString(),
    isRead: true,
  },
  {
    id: "2",
    content: "I'm good, thanks! How about you?",
    senderId: "2",
    receiverId: "1",
    senderName: "Bob Johnson",
    senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    timestamp: new Date().toISOString(),
    isRead: true,
  },
];
