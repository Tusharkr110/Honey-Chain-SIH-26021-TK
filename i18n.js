// i18n.js - Lightweight Bilingual (English & हिन्दी) Localization Layer
const TRANSLATIONS = {
  en: {
    // Navigation
    brandTitle: "Honey Chain",
    brandHindi: "हनी चेन",
    brandSubtitle: "KVIC Honey Mission • National Traceability",
    navHome: "Home",
    navWhatWeDo: "What We Do",
    navHowToUse: "How To Use",
    navVerifyJar: "Verify a Jar",
    navFaq: "FAQ",
    navLogin: "Login",
    navLogout: "Logout",
    navDashboard: "Dashboard",

    // Common
    verified: "Verified",
    warning: "Warning",
    flagged: "Flagged",
    loading: "Loading...",
    close: "Close",
    cancel: "Cancel",
    submit: "Submit",
    save: "Save",
    or: "or",

    // Login Page
    loginHeroTitle: "Trace every jar. Trust every drop.",
    loginHeroHindi: "हर जार को ट्रेस करें, हर बूंद पर भरोसा करें।",
    ministryBadge: "Ministry of MSME • Govt. of India",
    loginCardTitle: "KVIC Honey Mission",
    loginCardSub: "Official Beekeeping Provenance Portal",
    roleFarmer: "Farmer / Beekeeper",
    roleFarmerHi: "किसान / मधुमक्खी पालक",
    roleKvic: "KVIC Officer",
    roleKvicHi: "केवीआईसी अधिकारी",
    roleAdmin: "Consortium Admin",
    roleAdminHi: "सुपर एडमिन / प्रशासक",
    labelPhoneOrId: "Phone number or User ID",
    phPhoneOrId: "e.g. 9876543210 or ramesh.farmer",
    labelPasswordOrOtp: "Password or OTP",
    phPasswordOrOtp: "Enter your secure password",
    btnLogin: "Sign In to Portal",
    btnForgotPass: "Forgot password?",
    btnVerifyNoLogin: "Verify Honey Without Login",
    quickAccessTitle: "Quick Access Portals",

    // Home Page
    portalBadge: "NATIONAL TRACEABILITY PORTAL",
    homeHeroTitle: "Pure Honey, Proven.",
    homeHeroSubtitle: "Decentralized provenance, smart hive telemetry, and government-certified NABL testing for every bottle of Indian honey.",
    btnScanJar: "Verify a Jar",
    btnLearnMore: "Explore Process",

    // Feature Cards
    feat1Title: "Trusted Verification",
    feat1Sub: "Dual consensus cross-verifies field telemetry and NABL chemical NMR test reports.",
    feat2Title: "Smart Hive Monitoring",
    feat2Sub: "Continuous acoustic vibration and scale telemetry to protect bees and prevent adulteration.",
    feat3Title: "Verified Honey Market",
    feat3Sub: "Every jar carries an individual cryptographic digital passport with verified origin.",
    feat4Title: "Cluster Support for Beekeepers",
    feat4Sub: "Direct benefit subsidies (DBT) transferred directly to verified beekeepers via PFMS.",

    // Journey Timeline
    journeyTitle: "The Journey of a Jar",
    journeySub: "From certified apiary flora to your dining table with complete cryptographic assurance.",
    step1Name: "Hive",
    step1Desc: "Subsidized KVIC boxes with continuous bio-telemetry",
    step2Name: "Harvest",
    step2Desc: "Smart scale weight log and automated harvest AI audit",
    step3Name: "Independent Sampling",
    step3Desc: "Tamper-evident sampling by authorized KVIC inspector",
    step4Name: "Lab Test",
    step4Desc: "Chemical NMR & pollen purity analysis by NABL lab",
    step5Name: "Digital Record",
    step5Desc: "Immutable SHA-256 block minted to consensus ledger",
    step6Name: "Market",
    step6Desc: "Tamper-evident QR code assigned to individual jar",
    step7Name: "Your Table",
    step7Desc: "Consumer scans QR to view complete provenance trail",

    // How To Use
    howToTitle: "How to use Honey Chain",
    howToSub: "Simple steps for verified honey from farm to consumer.",
    tabFarmers: "For Farmers",
    tabConsumers: "For Buyers & Consumers",
    stepCard1Title: "Register",
    stepCard1Hi: "पंजीकरण करें",
    stepCard1Desc: "Register with 12-digit Aadhaar to cross-match official KVIC Honey Mission records.",
    stepCard2Title: "Add Harvest",
    stepCard2Hi: "शहद फसल जोड़ें",
    stepCard2Desc: "Log honey lot parameters and connect live hive scale telemetry.",
    stepCard3Title: "Officer Takes Sample",
    stepCard3Hi: "अधिकारी द्वारा नमूना",
    stepCard3Desc: "KVIC officer inspects apiary and collects sealed NABL laboratory sample.",
    stepCard4Title: "Get Result",
    stepCard4Hi: "परीक्षण परिणाम प्राप्त करें",
    stepCard4Desc: "NABL laboratory inputs chemical NMR report for dual consensus validation.",
    stepCard5Title: "Sell Verified Honey",
    stepCard5Hi: "प्रमाणित शहद बेचें",
    stepCard5Desc: "Download batch QR code and print digital passport certificates on bottles.",
    offlinePanelTitle: "Offline-First Farmer App",
    offlinePanelSub: "Works offline in remote apiary locations. Automatically syncs telemetry when you reconnect.",

    // Verify a Jar
    verifyTitle: "Verify Your Honey Jar",
    verifySub: "Enter the Batch ID or individual Jar ID found on your bottle label.",
    verifyInputPlaceholder: "e.g. HM-BATCH-2026-8812 or JAR-HM-BATCH-2026-5272-001",
    btnScanQr: "Scan QR Code",
    btnVerifyNow: "Verify Jar",
    riskScoreLabel: "RISK SCORE",
    verifiedTitle: "Authentic KVIC Certified Honey",
    flaggedTitle: "Quality Alert: Non-Conforming Batch",
    btnReportJar: "Report This Jar to KVIC",

    // FAQ
    faqTitle: "Questions about Honey Chain?",
    faqSub: "Clear answers for beekeepers, consumers, and commercial buyers.",
    faqSearchPlaceholder: "Search topics, testing standards, DBT subsidies...",
    faqTabAll: "General",
    faqTabFarmers: "Farmers",
    faqTabBuyers: "Buyers",
    faqTabVerify: "Verification",
    faqTabData: "Data & Privacy",
    faqSupportTitle: "Need immediate assistance?",
    faqSupportDesc: "Our KVIC Honey Mission nodal helpdesk is operational Mon–Sat 9AM–6PM IST.",
    btnCallSupport: "Call 1800-KVIC-BEE",
    btnEmailSupport: "support@honeychain.gov.in",

    // Dashboard
    dashGreeting: "Good morning",
    dashSentinelTitle: "Sentinel Hive Telemetry",
    dashSentinelDesc: "Real-time acoustic analysis and weight tracking from your monitored colonies.",
    dashQuickAdd: "Add Harvest",
    dashQuickBatches: "My Batches",
    dashQuickSell: "Sell Honey",
    sideDashboard: "Dashboard",
    sideHives: "My Hives",
    sideHarvest: "Add Harvest",
    sideBatches: "My Batches",
    sideMarket: "Sell Honey",
    sideInspection: "Inspection",
    statusOfflineSync: "Offline sync ready",
    navSettings: "Settings",
    navHelp: "Help & Support",
    navPortalOverview: "Portal Overview",
    adminStatUsers: "Registered Users",
    adminStatApproved: "Approved Beekeepers",
    adminStatPending: "Pending Review",
    adminStatBatches: "Honey Batches",
    adminStatBlocks: "Blockchain Blocks",
    adminUsersTitle: "User Registry",
    adminColUser: "User / Role",
    adminColContact: "Contact / Email",
    adminColStatus: "Status",
    adminColKvic: "KVIC ID",
    adminActivityTitle: "Live Blockchain Activity",
    qrScannerSub: "Point your camera at the QR code on the honey jar label",
    qrScannerClose: "Cancel Scan",
    settingsTitle: "Account & Portal Settings",
    settingsProfile: "Profile Information",
    settingsNotifications: "Notifications",
    settingsOffline: "Offline Storage",
    settingsSave: "Save Settings",
    batchSampleTitle: "Sample Batches:",
    pureBatchNotice: "100% Pure & Authenticated by KVIC Honey Mission.",
    flaggedBatchNotice: "Quality Alert: Adulteration or Telemetry Mismatch Detected",
    footerTitle: "National Honey Traceability Platform",
    footerSubtitle: "Empowering Indian beekeepers through decentralized blockchain provenance and acoustic IoT intelligence.",
    footerGov: "Ministry of Micro, Small & Medium Enterprises (MoMSME) • Government of India",
    footerRights: "© 2026 KVIC Honey Mission. All Rights Reserved."
  },

  hi: {
    // Navigation
    brandTitle: "हनी चेन",
    brandHindi: "Honey Chain",
    brandSubtitle: "केवीआईसी हनी मिशन • राष्ट्रीय ट्रेसेबिलिटी",
    navHome: "होम",
    navWhatWeDo: "हमारी सेवाएं",
    navHowToUse: "उपयोग विधि",
    navVerifyJar: "जार जांचें",
    navFaq: "अक्सर पूछे जाने वाले सवाल",
    navLogin: "लॉग इन",
    navLogout: "लॉग आउट",
    navDashboard: "डैशबोर्ड",

    // Common
    verified: "सत्यापित",
    warning: "चेतावनी",
    flagged: "संदिग्ध",
    loading: "लोड हो रहा है...",
    close: "बंद करें",
    cancel: "रद्द करें",
    submit: "जमा करें",
    save: "सहेजें",
    or: "अथवा",

    // Login Page
    loginHeroTitle: "हर जार को ट्रेस करें। हर बूंद पर भरोसा करें।",
    loginHeroHindi: "Trace every jar. Trust every drop.",
    ministryBadge: "सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय • भारत सरकार",
    loginCardTitle: "केवीआईसी हनी मिशन",
    loginCardSub: "आधिकारिक मधुमक्खी पालन प्रमाणन पोर्टल",
    roleFarmer: "किसान / मधुमक्खी पालक",
    roleFarmerHi: "Farmer / Beekeeper",
    roleKvic: "केवीआईसी अधिकारी",
    roleKvicHi: "KVIC Officer",
    roleAdmin: "सुपर एडमिन / प्रशासक",
    roleAdminHi: "Consortium Admin",
    labelPhoneOrId: "मोबाइल नंबर या उपयोगकर्ता आईडी",
    phPhoneOrId: "उदा. 9876543210 या ramesh.farmer",
    labelPasswordOrOtp: "पासवर्ड या ओटीपी",
    phPasswordOrOtp: "अपना सुरक्षित पासवर्ड दर्ज करें",
    btnLogin: "पोर्टल में प्रवेश करें",
    btnForgotPass: "पासवर्ड भूल गए?",
    btnVerifyNoLogin: "लॉगिन किए बिना शहद की जांच करें",
    quickAccessTitle: "सीधा पोर्टल प्रवेश खाते",

    // Home Page
    portalBadge: "राष्ट्रीय ट्रेसेबिलिटी पोर्टल",
    homeHeroTitle: "शुद्ध शहद, प्रमाणित।",
    homeHeroSubtitle: "केवीआईसी हनी मिशन के अंतर्गत प्रत्येक भारतीय शहद बोतल के लिए ब्लॉकचेन सत्यापन और आईओटी गुणवत्ता जांच।",
    btnScanJar: "जार जांचें",
    btnLearnMore: "प्रक्रिया समझें",

    // Feature Cards
    feat1Title: "विश्वसनीय सत्यापन",
    feat1Sub: "फील्ड आईओटी टेलीमेट्री और एनबीएल रासायनिक एनएमआर रिपोर्ट का दोहरा सत्यापन।",
    feat2Title: "स्मार्ट हाइव निगरानी",
    feat2Sub: "ध्वनिक कंपन और वजन ट्रैकिंग से मिलावट रोकें और मधुमक्खियों की रक्षा करें।",
    feat3Title: "प्रमाणित शहद बाज़ार",
    feat3Sub: "प्रत्येक जार को डिजिटल पासपोर्ट और अटूट क्रिप्टोग्राफिक रिकॉर्ड दिया जाता है।",
    feat4Title: "मधुमक्खी पालकों हेतु क्लस्टर सहायता",
    feat4Sub: "पीएफएमएस के माध्यम से प्रमाणित किसानों के बैंक खातों में प्रत्यक्ष लाभ (DBT)।",

    // Journey Timeline
    journeyTitle: "जार का सफर: खेत से मेज तक",
    journeySub: "प्रमाणित छत्ते से आपकी डाइनिंग टेबल तक शत-प्रतिशत डिजिटल व रासायनिक शुद्धता।",
    step1Name: "हाइव / छत्ता",
    step1Desc: "बायो-टेलीमेट्री युक्त सरकारी अनुदानित केवीआईसी बक्से",
    step2Name: "शहद कटाई",
    step2Desc: "डिजिटल वजन रिकॉर्ड व स्वचालित एआई गुणवत्ता विश्लेषण",
    step3Name: "स्वतंत्र नमूना",
    step3Desc: "केवीआईसी अधिकृत निरीक्षक द्वारा सीलबंद नमूना संग्रह",
    step4Name: "प्रयोगशाला परीक्षण",
    step4Desc: "एनबीएल प्रयोगशाला द्वारा एनएमआर व पराग शुद्धता विश्लेषण",
    step5Name: "डिजिटल रिकॉर्ड",
    step5Desc: "ब्लॉकचेन लेज़र पर अपरिवर्तनीय SHA-256 ब्लॉक निर्माण",
    step6Name: "बाज़ार वितरण",
    step6Desc: "प्रत्येक जार पर विशिष्ट डिजिटल क्यूआर कोड पासपोर्ट",
    step7Name: "आपकी मेज़",
    step7Desc: "उपभोक्ता द्वारा क्यूआर स्कैन कर पूरी प्रामाणिकता की जांच",

    // How To Use
    howToTitle: "हनी चेन का उपयोग कैसे करें",
    howToSub: "खेत से उपभोक्ता तक प्रमाणित शहद सुनिश्चित करने के सरल चरण।",
    tabFarmers: "किसानों के लिए",
    tabConsumers: "खरीदारों और उपभोक्ताओं के लिए",
    stepCard1Title: "पंजीकरण",
    stepCard1Hi: "Register",
    stepCard1Desc: "केवीआईसी हनी मिशन रिकॉर्ड के सत्यापन हेतु 12-अंकीय आधार से पंजीकरण करें।",
    stepCard2Title: "फसल दर्ज करें",
    stepCard2Hi: "Add Harvest",
    stepCard2Desc: "शहद उत्पादन दर्ज करें और लाइव हाइव स्केल टेलीमेट्री से लिंक करें।",
    stepCard3Title: "अधिकारी द्वारा नमूना",
    stepCard3Hi: "Officer Takes Sample",
    stepCard3Desc: "केवीआईसी अधिकारी छत्तों का निरीक्षण कर सीलबंद प्रयोगशाला नमूना लेते हैं।",
    stepCard4Title: "परीक्षण परिणाम",
    stepCard4Hi: "Get Result",
    stepCard4Desc: "एनबीएल प्रयोगशाला रासायनिक एनएमआर रिपोर्ट अपलोड कर दोहरा सत्यापन करती है।",
    stepCard5Title: "प्रमाणित शहद बेचें",
    stepCard5Hi: "Sell Verified Honey",
    stepCard5Desc: "डिजिटल क्यूआर कोड डाउनलोड करें और जार पर डिजिटल पासपोर्ट प्रमाणपत्र लगाएं।",
    offlinePanelTitle: "ऑफ़लाइन-प्रथम किसान ऐप",
    offlinePanelSub: "दूरदराज के इलाकों में बिना इंटरनेट काम करता है। इंटरनेट मिलने पर डेटा अपने आप सिंक हो जाता है।",

    // Verify a Jar
    verifyTitle: "अपने शहद के जार को सत्यापित करें",
    verifySub: "अपनी बोतल पर अंकित बैच आईडी या जार कोड दर्ज करें।",
    verifyInputPlaceholder: "उदा. HM-BATCH-2026-8812 या JAR-HM-BATCH-2026-5272-001",
    btnScanQr: "क्यूआर कोड स्कैन करें",
    btnVerifyNow: "जार सत्यापित करें",
    riskScoreLabel: "RISK SCORE",
    verifiedTitle: "प्रमाणित शुद्ध केवीआईसी शहद",
    flaggedTitle: "गुणवत्ता चेतावनी: गैर-अनुरूप बैच",
    btnReportJar: "केवीआईसी को इस जार की रिपोर्ट करें",

    // FAQ
    faqTitle: "हनी चेन के बारे में प्रश्न?",
    faqSub: "मधुमक्खी पालकों, खरीदारों और उपभोक्ताओं के सभी उत्तर।",
    faqSearchPlaceholder: "विषय, प्रयोगशाला मानक, डीबीटी सब्सिडी खोजें...",
    faqTabAll: "सामान्य",
    faqTabFarmers: "किसान",
    faqTabBuyers: "खरीदार",
    faqTabVerify: "सत्यापन",
    faqTabData: "डेटा व गोपनीयता",
    faqSupportTitle: "तुरंत सहायता चाहिए?",
    faqSupportDesc: "हमारा केवीआईसी हनी मिशन हेल्पडेस्क सोमवार से शनिवार सुबह 9 से शाम 6 बजे तक उपलब्ध है।",
    btnCallSupport: "कॉल करें: 1800-KVIC-BEE",
    btnEmailSupport: "support@honeychain.gov.in",

    // Dashboard
    dashGreeting: "सुप्रभात",
    dashSentinelTitle: "सेंटिनल हाइव टेलीमेट्री",
    dashSentinelDesc: "आपके पंजीकृत मधुमक्खी छत्तों का वास्तविक समय में वजन और ध्वनिक विश्लेषण।",
    dashQuickAdd: "शहद फसल जोड़ें",
    dashQuickBatches: "मेरे बैच",
    dashQuickSell: "शहद बेचें",
    sideDashboard: "डैशबोर्ड",
    sideHives: "मेरे छत्ते",
    sideHarvest: "फसल जोड़ें",
    sideBatches: "मेरे बैच",
    sideMarket: "शहद बेचें",
    sideInspection: "निरीक्षण",
    statusOfflineSync: "ऑफ़लाइन सिंक तैयार",
    navSettings: "सेटिंग्स",
    navHelp: "सहायता व सपोर्ट",
    navPortalOverview: "पोर्टल विवरण",
    adminStatUsers: "पंजीकृत उपयोगकर्ता",
    adminStatApproved: "स्वीकृत मधुमक्खी पालक",
    adminStatPending: "समीक्षा लंबित",
    adminStatBatches: "शहद के बैच",
    adminStatBlocks: "ब्लॉकचेन ब्लॉक्स",
    adminUsersTitle: "उपयोगकर्ता रजिस्ट्री",
    adminColUser: "उपयोगकर्ता / पद",
    adminColContact: "संपर्क / ईमेल",
    adminColStatus: "स्थिति",
    adminColKvic: "केवीआईसी आईडी",
    adminActivityTitle: "सक्रिय ब्लॉकचेन गतिविधि",
    qrScannerSub: "शहद के जार के लेबल पर लगे क्यूआर कोड पर कैमरा इंगित करें",
    qrScannerClose: "स्कैन रद्द करें",
    settingsTitle: "खाता एवं पोर्टल सेटिंग्स",
    settingsProfile: "प्रोफ़ाइल जानकारी",
    settingsNotifications: "सूचनाएं (अलर्ट)",
    settingsOffline: "ऑफ़लाइन स्टोरेज",
    settingsSave: "सेटिंग्स सहेजें",
    batchSampleTitle: "नमूना बैच:",
    pureBatchNotice: "केवीआईसी हनी मिशन द्वारा १००% शुद्ध एवं प्रमाणित।",
    flaggedBatchNotice: "गुणवत्ता चेतावनी: मिलावट या टेलीमेट्री विसंगति पाई गई",
    footerTitle: "राष्ट्रीय मधुमक्खी ट्रेसेबिलिटी मंच",
    footerSubtitle: "विकेंद्रीकृत ब्लॉकचेन सत्यापन और ध्वनिक आईओटी तकनीक द्वारा भारतीय मधुमक्खी पालकों का सशक्तीकरण।",
    footerGov: "सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय • भारत सरकार",
    footerRights: "© २०२६ केवीआईसी हनी मिशन। सर्वाधिकार सुरक्षित।"
  }
};

