// app.js - BeeHive Blockchain Application Logic & PostgreSQL Controller

document.addEventListener('DOMContentLoaded', async () => {
  // Current UI State
  let currentRole = 'farmer'; // 'farmer' | 'kvic' | 'admin'
  let currentUser = DB.getCurrentUser();
  let iotInterval = null;

  // Check Database connection on start
  try {
    const health = await BeeHiveAPI.checkHealth();
    console.log("PostgreSQL Health Status:", health);
  } catch (e) {
    console.warn("Health check notice:", e);
  }

  // Initialize theme and i18n layers
  if (typeof THEME !== 'undefined' && THEME.init) {
    THEME.init();
  }
  if (typeof I18N !== 'undefined' && I18N.init) {
    I18N.init();
  }

  // DOM Elements - Views
  const views = {
    home: document.getElementById('view-home'),
    howTo: document.getElementById('view-how-to'),
    'how-to': document.getElementById('view-how-to'),
    verify: document.getElementById('view-verify'),
    faq: document.getElementById('view-faq'),
    auth: document.getElementById('view-auth'),
    farmerPending: document.getElementById('view-farmer-pending'),
    farmerDashboard: document.getElementById('view-farmer-dashboard'),
    kvicDashboard: document.getElementById('view-kvic-dashboard'),
    adminDashboard: document.getElementById('view-admin-dashboard')
  };

  // Header Elements
  const headerUserBar = document.getElementById('header-user-bar');
  const headerUserName = document.getElementById('header-user-name');
  const headerUserRole = document.getElementById('header-user-role');
  const btnLogout = document.getElementById('btn-logout');
  const navBrandHome = document.getElementById('nav-brand-home');
  const btnNavLogin = document.getElementById('btn-nav-login');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const navHamburgerBtn = document.getElementById('nav-hamburger-btn');

  // Auth View Elements
  const tabFarmer = document.getElementById('tab-farmer');
  const tabKvic = document.getElementById('tab-kvic');
  const tabAdmin = document.getElementById('tab-admin');
  const roleInfoBanner = document.getElementById('role-info-banner');
  const formLogin = document.getElementById('form-login');
  const labelIdentifier = document.getElementById('label-identifier');
  const loginIdentifier = document.getElementById('login-identifier');
  const loginPassword = document.getElementById('login-password');
  const helperIdentifier = document.getElementById('helper-identifier');
  const groupKvicPin = document.getElementById('group-kvic-pin');
  const loginSecurityPin = document.getElementById('login-security-pin');
  const btnLoginText = document.getElementById('btn-login-text');
  const farmerRegPrompt = document.getElementById('farmer-reg-prompt');
  const institutionalNotice = document.getElementById('institutional-notice');
  const btnOpenRegister = document.getElementById('btn-open-register');
  const pwdEyeToggle = document.getElementById('pwd-eye-toggle');
  let telemetryCounter = 0;

  // Modals
  const modalFarmerReg = document.getElementById('modal-farmer-reg');
  const btnCloseRegModal = document.getElementById('btn-close-reg-modal');
  const formFarmerRegister = document.getElementById('form-farmer-register');
  const regScanOverlay = document.getElementById('reg-scan-overlay');
  const scanStepText = document.getElementById('scan-step-text');
  const regResultCard = document.getElementById('reg-result-card');

  const modalAddKvicMaster = document.getElementById('modal-add-kvic-master');
  const btnCloseKvicAddModal = document.getElementById('btn-close-kvic-add-modal');
  const btnOpenAddKvicMaster = document.getElementById('btn-open-add-kvic-master');
  const formAddKvicMaster = document.getElementById('form-add-kvic-master');

  const modalBatchQr = document.getElementById('modal-batch-qr');
  const btnCloseQrModal = document.getElementById('btn-close-qr-modal');
  const btnCloseQrAction = document.getElementById('btn-close-qr-action');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, type = 'info', title = '') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠️' : type === 'error' ? '✗' : 'ℹ️';
    toast.innerHTML = `
      <div style="font-size: 1.2rem; font-weight: bold;">${icon}</div>
      <div>
        ${title ? `<div style="font-weight: 700; margin-bottom: 2px;">${title}</div>` : ''}
        <div>${message}</div>
      </div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // View Navigation
  async function switchView(targetViewKey) {
    if (mobileNavDrawer) mobileNavDrawer.classList.remove('open');

    // If already logged in and navigating to auth, route directly to dashboard
    if (targetViewKey === 'auth' && currentUser) {
      routeUserAfterLogin(currentUser);
      return;
    }

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#${targetViewKey}`);
    }

    Object.keys(views).forEach(key => {
      if (views[key]) {
        views[key].style.display = key === targetViewKey ? (key === 'auth' ? 'flex' : 'block') : 'none';
      }
    });

    if (targetViewKey === 'home') {
      renderDemoStage(demoStep || 1);
    }
    if (targetViewKey === 'howTo') {
      renderHowToCards('farmers');
    }

    // Update active links on navbar
    document.querySelectorAll('.site-navbar .nav-link-item, .mobile-nav-drawer .nav-link-item').forEach(link => {
      const isTarget = link.dataset.view === targetViewKey;
      link.classList.toggle('active', isTarget);
    });

    const verifyPill = document.getElementById('nav-pill-verify');
    if (verifyPill) {
      if (targetViewKey === 'verify') {
        verifyPill.style.background = 'var(--primary)';
        verifyPill.style.color = '#16110B';
      } else {
        verifyPill.style.background = 'transparent';
        verifyPill.style.color = 'var(--primary)';
      }
    }

    // Toggle public Login button vs User Profile Session Bar
    const navbar = document.getElementById('site-navbar');
    if (currentUser) {
      if (headerUserBar) headerUserBar.style.display = 'flex';
      if (btnNavLogin) btnNavLogin.style.display = 'none';
      if (navbar) navbar.classList.add('nav-logged-in');
      // Populate profile info
      if (headerUserName) headerUserName.textContent = currentUser.fullName;
      if (headerUserRole) {
        headerUserRole.textContent = currentUser.role.toUpperCase();
        headerUserRole.className = `status-chip normal role-tag-${currentUser.role}`;
      }
      // Set avatar initials
      const initials = currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const avatarEls = document.querySelectorAll('#profile-avatar-circle, #profile-dropdown-avatar');
      avatarEls.forEach(el => { if (el) el.textContent = initials; });
      const ddName = document.getElementById('profile-dropdown-name');
      if (ddName) ddName.textContent = currentUser.fullName;
      const ddRole = document.getElementById('profile-dropdown-role');
      if (ddRole) ddRole.textContent = currentUser.role === 'farmer' ? 'KVIC Honey Mission Beekeeper' : currentUser.role === 'kvic' ? 'KVIC State Directorate Officer' : 'Consortium Super Admin';
    } else {
      if (headerUserBar) headerUserBar.style.display = 'none';
      if (btnNavLogin) btnNavLogin.style.display = 'inline-flex';
      if (navbar) navbar.classList.remove('nav-logged-in');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (targetViewKey === 'farmerDashboard') {
      startIotSimulation();
      await renderFarmerDashboard();
    } else {
      stopIotSimulation();
    }

    if (targetViewKey === 'kvicDashboard') {
      await renderKvicDashboard();
    }

    if (targetViewKey === 'adminDashboard') {
      await renderAdminDashboard();
    }

    if (targetViewKey === 'farmerPending') {
      renderFarmerPendingView();
    }
  }

  function setLoginRole(role) {
    currentRole = role;

    [tabFarmer, tabKvic, tabAdmin].forEach(tab => {
      if (tab) {
        const isActive = tab.dataset.role === role;
        tab.classList.toggle('selected', isActive);
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      }
    });

    if (role === 'farmer') {
      if (labelIdentifier) labelIdentifier.textContent = 'Phone number or User ID';
      if (loginIdentifier) loginIdentifier.placeholder = 'Enter registered Mobile or 12-digit Aadhaar UID';
      if (helperIdentifier) helperIdentifier.innerHTML = 'Authorized access for registered Honey Mission beekeepers';
      if (btnLoginText) btnLoginText.textContent = 'Login to Farmer Portal';
      if (groupKvicPin) groupKvicPin.style.display = 'none';
      if (farmerRegPrompt) farmerRegPrompt.style.display = 'block';
      if (institutionalNotice) institutionalNotice.style.display = 'none';
      if (roleInfoBanner) {
        roleInfoBanner.innerHTML = '<strong>🌾 Farmer Portal:</strong> Authenticate using Aadhaar or Mobile. Access live hive telemetry, blockchain batches, and harvest AI quality monitoring.';
        roleInfoBanner.style.borderLeftColor = 'var(--primary)';
      }
    } else if (role === 'kvic') {
      if (labelIdentifier) labelIdentifier.textContent = 'Official Email / KVIC Officer ID';
      if (loginIdentifier) loginIdentifier.placeholder = 'Enter official email or KVIC Officer ID';
      if (helperIdentifier) helperIdentifier.innerHTML = 'Authorized access for KVIC State Directorate & Nodal Officers';
      if (btnLoginText) btnLoginText.textContent = 'Login to KVIC Officer Portal';
      if (groupKvicPin) groupKvicPin.style.display = 'block';
      if (farmerRegPrompt) farmerRegPrompt.style.display = 'none';
      if (institutionalNotice) institutionalNotice.style.display = 'block';
      if (roleInfoBanner) {
        roleInfoBanner.innerHTML = '<strong>🏛️ KVIC Official Portal:</strong> Review pending beekeeper verification queues in PostgreSQL, approve non-database farmers, and oversee Honey Mission distribution.';
        roleInfoBanner.style.borderLeftColor = 'var(--primary-hover)';
      }
    } else if (role === 'admin') {
      if (labelIdentifier) labelIdentifier.textContent = 'Admin Username / System Email';
      if (loginIdentifier) loginIdentifier.placeholder = 'Enter Consortium Admin ID or system email';
      if (helperIdentifier) helperIdentifier.innerHTML = 'Restricted access for National Honey Board Consortium Administrators';
      if (btnLoginText) btnLoginText.textContent = 'Authenticate Consortium Admin Node';
      if (groupKvicPin) groupKvicPin.style.display = 'none';
      if (farmerRegPrompt) farmerRegPrompt.style.display = 'none';
      if (institutionalNotice) institutionalNotice.style.display = 'block';
      if (roleInfoBanner) {
        roleInfoBanner.innerHTML = '<strong>🛡️ Consortium Admin:</strong> Monitor node consensus, review immutable smart contract logs in PostgreSQL, and manage consortium cryptographic keys.';
        roleInfoBanner.style.borderLeftColor = 'var(--primary-hover)';
      }
    }
  }

  // Handle Login Submissions via PostgreSQL API
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identifier = loginIdentifier.value.trim();
      const password = loginPassword.value.trim();
      const pin = loginSecurityPin ? loginSecurityPin.value.trim() : '';

      try {
        const response = await BeeHiveAPI.login(identifier, password, currentRole, pin);
        const user = response.user;

        currentUser = user;
        DB.setCurrentUser(user);
        showToast(`Welcome back, ${user.fullName}!`, 'success', 'Login Successful');
        routeUserAfterLogin(user);
      } catch (err) {
        showToast(err.message, 'error', 'Authentication Failed');
      }
    });
  }

  function routeUserAfterLogin(user) {
    if (user.role === 'farmer') {
      if (user.status === 'APPROVED') {
        switchView('farmerDashboard');
      } else if (user.status === 'PENDING_KVIC_APPROVAL') {
        switchView('farmerPending');
      } else if (user.status === 'REJECTED') {
        showToast("Your beekeeper application was rejected by KVIC. Please contact your nearest KVIC State Directorate.", 'error', 'Application Status');
        switchView('auth');
      }
    } else if (user.role === 'kvic') {
      switchView('kvicDashboard');
    } else if (user.role === 'admin') {
      switchView('adminDashboard');
    }
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      currentUser = null;
      DB.setCurrentUser(null);
      showToast("Logged out successfully.", 'info');
      switchView('home');
    });
  }

  if (navBrandHome) {
    navBrandHome.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentUser) {
        routeUserAfterLogin(currentUser);
      } else {
        switchView('home');
      }
    });
  }

  // Navbar link click routing
  document.querySelectorAll('[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.view;
      if (target === 'features') {
        switchView('home');
        const featSec = document.getElementById('features');
        if (featSec) featSec.scrollIntoView({ behavior: 'smooth' });
      } else {
        switchView(target);
      }
    });
  });

  // Hero & Nav Login CTAs
  const heroBtnVerify = document.getElementById('hero-btn-verify');
  if (heroBtnVerify) heroBtnVerify.addEventListener('click', () => switchView('verify'));

  const heroBtnLogin = document.getElementById('hero-btn-login');
  if (heroBtnLogin) {
    heroBtnLogin.addEventListener('click', () => {
      if (currentUser) {
        routeUserAfterLogin(currentUser);
      } else {
        switchView('auth');
      }
    });
  }

  if (btnNavLogin) {
    btnNavLogin.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentUser) {
        routeUserAfterLogin(currentUser);
      } else {
        switchView('auth');
      }
    });
  }

  const linkForgotPass = document.getElementById('link-forgot-pass');
  if (linkForgotPass) {
    linkForgotPass.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('To recover account credentials, authenticate using Aadhaar OTP or contact your KVIC Nodal Officer (Dr. Arvind Sharma / Toll-Free: 1800-HONEY-MISSION).', 'info', 'Password Assistance');
    });
  }

  const btnVerifyNoLogin = document.getElementById('btn-verify-without-login');
  if (btnVerifyNoLogin) btnVerifyNoLogin.addEventListener('click', () => switchView('verify'));

  // Mobile drawer toggle
  if (navHamburgerBtn && mobileNavDrawer) {
    navHamburgerBtn.addEventListener('click', () => {
      mobileNavDrawer.classList.toggle('open');
    });
  }

  // Password eye toggle
  if (pwdEyeToggle && loginPassword) {
    pwdEyeToggle.addEventListener('click', () => {
      const isPwd = loginPassword.type === 'password';
      loginPassword.type = isPwd ? 'text' : 'password';
      pwdEyeToggle.textContent = isPwd ? '🙈' : '👁️';
    });
  }

  // Language segmented toggle
  const btnLangEn = document.getElementById('lang-toggle-en');
  const btnLangHi = document.getElementById('lang-toggle-hi');
  if (btnLangEn && typeof I18N !== 'undefined') {
    btnLangEn.addEventListener('click', () => I18N.setLang('en'));
  }
  if (btnLangHi && typeof I18N !== 'undefined') {
    btnLangHi.addEventListener('click', () => I18N.setLang('hi'));
  }

  // Theme toggle button
  const btnThemeToggle = document.getElementById('theme-toggle-btn');
  if (btnThemeToggle && typeof THEME !== 'undefined') {
    btnThemeToggle.addEventListener('click', () => THEME.toggle());
  }

  // Role card click listeners
  if (tabFarmer) tabFarmer.addEventListener('click', () => setLoginRole('farmer'));
  if (tabKvic) tabKvic.addEventListener('click', () => setLoginRole('kvic'));
  if (tabAdmin) tabAdmin.addEventListener('click', () => setLoginRole('admin'));

  // Verify A Jar in-page lookup
  const formVerifyJar = document.getElementById('form-verify-jar');
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
            if (elTitle) elTitle.textContent = `Batch #${b.batchId || b.batch_id || batchId}`;
            if (elType) elType.textContent = b.floralSource || b.floral_source || r.type;
            if (elRegion) elRegion.textContent = `${b.district || 'Anand'}, ${b.state || 'Gujarat'}`;
            if (elMoist) elMoist.textContent = `${b.moisturePercent || b.moisture_pct || 17.2}% (Pure < 20%)`;
            if (elHash) elHash.textContent = b.blockHash || b.block_hash || r.hash;
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
  });

  // Camera scan QR button & overlay shortcuts
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
  }

  // FAQ Accordion
  const accordionContainer = document.getElementById('faq-accordion-container');
  if (accordionContainer) {
    accordionContainer.addEventListener('click', (e) => {
      const headerBtn = e.target.closest('.accordion-header-btn');
      if (!headerBtn) return;
      const item = headerBtn.closest('.accordion-item');
      if (!item) return;

      const isOpen = item.classList.contains('open');
      accordionContainer.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  }

  // FAQ Category Filter Pills
  document.querySelectorAll('.faq-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.faq-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.faqCat;
      document.querySelectorAll('#faq-accordion-container .accordion-item').forEach(item => {
        if (cat === 'all' || item.dataset.cat === cat) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // FAQ Search
  const faqSearchInput = document.getElementById('faq-search-input');
  const faqSearchBtn = document.getElementById('faq-search-btn');
  function filterFaq() {
    const q = (faqSearchInput ? faqSearchInput.value : '').toLowerCase().trim();
    document.querySelectorAll('#faq-accordion-container .accordion-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = (!q || text.includes(q)) ? 'block' : 'none';
    });
  }
  if (faqSearchInput) faqSearchInput.addEventListener('input', filterFaq);
  if (faqSearchBtn) faqSearchBtn.addEventListener('click', filterFaq);

  // How To Use Dynamic Step Cards
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
  }

  function switchFarmerTab(tabKey) {
    const validTabs = ['dash', 'hives', 'harvest', 'batches', 'market', 'inspection'];
    if (!validTabs.includes(tabKey)) tabKey = 'dash';

    document.querySelectorAll('[data-sidebar-tab]').forEach(b => {
      b.classList.toggle('active', b.dataset.sidebarTab === tabKey);
    });

    validTabs.forEach(key => {
      const el = document.getElementById(`farmer-subview-${key}`);
      if (el) {
        el.style.display = key === tabKey ? 'block' : 'none';
      }
    });
  }

  // Farmer Tab Bar (All 6 Working Tabs)
  document.querySelectorAll('[data-sidebar-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      switchFarmerTab(btn.dataset.sidebarTab);
    });
  });

  // Profile Dropdown Toggle
  const profileTrigger = document.getElementById('profile-dropdown-trigger');
  const profileMenu = document.getElementById('profile-dropdown-menu');
  if (profileTrigger && profileMenu) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle('open');
    });
    document.addEventListener('click', () => profileMenu.classList.remove('open'));
    profileMenu.addEventListener('click', e => e.stopPropagation());
  }
  // Profile menu actions
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
  }

  // QR Scanner Overlay
  const qrScannerOverlay = document.getElementById('qr-scanner-overlay');
  const btnQrScannerClose = document.getElementById('btn-qr-scanner-close');
  if (btnQrScannerClose && qrScannerOverlay) {
    btnQrScannerClose.addEventListener('click', () => {
      qrScannerOverlay.classList.remove('visible');
    });
    qrScannerOverlay.addEventListener('click', (e) => {
      if (e.target === qrScannerOverlay) qrScannerOverlay.classList.remove('visible');
    });
  }

  // Farmer Quick Action Cards
  const qaAddHarvest = document.getElementById('quick-act-add-harvest');
  if (qaAddHarvest) {
    qaAddHarvest.addEventListener('click', () => switchFarmerTab('harvest'));
  }
  const qaBatches = document.getElementById('quick-act-batches');
  if (qaBatches) {
    qaBatches.addEventListener('click', () => switchFarmerTab('batches'));
  }
  const qaSell = document.getElementById('quick-act-sell');
  if (qaSell) {
    qaSell.addEventListener('click', () => switchFarmerTab('market'));
  }
  const qaInspection = document.getElementById('quick-act-inspection');
  if (qaInspection) {
    qaInspection.addEventListener('click', () => switchFarmerTab('inspection'));
  }

  // Quick Auto-Fill Credentials Handler
  const fillFarmerApproved = document.getElementById('fill-cred-farmer-approved');
  const fillFarmerPending = document.getElementById('fill-cred-farmer-pending');
  const fillKvic = document.getElementById('fill-cred-kvic');
  const fillAdmin = document.getElementById('fill-cred-admin');

  if (fillFarmerApproved) {
    fillFarmerApproved.addEventListener('click', () => {
      setLoginRole('farmer');
      loginIdentifier.value = '9876543210';
      loginPassword.value = 'password123';
      showToast('Filled Farmer (Approved) credentials: Ramesh Patel', 'info');
    });
  }

  if (fillFarmerPending) {
    fillFarmerPending.addEventListener('click', () => {
      setLoginRole('farmer');
      loginIdentifier.value = '9988776655';
      loginPassword.value = 'password123';
      showToast('Filled Farmer (Pending KVIC) credentials: Suresh Verma', 'info');
    });
  }

  if (fillKvic) {
    fillKvic.addEventListener('click', () => {
      setLoginRole('kvic');
      loginIdentifier.value = 'kvic.officer@kvic.gov.in';
      loginPassword.value = 'password123';
      if (loginSecurityPin) loginSecurityPin.value = '7890';
      showToast('Filled KVIC Officer credentials: Dr. Arvind Sharma', 'info');
    });
  }

  if (fillAdmin) {
    fillAdmin.addEventListener('click', () => {
      setLoginRole('admin');
      loginIdentifier.value = 'admin@beehive.gov.in';
      loginPassword.value = 'password123';
      showToast('Filled Consortium Admin credentials: Rajeshwar Sengupta', 'info');
    });
  }

  // ========================================================
  // FARMER REGISTRATION MODAL & KVIC DATABASE CHECK ENGINE
  // ========================================================
  btnOpenRegister.addEventListener('click', () => {
    modalFarmerReg.classList.remove('hidden');
    formFarmerRegister.style.display = 'block';
    regResultCard.style.display = 'none';
    regScanOverlay.style.display = 'none';
    formFarmerRegister.reset();
  });

  btnCloseRegModal.addEventListener('click', () => {
    modalFarmerReg.classList.add('hidden');
  });

  formFarmerRegister.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('reg-fullname').value.trim();
    const aadhaar = document.getElementById('reg-aadhaar').value.replace(/\s+/g, '').trim();
    const phone = document.getElementById('reg-phone').value.replace(/\s+/g, '').trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const state = document.getElementById('reg-state').value;
    const district = document.getElementById('reg-district').value.trim();
    const village = document.getElementById('reg-village').value.trim();
    const beeBoxes = parseInt(document.getElementById('reg-boxes').value, 10) || 10;
    const honeyMissionIdInput = document.getElementById('reg-honey-mission-id').value.trim();

    regScanOverlay.style.display = 'flex';
    scanStepText.textContent = "Connecting to KVIC Central PostgreSQL Database...";

    setTimeout(() => {
      scanStepText.textContent = `Querying kvic_master_registry for Aadhaar ${aadhaar.substring(0, 4)}••••${aadhaar.substring(8)}...`;
    }, 600);

    try {
      const response = await BeeHiveAPI.registerFarmer({
        fullName,
        aadhaar,
        phone,
        email,
        password,
        state,
        district,
        village,
        beeBoxes,
        honeyMissionId: honeyMissionIdInput
      });

      regScanOverlay.style.display = 'none';
      formFarmerRegister.style.display = 'none';
      regResultCard.style.display = 'block';

      const user = response.user;

      if (response.verified) {
        // AUTO-APPROVED!
        regResultCard.innerHTML = `
          <div class="verification-result-box result-approved">
            <div class="result-badge-icon">✓</div>
            <h3 style="color: var(--emerald-accent); font-size: 1.3rem; margin-bottom: 8px;">
              Verified via KVIC Honey Mission Database!
            </h3>
            <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 480px; margin: 0 auto 16px;">
              Your Aadhaar details matched official records in PostgreSQL <code>kvic_master_registry</code>. Identity auto-approved and recorded on-chain.
            </p>
            <div style="background: var(--surface-tint); border: 1px solid var(--border); padding: 14px; border-radius: 8px; text-align: left; margin-bottom: 20px; font-size: 0.84rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: var(--text-muted);">Allocated Honey Mission ID:</span>
                <span style="font-weight: 700; color: var(--gold-accent); font-family: var(--font-mono);">${user.honeyMissionId}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: var(--text-muted);">Assigned Blockchain Identity:</span>
                <span style="font-family: var(--font-mono); color: var(--emerald-accent);">${user.walletAddress}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Status in PostgreSQL:</span>
                <span class="status-badge-approved" style="padding: 2px 8px; font-size: 0.72rem;">✓ AUTO-APPROVED</span>
              </div>
            </div>
            <button class="btn-primary" id="btn-proceed-approved" style="max-width: 280px; margin: 0 auto;">
              Enter Farmer Dashboard →
            </button>
          </div>
        `;

        document.getElementById('btn-proceed-approved').addEventListener('click', () => {
          modalFarmerReg.classList.add('hidden');
          currentUser = user;
          DB.setCurrentUser(user);
          switchView('farmerDashboard');
          showToast(`Welcome ${fullName}! Your account is active.`, 'success');
        });
      } else {
        // PENDING KVIC APPROVAL!
        regResultCard.innerHTML = `
          <div class="verification-result-box result-pending">
            <div class="result-badge-icon">⏳</div>
            <h3 style="color: var(--amber-primary); font-size: 1.3rem; margin-bottom: 8px;">
              Application Submitted: KVIC Verification Pending
            </h3>
            <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 500px; margin: 0 auto 16px;">
              Your Aadhaar UID was <strong>not found</strong> in the KVIC Master Registry. Your application has been stored in PostgreSQL and dispatched to the <strong>KVIC State Nodal Officer</strong> for physical verification.
            </p>
            <div style="background: var(--surface-tint); border: 1px solid var(--border); padding: 14px; border-radius: 8px; text-align: left; margin-bottom: 20px; font-size: 0.84rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: var(--text-muted);">Application Reference Number:</span>
                <span style="font-weight: 700; color: var(--gold-accent); font-family: var(--font-mono);">${user.applicationId}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: var(--text-muted);">Assigned Inspection Office:</span>
                <span style="font-weight: 600; color: var(--text);">KVIC State Directorate (${state})</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Current Status in PostgreSQL:</span>
                <span class="status-badge-pending" style="padding: 2px 8px; font-size: 0.72rem;">⏳ PENDING KVIC APPROVAL</span>
              </div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
              <button class="btn-primary" id="btn-proceed-pending" style="width: auto;">
                View Application Tracker →
              </button>
            </div>
          </div>
        `;

        document.getElementById('btn-proceed-pending').addEventListener('click', () => {
          modalFarmerReg.classList.add('hidden');
          currentUser = user;
          DB.setCurrentUser(user);
          switchView('farmerPending');
          showToast(`Application #${user.applicationId} saved in PostgreSQL. Awaiting KVIC officer review.`, 'warning');
        });
      }
    } catch (err) {
      regScanOverlay.style.display = 'none';
      showToast(err.message, 'error', 'Registration Error');
    }
  });

  // ========================================================
  // VIEW: FARMER PENDING APPROVAL LOGIC
  // ========================================================
  function renderFarmerPendingView() {
    if (!currentUser) return;
    document.getElementById('pending-farmer-name').textContent = currentUser.fullName;
    document.getElementById('pending-farmer-aadhaar').textContent = currentUser.aadhaar 
      ? `${currentUser.aadhaar.substring(0, 4)} •••• ${currentUser.aadhaar.substring(8)}` 
      : 'Not Provided';
    document.getElementById('pending-farmer-phone').textContent = currentUser.phone;
    document.getElementById('pending-farmer-location').textContent = `${currentUser.district}, ${currentUser.state}`;
    document.getElementById('pending-farmer-boxes').textContent = `${currentUser.beeBoxes || 10} Boxes`;
    document.getElementById('pending-app-id').textContent = currentUser.applicationId || 'APP-KVIC-2026-9041';

    const btnApproveNow = document.getElementById('btn-quick-approve-current');
    btnApproveNow.onclick = async () => {
      await approveFarmerById(currentUser.id);
    };

    const btnGoToKvic = document.getElementById('btn-switch-to-kvic-review');
    btnGoToKvic.onclick = async () => {
      try {
        const res = await BeeHiveAPI.login('kvic.officer@kvic.gov.in', 'password123', 'kvic', '7890');
        currentUser = res.user;
        DB.setCurrentUser(res.user);
        setLoginRole('kvic');
        switchView('kvicDashboard');
        showToast("Switched to KVIC Nodal Officer portal in PostgreSQL.", 'info');
      } catch (err) {
        showToast("Switched to KVIC mode.", 'info');
      }
    };
  }

  async function approveFarmerById(farmerId) {
    try {
      const res = await BeeHiveAPI.approveFarmer(farmerId, 'Dr. Arvind Sharma (KVIC Nodal Officer)');
      const approvedFarmer = res.user;
      showToast(`Farmer ${approvedFarmer.fullName} has been officially approved by KVIC in PostgreSQL!`, 'success', 'Approval Confirmed');

      if (currentUser && currentUser.id === farmerId) {
        currentUser = approvedFarmer;
        DB.setCurrentUser(approvedFarmer);
        switchView('farmerDashboard');
      } else if (currentUser && currentUser.role === 'kvic') {
        await renderKvicDashboard();
      }
    } catch (err) {
      showToast(err.message, 'error', 'Approval Error');
    }
  }

  // ========================================================
  // VIEW: APPROVED FARMER DASHBOARD
  // ========================================================
  // ========================================================
  // APIARY STATE & MONITORED COLONIES MANAGEMENT
  // ========================================================
  let currentApiaryId = 'APIARY-04';
  let farmerApiaries = [];

  async function loadFarmerApiaries() {
    if (!currentUser) return;
    try {
      farmerApiaries = await BeeHiveAPI.getFarmerApiaries(currentUser.id);
      renderApiaryChips();
      populateApiaryDropdowns();
      const current = farmerApiaries.find(a => a.id === currentApiaryId) || farmerApiaries[0];
      if (current) {
        currentApiaryId = current.id;
        applyApiaryMetrics(current);
      }
    } catch (e) {
      console.warn("Failed to load farmer apiaries:", e);
    }
  }

  function renderApiaryChips() {
    const chipContainer = document.getElementById('apiary-quick-chips');
    if (!chipContainer) return;
    chipContainer.innerHTML = '';
    farmerApiaries.forEach(apiary => {
      const isSelected = apiary.id === currentApiaryId;
      const isSwarm = apiary.swarmingRisk === 'HIGH_SWARM_WARNING';
      const isModerate = apiary.swarmingRisk === 'MODERATE';
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `apiary-chip ${isSelected ? 'active' : ''}`;
      chip.dataset.id = apiary.id;
      chip.innerHTML = `
        <span>${isSwarm ? '🚨' : isModerate ? '⚠️' : '🐝'}</span>
        <span>${apiary.name.split(' (')[0]}</span>
        <span style="font-family: var(--font-mono); font-size: 0.68rem; opacity: 0.85;">${apiary.weightKg}kg</span>
      `;
      chip.addEventListener('click', () => {
        selectApiary(apiary.id);
      });
      chipContainer.appendChild(chip);
    });
  }

  function populateApiaryDropdowns() {
    const selects = [
      document.getElementById('select-farmer-apiary'),
      document.getElementById('harvest-cycle-apiary'),
      document.getElementById('batch-apiary')
    ];

    selects.forEach(sel => {
      if (!sel) return;
      sel.innerHTML = '';
      farmerApiaries.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        const statusText = a.swarmingRisk === 'HIGH_SWARM_WARNING' 
          ? '🚨 Swarm Buzz Alert!' 
          : a.swarmingRisk === 'MODERATE' 
            ? '⚠️ Pre-Swarm Check' 
            : `${a.weightKg} kg • Ready`;
        opt.textContent = `${a.name} • Scale: ${a.weightKg} kg • ${statusText}`;
        sel.appendChild(opt);
      });
      sel.value = currentApiaryId;
    });
  }

  async function selectApiary(apiaryId) {
    currentApiaryId = apiaryId;
    const apiary = farmerApiaries.find(a => a.id === apiaryId);
    if (!apiary) return;

    // Synchronize active dropdowns and quick chips
    const selects = [
      document.getElementById('select-farmer-apiary'),
      document.getElementById('harvest-cycle-apiary'),
      document.getElementById('batch-apiary')
    ];
    selects.forEach(s => {
      if (s) s.value = apiaryId;
    });

    document.querySelectorAll('.apiary-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.id === apiaryId);
    });

    // Update monitored headers and labels
    const nameDisplay = document.getElementById('active-apiary-name-display');
    if (nameDisplay) nameDisplay.textContent = `${apiary.name} (${apiary.location})`;

    const teleLabel = document.getElementById('telemetry-apiary-label');
    if (teleLabel) teleLabel.textContent = apiary.name;

    const swarmLabel = document.getElementById('swarming-apiary-label');
    if (swarmLabel) swarmLabel.textContent = `${apiary.name} • Hive ${apiary.hiveId}`;

    applyApiaryMetrics(apiary);

    // Fetch and display this apiary's MongoDB Swarming FFT analysis
    try {
      const swarmData = await BeeHiveAPI.getMongoSwarmingAnalysis(apiary.hiveId);
      await updateMongoSwarmingDisplay(swarmData, apiary);
    } catch (e) {
      console.warn("Error fetching apiary swarming analysis:", e);
    }
  }

  function applyApiaryMetrics(apiary) {
    const weightEl = document.getElementById('iot-weight');
    const weightStatus = document.getElementById('iot-weight-status');
    const anomalyEl = document.getElementById('iot-anomaly');
    const anomalyDesc = document.getElementById('iot-anomaly-desc');
    const swarmingEl = document.getElementById('iot-swarming');
    const swarmingDesc = document.getElementById('iot-swarming-desc');
    const diseaseEl = document.getElementById('iot-disease');
    const diseaseDesc = document.getElementById('iot-disease-desc');
    const coreTempEl = document.getElementById('iot-core-temp');
    const hiveHumEl = document.getElementById('iot-hive-humidity');

    const isHighSwarm = apiary.swarmingRisk === 'HIGH_SWARM_WARNING';
    const isModSwarm = apiary.swarmingRisk === 'MODERATE';

    if (weightEl) weightEl.textContent = `${apiary.weightKg} kg`;
    if (weightStatus) {
      weightStatus.textContent = apiary.weightKg >= 44 ? '● Honeycomb Supers Full (Harvest Ready)' : '● Steady Nectar Accumulation';
      weightStatus.style.color = apiary.weightKg >= 44 ? 'var(--gold-accent)' : 'var(--emerald-accent)';
    }

    if (anomalyEl) {
      anomalyEl.textContent = apiary.anomalyDetected ? `⚠️ ${apiary.anomalyType}` : 'None (Normal)';
      anomalyEl.style.color = apiary.anomalyDetected ? '#ef4444' : 'var(--emerald-accent)';
    }
    if (anomalyDesc) {
      anomalyDesc.textContent = apiary.anomalyDetected ? '● Significant deviation detected' : '● Zero sudden weight/thermal drops';
      anomalyDesc.style.color = apiary.anomalyDetected ? '#ef4444' : 'var(--text-muted)';
    }

    if (swarmingEl) {
      swarmingEl.textContent = `${isHighSwarm ? '🚨 HIGH' : isModSwarm ? 'MODERATE' : 'LOW'} (${apiary.acousticFreqHz} Hz)`;
      swarmingEl.style.color = isHighSwarm ? '#ef4444' : (isModSwarm ? '#f59e0b' : 'var(--emerald-accent)');
    }
    if (swarmingDesc) {
      swarmingDesc.textContent = isHighSwarm 
        ? '● 🚨 Queen Piping Alert: Split Hive Today!' 
        : isModSwarm 
          ? '● Elevated Drone Resonance (Pre-Swarm Buzz)' 
          : '● Colony Harmonized (No Swarm Buzz)';
      swarmingDesc.style.color = isHighSwarm ? '#ef4444' : (isModSwarm ? '#f59e0b' : 'var(--text-muted)');
    }

    if (diseaseEl) {
      diseaseEl.textContent = apiary.diseaseRisk;
      diseaseEl.style.color = apiary.diseaseRisk === 'HEALTHY' ? 'var(--emerald-accent)' : '#ef4444';
    }
    if (diseaseDesc) {
      diseaseDesc.textContent = apiary.diseaseRisk === 'HEALTHY' ? '● 0% Varroa / Foulbrood Markers' : '● Pathogen markers detected';
      diseaseDesc.style.color = apiary.diseaseRisk === 'HEALTHY' ? 'var(--emerald-accent)' : '#ef4444';
    }

    if (coreTempEl) coreTempEl.textContent = `${apiary.temperatureC} °C`;
    if (hiveHumEl) hiveHumEl.textContent = `${apiary.humidityPercent} %`;
  }

  // Bind Apiary Dropdowns to switch selection dynamically
  const selectFarmerApiaryEl = document.getElementById('select-farmer-apiary');
  if (selectFarmerApiaryEl) {
    selectFarmerApiaryEl.addEventListener('change', (e) => selectApiary(e.target.value));
  }
  const harvestCycleApiaryEl = document.getElementById('harvest-cycle-apiary');
  if (harvestCycleApiaryEl) {
    harvestCycleApiaryEl.addEventListener('change', (e) => selectApiary(e.target.value));
  }
  const batchApiaryEl = document.getElementById('batch-apiary');
  if (batchApiaryEl) {
    batchApiaryEl.addEventListener('change', (e) => selectApiary(e.target.value));
  }

  // ========================================================
  // VIEW: APPROVED FARMER DASHBOARD
  // ========================================================
  async function renderFarmerDashboard() {
    if (!currentUser) return;

    // Ensure Dashboard tab is active by default
    switchFarmerTab('dash');

    const elFarmerName = document.getElementById('dash-farmer-name');
    if (elFarmerName) elFarmerName.textContent = currentUser.fullName;
    const elHId = document.getElementById('dash-honey-mission-id');
    if (elHId) elHId.textContent = currentUser.honeyMissionId || 'KVIC-HM-2024-OFFICIAL';
    const elWallet = document.getElementById('dash-farmer-wallet');
    if (elWallet) elWallet.textContent = currentUser.walletAddress || '0x71C...4E89';
    const elBoxes = document.getElementById('stat-bee-boxes');
    if (elBoxes) elBoxes.textContent = currentUser.beeBoxes || 20;

    // Load and sync all apiaries for this beekeeper
    await loadFarmerApiaries();

    // Batches from PostgreSQL
    const batches = await BeeHiveAPI.getFarmerBatches(currentUser.id);
    const elTotBatches = document.getElementById('stat-total-batches');
    if (elTotBatches) elTotBatches.textContent = batches.length;

    const totalKg = batches.reduce((acc, b) => acc + (parseFloat(b.quantityKg) || 0), 0);
    const elTotHoney = document.getElementById('stat-total-honey');
    if (elTotHoney) elTotHoney.textContent = `${totalKg} kg`;
    const elPill = document.getElementById('batches-count-pill');
    if (elPill) elPill.textContent = `${batches.length} Batches`;
    const harvestBadge = document.getElementById('farmer-harvest-badge');
    if (harvestBadge) harvestBadge.textContent = `${batches.length} Batches`;

    const tbody = document.getElementById('farmer-batches-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (batches.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No honey batches recorded yet in PostgreSQL. Use the form to mint your first batch!</td></tr>`;
      return;
    }

    batches.forEach(b => {
      const isQrActive = b.qrStatus === 'ACTIVE';
      const isRevoked = b.qrStatus === 'REVOKED';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="batch-tag">${b.batchId}</span></td>
        <td>
          <div style="font-weight: 600; color: var(--gold-accent); font-size: 0.82rem;">${b.apiaryName || b.apiaryId || 'Apiary Colony'}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">${b.apiaryId || 'APIARY-04'}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${b.floralSource}</div>
          <div style="font-size: 0.74rem; color: var(--gold-accent);">${b.quantityKg} kg • Moisture ${b.moisturePercent}%</div>
        </td>
        <td>
          ${isQrActive 
            ? `<span class="status-badge-approved" style="padding: 3px 8px; font-size: 0.72rem; font-weight: 700;">🟢 QR ACTIVATED (${b.packagedUnitsCount || 100} Jars)</span>`
            : isRevoked
              ? `<span style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #f87171; padding: 3px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 700;">⛔ BATCH FROZEN</span>`
              : `<span class="status-badge-pending" style="padding: 3px 8px; font-size: 0.72rem; font-weight: 700;">⏳ QR INACTIVE (Lab Testing)</span>`
          }
          <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 3px;">Status: ${b.packagingStatus || 'PACKAGING_IN_PROGRESS'}</div>
        </td>
        <td>
          <div style="color: ${b.consensusStatus === 'CONSENSUS_VERIFIED_AUTHENTIC' ? 'var(--emerald-accent)' : b.consensusStatus === 'CONSENSUS_FAILED_ANOMALY' ? '#f87171' : 'var(--gold-accent)'}; font-size: 0.76rem; font-weight: 600;">
            ${b.consensusStatus === 'CONSENSUS_VERIFIED_AUTHENTIC' ? '✓ KVIC + NABL MATCHED' : b.consensusStatus === 'CONSENSUS_FAILED_ANOMALY' ? '⚠️ MISMATCH DETECTED' : '⏳ Awaiting Lab Analysis'}
          </div>
          <div class="hash-pill" title="${b.blockHash}">${b.blockHash.substring(0, 10)}...${b.blockHash.substring(b.blockHash.length - 6)}</div>
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn-secondary btn-view-batch-qr" data-batch='${JSON.stringify(b)}' style="padding: 4px 10px; font-size: 0.74rem;">
              🏷️ QR Passport
            </button>
            ${!isQrActive && !isRevoked ? `
              <button class="btn-primary btn-emerald btn-run-lab-test" data-batch-id="${b.batchId}" style="padding: 4px 10px; font-size: 0.72rem;">
                🔬 Run NABL Lab Test
              </button>
            ` : ''}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-view-batch-qr').forEach(btn => {
      btn.addEventListener('click', () => {
        const batchData = JSON.parse(btn.dataset.batch);
        openBatchQrModal(batchData);
      });
    });

    tbody.querySelectorAll('.btn-run-lab-test').forEach(btn => {
      btn.addEventListener('click', async () => {
        const bId = btn.dataset.batchId;
        btn.disabled = true;
        btn.textContent = '⏳ Testing...';
        try {
          await BeeHiveAPI.submitLabReport({
            batchId: bId,
            moisturePercent: 17.2,
            c4SugarPercent: 0.0,
            hmfMgKg: 12.5,
            simulateAnomaly: false
          });
          showToast(`✓ NABL Lab Report matched KVIC Telemetry! Batch #${bId} QR Codes ACTIVATED!`, 'success', 'Dual Consensus Approved');
          await renderFarmerDashboard();
        } catch (e) {
          showToast(e.message, 'error', 'Lab Testing Failed');
        }
      });
    });

    // Also update MongoDB Swarming & Acoustic Telemetry Display for current apiary
    const activeApiary = farmerApiaries.find(a => a.id === currentApiaryId);
    if (activeApiary) {
      const swarmData = await BeeHiveAPI.getMongoSwarmingAnalysis(activeApiary.hiveId);
      await updateMongoSwarmingDisplay(swarmData, activeApiary);
    }
  }

  // ========================================================
  // MONGODB SWARMING & ACOUSTIC SPECTRUM LOGIC
  // ========================================================
  async function updateMongoSwarmingDisplay(customData = null, activeApiary = null) {
    try {
      const hiveId = activeApiary ? activeApiary.hiveId : 'HIVE-ALPHA-01';
      const data = customData || await BeeHiveAPI.getMongoSwarmingAnalysis(hiveId);
      if (!data) return;

      const isHigh = data.swarmingRisk === 'HIGH_SWARM_WARNING';
      const isModerate = data.swarmingRisk === 'MODERATE';

      const freqEl = document.getElementById('mongo-acoustic-freq');
      const descEl = document.getElementById('mongo-acoustic-desc');
      const queenEl = document.getElementById('mongo-queen-piping');
      const queenDescEl = document.getElementById('mongo-queen-desc');
      const decibelEl = document.getElementById('mongo-decibel');
      const probEl = document.getElementById('mongo-swarm-prob');
      const stateEl = document.getElementById('mongo-swarm-state');
      const dominantEl = document.getElementById('spectrum-current-dominant');
      const aiRecEl = document.getElementById('mongo-ai-recommendation');
      const iotSwarmingEl = document.getElementById('iot-swarming');
      const iotSwarmingDesc = document.getElementById('iot-swarming-desc');

      if (freqEl) {
        freqEl.textContent = `${data.dominantFreqHz} Hz`;
        freqEl.style.color = isHigh ? '#ef4444' : (isModerate ? '#f59e0b' : '#38bdf8');
      }

      if (descEl) {
        descEl.textContent = isHigh ? '⚠️ Swarm Departure Buzz' : (isModerate ? 'Elevated Drone Resonance' : 'Normal Worker Hum');
        descEl.style.color = isHigh ? '#ef4444' : 'var(--text-muted)';
      }

      if (queenEl) {
        queenEl.textContent = data.queenPipingDetected ? 'POSITIVE (ACTIVE)' : 'NEGATIVE';
        queenEl.style.color = data.queenPipingDetected ? '#ef4444' : 'var(--emerald-accent)';
      }

      if (queenDescEl) {
        queenDescEl.textContent = data.queenPipingDetected ? '🚨 High Queen Piping Detected' : 'No Pre-Swarm Piping';
        queenDescEl.style.color = data.queenPipingDetected ? '#ef4444' : 'var(--text-muted)';
      }

      if (decibelEl) {
        decibelEl.textContent = `${data.decibelLevel} dB`;
      }

      if (probEl) {
        probEl.textContent = `${data.probabilityPercent}%`;
        probEl.style.color = isHigh ? '#ef4444' : (isModerate ? '#f59e0b' : 'var(--emerald-accent)');
      }

      if (stateEl) {
        stateEl.textContent = isHigh 
          ? '● 🚨 CRITICAL: SWARM IMMINENT' 
          : (isModerate ? '● ⚠️ MODERATE PRE-SWARM' : '● Low Swarm Probability');
        stateEl.style.color = isHigh ? '#ef4444' : (isModerate ? '#f59e0b' : 'var(--emerald-accent)');
      }

      if (dominantEl) {
        dominantEl.textContent = `Peak: ${data.dominantFreqHz} Hz`;
        dominantEl.style.color = isHigh ? '#ef4444' : '#38bdf8';
      }

      if (aiRecEl) {
        aiRecEl.innerHTML = `<strong style="color: ${isHigh ? '#f87171' : (isModerate ? '#f59e0b' : 'var(--emerald-accent)')};">AI Recommendation:</strong> ${data.aiRecommendation}`;
      }

      if (iotSwarmingEl) {
        iotSwarmingEl.textContent = `${isHigh ? '🚨 HIGH' : (isModerate ? 'MODERATE' : 'LOW')} (${data.dominantFreqHz} Hz)`;
        iotSwarmingEl.style.color = isHigh ? '#ef4444' : (isModerate ? '#f59e0b' : 'var(--text-main)');
      }
      if (iotSwarmingDesc) {
        iotSwarmingDesc.textContent = isHigh ? '● 🚨 Queen Piping Alert: Split Hive Today!' : (isModerate ? '● Elevated Drone Resonance' : '● Colony Harmonized (No Swarm Buzz)');
        iotSwarmingDesc.style.color = isHigh ? '#ef4444' : (isModerate ? '#f59e0b' : 'var(--text-muted)');
      }

      // Update Frequency Spectrum Bars dynamically
      const spectrumContainer = document.getElementById('mongo-spectrum-bars');
      if (spectrumContainer) {
        const bins = isHigh 
          ? [ { f: '120Hz', h: '30%', c: '#38bdf8' }, { f: '180Hz', h: '45%', c: '#38bdf8' }, { f: '240Hz', h: '55%', c: '#38bdf8' }, { f: '360Hz', h: '75%', c: '#f59e0b' }, { f: '485Hz', h: '98%', c: '#ef4444' }, { f: '520Hz', h: '80%', c: '#ef4444' } ]
          : (isModerate 
            ? [ { f: '120Hz', h: '25%', c: '#38bdf8' }, { f: '180Hz', h: '40%', c: '#38bdf8' }, { f: '240Hz', h: '70%', c: '#f59e0b' }, { f: '310Hz', h: '88%', c: '#f59e0b' }, { f: '420Hz', h: '35%', c: '#38bdf8' }, { f: '520Hz', h: '15%', c: '#38bdf8' } ]
            : [ { f: '120Hz', h: '28%', c: '#38bdf8' }, { f: '180Hz', h: '45%', c: '#38bdf8' }, { f: '215Hz', h: '85%', c: 'var(--emerald-accent)' }, { f: '280Hz', h: '35%', c: '#38bdf8' }, { f: '420Hz', h: '18%', c: '#38bdf8' }, { f: '520Hz', h: '10%', c: '#38bdf8' } ]);
        
        spectrumContainer.innerHTML = bins.map(b => `
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <div style="width: 100%; height: ${b.h}; background: ${b.c}; border-radius: 2px; transition: height 0.5s ease;"></div>
            <span style="font-size: 0.65rem; color: ${b.c}; font-family: var(--font-mono);">${b.f}</span>
          </div>
        `).join('');
      }
    } catch (e) {
      console.warn("MongoDB Swarming display error:", e);
    }
  }

  // Handle Simulate Swarm Buzz Spike Button for the current apiary
  const btnSimulateSwarm = document.getElementById('btn-simulate-swarm-spike');
  if (btnSimulateSwarm) {
    btnSimulateSwarm.addEventListener('click', async () => {
      btnSimulateSwarm.disabled = true;
      btnSimulateSwarm.textContent = '⏳ Ingesting Spike into MongoDB...';
      try {
        const activeApiary = farmerApiaries.find(a => a.id === currentApiaryId) || { hiveId: 'HIVE-ALPHA-01', name: 'Apiary #4' };
        await BeeHiveAPI.simulateMongoSwarmingSpike(activeApiary.hiveId, currentUser ? currentUser.id : 'FARMER-001');
        showToast(`🚨 Swarm acoustic surge (485 Hz, Queen Piping) ingested into MongoDB for ${activeApiary.name}!`, 'error', 'MongoDB Swarm Spike');
        // Refresh swarming analytics for this apiary
        const analysis = await BeeHiveAPI.getMongoSwarmingAnalysis(activeApiary.hiveId);
        await updateMongoSwarmingDisplay(analysis, activeApiary);
      } catch (err) {
        showToast(err.message, 'error', 'Ingestion Failed');
      } finally {
        btnSimulateSwarm.disabled = false;
        btnSimulateSwarm.textContent = '⚡ Ingest Bio-Acoustic Surge (MongoDB + AI)';
      }
    });
  }

  // Handle View Raw MongoDB Document Modal
  const btnViewMongoDoc = document.getElementById('btn-view-raw-mongo-doc');
  const modalMongoDoc = document.getElementById('modal-mongo-doc');
  const btnCloseMongoModal = document.getElementById('btn-close-mongo-doc-modal');
  const btnCloseMongoBtn = document.getElementById('btn-close-mongo-doc-btn');
  const mongoJsonViewer = document.getElementById('mongo-raw-json-viewer');

  if (btnViewMongoDoc && modalMongoDoc) {
    btnViewMongoDoc.addEventListener('click', async () => {
      mongoJsonViewer.textContent = 'Loading latest JSON document from MongoDB...';
      modalMongoDoc.style.display = 'flex';
      try {
        const docs = await BeeHiveAPI.getMongoDocuments(1);
        if (docs && docs.length > 0) {
          mongoJsonViewer.textContent = JSON.stringify(docs[0], null, 2);
          document.getElementById('mongo-modal-doc-time').textContent = new Date(docs[0].timestamp || docs[0].createdAt).toLocaleString();
        } else {
          mongoJsonViewer.textContent = '// No documents found in hive_telemetry_documents';
        }
      } catch (e) {
        mongoJsonViewer.textContent = JSON.stringify({ error: e.message }, null, 2);
      }
    });

    const closeModal = () => { modalMongoDoc.style.display = 'none'; };
    if (btnCloseMongoModal) btnCloseMongoModal.addEventListener('click', closeModal);
    if (btnCloseMongoBtn) btnCloseMongoBtn.addEventListener('click', closeModal);
    modalMongoDoc.addEventListener('click', (e) => {
      if (e.target === modalMongoDoc) closeModal();
    });
  }

  function startIotSimulation() {
    stopIotSimulation();
    const weightEl = document.getElementById('iot-weight');
    const swarmingEl = document.getElementById('iot-swarming');
    const pulseEl = document.getElementById('telemetry-save-pulse');

    iotInterval = setInterval(async () => {
      telemetryCounter++;
      const activeApiary = farmerApiaries.find(a => a.id === currentApiaryId) || {
        id: 'APIARY-04',
        name: 'Apiary #4 (Mogar Central Orchard)',
        hiveId: 'HIVE-ALPHA-01',
        weightKg: 46.4,
        temperatureC: 35.1,
        humidityPercent: 58.4,
        acousticFreqHz: 215,
        swarmingRisk: 'LOW',
        anomalyDetected: false,
        anomalyType: 'NORMAL',
        diseaseRisk: 'HEALTHY'
      };

      // Live natural tiny fluctuations around this apiary's base
      const baseWeight = activeApiary.weightKg || 46.0;
      const weight = (baseWeight + (Math.random() * 0.3 - 0.15)).toFixed(2);
      const temp = (activeApiary.temperatureC + (Math.random() * 0.2 - 0.1)).toFixed(1);
      const hum = Math.floor(activeApiary.humidityPercent + (Math.random() * 2 - 1));
      const sound = Math.floor(activeApiary.acousticFreqHz + (Math.random() * 4 - 2));

      if (weightEl) weightEl.textContent = `${weight} kg`;
      if (swarmingEl && activeApiary.swarmingRisk !== 'HIGH_SWARM_WARNING') {
        swarmingEl.textContent = `LOW (${sound} Hz)`;
      }

      // Every 3 ticks (~12 seconds), persist a real reading to PostgreSQL
      if (telemetryCounter % 3 === 0 && currentUser && currentUser.role === 'farmer') {
        try {
          if (pulseEl) pulseEl.textContent = '⏳ Saving to DB...';
          await BeeHiveAPI.recordTelemetry({
            farmerId: currentUser.id,
            hiveId: activeApiary.hiveId,
            apiaryId: activeApiary.id,
            apiaryName: activeApiary.name,
            weightKg: parseFloat(weight),
            temperatureC: parseFloat(temp),
            humidityPercent: parseFloat(hum),
            acousticFreqHz: parseFloat(sound),
            swarmingRisk: activeApiary.swarmingRisk || 'LOW',
            anomalyDetected: activeApiary.anomalyDetected || false,
            anomalyType: activeApiary.anomalyType || 'NORMAL',
            diseaseRisk: activeApiary.diseaseRisk || 'HEALTHY',
            aiConfidenceScore: 98.9
          });
          if (pulseEl) pulseEl.textContent = '● Persisted to PostgreSQL';
        } catch (e) {
          console.warn("Auto telemetry save error:", e);
        }
      }
    }, 4000);
  }

  function stopIotSimulation() {
    if (iotInterval) {
      clearInterval(iotInterval);
      iotInterval = null;
    }
  }

  const formQuickBatch = document.getElementById('form-quick-batch');
  const batchDateInput = document.getElementById('batch-date');
  if (batchDateInput) {
    batchDateInput.value = new Date().toISOString().split('T')[0];
  }

  formQuickBatch.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const apiarySelect = document.getElementById('batch-apiary');
    const apiaryId = apiarySelect ? apiarySelect.value : currentApiaryId;
    const activeApiary = farmerApiaries.find(a => a.id === apiaryId) || { id: apiaryId, name: 'Apiary Colony' };
    const apiaryName = activeApiary.name;

    const floral = document.getElementById('batch-floral').value;
    const qty = parseFloat(document.getElementById('batch-quantity').value) || 50;
    const moisture = parseFloat(document.getElementById('batch-moisture').value) || 17.5;
    const date = document.getElementById('batch-date').value;

    try {
      const res = await BeeHiveAPI.createHoneyBatch({
        farmerId: currentUser.id,
        apiaryId,
        apiaryName,
        floralSource: floral,
        quantityKg: qty,
        moisturePercent: moisture,
        harvestDate: date
      });

      formQuickBatch.reset();
      document.getElementById('batch-date').value = new Date().toISOString().split('T')[0];
      if (apiarySelect) apiarySelect.value = apiaryId;

      await renderFarmerDashboard();
      
      const flagNotice = res.harvestAudit 
        ? `\n📡 Automated KVIC Audit: ${res.harvestAudit.flagColor} Flag transmitted to KVIC Nodal Officer!`
        : '';

      showToast(
        `Honey batch #${res.batch.batchId} minted for ${apiaryName}! ${flagNotice}`, 
        res.harvestAudit?.flagColor === 'RED' ? 'warning' : 'success', 
        'Harvest On-Chain & KVIC Flagged'
      );
      openBatchQrModal(res.batch);
    } catch (err) {
      showToast(err.message, 'error', 'Batch Minting Failed');
    }
  });

  function openBatchQrModal(batch) {
    if (!batch) return;
    const batchIdEl = document.getElementById('qr-modal-batch-id');
    if (batchIdEl) batchIdEl.textContent = batch.batchId || 'HM-BATCH';

    const infoEl = document.getElementById('qr-modal-info');
    if (infoEl) infoEl.textContent = `${batch.floralSource || 'Floral'} • ${batch.quantityKg || 50} kg • Moisture: ${batch.moisturePercent || 17.2}% • Apiary: ${batch.apiaryName || batch.apiaryId || 'Apiary Colony'}`;

    const hashEl = document.getElementById('qr-modal-hash');
    if (hashEl) hashEl.textContent = batch.blockHash || '0x...';
    
    // Set real machine-readable QR image source
    const qrImg = document.getElementById('qr-modal-image');
    if (qrImg) {
      qrImg.src = `/api/qr/${encodeURIComponent(batch.batchId)}?t=${Date.now()}`;
    }

    // Set download QR button
    const downloadBtn = document.getElementById('qr-modal-download-btn');
    if (downloadBtn) {
      downloadBtn.href = `/api/qr/${encodeURIComponent(batch.batchId)}?download=1`;
      downloadBtn.download = `${batch.batchId}-qr.png`;
    }

    // Set scan destination URL preview
    const urlDisplay = document.getElementById('qr-modal-url-display');
    const scanUrl = `${window.location.origin}/passport.html?batch=${encodeURIComponent(batch.batchId)}`;
    if (urlDisplay) {
      urlDisplay.textContent = scanUrl;
    }

    const badge = document.getElementById('qr-modal-status-badge');
    const link = document.getElementById('qr-modal-passport-link');
    
    if (badge) {
      if (batch.qrStatus === 'ACTIVE') {
        badge.textContent = '🟢 QR ACTIVATED & MARKET READY';
        badge.className = 'status-badge-approved';
        badge.style.background = 'rgba(16, 185, 129, 0.2)';
        badge.style.color = 'var(--emerald-accent)';
        badge.style.borderColor = 'var(--emerald-accent)';
      } else if (batch.qrStatus === 'REVOKED') {
        badge.textContent = '⛔ BATCH FROZEN / QR REVOKED';
        badge.className = 'status-badge-pending';
        badge.style.background = 'rgba(239, 68, 68, 0.2)';
        badge.style.borderColor = '#ef4444';
        badge.style.color = '#f87171';
      } else {
        badge.textContent = '⏳ QR INACTIVE (PACKAGING SEALED - AWAITING LAB MATCH)';
        badge.className = 'status-badge-pending';
        badge.style.background = 'rgba(245, 158, 11, 0.2)';
        badge.style.borderColor = 'var(--amber-primary)';
        badge.style.color = 'var(--gold-accent)';
      }
    }

    if (link) {
      link.href = `/passport.html?batch=${encodeURIComponent(batch.batchId)}`;
    }

    if (modalBatchQr) modalBatchQr.classList.remove('hidden');
  }

  btnCloseQrModal.addEventListener('click', () => modalBatchQr.classList.add('hidden'));
  btnCloseQrAction.addEventListener('click', () => modalBatchQr.classList.add('hidden'));

  // ========================================================
  // HARVEST DAY AI CYCLE ANALYSIS & KVIC FLAGGING HANDLER
  // ========================================================
  const formHarvestAi = document.getElementById('form-harvest-ai');
  if (formHarvestAi) {
    formHarvestAi.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentUser) return;

      const apiarySelect = document.getElementById('harvest-cycle-apiary');
      const apiaryId = apiarySelect ? apiarySelect.value : currentApiaryId;
      const activeApiary = farmerApiaries.find(a => a.id === apiaryId) || { id: apiaryId, name: 'Apiary Colony' };
      const apiaryName = activeApiary.name;

      const startDate = document.getElementById('harvest-cycle-start').value;
      const harvestDate = document.getElementById('harvest-cycle-end').value;
      const simulateAnomaly = document.getElementById('check-simulate-adulteration').checked;
      const btn = document.getElementById('btn-run-harvest-ai');
      const resultPanel = document.getElementById('harvest-ai-result-panel');

      btn.disabled = true;
      btn.innerHTML = `<span>⏳ Auditing ${apiaryName} in PostgreSQL & Computing Flag...</span>`;

      try {
        const res = await BeeHiveAPI.analyzeHarvestCycle({
          farmerId: currentUser.id,
          apiaryId,
          apiaryName,
          startDate,
          harvestDate,
          simulateAnomaly
        });

        const audit = res.audit;
        const isGreen = audit.flag_color === 'GREEN';

        resultPanel.style.display = 'block';
        resultPanel.style.background = isGreen 
          ? 'rgba(16, 185, 129, 0.12)' 
          : 'rgba(239, 68, 68, 0.12)';
        resultPanel.style.border = `1px solid ${isGreen ? 'var(--emerald-accent)' : '#ef4444'}`;

        resultPanel.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="padding: 4px 14px; border-radius: 9999px; font-weight: 800; font-size: 0.84rem; background: ${isGreen ? 'var(--emerald-accent)' : '#ef4444'}; color: #fff;">
                ${isGreen ? '🟢 PURE HONEY (GREEN FLAG)' : '🚩 SUDDEN CHANGE DETECTED (RED FLAG)'}
              </span>
              <span style="background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); color: var(--gold-accent); padding: 3px 10px; border-radius: 4px; font-size: 0.76rem; font-weight: 700;">
                📍 ${audit.apiary_name || apiaryName}
              </span>
            </div>
            <span style="font-size: 0.74rem; font-family: var(--font-mono); color: var(--gold-accent);">
              Audit Batch: ${audit.batch_id}
            </span>
          </div>

          <h4 style="font-size: 1.05rem; font-weight: 700; color: ${isGreen ? 'var(--emerald-accent)' : '#f87171'}; margin-bottom: 6px;">
            ${audit.flag_title}
          </h4>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4;">
            ${audit.ai_verdict_summary}
          </p>

          <div style="background: var(--surface-tint); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 12px; font-size: 0.8rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">Audited Apiary Colony:</span>
              <span style="font-weight: 700; color: var(--gold-accent);">${audit.apiary_name || apiaryName} (${audit.apiary_id || apiaryId})</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">Cycle Span:</span>
              <span style="font-weight: 600;">${audit.total_days} Days (${audit.start_date.substring(0, 10)} to ${audit.harvest_date.substring(0, 10)})</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">Scale Trajectory:</span>
              <span style="font-weight: 600;">${audit.start_weight_kg} kg → ${audit.end_weight_kg} kg (Net Gain: +${audit.net_weight_gain_kg} kg)</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">Sudden Fluctuations:</span>
              <span style="font-weight: 700; color: ${audit.sudden_changes_detected ? '#f87171' : 'var(--emerald-accent)'};">
                ${audit.sudden_changes_detected ? `YES: Sudden Surge (+${audit.sudden_weight_jump_kg} kg)` : 'NONE (Smooth Natural Curve)'}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Thermal Brood Stability:</span>
              <span style="font-family: var(--font-mono);">${audit.temperature_stability}</span>
            </div>
          </div>

          <div style="margin-bottom: 12px;">
            <div style="font-size: 0.76rem; font-weight: 700; color: var(--gold-accent); margin-bottom: 4px;">AI Telemetry Audit Findings:</div>
            <ul style="padding-left: 20px; font-size: 0.78rem; color: var(--text-muted); line-height: 1.5;">
              ${(audit.flag_reasons || []).map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>

          <div style="background: rgba(56, 189, 248, 0.1); border: 1px dashed var(--blue-accent); padding: 10px 14px; border-radius: 6px; font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div>
              📡 <strong>PostgreSQL & Blockchain Link:</strong> ${audit.flag_color} Flag for <strong>${audit.apiary_name || apiaryName}</strong> logged in PostgreSQL and automatically queued for KVIC Officer review.
            </div>
            <span style="font-family: var(--font-mono); color: var(--blue-accent); font-weight: 600;">
              Status: Transmitted to KVIC
            </span>
          </div>
        `;

        showToast(
          isGreen 
            ? `Harvest analyzed for ${apiaryName}: 🟢 Green Flag dispatched to KVIC!`
            : `Harvest analyzed for ${apiaryName}: 🚩 Red Flag dispatched to KVIC for inspection!`,
          isGreen ? 'success' : 'error',
          'AI Harvest Analysis Complete'
        );

      } catch (err) {
        showToast(err.message, 'error', 'Analysis Failed');
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<span>🧠 Run Harvest AI Cycle Analysis & Transmit Flag to KVIC</span>`;
      }
    });
  }

  // ========================================================
  // FARMER DASHBOARD SUB-PAGE NAVIGATION (ALL 6 TABS)
  // ========================================================
  function switchFarmerSubview(subviewKey) {
    if (subviewKey === 'telemetry') subviewKey = 'dash';
    switchFarmerTab(subviewKey);
  }

  const btnOpenLogBatch = document.getElementById('btn-open-log-batch');
  if (btnOpenLogBatch) {
    btnOpenLogBatch.addEventListener('click', () => {
      switchFarmerTab('harvest');
      const formEl = document.getElementById('form-quick-batch');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const floralEl = document.getElementById('batch-floral');
        if (floralEl) floralEl.focus();
      }
    });
  }

  // ========================================================
  // VIEW: KVIC OFFICIAL DASHBOARD
  // ========================================================
  async function renderKvicDashboard() {
    if (!currentUser) return;
    const nameEl = document.getElementById('kvic-officer-name');
    if (nameEl) nameEl.textContent = currentUser.fullName;
    const officeEl = document.getElementById('kvic-officer-office');
    if (officeEl && currentUser.office) {
      officeEl.textContent = currentUser.office;
    }

    const pendingFarmers = await BeeHiveAPI.getPendingFarmers();
    
    const badge = document.getElementById('kvic-pending-badge');
    if (badge) {
      badge.textContent = pendingFarmers.length;
      badge.style.display = pendingFarmers.length > 0 ? 'inline-block' : 'none';
    }

    const flagsBadge = document.getElementById('kvic-harvest-flags-badge');
    if (flagsBadge) {
      try {
        const audits = await BeeHiveAPI.getKvicHarvestFlags();
        flagsBadge.textContent = audits.length;
        flagsBadge.style.display = audits.length > 0 ? 'inline-block' : 'none';
      } catch (e) {}
    }

    const container = document.getElementById('kvic-pending-cards-container');
    if (!container) return;
    container.innerHTML = '';

    if (pendingFarmers.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; background: var(--bg-card); padding: 40px; border-radius: var(--radius-md); text-align: center; border: 1px dashed var(--border-subtle);">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">🎉</div>
          <h3 style="color: var(--emerald-accent); font-size: 1.2rem; margin-bottom: 6px;">Zero Pending Verifications</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem;">All beekeeper applications in PostgreSQL have been verified and authenticated on the BeeHive Blockchain ledger.</p>
        </div>
      `;
    } else {
      pendingFarmers.forEach(farmer => {
        const card = document.createElement('div');
        card.className = 'app-review-card urgent';
        card.innerHTML = `
          <div class="app-card-header">
            <div>
              <div class="app-farmer-name">${farmer.fullName}</div>
              <div class="app-farmer-meta">Application: <strong style="color: var(--gold-accent);">${farmer.applicationId || 'APP-KVIC-NEW'}</strong></div>
            </div>
            <span class="status-badge-pending" style="font-size: 0.72rem; padding: 2px 8px;">Pending Review</span>
          </div>

          <div class="app-data-row">
            <span class="k">Aadhaar (UIDAI):</span>
            <span class="v" style="font-family: var(--font-mono);">${farmer.aadhaar || 'N/A'}</span>
          </div>
          <div class="app-data-row">
            <span class="k">Mobile Number:</span>
            <span class="v">${farmer.phone}</span>
          </div>
          <div class="app-data-row">
            <span class="k">Location:</span>
            <span class="v">${farmer.village ? farmer.village + ', ' : ''}${farmer.district}, ${farmer.state}</span>
          </div>
          <div class="app-data-row">
            <span class="k">Bee Boxes Declared:</span>
            <span class="v">${farmer.beeBoxes || 10} Boxes</span>
          </div>
          <div class="app-data-row">
            <span class="k">PostgreSQL KVIC DB:</span>
            <span class="v" style="color: #f87171;">Not in pre-seeded registry</span>
          </div>

          <div class="app-card-actions">
            <button class="btn-primary btn-emerald btn-approve-farmer" data-farmer-id="${farmer.id}" style="padding: 9px 12px; font-size: 0.82rem;">
              ✓ Approve Beekeeper
            </button>
            <button class="btn-secondary btn-ruby btn-reject-farmer" data-farmer-id="${farmer.id}" style="padding: 9px 12px; font-size: 0.82rem; justify-content: center;">
              ✗ Reject
            </button>
          </div>
        `;
        container.appendChild(card);
      });

      container.querySelectorAll('.btn-approve-farmer').forEach(btn => {
        btn.addEventListener('click', async () => {
          await approveFarmerById(btn.dataset.farmerId);
        });
      });

      container.querySelectorAll('.btn-reject-farmer').forEach(btn => {
        btn.addEventListener('click', async () => {
          const fid = btn.dataset.farmerId;
          const reason = prompt("Enter reason for rejection:", "Physical apiary inspection failed");
          if (reason) {
            try {
              await BeeHiveAPI.rejectFarmer(fid, reason, 'Dr. Arvind Sharma');
              showToast("Application rejected in PostgreSQL.", 'error');
              await renderKvicDashboard();
            } catch (e) {
              showToast(e.message, 'error');
            }
          }
        });
      });
    }

    await renderKvicMasterDbTable();
  }

  async function renderKvicMasterDbTable(query = '') {
    const tbody = document.getElementById('kvic-master-db-tbody');
    const countPill = document.getElementById('kvic-registry-count-pill');
    if (!tbody) return;

    const kvicDb = await BeeHiveAPI.getKvicMasterDb(query);
    countPill.textContent = `(${kvicDb.length})`;
    tbody.innerHTML = '';

    if (kvicDb.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 18px;">No matching beekeeper records found in PostgreSQL kvic_master_registry.</td></tr>`;
      return;
    }

    kvicDb.forEach(entry => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 600;">${entry.aadhaar}</td>
        <td><strong>${entry.fullName}</strong><div style="font-size: 0.72rem; color: var(--text-muted);">${entry.phone}</div></td>
        <td>${entry.district}, ${entry.state}</td>
        <td><span class="batch-tag" style="font-size: 0.78rem;">${entry.honeyMissionId}</span></td>
        <td>${entry.allocatedBoxes} Boxes</td>
        <td><span class="status-badge-approved" style="padding: 2px 8px; font-size: 0.7rem;">${entry.schemeStatus}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  const kvicTabs = {
    pending: { btn: document.getElementById('kvic-tab-pending'), view: document.getElementById('kvic-subview-pending') },
    registry: { btn: document.getElementById('kvic-tab-registry'), view: document.getElementById('kvic-subview-registry') },
    analytics: { btn: document.getElementById('kvic-tab-analytics'), view: document.getElementById('kvic-subview-analytics') },
    harvestFlags: { btn: document.getElementById('kvic-tab-harvest-flags'), view: document.getElementById('kvic-subview-harvest-flags') }
  };

  Object.keys(kvicTabs).forEach(key => {
    const item = kvicTabs[key];
    if (item && item.btn) {
      item.btn.addEventListener('click', async () => {
        Object.keys(kvicTabs).forEach(k => {
          if (kvicTabs[k].btn) kvicTabs[k].btn.classList.remove('active');
          if (kvicTabs[k].view) kvicTabs[k].view.style.display = 'none';
        });
        item.btn.classList.add('active');
        item.view.style.display = 'block';
        if (key === 'registry') await renderKvicMasterDbTable();
        if (key === 'harvestFlags') await renderKvicHarvestFlags();
      });
    }
  });

  async function renderKvicHarvestFlags() {
    const container = document.getElementById('kvic-harvest-flags-container');
    const badge = document.getElementById('kvic-harvest-flags-badge');
    if (!container) return;

    const audits = await BeeHiveAPI.getKvicHarvestFlags();
    if (badge) badge.textContent = audits.length;

    container.innerHTML = '';
    if (audits.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: var(--text-muted);">No harvest audits received yet.</div>`;
      return;
    }

    audits.forEach(a => {
      const isGreen = a.flagColor === 'GREEN';
      const card = document.createElement('div');
      card.className = 'app-review-card';
      card.style.borderLeft = `4px solid ${isGreen ? 'var(--emerald-accent)' : '#ef4444'}`;

      card.innerHTML = `
        <div class="app-card-header">
          <div>
            <div class="app-farmer-name">${a.farmerName}</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
              <span style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: var(--gold-accent); padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 700;">
                📍 ${a.apiaryName || a.apiaryId || 'Apiary Colony'}
              </span>
              <span style="font-size: 0.74rem; color: var(--text-muted);">${a.district || 'Apiary District'} • Batch: <strong style="color: var(--gold-accent);">${a.batchId}</strong></span>
            </div>
          </div>
          <span style="padding: 3px 10px; border-radius: 9999px; font-weight: 800; font-size: 0.76rem; background: ${isGreen ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; border: 1px solid ${isGreen ? 'var(--emerald-accent)' : '#ef4444'}; color: ${isGreen ? 'var(--emerald-accent)' : '#f87171'};">
            ${isGreen ? '🟢 GREEN FLAG (PURE)' : '🚩 RED FLAG (SUDDEN CHANGE)'}
          </span>
        </div>

        <div style="font-size: 0.85rem; font-weight: 700; color: ${isGreen ? 'var(--emerald-accent)' : '#f87171'}; margin-bottom: 6px;">
          ${a.flagTitle}
        </div>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 10px;">
          ${a.aiVerdictSummary}
        </div>

        <div class="app-data-row">
          <span class="k">Cycle Span:</span>
          <span class="v">${a.totalDays} Days (${a.startDate ? a.startDate.substring(0, 10) : ''} → ${a.harvestDate ? a.harvestDate.substring(0, 10) : ''})</span>
        </div>
        <div class="app-data-row">
          <span class="k">Weight Change:</span>
          <span class="v">${a.startWeightKg} kg → ${a.endWeightKg} kg (+${a.netWeightGainKg} kg)</span>
        </div>
        <div class="app-data-row">
          <span class="k">Sudden Surge:</span>
          <span class="v" style="color: ${a.suddenChangesDetected ? '#f87171' : 'var(--emerald-accent)'}; font-weight: 700;">
            ${a.suddenChangesDetected ? `YES (+${a.suddenWeightJumpKg} kg)` : 'NONE (Natural Influx)'}
          </span>
        </div>
        <div class="app-data-row">
          <span class="k">Current KVIC Action:</span>
          <span class="v" style="font-family: var(--font-mono); color: var(--gold-accent);">${a.kvicAction || 'AWAITING_KVIC_REVIEW'}</span>
        </div>

        <div class="app-card-actions" style="margin-top: 14px;">
          ${isGreen ? `
            <button class="btn-primary btn-emerald btn-kvic-flag-action" data-id="${a.id}" data-action="FAST_TRACK_APPROVED" style="padding: 8px 12px; font-size: 0.78rem;">
              ✓ Fast-Track Certificate & DBT
            </button>
            <button class="btn-secondary btn-kvic-flag-action" data-id="${a.id}" data-action="ROUTINE_AUDIT" style="padding: 8px 12px; font-size: 0.78rem; justify-content: center;">
              📋 Routine Log
            </button>
          ` : `
            <button class="btn-secondary btn-ruby btn-kvic-flag-action" data-id="${a.id}" data-action="NABL_TEST_ORDERED" style="padding: 8px 12px; font-size: 0.78rem; justify-content: center;">
              🔬 Order NABL NMR Test
            </button>
            <button class="btn-secondary btn-ruby btn-kvic-flag-action" data-id="${a.id}" data-action="FREEZE_BATCH" style="padding: 8px 12px; font-size: 0.78rem; justify-content: center;">
              ❄️ Freeze Batch
            </button>
          `}
        </div>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll('.btn-kvic-flag-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const auditId = btn.dataset.id;
        const action = btn.dataset.action;
        try {
          await BeeHiveAPI.takeKvicHarvestAction({
            auditId,
            action,
            remarks: `Action ${action} initiated by KVIC Nodal Officer`
          });
          showToast(`KVIC Action '${action}' executed and recorded on-chain.`, 'success');
          await renderKvicHarvestFlags();
        } catch (e) {
          showToast(e.message, 'error');
        }
      });
    });
  }

  const btnRefreshHarvestFlags = document.getElementById('btn-refresh-harvest-flags');
  if (btnRefreshHarvestFlags) {
    btnRefreshHarvestFlags.addEventListener('click', async () => {
      await renderKvicHarvestFlags();
      showToast("Harvest AI flags refreshed from PostgreSQL.", 'info');
    });
  }

  const searchKvicInput = document.getElementById('input-search-kvic-db');
  if (searchKvicInput) {
    searchKvicInput.addEventListener('input', async (e) => {
      await renderKvicMasterDbTable(e.target.value.trim());
    });
  }

  btnOpenAddKvicMaster.addEventListener('click', () => {
    modalAddKvicMaster.classList.remove('hidden');
    formAddKvicMaster.reset();
  });

  btnCloseKvicAddModal.addEventListener('click', () => {
    modalAddKvicMaster.classList.add('hidden');
  });

  formAddKvicMaster.addEventListener('submit', async (e) => {
    e.preventDefault();
    const aadhaar = document.getElementById('kvic-add-aadhaar').value.replace(/\s+/g, '').trim();
    const name = document.getElementById('kvic-add-name').value.trim();
    const phone = document.getElementById('kvic-add-phone').value.replace(/\s+/g, '').trim();
    const boxes = parseInt(document.getElementById('kvic-add-boxes').value, 10) || 20;
    const state = document.getElementById('kvic-add-state').value.trim();
    const district = document.getElementById('kvic-add-district').value.trim();

    try {
      await BeeHiveAPI.addKvicMasterDb({
        aadhaar, fullName: name, phone, state, district, allocatedBoxes: boxes
      });
      modalAddKvicMaster.classList.add('hidden');
      await renderKvicMasterDbTable();
      showToast(`Beekeeper ${name} saved to PostgreSQL kvic_master_registry. Any registration with this Aadhaar will auto-pass!`, 'success', 'PostgreSQL Updated');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ========================================================
  // VIEW: SYSTEM ADMIN DASHBOARD
  // ========================================================
  async function renderAdminDashboard() {
    if (!currentUser) return;
    const adminNameEl = document.getElementById('admin-user-name');
    if (adminNameEl) adminNameEl.textContent = currentUser.fullName;

    try {
      const users = await BeeHiveAPI.getAllUsers();
      const approved = users.filter(u => u.status === 'APPROVED');
      const pending = users.filter(u => u.status === 'PENDING_KVIC_APPROVAL');

      // Stats
      const usersCountEl = document.getElementById('admin-users-count');
      if (usersCountEl) usersCountEl.textContent = `${users.length}`;
      const approvedEl = document.getElementById('admin-stat-approved');
      if (approvedEl) approvedEl.textContent = `${approved.length}`;
      const pendingEl = document.getElementById('admin-stat-pending');
      if (pendingEl) pendingEl.textContent = `${pending.length}`;

      // Batch stats (reuse from a simple estimate)
      const batchesEl = document.getElementById('admin-stat-batches');
      if (batchesEl) batchesEl.textContent = `${approved.length * 3 + 2}`;
      const blocksEl = document.getElementById('admin-stat-blocks');
      if (blocksEl) blocksEl.textContent = `${users.length * 4 + 9}`;

      const tbody = document.getElementById('admin-users-tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      // If no users from API, show demo users
      const displayUsers = users.length > 0 ? users : [
        { fullName: 'Ramesh Patel', email: 'ramesh.farmer@gmail.com', phone: '9876543210', role: 'farmer', status: 'APPROVED', honeyMissionId: 'KVIC-HM-GJ-2023-0104', approvedBy: 'Dr. Arvind Sharma' },
        { fullName: 'Suresh Verma', email: 'suresh.verma@gmail.com', phone: '9988776655', role: 'farmer', status: 'PENDING_KVIC_APPROVAL', honeyMissionId: null, approvedBy: null },
        { fullName: 'Dr. Arvind Sharma', email: 'kvic.officer@kvic.gov.in', phone: '9876001234', role: 'kvic', status: 'APPROVED', honeyMissionId: 'KVIC-OFF-MH-001', approvedBy: 'Ministry of MSME' },
        { fullName: 'Priya Singh', email: 'priya.beekeeper@gmail.com', phone: '9765432100', role: 'farmer', status: 'APPROVED', honeyMissionId: 'KVIC-HM-UP-2023-0289', approvedBy: 'Dr. Arvind Sharma' },
        { fullName: 'Balram Yadav', email: 'balram.yadav@gmail.com', phone: '9812345678', role: 'farmer', status: 'APPROVED', honeyMissionId: 'KVIC-HM-BR-2024-0052', approvedBy: 'Dr. Arvind Sharma' },
        { fullName: 'Rajeshwar Sengupta', email: 'admin@beehive.gov.in', phone: '9011001100', role: 'admin', status: 'APPROVED', honeyMissionId: 'ADMIN-CONS-001', approvedBy: 'Ministry of MSME' }
      ];

      displayUsers.forEach(u => {
        const tr = document.createElement('tr');
        const roleLabel = u.role === 'farmer' ? '🌾 Farmer' : u.role === 'kvic' ? '🏛️ KVIC Officer' : '🛡️ Admin';
        const roleBadge = `<span class="user-role-tag role-tag-${u.role}">${roleLabel}</span>`;
        let statusBadge = '';
        if (u.status === 'APPROVED') {
          statusBadge = '<span class="status-chip verified" style="padding:2px 8px; font-size:0.7rem;">✓ APPROVED</span>';
        } else if (u.status === 'PENDING_KVIC_APPROVAL') {
          statusBadge = '<span class="status-chip warning" style="padding:2px 8px; font-size:0.7rem;">⏳ PENDING</span>';
        } else {
          statusBadge = '<span class="status-chip danger" style="padding:2px 8px; font-size:0.7rem;">✗ REJECTED</span>';
        }

        tr.innerHTML = `
          <td>
            <div style="font-weight:700;">${u.fullName}</div>
            <div style="margin-top:2px;">${roleBadge}</div>
          </td>
          <td>
            <div style="font-size:0.83rem;">${u.email}</div>
            <div style="font-size:0.72rem; color:var(--text-dim);">${u.phone || '—'}</div>
          </td>
          <td>${statusBadge}</td>
          <td>
            <div style="font-size:0.78rem; font-family:var(--font-mono); color:var(--primary-hover);">${u.honeyMissionId || '—'}</div>
            <div style="font-size:0.7rem; color:var(--text-dim); margin-top:2px;">${u.approvedBy ? 'By: '+u.approvedBy : ''}</div>
          </td>
          <td>
            <div style="display:flex; gap:5px;">
              ${u.status === 'PENDING_KVIC_APPROVAL' ? `<button type="button" class="btn-primary btn-admin-approve" data-user-id="${u.id}" data-name="${u.fullName}" style="padding:3px 10px; font-size:0.7rem;">Approve</button>` : ''}
              <button type="button" class="btn-secondary btn-admin-view-user" data-user='${JSON.stringify(u).replace(/'/g, "&apos;")}' style="padding:3px 8px; font-size:0.7rem;">View</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Attach admin approve button listener
      tbody.querySelectorAll('.btn-admin-approve').forEach(btn => {
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          btn.textContent = '⏳ Approving...';
          try {
            await BeeHiveAPI.approveFarmer(btn.dataset.userId, 'Consortium Super Admin');
            showToast(`✓ Beekeeper ${btn.dataset.name} approved by Consortium Admin!`, 'success', 'Admin Approval');
            await renderAdminDashboard();
          } catch (e) {
            showToast(e.message, 'error');
            btn.disabled = false;
            btn.textContent = 'Approve';
          }
        });
      });

      // Attach admin view user details listener
      tbody.querySelectorAll('.btn-admin-view-user').forEach(btn => {
        btn.addEventListener('click', () => {
          try {
            const u = JSON.parse(btn.dataset.user);
            showToast(`Beekeeper: ${u.fullName} • ${u.phone || u.email} • ID: ${u.honeyMissionId || 'Pending'} • Status: ${u.status}`, 'info', 'Beekeeper Details');
          } catch (e) {}
        });
      });

      // Admin search filter
      const searchInput = document.getElementById('admin-user-search');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const q = searchInput.value.toLowerCase();
          tbody.querySelectorAll('tr').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
          });
        });
      }
    } catch (err) {
      console.error('Admin dashboard error:', err);
    }

    await renderBlockchainLogs();
  }

  async function renderBlockchainLogs() {
    const logsContainer = document.getElementById('blockchain-logs-container');
    const logs = await BeeHiveAPI.getBlockchainLogs();
    logsContainer.innerHTML = '';

    logs.forEach(log => {
      const item = document.createElement('div');
      const isApproved = log.event.includes('APPROVED') || log.event.includes('AUTO_VERIFIED');
      const isBatch = log.event.includes('BATCH');
      item.className = `log-entry ${isApproved ? 'approved' : isBatch ? 'batch' : 'pending'}`;

      item.innerHTML = `
        <div>
          <div class="log-event-title">${log.event}</div>
          <div class="log-event-detail">${log.details}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 3px;">Actor: <strong>${log.actor}</strong></div>
        </div>
        <div class="log-meta">
          <div style="color: var(--gold-accent);">Block #${log.blockNumber}</div>
          <div>${log.txHash}</div>
          <div style="color: var(--text-muted);">${log.timestamp ? log.timestamp.substring(11) : ''}</div>
        </div>
      `;
      logsContainer.appendChild(item);
    });
  }

  // ========================================================
  // INTERACTIVE TRACEABILITY & TECHNOLOGY DEMO CENTER CONTROLLER
  // ========================================================
  const modalTraceabilityDemo = document.getElementById('modal-traceability-demo');
  const btnOpenTraceabilityDemo = document.getElementById('btn-open-traceability-demo');
  const authDemoBanner = document.getElementById('auth-demo-banner');
  const btnCloseTraceabilityDemo = document.getElementById('btn-close-traceability-demo');
  const btnDemoAutoplay = document.getElementById('btn-demo-autoplay');
  const btnDemoAutoplayLabel = document.getElementById('btn-demo-autoplay-label');
  const btnDemoPrevStep = document.getElementById('btn-demo-prev-step');
  const btnDemoNextStep = document.getElementById('btn-demo-next-step');
  const btnDemoModeClean = document.getElementById('demo-mode-clean');
  const btnDemoModeAdulterated = document.getElementById('demo-mode-adulterated');
  const demoStepperTrack = document.getElementById('demo-stepper-track');

  let demoStep = 1;
  let demoMode = 'clean'; // 'clean' | 'adulterated'
  let demoAutoplayTimer = null;
  let demoActiveBatchId = 'HM-BATCH-2026-8812';

  const demoStageMeta = {
    1: {
      title: "Apiary IoT Telemetry & Bio-Acoustic Swarm AI",
      engine: "🍃 MongoDB 8.2 JSON Document Engine",
      component: "MongoDB 8.2 (localhost:27017)",
      tables: "beehive_iot_db.hive_telemetry_documents",
      security: "LoRaWAN Micro-Telemetry & FFT Frequency Analysis",
      explanation: "Continuous edge sensors measure hive scale weight, internal brood temperature, humidity, and acoustic audio vibrations. Sound waves are processed into FFT frequency bins (100 Hz - 600 Hz) in MongoDB to detect queen piping frequencies and pre-swarming conditions before colony loss occurs."
    },
    2: {
      title: "Hive Harvest Day Initiation & Nectar Cycle",
      engine: "🐘 PostgreSQL 18 Relational Ledger",
      component: "PostgreSQL 18 (localhost:5433)",
      tables: "beehive_db.hive_telemetry, beehive_db.honey_batches",
      security: "Relational Referential Integrity & Farmer Aadhaar Proof",
      explanation: "On harvest day, the beekeeper logs the honey lot with its specific apiary origin. The system automatically inspects the 14-day nectar flow telemetry curve to record capped comb moisture, floral source, and net harvest yield."
    },
    3: {
      title: "Automated KVIC Quality Audit & Flagging",
      engine: "🏛️ KVIC AI Oracle Engine",
      component: "PostgreSQL 18 (localhost:5433)",
      tables: "beehive_db.harvest_ai_audits, beehive_db.kvic_notifications",
      security: "AI Scale Velocity Anomaly Detector",
      explanation: "The AI Oracle evaluates continuous telemetry from cycle start to harvest. Natural nectar intake displays a smooth progressive weight curve (+0.5 kg/day). Artificial sugar syrup adulteration produces sudden nocturnal spikes (+10 kg), instantly triggering a verifiable 🚩 RED FLAG to KVIC officers."
    },
    4: {
      title: "Simultaneous Packaging & Market Protection Lock",
      engine: "📦 Simultaneous Packaging Engine",
      component: "PostgreSQL 18 (localhost:5433)",
      tables: "beehive_db.batch_packages (500 units)",
      security: "Cryptographic Market-Lock (INACTIVE QR Protection)",
      explanation: "To eliminate supply chain bottlenecks, honey is bottled into individual jars simultaneously while samples are drawn. Crucially, all jar QR codes remain locked in INACTIVE state. Scanning them displays a warning that laboratory testing is pending, preventing unverified market entry."
    },
    5: {
      title: "NABL Certified Chemical Laboratory Testing",
      engine: "🔬 NABL Chemical Testing Laboratory",
      component: "PostgreSQL 18 (localhost:5433)",
      tables: "beehive_db.lab_reports (NABL ISO/IEC 17025)",
      security: "High-Field NMR & Carbon Isotope Mass Spectrometry (SMR)",
      explanation: "A representative sample (LAB-SMP-2026-8812) undergoes Nuclear Magnetic Resonance (NMR) and isotope ratio analysis. Tests quantify C4 foreign sugars (corn, cane, rice syrup), moisture content (refractometer), HMF index (heating freshness), and botanical pollen origins."
    },
    6: {
      title: "Dual Consensus Verification Engine",
      engine: "⚖️ Consortium Smart Contract Engine",
      component: "Consortium Node #104928 (PostgreSQL 18)",
      tables: "Consensus Logic: NABL Lab Report vs KVIC Field Audit",
      security: "Zero-Trust Cross-Verification Matrix",
      explanation: "The smart contract executes dual consensus: Field IoT moisture must match Chemical Lab moisture (Δ ≤ 1.2%), C4 sugars must be < 7.0%, HMF must be < 40 mg/kg, and KVIC Telemetry Audit must be GREEN. If any test fails or mismatches, the batch is immediately frozen."
    },
    7: {
      title: "Cryptographic Blockchain Ledger Minting",
      engine: "⛓️ SHA-256 Blockchain Ledger",
      component: "PostgreSQL 18 (localhost:5433)",
      tables: "beehive_db.blockchain_ledger, beehive_db.honey_batches",
      security: "Immutable SHA-256 Block with Merkle Root & Previous Hash",
      explanation: "Upon successful dual consensus, the smart contract seals a new block on the ledger. It atomically executes mass activation across all individual jar records in PostgreSQL (INACTIVE ➔ ACTIVE & MARKET READY). If contaminated, all QR codes are permanently REVOKED."
    },
    8: {
      title: "Consumer Public Provenance Passport Scan",
      engine: "📱 Public Verification Gateway",
      component: "passport.html (Live Query to PG 18 & Mongo 8.2)",
      tables: "beehive_db (Batches, Beekeeper, Lab) + MongoDB (Acoustic FFT)",
      security: "End-to-End Cryptographic Farm-to-Jar Transparency",
      explanation: "Any consumer or retail auditor scanning the jar's QR code is directed to an independent, mobile-responsive provenance passport. The passport pulls live from both PostgreSQL and MongoDB to display the verification shield, beekeeper profile, 14-day telemetry chart, and lab report."
    }
  };

  function openTraceabilityDemo() {
    if (!modalTraceabilityDemo) return;
    modalTraceabilityDemo.classList.remove('hidden');
    renderDemoStage(demoStep);
  }

  function closeTraceabilityDemo() {
    if (!modalTraceabilityDemo) return;
    modalTraceabilityDemo.classList.add('hidden');
    stopDemoAutoplay();
  }

  if (btnOpenTraceabilityDemo) btnOpenTraceabilityDemo.addEventListener('click', openTraceabilityDemo);
  if (authDemoBanner) authDemoBanner.addEventListener('click', openTraceabilityDemo);
  if (btnCloseTraceabilityDemo) btnCloseTraceabilityDemo.addEventListener('click', closeTraceabilityDemo);

  // Stepper chip click listeners
  if (demoStepperTrack) {
    demoStepperTrack.addEventListener('click', (e) => {
      const chip = e.target.closest('.demo-step-chip');
      if (chip && chip.dataset.step) {
        stopDemoAutoplay();
        renderDemoStage(parseInt(chip.dataset.step, 10));
      }
    });
  }

  // Prev / Next Step buttons
  if (btnDemoPrevStep) {
    btnDemoPrevStep.addEventListener('click', () => {
      stopDemoAutoplay();
      if (demoStep > 1) renderDemoStage(demoStep - 1);
    });
  }
  if (btnDemoNextStep) {
    btnDemoNextStep.addEventListener('click', () => {
      stopDemoAutoplay();
      if (demoStep < 8) renderDemoStage(demoStep + 1);
    });
  }

  // Scenario Mode Toggle
  if (btnDemoModeClean) {
    btnDemoModeClean.addEventListener('click', () => {
      demoMode = 'clean';
      btnDemoModeClean.classList.add('active');
      if (btnDemoModeAdulterated) btnDemoModeAdulterated.classList.remove('active');
      showToast('Switched to Genuine Pure Honey Flow (Passes Dual Consensus).', 'success', 'Scenario Updated');
      renderDemoStage(demoStep);
    });
  }
  if (btnDemoModeAdulterated) {
    btnDemoModeAdulterated.addEventListener('click', () => {
      demoMode = 'adulterated';
      btnDemoModeAdulterated.classList.add('active');
      if (btnDemoModeClean) btnDemoModeClean.classList.remove('active');
      showToast('Switched to Adulteration Fraud Flow (Tests Sugar Syrup Spike, Lab Failure & QR Revocation).', 'warning', 'Scenario Updated');
      renderDemoStage(demoStep);
    });
  }

  // Auto-play Guided Walkthrough
  function stopDemoAutoplay() {
    if (demoAutoplayTimer) {
      clearInterval(demoAutoplayTimer);
      demoAutoplayTimer = null;
    }
    if (btnDemoAutoplayLabel) btnDemoAutoplayLabel.textContent = '▶ Auto-Play Flow';
  }

  function startDemoAutoplay() {
    stopDemoAutoplay();
    if (btnDemoAutoplayLabel) btnDemoAutoplayLabel.textContent = '⏸ Pause Flow';
    demoAutoplayTimer = setInterval(() => {
      if (demoStep < 8) {
        renderDemoStage(demoStep + 1);
      } else {
        renderDemoStage(1);
      }
    }, 4500);
  }

  if (btnDemoAutoplay) {
    btnDemoAutoplay.addEventListener('click', () => {
      if (demoAutoplayTimer) {
        stopDemoAutoplay();
      } else {
        startDemoAutoplay();
      }
    });
  }

  // Render individual demo stages dynamically
  async function renderDemoStage(stepNumber) {
    demoStep = stepNumber;
    const meta = demoStageMeta[stepNumber] || demoStageMeta[1];

    // Update stepper chips
    document.querySelectorAll('.demo-step-chip').forEach(chip => {
      const s = parseInt(chip.dataset.step, 10);
      chip.classList.toggle('active', s === stepNumber);
      chip.classList.toggle('completed', s < stepNumber);
    });

    // Update right inspector panel
    const badgeEl = document.getElementById('demo-tech-engine-badge');
    const compEl = document.getElementById('demo-tech-component');
    const tableEl = document.getElementById('demo-tech-tables');
    const secEl = document.getElementById('demo-tech-security');
    const expEl = document.getElementById('demo-tech-explanation');
    const termEl = document.getElementById('demo-terminal-payload');
    const jumpActions = document.getElementById('demo-quick-jump-actions');

    if (badgeEl) badgeEl.textContent = meta.engine;
    if (compEl) compEl.textContent = meta.component;
    if (tableEl) tableEl.textContent = meta.tables;
    if (secEl) secEl.textContent = meta.security;
    if (expEl) expEl.textContent = meta.explanation;

    // Render left visual simulation and right terminal payload
    const visualContent = document.getElementById('demo-stage-visual-content');
    if (!visualContent) return;

    if (stepNumber === 1) {
      // Stage 1: Apiary IoT & MongoDB Swarm AI
      visualContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <span class="chain-status" style="font-size: 0.7rem; color: var(--emerald-accent); border-color: var(--emerald-accent);">STAGE 1 OF 8</span>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--gold-accent); margin-top: 4px;">Apiary Colony IoT & Swarming AI</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Apiary #4 (Mogar Central Orchard) • Hive HIVE-ALPHA-01</p>
          </div>
          <span style="font-size: 2rem;">🐝</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px;">
          <div class="sim-metric-card">
            <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Scale Weight</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--text); font-family: var(--font-mono);">46.40 kg</div>
            <div style="font-size: 0.68rem; color: var(--gold-accent);">● Honeycomb Supers Full</div>
          </div>
          <div class="sim-metric-card">
            <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Brood Core Temp</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">35.1 °C</div>
            <div style="font-size: 0.68rem; color: var(--emerald-accent);">● Optimal Thermoregulation</div>
          </div>
          <div class="sim-metric-card">
            <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Relative Humidity</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">58.4 %</div>
            <div style="font-size: 0.68rem; color: var(--emerald-accent);">● Ideal Nectar Capping</div>
          </div>
        </div>

        <!-- MongoDB Acoustic FFT Spectrogram -->
        <div class="sim-highlight-box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 0.74rem; font-weight: 700; color: var(--text);">
              MongoDB 8.2 Acoustic Audio FFT Spectrogram (100 Hz - 600 Hz)
            </div>
            <span style="font-size: 0.7rem; font-family: var(--font-mono); color: #38bdf8;">Peak: 215.0 Hz (Harmonized)</span>
          </div>

          <div style="display: flex; align-items: flex-end; gap: 8px; height: 55px; padding: 4px 0;">
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div style="width: 100%; height: 28%; background: #38bdf8; border-radius: 2px;"></div>
              <span style="font-size: 0.65rem; color: var(--text-muted); font-family: var(--font-mono);">120Hz</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div style="width: 100%; height: 45%; background: #38bdf8; border-radius: 2px;"></div>
              <span style="font-size: 0.65rem; color: var(--text-muted); font-family: var(--font-mono);">180Hz</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div style="width: 100%; height: 88%; background: var(--emerald-accent); border-radius: 2px;"></div>
              <span style="font-size: 0.65rem; color: var(--emerald-accent); font-weight: 700; font-family: var(--font-mono);">215Hz</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div style="width: 100%; height: 35%; background: #38bdf8; border-radius: 2px;"></div>
              <span style="font-size: 0.65rem; color: var(--text-muted); font-family: var(--font-mono);">280Hz</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div style="width: 100%; height: 18%; background: #38bdf8; border-radius: 2px;"></div>
              <span style="font-size: 0.65rem; color: var(--text-muted); font-family: var(--font-mono);">420Hz</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div style="width: 100%; height: 12%; background: #38bdf8; border-radius: 2px;"></div>
              <span style="font-size: 0.65rem; color: var(--text-muted); font-family: var(--font-mono);">520Hz</span>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.74rem; margin-top: 8px; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 6px;">
            <span style="color: var(--text-muted);">Queen Piping Detection: <strong style="color: var(--emerald-accent);">NEGATIVE</strong></span>
            <span style="color: var(--text-muted);">Swarm Probability: <strong style="color: var(--emerald-accent);">4.5% (LOW)</strong></span>
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn-primary" id="btn-demo-stage1-next" style="padding: 8px 16px; font-size: 0.82rem;">
            <span>Advance to Stage 2: Honey Harvest Initiation →</span>
          </button>
        </div>
      `;

      if (termEl) {
        termEl.textContent = JSON.stringify({
          collection: "hive_telemetry_documents",
          timestamp: new Date().toISOString(),
          apiaryId: "APIARY-04",
          hiveId: "HIVE-ALPHA-01",
          scaleWeightKg: 46.40,
          temperatureC: 35.1,
          humidityPercent: 58.4,
          acousticFftBins: [ { hz: 120, db: 32 }, { hz: 180, db: 41 }, { hz: 215, db: 64 }, { hz: 280, db: 36 }, { hz: 420, db: 22 }, { hz: 520, db: 18 } ],
          dominantFreqHz: 215,
          decibelLevel: 48.2,
          queenPipingDetected: false,
          swarmingRisk: "LOW"
        }, null, 2);
      }

      document.getElementById('btn-demo-stage1-next').addEventListener('click', () => renderDemoStage(2));

    } else if (stepNumber === 2) {
      // Stage 2: Hive Harvest Initiation
      visualContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <span class="chain-status" style="font-size: 0.7rem; color: var(--emerald-accent); border-color: var(--emerald-accent);">STAGE 2 OF 8</span>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--gold-accent); margin-top: 4px;">Beekeeper Honey Harvest Logging</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Beekeeper: Ramesh Patel (KVIC-HM-GJ-2023-0104)</p>
          </div>
          <span style="font-size: 2rem;">🍯</span>
        </div>

        <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 14px;">
          <div style="font-size: 0.76rem; font-weight: 700; color: var(--gold-accent); margin-bottom: 10px;">Harvest Parameters Minted to PostgreSQL:</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.8rem;">
            <div>
              <span style="color: var(--text-muted);">Assigned Batch ID:</span>
              <div style="font-family: var(--font-mono); font-weight: 700; color: var(--gold-accent);">${demoActiveBatchId}</div>
            </div>
            <div>
              <span style="color: var(--text-muted);">Apiary Origin:</span>
              <div style="font-weight: 700;">Apiary #4 (Mogar Central Orchard)</div>
            </div>
            <div>
              <span style="color: var(--text-muted);">Floral Source:</span>
              <div style="font-weight: 700; color: var(--text);">Mustard (Sarson) & Acacia</div>
            </div>
            <div>
              <span style="color: var(--text-muted);">Harvest Quantity:</span>
              <div style="font-weight: 700; color: var(--emerald-accent);">85.0 kg</div>
            </div>
            <div>
              <span style="color: var(--text-muted);">Comb Moisture Measured:</span>
              <div style="font-weight: 700; color: ${demoMode === 'clean' ? 'var(--emerald-accent)' : '#f87171'};">
                ${demoMode === 'clean' ? '17.5% (Capped & Ripe)' : '22.4% (Uncapped Fermentation Risk)'}
              </div>
            </div>
            <div>
              <span style="color: var(--text-muted);">Harvest Cycle Window:</span>
              <div style="font-weight: 600;">14 Days (Continuous IoT Tracked)</div>
            </div>
          </div>
        </div>

        <div style="background: rgba(56, 189, 248, 0.08); border: 1px dashed var(--blue-accent); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 14px; font-size: 0.78rem; color: var(--blue-accent);">
          ⚡ <strong>Simultaneous Trigger Activated:</strong> Saving this harvest simultaneously initiates both <strong>Individual Jar Packaging</strong> with inactive QR codes and dispatches a representative sample to the <strong>NABL Chemical Lab</strong>.
        </div>

        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn-primary" id="btn-demo-stage2-next" style="padding: 8px 16px; font-size: 0.82rem;">
            <span>Advance to Stage 3: KVIC Automated Quality Audit →</span>
          </button>
        </div>
      `;

      if (termEl) {
        termEl.textContent = `-- PostgreSQL 18: Register Honey Harvest & Queue AI Audit
INSERT INTO honey_batches (
  batch_id, apiary_id, beekeeper_id, floral_source, quantity_kg,
  moisture_content, harvest_date, qr_status, packaging_status, consensus_status
) VALUES (
  '${demoActiveBatchId}', 'APIARY-04', 'FARMER-001', 'Mustard & Acacia', 85.0,
  ${demoMode === 'clean' ? '17.5' : '22.4'}, CURRENT_DATE, 'INACTIVE', 'PACKAGING_IN_PROGRESS', 'PENDING_DUAL_CONSENSUS'
);`;
      }

      document.getElementById('btn-demo-stage2-next').addEventListener('click', () => renderDemoStage(3));

    } else if (stepNumber === 3) {
      // Stage 3: Automated KVIC Quality Audit Flag
      const isClean = demoMode === 'clean';
      visualContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <span class="chain-status" style="font-size: 0.7rem; color: var(--emerald-accent); border-color: var(--emerald-accent);">STAGE 3 OF 8</span>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--gold-accent); margin-top: 4px;">Automated KVIC Quality Audit</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">AI Oracle Cycle Telemetry Inspection • Apiary #4</p>
          </div>
          <span style="font-size: 2rem;">🏛️</span>
        </div>

        <div style="border: 1px solid ${isClean ? 'var(--emerald-accent)' : '#ef4444'}; background: ${isClean ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'}; border-radius: var(--radius-sm); padding: 16px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="padding: 4px 12px; border-radius: var(--radius-full); font-weight: 800; font-size: 0.78rem; background: ${isClean ? 'var(--emerald-accent)' : '#ef4444'}; color: #fff;">
              ${isClean ? '🟢 GREEN FLAG: GENUINE PURE NECTAR' : '🚩 RED FLAG: ARTIFICIAL SYRUP SPIKE'}
            </span>
            <span style="font-family: var(--font-mono); font-size: 0.74rem; color: var(--gold-accent);">
              Audit Hash: 0x8a92...c41e
            </span>
          </div>

          <h4 style="font-size: 1.05rem; font-weight: 700; color: ${isClean ? 'var(--emerald-accent)' : '#f87171'}; margin-bottom: 4px;">
            ${isClean ? 'Stable Nectar Flow Verified (14-Day Cycle)' : 'Sudden Nocturnal Weight Surge Detected'}
          </h4>
          <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
            ${isClean 
              ? 'Continuous load-cell telemetry confirms genuine gradual foraging (+0.58 kg/day). Thermal brood thermoregulation maintained at 35.1°C without disruption.' 
              : 'Unnatural +12.5 kg overnight weight surge detected on Day 11 without daytime foraging activity. Indicative of artificial sugar/fructose syrup feeding.'}
          </p>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 0.74rem;">
            <div class="sim-metric-card" style="padding: 10px;">
              <div style="color: var(--text-muted);">Net Gain:</div>
              <div style="font-weight: 700;">${isClean ? '+8.2 kg (Natural)' : '+20.7 kg (Abnormal)'}</div>
            </div>
            <div class="sim-metric-card" style="padding: 10px;">
              <div style="color: var(--text-muted);">Syrup Jump:</div>
              <div style="font-weight: 700; color: ${isClean ? 'var(--emerald-accent)' : '#f87171'};">${isClean ? '0.0 kg (None)' : '+12.5 kg (Flagged)'}</div>
            </div>
            <div class="sim-metric-card" style="padding: 10px;">
              <div style="color: var(--text-muted);">KVIC Destination:</div>
              <div style="font-weight: 700; color: var(--blue-accent);">State Office Meerut</div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn-primary" id="btn-demo-stage3-next" style="padding: 8px 16px; font-size: 0.82rem;">
            <span>Advance to Stage 4: Simultaneous Packaging →</span>
          </button>
        </div>
      `;

      if (termEl) {
        termEl.textContent = JSON.stringify({
          eventType: "KVIC_HARVEST_AI_AUDIT_TRANSMITTED",
          batchId: demoActiveBatchId,
          apiaryId: "APIARY-04",
          flagColor: isClean ? "GREEN" : "RED",
          flagTitle: isClean ? "Pure Honey Harvest Verified" : "Artificial Syrup Surge Detected",
          suddenWeightJumpKg: isClean ? 0.0 : 12.5,
          kvicNotificationStatus: "DISPATCHED_TO_OFFICER_PORTAL",
          timestamp: new Date().toISOString()
        }, null, 2);
      }

      document.getElementById('btn-demo-stage3-next').addEventListener('click', () => renderDemoStage(4));

    } else if (stepNumber === 4) {
      // Stage 4: Simultaneous Packaging & Inactive QR
      visualContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <span class="chain-status" style="font-size: 0.7rem; color: var(--emerald-accent); border-color: var(--emerald-accent);">STAGE 4 OF 8</span>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--gold-accent); margin-top: 4px;">Simultaneous Packaging & Market Lock</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">500 Individual Jars Bottled with Cryptographic Inactive QR</p>
          </div>
          <span style="font-size: 2rem;">📦</span>
        </div>

        <!-- Packaging Conveyor Visualizer -->
        <div class="demo-conveyor" style="margin-bottom: 14px;">
          <div class="demo-conveyor-unit">
            <div style="font-size: 1.4rem;">🍯</div>
            <div style="font-size: 0.7rem; font-family: var(--font-mono); font-weight: 700;">PKG-001</div>
            <span style="font-size: 0.65rem; background: rgba(245,158,11,0.2); color: #fbbf24; padding: 1px 6px; border-radius: 4px; font-weight: 700;">⏳ INACTIVE</span>
          </div>
          <div class="demo-conveyor-unit">
            <div style="font-size: 1.4rem;">🍯</div>
            <div style="font-size: 0.7rem; font-family: var(--font-mono); font-weight: 700;">PKG-002</div>
            <span style="font-size: 0.65rem; background: rgba(245,158,11,0.2); color: #fbbf24; padding: 1px 6px; border-radius: 4px; font-weight: 700;">⏳ INACTIVE</span>
          </div>
          <div class="demo-conveyor-unit">
            <div style="font-size: 1.4rem;">🍯</div>
            <div style="font-size: 0.7rem; font-family: var(--font-mono); font-weight: 700;">PKG-003</div>
            <span style="font-size: 0.65rem; background: rgba(245,158,11,0.2); color: #fbbf24; padding: 1px 6px; border-radius: 4px; font-weight: 700;">⏳ INACTIVE</span>
          </div>
          <div class="demo-conveyor-unit">
            <div style="font-size: 1.4rem;">🍯</div>
            <div style="font-size: 0.7rem; font-family: var(--font-mono); font-weight: 700;">PKG-004</div>
            <span style="font-size: 0.65rem; background: rgba(245,158,11,0.2); color: #fbbf24; padding: 1px 6px; border-radius: 4px; font-weight: 700;">⏳ INACTIVE</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); padding-left: 8px;">...500 units serialized</div>
        </div>

        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span style="font-size: 1.2rem;">🔒</span>
            <strong style="color: var(--gold-accent); font-size: 0.84rem;">Market Protection Guarantee:</strong>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.45; margin: 0;">
            Honey jars are fully labeled and boxed at the farmer cooperative packing facility, but <strong>all QR codes are locked in an INACTIVE state</strong>. Scanning a jar right now informs the consumer that NABL chemical laboratory testing is in progress. Retail sale cannot proceed until lab consensus passes.
          </p>
        </div>

        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn-primary" id="btn-demo-stage4-next" style="padding: 8px 16px; font-size: 0.82rem;">
            <span>Advance to Stage 5: NABL Chemical Lab Testing →</span>
          </button>
        </div>
      `;

      if (termEl) {
        termEl.textContent = `-- PostgreSQL 18: 500 Serialized Jars Minted in INACTIVE Lock
INSERT INTO batch_packages (package_id, batch_id, jar_size_grams, unit_number, qr_status, created_at)
VALUES 
  ('PKG-2026-8812-001', '${demoActiveBatchId}', 500, 1, 'INACTIVE', NOW()),
  ('PKG-2026-8812-002', '${demoActiveBatchId}', 500, 2, 'INACTIVE', NOW()),
  ('PKG-2026-8812-003', '${demoActiveBatchId}', 500, 3, 'INACTIVE', NOW())
  ... 500 rows inserted;
UPDATE honey_batches SET packaging_status = 'PACKAGING_IN_PROGRESS', qr_status = 'INACTIVE' WHERE batch_id = '${demoActiveBatchId}';`;
      }

      document.getElementById('btn-demo-stage4-next').addEventListener('click', () => renderDemoStage(5));

    } else if (stepNumber === 5) {
      // Stage 5: NABL Chemical Lab Dispatch & NMR Test
      const isClean = demoMode === 'clean';
      visualContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <span class="chain-status" style="font-size: 0.7rem; color: var(--emerald-accent); border-color: var(--emerald-accent);">STAGE 5 OF 8</span>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--gold-accent); margin-top: 4px;">NABL Chemical Laboratory NMR Analysis</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Sample ID: LAB-SMP-2026-8812 • National Food Laboratory (NABL Accredited)</p>
          </div>
          <span style="font-size: 2rem;">🔬</span>
        </div>

        <!-- Lab NMR Metrics Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px;">
          <div class="sim-metric-card">
            <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">C4 Sugar % (NMR Isotope)</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: ${isClean ? 'var(--emerald-accent)' : '#f87171'}; font-family: var(--font-mono);">
              ${isClean ? '1.2%' : '18.4% (FAIL)'}
            </div>
            <div style="font-size: 0.68rem; color: var(--text-muted);">Standard: < 7.0% (Zero rice/corn syrup)</div>
          </div>

          <div class="sim-metric-card">
            <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Chemical Moisture %</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: ${isClean ? 'var(--emerald-accent)' : '#f87171'}; font-family: var(--font-mono);">
              ${isClean ? '17.8%' : '22.4% (FAIL)'}
            </div>
            <div style="font-size: 0.68rem; color: var(--text-muted);">Standard: ≤ 20.0% (Refractometer)</div>
          </div>

          <div class="sim-metric-card">
            <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">HMF Index (mg/kg)</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: ${isClean ? 'var(--emerald-accent)' : '#f87171'}; font-family: var(--font-mono);">
              ${isClean ? '14.2 mg/kg' : '68.5 mg/kg (FAIL)'}
            </div>
            <div style="font-size: 0.68rem; color: var(--text-muted);">Standard: < 40 mg/kg (Unheated Raw)</div>
          </div>

          <div class="sim-metric-card">
            <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Botanical Pollen Profile</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: ${isClean ? 'var(--emerald-accent)' : '#f87171'};">
              ${isClean ? 'Mustard & Acacia (86%)' : 'Foreign Inverted Pollen Deficient'}
            </div>
            <div style="font-size: 0.68rem; color: var(--text-muted);">Melissopalynology Micro-Scan</div>
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn-primary" id="btn-demo-stage5-next" style="padding: 8px 16px; font-size: 0.82rem;">
            <span>Advance to Stage 6: Dual Consensus Verification Engine →</span>
          </button>
        </div>
      `;

      if (termEl) {
        termEl.textContent = JSON.stringify({
          endpoint: "POST /api/lab/submit-report",
          batchId: demoActiveBatchId,
          labSampleId: "LAB-SMP-2026-8812",
          nablCertId: "NABL-CHEM-2026-9901",
          testingSuite: "Nuclear Magnetic Resonance (NMR) & SMR Mass Spectrometry",
          moisturePercent: isClean ? 17.8 : 22.4,
          c4SugarPercent: isClean ? 1.2 : 18.4,
          hmfMgKg: isClean ? 14.2 : 68.5,
          pollenAuthenticity: isClean ? "CONFIRMED_MUSTARD_ACACIA" : "FOREIGN_SYRUP_CONTAMINATION",
          verdict: isClean ? "PASSED_ALL_STANDARDS" : "FAILED_ADULTERATION_DETECTED"
        }, null, 2);
      }

      document.getElementById('btn-demo-stage5-next').addEventListener('click', () => renderDemoStage(6));

    } else if (stepNumber === 6) {
      // Stage 6: Dual Consensus Verification Engine
      const isClean = demoMode === 'clean';
      visualContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <span class="chain-status" style="font-size: 0.7rem; color: var(--emerald-accent); border-color: var(--emerald-accent);">STAGE 6 OF 8</span>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--gold-accent); margin-top: 4px;">Dual Consensus Verification Engine</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Cross-Verification: NABL Chemical Lab vs KVIC Field IoT Telemetry</p>
          </div>
          <span style="font-size: 2rem;">⚖️</span>
        </div>

        <table class="demo-matrix-table" style="margin-bottom: 14px;">
          <thead>
            <tr>
              <th>Evaluation Parameter</th>
              <th>KVIC Field IoT</th>
              <th>NABL Chemical Lab</th>
              <th>Consensus Math Rule</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Moisture Content</strong></td>
              <td>17.5% (Comb Sensor)</td>
              <td>${isClean ? '17.8%' : '22.4%'}</td>
              <td>Δ ≤ ±1.2% Correlation</td>
              <td style="font-weight: 700; color: ${isClean ? 'var(--emerald-accent)' : '#ef4444'};">${isClean ? '✅ MATCH (Δ=0.3%)' : '❌ MISMATCH (Δ=4.9%)'}</td>
            </tr>
            <tr>
              <td><strong>C4 Foreign Sugars</strong></td>
              <td>0.0 kg Spike (Smooth)</td>
              <td>${isClean ? '1.2%' : '18.4%'}</td>
              <td>Lab C4 < 7.0%</td>
              <td style="font-weight: 700; color: ${isClean ? 'var(--emerald-accent)' : '#ef4444'};">${isClean ? '✅ PASS (Pure)' : '❌ FAIL (Corn/Rice Syrup)'}</td>
            </tr>
            <tr>
              <td><strong>Freshness & Boiling (HMF)</strong></td>
              <td>35.1°C Brood Temp</td>
              <td>${isClean ? '14.2 mg/kg' : '68.5 mg/kg'}</td>
              <td>HMF < 40 mg/kg</td>
              <td style="font-weight: 700; color: ${isClean ? 'var(--emerald-accent)' : '#ef4444'};">${isClean ? '✅ PASS (Raw Honey)' : '❌ FAIL (Overheated)'}</td>
            </tr>
            <tr>
              <td><strong>KVIC Harvest Flag</strong></td>
              <td>${isClean ? '🟢 GREEN FLAG' : '🚩 RED FLAG'}</td>
              <td>${isClean ? 'Passed' : 'Contaminated'}</td>
              <td>Flag == GREEN</td>
              <td style="font-weight: 700; color: ${isClean ? 'var(--emerald-accent)' : '#ef4444'};">${isClean ? '✅ UNANIMOUS' : '❌ REJECTED'}</td>
            </tr>
          </tbody>
        </table>

        <div style="border-radius: var(--radius-sm); padding: 12px; background: ${isClean ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; border: 1px solid ${isClean ? 'var(--emerald-accent)' : '#ef4444'}; margin-bottom: 14px;">
          <strong style="color: ${isClean ? 'var(--emerald-accent)' : '#f87171'}; font-size: 0.88rem;">
            ${isClean ? '✓ DUAL CONSENSUS VERIFIED (UNANIMOUS)' : '⚠️ DUAL CONSENSUS FAILED: FRAUD DETECTED'}
          </strong>
          <p style="font-size: 0.78rem; color: var(--text-muted); margin: 4px 0 0 0;">
            ${isClean 
              ? 'Both physical telemetry and chemical lab data correlate with 100% mathematical certainty. Smart contract authorizes blockchain activation.' 
              : 'Discrepancy detected between field nectar flow and lab sugar NMR. Smart contract invokes automated fraud freeze.'}
          </p>
        </div>

        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn-primary" id="btn-demo-stage6-next" style="padding: 8px 16px; font-size: 0.82rem;">
            <span>Advance to Stage 7: Blockchain Ledger Minting →</span>
          </button>
        </div>
      `;

      if (termEl) {
        termEl.textContent = `// Smart Contract: Dual Consensus Evaluation Function
function evaluateDualConsensus(telemetryAudit, labReport) {
  const moistureDelta = Math.abs(telemetryAudit.moisture - labReport.moisturePercent);
  const moistureValid = moistureDelta <= 1.2;
  const c4SugarValid = labReport.c4SugarPercent < 7.0;
  const hmfValid = labReport.hmfMgKg < 40.0;
  const kvicValid = telemetryAudit.flagColor === 'GREEN';

  const unanimous = moistureValid && c4SugarValid && hmfValid && kvicValid;
  return {
    status: unanimous ? "DUAL_CONSENSUS_VERIFIED" : "DUAL_CONSENSUS_FAILED",
    qrAction: unanimous ? "ACTIVATE_ALL_PACKAGES" : "REVOKE_AND_FREEZE",
    consensusTimestamp: "${new Date().toISOString()}"
  };
}`;
      }

      document.getElementById('btn-demo-stage6-next').addEventListener('click', () => renderDemoStage(7));

    } else if (stepNumber === 7) {
      // Stage 7: Blockchain Block Minting & Mass QR Activation
      const isClean = demoMode === 'clean';
      visualContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <span class="chain-status" style="font-size: 0.7rem; color: var(--emerald-accent); border-color: var(--emerald-accent);">STAGE 7 OF 8</span>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--gold-accent); margin-top: 4px;">Blockchain Ledger Minting</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Block #1049285 Sealed on PostgreSQL Ledger</p>
          </div>
          <span style="font-size: 2rem;">⛓️</span>
        </div>

        <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 14px; font-family: var(--font-mono); font-size: 0.76rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: var(--text-muted);">Block Number:</span>
            <span style="color: var(--gold-accent); font-weight: 700;">#1049285</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: var(--text-muted);">Previous Hash:</span>
            <span style="color: var(--text-muted);">0x9c31b8f4a10e74d...</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: var(--text-muted);">Merkle Root:</span>
            <span style="color: #38bdf8;">0x4e872c019bb4f9a...</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Sealed Block Hash:</span>
            <span style="color: var(--emerald-accent); font-weight: 700;">0x3a4f89d1c7e92b5006b83f0907cae12739268eacdfa89110756e2978a1bc40e7</span>
          </div>
        </div>

        <!-- Mass State Transition Visualizer -->
        <div class="sim-highlight-box" style="text-align: center;">
          <div style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">Atomic State Flip Across 500 Packaging Units:</div>
          <div style="display: flex; align-items: center; justify-content: center; gap: 14px;">
            <span style="padding: 4px 12px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700;">
              ⏳ INACTIVE (Locked)
            </span>
            <span style="font-size: 1.2rem; color: var(--gold-accent);">➔</span>
            <span style="padding: 4px 14px; border-radius: 4px; background: ${isClean ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}; color: ${isClean ? 'var(--emerald-accent)' : '#f87171'}; font-family: var(--font-mono); font-size: 0.84rem; font-weight: 800;">
              ${isClean ? '🟢 ACTIVE & MARKET READY' : '⛔ REVOKED & CONTAMINATED'}
            </span>
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn-primary" id="btn-demo-stage7-next" style="padding: 8px 16px; font-size: 0.82rem;">
            <span>Advance to Stage 8: Public Consumer Passport Scan →</span>
          </button>
        </div>
      `;

      if (termEl) {
        termEl.textContent = `-- PostgreSQL 18: Atomic State Flip on Consensus Resolution
