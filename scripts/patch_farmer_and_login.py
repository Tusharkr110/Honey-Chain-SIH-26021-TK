with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# =========================================================================
# 1. ADD ADMIN IN LOGIN PAGE (Image 3)
# =========================================================================
old_role_grid = '''          <!-- Two Side-by-side Role Cards -->
          <div class="role-cards-grid" role="tablist">
            <div class="role-card-item selected" id="tab-farmer" data-role="farmer" role="tab" aria-selected="true">
              <span class="role-card-icon">🌾</span>
              <span class="role-card-title" data-i18n="roleFarmer">Farmer / Beekeeper</span>
              <span class="role-card-sub" data-i18n="roleFarmerHi">किसान / मधुमक्खी पालक</span>
            </div>
            <div class="role-card-item" id="tab-kvic" data-role="kvic" role="tab" aria-selected="false">
              <span class="role-card-icon">🏛️</span>
              <span class="role-card-title" data-i18n="roleAdmin">Admin / KVIC Officer</span>
              <span class="role-card-sub" data-i18n="roleAdminHi">प्रशासक / केवीआईसी अधिकारी</span>
            </div>
            <!-- Hidden tab-admin reference for backward-compatibility with app.js -->
            <button id="tab-admin" data-role="admin" style="display: none;"></button>
          </div>'''

new_role_grid = '''          <!-- Three Role Cards: Farmer, KVIC Officer, Consortium Admin -->
          <div class="role-cards-grid" role="tablist">
            <div class="role-card-item selected" id="tab-farmer" data-role="farmer" role="tab" aria-selected="true">
              <span class="role-card-icon">🌾</span>
              <span class="role-card-title" data-i18n="roleFarmer">Farmer / Beekeeper</span>
              <span class="role-card-sub" data-i18n="roleFarmerHi">किसान / मधुमक्खी पालक</span>
            </div>
            <div class="role-card-item" id="tab-kvic" data-role="kvic" role="tab" aria-selected="false">
              <span class="role-card-icon">🏛️</span>
              <span class="role-card-title" data-i18n="roleKvic">KVIC Officer</span>
              <span class="role-card-sub" data-i18n="roleKvicHi">केवीआईसी अधिकारी</span>
            </div>
            <div class="role-card-item" id="tab-admin" data-role="admin" role="tab" aria-selected="false">
              <span class="role-card-icon">🛡️</span>
              <span class="role-card-title" data-i18n="roleAdmin">Consortium Admin</span>
              <span class="role-card-sub" data-i18n="roleAdminHi">सुपर एडमिन / प्रशासक</span>
            </div>
          </div>'''

html = html.replace(old_role_grid, new_role_grid)

# Update Direct Portal Access chips to 3 chips (Farmer, KVIC, Admin)
old_direct_access = '''            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div class="cred-chip" id="fill-cred-farmer-approved" style="background: var(--surface-tint); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px; cursor: pointer;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--text);">🌾 Ramesh Patel</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">9876543210</div>
              </div>
              <div class="cred-chip" id="fill-cred-kvic" style="background: var(--surface-tint); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px; cursor: pointer;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--text);">🏛️ KVIC Officer</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">kvic.officer</div>
              </div>
            </div>'''

new_direct_access = '''            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
              <div class="cred-chip" id="fill-cred-farmer-approved" style="background: var(--surface-tint); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px; cursor: pointer;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--text);">🌾 Ramesh Patel</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">9876543210</div>
              </div>
              <div class="cred-chip" id="fill-cred-kvic" style="background: var(--surface-tint); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px; cursor: pointer;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--text);">🏛️ KVIC Officer</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">kvic.officer</div>
              </div>
              <div class="cred-chip" id="fill-cred-admin" style="background: var(--surface-tint); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px; cursor: pointer;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--text);">🛡️ Super Admin</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">admin@beehive</div>
              </div>
            </div>'''

html = html.replace(old_direct_access, new_direct_access)

# =========================================================================
# 2. REMOVE TOPBAR ACTIONS & 3. INCLUDE WORKING IN ALL 6 FARMER TABS
# =========================================================================
start_idx = html.find('<section id="view-farmer-dashboard"')
end_idx = html.find('</section>', start_idx) + len('</section>')

