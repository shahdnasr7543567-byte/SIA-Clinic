import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { drugDatabase, drugFormLabels, drugFormIcons, frequencyOptions, dosageAmountOptions, durationPresetsDays } from "@/data/drugs";
import type { Drug, DrugForm, PrescriptionDrugLine } from "@/types/prescription";

interface DrugAutocompleteProps {
  onAdd: (line: Omit<PrescriptionDrugLine, "lineId">) => void;
}

const drugForms = Object.keys(drugFormLabels) as DrugForm[];
const CUSTOM_ID = "custom";

export function DrugAutocomplete({ onAdd }: DrugAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [formFilter, setFormFilter] = useState<DrugForm | "all">("all");
  const [selected, setSelected] = useState<Drug | null>(null);
  const [dosageOption, setDosageOption] = useState("");
  const [customDosage, setCustomDosage] = useState("");
  const [frequencyOption, setFrequencyOption] = useState("");
  const [customFrequency, setCustomFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState<PrescriptionDrugLine["durationUnit"]>("days");
  const [instructions, setInstructions] = useState("");

  const dosage =
    dosageOption === CUSTOM_ID
      ? customDosage
      : dosageAmountOptions.find((o) => o.id === dosageOption)?.label ?? "";

  const frequency =
    frequencyOption === CUSTOM_ID
      ? customFrequency
      : frequencyOptions.find((o) => o.id === frequencyOption)?.label ?? "";

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

  const canAdd = selected && dosage.trim() && frequency.trim() && duration.trim();

  const handleAdd = () => {
    if (!canAdd || !selected) return;
    onAdd({
      drug: selected,
      dosage,
      frequency,
      duration,
      durationUnit,
      instructions: instructions.trim() || undefined,
    });
    setSelected(null);
    setQuery("");
    setDosageOption("");
    setCustomDosage("");
    setFrequencyOption("");
    setCustomFrequency("");
    setDuration("");
    setInstructions("");
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
              {results.map((drug) => {
                const FormIcon = drugFormIcons[drug.form];
                return (
                  <li key={drug.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(drug);
                        setQuery(drug.name);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-muted"
                    >
                      <span className="flex items-center gap-2">
                        <FormIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        {drug.name} <span className="text-muted-foreground">({drug.genericName})</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{drugFormLabels[drug.form]}</span>
                    </button>
                  </li>
                );
              })}
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

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Select value={dosageOption} onValueChange={setDosageOption}>
              <SelectTrigger><SelectValue placeholder="الجرعة (الكمية)" /></SelectTrigger>
              <SelectContent>
                {dosageAmountOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {dosageOption === CUSTOM_ID && (
              <Input
                placeholder="اكتب الجرعة يدويًا (مثال: قرص ونصف)"
                value={customDosage}
                onChange={(e) => setCustomDosage(e.target.value)}
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Select value={frequencyOption} onValueChange={setFrequencyOption}>
              <SelectTrigger><SelectValue placeholder="التكرار" /></SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {frequencyOption === CUSTOM_ID && (
              <Input
                placeholder="اكتب التكرار يدويًا (مثال: كل 8 ساعات)"
                value={customFrequency}
                onChange={(e) => setCustomFrequency(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-[1fr,110px] gap-2">
              <Input placeholder="المدة" value={duration} onChange={(e) => setDuration(e.target.value)} />
              <Select value={durationUnit} onValueChange={(v) => setDurationUnit(v as PrescriptionDrugLine["durationUnit"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">أيام</SelectItem>
                  <SelectItem value="weeks">أسابيع</SelectItem>
                  <SelectItem value="months">شهور</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {durationUnit === "days" && (
              <div className="flex flex-wrap gap-1.5">
                {durationPresetsDays.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(String(d))}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    {d} يوم
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Input
              placeholder="تعليمات إضافية (اختياري، مثال: بعد الأكل)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        </div>

        <Button type="button" onClick={handleAdd} disabled={!canAdd} className="self-start">
          <Plus className="h-4 w-4" />
          إضافة دواء
        </Button>
      </div>
    </div>
  );
} 