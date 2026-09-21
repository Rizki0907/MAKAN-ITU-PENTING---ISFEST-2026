/* ==========================================================================
   ChargeIQ Main Application Controller (ISFEST 2026)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Preloader Telemetry Animation
  initPreloader();

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

  // Initialize Animated Counters
  setTimeout(animateHeroCounters, 150);
});

/* --------------------------------------------------------------------------
   0. ChargeIQ Telemetry Preloader Controller
   -------------------------------------------------------------------------- */
function initPreloader() {
  const preloader = document.getElementById('chargeiq-preloader');
  const fill = document.getElementById('preloader-progress-fill');
  const status = document.getElementById('preloader-status-text');

  if (!preloader) return;

  const steps = [
    { progress: 28, text: 'Menginisialisasi Telemetri 150 SPKLU...' },
    { progress: 62, text: 'Memuat Profil Spasial-Temporal...' },
    { progress: 88, text: 'Sinkronisasi Model Konsensus GBDT...' },
    { progress: 100, text: 'Sistem Siap &bull; ChargeIQ Aktif' }
  ];

  let currentStep = 0;
  const stepInterval = setInterval(() => {
    if (currentStep < steps.length) {
      if (fill) fill.style.width = steps[currentStep].progress + '%';
      if (status) status.innerHTML = steps[currentStep].text;
      currentStep++;
    } else {
      clearInterval(stepInterval);
      setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 500);
      }, 300);
    }
  }, 220);
}

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

      // Trigger Hero Counters Animation if Beranda is opened
      if (targetTabId === 'tab-beranda') {
        animateHeroCounters();
      }

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
  const savedTheme = localStorage.getItem('chargeiq_theme') || 'light';

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

/* --------------------------------------------------------------------------
   4. Animated Number Counters (Smooth Count-up for KPI Hero Cards)
   -------------------------------------------------------------------------- */
function animateHeroCounters() {
  const statElements = document.querySelectorAll('.stat-value[data-target]');
  statElements.forEach(el => {
    const target = parseFloat(el.getAttribute('data-target'));
    const isDecimal = el.getAttribute('data-decimal') === 'true';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;

      if (isDecimal) {
        el.innerText = current.toFixed(4) + suffix;
      } else {
        el.innerText = Math.round(current).toLocaleString() + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        if (isDecimal) {
          el.innerText = target.toFixed(4) + suffix;
        } else {
          el.innerText = target.toLocaleString() + suffix;
        }
      }
    }

    requestAnimationFrame(updateCounter);
  });
}

