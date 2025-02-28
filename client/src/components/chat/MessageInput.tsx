import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, Smile, Paperclip, X, Mic } from "lucide-react";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import VoiceMessageRecorder from "./VoiceMessageRecorder";
import SuggestionChips from "./SuggestionChips";
import { useSuggestions } from "@/hooks/useSuggestions";

const TYPING_TIMER_DELAY = 1000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain'
];

interface MessageProps {
  senderId: string;
  receiverId: string;
  senderName: string;
  content: string;
}

interface MessageInputProps {
  onSendMessage: (message: string, file?: File) => void;
  onTyping?: (isTyping: boolean) => void;
  replyMessage?: MessageProps | null;
  onCancelReply?: () => void;
}

export default function MessageInput({
  onSendMessage,
  onTyping,
  replyMessage,
  onCancelReply
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Get suggestions based on current message
  const suggestions = useSuggestions(message, {
    messageCount,
    timeOfDay: (() => {
      const hour = new Date().getHours();
      if (hour < 12) return 'morning';
      if (hour < 17) return 'afternoon';
      if (hour < 21) return 'evening';
      return 'night';
    })()
  });

  useEffect(() => {
    if (replyMessage && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyMessage]);

  const handleSendMessage = () => {
    if (message.trim() || selectedFile) {
      onSendMessage(message.trim(), selectedFile || undefined);
      setMessage("");
      setSelectedFile(null);
      setMessageCount(prev => prev + 1);
      if (onTyping) {
        onTyping(false);
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
          typingTimerRef.current = null;
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (onTyping) {
      onTyping(true);

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      typingTimerRef.current = setTimeout(() => {
        onTyping(false);
        typingTimerRef.current = null;
      }, TYPING_TIMER_DELAY);
    }
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    setMessage(prev => prev + emoji.native);
    setIsEmojiPickerOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image, PDF, or text file.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancelReply = () => {
    if (onCancelReply) {
      onCancelReply();
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    const file = new File([audioBlob], 'voice-message.webm', {
      type: 'audio/webm'
    });
    onSendMessage("Voice message", file);
    setIsRecording(false);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setMessage(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="p-4 border-t">
      {replyMessage && (
        <Card className="mb-2 p-2 bg-muted/50 flex items-start">
          <div className="flex-1 text-sm truncate pl-2 border-l-2 border-primary">
            <p className="text-xs font-medium text-muted-foreground">
              Replying to {replyMessage.senderId === replyMessage.receiverId ? 'yourself' : replyMessage.senderName}
            </p>
            <p className="truncate">{replyMessage.content}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      )}

      {selectedFile && (
        <Card className="mb-2 p-2 bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm truncate">{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCancelFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Add suggestion chips */}
      <SuggestionChips
        suggestions={suggestions}
        onSelect={handleSuggestionSelect}
      />

      {isRecording ? (
        <VoiceMessageRecorder
          onSend={handleVoiceMessage}
          onCancel={() => setIsRecording(false)}
        />
      ) : (
        <div className={`flex items-end gap-2 rounded-lg border ${isFocused ? 'ring-2 ring-ring ring-offset-background' : ''}`}>
          <Textarea
            ref={inputRef}
            placeholder="Type your message..."
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 border-0 focus-visible:ring-0 resize-none min-h-[80px]"
          />
          <div className="flex p-2 gap-1">
            <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="w-auto p-0">
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                  set="native"
                />
              </PopoverContent>
            </Popover>

            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept={ALLOWED_FILE_TYPES.join(",")}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsRecording(true)}
            >
              <Mic className="h-5 w-5" />
            </Button>

            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() && !selectedFile}
              variant="default"
              size="icon"
              className="h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}