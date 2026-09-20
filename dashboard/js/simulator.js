/* ==========================================================================
   What-If Policy & Dynamic Pricing Simulator Engine (ISFEST 2026)
   ========================================================================== */

function initSimulator() {
  const locSelect = document.getElementById('sim-loc-type');
  const priceSlider = document.getElementById('sim-pricing-slider');
  const portSlider = document.getElementById('sim-ports-slider');
  const weatherBtn = document.getElementById('sim-toggle-weather');
  const eventBtn = document.getElementById('sim-toggle-event');

  let weatherActive = false;
  let eventActive = false;

  function updateSimulation() {
    const locType = locSelect ? locSelect.value : 'Highway Corridor';
    const priceShift = parseInt(priceSlider ? priceSlider.value : 0); // -30 to +30
    const addPorts = parseInt(portSlider ? portSlider.value : 0); // 0 to 8

    // Update Slider Display Labels
    const priceLabel = document.getElementById('sim-pricing-val');
    if (priceLabel) {
      const sign = priceShift > 0 ? '+' : '';
      priceLabel.innerText = `${sign}${priceShift}%`;
      priceLabel.style.color = priceShift > 0 ? '#f43f5e' : (priceShift < 0 ? '#10b981' : '#00f2fe');
    }

    const portLabel = document.getElementById('sim-ports-val');
    if (portLabel) {
      portLabel.innerText = `+${addPorts} Port`;
    }

    // Base Utilization per Location Type
    let baseUtil = 0.52;
    let basePorts = 6;
    let baseDailyKwh = 1800;

    if (locType === 'Highway Corridor') {
      baseUtil = 0.62;
      basePorts = 8;
      baseDailyKwh = 3200;
    } else if (locType === 'Airport') {
      baseUtil = 0.48;
      basePorts = 6;
      baseDailyKwh = 2100;
    } else if (locType === 'Shopping Center') {
      baseUtil = 0.45;
      basePorts = 6;
      baseDailyKwh = 1500;
    } else if (locType === 'Urban Center') {
      baseUtil = 0.56;
      basePorts = 8;
      baseDailyKwh = 2800;
    } else if (locType === 'Residential') {
      baseUtil = 0.34;
      basePorts = 4;
      baseDailyKwh = 900;
    }

    // 1. Price Elasticity Effect (Ep approx -0.40)
    // Surcharge discourages peak hoarding, discount attracts users
    const priceElasticity = -0.40;
    const priceDemandFactor = 1 + (priceShift / 100) * priceElasticity;

    // 2. Port Expansion Effect (Capacity Dilution)
    // More ports distribute the same demand, reducing utilization rate
    const portFactor = basePorts / (basePorts + addPorts);

    // 3. Weather Freeze Shock (Winter battery degradation increases charging duration)
    const weatherFactor = weatherActive ? 1.12 : 1.0;

    // 4. Local Event Surge
    const eventFactor = eventActive ? 1.25 : 1.0;

    // Calculate Projected Utilization
    let projectedUtil = baseUtil * priceDemandFactor * portFactor * weatherFactor * eventFactor;
    projectedUtil = Math.max(0.04, Math.min(0.96, projectedUtil));

    // Calculate Queue Time Reduction
    // When utilization > 0.70, queue explodes exponentially: W = U / (1 - U)
    const baseCongestion = baseUtil / Math.max(0.01, (1 - baseUtil));
    const projCongestion = projectedUtil / Math.max(0.01, (1 - projectedUtil));
    let queueReductionPct = ((baseCongestion - projCongestion) / baseCongestion) * 100;
    queueReductionPct = Math.max(-50, Math.min(85, queueReductionPct));

    // Calculate Revenue Impact (Price vs Volume)
    // Rev = Volume * PricePerKwh
    const baseTariff = 0.35; // $0.35 / kWh
    const newTariff = baseTariff * (1 + priceShift / 100);
    const newKwh = baseDailyKwh * (projectedUtil / baseUtil) * (1 + (addPorts / basePorts) * 0.4);
    const baseRevenue = baseDailyKwh * baseTariff;
    const newRevenue = newKwh * newTariff;
    const revenueDelta = newRevenue - baseRevenue;

    // Update UI Elements
    renderSimulatorResults(projectedUtil, queueReductionPct, revenueDelta, priceShift, addPorts, weatherActive, eventActive);
  }

  function renderSimulatorResults(util, queueRed, revDelta, priceShift, ports, isWeather, isEvent) {
    const utilValEl = document.getElementById('sim-result-util-val');
    const utilBarEl = document.getElementById('sim-result-util-bar');
    const queueValEl = document.getElementById('sim-result-queue-val');
    const revValEl = document.getElementById('sim-result-rev-val');
    const alertBox = document.getElementById('sim-policy-alert');

    const pct = (util * 100).toFixed(1);
    if (utilValEl) utilValEl.innerText = `${pct}%`;
    if (utilBarEl) {
      utilBarEl.style.width = `${pct}%`;
      if (util >= 0.70) utilBarEl.style.background = '#ef4444';
      else if (util >= 0.45) utilBarEl.style.background = '#f59e0b';
      else utilBarEl.style.background = '#10b981';
    }

    if (queueValEl) {
      const sign = queueRed >= 0 ? '-' : '+';
      queueValEl.innerText = `${sign}${Math.abs(queueRed).toFixed(0)}% Antrean`;
      queueValEl.className = 'sim-kpi-val ' + (queueRed >= 0 ? 'positive' : 'negative');
    }

    if (revValEl) {
      const sign = revDelta >= 0 ? '+$' : '-$';
      revValEl.innerText = `${sign}${Math.abs(revDelta).toFixed(0)} / Hari`;
      revValEl.className = 'sim-kpi-val ' + (revDelta >= 0 ? 'positive' : 'negative');
    }

    if (alertBox) {
      let recommendation = '';
      if (util > 0.75) {
        recommendation = '🚨 <strong>Peringatan Risiko Antrean Kritis:</strong> Tingkat utilisasi melampaui ambang batas 75%. Sangat disarankan menaikkan tarif beban puncak (+15% s/d +20%) untuk menggeser beban atau segera menambah minimal 2 port pengisian daya.';
      } else if (util < 0.35) {
        recommendation = '💡 <strong>Peluang Monetisasi Kapasitas Menganggur:</strong> Utilisasi berada pada level rendah (<35%). Terapkan diskon tarif dinamis (-15%) untuk menarik pengguna komuter dan armada logistik.';
      } else {
        recommendation = '✅ <strong>Kondisi Jaringan Optimal:</strong> Utilisasi berada di rentang ideal (45% - 70%). Keseimbangan antara perputaran kendaraan, pendapatan operator, dan kepuasan pelanggan tercapai secara stabil.';
      }
      alertBox.innerHTML = recommendation;
    }
  }

  // Event Listeners
  if (locSelect) locSelect.addEventListener('change', updateSimulation);
  if (priceSlider) priceSlider.addEventListener('input', updateSimulation);
  if (portSlider) portSlider.addEventListener('input', updateSimulation);

  if (weatherBtn) {
    weatherBtn.addEventListener('click', () => {
      weatherActive = !weatherActive;
      weatherBtn.classList.toggle('active', weatherActive);
      updateSimulation();
    });
  }

  if (eventBtn) {
    eventBtn.addEventListener('click', () => {
      eventActive = !eventActive;
      eventBtn.classList.toggle('active', eventActive);
      updateSimulation();
    });
  }

  // Initial Run
  updateSimulation();
}
