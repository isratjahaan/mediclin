// ============================================================================
// MEDICLIN Enterprise Hospital Management & Telemedicine SaaS Platform
// Core Domain Types & Data Contracts
// ============================================================================

export type PlatformRole = 'super_admin' | 'platform_support';

export type HospitalRole =
  | 'hospital_owner'
  | 'hospital_admin'
  | 'doctor'
  | 'receptionist'
  | 'nurse'
  | 'accountant'
  | 'pharmacist'
  | 'lab_technician'
  | 'hr_manager'
  | 'inventory_manager';

export type PatientRole = 'patient';

export type UserRole = PlatformRole | HospitalRole | PatientRole;

export interface UserProfile {
  id: string; // auth uuid
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  bmdc_number?: string; // Bangladesh Medical & Dental Council Registration No.
  specialization?: string;
  created_at: string;
  updated_at: string;
}

export type SubscriptionTier = 'starter' | 'professional' | 'business' | 'enterprise';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  price_monthly_bdt: number;
  price_annual_bdt: number;
  max_doctors: number;
  max_staff: number;
  max_beds: number;
  features: string[];
}

export interface Organization {
  id: string;
  name: string;
  code: string; // e.g. "CCH"
  slug: string;
  logo_url?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  division: string;
  country: string;
  currency: string; // Default 'BDT'
  timezone: string; // Default 'Asia/Dhaka'
  status: 'active' | 'trial' | 'suspended' | 'pending';
  subscription_tier: SubscriptionTier;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: HospitalRole;
  department_id?: string;
  is_active: boolean;
  joined_at: string;
  user?: UserProfile;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  head_doctor_id?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Doctor {
  id: string;
  organization_id: string;
  user_id: string;
  department_id: string;
  full_name: string;
  degrees: string; // e.g., "MBBS, FCPS (Medicine)"
  specialization: string;
  bmdc_reg_number: string;
  experience_years: number;
  consultation_fee_bdt: number;
  online_consultation_fee_bdt: number;
  is_available_online: boolean;
  is_verified: boolean;
  rating: number;
  review_count: number;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string; // "09:00"
  end_time: string; // "17:00"
  slot_duration_minutes: number;
  is_online_slot: boolean;
  is_active: boolean;
}

export interface Patient {
  id: string;
  organization_id: string;
  uhid: string; // Unique Hospital Patient ID e.g., "CCH-2026-0042"
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  email?: string;
  address: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  allergies?: string[];
  medical_history_notes?: string;
  registered_at: string;
  updated_at: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type ConsultationType = 'in_person' | 'telemedicine';

export interface Appointment {
  id: string;
  organization_id: string;
  patient_id: string;
  doctor_id: string;
  department_id: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM
  token_number: number;
  consultation_type: ConsultationType;
  status: AppointmentStatus;
  reason_for_visit?: string;
  fee_bdt: number;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_method?: 'cash' | 'bkash' | 'nagad' | 'card' | 'bank_transfer';
  telemedicine_room_id?: string;
  created_at: string;
  updated_at: string;
  // Joins
  patient?: Patient;
  doctor?: Doctor;
  department?: Department;
}

export type BedStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type WardType = 'general' | 'cabin_single' | 'cabin_vip' | 'icu' | 'ccu' | 'post_operative' | 'emergency';

export interface Ward {
  id: string;
  organization_id: string;
  name: string;
  ward_type: WardType;
  floor: string;
  daily_charge_bdt: number;
  created_at: string;
}

export interface Bed {
  id: string;
  organization_id: string;
  ward_id: string;
  bed_number: string;
  status: BedStatus;
  current_admission_id?: string;
  created_at: string;
  ward?: Ward;
}

export interface Admission {
  id: string;
  organization_id: string;
  admission_number: string; // e.g., "ADM-2026-0081"
  patient_id: string;
  bed_id: string;
  primary_doctor_id: string;
  admission_date: string;
  discharge_date?: string;
  admission_diagnosis: string;
  status: 'admitted' | 'discharged' | 'transferred';
  discharge_summary?: string;
  created_at: string;
  // Joins
  patient?: Patient;
  bed?: Bed;
  primary_doctor?: Doctor;
}

export interface Medicine {
  id: string;
  organization_id: string;
  brand_name: string; // e.g. "Napa Extra"
  generic_name: string; // e.g. "Paracetamol + Caffeine"
  category: string; // "Analgesic", "Antibiotic", etc.
  manufacturer: string; // "Square Pharmaceuticals", "Beximco", etc.
  batch_number: string;
  unit: string; // "strip", "bottle", "box", "vial"
  purchase_price_bdt: number;
  selling_price_bdt: number;
  stock_quantity: number;
  min_alert_quantity: number;
  expiry_date: string; // YYYY-MM-DD
  created_at: string;
}

export interface LabTest {
  id: string;
  organization_id: string;
  test_code: string; // e.g., "CBC-01"
  test_name: string; // e.g., "Complete Blood Count (CBC)"
  category: 'pathology' | 'biochemistry' | 'microbiology' | 'radiology' | 'cardiology';
  price_bdt: number;
  turnaround_hours: number;
  normal_range?: string;
  unit?: string;
  sample_type?: string; // "Blood", "Urine", "Serum", "X-Ray Plate"
  created_at: string;
}

export type LabOrderStatus = 'ordered' | 'sample_collected' | 'processing' | 'completed' | 'verified' | 'delivered';

export interface LabOrder {
  id: string;
  organization_id: string;
  order_number: string; // e.g. "LAB-2026-102"
  patient_id: string;
  doctor_id?: string;
  test_id: string;
  status: LabOrderStatus;
  sample_collected_at?: string;
  result_value?: string;
  result_notes?: string;
  is_abnormal?: boolean;
  verified_by?: string;
  verified_at?: string;
  report_pdf_url?: string;
  created_at: string;
  // Joins
  patient?: Patient;
  test?: LabTest;
  doctor?: Doctor;
}

export interface PrescriptionMedicine {
  medicine_id?: string;
  name: string;
  dosage: string; // "500mg"
  frequency: string; // "1+0+1" (Morning + Noon + Night)
  duration: string; // "5 days"
  instructions: string; // "After food"
}

export interface DigitalPrescription {
  id: string;
  organization_id: string;
  prescription_number: string; // e.g., "RX-2026-0512"
  appointment_id?: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  vitals?: {
    bp?: string;
    pulse?: number;
    temp?: string;
    weight_kg?: number;
    spo2?: number;
  };
  medicines: PrescriptionMedicine[];
  investigations_recommended?: string[];
  advice_notes?: string;
  follow_up_date?: string;
  doctor_signature_url?: string;
  created_at: string;
  // Joins
  patient?: Patient;
  doctor?: Doctor;
  organization?: Organization;
}

export interface TelemedicineSession {
  id: string;
  organization_id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  room_id: string;
  access_token: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'abandoned';
  scheduled_at: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  doctor_notes?: string;
  prescription_id?: string;
  created_at: string;
  // Joins
  patient?: Patient;
  doctor?: Doctor;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'doctor' | 'patient';
  message: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  category: 'consultation' | 'bed_charge' | 'medicine' | 'lab_test' | 'procedure' | 'other';
  quantity: number;
  unit_price_bdt: number;
  total_price_bdt: number;
}

export interface Invoice {
  id: string;
  organization_id: string;
  invoice_number: string; // "INV-2026-3021"
  patient_id: string;
  admission_id?: string;
  appointment_id?: string;
  subtotal_bdt: number;
  tax_percent: number;
  tax_amount_bdt: number;
  discount_bdt: number;
  grand_total_bdt: number;
  paid_amount_bdt: number;
  due_amount_bdt: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'cancelled';
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
  patient?: Patient;
}

export interface PaymentTransaction {
  id: string;
  organization_id: string;
  invoice_id: string;
  amount_bdt: number;
  payment_method: 'cash' | 'bkash' | 'nagad' | 'card' | 'bank_transfer';
  gateway_transaction_id?: string; // e.g. "TRX9384729"
  gateway_response?: Record<string, any>;
  status: 'success' | 'pending' | 'failed';
  received_by_user_id: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id?: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface AppNotification {
  id: string;
  organization_id?: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  link_url?: string;
  is_read: boolean;
  created_at: string;
}
