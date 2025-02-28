import { useState, useEffect, useRef } from "react";
import { Message, MessageComponent } from "./Message";
import MessageInput from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { websocketService } from "@/lib/websocket";
import { useToast } from "@/hooks/use-toast";
import TypingIndicator from "./TypingIndicator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Group {
  id: number;
  name: string;
  avatarUrl?: string;
  memberCount?: number;
  members: string[];
  ownerId: string;
  createdAt: string;
}

interface ChatWindowProps {
  user: User;
  selectedContact?: User;
  selectedGroup?: Group;
  onBack?: () => void;
  isMobile?: boolean;
}

export default function ChatWindow({ 
  user, 
  selectedContact, 
  selectedGroup,
  onBack,
  isMobile = false
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const wsSubscriptionRef = useRef<(() => void) | null>(null);

  const chatTitle = selectedGroup 
    ? selectedGroup.name 
    : selectedContact 
      ? selectedContact.name 
      : "Chat";

  useEffect(() => {
    // Cleanup previous subscription if exists
    if (wsSubscriptionRef.current) {
      wsSubscriptionRef.current();
      wsSubscriptionRef.current = null;
    }

    // Reset message state when contact/group changes
    setMessages([]);
    setIsLoading(true);
    setTypingUsers({});
    setReplyTo(null);

    // Connect to WebSocket if not already connected
    if (websocketService.getStatus() !== 'connected') {
      websocketService.connect();
    }

    // For demo purposes, add some initial messages
    const demoMessages = selectedContact ? [
      {
        id: "1",
        content: "Hey there! 👋",
        senderId: user.id,
        senderName: user.name,
        senderAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        receiverId: selectedContact.id,
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        isRead: true
      },
      {
        id: "2",
        content: "Hi! How are you?",
        senderId: selectedContact.id,
        senderName: selectedContact.name,
        senderAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedContact.id}`,
        receiverId: user.id,
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        isRead: true
      }
    ] : [];

    setTimeout(() => {
      setMessages(demoMessages);
      setIsLoading(false);
    }, 1000);

    // Subscribe to WebSocket messages
    const unsubscribe = websocketService.onMessage((message) => {
      if (message.type === 'typing') {
        if (
          (selectedContact && message.userId === selectedContact.id) ||
          (selectedGroup && message.groupId === selectedGroup.id)
        ) {
          setTypingUsers(prev => ({
            ...prev,
            [message.userId]: message.isTyping
          }));
        }
      } else if (message.type === 'message') {
        // Only add message if it's relevant to current chat
        const isRelevant = selectedContact
          ? (message.senderId === selectedContact.id || message.receiverId === selectedContact.id)
          : selectedGroup
            ? message.groupId === selectedGroup.id
            : false;

        if (isRelevant) {
          setMessages(prev => {
            // Check if message already exists
            const exists = prev.some(m => m.id === message.id);
            if (exists) return prev;
            return [...prev, message];
          });
        }
      }
    });

    // Store subscription for cleanup
    wsSubscriptionRef.current = unsubscribe;

    return () => {
      if (wsSubscriptionRef.current) {
        wsSubscriptionRef.current();
        wsSubscriptionRef.current = null;
      }
    };
  }, [selectedContact, selectedGroup, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (content: string, file?: File) => {
    if (!content.trim() && !file) return;

    let attachmentUrl: string | undefined;

    if (file) {
      try {
        // In a real app, this would upload to a server and get a URL
        // For demo, we'll create an object URL
        attachmentUrl = URL.createObjectURL(file);
      } catch (error) {
        console.error('Error handling file:', error);
        toast({
          title: "Error",
          description: "Failed to upload file. Please try again.",
          variant: "destructive"
        });
        return;
      }
    }

    const newMessage = {
      id: crypto.randomUUID(),
      content,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...(attachmentUrl && { attachment: { url: attachmentUrl, name: file!.name, type: file!.type } }),
      ...(selectedContact ? { receiverId: selectedContact.id } : {}),
      ...(selectedGroup ? { groupId: selectedGroup.id } : {}),
      ...(replyTo ? { replyToId: replyTo.id } : {})
    };

    // Send via WebSocket
    websocketService.sendMessage(newMessage);

    // Clear reply state
    setReplyTo(null);

    // Optimistically add message to UI
    setMessages(prev => [...prev, newMessage]);
  };

  const handleTyping = (isTyping: boolean) => {
    const data = {
      userId: user.id,
      isTyping,
      ...(selectedContact ? { receiverId: selectedContact.id } : {}),
      ...(selectedGroup ? { groupId: selectedGroup.id } : {})
    };

    websocketService.sendTypingIndicator(data);
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center gap-2">
        {isMobile && onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h2 className="text-xl font-semibold">{chatTitle}</h2>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center p-4">
            <p className="text-muted-foreground">No messages yet. Start chatting!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageComponent
                key={message.id}
                message={message}
                isOwn={message.senderId === user.id}
                onReply={handleReply}
              />
            ))}
          </div>
        )}

        {Object.entries(typingUsers).some(([id, isTyping]) => id !== user.id && isTyping) && (
          <div className="mt-2">
            <TypingIndicator />
          </div>
        )}
      </ScrollArea>

      <MessageInput 
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        replyMessage={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}