-- schema.sql: BeeHive Blockchain PostgreSQL Relational Schema

-- 1. KVIC Official Master Beekeeper Registry
CREATE TABLE IF NOT EXISTS kvic_master_registry (
  id SERIAL PRIMARY KEY,
  aadhaar VARCHAR(14) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  honey_mission_id VARCHAR(100) UNIQUE NOT NULL,
  allocated_boxes INT DEFAULT 20,
  enrolment_date DATE DEFAULT CURRENT_DATE,
  scheme_status VARCHAR(50) DEFAULT 'ACTIVE_BENEFICIARY',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Platform Users (Farmer, KVIC Official, Admin)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(60) PRIMARY KEY,
  role VARCHAR(20) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  aadhaar VARCHAR(20),
  password VARCHAR(150) NOT NULL,
  state VARCHAR(100),
  district VARCHAR(100),
  village VARCHAR(100),
  bee_boxes INT DEFAULT 0,
  honey_mission_id VARCHAR(100),
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING_KVIC_APPROVAL',
  approved_by VARCHAR(150),
  approval_date DATE,
  matched_in_kvic_db BOOLEAN DEFAULT FALSE,
  wallet_address VARCHAR(80),
  application_id VARCHAR(60),
  officer_id VARCHAR(50),
  designation VARCHAR(150),
  department VARCHAR(150),
  office VARCHAR(150),
  security_pin VARCHAR(10),
  admin_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Honey Batches Logged on Blockchain
CREATE TABLE IF NOT EXISTS honey_batches (
  batch_id VARCHAR(60) PRIMARY KEY,
  farmer_id VARCHAR(60) REFERENCES users(id) ON DELETE CASCADE,
  farmer_name VARCHAR(150) NOT NULL,
  district VARCHAR(150),
  apiary_id VARCHAR(60) DEFAULT 'APIARY-04',
  apiary_name VARCHAR(150) DEFAULT 'Apiary #4 (Mogar Central Orchard)',
  floral_source VARCHAR(100) NOT NULL,
  harvest_date DATE NOT NULL,
  quantity_kg NUMERIC(10,2) NOT NULL,
  moisture_percent NUMERIC(5,2) NOT NULL,
  fructose_glucose_ratio NUMERIC(5,2) DEFAULT 1.15,
  purity_test_status VARCHAR(100) DEFAULT 'PENDING_LAB_TESTING',
  block_hash VARCHAR(100) NOT NULL,
  qr_code_data TEXT,
  qr_status VARCHAR(50) DEFAULT 'INACTIVE',
  lab_sample_id VARCHAR(80),
  lab_test_status VARCHAR(50) DEFAULT 'PENDING_TESTING',
  packaging_status VARCHAR(50) DEFAULT 'PACKAGING_IN_PROGRESS',
  packaged_units_count INT DEFAULT 120,
  consensus_status VARCHAR(50) DEFAULT 'AWAITING_DUAL_VERIFICATION',
  lab_moisture NUMERIC(5,2),
  lab_fructose_glucose NUMERIC(5,2) DEFAULT 1.15,
  lab_c4_sugar_percent NUMERIC(5,2) DEFAULT 0.0,
  lab_hmf_mg_kg NUMERIC(5,2) DEFAULT 12.5,
  lab_report_summary TEXT,
  lab_tested_at TIMESTAMP,
  activated_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'INACTIVE_AWAITING_LAB',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3b. NABL / FSSAI Laboratory Chemical Test Reports
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

-- 3c. Individual Batch Packaging Units (Jars with Activated/Inactive QR Codes)
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

-- 4. Immutable Blockchain Ledger Event Log
CREATE TABLE IF NOT EXISTS blockchain_logs (
  id SERIAL PRIMARY KEY,
  tx_hash VARCHAR(80) NOT NULL,
  block_number BIGINT NOT NULL,
  event VARCHAR(80) NOT NULL,
  details TEXT NOT NULL,
  actor VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Real-Time Hive IoT Telemetry & AI Diagnostic Stream
CREATE TABLE IF NOT EXISTS hive_telemetry (
  id SERIAL PRIMARY KEY,
  farmer_id VARCHAR(60) REFERENCES users(id) ON DELETE CASCADE,
  hive_id VARCHAR(50) NOT NULL DEFAULT 'HIVE-ALPHA-01',
  apiary_name VARCHAR(150) DEFAULT 'Apiary #4 (Mogar Central Orchard)',
  weight_kg NUMERIC(6,2) NOT NULL,
  temperature_c NUMERIC(5,2) NOT NULL,
  humidity_percent NUMERIC(5,2) NOT NULL,
  acoustic_freq_hz NUMERIC(6,2) NOT NULL,
  swarming_risk VARCHAR(30) NOT NULL DEFAULT 'LOW',
  anomaly_detected BOOLEAN DEFAULT FALSE,
  anomaly_type VARCHAR(80) DEFAULT 'NORMAL',
  disease_risk VARCHAR(80) DEFAULT 'HEALTHY',
  ai_confidence_score NUMERIC(5,2) DEFAULT 98.50,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Harvest Day AI Cycle Monitoring & KVIC Flagging
CREATE TABLE IF NOT EXISTS harvest_ai_audits (
  id SERIAL PRIMARY KEY,
  batch_id VARCHAR(60),
  farmer_id VARCHAR(60) REFERENCES users(id) ON DELETE CASCADE,
  farmer_name VARCHAR(150) NOT NULL,
  district VARCHAR(150),
  apiary_id VARCHAR(60) DEFAULT 'APIARY-04',
  apiary_name VARCHAR(150) DEFAULT 'Apiary #4 (Mogar Central Orchard)',
  start_date DATE NOT NULL,
  harvest_date DATE NOT NULL,
  total_days INT NOT NULL,
  start_weight_kg NUMERIC(6,2) NOT NULL,
  end_weight_kg NUMERIC(6,2) NOT NULL,
  net_weight_gain_kg NUMERIC(6,2) NOT NULL,
  flag_color VARCHAR(10) NOT NULL, -- 'GREEN' or 'RED'
  flag_status VARCHAR(50) NOT NULL,
  flag_title VARCHAR(150) NOT NULL,
  flag_reasons TEXT[] NOT NULL,
  sudden_changes_detected BOOLEAN DEFAULT FALSE,
  sudden_weight_jump_kg NUMERIC(6,2) DEFAULT 0,
  temperature_stability VARCHAR(50) DEFAULT 'STABLE (34-36°C)',
  disease_history_count INT DEFAULT 0,
  ai_verdict_summary TEXT NOT NULL,
  kvic_notified BOOLEAN DEFAULT TRUE,
  kvic_action VARCHAR(50) DEFAULT 'AWAITING_KVIC_REVIEW',
  kvic_remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Fast Real-Time Verification Lookups
CREATE INDEX IF NOT EXISTS idx_kvic_aadhaar ON kvic_master_registry(aadhaar);
CREATE INDEX IF NOT EXISTS idx_kvic_phone ON kvic_master_registry(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_aadhaar ON users(aadhaar);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_batches_farmer ON honey_batches(farmer_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_farmer ON hive_telemetry(farmer_id);
CREATE INDEX IF NOT EXISTS idx_harvest_audits_farmer ON harvest_ai_audits(farmer_id);
CREATE INDEX IF NOT EXISTS idx_harvest_audits_flag ON harvest_ai_audits(flag_color);

