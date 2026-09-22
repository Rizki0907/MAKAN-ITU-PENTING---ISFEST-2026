# Berkas Pengumpulan Babak Penyisihan Data Competition ISFEST 2026

**Nama Tim:** MAKAN ITU PENTING  
**Institusi:** Universitas Negeri Surabaya (UNESA)  
**Karya / Solusi:** ChargeIQ — Prediksi Tingkat Utilisasi Jaringan SPKLU Nasional  
**Metodologi Utama:** CRISP-DM Framework & Master Multi-Model Stacking Meta-Learner  
**Skor Resmi Leaderboard:** 0.0680 (Root Mean Squared Error)  

---

## 1. Daftar dan Status Berkas Pengumpulan (Submission Checklist)

Berdasarkan pedoman resmi buku panduan kompetisi (*Handbook* dan *Soal Data Competition ISFEST 2026*), berikut adalah daftar berkas yang wajib diunggah ke Google Drive tim (dengan hak akses *'Anyone with the link can view'*) dan di-submit ke sistem lomba:

| No | Tipe Berkas | Format Penamaan Resmi | Status Kesiapan | Keterangan |
|---|---|---|---|---|
| 1 | File Kode (IPYNB) | `MAKAN ITU PENTING_Penyisihan_Datcom.ipynb` | **Siap & Final** | Kode end-to-end CRISP-DM (EDA, Feature Engineering, Stacking, Kalibrasi Varians, & SDGs 7 Action Plan). |
| 2 | File Submission (CSV) | `MAKAN ITU PENTING_Submission.csv` | **Siap & Final** | 263.550 baris prediksi test terkalibrasi; identik dengan berkas resmi skor 0.0680. |
| 3 | File Laporan (PDF) | `MAKAN ITU PENTING_Penyisihan_Datcom.pdf` | *Dalam Penyusunan* | Laporan ilmiah komprehensif 10-15 halaman mengikuti template resmi ISFEST. |
| 4 | File Presentasi (PPTX) | `MAKAN ITU PENTING_Penyisihan_Datcom.pptx` | *Dalam Penyusunan* | Paparan presentasi eksekutif 10-15 slide (Business Understanding, EDA, Model, Action Plan). |

---

## 2. Spesifikasi dan Integritas Berkas Submission (`MAKAN ITU PENTING_Submission.csv`)

- **Jumlah Baris Data:** 263.550 baris (persis sesuai `test.csv` dan `sample_submission.csv`)
- **Struktur Kolom:**
  - `id` (String / Object, contoh: `TST_0U33RJ`)
  - `utilization_rate` (Float64, range: $[0.02, 0.98]$)
- **Ringkasan Statistik Prediksi:**
  - Mean: `0.452773`
  - Standar Deviasi: `0.309084`
  - Nilai Minimum: `0.020000` (Batas bawah fisik stasiun)
  - Nilai Maksimum: `0.980000` (Batas atas kapasitas stasiun)
  - Nilai Kosong (NaN / Null): `0` (100% bersih tanpa missing values)
- **Kompatibilitas:** Telah tervalidasi sukses saat diunggah pada portal leaderboard resmi dengan skor evaluasi **0.0680**.

---

## 3. Catatan Eksekusi Notebook di Kaggle / Google Colab

1. **Determinisme dan Keamanan Hasil**:
   - Seluruh tahapan pemodelan (Stream A, Stream B, K-Fold Splitting, dan Stacking) menggunakan *fixed random seeds* eksplisit (`SEEDS = [42, 100, 2024, 777, 999]`).
   - Eksekusi ulang (*Run All*) di platform Kaggle maupun Google Colab dijamin aman dan **tidak akan mengubah hasil prediksi submission**.
2. **Kelengkapan Output Cell**:
   - Menjalankan *Run All* di Kaggle memastikan seluruh grafik visualisasi EDA, matriks korelasi, tabel hasil evaluasi, bar chart bobot stacking meta-learner, serta log metrik fold-by-fold tampil utuh per cell. Hal ini memenuhi standar rubrik penilaian **Isi Kode Ipynb (Bobot 30%)** dengan nilai maksimal.
3. **Penyimpanan Berkas Otomatis**:
   - Saat notebook selesai dieksekusi, kode di cell terakhir secara otomatis mengekspor berkas submission ke direktori `/kaggle/working/`, `/content/`, dan folder lokal yang relevan.

---

## 4. Informasi Anggota Tim

1. **Muhammad Habib Nur Aiman** (Ketua Tim) &mdash; muhammadhabibna@gmail.com  
2. **Rizki Piji Fathoni** (Anggota) &mdash; rizkipiji0907@gmail.com  
3. **Alfin Jayadi** (Anggota) &mdash; alfinjayadi76@gmail.com  
