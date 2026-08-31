import { useParams } from "react-router-dom";
import { Phone, Cake } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { PatientAnalyticsPanel } from "@/components/patient/PatientAnalyticsPanel";
import { ReminderPanel } from "@/components/patient/ReminderPanel";
import {
  usePatientProfile,
  usePatientMedicalInfo,
  usePatientStats,
  usePrescriptionHistory,
} from "@/hooks/usePatientData";

export default function PatientProfilePage() {
  const { id = "" } = useParams();
  const { data: patient } = usePatientProfile(id);
  const { data: medical, isLoading: medicalLoading } = usePatientMedicalInfo(id);
  const { data: stats, isLoading: statsLoading } = usePatientStats(id);
  const { data: history, isLoading: historyLoading } = usePrescriptionHistory(id);

  const displayName = patient?.name ?? "مريض غير معروف";

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-heading text-xl font-bold">{displayName}</h1>
              <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Cake className="h-3.5 w-3.5" /> {patient?.age ?? "—"} سنة
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {patient?.mobile ?? "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:text-end">
            <p className="text-muted-foreground">أول زيارة</p>
            <p>{statsLoading ? "..." : stats?.firstVisit ?? "—"}</p>
            <p className="text-muted-foreground">آخر زيارة</p>
            <p>{statsLoading ? "..." : stats?.lastVisit ?? "—"}</p>
            <p className="text-muted-foreground">إجمالي الزيارات</p>
            <p>{statsLoading ? "..." : stats?.totalVisits ?? 0}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-sm font-medium text-muted-foreground">الأمراض المزمنة</p>
            {medicalLoading ? (
              <div className="skeleton h-6 w-32" />
            ) : medical?.chronicDiseases.length ? (
              <p className="text-sm">{medical.chronicDiseases.join("، ")}</p>
            ) : (
              <p className="text-sm text-muted-foreground">لا يوجد</p>
            )}
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-muted-foreground">الحساسية</p>
            {medicalLoading ? (
              <div className="skeleton h-6 w-32" />
            ) : medical?.allergies.length ? (
              <p className="text-sm">{medical.allergies.join("، ")}</p>
            ) : (
              <p className="text-sm text-muted-foreground">لا يوجد</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">سجل الروشتات</TabsTrigger>
          <TabsTrigger value="analytics">الإحصائيات</TabsTrigger>
          <TabsTrigger value="reminders">المتابعة</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          {historyLoading ? (
            <div className="flex flex-col gap-2">
              <div className="skeleton h-14" />
              <div className="skeleton h-14" />
            </div>
          ) : history && history.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {history.map((h) => (
                <li key={h.id} className="rounded-lg border border-border px-4 py-3 text-sm">
                  <span className="font-medium">{h.diagnosis}</span>
                  <span className="text-muted-foreground"> — {h.date} — {h.drugCount} أدوية</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="لا توجد روشتات بعد" description="سجل الروشتات هيظهر هنا أول ما الطبيب يكتب أول روشتة للمريض" />
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <PatientAnalyticsPanel patientId={id} />
        </TabsContent>

        <TabsContent value="reminders">
          <ReminderPanel patientId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
