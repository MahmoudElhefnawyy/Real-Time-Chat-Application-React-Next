import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: string;
  theme?: 'light' | 'dark' | 'system';
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
  groupId?: number;
  timestamp: string;
  isRead: boolean;
}

interface Group {
  id: number;
  name: string;
  description?: string;
  avatarUrl?: string;
  memberCount: number;
  members: string[];
  ownerId: string;
  createdAt: string;
}

interface Settings {
  notifications: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

interface AppState {
  user: User | null;
  messages: Message[];
  groups: Group[];
  settings: Settings;
  setUser: (user: User | null) => void;
  addMessage: (message: Message) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  addGroup: (group: Group) => void;
  removeGroup: (groupId: number) => void;
  updateGroup: (groupId: number, updates: Partial<Group>) => void;
  logout: () => void;
}

const defaultSettings: Settings = {
  notifications: true,
  soundEnabled: true,
  theme: 'system',
  language: 'en',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      messages: [],
      groups: [],
      settings: defaultSettings,

      setUser: (user) => set({ user }),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      updateUserProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      addGroup: (group) =>
        set((state) => ({
          groups: [...state.groups, group],
        })),

      removeGroup: (groupId) =>
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
        })),

      updateGroup: (groupId, updates) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId ? { ...group, ...updates } : group
          ),
        })),

      logout: () => set({ user: null, groups: [], messages: [] }),
    }),
    {
      name: 'chat-app-storage',
      partialize: (state) => ({
        settings: state.settings,
        user: state.user,
      }),
    }
  )
);