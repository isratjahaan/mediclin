// ============================================================================
// MEDICLIN Enterprise Hospital & Telemedicine SaaS Client Application
// Vanilla JavaScript Single Page Application (Zero Build Dependencies)
// ============================================================================

const state = {
  user: {
    id: 'usr-admin',
    email: 'admin@citycare.com.bd',
    fullName: 'Dr. Farhana Rahman',
    role: 'hospital_admin',
    bmdcNumber: 'A-32910'
  },
  currentOrg: {
    id: 'org-cch',
    name: 'MEDICLIN Hospital & Diagnostic Center',
    code: 'MEDICLIN',
    city: 'Dhaka',
    subscription_tier: 'professional'
  },
  organizations: [],
  route: 'app', // Defaulting to Hospital Admin Panel per user request!
  appSubtab: 'dashboard', // dashboard | patients | doctors | appointments | opd | ipd | wards | pharmacy | laboratory | prescriptions | telemedicine | billing | settings
  teleRoomId: 'mediclin-tele-0248',
  prescriptionId: 'rx-1',
  loading: false
};

// Curated High-Definition Medical Image Directory
const IMAGES = {
  hospitals: {
    main: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&auto=format&fit=crop&q=80',
    lobby: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1000&auto=format&fit=crop&q=80',
    room: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000&auto=format&fit=crop&q=80',
    opdClinic: '/images/opd-clinic-operations.jpg',
    benefitsInfographic: '/images/hospital-software-benefits.jpg',
    administration: '/images/hospital-administration.jpg',
    inpatientCare: '/images/inpatient-team-care.jpg',
    medicalBoard: '/images/executive-medical-board.jpg'
  },
  doctors: {
    'doc-1': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    'doc-2': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    'doc-3': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    'doc-4': 'https://images.unsplash.com/photo-1594824813571-638f02610d35?w=400&auto=format&fit=crop&q=80',
    'doc-5': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80'
  },
  patients: {
    'pat-1': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'pat-2': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    'pat-3': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=300&auto=format&fit=crop&q=80',
    defaultMale: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    defaultFemale: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
  },
  wards: {
    'ward-gmw': 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&auto=format&fit=crop&q=80',
    'ward-gfw': 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
    'ward-vip': 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&auto=format&fit=crop&q=80',
    'ward-icu': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80'
  }
};

function getPatientPhoto(p) {
  if (p.avatar_url) return p.avatar_url;
  if (IMAGES.patients[p.id]) return IMAGES.patients[p.id];
  return p.gender === 'female' ? IMAGES.patients.defaultFemale : IMAGES.patients.defaultMale;
}

function getDoctorPhoto(d) {
  if (d.avatar_url && !d.avatar_url.includes('example')) return d.avatar_url;
  if (IMAGES.doctors[d.id]) return IMAGES.doctors[d.id];
  return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80';
}

// Global Helper: API Fetcher
async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Organization-ID': state.currentOrg?.id || 'org-cch',
    ...(options.headers || {})
  };
  try {
    const res = await fetch(path, { ...options, headers });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('API Error:', err);
    showToast('Network request failed: ' + err.message, 'danger');
    return { success: false, message: err.message };
  }
}

