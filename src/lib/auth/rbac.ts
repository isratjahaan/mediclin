// ============================================================================
// MEDICLIN Granular Role-Based Access Control (RBAC) System
// ============================================================================

import type { UserRole } from '../../types/index.ts';

export type Permission =
  | 'platform.manage'
  | 'hospitals.view'
  | 'hospitals.manage'
  | 'subscriptions.manage'
  | 'patients.view'
  | 'patients.create'
  | 'patients.update'
  | 'patients.delete'
  | 'appointments.view'
  | 'appointments.create'
  | 'appointments.manage'
  | 'opd.manage'
  | 'ipd.manage'
  | 'emergency.manage'
  | 'prescriptions.view'
  | 'prescriptions.create'
  | 'pharmacy.view'
  | 'pharmacy.manage'
  | 'laboratory.view'
  | 'laboratory.manage'
  | 'radiology.manage'
  | 'telemedicine.participate'
  | 'telemedicine.manage'
  | 'billing.view'
  | 'billing.manage'
  | 'staff.view'
  | 'staff.manage'
  | 'inventory.manage'
  | 'reports.view'
  | 'settings.manage';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'platform.manage',
    'hospitals.view',
    'hospitals.manage',
    'subscriptions.manage',
    'reports.view',
    'settings.manage'
  ],
  platform_support: [
    'hospitals.view',
    'reports.view'
  ],
  hospital_owner: [
    'patients.view', 'patients.create', 'patients.update', 'patients.delete',
    'appointments.view', 'appointments.create', 'appointments.manage',
    'opd.manage', 'ipd.manage', 'emergency.manage',
    'prescriptions.view', 'prescriptions.create',
    'pharmacy.view', 'pharmacy.manage',
    'laboratory.view', 'laboratory.manage', 'radiology.manage',
    'telemedicine.participate', 'telemedicine.manage',
    'billing.view', 'billing.manage',
    'staff.view', 'staff.manage',
    'inventory.manage',
    'reports.view',
    'settings.manage'
  ],
  hospital_admin: [
    'patients.view', 'patients.create', 'patients.update',
    'appointments.view', 'appointments.create', 'appointments.manage',
    'opd.manage', 'ipd.manage', 'emergency.manage',
    'prescriptions.view',
    'pharmacy.view', 'pharmacy.manage',
    'laboratory.view', 'laboratory.manage', 'radiology.manage',
    'telemedicine.manage',
    'billing.view', 'billing.manage',
    'staff.view', 'staff.manage',
    'inventory.manage',
    'reports.view',
    'settings.manage'
  ],
  doctor: [
    'patients.view',
    'appointments.view', 'appointments.manage',
    'opd.manage', 'ipd.manage',
    'prescriptions.view', 'prescriptions.create',
    'laboratory.view', 'laboratory.manage',
    'telemedicine.participate',
    'reports.view'
  ],
  receptionist: [
    'patients.view', 'patients.create', 'patients.update',
    'appointments.view', 'appointments.create', 'appointments.manage',
    'billing.view'
  ],
  nurse: [
    'patients.view',
    'appointments.view',
    'ipd.manage', 'emergency.manage',
    'prescriptions.view'
  ],
  accountant: [
    'billing.view', 'billing.manage',
    'reports.view'
  ],
  pharmacist: [
    'prescriptions.view',
    'pharmacy.view', 'pharmacy.manage',
    'inventory.manage'
  ],
  lab_technician: [
    'laboratory.view', 'laboratory.manage',
    'radiology.manage'
  ],
  hr_manager: [
    'staff.view', 'staff.manage',
    'reports.view'
  ],
  inventory_manager: [
    'inventory.manage',
    'pharmacy.view',
    'reports.view'
  ],
  patient: [
    'patients.view',
    'appointments.view', 'appointments.create',
    'prescriptions.view',
    'telemedicine.participate',
    'billing.view'
  ]
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

export function canAccessPortal(role: UserRole, portal: 'super_admin' | 'hospital' | 'doctor' | 'patient'): boolean {
  switch (portal) {
    case 'super_admin':
      return role === 'super_admin' || role === 'platform_support';
    case 'doctor':
      return role === 'doctor' || role === 'hospital_admin' || role === 'hospital_owner';
    case 'patient':
      return true; // Any authenticated user can view patient portal
    case 'hospital':
      return role !== 'patient' && role !== 'super_admin' && role !== 'platform_support';
    default:
      return false;
  }
}
