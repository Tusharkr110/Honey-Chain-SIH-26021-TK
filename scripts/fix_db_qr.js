const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5433'),
  database: process.env.PG_DATABASE || 'beehive_db',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres'
});

async function run() {
  const res = await pool.query(
    "UPDATE honey_batches SET qr_code_data = '/passport.html?batch=' || batch_id WHERE qr_code_data LIKE '%beehive-blockchain.gov.in%' OR qr_code_data LIKE '%10.231.%'"
  );
  console.log('Updated honey_batches rows:', res.rowCount);

  // Also check packaged_units if any
  try {
    const resUnits = await pool.query(
      "UPDATE packaged_units SET qr_target_url = '/passport.html?package=' || package_id WHERE qr_target_url LIKE '%10.231.%'"
    );
    console.log('Updated packaged_units rows:', resUnits.rowCount);
  } catch (e) {}

  await pool.end();
}

run().catch(err => {
  console.error(err);
  pool.end();
});
