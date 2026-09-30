const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const checks = [
  'id="tab-farmer"',
  'id="tab-kvic"',
  'id="tab-admin"',
  'id="fill-cred-farmer-approved"',
  'id="fill-cred-kvic"',
  'id="fill-cred-admin"',
  'data-sidebar-tab="dash"',
  'data-sidebar-tab="hives"',
  'data-sidebar-tab="harvest"',
  'data-sidebar-tab="batches"',
  'data-sidebar-tab="market"',
  'data-sidebar-tab="inspection"',
  'id="farmer-subview-dash"',
  'id="farmer-subview-hives"',
  'id="farmer-subview-harvest"',
  'id="farmer-subview-batches"',
  'id="farmer-subview-market"',
  'id="farmer-subview-inspection"'
];

let allPassed = true;
checks.forEach(c => {
  if (html.includes(c)) {
    console.log('✓ Found: ' + c);
  } else {
    console.error('✗ MISSING: ' + c);
    allPassed = false;
  }
});

if (html.includes('farmer-topbar-actions')) {
  console.error('✗ farmer-topbar-actions STILL PRESENT');
  allPassed = false;
} else {
  console.log('✓ farmer-topbar-actions properly removed');
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log('\nAll HTML checks PASSED!');
}
