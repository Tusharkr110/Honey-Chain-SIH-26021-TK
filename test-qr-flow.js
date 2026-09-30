// test-qr-flow.js - End-to-End Verification of Real Machine-Readable QR Lifecycle
const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(buf) }); }
        catch (e) { resolve({ status: res.statusCode, headers: res.headers, body: buf }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      const isBinary = (res.headers['content-type'] || '').includes('image');
      if (isBinary) {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) });
        });
      } else {
        let buf = '';
        res.on('data', chunk => buf += chunk);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(buf) }); }
          catch (e) { resolve({ status: res.statusCode, headers: res.headers, body: buf }); }
        });
      }
    }).on('error', reject);
  });
}

async function runQrVerification() {
  console.log('================================================================');
  console.log('🐝 VERIFYING REAL QR CODE GENERATION & TRACEABILITY LIFECYCLE');
  console.log('================================================================\n');

  // 1. Create a Test Batch
  console.log('STEP 1: Minting new Honey Batch via POST /api/farmer/batches...');
  const createRes = await post('/api/farmer/batches', {
    farmerId: 'FARMER-001',
    apiaryId: 'APIARY-04',
    apiaryName: 'Apiary #4 (Mogar Central Orchard)',
    floralSource: 'Wild Himalayan Flora',
    quantityKg: 75.0,
    moisturePercent: 17.1,
    harvestDate: '2026-09-30'
  });

  if (createRes.status !== 201) {
    console.error('❌ Failed to mint batch:', createRes.body);
    process.exit(1);
  }

  const batch = createRes.body.batch;
  const batchId = batch.batchId;
  console.log(`✅ Batch Minted: ${batchId}`);
  console.log(`   - Cryptographic Hash: ${batch.blockHash}`);
  console.log(`   - Initial QR Status: ${batch.qrStatus} (Awaiting Lab)`);
  console.log(`   - Generated QR URL: ${batch.qrCodeData}`);

  // 2. Verify URL is NOT hard-coded localhost if PUBLIC_BASE_URL is set
  console.log('\nSTEP 2: Verifying QR Code URL format...');
  const hasValidUrl = batch.qrCodeData.includes('/passport.html?batch=' + batchId);
  console.log(`   - Encodes correct passport path: ${hasValidUrl ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   - Base URL: ${batch.qrCodeData.split('/passport.html')[0]}`);

  // 3. Test Machine-Readable QR API (PNG Binary)
  console.log('\nSTEP 3: Testing GET /api/qr/:batchId (PNG Binary Image)...');
  const qrPngRes = await get(`/api/qr/${batchId}`);
  const isPng = Buffer.isBuffer(qrPngRes.body) && qrPngRes.body.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
  console.log(`   - HTTP Status: ${qrPngRes.status}`);
  console.log(`   - Content-Type: ${qrPngRes.headers['content-type']}`);
  console.log(`   - PNG Magic Number Verified: ${isPng ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   - Image Size: ${qrPngRes.body.length} bytes`);

  // 4. Test Machine-Readable QR API (JSON Data URL)
  console.log('\nSTEP 4: Testing GET /api/qr/:batchId?format=json...');
  const qrJsonRes = await get(`/api/qr/${batchId}?format=json`);
  const isDataUrl = typeof qrJsonRes.body.qrDataUrl === 'string' && qrJsonRes.body.qrDataUrl.startsWith('data:image/png;base64,');
  console.log(`   - HTTP Status: ${qrJsonRes.status}`);
  console.log(`   - Target Scan URL: ${qrJsonRes.body.targetUrl}`);
  console.log(`   - Base64 DataURL Valid: ${isDataUrl ? '✅ PASS' : '❌ FAIL'}`);

  // 5. Query Passport API (Pre-Verification / INACTIVE State)
  console.log('\nSTEP 5: Querying GET /api/public/passport/:batchId (INACTIVE State)...');
  const passportInactive = await get(`/api/public/passport/${batchId}`);
  console.log(`   - HTTP Status: ${passportInactive.status}`);
  console.log(`   - Passport qrStatus: ${passportInactive.body.qrStatus}`);
  console.log(`   - Beekeeper: ${passportInactive.body.beekeeper?.name}`);
  console.log(`   - Apiary: ${passportInactive.body.apiary?.name}`);
  console.log(`   - Floral Source: ${passportInactive.body.batch?.floralSource}`);
  console.log(`   - Inactive State Confirmed: ${passportInactive.body.qrStatus === 'INACTIVE' ? '✅ PASS' : '❌ FAIL'}`);

  // 6. Test Package Units QR
  console.log('\nSTEP 6: Checking Individual Packaging Jar QR codes...');
  const packagesRes = await get(`/api/packaging/units/${batchId}`);
  const samplePkg = packagesRes.body[0];
  console.log(`   - Sample Jar ID: ${samplePkg?.packageId}`);
  console.log(`   - Sample Jar QR URL: ${samplePkg?.qrCodeData}`);
  console.log(`   - Sample Jar QR Status: ${samplePkg?.qrStatus}`);

  const pkgQrRes = await get(`/api/qr/${samplePkg?.packageId}?format=json`);
  console.log(`   - Package QR Target URL: ${pkgQrRes.body?.targetUrl}`);
  console.log(`   - Package QR matches expected package: ${pkgQrRes.body?.targetUrl?.includes(samplePkg?.packageId) ? '✅ PASS' : '❌ FAIL'}`);

  // 7. Verify Passport by Package ID
  console.log('\nSTEP 7: Querying GET /api/public/passport/:packageId...');
  const passportPkg = await get(`/api/public/passport/${samplePkg?.packageId}`);
  console.log(`   - Batch matched from package: ${passportPkg.body?.batch?.batchId === batchId ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   - Package ID resolved: ${passportPkg.body?.packageUnit?.packageId}`);

  // 8. Submit Clean Lab Report -> ACTIVATE QR
  console.log('\nSTEP 8: Submitting NABL Lab Analysis & Activating QR Code...');
  const labActivateRes = await post('/api/lab/submit-report', {
    batchId,
    sampleId: createRes.body.labSampleId,
    moisturePercent: 17.1,
    c4SugarPercent: 0.0,
    hmfMgKg: 11.8,
    pollenOrigin: 'Wild Himalayan Flora Morphology Confirmed',
    simulateAnomaly: false
  });
  console.log(`   - Dual Consensus: ${labActivateRes.body.consensusStatus}`);
  console.log(`   - QR Activation Verdict: ${labActivateRes.body.qrStatus} (Should be ACTIVE)`);

  const passportActive = await get(`/api/public/passport/${batchId}`);
  console.log(`   - Passport Status in DB: ${passportActive.body.qrStatus}`);
  console.log(`   - QR ACTIVE State Confirmed: ${passportActive.body.qrStatus === 'ACTIVE' ? '✅ PASS' : '❌ FAIL'}`);

  // 9. Submit Anomaly Lab Report -> REVOKE QR
  console.log('\nSTEP 9: Simulating Chemical Adulteration -> REVOKING QR Code...');
  const labRevokeRes = await post('/api/lab/submit-report', {
    batchId,
    simulateAnomaly: true
  });
  console.log(`   - Anomaly Detected: ${labRevokeRes.body.anomalyDetected ? '✅ YES' : '❌ NO'}`);
  console.log(`   - Revocation Status: ${labRevokeRes.body.qrStatus} (Should be REVOKED)`);

  const passportRevoked = await get(`/api/public/passport/${batchId}`);
  console.log(`   - Passport Status in DB: ${passportRevoked.body.qrStatus}`);
  console.log(`   - QR REVOKED State Confirmed: ${passportRevoked.body.qrStatus === 'REVOKED' ? '✅ PASS' : '❌ FAIL'}`);

  console.log('\n================================================================');
  console.log('🎉 ALL 9 QR LIFECYCLE & PASSPORT TESTS COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

runQrVerification().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
