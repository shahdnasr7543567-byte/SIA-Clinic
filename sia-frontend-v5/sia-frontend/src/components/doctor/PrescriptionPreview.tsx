import { forwardRef } from "react";
import { X } from "lucide-react";
import { drugFormLabels, drugFormIcons } from "@/data/drugs";
import type { PrescriptionDrugLine } from "@/types/prescription";

interface PrescriptionPreviewProps {
  patientName: string;
  patientAge?: number;
  diagnosis: string;
  drugs: PrescriptionDrugLine[];
  notes?: string;
  onRemoveDrug?: (lineId: string) => void;
}

const unitLabels: Record<PrescriptionDrugLine["durationUnit"], string> = {
  days: "يوم",
  weeks: "أسبوع",
  months: "شهر",
};

export const PrescriptionPreview = forwardRef<HTMLDivElement, PrescriptionPreviewProps>(
  ({ patientName, patientAge, diagnosis, drugs, notes, onRemoveDrug }, ref) => {
    return (
      <div ref={ref} className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-white p-8 text-secondary print:border-0 print:shadow-none">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="font-heading text-xl font-bold text-primary">سيا | SIA Clinic</p>
            <p className="text-xs text-muted-foreground">روشتة طبية</p>
          </div>
          <div className="h-16 w-16 rounded border border-dashed border-border text-center text-[10px] leading-[64px] text-muted-foreground">
            QR
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <p><span className="text-muted-foreground">اسم المريض: </span>{patientName || "—"}</p>
          <p><span className="text-muted-foreground">السن: </span>{patientAge ?? "—"}</p>
          <p className="col-span-2"><span className="text-muted-foreground">التاريخ: </span>{new Date().toLocaleDateString("ar-EG")}</p>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold text-secondary">التشخيص</p>
          <p className="mt-1 text-sm">{diagnosis || "—"}</p>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-secondary">الأدوية</p>
          {drugs.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد أدوية مضافة</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-start text-muted-foreground">
                  <th className="py-1 text-start font-medium">الدواء</th>
                  <th className="py-1 text-start font-medium">الجرعة</th>
                  <th className="py-1 text-start font-medium">التكرار</th>
                  <th className="py-1 text-start font-medium">المدة</th>
                  {onRemoveDrug && <th className="py-1 text-start font-medium print:hidden" />}
                </tr>
              </thead>
              <tbody>
                {drugs.map((line, i) => {
                  const FormIcon = drugFormIcons[line.drug.form];
                  return (
                    <tr key={line.lineId} className="border-b border-border/60">
                      <td className="py-1.5">
                        <span className="inline-flex items-center gap-1.5">
                          <FormIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground print:hidden" aria-hidden="true" />
                          {i + 1}. {line.drug.name} <span className="text-xs text-muted-foreground">({drugFormLabels[line.drug.form]})</span>
                        </span>
                        {line.instructions && <p className="ps-5 text-xs text-muted-foreground">{line.instructions}</p>}
                      </td>
                      <td className="py-1.5">{line.dosage}</td>
                      <td className="py-1.5">{line.frequency}</td>
                      <td className="py-1.5">{line.duration} {unitLabels[line.durationUnit]}</td>
                      {onRemoveDrug && (
                        <td className="py-1.5 text-end print:hidden">
                          <button
                            type="button"
                            onClick={() => onRemoveDrug(line.lineId)}
                            className="rounded-full p-1 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                            aria-label="حذف الدواء من الروشتة"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {notes && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-secondary">ملاحظات</p>
            <p className="mt-1 text-sm">{notes}</p>
          </div>
        )}

        <div className="mt-10 flex justify-end">
          <div className="text-center text-xs text-muted-foreground">
            <div className="mb-1 h-10 w-32 border-b border-dashed border-border" />
            توقيع الطبيب
          </div>
        </div>
      </div>
    );
  }
);
PrescriptionPreview.displayName = "PrescriptionPreview"; 