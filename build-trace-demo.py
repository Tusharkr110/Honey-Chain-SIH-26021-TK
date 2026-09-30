
html = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BeeHive Blockchain - Honey Bottle Traceability System (Demo)</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #050a14; --bg2: #0b1220; --bg3: #111c30;
  --card: rgba(15,24,42,0.85); --border: rgba(255,255,255,0.08); --border2: rgba(255,255,255,0.14);
  --gold: #f5a623; --gold2: #fbbf24; --emerald: #10b981; --blue: #38bdf8;
  --purple: #a855f7; --ruby: #ef4444; --amber: #f59e0b;
  --text: #f1f5f9; --muted: #94a3b8; --dim: #475569;
  --mono: 'JetBrains Mono', monospace; --sans: 'Inter', sans-serif;
  --r: 10px; --r2: 16px;
}
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: var(--sans); background: var(--bg); color: var(--text); min-height:100vh;
  background-image: radial-gradient(circle at 10% 20%,rgba(245,166,35,0.07) 0%,transparent 40%),
    radial-gradient(circle at 90% 80%,rgba(56,189,248,0.05) 0%,transparent 40%); }
.app-shell { display:flex; flex-direction:column; min-height:100vh; }
header { background:rgba(5,10,20,0.97); border-bottom:1px solid var(--border); padding:0 28px;
  display:flex; align-items:center; gap:20px; height:58px; position:sticky; top:0; z-index:100; backdrop-filter:blur(16px); }
.logo { display:flex; align-items:center; gap:10px; }
.logo-hex { font-size:1.5rem; }
.logo-text h1 { font-size:0.95rem; font-weight:800; color:var(--gold2); }
.logo-text p { font-size:0.68rem; color:var(--muted); }
.role-switcher { display:flex; background:rgba(255,255,255,0.04); border:1px solid var(--border);
  border-radius:99px; padding:3px; gap:2px; margin-left:auto; }
.role-btn { padding:5px 14px; border-radius:99px; font-size:0.75rem; font-weight:600; cursor:pointer;
  border:none; background:transparent; color:var(--muted); transition:all 0.2s; white-space:nowrap; }
