import { X } from "lucide-react";
import { drugFormLabels, drugFormIcons } from "@/data/drugs";
import type { PrescriptionDrugLine } from "@/types/prescription";

interface DrugChipListProps {
  lines: PrescriptionDrugLine[];
  onRemove: (lineId: string) => void;
}

const unitLabels: Record<PrescriptionDrugLine["durationUnit"], string> = {
  days: "يوم",
  weeks: "أسبوع",
  months: "شهر",
};

export function DrugChipList({ lines, onRemove }: DrugChipListProps) {
  if (lines.length === 0) {
    return <p className="text-sm text-muted-foreground">لسه مفيش أدوية مضافة للروشتة.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {lines.map((line) => {
        const FormIcon = drugFormIcons[line.drug.form];
        return (
        <li
          key={line.lineId}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
        >
          <div className="flex min-w-0 items-center gap-2">
            <FormIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {line.drug.name} <span className="text-xs text-muted-foreground">({drugFormLabels[line.drug.form]})</span>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {line.dosage} · {line.frequency} · {line.duration} {unitLabels[line.durationUnit]}
                {line.instructions ? ` · ${line.instructions}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(line.lineId)}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-danger/10 hover:text-danger"
            aria-label="حذف الدواء"
          >
            <X className="h-4 w-4" />
          </button>
        </li>
        );
      })}
    </ul>
  );
} 