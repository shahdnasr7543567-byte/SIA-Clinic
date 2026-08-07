import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Printer, Send, CalendarClock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DiagnosisField } from "@/components/doctor/DiagnosisField";
import { DrugAutocomplete } from "@/components/doctor/DrugAutocomplete";
import { DrugChipList } from "@/components/doctor/DrugChipList";
import { PrescriptionPreview } from "@/components/doctor/PrescriptionPreview";
import { drugDatabase, prescriptionTemplates } from "@/data/drugs";
import type { PrescriptionDrugLine } from "@/types/prescription";

export default function PrescriptionBuilderPage() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patient");

  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [drugs, setDrugs] = useState<PrescriptionDrugLine[]>([]);

  const previewRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: previewRef, documentTitle: "SIA-Prescription" });

  const addDrug = (line: Omit<PrescriptionDrugLine, "lineId">) => {
    setDrugs((prev) => [...prev, { ...line, lineId: crypto.randomUUID() }]);
  };

  const removeDrug = (lineId: string) => {
    setDrugs((prev) => prev.filter((l) => l.lineId !== lineId));
  };

  const applyTemplate = (templateId: string) => {
    const template = prescriptionTemplates.find((t) => t.id === templateId);
    if (!template) return;
    setDiagnosis(template.diagnosis);
    const templateDrugs = template.drugIds
      .map((id) => drugDatabase.find((d) => d.id === id))
      .filter((d): d is NonNullable<typeof d> => Boolean(d))
      .map((d) => ({
        lineId: crypto.randomUUID(),
        drug: d,
        dosage: "حسب إرشادات الطبيب",
        duration: "5",
        durationUnit: "days" as const,
      }));
    setDrugs(templateDrugs);
    toast.success(`تم تطبيق قالب: ${template.label}`);
  };

  const handleSaveAndPrint = () => {
    if (!patientName || !diagnosis) {
      toast.error("اكتب اسم المريض والتشخيص الأول");
      return;
    }
    // TODO(step: backend integration): POST prescription, then print.
    toast.success("تم حفظ الروشتة");
    handlePrint();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,1fr]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>بيانات المريض{patientId ? ` (#${patientId})` : ""}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patientName">اسم المريض</Label>
              <Input id="patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patientAge">السن</Label>
              <Input id="patientAge" type="number" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>قوالب سريعة</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {prescriptionTemplates.map((t) => (
              <Button key={t.id} type="button" variant="outline" size="sm" onClick={() => applyTemplate(t.id)}>
                {t.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>التشخيص والأدوية</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DiagnosisField value={diagnosis} onChange={setDiagnosis} />
            <DrugAutocomplete onAdd={addDrug} />
            <DrugChipList lines={drugs} onRemove={removeDrug} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSaveAndPrint}>
            <Printer className="h-4 w-4" />
            حفظ وطباعة
          </Button>
          <Button variant="outline">
            <Send className="h-4 w-4" />
            إرسال للصيدلية
          </Button>
          <Button variant="outline">
            <CalendarClock className="h-4 w-4" />
            متابعة
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">معاينة الروشتة</p>
        <PrescriptionPreview
          ref={previewRef}
          patientName={patientName}
          patientAge={patientAge ? Number(patientAge) : undefined}
          diagnosis={diagnosis}
          drugs={drugs}
          notes={notes}
        />
      </div>
    </div>
  );
}
