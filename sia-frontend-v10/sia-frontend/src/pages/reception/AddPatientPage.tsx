import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { receptionApi } from "@/api/endpoints/reception.api";
import type { CreatePatientPayload } from "@/types/patient";

// Matches the real POST /reception/patients body exactly — no bookingType or
// visitType (the backend doesn't have those fields), gender/examType added.
const addPatientSchema = z.object({
  name: z.string().min(2, { message: "اسم المريض قصير جدًا" }),
  mobile: z
    .string()
    .regex(/^01[0125][0-9]{8}$/, { message: "رقم موبايل مصري غير صحيح" }),
  age: z.coerce.number().min(0, { message: "السن غير صحيح" }).max(120),
  gender: z.enum(["male", "female"], { message: "اختر النوع" }),
  priority: z.enum(["normal", "urgent", "critical"], { message: "اختر الأولوية" }),
  examType: z.enum(["examination", "followup", "consultation"], { message: "اختر نوع الكشف" }),
  notes: z.string().optional(),
});

type AddPatientForm = z.infer<typeof addPatientSchema>;

export default function AddPatientPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AddPatientForm>({ resolver: zodResolver(addPatientSchema) });

  const addPatientMutation = useMutation({
    mutationFn: (payload: CreatePatientPayload) => receptionApi.addPatient(payload),
    onSuccess: () => {
      // the queue list is already polling, but invalidate so it refreshes immediately
      queryClient.invalidateQueries({ queryKey: ["reception", "queue"] });
      toast.success("تم إضافة المريض بنجاح");
      navigate("/reception/queue");
    },
    onError: () => {
      toast.error("حصل خطأ أثناء إضافة المريض، حاول تاني");
    },
  });

  const onSubmit = (data: AddPatientForm) => {
    addPatientMutation.mutate(data);
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
              <Label>النوع</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender && <p className="text-xs text-danger">{errors.gender.message}</p>}
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
                      <SelectItem value="critical">طارئ</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && <p className="text-xs text-danger">{errors.priority.message}</p>}
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
                      <SelectItem value="examination">كشف</SelectItem>
                      <SelectItem value="followup">إعادة</SelectItem>
                      <SelectItem value="consultation">استشارة</SelectItem>
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
              <Button type="submit" disabled={isSubmitting || addPatientMutation.isPending}>
                {isSubmitting || addPatientMutation.isPending ? "جارٍ الحفظ..." : "حفظ المريض"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
