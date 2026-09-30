// data.js - BeeHive Blockchain API & Local Fallback Layer

const API_BASE = (window.location.port === '3000')
  ? '' 
  : 'http://localhost:3000';

const STORAGE_KEYS = {
  USERS: 'beehive_users',
  KVIC_MASTER_DB: 'beehive_kvic_master_db',
  HONEY_BATCHES: 'beehive_honey_batches',
  BLOCKCHAIN_LOGS: 'beehive_blockchain_logs',
  CURRENT_USER: 'beehive_current_user'
};

// Initial Seed Data (Fallback & local cache)
const INITIAL_KVIC_MASTER_DB = [
  {
    aadhaar: "123456789012",
    fullName: "Ramesh Patel",
    phone: "9876543210",
    state: "Gujarat",
    district: "Anand",
    honeyMissionId: "KVIC-HM-GJ-2023-0104",
    allocatedBoxes: 20,
    enrolmentDate: "2023-04-12",
    schemeStatus: "ACTIVE_BENEFICIARY"
  },
  {
    aadhaar: "987654321098",
    fullName: "Sunita Devi",
    phone: "9811223344",
    state: "Bihar",
    district: "Muzaffarpur",
    honeyMissionId: "KVIC-HM-BR-2023-0492",
    allocatedBoxes: 25,
    enrolmentDate: "2023-08-20",
    schemeStatus: "ACTIVE_BENEFICIARY"
  },
  {
    aadhaar: "555566667777",
    fullName: "Harpreet Singh",
    phone: "9822334455",
    state: "Punjab",
    district: "Ludhiana",
    honeyMissionId: "KVIC-HM-PB-2024-0018",
    allocatedBoxes: 30,
    enrolmentDate: "2024-01-15",
    schemeStatus: "ACTIVE_BENEFICIARY"
  },
  {
    aadhaar: "888899990000",
    fullName: "Kavita Rao",
    phone: "9733445566",
    state: "Karnataka",
    district: "Coorg",
    honeyMissionId: "KVIC-HM-KA-2024-0145",
    allocatedBoxes: 15,
    enrolmentDate: "2024-03-02",
    schemeStatus: "ACTIVE_BENEFICIARY"
  }
];

const INITIAL_USERS = [
  {
    id: "FARMER-001",
    role: "farmer",
    fullName: "Ramesh Patel",
    email: "ramesh.farmer@beehive.in",
    phone: "9876543210",
    aadhaar: "123456789012",
    password: "password123",
    state: "Gujarat",
    district: "Anand",
    village: "Mogar",
    beeBoxes: 20,
    honeyMissionId: "KVIC-HM-GJ-2023-0104",
    status: "APPROVED",
    approvedBy: "KVIC Nodal Officer - West Zone",
    approvalDate: "2023-04-14",
    matchedInKvicDb: true,
    walletAddress: "0x71C...4E89",
    createdAt: "2023-04-12"
  },
  {
    id: "FARMER-002",
    role: "farmer",
    fullName: "Suresh Verma",
    email: "suresh.verma@beehive.in",
    phone: "9988776655",
    aadhaar: "444433332222",
    password: "password123",
    state: "Uttar Pradesh",
    district: "Saharanpur",
    village: "Behat",
    beeBoxes: 12,
    honeyMissionId: "",
    status: "PENDING_KVIC_APPROVAL",
    approvedBy: null,
    approvalDate: null,
    matchedInKvicDb: false,
    walletAddress: "0x39B...881F",
    createdAt: "2026-09-28",
    applicationId: "APP-KVIC-2026-9041"
  },
  {
    id: "KVIC-OFFICER-01",
    role: "kvic",
    fullName: "Dr. Arvind Sharma",
    designation: "Zonal Director & Nodal Officer",
    department: "Honey Mission & Beekeeping Division",
    office: "KVIC State Directorate, New Delhi",
    email: "kvic.officer@kvic.gov.in",
    phone: "9871122330",
    officerId: "KVIC-NDO-482",
    password: "password123",
    securityPin: "7890",
    status: "APPROVED",
    walletAddress: "0xKV1C...0001",
    createdAt: "2022-01-10"
  },
  {
    id: "ADMIN-01",
    role: "admin",
    fullName: "Rajeshwar Sengupta",
    designation: "Chief Blockchain Architect & Consortium Admin",
    department: "National Honey Board & MoMSME Tech Team",
    email: "admin@beehive.gov.in",
    phone: "9810099881",
    adminCode: "ADM-BH-01",
    password: "password123",
    status: "APPROVED",
    walletAddress: "0xAD99...F001",
    createdAt: "2021-08-01"
  }
];

