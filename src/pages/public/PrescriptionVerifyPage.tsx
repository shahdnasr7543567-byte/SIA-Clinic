import { useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useReactToPrint } from "react-to-print";
import { Download, ShieldCheck, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/PageLoader";
import { PrescriptionPreview } from "@/components/doctor/PrescriptionPreview";
import { publicApi } from "@/api/endpoints/public.api";
import { mapRecordDrugsToLines } from "@/utils/prescriptionDrugMapper";

export default function PrescriptionVerifyPage() {
  const { code = "" } = useParams();
  const previewRef = useRef<HTMLDivElement>(null);
  const handleDownload = useReactToPrint({
    contentRef: previewRef,
    documentTitle: "SIA-Prescription",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public", "prescription", code],
    queryFn: () => publicApi.getPrescription(code),
    enabled: code.length > 0,
    retry: false,
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <EmptyState
          icon={TriangleAlert}
          title="الروشتة غير موجودة"
          description="الرابط ده غير صحيح أو الروشتة اتحذفت. تأكدي من الرابط أو من الشخص اللي بعتهولك."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-4 sm:p-8">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2 text-sm font-medium text-success">
          <ShieldCheck className="h-5 w-5" />
          روشتة موثقة رقم {data.prescriptionNumber}
        </div>
        <Link to="/" className="text-xs text-muted-foreground hover:underline">
          سيا | SIA Clinic
        </Link>
      </div>

      {data.doctor && (
        <p className="text-center text-sm text-muted-foreground print:hidden">
          صادرة عن د. {data.doctor.name}
          {data.doctor.specialty ? ` — ${data.doctor.specialty}` : ""}
        </p>
      )}

      <PrescriptionPreview
        ref={previewRef}
        patientName={data.patient?.name ?? "—"}
        patientAge={data.patient?.age}
        diagnosis={data.diagnosis}
        drugs={mapRecordDrugsToLines(data.drugs)}
        notes={data.notes}
      />

      <div className="flex justify-center print:hidden">
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4" />
          تحميل PDF
        </Button>
      </div>
    </div>
  );
} 
