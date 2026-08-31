import { Link } from "react-router-dom";
import { CalendarClock, Clock, UserCheck, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";

/**
 * /doctor — the doctor's landing page. Separate from /doctor/queue (the
 * existing DoctorQueuePage, unchanged). Static placeholder values until a
 * real doctor-stats endpoint exists.
 */
export default function DoctorDashboardPage() {
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
        {/* TODO(backend): replace static 0s with a real doctor stats endpoint */}
        <StatCard label="مواعيد اليوم" value={0} icon={CalendarClock} tone="primary" />
        <StatCard label="في الانتظار" value={0} icon={Clock} tone="warning" />
        <StatCard label="المريض التالي" value="—" icon={UserCheck} tone="accent" />
        <StatCard label="تم الكشف عليهم" value={0} icon={CheckCircle2} tone="primary" />
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
