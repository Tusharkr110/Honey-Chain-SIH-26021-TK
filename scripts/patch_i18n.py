import json
import re

with open('i18n.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Additional keys for EN and HI
extra_en = {
    # Farmer Tab Bar
    "sideDashboard": "Dashboard",
    "sideHives": "My Hives",
    "sideHarvest": "Add Harvest",
    "sideBatches": "My Batches",
    "sideMarket": "Sell Honey",
    "sideInspection": "Inspection",
    "statusOfflineSync": "Offline sync ready",
    "navSettings": "Settings",
    "navHelp": "Help & Support",
    "navPortalOverview": "Portal Overview",

    # Admin Dashboard
    "adminStatUsers": "Registered Users",
    "adminStatApproved": "Approved Beekeepers",
    "adminStatPending": "Pending Review",
    "adminStatBatches": "Honey Batches",
    "adminStatBlocks": "Blockchain Blocks",
    "adminUsersTitle": "User Registry",
    "adminColUser": "User / Role",
    "adminColContact": "Contact / Email",
    "adminColStatus": "Status",
    "adminColKvic": "KVIC ID",
    "adminActivityTitle": "Live Blockchain Activity",

    # QR Scanner
    "qrScannerSub": "Point your camera at the QR code on the honey jar label",
    "qrScannerClose": "Cancel Scan",

    # Settings Modal
    "settingsTitle": "Account & Portal Settings",
    "settingsProfile": "Profile Information",
    "settingsNotifications": "Notifications",
    "settingsOffline": "Offline Storage",
    "settingsSave": "Save Settings",

    # Verify Additional
    "batchSampleTitle": "Sample Batches:",
    "pureBatchNotice": "100% Pure & Authenticated by KVIC Honey Mission.",
    "flaggedBatchNotice": "Quality Alert: Adulteration or Telemetry Mismatch Detected",

    # Footer
    "footerTitle": "National Honey Traceability Platform",
    "footerSubtitle": "Empowering Indian beekeepers through decentralized blockchain provenance and acoustic IoT intelligence.",
    "footerGov": "Ministry of Micro, Small & Medium Enterprises (MoMSME) • Government of India",
    "footerRights": "© 2026 KVIC Honey Mission. All Rights Reserved."
}

extra_hi = {
    # Farmer Tab Bar
    "sideDashboard": "डैशबोर्ड",
    "sideHives": "मेरे छत्ते",
    "sideHarvest": "फसल जोड़ें",
    "sideBatches": "मेरे बैच",
    "sideMarket": "शहद बेचें",
    "sideInspection": "निरीक्षण",
    "statusOfflineSync": "ऑफ़लाइन सिंक तैयार",
    "navSettings": "सेटिंग्स",
    "navHelp": "सहायता व सपोर्ट",
    "navPortalOverview": "पोर्टल विवरण",

    # Admin Dashboard
    "adminStatUsers": "पंजीकृत उपयोगकर्ता",
    "adminStatApproved": "स्वीकृत मधुमक्खी पालक",
    "adminStatPending": "समीक्षा लंबित",
    "adminStatBatches": "शहद के बैच",
    "adminStatBlocks": "ब्लॉकचेन ब्लॉक्स",
    "adminUsersTitle": "उपयोगकर्ता रजिस्ट्री",
    "adminColUser": "उपयोगकर्ता / पद",
    "adminColContact": "संपर्क / ईमेल",
    "adminColStatus": "स्थिति",
    "adminColKvic": "केवीआईसी आईडी",
    "adminActivityTitle": "सक्रिय ब्लॉकचेन गतिविधि",

    # QR Scanner
    "qrScannerSub": "शहद के जार के लेबल पर लगे क्यूआर कोड पर कैमरा इंगित करें",
    "qrScannerClose": "स्कैन रद्द करें",

    # Settings Modal
    "settingsTitle": "खाता एवं पोर्टल सेटिंग्स",
    "settingsProfile": "प्रोफ़ाइल जानकारी",
    "settingsNotifications": "सूचनाएं (अलर्ट)",
    "settingsOffline": "ऑफ़लाइन स्टोरेज",
    "settingsSave": "सेटिंग्स सहेजें",

    # Verify Additional
    "batchSampleTitle": "नमूना बैच:",
    "pureBatchNotice": "केवीआईसी हनी मिशन द्वारा १००% शुद्ध एवं प्रमाणित।",
    "flaggedBatchNotice": "गुणवत्ता चेतावनी: मिलावट या टेलीमेट्री विसंगति पाई गई",

    # Footer
    "footerTitle": "राष्ट्रीय मधुमक्खी ट्रेसेबिलिटी मंच",
    "footerSubtitle": "विकेंद्रीकृत ब्लॉकचेन सत्यापन और ध्वनिक आईओटी तकनीक द्वारा भारतीय मधुमक्खी पालकों का सशक्तीकरण।",
    "footerGov": "सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय • भारत सरकार",
    "footerRights": "© २०२६ केवीआईसी हनी मिशन। सर्वाधिकार सुरक्षित।"
}

# Find end of en dictionary
en_end = text.find('dashQuickSell: "Sell Honey"')
if en_end != -1:
    pos = text.find('\n  },', en_end)
    insert_en_str = ',\n' + ',\n'.join([f'    {k}: {json.dumps(v, ensure_ascii=False)}' for k, v in extra_en.items()])
    text = text[:pos] + insert_en_str + text[pos:]

# Find end of hi dictionary
hi_end = text.find('dashQuickSell: "शहद बेचें"')
if hi_end != -1:
    pos = text.find('\n  }', hi_end)
    insert_hi_str = ',\n' + ',\n'.join([f'    {k}: {json.dumps(v, ensure_ascii=False)}' for k, v in extra_hi.items()])
    text = text[:pos] + insert_hi_str + text[pos:]

with open('i18n.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: Enriched i18n.js with all new keys")
