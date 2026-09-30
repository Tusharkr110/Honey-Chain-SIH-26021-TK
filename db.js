// db.js - PostgreSQL Connection & Database Initialization Layer
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT, 10) || 5433,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'beehive_db'
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// Seed Initial Data
async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL database...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('✓ PostgreSQL tables and indexes verified.');

    // 1. Seed KVIC Master Registry if empty
    const { count: kvicCount } = (await client.query('SELECT COUNT(*) FROM kvic_master_registry')).rows[0];
    if (parseInt(kvicCount, 10) === 0) {
      console.log('Seeding KVIC Master Database records...');
      await client.query(`
        INSERT INTO kvic_master_registry (aadhaar, full_name, phone, state, district, honey_mission_id, allocated_boxes, enrolment_date, scheme_status)
        VALUES 
        ('123456789012', 'Ramesh Patel', '9876543210', 'Gujarat', 'Anand', 'KVIC-HM-GJ-2023-0104', 20, '2023-04-12', 'ACTIVE_BENEFICIARY'),
        ('987654321098', 'Sunita Devi', '9811223344', 'Bihar', 'Muzaffarpur', 'KVIC-HM-BR-2023-0492', 25, '2023-08-20', 'ACTIVE_BENEFICIARY'),
        ('555566667777', 'Harpreet Singh', '9822334455', 'Punjab', 'Ludhiana', 'KVIC-HM-PB-2024-0018', 30, '2024-01-15', 'ACTIVE_BENEFICIARY'),
        ('888899990000', 'Kavita Rao', '9733445566', 'Karnataka', 'Coorg', 'KVIC-HM-KA-2024-0145', 15, '2024-03-02', 'ACTIVE_BENEFICIARY')
        ON CONFLICT (aadhaar) DO NOTHING;
      `);
    }

    // 2. Seed Users if empty
    const { count: userCount } = (await client.query('SELECT COUNT(*) FROM users')).rows[0];
    if (parseInt(userCount, 10) === 0) {
      console.log('Seeding initial platform users in PostgreSQL...');
      await client.query(`
        INSERT INTO users (
          id, role, full_name, email, phone, aadhaar, password, state, district, village, 
          bee_boxes, honey_mission_id, status, approved_by, approval_date, matched_in_kvic_db, 
          wallet_address, application_id, officer_id, designation, department, office, security_pin, admin_code
        ) VALUES 
        (
          'FARMER-001', 'farmer', 'Ramesh Patel', 'ramesh.farmer@beehive.in', '9876543210', '123456789012', 
          'password123', 'Gujarat', 'Anand', 'Mogar', 20, 'KVIC-HM-GJ-2023-0104', 'APPROVED', 
          'KVIC Nodal Officer - West Zone', '2023-04-14', true, '0x71C...4E89', NULL, NULL, NULL, NULL, NULL, NULL, NULL
        ),
        (
          'FARMER-002', 'farmer', 'Suresh Verma', 'suresh.verma@beehive.in', '9988776655', '444433332222', 
          'password123', 'Uttar Pradesh', 'Saharanpur', 'Behat', 12, '', 'PENDING_KVIC_APPROVAL', 
          NULL, NULL, false, '0x39B...881F', 'APP-KVIC-2026-9041', NULL, NULL, NULL, NULL, NULL, NULL
        ),
        (
          'KVIC-OFFICER-01', 'kvic', 'Dr. Arvind Sharma', 'kvic.officer@kvic.gov.in', '9871122330', NULL, 
          'password123', NULL, NULL, NULL, 0, NULL, 'APPROVED', NULL, NULL, false, 
          '0xKV1C...0001', NULL, 'KVIC-NDO-482', 'Zonal Director & Nodal Officer', 
          'Honey Mission & Beekeeping Division', 'KVIC State Directorate, New Delhi', '7890', NULL
        ),
        (
          'ADMIN-01', 'admin', 'Rajeshwar Sengupta', 'admin@beehive.gov.in', '9810099881', NULL, 
          'password123', NULL, NULL, NULL, 0, NULL, 'APPROVED', NULL, NULL, false, 
          '0xAD99...F001', NULL, NULL, 'Chief Blockchain Architect & Consortium Admin', 
          'National Honey Board & MoMSME Tech Team', 'Central Secretariat', NULL, 'ADM-BH-01'
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // 3. Seed Honey Batches if empty
    const { count: batchCount } = (await client.query('SELECT COUNT(*) FROM honey_batches')).rows[0];
    if (parseInt(batchCount, 10) === 0) {
      console.log('Seeding certified honey batches...');
      await client.query(`
        INSERT INTO honey_batches (
          batch_id, farmer_id, farmer_name, district, floral_source, harvest_date, 
          quantity_kg, moisture_percent, fructose_glucose_ratio, purity_test_status, 
          block_hash, qr_code_data, status
        ) VALUES 
        (
          'HM-BATCH-2026-8812', 'FARMER-001', 'Ramesh Patel', 'Anand, Gujarat', 
          'Mustard & Acacia', '2026-09-15', 85.00, 17.20, 1.15, 'PASSED (NABL Lab certified)', 
          '0x3a4f89d1c7e92b5006b83f0907cae12739268eacdfa89110756e2978a1bc40e7', 
          'passport.html?batch=HM-BATCH-2026-8812', 'VERIFIED_ON_CHAIN'
        ),
        (
          'HM-BATCH-2026-7910', 'FARMER-001', 'Ramesh Patel', 'Anand, Gujarat', 
          'Eucalyptus Wildflower', '2026-08-10', 120.00, 18.00, 1.08, 'PASSED (NABL Lab certified)', 
          '0x98bce178aa9203e0018f77390918cae78891040fdeba1928372648abcf901234', 
          'passport.html?batch=HM-BATCH-2026-7910', 'VERIFIED_ON_CHAIN'
        )
        ON CONFLICT (batch_id) DO NOTHING;
      `);
    }

    // 4. Seed Blockchain Logs if empty
    const { count: logCount } = (await client.query('SELECT COUNT(*) FROM blockchain_logs')).rows[0];
    if (parseInt(logCount, 10) === 0) {
      console.log('Seeding blockchain event logs...');
      await client.query(`
        INSERT INTO blockchain_logs (tx_hash, block_number, event, details, actor)
        VALUES 
        ('0x892f...a10e', 1049281, 'KVIC_FARMER_VERIFIED', 'Farmer Ramesh Patel (KVIC-HM-GJ-2023-0104) verified via Honey Mission Master DB', 'KVIC Nodal Smart Contract'),
        ('0x44c1...881f', 1049282, 'REGISTRATION_SUBMITTED_PENDING_KVIC', 'Farmer Suresh Verma registered (Aadhaar 4444***2222). Not in KVIC DB -> Awaiting manual KVIC approval', 'Farmer Self-Service Gateway'),
        ('0x2190...f98a', 1049283, 'HONEY_BATCH_MINTED', 'Batch HM-BATCH-2026-8812 (85 kg Mustard & Acacia) minted by Farmer Ramesh Patel', 'Provenance Minting Contract');
      `);
    }

    // 5. Seed Hive Telemetry in PostgreSQL if empty
    const { count: telemetryCount } = (await client.query('SELECT COUNT(*) FROM hive_telemetry')).rows[0];
    if (parseInt(telemetryCount, 10) === 0) {
      console.log('Seeding real hive IoT telemetry records into PostgreSQL...');
      // 15 days of natural nectar flow telemetry
      const telemetryRecords = [
        ['FARMER-001', 'HIVE-ALPHA-01', 32.40, 34.8, 59.2, 218.0, 'LOW', false, 'NORMAL', 'HEALTHY', 98.8, '2026-09-14 08:00:00'],
        ['FARMER-001', 'HIVE-ALPHA-01', 33.20, 35.1, 58.5, 215.5, 'LOW', false, 'NORMAL', 'HEALTHY', 98.5, '2026-09-15 08:00:00'],
        ['FARMER-001', 'HIVE-ALPHA-01', 34.10, 35.0, 58.0, 220.0, 'LOW', false, 'NORMAL', 'HEALTHY', 98.9, '2026-09-16 08:00:00'],
        ['FARMER-001', 'HIVE-ALPHA-01', 35.00, 34.9, 57.5, 216.0, 'LOW', false, 'NORMAL', 'HEALTHY', 99.1, '2026-09-17 08:00:00'],
        ['FARMER-001', 'HIVE-ALPHA-01', 36.10, 35.2, 57.0, 219.0, 'LOW', false, 'NORMAL', 'HEALTHY', 98.7, '2026-09-18 08:00:00'],
        ['FARMER-001', 'HIVE-ALPHA-01', 37.30, 35.0, 58.0, 222.0, 'LOW', false, 'NORMAL', 'HEALTHY', 99.0, '2026-09-19 08:00:00'],
        ['FARMER-001', 'HIVE-ALPHA-01', 38.40, 34.8, 58.4, 217.5, 'LOW', false, 'NORMAL', 'HEALTHY', 98.6, '2026-09-20 08:00:00'],
        ['FARMER-001', 'HIVE-ALPHA-01', 39.50, 35.1, 57.8, 220.5, 'LOW', false, 'NORMAL', 'HEALTHY', 99.2, '2026-09-21 08:00:00'],
        ['FARMER-001', 'HIVE-ALPHA-01', 40.80, 35.0, 57.2, 218.0, 'LOW', false, 'NORMAL', 'HEALTHY', 98.9, '2026-09-22 08:00:00'],
        ['FARMER-001', 'HIVE-ALPHA-01', 41.90, 34.9, 58.1, 223.0, 'LOW', false, 'NORMAL', 'HEALTHY', 98.4, '2026-09-23 08:00:00'],
        ['FARMER-001', 'HIVE-ALPHA-01', 43.10, 35.2, 57.5, 219.5, 'LOW', false, 'NORMAL', 'HEALTHY', 99.3, '2026-09-24 08:00:00'],
        ['FARMER-001', 'HIVE-ALPHA-01', 44.20, 35.0, 58.0, 221.0, 'LOW', false, 'NORMAL', 'HEALTHY', 99.0, '2026-09-25 08:00:00'],
        ['FARMER-001', 'HIVE-ALPHA-01', 45.10, 34.8, 57.9, 217.0, 'LOW', false, 'NORMAL', 'HEALTHY', 98.7, '2026-09-26 08:00:00'],
        ['FARMER-001', 'HIVE-ALPHA-01', 45.80, 35.1, 58.2, 216.5, 'LOW', false, 'NORMAL', 'HEALTHY', 98.9, '2026-09-27 08:00:00'],
        ['FARMER-001', 'HIVE-ALPHA-01', 46.20, 34.9, 58.0, 215.0, 'LOW', false, 'NORMAL', 'HEALTHY', 99.4, '2026-09-28 08:00:00']
      ];

      for (const rec of telemetryRecords) {
        await client.query(`
          INSERT INTO hive_telemetry (farmer_id, hive_id, weight_kg, temperature_c, humidity_percent, acoustic_freq_hz, swarming_risk, anomaly_detected, anomaly_type, disease_risk, ai_confidence_score, recorded_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, rec);
      }
    }

    // 6. Seed Harvest AI Audits (Both Green & Red Flags for KVIC demo)
    const { count: auditCount } = (await client.query('SELECT COUNT(*) FROM harvest_ai_audits')).rows[0];
    if (parseInt(auditCount, 10) === 0) {
      console.log('Seeding Harvest AI Audits (Green & Red Flags)...');
      // Green Flag: Clean batch
      await client.query(`
        INSERT INTO harvest_ai_audits (
          batch_id, farmer_id, farmer_name, district, start_date, harvest_date, total_days,
          start_weight_kg, end_weight_kg, net_weight_gain_kg, flag_color, flag_status, flag_title,
          flag_reasons, sudden_changes_detected, sudden_weight_jump_kg, temperature_stability,
          disease_history_count, ai_verdict_summary, kvic_notified, kvic_action
        ) VALUES (
          'HM-BATCH-2026-8812', 'FARMER-001', 'Ramesh Patel', 'Anand, Gujarat', '2026-09-01', '2026-09-15', 14,
          31.20, 45.80, 14.60, 'GREEN', 'PASSED_CLEAN', 'Natural Nectar Influx Verified',
          ARRAY['Gradual weight gain (+1.04 kg/day within natural floral thresholds)', 'Constant brood temperature 34.8-35.2°C', 'Zero acoustic swarming spikes', 'No varroa/foulbrood disease markers'],
          false, 0.0, 'HIGHLY_STABLE (34.9°C Avg)', 0,
          'Full 14-day telemetry shows continuous, authentic floral foraging in Anand mustard fields. Zero synthetic sugar adulteration signatures.',
          true, 'FAST_TRACK_APPROVED'
        );
      `);

      // Red Flag: Flagged batch with sudden overnight weight jump
      await client.query(`
        INSERT INTO harvest_ai_audits (
          batch_id, farmer_id, farmer_name, district, start_date, harvest_date, total_days,
          start_weight_kg, end_weight_kg, net_weight_gain_kg, flag_color, flag_status, flag_title,
          flag_reasons, sudden_changes_detected, sudden_weight_jump_kg, temperature_stability,
          disease_history_count, ai_verdict_summary, kvic_notified, kvic_action
        ) VALUES (
          'HM-BATCH-2026-FLAG-991', 'FARMER-001', 'Ramesh Patel', 'Anand, Gujarat', '2026-08-15', '2026-08-28', 13,
          32.00, 48.50, 16.50, 'RED', 'SUDDEN_CHANGE_FLAGGED', 'Sudden Weight Surge / Potential Sugar Adulteration',
          ARRAY['Sudden overnight weight jump of +11.8 kg on 2026-08-22 (Natural daily threshold is < 1.8 kg)', 'Abnormal nocturnal hive traffic during unseasonable rain', 'Moisture spike to 21.4% indicating unripened sugar syrup'],
          true, 11.80, 'FLUCTUATING (31-37°C)', 1,
          'CRITICAL FLAG: An abrupt 11.8 kg scale increase was detected within a 6-hour midnight window. High statistical probability of exogenous sugar feeding. Mandatory laboratory C4-sugar NMR testing recommended.',
          true, 'AWAITING_KVIC_REVIEW'
        );
      `);
    }

    console.log('✓ PostgreSQL Database initialization & seed complete!');
  } catch (err) {
    console.error('Error during database initialization:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDatabase
};
