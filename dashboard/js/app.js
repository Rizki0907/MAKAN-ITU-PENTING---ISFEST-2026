/* ==========================================================================
   EV-PULSE Main Application Controller (ISFEST 2026)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Tab Navigation
  setupTabNavigation();

  // Initialize Modules
  initAllCharts();
  initSpkluMap();
  initSimulator();

  // Setup EDA Gallery Modal
  setupEdaModal();

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
   3. EDA Image Modal Viewer
   -------------------------------------------------------------------------- */
function setupEdaModal() {
  const modal = document.getElementById('eda-modal');
  const modalImg = document.getElementById('eda-modal-img');
  const modalTitle = document.getElementById('eda-modal-title');
  const modalDesc = document.getElementById('eda-modal-desc');
  const closeBtn = document.getElementById('eda-modal-close');

  if (!modal) return;

  document.querySelectorAll('.eda-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const title = card.querySelector('.eda-title');
      const desc = card.querySelector('.eda-desc');

      if (img && modalImg) modalImg.src = img.src;
      if (title && modalTitle) modalTitle.innerText = title.innerText;
      if (desc && modalDesc) modalDesc.innerText = desc.innerText;

      modal.style.display = 'flex';
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}
