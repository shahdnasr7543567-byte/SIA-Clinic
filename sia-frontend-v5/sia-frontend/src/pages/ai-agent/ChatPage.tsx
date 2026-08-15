import { useEffect, useRef, useState } from "react";
import { Send, Bot } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/ai-agent/ChatBubble";
import { QuickReplies } from "@/components/ai-agent/QuickReplies";
import { TypingIndicator } from "@/components/ai-agent/TypingIndicator";
import { aiApi } from "@/api/endpoints/ai.api";
import type { ChatMessage } from "@/types/chat";

const now = () => new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });

const greeting: ChatMessage = {
  id: "greeting",
  sender: "assistant",
  text: "مرحباً! كيف يمكنني مساعدتك؟",
  timestamp: now(),
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  // Sends the user's message, then asks the (currently mocked, keyword-based)
  // AI endpoint for a reply. Swapping `aiApi` for a real backend call later
  // doesn't require touching this component at all.
  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: "user", text: trimmed, timestamp: now() }]);
    setInput("");
    setIsTyping(true);

    const reply = await aiApi.sendMessage(trimmed);

    setIsTyping(false);
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: "assistant", text: reply, timestamp: now() }]);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3rem)] max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border bg-secondary px-4 py-3 text-secondary-foreground">
        <Avatar>
          <AvatarFallback className="bg-accent text-accent-foreground">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-heading font-semibold">سيتا</p>
          <p className="text-xs text-secondary-foreground/70">المساعد الذكي لعيادة سيا</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-background/60 px-4 py-4">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      <QuickReplies onSelect={sendMessage} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب رسالتك..."
          className="flex-1"
        />
        <Button type="submit" size="icon" aria-label="إرسال" disabled={isTyping}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
