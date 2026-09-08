import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, Phone, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { usePatientAuthStore } from "@/store/patientAuthStore";
import { patientAuthApi } from "@/api/endpoints/patientAuth.api";

// Patient-only login — phone based, completely separate from staff
// LoginPage (email based). Never merge these two forms/routes/stores; see
// the security note in App.tsx about keeping patient and staff entry
// points fully isolated.
const patientLoginSchema = z.object({
  mobile: z.string().min(10, { message: "رقم موبايل غير صالح" }),
  password: z.string().min(6, { message: "كلمة المرور 6 أحرف على الأقل" }),
});

type PatientLoginForm = z.infer<typeof patientLoginSchema>;

export default function PatientLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = usePatientAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientLoginForm>({ resolver: zodResolver(patientLoginSchema) });

  const onSubmit = async (data: PatientLoginForm) => {
    try {
      const { patient, token } = await patientAuthApi.login(data);
      login(patient, token);
      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/patient/dashboard");
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.status === 401
        ? "رقم الموبايل أو كلمة المرور غلط"
        : "حصل خطأ، حاول تاني";
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="mx-auto mb-2 h-12 w-12" />
          <CardTitle>تسجيل دخول المريض</CardTitle>
          <CardDescription>ادخل رقم موبايلك وكلمة المرور</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mobile">رقم الموبايل</Label>
              <div className="relative">
                <Phone className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="mobile" type="tel" className="ps-9" placeholder="01012345678" {...register("mobile")} />
              </div>
              {errors.mobile && <p className="text-xs text-danger">{errors.mobile.message}</p>}
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
              {isSubmitting ? t("common.loading") : t("auth.loginButton")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              مفيش حساب؟ استخدم الرابط اللي وصلك من عيادتك للتسجيل
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
