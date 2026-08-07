# 🏥 SIA (سِيَا) - نظام إدارة عيادات ذكي

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.19-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

> **Live Demo**: (سيتم إضافته قريباً)

نظام إدارة عيادات متكامل (واجهة أمامية) مبني بـ **React 18** و **TypeScript**، مع تصميم عصري وسهل الاستخدام.  
يهدف النظام إلى تسهيل إدارة المرضى، المواعيد، الروشتات، وقائمة الانتظار في العيادات الطبية.

---

## 🛠️ Tech Stack

### Frontend Technologies

| التقنية | الإصدار |
|---------|---------|
| **React** | 18.3.1 |
| **TypeScript** | 5.9.3 |
| **Vite** | 5.4.21 |
| **Tailwind CSS** | 3.4.19 |
| **Shadcn/ui** | (أحدث إصدار) |
| **JavaScript** | ES6+ |

### State Management & Data Fetching

| التقنية | الإصدار |
|---------|---------|
| **Zustand** | 4.5.7 |
| **React Query** | 5.56.2 |
| **Axios** | 1.7.7 |

### Forms & Validation

| التقنية | الإصدار |
|---------|---------|
| **React Hook Form** | 7.53.0 |
| **Zod** | 3.23.8 |

### Development Tools

| التقنية | الإصدار |
|---------|---------|
| **Node.js** | v20+ |
| **pnpm** | (أحدث إصدار) |
| **ESLint** | 9.10.0 |
| **PostCSS** | 8.4.45 |
| **Git** | - |

### Deployment & Hosting

| التقنية | الإصدار |
|---------|---------|
| **Vercel** | (للنشر) |
| **GitHub** | (للكود) |

---

## ✨ Features

### 🔐 Authentication & Security
- تسجيل دخول وإشتراك (Login/Register)
- حماية الصفحات (Protected Routes)
- صلاحيات حسب الدور (RBAC): Admin, Doctor, Receptionist, Patient
- Zustand لإدارة الجلسة

### 👨‍⚕️ Doctor Dashboard
- قائمة انتظار المرضى
- كتابة الروشتات (Prescription Builder)
- البحث عن الأدوية (Autocomplete)
- معاينة الروشتة مع QR Code
- Text-to-Speech (قراءة التشخيص)

### 🏥 Receptionist Dashboard
- لوحة تحكم بإحصائيات العيادة
- إضافة مرضى جدد
- إدارة قائمة الانتظار
- شاشة عرض (TV Mode) - اختياري

### 👤 Patient Module
- ملف المريض الشخصي
- تاريخ الروشتات
- تحليلات الزيارات
- تذكير المتابعة

### 🤖 AI Agent (واجهة)
- واجهة محادثة (Chat Interface)
- أزرار سريعة (Quick Replies)
- ردود وهمية مؤقتة (Mock Responses)

### 📱 Modern UI/UX
- تصميم متجاوب (Responsive) (موبايل، تابلت، ديسكتوب)
- دعم RTL (اللغة العربية)
- Dark Mode
- Skeleton Loaders
- Toast Notifications

---

## 🚀 تشغيل المشروع محلياً

### المتطلبات (Prerequisites)
- Node.js v20 أو أعلى
- pnpm

### خطوات التشغيل

```bash
# 1. استنساخ المشروع
git clone https://github.com/shahdnasr7543567-byte/SIA-Clinic.git
cd SIA-Clinic

# 2. تثبيت الحزم
pnpm install

# 3. تشغيل الموقع
pnpm run dev
