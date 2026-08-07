import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Logo } from "@/components/shared/Logo";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types/auth";

const loginSchema = z.object({
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
  password: z.string().min(6, { message: "كلمة المرور 6 أحرف على الأقل" }),
});

type LoginForm = z.infer<typeof loginSchema>;

const devRoles: { value: UserRole; label: string }[] = [
  { value: "reception", label: "استقبال" },
  { value: "doctor", label: "طبيب" },
  { value: "patient", label: "مريض" },
  { value: "admin", label: "أدمن" },
];

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("reception");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  // NOTE: this is a mock resolver until the backend module is connected.
  // It intentionally does not fabricate any patient/doctor data — only a
  // session for the account the user just typed in. The role picker below
  // is a dev convenience so role-gated routes (e.g. /patients/search) can
  // actually be tested before the backend supplies real roles.
  const onSubmit = async (data: LoginForm) => {
    await new Promise((r) => setTimeout(r, 600));
    login({ id: "temp-id", name: data.email.split("@")[0], email: data.email, role }, "mock-token");
    toast.success("تم تسجيل الدخول بنجاح");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="mx-auto mb-2 h-12 w-12" />
          <CardTitle>{t("auth.loginTitle")}</CardTitle>
          <CardDescription>{t("auth.loginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" className="ps-9" placeholder="name@clinic.com" {...register("email")} />
              </div>
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  {t("auth.forgotPassword")}
                </Link>
              </div>
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

            <div className="flex flex-col gap-1.5">
              <Label>الدخول كـ (للتجربة فقط لغاية ما الـ backend يترّبط)</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {devRoles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
              {isSubmitting ? t("common.loading") : t("auth.loginButton")}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="text-primary hover:underline">
              {t("auth.createAccount")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
