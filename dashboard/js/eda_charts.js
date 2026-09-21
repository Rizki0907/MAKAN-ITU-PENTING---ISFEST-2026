/* ==========================================================================
   ChargeIQ - Interactive Plotly.js EDA Controllers (ISFEST 2026)
   Matches exact distributions & numbers from MAKAN ITU PENTING_Penyisihan_Datcom.ipynb
   ========================================================================== */

function getPlotlyBaseLayout() {
  const isLight = document.body.classList.contains('light-theme');
  return {
    paper_bgcolor: isLight ? '#ffffff' : 'rgba(14, 20, 36, 0.85)',
    plot_bgcolor: isLight ? '#f8fafc' : 'rgba(8, 11, 19, 0.6)',
    font: { family: 'Inter, sans-serif', color: isLight ? '#334155' : '#94a3b8', size: 11 },
    margin: { l: 50, r: 25, t: 40, b: 45 },
    hovermode: 'closest',
    autosize: true
  };
}

function updateEdaChartsTheme(isLight) {
  if (typeof Plotly === 'undefined' || typeof EDA_INTERACTIVE_DATA === 'undefined') return;
  renderEdaDiurnal();
  renderEdaLocationCharger();
  renderEdaPorts();
  renderEdaTemperature();
  renderEdaCorrelation();
  renderEdaTargetDistribution();
}

const PLOTLY_CONFIG = {
  responsive: true,
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d']
};

function initInteractiveEdaCharts() {
  if (typeof Plotly === 'undefined' || typeof EDA_INTERACTIVE_DATA === 'undefined') {
    console.warn('Plotly or EDA_INTERACTIVE_DATA not loaded yet.');
    return;
  }

  renderEdaDiurnal();
  renderEdaLocationCharger();
  renderEdaPorts();
  renderEdaTemperature();
  renderEdaCorrelation();
  renderEdaTargetDistribution();
}

/* --------------------------------------------------------------------------
   1. Fluktuasi Diurnal 24 Jam (Hari Kerja vs Akhir Pekan)
   -------------------------------------------------------------------------- */
function renderEdaDiurnal() {
  const container = document.getElementById('plotly-diurnal');
  if (!container) return;

  const data = EDA_INTERACTIVE_DATA.diurnal;
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const weekdayVals = hours.map(h => data['Hari Kerja'][h.toString()] || 0);
  const weekendVals = hours.map(h => data['Akhir Pekan'][h.toString()] || 0);

  const traceWeekday = {
    x: hours,
    y: weekdayVals,
    mode: 'lines+markers',
    name: 'Hari Kerja (Senin-Jumat)',
    line: { color: '#00f2fe', width: 3 },
    marker: { size: 6, color: '#00f2fe' },
    hovertemplate: '<b>Hari Kerja</b><br>Jam %{x}:00<br>Rata-rata: %{y:.4f}<extra></extra>'
  };

  const traceWeekend = {
    x: hours,
    y: weekendVals,
    mode: 'lines+markers',
    name: 'Akhir Pekan (Sabtu-Minggu)',
    line: { color: '#ec4899', width: 3, dash: 'solid' },
    marker: { size: 6, color: '#ec4899' },
    hovertemplate: '<b>Akhir Pekan</b><br>Jam %{x}:00<br>Rata-rata: %{y:.4f}<extra></extra>'
  };

  const isLight = document.body.classList.contains('light-theme');
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';
  const zeroLineColor = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.1)';

  const layout = {
    ...getPlotlyBaseLayout(),
    title: { text: '<b>Rata-rata Utilisasi: Hari Kerja vs Akhir Pekan</b>', font: { size: 13, color: (isLight ? '#0f172a' : '#ffffff') } },
    xaxis: {
      title: 'Jam Operasional (0 - 23)',
      gridcolor: gridColor,
      tickmode: 'linear',
      tick0: 0,
      dtick: 2
    },
    yaxis: {
      title: 'Average Utilization Rate',
      gridcolor: gridColor,
      zerolinecolor: zeroLineColor
    },
    legend: { orientation: 'h', y: -0.22, x: 0.15 }
  };

  Plotly.newPlot(container, [traceWeekday, traceWeekend], layout, PLOTLY_CONFIG);
}

/* --------------------------------------------------------------------------
   2. Utilisasi Berdasarkan Tipe Lokasi & Tipe Charger
   -------------------------------------------------------------------------- */
