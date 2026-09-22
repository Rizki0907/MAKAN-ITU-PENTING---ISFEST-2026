/* ==========================================================================
   Leaflet Geospatial Map Controller (150 US SPKLU Stations)
   ========================================================================== */

let spkluMap = null;
let markerLayerGroup = null;
let stationMarkersMap = {};

function initSpkluMap() {
  if (spkluMap) return; // already initialized

  const mapContainer = document.getElementById('spklu-map');
  if (!mapContainer) return;

  // Center US map view
  spkluMap = L.map('spklu-map', {
    center: [39.5, -98.35],
    zoom: 4,
    zoomControl: false,
    minZoom: 3,
    maxZoom: 14
  });

  // Custom zoom control position
  L.control.zoom({ position: 'bottomleft' }).addTo(spkluMap);

  // Standard OpenStreetMap Base Tiles (100% Free, Zero API Key Required, No Watermark)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(spkluMap);

  markerLayerGroup = L.layerGroup().addTo(spkluMap);

  // Render markers
  renderMapMarkers(STATIONS_DATA);

  // Setup Event Listeners for Map Filters
  setupMapFilterListeners();

  // Initialize Top 10 Bottleneck Hotspots
  initBottleneckHotspots();
}

function getMarkerColor(utilization) {
  if (utilization >= 0.55) return '#ef4444'; // Tinggi
  if (utilization >= 0.38) return '#f59e0b'; // Sedang
  return '#10b981'; // Rendah / Aman
}

function getStatusLabel(utilization) {
  if (utilization >= 0.55) return { text: 'Risiko Kepadatan Tinggi', class: 'status-danger' };
  if (utilization >= 0.38) return { text: 'Utilisasi Moderat', class: 'status-warning' };
  return { text: 'Kapasitas Longgar', class: 'status-success' };
}

