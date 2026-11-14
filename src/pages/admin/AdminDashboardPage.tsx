import { Link } from "react-router-dom";
import { Users, Clock, CheckCircle2, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { useReceptionStats } from "@/hooks/useReceptionData";

function StatCardSkeleton() {
  return <div className="skeleton h-[76px] rounded-xl" />;
}

/**
 * Simple overview for admin. Reuses GET /reception/stats (the backend
 * allows the admin role on it), so these are real numbers for today.
 */
export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useReceptionStats();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">لوحة الأدمن</h1>
        <p className="text-sm text-muted-foreground">نظرة عامة على العيادة اليوم</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="مرضى اليوم" value={stats?.totalPatients ?? 0} icon={Users} tone="accent" />
            <StatCard label="في الانتظار" value={stats?.waiting ?? 0} icon={Clock} tone="warning" />
            <StatCard label="تم الكشف عليهم" value={stats?.done ?? 0} icon={CheckCircle2} tone="primary" />
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
            <Link to="/reception">الاستقبال</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/doctor">الطبيب</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/patients/search">المرضى</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/reception/queue">قائمة الانتظار</Link>
          </Button>
          {/* NOTE: no Users-management page exists yet — add its Link here
              once that page is built. */}
        </CardContent>
      </Card>
    </div>
  );
} 
