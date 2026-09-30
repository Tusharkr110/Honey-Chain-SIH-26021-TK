with open('app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update views object to include 'how-to'
code = code.replace(
    "    howTo: document.getElementById('view-how-to'),\n    verify:",
    "    howTo: document.getElementById('view-how-to'),\n    'how-to': document.getElementById('view-how-to'),\n    verify:"
)

# 2. Update switchView normalizer
old_switch = "  function switchView(targetViewKey) {\n"
new_switch = """  function switchView(targetViewKey) {
    if (targetViewKey === 'how-to') targetViewKey = 'howTo';
"""
code = code.replace(old_switch, new_switch, 1)

# 3. Add renderHowToCards call inside switchView
old_target_check = "    if (targetViewKey === 'home') {\n      renderDemoStage(demoStep || 1);\n    }"
new_target_check = """    if (targetViewKey === 'home') {
      renderDemoStage(demoStep || 1);
    }
    if (targetViewKey === 'howTo') {
      renderHowToCards('farmers');
    }"""
code = code.replace(old_target_check, new_target_check, 1)

# 4. Replace verify jar submit handler & add knownBatches and batch chips
old_verify_handler = """  const formVerifyJar = document.getElementById('form-verify-jar');
  const inputVerifyBatch = document.getElementById('input-verify-batch');
  const boxResultVerified = document.getElementById('box-result-verified');
  const boxResultFlagged = document.getElementById('box-result-flagged');

  if (formVerifyJar) {
    formVerifyJar.addEventListener('submit', async (e) => {
      e.preventDefault();
      const batchId = (inputVerifyBatch ? inputVerifyBatch.value.trim() : '') || 'HM-BATCH-2026-8812';
      const isFlagged = batchId.toUpperCase().includes('FLAG') || batchId.toUpperCase().includes('ADULT');

      if (isFlagged) {
        if (boxResultVerified) boxResultVerified.style.display = 'none';
        if (boxResultFlagged) boxResultFlagged.style.display = 'block';
        showToast("Batch flagged for quality anomaly.", "warning", "Quality Assessment");
      } else {
        if (boxResultFlagged) boxResultFlagged.style.display = 'none';
        if (boxResultVerified) boxResultVerified.style.display = 'block';

        try {
          const res = await BeeHiveAPI.getPassport(batchId);
          if (res && res.batch) {
            const b = res.batch;
            const elTitle = document.getElementById('verify-batch-title');
            if (elTitle) elTitle.textContent = `Batch #${b.batch_id || batchId}`;
            const elType = document.getElementById('verify-honey-type');
            if (elType) elType.textContent = b.floral_source || 'Mustard & Acacia Floral';
            const elRegion = document.getElementById('verify-region');
            if (elRegion) elRegion.textContent = `${b.district || 'Anand'}, ${b.state || 'Gujarat'}`;
            const elDate = document.getElementById('verify-harvest-date');
            if (elDate && b.harvest_date) elDate.textContent = new Date(b.harvest_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const elBeekeeper = document.getElementById('verify-beekeeper');
            if (elBeekeeper) elBeekeeper.textContent = `${b.farmer_name || 'Ramesh Patel'} (KVIC ID #${b.honey_mission_id || '0104'})`;
            const elMoist = document.getElementById('verify-moisture');
            if (elMoist) elMoist.textContent = `${b.moisture_pct || 17.2}% (Pure < 20%)`;
            const elHash = document.getElementById('verify-block-hash');
            if (elHash) elHash.textContent = b.block_hash || '0x3a4f89d1c7e92b5006b83f0907cae12739268eacdfa89110756e2978a1bc40e7';
          }
        } catch (err) {
          console.log("Local passport lookup:", err);
        }
        showToast("100% Pure & Authenticated by KVIC Honey Mission.", "success", "Verified Successfully");
      }
    });
  }"""

new_verify_handler = """  const formVerifyJar = document.getElementById('form-verify-jar');
  const inputVerifyBatch = document.getElementById('input-verify-batch');
  const boxResultVerified = document.getElementById('box-result-verified');
  const boxResultFlagged = document.getElementById('box-result-flagged');

  const knownBatches = {
    'HM-BATCH-2026-8812': {
      pure: true,
      title: 'Batch #HM-BATCH-2026-8812',
      type: 'Mustard & Acacia Floral',
      region: 'Anand, Gujarat (Mogar)',
      date: '28 Sep 2026',
      beekeeper: 'Ramesh Patel (KVIC ID #0104)',
      lab: 'Passed NABL SMR/NMR (C4: 0.0%, HMF: 12.8 mg/kg)',
      moisture: '17.2% (Pure < 20%)',
      risk: '0.02 (EXTREMELY LOW)',
      hash: '0x3a4f89d1c7e92b5006b83f0907cae12739268eacdfa89110756e2978a1bc40e7'
    },
    'HM-BATCH-2026-7910': {
      pure: true,
      title: 'Batch #HM-BATCH-2026-7910',
      type: 'Eucalyptus Wildflower',
      region: 'Gir Forest Buffer, Gujarat',
      date: '25 Sep 2026',
      beekeeper: 'Ramesh Patel (KVIC ID #0104)',
      lab: 'Passed NABL Certified (C4: 0.4%, HMF: 15.1 mg/kg)',
      moisture: '18.0% (Pure < 20%)',
      risk: '0.03 (EXTREMELY LOW)',
      hash: '0x71c9902fab1128e441bb7790ac3812001e9912048821'
    },
    'HM-BATCH-2026-9431': {
      pure: true,
      title: 'Batch #HM-BATCH-2026-9431',
      type: 'Jamun & Multi-Flora',
      region: 'Muzaffarpur Cluster, Bihar',
      date: '22 Sep 2026',
      beekeeper: 'Sunita Devi (KVIC ID #0492)',
      lab: 'Passed NABL Certified (C4: 0.0%, HMF: 9.4 mg/kg)',
      moisture: '16.8% (Pure < 20%)',
      risk: '0.01 (PRISTINE)',
      hash: '0x9431abcefd770912348a129038290119283741829100'
    },
    'HM-BATCH-2026-5272': {
      pure: false,
      title: 'Batch #HM-BATCH-2026-5272 (Simulated Fraud)',
      risk: '0.94 (HIGH RISK)',
      reasons: [
        'C-4 Sugar Isotope NMR: 18.4% (Permissible limit < 7.0% - detected synthetic corn/cane syrup)',
        'Moisture Content: 22.4% (Exceeds raw honey maximum threshold of 20%)',
        'Acoustic Telemetry: Nocturnal +12.5 kg weight jump recorded on Day 11 without daytime foraging',
        'Blockchain Consensus: Smart Contract DUAL_CONSENSUS_MISMATCH triggered, QR blacklisted'
      ],
      location: 'Unverified Boundary Apiary #9',
      date: '28 Sep 2026'
    },
    'HM-BATCH-2026-7860': {
      pure: false,
      title: 'Batch #HM-BATCH-2026-7860 (Overheated / Degraded)',
      risk: '0.88 (HIGH RISK)',
      reasons: [
        'HMF Index: 48.2 mg/kg (Permissible limit < 40 mg/kg - indicates thermal overheating & stale syrup)',
        'Moisture divergence: 3.5% delta between KVIC field refractometer and NABL testing lab',
        'Dual Consensus: Package QR codes frozen on-chain and barred from retail marketplace'
      ],
      location: 'Apiary #2 (Acacia Forest Reserve)',
      date: '29 Sep 2026'
    }
  };

  if (formVerifyJar) {
    formVerifyJar.addEventListener('submit', async (e) => {
      e.preventDefault();
      const batchId = (inputVerifyBatch ? inputVerifyBatch.value.trim() : '') || 'HM-BATCH-2026-8812';
      const record = knownBatches[batchId];
      const isFlagged = record ? (!record.pure) : (batchId.toUpperCase().includes('FLAG') || batchId.toUpperCase().includes('ADULT') || batchId.includes('5272') || batchId.includes('7860'));

      if (isFlagged) {
        if (boxResultVerified) boxResultVerified.style.display = 'none';
        if (boxResultFlagged) {
          boxResultFlagged.style.display = 'block';
          const r = record || knownBatches['HM-BATCH-2026-5272'];
          boxResultFlagged.innerHTML = `
            <div class="verify-result-header">
              <div>
                <span class="status-chip danger">🚩 QUALITY ANOMALY FLAGGED</span>
                <h3 style="margin-top: 6px; color: var(--danger);">${r.title}</h3>
              </div>
              <div style="text-align: right;">
                <div class="verify-data-label">RISK SCORE</div>
                <strong style="color: var(--danger); font-size: 1.25rem;">${r.risk}</strong>
              </div>
            </div>
            <div style="background: var(--surface); padding: 14px; border-radius: var(--radius-sm); border: 1.5px solid var(--danger); margin-bottom: 16px;">
              <p style="color: var(--danger); font-size: 0.9rem; font-weight:700; margin-bottom: 8px;">
                ⚠️ Notice: This honey batch was rejected on-chain due to dual consensus mismatch:
              </p>
              <ul style="padding-left: 20px; font-size: 0.85rem; color: var(--text); line-height: 1.6;">
                ${r.reasons ? r.reasons.map(reason => `<li>${reason}</li>`).join('') : '<li>Failed NABL Lab testing standards.</li>'}
              </ul>
            </div>
            <button type="button" class="btn-primary" style="background: var(--danger); color: #FFF; width: 100%; border-color: var(--danger);" id="btn-report-jar" onclick="showToast('Alert dispatched to KVIC State Vigilance Directorate.', 'info', 'Vigilance')">
              🚩 Report This Jar to KVIC Honey Mission
            </button>
          `;
        }
        showToast("Batch flagged for quality anomaly.", "warning", "Quality Assessment");
      } else {
        if (boxResultFlagged) boxResultFlagged.style.display = 'none';
        if (boxResultVerified) boxResultVerified.style.display = 'block';

        const r = record || knownBatches['HM-BATCH-2026-8812'];
        const elTitle = document.getElementById('verify-batch-title');
        if (elTitle) elTitle.textContent = r.title;
        const elType = document.getElementById('verify-honey-type');
        if (elType) elType.textContent = r.type;
        const elRegion = document.getElementById('verify-region');
        if (elRegion) elRegion.textContent = r.region;
        const elDate = document.getElementById('verify-harvest-date');
        if (elDate) elDate.textContent = r.date;
        const elBeekeeper = document.getElementById('verify-beekeeper');
        if (elBeekeeper) elBeekeeper.textContent = r.beekeeper;
        const elLab = document.getElementById('verify-lab-result');
        if (elLab) elLab.textContent = r.lab;
        const elMoist = document.getElementById('verify-moisture');
        if (elMoist) elMoist.textContent = r.moisture;
        const elRisk = document.getElementById('verify-risk-score');
        if (elRisk) elRisk.textContent = r.risk;
        const elHash = document.getElementById('verify-block-hash');
        if (elHash) elHash.textContent = r.hash;

        // Try live API if available
        try {
          const res = await BeeHiveAPI.getPassport(batchId);
          if (res && res.batch) {
            const b = res.batch;
            if (elTitle) elTitle.textContent = `Batch #${b.batch_id || batchId}`;
            if (elType) elType.textContent = b.floral_source || r.type;
            if (elRegion) elRegion.textContent = `${b.district || 'Anand'}, ${b.state || 'Gujarat'}`;
            if (elMoist) elMoist.textContent = `${b.moisture_pct || 17.2}% (Pure < 20%)`;
            if (elHash) elHash.textContent = b.block_hash || r.hash;
          }
        } catch (err) {}

        // Add or update Digital Passport link button
        let passportBtn = document.getElementById('btn-passport-view-link');
        if (!passportBtn) {
          passportBtn = document.createElement('a');
          passportBtn.id = 'btn-passport-view-link';
          passportBtn.target = '_blank';
          passportBtn.className = 'btn-primary';
          passportBtn.style.cssText = 'margin-top: 14px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; justify-content: center;';
          passportBtn.innerHTML = '<span>📱</span> <span>Open Digital Honey Passport →</span>';
          boxResultVerified.appendChild(passportBtn);
        }
        passportBtn.href = `passport.html?batch=${batchId}`;

        showToast("100% Pure & Authenticated by KVIC Honey Mission.", "success", "Verified Successfully");
      }
    });
  }

  // Sample Batch Chip Click Handlers
  document.querySelectorAll('.batch-chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.batch-chip-btn').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const b = chip.dataset.batch;
      if (inputVerifyBatch) inputVerifyBatch.value = b;
      if (formVerifyJar) formVerifyJar.dispatchEvent(new Event('submit'));
    });
  });"""

code = code.replace(old_verify_handler, new_verify_handler, 1)

# 5. Add Quick Scan Buttons to QR scanner overlay
old_qr_btn = """  // Camera scan QR button
  const btnScanQrCamera = document.getElementById('btn-scan-qr-camera');
  if (btnScanQrCamera) {
    btnScanQrCamera.addEventListener('click', () => {
      const overlay = document.getElementById('qr-scanner-overlay');
      if (overlay) overlay.classList.add('visible');
      // Simulate scan after 2.5s
      setTimeout(() => {
        if (overlay) overlay.classList.remove('visible');
        const batchIds = ['HM-BATCH-2026-8812', 'HM-BATCH-2026-5272', 'HM-BATCH-2026-0104'];
        const scanned = batchIds[Math.floor(Math.random() * batchIds.length)];
        if (inputVerifyBatch) inputVerifyBatch.value = scanned;
        showToast(`QR scanned: ${scanned}`, 'success', 'QR Scanner');
        setTimeout(() => {
          if (formVerifyJar) formVerifyJar.dispatchEvent(new Event('submit'));
        }, 300);
      }, 2500);
    });
  }"""

new_qr_btn = """  // Camera scan QR button & overlay shortcuts
  const btnScanQrCamera = document.getElementById('btn-scan-qr-camera');
  const btnQuickScanPure = document.getElementById('btn-quick-scan-pure');
  const btnQuickScanFraud = document.getElementById('btn-quick-scan-fraud');

  if (btnScanQrCamera) {
    btnScanQrCamera.addEventListener('click', () => {
      const overlay = document.getElementById('qr-scanner-overlay');
      if (overlay) overlay.classList.add('visible');
      // Auto-scan after 2.2s default
      setTimeout(() => {
        if (overlay && overlay.classList.contains('visible')) {
          overlay.classList.remove('visible');
          if (inputVerifyBatch) inputVerifyBatch.value = 'HM-BATCH-2026-8812';
          showToast('QR Scanned: HM-BATCH-2026-8812 (Pure Honey)', 'success', 'QR Scanner');
          setTimeout(() => {
            if (formVerifyJar) formVerifyJar.dispatchEvent(new Event('submit'));
          }, 200);
        }
      }, 2200);
    });
  }

  if (btnQuickScanPure) {
    btnQuickScanPure.addEventListener('click', () => {
      const overlay = document.getElementById('qr-scanner-overlay');
      if (overlay) overlay.classList.remove('visible');
      if (inputVerifyBatch) inputVerifyBatch.value = 'HM-BATCH-2026-8812';
      showToast('QR Scanned: HM-BATCH-2026-8812 (Pure Honey)', 'success', 'QR Scanner');
      if (formVerifyJar) formVerifyJar.dispatchEvent(new Event('submit'));
    });
  }

  if (btnQuickScanFraud) {
    btnQuickScanFraud.addEventListener('click', () => {
      const overlay = document.getElementById('qr-scanner-overlay');
      if (overlay) overlay.classList.remove('visible');
      if (inputVerifyBatch) inputVerifyBatch.value = 'HM-BATCH-2026-5272';
      showToast('QR Scanned: HM-BATCH-2026-5272 (Flagged Fraud)', 'warning', 'QR Scanner');
      if (formVerifyJar) formVerifyJar.dispatchEvent(new Event('submit'));
    });
  }"""

code = code.replace(old_qr_btn, new_qr_btn, 1)

# 6. How To Use Tab dynamic render function
old_howto = """  // How To Use Tabs
  const tabHowtoFarmers = document.getElementById('tab-howto-farmers');
  const tabHowtoBuyers = document.getElementById('tab-howto-buyers');
  if (tabHowtoFarmers && tabHowtoBuyers) {
    tabHowtoFarmers.addEventListener('click', () => {
      tabHowtoFarmers.classList.add('active');
      tabHowtoBuyers.classList.remove('active');
    });
    tabHowtoBuyers.addEventListener('click', () => {
      tabHowtoBuyers.classList.add('active');
      tabHowtoFarmers.classList.remove('active');
    });
  }"""

new_howto = """  // How To Use Dynamic Step Cards
  const howToFarmerCards = [
    { num: 1, icon: '🛡️', title: 'Register with Aadhaar', titleHi: 'आधार से पंजीकरण करें', desc: 'Register with 12-digit Aadhaar to cross-match official KVIC Honey Mission records.' },
    { num: 2, icon: '🍯', title: 'Add Honey Harvest', titleHi: 'शहद फसल दर्ज करें', desc: 'Log honey lot parameters and connect live hive scale load-cell telemetry.' },
    { num: 3, icon: '🔬', title: 'Officer Apiary Sampling', titleHi: 'अधिकारी द्वारा नमूना संग्रह', desc: 'KVIC officer inspects apiary and collects sealed NABL laboratory sample.' },
    { num: 4, icon: '📋', title: 'NABL Lab Consensus', titleHi: 'एनबीएल दोहरी सर्वसम्मति जांच', desc: 'NABL laboratory inputs chemical NMR report for dual consensus validation.' },
    { num: 5, icon: '🏷️', title: 'Sell Verified Honey', titleHi: 'प्रमाणित शहद बेचें', desc: 'Pack authenticated bottles with tamper-evident QR code linked to digital passport.' }
  ];

  const howToBuyerCards = [
    { num: 1, icon: '📷', title: 'Scan QR on Jar Label', titleHi: 'जार का क्यूआर कोड स्कैन करें', desc: 'Use your smartphone camera or web scanner to scan the tamper-evident QR on the honey bottle.' },
    { num: 2, icon: '📱', title: 'Instant Digital Passport', titleHi: 'डिजिटल पासपोर्ट देखें', desc: 'Instantly view the public cryptographic passport showing harvesting date, hive origin, and beekeeper name.' },
    { num: 3, icon: '🧪', title: 'Inspect Lab NMR Report', titleHi: 'रासायनिक एनएमआर रिपोर्ट जांचें', desc: 'Review certified chemical purity metrics: Moisture, C4 sugar syrups, HMF heating index, and floral pollen.' },
    { num: 4, icon: '⛓️', title: 'Verify On-Chain Ledger', titleHi: 'ब्लॉकचेन रिकॉर्ड सत्यापित करें', desc: 'Confirm the immutable SHA-256 block hash recorded across government consortium nodes.' },
    { num: 5, icon: '🍯', title: 'Enjoy Pure Certified Honey', titleHi: 'शुद्ध प्रमाणित शहद का आनंद लें', desc: 'Enjoy 100% pure, unadulterated Indian honey directly empowering local beekeeping families.' }
  ];

  function renderHowToCards(tab) {
    const container = document.getElementById('step-cards-row');
    if (!container) return;
    const cards = tab === 'buyers' ? howToBuyerCards : howToFarmerCards;
    const isHi = (typeof I18N !== 'undefined' && I18N.currentLang === 'hi');
    container.innerHTML = cards.map(c => `
      <div class="step-card">
        <div class="step-number-badge">${c.num}</div>
        <div class="step-svg-illustration" style="font-size:2.4rem; display:flex; align-items:center; justify-content:center; height:60px;">
          ${c.icon}
        </div>
        <h3 style="margin-top:10px;">${isHi ? c.titleHi : c.title}</h3>
        <div class="hindi-title" style="font-size:0.8rem; color:var(--text-muted); margin-bottom:8px;">${isHi ? c.title : c.titleHi}</div>
        <p style="font-size:0.82rem; color:var(--text-muted); line-height:1.5;">${c.desc}</p>
      </div>
    `).join('');
  }

  // How To Use Tabs
  const tabHowtoFarmers = document.getElementById('tab-howto-farmers');
  const tabHowtoBuyers = document.getElementById('tab-howto-buyers');
  if (tabHowtoFarmers && tabHowtoBuyers) {
    tabHowtoFarmers.addEventListener('click', () => {
      tabHowtoFarmers.classList.add('active');
      tabHowtoBuyers.classList.remove('active');
      renderHowToCards('farmers');
    });
    tabHowtoBuyers.addEventListener('click', () => {
      tabHowtoBuyers.classList.add('active');
      tabHowtoFarmers.classList.remove('active');
      renderHowToCards('buyers');
    });
  }"""

code = code.replace(old_howto, new_howto, 1)

# 7. Wire Profile Dropdown extra items & Settings Modal
old_profile_actions = """  // Profile menu actions
  const profileMenuDash = document.getElementById('profile-menu-dashboard');
  if (profileMenuDash) {
    profileMenuDash.addEventListener('click', () => {
      if (profileMenu) profileMenu.classList.remove('open');
      if (currentUser) {
        const dest = currentUser.role === 'farmer' ? 'farmerDashboard' : currentUser.role === 'kvic' ? 'kvicDashboard' : 'adminDashboard';
        switchView(dest);
      }
    });
  }
  const profileMenuVerify = document.getElementById('profile-menu-verify');
  if (profileMenuVerify) profileMenuVerify.addEventListener('click', () => { if (profileMenu) profileMenu.classList.remove('open'); switchView('verify'); });
  const profileMenuSettings = document.getElementById('profile-menu-settings');
  if (profileMenuSettings) profileMenuSettings.addEventListener('click', () => { showToast('Settings panel coming soon.', 'info', 'Settings'); });
  const profileMenuHelp = document.getElementById('profile-menu-help');
  if (profileMenuHelp) profileMenuHelp.addEventListener('click', () => { if (profileMenu) profileMenu.classList.remove('open'); switchView('faq'); });"""

new_profile_actions = """  // Profile menu actions
  const profileMenuDash = document.getElementById('profile-menu-dashboard');
  if (profileMenuDash) {
    profileMenuDash.addEventListener('click', () => {
      if (profileMenu) profileMenu.classList.remove('open');
      if (currentUser) {
        const dest = currentUser.role === 'farmer' ? 'farmerDashboard' : currentUser.role === 'kvic' ? 'kvicDashboard' : 'adminDashboard';
        switchView(dest);
      }
    });
  }
  const profileMenuHome = document.getElementById('profile-menu-home');
  if (profileMenuHome) {
    profileMenuHome.addEventListener('click', () => {
      if (profileMenu) profileMenu.classList.remove('open');
      switchView('home');
    });
  }
  const profileMenuVerify = document.getElementById('profile-menu-verify');
  if (profileMenuVerify) {
    profileMenuVerify.addEventListener('click', () => {
      if (profileMenu) profileMenu.classList.remove('open');
      switchView('verify');
    });
  }
  const profileMenuHowto = document.getElementById('profile-menu-howto');
  if (profileMenuHowto) {
    profileMenuHowto.addEventListener('click', () => {
      if (profileMenu) profileMenu.classList.remove('open');
      switchView('howTo');
    });
  }
  const profileMenuHelp = document.getElementById('profile-menu-help');
  if (profileMenuHelp) {
    profileMenuHelp.addEventListener('click', () => {
      if (profileMenu) profileMenu.classList.remove('open');
      switchView('faq');
    });
  }

  // Settings Modal Controller
  const modalSettings = document.getElementById('modal-settings');
  const profileMenuSettings = document.getElementById('profile-menu-settings');
  const btnCloseSettingsModal = document.getElementById('btn-close-settings-modal');
  const btnCancelSettings = document.getElementById('btn-cancel-settings');
  const btnSaveSettings = document.getElementById('btn-save-settings');

  if (profileMenuSettings && modalSettings) {
    profileMenuSettings.addEventListener('click', () => {
      if (profileMenu) profileMenu.classList.remove('open');
      modalSettings.classList.add('open');
      if (currentUser) {
        const fn = document.getElementById('setting-fullname');
        if (fn) fn.value = currentUser.fullName;
        const ph = document.getElementById('setting-phone');
        if (ph) ph.value = currentUser.phone || currentUser.email || '—';
        const st = document.getElementById('setting-state');
        if (st) st.value = currentUser.state || 'Gujarat';
        const dst = document.getElementById('setting-district');
        if (dst) dst.value = currentUser.district || 'Anand';
      }
    });
  }

  if (btnCloseSettingsModal && modalSettings) {
    btnCloseSettingsModal.addEventListener('click', () => modalSettings.classList.remove('open'));
  }
  if (btnCancelSettings && modalSettings) {
    btnCancelSettings.addEventListener('click', () => modalSettings.classList.remove('open'));
  }
  if (modalSettings) {
    modalSettings.addEventListener('click', (e) => {
      if (e.target === modalSettings) modalSettings.classList.remove('open');
    });
  }

  // Settings Sub-tabs
  const tabSetProfile = document.getElementById('tab-set-profile');
  const tabSetNotify = document.getElementById('tab-set-notify');
  const tabSetOffline = document.getElementById('tab-set-offline');
  const viewSetProfile = document.getElementById('settings-view-profile');
  const viewSetNotify = document.getElementById('settings-view-notify');
  const viewSetOffline = document.getElementById('settings-view-offline');

  if (tabSetProfile && tabSetNotify && tabSetOffline) {
    tabSetProfile.addEventListener('click', () => {
      tabSetProfile.classList.add('active');
      tabSetNotify.classList.remove('active');
      tabSetOffline.classList.remove('active');
      if (viewSetProfile) viewSetProfile.style.display = 'block';
      if (viewSetNotify) viewSetNotify.style.display = 'none';
      if (viewSetOffline) viewSetOffline.style.display = 'none';
    });
    tabSetNotify.addEventListener('click', () => {
      tabSetNotify.classList.add('active');
      tabSetProfile.classList.remove('active');
      tabSetOffline.classList.remove('active');
      if (viewSetProfile) viewSetProfile.style.display = 'none';
      if (viewSetNotify) viewSetNotify.style.display = 'block';
      if (viewSetOffline) viewSetOffline.style.display = 'none';
    });
    tabSetOffline.addEventListener('click', () => {
      tabSetOffline.classList.add('active');
      tabSetProfile.classList.remove('active');
      tabSetNotify.classList.remove('active');
      if (viewSetProfile) viewSetProfile.style.display = 'none';
      if (viewSetNotify) viewSetNotify.style.display = 'none';
      if (viewSetOffline) viewSetOffline.style.display = 'block';
    });
  }

  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', () => {
      const langSel = document.getElementById('setting-lang');
      if (langSel && typeof I18N !== 'undefined') {
        I18N.setLang(langSel.value);
      }
      if (modalSettings) modalSettings.classList.remove('open');
      showToast('Settings saved successfully.', 'success', 'Preferences');
    });
  }

  const btnClearCache = document.getElementById('btn-clear-cache');
  if (btnClearCache) {
    btnClearCache.addEventListener('click', () => {
      showToast('Local offline cache cleared.', 'info', 'Storage');
    });
  }"""

code = code.replace(old_profile_actions, new_profile_actions, 1)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: Patched app.js with HowTo, Verify, QR, and Settings logic")
