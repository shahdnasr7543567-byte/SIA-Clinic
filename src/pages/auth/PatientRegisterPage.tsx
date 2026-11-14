import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Phone, Lock, User, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import axios from "axios";
import type { RecaptchaVerifier, ConfirmationResult } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { usePatientAuthStore } from "@/store/patientAuthStore";
import { patientAuthApi } from "@/api/endpoints/patientAuth.api";
import { createRecaptchaVerifier, sendOtp, verifyOtp } from "@/lib/phoneVerification";

// NOTE: this is intentionally separate from staff registration.
// Patients never touch useAuthStore/authApi (staff) — see the security
// note in App.tsx / types/auth.ts about keeping the two systems isolated.

// خطوة 1: رقم الموبايل بس
const phoneSchema = z.object({
  mobile: z.string().min(10, { message: "رقم موبايل غير صالح" }),
});
type PhoneForm = z.infer<typeof phoneSchema>;

// خطوة 3: باقي البيانات (بعد ما الرقم يتحقق منه)
const detailsSchema = z.object({
  name: z.string().min(2, { message: "الاسم لازم يكون حرفين على الأقل" }),
  age: z.coerce.number().min(0, { message: "السن غير صحيح" }).max(120),
  password: z.string().min(6, { message: "كلمة المرور 6 أحرف على الأقل" }),
});
type DetailsForm = z.infer<typeof detailsSchema>;

// بيحوّل رقم مصري بأي صيغة (01xxxxxxxxx أو +20xxxxxxxxxx) لصيغة E.164 الكاملة
function toE164(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.startsWith("20")) return `+${digits}`;
  if (digits.startsWith("0")) return `+20${digits.slice(1)}`;
  return `+20${digits}`;
}

type Step = "phone" | "otp" | "details";

export default function PatientRegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = usePatientAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);

  const [step, setStep] = useState<Step>("phone");
  const [verifiedMobile, setVerifiedMobile] = useState("");
  const [firebaseIdToken, setFirebaseIdToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);

  // clinicCode comes from the URL (/register/:clinicCode), not typed by
  // the patient — see decision to use per-clinic registration links.
  const { clinicCode } = useParams<{ clinicCode: string }>();

  // عدّاد "أعد الإرسال"
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  const detailsForm = useForm<DetailsForm>({ resolver: zodResolver(detailsSchema) });

  // خطوة 1 → إرسال الكود
  const handleSendOtp = async (data: PhoneForm) => {
    setIsSendingOtp(true);
    try {
      const phoneNumber = toE164(data.mobile);

      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = createRecaptchaVerifier("recaptcha-container");
      }

      const confirmationResult = await sendOtp(phoneNumber, recaptchaVerifierRef.current);
      confirmationResultRef.current = confirmationResult;
      setVerifiedMobile(data.mobile);
      setStep("otp");
      setResendCooldown(60);
      toast.success("اتبعت كود التحقق على موبايلك");
    } catch (error) {
      console.error(error);
      toast.error("حصل خطأ في إرسال الكود، تأكدي من الرقم وحاولي تاني");
      // لو الـ reCAPTCHA اتستخدمت مرة وفشلت، لازم نعمل واحدة جديدة في المحاولة الجاية
      recaptchaVerifierRef.current = null;
    } finally {
      setIsSendingOtp(false);
    }
  };

  // خطوة 2 → تأكيد الكود
  const handleVerifyOtp = async () => {
    if (!confirmationResultRef.current) return;
    if (otpCode.length < 6) {
      toast.error("اكتبي الكود كامل (6 أرقام)");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const token = await verifyOtp(confirmationResultRef.current, otpCode);
      setFirebaseIdToken(token);
      setStep("details");
      toast.success("تم التحقق من رقم الموبايل");
    } catch (error) {
      console.error(error);
      toast.error("الكود غير صحيح، حاولي تاني");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // إعادة إرسال الكود
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    await handleSendOtp({ mobile: verifiedMobile });
  };

  // خطوة 3 → إنشاء الحساب فعليًا
  const onSubmitDetails = async (data: DetailsForm) => {
    if (!clinicCode) {
      toast.error("رابط التسجيل غير صحيح، من فضلك استخدم الرابط اللي وصلك من عيادتك");
      return;
    }
    try {
      const { patient, token } = await patientAuthApi.register({
        ...data,
        mobile: verifiedMobile,
        clinicCode,
        firebaseIdToken,
      });
      login(patient, token);
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
      {/* عنصر فاضي لازم لـ reCAPTCHA غير المرئي — مبيظهرش على الشاشة */}
      <div id="recaptcha-container" />

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

          {/* ===== خطوة 1: رقم الموبايل ===== */}
          {step === "phone" && (
            <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mobile">رقم الموبايل</Label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="mobile"
                    type="tel"
                    className="ps-9"
                    placeholder="01012345678"
                    {...phoneForm.register("mobile")}
                  />
                </div>
                {phoneForm.formState.errors.mobile && (
                  <p className="text-xs text-danger">{phoneForm.formState.errors.mobile.message}</p>
                )}
              </div>

              <Button type="submit" className="mt-2 w-full" disabled={isSendingOtp}>
                {isSendingOtp ? t("common.loading") : "إرسال كود التحقق"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                عندك حساب بالفعل؟{" "}
                <Link to="/patient/login" className="text-primary hover:underline">
                  سجّل دخول
                </Link>
              </p>
            </form>
          )}

          {/* ===== خطوة 2: كود التحقق ===== */}
          {step === "otp" && (
            <div className="flex flex-col gap-4">
              <p className="text-center text-sm text-muted-foreground">
                اتبعت كود على <span className="font-medium text-foreground">{verifiedMobile}</span>
              </p>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="otp">كود التحقق</Label>
                <div className="relative">
                  <ShieldCheck className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="ps-9 tracking-widest text-center"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>

              <Button
                type="button"
                className="mt-2 w-full"
                disabled={isVerifyingOtp}
                onClick={handleVerifyOtp}
              >
                {isVerifyingOtp ? t("common.loading") : "تأكيد الكود"}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-muted-foreground hover:underline"
                >
                  تغيير الرقم
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className="text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                >
                  {resendCooldown > 0 ? `أعد الإرسال (${resendCooldown})` : "أعد إرسال الكود"}
                </button>
              </div>
            </div>
          )}

          {/* ===== خطوة 3: باقي البيانات ===== */}
          {step === "details" && (
            <form onSubmit={detailsForm.handleSubmit(onSubmitDetails)} className="flex flex-col gap-4">
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-700">
                ✓ تم التحقق من رقم {verifiedMobile}
              </p>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">الاسم</Label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" type="text" className="ps-9" placeholder="اسمك بالكامل" {...detailsForm.register("name")} />
                </div>
                {detailsForm.formState.errors.name && (
                  <p className="text-xs text-danger">{detailsForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="age">السن</Label>
                <Input id="age" type="number" placeholder="السن" {...detailsForm.register("age")} />
                {detailsForm.formState.errors.age && (
                  <p className="text-xs text-danger">{detailsForm.formState.errors.age.message}</p>
                )}
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
                    {...detailsForm.register("password")}
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
                {detailsForm.formState.errors.password && (
                  <p className="text-xs text-danger">{detailsForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="mt-2 w-full" disabled={detailsForm.formState.isSubmitting}>
                {detailsForm.formState.isSubmitting ? t("common.loading") : "إنشاء الحساب"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
