import { Activity, FileText, TrendingUp, Stethoscope } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyChart } from "@/components/shared/EmptyChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientStats } from "@/hooks/usePatientData";

interface PatientAnalyticsPanelProps {
  patientId: string;
}

export function PatientAnalyticsPanel({ patientId }: PatientAnalyticsPanelProps) {
  const { data: stats, isLoading } = usePatientStats(patientId);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <div className="skeleton h-[76px] rounded-xl" />
            <div className="skeleton h-[76px] rounded-xl" />
            <div className="skeleton h-[76px] rounded-xl" />
            <div className="skeleton h-[76px] rounded-xl" />
          </>
        ) : (
          <>
            <StatCard label="إجمالي الزيارات" value={stats?.totalVisits ?? 0} icon={Activity} />
            <StatCard label="الروشتات" value={0} icon={FileText} tone="accent" />
            <StatCard label="آخر تشخيص" value={stats?.topDiagnosis ?? "—"} icon={Stethoscope} tone="warning" />
            <StatCard label="معدل الزيارات الشهري" value={0} icon={TrendingUp} />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الزيارات عبر الوقت</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyChart />
        </CardContent>
      </Card>
    </div>
  );
}
