# SIA — نظام إدارة عيادات ذكي (Frontend)

## تشغيل المشروع محليًا

```bash
npm install
npm run dev
```

المشروع بيفتح على `http://localhost:5173`.

> ملاحظة Windows: الباكدجات `@esbuild/win32-x64` و `@rollup/rollup-win32-x64-msvc`
> متسجلة في `optionalDependencies`، فـ npm هيثبتهم تلقائيًا لو شغال على Windows
> ومش هيحاول يثبتهم لو شغال على Linux/Mac (عشان كده هما optional مش dependencies عادية).

## الحالة الحالية (بعد الخطوة 1 + 2)

- ✅ Vite + React 18 + TypeScript
- ✅ Tailwind CSS مربوط بألوان الهوية البصرية (Teal / Dark Blue / Emerald...)
- ✅ Shadcn/ui جاهز (`components.json` + أول 4 مكونات: Button, Card, Input, Label)
- ✅ i18next مع دعم عربي/إنجليزي و RTL تلقائي
- ✅ React Query + Zustand مركبين في `main.tsx`
- ✅ صفحات Login / Register شغالة بالكامل (React Hook Form + Zod)
- ✅ Protected Routes مع Role-Based Access Control
- ✅ Sidebar + AppLayout للصفحات المحمية
- ✅ راوت `/book` عام بدون تسجيل دخول
- ⏳ باقي الموديولات (استقبال، طبيب، مريض، AI Agent، صيدلية) — كل واحدة هتيجي في خطوتها

## بنية المجلدات

```
src/
  components/
    ui/        → مكونات shadcn الأساسية (button, card, input, label)
    layout/    → Sidebar, AppLayout
    shared/    → مكونات مشتركة زي EmptyState
  pages/
    auth/      → Login, Register
    booking/   → صفحة الحجز العامة
    reception/ doctor/ patient/ ai-agent/  → هتتملى في خطواتهم
  store/       → Zustand stores (authStore)
  routes/      → ProtectedRoute
  i18n/        → إعداد اللغات + ملفات الترجمة
  lib/         → utils (cn helper)
  types/       → TypeScript types
```

## طريقة العمل (Login تجريبي)

لغاية ما الـ backend يترّبط، دخول أي إيميل + باسورد 6 أحرف فأكتر بيعمل session
تجريبي في Zustand (بدون أي بيانات مرضى أو أطباء وهمية) عشان تقدر تجرب الـ Protected
Routes والـ Sidebar فورًا.