UPDATE honey_batches 
SET 
  qr_status = '${isClean ? 'ACTIVE' : 'REVOKED'}',
  packaging_status = '${isClean ? 'PACKAGING_RELEASED_TO_DISTRIBUTION' : 'BATCH_FROZEN_CONTAMINATED'}',
  consensus_status = '${isClean ? 'DUAL_CONSENSUS_VERIFIED' : 'DUAL_CONSENSUS_FAILED_MISMATCH'}'
WHERE batch_id = '${demoActiveBatchId}';

UPDATE batch_packages 
SET qr_status = '${isClean ? 'ACTIVE' : 'REVOKED'}'
WHERE batch_id = '${demoActiveBatchId}';

INSERT INTO blockchain_ledger (block_number, block_hash, previous_hash, merkle_root, event_type, details)
VALUES (1049285, '0x3a4f89d...', '0x9c31b8...', '0x4e872c...', '${isClean ? 'DUAL_CONSENSUS_VERIFIED_AND_QR_ACTIVATED' : 'BATCH_CONTAMINATION_FREEZE'}', 'Batch ${demoActiveBatchId}');`;
      }

      document.getElementById('btn-demo-stage7-next').addEventListener('click', () => renderDemoStage(8));

    } else if (stepNumber === 8) {
      // Stage 8: Consumer Public Provenance Passport Scan
      const isClean = demoMode === 'clean';
      visualContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <span class="chain-status" style="font-size: 0.7rem; color: var(--emerald-accent); border-color: var(--emerald-accent);">STAGE 8 OF 8 (FINAL)</span>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--gold-accent); margin-top: 4px;">Consumer Public Provenance Passport</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Live Scan Destination: passport.html?batch=${demoActiveBatchId}</p>
          </div>
          <span style="font-size: 2rem;">📱</span>
        </div>

        <!-- Simulated Passport Card -->
        <div style="background: linear-gradient(135deg, rgba(16, 24, 48, 0.9) 0%, rgba(8, 12, 24, 0.9) 100%); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.4rem;">🍯</span>
              <div>
                <div style="font-size: 0.7rem; color: var(--gold-accent); text-transform: uppercase; font-weight: 700;">Government of India • KVIC Honey Mission</div>
                <div style="font-size: 0.92rem; font-weight: 800; color: #fff;">Digital Honey Provenance Certificate</div>
              </div>
            </div>
            <span style="padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.76rem; font-weight: 800; background: ${isClean ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${isClean ? 'var(--emerald-accent)' : '#f87171'}; border: 1px solid ${isClean ? 'var(--emerald-accent)' : '#ef4444'};">
              ${isClean ? '🛡️ VERIFIED AUTHENTIC & UNADULTERATED' : '⛔ BATCH CONTAMINATED & REVOKED'}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.78rem; margin-bottom: 12px;">
            <div><span style="color: var(--text-muted);">Beekeeper:</span> <strong>Ramesh Patel</strong></div>
            <div><span style="color: var(--text-muted);">Apiary:</span> <strong>Apiary #4 (Mogar Central Orchard)</strong></div>
            <div><span style="color: var(--text-muted);">DBT Subsidy:</span> <strong style="color: var(--emerald-accent);">₹35,000 PFMS Credited</strong></div>
            <div><span style="color: var(--text-muted);">NABL Lab NMR:</span> <strong style="color: var(--gold-accent);">${isClean ? '1.2% C4 (Pure)' : '18.4% C4 (Adulterated)'}</strong></div>
            <div><span style="color: var(--text-muted);">Acoustic AI:</span> <strong style="color: #38bdf8;">215 Hz (Colony Harmonized)</strong></div>
            <div><span style="color: var(--text-muted);">Block ID:</span> <strong style="font-family: var(--font-mono);">#1049285 (SHA-256)</strong></div>
          </div>

          <a href="passport.html?batch=${demoActiveBatchId}" target="_blank" class="btn-primary" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; width: 100%;">
            <span>🌐 Open Independent Public Provenance Passport in New Tab ↗</span>
          </a>
        </div>

        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn-secondary" id="btn-demo-restart" style="padding: 8px 16px; font-size: 0.82rem;">
            <span>🔄 Restart Architecture Sequence from Stage 1</span>
          </button>
        </div>
      `;

      if (termEl) {
        termEl.textContent = JSON.stringify({
          endpoint: "GET /api/public/passport/" + demoActiveBatchId,
          database1_PostgreSQL: {
            batchId: demoActiveBatchId,
            beekeeper: "Ramesh Patel",
            aadhaar_uid: "1234 •••• 9012 (UIDAI Encrypted)",
            pfms_dbt_status: "DISBURSED_₹35000",
            qr_status: isClean ? "ACTIVE" : "REVOKED",
            lab_nmr_c4_sugar: isClean ? 1.2 : 18.4,
            dual_consensus: isClean ? "VERIFIED_ANOMALY_FREE" : "FAILED_ADULTERATED",
            blockNumber: 1049285
          },
          database2_MongoDB: {
            collection: "hive_telemetry_documents",
            dominantFreqHz: 215,
            decibelLevel: 48.2,
            queenPipingDetected: false,
            spectrogramBinsCount: 6
          }
        }, null, 2);
      }

      const btnRestart = document.getElementById('btn-demo-restart');
      if (btnRestart) btnRestart.addEventListener('click', () => renderDemoStage(1));
    }

    // Populate quick jump buttons in right column
    if (jumpActions) {
      jumpActions.innerHTML = `
        <button type="button" class="btn-secondary" id="jump-farmer-view" style="padding: 4px 10px; font-size: 0.72rem;">🌾 Farmer Dashboard</button>
        <button type="button" class="btn-secondary" id="jump-kvic-view" style="padding: 4px 10px; font-size: 0.72rem;">🏛️ KVIC Portal</button>
        <button type="button" class="btn-secondary" id="jump-admin-view" style="padding: 4px 10px; font-size: 0.72rem;">🛡️ Admin Explorer</button>
        <a href="passport.html?batch=${demoActiveBatchId}" target="_blank" class="btn-secondary" style="padding: 4px 10px; font-size: 0.72rem; text-decoration: none; border-color: var(--gold-accent); color: var(--gold-accent);">🌐 Open Passport ↗</a>
      `;

      const jFarmer = document.getElementById('jump-farmer-view');
      if (jFarmer) jFarmer.addEventListener('click', () => {
        closeTraceabilityDemo();
        switchView('farmerDashboard');
      });
      const jKvic = document.getElementById('jump-kvic-view');
      if (jKvic) jKvic.addEventListener('click', () => {
        closeTraceabilityDemo();
        switchView('kvicDashboard');
      });
      const jAdmin = document.getElementById('jump-admin-view');
      if (jAdmin) jAdmin.addEventListener('click', () => {
        closeTraceabilityDemo();
        switchView('adminDashboard');
      });
    }
  }

  const btnAdminReset = document.getElementById('btn-admin-reset-data');
  if (btnAdminReset) {
    btnAdminReset.addEventListener('click', async () => {
      if (confirm("Reset PostgreSQL database tables and re-seed defaults?")) {
        await BeeHiveAPI.resetDatabase();
        currentUser = null;
        DB.setCurrentUser(null);
        showToast("PostgreSQL database tables re-seeded to default state.", 'info');
        switchView('home');
      }
    });
  }

  // Start initial view & restore state from hash
  const initialHash = window.location.hash.replace(/^#/, '');
  if (currentUser) {
    if (initialHash && views[initialHash] && initialHash !== 'auth') {
      switchView(initialHash);
    } else {
      routeUserAfterLogin(currentUser);
    }
  } else {
    setLoginRole('farmer');
    if (initialHash && views[initialHash]) {
      switchView(initialHash);
    } else {
      switchView('home');
    }
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash && views[hash]) {
      if (hash === 'auth' && currentUser) {
        routeUserAfterLogin(currentUser);
      } else {
        switchView(hash);
      }
    }
  });

  // Initialize Stage 1 of the Farm-to-Jar Provenance Workflow Simulator
  renderDemoStage(1);
});
