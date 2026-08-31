import { useState } from "react";
import dayjs from "dayjs";
import { CalendarClock } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { useReminders, useCreateReminder } from "@/hooks/usePatientData";
import type { ReminderPreset } from "@/types/patientProfile";
import { cn } from "@/lib/utils";

const presets: { id: ReminderPreset; label: string }[] = [
  { id: "tomorrow", label: "غدًا" },
  { id: "week", label: "أسبوع" },
  { id: "month", label: "شهر" },
  { id: "custom", label: "تاريخ مخصص" },
];

// The backend always wants a concrete date, even for presets like "week" —
// it doesn't compute "today + 7 days" itself, so we do it here before sending.
function resolveDate(preset: ReminderPreset, customDate: string): string {
  switch (preset) {
    case "tomorrow":
      return dayjs().add(1, "day").format("YYYY-MM-DD");
    case "week":
      return dayjs().add(1, "week").format("YYYY-MM-DD");
    case "month":
      return dayjs().add(1, "month").format("YYYY-MM-DD");
    case "custom":
      return customDate;
  }
}

interface ReminderPanelProps {
  patientId: string;
}

export function ReminderPanel({ patientId }: ReminderPanelProps) {
  const { data: reminders, isLoading } = useReminders(patientId);
  const createReminder = useCreateReminder(patientId);
  const [selected, setSelected] = useState<ReminderPreset | null>(null);
  const [customDate, setCustomDate] = useState("");

  const handleSetReminder = () => {
    if (!selected) {
      toast.error("اختر موعد المتابعة الأول");
      return;
    }
    if (selected === "custom" && !customDate) {
      toast.error("اختر تاريخ مخصص");
      return;
    }

    createReminder.mutate(
      { preset: selected, date: resolveDate(selected, customDate) },
      {
        onSuccess: () => {
          toast.success("تم ضبط تذكير المتابعة");
          setSelected(null);
          setCustomDate("");
        },
        onError: () => {
          toast.error("حصل خطأ أثناء ضبط التذكير، حاول تاني");
        },
      }
    );
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
        <Button
          type="button"
          onClick={handleSetReminder}
          disabled={createReminder.isPending}
          className={cn(!selected && "opacity-70")}
        >
          <CalendarClock className="h-4 w-4" />
          {createReminder.isPending ? "جارٍ الضبط..." : "ضبط التذكير"}
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