// Global Helper: Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-root');
  if (!container) return;
  const toast = document.createElement('div');
  const bg = type === 'danger' ? 'bg-[#D94B4B]' : (type === 'success' ? 'bg-[#16865B]' : 'bg-[#102E50]');
  toast.className = `${bg} text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium transition-all transform duration-300 translate-y-2 opacity-0`;
  toast.innerHTML = `
    <i data-lucide="${type === 'danger' ? 'alert-circle' : (type === 'success' ? 'check-circle' : 'info')}" class="w-5 h-5"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  lucide.createIcons();
  setTimeout(() => { toast.classList.remove('translate-y-2', 'opacity-0'); }, 10);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Router
function navigate(route, subtab = 'dashboard', extra = {}) {
  state.route = route;
  if (subtab) state.appSubtab = subtab;
  if (extra.roomId) state.teleRoomId = extra.roomId;
  if (extra.prescriptionId) state.prescriptionId = extra.prescriptionId;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderApp();
}

// Universal Global Top Bar for 1-Click Role & Workspace Switching
function renderUniversalTopBar() {
  return `
    <div class="bg-[#102E50] border-b border-white/10 text-white px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-[9999] shadow-md">
      <div class="flex items-center gap-2">
        <span class="text-[0.68rem] uppercase tracking-wider font-extrabold text-teal-300 mr-2 flex items-center gap-1.5">
          <i data-lucide="shield-check" class="w-4 h-4 text-[#0AA6A6]"></i>
          <span>Switch Workspace:</span>
        </span>
        <button onclick="navigate('app', 'dashboard')" class="px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${state.route === 'app' ? 'bg-[#0AA6A6] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'}">
          <i data-lucide="layout-dashboard" class="w-3.5 h-3.5"></i>
          <span>🏥 Hospital Admin Panel</span>
        </button>
        <button onclick="navigate('super_admin')" class="px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${state.route === 'super_admin' ? 'bg-[#0AA6A6] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'}">
          <i data-lucide="shield" class="w-3.5 h-3.5"></i>
          <span>🛡️ Super Admin</span>
        </button>
        <button onclick="navigate('doctor')" class="px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${state.route === 'doctor' ? 'bg-[#0AA6A6] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'}">
          <i data-lucide="stethoscope" class="w-3.5 h-3.5"></i>
          <span>👨‍⚕️ Doctor Portal</span>
        </button>
        <button onclick="navigate('patient')" class="px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${state.route === 'patient' ? 'bg-[#0AA6A6] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'}">
          <i data-lucide="user" class="w-3.5 h-3.5"></i>
          <span>🧑‍🦱 Patient Portal</span>
        </button>
        <button onclick="navigate('marketing')" class="px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${state.route === 'marketing' ? 'bg-[#0AA6A6] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'}">
          <i data-lucide="globe" class="w-3.5 h-3.5"></i>
          <span>🌐 Public Website</span>
        </button>
      </div>

      <div class="flex items-center gap-3 text-xs">
        <span class="text-slate-300">Active Organization:</span>
        <span class="badge-teal text-xs font-bold bg-teal-400/20 text-teal-300">
          ${state.currentOrg.name} (${state.currentOrg.code})
        </span>
      </div>
    </div>
  `;
}

// ============================================================================
// 1. HOSPITAL ADMIN WORKSPACE (/app)
// ============================================================================

function renderHospitalApp() {
  return `
    ${renderUniversalTopBar()}
    <div class="flex h-[calc(100vh-42px)] overflow-hidden bg-[#F5F8FC]">
      <!-- Left Sidebar Navigation -->
      <aside class="w-64 bg-[#102E50] text-white flex flex-col shrink-0">
        <!-- Sidebar Brand Header -->
        <div class="p-5 flex items-center gap-3 border-b border-white/10 cursor-pointer" onclick="navigate('marketing')">
          <img src="/brand/mediclin-logo.png" alt="MEDICLIN" class="h-8 object-contain brightness-0 invert">
        </div>

        <!-- Active Organization Context -->
        <div class="px-5 py-3.5 bg-[#163B65]/60 border-b border-white/10 flex items-center justify-between">
          <div>
            <div class="text-[0.68rem] uppercase font-semibold text-teal-300 tracking-wider">Hospital Organization</div>
            <div class="text-sm font-bold text-white truncate w-40">${state.currentOrg.name}</div>
          </div>
          <span class="badge-teal text-[0.65rem] uppercase font-bold py-0.5 px-2 bg-teal-400/20 text-teal-300">
            ${state.currentOrg.subscription_tier}
          </span>
        </div>

        <!-- Navigation Menu Items -->
        <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1 text-sm font-medium">
          <button onclick="navigate('app', 'dashboard')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${state.appSubtab === 'dashboard' ? 'bg-[#0AA6A6] text-white font-semibold shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}">
            <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
            <span>Dashboard Overview</span>
          </button>

          <button onclick="navigate('app', 'patients')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${state.appSubtab === 'patients' ? 'bg-[#0AA6A6] text-white font-semibold shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}">
            <i data-lucide="users" class="w-4 h-4"></i>
            <span>Patient Records (EHR)</span>
          </button>

          <button onclick="navigate('app', 'doctors')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${state.appSubtab === 'doctors' ? 'bg-[#0AA6A6] text-white font-semibold shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}">
            <i data-lucide="stethoscope" class="w-4 h-4"></i>
            <span>Doctor Directory</span>
          </button>

          <button onclick="navigate('app', 'appointments')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${state.appSubtab === 'appointments' ? 'bg-[#0AA6A6] text-white font-semibold shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}">
            <i data-lucide="calendar" class="w-4 h-4"></i>
            <span>Appointments & OPD</span>
          </button>

          <button onclick="navigate('app', 'wards')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${state.appSubtab === 'wards' ? 'bg-[#0AA6A6] text-white font-semibold shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}">
            <i data-lucide="bed" class="w-4 h-4"></i>
            <span>Wards & Beds (IPD)</span>
          </button>

          <button onclick="navigate('app', 'pharmacy')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${state.appSubtab === 'pharmacy' ? 'bg-[#0AA6A6] text-white font-semibold shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}">
            <i data-lucide="pill" class="w-4 h-4"></i>
            <span>Pharmacy & POS</span>
          </button>

          <button onclick="navigate('app', 'laboratory')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${state.appSubtab === 'laboratory' ? 'bg-[#0AA6A6] text-white font-semibold shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}">
            <i data-lucide="flask-conical" class="w-4 h-4"></i>
            <span>Laboratory Diagnostics</span>
          </button>

          <button onclick="navigate('app', 'prescriptions')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${state.appSubtab === 'prescriptions' ? 'bg-[#0AA6A6] text-white font-semibold shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}">
            <i data-lucide="file-text" class="w-4 h-4"></i>
            <span>Digital Prescriptions</span>
          </button>

          <button onclick="navigate('tele_room')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-teal-300 hover:bg-teal-500/20 hover:text-white">
            <i data-lucide="video" class="w-4 h-4 text-teal-400"></i>
            <span>Live Telemedicine Room</span>
          </button>

          <button onclick="navigate('app', 'billing')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${state.appSubtab === 'billing' ? 'bg-[#0AA6A6] text-white font-semibold shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}">
            <i data-lucide="receipt" class="w-4 h-4"></i>
            <span>Billing & Accounts (৳)</span>
          </button>

          <button onclick="navigate('app', 'settings')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${state.appSubtab === 'settings' ? 'bg-[#0AA6A6] text-white font-semibold shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}">
            <i data-lucide="settings" class="w-4 h-4"></i>
            <span>Hospital Settings</span>
          </button>
        </nav>

        <!-- Sidebar User Footer -->
        <div class="p-4 border-t border-white/10 bg-[#0C223A] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&auto=format&fit=crop&q=80" alt="Admin" class="w-9 h-9 rounded-full object-cover border border-teal-400">
            <div class="truncate w-32">
              <div class="text-xs font-semibold text-white truncate">${state.user.fullName}</div>
              <div class="text-[0.65rem] text-teal-300 uppercase">${state.user.role.replace('_', ' ')}</div>
            </div>
          </div>
          <button onclick="navigate('marketing')" title="View Public Website" class="text-slate-400 hover:text-white">
            <i data-lucide="external-link" class="w-4 h-4"></i>
          </button>
        </div>
      </aside>

      <!-- Main Workspace View Container -->
      <main class="flex-1 flex flex-col overflow-y-auto">
        <!-- Top Workspace Bar -->
        <header class="h-16 bg-white border-b border-[#E3EAF2] px-8 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <span class="text-xs font-semibold text-[#718096]">Selected Hospital:</span>
            <!-- Hospital Switcher -->
            <select onchange="switchHospital(this.value)" class="text-xs font-bold text-[#102E50] bg-[#F5F8FC] border border-[#E3EAF2] rounded-lg px-2.5 py-1.5 focus:outline-none">
              <option value="org-cch" ${state.currentOrg.id === 'org-cch' ? 'selected' : ''}>MEDICLIN Hospital & Diagnostic Center (Main Campus)</option>
              <option value="org-dch" ${state.currentOrg.id === 'org-dch' ? 'selected' : ''}>Dhaka Central Hospital (Dhanmondi)</option>
              <option value="org-chi" ${state.currentOrg.id === 'org-chi' ? 'selected' : ''}>Chittagong Health Institute</option>
            </select>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-xs font-medium text-[#718096] bg-[#F5F8FC] px-3 py-1.5 rounded-full border border-[#E3EAF2]">
              Dhaka Time: <span class="font-bold text-[#102E50]">${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <button onclick="navigate('doctor')" class="text-xs font-semibold px-3 py-1.5 rounded-full bg-teal-50 text-[#0AA6A6] hover:bg-teal-100 flex items-center gap-1.5">
              <i data-lucide="stethoscope" class="w-3.5 h-3.5"></i>
              <span>Doctor View</span>
            </button>
            <button onclick="navigate('patient')" class="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-[#172B45] hover:bg-slate-200 flex items-center gap-1.5">
              <i data-lucide="user" class="w-3.5 h-3.5"></i>
              <span>Patient View</span>
            </button>
          </div>
        </header>

        <!-- Subtab Content Body -->
        <div class="p-8">
          ${renderHospitalSubtab()}
        </div>
      </main>
    </div>
  `;
}

// Subtab Router for /app
function renderHospitalSubtab() {
  switch (state.appSubtab) {
    case 'patients':
      return renderPatientsView();
    case 'doctors':
      return renderDoctorsView();
    case 'appointments':
      return renderAppointmentsView();
    case 'wards':
      return renderWardsView();
    case 'pharmacy':
      return renderPharmacyView();
    case 'laboratory':
      return renderLaboratoryView();
    case 'prescriptions':
      return renderPrescriptionsView();
    case 'billing':
      return renderBillingView();
    case 'settings':
      return renderSettingsView();
    case 'dashboard':
    default:
      return renderDashboardView();
  }
}

// 1.1 Hospital Dashboard View with Beautiful Hospital Building Banner
function renderDashboardView() {
  setTimeout(loadDashboardData, 50);
  return `
    <div class="space-y-8">
      <!-- Welcome Header & Hospital Image Banner -->
      <div class="relative rounded-3xl overflow-hidden shadow-lg border border-[#E3EAF2] h-52 bg-slate-900 flex items-end">
        <img src="${IMAGES.hospitals.main}" alt="Hospital Building" class="absolute inset-0 w-full h-full object-cover opacity-45">
        <div class="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center justify-between w-full text-white">
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/80 backdrop-blur-md text-white text-[0.7rem] font-bold uppercase tracking-wider mb-2">
              <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              24/7 Multi-Specialty Hospital Operations
            </div>
            <h1 class="text-2xl sm:text-3xl font-black drop-shadow-md">${state.currentOrg.name}</h1>
            <p class="text-xs text-slate-200 mt-1 max-w-xl drop-shadow">
              House 24, Road 11, Sector 4, Uttara, Dhaka • Emergency Hotline: +880 1711 223344
            </p>
          </div>
          <div class="flex items-center gap-3 mt-4 sm:mt-0">
            <button onclick="openRegisterPatientModal()" class="btn-primary text-xs py-2.5 px-5 shadow-lg bg-[#0AA6A6] hover:bg-[#168C91]">
              <i data-lucide="user-plus" class="w-4 h-4"></i>
              <span>+ Register Patient</span>
            </button>
            <button onclick="openBookAppointmentModal()" class="btn-outline text-xs py-2.5 px-5 bg-white/90 backdrop-blur-md text-[#102E50] hover:bg-white">
              <i data-lucide="calendar-plus" class="w-4 h-4 text-[#0AA6A6]"></i>
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="mediclin-card p-5">
          <div class="flex items-center justify-between">
            <div class="text-xs font-semibold text-[#718096]">Total Registered Patients</div>
            <div class="w-10 h-10 rounded-2xl bg-teal-50 text-[#0AA6A6] flex items-center justify-center">
              <i data-lucide="users" class="w-5 h-5"></i>
            </div>
          </div>
          <div id="stat-patients" class="text-2xl font-black text-[#102E50] mt-2">--</div>
          <div class="text-[0.72rem] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <i data-lucide="check-circle" class="w-3 h-3"></i>
            <span>Active Electronic Health Records</span>
          </div>
        </div>

        <div class="mediclin-card p-5">
          <div class="flex items-center justify-between">
            <div class="text-xs font-semibold text-[#718096]">Today's Appointments</div>
            <div class="w-10 h-10 rounded-2xl bg-teal-50 text-[#0AA6A6] flex items-center justify-center">
              <i data-lucide="calendar" class="w-5 h-5"></i>
            </div>
          </div>
          <div id="stat-appointments" class="text-2xl font-black text-[#102E50] mt-2">--</div>
          <div class="text-[0.72rem] text-teal-600 font-semibold mt-1">OPD & Telemedicine Queues</div>
        </div>

        <div class="mediclin-card p-5">
          <div class="flex items-center justify-between">
            <div class="text-xs font-semibold text-[#718096]">Currently Admitted (IPD)</div>
            <div class="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <i data-lucide="bed" class="w-5 h-5"></i>
            </div>
          </div>
          <div id="stat-admitted" class="text-2xl font-black text-[#102E50] mt-2">--</div>
          <div id="stat-available-beds" class="text-[0.72rem] text-[#718096] font-medium mt-1">Available Beds: --</div>
        </div>

        <div class="mediclin-card p-5">
          <div class="flex items-center justify-between">
            <div class="text-xs font-semibold text-[#718096]">Today's Revenue</div>
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i data-lucide="banknote" class="w-5 h-5"></i>
            </div>
          </div>
          <div id="stat-revenue" class="text-2xl font-black text-[#102E50] mt-2">৳ --</div>
          <div class="text-[0.72rem] text-emerald-600 font-semibold mt-1">Collected in BDT (৳)</div>
        </div>
      </div>

      <!-- Live Clinical Queue Table with Doctor & Patient Avatars -->
      <div class="mediclin-card p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-base font-bold text-[#102E50]">Today's Patient Consultations</h2>
            <p class="text-xs text-[#718096]">Real-time queue tracking with patient and doctor photo IDs.</p>
          </div>
          <button onclick="navigate('app', 'appointments')" class="text-xs font-semibold text-[#0AA6A6] hover:underline flex items-center gap-1">
            <span>View All Appointments</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="mediclin-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient Photo & Name</th>
                <th>Assigned Doctor</th>
                <th>Department</th>
                <th>Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="dashboard-appointments-body">
              <tr>
                <td colspan="8" class="text-center py-6 text-sm text-[#718096]">Loading live records...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Hospital Administration Quick Access Banner -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-8 relative rounded-2xl overflow-hidden shadow-md border border-[#E3EAF2] h-48 bg-slate-900 flex items-end">
          <img src="/images/hospital-administration.jpg" alt="Hospital Administration" class="absolute inset-0 w-full h-full object-cover opacity-50">
          <div class="relative z-10 p-5 flex flex-col sm:flex-row sm:items-center justify-between w-full text-white">
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/80 backdrop-blur-md text-[0.65rem] font-bold uppercase tracking-wider mb-1">
                Executive Leadership
              </div>
              <div class="text-lg font-black drop-shadow">Hospital Administration & Operations</div>
              <div class="text-xs text-slate-200 mt-0.5 drop-shadow">Managing clinical staff, pharmacy procurement, billing collections, and compliance.</div>
            </div>
            <button onclick="navigate('app', 'settings')" class="btn-teal text-xs py-2 px-4 shadow mt-3 sm:mt-0">
              Hospital Settings
            </button>
          </div>
        </div>

        <div class="lg:col-span-4 mediclin-card p-5 flex flex-col justify-between">
          <div>
            <div class="text-xs font-bold text-[#0AA6A6] uppercase tracking-wider">Quick Shortcuts</div>
            <h3 class="font-bold text-[#102E50] text-sm mt-1">Operational Modules</h3>
            <div class="grid grid-cols-2 gap-2 mt-3">
              <button onclick="navigate('app', 'pharmacy')" class="p-2.5 rounded-xl border border-[#E3EAF2] hover:border-[#0AA6A6] text-xs font-semibold text-[#102E50] text-left">
                💊 Pharmacy
              </button>
              <button onclick="navigate('app', 'laboratory')" class="p-2.5 rounded-xl border border-[#E3EAF2] hover:border-[#0AA6A6] text-xs font-semibold text-[#102E50] text-left">
                🔬 Laboratory
              </button>
              <button onclick="navigate('app', 'wards')" class="p-2.5 rounded-xl border border-[#E3EAF2] hover:border-[#0AA6A6] text-xs font-semibold text-[#102E50] text-left">
                🛏️ Inpatient Wards
              </button>
              <button onclick="navigate('app', 'billing')" class="p-2.5 rounded-xl border border-[#E3EAF2] hover:border-[#0AA6A6] text-xs font-semibold text-[#102E50] text-left">
                💳 Billing & MFS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadDashboardData() {
  const res = await api('/api/hospital/dashboard');
  if (!res.success) return;
  const data = res.data;

  const statPat = document.getElementById('stat-patients');
  if (statPat) statPat.innerText = data.total_patients;
  const statApt = document.getElementById('stat-appointments');
  if (statApt) statApt.innerText = data.today_appointments;
  const statAdm = document.getElementById('stat-admitted');
  if (statAdm) statAdm.innerText = data.admitted_patients;
  const statBeds = document.getElementById('stat-available-beds');
  if (statBeds) statBeds.innerText = `Available Beds: ${data.available_beds}`;
  const statRev = document.getElementById('stat-revenue');
  if (statRev) statRev.innerText = `৳ ${data.today_revenue_bdt.toLocaleString()}`;

  const tbody = document.getElementById('dashboard-appointments-body');
  if (tbody && data.recent_appointments) {
    if (data.recent_appointments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-sm text-[#718096]">No appointments scheduled for today yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = data.recent_appointments.map(a => {
      const patPhoto = IMAGES.patients[a.patient_id] || IMAGES.patients.defaultMale;
      const docPhoto = IMAGES.doctors[a.doctor_id] || IMAGES.doctors['doc-1'];
      return `
        <tr>
          <td class="font-black text-[#0AA6A6] text-base">#${a.token_number}</td>
          <td>
            <div class="flex items-center gap-3">
              <img src="${patPhoto}" alt="${a.patient_name}" class="w-10 h-10 rounded-full object-cover border-2 border-teal-200">
              <div>
                <div class="font-bold text-[#102E50] text-sm">${a.patient_name}</div>
                <div class="text-[0.7rem] text-[#718096]">UHID: ${a.patient_id}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="flex items-center gap-2.5">
              <img src="${docPhoto}" alt="${a.doctor_name}" class="w-8 h-8 rounded-full object-cover border border-[#E3EAF2]">
              <div>
                <div class="font-bold text-xs text-[#102E50]">${a.doctor_name}</div>
                <div class="text-[0.68rem] text-[#0AA6A6]">Specialist</div>
              </div>
            </div>
          </td>
          <td><span class="badge-teal text-[0.7rem]">${a.department_name}</span></td>
          <td class="text-xs font-semibold text-[#102E50]">${a.appointment_time}</td>
          <td>
            ${a.consultation_type === 'telemedicine' 
              ? '<span class="badge-teal text-[0.68rem]"><i data-lucide="video" class="w-3 h-3 inline"></i> Online Video</span>' 
              : '<span class="text-xs text-[#718096]">In-Person OPD</span>'}
          </td>
          <td>
            <span class="${a.status === 'completed' ? 'badge-success' : (a.status === 'in_progress' ? 'badge-teal' : 'badge-warning')} text-[0.72rem]">
              ${a.status.replace('_', ' ')}
            </span>
          </td>
          <td>
            ${a.consultation_type === 'telemedicine'
              ? `<button onclick="navigate('tele_room', null, { roomId: '${a.telemedicine_room_id}' })" class="btn-teal text-xs py-1 px-3">Join Room</button>`
              : `<button onclick="navigate('app', 'appointments')" class="btn-outline text-xs py-1 px-3">Manage</button>`}
          </td>
        </tr>
      `;
    }).join('');
    lucide.createIcons();
  }
}

// 1.2 Patient Management View with Beautiful Patient Photo Cards & Table
function renderPatientsView() {
  setTimeout(loadPatientsData, 50);
  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-[#102E50]">Patient Electronic Health Records (EHR)</h1>
          <p class="text-xs text-[#718096]">Unique Hospital Patient ID (UHID), verified photos, medical history, and allergy tracking.</p>
        </div>
        <button onclick="openRegisterPatientModal()" class="btn-primary text-xs py-2.5 px-5">
          <i data-lucide="user-plus" class="w-4 h-4"></i>
          <span>+ Register New Patient</span>
        </button>
      </div>

      <div class="mediclin-card p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="relative w-72">
            <input type="text" id="patient-search-input" onkeyup="filterPatientsTable()" placeholder="Search by UHID, Name, Phone..." class="form-input text-xs pl-8">
            <i data-lucide="search" class="w-4 h-4 text-[#718096] absolute left-2.5 top-2.5"></i>
          </div>
          <span class="text-xs text-[#718096]">Bangladesh National Health Records Standards</span>
        </div>

        <div class="overflow-x-auto">
          <table class="mediclin-table" id="patients-table">
            <thead>
              <tr>
                <th>UHID</th>
                <th>Patient Photo & Name</th>
                <th>Age / Gender</th>
                <th>Blood Group</th>
                <th>Phone Number</th>
                <th>Allergies</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="patients-tbody">
              <tr>
                <td colspan="7" class="text-center py-6 text-sm text-[#718096]">Loading patient records...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function loadPatientsData() {
  const res = await api('/api/patients');
  if (!res.success) return;
  const tbody = document.getElementById('patients-tbody');
  if (!tbody) return;

  if (res.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-sm text-[#718096]">No patients registered yet. Click "Register New Patient" above.</td></tr>`;
    return;
  }

  tbody.innerHTML = res.data.map(p => {
    const age = new Date().getFullYear() - new Date(p.date_of_birth).getFullYear();
    const allergiesText = p.allergies && p.allergies.length > 0 ? p.allergies.join(', ') : 'None';
    const photo = getPatientPhoto(p);
    return `
      <tr>
        <td class="font-bold text-[#0AA6A6] font-mono text-xs">${p.uhid}</td>
        <td>
          <div class="flex items-center gap-3">
            <img src="${photo}" alt="${p.full_name}" class="w-11 h-11 rounded-full object-cover border-2 border-teal-300 shadow-sm">
            <div>
              <div class="font-bold text-[#102E50] text-sm">${p.full_name}</div>
              <div class="text-[0.72rem] text-[#718096]">${p.address}</div>
            </div>
          </div>
        </td>
        <td class="text-xs font-medium">${age} yrs, ${p.gender}</td>
        <td>
          <span class="badge-teal text-[0.72rem] font-bold px-2.5 py-0.5">
            ${p.blood_group || 'N/A'}
          </span>
        </td>
        <td class="text-xs font-semibold text-[#102E50]">${p.phone}</td>
        <td>
          <span class="${allergiesText !== 'None' ? 'badge-danger' : 'text-xs text-[#718096]'} text-[0.7rem]">
            ${allergiesText}
          </span>
        </td>
        <td>
          <button onclick="openBookAppointmentModal('doc-1')" class="btn-outline text-xs py-1 px-3">
            Book Visit
          </button>
        </td>
      </tr>
    `;
  }).join('');
  lucide.createIcons();
}

function filterPatientsTable() {
  const query = document.getElementById('patient-search-input').value.toLowerCase();
  const rows = document.querySelectorAll('#patients-tbody tr');
  rows.forEach(r => {
    const text = r.innerText.toLowerCase();
    r.style.display = text.includes(query) ? '' : 'none';
  });
}

// 1.3 Doctor Management View with High-Definition Doctor Portraits
function renderDoctorsView() {
  setTimeout(loadDoctorsData, 50);
  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-[#102E50]">Doctors & Medical Specialists Directory</h1>
          <p class="text-xs text-[#718096]">BMDC certified physicians, department consultants, and telemedicine specialists.</p>
        </div>
        <button onclick="showToast('Hospital Owner credentials required for doctor onboarding.', 'info')" class="btn-primary text-xs py-2.5 px-5">
          <i data-lucide="user-plus" class="w-4 h-4"></i>
          <span>+ Onboard New Doctor</span>
        </button>
      </div>

      <div id="doctors-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="col-span-3 text-center py-10 text-sm text-[#718096]">Loading doctors catalog...</div>
      </div>
    </div>
  `;
}

async function loadDoctorsData() {
  const res = await api('/api/doctors');
  if (!res.success) return;
  const grid = document.getElementById('doctors-grid');
  if (!grid) return;

  grid.innerHTML = res.data.map(d => {
    const photo = getDoctorPhoto(d);
    return `
      <div class="mediclin-card p-6 flex flex-col justify-between overflow-hidden relative">
        <div class="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-bl-full pointer-events-none"></div>
        <div>
          <div class="flex items-start gap-4 mb-4">
            <img src="${photo}" alt="${d.full_name}" class="w-20 h-20 rounded-2xl object-cover border-2 border-teal-300 shadow-md">
            <div>
              <div class="flex items-center gap-1.5">
                <h3 class="font-bold text-[#102E50] text-base leading-tight">${d.full_name}</h3>
                <i data-lucide="check-circle" class="w-4 h-4 text-[#0AA6A6]"></i>
              </div>
              <div class="text-xs text-[#0AA6A6] font-bold mt-0.5">${d.specialization}</div>
              <div class="text-[0.72rem] text-[#718096] mt-0.5">BMDC Reg: <span class="font-bold text-[#102E50]">${d.bmdc_reg_number}</span></div>
              <div class="flex items-center gap-1 mt-1 text-xs text-amber-500 font-bold">
                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
                <span>${d.rating}</span>
                <span class="text-[0.7rem] text-[#718096] font-normal">(${d.review_count || 120} reviews)</span>
              </div>
            </div>
          </div>

          <p class="text-xs text-[#718096] line-clamp-2 mb-4 leading-relaxed">${d.bio || d.degrees}</p>

          <div class="grid grid-cols-2 gap-2 text-xs py-3 border-y border-[#E3EAF2] mb-4 bg-[#F8FAFD] px-3 rounded-xl">
            <div>
              <div class="text-[0.68rem] text-[#718096]">In-Person Fee:</div>
              <div class="font-bold text-[#102E50]">৳ ${d.consultation_fee_bdt} BDT</div>
            </div>
            <div>
              <div class="text-[0.68rem] text-[#718096]">Telemedicine:</div>
              <div class="font-bold text-[#0AA6A6]">৳ ${d.online_consultation_fee_bdt} BDT</div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="openBookAppointmentModal('${d.id}')" class="btn-primary w-full text-xs py-2.5">
            <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
            <span>Book Appointment</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

// 1.4 Inpatient Wards & Bed Occupancy Grid with Ward Photos
function renderWardsView() {
  setTimeout(loadWardsAndBedsData, 50);
  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-[#102E50]">Inpatient Wards & Bed Allocation (IPD)</h1>
          <p class="text-xs text-[#718096]">Interactive bed grid for ICU, VIP Executive Cabins, and General Wards with real-time occupancy status.</p>
        </div>
        <div class="flex items-center gap-4 text-xs font-semibold">
          <span class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-full bg-emerald-500"></span> Available Bed</span>
          <span class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-full bg-rose-500"></span> Occupied (Patient Admitted)</span>
        </div>
      </div>

      <!-- Inpatient Multidisciplinary Care Banner -->
      <div class="relative rounded-2xl overflow-hidden shadow-md border border-[#E3EAF2] h-44 bg-slate-900 flex items-end">
        <img src="/images/inpatient-team-care.jpg" alt="Inpatient Multidisciplinary Care Team" class="absolute inset-0 w-full h-full object-cover opacity-50">
        <div class="relative z-10 p-5 flex flex-col sm:flex-row sm:items-center justify-between w-full text-white">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/80 backdrop-blur-md text-[0.65rem] font-bold uppercase tracking-wider mb-1">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Active Inpatient Ward Operations
            </div>
            <div class="text-lg font-black drop-shadow">Bedside Care & Ward Allocation System</div>
            <div class="text-xs text-slate-200 mt-0.5 drop-shadow">Daily doctor rounds, medication administration records, and real-time bed tracking.</div>
          </div>
          <div class="hidden sm:flex items-center gap-3">
            <div class="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-xs font-bold">120 Total Beds</div>
            <div class="px-3 py-1.5 rounded-xl bg-emerald-500/80 backdrop-blur-md text-xs font-bold">92% Occupied</div>
          </div>
        </div>
      </div>

      <div id="wards-container" class="space-y-6">
        <div class="text-center py-10 text-sm text-[#718096]">Loading bed grid...</div>
      </div>
    </div>
  `;
}

async function loadWardsAndBedsData() {
  const res = await api('/api/wards-and-beds');
  if (!res.success) return;
  const container = document.getElementById('wards-container');
  if (!container) return;

  const { wards, beds } = res.data;
  container.innerHTML = wards.map(w => {
    const wardBeds = beds.filter(b => b.ward_id === w.id);
    const wardImg = IMAGES.wards[w.id] || IMAGES.hospitals.room;
    return `
      <div class="mediclin-card overflow-hidden">
        <!-- Ward Banner Photo & Info -->
        <div class="relative h-28 bg-slate-900 flex items-end">
          <img src="${wardImg}" alt="${w.name}" class="absolute inset-0 w-full h-full object-cover opacity-40">
          <div class="relative z-10 p-5 flex items-center justify-between w-full text-white">
            <div>
              <h3 class="font-extrabold text-lg text-white drop-shadow">${w.name}</h3>
              <div class="text-xs text-slate-200">${w.floor} • Daily Charge: <span class="font-bold text-teal-300">৳ ${w.daily_charge_bdt} BDT</span></div>
            </div>
            <span class="badge-teal text-xs font-bold bg-teal-500/80 text-white backdrop-blur-md">${wardBeds.length} Total Beds</span>
          </div>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            ${wardBeds.map(b => {
              const isAvail = b.status === 'available';
              const isOccup = b.status === 'occupied';
              const colorClass = isAvail 
                ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70' 
                : 'border-rose-200 bg-rose-50/60 hover:bg-rose-100/70';
              const badgeClass = isAvail ? 'bg-emerald-600' : 'bg-rose-600';
              return `
                <div onclick="toggleBedStatus('${b.id}', '${b.status}')" class="p-4 rounded-2xl border ${colorClass} cursor-pointer transition-all hover:shadow-md text-center">
                  <i data-lucide="bed" class="w-6 h-6 mx-auto mb-1 ${isAvail ? 'text-emerald-600' : 'text-rose-600'}"></i>
                  <div class="text-xs font-extrabold text-[#102E50]">${b.bed_number}</div>
                  <div class="mt-1.5">
                    <span class="text-[0.62rem] font-bold text-white px-2.5 py-0.5 rounded-full ${badgeClass} uppercase tracking-wider">
                      ${b.status}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

async function toggleBedStatus(bedId, currentStatus) {
  const nextStatus = currentStatus === 'available' ? 'occupied' : 'available';
  const res = await api(`/api/beds/${bedId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: nextStatus })
  });
  if (res.success) {
    showToast(`Bed status changed to ${nextStatus}`, 'success');
    loadWardsAndBedsData();
  }
}

// 1.5 Appointments View
function renderAppointmentsView() {
  setTimeout(loadAppointmentsData, 50);
  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-[#102E50]">Appointments & OPD Consultations</h1>
          <p class="text-xs text-[#718096]">Daily outpatient token allocation, double-booking prevention, and video consultation launcher.</p>
        </div>
        <button onclick="openBookAppointmentModal()" class="btn-teal text-xs py-2.5 px-5">
          <i data-lucide="calendar-plus" class="w-4 h-4"></i>
          <span>+ Book New Appointment</span>
        </button>
      </div>

      <!-- OPD & Clinical Operations Banner -->
      <div class="relative rounded-2xl overflow-hidden shadow-md border border-[#E3EAF2] h-44 bg-slate-900 flex items-end">
        <img src="/images/opd-clinic-operations.jpg" alt="OPD Clinic Operations" class="absolute inset-0 w-full h-full object-cover opacity-50">
        <div class="relative z-10 p-5 flex flex-col sm:flex-row sm:items-center justify-between w-full text-white">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/80 backdrop-blur-md text-[0.65rem] font-bold uppercase tracking-wider mb-1">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Live Outpatient (OPD) Department
            </div>
            <div class="text-lg font-black drop-shadow">Doctor Chambers & Patient Token Queue</div>
            <div class="text-xs text-slate-200 mt-0.5 drop-shadow">Automated token calling, triage routing, and digital prescription coordination.</div>
          </div>
          <div class="hidden sm:flex items-center gap-3">
            <div class="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-xs font-bold">14 Active Chambers</div>
            <div class="px-3 py-1.5 rounded-xl bg-teal-500/80 backdrop-blur-md text-xs font-bold">Queue Wait: ~10m</div>
          </div>
        </div>
      </div>

      <div class="mediclin-card p-6">
        <div class="overflow-x-auto">
          <table class="mediclin-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Date & Time</th>
                <th>Patient Details</th>
                <th>Doctor</th>
                <th>Type</th>
                <th>Fee (৳)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="appointments-tbody">
              <tr>
                <td colspan="8" class="text-center py-6 text-sm text-[#718096]">Loading appointments...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function loadAppointmentsData() {
  const res = await api('/api/appointments');
  if (!res.success) return;
  const tbody = document.getElementById('appointments-tbody');
  if (!tbody) return;

  if (res.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-sm text-[#718096]">No appointments recorded.</td></tr>`;
    return;
  }

  tbody.innerHTML = res.data.map(a => `
    <tr>
      <td class="font-black text-[#0AA6A6] text-base">#${a.token_number}</td>
      <td>
        <div class="font-bold text-[#102E50] text-xs">${a.appointment_date}</div>
        <div class="text-[0.72rem] text-[#718096]">${a.appointment_time}</div>
      </td>
      <td>
        <div class="font-bold text-[#102E50]">${a.patient_name}</div>
        <div class="text-[0.7rem] text-[#718096]">${a.patient_phone || a.patient_uhid}</div>
      </td>
      <td>
        <div class="font-semibold text-xs text-[#102E50]">${a.doctor_name}</div>
        <div class="text-[0.68rem] text-[#0AA6A6]">${a.doctor_specialization || ''}</div>
      </td>
      <td>
        ${a.consultation_type === 'telemedicine' 
          ? '<span class="badge-teal text-[0.7rem]"><i data-lucide="video" class="w-3 h-3 inline"></i> Online</span>' 
          : '<span class="text-xs text-[#718096]">In-Person</span>'}
      </td>
      <td class="text-xs font-bold text-[#102E50]">৳ ${a.fee_bdt}</td>
      <td>
        <span class="${a.status === 'completed' ? 'badge-success' : (a.status === 'in_progress' ? 'badge-teal' : 'badge-warning')} text-[0.72rem]">
          ${a.status.replace('_', ' ')}
        </span>
      </td>
      <td class="space-x-1">
        ${a.consultation_type === 'telemedicine' && a.telemedicine_room_id
          ? `<button onclick="navigate('tele_room', null, { roomId: '${a.telemedicine_room_id}' })" class="btn-teal text-xs py-1 px-3">Join Video</button>`
          : `<button onclick="updateAppointmentStatus('${a.id}', 'completed')" class="btn-outline text-xs py-1 px-2.5">Complete</button>`}
      </td>
    </tr>
  `).join('');
  lucide.createIcons();
}

async function updateAppointmentStatus(id, status) {
  const res = await api(`/api/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  if (res.success) {
    showToast(`Appointment status updated to ${status}`, 'success');
    loadAppointmentsData();
  }
}

// 1.6 Pharmacy & POS View
function renderPharmacyView() {
  setTimeout(loadPharmacyData, 50);
  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-[#102E50]">Hospital Pharmacy & Medication Inventory</h1>
          <p class="text-xs text-[#718096]">Stock management, batch expiry tracking, and prescription dispensing POS.</p>
        </div>
        <button onclick="openAddMedicineModal()" class="btn-primary text-xs py-2.5 px-5">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>+ Add New Medicine</span>
        </button>
      </div>

      <div class="mediclin-card p-6">
        <div class="overflow-x-auto">
          <table class="mediclin-table">
            <thead>
              <tr>
                <th>Brand Name</th>
                <th>Generic Name</th>
                <th>Manufacturer</th>
                <th>Batch #</th>
                <th>Stock Units</th>
                <th>Selling Price</th>
                <th>Expiry Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="pharmacy-tbody">
              <tr>
                <td colspan="8" class="text-center py-6 text-sm text-[#718096]">Loading medicines...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function loadPharmacyData() {
  const res = await api('/api/pharmacy');
  if (!res.success) return;
  const tbody = document.getElementById('pharmacy-tbody');
  if (!tbody) return;

  tbody.innerHTML = res.data.map(m => {
    const isLowStock = m.stock_quantity <= m.min_alert_quantity;
    return `
      <tr>
        <td>
          <div class="font-bold text-[#102E50]">${m.brand_name}</div>
          <div class="text-[0.7rem] text-[#718096]">${m.category}</div>
        </td>
        <td class="text-xs text-[#172B45] font-medium">${m.generic_name}</td>
        <td class="text-xs text-[#718096]">${m.manufacturer}</td>
        <td class="text-xs font-mono font-semibold">${m.batch_number}</td>
        <td>
          <span class="${isLowStock ? 'badge-danger font-bold' : 'badge-teal font-bold'} text-xs">
            ${m.stock_quantity} ${m.unit}s
          </span>
          ${isLowStock ? '<div class="text-[0.65rem] text-rose-600 font-bold mt-0.5">Low Stock Alert</div>' : ''}
        </td>
        <td class="text-xs font-bold text-[#102E50]">৳ ${m.selling_price_bdt}</td>
        <td class="text-xs text-[#718096]">${m.expiry_date}</td>
        <td>
          <button onclick="openDispenseModal('${m.id}', '${m.brand_name}', ${m.stock_quantity})" class="btn-teal text-xs py-1 px-3">
            Dispense
          </button>
        </td>
      </tr>
    `;
  }).join('');
  lucide.createIcons();
}

// 1.7 Laboratory Diagnostics View
function renderLaboratoryView() {
  setTimeout(loadLaboratoryData, 50);
  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-[#102E50]">Diagnostic Laboratory & Radiology Reports</h1>
          <p class="text-xs text-[#718096]">Pathology orders, specimen tracking, technician result verification, and official patient reports.</p>
        </div>
        <button onclick="openOrderLabTestModal()" class="btn-primary text-xs py-2.5 px-5">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>+ Order Diagnostic Test</span>
        </button>
      </div>

      <div class="mediclin-card p-6">
        <h3 class="font-bold text-[#102E50] text-sm mb-4">Pending & Verified Test Orders</h3>
        <div class="overflow-x-auto">
          <table class="mediclin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Patient Name</th>
                <th>Diagnostic Test</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="lab-orders-tbody">
              <tr>
                <td colspan="7" class="text-center py-6 text-sm text-[#718096]">Loading diagnostic orders...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function loadLaboratoryData() {
  const res = await api('/api/laboratory/orders');
  if (!res.success) return;
  const tbody = document.getElementById('lab-orders-tbody');
  if (!tbody) return;

  if (res.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-sm text-[#718096]">No diagnostic orders placed yet. Click "+ Order Diagnostic Test" above.</td></tr>`;
    return;
  }

  tbody.innerHTML = res.data.map(o => `
    <tr>
      <td class="font-bold text-[#0AA6A6] text-xs font-mono">${o.order_number}</td>
      <td>
        <div class="font-bold text-[#102E50]">${o.patient_name}</div>
        <div class="text-[0.7rem] text-[#718096]">UHID: ${o.patient_uhid}</div>
      </td>
      <td class="text-xs font-semibold text-[#102E50]">${o.test_name}</td>
      <td><span class="badge-teal text-[0.7rem] uppercase">${o.test_category}</span></td>
      <td class="text-xs font-bold text-[#102E50]">৳ ${o.price_bdt}</td>
      <td>
        <span class="${o.status === 'verified' ? 'badge-success' : 'badge-warning'} text-[0.72rem]">
          ${o.status}
        </span>
      </td>
      <td>
        ${o.status === 'ordered'
          ? `<button onclick="openEnterLabResultModal('${o.id}', '${o.test_name}')" class="btn-teal text-xs py-1 px-3">Enter Result</button>`
          : `<span class="text-xs text-emerald-600 font-bold">Verified: ${o.result_value || 'Normal'}</span>`}
      </td>
    </tr>
  `).join('');
  lucide.createIcons();
}

// 1.8 Digital Prescriptions View
function renderPrescriptionsView() {
  setTimeout(loadPrescriptionsData, 50);
  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-[#102E50]">Digital Prescriptions & E-Rx Archive</h1>
          <p class="text-xs text-[#718096]">Doctor signed prescriptions with medication dosages, vitals, and printable PDF layout.</p>
        </div>
        <button onclick="openCreatePrescriptionModal()" class="btn-teal text-xs py-2.5 px-5">
          <i data-lucide="file-plus" class="w-4 h-4"></i>
          <span>+ Write Digital Prescription</span>
        </button>
      </div>

      <div class="mediclin-card p-6">
        <div class="overflow-x-auto">
          <table class="mediclin-table">
            <thead>
              <tr>
                <th>Rx #</th>
                <th>Date</th>
                <th>Patient Details</th>
                <th>Prescribing Doctor</th>
                <th>Diagnosis</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="prescriptions-tbody">
              <tr>
                <td colspan="6" class="text-center py-6 text-sm text-[#718096]">Loading prescriptions archive...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function loadPrescriptionsData() {
  const res = await api('/api/prescriptions');
  if (!res.success) return;
  const tbody = document.getElementById('prescriptions-tbody');
  if (!tbody) return;

  tbody.innerHTML = res.data.map(rx => `
    <tr>
      <td class="font-bold text-[#0AA6A6] font-mono">${rx.prescription_number}</td>
      <td class="text-xs text-[#718096]">${rx.date}</td>
      <td>
        <div class="font-bold text-[#102E50]">${rx.patient_name}</div>
        <div class="text-[0.7rem] text-[#718096]">UHID: ${rx.patient_uhid}</div>
      </td>
      <td>
        <div class="font-bold text-xs text-[#102E50]">${rx.doctor_name}</div>
        <div class="text-[0.68rem] text-[#718096]">BMDC: ${rx.doctor_bmdc}</div>
      </td>
      <td class="text-xs font-medium text-[#172B45] max-w-xs truncate">${rx.diagnosis}</td>
      <td>
        <button onclick="viewPrescriptionPrint('${rx.id}')" class="btn-outline text-xs py-1 px-3 flex items-center gap-1.5">
          <i data-lucide="printer" class="w-3.5 h-3.5 text-[#0AA6A6]"></i>
          <span>Print / PDF</span>
        </button>
      </td>
    </tr>
  `).join('');
  lucide.createIcons();
}

// 1.9 Billing & Accounts View (BDT ৳)
function renderBillingView() {
  setTimeout(loadBillingData, 50);
  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-[#102E50]">Billing, Accounts & Payments</h1>
          <p class="text-xs text-[#718096]">Patient invoices, admission charges, bKash & Nagad MFS transactions in BDT (৳).</p>
        </div>
        <button onclick="openCreateInvoiceModal()" class="btn-primary text-xs py-2.5 px-5">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>+ Generate New Invoice</span>
        </button>
      </div>

      <div class="mediclin-card p-6">
        <div class="overflow-x-auto">
          <table class="mediclin-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Patient</th>
                <th>Grand Total</th>
                <th>Paid Amount</th>
                <th>Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="billing-tbody">
              <tr>
                <td colspan="7" class="text-center py-6 text-sm text-[#718096]">Loading invoices...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function loadBillingData() {
  const res = await api('/api/billing/invoices');
  if (!res.success) return;
  const tbody = document.getElementById('billing-tbody');
  if (!tbody) return;

  tbody.innerHTML = res.data.map(inv => `
    <tr>
      <td class="font-bold text-[#0AA6A6] font-mono">${inv.invoice_number}</td>
      <td>
        <div class="font-bold text-[#102E50]">${inv.patient_name}</div>
        <div class="text-[0.7rem] text-[#718096]">${inv.patient_phone || ''}</div>
      </td>
      <td class="font-bold text-xs text-[#102E50]">৳ ${inv.grand_total_bdt.toLocaleString()} BDT</td>
      <td class="text-xs text-emerald-600 font-bold">৳ ${inv.paid_amount_bdt.toLocaleString()}</td>
      <td class="text-xs font-bold ${inv.due_amount_bdt > 0 ? 'text-rose-600' : 'text-[#718096]'}">
        ৳ ${inv.due_amount_bdt.toLocaleString()}
      </td>
      <td>
        <span class="${inv.status === 'paid' ? 'badge-success' : (inv.status === 'partially_paid' ? 'badge-warning' : 'badge-danger')} text-[0.72rem]">
          ${inv.status.replace('_', ' ')}
        </span>
      </td>
      <td>
        ${inv.due_amount_bdt > 0
          ? `<button onclick="openPaymentModal('${inv.id}', ${inv.due_amount_bdt})" class="btn-teal text-xs py-1 px-3">Pay via MFS / Cash</button>`
          : `<span class="badge-success text-xs"><i data-lucide="check" class="w-3 h-3 inline"></i> Cleared</span>`}
      </td>
    </tr>
  `).join('');
  lucide.createIcons();
}

// 1.10 Hospital Settings View
function renderSettingsView() {
  return `
    <div class="max-w-4xl space-y-6">
      <div>
        <h1 class="text-2xl font-black text-[#102E50]">Hospital Profile & System Configuration</h1>
        <p class="text-xs text-[#718096]">Manage institution branding, Bangladesh tax rate, and notification webhooks.</p>
      </div>

      <div class="mediclin-card p-6 space-y-5">
        <h3 class="font-bold text-sm text-[#102E50] border-b border-[#E3EAF2] pb-3">General Information</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Hospital Name</label>
            <input type="text" class="form-input text-xs" value="${state.currentOrg.name}" readonly>
          </div>
          <div>
            <label class="form-label">Hospital Code (UHID Prefix)</label>
            <input type="text" class="form-input text-xs" value="${state.currentOrg.code}" readonly>
          </div>
          <div>
            <label class="form-label">City & Country</label>
            <input type="text" class="form-input text-xs" value="${state.currentOrg.city}, Bangladesh" readonly>
          </div>
          <div>
            <label class="form-label">SaaS Subscription Tier</label>
            <input type="text" class="form-input text-xs font-bold text-[#0AA6A6]" value="${state.currentOrg.subscription_tier.toUpperCase()}" readonly>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// 2. PUBLIC MARKETING WEBSITE
// ============================================================================

function renderMarketing() {
  return `
    ${renderUniversalTopBar()}
    <!-- Top Navigation Bar -->
    <header class="bg-white/90 backdrop-blur-md sticky top-[42px] z-50 border-b border-[#E3EAF2]">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-3 cursor-pointer" onclick="navigate('marketing')">
          <img src="/brand/mediclin-logo.png" alt="MEDICLIN" class="h-11 object-contain">
        </div>

        <!-- Center Nav Links -->
        <nav class="hidden lg:flex items-center gap-6 text-[0.92rem] font-medium text-[#172B45]">
          <a href="#hero" class="text-[#0AA6A6] font-semibold flex items-center gap-1 border-b-2 border-[#0AA6A6] pb-1">Home</a>
          <a href="#features" class="hover:text-[#0AA6A6]">Features</a>
          <a href="#opd-section" class="hover:text-[#0AA6A6]">OPD & Clinic</a>
          <a href="#benefits-section" class="hover:text-[#0AA6A6]">7 Reasons</a>
          <a href="#ipd-section" class="hover:text-[#0AA6A6]">Wards & Bed Care</a>
          <a href="#admin-section" class="hover:text-[#0AA6A6]">Administration</a>
          <a href="#board-section" class="hover:text-[#0AA6A6]">Medical Board</a>
          <a href="#pricing-section" class="hover:text-[#0AA6A6]">Pricing</a>
        </nav>

        <!-- Right Action Controls -->
        <div class="flex items-center gap-4">
          <button onclick="navigate('app', 'dashboard')" class="text-sm font-semibold text-[#102E50] px-4 py-2 rounded-full border border-[#E3EAF2] hover:bg-[#F5F8FC] flex items-center gap-2">
            <i data-lucide="layout-dashboard" class="w-4 h-4 text-[#0AA6A6]"></i>
            <span>Open Hospital Panel</span>
          </button>
          
          <button onclick="openRegisterHospitalModal()" class="btn-teal">
            <span>Get Started Free</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section id="hero" class="relative pt-12 pb-24 overflow-hidden bg-gradient-to-b from-[#F5F8FC] via-[#EBF3FA] to-[#F5F8FC]">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <!-- Left Hero Copy -->
        <div class="lg:col-span-6 space-y-6">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0AA6A6]/10 text-[#0AA6A6] font-semibold text-xs uppercase tracking-wider border border-[#0AA6A6]/20">
            <i data-lucide="shield-check" class="w-4 h-4"></i>
            <span>Multi-Hospital SaaS Platform</span>
          </div>

          <h1 class="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-[#102E50] leading-[1.15] tracking-tight">
            Hospital Management. <br><span class="text-[#0AA6A6]">Simplified.</span>
          </h1>

          <p class="text-lg text-[#718096] max-w-xl font-normal leading-relaxed">
            A powerful, secure and intelligent hospital management solution for modern healthcare institutions. Streamline admissions, OPD queues, electronic health records, pharmacy, and online doctor telemedicine.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-wrap items-center gap-4 pt-2">
            <button onclick="navigate('app', 'dashboard')" class="btn-primary text-base py-3 px-7">
              <span>Go to Admin Dashboard</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
            <button onclick="navigate('tele_room')" class="btn-outline text-base py-3 px-6 bg-white">
              <i data-lucide="video" class="w-5 h-5 text-[#0AA6A6]"></i>
              <span>Live Telemedicine</span>
            </button>
          </div>

          <!-- Trust Proof Metrics -->
          <div class="grid grid-cols-3 gap-6 pt-6 border-t border-[#E3EAF2]/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#0AA6A6] border border-[#E3EAF2]">
                <i data-lucide="building-2" class="w-5 h-5"></i>
              </div>
              <div>
                <div class="text-xl font-bold text-[#102E50]">500+</div>
                <div class="text-xs text-[#718096]">Hospitals Trust Us</div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#0AA6A6] border border-[#E3EAF2]">
                <i data-lucide="users" class="w-5 h-5"></i>
              </div>
              <div>
                <div class="text-xl font-bold text-[#102E50]">50K+</div>
                <div class="text-xs text-[#718096]">Happy Users</div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#0AA6A6] border border-[#E3EAF2]">
                <i data-lucide="shield" class="w-5 h-5"></i>
              </div>
              <div>
                <div class="text-xl font-bold text-[#102E50]">99.9%</div>
                <div class="text-xs text-[#718096]">Uptime Guarantee</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Hero Visual Mockup -->
        <div class="lg:col-span-6 relative">
          <div class="relative bg-white rounded-3xl p-6 shadow-2xl border border-[#E3EAF2] mockup-perspective">
            <div class="flex items-center justify-between pb-4 border-b border-[#E3EAF2]">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-red-400"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div class="w-3 h-3 rounded-full bg-green-400"></div>
                <span class="text-xs font-semibold text-[#102E50] ml-2">MEDICLIN Hospital & Diagnostic Center</span>
              </div>
              <span class="badge-teal text-xs">Live Database</span>
            </div>

            <div class="my-5 rounded-2xl overflow-hidden relative h-36">
              <img src="${IMAGES.hospitals.main}" alt="Modern Hospital Building" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-[#102E50]/90 to-transparent flex items-end p-4 text-white">
                <div>
                  <div class="font-bold text-sm">Uttara Clinical Campus</div>
                  <div class="text-[0.7rem] text-teal-300">24/7 Emergency & Inpatient Trauma Care</div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-4 gap-2 mt-4 text-center">
              <button onclick="navigate('app', 'dashboard')" class="p-2.5 bg-white border border-[#E3EAF2] hover:border-[#0AA6A6] rounded-xl text-xs font-semibold text-[#102E50] shadow-sm flex flex-col items-center gap-1">
                <i data-lucide="layout-dashboard" class="w-4 h-4 text-[#0AA6A6]"></i>
                <span>Admin Panel</span>
              </button>
              <button onclick="navigate('app', 'patients')" class="p-2.5 bg-white border border-[#E3EAF2] hover:border-[#0AA6A6] rounded-xl text-xs font-semibold text-[#102E50] shadow-sm flex flex-col items-center gap-1">
                <i data-lucide="user-plus" class="w-4 h-4 text-[#0AA6A6]"></i>
                <span>Patients (EHR)</span>
              </button>
              <button onclick="navigate('app', 'doctors')" class="p-2.5 bg-white border border-[#E3EAF2] hover:border-[#0AA6A6] rounded-xl text-xs font-semibold text-[#102E50] shadow-sm flex flex-col items-center gap-1">
                <i data-lucide="stethoscope" class="w-4 h-4 text-[#0AA6A6]"></i>
                <span>Doctors</span>
              </button>
              <button onclick="navigate('tele_room')" class="p-2.5 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-xl text-xs font-semibold text-[#0AA6A6] shadow-sm flex flex-col items-center gap-1">
                <i data-lucide="video" class="w-4 h-4 text-[#0AA6A6]"></i>
                <span>Telemedicine</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Powerful Features Grid -->
    <section id="features" class="py-20 bg-white border-t border-[#E3EAF2]">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <div class="text-xs font-bold tracking-widest text-[#0AA6A6] uppercase mb-2">POWERFUL FEATURES</div>
          <h2 class="text-3xl md:text-4xl font-extrabold text-[#102E50]">
            Everything You Need for Smart Hospital Management
          </h2>
          <p class="text-[#718096] mt-3 text-base">
            From patient registration to advanced analytics — MEDICLIN brings all hospital operations under one unified platform.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <!-- Left: Medical Team Image -->
          <div class="lg:col-span-5 relative">
            <div class="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80" 
                   alt="MEDICLIN Healthcare Professional Team" 
                   class="w-full h-[480px] object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-[#102E50]/80 via-transparent to-transparent flex items-end p-6">
                <div class="text-white">
                  <div class="font-bold text-lg">Designed by Healthcare Specialists</div>
                  <div class="text-sm text-teal-200">Built for speed, accuracy, and clinical excellence</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: 8 Feature Grid Cards -->
          <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div onclick="navigate('app', 'patients')" class="p-5 rounded-2xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] hover:bg-white hover:shadow-md transition-all cursor-pointer">
              <div class="w-10 h-10 rounded-xl bg-teal-50 text-[#0AA6A6] flex items-center justify-center mb-3">
                <i data-lucide="users" class="w-5 h-5"></i>
              </div>
              <h3 class="font-bold text-[#102E50] text-base">Patient Management</h3>
              <p class="text-xs text-[#718096] mt-1">Unique Hospital Patient ID (UHID), digital health history, allergies, visits, and documents.</p>
            </div>

            <div onclick="navigate('app', 'doctors')" class="p-5 rounded-2xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] hover:bg-white hover:shadow-md transition-all cursor-pointer">
              <div class="w-10 h-10 rounded-xl bg-teal-50 text-[#0AA6A6] flex items-center justify-center mb-3">
                <i data-lucide="stethoscope" class="w-5 h-5"></i>
              </div>
              <h3 class="font-bold text-[#102E50] text-base">Doctor Directory</h3>
              <p class="text-xs text-[#718096] mt-1">BMDC registered doctor profiles, schedule slot management, and consultation fees.</p>
            </div>

            <div onclick="navigate('app', 'appointments')" class="p-5 rounded-2xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] hover:bg-white hover:shadow-md transition-all cursor-pointer">
              <div class="w-10 h-10 rounded-xl bg-teal-50 text-[#0AA6A6] flex items-center justify-center mb-3">
                <i data-lucide="calendar" class="w-5 h-5"></i>
              </div>
              <h3 class="font-bold text-[#102E50] text-base">Appointment Scheduling</h3>
              <p class="text-xs text-[#718096] mt-1">Token queue management, doctor schedule slot picker, and automated double-booking prevention.</p>
            </div>

            <div onclick="navigate('app', 'wards')" class="p-5 rounded-2xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] hover:bg-white hover:shadow-md transition-all cursor-pointer">
              <div class="w-10 h-10 rounded-xl bg-teal-50 text-[#0AA6A6] flex items-center justify-center mb-3">
                <i data-lucide="bed" class="w-5 h-5"></i>
              </div>
              <h3 class="font-bold text-[#102E50] text-base">Wards & Bed Allocation</h3>
              <p class="text-xs text-[#718096] mt-1">Interactive bed grids for ICU, CCU, Cabins, General Ward, with real-time occupancy status.</p>
            </div>

            <div onclick="navigate('app', 'pharmacy')" class="p-5 rounded-2xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] hover:bg-white hover:shadow-md transition-all cursor-pointer">
              <div class="w-10 h-10 rounded-xl bg-teal-50 text-[#0AA6A6] flex items-center justify-center mb-3">
                <i data-lucide="pill" class="w-5 h-5"></i>
              </div>
              <h3 class="font-bold text-[#102E50] text-base">Pharmacy Management</h3>
              <p class="text-xs text-[#718096] mt-1">Batch tracking, expiry alert triggers, prescription dispensing, and negative stock controls.</p>
            </div>

            <div onclick="navigate('app', 'laboratory')" class="p-5 rounded-2xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] hover:bg-white hover:shadow-md transition-all cursor-pointer">
              <div class="w-10 h-10 rounded-xl bg-teal-50 text-[#0AA6A6] flex items-center justify-center mb-3">
                <i data-lucide="flask-conical" class="w-5 h-5"></i>
              </div>
              <h3 class="font-bold text-[#102E50] text-base">Laboratory & Radiology</h3>
              <p class="text-xs text-[#718096] mt-1">Test orders, sample barcode tracking, result entry, verification, and PDF report delivery.</p>
            </div>

            <div onclick="navigate('app', 'billing')" class="p-5 rounded-2xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] hover:bg-white hover:shadow-md transition-all cursor-pointer">
              <div class="w-10 h-10 rounded-xl bg-teal-50 text-[#0AA6A6] flex items-center justify-center mb-3">
                <i data-lucide="credit-card" class="w-5 h-5"></i>
              </div>
              <h3 class="font-bold text-[#102E50] text-base">Billing & Invoicing</h3>
              <p class="text-xs text-[#718096] mt-1">Integrated BDT invoicing, partial dues tracking, and bKash, Nagad, card & cash receipts.</p>
            </div>

            <div onclick="navigate('tele_room')" class="p-5 rounded-2xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] hover:bg-white hover:shadow-md transition-all cursor-pointer">
              <div class="w-10 h-10 rounded-xl bg-teal-50 text-[#0AA6A6] flex items-center justify-center mb-3">
                <i data-lucide="video" class="w-5 h-5"></i>
              </div>
              <h3 class="font-bold text-[#102E50] text-base">Online Telemedicine</h3>
              <p class="text-xs text-[#718096] mt-1">Remote video & audio consultation, live patient vitals, in-call chat, and instant digital Rx.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 1: OPD & Clinical Workflow -->
    <section id="opd-section" class="py-20 bg-[#F5F8FC] border-t border-[#E3EAF2]">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Left: OPD Operations Image & Interactive Badges -->
          <div class="lg:col-span-6 relative">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
              <img src="/images/opd-clinic-operations.jpg" 
                   alt="Modern Outpatient Clinic & Doctor Consultation" 
                   class="w-full h-[460px] object-cover transition-transform duration-500 group-hover:scale-105">
              <div class="absolute inset-0 bg-gradient-to-t from-[#102E50]/90 via-[#102E50]/20 to-transparent flex flex-col justify-end p-6 text-white">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/90 backdrop-blur-md text-[0.7rem] font-bold uppercase tracking-wider mb-2 w-max">
                  <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  Live OPD Clinic Operations
                </div>
                <div class="font-bold text-xl">Digital Patient Triage & Queue Management</div>
                <div class="text-xs text-teal-200 mt-1">Wheelchair-accessible reception, fast doctor EHR consultation, and instant token callout</div>
              </div>
            </div>
            <!-- Floating Metric Card -->
            <div class="absolute -bottom-5 -right-5 bg-white rounded-2xl p-4 shadow-xl border border-[#E3EAF2] hidden sm:flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-[#0AA6A6]">
                <i data-lucide="clock" class="w-6 h-6"></i>
              </div>
              <div>
                <div class="text-xs text-[#718096] font-medium">Average OPD Wait Time</div>
                <div class="text-lg font-black text-[#102E50]">&lt; 12 Minutes</div>
              </div>
            </div>
          </div>

          <!-- Right: OPD Highlights -->
          <div class="lg:col-span-6 space-y-6">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0AA6A6]/10 text-[#0AA6A6] font-bold text-xs uppercase tracking-wider border border-[#0AA6A6]/20">
              <i data-lucide="stethoscope" class="w-4 h-4"></i>
              <span>Outpatient Department (OPD)</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-extrabold text-[#102E50] leading-tight">
              Streamline Doctor Chambers & Outpatient Queues
            </h2>
            <p class="text-[#718096] text-base leading-relaxed">
              Equip duty doctors and nurses with tablet-ready electronic health records. Eliminate crowded waiting rooms with automated token calling and direct prescription transmission to in-house pharmacy and lab.
            </p>

            <div class="space-y-4 pt-2">
              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-lg bg-teal-100/60 text-[#0AA6A6] flex items-center justify-center shrink-0 mt-0.5">
                  <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
                </div>
                <div>
                  <h4 class="font-bold text-[#102E50] text-sm">Automated Token Queue System</h4>
                  <p class="text-xs text-[#718096] mt-0.5">Prevents double-booking, manages walk-in emergencies, and displays real-time chamber monitors.</p>
                </div>
              </div>

              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-lg bg-teal-100/60 text-[#0AA6A6] flex items-center justify-center shrink-0 mt-0.5">
                  <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
                </div>
                <div>
                  <h4 class="font-bold text-[#102E50] text-sm">Tablet-Optimized Clinical Consultations</h4>
                  <p class="text-xs text-[#718096] mt-0.5">Physicians view lifetime patient history, vitals, drug allergy warnings, and previous diagnostic reports.</p>
                </div>
              </div>

              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-lg bg-teal-100/60 text-[#0AA6A6] flex items-center justify-center shrink-0 mt-0.5">
                  <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
                </div>
                <div>
                  <h4 class="font-bold text-[#102E50] text-sm">1-Click Digital Rx & Lab Investigations</h4>
                  <p class="text-xs text-[#718096] mt-0.5">Generate print-ready prescriptions with QR code verification and push medicine orders directly to billing.</p>
                </div>
              </div>
            </div>

            <div class="pt-2">
              <button onclick="navigate('app', 'appointments')" class="btn-primary">
                <span>View Appointment & OPD System</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 2: 7 Reasons Infographic & Benefits -->
    <section id="benefits-section" class="py-20 bg-white border-t border-[#E3EAF2]">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <div class="text-xs font-bold tracking-widest text-[#0AA6A6] uppercase mb-2">INDUSTRY EXCELLENCE</div>
          <h2 class="text-3xl md:text-4xl font-extrabold text-[#102E50]">
            7 Reasons Why Modern Hospitals Need MEDICLIN
          </h2>
          <p class="text-[#718096] mt-3 text-base">
            Modernize healthcare operations, boost patient safety, and maximize revenue with Bangladesh's premier hospital software.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Left: 7 Reasons Infographic Display -->
          <div class="lg:col-span-5 flex justify-center">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-50 max-w-md w-full">
              <img src="/images/hospital-software-benefits.jpg" 
                   alt="7 Reasons Why You Need Hospital Management Software" 
                   class="w-full h-auto object-contain">
              <div class="p-4 bg-gradient-to-r from-[#102E50] to-[#163B65] text-white flex items-center justify-between">
                <div>
                  <div class="font-bold text-sm">Architecture Infographic</div>
                  <div class="text-[0.7rem] text-teal-300">7 Core Pillars of Modern Healthcare SaaS</div>
                </div>
                <span class="badge-teal text-[0.65rem] uppercase">Official Guide</span>
              </div>
            </div>
          </div>

          <!-- Right: The 7 Pillars Structured Cards -->
          <div class="lg:col-span-7 space-y-3">
            <div class="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] transition-all flex items-start gap-4">
              <div class="w-8 h-8 rounded-xl bg-[#0AA6A6]/10 text-[#0AA6A6] font-black text-sm flex items-center justify-center shrink-0">1</div>
              <div>
                <h4 class="font-bold text-[#102E50] text-sm">Cloud-Based Platform</h4>
                <p class="text-xs text-[#718096] mt-0.5">24/7 web access across branches with 99.9% uptime, automated backups, and zero local server maintenance costs.</p>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] transition-all flex items-start gap-4">
              <div class="w-8 h-8 rounded-xl bg-[#0AA6A6]/10 text-[#0AA6A6] font-black text-sm flex items-center justify-center shrink-0">2</div>
              <div>
                <h4 class="font-bold text-[#102E50] text-sm">Data Security & Tenant Isolation</h4>
                <p class="text-xs text-[#718096] mt-0.5">PostgreSQL Row-Level Security (RLS) ensures total clinical and financial data isolation between hospitals.</p>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] transition-all flex items-start gap-4">
              <div class="w-8 h-8 rounded-xl bg-[#0AA6A6]/10 text-[#0AA6A6] font-black text-sm flex items-center justify-center shrink-0">3</div>
              <div>
                <h4 class="font-bold text-[#102E50] text-sm">Save Time and Easy To Manage</h4>
                <p class="text-xs text-[#718096] mt-0.5">Automated OPD token queues, instant pharmacy dispensing, and rapid admission cut staff administrative burden by 65%.</p>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] transition-all flex items-start gap-4">
              <div class="w-8 h-8 rounded-xl bg-[#0AA6A6]/10 text-[#0AA6A6] font-black text-sm flex items-center justify-center shrink-0">4</div>
              <div>
                <h4 class="font-bold text-[#102E50] text-sm">Multiple Location Management</h4>
                <p class="text-xs text-[#718096] mt-0.5">Oversee multiple branches, campus beds, diagnostic centers, and regional clinics from one unified Super Admin interface.</p>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] transition-all flex items-start gap-4">
              <div class="w-8 h-8 rounded-xl bg-[#0AA6A6]/10 text-[#0AA6A6] font-black text-sm flex items-center justify-center shrink-0">5</div>
              <div>
                <h4 class="font-bold text-[#102E50] text-sm">Save Patient Record (Lifetime UHID)</h4>
                <p class="text-xs text-[#718096] mt-0.5">Electronic Health Records (EHR) preserving medical history, vitals, allergies, previous visits, and discharge summaries.</p>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] transition-all flex items-start gap-4">
              <div class="w-8 h-8 rounded-xl bg-[#0AA6A6]/10 text-[#0AA6A6] font-black text-sm flex items-center justify-center shrink-0">6</div>
              <div>
                <h4 class="font-bold text-[#102E50] text-sm">Best Mobile & Web Responsive App</h4>
                <p class="text-xs text-[#718096] mt-0.5">Intuitive interfaces designed for tablets, desktop workstations, and mobile smartphones for doctors, nurses, and patients.</p>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E3EAF2] hover:border-[#0AA6A6] transition-all flex items-start gap-4">
              <div class="w-8 h-8 rounded-xl bg-[#0AA6A6]/10 text-[#0AA6A6] font-black text-sm flex items-center justify-center shrink-0">7</div>
              <div>
                <h4 class="font-bold text-[#102E50] text-sm">Manage Patient Diagnostic Reports</h4>
                <p class="text-xs text-[#718096] mt-0.5">Barcode-linked pathology tests, radiologist report approval workflows, and immediate patient SMS/portal delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 3: IPD & Inpatient Care -->
    <section id="ipd-section" class="py-20 bg-[#F5F8FC] border-t border-[#E3EAF2]">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Left: IPD Content -->
          <div class="lg:col-span-6 space-y-6 order-2 lg:order-1">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0AA6A6]/10 text-[#0AA6A6] font-bold text-xs uppercase tracking-wider border border-[#0AA6A6]/20">
              <i data-lucide="bed" class="w-4 h-4"></i>
              <span>Inpatient Department (IPD) & Wards</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-extrabold text-[#102E50] leading-tight">
              Multidisciplinary Bedside Care & Ward Allocation
            </h2>
            <p class="text-[#718096] text-base leading-relaxed">
              Empower doctors, surgeons, duty nurses, and clinical specialists to coordinate bedside rounds seamlessly with an interactive bed grid, continuous vitals tracking, and medication administration.
            </p>

            <div class="grid grid-cols-2 gap-4 pt-2">
              <div class="p-4 rounded-xl bg-white border border-[#E3EAF2] shadow-sm">
                <div class="w-8 h-8 rounded-lg bg-teal-50 text-[#0AA6A6] flex items-center justify-center mb-2">
                  <i data-lucide="layout-grid" class="w-4 h-4"></i>
                </div>
                <h4 class="font-bold text-[#102E50] text-sm">Interactive Bed Grid</h4>
                <p class="text-xs text-[#718096] mt-1">Real-time status for ICU, CCU, Executive VIP Cabins, and General Wards.</p>
              </div>

              <div class="p-4 rounded-xl bg-white border border-[#E3EAF2] shadow-sm">
                <div class="w-8 h-8 rounded-lg bg-teal-50 text-[#0AA6A6] flex items-center justify-center mb-2">
                  <i data-lucide="activity" class="w-4 h-4"></i>
                </div>
                <h4 class="font-bold text-[#102E50] text-sm">Bedside Vitals & Rounds</h4>
                <p class="text-xs text-[#718096] mt-1">Nurse shift handovers, automated vital signs charts, and clinical observations.</p>
              </div>

              <div class="p-4 rounded-xl bg-white border border-[#E3EAF2] shadow-sm">
                <div class="w-8 h-8 rounded-lg bg-teal-50 text-[#0AA6A6] flex items-center justify-center mb-2">
                  <i data-lucide="file-check" class="w-4 h-4"></i>
                </div>
                <h4 class="font-bold text-[#102E50] text-sm">Discharge Summaries</h4>
                <p class="text-xs text-[#718096] mt-1">Single-click automated discharge clearance with consolidated billing sync.</p>
              </div>

              <div class="p-4 rounded-xl bg-white border border-[#E3EAF2] shadow-sm">
                <div class="w-8 h-8 rounded-lg bg-teal-50 text-[#0AA6A6] flex items-center justify-center mb-2">
                  <i data-lucide="shield-alert" class="w-4 h-4"></i>
                </div>
                <h4 class="font-bold text-[#102E50] text-sm">Zero Double-Booking</h4>
                <p class="text-xs text-[#718096] mt-1">Automated database constraints prevent conflicting bed assignments.</p>
              </div>
            </div>

            <div class="pt-2">
              <button onclick="navigate('app', 'wards')" class="btn-primary">
                <span>Explore Bed Allocation Matrix</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <!-- Right: Inpatient Bedside Image -->
          <div class="lg:col-span-6 relative order-1 lg:order-2">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
              <img src="/images/inpatient-team-care.jpg" 
                   alt="Multidisciplinary Medical Care Team Around Inpatient Bed" 
                   class="w-full h-[460px] object-cover transition-transform duration-500 group-hover:scale-105">
              <div class="absolute inset-0 bg-gradient-to-t from-[#102E50]/90 via-[#102E50]/20 to-transparent flex flex-col justify-end p-6 text-white">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/90 backdrop-blur-md text-[0.7rem] font-bold uppercase tracking-wider mb-2 w-max">
                  <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  Inpatient Care Team
                </div>
                <div class="font-bold text-xl">Collaborative Bedside Clinical Excellence</div>
                <div class="text-xs text-teal-200 mt-1">Doctors, surgeons, and nurses reviewing patient recovery and medication charts</div>
              </div>
            </div>
            <!-- Bed occupancy indicator -->
            <div class="absolute -top-4 -left-4 bg-[#102E50] text-white rounded-2xl p-4 shadow-xl border border-teal-500/40 hidden sm:block">
              <div class="text-xs text-teal-300 font-bold uppercase">Ward Capacity</div>
              <div class="text-xl font-black text-white mt-0.5">120 Total Beds</div>
              <div class="text-[0.7rem] text-slate-300 flex items-center gap-1.5 mt-1">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span> 92% Active Occupancy
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 4: Hospital Administration & Leadership -->
    <section id="admin-section" class="py-20 bg-white border-t border-[#E3EAF2]">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Left: Administration Image -->
          <div class="lg:col-span-6 relative">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
              <img src="/images/hospital-administration.jpg" 
                   alt="Hospital Administration: A Path to Leadership in Healthcare" 
                   class="w-full h-[460px] object-cover transition-transform duration-500 group-hover:scale-105">
              <div class="absolute inset-0 bg-gradient-to-t from-[#102E50]/90 via-[#102E50]/20 to-transparent flex flex-col justify-end p-6 text-white">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/90 backdrop-blur-md text-[0.7rem] font-bold uppercase tracking-wider mb-2 w-max">
                  <span class="w-2 h-2 rounded-full bg-white"></span>
                  Executive Operations
                </div>
                <div class="font-bold text-xl">Hospital Administration & Governance</div>
                <div class="text-xs text-teal-200 mt-1">A path to visionary leadership in modern healthcare management</div>
              </div>
            </div>
          </div>

          <!-- Right: Administration Highlights -->
          <div class="lg:col-span-6 space-y-6">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0AA6A6]/10 text-[#0AA6A6] font-bold text-xs uppercase tracking-wider border border-[#0AA6A6]/20">
              <i data-lucide="building" class="w-4 h-4"></i>
              <span>Leadership & Operations</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-extrabold text-[#102E50] leading-tight">
              Hospital Administration: A Path to Leadership
            </h2>
            <p class="text-[#718096] text-base leading-relaxed">
              Give hospital administrators complete operational command over staff rosters, HR payroll, pharmacy stock procurement, accounts reconciliation, and automated regulatory reporting.
            </p>

            <div class="space-y-4 pt-2">
              <div class="p-4 rounded-xl bg-[#F8FAFD] border border-[#E3EAF2]">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-teal-50 text-[#0AA6A6] flex items-center justify-center font-bold">
                    <i data-lucide="receipt" class="w-4 h-4"></i>
                  </div>
                  <h4 class="font-bold text-[#102E50] text-sm">Financial Accountability & MFS Receipts</h4>
                </div>
                <p class="text-xs text-[#718096] mt-2">Track daily cash counters, bKash & Nagad payments, partial dues, and automated billing audits without revenue leakage.</p>
              </div>

              <div class="p-4 rounded-xl bg-[#F8FAFD] border border-[#E3EAF2]">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-teal-50 text-[#0AA6A6] flex items-center justify-center font-bold">
                    <i data-lucide="boxes" class="w-4 h-4"></i>
                  </div>
                  <h4 class="font-bold text-[#102E50] text-sm">Pharmacy & Laboratory Supply Chain</h4>
                </div>
                <p class="text-xs text-[#718096] mt-2">Automated re-order thresholds, batch expiry warnings, and negative inventory prevention across all depots.</p>
              </div>

              <div class="p-4 rounded-xl bg-[#F8FAFD] border border-[#E3EAF2]">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-teal-50 text-[#0AA6A6] flex items-center justify-center font-bold">
                    <i data-lucide="user-check" class="w-4 h-4"></i>
                  </div>
                  <h4 class="font-bold text-[#102E50] text-sm">BMDC Licensing & Doctor Rostering</h4>
                </div>
                <p class="text-xs text-[#718096] mt-2">Manage consultant duty hours, consultation revenue splits, and medical credential compliance with ease.</p>
              </div>
            </div>

            <div class="pt-2">
              <button onclick="navigate('app', 'dashboard')" class="btn-primary">
                <span>Enter Hospital Administrator Workspace</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 5: Executive Medical Board & Multi-Branch Governance -->
    <section id="board-section" class="py-20 bg-[#102E50] text-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Left: Board Content -->
          <div class="lg:col-span-6 space-y-6">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0AA6A6]/20 text-teal-300 font-bold text-xs uppercase tracking-wider border border-teal-500/30">
              <i data-lucide="users" class="w-4 h-4"></i>
              <span>Board Governance & Hospital Groups</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Executive Medical Board & Multi-Hospital Governance
            </h2>
            <p class="text-slate-300 text-base leading-relaxed">
              Equip hospital executive committees, board directors, and healthcare conglomerates with consolidated intelligence across multiple hospital campuses and diagnostic branches.
            </p>

            <div class="grid grid-cols-2 gap-4 pt-2">
              <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div class="text-2xl font-black text-teal-400">Multi-Tenant</div>
                <div class="text-xs text-slate-300 mt-1">Independent hospital branches with unified corporate oversight.</div>
              </div>

              <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div class="text-2xl font-black text-teal-400">MRR / ARR</div>
                <div class="text-xs text-slate-300 mt-1">Live subscription, recurring revenue, and department profit telemetry.</div>
              </div>

              <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div class="text-2xl font-black text-teal-400">Clinical Audit</div>
                <div class="text-xs text-slate-300 mt-1">Mortality reviews, infection rates, and treatment efficacy analytics.</div>
              </div>

              <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div class="text-2xl font-black text-teal-400">Zero Leakage</div>
                <div class="text-xs text-slate-300 mt-1">Full audit trails and time-limited platform support access.</div>
              </div>
            </div>

            <div class="pt-2">
              <button onclick="navigate('super_admin')" class="btn-teal text-sm py-3 px-6 shadow-xl">
                <span>Open Super Admin Control Center</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <!-- Right: Medical Board Photo -->
          <div class="lg:col-span-6 relative">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 group">
              <img src="/images/executive-medical-board.jpg" 
                   alt="Executive Medical Board Meeting & Hospital Governance" 
                   class="w-full h-[460px] object-cover transition-transform duration-500 group-hover:scale-105">
              <div class="absolute inset-0 bg-gradient-to-t from-[#102E50] via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <div class="font-bold text-lg">Hospital Group Executive Committee</div>
                <div class="text-xs text-teal-300 mt-0.5">Quarterly strategic review with MEDICLIN real-time clinical dashboards</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 6: Pricing & Subscription Plans -->
    <section id="pricing-section" class="py-20 bg-white border-t border-[#E3EAF2]">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <div class="text-xs font-bold tracking-widest text-[#0AA6A6] uppercase mb-2">PLANS & PRICING</div>
          <h2 class="text-3xl md:text-4xl font-extrabold text-[#102E50]">
            Transparent SaaS Pricing for Every Healthcare Institution
          </h2>
          <p class="text-[#718096] mt-3 text-base">
            All plans include unlimited patient registrations, bKash/Nagad integration, and 24/7 technical support.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Starter Tier -->
          <div class="mediclin-card p-8 flex flex-col justify-between border hover:border-[#0AA6A6] transition-all">
            <div>
              <span class="badge-teal text-xs">Diagnostic & Clinic</span>
              <h3 class="text-xl font-bold text-[#102E50] mt-3">Clinic Starter</h3>
              <p class="text-xs text-[#718096] mt-1">Ideal for private doctor clinics and diagnostic facilities.</p>
              <div class="mt-6 flex items-baseline gap-1">
                <span class="text-3xl font-black text-[#102E50]">৳ 9,999</span>
                <span class="text-xs text-[#718096]">/ month</span>
              </div>
              <ul class="space-y-3 mt-6 text-xs text-[#172B45]">
                <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-[#0AA6A6]"></i> Up to 10 Doctor Chambers</li>
                <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-[#0AA6A6]"></i> OPD Queue & Token Calling</li>
                <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-[#0AA6A6]"></i> Digital Prescription (Rx)</li>
                <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-[#0AA6A6]"></i> Invoicing & Cash Counter</li>
              </ul>
            </div>
            <button onclick="openRegisterHospitalModal()" class="btn-outline w-full mt-8 text-xs py-2.5">Get Started</button>
          </div>

          <!-- Professional Tier (Featured) -->
          <div class="mediclin-card p-8 flex flex-col justify-between border-2 border-[#0AA6A6] shadow-xl relative bg-gradient-to-b from-white to-teal-50/20">
            <div class="absolute -top-3.5 right-6 bg-[#0AA6A6] text-white text-[0.7rem] font-extrabold uppercase px-3 py-1 rounded-full shadow">
              Most Popular
            </div>
            <div>
              <span class="badge-success text-xs">Mid-Size Hospital</span>
              <h3 class="text-xl font-bold text-[#102E50] mt-3">Multi-Specialty Hospital</h3>
              <p class="text-xs text-[#718096] mt-1">Full hospital operations with IPD wards, pharmacy, and lab.</p>
              <div class="mt-6 flex items-baseline gap-1">
                <span class="text-3xl font-black text-[#0AA6A6]">৳ 24,999</span>
                <span class="text-xs text-[#718096]">/ month</span>
              </div>
              <ul class="space-y-3 mt-6 text-xs text-[#172B45]">
                <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-[#0AA6A6]"></i> Up to 50 Doctor Roster</li>
                <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-[#0AA6A6]"></i> 100 IPD Beds & Ward Grid</li>
                <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-[#0AA6A6]"></i> Integrated Pharmacy & Lab</li>
                <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-[#0AA6A6]"></i> Telemedicine Video Rooms</li>
                <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-[#0AA6A6]"></i> bKash, Nagad & Card Gateways</li>
              </ul>
            </div>
            <button onclick="openRegisterHospitalModal()" class="btn-teal w-full mt-8 text-xs py-2.5">Start 14-Day Free Trial</button>
          </div>

          <!-- Enterprise Tier -->
          <div class="mediclin-card p-8 flex flex-col justify-between border hover:border-[#0AA6A6] transition-all">
            <div>
              <span class="badge-primary text-xs">Medical College & Chains</span>
              <h3 class="text-xl font-bold text-[#102E50] mt-3">Enterprise Medical Center</h3>
              <p class="text-xs text-[#718096] mt-1">For multi-campus medical institutions and hospital chains.</p>
              <div class="mt-6 flex items-baseline gap-1">
                <span class="text-3xl font-black text-[#102E50]">৳ 59,999</span>
                <span class="text-xs text-[#718096]">/ month</span>
              </div>
              <ul class="space-y-3 mt-6 text-xs text-[#172B45]">
                <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-[#0AA6A6]"></i> Unlimited Doctors & Staff</li>
                <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-[#0AA6A6]"></i> Unlimited IPD Beds & Cabins</li>
                <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-[#0AA6A6]"></i> Multi-Branch Synchronization</li>
                <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-[#0AA6A6]"></i> Dedicated Account Manager</li>
              </ul>
            </div>
            <button onclick="openRegisterHospitalModal()" class="btn-primary w-full mt-8 text-xs py-2.5">Contact Enterprise Sales</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Professional Footer -->
    <footer class="bg-[#102E50] text-white pt-16 pb-12 border-t border-teal-500/20">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <img src="/brand/mediclin-logo.png" alt="MEDICLIN" class="h-10 object-contain brightness-0 invert">
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              One Platform. Every Hospital. Smarter Care. Enterprise multi-tenant healthcare SaaS built for modern hospitals and clinics.
            </p>
            <div class="text-xs text-teal-300 font-semibold">
              Emergency Support Hotline: +880 1711 223344
            </div>
          </div>

          <div>
            <h4 class="font-bold text-sm text-white mb-4">Hospital Modules</h4>
            <ul class="space-y-2 text-xs text-slate-300">
              <li><a href="#opd-section" class="hover:text-teal-300">Outpatient (OPD) & Triage</a></li>
              <li><a href="#ipd-section" class="hover:text-teal-300">Inpatient (IPD) & Bed Allocation</a></li>
              <li><a href="#admin-section" class="hover:text-teal-300">Pharmacy & Drug Inventory</a></li>
              <li><a href="#admin-section" class="hover:text-teal-300">Laboratory & Diagnostic Reports</a></li>
              <li><a href="#hero" class="hover:text-teal-300">Online Telemedicine Suite</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-sm text-white mb-4">Enterprise Governance</h4>
            <ul class="space-y-2 text-xs text-slate-300">
              <li><a href="#board-section" class="hover:text-teal-300">Executive Medical Board</a></li>
              <li><a href="#benefits-section" class="hover:text-teal-300">7 Reasons Why MEDICLIN</a></li>
              <li><a href="#pricing-section" class="hover:text-teal-300">SaaS Subscription Plans</a></li>
              <li><a href="javascript:void(0)" onclick="navigate('super_admin')" class="hover:text-teal-300">Super Admin Telemetry</a></li>
              <li><a href="javascript:void(0)" onclick="navigate('app', 'dashboard')" class="hover:text-teal-300">Hospital Admin Workspace</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-sm text-white mb-4">Headquarters & Compliance</h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              Level 8, Concord Tower, Road 11, Sector 4, Uttara, Dhaka-1230, Bangladesh.
            </p>
            <div class="mt-4 pt-3 border-t border-white/10 space-y-1">
              <div class="text-[0.7rem] text-slate-400">Payment Partnerships:</div>
              <div class="flex items-center gap-2 text-xs text-teal-300 font-bold">
                <span>bKash</span> • <span>Nagad</span> • <span>SSLCommerz</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <div>© 2026 MEDICLIN Technologies Ltd. All rights reserved.</div>
          <div class="flex items-center gap-6 mt-4 sm:mt-0">
            <span class="hover:text-white cursor-pointer">Privacy Policy</span>
            <span class="hover:text-white cursor-pointer">Terms of Service</span>
            <span class="hover:text-white cursor-pointer">HIPAA & DGHS Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  `;
}

// ============================================================================
// 3. SUPER ADMIN CONTROL CENTER (/super-admin)
// ============================================================================

function renderSuperAdmin() {
  setTimeout(loadSuperAdminData, 50);
  return `
    ${renderUniversalTopBar()}
    <div class="min-h-[calc(100vh-42px)] bg-[#F5F8FC] flex flex-col">
      <header class="bg-[#102E50] text-white h-16 px-8 flex items-center justify-between shrink-0 shadow-md">
        <div class="flex items-center gap-4 cursor-pointer" onclick="navigate('marketing')">
          <img src="/brand/mediclin-logo.png" alt="MEDICLIN" class="h-8 object-contain brightness-0 invert">
          <span class="text-xs font-extrabold uppercase tracking-widest bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/30">
            Super Admin Control Center
          </span>
        </div>
        <div class="flex items-center gap-4">
          <button onclick="navigate('app', 'dashboard')" class="btn-teal text-xs py-1.5 px-4">
            Switch to Hospital Workspace →
          </button>
        </div>
      </header>

      <main class="flex-1 max-w-7xl w-full mx-auto p-8 space-y-8">
        <div>
          <h1 class="text-2xl font-black text-[#102E50]">Platform Multi-Hospital Overview</h1>
          <p class="text-xs text-[#718096]">Super Admin SaaS telemetry: subscriptions, recurring revenue, and hospital tenant status.</p>
        </div>

        <!-- Medical Board & Group Governance Banner -->
        <div class="relative rounded-3xl overflow-hidden shadow-lg border border-[#E3EAF2] h-48 bg-slate-900 flex items-end">
          <img src="/images/executive-medical-board.jpg" alt="Executive Medical Board Governance" class="absolute inset-0 w-full h-full object-cover opacity-50">
          <div class="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center justify-between w-full text-white">
            <div>
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/80 backdrop-blur-md text-[0.7rem] font-bold uppercase tracking-wider mb-2">
                <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                Multi-Tenant Enterprise SaaS Telemetry
              </div>
              <h2 class="text-xl sm:text-2xl font-black drop-shadow-md">Healthcare Group & Hospital Board Governance</h2>
              <p class="text-xs text-slate-200 mt-1 max-w-xl drop-shadow">
                Centralized oversight for hospital chains, clinical audits, tenant lifecycle, and recurring revenue.
              </p>
            </div>
            <div class="mt-4 sm:mt-0 flex items-center gap-3">
              <button onclick="openRegisterHospitalModal()" class="btn-teal text-xs py-2 px-4 shadow">
                + Provision New Hospital
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="mediclin-card p-5">
            <div class="text-xs font-semibold text-[#718096]">Total Hospitals Registered</div>
            <div id="sa-total-hospitals" class="text-3xl font-black text-[#102E50] mt-1">--</div>
            <div id="sa-active-hospitals" class="text-xs text-emerald-600 font-semibold mt-1">-- Active Tenants</div>
          </div>

          <div class="mediclin-card p-5">
            <div class="text-xs font-semibold text-[#718096]">Monthly Recurring Revenue (MRR)</div>
            <div id="sa-mrr" class="text-3xl font-black text-[#0AA6A6] mt-1">৳ --</div>
            <div class="text-xs text-[#718096] font-medium mt-1">ARR: <span id="sa-arr" class="font-bold text-[#102E50]">৳ --</span></div>
          </div>

          <div class="mediclin-card p-5">
            <div class="text-xs font-semibold text-[#718096]">Total Platform Registered Users</div>
            <div id="sa-total-users" class="text-3xl font-black text-[#102E50] mt-1">--</div>
            <div class="text-xs text-teal-600 font-semibold mt-1">Doctors, Staff & Patients</div>
          </div>

          <div class="mediclin-card p-5">
            <div class="text-xs font-semibold text-[#718096]">Platform SLA Uptime</div>
            <div class="text-3xl font-black text-emerald-600 mt-1">99.98%</div>
            <div class="text-xs text-[#718096] font-medium mt-1">Zero Downtime Migration</div>
          </div>
        </div>

        <div class="mediclin-card p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-[#102E50]">Managed Hospital Organizations</h2>
              <p class="text-xs text-[#718096]">PostgreSQL RLS isolated tenant instances.</p>
            </div>
            <button onclick="openRegisterHospitalModal()" class="btn-primary text-xs py-2 px-4">
              + Register New Hospital
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="mediclin-table">
              <thead>
                <tr>
                  <th>Hospital Name</th>
                  <th>Tenant Code</th>
                  <th>City / Division</th>
                  <th>Subscription Tier</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="sa-hospitals-tbody">
                <tr>
                  <td colspan="6" class="text-center py-6 text-sm text-[#718096]">Loading hospitals...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `;
}

async function loadSuperAdminData() {
  const [statsRes, orgsRes] = await Promise.all([
    api('/api/super-admin/stats'),
    api('/api/super-admin/hospitals')
  ]);

  if (statsRes.success) {
    const s = statsRes.data;
    document.getElementById('sa-total-hospitals').innerText = s.total_hospitals;
    document.getElementById('sa-active-hospitals').innerText = `${s.active_hospitals} Active • ${s.trial_hospitals} Trial`;
    document.getElementById('sa-mrr').innerText = `৳ ${s.monthly_recurring_revenue_bdt.toLocaleString()}`;
    document.getElementById('sa-arr').innerText = `৳ ${s.annual_recurring_revenue_bdt.toLocaleString()}`;
    document.getElementById('sa-total-users').innerText = s.total_users;
  }

  if (orgsRes.success) {
    const tbody = document.getElementById('sa-hospitals-tbody');
    tbody.innerHTML = orgsRes.data.map(o => `
      <tr>
        <td>
          <div class="font-bold text-[#102E50]">${o.name}</div>
          <div class="text-[0.7rem] text-[#718096]">${o.email}</div>
        </td>
        <td class="font-bold text-[#0AA6A6] font-mono">${o.code}</td>
        <td class="text-xs">${o.city}, ${o.division}</td>
        <td>
          <span class="badge-teal text-[0.7rem] font-bold uppercase">${o.subscription_tier}</span>
        </td>
        <td>
          <span class="${o.status === 'active' ? 'badge-success' : (o.status === 'trial' ? 'badge-teal' : 'badge-danger')} text-[0.72rem] uppercase font-bold">
            ${o.status}
          </span>
        </td>
        <td>
          <button onclick="toggleHospitalStatus('${o.id}', '${o.status}')" class="btn-outline text-xs py-1 px-3">
            ${o.status === 'active' ? 'Suspend' : 'Activate'}
          </button>
        </td>
      </tr>
    `).join('');
    lucide.createIcons();
  }
}

async function toggleHospitalStatus(orgId, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
  const res = await api(`/api/super-admin/hospitals/${orgId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus })
  });
  if (res.success) {
    showToast(`Hospital organization status updated to ${newStatus}`, 'success');
    loadSuperAdminData();
  }
}

// ============================================================================
// 4. LIVE TELEMEDICINE VIDEO ROOM (/tele-room)
// ============================================================================

function renderTelemedicineRoom() {
  setTimeout(initTelemedicineRoom, 50);
  return `
    ${renderUniversalTopBar()}
    <div class="h-[calc(100vh-42px)] flex flex-col bg-[#0C1E33] text-white overflow-hidden">
      <!-- Room Top Bar -->
      <header class="h-14 bg-[#102E50] px-6 flex items-center justify-between border-b border-white/10 shrink-0">
        <div class="flex items-center gap-3">
          <button onclick="navigate('app', 'dashboard')" class="text-slate-300 hover:text-white flex items-center gap-1.5 text-xs">
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
            <span>Exit Consultation</span>
          </button>
          <span class="text-slate-500">|</span>
          <span class="badge-teal text-xs font-mono"><i data-lucide="lock" class="w-3 h-3 inline"></i> 256-Bit Encrypted Room</span>
          <span class="text-xs font-semibold text-slate-300" id="tele-patient-header">Patient: Loading...</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>LIVE 08:42</span>
          </div>
        </div>
      </header>

      <!-- Video Call Grid & Sidebar -->
      <div class="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        <!-- Main Video Screen -->
        <div class="col-span-8 flex flex-col justify-between p-6 relative bg-gradient-to-b from-[#102E50] to-[#0A1728]">
          <div class="flex-1 relative rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl flex items-center justify-center">
            <img src="${IMAGES.doctors['doc-1']}" 
                 alt="Doctor Live Video Feed" 
                 class="w-full h-full object-cover">

            <div class="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span class="font-bold text-white">Dr. Tariqul Islam (Interventional Cardiologist)</span>
            </div>

            <!-- Local Self Video Preview -->
            <div class="absolute bottom-5 right-5 w-44 h-32 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black">
              <img src="${IMAGES.patients['pat-2']}" 
                   alt="Patient Local Video" 
                   class="w-full h-full object-cover">
              <div class="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[0.65rem]">Roksana Parvin (You)</div>
            </div>
          </div>

          <div class="h-20 flex items-center justify-center gap-4 shrink-0 pt-4">
            <button id="btn-mic" onclick="toggleMic()" class="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all">
              <i data-lucide="mic" class="w-5 h-5"></i>
            </button>
            <button id="btn-cam" onclick="toggleCam()" class="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all">
              <i data-lucide="video" class="w-5 h-5"></i>
            </button>
            <button onclick="showToast('Screen sharing active', 'info')" class="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all">
              <i data-lucide="share" class="w-5 h-5"></i>
            </button>
            <button onclick="openCreatePrescriptionModal()" class="px-5 h-12 rounded-full bg-[#0AA6A6] hover:bg-[#168C91] font-bold text-xs flex items-center gap-2 text-white shadow-lg">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>Write Digital Rx</span>
            </button>
            <button onclick="endTeleCall()" class="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white shadow-lg transition-all">
              <i data-lucide="phone-off" class="w-5 h-5"></i>
            </button>
          </div>
        </div>

        <!-- Clinical Sidebar -->
        <div class="col-span-4 bg-[#102E50] border-l border-white/10 flex flex-col h-full">
          <div class="h-12 border-b border-white/10 flex items-center text-xs font-semibold">
            <button onclick="setTeleTab('chat')" id="tab-tele-chat" class="flex-1 h-full border-b-2 border-[#0AA6A6] text-[#0AA6A6] flex items-center justify-center gap-1.5">
              <i data-lucide="message-square" class="w-4 h-4"></i>
              <span>Live Chat</span>
            </button>
            <button onclick="setTeleTab('vitals')" id="tab-tele-vitals" class="flex-1 h-full text-slate-400 hover:text-white flex items-center justify-center gap-1.5">
              <i data-lucide="activity" class="w-4 h-4"></i>
              <span>Patient Vitals</span>
            </button>
          </div>

          <div id="tele-chat-panel" class="flex-1 flex flex-col justify-between p-4 overflow-hidden">
            <div id="tele-messages" class="flex-1 overflow-y-auto space-y-3 pr-2 text-xs"></div>
            <div class="pt-3 border-t border-white/10 flex gap-2">
              <input type="text" id="tele-chat-input" onkeypress="if(event.key==='Enter') sendTeleMessage()" placeholder="Type secure medical message..." class="form-input text-xs bg-slate-900/60 text-white border-white/15">
              <button onclick="sendTeleMessage()" class="btn-teal px-3 py-2 text-xs">
                <i data-lucide="send" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <div id="tele-vitals-panel" class="flex-1 p-5 overflow-y-auto hidden space-y-4 text-xs">
            <div class="p-3 bg-white/5 rounded-xl border border-white/10">
              <div class="text-[#0AA6A6] font-bold mb-1">Blood Pressure</div>
              <div class="text-lg font-black text-white">138 / 88 mmHg</div>
            </div>
            <div class="p-3 bg-white/5 rounded-xl border border-white/10">
              <div class="text-[#0AA6A6] font-bold mb-1">Heart Pulse</div>
              <div class="text-lg font-black text-white">76 BPM (Regular)</div>
            </div>
            <div class="p-3 bg-white/5 rounded-xl border border-white/10">
              <div class="text-[#0AA6A6] font-bold mb-1">Blood Group & Allergies</div>
              <div class="font-bold text-white">B+ (Positive)</div>
              <div class="text-rose-400 mt-0.5">Allergies: Penicillin</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function initTelemedicineRoom() {
  lucide.createIcons();
  const res = await api(`/api/telemedicine/session?roomId=${state.teleRoomId}`);
  if (!res.success) return;
  const session = res.data;

  const header = document.getElementById('tele-patient-header');
  if (header) header.innerText = `Patient: ${session.patient_name} (${session.gender}, ${session.blood_group || 'O+'})`;

  const msgContainer = document.getElementById('tele-messages');
  if (msgContainer && session.messages) {
    msgContainer.innerHTML = session.messages.map(m => `
      <div class="p-2.5 rounded-xl ${m.sender_role === 'doctor' ? 'bg-[#0AA6A6]/20 border border-[#0AA6A6]/30 ml-4' : 'bg-white/10 mr-4'}">
        <div class="font-bold text-[0.68rem] text-teal-300">${m.sender_name} (${m.sender_role}):</div>
        <div class="text-slate-100 mt-0.5 leading-relaxed">${m.message}</div>
      </div>
    `).join('');
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }
}

async function sendTeleMessage() {
  const input = document.getElementById('tele-chat-input');
  if (!input || !input.value.trim()) return;
  const message = input.value.trim();
  input.value = '';

  await api('/api/telemedicine/chat', {
    method: 'POST',
    body: JSON.stringify({
      roomId: state.teleRoomId,
      senderId: state.user.id,
      senderName: state.user.fullName,
      senderRole: 'doctor',
      message
    })
  });

  initTelemedicineRoom();
}

function setTeleTab(tab) {
  const chatPanel = document.getElementById('tele-chat-panel');
  const vitalsPanel = document.getElementById('tele-vitals-panel');
  const tabChat = document.getElementById('tab-tele-chat');
  const tabVitals = document.getElementById('tab-tele-vitals');

  if (tab === 'chat') {
    chatPanel.classList.remove('hidden');
    vitalsPanel.classList.add('hidden');
    tabChat.classList.add('border-b-2', 'border-[#0AA6A6]', 'text-[#0AA6A6]');
    tabChat.classList.remove('text-slate-400');
    tabVitals.classList.remove('border-b-2', 'border-[#0AA6A6]', 'text-[#0AA6A6]');
    tabVitals.classList.add('text-slate-400');
  } else {
    chatPanel.classList.add('hidden');
    vitalsPanel.classList.remove('hidden');
    tabVitals.classList.add('border-b-2', 'border-[#0AA6A6]', 'text-[#0AA6A6]');
    tabVitals.classList.remove('text-slate-400');
    tabChat.classList.remove('border-b-2', 'border-[#0AA6A6]', 'text-[#0AA6A6]');
    tabChat.classList.add('text-slate-400');
  }
}

function toggleMic() {
  const btn = document.getElementById('btn-mic');
  btn.classList.toggle('bg-rose-600');
  showToast('Microphone toggled', 'info');
}

function toggleCam() {
  const btn = document.getElementById('btn-cam');
  btn.classList.toggle('bg-rose-600');
  showToast('Camera toggled', 'info');
}

function endTeleCall() {
  api('/api/telemedicine/status', {
    method: 'PATCH',
    body: JSON.stringify({ roomId: state.teleRoomId, status: 'completed' })
  });
  showToast('Consultation completed successfully.', 'success');
  navigate('app', 'dashboard');
}

// ============================================================================
// 5. PRINTABLE DIGITAL PRESCRIPTION VIEW
// ============================================================================

function renderPrescriptionPrint() {
  setTimeout(loadPrescriptionDetails, 50);
  return `
    ${renderUniversalTopBar()}
    <div class="min-h-[calc(100vh-42px)] bg-[#F5F8FC] p-8 flex flex-col items-center">
      <div class="max-w-3xl w-full mb-6 flex items-center justify-between no-print">
        <button onclick="navigate('app', 'prescriptions')" class="btn-outline text-xs">
          ← Back to Prescriptions
        </button>
        <button onclick="window.print()" class="btn-teal text-xs">
          <i data-lucide="printer" class="w-4 h-4"></i>
          <span>Print Official Prescription (PDF)</span>
        </button>
      </div>

      <div id="printable-prescription" class="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-[#E3EAF2] p-10 font-sans text-[#172B45]">
        <div class="flex items-start justify-between pb-6 border-b-2 border-[#102E50]">
          <div>
            <div id="rx-hospital-name" class="text-xl font-black text-[#102E50]">MEDICLIN Hospital & Diagnostic Center</div>
            <div id="rx-hospital-addr" class="text-xs text-[#718096]">House 24, Road 11, Sector 4, Uttara, Dhaka</div>
            <div class="text-xs text-[#718096]">Emergency Hotline: +880 1711 223344</div>
          </div>
          <div class="text-right">
            <div id="rx-doctor-name" class="text-base font-bold text-[#102E50]">Dr. Tariqul Islam</div>
            <div id="rx-doctor-deg" class="text-xs text-[#718096]">MBBS, FCPS (Cardiology), FACC</div>
            <div id="rx-doctor-bmdc" class="text-xs font-bold text-[#0AA6A6]">BMDC Reg: A-49210</div>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-4 py-4 border-b border-[#E3EAF2] text-xs bg-[#F8FAFD] px-4 rounded-xl my-4">
          <div>
            <span class="text-[#718096]">Patient:</span>
            <span id="rx-patient-name" class="font-bold text-[#102E50] block">Kamal Uddin Ahmed</span>
          </div>
          <div>
            <span class="text-[#718096]">UHID:</span>
            <span id="rx-uhid" class="font-bold text-[#0AA6A6] block font-mono">MED-2026-0001</span>
          </div>
          <div>
            <span class="text-[#718096]">Age / Gender:</span>
            <span id="rx-age-gender" class="font-medium text-[#102E50] block">44 Yrs / Male</span>
          </div>
          <div>
            <span class="text-[#718096]">Date:</span>
            <span id="rx-date" class="font-bold text-[#102E50] block">31 Oct 2026</span>
          </div>
        </div>

        <div id="rx-vitals-bar" class="flex gap-6 py-2 text-xs text-[#718096] border-b border-[#E3EAF2] mb-6"></div>

        <div class="grid grid-cols-12 gap-8 min-h-[350px]">
          <div class="col-span-4 border-r border-[#E3EAF2] pr-4 space-y-4 text-xs">
            <div>
              <div class="font-bold text-[#102E50] uppercase tracking-wider text-[0.7rem] mb-1">Clinical Diagnosis</div>
              <div id="rx-diagnosis" class="text-[#172B45] font-semibold leading-relaxed">Stage-1 Hypertension</div>
            </div>
            <div>
              <div class="font-bold text-[#102E50] uppercase tracking-wider text-[0.7rem] mb-1">Investigations Advised</div>
              <ul id="rx-investigations" class="list-disc list-inside space-y-1 text-[#718096]"></ul>
            </div>
          </div>

          <div class="col-span-8 space-y-4">
            <div class="text-3xl font-serif font-black text-[#102E50]">℞</div>
            <div id="rx-medicines-list" class="space-y-4"></div>
          </div>
        </div>

        <div class="mt-8 pt-4 border-t border-[#E3EAF2] text-xs">
          <div class="font-bold text-[#102E50] mb-1">Doctor's Advice:</div>
          <p id="rx-advice" class="text-[#718096] leading-relaxed mb-3">Reduce dietary sodium intake. Brisk walking for 30 minutes daily.</p>
          <div class="text-[#0AA6A6] font-bold">Follow-Up Date: <span id="rx-followup" class="text-[#102E50]">In 14 Days</span></div>
        </div>

        <div class="mt-12 flex items-end justify-between pt-6 border-t border-[#E3EAF2]">
          <div class="text-[0.68rem] text-[#718096]">
            Generated via MEDICLIN Electronic Health Records (EHR) System.<br>
            Digitally certified medical document.
          </div>
          <div class="text-right">
            <div class="font-serif italic text-base text-[#102E50]">Dr. Tariqul Islam</div>
            <div class="text-[0.68rem] font-bold text-[#0AA6A6]">Authorized Digital Signature</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadPrescriptionDetails() {
  lucide.createIcons();
  const res = await api(`/api/prescriptions/${state.prescriptionId}`);
  if (!res.success) return;
  const rx = res.data;

  document.getElementById('rx-hospital-name').innerText = rx.hospital_name || state.currentOrg.name;
  document.getElementById('rx-doctor-name').innerText = rx.doctor_name;
  document.getElementById('rx-doctor-deg').innerText = rx.doctor_degrees;
  document.getElementById('rx-doctor-bmdc').innerText = `BMDC Reg: ${rx.doctor_bmdc}`;
  document.getElementById('rx-patient-name').innerText = rx.patient_name;
  document.getElementById('rx-uhid').innerText = rx.patient_uhid;
  document.getElementById('rx-diagnosis').innerText = rx.diagnosis;
  document.getElementById('rx-advice').innerText = rx.advice_notes || 'Continue prescribed medicine.';
  document.getElementById('rx-followup').innerText = rx.follow_up_date || 'As required.';

  const vitalsBar = document.getElementById('rx-vitals-bar');
  if (vitalsBar && rx.vitals) {
    vitalsBar.innerHTML = Object.entries(rx.vitals)
      .map(([k, v]) => `<span><strong class="text-[#102E50]">${k.toUpperCase()}:</strong> ${v}</span>`)
      .join('');
  }

  const invList = document.getElementById('rx-investigations');
  if (invList && rx.investigations_recommended) {
    invList.innerHTML = rx.investigations_recommended.map(i => `<li>${i}</li>`).join('');
  }

  const medList = document.getElementById('rx-medicines-list');
  if (medList && rx.medicines) {
    medList.innerHTML = rx.medicines.map((m, idx) => `
      <div class="pb-3 border-b border-[#E3EAF2]/60">
        <div class="font-bold text-[#102E50] text-sm">${idx + 1}. ${m.name} (${m.dosage})</div>
        <div class="text-xs text-[#0AA6A6] font-semibold mt-0.5">Dose: ${m.frequency} — ${m.duration}</div>
        <div class="text-[0.7rem] text-[#718096] italic">${m.instructions}</div>
      </div>
    `).join('');
  }
}

function viewPrescriptionPrint(id) {
  state.prescriptionId = id;
  navigate('prescription');
}

// ============================================================================
// 6. DOCTOR & PATIENT PORTAL VIEWS
// ============================================================================

function renderDoctorPortal() {
  return `
    ${renderUniversalTopBar()}
    <div class="min-h-[calc(100vh-42px)] bg-[#F5F8FC] p-8">
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <img src="${IMAGES.doctors['doc-1']}" alt="Dr. Tariqul Islam" class="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400 shadow-md">
            <div>
              <span class="badge-teal text-xs">Doctor Clinical Portal</span>
              <h1 class="text-2xl font-black text-[#102E50] mt-0.5">Welcome, Dr. Tariqul Islam</h1>
              <p class="text-xs text-[#718096]">Senior Interventional Cardiologist • BMDC: A-49210</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="badge-success text-xs font-bold py-1 px-3"><i data-lucide="radio" class="w-3.5 h-3.5 inline animate-pulse"></i> Online for Telemedicine</span>
            <button onclick="navigate('app', 'dashboard')" class="btn-outline text-xs">Switch to Hospital Workspace</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="mediclin-card p-5">
            <div class="text-xs font-semibold text-[#718096]">Today's Scheduled Consultations</div>
            <div class="text-2xl font-black text-[#102E50] mt-1">12 Patients</div>
          </div>
          <div class="mediclin-card p-5">
            <div class="text-xs font-semibold text-[#718096]">Online Video Appointments</div>
            <div class="text-2xl font-black text-[#0AA6A6] mt-1">4 Confirmed</div>
          </div>
          <div class="mediclin-card p-5">
            <div class="text-xs font-semibold text-[#718096]">Monthly Consultation Earnings</div>
            <div class="text-2xl font-black text-emerald-600 mt-1">৳ 1,48,000 BDT</div>
          </div>
        </div>

        <div class="mediclin-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-[#102E50]">Upcoming Telemedicine Calls</h3>
            <button onclick="navigate('tele_room')" class="btn-teal text-xs py-1.5 px-4">
              Enter Consultation Room →
            </button>
          </div>
          <div class="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/80 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img src="${IMAGES.patients['pat-2']}" alt="Patient" class="w-12 h-12 rounded-full object-cover border-2 border-teal-300">
              <div>
                <div class="font-bold text-sm text-[#102E50]">Roksana Parvin (Female, 36 yrs)</div>
                <div class="text-xs text-[#718096]">Reason: Mild morning dizziness & blood pressure checkup</div>
              </div>
            </div>
            <button onclick="navigate('tele_room')" class="btn-teal text-xs py-2 px-4 shadow">
              Start Video Call Now
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPatientPortal() {
  return `
    ${renderUniversalTopBar()}
    <div class="min-h-[calc(100vh-42px)] bg-[#F5F8FC] p-8">
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <img src="${IMAGES.patients['pat-1']}" alt="Kamal Uddin" class="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400 shadow-md">
            <div>
              <span class="badge-teal text-xs font-bold">Patient Self-Service Health Portal</span>
              <h1 class="text-2xl font-black text-[#102E50] mt-0.5">Welcome, Kamal Uddin Ahmed</h1>
              <p class="text-xs text-[#718096]">UHID: <span class="font-bold text-[#0AA6A6] font-mono">MED-2026-0001</span> • Blood Group: <strong class="text-[#102E50]">B+</strong></p>
            </div>
          </div>
          <button onclick="navigate('app', 'dashboard')" class="btn-outline text-xs">Hospital Admin View</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button onclick="openBookAppointmentModal()" class="mediclin-card p-5 text-left hover:border-[#0AA6A6]">
            <i data-lucide="calendar-plus" class="w-6 h-6 text-[#0AA6A6] mb-2"></i>
            <div class="font-bold text-[#102E50] text-sm">Book Doctor Appointment</div>
            <div class="text-xs text-[#718096] mt-1">Choose in-person or online video call</div>
          </button>

          <button onclick="viewPrescriptionPrint('rx-1')" class="mediclin-card p-5 text-left hover:border-[#0AA6A6]">
            <i data-lucide="file-text" class="w-6 h-6 text-[#0AA6A6] mb-2"></i>
            <div class="font-bold text-[#102E50] text-sm">My Digital Prescriptions</div>
            <div class="text-xs text-[#718096] mt-1">Download and print doctor signed Rx</div>
          </button>

          <button onclick="showToast('Lab reports available for verified orders.', 'info')" class="mediclin-card p-5 text-left hover:border-[#0AA6A6]">
            <i data-lucide="flask-conical" class="w-6 h-6 text-[#0AA6A6] mb-2"></i>
            <div class="font-bold text-[#102E50] text-sm">Diagnostic Reports</div>
            <div class="text-xs text-[#718096] mt-1">View blood tests & radiology results</div>
          </button>

          <button onclick="navigate('app', 'billing')" class="mediclin-card p-5 text-left hover:border-[#0AA6A6]">
            <i data-lucide="credit-card" class="w-6 h-6 text-[#0AA6A6] mb-2"></i>
            <div class="font-bold text-[#102E50] text-sm">Pay Bills via bKash / Nagad</div>
            <div class="text-xs text-[#718096] mt-1">Instant electronic receipts</div>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// 7. MODALS
// ============================================================================

function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
}

function openRegisterPatientModal() {
  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="if(event.target===this) closeModal()">
      <div class="modal-panel p-6">
        <div class="flex items-center justify-between pb-4 border-b border-[#E3EAF2] mb-5">
          <h3 class="font-bold text-lg text-[#102E50]">Register New Patient (Generate UHID)</h3>
          <button onclick="closeModal()" class="text-[#718096] hover:text-[#102E50]"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>

        <form onsubmit="submitRegisterPatient(event)" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Full Name *</label>
              <input type="text" id="reg-name" required placeholder="e.g. Mahfuzur Rahman" class="form-input text-xs">
            </div>
            <div>
              <label class="form-label">Phone Number (Bangladesh 01X) *</label>
              <input type="tel" id="reg-phone" required placeholder="+8801712345678" class="form-input text-xs">
            </div>
            <div>
              <label class="form-label">Date of Birth *</label>
              <input type="date" id="reg-dob" required class="form-input text-xs" value="1992-04-15">
            </div>
            <div>
              <label class="form-label">Gender *</label>
              <select id="reg-gender" class="form-select text-xs">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="form-label">Blood Group</label>
              <select id="reg-blood" class="form-select text-xs">
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="O+">O+</option>
                <option value="AB+">AB+</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="O-">O-</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <label class="form-label">Known Allergies (Comma separated)</label>
              <input type="text" id="reg-allergies" placeholder="Penicillin, Sulfa" class="form-input text-xs">
            </div>
          </div>

          <div>
            <label class="form-label">Residential Address *</label>
            <input type="text" id="reg-address" required placeholder="Sector 7, Uttara, Dhaka" class="form-input text-xs" value="Uttara, Dhaka">
          </div>

          <div class="pt-4 border-t border-[#E3EAF2] flex justify-end gap-3">
            <button type="button" onclick="closeModal()" class="btn-outline text-xs">Cancel</button>
            <button type="submit" class="btn-primary text-xs">Register Patient & Generate UHID</button>
          </div>
        </form>
      </div>
    </div>
  `;
  lucide.createIcons();
}

async function submitRegisterPatient(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const phone = document.getElementById('reg-phone').value;
  const dob = document.getElementById('reg-dob').value;
  const gender = document.getElementById('reg-gender').value;
  const blood = document.getElementById('reg-blood').value;
  const allergiesStr = document.getElementById('reg-allergies').value;
  const address = document.getElementById('reg-address').value;

  const allergies = allergiesStr ? allergiesStr.split(',').map(s => s.trim()) : [];

  const res = await api('/api/patients', {
    method: 'POST',
    body: JSON.stringify({
      full_name: name,
      phone,
      date_of_birth: dob,
      gender,
      blood_group: blood,
      allergies,
      address
    })
  });

  if (res.success) {
    closeModal();
    showToast(`Patient registered! UHID: ${res.data.uhid}`, 'success');
    if (state.appSubtab === 'patients') loadPatientsData();
    if (state.appSubtab === 'dashboard') loadDashboardData();
  }
}

function openBookAppointmentModal(preselectedDoctorId = '') {
  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="if(event.target===this) closeModal()">
      <div class="modal-panel p-6">
        <div class="flex items-center justify-between pb-4 border-b border-[#E3EAF2] mb-5">
          <h3 class="font-bold text-lg text-[#102E50]">Book Doctor Appointment</h3>
          <button onclick="closeModal()" class="text-[#718096] hover:text-[#102E50]"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>

        <form onsubmit="submitBookAppointment(event)" class="space-y-4">
          <div>
            <label class="form-label">Select Patient *</label>
            <select id="apt-patient" class="form-select text-xs" required>
              <option value="pat-1">Kamal Uddin Ahmed (UHID: MED-2026-0001)</option>
              <option value="pat-2">Roksana Parvin (UHID: MED-2026-0002)</option>
              <option value="pat-3">Ayan Chowdhury (UHID: MED-2026-0003)</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Doctor *</label>
              <select id="apt-doctor" class="form-select text-xs" required>
                <option value="doc-1" ${preselectedDoctorId === 'doc-1' ? 'selected' : ''}>Dr. Tariqul Islam (Cardiology)</option>
                <option value="doc-2" ${preselectedDoctorId === 'doc-2' ? 'selected' : ''}>Dr. Nusrat Jahan (Pediatrics)</option>
                <option value="doc-3" ${preselectedDoctorId === 'doc-3' ? 'selected' : ''}>Dr. Shamsur Rahman (Orthopedics)</option>
              </select>
            </div>
            <div>
              <label class="form-label">Consultation Type *</label>
              <select id="apt-type" class="form-select text-xs">
                <option value="in_person">In-Person OPD Hospital Visit</option>
                <option value="telemedicine">Online Video Telemedicine</option>
              </select>
            </div>
            <div>
              <label class="form-label">Date *</label>
              <input type="date" id="apt-date" class="form-input text-xs" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div>
              <label class="form-label">Time Slot *</label>
              <select id="apt-time" class="form-select text-xs">
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="18:30">06:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label class="form-label">Reason for Visit / Symptoms</label>
            <input type="text" id="apt-reason" placeholder="e.g. Routine checkup or chest pain review" class="form-input text-xs">
          </div>

          <div class="pt-4 border-t border-[#E3EAF2] flex justify-end gap-3">
            <button type="button" onclick="closeModal()" class="btn-outline text-xs">Cancel</button>
            <button type="submit" class="btn-teal text-xs">Confirm & Allocate Daily Token</button>
          </div>
        </form>
      </div>
    </div>
  `;
  lucide.createIcons();
}

async function submitBookAppointment(e) {
  e.preventDefault();
  const patientId = document.getElementById('apt-patient').value;
  const doctorId = document.getElementById('apt-doctor').value;
  const type = document.getElementById('apt-type').value;
  const date = document.getElementById('apt-date').value;
  const time = document.getElementById('apt-time').value;
  const reason = document.getElementById('apt-reason').value;

  const res = await api('/api/appointments', {
    method: 'POST',
    body: JSON.stringify({
      patient_id: patientId,
      doctor_id: doctorId,
      department_id: doctorId === 'doc-2' ? 'dept-ped' : (doctorId === 'doc-3' ? 'dept-ortho' : 'dept-card'),
      appointment_date: date,
      appointment_time: time,
      consultation_type: type,
      reason_for_visit: reason,
      fee_bdt: type === 'telemedicine' ? 1000 : 1200
    })
  });

  if (res.success) {
    closeModal();
    showToast(`Appointment confirmed! Token #${res.data.token_number}`, 'success');
    if (state.appSubtab === 'appointments') loadAppointmentsData();
    if (state.appSubtab === 'dashboard') loadDashboardData();
  } else {
    showToast(res.message, 'danger');
  }
}

function openPaymentModal(invoiceId, dueAmount) {
  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="if(event.target===this) closeModal()">
      <div class="modal-panel p-6 max-w-md">
        <div class="flex items-center justify-between pb-4 border-b border-[#E3EAF2] mb-5">
          <h3 class="font-bold text-lg text-[#102E50]">Receive Payment (BDT ৳)</h3>
          <button onclick="closeModal()" class="text-[#718096] hover:text-[#102E50]"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>

        <form onsubmit="submitPayment(event, '${invoiceId}')" class="space-y-4">
          <div class="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-center">
            <div class="text-xs text-[#718096]">Due Amount to Collect</div>
            <div class="text-3xl font-black text-[#102E50] mt-1">৳ ${dueAmount.toLocaleString()} BDT</div>
          </div>

          <div>
            <label class="form-label">Payment Method *</label>
            <select id="pay-method" class="form-select text-xs">
              <option value="bkash">bKash Mobile Financial Service (MFS)</option>
              <option value="nagad">Nagad MFS</option>
              <option value="cash">Cash at Hospital Desk</option>
              <option value="card">Visa / Mastercard / Amex</option>
            </select>
          </div>

          <div>
            <label class="form-label">Amount Paying (BDT ৳) *</label>
            <input type="number" id="pay-amount" class="form-input text-xs font-bold" value="${dueAmount}" max="${dueAmount}" required>
          </div>

          <div>
            <label class="form-label">MFS Transaction ID / Reference (Optional)</label>
            <input type="text" id="pay-trx" placeholder="e.g. TRX9384729" class="form-input text-xs font-mono">
          </div>

          <div class="pt-4 border-t border-[#E3EAF2] flex justify-end gap-3">
            <button type="button" onclick="closeModal()" class="btn-outline text-xs">Cancel</button>
            <button type="submit" class="btn-teal text-xs">Record & Issue Electronic Receipt</button>
          </div>
        </form>
      </div>
    </div>
  `;
  lucide.createIcons();
}

async function submitPayment(e, invoiceId) {
  e.preventDefault();
  const method = document.getElementById('pay-method').value;
  const amount = Number(document.getElementById('pay-amount').value);
  const trx = document.getElementById('pay-trx').value;

  const res = await api('/api/billing/pay', {
    method: 'POST',
    body: JSON.stringify({
      invoice_id: invoiceId,
      amount,
      payment_method: method,
      trx_id: trx
    })
  });

  if (res.success) {
    closeModal();
    showToast(`Payment of ৳ ${amount} recorded via ${method.toUpperCase()}!`, 'success');
    if (state.appSubtab === 'billing') loadBillingData();
  }
}

function openCreatePrescriptionModal() {
  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="if(event.target===this) closeModal()">
      <div class="modal-panel p-6 max-w-2xl">
        <div class="flex items-center justify-between pb-4 border-b border-[#E3EAF2] mb-5">
          <h3 class="font-bold text-lg text-[#102E50]">Write Digital Prescription</h3>
          <button onclick="closeModal()" class="text-[#718096] hover:text-[#102E50]"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>

        <form onsubmit="submitCreatePrescription(event)" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Patient *</label>
              <select id="rx-patient-select" class="form-select text-xs" required>
                <option value="pat-1">Kamal Uddin Ahmed (MED-2026-0001)</option>
                <option value="pat-2">Roksana Parvin (MED-2026-0002)</option>
                <option value="pat-3">Ayan Chowdhury (MED-2026-0003)</option>
              </select>
            </div>
            <div>
              <label class="form-label">Doctor *</label>
              <select id="rx-doctor-select" class="form-select text-xs" required>
                <option value="doc-1">Dr. Tariqul Islam (Cardiology)</option>
                <option value="doc-2">Dr. Nusrat Jahan (Pediatrics)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="form-label">Clinical Diagnosis *</label>
            <input type="text" id="rx-diag-input" required placeholder="e.g. Acute Bronchitis or Hypertension" class="form-input text-xs" value="Stage-1 Essential Hypertension">
          </div>

          <div>
            <label class="form-label">Prescribed Medicines (Format: Medicine Name | Dose | Frequency | Duration) *</label>
            <textarea id="rx-meds-input" rows="3" class="form-textarea text-xs" placeholder="Napa Extra | 500mg | 1+0+1 | 3 days&#10;Seclo 20mg | 20mg | 1+0+1 | 14 days">Napa Extra | 500mg+65mg | 1+0+1 | 3 days&#10;Seclo 20mg | 20mg | 1+0+1 | 14 days</textarea>
          </div>

          <div>
            <label class="form-label">Advice / Dietary Restrictions</label>
            <input type="text" id="rx-adv-input" placeholder="Low salt diet, avoid cold drinks, 30 min daily walk" class="form-input text-xs" value="Low salt diet. 30 min daily walk.">
          </div>

          <div class="pt-4 border-t border-[#E3EAF2] flex justify-end gap-3">
            <button type="button" onclick="closeModal()" class="btn-outline text-xs">Cancel</button>
            <button type="submit" class="btn-teal text-xs">Sign & Issue Prescription</button>
          </div>
        </form>
      </div>
    </div>
  `;
  lucide.createIcons();
}

async function submitCreatePrescription(e) {
  e.preventDefault();
  const patientId = document.getElementById('rx-patient-select').value;
  const doctorId = document.getElementById('rx-doctor-select').value;
  const diag = document.getElementById('rx-diag-input').value;
  const medsRaw = document.getElementById('rx-meds-input').value;
  const advice = document.getElementById('rx-adv-input').value;

  const medicines = medsRaw.split('\n').filter(line => line.trim()).map(line => {
    const parts = line.split('|').map(s => s.trim());
    return {
      name: parts[0] || 'Medicine',
      dosage: parts[1] || 'Standard',
      frequency: parts[2] || '1+0+1',
      duration: parts[3] || '5 days',
      instructions: 'Take after food'
    };
  });

  const res = await api('/api/prescriptions', {
    method: 'POST',
    body: JSON.stringify({
      patient_id: patientId,
      doctor_id: doctorId,
      diagnosis: diag,
      medicines,
      advice_notes: advice,
      follow_up_date: 'In 14 Days'
    })
  });

  if (res.success) {
    closeModal();
    showToast(`Prescription #${res.data.prescription_number} issued!`, 'success');
    viewPrescriptionPrint(res.data.id);
  }
}

function openRegisterHospitalModal(tier = 'professional') {
  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="if(event.target===this) closeModal()">
      <div class="modal-panel p-6 max-w-lg">
        <div class="flex items-center justify-between pb-4 border-b border-[#E3EAF2] mb-5">
          <h3 class="font-bold text-lg text-[#102E50]">Hospital SaaS Onboarding</h3>
          <button onclick="closeModal()" class="text-[#718096] hover:text-[#102E50]"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>

        <form onsubmit="submitRegisterHospital(event)" class="space-y-4">
          <div>
            <label class="form-label">Hospital / Clinic Legal Name *</label>
            <input type="text" id="hosp-name" required placeholder="e.g. Bangladesh Specialized Hospital" class="form-input text-xs">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Tenant Code (e.g. BSH) *</label>
              <input type="text" id="hosp-code" required placeholder="BSH" maxlength="5" class="form-input text-xs uppercase font-mono">
            </div>
            <div>
              <label class="form-label">Subscription Tier *</label>
              <select id="hosp-tier" class="form-select text-xs">
                <option value="starter" ${tier === 'starter' ? 'selected' : ''}>Starter Clinic (৳15,000/mo)</option>
                <option value="professional" ${tier === 'professional' ? 'selected' : ''}>Professional Hospital (৳35,000/mo)</option>
                <option value="business" ${tier === 'business' ? 'selected' : ''}>Business Enterprise (৳65,000/mo)</option>
                <option value="enterprise" ${tier === 'enterprise' ? 'selected' : ''}>Healthcare Network (৳1,20,000/mo)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="form-label">Official Email *</label>
            <input type="email" id="hosp-email" required placeholder="admin@hospital.com.bd" class="form-input text-xs">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Contact Phone *</label>
              <input type="tel" id="hosp-phone" required placeholder="+8801700000000" class="form-input text-xs">
            </div>
            <div>
              <label class="form-label">City *</label>
              <input type="text" id="hosp-city" required value="Dhaka" class="form-input text-xs">
            </div>
          </div>

          <div class="pt-4 border-t border-[#E3EAF2] flex justify-end gap-3">
            <button type="button" onclick="closeModal()" class="btn-outline text-xs">Cancel</button>
            <button type="submit" class="btn-teal text-xs">Create Tenant & Start 14-Day Trial</button>
          </div>
        </form>
      </div>
    </div>
  `;
  lucide.createIcons();
}

async function submitRegisterHospital(e) {
  e.preventDefault();
  const name = document.getElementById('hosp-name').value;
  const code = document.getElementById('hosp-code').value.toUpperCase();
  const tier = document.getElementById('hosp-tier').value;
  const email = document.getElementById('hosp-email').value;
  const phone = document.getElementById('hosp-phone').value;
  const city = document.getElementById('hosp-city').value;

  const res = await api('/api/super-admin/hospitals', {
    method: 'POST',
    body: JSON.stringify({ name, code, subscription_tier: tier, email, phone, city })
  });

  if (res.success) {
    closeModal();
    showToast(`Hospital organization ${name} registered successfully!`, 'success');
    state.currentOrg = res.data;
    navigate('app', 'dashboard');
  }
}

function switchHospital(orgId) {
  const names = {
    'org-cch': 'MEDICLIN Hospital & Diagnostic Center',
    'org-dch': 'Dhaka Central Hospital',
    'org-chi': 'Chittagong Health Institute'
  };
  state.currentOrg = {
    id: orgId,
    name: names[orgId] || 'MEDICLIN Hospital',
    code: orgId === 'org-cch' ? 'MEDICLIN' : orgId.replace('org-', '').toUpperCase(),
    city: 'Dhaka',
    subscription_tier: 'professional'
  };
  showToast(`Switched active tenant to ${state.currentOrg.name}`, 'info');
  renderApp();
}

// ============================================================================
// MAIN RENDER DISPATCHER
// ============================================================================

function renderApp() {
  const root = document.getElementById('app');
  if (!root) return;

  switch (state.route) {
    case 'super_admin':
      root.innerHTML = renderSuperAdmin();
      break;
    case 'doctor':
      root.innerHTML = renderDoctorPortal();
      break;
    case 'patient':
      root.innerHTML = renderPatientPortal();
      break;
    case 'tele_room':
      root.innerHTML = renderTelemedicineRoom();
      break;
    case 'prescription':
      root.innerHTML = renderPrescriptionPrint();
      break;
    case 'marketing':
      root.innerHTML = renderMarketing();
      break;
    case 'app':
    default:
      root.innerHTML = renderHospitalApp();
      break;
  }
  lucide.createIcons();
}

// Global Initialization
window.addEventListener('DOMContentLoaded', () => {
  renderApp();
});
