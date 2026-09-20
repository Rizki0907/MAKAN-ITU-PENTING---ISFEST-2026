/* ==========================================================================
   Chart.js & Visualization Controllers (ChargeIQ ISFEST 2026)
   ========================================================================== */

let donutChartInstance = null;
let diurnalChartInstance = null;
let featureChartInstance = null;
let modelChartInstance = null;
let futureForecastChartInstance = null;

// Global Chart.js Defaults for Dark Mode Luxury Aesthetic
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(14, 20, 36, 0.95)';
Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(99, 102, 241, 0.4)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;

function initAllCharts() {
  initDonutChart();
  initDiurnalChart(0); // Default to Monday / all days
  initFeatureImportanceChart();
  initFutureForecastChart();
  setupForecastControls();
  renderHourlyHeatmap();
  renderModelEvaluationTable();
}

function updateChartJsTheme(isLight) {
  Chart.defaults.color = isLight ? '#475569' : '#94a3b8';
  Chart.defaults.plugins.tooltip.backgroundColor = isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(14, 20, 36, 0.95)';
  Chart.defaults.plugins.tooltip.titleColor = isLight ? '#0f172a' : '#ffffff';
  Chart.defaults.plugins.tooltip.bodyColor = isLight ? '#334155' : '#e2e8f0';
  Chart.defaults.plugins.tooltip.borderColor = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(99, 102, 241, 0.4)';

  if (donutChartInstance) initDonutChart();
  const daySelect = document.getElementById('diurnal-day-select');
  const dayVal = daySelect ? daySelect.value : 0;
  if (diurnalChartInstance) initDiurnalChart(dayVal);
  if (featureChartInstance) initFeatureImportanceChart();
  if (futureForecastChartInstance) {
    const catSelect = document.getElementById('forecast-category-select');
    const itemSelect = document.getElementById('forecast-item-select');
    const cat = catSelect ? catSelect.value : 'national';
    const item = itemSelect ? itemSelect.value : '';
    initFutureForecastChart(cat, item);
  }
}

/* --------------------------------------------------------------------------
   1. Donut Chart (Distribusi Kategori Utilisasi Nasional)
   -------------------------------------------------------------------------- */
