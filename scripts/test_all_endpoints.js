// test_all_endpoints.js
// Comprehensive audit of all API endpoints

const BASE = 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const method = options.method || 'GET';
  const headers = options.headers || {};
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, ok: res.ok, contentType, data };
}

async function run() {
  console.log('====================================================');
  console.log('🔍 FULL API SUITE AUDIT (POSTGRESQL + MONGODB)');
  console.log('====================================================\n');

  const results = [];

  async function check(name, fn) {
    try {
      const res = await fn();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ` + JSON.stringify(res.data));
      console.log(`✅ [${res.status}] ${name}`);
      results.push({ name, pass: true, status: res.status });
    } catch (err) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      results.push({ name, pass: false, error: err.message });
    }
  }

  // 1. Health & Status
  await check('GET /api/health', () => request('/api/health'));
  await check('GET /api/system/status', () => request('/api/system/status'));

  // 2. Auth Endpoints
  await check('POST /api/auth/login (Farmer: Ramesh Patel)', () =>
    request('/api/auth/login', {
      method: 'POST',
      body: { identifier: '9876543210', password: 'password123', role: 'farmer' }
    })
  );

  await check('POST /api/auth/login (KVIC: Dr. Arvind Sharma)', () =>
    request('/api/auth/login', {
      method: 'POST',
      body: { identifier: 'kvic.officer@kvic.gov.in', password: 'password123', role: 'kvic', pin: '7890' }
    })
  );

  await check('POST /api/auth/login (Admin: Rajeshwar Sengupta)', () =>
    request('/api/auth/login', {
      method: 'POST',
      body: { identifier: 'admin@beehive.gov.in', password: 'password123', role: 'admin' }
    })
  );

  // 3. Farmer Endpoints
  await check('GET /api/farmer/apiaries/FARMER-001', () => request('/api/farmer/apiaries/FARMER-001'));
  await check('GET /api/farmer/batches/FARMER-001', () => request('/api/farmer/batches/FARMER-001'));
  await check('GET /api/farmer/telemetry/FARMER-001', () => request('/api/farmer/telemetry/FARMER-001'));
  await check('POST /api/farmer/telemetry', () =>
    request('/api/farmer/telemetry', {
      method: 'POST',
      body: {
        farmerId: 'FARMER-001',
        hiveId: 'HIVE-ALPHA-01',
        weightKg: 46.5,
        temperatureC: 35.2,
        humidityPercent: 58.1,
        acousticFreqHz: 216
      }
    })
  );

  let mintedBatchId = 'HM-BATCH-2026-8812';
  await check('POST /api/farmer/batches (Mint batch)', async () => {
    const res = await request('/api/farmer/batches', {
      method: 'POST',
      body: {
        farmerId: 'FARMER-001',
        apiaryId: 'APIARY-04',
        apiaryName: 'Apiary #4 (Mogar Central Orchard)',
        floralSource: 'Wild Acacia Flora',
        quantityKg: 75,
        moisturePercent: 17.4,
        harvestDate: new Date().toISOString().split('T')[0]
      }
    });
    if (res.data?.batch?.batchId) mintedBatchId = res.data.batch.batchId;
    return res;
  });

  await check('POST /api/farmer/harvest-ai-analyze', () =>
    request('/api/farmer/harvest-ai-analyze', {
      method: 'POST',
      body: {
        farmerId: 'FARMER-001',
        apiaryId: 'APIARY-04',
        batchId: mintedBatchId,
        simulateAdulteration: false
      }
    })
  );

  // 4. KVIC Endpoints
  await check('GET /api/kvic/pending-farmers', () => request('/api/kvic/pending-farmers'));
  await check('GET /api/kvic/master-registry', () => request('/api/kvic/master-registry'));
  await check('GET /api/kvic/harvest-flags', () => request('/api/kvic/harvest-flags'));

  // 5. Admin Endpoints
  await check('GET /api/admin/users', () => request('/api/admin/users'));
  await check('GET /api/admin/logs', () => request('/api/admin/logs'));

  // 6. QR & Packaging & Lab
  await check(`GET /api/packaging/units/${mintedBatchId}`, () => request(`/api/packaging/units/${mintedBatchId}`));
  await check('GET /api/lab/samples', () => request('/api/lab/samples'));

  await check(`POST /api/lab/submit-report (Dual Consensus)`, () =>
    request('/api/lab/submit-report', {
      method: 'POST',
      body: {
        batchId: mintedBatchId,
        c4SugarPercent: 0.0,
        hmfMgKg: 14.2,
        moisturePercent: 17.4,
        fructoseGlucoseRatio: 1.15,
        pollenCountPerGram: 18000,
        nmrProfile: 'AUTHENTIC_MUSTARD_SPECTRA',
        adulterationDetected: false,
        testedBy: 'Dr. Sunita Deshmukh'
      }
    })
  );

  await check(`GET /api/qr/${mintedBatchId} (PNG Image)`, () => request(`/api/qr/${mintedBatchId}`));
  await check(`GET /api/qr/${mintedBatchId}?format=json`, () => request(`/api/qr/${mintedBatchId}?format=json`));
  await check(`GET /api/public/passport/${mintedBatchId}`, () => request(`/api/public/passport/${mintedBatchId}`));

  // 7. Mongo Bio-Acoustic Endpoints
  await check('GET /api/mongo/summary', () => request('/api/mongo/summary'));
  await check('GET /api/mongo/documents', () => request('/api/mongo/documents'));
  await check('GET /api/mongo/telemetry/FARMER-001', () => request('/api/mongo/telemetry/FARMER-001'));
  await check('GET /api/mongo/swarming-analysis/HIVE-ALPHA-01', () => request('/api/mongo/swarming-analysis/HIVE-ALPHA-01'));
  await check('POST /api/mongo/simulate-swarming-spike', () =>
    request('/api/mongo/simulate-swarming-spike', {
      method: 'POST',
      body: { hiveId: 'HIVE-ALPHA-01', acousticFreqHz: 480, queenPiping: true }
    })
  );

  console.log('\n====================================================');
  const failed = results.filter(r => !r.pass);
  if (failed.length === 0) {
    console.log(`🎉 ALL ${results.length} ENDPOINTS VERIFIED & WORKING WITH ZERO ERRORS!`);
  } else {
    console.error(`⚠️ ${failed.length} / ${results.length} ENDPOINTS FAILED`);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
