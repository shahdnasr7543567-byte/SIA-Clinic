import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ChevronLeft, ClipboardList, Download } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/PageLoader";
import { PrescriptionPreview } from "@/components/doctor/PrescriptionPreview";
import { useMyPrescriptions } from "@/hooks/usePatientData";
import { usePatientAuthStore } from "@/store/patientAuthStore";
import { mapRecordDrugsToLines } from "@/utils/prescriptionDrugMapper";
import type { PrescriptionRecord } from "@/types/prescription";

export default function PatientPrescriptionsPage() {
  const patient = usePatientAuthStore((s) => s.patient);
  const { data: prescriptions, isLoading } = useMyPrescriptions();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedId = searchParams.get("id");
  const selected: PrescriptionRecord | undefined = prescriptions?.find((p) => p.id === selectedId);

  const previewRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: selected ? `روشتة-${selected.prescriptionNumber}` : "روشتة",
  });

  if (isLoading) return <PageLoader />;

  // شاشة تفاصيل روشتة واحدة
  if (selected) {
    const verifyUrl = `${window.location.origin}/rx/verify/${selected.qrHash}`;

    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
        <button
          onClick={() => navigate("/patient/prescriptions")}
          className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          الرجوع لكل الروشتات
        </button>

        <PrescriptionPreview
          ref={previewRef}
          patientName={patient?.name ?? "—"}
          patientAge={patient?.age}
          diagnosis={selected.diagnosis}
          drugs={mapRecordDrugsToLines(selected.drugs)}
          notes={selected.notes}
          verifyUrl={verifyUrl}
        />

        <div className="flex gap-3">
          <Button onClick={() => handlePrint()} className="flex-1">
            <Download className="h-4 w-4" />
            تحميل / طباعة PDF
          </Button>
        </div>
      </div>
    );
  }

  // شاشة القائمة
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            روشتاتي
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!prescriptions || prescriptions.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="لسه معندكيش روشتات"
              description="أي روشتة يكتبها الدكتور هتظهر هنا"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {prescriptions.map((rx) => (
                <button
                  key={rx.id}
                  onClick={() => navigate(`/patient/prescriptions?id=${rx.id}`)}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-start transition hover:border-primary"
                >
                  <div>
                    <p className="text-sm font-medium">{rx.diagnosis || "روشتة"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(rx.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
