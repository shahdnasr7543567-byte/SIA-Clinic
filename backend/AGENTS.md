# SIA Clinic Backend — Sub Agents Plan & Specifications

> **Target Stack:** Node.js + Express + TypeScript + MongoDB (Mongoose) + JWT Auth + Multi-Tenancy  
> **Repository Location:** `backend/`  
> **Active Git Branch:** `backend-dev`  
> **Database:** MongoDB (replacing legacy PostgreSQL/Drizzle plan)

---

## 1. Project & Architectural Overview

The backend for **SIA Clinic** powers the clinic management system (SaaS) and provides public endpoints for online booking and prescription QR verification.

### Core Architectural Decisions
1. **Multi-Tenancy (Shared Database, Tenant Scoping)**:
   - Every collection (except global system drugs or platform super-admins) includes `clinicId: mongoose.Schema.Types.ObjectId`.
   - Central Express middleware parses `clinicId` from the authenticated user's JWT token.
   - All Mongoose queries and mutations are automatically scoped by `clinicId`.
2. **Authentication & Authorization (RBAC)**:
   - JWT tokens signed with `JWT_SECRET`, carried in standard `Authorization: Bearer <token>` headers.
   - Roles supported: `admin`, `doctor`, `receptionist`.
3. **MongoDB + Mongoose**:
   - Strongly-typed Mongoose Schemas with timestamps, indexing (compound index on `{ clinicId: 1, ... }`), and validation.
4. **Clean Layered Architecture**:
   - `src/config/` (environment variables, MongoDB connection)
   - `src/models/` (Mongoose schemas & interfaces)
   - `src/middlewares/` (auth, tenant context, error handler, validation)
   - `src/controllers/` (HTTP route handlers)
   - `src/services/` (business logic, capacity checks, queue transitions)
   - `src/routes/` (Express routing)
   - `src/validators/` (Zod schemas for request validation)
   - `src/types/` (TypeScript declarations)
   - `src/seeds/` (demo clinic, users, drugs, patients)

---

## 2. MongoDB Database Entities & Schemas

