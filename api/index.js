/**
 * MEDICLIN Vercel Serverless API Gateway
 * Handles /api/* routes seamlessly in Vercel Serverless environment
 */

const SEED_DATA = {
  stats: {
    total_hospitals: 12,
    active_hospitals: 10,
    trial_hospitals: 2,
    monthly_recurring_revenue_bdt: 299990,
    annual_recurring_revenue_bdt: 3599880,
    total_users: 148,
    active_telemedicine_sessions: 8
  },
  organizations: [
    {
      id: 'org-cch',
      name: 'MEDICLIN Hospital & Diagnostic Center',
      code: 'MEDICLIN',
      city: 'Dhaka',
      division: 'Dhaka',
      email: 'admin@mediclin.com.bd',
      phone: '+8801711223344',
      status: 'active',
      subscription_tier: 'enterprise'
    },
    {
      id: 'org-cgmh',
      name: 'Chattogram Metropolitan Hospital',
      code: 'CMH',
      city: 'Chattogram',
      division: 'Chattogram',
      email: 'info@cmh-bd.org',
      phone: '+8801811223344',
      status: 'active',
      subscription_tier: 'professional'
    },
    {
      id: 'org-smc',
      name: 'Sylhet Prime Specialized Clinic',
      code: 'SPSC',
      city: 'Sylhet',
      division: 'Sylhet',
      email: 'contact@spsc.com.bd',
      phone: '+8801911223344',
      status: 'trial',
      subscription_tier: 'starter'
    }
  ],
  dashboard: {
    total_patients: 12450,
    today_appointments: 248,
    admitted_patients: 320,
    available_beds: 120,
    today_revenue_bdt: 250000,
    recent_appointments: [
      {
        id: 'apt-1',
        token_number: 1,
        patient_name: 'Kamal Uddin Ahmed',
        patient_id: 'pat-1',
        doctor_name: 'Dr. Tariqul Islam',
        doctor_id: 'doc-1',
        department_name: 'Cardiology',
        time: '10:00 AM',
        consultation_type: 'in_person',
        status: 'completed'
      },
      {
        id: 'apt-2',
        token_number: 2,
        patient_name: 'Roksana Parvin',
        patient_id: 'pat-2',
        doctor_name: 'Dr. Tariqul Islam',
        doctor_id: 'doc-1',
        department_name: 'Cardiology',
        time: '10:30 AM',
        consultation_type: 'telemedicine',
        status: 'scheduled'
      },
      {
        id: 'apt-3',
        token_number: 3,
        patient_name: 'Tanvir Hossain',
        patient_id: 'pat-3',
        doctor_name: 'Dr. Nusrat Jahan',
        doctor_id: 'doc-2',
        department_name: 'Neurology',
        time: '11:00 AM',
        consultation_type: 'in_person',
        status: 'in_consultation'
      }
    ]
  },
  patients: [
    {
      id: 'pat-1',
      uhid: 'MED-2026-0001',
      full_name: 'Kamal Uddin Ahmed',
      date_of_birth: '1978-04-12',
      gender: 'male',
      phone: '+8801712345678',
      email: 'kamal.ahmed@gmail.com',
      blood_group: 'B+',
      allergies: 'Penicillin, NSAIDs',
      status: 'active'
    },
    {
      id: 'pat-2',
      uhid: 'MED-2026-0002',
      full_name: 'Roksana Parvin',
      date_of_birth: '1987-11-23',
      gender: 'female',
      phone: '+8801812345678',
      email: 'roksana.p@yahoo.com',
      blood_group: 'O+',
      allergies: 'Sulfa drugs',
      status: 'active'
    },
    {
      id: 'pat-3',
      uhid: 'MED-2026-0003',
      full_name: 'Tanvir Hossain',
      date_of_birth: '1995-02-14',
      gender: 'male',
      phone: '+8801912345678',
      email: 'tanvir.h@outlook.com',
      blood_group: 'A+',
      allergies: 'None known',
      status: 'active'
    }
  ],
  doctors: [
    {
      id: 'doc-1',
      full_name: 'Dr. Tariqul Islam',
      bmdc_number: 'A-49210',
      qualification: 'MBBS, FCPS (Medicine), MD (Cardiology)',
      specialization: 'Senior Interventional Cardiologist',
      department_name: 'Cardiology',
      consultation_fee_bdt: 1200,
      is_available_online: 1,
      rating: 4.9
    },
    {
      id: 'doc-2',
      full_name: 'Dr. Nusrat Jahan',
      bmdc_number: 'A-58321',
      qualification: 'MBBS, FCPS (Neurology)',
      specialization: 'Neurologist & Stroke Specialist',
      department_name: 'Neurology',
      consultation_fee_bdt: 1500,
      is_available_online: 1,
      rating: 4.8
    },
    {
      id: 'doc-3',
      full_name: 'Dr. Shamsul Alam',
      bmdc_number: 'A-31294',
      qualification: 'MBBS, MS (Orthopedics)',
      specialization: 'Orthopedic & Trauma Surgeon',
      department_name: 'Orthopedics',
      consultation_fee_bdt: 1000,
      is_available_online: 0,
      rating: 4.7
    }
  ],
  wards: [
    {
      id: 'ward-gmw',
      name: 'General Male Ward',
      floor_number: '2nd Floor',
      capacity: 30,
      beds: [
        { id: 'bed-1', bed_number: 'GMW-201', type: 'General', status: 'occupied', daily_rate_bdt: 800, patient_name: 'Kamal Uddin Ahmed', uhid: 'MED-2026-0001' },
        { id: 'bed-2', bed_number: 'GMW-202', type: 'General', status: 'available', daily_rate_bdt: 800 },
        { id: 'bed-3', bed_number: 'GMW-203', type: 'General', status: 'available', daily_rate_bdt: 800 },
        { id: 'bed-4', bed_number: 'GMW-204', type: 'General', status: 'occupied', daily_rate_bdt: 800, patient_name: 'Rafiqul Islam', uhid: 'MED-2026-0004' }
      ]
    },
    {
      id: 'ward-gfw',
      name: 'General Female Ward',
      floor_number: '2nd Floor',
      capacity: 30,
      beds: [
        { id: 'bed-5', bed_number: 'GFW-205', type: 'General', status: 'occupied', daily_rate_bdt: 800, patient_name: 'Roksana Parvin', uhid: 'MED-2026-0002' },
        { id: 'bed-6', bed_number: 'GFW-206', type: 'General', status: 'available', daily_rate_bdt: 800 }
      ]
    },
    {
      id: 'ward-vip',
      name: 'Executive VIP Cabins',
      floor_number: '4th Floor',
      capacity: 10,
      beds: [
        { id: 'bed-7', bed_number: 'CABIN-401', type: 'VIP Cabin', status: 'occupied', daily_rate_bdt: 3500, patient_name: 'Tanvir Hossain', uhid: 'MED-2026-0003' },
        { id: 'bed-8', bed_number: 'CABIN-402', type: 'VIP Cabin', status: 'available', daily_rate_bdt: 3500 }
      ]
    },
    {
      id: 'ward-icu',
      name: 'Intensive Care Unit (ICU)',
      floor_number: '3rd Floor',
      capacity: 12,
      beds: [
        { id: 'bed-9', bed_number: 'ICU-301', type: 'ICU', status: 'occupied', daily_rate_bdt: 6000, patient_name: 'Abdur Rahim', uhid: 'MED-2026-0005' },
        { id: 'bed-10', bed_number: 'ICU-302', type: 'ICU', status: 'available', daily_rate_bdt: 6000 }
      ]
    }
  ],
  inventory: [
    { id: 'med-1', name: 'Napa Extra (Paracetamol 500mg + Caffeine 65mg)', generic_name: 'Paracetamol + Caffeine', category: 'Tablet', current_stock: 480, reorder_level: 100, unit_price_bdt: 3.5, expiry_date: '2027-10-31' },
    { id: 'med-2', name: 'Sergel 20mg (Esomeprazole)', generic_name: 'Esomeprazole Magnesium', category: 'Capsule', current_stock: 350, reorder_level: 80, unit_price_bdt: 10.0, expiry_date: '2027-08-15' },
    { id: 'med-3', name: 'Ciprocin 500mg (Ciprofloxacin)', generic_name: 'Ciprofloxacin', category: 'Antibiotic', current_stock: 120, reorder_level: 50, unit_price_bdt: 18.0, expiry_date: '2026-12-31' },
    { id: 'med-4', name: 'Monas 10mg (Montelukast)', generic_name: 'Montelukast Sodium', category: 'Tablet', current_stock: 220, reorder_level: 60, unit_price_bdt: 16.5, expiry_date: '2027-05-20' },
    { id: 'med-5', name: 'Azithrocin 500mg (Azithromycin)', generic_name: 'Azithromycin', category: 'Antibiotic', current_stock: 95, reorder_level: 40, unit_price_bdt: 35.0, expiry_date: '2026-11-30' }
  ],
  labOrders: [
    { id: 'lab-1', order_number: 'LAB-2026-001', test_name: 'Complete Blood Count (CBC) with ESR', patient_name: 'Kamal Uddin Ahmed', uhid: 'MED-2026-0001', doctor_name: 'Dr. Tariqul Islam', price_bdt: 600, status: 'completed', result_notes: 'Hb: 14.2 g/dL, Total WBC: 7,500/cu.mm. Normal limits.' },
    { id: 'lab-2', order_number: 'LAB-2026-002', test_name: 'Lipid Profile (Fasting)', patient_name: 'Roksana Parvin', uhid: 'MED-2026-0002', doctor_name: 'Dr. Tariqul Islam', price_bdt: 1200, status: 'verified', result_notes: 'Total Cholesterol: 215 mg/dL, HDL: 45, LDL: 135 mg/dL.' },
    { id: 'lab-3', order_number: 'LAB-2026-003', test_name: '12-Lead Electrocardiogram (ECG)', patient_name: 'Tanvir Hossain', uhid: 'MED-2026-0003', doctor_name: 'Dr. Nusrat Jahan', price_bdt: 500, status: 'pending', result_notes: 'Awaiting cardiologist report verification.' }
  ],
  prescriptions: [
    {
      id: 'rx-1',
      rx_number: 'RX-2026-001',
      patient_name: 'Kamal Uddin Ahmed',
      uhid: 'MED-2026-0001',
      doctor_name: 'Dr. Tariqul Islam',
      bmdc: 'A-49210',
      date: '2026-10-31',
      vitals: { bp: '130/85 mmHg', pulse: '76 bpm', weight: '72 kg', temp: '98.4 F' },
      diagnosis: 'Essential Hypertension (Stage 1), Mild Dyslipidemia',
      medicines: [
        { name: 'Tab. Bizoran 5/20 mg', dose: '1+0+0', timing: 'Morning after meal', duration: '30 Days' },
        { name: 'Cap. Rosuva 10 mg', dose: '0+0+1', timing: 'At bedtime', duration: '30 Days' },
        { name: 'Tab. Napa Extra', dose: '1+0+1 (SOS)', timing: 'For headache', duration: '3 Days' }
      ]
    }
  ],
  invoices: [
    { id: 'inv-1', invoice_number: 'INV-2026-001', patient_name: 'Kamal Uddin Ahmed', uhid: 'MED-2026-0001', total_amount_bdt: 1800, paid_amount_bdt: 1800, due_amount_bdt: 0, payment_method: 'bKash', status: 'paid', date: '2026-10-31' },
    { id: 'inv-2', invoice_number: 'INV-2026-002', patient_name: 'Roksana Parvin', uhid: 'MED-2026-0002', total_amount_bdt: 2700, paid_amount_bdt: 2000, due_amount_bdt: 700, payment_method: 'Nagad', status: 'partial', date: '2026-10-31' },
    { id: 'inv-3', invoice_number: 'INV-2026-003', patient_name: 'Tanvir Hossain', uhid: 'MED-2026-0003', total_amount_bdt: 1500, paid_amount_bdt: 1500, due_amount_bdt: 0, payment_method: 'Cash Counter', status: 'paid', date: '2026-10-31' }
  ]
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Organization-ID');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const url = new URL(req.url, `https://${req.headers.host || 'mediclin.vercel.app'}`);
  const pathname = url.pathname;

  res.setHeader('Content-Type', 'application/json');

  try {
    // 1. Auth: Login
    if (pathname === '/api/auth/login') {
      return res.end(JSON.stringify({
        success: true,
        user: { id: 'usr-admin-1', email: 'admin@mediclin.com.bd', fullName: 'Dr. Tariqul Islam', role: 'hospital_admin' },
        organization: SEED_DATA.organizations[0]
      }));
    }

    // 2. Super Admin Stats & Hospitals
    if (pathname === '/api/super-admin/stats') {
      return res.end(JSON.stringify({ success: true, data: SEED_DATA.stats }));
    }
    if (pathname === '/api/super-admin/hospitals') {
      return res.end(JSON.stringify({ success: true, data: SEED_DATA.organizations }));
    }

    // 3. Hospital Dashboard
    if (pathname === '/api/hospital/dashboard') {
      return res.end(JSON.stringify({ success: true, data: SEED_DATA.dashboard }));
    }

    // 4. Patients
    if (pathname === '/api/patients') {
      if (req.method === 'POST') {
        const body = req.body || {};
        const newPatient = {
          id: `pat-${Date.now()}`,
          uhid: `MED-2026-000${SEED_DATA.patients.length + 1}`,
          full_name: body.full_name || 'New Patient',
          gender: body.gender || 'male',
          date_of_birth: body.date_of_birth || '1990-01-01',
          phone: body.phone || '+8801700000000',
          email: body.email || 'patient@example.com',
          blood_group: body.blood_group || 'O+',
          allergies: body.allergies || 'None',
          status: 'active'
        };
        SEED_DATA.patients.unshift(newPatient);
        return res.end(JSON.stringify({ success: true, data: newPatient }));
      }
      return res.end(JSON.stringify({ success: true, data: SEED_DATA.patients }));
    }

    // 5. Doctors
    if (pathname === '/api/doctors') {
      return res.end(JSON.stringify({ success: true, data: SEED_DATA.doctors }));
    }

    // 6. Appointments
    if (pathname === '/api/appointments') {
      if (req.method === 'POST') {
        const body = req.body || {};
        const newApt = {
          id: `apt-${Date.now()}`,
          token_number: SEED_DATA.dashboard.recent_appointments.length + 1,
          appointment_date: body.appointment_date || new Date().toISOString().split('T')[0],
          appointment_time: body.appointment_time || '11:00 AM',
          patient_name: 'Kamal Uddin Ahmed',
          doctor_name: 'Dr. Tariqul Islam',
          consultation_type: body.consultation_type || 'in_person',
          fee_bdt: body.fee_bdt || 1000,
          status: 'scheduled',
          telemedicine_room_id: `room-${Math.random().toString(36).substring(7)}`
        };
        SEED_DATA.dashboard.recent_appointments.push(newApt);
        return res.end(JSON.stringify({ success: true, data: newApt }));
      }
      return res.end(JSON.stringify({ success: true, data: SEED_DATA.dashboard.recent_appointments }));
    }

    // 7. Wards and Beds
    if (pathname === '/api/wards-and-beds') {
      return res.end(JSON.stringify({ success: true, data: SEED_DATA.wards }));
    }

    // 8. Pharmacy Inventory
    if (pathname === '/api/pharmacy/inventory') {
      return res.end(JSON.stringify({ success: true, data: SEED_DATA.inventory }));
    }

    // 9. Laboratory Orders
    if (pathname === '/api/laboratory/orders') {
      return res.end(JSON.stringify({ success: true, data: SEED_DATA.labOrders }));
    }

    // 10. Prescriptions
    if (pathname === '/api/prescriptions') {
      return res.end(JSON.stringify({ success: true, data: SEED_DATA.prescriptions }));
    }

    // 11. Billing & Invoices
    if (pathname === '/api/billing/invoices') {
      return res.end(JSON.stringify({ success: true, data: SEED_DATA.invoices }));
    }

    // 12. Payment Gateways (bKash / Nagad)
    if (pathname === '/api/payments/bkash/initiate') {
      return res.end(JSON.stringify({
        success: true,
        gateway: 'bKash',
        paymentID: `TRX${Date.now()}BK`,
        bkashURL: 'https://sandbox.payment.bkash.com/redirect',
        status: 'Initiated'
      }));
    }

    // Fallback 404
    res.statusCode = 404;
    return res.end(JSON.stringify({ success: false, message: 'API route not found' }));
  } catch (err) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ success: false, message: err.message || 'Internal Server Error' }));
  }
};
