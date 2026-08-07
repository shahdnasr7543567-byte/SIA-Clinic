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

## ✨ Features

### 🔐 Authentication & Security
- **Login & Register** with email/password (mock authentication for now)
- **Protected Routes** – only authenticated users can access dashboards
- **Role-Based Access Control (RBAC)** – Admin, Doctor, Receptionist, Patient
- **Session persistence** using Zustand + localStorage

### 🏥 Reception Module
- **Dashboard** – real‑time stats (total patients, waiting, done, revenue)
- **Add Patient** – form with booking type, priority, visit/exam type, and notes
- **Queue Management** – search, priority icons (Critical 🚨 / Urgent ⚠️), Done / Cancel actions
- **TV Mode** *(optional)* – full‑screen waiting room display

### 👨‍⚕️ Doctor Module
- **Doctor Queue** – patient list sorted by priority with quick stats
- **Prescription Builder** – diagnosis with Text‑to‑Speech, smart drug autocomplete (fuse.js), dosage/duration/unit selectors, quick templates (cold, blood pressure, diabetes)
- **Prescription Preview** – printable medical‑style paper with QR code placeholder
- **Send to Pharmacy** *(optional)* – mock action for future integration

### 👤 Patient Module
- **Patient Search** – search by name or mobile
- **Patient Profile** – avatar, basic info, medical history, chronic diseases & allergies
- **Visit Analytics** – total visits, first/last visit, top diagnosis, empty charts
- **Follow‑up Reminder** – choose tomorrow, week, month, or custom date

### 🤖 AI Agent (Chat Interface – Frontend only)
- **WhatsApp‑like chat UI** – messages, typing indicator, quick replies
- **Mock responses** – keyword‑based knowledge base (prices, doctors, working hours, booking link)
- **Ready for real AI** – structure designed to plug in Claude API later

### 📅 Online Booking (Public)
- **Public route** – `/book`, no login required
- **Patient form** – name, mobile (Egyptian validation), age, exam type, date/time picker, payment method (Cash / Instapay)
- **Success toast** – mock booking confirmation

### 🎨 Modern UI/UX
- **Full RTL support** – Arabic language with `i18next`
- **Dark Mode** – toggle in navbar, persists in `localStorage`
- **Responsive** – mobile‑first, works on tablets and desktops
- **Skeleton loaders & toast notifications** – smooth user feedback