### 2.1. `Clinic`
```typescript
{
  name: string; // e.g. "عيادة النور التخصصية"
  code: string; // unique slug/code e.g. "el-nour"
  phone: string;
  address?: string;
  subscriptionPlan: "trial" | "basic" | "premium" | "enterprise";
  subscriptionStatus: "active" | "past_due" | "cancelled";
  settings: {
    dailyCapacity: number; // default max patients per day (e.g. 50)
    workingHours: {
      open: string; // "09:00"
      close: string; // "21:00"
    };
    consultationFee: number;
    followUpFee: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2. `User`
```typescript
{
  clinicId: ObjectId; // ref: 'Clinic'
  name: string;
  email: string; // unique per tenant or system
  passwordHash: string;
  role: "admin" | "doctor" | "receptionist";
  phone?: string;
  specialty?: string; // for doctors (e.g., "باطنة وقلب")
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.3. `Patient`
```typescript
{
  clinicId: ObjectId; // ref: 'Clinic'
  name: string;
  mobile: string; // Egyptian phone format (+20 or 01XXXXXXXXX)
  age: number;
  gender: "male" | "female";
  allergies: string[]; // e.g. ["Penicillin", "Sulfa"]
  chronicDiseases: string[]; // e.g. ["Diabetes Type 2", "Hypertension"]
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.4. `Queue`
```typescript
{
  clinicId: ObjectId; // ref: 'Clinic'
  patientId: ObjectId; // ref: 'Patient'
  queueNumber: number; // daily sequence 1, 2, 3...
  status: "waiting" | "done" | "cancelled";
  priority: "normal" | "urgent" | "critical";
  examType: "examination" | "followup" | "consultation"; // كشف / إعادة / استشارة
  visitDate: string; // YYYY-MM-DD
  enteredAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.5. `Prescription`
```typescript
{
  clinicId: ObjectId; // ref: 'Clinic'
  patientId: ObjectId; // ref: 'Patient'
  doctorId: ObjectId; // ref: 'User'
  queueId?: ObjectId; // ref: 'Queue'
  prescriptionNumber: string; // Unique human-readable Rx ID (e.g. "RX-2026-0825-001")
  diagnosis: string;
  drugs: [
    {
      drugId?: ObjectId; // ref: 'Drug'
      name: string; // "Panadol Extra"
      genericName?: string; // "Paracetamol + Caffeine"
      form: string; // "tablet" | "syrup" | "injection" | "capsule" | "drops"
      dosage: string; // "1 tablet"
      frequency: string; // "3 times daily"
      duration: string; // "5"
      unit: string; // "days" | "weeks" | "months"
      instructions?: string; // "بعد الأكل"
    }
  ];
  notes?: string;
  qrHash: string; // Public verification token for patient scanning
  sentToPharmacy: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.6. `Drug`
```typescript
{
  clinicId?: ObjectId; // null for global/standard catalog, ObjectId for custom clinic drug
  name: string; // "Amoxicillin 500mg"
  genericName: string; // "Amoxicillin"
  form: "tablet" | "syrup" | "injection" | "capsule" | "cream" | "drops";
  defaultDosage?: string;
  commonUnits: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.7. `Booking` (Public Online Booking)
```typescript
{
  clinicId: ObjectId; // ref: 'Clinic'
  patientName: string;
  mobile: string;
  age: number;
  examType: "examination" | "followup" | "consultation";
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: "cash" | "instapay";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: "confirmed" | "cancelled" | "completed";
  queueId?: ObjectId; // ref: 'Queue' (linked once accepted/checked in)
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.8. `Reminder`
```typescript
{
  clinicId: ObjectId; // ref: 'Clinic'
  patientId: ObjectId; // ref: 'Patient'
  preset: "tomorrow" | "week" | "month" | "custom";
  scheduledDate: string; // YYYY-MM-DD
  status: "pending" | "sent" | "dismissed";
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.9. `AIConversation` (Storage for AI Agent Chat)
```typescript
{
  clinicId: ObjectId; // ref: 'Clinic'
  sessionId: string; // conversation / user session ID
  patientMobile?: string;
  messages: [
    {
      sender: "patient" | "agent" | "system";
      text: string;
      intent?: string;
      timestamp: Date;
    }
  ];
  status: "active" | "escalated_to_human" | "closed";
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 3. REST API Endpoint Specifications

All response payloads adhere to standard consistent structures:
- Success: `{ "success": true, "data": { ... } }` or direct JSON model (compatible with frontend types).
- Error: `{ "success": false, "error": { "message": "...", "code": "..." } }`.

### 3.1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user under clinic (or clinic onboarding) |
| `POST` | `/api/auth/login` | Public | Login with email & password, returns JWT token + user info |
| `POST` | `/api/auth/forgot-password` | Public | Initiates password reset flow |
| `POST` | `/api/auth/logout` | Authenticated | Invalidates session |
| `GET` | `/api/auth/me` | Authenticated | Returns currently authenticated user details |

### 3.2. Patients (`/api/patients`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/patients/search?q=:query` | Authenticated | Search patients by name or mobile number |
| `GET` | `/api/patients/:id` | Authenticated | Get patient profile details |
| `GET` | `/api/patients/:id/medical` | Authenticated | Get allergies, chronic diseases, past records |
| `GET` | `/api/patients/:id/stats` | Authenticated | Get visit analytics, first visit, total visits, top diagnosis |
| `GET` | `/api/patients/:id/history` | Authenticated | Get past prescriptions history |
| `GET` | `/api/patients/:id/reminders` | Authenticated | Get follow-up reminders |
| `POST` | `/api/patients/:id/reminders` | Authenticated | Create a follow-up reminder |

### 3.3. Reception (`/api/reception`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reception/stats` | Reception / Admin | Real-time statistics (totalPatients, waiting, done, revenue) |
| `GET` | `/api/reception/queue` | Reception / Admin | Get today's queue entries with status & priority |
| `POST` | `/api/reception/patients` | Reception / Admin | Add patient to queue (with automatic capacity validation) |
| `PATCH` | `/api/reception/queue/:id` | Reception / Admin | Update queue entry status (`waiting`, `done`, `cancelled`) |

### 3.4. Doctor (`/api/doctor`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/doctor/stats` | Doctor / Admin | Doctor stats (patients count, prescriptions, revenue) |
| `GET` | `/api/doctor/queue` | Doctor / Admin | Current patient queue filtered and sorted by priority |
| `POST` | `/api/doctor/prescriptions` | Doctor / Admin | Create digital prescription with drugs & instructions |
| `GET` | `/api/doctor/prescriptions/:id` | Doctor / Admin | Get prescription details & printable format |
| `POST` | `/api/doctor/prescriptions/:id/send-to-pharmacy` | Doctor / Admin | Send prescription trigger to pharmacy partner |

### 3.5. Online Booking (Public) (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Public | Submit online booking without login |
| `GET` | `/api/bookings/capacity-check` | Public | Check if requested date is available or suggest next slot |

### 3.6. Public Prescription Verification (`/api/public/prescriptions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/public/prescriptions/:id` | Public | QR code landing endpoint to view verified prescription |

### 3.7. AI Integration (`/api/ai`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/ai/chat` | Public / Auth | Chat message endpoint (dummy/modular ready for AI engineer) |
| `GET` | `/api/ai/patient-lookup?phone=:phone` | Internal / AI | AI helper to lookup patient history by phone |
| `GET` | `/api/ai/availability` | Internal / AI | AI helper to check available booking slots & prices |

### 3.8. Payments & Webhooks (`/api/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments/webhook` | Webhook | Handles InstaPay / Payment gateway callback |
| `POST` | `/api/payments/create-intent` | Public / Auth | Generates payment reference / InstaPay payload |

---

## 4. Backend Implementation Checklist

### Phase 1: Foundation & Setup
- [ ] Initialize `backend/` package (`package.json`, `tsconfig.json`, `.env.example`).
- [ ] Install dependencies: `express`, `mongoose`, `dotenv`, `cors`, `helmet`, `morgan`, `jsonwebtoken`, `bcryptjs`, `zod`.
- [ ] Configure MongoDB connection via Mongoose with retry and error events.
- [ ] Setup central Express server with CORS (frontend URL), body parsers, and health check (`GET /api/health`).

### Phase 2: Multi-Tenancy & Auth
- [ ] Create `Clinic` and `User` Mongoose models.
- [ ] Implement password hashing with `bcryptjs`.
- [ ] Implement JWT authentication middleware (`authMiddleware.ts`).
- [ ] Implement multi-tenancy middleware (`tenantMiddleware.ts`) ensuring `clinicId` isolation.
- [ ] Implement RBAC role authorization middleware (`roleMiddleware.ts`).
- [ ] Implement Auth routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).

### Phase 3: Patients & Medical Records
- [ ] Create `Patient` and `Reminder` Mongoose models.
- [ ] Implement patient search by name and mobile with regex/text indexing.
- [ ] Implement get patient profile, medical info (allergies/chronic diseases), visit statistics.
- [ ] Implement prescription history retrieval.
- [ ] Implement patient reminder creation and listing.

### Phase 4: Reception & Queue Management
- [ ] Create `Queue` Mongoose model.
- [ ] Implement daily capacity check logic (prevent booking if capacity reached, suggest closest available date).
- [ ] Implement Reception Dashboard stats calculation (`totalPatients`, `waiting`, `done`, `revenue`).
- [ ] Implement Add Patient to Queue endpoint with priority levels (`normal`, `urgent`, `critical`).
- [ ] Implement Queue status update endpoint (`waiting` -> `done` / `cancelled`).

### Phase 5: Doctor & Digital Prescriptions
- [ ] Create `Prescription` and `Drug` Mongoose models.
- [ ] Seed standard Egyptian pharmaceutical drugs list for search/lookup.
- [ ] Implement Doctor Dashboard stats and Queue list.
- [ ] Implement Create Prescription with unique Rx code generation and QR hash.
- [ ] Implement Get Prescription by ID and Public QR Verification endpoint.
- [ ] Implement "Send to Pharmacy" webhook / status flag.

### Phase 6: Public Online Booking & Payment
- [ ] Create `Booking` Mongoose model.
- [ ] Implement Public `POST /api/bookings` with input validation (Egyptian mobile number).
- [ ] Connect booking to Queue management with capacity validation.
- [ ] Implement mock InstaPay / Payment webhook and status update flow.

### Phase 7: AI Integration Stub & Knowledge Helper
- [ ] Create `AIConversation` Mongoose model.
- [ ] Implement `POST /api/ai/chat` (structured with dummy reply and clean hooks for AI Engineer).
- [ ] Implement internal helper endpoints for AI agent (patient lookup by phone, slots availability, clinic prices).

### Phase 8: Testing & Seed Data
- [ ] Write seed script (`src/seeds/seed.ts`) populating test clinic ("عيادة النور"), admin, doctor, receptionist, sample patients, queue, and drugs.
- [ ] Add npm scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run seed`.
- [ ] Verify full end-to-end integration with frontend Axios client.
