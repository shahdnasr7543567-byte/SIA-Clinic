import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Clock, Info, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

const FAQS = {
  "مواعيد العيادة": "العيادة تعمل من السبت للخميس من الساعة 9 صباحاً حتى 9 مساءً. يوم الجمعة عطلة رسمية.",
  "الأطباء المتاحون": "لدينا نخبة من الأطباء:\n- د. أحمد محمود (باطنة)\n- د. سارة كمال (أطفال)\n- د. خالد حسن (عظام)",
  "الخدمات والأسعار": "أسعار الكشف:\n- كشف بالعيادة: 300 ج.م\n- كشف مستعجل: 500 ج.م\n- استشارة أونلاين: 250 ج.م",
  "تواصل معنا": "يمكنك التواصل معنا عبر الهاتف: 01000000000 أو عبر الواتساب على نفس الرقم. عنواننا: شارع التحرير، القاهرة.",
};

export default function AiAgent() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    sender: "ai",
    text: "مرحباً بك في سِيَا! أنا المساعد الذكي، كيف يمكنني مساعدتك اليوم؟",
    timestamp: new Date()
  }]);
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let responseText = "عذراً، لم أفهم سؤالك. يمكنك استخدام الأزرار أدناه للاستعلام عن خدماتنا الشائعة.";
      
      // Simple local KB matching
      Object.entries(FAQS).forEach(([key, answer]) => {
        if (text.includes(key) || key.includes(text) || text.includes(key.split(" ")[0])) {
          responseText = answer;
        }
      });

      const aiMsg: Message = { id: (Date.now()+1).toString(), sender: 'ai', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600); // 600ms fake delay
  };

  const handleQuickReply = (key: string) => {
    handleSend(key);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col max-w-4xl mx-auto w-full border rounded-2xl overflow-hidden shadow-sm bg-muted/10">
      {/* Header */}
      <div className="bg-card p-4 border-b flex items-center gap-3 shadow-sm z-10">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary relative">
          <Bot className="h-6 w-6" />
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-accent border-2 border-card"></span>
        </div>
        <div>
          <h2 className="font-bold font-heading text-lg">مساعد سِيَا</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent inline-block"></span>
            متصل الآن - ذكاء اصطناعي
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-2 w-full`}>
            {msg.sender === 'ai' && (
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 self-end mb-1">
                <Bot className="h-4 w-4" />
              </div>
            )}
            
            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
              <div className={`px-4 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-card border text-foreground rounded-br-sm' 
                  : 'bg-primary text-primary-foreground rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                {msg.timestamp.toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            
            {msg.sender === 'user' && (
              <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 self-end mb-1">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start gap-2 w-full">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 self-end mb-1">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-primary/20 text-primary px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1 w-16">
              <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 bg-primary rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-card p-4 border-t z-10">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide hide-scrollbar w-full whitespace-nowrap mask-edges">
          <Button variant="outline" size="sm" onClick={() => handleQuickReply("مواعيد العيادة")} className="rounded-full bg-background whitespace-nowrap">
            <Clock className="h-3.5 w-3.5 ml-1.5 text-primary" /> مواعيد العيادة
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickReply("الأطباء المتاحون")} className="rounded-full bg-background whitespace-nowrap">
            <User className="h-3.5 w-3.5 ml-1.5 text-primary" /> الأطباء المتاحون
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickReply("الخدمات والأسعار")} className="rounded-full bg-background whitespace-nowrap">
            <Info className="h-3.5 w-3.5 ml-1.5 text-primary" /> الخدمات والأسعار
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickReply("تواصل معنا")} className="rounded-full bg-background whitespace-nowrap">
            <PhoneCall className="h-3.5 w-3.5 ml-1.5 text-primary" /> تواصل معنا
          </Button>
        </div>
        <form 
          className="flex gap-2 relative mt-1"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
        >
          <Input 
            placeholder="اكتب رسالتك هنا..." 
            className="flex-1 rounded-full px-5 h-12 bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-12 w-12 rounded-full shrink-0 shadow-sm"
            disabled={!input.trim() || isTyping}
          >
            <Send className="h-5 w-5 rtl:rotate-180" />
          </Button>
        </form>
      </div>
    </div>
  );
}
