-- ============================================================================
-- MEDICLIN Enterprise Multi-Tenant SaaS
-- Seed Data: Real-world Bangladesh Healthcare Institutions
-- ============================================================================

-- 1. SUBSCRIPTION PLANS
INSERT INTO subscription_plans (id, tier, name, price_monthly_bdt, price_annual_bdt, max_doctors, max_staff, max_beds, features) VALUES
('11111111-1111-1111-1111-111111111111', 'starter', 'Starter Clinic', 15000.00, 150000.00, 5, 10, 0, '["Patient Management", "Appointment Scheduling", "Basic OPD", "Prescription Generator", "Email Notifications"]'),
('22222222-2222-2222-2222-222222222222', 'professional', 'Professional Hospital', 35000.00, 350000.00, 20, 50, 60, '["OPD & IPD Management", "Ward & Bed Allocation", "Pharmacy Management", "Laboratory Diagnostics", "Telemedicine Suite", "Billing & bKash/Nagad MFS"]'),
('33333333-3333-3333-3333-333333333333', 'business', 'Business Enterprise', 65000.00, 650000.00, 60, 150, 250, '["All Professional Features", "Radiology Integration", "Operation Theatre (OT)", "HR & Payroll Engine", "Inventory Multi-Warehouse", "Financial Audit Ledgers"]'),
('44444444-4444-4444-4444-444444444444', 'enterprise', 'Healthcare Network / Group', 120000.00, 1200000.00, 999, 999, 999, '["Multi-Branch Hospital Chain", "Custom Integrations (PACS/DICOM)", "Dedicated Account Manager", "99.99% SLA Uptime", "Custom Analytics"]')
ON CONFLICT (tier) DO NOTHING;