const I18N = {
  currentLang: localStorage.getItem('honeychain_lang') || 'en',

  t(key) {
    const lang = this.currentLang;
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key] !== undefined) {
      return TRANSLATIONS[lang][key];
    }
    return (TRANSLATIONS.en && TRANSLATIONS.en[key]) || key;
  },

  setLang(lang) {
    if (lang !== 'en' && lang !== 'hi') lang = 'en';
    this.currentLang = lang;
    localStorage.setItem('honeychain_lang', lang);
    document.documentElement.setAttribute('lang', lang);
    this.apply();
  },

  toggleLang() {
    this.setLang(this.currentLang === 'en' ? 'hi' : 'en');
  },

  apply() {
    const lang = this.currentLang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.t(key);
      if (val) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = val;
        } else {
          el.textContent = val;
        }
      }
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      const val = this.t(key);
      if (val) el.placeholder = val;
    });

    // Update active state on language toggle buttons
    const btnEn = document.getElementById('lang-toggle-en');
    const btnHi = document.getElementById('lang-toggle-hi');
    if (btnEn && btnHi) {
      btnEn.classList.toggle('active', lang === 'en');
      btnHi.classList.toggle('active', lang === 'hi');
    }

    // Trigger custom event so any dynamic templates update
    window.dispatchEvent(new CustomEvent('honeychain:langchange', { detail: { lang } }));
  },

  init() {
    this.setLang(this.currentLang);
  }
};

if (typeof window !== 'undefined') {
  window.I18N = I18N;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TRANSLATIONS, I18N };
}
