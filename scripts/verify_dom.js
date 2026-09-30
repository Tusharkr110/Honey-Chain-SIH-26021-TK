const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const requiredIds = [
  'view-home', 'view-how-to', 'step-cards-row', 'tab-howto-farmers', 'tab-howto-buyers',
  'view-verify', 'form-verify-jar', 'input-verify-batch', 'btn-scan-qr-camera',
  'box-result-verified', 'box-result-flagged',
  'qr-scanner-overlay', 'btn-quick-scan-pure', 'btn-quick-scan-fraud', 'btn-qr-scanner-close',
  'view-farmer-dashboard', 'dash-farmer-name',
  'profile-dropdown-trigger', 'profile-dropdown-menu', 'profile-menu-home', 'profile-menu-howto', 'profile-menu-settings',
  'modal-settings', 'tab-set-profile', 'tab-set-notify', 'tab-set-offline', 'btn-save-settings',
  'view-admin-dashboard', 'admin-users-count', 'admin-stat-approved', 'admin-stat-pending', 'admin-users-tbody', 'blockchain-logs-container'
];

const missing = requiredIds.filter(id => !html.includes(`id="${id}"`) && !html.includes(`id='${id}'`));
if (missing.length > 0) {
  console.log('MISSING IDs in index.html:', missing);
} else {
  console.log('ALL required DOM IDs found in index.html! (Total checked: ' + requiredIds.length + ')');
}