const INITIAL_HONEY_BATCHES = [
  {
    batchId: "HM-BATCH-2026-8812",
    farmerId: "FARMER-001",
    farmerName: "Ramesh Patel",
    district: "Anand, Gujarat",
    floralSource: "Mustard & Acacia",
    harvestDate: "2026-09-15",
    quantityKg: 85,
    moisturePercent: 17.2,
    fructoseGlucoseRatio: 1.15,
    purityTestStatus: "PASSED (NABL Lab certified)",
    blockHash: "0x3a4f89d1c7e92b5006b83f0907cae12739268eacdfa89110756e2978a1bc40e7",
    timestamp: "2026-09-16 11:20:45",
    qrCodeData: "https://beehive-blockchain.gov.in/verify/HM-BATCH-2026-8812",
    status: "VERIFIED_ON_CHAIN"
  },
  {
    batchId: "HM-BATCH-2026-7910",
    farmerId: "FARMER-001",
    farmerName: "Ramesh Patel",
    district: "Anand, Gujarat",
    floralSource: "Eucalyptus Wildflower",
    harvestDate: "2026-08-10",
    quantityKg: 120,
    moisturePercent: 18.0,
    fructoseGlucoseRatio: 1.08,
    purityTestStatus: "PASSED (NABL Lab certified)",
    blockHash: "0x98bce178aa9203e0018f77390918cae78891040fdeba1928372648abcf901234",
    timestamp: "2026-08-11 14:15:30",
    qrCodeData: "https://beehive-blockchain.gov.in/verify/HM-BATCH-2026-7910",
    status: "VERIFIED_ON_CHAIN"
  }
];

const INITIAL_BLOCKCHAIN_LOGS = [
  {
    txHash: "0x892f...a10e",
    blockNumber: 1049281,
    event: "KVIC_FARMER_VERIFIED",
    details: "Farmer Ramesh Patel (KVIC-HM-GJ-2023-0104) verified via Honey Mission Master DB in PostgreSQL",
    actor: "KVIC Nodal Smart Contract",
    timestamp: "2026-09-28 09:30:12"
  },
  {
    txHash: "0x44c1...881f",
    blockNumber: 1049282,
    event: "REGISTRATION_SUBMITTED_PENDING_KVIC",
    details: "Farmer Suresh Verma registered (Aadhaar 4444***2222). Not in KVIC DB -> Awaiting manual KVIC approval",
    actor: "Farmer Self-Service Gateway",
    timestamp: "2026-09-28 14:22:04"
  },
  {
    txHash: "0x2190...f98a",
    blockNumber: 1049283,
    event: "HONEY_BATCH_MINTED",
    details: "Batch HM-BATCH-2026-8812 (85 kg Mustard & Acacia) minted by Farmer Ramesh Patel",
    actor: "Provenance Minting Contract",
    timestamp: "2026-09-28 16:05:40"
  }
];

// Local Storage Helper
function getStorage(key, defaultVal) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(e);
  }
}

