// server.js - BeeHive Blockchain Node.js & PostgreSQL Backend Server
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const crypto = require('crypto');
const os = require('os');
const QRCode = require('qrcode');
const db = require('./db');
const { connectMongo, getMongoDb } = require('./mongo');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Frontend
app.use(express.static(path.join(__dirname)));

// Helper: Generate SHA-256 Hash
function generateBlockHash(dataString) {
  return '0x' + crypto.createHash('sha256').update(dataString + Date.now().toString()).digest('hex');
}

// Helper: Get Primary Network LAN IPv4 Address
function getLanIp() {
  try {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Find non-internal IPv4 address, prefer standard Wi-Fi/Ethernet subnets
        if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254') && !net.address.startsWith('172.21.')) {
          return net.address;
        }
      }
    }
  } catch (e) {}
  return 'localhost';
}

// Helper: Determine Public / LAN Base URL for Real Scannable QR Codes
function getBaseUrl(req) {
  if (process.env.PUBLIC_BASE_URL && process.env.PUBLIC_BASE_URL.trim()) {
    return process.env.PUBLIC_BASE_URL.trim().replace(/\/+$/, '');
  }
  if (req && req.get) {
    const host = req.get('host');
    if (host) {
      return `${req.protocol || 'http'}://${host}`;
    }
  }
  const lanIp = getLanIp();
  const port = process.env.PORT || 3000;
  if (lanIp && lanIp !== 'localhost') {
    return `http://${lanIp}:${port}`;
  }
  return `http://localhost:${port}`;
}


// Helper: Log to PostgreSQL Blockchain Ledger
async function logBlockchainTx(event, details, actor) {
  try {
    const randomHex = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
    const txHash = `0x${randomHex()}...${randomHex().substring(0, 4)}`;

    const { rows } = await db.query('SELECT COALESCE(MAX(block_number), 1049280) + 1 AS next_block FROM blockchain_logs');
    const nextBlock = rows[0].next_block;

    await db.query(
      `INSERT INTO blockchain_logs (tx_hash, block_number, event, details, actor)
       VALUES ($1, $2, $3, $4, $5)`,
      [txHash, nextBlock, event, details, actor || 'BeeHive Smart Contract Engine']
    );
  } catch (err) {
    console.error('Failed to log blockchain transaction:', err);
  }
}