function initDonutChart() {
  const canvas = document.getElementById('donutUtilChart');
  if (!canvas) return;

  // Calculate actual counts from STATIONS_DATA
  let high = 0, medium = 0, low = 0;
  STATIONS_DATA.forEach(s => {
    if (s.avg_utilization >= 0.55) high++;
    else if (s.avg_utilization >= 0.38) medium++;
    else low++;
  });

  const total = STATIONS_DATA.length;
  document.getElementById('donut-center-val').innerText = `${total}`;
  document.getElementById('legend-high-val').innerText = `${high} (${((high/total)*100).toFixed(0)}%)`;
  document.getElementById('legend-med-val').innerText = `${medium} (${((medium/total)*100).toFixed(0)}%)`;
  document.getElementById('legend-low-val').innerText = `${low} (${((low/total)*100).toFixed(0)}%)`;

  const ctx = canvas.getContext('2d');
  if (donutChartInstance) donutChartInstance.destroy();

  donutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Tinggi (>55%)', 'Sedang (38-55%)', 'Rendah (<38%)'],
      datasets: [{
        data: [high, medium, low],
        backgroundColor: [
          '#ef4444', // Red
          '#f59e0b', // Amber
          '#10b981'  // Emerald
        ],
        borderWidth: 2,
        borderColor: '#0e1424',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.parsed;
              const pct = ((val / total) * 100).toFixed(1);
              return ` ${context.label}: ${val} Stasiun (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

/* --------------------------------------------------------------------------
   2. Diurnal 24-Hour Utilization Curve
   -------------------------------------------------------------------------- */
function initDiurnalChart(dayFilter = 'all') {
  const canvas = document.getElementById('diurnalChart');
  if (!canvas) return;

  let diurnalData = ANALYTICS_DATA.diurnal;

  // Aggregate by hour (0 to 23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const meanVals = [];
  const p25Vals = [];
  const p75Vals = [];

  hours.forEach(hr => {
    let filtered = diurnalData.filter(d => d.hour === hr);
    if (dayFilter !== 'all') {
      filtered = filtered.filter(d => d.dayofweek === parseInt(dayFilter));
    }

    if (filtered.length > 0) {
      const avgMean = filtered.reduce((acc, cur) => acc + cur.mean_utilization, 0) / filtered.length;
      const avgP25 = filtered.reduce((acc, cur) => acc + cur.p25_utilization, 0) / filtered.length;
      const avgP75 = filtered.reduce((acc, cur) => acc + cur.p75_utilization, 0) / filtered.length;

      meanVals.push(avgMean * 100);
      p25Vals.push(avgP25 * 100);
      p75Vals.push(avgP75 * 100);
    } else {
      meanVals.push(0);
      p25Vals.push(0);
      p75Vals.push(0);
    }
  });

  const ctx = canvas.getContext('2d');
  if (diurnalChartInstance) diurnalChartInstance.destroy();

  diurnalChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours.map(h => `${h.toString().padStart(2, '0')}:00`),
      datasets: [
        {
          label: 'Median / Mean Utilisasi (%)',
          data: meanVals,
          borderColor: '#00f2fe',
          backgroundColor: 'rgba(0, 242, 254, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#00f2fe',
          pointRadius: 3,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: false,
          zIndex: 2
        },
        {
          label: 'P75 (Kuartil Atas)',
          data: p75Vals,
          borderColor: 'rgba(236, 72, 153, 0.5)',
          backgroundColor: 'rgba(236, 72, 153, 0.08)',
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointRadius: 0,
          tension: 0.35,
          fill: '+1'
        },
        {
          label: 'P25 (Kuartil Bawah)',
          data: p25Vals,
          borderColor: 'rgba(139, 92, 246, 0.5)',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointRadius: 0,
          tension: 0.35,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 14, font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: function(c) {
              return ` ${c.dataset.label}: ${c.parsed.y.toFixed(1)}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          title: { display: true, text: 'Jam Operasional (00:00 - 23:00)', font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
          min: 0,
          max: 85,
          ticks: { callback: v => `${v}%` },
          title: { display: true, text: 'Tingkat Utilisasi (%)', font: { size: 11 } }
        }
      }
    }
  });
}

/* --------------------------------------------------------------------------
   3. Feature Importance Horizontal Bar Chart
   -------------------------------------------------------------------------- */
function initFeatureImportanceChart() {
  const canvas = document.getElementById('featureImportanceChart');
  if (!canvas) return;

  const features = ANALYTICS_DATA.features;
  const labels = features.map(f => f.Fitur);
  const consensusVals = features.map(f => f['Konsensus (%)']);
  const lgbVals = features.map(f => f['LightGBM (%)']);
  const xgbVals = features.map(f => f['XGBoost (%)']);

  const ctx = canvas.getContext('2d');
  if (featureChartInstance) featureChartInstance.destroy();

  featureChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Bobot Konsensus (%)',
          data: consensusVals,
          backgroundColor: 'rgba(99, 102, 241, 0.85)',
          borderColor: '#818cf8',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'LightGBM (%)',
          data: lgbVals,
          backgroundColor: 'rgba(0, 242, 254, 0.35)',
          borderColor: '#00f2fe',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: c => ` ${c.dataset.label}: ${c.parsed.x.toFixed(2)}%`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { callback: v => `${v}%` }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11, family: 'monospace' } }
        }
      }
    }
  });
}

/* --------------------------------------------------------------------------
   4. Render 7x24 Matrix Heatmap
   -------------------------------------------------------------------------- */
