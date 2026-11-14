# SIA — Strategic Product Plan

**Document date:** August 2026
**Status:** Approved strategic direction for the first phase (MVP)

---

## 1. Project Overview

SIA aims to build a complete healthcare ecosystem serving both healthcare providers and patients — but in a phased, deliberate way to avoid uncontrolled scope expansion.

The ecosystem is built as **two separate products under one brand (SIA)**:

| | Product 1 (Core) | Product 2 (Intermediary) |
|---|---|---|
| **Reference name** | SIA SaaS | SIA Connect (working name) |
| **Audience** | Doctors/clinics with a full subscription | Doctors who just want to be listed and receive bookings |
| **Relationship type** | Provider → SIA (full subscription) | Patient ↔ SIA ↔ Provider (intermediary) |
| **Revenue model** | Monthly/annual subscription | Commission/fee per booking |

---

## 2. Approved Strategic Direction

### Chosen direction: **SaaS first, with a deliberately built parallel intermediary product from the same phase**

Among the four originally proposed options (SaaS Only / Marketplace First / Build Both Simultaneously / SaaS First Then Marketplace Later), the following refined model was settled on:

> **Build SIA SaaS as a full-featured core product for subscribed doctors, while launching a lightweight parallel version (SIA Connect) that lets non-subscribed doctors get listed and receive partially prepaid bookings — serving simultaneously as a customer-acquisition channel for the core SaaS and as an independent revenue source.**

### Why this direction?

- **A clear customer from day one:** the doctor is the primary acquisition focus — no need to chase patients and clinics at the same time from scratch.
- **Solves the cold-start problem:** the intermediary product has a low entry barrier (simple sign-up, not a full subscription), allowing a large doctor base to be built quickly, even before the core SaaS reaches a large subscriber count.
- **Two independent revenue streams:** SaaS subscriptions + booking commissions, rather than one model simply feeding the other.
- **A natural upgrade incentive:** a doctor using SIA Connect who feels the value of incoming bookings has a clear reason to upgrade to the full SaaS in order to manage those bookings professionally (case follow-up, e-prescriptions, reports, etc.).

---

## 3. The Split Between the Two Products (Resolving the "Isolation" Debate)

There was discussion about what "isolation" between the two products should mean, and it was settled as:

**Isolation at the experience, brand, and feature level — not full architectural isolation.**

### SIA SaaS (core product) includes:
- Full patient management
- Appointments and queue management
- E-prescriptions
- Medical records
- Staff management
- Dashboard and analytics
- Notifications
- AI features
- **Every feature in the system, without exception**

### SIA Connect (intermediary product) exclusively includes:
- A simplified doctor account (created and updated by the doctor themselves)
- Patient-facing visibility (name, specialty, location)
- Receiving and approving bookings only
- **Does NOT include:** a patient page, e-prescriptions, any AI feature, or any other administrative feature

> **Important design note:** the gap between "no features" and "all features" is relatively large, which may slow the upgrade decision for some doctors. **Open item for the next phase:** evaluate adding a simple middle tier to make the upgrade path more gradual.

---

## 4. Revenue Model for the Intermediary Product (SIA Connect)

### Commission mechanism
- SIA takes a **percentage/fee from every booking** made through the platform.
- To ensure booking commitment and reduce no-shows, **a booking fee (full or partial consultation value) is paid upfront** at the time of booking.

### Cancellation and Refund Policy
| Case | Decision |
|---|---|
| Doctor cancels the appointment | **Full refund** to the patient |
| Patient is a no-show | The amount is split between **SIA** and the **doctor** (doctor takes the larger share) |