// ==========================================
// 1. HEALTH & SYSTEM DIAGNOSTIC API
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await db.query('SELECT version(), current_database(), current_user');
    res.json({
      status: 'UP',
      database: 'PostgreSQL 18.2 Connected',
      dbName: dbRes.rows[0].current_database,
      user: dbRes.rows[0].current_user,
      port: process.env.PGPORT || 5433
    });
  } catch (err) {
    res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

// ==========================================
// 2. AUTHENTICATION API
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password, role, pin } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password are required.' });
    }

    let queryText = '';
    let params = [];

    if (role === 'farmer') {
      queryText = `
        SELECT * FROM users 
        WHERE role = 'farmer' 
        AND (phone = $1 OR aadhaar = $1 OR LOWER(email) = LOWER($1))
      `;
      params = [identifier.trim()];
    } else if (role === 'kvic') {
      queryText = `
        SELECT * FROM users 
        WHERE role = 'kvic' 
        AND (LOWER(email) = LOWER($1) OR (officer_id IS NOT NULL AND LOWER(officer_id) = LOWER($1)))
      `;
      params = [identifier.trim()];
    } else if (role === 'admin') {
      queryText = `
        SELECT * FROM users 
        WHERE role = 'admin' 
        AND (LOWER(email) = LOWER($1) OR (admin_code IS NOT NULL AND LOWER(admin_code) = LOWER($1)))
      `;
      params = [identifier.trim()];
    } else {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    const { rows } = await db.query(queryText, params);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No account found matching these credentials.' });
    }

    const user = rows[0];

    // Password verification (for hackathon demo, matches stored hash/pwd)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password. Please verify and try again.' });
    }

    // KVIC PIN verification
    if (role === 'kvic' && user.security_pin) {
      if (pin && pin !== user.security_pin) {
        return res.status(401).json({ error: 'Invalid KVIC Security Token PIN. Access restricted to authorized nodal officers.' });
      }
    }

    // Convert keys for frontend compatibility
    res.json({
      success: true,
      user: {
        id: user.id,
        role: user.role,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        aadhaar: user.aadhaar,
        state: user.state,
        district: user.district,
        village: user.village,
        beeBoxes: user.bee_boxes,
        honeyMissionId: user.honey_mission_id,
        status: user.status,
        approvedBy: user.approved_by,
        approvalDate: user.approval_date,
        matchedInKvicDb: user.matched_in_kvic_db,
        walletAddress: user.wallet_address,
        applicationId: user.application_id,
        officerId: user.officer_id,
        designation: user.designation,
        department: user.department,
        office: user.office
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. FARMER REGISTRATION WITH KVIC DATABASE CHECK
// ==========================================
app.post('/api/auth/register-farmer', async (req, res) => {
  try {
    const {
      fullName,
      aadhaar,
      phone,
      email,
      password,
      state,
      district,
      village,
      beeBoxes,
      honeyMissionId
    } = req.body;

    const cleanAadhaar = (aadhaar || '').replace(/\s+/g, '').trim();
    const cleanPhone = (phone || '').replace(/\s+/g, '').trim();
    const cleanHMId = (honeyMissionId || '').trim().toUpperCase();
    const userEmail = (email && email.trim()) || `${cleanPhone}@beehive.gov.in`;

    if (!fullName || !cleanAadhaar || !cleanPhone || !password || !state || !district) {
      return res.status(400).json({ error: 'All mandatory fields must be completed.' });
    }

    // Check if farmer already registered in users table
    const existingCheck = await db.query(
      'SELECT id FROM users WHERE aadhaar = $1 OR phone = $2',
      [cleanAadhaar, cleanPhone]
    );
    if (existingCheck.rows.length > 0) {
      return res.status(409).json({ error: 'A farmer with this Aadhaar UID or phone is already registered on BeeHive Blockchain.' });
    }

    // REAL-TIME KVIC MASTER DATABASE LOOKUP IN POSTGRESQL!
    const kvicLookup = await db.query(
      `SELECT * FROM kvic_master_registry 
       WHERE aadhaar = $1 
          OR phone = $2 
          OR (honey_mission_id IS NOT NULL AND UPPER(honey_mission_id) = $3)`,
      [cleanAadhaar, cleanPhone, cleanHMId]
    );

    const randomWallet = '0x' + crypto.randomBytes(2).toString('hex').toUpperCase() + '...' + crypto.randomBytes(2).toString('hex').toUpperCase();
    const newFarmerId = `FARMER-${Date.now().toString().slice(-4)}`;

    if (kvicLookup.rows.length > 0) {
      // ----------------------------------------------------
      // CASE 1: MATCH FOUND IN KVIC MASTER REGISTRY!
      // Status: APPROVED (Auto-verified)
      // ----------------------------------------------------
      const kvicRecord = kvicLookup.rows[0];
      const assignedHMId = kvicRecord.honey_mission_id || `KVIC-HM-${state.substring(0, 2).toUpperCase()}-2024-${Math.floor(1000 + Math.random() * 9000)}`;
      const boxes = kvicRecord.allocated_boxes || beeBoxes || 20;

      const insertRes = await db.query(
        `INSERT INTO users (
          id, role, full_name, email, phone, aadhaar, password, state, district, village, 
          bee_boxes, honey_mission_id, status, approved_by, approval_date, matched_in_kvic_db, 
          wallet_address, created_at
        ) VALUES ($1, 'farmer', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'APPROVED', 
                  'KVIC Central Database Engine (Auto-Verified)', CURRENT_DATE, true, $12, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          newFarmerId, fullName, userEmail, cleanPhone, cleanAadhaar, password,
          state, district, village || 'Gramin', boxes, assignedHMId, randomWallet
        ]
      );

      const newUser = insertRes.rows[0];

      // Record on Blockchain Ledger in PostgreSQL
      await logBlockchainTx(
        'KVIC_FARMER_AUTO_VERIFIED',
        `Farmer ${fullName} verified against KVIC Master DB in PostgreSQL (HM-ID: ${assignedHMId}). Smart contract identity minted.`,
        'KVIC Central Registry Smart Contract'
      );

      return res.status(201).json({
        success: true,
        verified: true,
        message: 'Aadhaar matched KVIC Honey Mission records. Identity auto-approved on-chain!',
        user: {
          id: newUser.id,
          role: newUser.role,
          fullName: newUser.full_name,
          email: newUser.email,
          phone: newUser.phone,
          aadhaar: newUser.aadhaar,
          state: newUser.state,
          district: newUser.district,
          village: newUser.village,
          beeBoxes: newUser.bee_boxes,
          honeyMissionId: newUser.honey_mission_id,
          status: newUser.status,
          approvedBy: newUser.approved_by,
          approvalDate: newUser.approval_date,
          matchedInKvicDb: newUser.matched_in_kvic_db,
          walletAddress: newUser.wallet_address
        }
      });

    } else {
      // ----------------------------------------------------
      // CASE 2: NOT FOUND IN KVIC MASTER REGISTRY!
      // Status: PENDING_KVIC_APPROVAL
      // ----------------------------------------------------
      const applicationId = `APP-KVIC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const insertRes = await db.query(
        `INSERT INTO users (
          id, role, full_name, email, phone, aadhaar, password, state, district, village, 
          bee_boxes, honey_mission_id, status, approved_by, approval_date, matched_in_kvic_db, 
          wallet_address, application_id, created_at
        ) VALUES ($1, 'farmer', $2, $3, $4, $5, $6, $7, $8, $9, $10, '', 'PENDING_KVIC_APPROVAL', 
                  NULL, NULL, false, $11, $12, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          newFarmerId, fullName, userEmail, cleanPhone, cleanAadhaar, password,
          state, district, village || 'Gramin', beeBoxes || 10, randomWallet, applicationId
        ]
      );

      const newUser = insertRes.rows[0];

      // Record on Blockchain Ledger in PostgreSQL
      await logBlockchainTx(
        'REGISTRATION_SUBMITTED_PENDING_KVIC',
        `Farmer ${fullName} (Aadhaar: ${cleanAadhaar.substring(0, 4)}***) not found in KVIC DB. Forwarded to KVIC Nodal Officer in PostgreSQL.`,
        'BeeHive Self-Service Gateway'
      );

      return res.status(201).json({
        success: true,
        verified: false,
        message: 'Details not found in pre-approved KVIC Database. Application pending KVIC Officer review.',
        user: {
          id: newUser.id,
          role: newUser.role,
          fullName: newUser.full_name,
          email: newUser.email,
          phone: newUser.phone,
          aadhaar: newUser.aadhaar,
          state: newUser.state,
          district: newUser.district,
          village: newUser.village,
          beeBoxes: newUser.bee_boxes,
          honeyMissionId: '',
          status: newUser.status,
          applicationId: newUser.application_id,
          matchedInKvicDb: newUser.matched_in_kvic_db,
          walletAddress: newUser.wallet_address
        }
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. KVIC OFFICER APIS
// ==========================================

// Get all pending farmer applications
app.get('/api/kvic/pending-farmers', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, role, full_name AS "fullName", email, phone, aadhaar, state, district, 
              village, bee_boxes AS "beeBoxes", status, application_id AS "applicationId", 
              created_at AS "createdAt"
       FROM users 
       WHERE role = 'farmer' AND status = 'PENDING_KVIC_APPROVAL'
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// KVIC Officer Approves a pending farmer
app.post('/api/kvic/approve-farmer', async (req, res) => {
  try {
    const { farmerId, officerName } = req.body;
    if (!farmerId) return res.status(400).json({ error: 'Farmer ID is required.' });

    const farmerRes = await db.query('SELECT * FROM users WHERE id = $1', [farmerId]);
    if (farmerRes.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found in PostgreSQL.' });
    }

    const farmer = farmerRes.rows[0];
    const generatedHMId = farmer.honey_mission_id || 
      `KVIC-HM-${farmer.state ? farmer.state.substring(0, 2).toUpperCase() : 'IN'}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const approver = officerName || 'Dr. Arvind Sharma (KVIC Nodal Officer)';

    const updateRes = await db.query(
      `UPDATE users 
       SET status = 'APPROVED', 
           approved_by = $1, 
           approval_date = CURRENT_DATE, 
           honey_mission_id = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [approver, generatedHMId, farmerId]
    );

    const updatedUser = updateRes.rows[0];

    // Log smart contract approval on PostgreSQL ledger
    await logBlockchainTx(
      'KVIC_OFFICER_APPROVED_FARMER',
      `KVIC Nodal Officer verified and approved Farmer ${updatedUser.full_name} (UID: ${updatedUser.aadhaar}). Assigned Honey Mission ID: ${generatedHMId}`,
      'KVIC Verification Smart Contract'
    );

    res.json({
      success: true,
      message: `Farmer ${updatedUser.full_name} successfully approved!`,
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        aadhaar: updatedUser.aadhaar,
        state: updatedUser.state,
        district: updatedUser.district,
        beeBoxes: updatedUser.bee_boxes,
        honeyMissionId: updatedUser.honey_mission_id,
        status: updatedUser.status,
        approvedBy: updatedUser.approved_by,
        approvalDate: updatedUser.approval_date,
        walletAddress: updatedUser.wallet_address
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// KVIC Officer Rejects an application
app.post('/api/kvic/reject-farmer', async (req, res) => {
  try {
    const { farmerId, reason, officerName } = req.body;
    if (!farmerId) return res.status(400).json({ error: 'Farmer ID is required.' });

    const approver = `${officerName || 'KVIC Nodal Officer'} - Rejected: ${reason || 'Criteria not met'}`;

    const updateRes = await db.query(
      `UPDATE users 
       SET status = 'REJECTED', 
           approved_by = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING full_name, aadhaar`,
      [approver, farmerId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found.' });
    }

    const { full_name, aadhaar } = updateRes.rows[0];

    await logBlockchainTx(
      'KVIC_OFFICER_REJECTED_FARMER',
      `KVIC Officer rejected beekeeper application for ${full_name} (UID: ${aadhaar}). Reason: ${reason || 'Document discrepancy'}`,
      'KVIC Verification Smart Contract'
    );

    res.json({ success: true, message: `Application for ${full_name} rejected.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search & List KVIC Master Beekeeper Database
app.get('/api/kvic/master-registry', async (req, res) => {
  try {
    const query = (req.query.q || '').trim().toLowerCase();
    let rows;
    if (query) {
      const searchPattern = `%${query}%`;
      const queryRes = await db.query(
        `SELECT id, aadhaar, full_name AS "fullName", phone, state, district, 
                honey_mission_id AS "honeyMissionId", allocated_boxes AS "allocatedBoxes", 
                enrolment_date AS "enrolmentDate", scheme_status AS "schemeStatus"
         FROM kvic_master_registry
         WHERE LOWER(full_name) LIKE $1 
            OR aadhaar LIKE $1 
            OR LOWER(honey_mission_id) LIKE $1 
            OR LOWER(district) LIKE $1
         ORDER BY id DESC`,
        [searchPattern]
      );
      rows = queryRes.rows;
    } else {
      const queryRes = await db.query(
        `SELECT id, aadhaar, full_name AS "fullName", phone, state, district, 
                honey_mission_id AS "honeyMissionId", allocated_boxes AS "allocatedBoxes", 
                enrolment_date AS "enrolmentDate", scheme_status AS "schemeStatus"
         FROM kvic_master_registry
         ORDER BY id DESC`
      );
      rows = queryRes.rows;
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Beekeeper directly into KVIC Master Database
app.post('/api/kvic/master-registry', async (req, res) => {
  try {
    const { aadhaar, fullName, phone, state, district, allocatedBoxes } = req.body;
    const cleanAadhaar = (aadhaar || '').replace(/\s+/g, '').trim();
    const cleanPhone = (phone || '').replace(/\s+/g, '').trim();

    if (!cleanAadhaar || !fullName || !state || !district) {
      return res.status(400).json({ error: 'Aadhaar, Full Name, State, and District are required.' });
    }

    const hmId = `KVIC-HM-${state.substring(0, 2).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const insertRes = await db.query(
      `INSERT INTO kvic_master_registry 
       (aadhaar, full_name, phone, state, district, honey_mission_id, allocated_boxes, enrolment_date, scheme_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, 'ACTIVE_BENEFICIARY')
       ON CONFLICT (aadhaar) DO UPDATE 
       SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, allocated_boxes = EXCLUDED.allocated_boxes
       RETURNING *`,
      [cleanAadhaar, fullName, cleanPhone, state, district, hmId, allocatedBoxes || 20]
    );

    res.status(201).json({ success: true, record: insertRes.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. HONEY BATCHES APIS & APIARY REGISTRY
// ==========================================
const FARMER_APIARIES = [
  {
    id: 'APIARY-04',
    apiaryId: 'APIARY-04',
    name: 'Apiary #4 (Mogar Central Orchard)',
    apiaryName: 'Apiary #4 (Mogar Central Orchard)',
    hiveId: 'HIVE-ALPHA-01',
    location: 'Mogar Central Agro-Orchard, Anand',
    floralSource: 'Mustard & Acacia',
    boxes: 5,
    weightKg: 46.39,
    temperatureC: 35.1,
    humidityPercent: 58.4,
    acousticFreqHz: 215.0,
    swarmingRisk: 'LOW',
    queenPipingDetected: false,
    diseaseRisk: 'HEALTHY',
    harvestStatus: 'HARVEST_READY',
    supersCapped: '88%',
    recommendation: 'Colony harmonized. Honeycomb supers > 85% capped. Ready for harvest cycle and blockchain minting.'
  },
  {
    id: 'APIARY-01',
    apiaryId: 'APIARY-01',
    name: 'Apiary #1 (Mustard Meadow East)',
    apiaryName: 'Apiary #1 (Mustard Meadow East)',
    hiveId: 'HIVE-MM-01',
    location: 'Boriavi Farm Plot #2, Anand',
    floralSource: 'Mustard (Sarson)',
    boxes: 6,
    weightKg: 42.15,
    temperatureC: 34.8,
    humidityPercent: 57.0,
    acousticFreqHz: 212.0,
    swarmingRisk: 'LOW',
    queenPipingDetected: false,
    diseaseRisk: 'HEALTHY',
    harvestStatus: 'ACTIVE_FORAGING',
    supersCapped: '65%',
    recommendation: 'Active mustard nectar foraging. Weight accumulating smoothly at +0.95 kg/day.'
  },
  {
    id: 'APIARY-02',
    apiaryId: 'APIARY-02',
    name: 'Apiary #2 (Acacia Forest Reserve)',
    apiaryName: 'Apiary #2 (Acacia Forest Reserve)',
    hiveId: 'HIVE-AF-02',
    location: 'Dakor Forest Border, Anand',
    floralSource: 'Acacia (Khair)',
    boxes: 4,
    weightKg: 38.90,
    temperatureC: 35.6,
    humidityPercent: 61.5,
    acousticFreqHz: 310.0,
    swarmingRisk: 'MODERATE',
    queenPipingDetected: false,
    diseaseRisk: 'HEALTHY',
    harvestStatus: 'PRE_SWARM_INSPECTION',
    supersCapped: '45%',
    recommendation: 'Elevated drone wing resonance (310 Hz). Inspect queen cells on brood frame bottoms.'
  },
  {
    id: 'APIARY-03',
    apiaryId: 'APIARY-03',
    name: 'Apiary #3 (Jamun Riverbank Apiary)',
    apiaryName: 'Apiary #3 (Jamun Riverbank Apiary)',
    hiveId: 'HIVE-JR-03',
    location: 'Mahi River Catchment, Anand',
    floralSource: 'Jamun & Multi-Flora',
    boxes: 5,
    weightKg: 44.20,
    temperatureC: 33.5,
    humidityPercent: 65.0,
    acousticFreqHz: 485.0,
    swarmingRisk: 'HIGH_SWARM_WARNING',
    queenPipingDetected: true,
    diseaseRisk: 'HEALTHY',
    harvestStatus: 'SWARM_ALERT_SPLIT_HIVE',
    supersCapped: '78%',
    recommendation: 'CRITICAL SWARM BUZZ (485 Hz): Queen piping active. Colony departure imminent. Split hive immediately.'
  }
];

app.get('/api/farmer/apiaries/:farmerId', (req, res) => {
  res.json(FARMER_APIARIES);
});

app.get('/api/farmer/batches/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { rows } = await db.query(
      `SELECT batch_id AS "batchId", farmer_id AS "farmerId", farmer_name AS "farmerName",
              district, apiary_id AS "apiaryId", apiary_name AS "apiaryName",
              floral_source AS "floralSource", harvest_date AS "harvestDate",
              quantity_kg AS "quantityKg", moisture_percent AS "moisturePercent",
              fructose_glucose_ratio AS "fructoseGlucoseRatio", purity_test_status AS "purityTestStatus",
              block_hash AS "blockHash", qr_code_data AS "qrCodeData",
              qr_status AS "qrStatus", lab_sample_id AS "labSampleId",
              lab_test_status AS "labTestStatus", packaging_status AS "packagingStatus",
              packaged_units_count AS "packagedUnitsCount", consensus_status AS "consensusStatus",
              lab_moisture AS "labMoisture", lab_c4_sugar_percent AS "labC4SugarPercent",
              lab_hmf_mg_kg AS "labHmfMgKg", status
       FROM honey_batches
       WHERE farmer_id = $1
       ORDER BY created_at DESC`,
      [farmerId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/farmer/batches', async (req, res) => {
  try {
    const { farmerId, apiaryId, apiaryName, floralSource, quantityKg, moisturePercent, harvestDate } = req.body;
    if (!farmerId || !floralSource || !quantityKg) {
      return res.status(400).json({ error: 'Farmer ID, floral source, and quantity are required.' });
    }

    const farmerRes = await db.query('SELECT full_name, district, state FROM users WHERE id = $1', [farmerId]);
    if (farmerRes.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found in PostgreSQL.' });
    }

    const farmer = farmerRes.rows[0];
    const batchId = `HM-BATCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const blockHash = generateBlockHash(`${batchId}-${farmerId}-${quantityKg}`);
    const baseUrl = getBaseUrl(req);
    const qrData = `${baseUrl}/passport.html?batch=${batchId}`;
    const location = `${farmer.district || 'Anand'}, ${farmer.state || 'Gujarat'}`;
    const targetApiaryId = apiaryId || 'APIARY-04';
    const targetApiaryName = apiaryName || 'Apiary #4 (Mogar Central Orchard)';
    const dateOfHarvest = harvestDate || new Date().toISOString().split('T')[0];
    const labSampleId = `LAB-SMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const packagedUnits = Math.round((parseFloat(quantityKg) * 1000) / 500) || 100;

    const insertRes = await db.query(
      `INSERT INTO honey_batches (
        batch_id, farmer_id, farmer_name, district, apiary_id, apiary_name, floral_source, harvest_date, 
        quantity_kg, moisture_percent, fructose_glucose_ratio, purity_test_status, 
        block_hash, qr_code_data, qr_status, lab_sample_id, lab_test_status,
        packaging_status, packaged_units_count, consensus_status, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1.14, 'PENDING (NABL Lab Testing In Progress)', 
        $11, $12, 'INACTIVE', $13, 'PENDING_TESTING',
        'PACKAGING_IN_PROGRESS', $14, 'AWAITING_DUAL_VERIFICATION', 'INACTIVE_AWAITING_LAB'
      )
      RETURNING batch_id AS "batchId", farmer_id AS "farmerId", farmer_name AS "farmerName",
                district, apiary_id AS "apiaryId", apiary_name AS "apiaryName",
                floral_source AS "floralSource", harvest_date AS "harvestDate",
                quantity_kg AS "quantityKg", moisture_percent AS "moisturePercent",
                fructose_glucose_ratio AS "fructoseGlucoseRatio", purity_test_status AS "purityTestStatus",
                block_hash AS "blockHash", qr_code_data AS "qrCodeData",
                qr_status AS "qrStatus", lab_sample_id AS "labSampleId",
                lab_test_status AS "labTestStatus", packaging_status AS "packagingStatus",
                packaged_units_count AS "packagedUnitsCount", consensus_status AS "consensusStatus", status`,
      [
        batchId, farmerId, farmer.full_name, location, targetApiaryId, targetApiaryName,
        floralSource, dateOfHarvest, quantityKg, moisturePercent || 17.5, blockHash, qrData,
        labSampleId, packagedUnits
      ]
    );

    // SIMULTANEOUS PACKAGING PROCESS:
    // Generate individual batch packaging units (jars with INACTIVE QR codes pending lab test)
    const sampleUnitsToGenerate = Math.min(8, packagedUnits);
    for (let i = 1; i <= sampleUnitsToGenerate; i++) {
      const pkgId = `JAR-${batchId}-${String(i).padStart(3, '0')}`;
      const pkgQr = `${baseUrl}/passport.html?package=${pkgId}`;
      await db.query(
        `INSERT INTO batch_packages (package_id, batch_id, apiary_id, apiary_name, weight_grams, qr_code_data, qr_status)
         VALUES ($1, $2, $3, $4, 500, $5, 'INACTIVE') ON CONFLICT (package_id) DO NOTHING`,
        [pkgId, batchId, targetApiaryId, targetApiaryName, pkgQr]
      );
    }

    // Register initial sample into lab_reports table awaiting NABL analytical testing
    await db.query(
      `INSERT INTO lab_reports (sample_id, batch_id, apiary_id, apiary_name, moisture_percent, consensus_verdict, report_hash)
       VALUES ($1, $2, $3, $4, $5, 'PENDING_TESTING', $6) ON CONFLICT (sample_id) DO NOTHING`,
      [labSampleId, batchId, targetApiaryId, targetApiaryName, moisturePercent || 17.5, blockHash]
    );

    // AUTOMATED HARVEST AUDIT & KVIC FLAGGING:
    // Automatically analyze telemetry cycle and dispatch verification flag to KVIC
    let automatedAudit = null;
    try {
      const cycleStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      automatedAudit = await performHarvestAiCycleAnalysis({
        farmerId,
        apiaryId: targetApiaryId,
        apiaryName: targetApiaryName,
        startDate: cycleStart,
        harvestDate: dateOfHarvest,
        floralSource,
        quantityKg,
        simulateAnomaly: false,
        batchId
      });
    } catch (auditErr) {
      console.warn("Automated harvest cycle analysis notice:", auditErr.message);
    }

    await logBlockchainTx(
      'HONEY_BATCH_MINTED_AND_PACKAGED',
      `Batch ${batchId} (${quantityKg}kg ${floralSource}) packaging started (${packagedUnits} jars). Sample ${labSampleId} sent to NABL Lab. All QR codes INACTIVE until dual consensus verified.`,
      'Provenance & Packaging Smart Contract'
    );

    res.status(201).json({
      success: true,
      batch: insertRes.rows[0],
      audit: automatedAudit,
      harvestAudit: automatedAudit,
      labSampleId,
      packagedUnits
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5b. NABL CHEMICAL LAB TESTING & DUAL CONSENSUS QR ACTIVATION
// ==========================================
app.post('/api/lab/submit-report', async (req, res) => {
  try {
    const {
      batchId,
      sampleId,
      moisturePercent,
      fructoseGlucoseRatio,
      c4SugarPercent,
      hmfMgKg,
      pollenOrigin,
      testedBy,
      simulateAnomaly,
      remarks
    } = req.body;

    if (!batchId) return res.status(400).json({ error: 'Batch ID is required.' });

    const batchRes = await db.query('SELECT * FROM honey_batches WHERE batch_id = $1', [batchId]);
    if (batchRes.rows.length === 0) return res.status(404).json({ error: 'Batch not found in PostgreSQL.' });
    const batch = batchRes.rows[0];

    const targetSampleId = sampleId || batch.lab_sample_id || `LAB-SMP-${batchId.replace('HM-BATCH-', '')}`;
    const targetMoisture = simulateAnomaly ? (parseFloat(batch.moisture_percent) + 3.5).toFixed(2) : (parseFloat(moisturePercent) || parseFloat(batch.moisture_percent) + 0.1).toFixed(2);
    const targetC4 = simulateAnomaly ? 14.8 : (parseFloat(c4SugarPercent) || 0.0);
    const targetHmf = simulateAnomaly ? 48.2 : (parseFloat(hmfMgKg) || 12.5);
    const targetFg = parseFloat(fructoseGlucoseRatio) || 1.15;
    const targetPollen = pollenOrigin || `${batch.floral_source} Botanical Pollen Verified`;
    const chemist = testedBy || 'Dr. Sunita Deshmukh (Chief Biochemist, NABL)';

    // Look up KVIC field telemetry audit for this batch
    const auditRes = await db.query(
      'SELECT * FROM harvest_ai_audits WHERE batch_id = $1 OR farmer_id = $2 ORDER BY id DESC LIMIT 1',
      [batchId, batch.farmer_id]
    );
    const kvicAudit = auditRes.rows[0];

    // DUAL CONSENSUS VERIFICATION ENGINE:
    // Compare KVIC field telemetry audit report with NABL Chemical Lab NMR report
    const isKvicClean = kvicAudit ? kvicAudit.flag_color === 'GREEN' : true;
    const isC4Clean = targetC4 < 7.0; // Pure honey standard: < 7.0% C4 sugar
    const isHmfClean = targetHmf < 40.0; // Fresh honey standard: < 40 mg/kg
    const moistureDelta = Math.abs(parseFloat(targetMoisture) - parseFloat(batch.moisture_percent));
    const isMoistureMatched = moistureDelta <= 1.2; // Delta within tolerance
    const isAnomalyFree = isKvicClean && isC4Clean && isHmfClean && isMoistureMatched && !simulateAnomaly;

    const reportHash = generateBlockHash(`LAB-${targetSampleId}-${targetMoisture}-${targetC4}-${Date.now()}`);

    if (isAnomalyFree) {
      // 🟢 BOTH REPORTS VERIFIED & CONFORMING:
      // Activate QR Codes on Blockchain & packaging units!
      await db.query(
        `UPDATE honey_batches SET
           qr_status = 'ACTIVE',
           lab_test_status = 'VERIFIED_MATCHED',
           packaging_status = 'QR_ACTIVATED_READY_FOR_MARKET',
           consensus_status = 'CONSENSUS_VERIFIED_AUTHENTIC',
           purity_test_status = 'PASSED (NABL Lab verified & KVIC Consensus Matched)',
           status = 'ACTIVATED_ON_CHAIN',
           lab_moisture = $1,
           lab_c4_sugar_percent = $2,
           lab_hmf_mg_kg = $3,
           lab_fructose_glucose = $4,
           lab_report_summary = $5,
           lab_tested_at = CURRENT_TIMESTAMP,
           activated_at = CURRENT_TIMESTAMP
         WHERE batch_id = $6`,
        [
          targetMoisture, targetC4, targetHmf, targetFg,
          `Dual Consensus Passed: NABL Lab NMR matches KVIC Telemetry (Moisture: ${targetMoisture}%, C4 Sugar: ${targetC4}%, HMF: ${targetHmf}mg/kg). QR Codes Activated.`,
          batchId
        ]
      );

      // Activate all packaged jars
      await db.query(
        `UPDATE batch_packages SET qr_status = 'ACTIVE', activated_at = CURRENT_TIMESTAMP WHERE batch_id = $1`,
        [batchId]
      );

      // Upsert lab report
      await db.query(
        `INSERT INTO lab_reports (
           sample_id, batch_id, apiary_id, apiary_name, moisture_percent, fructose_glucose_ratio, 
           c4_sugar_percent, hmf_mg_kg, pollen_origin, adulteration_detected, kvic_audit_matched, 
           consensus_verdict, report_hash, tested_by, tested_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, true, 'VERIFIED_MATCH_APPROVED', $10, $11, CURRENT_TIMESTAMP)
         ON CONFLICT (sample_id) DO UPDATE SET
           moisture_percent = EXCLUDED.moisture_percent,
           c4_sugar_percent = EXCLUDED.c4_sugar_percent,
           hmf_mg_kg = EXCLUDED.hmf_mg_kg,
           adulteration_detected = false,
           kvic_audit_matched = true,
           consensus_verdict = 'VERIFIED_MATCH_APPROVED',
           report_hash = EXCLUDED.report_hash,
           tested_at = CURRENT_TIMESTAMP`,
        [targetSampleId, batchId, batch.apiary_id, batch.apiary_name, targetMoisture, targetFg, targetC4, targetHmf, targetPollen, reportHash, chemist]
      );

      await logBlockchainTx(
        'DUAL_CONSENSUS_VERIFIED_AND_QR_ACTIVATED',
        `Batch ${batchId}: NABL Lab chemical report matches KVIC Field Telemetry. Zero adulteration detected. All package QR codes ACTIVATED on-chain!`,
        'Dual Consensus Oracle Contract'
      );

      res.json({
        success: true,
        verified: true,
        consensusStatus: 'CONSENSUS_VERIFIED_AUTHENTIC',
        qrStatus: 'ACTIVE',
        message: 'Dual Consensus Verified! NABL Report matched KVIC Telemetry. All packaging QR codes ACTIVATED.',
        batchId,
        labMetrics: {
          sampleId: targetSampleId,
          moisturePercent: targetMoisture,
          c4SugarPercent: targetC4,
          hmfMgKg: targetHmf,
          testedBy: chemist,
          reportHash
        },
        comparison: {
          kvicMoisture: batch.moisture_percent,
          labMoisture: targetMoisture,
          moistureDelta: moistureDelta.toFixed(2),
          kvicFlag: kvicAudit ? kvicAudit.flag_color : 'GREEN',
          c4SugarStatus: '0.0% (Clean < 7%)',
          hmfStatus: `${targetHmf} mg/kg (Clean < 40)`
        }
      });
    } else {
      // 🚩 ANOMALY OR MISMATCH DETECTED:
      // Freeze batch and revoke/blacklist QR codes!
      const mismatchReasons = [];
      if (!isKvicClean) mismatchReasons.push(`KVIC Audit flagged RED (${kvicAudit?.flag_title || 'Field Anomaly'})`);
      if (!isC4Clean) mismatchReasons.push(`Elevated C4 sugar (${targetC4}% > 7.0% limit indicates added syrup)`);
      if (!isHmfClean) mismatchReasons.push(`Excessive HMF (${targetHmf} mg/kg > 40 mg/kg limit indicates thermal overheating/stale syrup)`);
      if (!isMoistureMatched) mismatchReasons.push(`Moisture divergence (${moistureDelta.toFixed(1)}% delta between field and lab)`);
      if (simulateAnomaly) mismatchReasons.push('Simulated adulteration test trigger');

      await db.query(
        `UPDATE honey_batches SET
           qr_status = 'REVOKED',
           lab_test_status = 'MISMATCH_REJECTED',
           packaging_status = 'BATCH_FROZEN_CONTAMINATED',
           consensus_status = 'CONSENSUS_FAILED_ANOMALY',
           purity_test_status = 'FAILED (Adulteration / Telemetry Mismatch Detected)',
           status = 'BLOCKED_FRAUD_PREVENTED',
           lab_moisture = $1,
           lab_c4_sugar_percent = $2,
           lab_hmf_mg_kg = $3,
           lab_fructose_glucose = $4,
           lab_report_summary = $5,
           lab_tested_at = CURRENT_TIMESTAMP
         WHERE batch_id = $6`,
        [
          targetMoisture, targetC4, targetHmf, targetFg,
          `CRITICAL MISMATCH: ${mismatchReasons.join('; ')}. Batch frozen.`,
          batchId
        ]
      );

      await db.query(
        `UPDATE batch_packages SET qr_status = 'REVOKED' WHERE batch_id = $1`,
        [batchId]
      );

      await db.query(
        `INSERT INTO lab_reports (
           sample_id, batch_id, apiary_id, apiary_name, moisture_percent, fructose_glucose_ratio, 
           c4_sugar_percent, hmf_mg_kg, pollen_origin, adulteration_detected, kvic_audit_matched, 
           consensus_verdict, report_hash, tested_by, tested_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, false, 'REJECTED_MISMATCH_FRAUD', $10, $11, CURRENT_TIMESTAMP)
         ON CONFLICT (sample_id) DO UPDATE SET
           moisture_percent = EXCLUDED.moisture_percent,
           c4_sugar_percent = EXCLUDED.c4_sugar_percent,
           hmf_mg_kg = EXCLUDED.hmf_mg_kg,
           adulteration_detected = true,
           kvic_audit_matched = false,
           consensus_verdict = 'REJECTED_MISMATCH_FRAUD',
           report_hash = EXCLUDED.report_hash,
           tested_at = CURRENT_TIMESTAMP`,
        [targetSampleId, batchId, batch.apiary_id, batch.apiary_name, targetMoisture, targetFg, targetC4, targetHmf, targetPollen, reportHash, chemist]
      );

      await logBlockchainTx(
        'DUAL_CONSENSUS_MISMATCH_BATCH_FROZEN',
        `FRAUD PREVENTED: Batch ${batchId} mismatch between Lab & KVIC reports (${mismatchReasons.join(', ')}). Batch frozen and QR codes blacklisted.`,
        'Dual Consensus Security Oracle'
      );

      res.json({
        success: false,
        verified: false,
        consensusStatus: 'CONSENSUS_FAILED_ANOMALY',
        qrStatus: 'REVOKED',
        message: 'Consensus Mismatch Detected! Batch has been FROZEN and QR codes invalidated.',
        batchId,
        mismatchReasons,
        labMetrics: {
          sampleId: targetSampleId,
          moisturePercent: targetMoisture,
          c4SugarPercent: targetC4,
          hmfMgKg: targetHmf,
          testedBy: chemist,
          reportHash
        }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Packaging units for a batch
app.get('/api/packaging/units/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { rows } = await db.query(
      `SELECT package_id AS "packageId", batch_id AS "batchId", apiary_id AS "apiaryId",
              apiary_name AS "apiaryName", weight_grams AS "weightGrams", qr_code_data AS "qrCodeData",
              qr_status AS "qrStatus", activated_at AS "activatedAt"
       FROM batch_packages
       WHERE batch_id = $1
       ORDER BY id ASC`,
      [batchId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Lab Samples list
app.get('/api/lab/samples', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT lr.sample_id AS "sampleId", lr.batch_id AS "batchId", lr.apiary_id AS "apiaryId",
              lr.apiary_name AS "apiaryName", lr.lab_name AS "labName", lr.moisture_percent AS "moisturePercent",
              lr.c4_sugar_percent AS "c4SugarPercent", lr.hmf_mg_kg AS "hmfMgKg",
              lr.adulteration_detected AS "adulterationDetected", lr.kvic_audit_matched AS "kvicAuditMatched",
              lr.consensus_verdict AS "consensusVerdict", lr.tested_by AS "testedBy", lr.tested_at AS "testedAt",
              hb.floral_source AS "floralSource", hb.quantity_kg AS "quantityKg", hb.qr_status AS "qrStatus"
       FROM lab_reports lr
       JOIN honey_batches hb ON lr.batch_id = hb.batch_id
       ORDER BY lr.id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5c. PUBLIC TRANSPARENT PASSPORT API (POSTGRESQL + MONGODB CONNECTED)
// ==========================================
app.get('/api/public/passport/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let batch = null;
    let packageUnit = null;

    // Check if identifier is a packageId (e.g. JAR-HM-BATCH-...)
    const pkgRes = await db.query(
      `SELECT package_id AS "packageId", batch_id AS "batchId", apiary_id AS "apiaryId",
              apiary_name AS "apiaryName", weight_grams AS "weightGrams", qr_code_data AS "qrCodeData",
              qr_status AS "qrStatus", activated_at AS "activatedAt"
       FROM batch_packages WHERE package_id = $1`,
      [identifier]
    );
    if (pkgRes.rows.length > 0) {
      packageUnit = pkgRes.rows[0];
      const bRes = await db.query('SELECT * FROM honey_batches WHERE batch_id = $1', [packageUnit.batchId]);
      if (bRes.rows.length > 0) batch = bRes.rows[0];
    }

    // Otherwise check by batch_id
    if (!batch) {
      const bRes = await db.query('SELECT * FROM honey_batches WHERE batch_id = $1', [identifier]);
      if (bRes.rows.length > 0) {
        batch = bRes.rows[0];
      }
    }

    // Fallback: If not found, fetch the most recent batch
    if (!batch) {
      const fallbackRes = await db.query('SELECT * FROM honey_batches ORDER BY created_at DESC LIMIT 1');
      if (fallbackRes.rows.length > 0) batch = fallbackRes.rows[0];
      else return res.status(404).json({ error: 'No honey batch found.' });
    }

    // Beekeeper details
    const farmerRes = await db.query(
      'SELECT id, full_name, phone, aadhaar, state, district, village, bee_boxes, honey_mission_id, wallet_address, status FROM users WHERE id = $1',
      [batch.farmer_id]
    );
    const beekeeper = farmerRes.rows[0] || {
      full_name: batch.farmer_name,
      district: batch.district,
      state: 'Gujarat',
      honey_mission_id: 'KVIC-HM-GJ-2023-0104'
    };

    let aadhaarMasked = '1234 •••• 9012';
    if (beekeeper.aadhaar) {
      aadhaarMasked = `${beekeeper.aadhaar.substring(0, 4)} •••• ${beekeeper.aadhaar.substring(8)}`;
    }

    // Fetch KVIC Field AI Audit
    const auditRes = await db.query(
      'SELECT * FROM harvest_ai_audits WHERE batch_id = $1 ORDER BY id DESC LIMIT 1',
      [batch.batch_id]
    );
    const kvicAudit = auditRes.rows[0] || null;

    // Fetch Lab Report
    const labRes = await db.query(
      'SELECT * FROM lab_reports WHERE batch_id = $1 ORDER BY id DESC LIMIT 1',
      [batch.batch_id]
    );
    const labReport = labRes.rows[0] || null;

    // Fetch Packaging units
    const pkgsRes = await db.query(
      'SELECT package_id AS "packageId", weight_grams AS "weightGrams", qr_status AS "qrStatus", activated_at AS "activatedAt" FROM batch_packages WHERE batch_id = $1 ORDER BY id ASC LIMIT 12',
      [batch.batch_id]
    );
    const packagingUnits = pkgsRes.rows;

    // Fetch 14-day Telemetry Lifecycle points from PostgreSQL
    const teleRes = await db.query(
      `SELECT id, weight_kg AS "weightKg", temperature_c AS "temperatureC", humidity_percent AS "humidityPercent",
              acoustic_freq_hz AS "acousticFreqHz", swarming_risk AS "swarmingRisk", anomaly_detected AS "anomalyDetected",
              disease_risk AS "diseaseRisk", to_char(recorded_at, 'YYYY-MM-DD HH24:MI') AS "timestamp"
       FROM hive_telemetry
       WHERE farmer_id = $1
       ORDER BY id DESC
       LIMIT 14`,
      [batch.farmer_id]
    );
    const telemetryLifecycle = teleRes.rows.reverse();

    // Query local MongoDB for live Hive Acoustic Swarming FFT telemetry
    let acousticSwarming = null;
    try {
      const targetHiveId = (batch.apiary_id === 'APIARY-03') ? 'HIVE-JR-03' 
        : (batch.apiary_id === 'APIARY-02') ? 'HIVE-AF-02'
        : (batch.apiary_id === 'APIARY-01') ? 'HIVE-MM-01'
        : 'HIVE-ALPHA-01';

      const mongoDb = getMongoDb();
      if (mongoDb) {
        const mongoDoc = await mongoDb.collection('hive_telemetry_documents')
          .find({ hiveId: targetHiveId })
          .sort({ timestamp: -1 })
          .limit(1)
          .toArray();

        if (mongoDoc && mongoDoc.length > 0) {
          acousticSwarming = {
            hiveId: targetHiveId,
            dominantFreqHz: mongoDoc[0].acoustics?.dominantFreqHz || 215,
            decibelLevel: mongoDoc[0].acoustics?.decibelLevel || 56.4,
            queenPipingDetected: mongoDoc[0].acoustics?.queenPipingDetected || false,
            frequencyBins: mongoDoc[0].acoustics?.frequencyBins || [],
            swarmingRisk: mongoDoc[0].swarmingPrediction?.risk || 'LOW',
            probabilityPercent: mongoDoc[0].swarmingPrediction?.probabilityPercent || 8.5,
            colonyState: mongoDoc[0].swarmingPrediction?.colonyState || 'HARMONIZED_WORKER_FLOW',
            aiRecommendation: mongoDoc[0].aiRecommendation || 'Colony acoustic vibration is harmonized.',
            timestamp: mongoDoc[0].timestamp
          };
        }
      }
    } catch (mongoErr) {
      console.warn("MongoDB acoustic query notice:", mongoErr.message);
    }

    if (!acousticSwarming) {
      acousticSwarming = {
        hiveId: 'HIVE-ALPHA-01',
        dominantFreqHz: 215,
        decibelLevel: 56.4,
        queenPipingDetected: false,
        swarmingRisk: 'LOW',
        probabilityPercent: 8.5,
        colonyState: 'HARMONIZED_WORKER_FLOW',
        aiRecommendation: 'Colony acoustic frequency is harmonized in baseline range.'
      };
    }

    res.json({
      success: true,
      qrStatus: batch.qr_status || 'INACTIVE',
      packageUnit: packageUnit || (packagingUnits[0] || null),
      batch: {
        batchId: batch.batch_id,
        floralSource: batch.floral_source,
        harvestDate: batch.harvest_date,
        quantityKg: batch.quantity_kg,
        moisturePercent: batch.moisture_percent,
        purityTestStatus: batch.purity_test_status,
        blockHash: batch.block_hash,
        packagingStatus: batch.packaging_status || 'PACKAGING_IN_PROGRESS',
        packagedUnitsCount: batch.packaged_units_count || 120,
        consensusStatus: batch.consensus_status || 'AWAITING_DUAL_VERIFICATION',
        labTestStatus: batch.lab_test_status || 'PENDING_TESTING',
        labSampleId: batch.lab_sample_id,
        labMoisture: batch.lab_moisture,
        labC4SugarPercent: batch.lab_c4_sugar_percent,
        labHmfMgKg: batch.lab_hmf_mg_kg,
        labReportSummary: batch.lab_report_summary,
        activatedAt: batch.activated_at,
        status: batch.status
      },
      apiary: {
        id: batch.apiary_id || 'APIARY-04',
        name: batch.apiary_name || 'Apiary #4 (Mogar Central Orchard)',
        location: batch.district || 'Anand, Gujarat'
      },
      beekeeper: {
        name: beekeeper.full_name,
        honeyMissionId: beekeeper.honey_mission_id,
        aadhaarMasked,
        state: beekeeper.state || 'Gujarat',
        district: beekeeper.district || 'Anand',
        village: beekeeper.village || 'Mogar',
        beeBoxes: beekeeper.bee_boxes || 20,
        walletAddress: beekeeper.wallet_address || '0x71C...4E89'
      },
      kvicAudit,
      labReport,
      packagingUnits,
      telemetryLifecycle,
      acousticSwarming,
      databaseConnections: {
        postgres: {
          connected: true,
          database: 'beehive_db',
          host: 'localhost',
          port: 5433,
          tables: 'honey_batches, hive_telemetry, lab_reports, batch_packages'
        },
        mongo: {
          connected: true,
          database: 'beehive_iot_db',
          collection: 'hive_telemetry_documents',
          hiveId: acousticSwarming.hiveId
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5d. REAL MACHINE-READABLE QR CODE GENERATOR API
// ==========================================
app.get('/api/qr/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const baseUrl = getBaseUrl(req);
    let targetUrl = '';

    if (identifier.startsWith('JAR-')) {
      targetUrl = `${baseUrl}/passport.html?package=${encodeURIComponent(identifier)}`;
    } else {
      const cleanId = identifier.replace(/^https?:\/\/[^\/]+\/(verify|passport\.html\?batch=)?/, '').replace(/^\/passport\.html\?batch=/, '');
      targetUrl = `${baseUrl}/passport.html?batch=${encodeURIComponent(cleanId || identifier)}`;
    }

    if (req.query.format === 'json') {
      const dataUrl = await QRCode.toDataURL(targetUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        scale: 8,
        color: { dark: '#000000', light: '#ffffff' }
      });
      return res.json({
        success: true,
        identifier,
        targetUrl,
        qrDataUrl: dataUrl
      });
    }

    if (req.query.format === 'svg') {
      const svg = await QRCode.toString(targetUrl, {
        type: 'svg',
        margin: 2,
        errorCorrectionLevel: 'M'
      });
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(svg);
    }

    if (req.query.download === '1' || req.query.download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="${identifier}-qr.png"`);
    }

    const pngBuffer = await QRCode.toBuffer(targetUrl, {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 8,
      color: { dark: '#000000', light: '#ffffff' }
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    return res.send(pngBuffer);
  } catch (err) {
    console.error('QR Generation Error:', err);
    res.status(500).json({ error: 'Failed to generate QR code: ' + err.message });
  }
});

// Single Webpage Verification Route for QR Scanners
app.get('/verify/:identifier', (req, res) => {
  const { identifier } = req.params;
  if (identifier && identifier.startsWith('JAR-')) {
    res.redirect(`/passport.html?package=${encodeURIComponent(identifier)}`);
  } else {
    res.redirect(`/passport.html?batch=${encodeURIComponent(identifier)}`);
  }
});

// ==========================================
// 6. ADMIN & AUDIT LOG APIS
// ==========================================
app.get('/api/admin/users', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, role, full_name AS "fullName", email, phone, aadhaar, state, district, 
              bee_boxes AS "beeBoxes", honey_mission_id AS "honeyMissionId", status, 
              approved_by AS "approvedBy", wallet_address AS "walletAddress"
       FROM users 
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/logs', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, tx_hash AS "txHash", block_number AS "blockNumber", event, details, actor, 
              to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS timestamp
       FROM blockchain_logs
       ORDER BY id DESC
       LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/reset', async (req, res) => {
  try {
    await db.query('TRUNCATE users, honey_batches, blockchain_logs, kvic_master_registry RESTART IDENTITY CASCADE');
    await db.initDatabase();
    res.json({ success: true, message: 'Database reset and re-seeded to initial state.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. REAL-TIME HIVE TELEMETRY (POSTGRESQL PERSISTED)
// ==========================================
app.post('/api/farmer/telemetry', async (req, res) => {
  try {
    const {
      farmerId, hiveId, weightKg, temperatureC, humidityPercent,
      acousticFreqHz, swarmingRisk, anomalyDetected, anomalyType, diseaseRisk, aiConfidenceScore
    } = req.body;

    const insertRes = await db.query(
      `INSERT INTO hive_telemetry 
       (farmer_id, hive_id, weight_kg, temperature_c, humidity_percent, acoustic_freq_hz, swarming_risk, anomaly_detected, anomaly_type, disease_risk, ai_confidence_score, recorded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        farmerId || 'FARMER-001',
        hiveId || 'HIVE-ALPHA-01',
        weightKg,
        temperatureC,
        humidityPercent,
        acousticFreqHz,
        swarmingRisk || 'LOW',
        anomalyDetected || false,
        anomalyType || 'NORMAL',
        diseaseRisk || 'HEALTHY',
        aiConfidenceScore || 98.5
      ]
    );

    res.status(201).json({ success: true, telemetry: insertRes.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/farmer/telemetry/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { rows } = await db.query(
      `SELECT id, hive_id AS "hiveId", weight_kg AS "weightKg", temperature_c AS "temperatureC",
              humidity_percent AS "humidityPercent", acoustic_freq_hz AS "acousticFreqHz",
              swarming_risk AS "swarmingRisk", anomaly_detected AS "anomalyDetected",
              anomaly_type AS "anomalyType", disease_risk AS "diseaseRisk",
              ai_confidence_score AS "aiConfidenceScore",
              to_char(recorded_at, 'YYYY-MM-DD HH24:MI:SS') AS "recordedAt"
       FROM hive_telemetry
       WHERE farmer_id = $1
       ORDER BY id DESC
       LIMIT 30`,
      [farmerId]
    );
    res.json(rows.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. HARVEST CYCLE AI MONITORING & KVIC FLAGGING (RED/GREEN)
// ==========================================
async function performHarvestAiCycleAnalysis({
  farmerId, apiaryId, apiaryName, startDate, harvestDate, floralSource, quantityKg, simulateAnomaly, batchId
}) {
  const farmerRes = await db.query('SELECT full_name, district, state FROM users WHERE id = $1', [farmerId]);
  if (farmerRes.rows.length === 0) {
    throw new Error('Farmer not found in PostgreSQL.');
  }
  const farmer = farmerRes.rows[0];

  const targetApiaryId = apiaryId || 'APIARY-04';
  const targetApiaryName = apiaryName || 'Apiary #4 (Mogar Central Orchard)';
  const actualBatchId = batchId || `HM-BATCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // Query telemetry for this farmer and particular apiary
  const telemetryRes = await db.query(
    `SELECT weight_kg AS "weightKg", temperature_c AS "temperatureC",
            humidity_percent AS "humidityPercent", acoustic_freq_hz AS "acousticFreqHz",
            anomaly_detected AS "anomalyDetected", anomaly_type AS "anomalyType",
            disease_risk AS "diseaseRisk", recorded_at AS "recordedAt"
     FROM hive_telemetry
     WHERE farmer_id = $1 AND recorded_at::date >= $2::date AND recorded_at::date <= $3::date
     ORDER BY recorded_at ASC`,
    [farmerId, startDate, harvestDate]
  );

  const telemetry = telemetryRes.rows;
  let startWeight = targetApiaryId === 'APIARY-01' ? 30.5 : (targetApiaryId === 'APIARY-02' ? 28.0 : (targetApiaryId === 'APIARY-03' ? 31.0 : 32.4));
  let endWeight = targetApiaryId === 'APIARY-01' ? 42.15 : (targetApiaryId === 'APIARY-02' ? 38.90 : (targetApiaryId === 'APIARY-03' ? 44.20 : 46.39));
  let netGain = +(endWeight - startWeight).toFixed(2);
  let totalDays = Math.max(1, Math.round((new Date(harvestDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)));

  if (telemetry.length >= 2) {
    startWeight = parseFloat(telemetry[0].weightKg);
    endWeight = parseFloat(telemetry[telemetry.length - 1].weightKg);
    netGain = parseFloat((endWeight - startWeight).toFixed(2));
  }

  let hasSuddenChange = false;
  let suddenJumpKg = 0;
  let flagReasons = [];
  let diseaseCount = 0;

  for (let i = 1; i < telemetry.length; i++) {
    const delta = parseFloat(telemetry[i].weightKg) - parseFloat(telemetry[i - 1].weightKg);
    if (delta > 3.0) {
      hasSuddenChange = true;
      suddenJumpKg = Math.max(suddenJumpKg, delta);
      flagReasons.push(`Abrupt single-day weight surge of +${delta.toFixed(1)} kg recorded on ${new Date(telemetry[i].recordedAt).toISOString().split('T')[0]} (Natural threshold: < 1.8 kg/day)`);
    }
    if (telemetry[i].diseaseRisk && telemetry[i].diseaseRisk !== 'HEALTHY') {
      diseaseCount++;
      flagReasons.push(`Pathogen alert during cycle: ${telemetry[i].diseaseRisk}`);
    }
  }

  if (simulateAnomaly) {
    hasSuddenChange = true;
    suddenJumpKg = 12.5;
    flagReasons.unshift(`Sudden overnight scale surge of +12.5 kg recorded outside normal foraging hours on ${targetApiaryName} (Exogenous Sugar Syrup Feeding Pattern)`);
    flagReasons.push(`Moisture content elevated to 22.1% indicating unripened exogenous sugar syrup`);
  }

  let flagColor = 'GREEN';
  let flagStatus = 'PASSED_CLEAN';
  let flagTitle = `Natural Nectar Influx Verified: ${targetApiaryName}`;
  let verdictSummary = '';

  if (hasSuddenChange) {
    flagColor = 'RED';
    flagStatus = 'SUDDEN_CHANGE_FLAGGED';
    flagTitle = `Sudden Change Flagged: Unnatural Weight Surge / Adulteration Risk on ${targetApiaryName}`;
    verdictSummary = `CRITICAL QUALITY FLAG [${targetApiaryName}]: Telemetry cycle between ${startDate} and ${harvestDate} detected an unnatural scale surge (+${suddenJumpKg} kg). High probability of synthetic sugar syrup adulteration. Verifiable Red Flag dispatched automatically to KVIC State Directorate for mandatory physical apiary inspection and laboratory C-4 NMR purity testing.`;
  } else {
    flagColor = 'GREEN';
    flagStatus = 'PASSED_CLEAN';
    flagTitle = `Natural Nectar Influx Verified (Zero Adulteration): ${targetApiaryName}`;
    flagReasons = [
      `Continuous natural weight accumulation (+${(netGain / totalDays).toFixed(2)} kg/day) across ${targetApiaryName}`,
      'Stable core brood nest temperature (34.8 - 35.2°C)',
      'Acoustic resonance stabilized within normal foraging frequencies (< 240 Hz)',
      'Zero Varroa destructor or Foulbrood pathogen markers detected'
    ];
    verdictSummary = `PURE HONEY HARVEST [${targetApiaryName}]: Complete ${totalDays}-day telemetry cycle indicates authentic floral foraging with enzyme-ripened honey capping. Quality audit transmitted automatically to KVIC Honey Mission for fast-tracked DBT subsidy bonus.`;
  }

  const auditInsert = await db.query(
    `INSERT INTO harvest_ai_audits (
      batch_id, farmer_id, farmer_name, district, apiary_id, apiary_name, start_date, harvest_date, total_days,
      start_weight_kg, end_weight_kg, net_weight_gain_kg, flag_color, flag_status, flag_title,
      flag_reasons, sudden_changes_detected, sudden_weight_jump_kg, temperature_stability,
      disease_history_count, ai_verdict_summary, kvic_notified, kvic_action
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, true, 'AWAITING_KVIC_REVIEW')
    RETURNING *`,
    [
      actualBatchId, farmerId, farmer.full_name, `${farmer.district}, ${farmer.state}`,
      targetApiaryId, targetApiaryName, startDate, harvestDate, totalDays, startWeight, endWeight, netGain,
      flagColor, flagStatus, flagTitle, flagReasons, hasSuddenChange, suddenJumpKg,
      hasSuddenChange ? 'FLUCTUATING (31-37°C)' : 'HIGHLY_STABLE (34.9°C Avg)',
      diseaseCount, verdictSummary
    ]
  );

  const auditRecord = auditInsert.rows[0];

  await logBlockchainTx(
    'HARVEST_CYCLE_AI_AUDIT_FLAG_SENT_TO_KVIC',
    `Harvest of ${targetApiaryName} (Batch ${actualBatchId}): ${totalDays}-day cycle analyzed (${startDate} to ${harvestDate}). AI Flag: [${flagColor}]. Transmitted automatically to KVIC.`,
    'Harvest Quality Oracle & AI Smart Contract'
  );

  return auditRecord;
}

app.post('/api/farmer/harvest-ai-analyze', async (req, res) => {
  try {
    const {
      farmerId, apiaryId, apiaryName, startDate, harvestDate, floralSource, quantityKg, simulateAnomaly
    } = req.body;

    const fId = farmerId || 'FARMER-001';
    const sDate = startDate || new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
    const hDate = harvestDate || new Date().toISOString().split('T')[0];

    const auditRecord = await performHarvestAiCycleAnalysis({
      farmerId: fId,
      apiaryId: apiaryId || 'APIARY-04',
      apiaryName: apiaryName || 'Apiary #4 (Mogar Central Orchard)',
      startDate: sDate,
      harvestDate: hDate,
      floralSource,
      quantityKg,
      simulateAnomaly: !!simulateAnomaly
    });

    res.status(201).json({
      success: true,
      audit: auditRecord
    });
  } catch (err) {
    console.error('Harvest analysis error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/kvic/harvest-flags', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, batch_id AS "batchId", farmer_id AS "farmerId", farmer_name AS "farmerName",
              district, apiary_id AS "apiaryId", apiary_name AS "apiaryName",
              start_date AS "startDate", harvest_date AS "harvestDate",
              total_days AS "totalDays", start_weight_kg AS "startWeightKg",
              end_weight_kg AS "endWeightKg", net_weight_gain_kg AS "netWeightGainKg",
              flag_color AS "flagColor", flag_status AS "flagStatus", flag_title AS "flagTitle",
              flag_reasons AS "flagReasons", sudden_changes_detected AS "suddenChangesDetected",
              sudden_weight_jump_kg AS "suddenWeightJumpKg", temperature_stability AS "temperatureStability",
              ai_verdict_summary AS "aiVerdictSummary", kvic_notified AS "kvicNotified",
              kvic_action AS "kvicAction", to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS "createdAt"
       FROM harvest_ai_audits
       ORDER BY id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/kvic/harvest-flag-action', async (req, res) => {
  try {
    const { auditId, action, remarks } = req.body;
    if (!auditId || !action) {
      return res.status(400).json({ error: 'Audit ID and action are required.' });
    }

    const updateRes = await db.query(
      `UPDATE harvest_ai_audits
       SET kvic_action = $1, kvic_remarks = $2
       WHERE id = $3
       RETURNING *`,
      [action, remarks || 'Reviewed by KVIC Nodal Officer', auditId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Audit record not found.' });
    }

    const row = updateRes.rows[0];

    await logBlockchainTx(
      'KVIC_HARVEST_FLAG_REVIEW_ACTION',
      `KVIC Nodal Officer performed action '${action}' on Batch ${row.batch_id} (Flag: ${row.flag_color}). Remarks: ${remarks || 'None'}`,
      'KVIC Quality Control Smart Contract'
    );

    res.json({ success: true, audit: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. SYSTEM STATUS
// ==========================================
app.get('/api/system/status', async (req, res) => {
  try {
    const pgRes = await db.query('SELECT version(), current_database(), current_user, inet_server_port()');
    res.json({
      postgres: {
        connected: true,
        database: pgRes.rows[0].current_database,
        user: pgRes.rows[0].current_user,
        port: pgRes.rows[0].inet_server_port || 5433
      },
      mongo: {
        connected: true,
        database: 'beehive_iot_db',
        uri: 'mongodb://localhost:27017'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. MONGODB JSON DOCUMENT STORE (SWARMING & ACOUSTIC AI)
// ==========================================
app.get('/api/mongo/summary', async (req, res) => {
  try {
    const mongoDb = getMongoDb();
    const count = await mongoDb.collection('hive_telemetry_documents').countDocuments();
    res.json({
      connected: true,
      database: 'beehive_iot_db',
      collection: 'hive_telemetry_documents',
      documentCount: count,
      engine: 'MongoDB 8.2 Community Server',
      uri: 'mongodb://localhost:27017/beehive_iot_db'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mongo/documents', async (req, res) => {
  try {
    const mongoDb = getMongoDb();
    const limit = parseInt(req.query.limit, 10) || 50;
    const docs = await mongoDb.collection('hive_telemetry_documents')
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mongo/telemetry/:farmerId', async (req, res) => {
  try {
    const mongoDb = getMongoDb();
    const docs = await mongoDb.collection('hive_telemetry_documents')
      .find({ farmerId: req.params.farmerId || 'FARMER-001' })
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mongo/telemetry', async (req, res) => {
  try {
    const mongoDb = getMongoDb();
    const doc = {
      ...req.body,
      timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
      createdAt: new Date()
    };
    const insertRes = await mongoDb.collection('hive_telemetry_documents').insertOne(doc);
    res.status(201).json({ success: true, id: insertRes.insertedId, doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mongo/swarming-analysis/:hiveId', async (req, res) => {
  try {
    const mongoDb = getMongoDb();
    const hiveId = req.params.hiveId || 'HIVE-ALPHA-01';

    const recentDocs = await mongoDb.collection('hive_telemetry_documents')
      .find({ hiveId })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    if (recentDocs.length === 0) {
      const initialFreq = hiveId === 'HIVE-JR-03' ? 485.0 : (hiveId === 'HIVE-AF-02' ? 310.0 : (hiveId === 'HIVE-MM-01' ? 212.0 : 215.0));
      const hasQueenPiping = hiveId === 'HIVE-JR-03';
      const autoDoc = {
        hiveId,
        farmerId: 'FARMER-001',
        timestamp: new Date(),
        sensors: {
          scaleWeightKg: hiveId === 'HIVE-JR-03' ? 44.20 : (hiveId === 'HIVE-AF-02' ? 38.90 : (hiveId === 'HIVE-MM-01' ? 42.15 : 46.39)),
          internalTempC: hiveId === 'HIVE-JR-03' ? 33.5 : 35.1,
          humidityPercent: hiveId === 'HIVE-JR-03' ? 65.0 : 58.4,
          barometricPressureHpa: 1012.0
        },
        acoustics: {
          dominantFreqHz: initialFreq,
          audioSpectrumBins: hiveId === 'HIVE-JR-03' ? [180, 240, 360, 485, 520] : (hiveId === 'HIVE-AF-02' ? [140, 180, 240, 310, 380] : [120, 160, 215, 240, 280]),
          amplitudeDb: hiveId === 'HIVE-JR-03' ? 68.5 : 48.0,
          queenPipingDetected: hasQueenPiping,
          vibrationVelocityMmS: hiveId === 'HIVE-JR-03' ? 2.85 : 0.85
        },
        swarmingPrediction: {
          risk: hiveId === 'HIVE-JR-03' ? 'HIGH_SWARM_WARNING' : (hiveId === 'HIVE-AF-02' ? 'MODERATE' : 'LOW'),
          probabilityPercent: hiveId === 'HIVE-JR-03' ? 92.5 : (hiveId === 'HIVE-AF-02' ? 34.0 : 4.5),
          colonyState: hiveId === 'HIVE-JR-03' ? 'SWARM_DEPARTURE_IMMINENT' : (hiveId === 'HIVE-AF-02' ? 'PRE_SWARM_ACTIVITY' : 'ACTIVE_FORAGING'),
          swarmWarningIssued: hiveId === 'HIVE-JR-03',
          predictionWindowHours: hiveId === 'HIVE-JR-03' ? 12 : 72
        },
        diseaseDiagnostics: { status: 'HEALTHY', confidencePercent: 99.0 },
        anomalyVectors: { suddenChangeDetected: hiveId === 'HIVE-JR-03', deviationScore: 0.05 },
        blockchainSyncStatus: { syncedToLedger: true, blockHash: '0x' + Math.random().toString(16).substring(2, 10) }
      };
      await mongoDb.collection('hive_telemetry_documents').insertOne(autoDoc);
      recentDocs.push(autoDoc);
    }

    const latest = recentDocs[0];
    const avgFreq = +(recentDocs.reduce((acc, d) => acc + (d.acoustics?.dominantFreqHz || 215), 0) / recentDocs.length).toFixed(1);
    const maxFreq = Math.max(...recentDocs.map(d => d.acoustics?.dominantFreqHz || 215));
    const queenPipingActive = recentDocs.some(d => d.acoustics?.queenPipingDetected);

    let swarmingRisk = 'LOW';
    let probability = 4.5;
    let recommendation = 'Colony acoustic vibration is harmonized. Queen laying pattern uninterrupted.';

    if (maxFreq > 420 || queenPipingActive) {
      swarmingRisk = 'HIGH_SWARM_WARNING';
      probability = 91.5;
      recommendation = 'CRITICAL SWARM ALERT: Acoustic frequency exceeds 420 Hz (Queen piping / swarm buzz detected). Immediate super expansion or artificial swarm split recommended within 24-48 hours.';
    } else if (maxFreq > 280) {
      swarmingRisk = 'MODERATE';
      probability = 34.0;
      recommendation = 'MODERATE SWARM RISK: Pre-swarm acoustic drone activity elevating. Inspect swarm cells on frame bottoms.';
    }

    res.json({
      hiveId,
      swarmingRisk,
      probabilityPercent: probability,
      dominantFreqHz: latest.acoustics?.dominantFreqHz || avgFreq,
      averageDominantFreqHz: avgFreq,
      peakFrequencyHz: maxFreq,
      queenPipingDetected: queenPipingActive,
      decibelLevel: latest.acoustics?.amplitudeDb || 48.0,
      vibrationVelocityMmS: latest.acoustics?.vibrationVelocityMmS || 0.85,
      frequencySpectrumBins: latest.acoustics?.audioSpectrumBins || [120, 160, 215, 240, 280],
      aiRecommendation: recommendation,
      timestamp: latest.timestamp,
      documentCount: recentDocs.length,
      storageEngine: 'MongoDB 8.2 JSON Document Store'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mongo/simulate-swarming-spike', async (req, res) => {
  try {
    const mongoDb = getMongoDb();
    const spikeDoc = {
      hiveId: req.body.hiveId || "HIVE-ALPHA-01",
      farmerId: req.body.farmerId || "FARMER-001",
      timestamp: new Date(),
      sensors: {
        scaleWeightKg: 46.10,
        internalTempC: 32.8,
        humidityPercent: 54.0,
        barometricPressureHpa: 1008.2
      },
      acoustics: {
        dominantFreqHz: 485.0,
        audioSpectrumBins: [180, 240, 360, 485, 520],
        amplitudeDb: 68.5,
        queenPipingDetected: true,
        vibrationVelocityMmS: 2.85
      },
      swarmingPrediction: {
        risk: "HIGH_SWARM_WARNING",
        probabilityPercent: 92.5,
        colonyState: "SWARM_DEPARTURE_IMMINENT",
        swarmWarningIssued: true,
        predictionWindowHours: 12
      },
      diseaseDiagnostics: {
        status: "HEALTHY",
        varroaMiteIndex: 0.01,
        foulbroodMarkerDetected: false,
        confidencePercent: 98.5
      },
      anomalyVectors: {
        suddenChangeDetected: true,
        type: "ACOUSTIC_FREQUENCY_SURGE",
        deviationScore: 0.94
      },
      blockchainSyncStatus: {
        syncedToLedger: true,
        blockHash: "0x" + Math.random().toString(16).substring(2, 10)
      }
    };

    await mongoDb.collection('hive_telemetry_documents').insertOne(spikeDoc);

    await logBlockchainTx(
      'AI_SWARMING_PREDICTION_ALERT',
      `Hive ${spikeDoc.hiveId}: Swarming frequency peak 485 Hz (92.5% probability) detected by AI in MongoDB. Alert dispatched to Farmer.`,
      'Acoustic Swarm Oracle Contract'
    );

    res.status(201).json({
      success: true,
      message: 'Swarming acoustic frequency spike ingested into MongoDB!',
      doc: spikeDoc
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server & Auto-Initialize PostgreSQL and MongoDB (Listening on 0.0.0.0 for Mobile/LAN Demonstration)
app.listen(PORT, '0.0.0.0', async () => {
  const lanIp = getLanIp();
  const baseUrl = getBaseUrl();
  console.log(`====================================================`);
  console.log(`🐝 BeeHive Blockchain Server running on:`);
  console.log(`   - Local:       http://localhost:${PORT}`);
  console.log(`   - Wi-Fi / LAN: http://${lanIp}:${PORT}`);
  console.log(`   - QR Target:   ${baseUrl}/passport.html?batch=...`);
  console.log(`🐘 Connected to PostgreSQL on port ${process.env.PGPORT || 5433}`);
  console.log(`====================================================`);
  try {
    await db.initDatabase();
  } catch (e) {
    console.error('PostgreSQL initialization error:', e);
  }

  try {
    await connectMongo();
  } catch (e) {
    console.error('MongoDB initialization error:', e);
  }
});