new_farmer_dashboard = '''    <section id="view-farmer-dashboard" class="farmer-dashboard-view" style="display: none;">
      <div class="farmer-layout farmer-layout-notabs">
        <!-- Horizontal Tab-Bar (6 Working Tabs) -->
        <div class="farmer-tab-bar" role="tablist">
          <button type="button" class="farmer-tab-btn active" data-sidebar-tab="dash" role="tab">
            <span>📊</span> <span data-i18n="sideDashboard">Dashboard</span>
          </button>
          <button type="button" class="farmer-tab-btn" data-sidebar-tab="hives" id="farmer-sidebar-hives" role="tab">
            <span>📦</span> <span data-i18n="sideHives">My Hives</span>
          </button>
          <button type="button" class="farmer-tab-btn" data-sidebar-tab="harvest" id="farmer-sidebar-harvest" role="tab">
            <span>🍯</span> <span data-i18n="sideHarvest">Add Harvest</span>
          </button>
          <button type="button" class="farmer-tab-btn" data-sidebar-tab="batches" id="farmer-sidebar-batches" role="tab">
            <span>📜</span> <span data-i18n="sideBatches">My Batches</span>
          </button>
          <button type="button" class="farmer-tab-btn" data-sidebar-tab="market" role="tab">
            <span>🏷️</span> <span data-i18n="sideMarket">Sell Honey</span>
          </button>
          <button type="button" class="farmer-tab-btn" data-sidebar-tab="inspection" role="tab">
            <span>🛡️</span> <span data-i18n="sideInspection">Inspection</span>
          </button>
        </div>

        <!-- Main Content Area -->
        <div class="farmer-main-content">
          <!-- Topbar (Redundant actions removed as requested in Image 2) -->
          <div class="farmer-topbar">
            <div class="farmer-greeting-group">
              <h2>Good morning, <span id="dash-farmer-name">Ramesh Patel</span></h2>
              <div class="farmer-cluster-pin">
                <span>📍</span>
                <span>Anand District Cluster • Monitored Sentinel Hives</span>
                <span class="status-chip normal" style="font-size: 0.68rem; margin-left: 8px;">KVIC VERIFIED</span>
              </div>
            </div>
          </div>

          <!-- ==========================================
               SUBVIEW 1: DASHBOARD OVERVIEW (TAB: DASH)
               ========================================== -->
          <div id="farmer-subview-dash">
            <!-- Sentinel Hive Cards Row -->
            <div class="sentinel-hives-row">
              <div class="sentinel-hive-card">
                <div class="sentinel-header">
                  <span class="sentinel-title">Temperature</span>
                  <span class="status-chip normal" style="padding: 1px 6px; font-size: 0.65rem;">NORMAL</span>
                </div>
                <div class="sentinel-val" id="iot-core-temp">35.1 °C</div>
                <div class="sentinel-footer">
                  <span>Brood nest target: 34–36°C</span>
                </div>
              </div>

              <div class="sentinel-hive-card">
                <div class="sentinel-header">
                  <span class="sentinel-title">Humidity</span>
                  <span class="status-chip normal" style="padding: 1px 6px; font-size: 0.65rem;">NORMAL</span>
                </div>
                <div class="sentinel-val" id="iot-hive-humidity">58.4 %</div>
                <div class="sentinel-footer">
                  <span>Optimal honey capping</span>
                </div>
              </div>

              <div class="sentinel-hive-card">
                <div class="sentinel-header">
                  <span class="sentinel-title">Weight</span>
                  <span class="status-chip normal" style="padding: 1px 6px; font-size: 0.65rem;">NORMAL</span>
                </div>
                <div class="sentinel-val" id="iot-weight">46.2 kg</div>
                <div class="sentinel-footer">
                  <span id="iot-weight-status">Honeycomb supers active</span>
                </div>
              </div>

              <div class="sentinel-hive-card">
                <div class="sentinel-header">
                  <span class="sentinel-title">Signal</span>
                  <span class="status-chip normal" style="padding: 1px 6px; font-size: 0.65rem;">STRONG</span>
                </div>
                <div class="sentinel-val">LoRaWAN</div>
                <div class="sentinel-footer">
                  <span>Gateway RSSI: -68 dBm</span>
                </div>
              </div>

              <div class="sentinel-hive-card">
                <div class="sentinel-header">
                  <span class="sentinel-title">Last Sync</span>
                  <span class="status-chip normal" style="padding: 1px 6px; font-size: 0.65rem;">ACTIVE</span>
                </div>
                <div class="sentinel-val" style="font-size: 1.1rem;">Just now</div>
                <div class="sentinel-footer">
                  <span>Auto-sync interval: 30s</span>
                </div>
              </div>
            </div>

            <!-- Peach Alert Card + Range Chart Layout -->
            <div class="dashboard-alert-chart-grid">
              <div class="peach-alert-card">
                <div>
                  <h4>Apiary Foraging Advisory</h4>
                  <p>Nectar flow is peaking across Anand mustard groves. Core temperature and humidity are in ideal balance. Prepare supers for extraction within 48 hours.</p>
                </div>
                <button type="button" class="btn-primary" id="btn-open-log-batch" style="align-self: flex-start;">
                  <span>+</span> Log New Honey Batch
                </button>
              </div>

              <div class="range-chart-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <strong style="font-size: 0.88rem; color: var(--text);">Colony Scale Trajectory (7 Days)</strong>
                  <span class="status-chip normal" style="font-size: 0.65rem;">NORMAL BAND</span>
                </div>
                <svg viewBox="0 0 400 120" style="width: 100%; height: 110px;">
                  <rect x="0" y="25" width="400" height="50" fill="rgba(232, 163, 23, 0.12)" rx="4"/>
                  <line x1="0" y1="25" x2="400" y2="25" stroke="var(--primary)" stroke-dasharray="4,4" stroke-width="1" opacity="0.6"/>
                  <line x1="0" y1="75" x2="400" y2="75" stroke="var(--primary)" stroke-dasharray="4,4" stroke-width="1" opacity="0.6"/>
                  <path d="M 0,90 Q 60,82 120,70 T 240,48 T 320,38 T 400,32" fill="none" stroke="var(--primary)" stroke-width="2.5"/>
                  <circle cx="0" cy="90" r="3.5" fill="var(--primary)"/>
                  <circle cx="120" cy="70" r="3.5" fill="var(--primary)"/>
                  <circle cx="240" cy="48" r="3.5" fill="var(--primary)"/>
                  <circle cx="400" cy="32" r="4.5" fill="var(--success)"/>
                </svg>
                <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
                  <span>Mon (41kg)</span>
                  <span>Wed (43kg)</span>
                  <span>Fri (45kg)</span>
                  <span style="color: var(--success); font-weight: 700;">Today (46.2kg - Extraction Ready)</span>
                </div>
              </div>
            </div>

            <!-- Quick Action Cards Row -->
            <div class="quick-actions-row">
              <div class="quick-action-card" id="quick-act-add-harvest">
                <div class="quick-action-info">
                  <span class="card-icon-circle" style="width: 38px; height: 38px; margin: 0; font-size: 1.1rem;">🍯</span>
                  <div>
                    <strong style="font-size: 0.92rem; color: var(--text);">Add Harvest</strong>
                    <div style="font-size: 0.74rem; color: var(--text-muted);">Mint batch on blockchain</div>
                  </div>
                </div>
                <span class="quick-action-chevron">→</span>
              </div>

              <div class="quick-action-card" id="quick-act-batches">
                <div class="quick-action-info">
                  <span class="card-icon-circle" style="width: 38px; height: 38px; margin: 0; font-size: 1.1rem;">📜</span>
                  <div>
                    <strong style="font-size: 0.92rem; color: var(--text);">My Batches</strong>
                    <div style="font-size: 0.74rem; color: var(--text-muted);">View QR digital passports</div>
                  </div>
                </div>
                <span class="quick-action-chevron">→</span>
              </div>

              <div class="quick-action-card" id="quick-act-sell">
                <div class="quick-action-info">
                  <span class="card-icon-circle" style="width: 38px; height: 38px; margin: 0; font-size: 1.1rem;">🏷️</span>
                  <div>
                    <strong style="font-size: 0.92rem; color: var(--text);">Sell Honey</strong>
                    <div style="font-size: 0.74rem; color: var(--text-muted);">Direct to KVIC market</div>
                  </div>
                </div>
                <span class="quick-action-chevron">→</span>
              </div>

              <div class="quick-action-card" id="quick-act-inspection">
                <div class="quick-action-info">
                  <span class="card-icon-circle" style="width: 38px; height: 38px; margin: 0; font-size: 1.1rem;">🛡️</span>
                  <div>
                    <strong style="font-size: 0.92rem; color: var(--text);">Inspection</strong>
                    <div style="font-size: 0.74rem; color: var(--text-muted);">NABL sample & KVIC verification</div>
                  </div>
                </div>
                <span class="quick-action-chevron">→</span>
              </div>
            </div>
          </div>

          <!-- ==========================================
               SUBVIEW 2: MY HIVES & IOT TELEMETRY (TAB: HIVES)
               ========================================== -->
          <div id="farmer-subview-hives" style="display: none;">
            <div class="panel-card" style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap:wrap; gap:10px;">
                <div>
                  <h3 style="font-size: 1.15rem; font-weight:800;">📦 Smart Apiary Colonies &amp; Live IoT Scale Telemetry</h3>
                  <p style="font-size: 0.82rem; color: var(--text-muted); margin: 2px 0 0 0;">Anand District Apiary #4 &bull; LoRaWAN Gateway Connected</p>
                </div>
                <span class="status-chip normal">● PostgreSQL Live Stream</span>
              </div>

              <!-- 3 Monitored Hive Cards Grid -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-bottom: 20px;">
                <!-- Hive 1 -->
                <div style="background: var(--surface-tint); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 14px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <strong style="font-size:0.95rem;">🐝 Hive HIVE-ALPHA-01</strong>
                    <span class="status-chip normal" style="font-size:0.65rem;">MONITORED</span>
                  </div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.8rem; margin-bottom:10px;">
                    <div><span style="color:var(--text-muted);">Scale Weight:</span> <strong style="font-family:var(--font-mono);" id="dash-weight-display">46.4 kg</strong></div>
                    <div><span style="color:var(--text-muted);">Brood Temp:</span> <strong style="color:#38bdf8; font-family:var(--font-mono);">35.1 °C</strong></div>
                    <div><span style="color:var(--text-muted);">Humidity:</span> <strong style="font-family:var(--font-mono);">58.4 %</strong></div>
                    <div><span style="color:var(--text-muted);">Acoustic Freq:</span> <strong style="color:var(--primary); font-family:var(--font-mono);">215 Hz</strong></div>
                  </div>
                  <div style="font-size:0.74rem; color:var(--success); font-weight:600;">✓ Colony Harmonized &bull; Super Extraction Ready</div>
                </div>

                <!-- Hive 2 -->
                <div style="background: var(--surface-tint); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 14px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <strong style="font-size:0.95rem;">🐝 Hive HIVE-BETA-02</strong>
                    <span class="status-chip normal" style="font-size:0.65rem;">MONITORED</span>
                  </div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.8rem; margin-bottom:10px;">
                    <div><span style="color:var(--text-muted);">Scale Weight:</span> <strong style="font-family:var(--font-mono);">42.8 kg</strong></div>
                    <div><span style="color:var(--text-muted);">Brood Temp:</span> <strong style="color:#38bdf8; font-family:var(--font-mono);">34.9 °C</strong></div>
                    <div><span style="color:var(--text-muted);">Humidity:</span> <strong style="font-family:var(--font-mono);">59.1 %</strong></div>
                    <div><span style="color:var(--text-muted);">Acoustic Freq:</span> <strong style="color:var(--primary); font-family:var(--font-mono);">220 Hz</strong></div>
                  </div>
                  <div style="font-size:0.74rem; color:var(--success); font-weight:600;">✓ Active Foraging &bull; Stable Brood State</div>
                </div>

                <!-- Hive 3 -->
                <div style="background: var(--surface-tint); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 14px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <strong style="font-size:0.95rem;">🐝 Hive HIVE-GAMMA-03</strong>
                    <span class="status-chip normal" style="font-size:0.65rem;">MONITORED</span>
                  </div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.8rem; margin-bottom:10px;">
                    <div><span style="color:var(--text-muted);">Scale Weight:</span> <strong style="font-family:var(--font-mono);">38.5 kg</strong></div>
                    <div><span style="color:var(--text-muted);">Brood Temp:</span> <strong style="color:#38bdf8; font-family:var(--font-mono);">35.0 °C</strong></div>
                    <div><span style="color:var(--text-muted);">Humidity:</span> <strong style="font-family:var(--font-mono);">57.2 %</strong></div>
                    <div><span style="color:var(--text-muted);">Acoustic Freq:</span> <strong style="color:var(--primary); font-family:var(--font-mono);">210 Hz</strong></div>
                  </div>
                  <div style="font-size:0.74rem; color:var(--success); font-weight:600;">✓ Steady Brood Growth &bull; Healthy Comb Flow</div>
                </div>
              </div>

              <!-- MongoDB Acoustic FFT Engine Box -->
              <div style="background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap:wrap; gap:8px;">
                  <strong style="font-size: 0.9rem; color: var(--text);">MongoDB Bio-Acoustic FFT Spectrum (Apiary #4)</strong>
                  <span class="status-chip normal" style="font-size: 0.65rem;">MongoDB 8.2 JSON Engine</span>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px;">
                  <div style="background: var(--surface-tint); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                    <div style="font-size: 0.7rem; color: var(--text-muted);">Dominant Frequency</div>
                    <strong style="color: var(--primary); font-family: var(--font-mono);" id="mongo-acoustic-freq">215.0 Hz</strong>
                  </div>
                  <div style="background: var(--surface-tint); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                    <div style="font-size: 0.7rem; color: var(--text-muted);">Decibels</div>
                    <strong style="font-family: var(--font-mono);" id="mongo-decibel">48.2 dB</strong>
                  </div>
                  <div style="background: var(--surface-tint); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                    <div style="font-size: 0.7rem; color: var(--text-muted);">Queen Piping</div>
                    <strong style="color: var(--success);" id="mongo-queen-piping">NEGATIVE</strong>
                  </div>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <button type="button" class="btn-secondary" id="btn-simulate-swarm-spike" style="height: 38px; font-size: 0.82rem;">
                    ⚡ Ingest Bio-Acoustic Surge
                  </button>
                  <button type="button" class="btn-secondary" id="btn-view-raw-mongo-doc" style="height: 38px; font-size: 0.82rem;">
                    📄 View MongoDB JSON Document
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ==========================================
               SUBVIEW 3: ADD HARVEST & BLOCKCHAIN MINT (TAB: HARVEST)
               ========================================== -->
          <div id="farmer-subview-harvest" style="display: none;">
            <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 20px;">
              <!-- Harvest Minting Form -->
              <div class="panel-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                  <h3 style="font-size:1.15rem; font-weight:800;">🍯 Mint New Honey Batch to Blockchain</h3>
                  <span class="status-chip normal" style="font-size:0.7rem;">KVIC Certified Protocol</span>
                </div>
                <p style="font-size:0.83rem; color:var(--text-muted); margin-bottom:16px;">
                  Log harvested honey lot parameters. An immutable SHA-256 batch block is minted and transmitted to KVIC for automated dual-consensus verification.
                </p>
                <form id="form-quick-batch">
                  <div class="form-group">
                    <label class="form-label" for="batch-apiary">Harvested Apiary Colony *</label>
                    <select id="batch-apiary" class="form-control" required>
                      <option value="APIARY-04">Apiary #4 (Mogar Central Orchard)</option>
                      <option value="APIARY-01">Apiary #1 (Mustard Meadow East)</option>
                      <option value="APIARY-02">Apiary #2 (Acacia Forest Reserve)</option>
                    </select>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="form-group">
                      <label class="form-label" for="batch-floral">Floral Source</label>
                      <select id="batch-floral" class="form-control" required>
                        <option value="Mustard (Sarson)">Mustard (Sarson)</option>
                        <option value="Acacia (Khair)">Acacia (Khair)</option>
                        <option value="Jamun &amp; Multi-Flora">Jamun &amp; Multi-Flora</option>
                        <option value="Wild Himalayan Flora">Wild Himalayan Flora</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label" for="batch-quantity">Quantity (kg) *</label>
                      <input type="number" id="batch-quantity" class="form-control" placeholder="e.g. 50" min="5" max="1000" value="50" required>
                    </div>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="form-group">
                      <label class="form-label" for="batch-moisture">Moisture (%) *</label>
                      <input type="number" id="batch-moisture" class="form-control" placeholder="17.2" step="0.1" min="12" max="22" value="17.2" required>
                    </div>
                    <div class="form-group">
                      <label class="form-label" for="batch-date">Harvest Date *</label>
                      <input type="date" id="batch-date" class="form-control" required>
                    </div>
                  </div>

                  <div style="background:var(--surface-tint); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px 14px; margin-bottom:14px; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center;">
                    <span>Estimated Retail Packaging:</span>
                    <strong style="color:var(--primary); font-family:var(--font-mono);" id="batch-est-jars">100 Jars (500g each)</strong>
                  </div>

                  <button type="submit" class="btn-primary" style="width: 100%; padding:10px 18px; font-size:0.88rem;">
                    <span>🔒 Generate Blockchain Proof &amp; QR Code</span>
                  </button>
                </form>
              </div>

              <!-- Protocol Explanation Side Panel -->
              <div class="panel-card" style="display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <h4 style="font-size:1.05rem; font-weight:700; margin-bottom:10px;">⚖️ Dual Consensus Protocol</h4>
                  <p style="font-size:0.82rem; color:var(--text-muted); line-height:1.5; margin-bottom:14px;">
                    Once minted, tamper-evident QR code labels are pre-generated. The smart contract holds QR codes in <strong>INACTIVE (Pending Lab)</strong> status until two independent authorities match:
                  </p>
                  <div style="display:flex; flex-direction:column; gap:10px; font-size:0.8rem;">
                    <div style="background:var(--surface-tint); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border);">
                      <div style="font-weight:700; color:var(--primary);">1. Field Telemetry Audit</div>
                      <div style="color:var(--text-muted); font-size:0.75rem; margin-top:2px;">Load-cell 14-day weight gain curve matches botanical nectar threshold.</div>
                    </div>
                    <div style="background:var(--surface-tint); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border);">
                      <div style="font-weight:700; color:var(--primary);">2. NABL Lab NMR Analysis</div>
                      <div style="color:var(--text-muted); font-size:0.75rem; margin-top:2px;">Laboratory certifies C4 sugar &lt; 7%, HMF &lt; 40 mg/kg, moisture &le; 20%.</div>
                    </div>
                  </div>
                </div>
                <div style="margin-top:16px; border-top:1px solid var(--border); padding-top:12px;">
                  <button type="button" class="btn-secondary" style="width:100%; font-size:0.8rem;" onclick="document.querySelector('[data-sidebar-tab=\\'batches\\']').click();">
                    📜 View All Recorded Batches &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ==========================================
               SUBVIEW 4: MY CERTIFIED BATCHES (TAB: BATCHES)
               ========================================== -->
          <div id="farmer-subview-batches" style="display: none;">
            <div class="panel-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap:wrap; gap:10px;">
                <div>
                  <h3 style="font-size:1.15rem; font-weight:800;">📜 My Certified Honey Batches</h3>
                  <p style="font-size:0.82rem; color:var(--text-muted); margin:2px 0 0 0;">All harvested lots recorded immutably on PostgreSQL &amp; Blockchain</p>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                  <span id="batches-count-pill" class="status-chip normal">2 Batches</span>
                  <button type="button" class="btn-primary" style="padding:6px 14px; font-size:0.8rem;" onclick="document.querySelector('[data-sidebar-tab=\\'harvest\\']').click();">
                    + Mint New Batch
                  </button>
                </div>
              </div>

              <!-- Batches Table -->
              <div class="data-table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Batch ID</th>
                      <th>Apiary Colony</th>
                      <th>Floral &amp; Qty</th>
                      <th>QR Packaging Status</th>
                      <th>Dual Consensus</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="farmer-batches-tbody">
                    <!-- Rendered by app.js -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ==========================================
               SUBVIEW 5: SELL HONEY / MARKETPLACE (TAB: MARKET)
               ========================================== -->
          <div id="farmer-subview-market" style="display: none;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <!-- Marketplace Listing Form -->
              <div class="panel-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                  <h3 style="font-size:1.15rem; font-weight:800;">🏷️ List Verified Honey for Sale</h3>
                  <span class="status-chip normal" style="font-size:0.7rem;">KVIC Honey Mission Certified</span>
                </div>
                <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:16px;">
                  List authenticated bottles directly on the national Honey Mission retail marketplace. Consumers scan cap QR codes for provenance before buying.
                </p>

                <form id="form-marketplace-listing" onsubmit="event.preventDefault(); showToast('Honey batch successfully listed on KVIC Certified Marketplace!', 'success', 'Marketplace');">
                  <div class="form-group">
                    <label class="form-label">Select Verified Batch *</label>
                    <select class="form-control" required id="market-batch-select">
                      <option value="HM-BATCH-2026-8812">HM-BATCH-2026-8812 (Mustard &amp; Acacia &bull; 85 kg &bull; Active)</option>
                      <option value="HM-BATCH-2026-7025">HM-BATCH-2026-7025 (Mustard &amp; Acacia &bull; 50 kg &bull; Active)</option>
                      <option value="HM-BATCH-2026-6035">HM-BATCH-2026-6035 (Mustard &amp; Acacia &bull; 60 kg &bull; Active)</option>
                    </select>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="form-group">
                      <label class="form-label">Jar Packaging Size</label>
                      <select class="form-control">
                        <option value="500g">500g Glass Jar (Standard)</option>
                        <option value="250g">250g Sample Jar</option>
                        <option value="1kg">1000g Family Jar</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">MSP Price per Jar (₹) *</label>
                      <input type="number" class="form-control" value="350" min="100" max="2000" required>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Number of Jars to Allocate *</label>
                    <input type="number" class="form-control" value="100" min="10" max="500" required>
                  </div>

                  <div style="display:flex; flex-direction:column; gap:6px; margin:14px 0; font-size:0.78rem; color:var(--text);">
                    <div>✓ <strong>100% Raw Pure Certified</strong> - Zero sugar syrup adulteration guarantee</div>
                    <div>✓ <strong>Direct Benefit Transfer</strong> - Sale funds routed directly to Farmer Bank via PFMS</div>
                    <div>✓ <strong>Tamper-Proof QR Seal</strong> - Each bottle individually verified on blockchain</div>
                  </div>

                  <button type="submit" class="btn-primary" style="width: 100%;">
                    🏷️ Publish to National Honey Marketplace
                  </button>
                </form>
              </div>

              <!-- Active Marketplace Listings -->
              <div class="panel-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                  <h4 style="font-size:1.05rem; font-weight:700;">🏪 Active Store Listings</h4>
                  <span class="status-chip normal" style="font-size:0.7rem;">Live on KVIC e-Store</span>
                </div>

                <div style="display:flex; flex-direction:column; gap:12px;">
                  <div style="background:var(--surface-tint); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                      <div>
                        <strong style="font-size:0.9rem;">Bharat Bee Mustard Flora Honey (500g)</strong>
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Batch #HM-BATCH-2026-8812 &bull; Anand Orchard</div>
                      </div>
                      <span class="status-chip verified" style="font-size:0.65rem;">ACTIVE &bull; ₹350</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:0.78rem; border-top:1px solid var(--border-light); padding-top:8px;">
                      <span>Allocated: <strong>100 jars</strong></span>
                      <span>Sold: <strong style="color:var(--success);">38 jars</strong></span>
                      <span>Revenue: <strong style="color:var(--primary-hover);">₹13,300</strong></span>
                    </div>
                  </div>

                  <div style="background:var(--surface-tint); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                      <div>
                        <strong style="font-size:0.9rem;">KVIC Certified Acacia Wildflower (250g)</strong>
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Batch #HM-BATCH-2026-7025 &bull; Acacia Reserve</div>
                      </div>
                      <span class="status-chip verified" style="font-size:0.65rem;">ACTIVE &bull; ₹220</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:0.78rem; border-top:1px solid var(--border-light); padding-top:8px;">
                      <span>Allocated: <strong>80 jars</strong></span>
                      <span>Sold: <strong style="color:var(--success);">80 jars (Sold Out)</strong></span>
                      <span>Revenue: <strong style="color:var(--primary-hover);">₹17,600</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ==========================================
               SUBVIEW 6: KVIC INSPECTION & NABL SAMPLING (TAB: INSPECTION)
               ========================================== -->
          <div id="farmer-subview-inspection" style="display: none;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <!-- Assigned Officer Card -->
              <div class="panel-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                  <h3 style="font-size:1.15rem; font-weight:800;">🛡️ KVIC Apiary Inspection Status</h3>
                  <span class="status-chip verified" style="font-size:0.7rem;">✓ PHYSICALLY INSPECTED</span>
                </div>

                <div style="display:flex; flex-direction:column; gap:12px; font-size:0.84rem;">
                  <div style="background:var(--surface-tint); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px;">
                    <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Assigned KVIC Nodal Officer</div>
                    <div style="font-size:1.05rem; font-weight:800; color:var(--text); margin-top:2px;">Dr. Arvind Sharma</div>
                    <div style="font-size:0.78rem; color:var(--text-muted);">Zonal Director &bull; Honey Mission Directorate West Zone</div>
                    <div style="font-size:0.74rem; font-family:var(--font-mono); color:var(--primary); margin-top:4px;">ID: KVIC-NDO-482 &bull; 0xKV1C...0001</div>
                  </div>

                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div style="background:var(--surface-tint); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px;">
                      <div style="font-size:0.7rem; color:var(--text-muted);">Last Apiary Audit</div>
                      <strong style="font-size:0.9rem;">28 Sep 2026</strong>
                    </div>
                    <div style="background:var(--surface-tint); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px;">
                      <div style="font-size:0.7rem; color:var(--text-muted);">Next Scheduled Visit</div>
                      <strong style="font-size:0.9rem; color:var(--primary);">15 Oct 2026</strong>
                    </div>
                  </div>

                  <div style="background:var(--surface-tint); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px;">
                    <div style="font-weight:700; margin-bottom:4px;">Nodal Officer Field Inspection Report:</div>
                    <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.5; margin:0;">
                      &ldquo;Conducted physical inspection of Apiary #4 in Mogar village. Inspected 20 Langstroth bee boxes. All colonies in excellent health (Apis mellifera). Zero presence of artificial sugar feeding buckets or inverted syrup drums. Honeycomb supers sealed properly with white cappings.&rdquo;
                    </p>
                  </div>

                  <button type="button" class="btn-secondary" style="margin-top:6px;" onclick="showToast('Re-inspection request dispatched to KVIC Zonal Directorate.', 'info', 'Inspection');">
                    📋 Request Apiary Re-Inspection
                  </button>
                </div>
              </div>

              <!-- Sealed NABL Lab Sample Card -->
              <div class="panel-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                  <h4 style="font-size:1.05rem; font-weight:700;">🔬 Sealed NABL Laboratory Sample</h4>
                  <span class="status-chip normal" style="font-size:0.7rem;">Dual Consensus Linked</span>
                </div>

                <div style="display:flex; flex-direction:column; gap:12px; font-size:0.84rem;">
                  <div style="background:var(--surface-tint); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px;">
                    <div style="display:flex; justify-content:space-between;">
                      <span style="color:var(--text-muted); font-size:0.78rem;">Lab Sample Barcode:</span>
                      <span class="status-chip normal" style="font-size:0.65rem;">SEALED TAMPER-PROOF</span>
                    </div>
                    <div style="font-size:1.15rem; font-weight:800; font-family:var(--font-mono); color:var(--primary); margin:4px 0;">LAB-SMP-2026-8812</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">Security Tag: #SEAL-KVIC-9941 &bull; Collected by Officer on-site</div>
                  </div>

                  <div style="background:var(--surface-tint); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px;">
                    <div style="font-size:0.75rem; font-weight:700; margin-bottom:6px;">NABL Testing Laboratory:</div>
                    <div style="font-size:0.85rem; font-weight:700;">National Honey Testing Lab (Anand Centre)</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">FSSAI &amp; NABL Accredited &bull; Chemist: Dr. Sunita Deshmukh</div>
                  </div>

                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div style="background:var(--surface-tint); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px;">
                      <div style="font-size:0.7rem; color:var(--text-muted);">C4 Sugar Content</div>
                      <strong style="font-size:0.9rem; color:var(--success);">0.0% (Passed)</strong>
                    </div>
                    <div style="background:var(--surface-tint); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px;">
                      <div style="font-size:0.7rem; color:var(--text-muted);">HMF Quality Index</div>
                      <strong style="font-size:0.9rem; color:var(--success);">12.8 mg/kg (Raw)</strong>
                    </div>
                  </div>

                  <div style="background:var(--surface-tint); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px; font-family:var(--font-mono); font-size:0.72rem; word-break:break-all; color:var(--primary-hover);">
                    Cryptographic Report Hash:<br>0xccd35f397edabf546d99b18eb48f103952a50a32a44d6cc0b74b4f34ad3283fc
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>'''

html = html[:start_idx] + new_farmer_dashboard + html[end_idx:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("SUCCESS: Patched index.html with login admin tab, removed topbar-actions, and built 6 farmer subviews")
