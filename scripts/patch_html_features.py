with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. nav-public-link on nav-pill-verify
html = html.replace(
    '<button type="button" class="nav-pill-verify" id="nav-pill-verify" data-view="verify">',
    '<button type="button" class="nav-pill-verify nav-public-link" id="nav-pill-verify" data-view="verify">'
)

# 2. profile dropdown items
old_dd = '''            <button type="button" class="profile-dropdown-item" id="profile-menu-dashboard">
              <span>📊</span> <span data-i18n="navDashboard">Dashboard</span>
            </button>
            <button type="button" class="profile-dropdown-item" id="profile-menu-verify">
              <span>🔍</span> <span data-i18n="navVerifyJar">Verify a Jar</span>
            </button>
            <button type="button" class="profile-dropdown-item" id="profile-menu-settings">
              <span>⚙️</span> <span data-i18n="navSettings">Settings</span>
            </button>
            <button type="button" class="profile-dropdown-item" id="profile-menu-help">
              <span>❓</span> <span data-i18n="navHelp">Help</span>
            </button>'''

new_dd = '''            <button type="button" class="profile-dropdown-item" id="profile-menu-dashboard">
              <span>📊</span> <span data-i18n="navDashboard">Dashboard</span>
            </button>
            <button type="button" class="profile-dropdown-item" id="profile-menu-home">
              <span>🏠</span> <span data-i18n="navPortalOverview">Portal Overview</span>
            </button>
            <button type="button" class="profile-dropdown-item" id="profile-menu-verify">
              <span>🔍</span> <span data-i18n="navVerifyJar">Verify a Jar</span>
            </button>
            <button type="button" class="profile-dropdown-item" id="profile-menu-howto">
              <span>📖</span> <span data-i18n="navHowToUse">How To Use</span>
            </button>
            <button type="button" class="profile-dropdown-item" id="profile-menu-settings">
              <span>⚙️</span> <span data-i18n="navSettings">Settings</span>
            </button>
            <button type="button" class="profile-dropdown-item" id="profile-menu-help">
              <span>❓</span> <span data-i18n="navHelp">Help &amp; FAQ</span>
            </button>'''

html = html.replace(old_dd, new_dd)

# 3. Add id="step-cards-row" to step cards in view-how-to
html = html.replace('<div class="step-cards-row">', '<div class="step-cards-row" id="step-cards-row">')

# 4. Insert sample batch chips in verify section
sample_chips = '''          </form>

          <!-- Sample Batch Quick Pickers -->
          <div class="batch-chips-row">
            <span style="font-size: 0.74rem; font-weight: 700; color: var(--text-muted); margin-right: 4px;" data-i18n="batchSampleTitle">Sample Batches:</span>
            <button type="button" class="batch-chip-btn active" data-batch="HM-BATCH-2026-8812" title="100% Pure Mustard & Acacia Floral">
              <span>🟢</span> HM-BATCH-2026-8812 (Pure Mustard)
            </button>
            <button type="button" class="batch-chip-btn" data-batch="HM-BATCH-2026-7910" title="100% Pure Eucalyptus Wildflower">
              <span>🟢</span> HM-BATCH-2026-7910 (Eucalyptus)
            </button>
            <button type="button" class="batch-chip-btn" data-batch="HM-BATCH-2026-9431" title="100% Pure Jamun Multi-Flora">
              <span>🟢</span> HM-BATCH-2026-9431 (Jamun Flora)
            </button>
            <button type="button" class="batch-chip-btn flagged-chip" data-batch="HM-BATCH-2026-5272" title="Simulated Added Sugar Syrup Fraud">
              <span>🚩</span> HM-BATCH-2026-5272 (C4 Sugar Fraud)
            </button>
            <button type="button" class="batch-chip-btn flagged-chip" data-batch="HM-BATCH-2026-7860" title="Simulated High HMF Thermal Degradation">
              <span>🚩</span> HM-BATCH-2026-7860 (Stale Syrup / HMF)
            </button>
          </div>'''

html = html.replace('          </form>', sample_chips, 1)

# 5. Quick scan buttons in qr-scanner-overlay
old_qr = '''      <button type="button" class="qr-scanner-close" id="btn-qr-scanner-close" data-i18n="qrScannerClose">Cancel Scan</button>
    </div>
  </div>'''

