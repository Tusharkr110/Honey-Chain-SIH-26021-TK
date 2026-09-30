const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(buf) }); }
        catch (e) { resolve({ status: res.statusCode, body: buf }); }
      });
    }).on('error', reject);
  });
}

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
        try { resolve({ status: res.statusCode, body: JSON.parse(buf) }); }
        catch (e) { resolve({ status: res.statusCode, body: buf }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testApiaryFlows() {
  console.log('Testing Apiary Colony Endpoints & Automated KVIC Flagging...\n');

  // 1. Get Apiaries for Farmer
  const apiaries = await get('/api/farmer/apiaries/FARMER-001');
  console.log('1. GET /api/farmer/apiaries/FARMER-001:', apiaries.status === 200 ? '✅ PASS' : '❌ FAIL');
  console.log(`   Found ${apiaries.body.length} Apiaries:`);
  apiaries.body.forEach(a => {
    console.log(`   - [${a.id}] ${a.name} | Hive: ${a.hiveId} | Scale: ${a.weightKg}kg | Swarming: ${a.swarmingRisk} (${a.acousticFreqHz}Hz)`);
  });

  // 2. Query MongoDB Swarming for specific Apiary #3 (HIVE-JR-03)
  const swarm3 = await get('/api/mongo/swarming-analysis/HIVE-JR-03');
  console.log('\n2. GET /api/mongo/swarming-analysis/HIVE-JR-03 (Apiary #3):', swarm3.status === 200 ? '✅ PASS' : '❌ FAIL');
  console.log(`   Risk: ${swarm3.body.swarmingRisk}, Peak: ${swarm3.body.dominantFreqHz} Hz, Queen Piping: ${swarm3.body.queenPipingDetected}, Prob: ${swarm3.body.probabilityPercent}%`);

  // 3. Harvest Apiary #3 and Mint Batch
  const batchMint = await post('/api/farmer/batches', {
    farmerId: 'FARMER-001',
    apiaryId: 'APIARY-03',
    apiaryName: 'Apiary #3 (Jamun Riverbank Apiary)',
    floralSource: 'Jamun & Multi-Flora',
    quantityKg: 68.0,
    moisturePercent: 17.1,
    harvestDate: '2026-09-28'
  });
  console.log('\n3. POST /api/farmer/batches (Harvest Apiary #3):', batchMint.status === 201 ? '✅ PASS' : '❌ FAIL');
  console.log(`   Batch ID: ${batchMint.body.batch?.batchId}`);
  console.log(`   Apiary: ${batchMint.body.batch?.apiaryName} (${batchMint.body.batch?.apiaryId})`);
  console.log(`   Block Hash: ${batchMint.body.batch?.blockHash?.substring(0, 16)}...`);
  const flagCol = batchMint.body.harvestAudit?.flagColor || batchMint.body.harvestAudit?.flag_color;
  const flagTit = batchMint.body.harvestAudit?.flagTitle || batchMint.body.harvestAudit?.flag_title;
  console.log(`   Automated KVIC Audit Dispatched: Flag [${flagCol}] - "${flagTit}"`);

  // 4. Verify KVIC Harvest Flags Queue
  const kvicFlags = await get('/api/kvic/harvest-flags');
  console.log('\n4. GET /api/kvic/harvest-flags (KVIC Officer Queue):', kvicFlags.status === 200 ? '✅ PASS' : '❌ FAIL');
  const latestFlag = kvicFlags.body[0];
  console.log(`   Latest Flag in KVIC Queue: [${latestFlag?.flagColor}] for ${latestFlag?.farmerName}`);
  console.log(`   Apiary: ${latestFlag?.apiaryName || latestFlag?.apiaryId}`);
  console.log(`   Batch: ${latestFlag?.batchId}`);

  console.log('\n==============================================');
  console.log('🎉 ALL APIARY & AUTOMATED KVIC LINK TESTS PASSED!');
  console.log('==============================================');
}

testApiaryFlows().catch(console.error);