function renderEdaLocationCharger() {
  const container = document.getElementById('plotly-loc-charger');
  if (!container) return;

  const locData = EDA_INTERACTIVE_DATA.location;
  const chargerData = EDA_INTERACTIVE_DATA.charger;

  const locLabels = Object.keys(locData);
  const locMeans = locLabels.map(k => locData[k].mean);
  const locQ25 = locLabels.map(k => locData[k].q25);
  const locQ75 = locLabels.map(k => locData[k].q75);

  const traceLoc = {
    x: locLabels,
    y: locMeans,
    type: 'bar',
    name: 'Tipe Lokasi',
    marker: {
      color: ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#34d399'],
      opacity: 0.85
    },
    error_y: {
      type: 'data',
      symmetric: false,
      array: locLabels.map((k, i) => locQ75[i] - locMeans[i]),
      arrayminus: locLabels.map((k, i) => locMeans[i] - locQ25[i]),
      color: 'rgba(255, 255, 255, 0.4)'
    },
    hovertemplate: '<b>%{x}</b><br>Rata-rata: %{y:.4f}<extra></extra>'
  };

  const isLight = document.body.classList.contains('light-theme');
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';

  const layout = {
    ...getPlotlyBaseLayout(),
    title: { text: '<b>Distribusi Utilisasi per Tipe Lokasi SPKLU (Mean & IQR)</b>', font: { size: 13, color: (isLight ? '#0f172a' : '#ffffff') } },
    xaxis: {
      gridcolor: gridColor,
      tickangle: -20
    },
    yaxis: {
      title: 'Utilization Rate',
      gridcolor: gridColor
    },
    showlegend: false
  };

  Plotly.newPlot(container, [traceLoc], layout, PLOTLY_CONFIG);
}

/* --------------------------------------------------------------------------
   3. Distribusi Jumlah Port per Stasiun
   -------------------------------------------------------------------------- */
function renderEdaPorts() {
  const container = document.getElementById('plotly-ports');
  if (!container) return;

  const portData = EDA_INTERACTIVE_DATA.ports;
  const ports = Object.keys(portData).map(k => parseInt(k)).sort((a, b) => a - b);
  const counts = ports.map(p => portData[p.toString()]);

  const trace = {
    x: ports.map(p => `${p} Ports`),
    y: counts,
    type: 'bar',
    marker: {
      color: ports.map(p => p >= 8 ? '#f59e0b' : '#00f2fe'),
      line: { color: 'rgba(255, 255, 255, 0.2)', width: 1 }
    },
    hovertemplate: '<b>%{x}</b><br>Frekuensi Sampel: %{y:,}<extra></extra>'
  };

  const isLight = document.body.classList.contains('light-theme');
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';

  const layout = {
    ...getPlotlyBaseLayout(),
    title: { text: '<b>Distribusi Jumlah Port per Stasiun Pengisian Daya</b>', font: { size: 13, color: (isLight ? '#0f172a' : '#ffffff') } },
    xaxis: { gridcolor: gridColor },
    yaxis: { title: 'Jumlah Data Log (Frekuensi)', gridcolor: gridColor },
    showlegend: false
  };

  Plotly.newPlot(container, [trace], layout, PLOTLY_CONFIG);
}

/* --------------------------------------------------------------------------
   4. Pergeseran Suhu Udara (Train vs Test Seasonal Drift)
   -------------------------------------------------------------------------- */
function renderEdaTemperature() {
  const container = document.getElementById('plotly-temp');
  if (!container) return;

  const trainTemp = EDA_INTERACTIVE_DATA.temp_train;
  const testTemp = EDA_INTERACTIVE_DATA.temp_test;

  const traceTrain = {
    x: trainTemp.x,
    y: trainTemp.y,
    type: 'scatter',
    mode: 'lines',
    fill: 'tozeroy',
    name: 'Train (Jul - Nov 2025)',
    line: { color: '#ef4444', width: 2.5 },
    fillcolor: 'rgba(239, 68, 68, 0.25)',
    hovertemplate: 'Train: %{x}°F<br>Densitas: %{y:.4f}<extra></extra>'
  };

  const traceTest = {
    x: testTemp.x,
    y: testTemp.y,
    type: 'scatter',
    mode: 'lines',
    fill: 'tozeroy',
    name: 'Test (Nov - Des 2025)',
    line: { color: '#00f2fe', width: 2.5 },
    fillcolor: 'rgba(0, 242, 254, 0.25)',
    hovertemplate: 'Test: %{x}°F<br>Densitas: %{y:.4f}<extra></extra>'
  };

  const isLight = document.body.classList.contains('light-theme');
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';

  const layout = {
    ...getPlotlyBaseLayout(),
    title: { text: '<b>Pergeseran Distribusi Suhu (Seasonal Drift): Train vs Test</b>', font: { size: 13, color: (isLight ? '#0f172a' : '#ffffff') } },
    xaxis: { title: 'Suhu Udara (°F)', gridcolor: gridColor },
    yaxis: { title: 'Density Estimator', gridcolor: gridColor },
    legend: { orientation: 'h', y: -0.22, x: 0.15 }
  };

  Plotly.newPlot(container, [traceTrain, traceTest], layout, PLOTLY_CONFIG);
}

