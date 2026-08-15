import { useState } from "react";
import { CalendarClock } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { useReminders } from "@/hooks/usePatientData";
import type { ReminderPreset } from "@/types/patientProfile";
import { cn } from "@/lib/utils";

const presets: { id: ReminderPreset; label: string }[] = [
  { id: "tomorrow", label: "غدًا" },
  { id: "week", label: "أسبوع" },
  { id: "month", label: "شهر" },
  { id: "custom", label: "تاريخ مخصص" },
];

interface ReminderPanelProps {
  patientId: string;
}

export function ReminderPanel({ patientId }: ReminderPanelProps) {
  const { data: reminders, isLoading } = useReminders(patientId);
  const [selected, setSelected] = useState<ReminderPreset | null>(null);
  const [customDate, setCustomDate] = useState("");

  // TODO(step: backend integration): POST the reminder, then invalidate the query.
  const handleSetReminder = () => {
    if (!selected) {
      toast.error("اختر موعد المتابعة الأول");
      return;
    }
    if (selected === "custom" && !customDate) {
      toast.error("اختر تاريخ مخصص");
      return;
    }
    toast.success("تم ضبط تذكير المتابعة");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant={selected === p.id ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelected(p.id)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {selected === "custom" && (
        <Input type="date" className="max-w-xs" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
      )}

      <div>
        <Button type="button" onClick={handleSetReminder} className={cn(!selected && "opacity-70")}>
          <CalendarClock className="h-4 w-4" />
          ضبط التذكير
        </Button>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">التذكيرات الحالية</p>
        {isLoading ? (
          <div className="skeleton h-16" />
        ) : reminders && reminders.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {reminders.map((r) => (
              <li key={r.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                {r.date} {r.note && `— ${r.note}`}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="لا توجد تذكيرات متابعة" description="اختر موعد من فوق لضبط أول تذكير لهذا المريض" />
        )}
      </div>
    </div>
  );
}
