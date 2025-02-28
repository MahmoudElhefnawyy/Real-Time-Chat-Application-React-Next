import { Button } from "@/components/ui/button";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export default function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="secondary"
          size="sm"
          className="h-7 px-3 text-sm rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
}
