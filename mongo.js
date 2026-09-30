// mongo.js - MongoDB 8.2 JSON Document Store for Real-Time IoT & Swarming AI Analytics
const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'beehive_iot_db';

const client = new MongoClient(MONGO_URI, {
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000
});

let dbInstance = null;

async function connectMongo() {
  if (dbInstance) return dbInstance;
  try {
    await client.connect();
    dbInstance = client.db(MONGO_DB_NAME);
    console.log(`🍃 Connected to MongoDB on ${MONGO_URI}/${MONGO_DB_NAME}`);

    // Create Indexes
    await dbInstance.collection('hive_telemetry_documents').createIndex({ farmerId: 1, timestamp: -1 });
    await dbInstance.collection('hive_telemetry_documents').createIndex({ hiveId: 1 });
    await dbInstance.collection('hive_telemetry_documents').createIndex({ "swarmingPrediction.risk": 1 });

    // Seed initial documents if empty
    const count = await dbInstance.collection('hive_telemetry_documents').countDocuments();
    if (count === 0) {
      console.log('Seeding rich JSON IoT documents into MongoDB for swarming AI analysis...');
      const seedDocs = [];
      const now = Date.now();

      // 15 days of JSON documents with acoustic spectrum and swarming diagnostics
      for (let i = 14; i >= 0; i--) {
        const time = new Date(now - i * 24 * 60 * 60 * 1000);
        const weight = +(32.4 + (14 - i) * 0.98 + (Math.random() * 0.2 - 0.1)).toFixed(2);
        const dominantFreq = +(214 + Math.random() * 8).toFixed(1);
        const temp = +(34.8 + Math.random() * 0.4).toFixed(1);
        const humidity = +(57.5 + Math.random() * 2).toFixed(1);

        seedDocs.push({
          hiveId: "HIVE-ALPHA-01",
          farmerId: "FARMER-001",
          timestamp: time,
          sensors: {
            scaleWeightKg: weight,
            internalTempC: temp,
            humidityPercent: humidity,
            barometricPressureHpa: 1012.4
          },
          acoustics: {
            dominantFreqHz: dominantFreq,
            audioSpectrumBins: [120, 160, dominantFreq, dominantFreq + 25, 290],
            amplitudeDb: +(46.0 + Math.random() * 4).toFixed(1),
            queenPipingDetected: false,
            vibrationVelocityMmS: +(0.8 + Math.random() * 0.3).toFixed(2)
          },
          swarmingPrediction: {
            risk: "LOW",
            probabilityPercent: +(3.5 + Math.random() * 3).toFixed(1),
            colonyState: "ACTIVE_FORAGING",
            swarmWarningIssued: false,
            predictionWindowHours: 72
          },
          diseaseDiagnostics: {
            status: "HEALTHY",
            varroaMiteIndex: 0.01,
            foulbroodMarkerDetected: false,
            broodNestIntegrity: 0.98,
            confidencePercent: 99.2
          },
          anomalyVectors: {
            suddenChangeDetected: false,
            type: "NORMAL_PROGRESSION",
            deviationScore: +(0.02 + Math.random() * 0.04).toFixed(3)
          },
          blockchainSyncStatus: {
            syncedToLedger: true,
            blockHash: "0x" + Math.random().toString(16).substring(2, 10)
          }
        });
      }

      await dbInstance.collection('hive_telemetry_documents').insertMany(seedDocs);
      console.log(`✓ Seeded ${seedDocs.length} JSON documents into MongoDB hive_telemetry_documents!`);
    }

    return dbInstance;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

function getMongoDb() {
  if (!dbInstance) {
    throw new Error('MongoDB not initialized. Call connectMongo() first.');
  }
  return dbInstance;
}

module.exports = {
  connectMongo,
  getMongoDb,
  client
};
