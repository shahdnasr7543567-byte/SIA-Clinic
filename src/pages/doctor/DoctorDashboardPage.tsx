import { Link } from "react-router-dom";
import { Clock, UserCheck, FileText, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { useDoctorQueue, useDoctorStats } from "@/hooks/useDoctorData";

function StatCardSkeleton() {
  return <div className="skeleton h-[76px] rounded-xl" />;
}

/**
 * /doctor — the doctor's landing page. Numbers come from the real
 * GET /doctor/stats and GET /doctor/queue endpoints.
 */
export default function DoctorDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDoctorStats();
  const { data: queue, isLoading: queueLoading } = useDoctorQueue();

  const waiting = queue?.length ?? 0;
  const nextPatient = queue && queue.length > 0 ? queue[0].name : "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">لوحة الطبيب</h1>
          <p className="text-sm text-muted-foreground">نظرة عامة على يومك</p>
        </div>
        <Button asChild>
          <Link to="/doctor/queue">قائمة المرضى</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {queueLoading || statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="في الانتظار" value={waiting} icon={Clock} tone="warning" />
            <StatCard label="المريض التالي" value={nextPatient} icon={UserCheck} tone="accent" />
            <StatCard label="الروشتات المكتوبة" value={stats?.prescriptions ?? 0} icon={FileText} tone="primary" />
            <StatCard label="إيراد اليوم" value={`${stats?.revenue ?? 0} ج.م`} icon={Wallet} tone="primary" />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/doctor/queue">قائمة الانتظار</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/doctor/prescription/new">روشتة جديدة</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/patients/search">بحث عن مريض</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/ai-agent">المساعد الذكي</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
