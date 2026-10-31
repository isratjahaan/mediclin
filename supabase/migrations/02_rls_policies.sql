-- ============================================================================
-- MEDICLIN Enterprise Multi-Tenant SaaS
-- Migration 02: Row Level Security (RLS) Policies
-- ============================================================================

-- Helper functions for RLS session context
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS VARCHAR AS $$
BEGIN
    RETURN (SELECT role FROM user_profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role IN ('super_admin', 'platform_support')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_belongs_to_org(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members 
        WHERE organization_id = org_id 
          AND user_id = auth.uid() 
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. ORGANIZATIONS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can view and manage all organizations"
    ON organizations FOR ALL
    USING (is_super_admin());

CREATE POLICY "Hospital members can view their own organization"
    ON organizations FOR SELECT
    USING (user_belongs_to_org(id));

-- 2. USER PROFILES
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit own profile"
    ON user_profiles FOR ALL
    USING (auth.uid() = id);

CREATE POLICY "Super Admins can view all profiles"
    ON user_profiles FOR SELECT
    USING (is_super_admin());

-- 3. PATIENTS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for patients"
    ON patients FOR ALL
    USING (user_belongs_to_org(organization_id));

CREATE POLICY "Patients can view their own record"
    ON patients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
              AND user_profiles.phone = patients.phone
        )
    );

-- 4. APPOINTMENTS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for appointments"
    ON appointments FOR ALL
    USING (user_belongs_to_org(organization_id));

CREATE POLICY "Patients can view and book own appointments"
    ON appointments FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patients 
            JOIN user_profiles ON user_profiles.phone = patients.phone 
            WHERE user_profiles.id = auth.uid()
        )
    );

-- 5. DIGITAL PRESCRIPTIONS
ALTER TABLE digital_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant staff can manage prescriptions"
    ON digital_prescriptions FOR ALL
    USING (user_belongs_to_org(organization_id));

CREATE POLICY "Patients can view own prescriptions"
    ON digital_prescriptions FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patients 
            JOIN user_profiles ON user_profiles.phone = patients.phone 
            WHERE user_profiles.id = auth.uid()
        )
    );

-- 6. INVOICES
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant staff can manage invoices"
    ON invoices FOR ALL
    USING (user_belongs_to_org(organization_id));

CREATE POLICY "Patients can view own invoices"
    ON invoices FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patients 
            JOIN user_profiles ON user_profiles.phone = patients.phone 
            WHERE user_profiles.id = auth.uid()
        )
    );

-- 7. WARDS & BEDS
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant staff can view and manage wards"
    ON wards FOR ALL
    USING (user_belongs_to_org(organization_id));

ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant staff can view and manage beds"
    ON beds FOR ALL
    USING (user_belongs_to_org(organization_id));

-- 8. PHARMACY
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant staff can manage medicines"
    ON medicines FOR ALL
    USING (user_belongs_to_org(organization_id));

-- 9. LABORATORY
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant staff can manage lab tests"
    ON lab_tests FOR ALL
    USING (user_belongs_to_org(organization_id));

ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant staff can manage lab orders"
    ON lab_orders FOR ALL
    USING (user_belongs_to_org(organization_id));

CREATE POLICY "Patients can view their verified lab reports"
    ON lab_orders FOR SELECT
    USING (
        status IN ('completed', 'verified', 'delivered') AND
        patient_id IN (
            SELECT id FROM patients 
            JOIN user_profiles ON user_profiles.phone = patients.phone 
            WHERE user_profiles.id = auth.uid()
        )
    );

-- 10. TELEMEDICINE SESSIONS
ALTER TABLE telemedicine_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view and access telemedicine room"
    ON telemedicine_sessions FOR ALL
    USING (
        user_belongs_to_org(organization_id) OR
        patient_id IN (
            SELECT id FROM patients 
            JOIN user_profiles ON user_profiles.phone = patients.phone 
            WHERE user_profiles.id = auth.uid()
        )
    );
