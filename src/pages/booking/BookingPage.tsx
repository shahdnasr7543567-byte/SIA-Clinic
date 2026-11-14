import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { Banknote, Smartphone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { availableTimeSlots } from "@/data/timeSlots";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import { bookingApi } from "@/api/endpoints/booking.api";
import { usePatientAuthStore } from "@/store/patientAuthStore";

const todayIso = new Date().toISOString().split("T")[0];

// patientName/mobile are no longer collected here — the patient is already
// logged in (see PatientProtectedRoute), so identity comes from their
// account, not from typing it again.
const bookingSchema = z.object({
  examType: z.enum(["examination", "followup", "consultation"], { message: "اختر نوع الكشف" }),
  date: z
    .string()
    .min(1, { message: "اختر تاريخ الموعد" })
    .refine((d) => d >= todayIso, { message: "لا يمكن اختيار تاريخ في الماضي" }),
  time: z.string().min(1, { message: "اختر ميعاد متاح" }),
  paymentMethod: z.enum(["cash", "instapay"], { message: "اختر طريقة الدفع" }),
});

type BookingForm = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const patient = usePatientAuthStore((state) => state.patient);
  const [submitted, setSubmitted] = useState(false);
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingForm>({ resolver: zodResolver(bookingSchema) });

  const selectedTime = watch("time");
  const selectedPayment = watch("paymentMethod");

  // Calls POST /bookings as the logged-in patient — the backend reads the
  // patient's identity from the auth token attached by axiosClient, not
  // from this payload.
  const onSubmit = async (data: BookingForm) => {
    try {
      await bookingApi.create(data);
      setSubmitted(true);
    } catch {
      toast.error("حصل خطأ أثناء الحجز، حاول تاني");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Logo className="mx-auto mb-2 h-14 w-14" />
          <p className="font-heading text-lg font-bold text-secondary dark:text-foreground">SIA Clinic</p>
          <CardTitle>حجز موعد أونلاين</CardTitle>
          <CardDescription>
            {patient ? `أهلًا ${patient.name}، احجز موعدك في أقل من دقيقة` : "احجز موعدك في عيادة سيا"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="font-heading text-lg font-semibold text-accent">تم حجز موعدك بنجاح</p>
              <p className="text-sm text-muted-foreground">هيتواصل معاك فريق الاستقبال لتأكيد الموعد</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {patient && (
                <div className="flex flex-col gap-1.5">
                  <Label>بيانات المريض</Label>
                  <Input value={`${patient.name} — ${patient.mobile}`} disabled readOnly />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label>نوع الكشف</Label>
                <Controller
                  control={control}
                  name="examType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="اختر نوع الكشف" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="examination">كشف</SelectItem>
                        <SelectItem value="followup">إعادة</SelectItem>
                        <SelectItem value="consultation">استشارة</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.examType && <p className="text-xs text-danger">{errors.examType.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="date">التاريخ</Label>
                  <Input id="date" type="date" min={todayIso} {...control.register("date")} />
                  {errors.date && <p className="text-xs text-danger">{errors.date.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>الوقت</Label>
                  <Controller
                    control={control}
                    name="time"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="اختر ميعاد متاح" /></SelectTrigger>
                        <SelectContent>
                          {availableTimeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.time && <p className="text-xs text-danger">{errors.time.message}</p>}
                  {selectedTime && <p className="text-xs text-muted-foreground">الميعاد المختار: {selectedTime}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>طريقة الدفع</Label>
                <Controller
                  control={control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => field.onChange("cash")}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors",
                          selectedPayment === "cash"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <Banknote className="h-4 w-4" /> كاش
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange("instapay")}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors",
                          selectedPayment === "instapay"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <Smartphone className="h-4 w-4" /> إنستاباي
                      </button>
                    </div>
                  )}
                />
                {errors.paymentMethod && <p className="text-xs text-danger">{errors.paymentMethod.message}</p>}
              </div>

              <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
                {isSubmitting ? "جارٍ الحجز..." : "تأكيد الحجز"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
