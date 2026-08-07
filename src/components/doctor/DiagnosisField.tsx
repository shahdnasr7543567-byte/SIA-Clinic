import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DiagnosisFieldProps {
  value: string;
  onChange: (value: string) => void;
}

// Web Speech API isn't in the standard TS lib yet — narrow typing locally.
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function DiagnosisField({ value, onChange }: DiagnosisFieldProps) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition: SpeechRecognitionLike = new SpeechRecognition();
    recognition.lang = "ar-EG";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      onChange(transcript);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">التشخيص</label>
        {supported && (
          <Button
            type="button"
            variant={listening ? "danger" : "outline"}
            size="sm"
            onClick={toggleListening}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {listening ? "إيقاف الإملاء" : "إملاء صوتي"}
          </Button>
        )}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="اكتب التشخيص هنا أو استخدم الإملاء الصوتي..."
        className={cn(listening && "ring-2 ring-danger")}
      />
    </div>
  );
}
