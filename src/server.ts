// ============================================================================
// MEDICLIN Enterprise Hospital & Telemedicine SaaS Web Server
// ============================================================================

import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { URL } from 'node:url';
import { initDatabase, dbService } from './lib/db/database.ts';
import { bangladeshPayments } from './lib/payments/bangladesh-gateways.ts';

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

// Initialize database
initDatabase();

function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: http.ServerResponse, statusCode: number, payload: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Organization-ID'
  });
  res.end(JSON.stringify(payload));
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Organization-ID'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const orgId = (req.headers['x-organization-id'] as string) || 'org-cch';

  // ============================================================================
  // REST API ROUTER
  // ============================================================================

  if (pathname.startsWith('/api/')) {
    try {
      // 1. Auth: Login
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        const body = await parseBody(req);
        const result = dbService.login(body.email, body.password);
        if (!result) {
          return sendJson(res, 401, { success: false, message: 'Invalid email or password.' });
        }
        return sendJson(res, 200, { success: true, ...result });
      }

      // 2. Super Admin: Statistics
      if (pathname === '/api/super-admin/stats' && req.method === 'GET') {
        const stats = dbService.getSuperAdminStats();
        return sendJson(res, 200, { success: true, data: stats });
      }

      // 3. Super Admin: Hospitals
      if (pathname === '/api/super-admin/hospitals' && req.method === 'GET') {
        const orgs = dbService.getAllOrganizations();
        return sendJson(res, 200, { success: true, data: orgs });
      }

      if (pathname === '/api/super-admin/hospitals' && req.method === 'POST') {
        const body = await parseBody(req);
        const newOrg = dbService.registerOrganization(body);
        return sendJson(res, 201, { success: true, data: newOrg });
      }

      if (pathname.startsWith('/api/super-admin/hospitals/') && pathname.endsWith('/status') && req.method === 'PATCH') {
        const id = pathname.split('/')[4];
        const body = await parseBody(req);
        const updated = dbService.updateOrganizationStatus(id, body.status);
        return sendJson(res, 200, { success: true, data: updated });
      }

      // 4. Hospital Admin: Dashboard Stats
      if (pathname === '/api/hospital/dashboard' && req.method === 'GET') {
        const stats = dbService.getHospitalDashboardStats(orgId);
        return sendJson(res, 200, { success: true, data: stats });
      }

      // 5. Patients
      if (pathname === '/api/patients' && req.method === 'GET') {
        const patients = dbService.getPatients(orgId);
        return sendJson(res, 200, { success: true, data: patients });
      }

      if (pathname === '/api/patients' && req.method === 'POST') {
        const body = await parseBody(req);
        const created = dbService.createPatient({ ...body, organization_id: orgId });
        return sendJson(res, 201, { success: true, data: created });
      }

      if (pathname.startsWith('/api/patients/') && req.method === 'GET') {
        const id = pathname.split('/')[3];
        const patient = dbService.getPatientById(id, orgId);
        if (!patient) return sendJson(res, 404, { success: false, message: 'Patient not found' });
        return sendJson(res, 200, { success: true, data: patient });
      }

      // 6. Doctors & Departments
      if (pathname === '/api/departments' && req.method === 'GET') {
        const depts = dbService.getDepartments(orgId);
        return sendJson(res, 200, { success: true, data: depts });
      }

      if (pathname === '/api/doctors' && req.method === 'GET') {
        const isOnlineFilter = parsedUrl.searchParams.get('online') === 'true';
        const docs = isOnlineFilter ? dbService.getOnlineDoctors() : dbService.getDoctors(orgId);
        return sendJson(res, 200, { success: true, data: docs });
      }

      // 7. Appointments
      if (pathname === '/api/appointments' && req.method === 'GET') {
        const apts = dbService.getAppointments(orgId);
        return sendJson(res, 200, { success: true, data: apts });
      }

      if (pathname === '/api/appointments' && req.method === 'POST') {
        const body = await parseBody(req);
        try {
          const created = dbService.createAppointment({ ...body, organization_id: orgId });
          return sendJson(res, 201, { success: true, data: created });
        } catch (err: any) {
          return sendJson(res, 400, { success: false, message: err.message });
        }
      }

      if (pathname.startsWith('/api/appointments/') && pathname.endsWith('/status') && req.method === 'PATCH') {
        const id = pathname.split('/')[3];
        const body = await parseBody(req);
        const updated = dbService.updateAppointmentStatus(id, body.status);
        return sendJson(res, 200, { success: true, data: updated });
      }

      // 8. Wards & Beds
      if (pathname === '/api/wards-and-beds' && req.method === 'GET') {
        const result = dbService.getWardsAndBeds(orgId);
        return sendJson(res, 200, { success: true, data: result });
      }

      if (pathname.startsWith('/api/beds/') && pathname.endsWith('/status') && req.method === 'PATCH') {
        const id = pathname.split('/')[3];
        const body = await parseBody(req);
        const updated = dbService.updateBedStatus(id, body.status);
        return sendJson(res, 200, { success: true, data: updated });
      }

      // 9. Pharmacy
      if (pathname === '/api/pharmacy' && req.method === 'GET') {
        const meds = dbService.getMedicines(orgId);
        return sendJson(res, 200, { success: true, data: meds });
      }

      if (pathname === '/api/pharmacy' && req.method === 'POST') {
        const body = await parseBody(req);
        const created = dbService.createMedicine({ ...body, organization_id: orgId });
        return sendJson(res, 201, { success: true, data: created });
      }

      if (pathname === '/api/pharmacy/dispense' && req.method === 'POST') {
        const body = await parseBody(req);
        try {
          const updated = dbService.dispenseMedicine(body.medicine_id, Number(body.quantity));
          return sendJson(res, 200, { success: true, data: updated });
        } catch (err: any) {
          return sendJson(res, 400, { success: false, message: err.message });
        }
      }

      // 10. Laboratory
      if (pathname === '/api/laboratory/tests' && req.method === 'GET') {
        const tests = dbService.getLabTests(orgId);
        return sendJson(res, 200, { success: true, data: tests });
      }

      if (pathname === '/api/laboratory/orders' && req.method === 'GET') {
        const orders = dbService.getLabOrders(orgId);
        return sendJson(res, 200, { success: true, data: orders });
      }

      if (pathname === '/api/laboratory/orders' && req.method === 'POST') {
        const body = await parseBody(req);
        const order = dbService.createLabOrder({ ...body, organization_id: orgId });
        return sendJson(res, 201, { success: true, data: order });
      }

      if (pathname.startsWith('/api/laboratory/orders/') && pathname.endsWith('/result') && req.method === 'PATCH') {
        const id = pathname.split('/')[4];
        const body = await parseBody(req);
        const updated = dbService.updateLabResult(id, body.result_value, body.is_abnormal, body.result_notes);
        return sendJson(res, 200, { success: true, data: updated });
      }

      // 11. Prescriptions
      if (pathname === '/api/prescriptions' && req.method === 'GET') {
        const rxs = dbService.getPrescriptions(orgId);
        return sendJson(res, 200, { success: true, data: rxs });
      }

      if (pathname === '/api/prescriptions' && req.method === 'POST') {
        const body = await parseBody(req);
        const created = dbService.createPrescription({ ...body, organization_id: orgId });
        return sendJson(res, 201, { success: true, data: created });
      }

      if (pathname.startsWith('/api/prescriptions/') && req.method === 'GET') {
        const id = pathname.split('/')[3];
        const rx = dbService.getPrescriptionById(id);
        if (!rx) return sendJson(res, 404, { success: false, message: 'Prescription not found' });
        return sendJson(res, 200, { success: true, data: rx });
      }

      // 12. Telemedicine
      if (pathname === '/api/telemedicine/session' && req.method === 'GET') {
        const roomId = parsedUrl.searchParams.get('roomId');
        if (!roomId) return sendJson(res, 400, { success: false, message: 'roomId required' });
        const session = dbService.getTelemedicineSessionByRoom(roomId);
        if (!session) return sendJson(res, 404, { success: false, message: 'Room session not found' });
        return sendJson(res, 200, { success: true, data: session });
      }

      if (pathname === '/api/telemedicine/chat' && req.method === 'POST') {
        const body = await parseBody(req);
        const msg = dbService.sendChatMessage(body.roomId, body.senderId, body.senderName, body.senderRole, body.message);
        return sendJson(res, 201, { success: true, data: msg });
      }

      if (pathname === '/api/telemedicine/status' && req.method === 'PATCH') {
        const body = await parseBody(req);
        const updated = dbService.updateTelemedicineStatus(body.roomId, body.status, body.doctorNotes);
        return sendJson(res, 200, { success: true, data: updated });
      }

      // 13. Billing & Invoicing
      if (pathname === '/api/billing/invoices' && req.method === 'GET') {
        const invoices = dbService.getInvoices(orgId);
        return sendJson(res, 200, { success: true, data: invoices });
      }

      if (pathname === '/api/billing/invoices' && req.method === 'POST') {
        const body = await parseBody(req);
        const inv = dbService.createInvoice({ ...body, organization_id: orgId });
        return sendJson(res, 201, { success: true, data: inv });
      }

      if (pathname === '/api/billing/pay' && req.method === 'POST') {
        const body = await parseBody(req);
        const updated = dbService.recordPayment(body.invoice_id, Number(body.amount), body.payment_method, body.trx_id);
        return sendJson(res, 200, { success: true, data: updated });
      }

      // 14. Payment Gateway Initiation
      if (pathname === '/api/payments/initiate' && req.method === 'POST') {
        const body = await parseBody(req);
        let resp;
        if (body.paymentMethod === 'bkash') {
          resp = await bangladeshPayments.bKash.initiatePayment(body);
        } else if (body.paymentMethod === 'nagad') {
          resp = await bangladeshPayments.Nagad.initiatePayment(body);
        } else {
          resp = await bangladeshPayments.SSLCommerz.initiatePayment(body);
        }
        return sendJson(res, 200, { success: true, data: resp });
      }

      // 15. Payment Callback
      if (pathname === '/api/payments/callback' && req.method === 'GET') {
        const invoiceId = parsedUrl.searchParams.get('invoiceId');
        const amount = Number(parsedUrl.searchParams.get('amount') || 0);
        const provider = parsedUrl.searchParams.get('provider') || 'bkash';
        const trxId = parsedUrl.searchParams.get('trxId') || 'TRX-DEFAULT';

        if (invoiceId && amount > 0) {
          dbService.recordPayment(invoiceId, amount, provider, trxId);
        }

        res.writeHead(302, { Location: `/app/billing?paid=${invoiceId}&trx=${trxId}` });
        return res.end();
      }

      return sendJson(res, 404, { success: false, message: 'API route not found' });
    } catch (err: any) {
      console.error('API Error:', err);
      return sendJson(res, 500, { success: false, message: err.message || 'Internal Server Error' });
    }
  }

  // ============================================================================
  // STATIC FILE HANDLER & CLIENT SPA APPLICATION
  // ============================================================================

  const filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // If exact static file exists (e.g. /brand/mediclin-logo.png or /css/style.css), serve it
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    return fs.createReadStream(filePath).pipe(res);
  }

  // Otherwise, serve index.html (SPA Fallback)
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(indexPath).pipe(res);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`MEDICLIN Server running at http://127.0.0.1:${PORT}`);
});
