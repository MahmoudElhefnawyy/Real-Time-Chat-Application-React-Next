
import { Card } from "@/components/ui/card";

export default function TypingIndicator() {
  return (
    <Card className="p-3 w-fit bg-muted">
      <div className="flex space-x-1">
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
      </div>
    </Card>
  );
}
