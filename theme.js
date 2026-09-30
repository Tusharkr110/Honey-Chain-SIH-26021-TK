// theme.js - Light & Dark Theme Manager with System Preference and LocalStorage Persistence
const THEME = {
  currentTheme: localStorage.getItem('honeychain_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),

  apply(theme) {
    if (theme !== 'light' && theme !== 'dark') theme = 'light';
    this.currentTheme = theme;
    localStorage.setItem('honeychain_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
    }

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.innerHTML = theme === 'dark' 
        ? '<span class="theme-icon">☀️</span><span class="sr-only">Switch to Light Theme</span>' 
        : '<span class="theme-icon">🌙</span><span class="sr-only">Switch to Dark Theme</span>';
      toggleBtn.setAttribute('title', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
      toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
    }

    window.dispatchEvent(new CustomEvent('honeychain:themechange', { detail: { theme } }));
  },

  toggle() {
    this.apply(this.currentTheme === 'light' ? 'dark' : 'light');
  },

  init() {
    this.apply(this.currentTheme);

    // Watch for OS theme changes if user hasn't set manual override
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('honeychain_theme')) {
          this.apply(e.matches ? 'dark' : 'light');
        }
      });
    }
  }
};

if (typeof window !== 'undefined') {
  window.THEME = THEME;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { THEME };
}