/* --------------------------------------------------------------------------
   5. Matriks Korelasi Linear Pearson
   -------------------------------------------------------------------------- */
function renderEdaCorrelation() {
  const container = document.getElementById('plotly-corr');
  if (!container) return;

  const corrData = EDA_INTERACTIVE_DATA.correlation;
  const cols = corrData.cols;
  const z = corrData.matrix;

  // Pretty labels
  const prettyLabels = [
    'utilization_rate', 'power_output_kw', 'ports_total', 'temperature_f',
    'precipitation_mm', 'gas_price', 'latitude', 'longitude'
  ];

  const isLight = document.body.classList.contains('light-theme');

  const trace = {
    z: z,
    x: prettyLabels,
    y: prettyLabels,
    type: 'heatmap',
    colorscale: isLight ? [
      [0, '#1d4ed8'],     // Strong negative (blue)
      [0.5, '#f1f5f9'],   // Zero (clean slate)
      [1, '#dc2626']      // Strong positive (red)
    ] : [
      [0, '#1e3a8a'],     // Strong negative (blue)
      [0.5, '#0f172a'],   // Zero (dark)
      [1, '#ef4444']      // Strong positive (red)
    ],
    zmin: -0.5,
    zmax: 0.5,
    hovertemplate: '<b>%{y}</b> vs <b>%{x}</b><br>Korelasi Pearson: %{z:.3f}<extra></extra>'
  };

  // Text annotations on heatmap cells with dynamic high contrast
  const annotations = [];
  for (let i = 0; i < prettyLabels.length; i++) {
    for (let j = 0; j < prettyLabels.length; j++) {
      const val = z[i][j];
      const absVal = Math.abs(val);
      let annotColor;
      if (isLight) {
        annotColor = absVal > 0.28 ? '#ffffff' : '#0f172a';
      } else {
        annotColor = '#ffffff';
      }
      annotations.push({
        x: prettyLabels[j],
        y: prettyLabels[i],
        text: val.toFixed(3),
        font: { color: annotColor, size: 9, family: 'monospace', weight: isLight ? 600 : 400 },
        showarrow: false
      });
    }
  }

  const layout = {
    ...getPlotlyBaseLayout(),
    title: { text: '<b>Matriks Korelasi Linear Pearson Antar Variabel</b>', font: { size: 13, color: (isLight ? '#0f172a' : '#ffffff') } },
    margin: { l: 110, r: 30, t: 40, b: 80 },
    xaxis: { tickangle: -35 },
    yaxis: { autorange: 'reversed' },
    annotations: annotations
  };

  Plotly.newPlot(container, [trace], layout, PLOTLY_CONFIG);
}

/* --------------------------------------------------------------------------
   6. Distribusi Frekuensi Variabel Sasaran (utilization_rate)
   -------------------------------------------------------------------------- */
function renderEdaTargetDistribution() {
  const container = document.getElementById('plotly-target');
  if (!container) return;

  const targetData = EDA_INTERACTIVE_DATA.target_dist;

  const trace = {
    x: targetData.x,
    y: targetData.y,
    type: 'bar',
    marker: {
      color: '#3b82f6',
      line: { color: '#60a5fa', width: 0.8 }
    },
    hovertemplate: 'Bin Utilisasi: %{x:.3f}<br>Frekuensi: %{y:,}<extra></extra>'
  };

  const isLight = document.body.classList.contains('light-theme');
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';

  const layout = {
    ...getPlotlyBaseLayout(),
    title: { text: '<b>Distribusi Frekuensi Variabel Sasaran: utilization_rate (60 Bins)</b>', font: { size: 13, color: (isLight ? '#0f172a' : '#ffffff') } },
    xaxis: {
      title: 'Tingkat Utilisasi ([0.02, 0.98])',
      gridcolor: gridColor,
      range: [0, 1]
    },
    yaxis: {
      title: 'Frekuensi Sampel Data',
      gridcolor: gridColor
    },
    showlegend: false
  };

  Plotly.newPlot(container, [trace], layout, PLOTLY_CONFIG);
}
