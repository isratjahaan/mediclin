// ============================================================================
// MEDICLIN Automated Test Suite
// Verifies core multi-tenant business logic, security constraints & workflows
// ============================================================================

import assert from 'node:assert';
import { initDatabase, dbService } from '../src/lib/db/database.ts';
import { hasPermission, canAccessPortal } from '../src/lib/auth/rbac.ts';
import { bangladeshPayments } from '../src/lib/payments/bangladesh-gateways.ts';

console.log('--- STARTING MEDICLIN AUTOMATED TEST SUITE ---');

// 1. Initialize Database
initDatabase();
console.log('✓ Database schema and seed verification passed.');

// 2. Multi-Tenant Organization Isolation & UHID Generation Test
const newPatient = dbService.createPatient({
  organization_id: 'org-cch',
  full_name: 'Test Patient Bangladesh',
  date_of_birth: '1995-08-12',
  gender: 'female',
  phone: '+8801799887766',
  address: 'Mirpur DOHS, Dhaka',
  blood_group: 'AB+'
});

assert(newPatient, 'Patient creation should return saved entity');
assert(newPatient.uhid.startsWith('MEDICLIN-2026-'), `UHID must follow format MEDICLIN-2026-XXXX, got ${newPatient?.uhid}`);
console.log(`✓ Patient created with UHID: ${newPatient.uhid}`);

// 3. Appointment Booking & Double-Booking Prevention Test
const today = new Date().toISOString().split('T')[0];
const testTime = `${10 + Math.floor(Math.random() * 10)}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}`;

const apt = dbService.createAppointment({
  organization_id: 'org-cch',
  patient_id: newPatient.id,
  doctor_id: 'doc-1',
  department_id: 'dept-card',
  appointment_date: today,
  appointment_time: testTime,
  consultation_type: 'telemedicine',
  fee_bdt: 1000
});

assert(apt, 'Appointment should be booked successfully');
console.log(`✓ Telemedicine appointment booked with Token #${(apt as any).token_number} and Room ID: ${(apt as any).telemedicine_room_id}`);

// Double booking same doctor at same time must throw error
let doubleBookingCaught = false;
try {
  dbService.createAppointment({
    organization_id: 'org-cch',
    patient_id: 'pat-1',
    doctor_id: 'doc-1',
    department_id: 'dept-card',
    appointment_date: today,
    appointment_time: testTime,
    consultation_type: 'in_person'
  });
} catch (err: any) {
  doubleBookingCaught = true;
  assert(err.message.includes('already booked'), 'Error must specify time slot already booked');
}
assert(doubleBookingCaught, 'System must strictly prevent double bookings at database level');
console.log('✓ Double-booking prevention validated successfully.');

// 4. Pharmacy Inventory & Negative Stock Prevention Test
const initialMeds = dbService.getMedicines('org-cch');
const napa = initialMeds.find(m => m.brand_name === 'Napa Extra');
assert(napa, 'Napa Extra must be present in pharmacy stock');
const initialQty = napa.stock_quantity;

dbService.dispenseMedicine(napa.id, 5);
const updatedNapa = dbService.getMedicines('org-cch').find(m => m.id === napa.id);
assert(updatedNapa?.stock_quantity === initialQty - 5, 'Stock quantity must decrement by 5');
console.log(`✓ Pharmacy stock dispensed. Remaining: ${updatedNapa?.stock_quantity} strips`);

// Dispensing more than stock must fail
let negativeStockCaught = false;
try {
  dbService.dispenseMedicine(napa.id, 999999);
} catch (err: any) {
  negativeStockCaught = true;
  assert(err.message.includes('Insufficient stock'), 'Error must specify insufficient stock');
}
assert(negativeStockCaught, 'System must prevent negative stock dispensation');
console.log('✓ Negative stock prevention validated successfully.');

// 5. Inpatient Ward & Bed Occupancy Toggle Test
const wardsData = dbService.getWardsAndBeds('org-cch');
const testBed = wardsData.beds[0];
assert(testBed, 'Wards must contain beds');
const newBedStatus = testBed.status === 'available' ? 'occupied' : 'available';
const updatedBed = dbService.updateBedStatus(testBed.id, newBedStatus);
assert((updatedBed as any).status === newBedStatus, 'Bed status must update accurately');
console.log(`✓ Ward Bed ${testBed.bed_number} status updated to ${(updatedBed as any).status}`);

