# BeeHive Blockchain - Honey Traceability System

> **Smart India Hackathon (SIH) 2026 Project**
> A blockchain-backed, end-to-end honey supply chain traceability platform integrating IoT telemetry, AI anomaly detection, NABL lab verification, and a permanent QR-based bottle passport system -- built for KVIC (Khadi and Village Industries Commission).

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Traceability Demo](#traceability-demo)
- [Lifecycle Stages](#lifecycle-stages)
- [Environment Variables](#environment-variables)

---

## Overview

BeeHive Blockchain is a full-stack government-grade traceability platform for India's honey supply chain under the KVIC Honey Mission. Every honey bottle receives **one permanent QR code at bottling** -- that same QR serves the customer a dynamically updated lifecycle page from farm to sale.

The platform connects:
- **Farmers** -- register harvests, track hive IoT data
- **KVIC Officials** -- audit AI-flagged harvests, approve farmers
- **NABL Labs** -- submit and verify chemical test reports
- **Distributors and Retailers** -- scan QR to record custody transfers
- **Customers** -- scan the bottle QR to verify origin, lab results, and full supply chain

---

## Key Features

| Feature | Description |
|---|---|
| Blockchain Ledger | Every supply chain event is hashed and chained in PostgreSQL -- tamper-evident, append-only |
| Permanent Bottle QR | One QR per bottle, printed at bottling, content updates dynamically per lifecycle status |
| Dual Lab Verification | NABL lab test + scientist sign-off before any bottle can enter supply chain |
| IoT Hive Telemetry | Real-time hive weight, temperature, humidity, and acoustic frequency from MongoDB |
| AI Harvest Audit | Automated GREEN/RED flag system detects anomalies (sudden weight jumps, temp spikes) |
| KVIC Registry Matching | Farmer Aadhaar verified against KVIC master registry before approval |
| Tamper Detection | SHA-256 hash chaining; any modification breaks the chain and is detected instantly |
| Role-Based Dashboards | Separate views for Farmer, KVIC Officer, Lab Scientist, Distributor, Retailer, Admin |

---

## System Architecture

`
+------------------------------------------------------------------+
|                        FRONTEND (Browser)                         |
|  index.html + app.js + styles.css   |   trace-demo.html          |
|  (Main Dashboard -- all roles)       |   (Standalone Demo)        |
+------------------------+---------------------------------------------+
                         | HTTP / REST API
+------------------------v---------------------------------------------+
|                    server.js  (Express.js)                           |
|   REST API  Static File Server  Blockchain Logger                   |
|   Hash Generator  KVIC Verification  QR Activation Engine           |
+----------+--------------------------------------------+-------------+
           |                                            |
+----------v----------+                    +-----------v--------------+
|   PostgreSQL 18     |                    |   MongoDB 8.2            |
|   Port: 5433        |                    |   Port: 27017            |
|                     |                    |                          |
|  kvic_master_reg    |                    |  hive_telemetry_docs     |
|  users              |                    |                          |
|  honey_batches      |                    |  Raw IoT sensor docs,    |
|  lab_reports        |                    |  flexible schema         |
|  batch_packages     |                    |                          |
|  blockchain_logs    |                    +--------------------------+
|  hive_telemetry     |
|  harvest_ai_audits  |
+---------------------+
`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20 + Express.js 5 |
| Relational DB | PostgreSQL 18 (port 5433) |
| Document DB | MongoDB 8.2 (port 27017) |
| Frontend | Vanilla HTML5 + CSS3 + JavaScript (no framework) |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
| Hashing | SHA-256 via Node.js crypto module |
| QR Generation | SVG-based deterministic QR renderer (client-side) |
| Environment | dotenv, pg, mongodb native driver |

---

## Database Schema

### PostgreSQL Tables

| Table | Purpose |
|---|---|
| kvic_master_registry | KVIC beekeeper records -- Aadhaar, Honey Mission ID, allocated boxes |
| users | Platform users -- Farmers, KVIC Officers, Admins with role-based access |
| honey_batches | Honey harvest batches registered on blockchain with hash + QR status |
| lab_reports | NABL/FSSAI lab chemical test results per batch |
| atch_packages | Individual 500g jars with permanent QR codes (INACTIVE until lab verified) |
| lockchain_logs | Immutable event ledger -- every supply chain event with tx_hash + block number |
| hive_telemetry | IoT sensor readings -- weight, temperature, humidity, acoustic frequency |
| harvest_ai_audits | AI-generated GREEN/RED audit flags per harvest |

### MongoDB Collection

| Collection | Purpose |
|---|---|
| hive_telemetry_documents | Raw IoT telemetry documents -- flexible schema for sensor payloads |

---

## Project Structure

`
BeeHive Blockchain/
|
+-- server.js                   # Main Express server -- all REST API routes
+-- db.js                       # PostgreSQL connection pool + table init + seeding
+-- mongo.js                    # MongoDB connection helper
+-- schema.sql                  # Full PostgreSQL schema (8 tables + indexes)
|
+-- index.html                  # Main dashboard -- all role dashboards in one SPA
+-- app.js                      # Frontend JS -- view routing, API calls, UI state
+-- styles.css                  # Global CSS design system
|
+-- trace-demo.html             # Standalone bottle traceability demo (synthetic data)
+-- passport.html               # Individual bottle blockchain passport (QR scan target)
|
+-- data.js                     # Static seed/demo data
|
+-- migrate-packaging-lab.js    # DB migration: adds packaging + lab tables
+-- seed-packages-lab.js        # Seeds batch_packages + lab_reports demo data
+-- inspect-db.js               # CLI tool to inspect DB state
|
+-- test-all-flows.js           # End-to-end API flow tests
+-- test-apiary-flows.js        # Apiary-specific flow tests
+-- test-packaging-passport.js  # QR activation + passport flow tests
|
+-- build-trace-demo.py         # Regenerates trace-demo.html from source
+-- .env                        # Environment config (DB credentials, port)
+-- package.json                # Node.js dependencies + scripts
`

---

## Setup and Installation

### Prerequisites

- Node.js 20+
- PostgreSQL 18 running on port 5433
- MongoDB 8.2 running on port 27017
- Python 3 (optional -- to regenerate 	race-demo.html)

### 1. Install dependencies

`ash
npm install
`

### 2. Configure environment

Edit .env:

`env
PORT=3000
PGHOST=localhost
PGPORT=5433
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=beehive_db

# Base URL for scannable QR codes (Wi-Fi LAN IP or domain for mobile scanning)
PUBLIC_BASE_URL=http://YOUR-PC-LAN-IP:3000
`

MongoDB defaults to mongodb://localhost:27017/beehive_iot_db.

### 3. Initialize database

The server auto-creates all tables and seeds demo data on first start.
Or run the schema manually:

`ash
psql -U postgres -p 5433 -d beehive_db -f schema.sql
`

---

## Running the Project

### Start the server

`ash
npm start
# or
node server.js
`

Server starts at **http://localhost:3000** (binds to `0.0.0.0` for LAN access: `http://<PC-LAN-IP>:3000`).
Run `node test-qr-flow.js` to verify real QR generation, machine-readable decoding, and passport retrieval.

### Available pages

| URL | Description |
|---|---|
| http://localhost:3000/ | Main dashboard (all roles) |
| http://localhost:3000/trace-demo.html | Bottle traceability demo |
| http://localhost:3000/passport.html | Bottle blockchain passport |

### Utility scripts

`ash
node inspect-db.js                  # Inspect current DB state
npm run test:flows                  # Run all API flow tests
node test-packaging-passport.js     # Test QR activation flow
node seed-packages-lab.js           # Seed packaging + lab data
python build-trace-demo.py          # Regenerate trace demo page
`

---

## Mobile Phone Testing Demonstration

To scan and verify QR codes using a smartphone during an evaluator presentation:

1. **Connect to Same Wi-Fi**: Ensure your PC and phone are on the same local Wi-Fi network.
2. **Set `PUBLIC_BASE_URL` in `.env`**: Set `PUBLIC_BASE_URL=http://<YOUR-PC-LAN-IP>:3000` (e.g. `http://10.231.193.146:3000`). If omitted, the server will auto-detect your local Wi-Fi IPv4 address.
3. **Open Dashboard**: Go to `http://localhost:3000` on your PC and log in as Farmer (e.g., Mobile: `9876543210`).
4. **Create or View Batch**: Mint a new honey batch or click `🏷️ QR Passport` on any existing batch table row.
5. **Real QR Displayed**: The modal renders an actual machine-readable QR PNG encoding the passport URL. You can also click `⬇️ Download QR` to save the PNG image.
6. **Scan with Phone Camera**: Point your phone camera at the QR code on screen.
7. **Instant Passport View**: The phone opens `http://<LAN-IP>:3000/passport.html?batch=HM-BATCH-...` displaying real-time PostgreSQL data and current verification status (`QR INACTIVE`, `QR ACTIVATED / VERIFIED`, or `QR REVOKED`).

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new farmer/officer |
| POST | /api/auth/login | Login + role-based session |

### Farmer / Harvest
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/farmer/dashboard/:id | Farmer dashboard data |
| POST | /api/harvest/register | Register new honey batch |
| GET | /api/harvest/batches/:farmerId | Get all batches for a farmer |

### KVIC Officer
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/kvic/pending-approvals | Farmers awaiting approval |
| POST | /api/kvic/approve-farmer | Approve farmer (after Aadhaar match) |
| GET | /api/kvic/harvest-audits | AI-flagged harvest audits |

### Laboratory
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/lab/submit-report | Submit lab test report |
| POST | /api/lab/verify-report | Scientist verifies report |
| GET | /api/lab/pending | Batches awaiting lab test |

### Packaging and QR
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/packaging/activate-qr | Activate QR codes after dual verification |
| GET | /api/passport/:packageId | Get full bottle blockchain passport |

### IoT Telemetry
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/telemetry/:farmerId | Latest hive IoT readings |
| GET | /api/telemetry/mongo/:hiveId | Raw MongoDB telemetry documents |

### Blockchain
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/blockchain/logs | Full blockchain event ledger |
| GET | /api/blockchain/verify/:batchId | Verify hash chain for a batch |

---

## Traceability Demo

	race-demo.html is a fully self-contained demo (no database required) that showcases the complete bottle lifecycle with synthetic data.

### What it demonstrates

- 5 pre-loaded bottles at every lifecycle stage (Farm to Lab to Distributor to Retailer to Sold)
- Role-based dashboards -- switch between Farm / Lab / Distributor / Retailer / Admin
- Permanent QR code -- unique SVG per bottle, URL never changes
- NABL Lab Report -- 6 chemical parameters (moisture, HMF, C4 sugar, adulteration, etc.)
- Blockchain Audit Records -- every event with block number + hash + previous hash
- Append-only Supply Chain Timeline -- complete ordered event history
- Tamper Detection -- visual hash chain integrity check across all events
- Customer QR Scan Modal -- simulates what a consumer sees after scanning the bottle
- 12 Traceability Questions answered live in the consumer view
- Live lifecycle advancement -- click buttons to move a bottle through stages in real time

### SIH Demo Flow

1. Open http://localhost:3000/trace-demo.html
2. Select HNY-2026-000001 (SOLD) -- show complete journey
3. Click **Simulate Customer QR Scan** -- show consumer verification page
4. Select HNY-2026-000005 (AWAITING_LAB_TEST) -- switch to **Lab** role
5. Click **Receive at Lab** then **Verify Lab Test** -- watch status update live
6. Switch to **Distributor** -- receive into supply chain
7. Switch to **Retailer** -- receive, mark Available, mark Sold
8. Show **Admin** role tamper detection simulation

---

## Lifecycle Stages

`
REGISTERED (Farm)
      |
      v
LAB_RECEIVED (Lab)
      |
      v
LAB_TESTED (Lab Scientist performs tests)
      |
      v
LAB_VERIFIED (Scientist signs off -- QR activates)
      |
      v
IN_SUPPLY_CHAIN (Distributor receives)
      |
      |-- TRANSPORTED
      |
      |-- WAREHOUSE_RECEIVED
      |
      v
RETAILER_RECEIVED (Retailer scans QR on arrival)
      |
      v
AVAILABLE (Put on shelf -- customer can scan)
      |
      v
SOLD (Cashier marks sold -- permanent record)
`

Key principle: The QR code URL is permanent and printed once at bottling.
The information it displays changes dynamically based on the bottle's current verified status.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| PORT | 3000 | HTTP server port |
| PGHOST | localhost | PostgreSQL host |
| PGPORT | 5433 | PostgreSQL port |
| PGUSER | postgres | PostgreSQL username |
| PGPASSWORD | postgres | PostgreSQL password |
| PGDATABASE | eehive_db | PostgreSQL database name |

---

## Team

**Smart India Hackathon 2026**
Problem Statement: Blockchain-Based Honey Traceability for KVIC Honey Mission

---

*Built with Node.js · PostgreSQL 18 · MongoDB 8.2 · Vanilla JS*
