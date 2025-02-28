import { useState, useEffect } from 'react';

// Enhanced suggestion categories
const SUGGESTIONS = {
  greetings: [
    "Hey there! 👋",
    "Hi! How are you?",
    "Hello! Nice to meet you",
    "Good morning!",
    "Good evening!"
  ],
  questions: [
    "What do you think about ",
    "Could you help me with ",
    "Do you have time to ",
    "When would be a good time to "
  ],
  responses: [
    "That's interesting!",
    "I understand",
    "Thanks for sharing",
    "Good point!",
    "I agree with you"
  ],
  confirmations: [
    "Sounds good!",
    "Perfect!",
    "Got it!",
    "Will do!",
    "No problem!"
  ],
  // New categories
  followUps: [
    "Could you elaborate on that?",
    "What do you mean by that?",
    "Tell me more about it",
    "That's interesting, why?",
    "How does that work?"
  ],
  endings: [
    "Talk to you later!",
    "Have a great day!",
    "Thanks for chatting!",
    "Bye for now!",
    "Take care!"
  ]
};

const KEYWORDS = {
  greetings: ['hi', 'hey', 'hello', 'morning', 'evening'],
  questions: ['what', 'how', 'when', 'where', 'why', 'could', 'can'],
  responses: ['yes', 'no', 'maybe', 'think', 'feel'],
  confirmations: ['ok', 'okay', 'sure', 'alright'],
  endings: ['bye', 'goodbye', 'later', 'night', 'talk']
};

interface MessageContext {
  recentMessages?: string[];
  messageCount?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export function useSuggestions(message: string, context?: MessageContext) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const generateSuggestions = () => {
      const lowercaseMessage = message.toLowerCase();
      const words = lowercaseMessage.split(' ');
      const lastWord = words[words.length - 1];
      const hour = new Date().getHours();
      const timeOfDay = context?.timeOfDay || (
        hour < 12 ? 'morning' :
        hour < 17 ? 'afternoon' :
        hour < 21 ? 'evening' : 'night'
      );

      // If message is empty, suggest contextual greetings
      if (!message.trim()) {
        if (timeOfDay === 'morning') return SUGGESTIONS.greetings.slice(3, 4);
        if (timeOfDay === 'evening') return SUGGESTIONS.greetings.slice(4, 5);
        return SUGGESTIONS.greetings.slice(0, 3);
      }

      // If message ends with a question mark, suggest responses
      if (message.endsWith('?')) {
        return SUGGESTIONS.responses.slice(0, 3);
      }

      // Check for keywords in the last word
      let matchedSuggestions: string[] = [];

      // Priority order for suggestions
      const categories = ['greetings', 'questions', 'responses', 'confirmations', 'endings'] as const;

      for (const category of categories) {
        if (KEYWORDS[category].some(keyword => lastWord.includes(keyword))) {
          matchedSuggestions = SUGGESTIONS[category];
          break;
        }
      }

      // If no keyword matches but we have recent messages context
      if (!matchedSuggestions.length && context?.recentMessages?.length) {
        // Suggest follow-ups for ongoing conversations
        matchedSuggestions = SUGGESTIONS.followUps;
      }

      // If still no suggestions, provide context-based defaults
      if (!matchedSuggestions.length) {
        // If early in conversation, suggest questions
        if (context?.messageCount && context.messageCount < 3) {
          matchedSuggestions = SUGGESTIONS.questions;
        } else {
          // Default to responses for ongoing conversations
          matchedSuggestions = SUGGESTIONS.responses;
        }
      }

      // Return up to 3 suggestions
      return matchedSuggestions.slice(0, 3);
    };

    setSuggestions(generateSuggestions());
  }, [message, context]);

  return suggestions;
}