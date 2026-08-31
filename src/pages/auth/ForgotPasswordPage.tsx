import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";

const schema = z.object({
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
});
type ForgotPasswordForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(schema) });

  // TODO(step: backend integration): POST to /auth/forgot-password.
  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success("تم إرسال رابط إعادة التعيين لبريدك");
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="mx-auto mb-2 h-12 w-12" />
          <CardTitle>نسيت كلمة المرور؟</CardTitle>
          <CardDescription>هنبعتلك رابط لإعادة تعيين كلمة المرور على بريدك</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              لو البريد اللي دخلته مسجل عندنا، هتلاقي رسالة فيها رابط إعادة التعيين قريب.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" className="ps-9" placeholder="name@clinic.com" {...register("email")} />
                </div>
                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "جارٍ الإرسال..." : "إرسال رابط إعادة التعيين"}
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              الرجوع لتسجيل الدخول
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
