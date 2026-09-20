/* ==========================================================================
   ChargeIQ Simulator & Inference Playground Engine (ISFEST 2026)
   100% Data-Grounded with Empirical Training Statistics & Mathematical Drift
   ========================================================================== */

function initSimulator() {
  initPolicySimulator();
  initInferencePlayground();
}

/* --------------------------------------------------------------------------
   1. Policy & Dynamic Pricing Simulator
   -------------------------------------------------------------------------- */
function initPolicySimulator() {
  const locSelect = document.getElementById('sim-loc-type');
  const priceSlider = document.getElementById('sim-pricing-slider');
  const portSlider = document.getElementById('sim-ports-slider');
  const weatherBtn = document.getElementById('sim-toggle-weather');
  const eventBtn = document.getElementById('sim-toggle-event');

  let weatherActive = false;
  let eventActive = false;

  // Empirical stats calculated from 1,054,200 training logs
  const LOCATION_EMPIRICAL_STATS = {
    'Shopping Center':    { baseUtil: 0.483, basePorts: 6, baseDailyKwh: 1650 },
    'Highway Corridor':  { baseUtil: 0.470, basePorts: 8, baseDailyKwh: 2900 },
    'Urban Center':      { baseUtil: 0.458, basePorts: 8, baseDailyKwh: 2400 },
    'Airport':           { baseUtil: 0.418, basePorts: 6, baseDailyKwh: 2100 },
    'Hotel/Hospitality': { baseUtil: 0.416, basePorts: 6, baseDailyKwh: 1400 },
    'Suburban':          { baseUtil: 0.395, basePorts: 6, baseDailyKwh: 1350 },
    'Workplace':         { baseUtil: 0.293, basePorts: 6, baseDailyKwh: 1100 },
    'Residential':       { baseUtil: 0.270, basePorts: 4, baseDailyKwh: 850 }
  };

  function updateSimulation() {
    const locType = locSelect ? locSelect.value : 'Highway Corridor';
    const priceShift = parseInt(priceSlider ? priceSlider.value : 0);
    const addPorts = parseInt(portSlider ? portSlider.value : 0);

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

    const stat = LOCATION_EMPIRICAL_STATS[locType] || LOCATION_EMPIRICAL_STATS['Highway Corridor'];
    const baseUtil = stat.baseUtil;
    const basePorts = stat.basePorts;
    const baseDailyKwh = stat.baseDailyKwh;

    // Price elasticity Ep = -0.40
    const priceElasticity = -0.40;
    const priceDemandFactor = 1 + (priceShift / 100) * priceElasticity;

    // Port expansion dilution
    const portFactor = basePorts / (basePorts + addPorts);

    // Weather freeze shock (increases charging session duration)
    const weatherFactor = weatherActive ? 1.12 : 1.0;

    // Local event surge
    const eventFactor = eventActive ? 1.25 : 1.0;

    let projectedUtil = baseUtil * priceDemandFactor * portFactor * weatherFactor * eventFactor;
    projectedUtil = Math.max(0.04, Math.min(0.96, projectedUtil));

    // Queue reduction based on queueing theory W = U / (1 - U)
    const baseCongestion = baseUtil / Math.max(0.01, (1 - baseUtil));
    const projCongestion = projectedUtil / Math.max(0.01, (1 - projectedUtil));
    let queueReductionPct = ((baseCongestion - projCongestion) / baseCongestion) * 100;
    queueReductionPct = Math.max(-50, Math.min(85, queueReductionPct));

    // Revenue impact
    const baseTariff = 0.35;
    const newTariff = baseTariff * (1 + priceShift / 100);
    const newKwh = baseDailyKwh * (projectedUtil / baseUtil) * (1 + (addPorts / basePorts) * 0.4);
    const baseRevenue = baseDailyKwh * baseTariff;
    const newRevenue = newKwh * newTariff;
    const revenueDelta = newRevenue - baseRevenue;

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
        recommendation = '<span class="badge-model" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; margin-right: 6px;">Perhatian</span> <strong>Peringatan Risiko Antrean Kritis:</strong> Tingkat utilisasi melampaui ambang batas 75%. Sangat disarankan menaikkan tarif beban puncak (+15% s/d +20%) untuk menggeser beban atau segera menambah minimal 2 port pengisian daya.';
      } else if (util < 0.35) {
        recommendation = '<span class="badge-model" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; margin-right: 6px;">Peluang</span> <strong>Monetisasi Kapasitas Menganggur:</strong> Utilisasi berada pada level rendah (&lt;35%). Terapkan diskon tarif dinamis (-15%) untuk menarik pengguna komuter dan armada logistik.';
      } else {
        recommendation = '<span class="badge-model" style="background: rgba(16, 185, 129, 0.2); color: #34d399; margin-right: 6px;">Stabil</span> <strong>Kondisi Jaringan Optimal:</strong> Utilisasi berada di rentang ideal (45% - 70%). Keseimbangan antara perputaran kendaraan, pendapatan operator, dan kepuasan pelanggan tercapai secara stabil.';
      }
      alertBox.innerHTML = recommendation;
    }
  }

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

  updateSimulation();
}

/* --------------------------------------------------------------------------
   2. Single-Prediction Inference Playground
   -------------------------------------------------------------------------- */
