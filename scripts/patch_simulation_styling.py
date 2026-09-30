import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace rgba(0,0,0,0.3) in sim cards with class="sim-metric-card"
replacements = [
    # Stage 1 metrics
    ('style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);"', 'class="sim-metric-card"'),
    ('style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 14px;"', 'class="sim-highlight-box"'),
    ('style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;"', 'class="sim-metric-card" style="padding: 10px;"'),
    ('style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 14px; text-align: center;"', 'class="sim-highlight-box" style="text-align: center;"'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Also fix the text variables in renderDemoStage
content = content.replace('color: var(--text-main);', 'color: var(--text);')
content = content.replace('color: var(--text-dim);', 'color: var(--text-muted);')

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Updated simulation stage styling in app.js")
