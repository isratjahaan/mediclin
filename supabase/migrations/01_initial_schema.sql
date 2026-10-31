-- ============================================================================
-- MEDICLIN Enterprise Multi-Tenant SaaS Schema
-- Migration 01: Core Architecture & Relational Entities
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. SUBSCRIPTION PLANS (Platform-wide)
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier VARCHAR(50) UNIQUE NOT NULL, -- starter, professional, business, enterprise
    name VARCHAR(100) NOT NULL,
    price_monthly_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    price_annual_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    max_doctors INT NOT NULL DEFAULT 5,
    max_staff INT NOT NULL DEFAULT 15,
    max_beds INT NOT NULL DEFAULT 30,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ORGANIZATIONS (Hospitals & Clinics)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g. "CCH"
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Dhaka',
    division VARCHAR(100) NOT NULL DEFAULT 'Dhaka',
    country VARCHAR(100) NOT NULL DEFAULT 'Bangladesh',
    currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Dhaka',
    status VARCHAR(50) NOT NULL DEFAULT 'trial', -- active, trial, suspended, pending
    subscription_plan_id UUID REFERENCES subscription_plans(id),
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. USER PROFILES
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY, -- references auth.users(id) in Supabase
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'patient',
    bmdc_number VARCHAR(100), -- Bangladesh Medical & Dental Council Reg No.
    specialization VARCHAR(150),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ORGANIZATION MEMBERS (Multi-tenant junction)
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    department_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 5. DEPARTMENTS
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    head_doctor_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- 6. DOCTORS
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id),
    full_name VARCHAR(255) NOT NULL,
    degrees VARCHAR(255) NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    bmdc_reg_number VARCHAR(100) NOT NULL,
    experience_years INT NOT NULL DEFAULT 1,
    consultation_fee_bdt NUMERIC(10, 2) NOT NULL DEFAULT 800.00,
    online_consultation_fee_bdt NUMERIC(10, 2) NOT NULL DEFAULT 1000.00,
    is_available_online BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    review_count INT NOT NULL DEFAULT 0,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, bmdc_reg_number)
);

-- 7. DOCTOR SCHEDULES
CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT NOT NULL DEFAULT 15,
    is_online_slot BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT check_time_order CHECK (start_time < end_time)
);

-- 8. PATIENTS
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    uhid VARCHAR(50) NOT NULL, -- e.g. "CCH-2026-0001"
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    allergies JSONB DEFAULT '[]'::jsonb,
    medical_history_notes TEXT,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, uhid)
);

-- 9. APPOINTMENTS
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES departments(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    token_number INT NOT NULL,
    consultation_type VARCHAR(50) NOT NULL DEFAULT 'in_person', -- in_person, telemedicine
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, confirmed, checked_in, in_progress, completed, cancelled, no_show
    reason_for_visit TEXT,
    fee_bdt NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    telemedicine_room_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, doctor_id, appointment_date, appointment_time)
);

-- 10. WARDS & BEDS
CREATE TABLE wards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    ward_type VARCHAR(50) NOT NULL, -- general, cabin_single, cabin_vip, icu, ccu, emergency
    floor VARCHAR(50) NOT NULL,
    daily_charge_bdt NUMERIC(10, 2) NOT NULL DEFAULT 1500.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
    bed_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available', -- available, occupied, reserved, maintenance
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, ward_id, bed_number)
);

-- 11. ADMISSIONS (IPD)
CREATE TABLE admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    admission_number VARCHAR(50) NOT NULL, -- "ADM-2026-0001"
    patient_id UUID NOT NULL REFERENCES patients(id),
    bed_id UUID NOT NULL REFERENCES beds(id),
    primary_doctor_id UUID NOT NULL REFERENCES doctors(id),
    admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    discharge_date TIMESTAMPTZ,
    admission_diagnosis TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'admitted', -- admitted, discharged, transferred
    discharge_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, admission_number)
);

-- 12. PHARMACY
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_name VARCHAR(150) NOT NULL,
    generic_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(150) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'strip',
    purchase_price_bdt NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    selling_price_bdt NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    min_alert_quantity INT NOT NULL DEFAULT 10,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. LABORATORY
CREATE TABLE lab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    test_code VARCHAR(50) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price_bdt NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    turnaround_hours INT NOT NULL DEFAULT 24,
    normal_range TEXT,
    unit VARCHAR(50),
    sample_type VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, test_code)
);

CREATE TABLE lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID REFERENCES doctors(id),
    test_id UUID NOT NULL REFERENCES lab_tests(id),
    status VARCHAR(50) NOT NULL DEFAULT 'ordered', -- ordered, sample_collected, processing, completed, verified, delivered
    sample_collected_at TIMESTAMPTZ,
    result_value TEXT,
    result_notes TEXT,
    is_abnormal BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES user_profiles(id),
    verified_at TIMESTAMPTZ,
    report_pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, order_number)
);

-- 14. DIGITAL PRESCRIPTIONS
CREATE TABLE digital_prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    prescription_number VARCHAR(50) NOT NULL,
    appointment_id UUID REFERENCES appointments(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT NOT NULL,
    symptoms TEXT NOT NULL,
    vitals JSONB DEFAULT '{}'::jsonb,
    medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
    investigations_recommended JSONB DEFAULT '[]'::jsonb,
    advice_notes TEXT,
    follow_up_date DATE,
    doctor_signature_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, prescription_number)
);

-- 15. TELEMEDICINE SESSIONS
CREATE TABLE telemedicine_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    room_id VARCHAR(100) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'waiting', -- waiting, in_progress, completed, abandoned
    scheduled_at TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    doctor_notes TEXT,
    prescription_id UUID REFERENCES digital_prescriptions(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. INVOICES & BILLING
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    admission_id UUID REFERENCES admissions(id),
    appointment_id UUID REFERENCES appointments(id),
    subtotal_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    tax_amount_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    grand_total_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    due_amount_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- unpaid, partially_paid, paid, cancelled
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, invoice_number)
);

-- 17. AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    ip_address VARCHAR(50),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR MULTI-TENANT QUERY OPTIMIZATION
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_patients_org_uhid ON patients(organization_id, uhid);
CREATE INDEX idx_appointments_org_date ON appointments(organization_id, appointment_date);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id, appointment_date);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_prescriptions_patient ON digital_prescriptions(patient_id);
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
