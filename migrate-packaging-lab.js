// migrate-packaging-lab.js
const db = require('./db');

async function migrate() {
  console.log('Running PostgreSQL Migration for Packaging, NABL Lab Reports & QR Activation...');
  
  await db.query(`
    -- Alter honey_batches table to include lab testing and packaging activation fields
    ALTER TABLE honey_batches 
      ADD COLUMN IF NOT EXISTS qr_status VARCHAR(50) DEFAULT 'INACTIVE',
      ADD COLUMN IF NOT EXISTS lab_sample_id VARCHAR(80),
      ADD COLUMN IF NOT EXISTS lab_test_status VARCHAR(50) DEFAULT 'PENDING_TESTING',
      ADD COLUMN IF NOT EXISTS packaging_status VARCHAR(50) DEFAULT 'PACKAGING_IN_PROGRESS',
      ADD COLUMN IF NOT EXISTS packaged_units_count INT DEFAULT 120,
      ADD COLUMN IF NOT EXISTS consensus_status VARCHAR(50) DEFAULT 'AWAITING_DUAL_VERIFICATION',
      ADD COLUMN IF NOT EXISTS lab_moisture NUMERIC(5,2),
      ADD COLUMN IF NOT EXISTS lab_fructose_glucose NUMERIC(5,2) DEFAULT 1.15,
      ADD COLUMN IF NOT EXISTS lab_c4_sugar_percent NUMERIC(5,2) DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS lab_hmf_mg_kg NUMERIC(5,2) DEFAULT 12.5,
      ADD COLUMN IF NOT EXISTS lab_report_summary TEXT,
      ADD COLUMN IF NOT EXISTS lab_tested_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;

    -- Create dedicated lab_reports table for official NABL/NMR analytical reports
    CREATE TABLE IF NOT EXISTS lab_reports (
      id SERIAL PRIMARY KEY,
      sample_id VARCHAR(80) UNIQUE NOT NULL,
      batch_id VARCHAR(60) REFERENCES honey_batches(batch_id) ON DELETE CASCADE,
      apiary_id VARCHAR(60),
      apiary_name VARCHAR(150),
      lab_name VARCHAR(150) NOT NULL DEFAULT 'National Honey Testing Lab (NABL & FSSAI Accredited, Anand Centre)',
      moisture_percent NUMERIC(5,2) NOT NULL,
      fructose_glucose_ratio NUMERIC(5,2) NOT NULL DEFAULT 1.15,
      c4_sugar_percent NUMERIC(5,2) NOT NULL DEFAULT 0.0,
      hmf_mg_kg NUMERIC(5,2) NOT NULL DEFAULT 12.5,
      pollen_origin VARCHAR(100),
      adulteration_detected BOOLEAN DEFAULT FALSE,
      kvic_audit_matched BOOLEAN DEFAULT FALSE,
      consensus_verdict VARCHAR(50) NOT NULL DEFAULT 'PENDING',
      report_hash VARCHAR(100) NOT NULL,
      tested_by VARCHAR(150) NOT NULL DEFAULT 'Dr. Sunita Deshmukh (Chief Biochemist, NABL)',
      tested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create individual batch packaging units (jars/bottles with activated/inactive QRs)
    CREATE TABLE IF NOT EXISTS batch_packages (
      id SERIAL PRIMARY KEY,
      package_id VARCHAR(80) UNIQUE NOT NULL,
      batch_id VARCHAR(60) REFERENCES honey_batches(batch_id) ON DELETE CASCADE,
      apiary_id VARCHAR(60),
      apiary_name VARCHAR(150),
      weight_grams INT DEFAULT 500,
      qr_code_data TEXT NOT NULL,
      qr_status VARCHAR(30) NOT NULL DEFAULT 'INACTIVE',
      activated_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_batch_packages_batch ON batch_packages(batch_id);
    CREATE INDEX IF NOT EXISTS idx_batch_packages_status ON batch_packages(qr_status);
    CREATE INDEX IF NOT EXISTS idx_lab_reports_batch ON lab_reports(batch_id);
    CREATE INDEX IF NOT EXISTS idx_lab_reports_sample ON lab_reports(sample_id);
  `);

  console.log('✓ Migration executed successfully in PostgreSQL 18!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
