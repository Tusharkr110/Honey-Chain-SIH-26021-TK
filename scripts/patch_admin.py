import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find and replace the admin dashboard section
old = re.compile(
    r'<section id="view-admin-dashboard".*?</section>',
    re.DOTALL
)

new_section = '''    <section id="view-admin-dashboard" class="admin-dashboard-view" style="display: none;">
      <!-- Admin Header -->
      <div class="admin-header-strip">
        <div>
          <div class="hero-pill" style="margin-bottom:6px; display:inline-flex;">&#128737;&#65039; SUPER ADMIN</div>
          <h2 style="font-size:1.5rem; font-weight:800;">Consortium Network &amp; Node Operations</h2>
          <p style="color:var(--text-muted); font-size:0.88rem;">Logged in as: <strong id="admin-user-name">Rajeshwar Sengupta</strong> &bull; PostgreSQL 18 + MongoDB 8.2</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button type="button" class="btn-secondary" id="btn-admin-reset-data">&#128260; Reset Ledger</button>
          <button type="button" class="btn-primary" onclick="if(typeof showToast===\'function\') showToast(\'Generating audit report...\',\'info\',\'Admin\')">&#128203; Export Report</button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="admin-stats-row">
        <div class="admin-stat-card">
          <div class="admin-stat-icon">&#128101;</div>
          <div class="admin-stat-value" id="admin-users-count">&mdash;</div>
          <div class="admin-stat-label" data-i18n="adminStatUsers">Registered Users</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon">&#9989;</div>
          <div class="admin-stat-value" id="admin-stat-approved">&mdash;</div>
          <div class="admin-stat-label" data-i18n="adminStatApproved">Approved Beekeepers</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon">&#9203;</div>
          <div class="admin-stat-value" id="admin-stat-pending">&mdash;</div>
          <div class="admin-stat-label" data-i18n="adminStatPending">Pending Review</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon">&#127855;</div>
          <div class="admin-stat-value" id="admin-stat-batches">&mdash;</div>
          <div class="admin-stat-label" data-i18n="adminStatBatches">Honey Batches</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon">&#9935;&#65039;</div>
          <div class="admin-stat-value" id="admin-stat-blocks">&mdash;</div>
          <div class="admin-stat-label" data-i18n="adminStatBlocks">Blockchain Blocks</div>
        </div>
      </div>

      <div class="admin-body-grid">
        <!-- Users Table -->
        <div class="panel-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <h3 style="font-size:1rem; font-weight:700;">&#128101; <span data-i18n="adminUsersTitle">User Registry</span></h3>
            <input type="text" id="admin-user-search" class="form-control no-icon" placeholder="Search users..." style="max-width:200px; font-size:0.82rem; padding:6px 12px;">
          </div>
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th data-i18n="adminColUser">User / Role</th>
                  <th data-i18n="adminColContact">Contact / Email</th>
                  <th data-i18n="adminColStatus">Status</th>
                  <th data-i18n="adminColKvic">KVIC ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="admin-users-tbody"></tbody>
            </table>
          </div>
        </div>

        <!-- Blockchain Activity Log -->
        <div class="panel-card admin-log-panel">
          <h3 style="font-size:1rem; font-weight:700; margin-bottom:14px;">&#9935;&#65039; <span data-i18n="adminActivityTitle">Live Blockchain Activity</span></h3>
          <div id="blockchain-logs-container" style="overflow-y:auto; max-height:520px;"></div>
        </div>
      </div>
    </section>'''

result = old.sub(new_section, html, count=1)
if result == html:
    print("ERROR: Pattern not found - no substitution made")
else:
    print(f"SUCCESS: Replaced admin section. Length change: {len(result)-len(html)}")
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(result)