// REST API CLIENT FOR POSTGRESQL BACKEND
const BeeHiveAPI = {
  // Check Health of PostgreSQL
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend not reached directly, will use hybrid fallback:", e.message);
    }
    return { status: 'UP (Local Fallback Mode)', database: 'PostgreSQL Simulated' };
  },

  // Auth: Login
  login: async (identifier, password, role, pin) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role, pin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      return data;
    } catch (err) {
      // Fallback to local DB if backend offline
      const users = DB.getUsers();
      let user = null;
      if (role === 'farmer') {
        user = users.find(u => u.role === 'farmer' && (u.phone === identifier || u.aadhaar === identifier || u.email.toLowerCase() === identifier.toLowerCase()));
      } else if (role === 'kvic') {
        user = users.find(u => u.role === 'kvic' && (u.email.toLowerCase() === identifier.toLowerCase() || (u.officerId && u.officerId.toLowerCase() === identifier.toLowerCase())));
      } else if (role === 'admin') {
        user = users.find(u => u.role === 'admin' && (u.email.toLowerCase() === identifier.toLowerCase() || (u.adminCode && u.adminCode.toLowerCase() === identifier.toLowerCase())));
      }

      if (!user) throw new Error('No account found matching credentials.');
      if (user.password !== password) throw new Error('Incorrect password.');
      if (role === 'kvic' && user.securityPin && pin && pin !== user.securityPin) throw new Error('Invalid KVIC Security PIN.');
      return { success: true, user };
    }
  },

  // Auth: Register Farmer with Real KVIC Database Lookups
  registerFarmer: async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register-farmer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      return data;
    } catch (err) {
      console.warn("API registration fallback:", err);
      // Fallback logic
      const aadhaar = (formData.aadhaar || '').replace(/\s+/g, '');
      const match = DB.searchKvicDatabase(aadhaar, formData.phone, formData.honeyMissionId);
      const randomWallet = "0x" + Math.random().toString(16).substring(2, 6).toUpperCase() + "..." + Math.random().toString(16).substring(2, 6).toUpperCase();
      const newId = `FARMER-${Date.now().toString().slice(-4)}`;

      if (match) {
        const hmId = match.honeyMissionId || `KVIC-HM-2024-${Math.floor(1000 + Math.random() * 9000)}`;
        const user = {
          id: newId,
          role: "farmer",
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          aadhaar: aadhaar,
          password: formData.password,
          state: formData.state,
          district: formData.district,
          village: formData.village || "Gramin",
          beeBoxes: match.allocatedBoxes || formData.beeBoxes || 20,
          honeyMissionId: hmId,
          status: "APPROVED",
          approvedBy: "KVIC Central Database Engine (Auto-Verified)",
          approvalDate: new Date().toISOString().split('T')[0],
          matchedInKvicDb: true,
          walletAddress: randomWallet,
          createdAt: new Date().toISOString().split('T')[0]
        };
        const users = DB.getUsers();
        users.push(user);
        DB.setUsers(users);
        DB.logBlockchainEvent("KVIC_FARMER_AUTO_VERIFIED", `Farmer ${formData.fullName} verified against KVIC Master DB.`, "KVIC Registry Contract");
        return { success: true, verified: true, user, message: "Auto-approved via KVIC Registry." };
      } else {
        const appId = `APP-KVIC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const user = {
          id: newId,
          role: "farmer",
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          aadhaar: aadhaar,
          password: formData.password,
          state: formData.state,
          district: formData.district,
          village: formData.village || "Gramin",
          beeBoxes: formData.beeBoxes || 10,
          honeyMissionId: "",
          status: "PENDING_KVIC_APPROVAL",
          applicationId: appId,
          matchedInKvicDb: false,
          walletAddress: randomWallet,
          createdAt: new Date().toISOString().split('T')[0]
        };
        const users = DB.getUsers();
        users.push(user);
        DB.setUsers(users);
        DB.logBlockchainEvent("REGISTRATION_SUBMITTED_PENDING_KVIC", `Farmer ${formData.fullName} awaiting KVIC officer approval.`, "Self-Service Gateway");
        return { success: true, verified: false, user, message: "Awaiting KVIC officer review." };
      }
    }
  },

  // KVIC: Get Pending Farmers
  getPendingFarmers: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kvic/pending-farmers`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return DB.getUsers().filter(u => u.role === 'farmer' && u.status === 'PENDING_KVIC_APPROVAL');
  },

  // KVIC: Approve Farmer
  approveFarmer: async (farmerId, officerName) => {
    try {
      const res = await fetch(`${API_BASE}/api/kvic/approve-farmer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId, officerName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed');
      return data;
    } catch (err) {
      const users = DB.getUsers();
      const f = users.find(u => u.id === farmerId);
      if (f) {
        f.status = "APPROVED";
        f.approvedBy = officerName || "Dr. Arvind Sharma (KVIC Nodal Officer)";
        f.approvalDate = new Date().toISOString().split('T')[0];
        f.honeyMissionId = f.honeyMissionId || `KVIC-HM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        DB.setUsers(users);
        DB.logBlockchainEvent("KVIC_OFFICER_APPROVED_FARMER", `Farmer ${f.fullName} approved by KVIC.`, "KVIC Verification Contract");
        return { success: true, user: f };
      }
      throw err;
    }
  },

  // KVIC: Reject Farmer
  rejectFarmer: async (farmerId, reason, officerName) => {
    try {
      const res = await fetch(`${API_BASE}/api/kvic/reject-farmer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId, reason, officerName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rejection failed');
      return data;
    } catch (err) {
      const users = DB.getUsers();
      const f = users.find(u => u.id === farmerId);
      if (f) {
        f.status = "REJECTED";
        f.approvedBy = `${officerName || 'KVIC Officer'} (Rejected: ${reason})`;
        DB.setUsers(users);
        return { success: true };
      }
      throw err;
    }
  },

  // KVIC: Get Master Registry
  getKvicMasterDb: async (query = '') => {
    try {
      const url = query ? `${API_BASE}/api/kvic/master-registry?q=${encodeURIComponent(query)}` : `${API_BASE}/api/kvic/master-registry`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {}
    const dbList = DB.getKvicMasterDb();
    if (!query) return dbList;
    const q = query.toLowerCase();
    return dbList.filter(item => item.fullName.toLowerCase().includes(q) || item.aadhaar.includes(q) || (item.honeyMissionId && item.honeyMissionId.toLowerCase().includes(q)));
  },

  // KVIC: Add to Master Registry
  addKvicMasterDb: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/api/kvic/master-registry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to save to KVIC registry');
      return resData;
    } catch (err) {
      const dbList = DB.getKvicMasterDb();
      const hmId = `KVIC-HM-${(data.state || 'IN').substring(0, 2).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const rec = { ...data, honeyMissionId: hmId, schemeStatus: "ACTIVE_BENEFICIARY", enrolmentDate: new Date().toISOString().split('T')[0] };
      dbList.unshift(rec);
      DB.setKvicMasterDb(dbList);
      return { success: true, record: rec };
    }
  },

  // Farmer: Get Batches
  getFarmerBatches: async (farmerId) => {
    try {
      const res = await fetch(`${API_BASE}/api/farmer/batches/${farmerId}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return DB.getBatches().filter(b => b.farmerId === farmerId);
  },

  // Farmer: Create Honey Batch
  createHoneyBatch: async (batchData) => {
    try {
      const res = await fetch(`${API_BASE}/api/farmer/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mint honey batch');
      return data;
    } catch (err) {
      const randomHex = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
      const blockHash = `0x${randomHex()}${randomHex()}${randomHex()}${randomHex()}`;
      const batchId = `HM-BATCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBatch = {
        batchId,
        farmerId: batchData.farmerId,
        farmerName: "Ramesh Patel",
        district: "Anand, Gujarat",
        floralSource: batchData.floralSource,
        harvestDate: batchData.harvestDate || new Date().toISOString().split('T')[0],
        quantityKg: batchData.quantityKg,
        moisturePercent: batchData.moisturePercent || 17.5,
        fructoseGlucoseRatio: 1.15,
        purityTestStatus: "PASSED (NABL Lab verified)",
        blockHash,
        status: "VERIFIED_ON_CHAIN"
      };
      const batches = DB.getBatches();
      batches.unshift(newBatch);
      DB.setBatches(batches);
      return { success: true, batch: newBatch };
    }
  },

  // Lab Testing: Submit NABL Chemical Analysis & Perform Dual Consensus QR Activation
  submitLabReport: async (reportData) => {
    try {
      const res = await fetch(`${API_BASE}/api/lab/submit-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit lab report');
      return data;
    } catch (err) {
      console.warn("submitLabReport error:", err);
      throw err;
    }
  },

  // Packaging: Get Packaging Units for Batch
  getPackagingUnits: async (batchId) => {
    try {
      const res = await fetch(`${API_BASE}/api/packaging/units/${batchId}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  },

  // Public Transparency: Get Provenance Passport (PostgreSQL + MongoDB)
  getPublicPassport: async (identifier) => {
    try {
      const res = await fetch(`${API_BASE}/api/public/passport/${identifier}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },

  // Farmer: Record Real-Time Hive Telemetry to PostgreSQL
  recordTelemetry: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/api/farmer/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      console.warn("Telemetry record fallback:", e);
      return { success: true, telemetry: data };
    }
  },

  // Farmer: Get Historical Hive Telemetry Stream
  getFarmerTelemetry: async (farmerId) => {
    try {
      const res = await fetch(`${API_BASE}/api/farmer/telemetry/${farmerId}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  },

  // Farmer: Get All Registered Apiaries & Current Telemetry / Swarming Status
  getFarmerApiaries: async (farmerId = 'FARMER-001') => {
    try {
      const res = await fetch(`${API_BASE}/api/farmer/apiaries/${farmerId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("getFarmerApiaries fallback:", e);
    }
    return [
      {
        apiaryId: 'APIARY-04',
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
        apiaryId: 'APIARY-01',
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
        apiaryId: 'APIARY-02',
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
        apiaryId: 'APIARY-03',
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
  },

  // Farmer: Trigger Harvest Day Cycle AI Analysis & Propose Flag (Red/Green) to KVIC
  analyzeHarvestCycle: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/api/farmer/harvest-ai-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Harvest analysis failed');
      return resData;
    } catch (e) {
      console.warn("Harvest analysis fallback:", e);
      // Client-side fallback calculation if offline
      const hasAnomaly = !!data.simulateAnomaly;
      return {
        success: true,
        audit: {
          batch_id: `HM-BATCH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          farmer_name: "Ramesh Patel",
          start_date: data.startDate,
          harvest_date: data.harvestDate,
          total_days: 14,
          start_weight_kg: 32.4,
          end_weight_kg: hasAnomaly ? 48.5 : 46.2,
          net_weight_gain_kg: hasAnomaly ? 16.1 : 13.8,
          flag_color: hasAnomaly ? 'RED' : 'GREEN',
          flag_status: hasAnomaly ? 'SUDDEN_CHANGE_FLAGGED' : 'PASSED_CLEAN',
          flag_title: hasAnomaly ? 'Sudden Change Flagged: Unnatural Weight Surge' : 'Natural Nectar Influx Verified',
          flag_reasons: hasAnomaly 
            ? ['Abrupt +12.5 kg single-day scale surge detected', 'Moisture elevated to 22.1% (sugar syrup signature)']
            : ['Gradual progressive daily weight gain (+0.98 kg/day)', 'Stable core temp 34.8-35.1°C', 'Zero swarming or foulbrood markers'],
          ai_verdict_summary: hasAnomaly
            ? 'CRITICAL QUALITY FLAG: Unnatural sudden surge detected. Flag transmitted to KVIC for mandatory NMR test.'
            : 'PURE HONEY CYCLE: Natural floral nectar accumulation verified. Transmitted to KVIC for fast-track DBT approval.',
          kvic_notified: true,
          kvic_action: 'AWAITING_KVIC_REVIEW'
        }
      };
    }
  },

  // KVIC: Get Harvest Quality Flags (Red & Green)
  getKvicHarvestFlags: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kvic/harvest-flags`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  },

  // KVIC: Take Action on Harvest Flag
  takeKvicHarvestAction: async (actionData) => {
    try {
      const res = await fetch(`${API_BASE}/api/kvic/harvest-flag-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  },

  // Admin: Get All Users
  getAllUsers: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return DB.getUsers();
  },

  // Admin: Get Blockchain Logs
  getBlockchainLogs: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/logs`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return DB.getLogs();
  },

  // Admin: Reset DB
  resetDatabase: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reset`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {}
    DB.resetToDefault();
    return { success: true };
  },

  // ==========================================
  // MONGODB SWARMING & ACOUSTIC AI APIS
  // ==========================================
  getMongoSwarmingAnalysis: async (hiveId = 'HIVE-ALPHA-01') => {
    try {
      const res = await fetch(`${API_BASE}/api/mongo/swarming-analysis/${hiveId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("MongoDB Swarming Analysis fallback:", e);
    }
    return {
      hiveId,
      swarmingRisk: 'LOW',
      probabilityPercent: 4.5,
      dominantFreqHz: 215.0,
      queenPipingDetected: false,
      decibelLevel: 48.0,
      frequencySpectrumBins: [120, 160, 215, 240, 280],
      aiRecommendation: 'Colony acoustic vibration is harmonized. Queen laying pattern uninterrupted.',
      storageEngine: 'MongoDB 8.2 JSON Document Store'
    };
  },

  simulateMongoSwarmingSpike: async (hiveId = 'HIVE-ALPHA-01', farmerId = 'FARMER-001') => {
    try {
      const res = await fetch(`${API_BASE}/api/mongo/simulate-swarming-spike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hiveId, farmerId })
      });
      return await res.json();
    } catch (e) {
      console.warn("Simulate Swarming Spike fallback:", e);
      return { success: false, error: e.message };
    }
  },

  getMongoTelemetry: async (farmerId = 'FARMER-001') => {
    try {
      const res = await fetch(`${API_BASE}/api/mongo/telemetry/${farmerId}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  },

  getMongoSummary: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mongo/summary`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { connected: false, error: 'Cannot connect to MongoDB' };
  },

  getMongoDocuments: async (limit = 50) => {
    try {
      const res = await fetch(`${API_BASE}/api/mongo/documents?limit=${limit}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  }
};

// Database Fallback Layer
const DB = {
  getUsers: () => getStorage(STORAGE_KEYS.USERS, INITIAL_USERS),
  setUsers: (users) => setStorage(STORAGE_KEYS.USERS, users),

  getKvicMasterDb: () => getStorage(STORAGE_KEYS.KVIC_MASTER_DB, INITIAL_KVIC_MASTER_DB),
  setKvicMasterDb: (db) => setStorage(STORAGE_KEYS.KVIC_MASTER_DB, db),

  getBatches: () => getStorage(STORAGE_KEYS.HONEY_BATCHES, INITIAL_HONEY_BATCHES),
  setBatches: (batches) => setStorage(STORAGE_KEYS.HONEY_BATCHES, batches),

  getLogs: () => getStorage(STORAGE_KEYS.BLOCKCHAIN_LOGS, INITIAL_BLOCKCHAIN_LOGS),
  setLogs: (logs) => setStorage(STORAGE_KEYS.BLOCKCHAIN_LOGS, logs),

  getCurrentUser: () => getStorage(STORAGE_KEYS.CURRENT_USER, null),
  setCurrentUser: (user) => setStorage(STORAGE_KEYS.CURRENT_USER, user),

  resetToDefault: () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.KVIC_MASTER_DB);
    localStorage.removeItem(STORAGE_KEYS.HONEY_BATCHES);
    localStorage.removeItem(STORAGE_KEYS.BLOCKCHAIN_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  searchKvicDatabase: (aadhaar, phone, honeyMissionId) => {
    const kvicDb = DB.getKvicMasterDb();
    const cleanAadhaar = (aadhaar || "").replace(/\s+/g, '').trim();
    const cleanPhone = (phone || "").replace(/\s+/g, '').trim();
    const cleanHMId = (honeyMissionId || "").trim().toUpperCase();

    return kvicDb.find(entry => {
      const matchAadhaar = cleanAadhaar && entry.aadhaar.replace(/\s+/g, '') === cleanAadhaar;
      const matchPhone = cleanPhone && entry.phone.replace(/\s+/g, '') === cleanPhone;
      const matchHMId = cleanHMId && entry.honeyMissionId.toUpperCase() === cleanHMId;
      return matchAadhaar || matchPhone || matchHMId;
    });
  },

  logBlockchainEvent: (event, details, actor) => {
    const logs = DB.getLogs();
    const randomHex = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
    const newLog = {
      txHash: `0x${randomHex()}...${randomHex().substring(0, 4)}`,
      blockNumber: 1049280 + logs.length + 1,
      event,
      details,
      actor: actor || "BeeHive Smart Contract Engine",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    logs.unshift(newLog);
    DB.setLogs(logs);
    return newLog;
  }
};
