# MEDICLIN — Enterprise Multi-Tenant Hospital Management & Telemedicine SaaS Platform

> **"One Platform. Every Hospital. Smarter Care."**

MEDICLIN is an enterprise-grade, cloud-native healthcare operating system uniting hospital administrative workflows, inpatient & outpatient clinical records, diagnostic laboratories, pharmacy inventory POS, and online remote telemedicine video consultations under a secure multi-tenant SaaS architecture.

---

## Brand Identity & Design System

- **Official Brand Assets:**
  - Logo: `public/brand/mediclin-logo.png`
  - Reference Website: `public/brand/mediclin-website-reference.jpg`
- **Color Palette:**
  - `Primary Navy`: `#102E50`
  - `Secondary Navy`: `#163B65`
  - `Primary Teal`: `#0AA6A6`
  - `Secondary Teal`: `#168C91`
  - `Surface`: `#FFFFFF`
  - `Background`: `#F5F8FC`
  - `Border`: `#E3EAF2`
  - `Success`: `#16865B` | `Warning`: `#D99A30` | `Danger`: `#D94B4B`
- **Typography:** Plus Jakarta Sans & Inter

---

## Core System Architecture

```
MEDICLIN PLATFORM
│
├── Super Admin Control Center (/super-admin)
│   ├── Hospital Tenant Oversight & Approvals
│   ├── Subscription Tiers (Starter, Professional, Business, Enterprise)
│   ├── MRR & ARR Financial Telemetry in BDT (৳)
│   └── System Audit Logs
│
├── Hospital Workspace (/app)
│   ├── Real-time Operations Dashboard
│   ├── Patient EHR & Auto UHID Generation (e.g., CCH-2026-0001)
│   ├── Doctor Directory & BMDC License Management
│   ├── Appointments & Daily OPD Token Queues (Double-booking protected)
│   ├── Inpatient Wards & Real-time Bed Allocation Grid (IPD)
│   ├── Pharmacy Inventory & Negative-Stock Prevented POS
│   ├── Laboratory Diagnostics & Certified PDF Reports
│   ├── Digital Prescription Generator & Printable PDF Format
│   ├── Integrated Billing & Accounts (Cash, Card, bKash, Nagad MFS)
│   └── Hospital Institution Settings
│
├── Doctor Clinical Portal (/doctor)
│   ├── Personal Schedule & Consultation Queues
│   ├── Online Video Consultation Waiting Room
│   ├── BMDC Registered Digital Prescription Studio
│   └── Consultation Earnings in BDT (৳)
│
├── Patient Self-Service Portal (/patient)
│   ├── Doctor Directory & Time-slot Reservation
│   ├── Join Encrypted Video Consultation
│   ├── Download Official Digital Prescriptions
│   ├── Access Verified Diagnostic Lab Reports
│   └── Pay Hospital Invoices via bKash / Nagad MFS
│
└── Live Telemedicine Consultation Engine (/tele-room)
    ├── 256-Bit Encrypted Video & Audio Feed
    ├── Synchronized Clinical Side Panel (Vitals & Past Diagnoses)
    ├── Encrypted Real-time In-Call Chat
    └── Direct One-Click Digital Prescription Generation
```

---

## Database Architecture & Row-Level Security (RLS)

MEDICLIN uses a pooled PostgreSQL relational database schema with strict tenant isolation:
- Complete migrations located in `supabase/migrations/`:
  - `01_initial_schema.sql`: Core tables, indexes, UUID primary keys, and foreign keys.
  - `02_rls_policies.sql`: Row-Level Security enforcing tenant scoping by `organization_id` and user role.
  - `03_functions_triggers.sql`: Automated functions for UHID sequence generation, appointment tokens, bed occupancy transitions, and timestamp triggers.
  - `supabase/seed.sql`: Realistic seed data representing Bangladesh healthcare institutions (City Care Hospital, Dhaka Central Hospital, Chittagong Health Institute).

---

## Bangladesh Localization & Payment Integrations

- **Currency:** Bangladeshi Taka (BDT ৳) default across all invoices, consultation fees, and subscription plans.
- **Timezone:** `Asia/Dhaka`
- **MFS Payment Gateways:**
  - **bKash Tokenized Checkout API:** Implemented in `src/lib/payments/bangladesh-gateways.ts` with sandbox verification fallback.
  - **Nagad Payment Gateway:** Sensitive data encryption checkout and callback handlers.
  - **SSLCommerz Hosted Payment:** Secure payment callbacks and instant IPN transaction recording.

---

## Getting Started

### 1. Launching the Application
Double-click `start.cmd` or run:
```powershell
.\node.cmd --experimental-strip-types src/server.ts
```
The server will start at `http://127.0.0.1:3000`.

### 2. Running Automated Tests
```powershell
.\node.cmd --experimental-strip-types tests/mediclin.test.ts
```
All 10 test suites verify:
1. Schema & seed initialization
2. UHID generation format (`CCH-2026-XXXX`)
3. Double-booking prevention at database level
4. Pharmacy stock dispensation & negative stock prevention
5. Inpatient bed status toggle
6. Diagnostic test ordering & verification
7. Digital prescription creation & sequencing
8. Invoice generation & bKash payment clearance
9. Granular RBAC permissions matrix
10. Bangladesh MFS payment initiation
