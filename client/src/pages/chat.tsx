import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/lib/store";
import ChatWindow from "@/components/chat/ChatWindow";
import Sidebar from "@/components/chat/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Settings, Moon, Sun, MessageSquare } from "lucide-react";
import { websocketService } from "@/lib/websocket";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Contact {
  id: string;
  username: string;
  avatarUrl?: string;
  isOnline: boolean;
}

interface Group {
  id: number;
  name: string;
  description?: string;
  avatarUrl?: string;
  memberCount?: number;
  members: string[];
  ownerId: string;
  createdAt: string;
}

export default function Chat() {
  const [_, setLocation] = useLocation();
  const { user, groups, settings, addGroup, updateSettings } = useAppStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      return;
    }

    // Initialize contacts
    const initialContacts = [
      {id: "1", username: "test1", isOnline: true},
      {id: "2", username: "test2", isOnline: false}
    ];

    setContacts(initialContacts);

    // Connect to WebSocket and set online status
    websocketService.connect();
    websocketService.sendPresenceUpdate({
      userId: user.id,
      isOnline: true
    });

    return () => {
      if (user) {
        websocketService.sendPresenceUpdate({
          userId: user.id,
          isOnline: false
        });
      }
      websocketService.disconnect();
    };
  }, [user, setLocation]);

  const handleUnauthorizedAction = () => {
    setShowAuthPrompt(true);
  };

  const handleSelectContact = (contact: Contact) => {
    if (!user) {
      handleUnauthorizedAction();
      return;
    }
    setSelectedContact(contact);
    setSelectedGroup(null);
  };

  const handleSelectGroup = (group: Group) => {
    if (!user) {
      handleUnauthorizedAction();
      return;
    }
    setSelectedGroup(group);
    setSelectedContact(null);
  };

  const handleCreateGroup = (name: string, description: string) => {
    if (!user) {
      handleUnauthorizedAction();
      return;
    }

    const newGroup = {
      id: Date.now(),
      name,
      description,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      memberCount: 1,
      members: [user.id],
      ownerId: user.id,
      createdAt: new Date().toISOString()
    };

    addGroup(newGroup);

    toast({
      title: "Group created",
      description: `${name} has been created successfully.`
    });
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ ...settings, theme: newTheme });
  };

  return (
    <>
      <div className="flex h-screen bg-background">
        <Sidebar 
          onSelectUser={handleSelectContact}
          onSelectGroup={handleSelectGroup}
          onCreateGroup={handleCreateGroup}
          groups={groups}
        />
        <div className="flex-1 relative">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-accent"
            >
              {settings.theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/settings")}
              className="hover:bg-accent"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {(selectedContact || selectedGroup) ? (
            <ChatWindow
              user={user!}
              selectedContact={selectedContact}
              selectedGroup={selectedGroup}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <MessageSquare className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Welcome to LiveChat</h2>
                <p className="text-muted-foreground">
                  {user ? "Select a contact or group to start chatting" : "Sign in to start chatting"}
                </p>
                {!user && (
                  <Button
                    onClick={() => setLocation("/")}
                    className="bg-gradient-to-r from-primary to-primary/80"
                  >
                    Get Started
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              Please sign in or create an account to access this feature.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAuthPrompt(false)}>
              Cancel
            </Button>
            <Button onClick={() => setLocation("/")}>
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}