### Open items requiring further decisions before implementation (not yet finalized):
1. **An objective mechanism for determining "patient no-show"** — via an automatic time window after the appointment, dual confirmation (doctor + patient), or full reliance on the doctor's report? **Current risk:** fully relying on the doctor's report without objective verification creates a conflict of interest (the doctor has a financial incentive to report a "no-show" even if it didn't actually happen).
2. **The split ratio for no-show amounts** between SIA and the doctor — fixed, or different from the successful-booking ratio?
3. **A dispute-resolution mechanism** for when the doctor's account differs from the patient's.
4. **The legal/regulatory framework for handling funds** (custody of funds) — requires specialized legal consultation in Egypt regarding:
   - Whether a Payment Service Provider license is needed, or whether contracting with a licensed payment gateway (Paymob, Fawry, etc.) is sufficient
   - Refund policies and escrow accounts
   - This point **must not be built on unverified assumptions** — see Section 6.

### Decision to be finalized at launch:
- Booking/cancellation/refund terms will be clearly presented to the patient before payment, with the patient free to accept or decline before completing any booking.

---

## 5. Booking Verification

- Full reliance on a **WhatsApp bot to confirm actual attendance after the appointment** was ruled out, since it depends on patient cooperation and is not reliable enough to determine commission eligibility.
- **Upfront payment (full or partial) at the time of booking** was adopted as the primary verification mechanism, because it:
  - Does not depend on any party's cooperation after the moment of booking
  - Actually reduces the no-show rate (not just confirms it)
  - Provides a direct revenue source independent of any later verification
- **The bot's (WhatsApp) role remains as a reminder and intent-confirmation tool** (booking confirmation), not as a tool for verifying actual attendance.

---

## 6. Regulatory and Legal Considerations (Unresolved — Requires Specialist Consultation)

Moving to a model that involves **holding patients' money** (even partially) before the service is delivered brings SIA into a broader scope of legal and regulatory responsibility. The following points **do not constitute legal advice** and require review by a specialist:

- Does the activity require a Payment Service Provider license in Egypt, or is contracting with a licensed payment gateway that absorbs this part sufficient?
- What are the obligations related to protecting patients' medical data when later expanding into medical records and prescriptions?
- What licensing requirements apply to platforms connecting patients and healthcare providers in Egypt (if any)?

> **Recommendation:** consult a lawyer specialized in Egyptian digital/health law before launching any actual upfront-payment mechanism — not only before full-scale expansion.

---

## 7. Market Entry Strategy

- **Start geographically in Assiut**, leveraging existing relationships with a local doctor network to accelerate provider acquisition.
- Expansion plan after validating the model locally: Assiut → other governorates → national expansion.
- **Strategic note:** ease of access to doctors in Assiut does not necessarily mean ease of changing patient behavior (searching via an app instead of traditional methods). It's recommended to measure actual patient adoption as a separate metric from doctor adoption.

---

## 8. What Was Deliberately Excluded or Postponed (To Avoid Scope Explosion)

Based on Section 8 of the original evaluation, it was explicitly decided **not** to start with the following at this stage:
- Hospitals, labs, pharmacies, dental and physiotherapy centers (potential future expansion after validating the model with doctors)
- Health insurance
- Telemedicine
- Delivery services
- A middle tier between free and full subscription — postponed pending an actual need assessment after launch

---

## 9. Open Items — Consolidated List Requiring Decisions Before Technical Implementation

| # | Item | Status |
|---|---|---|
| 1 | Objective mechanism for determining patient no-shows | Open |
| 2 | Split ratio for booking amount on patient no-show | Open |
| 3 | Dispute-resolution mechanism between doctor and patient | Open |
| 4 | Legal/regulatory status of holding patients' funds upfront | Open — requires legal consultation |
| 5 | Feasibility of adding a middle tier between SIA Connect and the full SaaS | Postponed for later evaluation |
| 6 | Operational cost details of the WhatsApp bot (WhatsApp Business API) at scale | Open |

---

## 10. Final Decision Summary

**Approved direction:** Build SIA SaaS as a full-featured core product for subscribed doctors, while launching SIA Connect as a lightweight intermediary product based on a commission and partial-upfront-payment model, serving as both a customer-acquisition tool and an independent revenue source, under the unified SIA brand.

**Biggest risk to monitor:** the mechanism for verifying "patient no-shows" and the associated fund distribution — as it is the most exploitable and has the most direct impact on patient trust in the platform.

**Suggested next step:** resolve the open items in Section 9, in parallel with beginning the MVP architecture planning for both products.


Backend Tasks 

مسؤوليتك الأساسية:
بناء الـBackend بالكامل، الـDatabase، الـAPIs، الـAuthentication، وربط الـFrontend والـAI والـPayment بالـBackend.

━━━━━━━━━━━━━━━━━━━━━━

Backend Foundation
━━━━━━━━━━━━━━━━━━━━━━
إنشاء مشروع Backend باستخدام Express + TypeScript.
إعداد PostgreSQL Database.
إعداد Drizzle ORM.
إنشاء Database Connection.
إعداد Environment Variables.
تنظيم Backend Project Structure.
إنشاء Health Check Endpoint.
توحيد شكل الـAPI Responses.
توحيد شكل الـAPI Error Responses.
توحيد الـID Format بين Frontend وBackend.
تجهيز API Documentation / OpenAPI إذا تم اعتمادها من الفريق.

━━━━━━━━━━━━━━━━━━━━━━
2. Database
━━━━━━━━━━━━━━━━━━━━━━

تصميم ERD للـEntities الأساسية.
تحديد العلاقات بين الـEntities.
إنشاء Database Schema.
إنشاء Drizzle Migrations.
تجهيز Seed/Test Data عند الحاجة.

الـEntities الأساسية تشمل:

Clinics
Users
Patients
Prescriptions
Drugs
Queue
Bookings
Notifications
AI Conversations

━━━━━━━━━━━━━━━━━━━━━━
2A. Multi-tenant Architecture
━━━━━━━━━━━━━━━━━━━━━━

MT1. إنشاء جدول Clinics (اسم العيادة، خطة الاشتراك، تاريخ الاشتراك).
MT2. إضافة عمود clinic_id لكل الجداول: Users, Patients, Prescriptions, Queue, Bookings, Notifications, AI Conversations.
MT3. إنشاء Middleware مركزي يفلتر كل استعلام تلقائيًا بـ clinic_id (بدل الاعتماد على كل Endpoint لوحده).
MT4. إنشاء Public API لتسجيل عيادة جديدة (Clinic Onboarding).
MT5. التأكد إن كل الـAPIs الموجودة (Patients, Queue, Prescriptions...) بترجع بيانات العيادة الحالية بس، مش كل العيادات.

━━━━━━━━━━━━━━━━━━━━━━
3. Authentication & Users
━━━━━━━━━━━━━━━━━━━━━━

إنشاء User Model.
تنفيذ Register.
تنفيذ Login.
تنفيذ Logout.
تنفيذ Forgot Password.
تنفيذ JWT Authentication.
تنفيذ Authentication Middleware.
تنفيذ Role-Based Authorization.
دعم Roles:
Admin
Doctor
Receptionist

الـFrontend الحالي يستخدم Bearer JWT Authentication.

━━━━━━━━━━━━━━━━━━━━━━
4. Patients
━━━━━━━━━━━━━━━━━━━━━━

إنشاء Patient Model.
إنشاء Patient APIs.
تنفيذ Patient Search.
تنفيذ Get Patient.
تنفيذ Get Patient Medical Information.
حفظ Allergies.
حفظ Chronic Diseases.
تنفيذ Patient Statistics.
تنفيذ Prescription History.
تنفيذ Patient Reminders.
Get Patient Reminders.
Create Patient Reminder.

━━━━━━━━━━━━━━━━━━━━━━
5. Reception
━━━━━━━━━━━━━━━━━━━━━━

تنفيذ Reception Dashboard APIs.
تنفيذ Reception Statistics.
تنفيذ Add Patient.
تنفيذ Get Queue.
تنفيذ Update Queue Status.

━━━━━━━━━━━━━━━━━━━━━━
6. Queue Management
━━━━━━━━━━━━━━━━━━━━━━

إنشاء Queue Management System.
دعم Queue Status:
Waiting
Done
Cancelled
تنفيذ Daily Queue Capacity.
التحقق من Capacity قبل إضافة الحجز.
منع الحجز عند امتلاء اليوم.
اقتراح أقرب يوم متاح عند امتلاء اليوم المطلوب.

━━━━━━━━━━━━━━━━━━━━━━
6A. Virtual Queue via WhatsApp
━━━━━━━━━━━━━━━━━━━━━━

VQ1. إرسال Event للـAI Agent كل ما يتغيّر ترتيب الطابور (إضافة/خروج مريض).
VQ2. تجهيز بيانات المريض المطلوبة (الاسم، رقم الموبايل، الترتيب الحالي) عشان الـAI يقدر يبعت تحديثات واتساب تلقائية.

━━━━━━━━━━━━━━━━━━━━━━
7. Doctor
━━━━━━━━━━━━━━━━━━━━━━

تنفيذ Doctor Dashboard APIs.
تنفيذ Doctor Statistics.
تنفيذ Doctor Queue.
تنفيذ Create Prescription.
تنفيذ Get Prescription.
حفظ Diagnosis.
حفظ Prescription Drugs.
حفظ Dosage لكل دواء.
حفظ Duration لكل دواء.
حفظ Notes.
إنشاء Unique Prescription ID.
تجهيز Prescription ID / URL لاستخدامه في QR.

━━━━━━━━━━━━━━━━━━━━━━
8. Drugs
━━━━━━━━━━━━━━━━━━━━━━

إنشاء Drug Model.
تخزين بيانات الأدوية.
دعم:
Drug ID
Name
Generic Name
Form
تنفيذ Drug Search / Lookup.
توفير Drug Data المطلوبة للـPrescription والـAI.

━━━━━━━━━━━━━━━━━━━━━━
9. Online Booking
━━━━━━━━━━━━━━━━━━━━━━

إنشاء Public Booking API.
تنفيذ POST /bookings.
السماح للمريض بالحجز بدون Login.
استقبال:
Patient Name
Mobile
Age
Exam Type
Date
Time
Payment Method
حفظ بيانات الحجز.
ربط Booking بالـQueue / Appointment حسب التاريخ.
تطبيق Daily Capacity.
اقتراح أقرب موعد متاح عند امتلاء اليوم.

━━━━━━━━━━━━━━━━━━━━━━
10. Payment / InstaPay
━━━━━━━━━━━━━━━━━━━━━━

تجهيز InstaPay Integration.
إنشاء Payment Request.
التعامل مع Payment Status.
تنفيذ Payment Webhook.
تحديث Booking Status بعد نجاح الدفع.
التحقق من صحة الـPayment Webhook.

ملاحظة:
التكامل الحقيقي مع InstaPay يعتمد على توفر Merchant Account / API Credentials.

━━━━━━━━━━━━━━━━━━━━━━
11. AI Backend Integration
━━━━━━━━━━━━━━━━━━━━━━

إنشاء POST /ai/chat.
استقبال رسائل الـAI Agent.
ربط Backend بالـAI.
تنفيذ Patient Lookup by Phone.
توفير بيانات الأطباء للـAI.
توفير بيانات المواعيد للـAI.
توفير بيانات الأسعار للـAI.
توفير البيانات التي يحتاجها AI Agent من النظام.
إنشاء Conversation Storage.
إنشاء Conversation ID.
حفظ Messages وResponses وTimestamps.
تنفيذ WhatsApp Webhook إذا كان ضمن الـRelease.
ربط WhatsApp بالـAI Agent.

━━━━━━━━━━━━━━━━━━━━━━
12. Notifications
━━━━━━━━━━━━━━━━━━━━━━

إنشاء Notification Model.
تنفيذ Notifications API.
إنشاء Notification.
Get Notifications.
Read / Unread Notifications.
ربط Notifications بالمستخدم المناسب.

━━━━━━━━━━━━━━━━━━━━━━
13. Validation & Error Handling
━━━━━━━━━━━━━━━━━━━━━━

إضافة Request Validation لجميع الـAPIs.
التعامل مع Invalid Input.
التعامل مع Unauthorized Requests.
التعامل مع Forbidden Requests.
التعامل مع Not Found.
التعامل مع Duplicate Data.
توحيد Error Messages / Error Structure.

━━━━━━━━━━━━━━━━━━━━━━
14. Integration
━━━━━━━━━━━━━━━━━━━━━━

ربط Backend بالـFrontend.
استبدال الـMock APIs بالـReal APIs.
ربط Authentication بالـFrontend.
ربط Patient APIs بالـFrontend.
ربط Reception APIs بالـFrontend.
ربط Queue بالـFrontend.
ربط Prescription بالـFrontend.
ربط Booking بالـFrontend.
ربط QR بالـPrescription ID الحقيقي.
ربط Backend بالـAI.
ربط Backend بالـPayment.

━━━━━━━━━━━━━━━━━━━━━━
15. Testing
━━━━━━━━━━━━━━━━━━━━━━

اختبار Authentication.
اختبار Authorization.
اختبار Patient APIs.
اختبار Queue APIs.
اختبار Prescription APIs.
اختبار Booking APIs.
اختبار Payment Flow.
اختبار AI Integration.
اختبار Validation.
اختبار Error Handling.
اختبار Frontend ↔ Backend Integration.
اختبار Backend ↔ AI Integration.
اختبار Full Clinic Flow:

Booking
↓
Reception
↓
Queue
↓
Doctor
↓
Prescription
↓
QR


AI Tasks — Person 1
Conversational AI Agent

مسؤوليتك الأساسية:
بناء الـAI Agent المسؤول عن التواصل مع المريض وفهم كلامه ومساعدته في خدمات العيادة.

━━━━━━━━━━━━━━━━━━━━━━

AI Agent Foundation
━━━━━━━━━━━━━━━━━━━━━━
إعداد Claude API.
إنشاء الـConversational AI Agent.
تجهيز الـSystem Prompt الخاص بالـAgent.
استقبال رسالة المريض.
فهم الرسالة وتحليل محتواها.
توليد Response مناسب للمريض.
التعامل مع Conversation Context.
الحفاظ على الـConversation History.

━━━━━━━━━━━━━━━━━━━━━━
2. Intent Recognition
━━━━━━━━━━━━━━━━━━━━━━

تحديد Intent المريض من كلامه.
دعم الـIntents الأساسية مثل:
حجز موعد.
الاستفسار عن الأسعار.
الاستفسار عن الأطباء.
الاستفسار عن المواعيد.
الاستفسار عن خدمات العيادة.
سؤال عام.
شكوى.
طلب مساعدة.
التعامل مع أكثر من Intent داخل نفس المحادثة.
تحديد الـIntent المناسب قبل تنفيذ أي Action.

━━━━━━━━━━━━━━━━━━━━━━
3. Information / Entity Extraction
━━━━━━━━━━━━━━━━━━━━━━

استخراج اسم المريض.
استخراج رقم الهاتف.
استخراج التاريخ.
استخراج الوقت.
استخراج نوع الكشف.
استخراج بيانات الحجز.
استخراج الأعراض المذكورة من المريض.
اكتشاف البيانات الناقصة.
سؤال المريض عن البيانات الناقصة.
التأكد من صحة البيانات قبل إرسالها للـBackend.

━━━━━━━━━━━━━━━━━━━━━━
4. Patient Context
━━━━━━━━━━━━━━━━━━━━━━

التعامل مع بيانات المريض القادمة من الـBackend.
تنفيذ Patient Lookup باستخدام رقم الهاتف.
استخدام بيانات المريض داخل الـConversation عند الحاجة.
الحفاظ على Context الخاص بالمريض أثناء المحادثة.
عدم طلب بيانات موجودة بالفعل بدون داعي.

━━━━━━━━━━━━━━━━━━━━━━
5. Sentiment Analysis
━━━━━━━━━━━━━━━━━━━━━━

تحليل Sentiment المريض أثناء المحادثة.
تحديد حالة المريض مثل:
Normal
Concerned
Urgent
استخدام نتيجة الـSentiment لتحسين طريقة الرد.
اكتشاف الحالات التي تحتاج تدخل بشري.

━━━━━━━━━━━━━━━━━━━━━━
6. Symptom Risk Classification
━━━━━━━━━━━━━━━━━━━━━━

تحليل الأعراض التي يذكرها المريض بشكل أولي.
تصنيف مستوى الخطورة.
تحديد الحالات التي تحتاج Priority.
تنبيه المريض/الفريق عند وجود حالة تستدعي اهتمامًا.
عدم تقديم تشخيص طبي نهائي للمريض.

━━━━━━━━━━━━━━━━━━━━━━
7. Knowledge Base
━━━━━━━━━━━━━━━━━━━━━━

إنشاء Knowledge Base للـAgent.
إضافة معلومات العيادة.
إضافة أسعار الخدمات.
إضافة بيانات الأطباء.
إضافة بيانات المواعيد.
إضافة الخدمات المتاحة.
تنظيم المعلومات التي يعتمد عليها الـAgent.
التأكد إن الـAgent لا يخترع معلومات غير موجودة في الـKnowledge Base.

━━━━━━━━━━━━━━━━━━━━━━
8. Appointment Assistant
━━━━━━━━━━━━━━━━━━━━━━

مساعدة المريض في حجز موعد.
جمع بيانات الحجز من المحادثة.
التأكد من اكتمال بيانات الحجز.
التواصل مع الـBackend لمعرفة الـAvailability.
عرض المواعيد المتاحة للمريض.
اقتراح موعد مناسب.
التعامل مع اليوم الممتلئ.
اقتراح أقرب موعد متاح.
تأكيد بيانات الحجز قبل تنفيذ الحجز.

━━━━━━━━━━━━━━━━━━━━━━
9. Human Handoff
━━━━━━━━━━━━━━━━━━━━━━

تحديد الحالات التي تحتاج Human Agent.
تنفيذ Human Handoff.
إرسال سبب التحويل للموظف.
حفظ حالة الـConversation.
منع الـAI من الاستمرار في إعطاء إجابات غير مناسبة بعد التحويل.

━━━━━━━━━━━━━━━━━━━━━━
10. Conversation Storage
━━━━━━━━━━━━━━━━━━━━━━

إنشاء Conversation ID.
حفظ Conversation History.
حفظ Messages.
حفظ AI Responses.
حفظ Timestamps.
استرجاع Conversation Context عند الحاجة.

━━━━━━━━━━━━━━━━━━━━━━
11. Backend Integration
━━━━━━━━━━━━━━━━━━━━━━

الربط مع POST /ai/chat.
استقبال Messages من الـBackend.
إرسال الـAI Response للـBackend.
استخدام Patient API عند الحاجة.
استخدام Appointment/Booking APIs.
استخدام Doctors API.
استخدام Prices/Services API.

━━━━━━━━━━━━━━━━━━━━━━
12. Frontend Integration
━━━━━━━━━━━━━━━━━━━━━━

ربط الـAI بالـChat الموجود في الـFrontend.
استبدال الـMock Responses بالـReal AI Responses.
اختبار الـQuick Replies.
اختبار:
Prices
Doctors
Appointments
Booking
التأكد إن الـChat يعمل بشكل صحيح من أول رسالة لحد نهاية الـConversation.

━━━━━━━━━━━━━━━━━━━━━━
13. WhatsApp
━━━━━━━━━━━━━━━━━━━━━━

تجهيز الـAgent للعمل مع WhatsApp.
استقبال WhatsApp Messages من الـBackend.
إرسال AI Responses.
الحفاظ على Conversation Context.
اختبار WhatsApp Conversation Flow.
رسائل تلقائية للطابور الافتراضي (Virtual Queue) — عند ترتيب المريض، وقبل دوره باتنين، وعند وصول الدور.

━━━━━━━━━━━━━━━━━━━━━━
14. AI Reliability
━━━━━━━━━━━━━━━━━━━━━━

التعامل مع Claude API Errors.
التعامل مع Timeout.
التعامل مع Invalid Responses.
إضافة Fallback عند فشل الـAI.
منع الـAI من إعطاء معلومات غير مؤكدة.
اختبار الـAgent على سيناريوهات مختلفة.
تحسين جودة الـResponses.

━━━━━━━━━━━━━━━━━━━━━━

AI Tasks — Person 2
Clinical AI + Voice + Predictive Analytics

مسؤوليتك الأساسية:
بناء الـAI Features الخاصة بالطبيب والـClinical Intelligence، بالإضافة إلى Voice والـDrug Intelligence والـPredictive Analytics.

━━━━━━━━━━━━━━━━━━━━━━

Drug Interaction
━━━━━━━━━━━━━━━━━━━━━━
اختيار مصدر بيانات مناسب للـDrug Interactions.
دراسة الـDrug Interaction API / Database.
إنشاء Drug Interaction Engine.
استقبال قائمة الأدوية.
تحليل التداخلات بين الأدوية.
تحديد وجود Drug Interaction.
تحديد مستوى الخطورة.
تحديد الأدوية المتعارضة.
إنشاء Explanation واضح للـInteraction.
إرجاع النتيجة للـBackend.
ربط الـDrug Interaction بالـPrescription Flow.
اختبار الـEngine على حالات مختلفة.

━━━━━━━━━━━━━━━━━━━━━━
2. Allergy Checking
━━━━━━━━━━━━━━━━━━━━━━

إنشاء Allergy Checking Module.
استقبال Allergies الخاصة بالمريض.
استقبال الأدوية الموجودة في الـPrescription.
مقارنة الأدوية مع Patient Allergies.
اكتشاف Allergy Conflict.
تحديد مستوى التحذير.
إرسال Alert للطبيب.
ربط الـAllergy Checking بالـPrescription Flow.

━━━━━━━━━━━━━━━━━━━━━━
3. Drug Explanation
━━━━━━━━━━━━━━━━━━━━━━

إنشاء Drug Explanation Module.
استقبال اسم الدواء.
إنشاء شرح مبسط عن الدواء.
توضيح المعلومات الأساسية الخاصة به.
جعل الشرح مناسبًا للمريض وغير متخصص.
التأكد من عدم تقديم معلومات غير مؤكدة.
عدم تحويل الـAI إلى مصدر وصفة طبية مستقلة.

━━━━━━━━━━━━━━━━━━━━━━
4. Speech-to-Text
━━━━━━━━━━━━━━━━━━━━━━

البحث عن أفضل Speech-to-Text Solution.
مقارنة Accuracy.
مقارنة Arabic Language Support.
مقارنة Cost.
اختيار الحل المناسب.
تنفيذ Speech-to-Text.
استقبال Audio.
تحويل Audio إلى Text.
التعامل مع اللغة العربية.
التعامل مع أخطاء الـTranscription.
إرسال الـText للـAI/Clinical System.
اختبار Speech-to-Text على حالات مختلفة.

━━━━━━━━━━━━━━━━━━━━━━
5. AI Diagnosis Assistant
━━━━━━━━━━━━━━━━━━━━━━

تحديد البيانات المطلوبة للـDiagnosis Assistant.
استقبال Patient Information.
استقبال Symptoms.
استقبال Medical History عند الحاجة.
تحليل البيانات باستخدام الـAI.
إنشاء احتمالات/اقتراحات للطبيب.
توفير Supporting Information.
عرض النتيجة بطريقة تساعد الطبيب.
التأكد إن الـAI لا يقدم نفسه كبديل للطبيب.
عدم اعتبار الـOutput تشخيصًا طبيًا نهائيًا.
اختبار الـAssistant على حالات مختلفة.

━━━━━━━━━━━━━━━━━━━━━━
6. Predictive Analytics
━━━━━━━━━━━━━━━━━━━━━━

تحديد الـUse Cases الخاصة بالـPredictive Analytics.
تحديد البيانات المطلوبة.
تجهيز Data Pipeline.
معالجة البيانات.
تحليل Patient Data.
اكتشاف Patterns.
إنشاء Predictions / Insights.
اختبار النتائج.
تقييم Accuracy.
تجهيز النتائج للاستخدام داخل النظام.

━━━━━━━━━━━━━━━━━━━━━━
7. AI Infrastructure
━━━━━━━━━━━━━━━━━━━━━━

إعداد Claude API عند الحاجة.
حماية AI API Integration.
تطبيق Rate Limiting.
تطبيق Caching عند الحاجة.
مراقبة AI Performance.
متابعة API Usage.
التعامل مع API Failures.
التعامل مع Timeouts.
تسجيل AI Errors.
تحسين Performance.

━━━━━━━━━━━━━━━━━━━━━━
8. Backend Integration
━━━━━━━━━━━━━━━━━━━━━━

ربط Drug Interaction Engine بالـBackend.
ربط Allergy Checking بالـBackend.
ربط Drug Explanation بالـBackend.
ربط Diagnosis Assistant بالـBackend.
ربط Speech-to-Text بالـBackend.
ربط Predictive Analytics بالـBackend.
تجهيز APIs/Services المطلوبة لكل Feature.

━━━━━━━━━━━━━━━━━━━━━━
9. Frontend Integration
━━━━━━━━━━━━━━━━━━━━━━

ربط Drug Interaction بالـFrontend.
ربط Allergy Alerts بصفحة الطبيب.
ربط Drug Explanation بالـFrontend.
ربط Diagnosis Assistant بصفحة الطبيب.
ربط Voice Feature بالـFrontend.
استبدال الـMock AI Responses بالـReal AI Results.
اختبار الـAI Features مع الـDoctor Dashboard.

━━━━━━━━━━━━━━━━━━━━━━
10. Testing
━━━━━━━━━━━━━━━━━━━━━━

اختبار Drug Interaction.
اختبار Allergy Checking.
اختبار Drug Explanation.
اختبار Speech-to-Text.
اختبار Diagnosis Assistant.
اختبار Predictive Analytics.
اختبار AI API Integration.
اختبار Error Handling.
اختبار AI Performance.
اختبار النتائج على سيناريوهات مختلفة.

━━━━━━━━━━━━━━━━━━━━━━

Cyber Security Tasks 

مسؤوليتك الأساسية:
تأمين المشروع بالكامل من ناحية الـAuthentication والـAuthorization والـAPIs والبيانات الحساسة والـAI والـPayments، مع مراجعة الـSecurity قبل الـRelease.

━━━━━━━━━━━━━━━━━━━━━━

Authentication Security
━━━━━━━━━━━━━━━━━━━━━━
مراجعة نظام الـLogin والـAuthentication.
مراجعة طريقة استخدام وحماية JWT.
التأكد من حماية الـAuthentication Tokens.
مراجعة Password Hashing.
مراجعة Password Policy.
اختبار Authentication ضد محاولات الـBypass.
التأكد من حماية بيانات الـLogin.
مراجعة Logout وآلية إنهاء الـSession/Token حسب الـImplementation.
━━━━━━━━━━━━━━━━━━━━━━
2. Authorization & RBAC
━━━━━━━━━━━━━━━━━━━━━━

تحديد الـPermissions لكل Role.
مراجعة صلاحيات Admin.
مراجعة صلاحيات Doctor.
مراجعة صلاحيات Receptionist.
التأكد إن كل User يقدر يوصل فقط للبيانات المسموح له بها.
اختبار Unauthorized Access.
اختبار Privilege Escalation.
التأكد إن المستخدم لا يستطيع الوصول لبيانات مستخدم/Role آخر.
━━━━━━━━━━━━━━━━━━━━━━
2A. Multi-tenant Isolation
━━━━━━━━━━━━━━━━━━━━━━

MT-S1. اختبار إن عيادة (A) مستحيل توصل لبيانات عيادة (B) تحت أي ظرف — Patients, Prescriptions, Queue, Bookings.
MT-S2. مراجعة إن الـMiddleware الخاص بفلترة clinic_id مُطبّق على كل Endpoint من غير أي استثناء.
MT-S3. اختبار Broken Access Control على مستوى الـTenant نفسه (مش بس على مستوى الـRole زي Doctor/Admin).

━━━━━━━━━━━━━━━━━━━━━━
3. API Security
━━━━━━━━━━━━━━━━━━━━━━

مراجعة جميع الـBackend APIs.
التأكد إن الـPrivate APIs محمية بـAuthentication.
مراجعة Authorization لكل Endpoint.
مراجعة Rate Limiting.
مراجعة CORS Configuration.
مراجعة HTTP Security Headers.
استخدام/مراجعة Helmet.
مراجعة Input Validation.
حماية الـAPIs من SQL Injection.
حماية الـAPIs من Common Web Attacks.
مراجعة Error Responses.
التأكد إن الـErrors لا تكشف معلومات حساسة.
مراجعة API Request/Response Security.
━━━━━━━━━━━━━━━━━━━━━━
4. Sensitive Data Protection
━━━━━━━━━━━━━━━━━━━━━━

تحديد البيانات الحساسة الموجودة في النظام.
تحديد البيانات التي تحتاج Encryption.
مراجعة Encryption للبيانات الحساسة.
حماية Patient Personal Data.
حماية Patient Medical Data.
حماية Allergies وChronic Diseases.
حماية Prescription Data.
حماية Authentication Data.
حماية AI Conversation Data.
التأكد من عدم تخزين Sensitive Data بشكل غير آمن.
التأكد إن الـSecrets والـAPI Keys غير موجودة داخل GitHub.
━━━━━━━━━━━━━━━━━━━━━━
5. Database Security
━━━━━━━━━━━━━━━━━━━━━━

مراجعة Database Access Control.
مراجعة صلاحيات الوصول للـDatabase.
حماية Database Credentials.
التأكد من حماية Database Connection.
مراجعة الـDatabase Queries من ناحية Security.
التأكد من منع SQL Injection.
مراجعة Database Backup Security.
تشفير الـDatabase Backups.
حماية Backup Files.
اختبار Backup Restore.
━━━━━━━━━━━━━━━━━━━━━━
6. Audit Logs
━━━━━━━━━━━━━━━━━━━━━━

تصميم/مراجعة نظام Audit Logs.
تسجيل المستخدم الذي قام بالعملية.
تسجيل العملية التي تمت.
تسجيل وقت العملية.
تسجيل العمليات الحساسة.
تسجيل Login Attempts.
تسجيل تغييرات بيانات المرضى.
تسجيل عمليات Prescription.
تسجيل تغييرات الـPermissions.
تسجيل العمليات المتعلقة بالـPayment.
التأكد من حماية الـAudit Logs من التعديل أو الحذف غير المصرح به.
━━━━━━━━━━━━━━━━━━━━━━
7. AI Security
━━━━━━━━━━━━━━━━━━━━━━

مراجعة Security الخاصة بالـAI Integration.
حماية Claude/API Keys.
مراجعة /ai/chat Security.
تطبيق/مراجعة Rate Limiting على AI APIs.
مراجعة البيانات التي يتم إرسالها إلى الـAI.
تقليل إرسال Patient Data للـAI قدر الإمكان.
منع تسريب Sensitive Patient Information.
اختبار Prompt Injection.
مراجعة AI Inputs.
مراجعة AI Outputs.
التأكد إن AI Output لا يتم استخدامه بطريقة غير آمنة داخل النظام.
مراجعة AI Error Handling.
مراجعة AI API Failure Handling.
━━━━━━━━━━━━━━━━━━━━━━
8. WhatsApp & Webhooks Security
━━━━━━━━━━━━━━━━━━━━━━

مراجعة Security الخاصة بـWhatsApp Webhook.
التأكد من التحقق من مصدر الـWebhook.
منع Fake Webhook Requests.
حماية Webhook Endpoints.
منع Replay/Repeated Requests عند الحاجة.
حماية بيانات الـWhatsApp Conversations.
مراجعة الـWebhook Authentication/Verification.
━━━━━━━━━━━━━━━━━━━━━━
9. Payment Security
━━━━━━━━━━━━━━━━━━━━━━

مراجعة InstaPay Integration من ناحية Security.
حماية Payment APIs.
حماية Payment Credentials.
التأكد من عدم تخزين Payment Secrets بشكل غير آمن.
مراجعة Payment Webhook.
التحقق من صحة Payment Webhook Requests.
منع Fake Payment Confirmation.
حماية Payment Status Updates.
اختبار Payment Flow من ناحية Security.
━━━━━━━━━━━━━━━━━━━━━━
10. Frontend Security
━━━━━━━━━━━━━━━━━━━━━━

مراجعة طريقة تخزين الـTokens في الـFrontend.
مراجعة حماية الـRoutes.
مراجعة Role-Based UI Access.
التأكد إن إخفاء الـUI لا يعتبر Security Control لوحده.
التأكد إن الـBackend هو المسؤول النهائي عن Authorization.
مراجعة التعامل مع User Input.
مراجعة XSS Risks.
مراجعة Sensitive Data الموجودة في الـFrontend.
التأكد إن الـAPI Keys والـSecrets مش موجودة في Frontend Code.
مراجعة Production Build Security.
━━━━━━━━━━━━━━━━━━━━━━
11. Security Testing
━━━━━━━━━━━━━━━━━━━━━━

عمل Vulnerability Assessment.
اختبار Authentication.
اختبار Authorization.
اختبار RBAC.
اختبار API Security.
اختبار Input Validation.
اختبار SQL Injection.
اختبار XSS.
اختبار Rate Limiting.
اختبار Sensitive Data Exposure.
اختبار Security Misconfiguration.
اختبار Broken Access Control.
اختبار Privilege Escalation.
اختبار Webhook Security.
اختبار Payment Security.
اختبار AI Security.
━━━━━━━━━━━━━━━━━━━━━━
12. Penetration Testing
━━━━━━━━━━━━━━━━━━━━━━

تجهيز خطة Penetration Testing.
اختبار الـBackend APIs.
اختبار Authentication Endpoints.
اختبار Authorization.
اختبار Patient Endpoints.
اختبار Prescription Endpoints.
اختبار Booking Endpoints.
اختبار Payment Endpoints.
اختبار AI Endpoints.
اختبار Webhooks.
توثيق الـVulnerabilities المكتشفة.
تحديد Severity لكل Vulnerability.
إعطاء توصيات للإصلاح.
إعادة اختبار الـSystem بعد إصلاح الـVulnerabilities.
━━━━━━━━━━━━━━━━━━━━━━
13. Data Protection & Compliance
━━━━━━━━━━━━━━━━━━━━━━

تحديد متطلبات حماية البيانات المناسبة للـProject.
مراجعة متطلبات حماية بيانات المرضى.
مراجعة متطلبات السوق المحلي المستهدف.
تحديد هل GDPR مطلوب حسب نطاق المشروع.
تحديد هل HIPAA مطلوب حسب السوق المستهدف.
توثيق الـSecurity Requirements.
توثيق الـData Protection Requirements.
توثيق الـSecurity Decisions التي يتفق عليها الفريق.
━━━━━━━━━━━━━━━━━━━━━━
14. Security Awareness
━━━━━━━━━━━━━━━━━━━━━━

توعية الفريق بأساسيات Secure Coding.
توضيح طريقة التعامل مع API Keys.
توضيح طريقة التعامل مع Passwords.
توضيح طريقة التعامل مع JWT/Tokens.
التأكد من عدم رفع Secrets على GitHub.
توعية الفريق بمخاطر Phishing.
مراجعة الـEnvironment Variables والـSecrets Management.
━━━━━━━━━━━━━━━━━━━━━━
15. Final Security Review
━━━━━━━━━━━━━━━━━━━━━━

مراجعة الـBackend قبل الـIntegration.
مراجعة الـFrontend Security.
مراجعة الـAI Security.
مراجعة الـDatabase Security.
مراجعة الـPayment Security.
مراجعة الـWebhook Security.
مراجعة Production Configuration.
التأكد من تطبيق الـSecurity Requirements.
عمل Security Checklist قبل الـRelease.
إجراء Final Security Review قبل إطلاق المشروع.

