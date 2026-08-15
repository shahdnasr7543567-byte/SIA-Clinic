import { memo } from "react";
import { AlertTriangle, Siren, Circle, Phone, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QueueEntry, Priority } from "@/types/patient";
import { cn } from "@/lib/utils";

const priorityMeta: Record<Priority, { label: string; icon: typeof Circle; className: string }> = {
  normal: { label: "عادي", icon: Circle, className: "text-muted-foreground" },
  urgent: { label: "مستعجل", icon: AlertTriangle, className: "text-warning" },
  emergency: { label: "طارئ", icon: Siren, className: "text-danger" },
};

interface PatientQueueCardProps {
  entry: QueueEntry;
  onDone?: (id: string) => void;
  onCancel?: (id: string) => void;
}

function PatientQueueCardBase({ entry, onDone, onCancel }: PatientQueueCardProps) {
  const { patient } = entry;
  const priority = priorityMeta[patient.priority];
  const PriorityIcon = priority.icon;

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-muted", priority.className)}>
            <PriorityIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">{patient.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" /> {patient.mobile} · {priority.label}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="accent" onClick={() => onDone?.(entry.id)}>
            <CheckCircle2 className="h-4 w-4" />
            تم
          </Button>
          <Button size="sm" variant="danger" onClick={() => onCancel?.(entry.id)}>
            <XCircle className="h-4 w-4" />
            إلغاء
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const PatientQueueCard = memo(PatientQueueCardBase);
