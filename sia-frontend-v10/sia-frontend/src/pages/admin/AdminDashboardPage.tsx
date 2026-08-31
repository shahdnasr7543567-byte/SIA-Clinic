import { Link } from "react-router-dom";
import { CalendarClock, Users, Clock, Stethoscope } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";

/**
 * Simple overview for admin — intentionally not a full analytics build.
 * Values are static placeholders (0) until the backend exposes an
 * admin-level stats endpoint; swap those in without touching the layout.
 */
export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">لوحة الأدمن</h1>
        <p className="text-sm text-muted-foreground">نظرة عامة على العيادة اليوم</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* TODO(backend): replace static 0s with a real admin stats endpoint */}
        <StatCard label="مواعيد اليوم" value={0} icon={CalendarClock} tone="primary" />
        <StatCard label="مرضى اليوم" value={0} icon={Users} tone="accent" />
        <StatCard label="في الانتظار" value={0} icon={Clock} tone="warning" />
        <StatCard label="الأطباء النشطين" value={0} icon={Stethoscope} tone="primary" />
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
              once that page is built. Not stubbing a fake one now per brief. */}
        </CardContent>
      </Card>
    </div>
  );
}
