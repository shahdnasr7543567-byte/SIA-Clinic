import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Printer, CalendarClock, TriangleAlert, PlusCircle, ListChecks, MessageCircle } from "lucide-react";
import { useDrugInteractionCheck } from "@/hooks/useDrugInteractionCheck";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DiagnosisField } from "@/components/doctor/DiagnosisField";
import { DrugAutocomplete } from "@/components/doctor/DrugAutocomplete";
import { DrugChipList } from "@/components/doctor/DrugChipList";
import { PrescriptionPreview } from "@/components/doctor/PrescriptionPreview";
import { doctorApi, type CreatePrescriptionPayload } from "@/api/endpoints/doctor.api";
import { buildPrescriptionWhatsappLink } from "@/utils/whatsapp";
import type { PrescriptionDrugLine, PrescriptionRecord } from "@/types/prescription";

export default function PrescriptionBuilderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const patientId = searchParams.get("patientId");
  const queueId = searchParams.get("queueId");
  const patientMobile = searchParams.get("mobile") ?? "";

  const [patientName, setPatientName] = useState(searchParams.get("name") ?? "");
  const [patientAge, setPatientAge] = useState<string>(searchParams.get("age") ?? "");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [drugs, setDrugs] = useState<PrescriptionDrugLine[]>([]);

  // لما دي بتتملي، معناه الروشتة اتحفظت فعلاً — بنبقى في نفس الصفحة
  // ونعرض QR حقيقي + زرار واتساب بدل فورم الإدخال.
  const [savedPrescription, setSavedPrescription] = useState<PrescriptionRecord | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: previewRef, documentTitle: "SIA-Prescription" });
  const interactionWarnings = useDrugInteractionCheck(drugs);

  const addDrug = (line: Omit<PrescriptionDrugLine, "lineId">) => {
    setDrugs((prev) => [...prev, { ...line, lineId: crypto.randomUUID() }]);
  };

  const removeDrug = (lineId: string) => {
    setDrugs((prev) => prev.filter((l) => l.lineId !== lineId));
  };

  const createPrescriptionMutation = useMutation({
    mutationFn: (payload: CreatePrescriptionPayload) => doctorApi.createPrescription(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["doctor", "queue"] });
      toast.success("تم حفظ الروشتة");
      setSavedPrescription(data);
    },
    onError: () => {
      toast.error("حصل خطأ أثناء حفظ الروشتة، حاول تاني");
    },
  });

  const handleSave = () => {
    if (!patientName || !diagnosis) {
      toast.error("اكتب اسم المريض والتشخيص الأول");
      return;
    }
    if (!patientId || !queueId) {
      toast.error("لازم تبدئي الكشف من قائمة الطبيب عشان يتحدد المريض صح");
      return;
    }
    if (drugs.length === 0) {
      toast.error("ضيفي دواء واحد على الأقل");
      return;
    }

    createPrescriptionMutation.mutate({
      patientId,
      queueId,
      diagnosis,
      notes: notes || undefined,
      drugs: drugs.map((line) => ({
        name: line.drug.name,
        genericName: line.drug.genericName,
        form: line.drug.form,
        dosage: line.dosage,
        frequency: line.frequency,
        duration: line.duration,
        unit: line.durationUnit,
        instructions: line.instructions,
      })),
    });
  };

  const handleStartNew = () => {
    setSavedPrescription(null);
    setDiagnosis("");
    setNotes("");
    setDrugs([]);
  };

  // بعد الحفظ، رابط التحقق العام بيتبني من qrHash اللي راجع من الباك إند.
  const verifyUrl = savedPrescription
    ? `${window.location.origin}/rx/verify/${savedPrescription.qrHash}`
    : undefined;

  // زرار واتساب محتاج رقم موبايل حقيقي + رابط تحقق حقيقي، وده مش بيبقى
  // متاح إلا بعد ما الروشتة تتحفظ فعلاً.
  const handleSendWhatsapp = () => {
    if (!verifyUrl) return;
    if (!patientMobile) {
      toast.error("مفيش رقم موبايل مسجل للمريض ده");
      return;
    }
    const link = buildPrescriptionWhatsappLink(patientMobile, patientName, verifyUrl);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,1fr]">
      <div className="flex flex-col gap-6">
        {savedPrescription ? (
          <Card>
            <CardHeader>
              <CardTitle>تم حفظ الروشتة ✅ — رقم {savedPrescription.prescriptionNumber}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                الروشتة اتحفظت في ملف المريض. تقدري تطبعيها، أو تبعتيها مباشرة على واتساب المريض من زرار "إرسال الروشتة على واتساب" تحت.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSendWhatsapp} disabled={!patientMobile}>
                  <MessageCircle className="h-4 w-4" />
                  إرسال الروشتة على واتساب
                </Button>
                <Button onClick={handlePrint} variant="outline">
                  <Printer className="h-4 w-4" />
                  طباعة / تحميل PDF
                </Button>
                <Button onClick={handleStartNew} variant="outline">
                  <PlusCircle className="h-4 w-4" />
                  روشتة جديدة
                </Button>
                <Button variant="outline" onClick={() => navigate("/doctor/queue")}>
                  <ListChecks className="h-4 w-4" />
                  العودة لقائمة الانتظار
                </Button>
              </div>
              {!patientMobile && (
                <div className="flex items-start gap-2 text-sm text-warning-foreground">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>مفيش رقم موبايل مسجل للمريض ده، فزرار الواتساب متعطّل.</span>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
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
                <CardTitle>التشخيص والأدوية</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <DiagnosisField value={diagnosis} onChange={setDiagnosis} />
                <DrugAutocomplete onAdd={addDrug} />
                <DrugChipList lines={drugs} onRemove={removeDrug} />

                {interactionWarnings.length > 0 && (
                  <div className="flex flex-col gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3">
                    {interactionWarnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-warning-foreground">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          تعارض محتمل بين <strong>{w.drugNames[0]}</strong> و<strong>{w.drugNames[1]}</strong> — {w.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="notes">ملاحظات إضافية</Label>
                  <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSave} disabled={createPrescriptionMutation.isPending}>
                <Printer className="h-4 w-4" />
                {createPrescriptionMutation.isPending ? "جارٍ الحفظ..." : "حفظ الروشتة"}
              </Button>
              <Button variant="outline">
                <CalendarClock className="h-4 w-4" />
                متابعة
              </Button>
            </div>
          </>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">معاينة الروشتة</p>
        <PrescriptionPreview
          ref={previewRef}
          patientName={patientName}
          patientAge={patientAge ? Number(patientAge) : undefined}
          patientMobile={patientMobile}
          diagnosis={diagnosis}
          drugs={drugs}
          notes={notes}
          onRemoveDrug={savedPrescription ? undefined : removeDrug}
          verifyUrl={verifyUrl}
        />
      </div>
    </div>
  );
} 