function renderMapMarkers(stations) {
  if (!markerLayerGroup) return;
  markerLayerGroup.clearLayers();

  let countHigh = 0;
  let countMed = 0;
  let countLow = 0;

  stations.forEach(station => {
    const util = station.avg_utilization;
    if (util >= 0.55) countHigh++;
    else if (util >= 0.38) countMed++;
    else countLow++;

    const color = getMarkerColor(util);
    const status = getStatusLabel(util);

    const marker = L.circleMarker([station.latitude, station.longitude], {
      radius: 7,
      fillColor: color,
      color: '#ffffff',
      weight: 1.5,
      opacity: 0.9,
      fillOpacity: 0.85
    });

    const popupContent = `
      <div class="popup-card">
        <div class="popup-station-title">${station.station_name}</div>
        <div class="popup-city">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 2px; color: var(--accent-cyan);"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${station.city}, ${station.state} &bull; ${station.location_type}
        </div>
        
        <div class="popup-grid">
          <div class="popup-metric-item">
            <span class="popup-metric-lbl">Avg Utilisasi</span>
            <span class="popup-metric-val" style="color: ${color}">${(util * 100).toFixed(1)}%</span>
          </div>
          <div class="popup-metric-item">
            <span class="popup-metric-lbl">Total Daya</span>
            <span class="popup-metric-val">${station.total_capacity_kw} kW</span>
          </div>
          <div class="popup-metric-item">
            <span class="popup-metric-lbl">Jumlah Port</span>
            <span class="popup-metric-val">${station.ports_total} Ports</span>
          </div>
          <div class="popup-metric-item">
            <span class="popup-metric-lbl">Tipe Pengisi</span>
            <span class="popup-metric-val" style="font-size: 0.75rem;">${station.charger_type}</span>
          </div>
        </div>

        <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 4px; display: flex; justify-content: space-between;">
          <span>P75: <strong>${(station.p75_utilization * 100).toFixed(0)}%</strong></span>
          <span>P90: <strong>${(station.p90_utilization * 100).toFixed(0)}%</strong></span>
          <span style="color: ${color}"><strong>${status.text}</strong></span>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, { maxWidth: 320 });
    marker.bindTooltip(`<strong>${station.station_name}</strong> &bull; ${(util * 100).toFixed(1)}%`, {
      direction: 'top',
      offset: [0, -6],
      opacity: 0.95
    });
    stationMarkersMap[station.station_id] = marker;
    markerLayerGroup.addLayer(marker);
  });

  // Update counts in legend if elements exist
  const countEl = document.getElementById('map-filtered-count');
  if (countEl) countEl.innerText = `${stations.length} Stasiun`;
}

function setupMapFilterListeners() {
  const searchInput = document.getElementById('map-search');
  const chargerFilter = document.getElementById('map-filter-charger');
  const locationFilter = document.getElementById('map-filter-location');

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const charger = chargerFilter ? chargerFilter.value : 'all';
    const locType = locationFilter ? locationFilter.value : 'all';

    const filtered = STATIONS_DATA.filter(station => {
      const matchQuery = !query || 
        station.station_name.toLowerCase().includes(query) || 
        station.city.toLowerCase().includes(query) ||
        station.state.toLowerCase().includes(query);
      
      const matchCharger = (charger === 'all') || (station.charger_type === charger);
      const matchLoc = (locType === 'all') || (station.location_type === locType);

      return matchQuery && matchCharger && matchLoc;
    });

    renderMapMarkers(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (chargerFilter) chargerFilter.addEventListener('change', applyFilters);
  if (locationFilter) locationFilter.addEventListener('change', applyFilters);
}

/* --------------------------------------------------------------------------
   Top 10 Bottleneck Hotspots & Spatial Radar Controller
   -------------------------------------------------------------------------- */
function initBottleneckHotspots() {
  const container = document.getElementById('bottleneck-stations-grid');
  if (!container || typeof STATIONS_DATA === 'undefined') return;

  // Sort by avg_utilization descending
  const sorted = [...STATIONS_DATA].sort((a, b) => b.avg_utilization - a.avg_utilization);
  const top10 = sorted.slice(0, 10);

  let html = '';
  top10.forEach((station, idx) => {
    const utilPct = (station.avg_utilization * 100).toFixed(1);
    const p90Pct = ((station.p90_utilization || station.avg_utilization * 1.35) * 100).toFixed(0);
    const pCritEstimated = Math.min(28, Math.round((station.avg_utilization - 0.40) * 100));

    html += `
      <div class="bottleneck-card">
        <div class="bottleneck-card-top">
          <div class="bottleneck-rank-badge">#${idx + 1}</div>
          <div class="bottleneck-info">
            <div class="bottleneck-name">${station.station_name}</div>
            <div class="bottleneck-meta">
              <span>${station.city}, ${station.state}</span> &bull; 
              <span style="color: var(--accent-cyan); font-weight: 600;">${station.location_type}</span> &bull; 
              <span>${station.ports_total} Port (${station.total_capacity_kw} kW)</span>
            </div>
          </div>
          <button class="btn-focus-station" onclick="focusStationOnMap('${station.station_id}')" title="Pusatkan kamera Leaflet ke stasiun ini">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 2px;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            Fokus Peta
          </button>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-bottom: 2px;">
            <span style="color: var(--text-muted);">Rata-rata: <strong style="color: #ef4444;">${utilPct}%</strong> &bull; P90: <strong>${p90Pct}%</strong></span>
            <span style="color: #f59e0b; font-weight: 700;">P(Kritis &gt; 80%): ~${pCritEstimated}%</span>
          </div>
          <div class="bottleneck-bar-wrap">
            <div class="bottleneck-bar-fill" style="width: ${utilPct}%;"></div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function focusStationOnMap(stationId) {
  if (typeof STATIONS_DATA === 'undefined') return;
  const station = STATIONS_DATA.find(s => s.station_id === stationId);
  if (!station || !spkluMap) return;

  // Fly to station coordinates
  spkluMap.flyTo([station.latitude, station.longitude], 13, {
    animate: true,
    duration: 1.2
  });

  // Open marker popup after flight
  setTimeout(() => {
    const marker = stationMarkersMap[stationId];
    if (marker) {
      marker.openPopup();
    }
  }, 1250);

  // Smooth scroll to map
  const mapElement = document.getElementById('spklu-map');
  if (mapElement) {
    mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function toggleBottleneckInfographic() {
  const wrap = document.getElementById('bottleneck-infographic-wrap');
  const btn = document.getElementById('btn-toggle-bottleneck-map');
  if (!wrap) return;

  const isHidden = wrap.style.display === 'none' || wrap.style.display === '';
  wrap.style.display = isHidden ? 'block' : 'none';
  if (btn) {
    btn.innerHTML = isHidden 
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Sembunyikan Analisis Spasial'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg> Tampilkan Analisis Spasial Komprehensif';
  }
}