new_qr = '''      <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; justify-content:center;">
        <button type="button" class="btn-secondary" id="btn-quick-scan-pure" style="font-size:0.75rem; padding:6px 14px; background:rgba(255,255,255,0.12); color:#fff; border-color:rgba(255,255,255,0.3);">
          🟢 Scan Jar #8812 (Pure Honey)
        </button>
        <button type="button" class="btn-secondary" id="btn-quick-scan-fraud" style="font-size:0.75rem; padding:6px 14px; background:rgba(255,255,255,0.12); color:#fff; border-color:rgba(255,255,255,0.3);">
          🚩 Scan Jar #5272 (Flagged Fraud)
        </button>
      </div>
      <button type="button" class="qr-scanner-close" id="btn-qr-scanner-close" data-i18n="qrScannerClose" style="margin-top:10px;">Cancel Scan</button>
    </div>
  </div>'''

html = html.replace(old_qr, new_qr)

# 6. Settings Modal HTML
settings_modal = '''  <!-- Modal: Settings Modal -->
  <div class="settings-modal-backdrop" id="modal-settings" role="dialog" aria-modal="true" aria-label="Settings">
    <div class="settings-modal-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="font-size:1.2rem; font-weight:800; display:flex; align-items:center; gap:8px;">
          <span>⚙️</span> <span data-i18n="settingsTitle">Account &amp; Portal Settings</span>
        </h3>
        <button type="button" class="modal-close-btn" id="btn-close-settings-modal" style="background:transparent; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-muted);">&times;</button>
      </div>

      <div class="settings-tabs-row" role="tablist">
        <button type="button" class="settings-tab-btn active" id="tab-set-profile" data-i18n="settingsProfile">Profile Information</button>
        <button type="button" class="settings-tab-btn" id="tab-set-notify" data-i18n="settingsNotifications">Notifications</button>
        <button type="button" class="settings-tab-btn" id="tab-set-offline" data-i18n="settingsOffline">Offline Storage</button>
      </div>

      <!-- Tab 1: Profile -->
      <div id="settings-view-profile">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="setting-fullname" class="form-control no-icon" value="Ramesh Patel">
          </div>
          <div class="form-group">
            <label class="form-label">Registered Phone / ID</label>
            <input type="text" id="setting-phone" class="form-control no-icon" value="9876543210" disabled>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
          <div class="form-group">
            <label class="form-label">State / Region</label>
            <input type="text" id="setting-state" class="form-control no-icon" value="Gujarat">
          </div>
          <div class="form-group">
            <label class="form-label">District Cluster</label>
            <input type="text" id="setting-district" class="form-control no-icon" value="Anand">
          </div>
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label">Preferred Portal Language</label>
          <select id="setting-lang" class="form-control no-icon">
            <option value="en">English (Default)</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>
      </div>

      <!-- Tab 2: Notifications -->
      <div id="settings-view-notify" style="display:none;">
        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">
          <label style="display:flex; align-items:center; gap:10px; font-size:0.88rem; cursor:pointer;">
            <input type="checkbox" id="setting-notify-iot" checked style="accent-color:var(--primary);">
            <span>Receive SMS alerts for acoustic swarm vibration peaks</span>
          </label>
          <label style="display:flex; align-items:center; gap:10px; font-size:0.88rem; cursor:pointer;">
            <input type="checkbox" id="setting-notify-kvic" checked style="accent-color:var(--primary);">
            <span>Notify when NABL lab report is uploaded for my batch</span>
          </label>
          <label style="display:flex; align-items:center; gap:10px; font-size:0.88rem; cursor:pointer;">
            <input type="checkbox" id="setting-notify-dbt" checked style="accent-color:var(--primary);">
            <span>Direct Benefit Transfer (DBT) subsidy disbursement updates</span>
          </label>
        </div>
      </div>

      <!-- Tab 3: Offline Storage -->
      <div id="settings-view-offline" style="display:none;">
        <div style="background:var(--surface-tint); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px; margin-bottom:16px;">
          <div style="font-weight:700; font-size:0.9rem; margin-bottom:4px;">IndexedDB Offline Cache</div>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:0 0 10px 0;">All offline harvests and acoustic telemetry are encrypted locally until cellular network is found.</p>
          <div style="font-size:0.78rem; font-family:var(--font-mono); color:var(--emerald-accent);">Status: 100% Synchronized (0 pending items)</div>
        </div>
        <button type="button" class="btn-secondary" id="btn-clear-cache" style="font-size:0.8rem; padding:6px 14px;">Clear Local Cache</button>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px; border-top:1px solid var(--border); padding-top:14px;">
        <button type="button" class="btn-secondary" id="btn-cancel-settings">Cancel</button>
        <button type="button" class="btn-primary" id="btn-save-settings" data-i18n="settingsSave">Save Settings</button>
      </div>
    </div>
  </div>

  <!-- Toast Notification Container -->'''

html = html.replace('  <!-- Toast Notification Container -->', settings_modal)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("SUCCESS: Patched index.html with all features")
