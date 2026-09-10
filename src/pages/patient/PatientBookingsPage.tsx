import { CalendarClock, CalendarCheck2, CalendarX2, CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/PageLoader";
import { useMyBookings } from "@/hooks/usePatientData";
import type { BookingStatus, BookingRecord } from "@/types/booking";
import type { ExamType } from "@/types/patient";

const examTypeLabels: Record<ExamType, string> = {
  examination: "كشف",
  followup: "إعادة",
  consultation: "استشارة",
};

const statusConfig: Record<BookingStatus, { label: string; className: string; icon: typeof CalendarClock }> = {
  pending: {
    label: "قيد التأكيد",
    className: "bg-warning/10 text-warning-foreground",
    icon: CalendarClock,
  },
  confirmed: {
    label: "مؤكد",
    className: "bg-primary/10 text-primary",
    icon: CalendarCheck2,
  },
  done: {
    label: "تم الكشف",
    className: "bg-success/10 text-success",
    icon: CalendarCheck2,
  },
  cancelled: {
    label: "ملغي",
    className: "bg-danger/10 text-danger",
    icon: CalendarX2,
  },
};

export default function PatientBookingsPage() {
  const { data: bookings, isLoading } = useMyBookings();

  if (isLoading) return <PageLoader />;

  // المواعيد الجاية (النهاردة أو بعد كده ومش ملغية) تتعرض فوق، والقديمة تحت.
  const todayIso = new Date().toISOString().split("T")[0];
  const upcoming = bookings?.filter((b) => b.date >= todayIso && b.status !== "cancelled") ?? [];
  const past = bookings?.filter((b) => b.date < todayIso || b.status === "cancelled") ?? [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            حجوزاتي
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!bookings || bookings.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="لسه معندكيش حجوزات"
              description="أي حجز تعمليه هيظهر هنا"
            />
          ) : (
            <div className="flex flex-col gap-6">
              {upcoming.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-muted-foreground">المواعيد الجاية</p>
                  {upcoming.map((booking) => (
                    <BookingRow key={booking.id} booking={booking} />
                  ))}
                </div>
              )}

              {past.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-muted-foreground">المواعيد السابقة</p>
                  {past.map((booking) => (
                    <BookingRow key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BookingRow({ booking }: { booking: BookingRecord }) {
  const status = statusConfig[booking.status];
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div>
        <p className="text-sm font-medium">{examTypeLabels[booking.examType]}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(booking.date).toLocaleDateString("ar-EG")} — {booking.time}
        </p>
      </div>
      <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
        <StatusIcon className="h-3.5 w-3.5" />
        {status.label}
      </span>
    </div>
  );
} 