-- 2. ORGANIZATIONS (HOSPITALS)
INSERT INTO organizations (id, name, code, slug, phone, email, address, city, division, status, subscription_plan_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'City Care Hospital', 'CCH', 'city-care', '+8801711223344', 'contact@citycare.com.bd', 'House 24, Road 11, Sector 4, Uttara', 'Dhaka', 'Dhaka', 'active', '22222222-2222-2222-2222-222222222222'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Dhaka Central Hospital', 'DCH', 'dhaka-central', '+8801819334455', 'info@dhakacentral.com.bd', 'Plot 55, Satmasjid Road, Dhanmondi', 'Dhaka', 'Dhaka', 'active', '33333333-3333-3333-3333-333333333333'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Chittagong Health Institute', 'CHI', 'ctg-health', '+8801912445566', 'support@chi-bd.org', 'O.R. Nizam Road, GEC Circle', 'Chittagong', 'Chittagong', 'trial', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (code) DO NOTHING;

-- 3. USER PROFILES
INSERT INTO user_profiles (id, email, full_name, phone, role, bmdc_number, specialization) VALUES
('00000000-0000-0000-0000-000000000001', 'superadmin@mediclin.com', 'Shahriar Kabir', '+8801700000000', 'super_admin', NULL, NULL),
('00000000-0000-0000-0000-000000000002', 'admin@citycare.com.bd', 'Dr. Farhana Rahman', '+8801711111111', 'hospital_admin', 'A-32910', 'Healthcare Administration'),
('00000000-0000-0000-0000-000000000003', 'dr.tariq@citycare.com.bd', 'Dr. Tariqul Islam', '+8801722222222', 'doctor', 'A-49210', 'Cardiology'),
('00000000-0000-0000-0000-000000000004', 'dr.nusrat@citycare.com.bd', 'Dr. Nusrat Jahan', '+8801733333333', 'doctor', 'A-52190', 'Pediatrics'),
('00000000-0000-0000-0000-000000000005', 'dr.shamsur@citycare.com.bd', 'Dr. Shamsur Rahman', '+8801744444444', 'doctor', 'A-38144', 'Orthopedics'),
('00000000-0000-0000-0000-000000000006', 'receptionist@citycare.com.bd', 'Anika Tabassum', '+8801755555555', 'receptionist', NULL, NULL),
('00000000-0000-0000-0000-000000000007', 'pharmacist@citycare.com.bd', 'Tanvir Hasan', '+8801766666666', 'pharmacist', NULL, NULL),
('00000000-0000-0000-0000-000000000008', 'lab@citycare.com.bd', 'Nasrin Akter', '+8801777777777', 'lab_technician', NULL, NULL),
('00000000-0000-0000-0000-000000000009', 'accountant@citycare.com.bd', 'Mahmudul Karim', '+8801788888888', 'accountant', NULL, NULL),
('00000000-0000-0000-0000-000000000010', 'patient.kamal@gmail.com', 'Kamal Uddin Ahmed', '+8801712345678', 'patient', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 4. ORGANIZATION MEMBERS
INSERT INTO organization_members (organization_id, user_id, role) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000002', 'hospital_admin'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000003', 'doctor'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000004', 'doctor'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000005', 'doctor'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000006', 'receptionist'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000007', 'pharmacist'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000008', 'lab_technician'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000009', 'accountant')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 5. DEPARTMENTS (City Care Hospital)
INSERT INTO departments (id, organization_id, name, code, description) VALUES
('d1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cardiology', 'CARD', 'Comprehensive heart and cardiovascular disease treatment'),
('d2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Pediatrics & Child Health', 'PED', 'Specialized medical care for infants, children, and adolescents'),
('d3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Orthopedics & Trauma', 'ORTH', 'Bone, joint, spinal, and musculoskeletal care'),
('d4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'General & Internal Medicine', 'MED', 'Diagnosis and non-surgical management of adult diseases'),
('d5555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Emergency & Critical Care', 'EMER', '24/7 urgent medical triage and acute trauma stabilization')
ON CONFLICT (organization_id, code) DO NOTHING;

-- 6. DOCTORS (City Care Hospital)
INSERT INTO doctors (id, organization_id, user_id, department_id, full_name, degrees, specialization, bmdc_reg_number, experience_years, consultation_fee_bdt, online_consultation_fee_bdt, is_available_online, is_verified, rating, review_count, bio) VALUES
('doc11111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000003', 'd1111111-1111-1111-1111-111111111111', 'Dr. Tariqul Islam', 'MBBS, FCPS (Cardiology), FACC', 'Interventional Cardiologist', 'A-49210', 14, 1200.00, 1000.00, true, true, 4.9, 142, 'Senior Consultant Cardiologist specializing in hypertension, coronary angiography, and echocardiography.'),
('doc22222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000004', 'd2222222-2222-2222-2222-222222222222', 'Dr. Nusrat Jahan', 'MBBS, DCH, MD (Pediatrics)', 'Pediatric Specialist', 'A-52190', 9, 1000.00, 800.00, true, true, 4.8, 98, 'Consultant Pediatrician with expertise in neonatal care, infant nutrition, and childhood infections.'),
('doc33333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000005', 'd3333333-3333-3333-3333-333333333333', 'Dr. Shamsur Rahman', 'MBBS, MS (Orthopedics), AO Spine Fellow', 'Orthopedic Surgeon', 'A-38144', 16, 1500.00, 1200.00, true, true, 4.9, 210, 'Leading Orthopedic Surgeon with over 16 years of expertise in arthroscopy, fracture trauma, and joint replacement.')
ON CONFLICT (organization_id, bmdc_reg_number) DO NOTHING;

-- 7. WARDS & BEDS
INSERT INTO wards (id, organization_id, name, ward_type, floor, daily_charge_bdt) VALUES
('w1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'General Male Ward', 'general', '2nd Floor', 1200.00),
('w2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'General Female Ward', 'general', '2nd Floor', 1200.00),
('w3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'VIP Executive Cabins', 'cabin_vip', '4th Floor', 4500.00),
('w4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Intensive Care Unit (ICU)', 'icu', '3rd Floor', 9500.00)
ON CONFLICT DO NOTHING;

INSERT INTO beds (id, organization_id, ward_id, bed_number, status) VALUES
('b1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'w1111111-1111-1111-1111-111111111111', 'GMW-201', 'occupied'),
('b2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'w1111111-1111-1111-1111-111111111111', 'GMW-202', 'available'),
('b3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'w3333333-3333-3333-3333-333333333333', 'VIP-401', 'occupied'),
('b4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'w3333333-3333-3333-3333-333333333333', 'VIP-402', 'available'),
('b5555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'w4444444-4444-4444-4444-444444444444', 'ICU-301', 'available')
ON CONFLICT DO NOTHING;

-- 8. PATIENTS
INSERT INTO patients (id, organization_id, uhid, full_name, date_of_birth, gender, blood_group, phone, email, address, emergency_contact_name, emergency_contact_phone, allergies, medical_history_notes) VALUES
('p1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CCH-2026-0001', 'Kamal Uddin Ahmed', '1982-05-14', 'male', 'B+', '+8801712345678', 'kamal@gmail.com', 'House 14, Road 7, Sector 3, Uttara, Dhaka', 'Rasheda Begum (Wife)', '+8801712345679', '["Penicillin"]', 'Hypertension for 5 years, well controlled on Amlodipine.'),
('p2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CCH-2026-0002', 'Roksana Parvin', '1990-11-20', 'female', 'O+', '+8801812345678', 'roksana@yahoo.com', 'Flat 4B, Green Road, Dhanmondi, Dhaka', 'Zakir Hossain (Husband)', '+8801812345679', '["Sulfa drugs"]', 'Gestational diabetes history in 2021. Normal fasting glucose currently.'),
('p3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CCH-2026-0003', 'Ayan Chowdhury', '2019-03-08', 'male', 'A+', '+8801912345678', 'chowdhury.f@gmail.com', 'House 88, Lake Drive, Gulshan 1, Dhaka', 'Farhan Chowdhury (Father)', '+8801912345678', '[]', 'Recurrent bronchial asthma triggered by seasonal dust.')
ON CONFLICT DO NOTHING;

-- 9. MEDICINES (PHARMACY)
INSERT INTO medicines (id, organization_id, brand_name, generic_name, category, manufacturer, batch_number, unit, purchase_price_bdt, selling_price_bdt, stock_quantity, min_alert_quantity, expiry_date) VALUES
('m1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Napa Extra', 'Paracetamol 500mg + Caffeine 65mg', 'Analgesic & Antipyretic', 'Beximco Pharmaceuticals Ltd.', 'BEX-2026-44', 'strip', 22.00, 30.00, 480, 50, '2027-12-31'),
('m2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Seclo 20mg', 'Omeprazole 20mg', 'Proton Pump Inhibitor (Anti-ulcerant)', 'Square Pharmaceuticals Ltd.', 'SQU-2026-88', 'strip', 48.00, 60.00, 320, 40, '2028-05-30'),
('m3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Monas 10mg', 'Montelukast Sodium 10mg', 'Anti-asthmatic', 'Acme Laboratories Ltd.', 'ACM-2026-12', 'strip', 120.00, 160.00, 150, 20, '2027-08-15'),
('m4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ciprocin 500mg', 'Ciprofloxacin 500mg', 'Antibiotic (Fluoroquinolone)', 'Square Pharmaceuticals Ltd.', 'SQU-2026-03', 'strip', 110.00, 140.00, 18, 25, '2027-04-10'),
('m5555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Maxpro 20mg', 'Esomeprazole 20mg', 'Anti-ulcerant', 'Renata Limited', 'REN-2026-91', 'strip', 55.00, 70.00, 220, 30, '2028-01-20')
ON CONFLICT DO NOTHING;

-- 10. LAB TESTS
INSERT INTO lab_tests (id, organization_id, test_code, test_name, category, price_bdt, turnaround_hours, normal_range, unit, sample_type) VALUES
('t1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CBC-01', 'Complete Blood Count (CBC) with ESR', 'pathology', 450.00, 6, 'Hb: 13.5-17.5 g/dL (Male), 12.0-15.5 g/dL (Female); WBC: 4,000-11,000 /cumm', 'g/dL', 'Whole Blood (EDTA)'),
('t2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LIPID-02', 'Lipid Profile Comprehensive', 'biochemistry', 1200.00, 12, 'Total Cholesterol < 200 mg/dL, Triglycerides < 150 mg/dL, HDL > 40 mg/dL, LDL < 100 mg/dL', 'mg/dL', 'Serum'),
('t3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'RBS-03', 'Random Blood Sugar (RBS)', 'biochemistry', 150.00, 2, '< 7.8 mmol/L (Normal non-diabetic)', 'mmol/L', 'Sodium Fluoride Blood'),
('t4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CREAT-04', 'Serum Creatinine', 'biochemistry', 350.00, 4, '0.7 - 1.3 mg/dL', 'mg/dL', 'Serum'),
('t5555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CXR-05', 'Chest X-Ray P/A View Digital', 'radiology', 800.00, 4, 'Normal cardiothoracic ratio, lung fields clear', NULL, 'Digital Radiography Plate')
ON CONFLICT DO NOTHING;

-- 11. SAMPLE APPOINTMENTS
INSERT INTO appointments (id, organization_id, patient_id, doctor_id, department_id, appointment_date, appointment_time, token_number, consultation_type, status, fee_bdt, payment_status, payment_method, telemedicine_room_id) VALUES
('apt11111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'p1111111-1111-1111-1111-111111111111', 'doc11111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', CURRENT_DATE, '10:00:00', 1, 'in_person', 'completed', 1200.00, 'paid', 'cash', NULL),
('apt22222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'p2222222-2222-2222-2222-222222222222', 'doc11111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', CURRENT_DATE, '11:30:00', 2, 'telemedicine', 'in_progress', 1000.00, 'paid', 'bkash', 'cch-room-tele-0248'),
('apt33333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'p3333333-3333-3333-3333-333333333333', 'doc22222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', CURRENT_DATE, '14:00:00', 1, 'in_person', 'confirmed', 1000.00, 'unpaid', NULL, NULL)
ON CONFLICT DO NOTHING;

-- 12. DIGITAL PRESCRIPTIONS
INSERT INTO digital_prescriptions (id, organization_id, prescription_number, appointment_id, patient_id, doctor_id, date, diagnosis, symptoms, vitals, medicines, investigations_recommended, advice_notes, follow_up_date) VALUES
('rx111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'RX-2026-0048', 'apt11111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'doc11111-1111-1111-1111-111111111111', CURRENT_DATE, 'Stage-1 Essential Hypertension with mild hyperlipidemia', 'Occasional morning occipital headache, mild fatigue on exertion', '{"bp": "138/88 mmHg", "pulse": 76, "temp": "98.4 F", "weight_kg": 74, "spo2": 99}', '[{"name": "Napa Extra", "dosage": "500mg+65mg", "frequency": "1+0+1", "duration": "3 days", "instructions": "Take after meals if headache occurs"}, {"name": "Seclo 20mg", "dosage": "20mg", "frequency": "1+0+1", "duration": "14 days", "instructions": "Take 30 mins before breakfast and dinner"}]', '["Lipid Profile Comprehensive", "Serum Creatinine", "ECG 12-Lead"]', 'Reduce dietary sodium intake. Brisk walking for 30 minutes daily. Avoid saturated cooking fats.', CURRENT_DATE + INTERVAL '14 days')
ON CONFLICT DO NOTHING;

-- 13. INVOICES
INSERT INTO invoices (id, organization_id, invoice_number, patient_id, appointment_id, subtotal_bdt, tax_percent, tax_amount_bdt, discount_bdt, grand_total_bdt, paid_amount_bdt, due_amount_bdt, status, items) VALUES
('inv11111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'INV-2026-0182', 'p1111111-1111-1111-1111-111111111111', 'apt11111-1111-1111-1111-111111111111', 1200.00, 5.00, 60.00, 0.00, 1260.00, 1260.00, 0.00, 'paid', '[{"id": "1", "description": "Consultation Fee - Dr. Tariqul Islam", "category": "consultation", "quantity": 1, "unit_price_bdt": 1200.00, "total_price_bdt": 1200.00}]'),
('inv22222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'INV-2026-0183', 'p2222222-2222-2222-2222-222222222222', 'apt22222-2222-2222-2222-222222222222', 1000.00, 5.00, 50.00, 0.00, 1050.00, 1050.00, 0.00, 'paid', '[{"id": "1", "description": "Online Telemedicine Consultation - Dr. Tariqul Islam", "category": "consultation", "quantity": 1, "unit_price_bdt": 1000.00, "total_price_bdt": 1000.00}]')
ON CONFLICT DO NOTHING;
