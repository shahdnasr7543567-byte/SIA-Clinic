import { useGetDoctorStats, useListQueue } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Users, FileText, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { arEG } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: loadingStats } = useGetDoctorStats({ doctorId: user?.id });
  const { data: queue, isLoading: loadingQueue } = useListQueue({ doctorId: user?.id });

  const activeQueue = queue?.filter(q => q.status === 'waiting' || q.status === 'called') || [];
  
  // Sort critical first, then urgent, then normal
  const sortedQueue = [...activeQueue].sort((a, b) => {
    const priorityWeight = { critical: 3, urgent: 2, normal: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">مرحباً د. {user?.name?.replace('د. ', '')}</h1>
        <p className="text-muted-foreground">ملخص اليوم والحالات المنتظرة</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالات اليوم</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingStats ? "..." : stats?.patientsToday || 0}</div>
            <p className="text-xs text-muted-foreground">مريض تم كشفهم</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الوصفات الطبية</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingStats ? "..." : stats?.totalPrescriptions || 0}</div>
            <p className="text-xs text-muted-foreground">وصفة تم إصدارها</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إيرادات العيادة</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingStats ? "..." : `${stats?.revenue || 0} ج.م`}</div>
            <p className="text-xs text-muted-foreground">إجمالي اليوم</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          طابور الانتظار
        </h2>

        {loadingQueue ? (
          <div className="py-8 text-center text-muted-foreground">جاري تحميل الطابور...</div>
        ) : sortedQueue.length === 0 ? (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">لا يوجد مرضى في الانتظار</p>
              <p className="text-muted-foreground text-sm">أنت حر الآن!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {sortedQueue.map((entry) => (
              <Link key={entry.id} href={`/doctor/patient/${entry.patientId}?queueId=${entry.id}`}>
                <Card className={`cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md border-t-4 ${
                  entry.priority === 'critical' ? 'border-t-destructive' : 
                  entry.priority === 'urgent' ? 'border-t-warning' : 'border-t-primary'
                }`}>
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-lg font-bold">{entry.patient?.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>{entry.patient?.age} سنة</span>
                        <span>•</span>
                        <span dir="ltr">{entry.patient?.mobile}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={
                      entry.priority === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                      entry.priority === 'urgent' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-primary/10 text-primary border-primary/20'
                    }>
                      {entry.priority === 'critical' ? 'حرج' : entry.priority === 'urgent' ? 'عاجل' : 'عادي'}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {entry.patient?.visitType === 'new' ? 'كشف جديد' : 'متابعة'}
                      </span>
                      <span className="text-xs font-medium text-primary">
                        منتظر منذ {formatDistanceToNow(new Date(entry.addedAt), { locale: arEG })}
                      </span>
                    </div>
                    {(entry.patient?.allergies || entry.patient?.chronicDiseases) && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-destructive bg-destructive/10 p-2 rounded-md">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        يوجد تنبيهات طبية
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