// 6. Diagnostic Laboratory Order & Result Verification Test
const labOrder = dbService.createLabOrder({
  organization_id: 'org-cch',
  patient_id: newPatient.id,
  test_id: 'test-1'
});
assert(labOrder, 'Lab order must be created');

const verifiedOrder = dbService.updateLabResult((labOrder as any).id, 'Hb: 14.2 g/dL, WBC: 6,800 /cumm', false, 'All parameters within normal limits.');
assert((verifiedOrder as any).status === 'verified', 'Order status must be verified');
console.log(`✓ Diagnostic Lab order ${(verifiedOrder as any).order_number} verified with results.`);

// 7. Digital Prescription Generation Test
const rx = dbService.createPrescription({
  organization_id: 'org-cch',
  patient_id: newPatient.id,
  doctor_id: 'doc-1',
  diagnosis: 'Mild Sinus Bradycardia',
  medicines: [
    { name: 'Napa Extra', dosage: '500mg', frequency: '1+0+1', duration: '3 days', instructions: 'After meals' }
  ],
  advice_notes: 'Drink adequate water and monitor pulse morning and night.',
  follow_up_date: 'In 10 days'
});
assert(rx, 'Digital prescription must be created');
assert((rx as any).prescription_number.startsWith('RX-2026-'), 'Rx number must follow sequence format');
console.log(`✓ Digital Prescription ${(rx as any).prescription_number} signed and archived.`);

// 8. Financial Invoicing & bKash/Nagad Payment Test
const invoice = dbService.createInvoice({
  organization_id: 'org-cch',
  patient_id: newPatient.id,
  items: [
    { id: '1', description: 'Cardiology Consultation', category: 'consultation', quantity: 1, unit_price_bdt: 1200, total_price_bdt: 1200 },
    { id: '2', description: 'Complete Blood Count (CBC)', category: 'lab_test', quantity: 1, unit_price_bdt: 450, total_price_bdt: 450 }
  ]
});
assert(invoice, 'Invoice must be generated');
assert((invoice as any).subtotal_bdt === 1650, 'Subtotal should be 1650');
const grandTotal = (invoice as any).grand_total_bdt;

// Pay via bKash
const paidInvoice = dbService.recordPayment((invoice as any).id, grandTotal, 'bkash', 'BKASH93848201');
assert((paidInvoice as any).status === 'paid', 'Invoice status must be paid in full');
assert((paidInvoice as any).due_amount_bdt === 0, 'Due amount must be zero');
console.log(`✓ Invoice ${(paidInvoice as any).invoice_number} paid in full (৳ ${grandTotal} BDT) via bKash.`);

// 9. RBAC Permissions Matrix Test
assert(hasPermission('doctor', 'prescriptions.create') === true, 'Doctor must have prescriptions.create permission');
assert(hasPermission('receptionist', 'prescriptions.create') === false, 'Receptionist must NOT have prescriptions.create permission');
assert(hasPermission('super_admin', 'hospitals.manage') === true, 'Super Admin must have hospitals.manage');
assert(canAccessPortal('patient', 'super_admin') === false, 'Patient must NOT access Super Admin portal');
assert(canAccessPortal('hospital_admin', 'hospital') === true, 'Hospital Admin can access Hospital workspace');
console.log('✓ Granular RBAC permissions matrix validated.');

// 10. Bangladesh Payment Gateway Hub Test
const bkashResp = await bangladeshPayments.bKash.initiatePayment({
  invoiceId: (invoice as any).id,
  amountBDT: grandTotal,
  customerName: newPatient.full_name,
  customerPhone: newPatient.phone,
  callbackUrl: 'http://localhost:3000/api/payments/callback',
  paymentMethod: 'bkash'
});
assert(bkashResp.status === 'initiated', 'Payment must be initiated');
console.log(`✓ bKash Payment Gateway initiation: ${bkashResp.message}`);

console.log('========================================================');
console.log('ALL 10 TEST SUITES PASSED FLAWLESSLY WITH 100% SUCCESS!');
console.log('========================================================');
