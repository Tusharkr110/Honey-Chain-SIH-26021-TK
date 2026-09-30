// seed-packages-lab.js
require('dotenv').config();
const db = require('./db');

async function seedPackagesAndLab() {
  const baseUrl = (process.env.PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
  console.log(`Seeding initial package units & lab reports with baseUrl: ${baseUrl}...`);
  
  await db.query(`
    UPDATE honey_batches SET
      qr_status = 'ACTIVE',
      lab_sample_id = 'LAB-SMP-2026-8812',
      lab_test_status = 'VERIFIED_MATCHED',
      packaging_status = 'QR_ACTIVATED_READY_FOR_MARKET',
      packaged_units_count = 170,
      consensus_status = 'CONSENSUS_VERIFIED_AUTHENTIC',
      lab_moisture = 17.20,
      lab_c4_sugar_percent = 0.0,
      lab_hmf_mg_kg = 12.5,
      qr_code_data = '${baseUrl}/passport.html?batch=HM-BATCH-2026-8812',
      status = 'ACTIVATED_ON_CHAIN'
    WHERE batch_id = 'HM-BATCH-2026-8812';

    INSERT INTO lab_reports (sample_id, batch_id, apiary_id, apiary_name, moisture_percent, fructose_glucose_ratio, c4_sugar_percent, hmf_mg_kg, pollen_origin, adulteration_detected, kvic_audit_matched, consensus_verdict, report_hash, tested_by)
    VALUES 
    ('LAB-SMP-2026-8812', 'HM-BATCH-2026-8812', 'APIARY-04', 'Apiary #4 (Mogar Central Orchard)', 17.20, 1.15, 0.0, 12.5, 'Mustard & Acacia (Sarson / Khair)', false, true, 'VERIFIED_MATCH_APPROVED', '0x71e98abf1048ca09e8b7d912389a0b12', 'Dr. Sunita Deshmukh (Chief Biochemist, NABL)')
    ON CONFLICT (sample_id) DO NOTHING;

    INSERT INTO batch_packages (package_id, batch_id, apiary_id, apiary_name, weight_grams, qr_code_data, qr_status, activated_at)
    VALUES
    ('JAR-HM-BATCH-2026-8812-001', 'HM-BATCH-2026-8812', 'APIARY-04', 'Apiary #4 (Mogar Central Orchard)', 500, '${baseUrl}/passport.html?package=JAR-HM-BATCH-2026-8812-001', 'ACTIVE', CURRENT_TIMESTAMP),
    ('JAR-HM-BATCH-2026-8812-002', 'HM-BATCH-2026-8812', 'APIARY-04', 'Apiary #4 (Mogar Central Orchard)', 500, '${baseUrl}/passport.html?package=JAR-HM-BATCH-2026-8812-002', 'ACTIVE', CURRENT_TIMESTAMP),
    ('JAR-HM-BATCH-2026-8812-003', 'HM-BATCH-2026-8812', 'APIARY-04', 'Apiary #4 (Mogar Central Orchard)', 500, '${baseUrl}/passport.html?package=JAR-HM-BATCH-2026-8812-003', 'ACTIVE', CURRENT_TIMESTAMP)
    ON CONFLICT (package_id) DO NOTHING;
  `);

  console.log('✓ Initial package units & lab reports successfully seeded!');
  process.exit(0);
}

seedPackagesAndLab().catch(e => {
  console.error(e);
  process.exit(1);
});
