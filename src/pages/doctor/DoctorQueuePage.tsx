import { Link } from "react-router-dom";
import { Users, FileText, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { useDoctorStats, useDoctorQueue } from "@/hooks/useDoctorData";

export default function DoctorQueuePage() {
  const { data: stats, isLoading: statsLoading } = useDoctorStats();
  const { data: queue, isLoading: queueLoading } = useDoctorQueue();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">قائمة انتظار الطبيب</h1>
        <Button asChild>
          <Link to="/doctor/prescription/new">روشتة جديدة</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statsLoading ? (
          <>
            <div className="skeleton h-[76px] rounded-xl" />
            <div className="skeleton h-[76px] rounded-xl" />
            <div className="skeleton h-[76px] rounded-xl" />
          </>
        ) : (
          <>
            <StatCard label="المرضى" value={stats?.patients ?? 0} icon={Users} />
            <StatCard label="الروشتات" value={stats?.prescriptions ?? 0} icon={FileText} tone="accent" />
            <StatCard label="الإيرادات" value={`${stats?.revenue ?? 0} ج.م`} icon={Wallet} tone="warning" />
          </>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          {queueLoading ? (
            <div className="flex flex-col gap-2">
              <div className="skeleton h-12" />
              <div className="skeleton h-12" />
            </div>
          ) : queue && queue.length > 0 ? (
            <ul className="divide-y divide-border">
              {queue.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium">
                    #{p.queueNumber} · {p.name} <span className="text-xs text-muted-foreground">({p.age})</span>
                  </span>
                  <Button asChild size="sm">
                    <Link
                      to={`/doctor/prescription/new?patientId=${p.patientId}&queueId=${p.id}&name=${encodeURIComponent(p.name)}&age=${p.age}`}
                    >
                      بدء الكشف
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="لا يوجد مرضى في الانتظار" description="هيظهروا هنا أول ما الاستقبال تضيفهم لقائمة الانتظار" />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 