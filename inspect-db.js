// inspect-db.js - Real-time audit tool for local PostgreSQL and MongoDB
const { Client } = require('pg');
const { MongoClient } = require('mongodb');

async function runAudit() {
  console.log('\n============================================================');
  console.log('   🐝 BEEHIVE BLOCKCHAIN: LOCAL DUAL DATABASE AUDIT');
  console.log('============================================================\n');

  // 1. PostgreSQL Audit
  console.log('🐘 [1] POSTGRESQL 18 (Relational & Smart Contract Audit Engine)');
  console.log('------------------------------------------------------------');
  const pgClient = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: 'beehive_db'
  });

  try {
    await pgClient.connect();
    const ver = await pgClient.query('SELECT version(), current_database(), current_user;');
    console.log(`✓ Status:       ONLINE & CONNECTED`);
    console.log(`✓ Connection:   localhost:5433 / ${ver.rows[0].current_database}`);
    console.log(`✓ Engine:       ${ver.rows[0].version.split(',')[0]}`);
    console.log(`✓ Current User: ${ver.rows[0].current_user}\n`);

    const tables = [
      { name: 'users', desc: 'Registered Farmers, KVIC Officers, Consortium Admins' },
      { name: 'kvic_master_registry', desc: 'Official KVIC Honey Mission Pre-enrolled Beneficiaries' },
      { name: 'honey_batches', desc: 'Minted Batches with SHA-256 Hashes and NABL Lab Verifications' },
      { name: 'blockchain_logs', desc: 'Immutable Smart Contract Transactions & Audit Trail' },
      { name: 'hive_telemetry', desc: 'Time-series Scale Weight & Micro-climate Streams' },
      { name: 'harvest_ai_audits', desc: 'Harvest Cycle AI Assessments (Green/Red Flags sent to KVIC)' }
    ];

    console.log('   TABLE NAME               ROW COUNT   PURPOSE');
    console.log('   ---------------------------------------------------------------------');
    for (const t of tables) {
      const countRes = await pgClient.query(`SELECT COUNT(*) FROM ${t.name}`);
      console.log(`   ${t.name.padEnd(25)} ${countRes.rows[0].count.padEnd(11)} ${t.desc}`);
    }

    console.log('\n   Latest 3 Users in PostgreSQL:');
    const usersRes = await pgClient.query(`SELECT id, role, full_name, aadhaar, status, honey_mission_id FROM users ORDER BY created_at DESC LIMIT 3`);
    console.table(usersRes.rows);

    await pgClient.end();
  } catch (err) {
    console.error('❌ PostgreSQL Connection Failed:', err.message);
  }

  // 2. MongoDB Audit
  console.log('\n🍃 [2] MONGODB 8.2 (High-Velocity Bio-Acoustics & Swarming JSON Store)');
  console.log('------------------------------------------------------------');
  const mongoClient = new MongoClient('mongodb://localhost:27017');

  try {
    await mongoClient.connect();
    const db = mongoClient.db('beehive_iot_db');
    console.log(`✓ Status:       ONLINE & CONNECTED`);
    console.log(`✓ Connection:   mongodb://localhost:27017/beehive_iot_db`);
    console.log(`✓ Database:     beehive_iot_db`);

    const cols = await db.listCollections().toArray();
    for (const c of cols) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`✓ Collection:   ${c.name} (${count} Multi-Dimensional JSON Documents)`);
    }

    console.log('\n   Latest Ingested Swarming & Acoustic Telemetry JSON Document:');
    const latestDoc = await db.collection('hive_telemetry_documents').find().sort({ timestamp: -1 }).limit(1).toArray();
    if (latestDoc && latestDoc.length > 0) {
      console.log(JSON.stringify(latestDoc[0], null, 2));
    }

    await mongoClient.close();
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
  }

  console.log('\n============================================================');
  console.log('   🌐 LIVE VISUAL BROWSER EXPLORER: http://localhost:3000/db-viewer.html');
  console.log('============================================================\n');
}

runAudit();
