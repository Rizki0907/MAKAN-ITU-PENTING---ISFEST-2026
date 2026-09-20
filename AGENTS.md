# Standard Operating Procedures & Competition Rules (ISFEST 2026)

Dokumen ini memuat seluruh kesepakatan, aturan penamaan, standar penulisan kode notebook, alur evaluasi, dan pencatatan eksperimen untuk kolaborasi pemodelan Data Competition ISFEST 2026.

---

## 1. Aturan Struktur Folder & Penamaan Berkas

1. **Folder Notebook (`notebook/`)**
   - Semua notebook eksperimen mandiri Piji disimpan di dalam folder `notebook/`.
   - Format penamaan notebook: `Experiment_piji_1.ipynb`, `Experiment_piji_2.ipynb`, `Experiment_piji_3.ipynb`, dan seterusnya berurutan.
   - Notebook rekan tim (seperti `Notebook_habib_1.ipynb`, `notebook_alfin_1.ipynb`, dll.) tetap disimpan di folder yang sama untuk memudahkan studi komparasi antar-eksperimen.

2. **Folder Submission (`submission/`)**
   - Semua berkas CSV hasil prediksi model disimpan di dalam folder `submission/`.
   - Format penamaan file submission: `submission_1.csv`, `submission_2.csv`, `submission_3.csv`, dan seterusnya (sesuai nomor indeks eksperimen).
   - Format kolom wajib: `id` (contoh: `TST_0U33RJ`) dan `utilization_rate` (nilai float).

---

## 2. Standar Gaya Kode Notebook (Google Colab Standard)

Setiap notebook eksperimen yang digenerate harus memenuhi standar kebersihan kode berikut:

1. **Eksekusi di Google Colab & Data Loading via `gdown`**
   - Kompatibel penuh untuk dijalankan di Google Colab.
   - Data otomatis diunduh dari Google Drive resmi tim menggunakan `gdown` melalui link:
     `https://drive.google.com/drive/folders/16kkQIyF5Yj3y3xIImN9kkewJQ0ZGt_ZH?usp=sharing`
   - Berkas data yang diunduh mencakup `train.csv`, `test.csv`, dan `sample_submission.csv`.

2. **Gaya Kode Super Bersih (Strict Clean Code)**
   - **Tanpa Emoticon/Emoji**: Tidak menggunakan icon/emoticon di teks markdown maupun kode.
   - **Tanpa Komentar Inline (#)**: Tidak ada komentar dengan simbol pagar (`#`) di dalam cell kode Python. Penjelasan logika, tujuan fungsi, atau alasan teknis wajib ditempatkan pada cell Markdown sebelum atau sesudah cell kode terkait.
   - **Tanpa Simbol Hiasan Aneh**: Dilarang menggunakan pemisah estetis berlebihan seperti `======`, `------`, `******`, dsb.
   - **Bahasa Formal & Rapi**: Menggunakan bahasa Indonesia formal teknis data science yang terstruktur.

3. **15 Struktur Wajib Setiap Notebook**
   Setiap notebook wajib memuat bab dan urutan langkah berikut secara lengkap:
   1. Judul & Overview
   2. Import Libraries & Setup
   3. Load Data (download via gdown dari Google Drive)
   4. Exploratory Data Analysis (EDA)
   5. Data Cleaning
   6. Feature Engineering
   7. Feature Selection (opsional sesuai kebutuhan)
   8. Train-Test-Validation Split / Cross-Validation Strategy
   9. Baseline Model
   10. Modeling
   11. Hyperparameter Tuning
   12. Model Evaluation
   13. Ensembling / Stacking (opsional sesuai strategi)
   14. Final Prediction & Submission
   15. Kesimpulan & Next Steps

---

## 3. Alur Evaluasi Berkelanjutan & Logbook Eksperimen

1. **Prinsip Evaluasi Berkelanjutan (Continuous Improvement)**
   - Setiap eksperimen baru WAJIB dimulai dengan meninjau notebook sebelumnya di folder `notebook/` (baik eksperimen Piji maupun eksperimen Habib dan Alfin).
   - Analisis mencakup:
     - Model dan algoritma yang digunakan.
     - Rekayasa fitur (feature engineering) yang berdampak positif atau negatif.
     - Strategi validasi (Cross-Validation vs Holdout waktu).
     - Skor validasi lokal (CV RMSE) dan skor publik Kaggle Leaderboard.
   - Eksperimen baru dirancang untuk menguji hipotesis spesifik demi menurunkan nilai RMSE (meningkatkan performa).

2. **Pencatatan Logbook Pribadi & Sinkronisasi Tim**
   - Setiap eksperimen dicatat pada logbook pribadi (`Logbook_Pribadi_Piji.xlsx` dan `Logbook_Pribadi_Piji.csv`).
   - Struktur kolom identik dengan lembar *Logbook Submission* pada spreadsheet tim:
     - `Tanggal`: Tanggal pelaksanaan eksperimen.
     - `PIC (Nama)`: Piji
     - `Algoritma (Model)`: Nama algoritma, hyperparameter utama, dan konfigurasi pelatihan.
     - `Fitur Utama / Preprocessing Baru`: Ringkasan fitur baru atau pembersihan data yang dilakukan.
     - `Skor CV`: Nilai RMSE pada validasi internal.
     - `Skor Kaggle`: Nilai RMSE resmi di Kaggle Leaderboard.
     - `Diff`: Selisih antara Skor CV dan Skor Kaggle (`abs(Skor CV - Skor Kaggle)`).
     - `Link Notebook`: Tautan notebook di Google Drive atau Colab.
     - `Keterangan / Analisis Singkat`: Temuan kunci, kestabilan model, dan rekomendasi langkah berikutnya.
   - Asisten AI akan selalu membantu menyusun draf ringkasan baris logbook yang siap disalin ke spreadsheet tim.
   Nb : pengisian di logbook pribadi isi sesuai informasi yang kamu punya dan nyata aja, misal gatau link notebook atau skor kagglenya silakan kosongi saja.

---

## 4. Kebersihan Workspace & Pengelolaan Berkas Temporal

1. **Pembersihan Berkas Uji Coba Sementara (Temporary Clean-up)**:
   - Dilarang meninggalkan berkas/folder uji coba sementara (seperti `test_gdown/`, berkas eksperimen pembulatan `test_round_*.csv`, dsb.) di dalam repositori atau folder kerja.
   - Segala skrip investigasi atau berkas uji coba satu kali (*one-off trial*) wajib dibersihkan segera setelah proses evaluasi selesai agar workspace selalu rapi.

2. **Larangan Pembuatan Berkas Submission Prematur**:
   - Berkas submission resmi (`submission_1.csv`, `submission_2.csv`, dst.) HANYA boleh dihasilkan dari proses eksekusi notebook terkait oleh PIC di lingkungan Colab (atau verifikasi sah).
   - Asisten dilarang membuat berkas submission prematur di folder `submission/` sebelum notebook dijalankan oleh pengguna.
