/* ==========================================================================
   ChargeIQ Main Application Controller (ISFEST 2026)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Theme (Dark / Light Mode)
  initThemeToggle();

  // Initialize Tab Navigation
  setupTabNavigation();

  // Initialize Modules
  initAllCharts();
  initSpkluMap();
  initSimulator();
  initInteractiveEdaCharts();

  // Setup Diurnal Day Filter
  setupDiurnalFilter();
});

/* --------------------------------------------------------------------------
   1. Tab Navigation Routing (Sticky Header Controls)
   -------------------------------------------------------------------------- */
function setupTabNavigation() {
  const navLinks = document.querySelectorAll('.nav-link[data-tab]');
  const tabContents = document.querySelectorAll('.dashboard-tab-content');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTabId = link.getAttribute('data-tab');

      // Update Nav Link Active States
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Update Tab Content Visibility
      tabContents.forEach(content => {
        if (content.id === targetTabId) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });

      // Trigger Map Invalidation if Map tab is opened
      if (targetTabId === 'tab-peta' && spkluMap) {
        setTimeout(() => {
          spkluMap.invalidateSize();
        }, 150);
      }

      // Trigger Plotly Resize if EDA tab is opened
      if (targetTabId === 'tab-eda' && typeof Plotly !== 'undefined') {
        setTimeout(() => {
          const plotIds = ['plotly-diurnal', 'plotly-loc-charger', 'plotly-ports', 'plotly-temp', 'plotly-corr', 'plotly-target'];
          plotIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) Plotly.Plots.resize(el);
          });
        }, 100);
      }

      // Smooth scroll to top of content
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// Global Switch Tab function for call-to-action buttons
function switchTab(tabId) {
  const targetLink = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
  if (targetLink) targetLink.click();
}

/* --------------------------------------------------------------------------
   2. Diurnal Day Filter Controller
   -------------------------------------------------------------------------- */
function setupDiurnalFilter() {
  const daySelect = document.getElementById('diurnal-day-select');
  if (!daySelect) return;

  daySelect.addEventListener('change', (e) => {
    initDiurnalChart(e.target.value);
  });
}

/* --------------------------------------------------------------------------
   3. Theme Manager (Dark / Light Mode Controller)
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('chargeiq_theme') || 'dark';

  applyTheme(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('chargeiq_theme', newTheme);
    });
  }
}

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.classList.toggle('light-theme', isLight);
  document.body.classList.toggle('dark-theme', !isLight);

  // Update Plotly EDA charts theme if available
  if (typeof updateEdaChartsTheme === 'function') {
    updateEdaChartsTheme(isLight);
  }

  // Update Chart.js instances if available
  if (typeof updateChartJsTheme === 'function') {
    updateChartJsTheme(isLight);
  }
}