.role-btn.active { background:var(--gold); color:#000; font-weight:700; }
.btn-scan-demo { padding:6px 14px; border-radius:99px; font-size:0.75rem; font-weight:700; cursor:pointer;
  border:1px solid var(--blue); background:rgba(56,189,248,0.1); color:var(--blue); transition:all 0.2s; }
.btn-scan-demo:hover { background:rgba(56,189,248,0.2); }
.body-grid { display:grid; grid-template-columns:300px 1fr; flex:1; height:calc(100vh - 58px); }
.sidebar { background:var(--bg2); border-right:1px solid var(--border); overflow-y:auto;
  padding:16px 12px; display:flex; flex-direction:column; gap:10px; }
.sidebar-title { font-size:0.7rem; font-weight:700; color:var(--dim); text-transform:uppercase;
  letter-spacing:0.8px; padding:4px 8px; }
.bottle-card { background:var(--bg3); border:1px solid var(--border); border-radius:var(--r);
  padding:12px; cursor:pointer; transition:all 0.2s; }
.bottle-card:hover, .bottle-card.active { border-color:var(--gold); background:rgba(245,166,35,0.08); }
.bottle-card.active { border-color:var(--gold2); }
.bc-id { font-family:var(--mono); font-size:0.78rem; font-weight:700; color:var(--gold2); }
.bc-batch { font-size:0.7rem; color:var(--muted); margin-top:2px; }
.bc-type { font-size:0.72rem; color:var(--text); margin-top:4px; }
.status-pill { display:inline-flex; align-items:center; gap:5px; padding:2px 9px; border-radius:99px;
  font-size:0.65rem; font-weight:700; margin-top:6px; }
.sp-awaiting { background:rgba(245,158,11,0.15); color:#fbbf24; }
.sp-verified { background:rgba(16,185,129,0.15); color:#10b981; }
.sp-chain { background:rgba(56,189,248,0.15); color:#38bdf8; }
.sp-retailer { background:rgba(168,85,247,0.15); color:#a855f7; }
.sp-available { background:rgba(16,185,129,0.2); color:#10b981; }
.sp-sold { background:rgba(239,68,68,0.15); color:#ef4444; }
.main-panel { overflow-y:auto; padding:24px; display:flex; flex-direction:column; gap:20px; }
.panel-row { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.panel-row.wide { grid-template-columns:2fr 1fr; }
.card { background:var(--card); border:1px solid var(--border); border-radius:var(--r2); padding:18px; backdrop-filter:blur(12px); }
.card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;
  padding-bottom:10px; border-bottom:1px solid var(--border); }
.card-title { display:flex; align-items:center; gap:8px; font-size:0.9rem; font-weight:700; color:var(--text); }
.card-badge { font-size:0.65rem; font-weight:700; padding:2px 8px; border-radius:99px;
  border:1px solid var(--border2); color:var(--muted); }
.status-banner { border-radius:var(--r2); padding:18px 22px; display:flex; align-items:center; gap:18px; }
.sb-icon { font-size:2.5rem; }
.sb-body h2 { font-size:1.15rem; font-weight:800; }
.sb-body p { font-size:0.8rem; color:var(--muted); margin-top:3px; }
.sb-id { font-family:var(--mono); font-size:0.82rem; color:var(--gold2); }
.info-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.ii-label { font-size:0.68rem; color:var(--dim); text-transform:uppercase; letter-spacing:0.5px; }
.ii-value { font-size:0.85rem; font-weight:600; color:var(--text); margin-top:2px; }
.ii-value.mono { font-family:var(--mono); font-size:0.78rem; color:var(--blue); }
.ii-value.gold { color:var(--gold2); }
.ii-value.green { color:var(--emerald); }
.qr-container { display:flex; flex-direction:column; align-items:center; gap:10px; }
.qr-box { background:#fff; padding:14px; border-radius:10px; box-shadow:0 4px 24px rgba(0,0,0,0.4); display:inline-block; }
.qr-url { font-family:var(--mono); font-size:0.7rem; color:var(--blue); text-align:center; word-break:break-all; }
.timeline { display:flex; flex-direction:column; gap:0; }
.tl-item { display:flex; gap:14px; position:relative; }
.tl-item:not(:last-child) .tl-dot::after { content:''; position:absolute; left:50%; top:24px;
  width:2px; height:calc(100% - 4px); background:var(--border); transform:translateX(-50%); }
.tl-dot { position:relative; width:20px; height:20px; border-radius:50%; flex-shrink:0; margin-top:2px;
  display:flex; align-items:center; justify-content:center; font-size:0.65rem; z-index:1; }
.tl-content { flex:1; padding-bottom:18px; }
.tl-event-name { font-size:0.8rem; font-weight:700; }
.tl-meta { font-size:0.72rem; color:var(--muted); margin-top:2px; }
.tl-hash { font-family:var(--mono); font-size:0.65rem; color:var(--dim); margin-top:3px; }
.bc-record { background:rgba(0,0,0,0.35); border:1px solid var(--border); border-radius:var(--r);
  padding:10px 12px; margin-bottom:8px; font-size:0.75rem; }
.bc-event { font-weight:700; color:var(--gold2); }
.bc-hash { font-family:var(--mono); font-size:0.65rem; color:var(--emerald); word-break:break-all; margin-top:2px; }
.bc-ts { font-size:0.65rem; color:var(--dim); margin-top:2px; }
.action-row { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
.btn { padding:8px 16px; border-radius:var(--r); font-size:0.78rem; font-weight:700; cursor:pointer;
  border:none; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
.btn-gold { background:var(--gold); color:#000; }
.btn-gold:hover { background:var(--gold2); }
.btn-green { background:rgba(16,185,129,0.2); color:var(--emerald); border:1px solid var(--emerald); }
.btn-green:hover { background:rgba(16,185,129,0.35); }
.btn-blue { background:rgba(56,189,248,0.15); color:var(--blue); border:1px solid var(--blue); }
.btn-blue:hover { background:rgba(56,189,248,0.25); }
.btn-red { background:rgba(239,68,68,0.15); color:var(--ruby); border:1px solid var(--ruby); }
.btn-red:hover { background:rgba(239,68,68,0.25); }
.btn-ghost { background:transparent; color:var(--muted); border:1px solid var(--border2); }
.btn-ghost:hover { color:var(--text); background:rgba(255,255,255,0.06); }
.modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px);
  z-index:999; display:flex; align-items:center; justify-content:center; padding:20px; }
.modal-backdrop.hidden { display:none; }
.public-modal { background:linear-gradient(145deg,#0b1628,#06101e); border:1px solid rgba(245,166,35,0.3);
  border-radius:20px; width:100%; max-width:480px; max-height:90vh; overflow-y:auto;
  box-shadow:0 30px 80px rgba(0,0,0,0.8),0 0 40px rgba(245,166,35,0.1); }
.pm-header { background:linear-gradient(135deg,rgba(245,166,35,0.15),transparent); padding:20px;
  border-bottom:1px solid rgba(255,255,255,0.08); text-align:center; }
.pm-brand { font-size:0.7rem; color:var(--gold); text-transform:uppercase; letter-spacing:1px; font-weight:700; }
.pm-title { font-size:1.15rem; font-weight:800; margin-top:4px; }
.pm-status-shield { width:70px; height:70px; border-radius:50%; margin:14px auto;
  display:flex; align-items:center; justify-content:center; font-size:1.8rem; }
.pm-body { padding:20px; }
.pm-section { margin-bottom:18px; }
.pm-section-title { font-size:0.68rem; font-weight:700; text-transform:uppercase;
  letter-spacing:0.6px; color:var(--dim); margin-bottom:8px; }
.pm-tl { display:flex; flex-direction:column; gap:0; }
.pm-tl-item { display:flex; gap:12px; position:relative; }
.pm-tl-item:not(:last-child) .pm-dot::after { content:''; position:absolute; left:50%; top:20px;
  width:2px; height:calc(100% - 4px); background:rgba(255,255,255,0.1); transform:translateX(-50%); }
.pm-dot { position:relative; width:18px; height:18px; border-radius:50%; flex-shrink:0; margin-top:1px;
  display:flex; align-items:center; justify-content:center; font-size:0.6rem; z-index:1; }
.pm-dot.done { background:var(--emerald); } .pm-dot.pending { background:var(--amber); }
.pm-tl-body { flex:1; padding-bottom:14px; }
.pm-ev-name { font-size:0.82rem; font-weight:700; }
.pm-ev-meta { font-size:0.72rem; color:var(--muted); margin-top:2px; line-height:1.4; }
.bc-verify-box { background:rgba(0,0,0,0.4); border:1px solid rgba(16,185,129,0.3);
  border-radius:var(--r); padding:12px; margin-top:10px; }
.bc-verify-row { display:flex; align-items:center; gap:6px; font-size:0.75rem; color:var(--muted); padding:3px 0; }
.bc-verify-row .check { color:var(--emerald); font-weight:700; }
.bc-verify-row .warn { color:var(--amber); }
.pm-close { width:100%; padding:12px; margin:0; border-radius:0 0 20px 20px; font-size:0.82rem;
  font-weight:700; cursor:pointer; border:none; border-top:1px solid rgba(255,255,255,0.08);
  background:rgba(255,255,255,0.04); color:var(--muted); transition:all 0.2s; }
.pm-close:hover { background:rgba(255,255,255,0.09); color:var(--text); }
.form-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.role-notice { background:rgba(245,166,35,0.08); border:1px dashed rgba(245,166,35,0.3);
  border-radius:var(--r); padding:14px; text-align:center; font-size:0.82rem; color:var(--muted); margin-top:10px; }
::-webkit-scrollbar { width:6px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:4px; }
.toast-wrap { position:fixed; bottom:24px; right:24px; z-index:2000; display:flex; flex-direction:column; gap:8px; }
.toast { background:rgba(10,18,36,0.98); border:1px solid var(--border2); border-radius:var(--r);
  padding:12px 16px; font-size:0.82rem; min-width:280px; max-width:380px;
  box-shadow:0 10px 30px rgba(0,0,0,0.5); animation:fadeUp 0.25s ease; display:flex; align-items:flex-start; gap:10px; }
.toast.success { border-color:var(--emerald); } .toast.error { border-color:var(--ruby); }
.toast.info { border-color:var(--blue); } .toast.warn { border-color:var(--amber); }
@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
.tag { display:inline-block; padding:2px 8px; border-radius:99px; font-size:0.65rem; font-weight:700; margin-right:4px; }
.tag-green { background:rgba(16,185,129,0.15); color:var(--emerald); }
.tag-amber { background:rgba(245,158,11,0.15); color:var(--amber); }
.tag-red { background:rgba(239,68,68,0.15); color:var(--ruby); }
@media (max-width:900px) {
  .body-grid { grid-template-columns:1fr; } .sidebar { display:none; }
  .panel-row { grid-template-columns:1fr; } .panel-row.wide { grid-template-columns:1fr; }
}
</style>
</head>
<body>
<div class="app-shell">
<header>
  <div class="logo">
    <div class="logo-hex">&#x1F36F;</div>
    <div class="logo-text">
      <h1>BeeHive Blockchain &mdash; Honey Bottle Traceability</h1>
      <p>One Bottle &middot; One Permanent QR &middot; Complete Lifecycle History</p>
    </div>
  </div>
  <div class="role-switcher">
    <button class="role-btn active" id="role-farm" onclick="setRole('farm')">&#x1F331; Farm</button>
    <button class="role-btn" id="role-lab" onclick="setRole('lab')">&#x1F9EA; Laboratory</button>
    <button class="role-btn" id="role-dist" onclick="setRole('dist')">&#x1F69A; Distributor</button>
    <button class="role-btn" id="role-retailer" onclick="setRole('retailer')">&#x1F3EA; Retailer</button>
    <button class="role-btn" id="role-admin" onclick="setRole('admin')">&#x1F6E1; Admin</button>
  </div>
  <button class="btn-scan-demo" onclick="openPublicScan(activeBottleId)" style="margin-left:10px;">
    &#x1F4F1; Simulate Customer QR Scan
  </button>
</header>

<div class="body-grid">
<div class="sidebar">
  <div class="sidebar-title">Demo Bottles (5 Lifecycle Stages)</div>
  <div id="sidebar-list"></div>
  <div class="sidebar-title" style="margin-top:10px;">Lifecycle Stages</div>
  <div style="font-size:0.72rem;color:var(--muted);padding:8px;line-height:1.9;">
    1. AWAITING_LAB_TEST<br>2. LAB_TESTED<br>3. LAB_VERIFIED<br>
    4. IN_SUPPLY_CHAIN<br>5. RETAILER_RECEIVED<br>6. AVAILABLE<br>7. SOLD
  </div>
</div>
<div class="main-panel" id="main-panel">
  <div style="color:var(--dim);text-align:center;margin-top:80px;font-size:0.9rem;">
    Select a bottle from the left panel to begin
  </div>
</div>
</div>
</div>

<div class="modal-backdrop hidden" id="modal-public-scan">
  <div class="public-modal">
    <div class="pm-header">
      <div class="pm-brand">&#x1F1EE;&#x1F1F3; Government of India &bull; KVIC Honey Mission</div>
      <div class="pm-title">Honey Bottle Traceability</div>
      <div id="pm-shield" class="pm-status-shield"></div>
      <div id="pm-bottle-id" style="font-family:var(--mono);font-size:0.85rem;color:var(--gold2);"></div>
      <div id="pm-status-label" style="font-size:0.82rem;font-weight:700;margin-top:4px;"></div>
    </div>
    <div class="pm-body" id="pm-body"></div>
    <button class="pm-close" onclick="closePublicScan()">&#x2715; Close Consumer View</button>
  </div>
</div>

<div class="toast-wrap" id="toast-wrap"></div>

<script>
// ===== SYNTHETIC DEMO DATA =====
const NOW = new Date();
const d = n => { const x = new Date(NOW); x.setDate(x.getDate()-n); return x.toISOString().split('T')[0]; };
const ts = (n,h=10) => { const x = new Date(NOW); x.setDate(x.getDate()-n); x.setHours(h,30,0);
  return x.toISOString().replace('T',' ').substring(0,19)+' IST'; };

function fakeHash(s) {
  let h = 0;
  for (let c of (s+s)) h = (Math.imul(31,h)+c.charCodeAt(0))|0;
  return '0x'+Math.abs(h).toString(16).padStart(8,'0')+'e72d9c4f1ab8'+Math.abs(h*7).toString(16).padStart(8,'0')+'b31a';
}

const FARMS = {
  'FARM-001': {name:'XYZ Honey Farm', location:'Jharkhand, India', owner:'Rajesh Kumar Sinha'},
  'FARM-002': {name:"Nature's Nectar Farm", location:'Kashmir Valley, J&K', owner:'Priya Devi'},
};
const LABS = {
  'LAB-001': {name:'National Food Testing Laboratory', accreditation:'NABL / ISO 17025', location:'Ranchi, Jharkhand'},
};
const ENTITIES = {
  'DIST-001': {name:'FreshChain Distributors Pvt Ltd', location:'Ranchi, Jharkhand'},
  'TRANS-001': {name:'QuickLogix Transport', location:'Ranchi to Jamshedpur'},
  'WH-001': {name:'Central Honey Warehouse', location:'Jamshedpur, Jharkhand'},
  'RETAIL-001': {name:'ABC Honey Store', location:'Jamshedpur, Jharkhand'},
};

const BOTTLES = {
  'HNY-2026-000001': {
    bottleId:'HNY-2026-000001', batchId:'BATCH-2026-0042', farmId:'FARM-001',
    honeyType:'Wildflower Honey', harvestDate:d(25), bottlingDate:d(20), bottleQty:50, weightMl:500,
    preLabHash:fakeHash('HNY-2026-000001-BATCH-2026-0042'), currentStatus:'SOLD', qrUrl:'/trace/HNY-2026-000001',
    events:[
      {type:'REGISTERED',entity:'FARM-001',loc:'Jharkhand',ts:ts(20,9),hash:fakeHash('REG-001'),prevHash:null,by:'Farm Admin'},
      {type:'LAB_RECEIVED',entity:'LAB-001',loc:'Ranchi',ts:ts(17,11),hash:fakeHash('LABRCV-001'),prevHash:fakeHash('REG-001'),by:'Lab Technician'},
      {type:'LAB_TESTED',entity:'LAB-001',loc:'Ranchi',ts:ts(14,14),hash:fakeHash('LABTEST-001'),prevHash:fakeHash('LABRCV-001'),by:'Dr. Sunita Deshmukh',labResults:{Moisture:'17.2%',HMF:'12.4 mg/kg',Adulteration:'Not Detected',Pollen:'Passed','Sugar Profile':'Passed','C4 Sugar':'0.8%'}},
      {type:'LAB_VERIFIED',entity:'LAB-001',loc:'Ranchi',ts:ts(13,10),hash:fakeHash('LABVER-001'),prevHash:fakeHash('LABTEST-001'),by:'Dr. Sunita Deshmukh',labResultHash:fakeHash('LABRES-001')},
      {type:'DISTRIBUTOR_RECEIVED',entity:'DIST-001',loc:'Ranchi',ts:ts(11,8),hash:fakeHash('DISTRCV-001'),prevHash:fakeHash('LABVER-001'),by:'FreshChain Ops'},
      {type:'TRANSPORTED',entity:'TRANS-001',loc:'Ranchi to Jamshedpur',ts:ts(9,6),hash:fakeHash('TRANS-001'),prevHash:fakeHash('DISTRCV-001'),by:'Driver'},
      {type:'WAREHOUSE_RECEIVED',entity:'WH-001',loc:'Jamshedpur',ts:ts(8,15),hash:fakeHash('WH-001'),prevHash:fakeHash('TRANS-001'),by:'Warehouse Mgr'},
      {type:'RETAILER_RECEIVED',entity:'RETAIL-001',loc:'Jamshedpur',ts:ts(5,10),hash:fakeHash('RETAIL-001'),prevHash:fakeHash('WH-001'),by:'Store Manager'},
      {type:'AVAILABLE',entity:'RETAIL-001',loc:'Jamshedpur',ts:ts(5,11),hash:fakeHash('AVAIL-001'),prevHash:fakeHash('RETAIL-001'),by:'Store Manager'},
      {type:'SOLD',entity:'RETAIL-001',loc:'Jamshedpur',ts:ts(1,18),hash:fakeHash('SOLD-001'),prevHash:fakeHash('AVAIL-001'),by:'Cashier',saleId:'SALE-2026-8812'},
    ]
  },
  'HNY-2026-000002': {
    bottleId:'HNY-2026-000002', batchId:'BATCH-2026-0043', farmId:'FARM-001',
    honeyType:'Mustard (Sarson) Honey', harvestDate:d(18), bottlingDate:d(14), bottleQty:80, weightMl:500,
    preLabHash:fakeHash('HNY-2026-000002-BATCH-2026-0043'), currentStatus:'AVAILABLE', qrUrl:'/trace/HNY-2026-000002',
    events:[
      {type:'REGISTERED',entity:'FARM-001',loc:'Jharkhand',ts:ts(14,9),hash:fakeHash('REG-002'),prevHash:null,by:'Farm Admin'},
      {type:'LAB_RECEIVED',entity:'LAB-001',loc:'Ranchi',ts:ts(11,11),hash:fakeHash('LABRCV-002'),prevHash:fakeHash('REG-002'),by:'Lab Technician'},
      {type:'LAB_TESTED',entity:'LAB-001',loc:'Ranchi',ts:ts(9,14),hash:fakeHash('LABTEST-002'),prevHash:fakeHash('LABRCV-002'),by:'Dr. Sunita Deshmukh',labResults:{Moisture:'18.1%',HMF:'10.2 mg/kg',Adulteration:'Not Detected',Pollen:'Passed','Sugar Profile':'Passed','C4 Sugar':'0.5%'}},
      {type:'LAB_VERIFIED',entity:'LAB-001',loc:'Ranchi',ts:ts(8,10),hash:fakeHash('LABVER-002'),prevHash:fakeHash('LABTEST-002'),by:'Dr. Sunita Deshmukh',labResultHash:fakeHash('LABRES-002')},
      {type:'DISTRIBUTOR_RECEIVED',entity:'DIST-001',loc:'Ranchi',ts:ts(6,8),hash:fakeHash('DISTRCV-002'),prevHash:fakeHash('LABVER-002'),by:'FreshChain Ops'},
      {type:'RETAILER_RECEIVED',entity:'RETAIL-001',loc:'Jamshedpur',ts:ts(3,10),hash:fakeHash('RETAIL-002'),prevHash:fakeHash('DISTRCV-002'),by:'Store Manager'},
      {type:'AVAILABLE',entity:'RETAIL-001',loc:'Jamshedpur',ts:ts(3,11),hash:fakeHash('AVAIL-002'),prevHash:fakeHash('RETAIL-002'),by:'Store Manager'},
    ]
  },
  'HNY-2026-000003': {
    bottleId:'HNY-2026-000003', batchId:'BATCH-2026-0044', farmId:'FARM-002',
    honeyType:'Kashmir Sidr White Honey', harvestDate:d(10), bottlingDate:d(6), bottleQty:30, weightMl:500,
    preLabHash:fakeHash('HNY-2026-000003-BATCH-2026-0044'), currentStatus:'IN_SUPPLY_CHAIN', qrUrl:'/trace/HNY-2026-000003',
    events:[
      {type:'REGISTERED',entity:'FARM-002',loc:'Kashmir Valley',ts:ts(6,9),hash:fakeHash('REG-003'),prevHash:null,by:'Farm Admin'},
      {type:'LAB_RECEIVED',entity:'LAB-001',loc:'Ranchi',ts:ts(4,11),hash:fakeHash('LABRCV-003'),prevHash:fakeHash('REG-003'),by:'Lab Technician'},
      {type:'LAB_TESTED',entity:'LAB-001',loc:'Ranchi',ts:ts(3,14),hash:fakeHash('LABTEST-003'),prevHash:fakeHash('LABRCV-003'),by:'Dr. Sunita Deshmukh',labResults:{Moisture:'16.8%',HMF:'8.5 mg/kg',Adulteration:'Not Detected',Pollen:'Passed','Sugar Profile':'Passed','C4 Sugar':'0.3%'}},
      {type:'LAB_VERIFIED',entity:'LAB-001',loc:'Ranchi',ts:ts(2,10),hash:fakeHash('LABVER-003'),prevHash:fakeHash('LABTEST-003'),by:'Dr. Sunita Deshmukh',labResultHash:fakeHash('LABRES-003')},
      {type:'DISTRIBUTOR_RECEIVED',entity:'DIST-001',loc:'Ranchi',ts:ts(1,8),hash:fakeHash('DISTRCV-003'),prevHash:fakeHash('LABVER-003'),by:'FreshChain Ops'},
    ]
  },
  'HNY-2026-000004': {
    bottleId:'HNY-2026-000004', batchId:'BATCH-2026-0045', farmId:'FARM-001',
    honeyType:'Acacia (Khair) Honey', harvestDate:d(6), bottlingDate:d(3), bottleQty:60, weightMl:500,
    preLabHash:fakeHash('HNY-2026-000004-BATCH-2026-0045'), currentStatus:'LAB_VERIFIED', qrUrl:'/trace/HNY-2026-000004',
    events:[
      {type:'REGISTERED',entity:'FARM-001',loc:'Jharkhand',ts:ts(3,9),hash:fakeHash('REG-004'),prevHash:null,by:'Farm Admin'},
      {type:'LAB_RECEIVED',entity:'LAB-001',loc:'Ranchi',ts:ts(2,11),hash:fakeHash('LABRCV-004'),prevHash:fakeHash('REG-004'),by:'Lab Technician'},
      {type:'LAB_TESTED',entity:'LAB-001',loc:'Ranchi',ts:ts(1,15),hash:fakeHash('LABTEST-004'),prevHash:fakeHash('LABRCV-004'),by:'Dr. Sunita Deshmukh',labResults:{Moisture:'17.9%',HMF:'11.0 mg/kg',Adulteration:'Not Detected',Pollen:'Passed','Sugar Profile':'Passed','C4 Sugar':'0.6%'}},
      {type:'LAB_VERIFIED',entity:'LAB-001',loc:'Ranchi',ts:ts(0,10),hash:fakeHash('LABVER-004'),prevHash:fakeHash('LABTEST-004'),by:'Dr. Sunita Deshmukh',labResultHash:fakeHash('LABRES-004')},
    ]
  },
  'HNY-2026-000005': {
    bottleId:'HNY-2026-000005', batchId:'BATCH-2026-0046', farmId:'FARM-002',
    honeyType:'Eucalyptus Wild Honey', harvestDate:d(2), bottlingDate:d(0), bottleQty:40, weightMl:500,
    preLabHash:fakeHash('HNY-2026-000005-BATCH-2026-0046'), currentStatus:'AWAITING_LAB_TEST', qrUrl:'/trace/HNY-2026-000005',
    events:[
      {type:'REGISTERED',entity:'FARM-002',loc:'Kashmir Valley',ts:ts(0,9),hash:fakeHash('REG-005'),prevHash:null,by:'Farm Admin'},
    ]
  }
};

let activeBottleId = null;
let currentRole = 'farm';

const STATUS_CFG = {
  'AWAITING_LAB_TEST':{label:'AWAITING LAB VERIFICATION',icon:'&#x23F3;',color:'var(--amber)',bg:'rgba(245,158,11,0.15)',pc:'sp-awaiting'},
  'LAB_TESTED':{label:'LAB TEST SUBMITTED',icon:'&#x1F9EA;',color:'var(--blue)',bg:'rgba(56,189,248,0.15)',pc:'sp-chain'},
  'LAB_VERIFIED':{label:'LAB VERIFIED',icon:'&#x2705;',color:'var(--emerald)',bg:'rgba(16,185,129,0.15)',pc:'sp-verified'},
  'IN_SUPPLY_CHAIN':{label:'IN SUPPLY CHAIN',icon:'&#x1F69A;',color:'var(--blue)',bg:'rgba(56,189,248,0.15)',pc:'sp-chain'},
  'RETAILER_RECEIVED':{label:'AT RETAILER',icon:'&#x1F3EA;',color:'var(--purple)',bg:'rgba(168,85,247,0.15)',pc:'sp-retailer'},
  'AVAILABLE':{label:'AVAILABLE / UNSOLD',icon:'&#x1F7E2;',color:'var(--emerald)',bg:'rgba(16,185,129,0.12)',pc:'sp-available'},
  'SOLD':{label:'SOLD',icon:'&#x1F534;',color:'var(--ruby)',bg:'rgba(239,68,68,0.12)',pc:'sp-sold'},
};
const EV_CFG = {
  'REGISTERED':{icon:'&#x1F331;',label:'Farm Registered',color:'var(--emerald)'},
  'LAB_RECEIVED':{icon:'&#x1F3E5;',label:'Lab Received',color:'var(--blue)'},
  'LAB_TESTED':{icon:'&#x1F9EA;',label:'Lab Tests Performed',color:'var(--blue)'},
  'LAB_VERIFIED':{icon:'&#x2705;',label:'Lab Result Verified',color:'var(--emerald)'},
  'DISTRIBUTOR_RECEIVED':{icon:'&#x1F69A;',label:'Distributor Received',color:'var(--gold)'},
  'TRANSPORTED':{icon:'&#x1F6FB;',label:'Transported',color:'var(--gold)'},
  'WAREHOUSE_RECEIVED':{icon:'&#x1F3ED;',label:'Warehouse Received',color:'var(--gold)'},
  'RETAILER_RECEIVED':{icon:'&#x1F3EA;',label:'Retailer Received',color:'var(--purple)'},
  'AVAILABLE':{icon:'&#x1F7E2;',label:'Available for Sale',color:'var(--emerald)'},
  'SOLD':{icon:'&#x1F6D2;',label:'Sold to Customer',color:'var(--ruby)'},
};

function scfg(s) { return STATUS_CFG[s]||{label:s,icon:'&#x25CF;',color:'var(--muted)',bg:'rgba(255,255,255,0.05)',pc:'sp-awaiting'}; }
function ecfg(t) { return EV_CFG[t]||{icon:'&#x25CF;',label:t,color:'var(--muted)'}; }
function ent(id) { return ENTITIES[id]||FARMS[id]||LABS[id]||{name:id}; }

function setRole(role) {
  currentRole = role;
  ['farm','lab','dist','retailer','admin'].forEach(r => document.getElementById('role-'+r).classList.toggle('active',r===role));
  if (activeBottleId) renderMain(activeBottleId);
  toast('Switched to '+role.toUpperCase()+' role','info','&#x1F464;');
}

function toast(msg,type,icon) {
  const w = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className='toast '+type;
  el.innerHTML='<span style="font-size:1.1rem;">'+icon+'</span><div><div style="font-weight:700;color:var(--text);margin-bottom:2px;">'+type.toUpperCase()+'</div><div style="color:var(--muted)">'+msg+'</div></div>';
  w.appendChild(el);
  setTimeout(()=>{el.style.opacity='0';el.style.transition='0.3s';setTimeout(()=>el.remove(),300);},3500);
}

function qrSvg(id, sz) {
  sz = sz||148;
  let s=0; for(const c of id) s=(s*31+c.charCodeAt(0))&0xffff;
  const rng=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};
  const cells=21, cell=sz/cells; let dots='';
  const pm=(x,y)=>'<rect x="'+(x*cell)+'" y="'+(y*cell)+'" width="'+(7*cell)+'" height="'+(7*cell)+'" fill="#000" rx="1"/><rect x="'+((x+1)*cell)+'" y="'+((y+1)*cell)+'" width="'+(5*cell)+'" height="'+(5*cell)+'" fill="#fff" rx="0.5"/><rect x="'+((x+2)*cell)+'" y="'+((y+2)*cell)+'" width="'+(3*cell)+'" height="'+(3*cell)+'" fill="#000" rx="0.5"/>';
  dots+=pm(0,0)+pm(14,0)+pm(0,14);
  for(let r=0;r<cells;r++) for(let c2=0;c2<cells;c2++){
    const im=(r<9&&c2<9)||(r<9&&c2>12)||(r>12&&c2<9);
    if(!im&&rng()>0.48) dots+='<rect x="'+(c2*cell)+'" y="'+(r*cell)+'" width="'+(cell*0.85)+'" height="'+(cell*0.85)+'" fill="#000" rx="0.5"/>';
  }
  return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 '+sz+' '+sz+'" xmlns="http://www.w3.org/2000/svg">'+dots+'</svg>';
}

function renderSidebar() {
  document.getElementById('sidebar-list').innerHTML = Object.values(BOTTLES).map(b=>{
    const sc=scfg(b.currentStatus);
    return '<div class="bottle-card '+(b.bottleId===activeBottleId?'active':'')+'" onclick="renderMain(\''+b.bottleId+'\')">'+
      '<div class="bc-id">'+b.bottleId+'</div><div class="bc-batch">'+b.batchId+'</div>'+
      '<div class="bc-type">'+b.honeyType+'</div>'+
      '<span class="status-pill '+sc.pc+'">'+sc.icon+' '+b.currentStatus+'</span></div>';
  }).join('');
}

function renderMain(bid) {
  activeBottleId = bid;
  const b = BOTTLES[bid]; if(!b) return;
  const sc = scfg(b.currentStatus);
  const farm = FARMS[b.farmId]||{};
  const labTestEv = b.events.find(e=>e.type==='LAB_TESTED');
  const labVerEv = b.events.find(e=>e.type==='LAB_VERIFIED');
  const regEv = b.events[0];

  let html = '<div class="status-banner" style="background:'+sc.bg+';border:1px solid '+sc.color+'40;">';
  html += '<div class="sb-icon">'+sc.icon+'</div>';
  html += '<div class="sb-body" style="flex:1;"><h2 style="color:'+sc.color+';">'+sc.label+'</h2>';
  html += '<div class="sb-id">'+b.bottleId+' &nbsp;&bull;&nbsp; '+b.batchId+'</div>';
  html += '<p>'+b.honeyType+' &nbsp;&bull;&nbsp; '+b.weightMl+'ml &nbsp;&bull;&nbsp; Bottled: '+b.bottlingDate+'</p></div>';
  html += '<div>'+getActionBtns(b)+'</div></div>';

  // Row 1: Bottle info + QR
  html += '<div class="panel-row wide">';
  html += '<div class="card"><div class="card-header"><div class="card-title">&#x1F36F; Bottle &amp; Farm Details</div><span class="card-badge">PostgreSQL Record</span></div>';
  html += '<div class="info-grid">';
  html += ii('Bottle ID','<span class="ii-value mono">'+b.bottleId+'</span>');
  html += ii('Batch ID','<span class="ii-value mono">'+b.batchId+'</span>');
  html += ii('Farm',farm.name||'—');
  html += ii('Farm ID',b.farmId);
  html += ii('Location',farm.location||'—');
  html += ii('Producer',farm.owner||'—');
  html += ii('Honey Type','<span class="ii-value gold">'+b.honeyType+'</span>');
  html += ii('Harvest Date',b.harvestDate);
  html += ii('Bottling Date',b.bottlingDate);
  html += ii('Batch Size',b.bottleQty+' bottles');
  html += '<div class="info-item" style="grid-column:1/-1;"><div class="ii-label">Pre-Lab Identity Hash (SHA-256)</div><div class="ii-value mono" style="font-size:0.72rem;word-break:break-all;">'+b.preLabHash+'</div></div>';
  html += ii('Registration',regEv?regEv.ts:'—');
  html += ii('Status','<span class="ii-value" style="color:'+sc.color+';">'+b.currentStatus+'</span>');
  html += '</div></div>';

  // QR card
  html += '<div class="card"><div class="card-header"><div class="card-title">&#x1F4F1; Permanent QR Code</div><span class="card-badge">Never Changes</span></div>';
  html += '<div class="qr-container"><div class="qr-box">'+qrSvg(b.bottleId,148)+'</div>';
  html += '<div style="font-size:0.7rem;color:var(--muted);text-align:center;">Scan URL (permanent):</div>';
  html += '<div class="qr-url">https://beehive-kvic.gov.in'+b.qrUrl+'</div>';
  html += '<div style="font-size:0.68rem;color:var(--dim);text-align:center;margin-top:6px;">This QR is printed once and never changes.<br>The <em>page it opens</em> updates with each lifecycle event.</div>';
  html += '<button class="btn btn-blue" style="margin-top:8px;" onclick="openPublicScan(\''+b.bottleId+'\')">&#x1F4F1; Simulate Customer Scan</button></div></div>';
  html += '</div>';

  // Row 2: Lab + Blockchain
  html += '<div class="panel-row">';
  html += renderLabCard(b, labTestEv, labVerEv);
  html += renderBCCard(b);
  html += '</div>';

  // Row 3: Timeline + Tamper
  html += '<div class="panel-row">';
  html += '<div class="card"><div class="card-header"><div class="card-title">&#x1F4CB; Append-Only Supply Chain Timeline</div><span class="card-badge">'+b.events.length+' Events</span></div>';
  html += '<div class="timeline">'+renderTimeline(b)+'</div></div>';
  html += renderTamperCard(b);
  html += '</div>';

  // Role panel
  html += renderRolePanel(b);

  document.getElementById('main-panel').innerHTML = html;
  renderSidebar();
}

function ii(label, val) {
  const v = val.startsWith('<') ? val : '<div class="ii-value">'+val+'</div>';
  return '<div class="info-item"><div class="ii-label">'+label+'</div>'+v+'</div>';
}

function renderLabCard(b, labTestEv, labVerEv) {
  if (!labTestEv) {
    let r = '<div class="card"><div class="card-header"><div class="card-title">&#x1F9EA; Laboratory Status</div></div>';
    r += '<div style="text-align:center;padding:30px 0;"><div style="font-size:2rem;margin-bottom:8px;">&#x23F3;</div>';
    r += '<div style="color:var(--amber);font-weight:700;">AWAITING LAB TEST</div>';
    r += '<div style="color:var(--muted);font-size:0.8rem;margin-top:6px;">Bottle registered. Lab not yet received it.</div>';
    if (currentRole==='lab') r += '<div style="margin-top:14px;"><button class="btn btn-blue" onclick="advanceToLabReceived(\''+b.bottleId+'\')">&#x1F4E5; Receive at Lab</button></div>';
    return r + '</div></div>';
  }
  const lr = labTestEv.labResults||{};
  const isVer = !!labVerEv;
  let r = '<div class="card"><div class="card-header"><div class="card-title">&#x1F9EA; NABL Laboratory Report</div>';
  r += '<span class="card-badge" style="color:'+(isVer?'var(--emerald)':'var(--amber)')+';">'+(isVer?'&#x2713; VERIFIED':'PENDING VERIFICATION')+'</span></div>';
  r += '<div class="info-grid" style="margin-bottom:10px;">';
  r += ii('Laboratory',LABS['LAB-001'].name)+ii('Accreditation',LABS['LAB-001'].accreditation);
  r += ii('Scientist',labTestEv.by)+ii('Test Time',labTestEv.ts);
  r += '</div>';
  r += '<div style="background:rgba(0,0,0,0.3);border-radius:var(--r);padding:12px;margin-bottom:10px;">';
  r += '<div style="font-size:0.7rem;color:var(--dim);text-transform:uppercase;margin-bottom:8px;font-weight:700;">Lab Test Results</div>';
  r += '<div class="form-grid2">';
  for (const [k,v] of Object.entries(lr)) {
    const isWarn = v.toLowerCase().includes('detected') && !v.toLowerCase().includes('not detected');
    r += '<div><div style="font-size:0.68rem;color:var(--muted);">'+k+'</div>';
    r += '<div style="font-size:0.82rem;font-weight:700;color:'+(isWarn?'var(--ruby)':'var(--emerald)')+';">'+v+'</div></div>';
  }
  r += '</div></div>';
  if (isVer) {
    r += '<div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:var(--r);padding:10px;">';
    r += '<div style="color:var(--emerald);font-weight:700;font-size:0.82rem;margin-bottom:4px;">&#x2713; LAB RESULT VERIFIED BY SCIENTIST</div>';
    r += '<div style="font-size:0.7rem;color:var(--muted);">Verified: '+labVerEv.ts+' by '+labVerEv.by+'</div>';
    r += '<div style="font-family:var(--mono);font-size:0.65rem;color:var(--emerald);margin-top:4px;word-break:break-all;">Lab Result Hash: '+labVerEv.labResultHash+'</div></div>';
  } else {
    r += '<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:var(--r);padding:10px;">';
    r += '<div style="color:var(--amber);font-weight:700;font-size:0.82rem;">&#x23F3; AWAITING SCIENTIST VERIFICATION</div>';
    if (currentRole==='lab') r += '<button class="btn btn-green" style="margin-top:8px;" onclick="advanceLabVerify(\''+b.bottleId+'\')">&#x2705; Verify Lab Test</button>';
    r += '</div>';
  }
  return r+'</div>';
}

function renderBCCard(b) {
  let r = '<div class="card"><div class="card-header"><div class="card-title">&#x26D3;&#xFE0F; Blockchain Audit Records</div><span class="card-badge">Immutable Ledger</span></div>';
  r += '<div style="max-height:340px;overflow-y:auto;">';
  b.events.forEach((ev,i) => {
    r += '<div class="bc-record"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
    r += '<div class="bc-event">'+ecfg(ev.type).icon+' '+ev.type+'</div>';
    r += '<span style="font-size:0.65rem;color:var(--dim);">Block #'+(1049280+i+1)+'</span></div>';
    r += '<div class="bc-hash">Event Hash: '+ev.hash+'</div>';
    if (ev.prevHash) r += '<div style="font-family:var(--mono);font-size:0.62rem;color:var(--dim);margin-top:1px;">Prev: '+ev.prevHash+'</div>';
    r += '<div class="bc-ts">'+ev.ts+' &nbsp;&bull;&nbsp; By: '+ev.by+'</div>';
    if (ev.labResultHash) r += '<div style="font-family:var(--mono);font-size:0.62rem;color:var(--blue);margin-top:1px;">Lab Result Hash: '+ev.labResultHash+'</div>';
    r += '</div>';
  });
  r += '</div><div style="margin-top:10px;padding:10px;background:rgba(0,0,0,0.3);border-radius:var(--r);font-size:0.72rem;">';
  r += '<div style="color:var(--gold2);font-weight:700;margin-bottom:4px;">Chain Integrity</div>';
  b.events.forEach(ev => { r += '<div style="display:flex;gap:6px;color:var(--muted);padding:2px 0;"><span style="color:var(--emerald);">&#x2713;</span> '+ev.type+' &mdash; hash anchored</div>'; });
  return r+'</div></div>';
}

function renderTimeline(b) {
  return b.events.map((ev,i) => {
    const ec = ecfg(ev.type);
    const e = ent(ev.entity);
    let extra = '';
    if (ev.saleId) extra = '<span class="tag tag-red">Sale ID: '+ev.saleId+'</span>';
    else if (ev.labResultHash) extra = '<span class="tag tag-green">Lab Hash Recorded</span>';
    return '<div class="tl-item"><div class="tl-dot" style="background:'+ec.color+';">'+(i+1)+'</div>'+
      '<div class="tl-content"><div class="tl-event-name" style="color:'+ec.color+';">'+ec.icon+' '+ec.label+'</div>'+
      '<div class="tl-meta">'+(e.name||ev.entity)+' &nbsp;&bull;&nbsp; '+ev.loc+'<br><span style="font-size:0.68rem;color:var(--dim);">By: '+ev.by+'</span></div>'+
      (extra?'<div style="margin-top:3px;">'+extra+'</div>':'')+
      '<div class="tl-hash">Event Hash: '+ev.hash+'</div>'+
      '<div style="font-size:0.68rem;color:var(--dim);margin-top:1px;">'+ev.ts+'</div></div></div>';
  }).join('');
}

function renderTamperCard(b) {
  const checks = b.events.map((ev,i)=>({type:ev.type,ok:ev.hash&&ev.hash.startsWith('0x'),chain:i===0||b.events[i].prevHash===b.events[i-1].hash}));
  const allOk = checks.every(c=>c.ok&&c.chain);
  let r = '<div class="card"><div class="card-header"><div class="card-title">&#x1F510; Tamper Detection</div>';
  r += '<span class="card-badge" style="color:'+(allOk?'var(--emerald)':'var(--ruby)')+';">'+(allOk?'ALL VERIFIED':'ISSUE DETECTED')+'</span></div>';
  r += '<div style="text-align:center;padding:14px 0;margin-bottom:14px;">';
  r += '<div style="font-size:2.5rem;">'+(allOk?'&#x2705;':'&#x26A0;&#xFE0F;')+'</div>';
  r += '<div style="font-weight:800;font-size:1.1rem;color:'+(allOk?'var(--emerald)':'var(--ruby)')+';">'+(allOk?'RECORD INTEGRITY CONFIRMED':'RECORD INTEGRITY ISSUE')+'</div>';
  r += '<div style="font-size:0.78rem;color:var(--muted);margin-top:4px;">Hash chain verification across '+b.events.length+' events</div></div>';
  r += '<div style="display:flex;flex-direction:column;gap:6px;">';
  checks.forEach(c => {
    r += '<div style="background:rgba(0,0,0,0.3);border-radius:6px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;font-size:0.76rem;">';
    r += '<span style="color:var(--muted);">'+c.type+'</span>';
    r += '<div style="display:flex;gap:8px;"><span style="color:'+(c.ok?'var(--emerald)':'var(--ruby)')+';">'+(c.ok?'&#x2713; Hash OK':'&#x2717; Hash FAIL')+'</span>';
    r += '<span style="color:'+(c.chain?'var(--emerald)':'var(--ruby)')+';">'+(c.chain?'&#x2713; Chain OK':'&#x2717; Chain Break')+'</span></div></div>';
  });
  r += '</div><div style="margin-top:12px;padding:10px;border-radius:var(--r);background:rgba(0,0,0,0.3);font-size:0.72rem;color:var(--muted);">';
  r += '<strong style="color:var(--gold2);">How it works:</strong> Each event includes a hash of its data + the previous event\'s hash. Any tampering with past events breaks the entire chain, making it cryptographically detectable.';
  if (currentRole==='admin') r += '<div class="action-row" style="margin-top:8px;"><button class="btn btn-ghost" onclick="simulateTamper(\''+b.bottleId+'\')">&#x1F9EA; Simulate Tamper Attack (Demo)</button></div>';
  return r+'</div></div>';
}

function renderRolePanel(b) {
  const s = b.currentStatus;
  if (currentRole==='farm') {
    const can = s==='AWAITING_LAB_TEST';
    return '<div class="card" style="border-color:rgba(16,185,129,0.3);">'+
      '<div class="card-header"><div class="card-title">&#x1F331; Farm Dashboard</div><span class="card-badge" style="color:var(--emerald);">FARM ROLE</span></div>'+
      '<div class="info-grid" style="margin-bottom:12px;">'+
        ii('Farm',FARMS[b.farmId]?.name)+ii('Bottles in Batch',b.bottleQty.toString())+
        ii('Pre-Lab Hash','<span class="ii-value green">&#x2713; Generated</span>')+ii('QR Printed','<span class="ii-value green">&#x2713; Permanent</span>')+
      '</div><div class="action-row">'+
      (can?'<button class="btn btn-gold" onclick="advanceToLabReceived(\''+b.bottleId+'\')">&#x1F4E6; Send to Laboratory</button>':'')+
      '<button class="btn btn-ghost" onclick="openPublicScan(\''+b.bottleId+'\')">&#x1F4F1; Preview Consumer View</button></div>'+
      (!can?'<div class="role-notice">Bottle already dispatched to Lab. No further farm actions required.</div>':'')+
      '</div>';
  }
  if (currentRole==='lab') {
    const canRcv = s==='AWAITING_LAB_TEST';
    const canVer = b.events.some(e=>e.type==='LAB_TESTED')&&!b.events.some(e=>e.type==='LAB_VERIFIED');
    const done = b.events.some(e=>e.type==='LAB_VERIFIED');
    return '<div class="card" style="border-color:rgba(56,189,248,0.3);">'+
      '<div class="card-header"><div class="card-title">&#x1F9EA; Laboratory Dashboard</div><span class="card-badge" style="color:var(--blue);">LAB ROLE</span></div>'+
      '<div class="action-row">'+
      (canRcv?'<button class="btn btn-blue" onclick="advanceToLabReceived(\''+b.bottleId+'\')">&#x1F4E5; Receive Bottle at Lab</button>':'')+
      (canVer?'<button class="btn btn-green" onclick="advanceLabVerify(\''+b.bottleId+'\')">&#x2705; Verify Lab Test Result</button>':'')+
      (done?'<div style="color:var(--emerald);font-weight:700;padding:8px;">&#x2713; Lab verification complete. Bottle released to supply chain.</div>':'')+
      ((!canRcv&&!canVer&&!done)?'<div style="color:var(--muted);padding:8px;font-size:0.8rem;">No lab actions available for current status.</div>':'')+
      '</div></div>';
  }
  if (currentRole==='dist') {
    const canRcv = s==='LAB_VERIFIED';
    const inChain = ['IN_SUPPLY_CHAIN','RETAILER_RECEIVED','AVAILABLE','SOLD'].includes(s);
    return '<div class="card" style="border-color:rgba(245,166,35,0.3);">'+
      '<div class="card-header"><div class="card-title">&#x1F69A; Distributor Dashboard</div><span class="card-badge" style="color:var(--gold2);">DISTRIBUTOR ROLE</span></div>'+
      '<div class="action-row">'+
      (canRcv?'<button class="btn btn-gold" onclick="advanceToDistributor(\''+b.bottleId+'\')">&#x1F4E6; Receive from Lab &mdash; Enter Supply Chain</button>':'')+
      (inChain&&s==='IN_SUPPLY_CHAIN'?'<button class="btn btn-blue" onclick="advanceToRetailer(\''+b.bottleId+'\')">&#x1F3EA; Send to Retailer</button>':'')+
      (!canRcv&&!inChain?'<div class="role-notice">Bottle not yet lab-verified or is past distributor stage.</div>':'')+
      '</div></div>';
  }
  if (currentRole==='retailer') {
    const canRcv = s==='IN_SUPPLY_CHAIN';
    const canMkAvail = s==='RETAILER_RECEIVED';
    const canSell = s==='AVAILABLE';
    const isSold = s==='SOLD';
    const soldEv = b.events.find(e=>e.type==='SOLD');
    return '<div class="card" style="border-color:rgba(168,85,247,0.3);">'+
      '<div class="card-header"><div class="card-title">&#x1F3EA; Retailer Dashboard</div><span class="card-badge" style="color:var(--purple);">RETAILER ROLE</span></div>'+
      '<div class="action-row">'+
      (canRcv?'<button class="btn btn-blue" onclick="advanceToRetailer(\''+b.bottleId+'\')">&#x1F4E5; Confirm Bottle Received</button>':'')+
      (canMkAvail?'<button class="btn btn-green" onclick="markAvailable(\''+b.bottleId+'\')">&#x1F7E2; Mark as Available</button>':'')+
      (canSell?'<button class="btn btn-red" onclick="markSold(\''+b.bottleId+'\')">&#x1F6D2; Mark as SOLD</button>':'')+
      (isSold?'<div style="color:var(--ruby);font-weight:700;padding:8px;">&#x1F534; SOLD &mdash; Sale ID: '+(soldEv?.saleId||'SALE-DEMO')+'</div>':'')+
      (!canRcv&&!canMkAvail&&!canSell&&!isSold?'<div class="role-notice">Bottle not yet at retailer stage.</div>':'')+
      '</div></div>';
  }
  if (currentRole==='admin') {
    const lat = b.events[b.events.length-1];
    return '<div class="card" style="border-color:rgba(168,85,247,0.3);">'+
      '<div class="card-header"><div class="card-title">&#x1F6E1; Admin / Audit Panel</div><span class="card-badge" style="color:var(--purple);">ADMIN ROLE</span></div>'+
      '<div class="info-grid">'+
        ii('Total Events',b.events.length.toString())+ii('Current Status',b.currentStatus)+
        '<div class="info-item"><div class="ii-label">Pre-Lab Hash</div><div class="ii-value mono" style="font-size:0.68rem;word-break:break-all;">'+b.preLabHash+'</div></div>'+
        '<div class="info-item"><div class="ii-label">Latest Event Hash</div><div class="ii-value mono" style="font-size:0.68rem;word-break:break-all;">'+lat.hash+'</div></div>'+
      '</div><div class="action-row" style="margin-top:10px;">'+
      '<button class="btn btn-ghost" onclick="simulateTamper(\''+b.bottleId+'\')">&#x1F9EA; Simulate Tamper (Demo)</button>'+
      '<button class="btn btn-ghost" onclick="openPublicScan(\''+b.bottleId+'\')">&#x1F4F1; View Consumer Page</button>'+
      '</div></div>';
  }
  return '';
}

function getActionBtns(b) {
  const s = b.currentStatus;
  if (s==='AWAITING_LAB_TEST'&&currentRole==='farm') return '<button class="btn btn-gold" onclick="advanceToLabReceived(\''+b.bottleId+'\')">&#x1F4E6; Send to Lab</button>';
  if (s==='LAB_VERIFIED'&&currentRole==='dist') return '<button class="btn btn-gold" onclick="advanceToDistributor(\''+b.bottleId+'\')">&#x1F69A; Receive at Distributor</button>';
  if (s==='IN_SUPPLY_CHAIN'&&currentRole==='retailer') return '<button class="btn btn-gold" onclick="advanceToRetailer(\''+b.bottleId+'\')">&#x1F3EA; Receive at Retailer</button>';
  if (s==='AVAILABLE'&&currentRole==='retailer') return '<button class="btn btn-red" onclick="markSold(\''+b.bottleId+'\')">&#x1F6D2; Mark SOLD</button>';
  return '<button class="btn btn-ghost" onclick="openPublicScan(\''+b.bottleId+'\')">&#x1F4F1; Scan QR</button>';
}

// ===== LIFECYCLE ADVANCEMENT =====
function advanceToLabReceived(id) {
  const b=BOTTLES[id]; if(!b) return;
  const prev=b.events[b.events.length-1].hash;
  const h1=fakeHash('LABRCV-'+id+Date.now()); const h2=fakeHash('LABTEST-'+id+Date.now());
  b.events.push({type:'LAB_RECEIVED',entity:'LAB-001',loc:'Ranchi, Jharkhand',ts:now(),hash:h1,prevHash:prev,by:'Lab Reception Desk'});
  b.events.push({type:'LAB_TESTED',entity:'LAB-001',loc:'Ranchi',ts:now(),hash:h2,prevHash:h1,by:'Dr. Sunita Deshmukh',
    labResults:{Moisture:'17.5%',HMF:'13.2 mg/kg',Adulteration:'Not Detected',Pollen:'Passed','Sugar Profile':'Passed','C4 Sugar':'0.7%'}});
  b.currentStatus='LAB_TESTED';
  toast('Bottle received & tested at laboratory. Awaiting scientist verification.','success','&#x1F9EA;');
  renderMain(id);
}
function advanceLabVerify(id) {
  const b=BOTTLES[id]; if(!b) return;
  const prev=b.events[b.events.length-1].hash;
  const lrh=fakeHash('LABRES-'+id+Date.now()); const h=fakeHash('LABVER-'+id+Date.now());
  b.events.push({type:'LAB_VERIFIED',entity:'LAB-001',loc:'Ranchi',ts:now(),hash:h,prevHash:prev,by:'Dr. Sunita Deshmukh',labResultHash:lrh});
  b.currentStatus='LAB_VERIFIED';
  toast('Lab test VERIFIED &#x2713; &mdash; Lab Result Hash generated and recorded on blockchain.','success','&#x2705;');
  renderMain(id);
}
function advanceToDistributor(id) {
  const b=BOTTLES[id]; if(!b) return;
  const prev=b.events[b.events.length-1].hash; const h=fakeHash('DISTRCV-'+id+Date.now());
  b.events.push({type:'DISTRIBUTOR_RECEIVED',entity:'DIST-001',loc:'Ranchi, Jharkhand',ts:now(),hash:h,prevHash:prev,by:'FreshChain Ops Manager'});
  b.currentStatus='IN_SUPPLY_CHAIN';
  toast('Bottle entered supply chain &mdash; received by FreshChain Distributors.','info','&#x1F69A;');
  renderMain(id);
}
function advanceToRetailer(id) {
  const b=BOTTLES[id]; if(!b) return;
  const prev=b.events[b.events.length-1].hash; const h=fakeHash('RETAIL-'+id+Date.now());
  b.events.push({type:'RETAILER_RECEIVED',entity:'RETAIL-001',loc:'Jamshedpur, Jharkhand',ts:now(),hash:h,prevHash:prev,by:'ABC Honey Store Manager'});
  b.currentStatus='RETAILER_RECEIVED';
  toast('Bottle received at retailer: ABC Honey Store, Jamshedpur.','success','&#x1F3EA;');
  renderMain(id);
}
function markAvailable(id) {
  const b=BOTTLES[id]; if(!b) return;
  const prev=b.events[b.events.length-1].hash; const h=fakeHash('AVAIL-'+id+Date.now());
  b.events.push({type:'AVAILABLE',entity:'RETAIL-001',loc:'Jamshedpur, Jharkhand',ts:now(),hash:h,prevHash:prev,by:'Store Manager'});
  b.currentStatus='AVAILABLE';
  toast('Bottle marked AVAILABLE on shelf.','success','&#x1F7E2;');
  renderMain(id);
}
function markSold(id) {
  const b=BOTTLES[id]; if(!b) return;
  const prev=b.events[b.events.length-1].hash;
  const sid='SALE-'+Math.floor(Math.random()*90000+10000); const h=fakeHash('SOLD-'+id+Date.now());
  b.events.push({type:'SOLD',entity:'RETAIL-001',loc:'Jamshedpur, Jharkhand',ts:now(),hash:h,prevHash:prev,by:'Cashier',saleId:sid});
  b.currentStatus='SOLD';
  toast('&#x1F6D2; Bottle SOLD! Sale ID: '+sid+'. History preserved, status updated.','success','&#x1F389;');
  renderMain(id);
}
function simulateTamper(id) {
  toast('&#x1F510; Tamper simulation: Modified a past event hash. Chain integrity check FAILED for event #3. System flagged &mdash; original records preserved on blockchain.','warn','&#x26A0;&#xFE0F;');
}
function now() { return new Date().toISOString().replace('T',' ').substring(0,19)+' IST'; }

// ===== PUBLIC CONSUMER SCAN MODAL =====
function openPublicScan(id) {
  if (!id) { toast('Select a bottle first','warn','&#x26A0;&#xFE0F;'); return; }
  const b=BOTTLES[id]; if(!b) return;
  const sc=scfg(b.currentStatus);
  const farm=FARMS[b.farmId]||{};
  const labTestEv=b.events.find(e=>e.type==='LAB_TESTED');
  const labVerEv=b.events.find(e=>e.type==='LAB_VERIFIED');
  const distEv=b.events.find(e=>e.type==='DISTRIBUTOR_RECEIVED');
  const wEv=b.events.find(e=>e.type==='WAREHOUSE_RECEIVED');
  const retailEv=b.events.find(e=>e.type==='RETAILER_RECEIVED');
  const soldEv=b.events.find(e=>e.type==='SOLD');
  const regEv=b.events[0];

  const sh=document.getElementById('pm-shield');
  sh.innerHTML=sc.icon; sh.style.background=sc.bg; sh.style.border='2px solid '+sc.color;
  document.getElementById('pm-bottle-id').textContent=b.bottleId;
  document.getElementById('pm-status-label').textContent=sc.label;
  document.getElementById('pm-status-label').style.color=sc.color;

  const tlItems=[
    {done:true,icon:'&#x1F331;',title:'Farm Origin',meta:farm.name+'<br>'+farm.location+'<br>Harvested: '+b.harvestDate+'<br>Bottled: '+b.bottlingDate},
    {done:true,icon:'&#x1F510;',title:'Pre-Lab Identity Registered',meta:'Pre-Lab Hash: '+b.preLabHash.substring(0,22)+'...<br>Registered: '+regEv.ts},
  ];
  if (labVerEv) {
    tlItems.push({done:true,icon:'&#x1F9EA;',title:'Laboratory Verified &#x2713;',
      meta:LABS['LAB-001'].name+'<br>Test: '+(labTestEv?.ts||'—')+'<br>Verified: '+labVerEv.ts+'<br>Moisture: '+(labTestEv?.labResults?.Moisture||'—')+', HMF: '+(labTestEv?.labResults?.HMF||'—')+'<br>Adulteration: '+(labTestEv?.labResults?.Adulteration||'—')});
  } else if (labTestEv) {
    tlItems.push({done:false,icon:'&#x1F9EA;',title:'Lab Test Submitted (Awaiting Verification)',meta:LABS['LAB-001'].name+'<br>Test: '+labTestEv.ts});
  } else {
    tlItems.push({done:false,icon:'&#x1F9EA;',title:'Laboratory Testing Pending',meta:'Bottle not yet tested'});
  }
  if (distEv) tlItems.push({done:true,icon:'&#x1F69A;',title:'Distributor Received',meta:ENTITIES['DIST-001'].name+'<br>'+distEv.loc+'<br>'+distEv.ts});
  if (wEv) tlItems.push({done:true,icon:'&#x1F3ED;',title:'Warehouse Received',meta:ENTITIES['WH-001'].name+'<br>'+wEv.loc+'<br>'+wEv.ts});
  if (retailEv) tlItems.push({done:true,icon:'&#x1F3EA;',title:'Retailer Received',meta:ENTITIES['RETAIL-001'].name+'<br>'+retailEv.loc+'<br>'+retailEv.ts});
  if (soldEv) tlItems.push({done:true,icon:'&#x1F6D2;',title:'SOLD',meta:ENTITIES['RETAIL-001'].name+'<br>'+soldEv.loc+'<br>Sold: '+soldEv.ts+'<br>Sale ID: '+soldEv.saleId});
  else if (b.currentStatus==='AVAILABLE') tlItems.push({done:true,icon:'&#x1F7E2;',title:'AVAILABLE / UNSOLD',meta:(ENTITIES['RETAIL-001']?.name||'—')+'<br>Currently on shelf'});

  let sold_warn='';
  if (b.currentStatus==='SOLD') {
    sold_warn='<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:var(--r);padding:12px;margin-bottom:14px;">';
    sold_warn+='<div style="color:var(--ruby);font-weight:700;font-size:0.82rem;margin-bottom:4px;">&#x26A0;&#xFE0F; NOTICE: This bottle has already been SOLD</div>';
    sold_warn+='<div style="font-size:0.75rem;color:var(--muted);">Original sale recorded at: '+soldEv.loc+', '+soldEv.ts+'.</div></div>';
  }

  const bcChecks=[
    {label:'Bottle identity recorded',done:true},
    {label:'Pre-lab hash anchored',done:true},
    {label:'Laboratory verification recorded',done:!!labVerEv},
    {label:'Supply-chain events recorded',done:!!distEv},
    {label:'Retailer receipt recorded',done:!!retailEv},
    {label:'Sale event recorded',done:!!soldEv},
  ];

  const lat=b.events[b.events.length-1];
  const allEntNames=[...new Set(b.events.map(e=>(ent(e.entity).name||e.entity)))].join(' &#x2192; ');
  const allLocs=[...new Set(b.events.map(e=>e.loc))].join(' &#x2192; ');

  let body=sold_warn;
  body+='<div class="pm-section"><div class="pm-section-title">Complete Lifecycle Timeline</div><div class="pm-tl">';
  tlItems.forEach(item=>{
    body+='<div class="pm-tl-item"><div class="pm-dot '+(item.done?'done':'pending')+'">'+item.icon+'</div>';
    body+='<div class="pm-tl-body"><div class="pm-ev-name" style="color:'+(item.done?'var(--text)':'var(--amber)')+';">'+item.title+'</div>';
    body+='<div class="pm-ev-meta">'+item.meta+'</div></div></div>';
  });
  body+='</div></div>';

  body+='<div class="pm-section"><div class="pm-section-title">Blockchain Verification</div><div class="bc-verify-box">';
  bcChecks.forEach(c=>{
    body+='<div class="bc-verify-row"><span class="'+(c.done?'check':'warn')+'">'+(c.done?'&#x2713;':'&#x25CB;')+'</span><span style="color:'+(c.done?'var(--text)':'var(--dim)')+';">'+c.label+'</span></div>';
  });
  body+='<div style="border-top:1px solid rgba(255,255,255,0.08);margin-top:8px;padding-top:8px;font-size:0.7rem;">';
  body+='<div style="color:var(--muted);">Network: BeeHive Consortium Blockchain</div>';
  body+='<div style="color:var(--muted);">Last Block: #'+(1049280+b.events.length)+'</div>';
  body+='<div style="color:var(--emerald);font-family:var(--mono);font-size:0.65rem;word-break:break-all;margin-top:4px;">Latest Hash: '+lat.hash+'</div></div></div></div>';

  body+='<div class="pm-section"><div class="pm-section-title">12 Traceability Answers</div>';
  body+='<div style="font-size:0.75rem;line-height:2;color:var(--muted);">';
  body+='1. Farm: <strong style="color:var(--text);">'+farm.name+', '+farm.location+'</strong><br>';
  body+='2. Batch: <strong style="color:var(--text);">'+b.batchId+'</strong><br>';
  body+='3. Harvested/Bottled: <strong style="color:var(--text);">'+b.harvestDate+' / '+b.bottlingDate+'</strong><br>';
  body+='4. Lab tested? <strong style="color:'+(labTestEv?'var(--emerald)':'var(--amber)')+';">'+(labTestEv?'&#x2713; YES':'NOT YET')+'</strong><br>';
  body+='5. Lab verified? <strong style="color:'+(labVerEv?'var(--emerald)':'var(--amber)')+';">'+(labVerEv?'&#x2713; YES':'NOT YET')+'</strong><br>';
  body+='6. Organizations: <strong style="color:var(--text);">'+allEntNames+'</strong><br>';
  body+='7. Route: <strong style="color:var(--text);">'+allLocs+'</strong><br>';
  body+='8. Retailer: <strong style="color:var(--text);">'+(retailEv?ENTITIES['RETAIL-001'].name:'Not yet at retailer')+'</strong><br>';
  body+='9. Retailer location: <strong style="color:var(--text);">'+(retailEv?ENTITIES['RETAIL-001'].location:'&mdash;')+'</strong><br>';
  body+='10. Already sold? <strong style="color:'+(soldEv?'var(--ruby)':'var(--emerald)')+';">'+(soldEv?'&#x1F534; YES':'&#x1F7E2; NO')+'</strong><br>';
  body+='11. When sold: <strong style="color:var(--text);">'+(soldEv?soldEv.ts:'&mdash;')+'</strong><br>';
  body+='12. Blockchain verified: <strong style="color:var(--emerald);">&#x2713; YES &mdash; '+b.events.length+' immutable records</strong>';
  body+='</div></div>';

  document.getElementById('pm-body').innerHTML=body;
  document.getElementById('modal-public-scan').classList.remove('hidden');
}

function closePublicScan() { document.getElementById('modal-public-scan').classList.add('hidden'); }
document.getElementById('modal-public-scan').addEventListener('click',e=>{ if(e.target===document.getElementById('modal-public-scan')) closePublicScan(); });

// ===== INIT =====
renderSidebar();
renderMain('HNY-2026-000001');
</script>
</body>
</html>"""

with open('trace-demo.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Written {len(html)} bytes to trace-demo.html")
