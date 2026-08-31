import { Link } from "react-router-dom";
import { Users, Clock, CheckCircle2, Wallet, Plus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyChart } from "@/components/shared/EmptyChart";
import { EmptyState } from "@/components/shared/EmptyState";
import { useReceptionStats, useQueue } from "@/hooks/useReceptionData";

function StatCardSkeleton() {
  return <div className="skeleton h-[76px] rounded-xl" />;
}

export default function ReceptionDashboard() {
  const { data: stats, isLoading: statsLoading } = useReceptionStats();
  const { data: queue, isLoading: queueLoading } = useQueue();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">لوحة الاستقبال</h1>
          <p className="text-sm text-muted-foreground">نظرة عامة على نشاط العيادة اليوم</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/reception/queue">قائمة الانتظار</Link>
          </Button>
          <Button asChild>
            <Link to="/reception/add-patient">
              <Plus className="h-4 w-4" />
              إضافة مريض
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="إجمالي المرضى" value={stats?.totalPatients ?? 0} icon={Users} tone="primary" />
            <StatCard label="في الانتظار" value={stats?.waiting ?? 0} icon={Clock} tone="warning" />
            <StatCard label="تم الكشف عليهم" value={stats?.done ?? 0} icon={CheckCircle2} tone="accent" />
            <StatCard label="الإيرادات" value={`${stats?.revenue ?? 0} ج.م`} icon={Wallet} tone="primary" />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الإيرادات خلال الأسبوع</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>آخر المرضى المضافين</CardTitle>
        </CardHeader>
        <CardContent>
          {queueLoading ? (
            <div className="flex flex-col gap-2">
              <div className="skeleton h-12" />
              <div className="skeleton h-12" />
              <div className="skeleton h-12" />
            </div>
          ) : queue && queue.length > 0 ? (
            <ul className="divide-y divide-border">
              {queue.map((entry) => (
                <li key={entry.id} className="py-3 text-sm">
                  {entry.patient.name}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="لا يوجد مرضى مضافين بعد" description="ابدأ بإضافة أول مريض من زر «إضافة مريض» بالأعلى" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
