import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { useAuthStore } from "@/store/authStore";

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "الاسم قصير جدًا" }),
    email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
    password: z.string().min(6, { message: "كلمة المرور 6 أحرف على الأقل" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    await new Promise((r) => setTimeout(r, 600));
    login({ id: "temp-id", name: data.name, email: data.email, role: "patient" }, "mock-token");
    toast.success("تم إنشاء الحساب بنجاح");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="mx-auto mb-2 h-12 w-12" />
          <CardTitle>{t("auth.registerTitle")}</CardTitle>
          <CardDescription>حساب المريض يتيح لك متابعة حجوزاتك وروشتاتك</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">{t("auth.fullName")}</Label>
              <Input id="name" placeholder="الاسم الكامل" {...register("name")} />
              {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" placeholder="name@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
              {isSubmitting ? t("common.loading") : t("auth.registerButton")}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("auth.haveAccount")}{" "}
            <Link to="/login" className="text-primary hover:underline">
              {t("auth.loginButton")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
