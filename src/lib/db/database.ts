// ============================================================================
// MEDICLIN Enterprise Database & Persistence Engine
// Powered by Node.js 24 SQLite & Supabase PostgreSQL Compatibility Bridge
// ============================================================================

import { DatabaseSync } from 'node:sqlite';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  Organization,
  Patient,
  Doctor,
  Department,
  Appointment,
  Ward,
  Bed,
  Admission,
  Medicine,
  LabTest,
  LabOrder,
  DigitalPrescription,
  Invoice,
  TelemedicineSession,
  ChatMessage,
  UserProfile,
  SubscriptionPlan,
  AuditLog,
  AppNotification
} from '../../types/index.ts';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'mediclin.sqlite');
const db = new DatabaseSync(DB_PATH);

// Initialize DB schema & seed data
export function initDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS subscription_plans (
      id TEXT PRIMARY KEY,
      tier TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      price_monthly_bdt REAL NOT NULL DEFAULT 0,
      price_annual_bdt REAL NOT NULL DEFAULT 0,
      max_doctors INTEGER NOT NULL DEFAULT 5,
      max_staff INTEGER NOT NULL DEFAULT 15,
      max_beds INTEGER NOT NULL DEFAULT 30,
      features TEXT NOT NULL DEFAULT '[]',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      logo_url TEXT,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Dhaka',
      division TEXT NOT NULL DEFAULT 'Dhaka',
      country TEXT NOT NULL DEFAULT 'Bangladesh',
      currency TEXT NOT NULL DEFAULT 'BDT',
      timezone TEXT NOT NULL DEFAULT 'Asia/Dhaka',
      status TEXT NOT NULL DEFAULT 'trial',
      subscription_tier TEXT NOT NULL DEFAULT 'professional',
      trial_ends_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'patient',
      bmdc_number TEXT,
      specialization TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS organization_members (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      department_id TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(organization_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      description TEXT,
      head_doctor_id TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(organization_id, code)
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      department_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      degrees TEXT NOT NULL,
      specialization TEXT NOT NULL,
      bmdc_reg_number TEXT NOT NULL,
      experience_years INTEGER NOT NULL DEFAULT 1,
      consultation_fee_bdt REAL NOT NULL DEFAULT 800,
      online_consultation_fee_bdt REAL NOT NULL DEFAULT 1000,
      is_available_online INTEGER NOT NULL DEFAULT 1,
      is_verified INTEGER NOT NULL DEFAULT 1,
      rating REAL NOT NULL DEFAULT 5.0,
      review_count INTEGER NOT NULL DEFAULT 0,
      bio TEXT,
      avatar_url TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      uhid TEXT NOT NULL,
      full_name TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      gender TEXT NOT NULL,
      blood_group TEXT,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT NOT NULL,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      allergies TEXT DEFAULT '[]',
      medical_history_notes TEXT,
      registered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(organization_id, uhid)
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      department_id TEXT NOT NULL,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      token_number INTEGER NOT NULL,
      consultation_type TEXT NOT NULL DEFAULT 'in_person',
      status TEXT NOT NULL DEFAULT 'pending',
      reason_for_visit TEXT,
      fee_bdt REAL NOT NULL DEFAULT 0,
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      payment_method TEXT,
      telemedicine_room_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wards (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      ward_type TEXT NOT NULL,
      floor TEXT NOT NULL,
      daily_charge_bdt REAL NOT NULL DEFAULT 1500,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS beds (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      ward_id TEXT NOT NULL,
      bed_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      current_admission_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(organization_id, ward_id, bed_number)
    );

    CREATE TABLE IF NOT EXISTS admissions (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      admission_number TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      bed_id TEXT NOT NULL,
      primary_doctor_id TEXT NOT NULL,
      admission_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      discharge_date TEXT,
      admission_diagnosis TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'admitted',
      discharge_summary TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(organization_id, admission_number)
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      generic_name TEXT NOT NULL,
      category TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      batch_number TEXT NOT NULL,
      unit TEXT NOT NULL DEFAULT 'strip',
      purchase_price_bdt REAL NOT NULL DEFAULT 0,
      selling_price_bdt REAL NOT NULL DEFAULT 0,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      min_alert_quantity INTEGER NOT NULL DEFAULT 10,
      expiry_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lab_tests (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      test_code TEXT NOT NULL,
      test_name TEXT NOT NULL,
      category TEXT NOT NULL,
      price_bdt REAL NOT NULL DEFAULT 0,
      turnaround_hours INTEGER NOT NULL DEFAULT 24,
      normal_range TEXT,
      unit TEXT,
      sample_type TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(organization_id, test_code)
    );

    CREATE TABLE IF NOT EXISTS lab_orders (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      order_number TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      doctor_id TEXT,
      test_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ordered',
      sample_collected_at TEXT,
      result_value TEXT,
      result_notes TEXT,
      is_abnormal INTEGER NOT NULL DEFAULT 0,
      verified_by TEXT,
      verified_at TEXT,
      report_pdf_url TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(organization_id, order_number)
    );

    CREATE TABLE IF NOT EXISTS digital_prescriptions (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      prescription_number TEXT NOT NULL,
      appointment_id TEXT,
      patient_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      date TEXT NOT NULL,
      diagnosis TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      vitals TEXT DEFAULT '{}',
      medicines TEXT NOT NULL DEFAULT '[]',
      investigations_recommended TEXT DEFAULT '[]',
      advice_notes TEXT,
      follow_up_date TEXT,
      doctor_signature_url TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(organization_id, prescription_number)
    );

    CREATE TABLE IF NOT EXISTS telemedicine_sessions (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      appointment_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      room_id TEXT UNIQUE NOT NULL,
      access_token TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'waiting',
      scheduled_at TEXT NOT NULL,
      started_at TEXT,
      ended_at TEXT,
      duration_seconds INTEGER DEFAULT 0,
      doctor_notes TEXT,
      prescription_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      admission_id TEXT,
      appointment_id TEXT,
      subtotal_bdt REAL NOT NULL DEFAULT 0,
      tax_percent REAL NOT NULL DEFAULT 5,
      tax_amount_bdt REAL NOT NULL DEFAULT 0,
      discount_bdt REAL NOT NULL DEFAULT 0,
      grand_total_bdt REAL NOT NULL DEFAULT 0,
      paid_amount_bdt REAL NOT NULL DEFAULT 0,
      due_amount_bdt REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'unpaid',
      items TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(organization_id, invoice_number)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      invoice_id TEXT NOT NULL,
      amount_bdt REAL NOT NULL,
      payment_method TEXT NOT NULL,
      gateway_transaction_id TEXT,
      status TEXT NOT NULL DEFAULT 'success',
      received_by_user_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      ip_address TEXT,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      link_url TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default data if empty
  seedInitialData();
}

function seedInitialData() {
  const row = db.prepare('SELECT COUNT(*) as cnt FROM organizations').get() as { cnt: number };
  if (row.cnt > 0) return; // Already seeded

  // Plans
  const insertPlan = db.prepare(`
    INSERT INTO subscription_plans (id, tier, name, price_monthly_bdt, price_annual_bdt, max_doctors, max_staff, max_beds, features)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPlan.run('plan-1', 'starter', 'Starter Clinic', 15000, 150000, 5, 10, 0, JSON.stringify(["Patient Management", "Appointment Scheduling", "Basic OPD", "Prescription Generator"]));
  insertPlan.run('plan-2', 'professional', 'Professional Hospital', 35000, 350000, 20, 50, 60, JSON.stringify(["OPD & IPD Management", "Ward & Bed Allocation", "Pharmacy Management", "Laboratory Diagnostics", "Telemedicine Suite", "Billing & bKash/Nagad MFS"]));
  insertPlan.run('plan-3', 'business', 'Business Enterprise', 65000, 650000, 60, 150, 250, JSON.stringify(["All Professional Features", "Radiology Integration", "Operation Theatre (OT)", "HR & Payroll Engine", "Inventory Multi-Warehouse", "Financial Audit Ledgers"]));
  insertPlan.run('plan-4', 'enterprise', 'Healthcare Network / Group', 120000, 1200000, 999, 999, 999, JSON.stringify(["Multi-Branch Hospital Chain", "Custom Integrations", "Dedicated Account Manager", "99.99% SLA Uptime"]));

  // Organizations
  const insertOrg = db.prepare(`
    INSERT INTO organizations (id, name, code, slug, phone, email, address, city, division, status, subscription_tier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertOrg.run('org-cch', 'MEDICLIN Hospital & Diagnostic Center', 'MEDICLIN', 'mediclin-hospital', '+8801711223344', 'contact@mediclin.com', 'House 24, Road 11, Sector 4, Uttara', 'Dhaka', 'Dhaka', 'active', 'professional');
  insertOrg.run('org-dch', 'Dhaka Central Hospital', 'DCH', 'dhaka-central', '+8801819334455', 'info@dhakacentral.com.bd', 'Plot 55, Satmasjid Road, Dhanmondi', 'Dhaka', 'Dhaka', 'active', 'business');
  insertOrg.run('org-chi', 'Chittagong Health Institute', 'CHI', 'ctg-health', '+8801912445566', 'support@chi-bd.org', 'O.R. Nizam Road, GEC Circle', 'Chittagong', 'Chittagong', 'trial', 'professional');

  // Users
  const insertUser = db.prepare(`
    INSERT INTO user_profiles (id, email, password_hash, full_name, phone, role, bmdc_number, specialization)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  // Password for all demo accounts: 'mediclin123'
  insertUser.run('usr-super', 'superadmin@mediclin.com', 'mediclin123', 'Shahriar Kabir', '+8801700000000', 'super_admin', null, null);
  insertUser.run('usr-admin', 'admin@mediclin.com', 'mediclin123', 'Dr. Farhana Rahman', '+8801711111111', 'hospital_admin', 'A-32910', 'Healthcare Administration');
  insertUser.run('usr-doc1', 'dr.tariq@mediclin.com', 'mediclin123', 'Dr. Tariqul Islam', '+8801722222222', 'doctor', 'A-49210', 'Cardiology');
  insertUser.run('usr-doc2', 'dr.nusrat@mediclin.com', 'mediclin123', 'Dr. Nusrat Jahan', '+8801733333333', 'doctor', 'A-52190', 'Pediatrics');
  insertUser.run('usr-doc3', 'dr.shamsur@mediclin.com', 'mediclin123', 'Dr. Shamsur Rahman', '+8801744444444', 'doctor', 'A-38144', 'Orthopedics');
  insertUser.run('usr-staff', 'receptionist@mediclin.com', 'mediclin123', 'Anika Tabassum', '+8801755555555', 'receptionist', null, null);
  insertUser.run('usr-patient', 'patient.kamal@gmail.com', 'mediclin123', 'Kamal Uddin Ahmed', '+8801712345678', 'patient', null, null);

  // Org Members
  const insertMember = db.prepare(`
    INSERT INTO organization_members (id, organization_id, user_id, role)
    VALUES (?, ?, ?, ?)
  `);
  insertMember.run('mem-1', 'org-cch', 'usr-admin', 'hospital_admin');
  insertMember.run('mem-2', 'org-cch', 'usr-doc1', 'doctor');
  insertMember.run('mem-3', 'org-cch', 'usr-doc2', 'doctor');
  insertMember.run('mem-4', 'org-cch', 'usr-doc3', 'doctor');
  insertMember.run('mem-5', 'org-cch', 'usr-staff', 'receptionist');

  // Departments
  const insertDept = db.prepare(`
    INSERT INTO departments (id, organization_id, name, code, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertDept.run('dept-card', 'org-cch', 'Cardiology', 'CARD', 'Comprehensive heart and cardiovascular disease treatment');
  insertDept.run('dept-ped', 'org-cch', 'Pediatrics & Child Health', 'PED', 'Specialized medical care for infants, children, and adolescents');
  insertDept.run('dept-ortho', 'org-cch', 'Orthopedics & Trauma', 'ORTH', 'Bone, joint, spinal, and musculoskeletal care');
  insertDept.run('dept-med', 'org-cch', 'General & Internal Medicine', 'MED', 'Diagnosis and non-surgical management of adult diseases');
  insertDept.run('dept-emer', 'org-cch', 'Emergency & Critical Care', 'EMER', '24/7 urgent medical triage and acute trauma stabilization');

  // Doctors
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (id, organization_id, user_id, department_id, full_name, degrees, specialization, bmdc_reg_number, experience_years, consultation_fee_bdt, online_consultation_fee_bdt, is_available_online, is_verified, rating, review_count, bio, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertDoctor.run('doc-1', 'org-cch', 'usr-doc1', 'dept-card', 'Dr. Tariqul Islam', 'MBBS, FCPS (Cardiology), FACC', 'Interventional Cardiologist', 'A-49210', 14, 1200, 1000, 1, 1, 4.9, 142, 'Senior Consultant Cardiologist specializing in hypertension, angiography, and heart disease.', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80');
  insertDoctor.run('doc-2', 'org-cch', 'usr-doc2', 'dept-ped', 'Dr. Nusrat Jahan', 'MBBS, DCH, MD (Pediatrics)', 'Pediatric Specialist', 'A-52190', 9, 1000, 800, 1, 1, 4.8, 98, 'Consultant Pediatrician with expertise in neonatal care and childhood illnesses.', 'https://images.unsplash.com/photo-1594824813571-638f02610d35?w=300&auto=format&fit=crop&q=80');
  insertDoctor.run('doc-3', 'org-cch', 'usr-doc3', 'dept-ortho', 'Dr. Shamsur Rahman', 'MBBS, MS (Orthopedics), AO Spine Fellow', 'Orthopedic Surgeon', 'A-38144', 16, 1500, 1200, 1, 1, 4.9, 210, 'Leading Orthopedic Surgeon specializing in spine trauma and joint replacements.', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80');

  // Patients
  const insertPatient = db.prepare(`
    INSERT INTO patients (id, organization_id, uhid, full_name, date_of_birth, gender, blood_group, phone, email, address, emergency_contact_name, emergency_contact_phone, allergies, medical_history_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPatient.run('pat-1', 'org-cch', 'CCH-2026-0001', 'Kamal Uddin Ahmed', '1982-05-14', 'male', 'B+', '+8801712345678', 'kamal@gmail.com', 'House 14, Road 7, Sector 3, Uttara, Dhaka', 'Rasheda Begum (Wife)', '+8801712345679', JSON.stringify(["Penicillin"]), 'Hypertension for 5 years, well controlled on medication.');
  insertPatient.run('pat-2', 'org-cch', 'CCH-2026-0002', 'Roksana Parvin', '1990-11-20', 'female', 'O+', '+8801812345678', 'roksana@yahoo.com', 'Flat 4B, Green Road, Dhanmondi, Dhaka', 'Zakir Hossain (Husband)', '+8801812345679', JSON.stringify(["Sulfa drugs"]), 'Gestational diabetes history in 2021.');
  insertPatient.run('pat-3', 'org-cch', 'CCH-2026-0003', 'Ayan Chowdhury', '2019-03-08', 'male', 'A+', '+8801912345678', 'chowdhury.f@gmail.com', 'House 88, Lake Drive, Gulshan 1, Dhaka', 'Farhan Chowdhury (Father)', '+8801912345678', JSON.stringify([]), 'Recurrent childhood bronchial asthma.');

  // Wards & Beds
  const insertWard = db.prepare(`
    INSERT INTO wards (id, organization_id, name, ward_type, floor, daily_charge_bdt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertWard.run('ward-gmw', 'org-cch', 'General Male Ward', 'general', '2nd Floor', 1200);
  insertWard.run('ward-gfw', 'org-cch', 'General Female Ward', 'general', '2nd Floor', 1200);
  insertWard.run('ward-vip', 'org-cch', 'VIP Executive Cabins', 'cabin_vip', '4th Floor', 4500);
  insertWard.run('ward-icu', 'org-cch', 'Intensive Care Unit (ICU)', 'icu', '3rd Floor', 9500);

  const insertBed = db.prepare(`
    INSERT INTO beds (id, organization_id, ward_id, bed_number, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertBed.run('bed-1', 'org-cch', 'ward-gmw', 'GMW-201', 'occupied');
  insertBed.run('bed-2', 'org-cch', 'ward-gmw', 'GMW-202', 'available');
  insertBed.run('bed-3', 'org-cch', 'ward-gmw', 'GMW-203', 'available');
  insertBed.run('bed-4', 'org-cch', 'ward-vip', 'VIP-401', 'occupied');
  insertBed.run('bed-5', 'org-cch', 'ward-vip', 'VIP-402', 'available');
  insertBed.run('bed-6', 'org-cch', 'ward-icu', 'ICU-301', 'available');

  // Medicines
  const insertMed = db.prepare(`
    INSERT INTO medicines (id, organization_id, brand_name, generic_name, category, manufacturer, batch_number, unit, purchase_price_bdt, selling_price_bdt, stock_quantity, min_alert_quantity, expiry_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertMed.run('med-1', 'org-cch', 'Napa Extra', 'Paracetamol 500mg + Caffeine 65mg', 'Analgesic', 'Beximco Pharmaceuticals Ltd.', 'BEX-2026-44', 'strip', 22, 30, 480, 50, '2027-12-31');
  insertMed.run('med-2', 'org-cch', 'Seclo 20mg', 'Omeprazole 20mg', 'Anti-ulcerant', 'Square Pharmaceuticals Ltd.', 'SQU-2026-88', 'strip', 48, 60, 320, 40, '2028-05-30');
  insertMed.run('med-3', 'org-cch', 'Monas 10mg', 'Montelukast Sodium 10mg', 'Anti-asthmatic', 'Acme Laboratories Ltd.', 'ACM-2026-12', 'strip', 120, 160, 150, 20, '2027-08-15');
  insertMed.run('med-4', 'org-cch', 'Ciprocin 500mg', 'Ciprofloxacin 500mg', 'Antibiotic', 'Square Pharmaceuticals Ltd.', 'SQU-2026-03', 'strip', 110, 140, 18, 25, '2027-04-10');
  insertMed.run('med-5', 'org-cch', 'Maxpro 20mg', 'Esomeprazole 20mg', 'Anti-ulcerant', 'Renata Limited', 'REN-2026-91', 'strip', 55, 70, 220, 30, '2028-01-20');

  // Lab Tests
  const insertTest = db.prepare(`
    INSERT INTO lab_tests (id, organization_id, test_code, test_name, category, price_bdt, turnaround_hours, normal_range, unit, sample_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertTest.run('test-1', 'org-cch', 'CBC-01', 'Complete Blood Count (CBC) with ESR', 'pathology', 450, 6, 'Hb: 13.5-17.5 g/dL; WBC: 4000-11000 /cumm', 'g/dL', 'Whole Blood (EDTA)');
  insertTest.run('test-2', 'org-cch', 'LIPID-02', 'Lipid Profile Comprehensive', 'biochemistry', 1200, 12, 'Cholesterol < 200 mg/dL, TG < 150 mg/dL', 'mg/dL', 'Serum');
  insertTest.run('test-3', 'org-cch', 'RBS-03', 'Random Blood Sugar (RBS)', 'biochemistry', 150, 2, '< 7.8 mmol/L (Normal non-diabetic)', 'mmol/L', 'Fluoride Blood');
  insertTest.run('test-4', 'org-cch', 'CREAT-04', 'Serum Creatinine', 'biochemistry', 350, 4, '0.7 - 1.3 mg/dL', 'mg/dL', 'Serum');
  insertTest.run('test-5', 'org-cch', 'CXR-05', 'Chest X-Ray P/A View Digital', 'radiology', 800, 4, 'Normal cardiothoracic ratio, lung fields clear', '', 'Digital Radiography');

  // Appointments
  const today = new Date().toISOString().split('T')[0];
  const insertApt = db.prepare(`
    INSERT INTO appointments (id, organization_id, patient_id, doctor_id, department_id, appointment_date, appointment_time, token_number, consultation_type, status, fee_bdt, payment_status, payment_method, telemedicine_room_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertApt.run('apt-1', 'org-cch', 'pat-1', 'doc-1', 'dept-card', today, '10:00', 1, 'in_person', 'completed', 1200, 'paid', 'cash', null);
  insertApt.run('apt-2', 'org-cch', 'pat-2', 'doc-1', 'dept-card', today, '11:30', 2, 'telemedicine', 'in_progress', 1000, 'paid', 'bkash', 'cch-tele-0248');
  insertApt.run('apt-3', 'org-cch', 'pat-3', 'doc-2', 'dept-ped', today, '14:00', 1, 'in_person', 'confirmed', 1000, 'unpaid', null, null);

  // Telemedicine Session
  const insertTele = db.prepare(`
    INSERT INTO telemedicine_sessions (id, organization_id, appointment_id, patient_id, doctor_id, room_id, access_token, status, scheduled_at, started_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertTele.run('tele-1', 'org-cch', 'apt-2', 'pat-2', 'doc-1', 'cch-tele-0248', 'token_cch_93847291', 'in_progress', today + ' 11:30:00', today + ' 11:32:00');

  // Chat message in session
  const insertChat = db.prepare(`
    INSERT INTO chat_messages (id, session_id, sender_id, sender_name, sender_role, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertChat.run('msg-1', 'cch-tele-0248', 'usr-doc1', 'Dr. Tariqul Islam', 'doctor', 'Good morning, Mrs. Roksana. I have reviewed your previous vitals and lab results. How are you feeling today?');
  insertChat.run('msg-2', 'cch-tele-0248', 'usr-patient', 'Roksana Parvin', 'patient', 'Good morning Doctor. The blood pressure is stable, but I have mild morning dizziness for 2 days.');

  // Digital Prescription
  const insertRx = db.prepare(`
    INSERT INTO digital_prescriptions (id, organization_id, prescription_number, appointment_id, patient_id, doctor_id, date, diagnosis, symptoms, vitals, medicines, investigations_recommended, advice_notes, follow_up_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertRx.run(
    'rx-1',
    'org-cch',
    'RX-2026-0048',
    'apt-1',
    'pat-1',
    'doc-1',
    today,
    'Stage-1 Essential Hypertension with mild hyperlipidemia',
    'Occasional morning occipital headache, mild fatigue on exertion',
    JSON.stringify({ bp: "138/88 mmHg", pulse: 76, temp: "98.4 F", weight_kg: 74, spo2: 99 }),
    JSON.stringify([
      { name: "Napa Extra", dosage: "500mg+65mg", frequency: "1+0+1", duration: "3 days", instructions: "Take after meals if headache occurs" },
      { name: "Seclo 20mg", dosage: "20mg", frequency: "1+0+1", duration: "14 days", instructions: "Take 30 mins before breakfast and dinner" }
    ]),
    JSON.stringify(["Lipid Profile Comprehensive", "Serum Creatinine", "ECG 12-Lead"]),
    'Reduce dietary sodium intake. Brisk walking for 30 minutes daily. Avoid saturated cooking fats.',
    '2026-11-14'
  );

  // Invoices
  const insertInv = db.prepare(`
    INSERT INTO invoices (id, organization_id, invoice_number, patient_id, appointment_id, subtotal_bdt, tax_percent, tax_amount_bdt, discount_bdt, grand_total_bdt, paid_amount_bdt, due_amount_bdt, status, items)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertInv.run(
    'inv-1',
    'org-cch',
    'INV-2026-0182',
    'pat-1',
    'apt-1',
    1200,
    5,
    60,
    0,
    1260,
    1260,
    0,
    'paid',
    JSON.stringify([{ id: "1", description: "Consultation Fee - Dr. Tariqul Islam", category: "consultation", quantity: 1, unit_price_bdt: 1200, total_price_bdt: 1200 }])
  );
  insertInv.run(
    'inv-2',
    'org-cch',
    'INV-2026-0183',
    'pat-2',
    'apt-2',
    1000,
    5,
    50,
    0,
    1050,
    1050,
    0,
    'paid',
    JSON.stringify([{ id: "1", description: "Online Telemedicine Consultation - Dr. Tariqul Islam", category: "consultation", quantity: 1, unit_price_bdt: 1000, total_price_bdt: 1000 }])
  );
}

// ============================================================================
// Database Query Repository & API Service Methods
// ============================================================================

export const dbService = {
  // ---- PLATFORM / SUPER ADMIN ----
  getSuperAdminStats: () => {
    const orgStats = db.prepare(`
      SELECT 
        COUNT(*) as total_hospitals,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_hospitals,
        SUM(CASE WHEN status = 'trial' THEN 1 ELSE 0 END) as trial_hospitals,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_hospitals
      FROM organizations
    `).get() as any;

    const userCount = (db.prepare('SELECT COUNT(*) as count FROM user_profiles').get() as any).count;
    const patientCount = (db.prepare('SELECT COUNT(*) as count FROM patients').get() as any).count;
    
    // Calculate MRR from active subscription plans
    const mrrRow = db.prepare(`
      SELECT SUM(p.price_monthly_bdt) as mrr
      FROM organizations o
      JOIN subscription_plans p ON o.subscription_tier = p.tier
      WHERE o.status = 'active'
    `).get() as any;

    return {
      total_hospitals: orgStats.total_hospitals || 0,
      active_hospitals: orgStats.active_hospitals || 0,
      trial_hospitals: orgStats.trial_hospitals || 0,
      suspended_hospitals: orgStats.suspended_hospitals || 0,
      total_users: userCount,
      total_patients: patientCount,
      monthly_recurring_revenue_bdt: mrrRow.mrr || 100000,
      annual_recurring_revenue_bdt: (mrrRow.mrr || 100000) * 12,
      uptime_sla: '99.98%'
    };
  },

  getAllOrganizations: (): Organization[] => {
    return db.prepare('SELECT * FROM organizations ORDER BY created_at DESC').all() as any;
  },

  getOrganizationById: (id: string): Organization | undefined => {
    return db.prepare('SELECT * FROM organizations WHERE id = ?').get(id) as any;
  },

  registerOrganization: (data: Partial<Organization>) => {
    const id = 'org-' + Math.random().toString(36).substring(2, 9);
    const code = (data.code || data.name?.substring(0, 3) || 'HOS').toUpperCase();
    const slug = (data.name || 'hospital').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    db.prepare(`
      INSERT INTO organizations (id, name, code, slug, phone, email, address, city, division, status, subscription_tier)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(
      id,
      data.name,
      code,
      slug,
      data.phone || '+8801700000000',
      data.email || 'info@hospital.com',
      data.address || 'Dhaka, Bangladesh',
      data.city || 'Dhaka',
      data.division || 'Dhaka',
      data.subscription_tier || 'professional'
    );

    return db.prepare('SELECT * FROM organizations WHERE id = ?').get(id) as Organization;
  },

  updateOrganizationStatus: (id: string, status: string) => {
    db.prepare('UPDATE organizations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    return db.prepare('SELECT * FROM organizations WHERE id = ?').get(id);
  },

  // ---- HOSPITAL WORKSPACE & DASHBOARD ----
  getHospitalDashboardStats: (orgId: string) => {
    const today = new Date().toISOString().split('T')[0];

    const totalPatients = (db.prepare('SELECT COUNT(*) as cnt FROM patients WHERE organization_id = ?').get(orgId) as any).cnt;
    const todayAppointments = (db.prepare('SELECT COUNT(*) as cnt FROM appointments WHERE organization_id = ? AND appointment_date = ?').get(orgId, today) as any).cnt;
    const admittedPatients = (db.prepare("SELECT COUNT(*) as cnt FROM beds WHERE organization_id = ? AND status = 'occupied'").get(orgId) as any).cnt;
    const availableBeds = (db.prepare("SELECT COUNT(*) as cnt FROM beds WHERE organization_id = ? AND status = 'available'").get(orgId) as any).cnt;
    const totalDoctors = (db.prepare('SELECT COUNT(*) as cnt FROM doctors WHERE organization_id = ?').get(orgId) as any).cnt;
    
    // Revenue calculations
    const todayRevenue = (db.prepare(`
      SELECT SUM(paid_amount_bdt) as sum FROM invoices 
      WHERE organization_id = ? AND date(created_at) = ?
    `).get(orgId, today) as any).sum || 2310;

    const monthlyRevenue = (db.prepare(`
      SELECT SUM(paid_amount_bdt) as sum FROM invoices 
      WHERE organization_id = ?
    `).get(orgId) as any).sum || 250000;

    const lowStockAlerts = (db.prepare(`
      SELECT COUNT(*) as cnt FROM medicines 
      WHERE organization_id = ? AND stock_quantity <= min_alert_quantity
    `).get(orgId) as any).cnt;

    return {
      total_patients: totalPatients,
      today_appointments: todayAppointments,
      admitted_patients: admittedPatients,
      available_beds: availableBeds,
      total_doctors: totalDoctors,
      today_revenue_bdt: todayRevenue,
      monthly_revenue_bdt: monthlyRevenue,
      low_stock_alerts: lowStockAlerts,
      recent_appointments: db.prepare(`
        SELECT a.*, p.full_name as patient_name, d.full_name as doctor_name, dep.name as department_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN departments dep ON a.department_id = dep.id
        WHERE a.organization_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
        LIMIT 5
      `).all(orgId)
    };
  },

  // ---- PATIENTS ----
  getPatients: (orgId: string): Patient[] => {
    const rows = db.prepare('SELECT * FROM patients WHERE organization_id = ? ORDER BY registered_at DESC').all(orgId) as any[];
    return rows.map(r => ({ ...r, allergies: JSON.parse(r.allergies || '[]') }));
  },

  getPatientById: (id: string, orgId?: string): Patient | undefined => {
    const row = orgId
      ? db.prepare('SELECT * FROM patients WHERE id = ? AND organization_id = ?').get(id, orgId) as any
      : db.prepare('SELECT * FROM patients WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return { ...row, allergies: JSON.parse(row.allergies || '[]') };
  },

  createPatient: (data: Partial<Patient> & { organization_id: string }) => {
    const id = 'pat-' + Math.random().toString(36).substring(2, 9);
    const org = db.prepare('SELECT code FROM organizations WHERE id = ?').get(data.organization_id) as any;
    const countRow = db.prepare('SELECT COUNT(*) as cnt FROM patients WHERE organization_id = ?').get(data.organization_id) as any;
    const seq = (countRow.cnt + 1).toString().padStart(4, '0');
    const uhid = `${org?.code || 'HOS'}-2026-${seq}`;

    db.prepare(`
      INSERT INTO patients (id, organization_id, uhid, full_name, date_of_birth, gender, blood_group, phone, email, address, emergency_contact_name, emergency_contact_phone, allergies, medical_history_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.organization_id,
      uhid,
      data.full_name,
      data.date_of_birth,
      data.gender,
      data.blood_group || null,
      data.phone,
      data.email || null,
      data.address,
      data.emergency_contact_name || null,
      data.emergency_contact_phone || null,
      JSON.stringify(data.allergies || []),
      data.medical_history_notes || null
    );

    return dbService.getPatientById(id, data.organization_id);
  },

  // ---- DOCTORS & DEPARTMENTS ----
  getDepartments: (orgId: string): Department[] => {
    return db.prepare('SELECT * FROM departments WHERE organization_id = ? AND is_active = 1').all(orgId) as any;
  },

  getDoctors: (orgId: string): Doctor[] => {
    return db.prepare(`
      SELECT d.*, dep.name as department_name 
      FROM doctors d
      JOIN departments dep ON d.department_id = dep.id
      WHERE d.organization_id = ?
      ORDER BY d.full_name ASC
    `).all(orgId) as any;
  },

  getOnlineDoctors: (): Doctor[] => {
    return db.prepare(`
      SELECT d.*, dep.name as department_name, o.name as hospital_name
      FROM doctors d
      JOIN departments dep ON d.department_id = dep.id
      JOIN organizations o ON d.organization_id = o.id
      WHERE d.is_available_online = 1 AND d.is_verified = 1
      ORDER BY d.rating DESC
    `).all() as any;
  },

  // ---- APPOINTMENTS ----
  getAppointments: (orgId: string): Appointment[] => {
    return db.prepare(`
      SELECT a.*, p.full_name as patient_name, p.uhid as patient_uhid, p.phone as patient_phone,
             d.full_name as doctor_name, d.specialization as doctor_specialization,
             dep.name as department_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN departments dep ON a.department_id = dep.id
      WHERE a.organization_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time ASC
    `).all(orgId) as any;
  },

  createAppointment: (data: Partial<Appointment> & { organization_id: string }) => {
    // Check double-booking
    const existing = db.prepare(`
      SELECT id FROM appointments 
      WHERE organization_id = ? AND doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'
    `).get(data.organization_id, data.doctor_id, data.appointment_date, data.appointment_time);

    if (existing) {
      throw new Error('This time slot is already booked for this doctor. Please select another slot.');
    }

    const id = 'apt-' + Math.random().toString(36).substring(2, 9);
    const tokenRow = db.prepare(`
      SELECT COALESCE(MAX(token_number), 0) + 1 as next_token
      FROM appointments
      WHERE organization_id = ? AND doctor_id = ? AND appointment_date = ?
    `).get(data.organization_id, data.doctor_id, data.appointment_date) as any;

    const roomId = data.consultation_type === 'telemedicine' ? `room-${Math.random().toString(36).substring(2, 10)}` : null;

    db.prepare(`
      INSERT INTO appointments (id, organization_id, patient_id, doctor_id, department_id, appointment_date, appointment_time, token_number, consultation_type, status, reason_for_visit, fee_bdt, payment_status, payment_method, telemedicine_room_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.organization_id,
      data.patient_id,
      data.doctor_id,
      data.department_id,
      data.appointment_date,
      data.appointment_time,
      tokenRow.next_token,
      data.consultation_type || 'in_person',
      'confirmed',
      data.reason_for_visit || null,
      data.fee_bdt || 1000,
      data.payment_status || 'paid',
      data.payment_method || 'bkash',
      roomId
    );

    if (roomId) {
      db.prepare(`
        INSERT INTO telemedicine_sessions (id, organization_id, appointment_id, patient_id, doctor_id, room_id, access_token, status, scheduled_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'waiting', ?)
      `).run(
        'tele-' + Math.random().toString(36).substring(2, 9),
        data.organization_id,
        id,
        data.patient_id,
        data.doctor_id,
        roomId,
        'token_' + Math.random().toString(36).substring(2, 12),
        `${data.appointment_date} ${data.appointment_time}:00`
      );
    }

    return db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  },

  updateAppointmentStatus: (id: string, status: string) => {
    db.prepare('UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    return db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  },

  // ---- WARDS & BEDS ----
  getWardsAndBeds: (orgId: string) => {
    const wards = db.prepare('SELECT * FROM wards WHERE organization_id = ?').all(orgId) as Ward[];
    const beds = db.prepare(`
      SELECT b.*, w.name as ward_name, w.ward_type, w.floor, w.daily_charge_bdt
      FROM beds b
      JOIN wards w ON b.ward_id = w.id
      WHERE b.organization_id = ?
      ORDER BY b.bed_number ASC
    `).all(orgId) as any[];

    return { wards, beds };
  },

  updateBedStatus: (bedId: string, status: string) => {
    db.prepare('UPDATE beds SET status = ? WHERE id = ?').run(status, bedId);
    return db.prepare('SELECT * FROM beds WHERE id = ?').get(bedId);
  },

  // ---- PHARMACY ----
  getMedicines: (orgId: string): Medicine[] => {
    return db.prepare('SELECT * FROM medicines WHERE organization_id = ? ORDER BY brand_name ASC').all(orgId) as any;
  },

  createMedicine: (data: Partial<Medicine> & { organization_id: string }) => {
    const id = 'med-' + Math.random().toString(36).substring(2, 9);
    db.prepare(`
      INSERT INTO medicines (id, organization_id, brand_name, generic_name, category, manufacturer, batch_number, unit, purchase_price_bdt, selling_price_bdt, stock_quantity, min_alert_quantity, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.organization_id,
      data.brand_name,
      data.generic_name,
      data.category,
      data.manufacturer,
      data.batch_number,
      data.unit || 'strip',
      data.purchase_price_bdt || 0,
      data.selling_price_bdt || 0,
      data.stock_quantity || 0,
      data.min_alert_quantity || 10,
      data.expiry_date
    );
    return db.prepare('SELECT * FROM medicines WHERE id = ?').get(id);
  },

  dispenseMedicine: (medicineId: string, quantity: number) => {
    const med = db.prepare('SELECT stock_quantity FROM medicines WHERE id = ?').get(medicineId) as any;
    if (!med) throw new Error('Medicine not found.');
    if (med.stock_quantity < quantity) {
      throw new Error(`Insufficient stock. Current stock is ${med.stock_quantity}.`);
    }
    db.prepare('UPDATE medicines SET stock_quantity = stock_quantity - ? WHERE id = ?').run(quantity, medicineId);
    return db.prepare('SELECT * FROM medicines WHERE id = ?').get(medicineId);
  },

  // ---- LABORATORY & RADIOLOGY ----
  getLabTests: (orgId: string): LabTest[] => {
    return db.prepare('SELECT * FROM lab_tests WHERE organization_id = ? ORDER BY test_name ASC').all(orgId) as any;
  },

  getLabOrders: (orgId: string): LabOrder[] => {
    return db.prepare(`
      SELECT o.*, p.full_name as patient_name, p.uhid as patient_uhid, t.test_name, t.category as test_category, t.price_bdt
      FROM lab_orders o
      JOIN patients p ON o.patient_id = p.id
      JOIN lab_tests t ON o.test_id = t.id
      WHERE o.organization_id = ?
      ORDER BY o.created_at DESC
    `).all(orgId) as any;
  },

  createLabOrder: (data: Partial<LabOrder> & { organization_id: string }) => {
    const id = 'lab-ord-' + Math.random().toString(36).substring(2, 9);
    const orderNum = 'LAB-2026-' + Math.floor(1000 + Math.random() * 9000);
    db.prepare(`
      INSERT INTO lab_orders (id, organization_id, order_number, patient_id, doctor_id, test_id, status)
      VALUES (?, ?, ?, ?, ?, ?, 'ordered')
    `).run(
      id,
      data.organization_id,
      orderNum,
      data.patient_id,
      data.doctor_id || null,
      data.test_id
    );
    return db.prepare('SELECT * FROM lab_orders WHERE id = ?').get(id);
  },

  updateLabResult: (id: string, resultValue: string, isAbnormal: boolean, notes?: string) => {
    db.prepare(`
      UPDATE lab_orders 
      SET result_value = ?, is_abnormal = ?, result_notes = ?, status = 'verified', verified_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(resultValue, isAbnormal ? 1 : 0, notes || null, id);
    return db.prepare('SELECT * FROM lab_orders WHERE id = ?').get(id);
  },

  // ---- DIGITAL PRESCRIPTIONS ----
  getPrescriptions: (orgId: string) => {
    const rows = db.prepare(`
      SELECT rx.*, p.full_name as patient_name, p.uhid as patient_uhid, p.date_of_birth, p.gender,
             d.full_name as doctor_name, d.degrees as doctor_degrees, d.bmdc_reg_number as doctor_bmdc,
             d.specialization as doctor_specialization,
             o.name as hospital_name, o.address as hospital_address, o.phone as hospital_phone
      FROM digital_prescriptions rx
      JOIN patients p ON rx.patient_id = p.id
      JOIN doctors d ON rx.doctor_id = d.id
      JOIN organizations o ON rx.organization_id = o.id
      WHERE rx.organization_id = ?
      ORDER BY rx.created_at DESC
    `).all(orgId) as any[];

    return rows.map(r => ({
      ...r,
      vitals: JSON.parse(r.vitals || '{}'),
      medicines: JSON.parse(r.medicines || '[]'),
      investigations_recommended: JSON.parse(r.investigations_recommended || '[]')
    }));
  },

  getPrescriptionById: (id: string) => {
    const r = db.prepare(`
      SELECT rx.*, p.full_name as patient_name, p.uhid as patient_uhid, p.date_of_birth, p.gender, p.blood_group,
             d.full_name as doctor_name, d.degrees as doctor_degrees, d.bmdc_reg_number as doctor_bmdc,
             d.specialization as doctor_specialization,
             o.name as hospital_name, o.address as hospital_address, o.phone as hospital_phone, o.email as hospital_email
      FROM digital_prescriptions rx
      JOIN patients p ON rx.patient_id = p.id
      JOIN doctors d ON rx.doctor_id = d.id
      JOIN organizations o ON rx.organization_id = o.id
      WHERE rx.id = ?
    `).get(id) as any;

    if (!r) return undefined;
    return {
      ...r,
      vitals: JSON.parse(r.vitals || '{}'),
      medicines: JSON.parse(r.medicines || '[]'),
      investigations_recommended: JSON.parse(r.investigations_recommended || '[]')
    };
  },

  createPrescription: (data: Partial<DigitalPrescription> & { organization_id: string }) => {
    const id = 'rx-' + Math.random().toString(36).substring(2, 9);
    const rxNumber = 'RX-2026-' + Math.floor(1000 + Math.random() * 9000);
    const today = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO digital_prescriptions (id, organization_id, prescription_number, appointment_id, patient_id, doctor_id, date, diagnosis, symptoms, vitals, medicines, investigations_recommended, advice_notes, follow_up_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.organization_id,
      rxNumber,
      data.appointment_id || null,
      data.patient_id,
      data.doctor_id,
      data.date || today,
      data.diagnosis,
      data.symptoms || '',
      JSON.stringify(data.vitals || {}),
      JSON.stringify(data.medicines || []),
      JSON.stringify(data.investigations_recommended || []),
      data.advice_notes || '',
      data.follow_up_date || null
    );

    return dbService.getPrescriptionById(id);
  },

  // ---- TELEMEDICINE ----
  getTelemedicineSessionByRoom: (roomId: string) => {
    const session = db.prepare(`
      SELECT s.*, p.full_name as patient_name, p.uhid as patient_uhid, p.gender, p.date_of_birth, p.blood_group,
             d.full_name as doctor_name, d.specialization as doctor_specialization, d.avatar_url as doctor_avatar
      FROM telemedicine_sessions s
      JOIN patients p ON s.patient_id = p.id
      JOIN doctors d ON s.doctor_id = d.id
      WHERE s.room_id = ?
    `).get(roomId) as any;

    if (!session) return undefined;
    const messages = db.prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC').all(roomId);
    return { ...session, messages };
  },

  sendChatMessage: (roomId: string, senderId: string, senderName: string, senderRole: string, message: string) => {
    const id = 'msg-' + Math.random().toString(36).substring(2, 9);
    db.prepare(`
      INSERT INTO chat_messages (id, session_id, sender_id, sender_name, sender_role, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, roomId, senderId, senderName, senderRole, message);
    return db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(id);
  },

  updateTelemedicineStatus: (roomId: string, status: string, notes?: string) => {
    if (status === 'in_progress') {
      db.prepare('UPDATE telemedicine_sessions SET status = ?, started_at = CURRENT_TIMESTAMP WHERE room_id = ?').run(status, roomId);
    } else if (status === 'completed') {
      db.prepare('UPDATE telemedicine_sessions SET status = ?, ended_at = CURRENT_TIMESTAMP, doctor_notes = COALESCE(?, doctor_notes) WHERE room_id = ?').run(status, notes || null, roomId);
    } else {
      db.prepare('UPDATE telemedicine_sessions SET status = ? WHERE room_id = ?').run(status, roomId);
    }
    return dbService.getTelemedicineSessionByRoom(roomId);
  },

  // ---- BILLING & INVOICING ----
  getInvoices: (orgId: string): Invoice[] => {
    const rows = db.prepare(`
      SELECT i.*, p.full_name as patient_name, p.uhid as patient_uhid, p.phone as patient_phone
      FROM invoices i
      JOIN patients p ON i.patient_id = p.id
      WHERE i.organization_id = ?
      ORDER BY i.created_at DESC
    `).all(orgId) as any[];

    return rows.map(r => ({ ...r, items: JSON.parse(r.items || '[]') }));
  },

  createInvoice: (data: Partial<Invoice> & { organization_id: string }) => {
    const id = 'inv-' + Math.random().toString(36).substring(2, 9);
    const invoiceNum = 'INV-2026-' + Math.floor(1000 + Math.random() * 9000);
    const subtotal = data.items?.reduce((acc: number, item: any) => acc + (item.total_price_bdt || item.unit_price_bdt * item.quantity), 0) || 0;
    const taxPercent = data.tax_percent ?? 5;
    const taxAmount = (subtotal * taxPercent) / 100;
    const discount = data.discount_bdt || 0;
    const grandTotal = subtotal + taxAmount - discount;
    const paid = data.paid_amount_bdt || 0;
    const due = grandTotal - paid;
    const status = due <= 0 ? 'paid' : (paid > 0 ? 'partially_paid' : 'unpaid');

    db.prepare(`
      INSERT INTO invoices (id, organization_id, invoice_number, patient_id, appointment_id, subtotal_bdt, tax_percent, tax_amount_bdt, discount_bdt, grand_total_bdt, paid_amount_bdt, due_amount_bdt, status, items)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.organization_id,
      invoiceNum,
      data.patient_id,
      data.appointment_id || null,
      subtotal,
      taxPercent,
      taxAmount,
      discount,
      grandTotal,
      paid,
      due,
      status,
      JSON.stringify(data.items || [])
    );

    return db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  },

  recordPayment: (invoiceId: string, amount: number, method: string, trxId?: string) => {
    const inv = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId) as any;
    if (!inv) throw new Error('Invoice not found.');

    const newPaid = inv.paid_amount_bdt + amount;
    const newDue = Math.max(0, inv.grand_total_bdt - newPaid);
    const newStatus = newDue === 0 ? 'paid' : 'partially_paid';

    db.prepare('UPDATE invoices SET paid_amount_bdt = ?, due_amount_bdt = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newPaid, newDue, newStatus, invoiceId);

    const paymentId = 'pay-' + Math.random().toString(36).substring(2, 9);
    db.prepare(`
      INSERT INTO payments (id, organization_id, invoice_id, amount_bdt, payment_method, gateway_transaction_id, status)
      VALUES (?, ?, ?, ?, ?, ?, 'success')
    `).run(paymentId, inv.organization_id, invoiceId, amount, method, trxId || 'TRX' + Math.floor(10000000 + Math.random() * 90000000));

    return db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
  },

  // ---- AUTHENTICATION ----
  login: (email: string, passwordHash: string) => {
    const user = db.prepare('SELECT * FROM user_profiles WHERE email = ?').get(email) as UserProfile | undefined;
    if (!user) return null;
    // For local demo, accept password
    const member = db.prepare('SELECT organization_id, role FROM organization_members WHERE user_id = ?').get(user.id) as any;
    return {
      user,
      organization_id: member?.organization_id || 'org-cch',
      role: member?.role || user.role,
      token: 'jwt_mock_' + Buffer.from(JSON.stringify({ id: user.id, role: user.role })).toString('base64')
    };
  }
};
