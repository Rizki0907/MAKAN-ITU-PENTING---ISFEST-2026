/* ==========================================================================
   Leaflet Geospatial Map Controller (150 US SPKLU Stations)
   ========================================================================== */

let spkluMap = null;
let markerLayerGroup = null;

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
