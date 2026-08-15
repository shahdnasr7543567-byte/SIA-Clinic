import { Button } from "@/components/ui/button";

const quickReplies = ["الأسعار", "الأطباء", "المواعيد", "حجز موعد"];

interface QuickRepliesProps {
  onSelect: (text: string) => void;
}

export function QuickReplies({ onSelect }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {quickReplies.map((label) => (
        <Button key={label} type="button" variant="outline" size="sm" onClick={() => onSelect(label)}>
          {label}
        </Button>
      ))}
    </div>
  );
}