function renderHourlyHeatmap() {
  const container = document.getElementById('heatmap-container');
  if (!container) return;

  const heatmapData = ANALYTICS_DATA.heatmap;
  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  let html = `
    <table class="heatmap-table">
      <thead>
        <tr>
          <th class="day-header">Hari</th>
  `;

  for (let h = 0; h < 24; h++) {
    html += `<th>${h}</th>`;
  }
  html += `</tr></thead><tbody>`;

  heatmapData.forEach((row, idx) => {
    html += `<tr><td class="day-header">${dayNames[row.dayofweek] || 'Hari ' + row.dayofweek}</td>`;
    for (let h = 0; h < 24; h++) {
      const val = row[h.toString()] || 0;
      const pct = (val * 100).toFixed(1);
      
      // Color interpolation: 0.10 (low) -> 0.40 (med) -> 0.70 (high)
      let bgColor, textColor = '#ffffff';
      if (val < 0.20) {
        bgColor = 'rgba(30, 58, 138, 0.35)'; // Deep Navy
        textColor = '#94a3b8';
      } else if (val < 0.35) {
        bgColor = 'rgba(14, 116, 144, 0.6)'; // Teal
      } else if (val < 0.50) {
        bgColor = 'rgba(16, 185, 129, 0.7)'; // Emerald
      } else if (val < 0.62) {
        bgColor = 'rgba(245, 158, 11, 0.8)'; // Amber
      } else {
        bgColor = 'rgba(239, 68, 68, 0.85)'; // Red/Coral
      }

      html += `<td style="background-color: ${bgColor}; color: ${textColor};" title="${dayNames[row.dayofweek]} Jam ${h}:00: ${pct}% Utilisasi">${pct}</td>`;
    }
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

/* --------------------------------------------------------------------------
   5. Render Model Evaluation Table
   -------------------------------------------------------------------------- */
function renderModelEvaluationTable() {
  const tbody = document.getElementById('model-eval-tbody');
  if (!tbody) return;

  const models = ANALYTICS_DATA.models;
  let html = '';

  models.forEach((m, idx) => {
    const isChampion = idx === 2; // A3 Balanced
    const pct = m.Weight_Percentage || 0;
    html += `
      <tr>
        <td>
          <strong style="color: #ffffff;">${m.Model}</strong>
          ${isChampion ? '<span class="badge-model badge-champion" style="margin-left: 6px;">Best Single</span>' : ''}
        </td>
        <td>${m['Kedalaman Pohon']}</td>
        <td>${m['Learning Rate']}</td>
        <td>${m['Pohon Optimal (Validation)']}</td>
        <td>${m['Pohon Pelatihan Penuh (125%)']}</td>
        <td style="font-family: monospace; font-weight: 700; color: ${m['Holdout RMSE'] < 0.0678 ? '#34d399' : '#cbd5e1'}">
          ${m['Holdout RMSE'].toFixed(6)}
        </td>
        <td style="min-width: 105px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; font-family: monospace; font-size: 0.78rem;">
            <span style="color: #60a5fa; font-weight: 600;">${pct.toFixed(2)}%</span>
            <div style="flex: 1; max-width: 44px; height: 5px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
              <div style="width: ${(pct / 25) * 100}%; height: 100%; background: linear-gradient(90deg, #6366f1, #00f2fe); border-radius: 3px;"></div>
            </div>
          </div>
        </td>
      </tr>
    `;
  });

  // Final Consensus Ensemble Row
  html += `
    <tr style="background: rgba(99, 102, 241, 0.15); border-top: 2px solid rgba(99, 102, 241, 0.4);">
      <td>
        <span class="badge-model badge-champion" style="margin-right: 6px;">Consensus</span>
        <strong style="color: #a5b4fc;">Meta-Learner</strong>
        <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 2px;">Ridge + Shift / Shrinkage</span>
      </td>
      <td>Ensemble</td>
      <td>-</td>
      <td>5 Seeds</td>
      <td>100% Data</td>
      <td style="font-family: monospace; font-weight: 800; color: #4ade80;">
        0.067710
      </td>
      <td style="min-width: 105px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; font-family: monospace; font-size: 0.78rem;">
          <span style="color: #a5b4fc; font-weight: 700;">100.0%</span>
          <div style="flex: 1; max-width: 44px; height: 5px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
            <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #ec4899, #a5b4fc); border-radius: 3px;"></div>
          </div>
        </div>
      </td>
    </tr>
  `;

  tbody.innerHTML = html;
}

/* --------------------------------------------------------------------------
   6. Future Demand Forecast Time-Series (24 Nov - 31 Des 2025 Test Set)
   -------------------------------------------------------------------------- */
function initFutureForecastChart(selectedCategory = 'national', selectedItem = '') {
  const canvas = document.getElementById('futureForecastChart');
  if (!canvas) return;

  const forecastData = ANALYTICS_DATA.forecast;
  if (!forecastData) return;

  renderForecastRanking();

  const dates = forecastData.dates;
  let dataPoints = [];
  let chartLabel = 'Rata-rata Nasional';

  if (selectedCategory === 'city' && selectedItem && forecastData.city_daily[selectedItem]) {
    chartLabel = `Kota: ${selectedItem}`;
    dataPoints = dates.map(d => (forecastData.city_daily[selectedItem][d] || 0) * 100);
  } else if (selectedCategory === 'location' && selectedItem && forecastData.location_daily[selectedItem]) {
    chartLabel = `Lokasi: ${selectedItem}`;
    dataPoints = dates.map(d => (forecastData.location_daily[selectedItem][d] || 0) * 100);
  } else {
    chartLabel = 'Rata-rata Nasional Seluruh Stasiun';
    dataPoints = dates.map(d => (forecastData.national_daily[d] || 0) * 100);
  }

  const labels = dates.map(d => {
    const parts = d.split('-');
    const day = parts[2];
    const month = parts[1] === '11' ? 'Nov' : 'Des';
    return `${day} ${month}`;
  });

  const ctx = canvas.getContext('2d');
  if (futureForecastChartInstance) futureForecastChartInstance.destroy();

  const gradient = ctx.createLinearGradient(0, 0, 0, 320);
  gradient.addColorStop(0, 'rgba(0, 242, 254, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 242, 254, 0.01)');

  futureForecastChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${chartLabel} (%)`,
        data: dataPoints,
        borderColor: '#00f2fe',
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        pointBackgroundColor: '#00f2fe',
        pointRadius: 2.5,
        pointHoverRadius: 5,
        tension: 0.28
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          labels: { color: '#94a3b8', font: { size: 11, family: "'Inter', sans-serif" } }
        },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              return ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#94a3b8', font: { size: 10 }, maxTicksLimit: 13 }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
          ticks: {
            color: '#94a3b8',
            callback: v => `${v}%`
          },
          suggestedMin: 15,
          suggestedMax: 80
        }
      }
    }
  });
}

function setupForecastControls() {
  const catSelect = document.getElementById('forecast-category-select');
  const itemSelect = document.getElementById('forecast-item-select');
  if (!catSelect || !itemSelect) return;

  const forecastData = ANALYTICS_DATA.forecast;
  if (!forecastData) return;

  catSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'national') {
      itemSelect.style.display = 'none';
      initFutureForecastChart('national');
    } else if (val === 'city') {
      itemSelect.style.display = 'inline-block';
      itemSelect.innerHTML = '';
      forecastData.cities.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.text = c;
        itemSelect.appendChild(opt);
      });
      initFutureForecastChart('city', forecastData.cities[0]);
    } else if (val === 'location') {
      itemSelect.style.display = 'inline-block';
      itemSelect.innerHTML = '';
      forecastData.location_types.forEach(l => {
        const opt = document.createElement('option');
        opt.value = l;
        opt.text = l;
        itemSelect.appendChild(opt);
      });
      initFutureForecastChart('location', forecastData.location_types[0]);
    }
  });

  itemSelect.addEventListener('change', (e) => {
    initFutureForecastChart(catSelect.value, e.target.value);
  });
}

function renderForecastRanking() {
  const container = document.getElementById('forecast-ranking-list');
  if (!container) return;

  const ranking = ANALYTICS_DATA.forecast ? ANALYTICS_DATA.forecast.city_ranking : null;
  if (!ranking) return;

  const top5 = Object.entries(ranking).slice(0, 5);
  let html = '<div style="display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.5rem;">';

  top5.forEach(([city, val], idx) => {
    const pct = (val * 100).toFixed(1);
    const color = idx === 0 ? '#00f2fe' : (idx === 1 ? '#6366f1' : '#a5b4fc');
    html += `
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 2px;">
          <span><strong>#${idx + 1} ${city}</strong></span>
          <span style="font-family: monospace; font-weight: 700; color: ${color}">${pct}%</span>
        </div>
        <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
          <div style="width: ${(val / 0.65) * 100}%; height: 100%; background: linear-gradient(90deg, ${color}, #ec4899); border-radius: 3px;"></div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

