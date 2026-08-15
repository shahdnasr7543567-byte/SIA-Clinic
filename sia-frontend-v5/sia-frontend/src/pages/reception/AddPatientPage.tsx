import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const addPatientSchema = z.object({
  bookingType: z.enum(["walkIn", "online", "phone"], { message: "اختر نوع الحجز" }),
  name: z.string().min(2, { message: "اسم المريض قصير جدًا" }),
  mobile: z
    .string()
    .regex(/^01[0125][0-9]{8}$/, { message: "رقم موبايل مصري غير صحيح" }),
  age: z.coerce.number().min(0, { message: "السن غير صحيح" }).max(120),
  priority: z.enum(["normal", "urgent", "emergency"], { message: "اختر الأولوية" }),
  visitType: z.enum(["new", "followUp"], { message: "اختر نوع الزيارة" }),
  examType: z.enum(["clinic", "home", "online"], { message: "اختر نوع الكشف" }),
  notes: z.string().optional(),
});

type AddPatientForm = z.infer<typeof addPatientSchema>;

export default function AddPatientPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AddPatientForm>({ resolver: zodResolver(addPatientSchema) });

  // TODO(step: backend integration): swap this for `receptionApi.addPatient(data)`
  // (see src/api/endpoints/reception.api.ts) once a real backend exists, then
  // push the new entry into the queue via React Query's cache.
  const onSubmit = async (data: AddPatientForm) => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success("تم إضافة المريض بنجاح");
    navigate("/reception/queue");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إضافة مريض جديد</CardTitle>
            <CardDescription>هيتضاف المريض لقائمة الانتظار مباشرة بعد الحفظ</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm">
            <Search className="h-4 w-4" />
            بحث عن مريض
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>نوع الحجز</Label>
              <Controller
                control={control}
                name="bookingType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="اختر نوع الحجز" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walkIn">حضور مباشر</SelectItem>
                      <SelectItem value="online">حجز أونلاين</SelectItem>
                      <SelectItem value="phone">حجز تليفوني</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.bookingType && <p className="text-xs text-danger">{errors.bookingType.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" placeholder="اسم المريض" {...register("name")} />
              {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mobile">رقم الموبايل</Label>
              <Input id="mobile" placeholder="01xxxxxxxxx" {...register("mobile")} />
              {errors.mobile && <p className="text-xs text-danger">{errors.mobile.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="age">السن</Label>
              <Input id="age" type="number" placeholder="السن" {...register("age")} />
              {errors.age && <p className="text-xs text-danger">{errors.age.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>الأولوية</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="اختر الأولوية" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">عادي</SelectItem>
                      <SelectItem value="urgent">مستعجل</SelectItem>
                      <SelectItem value="emergency">طارئ</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && <p className="text-xs text-danger">{errors.priority.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>نوع الزيارة</Label>
              <Controller
                control={control}
                name="visitType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="اختر نوع الزيارة" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">كشف جديد</SelectItem>
                      <SelectItem value="followUp">متابعة</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.visitType && <p className="text-xs text-danger">{errors.visitType.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>نوع الكشف</Label>
              <Controller
                control={control}
                name="examType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="اختر نوع الكشف" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinic">عيادة</SelectItem>
                      <SelectItem value="home">منزلي</SelectItem>
                      <SelectItem value="online">أونلاين</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.examType && <p className="text-xs text-danger">{errors.examType.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea id="notes" placeholder="أي ملاحظات إضافية..." {...register("notes")} />
            </div>

            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جارٍ الحفظ..." : "حفظ المريض"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
