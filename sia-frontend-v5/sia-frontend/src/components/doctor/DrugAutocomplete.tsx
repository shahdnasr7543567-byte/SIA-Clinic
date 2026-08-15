import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { drugDatabase, drugFormLabels } from "@/data/drugs";
import type { Drug, DrugForm, PrescriptionDrugLine } from "@/types/prescription";

interface DrugAutocompleteProps {
  onAdd: (line: Omit<PrescriptionDrugLine, "lineId">) => void;
}

const drugForms = Object.keys(drugFormLabels) as DrugForm[];

export function DrugAutocomplete({ onAdd }: DrugAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [formFilter, setFormFilter] = useState<DrugForm | "all">("all");
  const [selected, setSelected] = useState<Drug | null>(null);
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState<PrescriptionDrugLine["durationUnit"]>("days");

  const fuse = useMemo(
    () => new Fuse(drugDatabase, { keys: ["name", "genericName"], threshold: 0.35 }),
    []
  );

  const results = useMemo(() => {
    let pool = drugDatabase;
    if (formFilter !== "all") pool = pool.filter((d) => d.form === formFilter);
    if (query.trim().length < 3) return [];
    const fuseOnPool = formFilter === "all" ? fuse : new Fuse(pool, { keys: ["name", "genericName"], threshold: 0.35 });
    return fuseOnPool.search(query).map((r) => r.item).slice(0, 6);
  }, [query, formFilter, fuse]);

  const canAdd = selected && dosage.trim() && duration.trim();

  const handleAdd = () => {
    if (!canAdd || !selected) return;
    onAdd({ drug: selected, dosage, duration, durationUnit });
    setSelected(null);
    setQuery("");
    setDosage("");
    setDuration("");
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr,160px]">
        <div className="relative">
          <Input
            placeholder="اكتب 3 حروف على الأقل لاسم الدواء..."
            value={selected ? selected.name : query}
            onChange={(e) => {
              setSelected(null);
              setQuery(e.target.value);
            }}
          />
          {results.length > 0 && !selected && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-md">
              {results.map((drug) => (
                <li key={drug.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(drug);
                      setQuery(drug.name);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-muted"
                  >
                    <span>
                      {drug.name} <span className="text-muted-foreground">({drug.genericName})</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{drugFormLabels[drug.form]}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Select value={formFilter} onValueChange={(v) => setFormFilter(v as DrugForm | "all")}>
          <SelectTrigger><SelectValue placeholder="كل الأشكال" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأشكال</SelectItem>
            {drugForms.map((f) => (
              <SelectItem key={f} value={f}>{drugFormLabels[f]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr,1fr,120px,auto]">
        <Input placeholder="الجرعة (مثال: قرص كل 8 ساعات)" value={dosage} onChange={(e) => setDosage(e.target.value)} />
        <Input placeholder="المدة" value={duration} onChange={(e) => setDuration(e.target.value)} />
        <Select value={durationUnit} onValueChange={(v) => setDurationUnit(v as PrescriptionDrugLine["durationUnit"])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="days">أيام</SelectItem>
            <SelectItem value="weeks">أسابيع</SelectItem>
            <SelectItem value="months">شهور</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" onClick={handleAdd} disabled={!canAdd}>
          <Plus className="h-4 w-4" />
          إضافة دواء
        </Button>
      </div>
    </div>
  );
}
