import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, Phone, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/endpoints/auth.api";

// NOTE: this is intentionally separate from staff registration.
// Patients only ever get role "patient" — there is no role picker here,
// and the resulting session must never be able to reach staff routes
// (see the security note in App.tsx / types/auth.ts).
const patientRegisterSchema = z.object({
  name: z.string().min(2, { message: "الاسم لازم يكون حرفين على الأقل" }),
  phone: z.string().min(10, { message: "رقم موبايل غير صالح" }),
  password: z.string().min(6, { message: "كلمة المرور 6 أحرف على الأقل" }),
});

type PatientRegisterForm = z.infer<typeof patientRegisterSchema>;

export default function PatientRegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);

  // clinicCode comes from the URL (/register/:clinicCode), not typed by
  // the patient — see decision to use per-clinic registration links.
  const { clinicCode } = useParams<{ clinicCode: string }>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientRegisterForm>({ resolver: zodResolver(patientRegisterSchema) });

  const onSubmit = async (data: PatientRegisterForm) => {
    if (!clinicCode) {
      toast.error("رابط التسجيل غير صحيح، من فضلك استخدم الرابط اللي وصلك من عيادتك");
      return;
    }
    try {
      const { user, token } = await authApi.patientRegister({ ...data, clinicCode });
      login(user, token);
      toast.success("تم إنشاء حسابك بنجاح");
      navigate("/patient/dashboard");
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.status === 409
        ? "رقم الموبايل ده مسجل بالفعل"
        : "حصل خطأ، حاول تاني";
      toast.error(message);
    }
  };

  // No clinicCode in the URL at all → wrong/missing link, don't show the form.
  if (!clinicCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Logo className="mx-auto mb-2 h-12 w-12" />
            <CardTitle>رابط غير صحيح</CardTitle>
            <CardDescription>
              من فضلك استخدم رابط التسجيل اللي وصلك من عيادتك
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="mx-auto mb-2 h-12 w-12" />
          <CardTitle>إنشاء حساب مريض</CardTitle>
          <CardDescription>سجّل بياناتك عشان تتابعي حجوزاتك بسهولة</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Confirmation line instead of a typed clinic-code field */}
          <p className="mb-4 rounded-md bg-muted px-3 py-2 text-center text-sm text-muted-foreground">
            بتسجل حساب في عيادة: <span className="font-medium text-foreground">{clinicCode}</span>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">الاسم</Label>
              <div className="relative">
                <User className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" type="text" className="ps-9" placeholder="اسمك بالكامل" {...register("name")} />
              </div>
              {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">رقم الموبايل</Label>
              <div className="relative">
                <Phone className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" type="tel" className="ps-9" placeholder="01012345678" {...register("phone")} />
              </div>
              {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="ps-9 pe-9"
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
              {isSubmitting ? t("common.loading") : "إنشاء الحساب"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              عندك حساب بالفعل؟{" "}
              <Link to="/patient/login" className="text-primary hover:underline">
                سجّل دخول
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
