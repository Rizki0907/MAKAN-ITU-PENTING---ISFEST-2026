# ChargeIQ: Sistem Prediksi & Optimasi Utilisasi SPKLU Nasional
### Data Competition ISFEST 2026 — Tim MAKAN ITU PENTING

[![ISFEST 2026](https://img.shields.io/badge/Competition-ISFEST%202026-blue.svg)](https://isfest.id)
[![Kaggle Leaderboard](https://img.shields.io/badge/Kaggle%20Score-0.0680-success.svg)](#ringkasan-proyek--pencapaian-utama)
[![Architecture](https://img.shields.io/badge/Model-Consensus%20GBDT-purple.svg)](#arsitektur-pemodelan)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Repositori ini memuat seluruh pipeline *end-to-end data science*, berkas pemodelan, analisis data eksploratif (EDA), serta aplikasi **Web Dashboard Interaktif (ChargeIQ)** yang dikembangkan oleh **Tim MAKAN ITU PENTING** untuk kompetisi data sains **ISFEST 2026**.

Fokus kompetisi adalah memprediksi **Tingkat Utilisasi (*utilization rate*)** pada jaringan 150 Stasiun Pengisian Kendaraan Listrik Umum (SPKLU / EV Charging Stations) di Amerika Serikat, serta memberikan rekomendasi strategis berupa *dynamic pricing* dan *capacity planning*.

---

## Ringkasan Proyek & Pencapaian Utama

- **Dataset**: Lebih dari 1.300.000 data log pengisian daya SPKLU (Juli - Desember 2025) mencakup data spasial geolokasi, spesifikasi pengisi daya (*DC Fast Charge* vs *Hyper-Fast*), histori cuaca, fluktuasi harga bahan bakar, dan event lokal.
- **Arsitektur Pemodelan**: *Consensus Multi-GBDT Architecture* menggabungkan 6 konfigurasi pohon regresi (LightGBM, CatBoost, dan XGBoost) dengan pembagian validasi *Temporal Holdout* 14 hari terakhir bulan November.
- **Inovasi Pasca-Pemrosesan**: Penyesuaian matematis konveks linear (*Convex Linear Optimization*) untuk mengoreksi *seasonal drift* musim dingin bulan Desember (`OPTIMAL_SHIFT = +0.0007`) dan mengatasi *tree leaf variance shrinkage* pada kuantil antrean tinggi (`OPTIMAL_SHRINKAGE = 1.0028`).
- **Skor Resmi Kaggle**: **0.0680** (Model Murni Stacking Consensus &bull; Presisi Penuh: 0.06780).

---

## Struktur Repositori

```text
├── dashboard/                  # Berkas Aplikasi Web Dashboard Interaktif (ChargeIQ)
│   ├── index.html              # Halaman Utama Dashboard (Modern Dark-Mode SPA)
│   ├── css/
│   │   └── style.css           # Design System (Glassmorphism & Responsive Layout)
│   └── js/
│       ├── app.js              # State Manager, Tab Routing & Live Ticker
│       ├── map.js              # Visualisasi Peta Leaflet (150 Stasiun SPKLU)
│       ├── charts.js           # Visualisasi Chart.js (Diurnal, Heatmap, Importance)
│       ├── eda_charts.js       # Visualisasi Plotly.js Interaktif (6 Analisis EDA)
│       ├── simulator.js        # Engine Simulasi Dynamic Pricing & Kapasitas
│       └── data/               # Aset Data Teroptimasi untuk Browser
├── dashboard_data/             # Berkas Agregat Analitik & Evaluasi Model
│   ├── diurnal_hourly_trend.csv
│   ├── feature_importance_summary.csv
│   ├── heatmap_hour_day.csv
│   ├── location_charger_matrix.csv
│   ├── model_evaluation_summary.csv
│   ├── station_spatial_summary.csv
│   └── test_predictions_aggregated.csv
├── figures/                    # Visualisasi Analisis Data Eksploratif (EDA)
│   ├── corr_matrix.png
│   ├── distribusi_util_rate.png
│   ├── fluktuasi_diurnal.png
│   ├── loc_chargtype.png
│   ├── output_port.png
│   └── temp_sumwin.png
├── models/                     # Artefak Model Terlatih
│   ├── baseline_ridge_model.joblib
│   └── meta_learner_ridge.joblib
├── notebook/                   # Berkas Notebook Final Resmi
│   └── MAKAN ITU PENTING_Penyisihan_Datcom.ipynb # Notebook Utama Final Tim MAKAN ITU PENTING
├── submission/                 # Berkas Hasil Prediksi Resmi
│   └── MAKAN ITU PENTING_FINAL-SUB.csv # Submission Final Resmi (0.0680 / 0.06780)
└── README.md                   # Dokumentasi Utama Proyek
```

---

## Arsitektur Pemodelan

Pipeline pemodelan dibangun menggunakan metodologi terstruktur:
1. **Pembersihan & Imputasi**: Penanganan anomali nilai fisik target $[0.02, 0.98]$ dan konsistensi data waktu.
2. **Feature Engineering Mutakhir**:
   - *Temporal Cyclical Encodings* (sinus/kosinus jam, hari, bulan).
   - *Target Profiling Kuantil Multi-Dimensi* (`target_prof_st_hr_wk`, `target_prof_loc_hr_wk`).
   - *Interaksi Kapasitas Daya Spasial* (`total_capacity_kw`, `power_per_port`).
   - *Kondisi Ekstrem Cuaca* (suhu beku musim dingin, curah hujan).
3. **Validasi Temporal Realistis**: Menggunakan partisi *holdout* waktu 14 hari terakhir untuk mencegah *data leakage*.
4. **Consensus Ensemble**: Pembobotan optimal dari model pohon LightGBM, CatBoost Symmetric/Balanced, dan XGBoost Histogram via Non-negative Ridge Meta-Learner.

---

## Panduan Menjalankan Web Dashboard (ChargeIQ)

Dashboard dirancang sebagai aplikasi web berbasis *Modern Vanilla Frontend* dengan library visualisasi Plotly.js, Leaflet.js, dan Chart.js (*zero-build architecture*).

### Menjalankan Secara Lokal:
1. Kloning repositori ini:
   ```bash
   git clone https://github.com/Rizki0907/MAKAN-ITU-PENTING---ISFEST-2026.git
   cd MAKAN-ITU-PENTING---ISFEST-2026
   ```
2. Buka berkas dashboard langsung di peramban web:
   - Cukup klik dua kali berkas `dashboard/index.html` (atau buka berkas via Google Chrome / Edge).
   - Atau gunakan server lokal Python:
     ```bash
     python -m http.server 5500
     ```
     Lalu buka `http://localhost:5500/dashboard/index.html` di peramban Anda.

---

## Anggota Tim "MAKAN ITU PENTING"
**Asal Institusi: Universitas Negeri Surabaya (UNESA)**

| No | Nama Lengkap | Posisi Tim | Peran Teknis Utama | Institusi & Kontak |
| :---: | :--- | :---: | :--- | :--- |
| 1 | **Muhammad Habib Nur Aiman** | **Ketua Tim** | Feature Engineering & Statistical Analysis | Universitas Negeri Surabaya<br>`muhammadhabibna@gmail.com` |
| 2 | **Rizki Piji Fathoni** | **Anggota** | Lead Modeler & Dashboard Architect | Universitas Negeri Surabaya<br>`rizkipiji0907@gmail.com` |
| 3 | **Alfin Jayadi** | **Anggota** | Data Cleaning & Pipeline Integration | Universitas Negeri Surabaya<br>`alfinjayadi76@gmail.com` |

---

*ISFEST 2026 — Informatics and Information System Festival*