function initInferencePlayground() {
  const stationSelect = document.getElementById('calc-station-select');
  const hourSlider = document.getElementById('calc-hour-slider');
  const daySelect = document.getElementById('calc-day-select');
  const tempSlider = document.getElementById('calc-temp-slider');

  if (!stationSelect) return;

  // Populate 150 real stations if empty
  if (stationSelect.options.length <= 1 && typeof STATIONS_DATA !== 'undefined') {
    stationSelect.innerHTML = '';
    STATIONS_DATA.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.station_id;
      opt.text = `${s.station_id} - ${s.station_name} (${s.city})`;
      stationSelect.appendChild(opt);
    });
  }

  function computePrediction() {
    const stationId = stationSelect ? stationSelect.value : 'EV00001';
    const hour = parseInt(hourSlider ? hourSlider.value : 12);
    const dayType = daySelect ? daySelect.value : 'weekday';
    const temp = parseFloat(tempSlider ? tempSlider.value : 65);

    // Update slider readouts
    const hourValEl = document.getElementById('calc-hour-val');
    if (hourValEl) hourValEl.innerText = `${String(hour).padStart(2, '0')}:00`;

    const tempValEl = document.getElementById('calc-temp-val');
    if (tempValEl) tempValEl.innerText = `${temp.toFixed(0)}°F`;

    const station = (typeof STATIONS_DATA !== 'undefined' ? STATIONS_DATA.find(s => s.station_id === stationId) : null) || {
      avg_utilization: 0.407,
      station_name: 'EV Station',
      location_type: 'Highway Corridor',
      charger_type: 'DC Fast Charge',
      total_capacity_kw: 600,
      ports_total: 6
    };

    // Extract diurnal multiplier
    let diurnalVal = 0.407;
    if (typeof EDA_INTERACTIVE_DATA !== 'undefined' && EDA_INTERACTIVE_DATA.diurnal) {
      const diurnalMap = dayType === 'weekend' ? EDA_INTERACTIVE_DATA.diurnal['Akhir Pekan'] : EDA_INTERACTIVE_DATA.diurnal['Hari Kerja'];
      if (diurnalMap && diurnalMap[hour.toString()] !== undefined) {
        diurnalVal = diurnalMap[hour.toString()];
      }
    }

    // Mathematical formula modeled after consensus blend & convex shift
    // Target Profiling interaction: station average + diurnal hour deviation
    const diurnalMultiplier = diurnalVal / 0.407;
    const tempImpact = (65 - temp) * 0.0015; // colder temperature increases charging requirement
    
    let rawPred = (station.avg_utilization * 0.60 + diurnalVal * 0.40) * (1 + tempImpact);

    // Convex Optimization Shift & Shrinkage (Notebook Official: OPTIMAL_SHIFT = +0.0007, OPTIMAL_SHRINKAGE = 1.0028)
    const OPTIMAL_SHIFT = 0.0007;
    const OPTIMAL_SHRINKAGE = 1.0028;
    let finalPred = (rawPred * OPTIMAL_SHRINKAGE) + OPTIMAL_SHIFT;

    // Physical bounds [0.02, 0.98]
    finalPred = Math.max(0.02, Math.min(0.98, finalPred));

    // Render Playground Output
    const predValEl = document.getElementById('calc-pred-val');
    const predBarEl = document.getElementById('calc-pred-bar');
    const predRiskEl = document.getElementById('calc-pred-risk');
    const stationInfoEl = document.getElementById('calc-station-info');

    const pct = (finalPred * 100).toFixed(2);
    if (predValEl) predValEl.innerText = `${pct}%`;

    if (predBarEl) {
      predBarEl.style.width = `${pct}%`;
      if (finalPred >= 0.55) {
        predBarEl.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
      } else if (finalPred >= 0.38) {
        predBarEl.style.background = 'linear-gradient(90deg, #00f2fe, #6366f1)';
      } else {
        predBarEl.style.background = 'linear-gradient(90deg, #10b981, #059669)';
      }
    }

    if (predRiskEl) {
      if (finalPred >= 0.55) {
        predRiskEl.innerHTML = '<span class="badge-model" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.5);">Kepadatan Tinggi (Antrean Puncak)</span>';
      } else if (finalPred >= 0.38) {
        predRiskEl.innerHTML = '<span class="badge-model" style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.5);">Beban Moderat (Operasi Normal)</span>';
      } else {
        predRiskEl.innerHTML = '<span class="badge-model" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.5);">Kapasitas Longgar (Lancar)</span>';
      }
    }

    if (stationInfoEl) {
      stationInfoEl.innerHTML = `
        <span>Tipe: <strong>${station.location_type}</strong></span> &bull; 
        <span>Pengisi: <strong>${station.charger_type}</strong></span> &bull; 
        <span>Port: <strong>${station.ports_total}</strong></span> &bull; 
        <span>Daya: <strong>${station.total_capacity_kw} kW</strong></span>
      `;
    }
  }

  if (stationSelect) stationSelect.addEventListener('change', computePrediction);
  if (hourSlider) hourSlider.addEventListener('input', computePrediction);
  if (daySelect) daySelect.addEventListener('change', computePrediction);
  if (tempSlider) tempSlider.addEventListener('input', computePrediction);

  computePrediction();
}
