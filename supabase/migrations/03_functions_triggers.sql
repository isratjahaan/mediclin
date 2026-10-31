-- ============================================================================
-- MEDICLIN Enterprise Multi-Tenant SaaS
-- Migration 03: Automated Functions & Database Triggers
-- ============================================================================

-- 1. Automatic UHID Generator: e.g. "CCH-2026-0001"
CREATE OR REPLACE FUNCTION generate_patient_uhid()
RETURNS TRIGGER AS $$
DECLARE
    org_code VARCHAR(20);
    current_year VARCHAR(4);
    seq_number INT;
BEGIN
    SELECT code INTO org_code FROM organizations WHERE id = NEW.organization_id;
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(COUNT(*), 0) + 1 INTO seq_number 
    FROM patients 
    WHERE organization_id = NEW.organization_id;

    NEW.uhid := org_code || '-' || current_year || '-' || LPAD(seq_number::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_uhid ON patients;
CREATE TRIGGER trigger_generate_uhid
    BEFORE INSERT ON patients
    FOR EACH ROW
    WHEN (NEW.uhid IS NULL OR NEW.uhid = '')
    EXECUTE FUNCTION generate_patient_uhid();

-- 2. Daily Token Number Generator for Appointments
CREATE OR REPLACE FUNCTION assign_appointment_token()
RETURNS TRIGGER AS $$
DECLARE
    next_token INT;
BEGIN
    SELECT COALESCE(MAX(token_number), 0) + 1 INTO next_token
    FROM appointments
    WHERE organization_id = NEW.organization_id
      AND doctor_id = NEW.doctor_id
      AND appointment_date = NEW.appointment_date;

    NEW.token_number := next_token;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_appointment_token ON appointments;
CREATE TRIGGER trigger_assign_appointment_token
    BEFORE INSERT ON appointments
    FOR EACH ROW
    WHEN (NEW.token_number IS NULL OR NEW.token_number = 0)
    EXECUTE FUNCTION assign_appointment_token();

-- 3. Bed Status Automatic Updater on Admission & Discharge
CREATE OR REPLACE FUNCTION sync_bed_status_on_admission()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE beds SET status = 'occupied' WHERE id = NEW.bed_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF NEW.status = 'discharged' AND OLD.status = 'admitted' THEN
            UPDATE beds SET status = 'available' WHERE id = NEW.bed_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_bed_status ON admissions;
CREATE TRIGGER trigger_sync_bed_status
    AFTER INSERT OR UPDATE ON admissions
    FOR EACH ROW
    EXECUTE FUNCTION sync_bed_status_on_admission();

-- 4. Timestamp Automatic Updater
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_org_timestamp
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_patient_timestamp
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_appointment_timestamp
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_invoice_timestamp
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
