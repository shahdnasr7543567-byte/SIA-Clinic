import { memo } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

function ChatBubbleBase({ message }: { message: ChatMessage }) {
  const isUser = message.sender === "user";
  return (
    <div className={cn("flex", isUser ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm",
          isUser
            ? "rounded-ss-sm bg-primary text-primary-foreground"
            : "rounded-se-sm bg-card text-card-foreground border border-border"
        )}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        <p className={cn("mt-1 text-[10px]", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}

export const ChatBubble = memo(ChatBubbleBase);
