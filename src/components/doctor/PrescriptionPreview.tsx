import { forwardRef } from "react";
import { drugFormLabels } from "@/data/drugs";
import type { PrescriptionDrugLine } from "@/types/prescription";

interface PrescriptionPreviewProps {
  patientName: string;
  patientAge?: number;
  diagnosis: string;
  drugs: PrescriptionDrugLine[];
  notes?: string;
}

const unitLabels: Record<PrescriptionDrugLine["durationUnit"], string> = {
  days: "يوم",
  weeks: "أسبوع",
  months: "شهر",
};

export const PrescriptionPreview = forwardRef<HTMLDivElement, PrescriptionPreviewProps>(
  ({ patientName, patientAge, diagnosis, drugs, notes }, ref) => {
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
                  <th className="py-1 text-start font-medium">المدة</th>
                </tr>
              </thead>
              <tbody>
                {drugs.map((line, i) => (
                  <tr key={line.lineId} className="border-b border-border/60">
                    <td className="py-1.5">
                      {i + 1}. {line.drug.name} <span className="text-xs text-muted-foreground">({drugFormLabels[line.drug.form]})</span>
                    </td>
                    <td className="py-1.5">{line.dosage}</td>
                    <td className="py-1.5">{line.duration} {unitLabels[line.durationUnit]}</td>
                  </tr>
                ))}
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
