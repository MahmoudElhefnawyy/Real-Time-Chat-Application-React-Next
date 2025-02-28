
import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Smile,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { formatDistanceToNow } from 'date-fns';
import { websocketService } from '@/lib/websocket';
import { useAuthStore } from '@/lib/store';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  groupId?: number;
  senderName: string;
  senderAvatar: string;
  timestamp: string;
  isRead: boolean;
  isEdited?: boolean;
  replyToId?: string;
  reactions?: Array<{
    emoji: string;
    userId: string;
    count: number;
  }>;
}

interface MessageProps {
  message: Message;
  isOwn: boolean;
  onReply?: (messageId: string) => void;
}

export function MessageComponent({ message, isOwn, onReply }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const currentUser = useAuthStore(state => state.user);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      );
    }
  }, [isEditing]);

  // Group reactions by emoji
  const groupedReactions = message.reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = { emoji: reaction.emoji, count: 0, userIds: [] };
    }
    acc[reaction.emoji].count += 1;
    acc[reaction.emoji].userIds.push(reaction.userId);
    return acc;
  }, {} as Record<string, { emoji: string; count: number; userIds: string[] }>) || {};

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    if (!currentUser) return;
    
    websocketService.deleteMessage({
      id: parseInt(message.id),
      senderId: currentUser.id,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (!currentUser) return;
    
    websocketService.editMessage({
      id: parseInt(message.id),
      content: editContent,
      senderId: currentUser.id,
    });
    
    setIsEditing(false);
  };

  const handleAddReaction = (emoji: string) => {
    if (!currentUser) return;
    
    const userReacted = groupedReactions[emoji]?.userIds.includes(currentUser.id);
    
    websocketService.sendReaction({
      messageId: parseInt(message.id),
      userId: currentUser.id,
      emoji,
      action: userReacted ? 'remove' : 'add',
    });
    
    setShowEmojiPicker(false);
  };

  const handleReplyClick = () => {
    if (onReply) {
      onReply(message.id);
    }
  };

  // Calculate time ago
  const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
        {!isOwn && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.senderAvatar} alt={message.senderName} />
            <AvatarFallback>{message.senderName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          <Card className={`p-3 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            {!isEditing ? (
              <div className="space-y-1">
                {!isOwn && <p className="text-xs font-medium">{message.senderName}</p>}
                <p className="text-sm">{message.content}</p>
                {message.isEdited && <span className="text-xs opacity-70">(edited)</span>}
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  ref={inputRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Check className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              </div>
            )}
          </Card>
          
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span>{timeAgo}</span>
            {message.isRead && isOwn && (
              <span className="ml-2">• Read</span>
            )}
            
            {!isEditing && isOwn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {!isEditing && (
              <>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={handleReplyClick}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
                
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Picker 
                      data={data} 
                      onEmojiSelect={(emoji: { native: string }) => handleAddReaction(emoji.native)}
                      theme="light"
                      set="native"
                    />
                  </PopoverContent>
                </Popover>
              </>
            )}
          </div>
          
          {/* Reactions */}
          {Object.values(groupedReactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.values(groupedReactions).map((reaction) => {
                const hasReacted = currentUser && reaction.userIds.includes(currentUser.id);
                return (
                  <button
                    key={reaction.emoji}
                    className={`text-sm py-0.5 px-2 rounded-full border ${
                      hasReacted ? 'bg-primary/10 border-primary/30' : 'bg-background border-muted'
                    }`}
                    onClick={() => handleAddReaction(reaction.emoji)}
                  >
                    {reaction.emoji} {reaction.count}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
