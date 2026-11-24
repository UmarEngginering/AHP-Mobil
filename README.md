# Sistem Pendukung Keputusan (SPK) Pemilihan Mobil Terbaik - Metode AHP

Aplikasi Web modern berbasis **Python (Flask)**, **HTML5**, **Tailwind CSS**, dan **Chart.js** untuk mengolah dan memvisualisasikan data **Analytic Hierarchy Process (AHP)** dari studi kasus perbandingan mobil pada file Excel `AHP_Studi_Kasus_Mobil.xlsx`.

---

## 📌 Ringkasan Studi Kasus & Hasil Keputusan

- **Tujuan (Goal)**: Memilih Mobil Terbaik untuk Kebutuhan Keluarga dari 4 Alternatif.
- **Kriteria yang Digunakan (3 Kriteria)**:
  1. **Style (Gaya/Desain)** – Bobot Prioritas: **32.02%**
  2. **Keandalan (Mesin & Daya Tahan)** – Bobot Prioritas: **55.71%** *(Prioritas Utama)*
  3. **Konsumsi BBM (Efisiensi Bahan Bakar)** – Bobot Prioritas: **12.26%**
- **Alternatif Mobil (4 Alternatif)**:
  1. **Suzuki Ertiga** – Skor Akhir: **0.4814 (48.14%)** 🏆 **[JUARA 1 - MOBIL TERPILIH]**
  2. **Nissan Grand Livina** – Skor Akhir: **0.2753 (27.53%)** 🥈 [Peringkat 2]
  3. **Toyota Avanza** – Skor Akhir: **0.1480 (14.80%)** 🥉 [Peringkat 3]
  4. **Daihatsu Xenia** – Skor Akhir: **0.0952 (9.52%)** [Peringkat 4]

> **Hasil Uji Konsistensi (Consistency Ratio - CR)**:
> Seluruh matriks perbandingan berpasangan memenuhi syarat konsistensi Saaty ($CR \le 0.10$):
> - Matriks Kriteria Utama: $CR = 2.02\%$ ✅ (Konsisten)
> - Matriks Style: $CR = 7.04\%$ ✅ (Konsisten)
> - Matriks Keandalan: $CR = 6.34\%$ ✅ (Konsisten)
> - Matriks Konsumsi BBM: $CR = 4.42\%$ ✅ (Konsisten)

---

## ✨ Fitur-Fitur Unggulan Aplikasi Web

1. **Dashboard Eksekutif & Visualisasi Interaktif**:
   - Kartu pengumuman rekomendasi mobil terbaik dengan badge trofi & persentase skor.
   - 4 Ringkasan KPI (Pilihan Terbaik, Kriteria Dominan, Uji Konsistensi, Status Sumber Data).
   - **Tabel Peringkat Lengkap** dengan visualisasi progress bar dan skor desimal presisi tinggi.
   - **4 Grafik Dinamis (Chart.js)**:
     - *Doughnut Chart*: Distribusi bobot kriteria utama.
     - *Stacked Bar Chart*: Dekomposisi kontribusi kriteria Style, Keandalan, dan BBM untuk setiap mobil.
     - *Radar / Spider Chart*: Profil kekuatan multikriteria perbandingan 4 mobil.
     - *Ringkasan Tabel Uji Konsistensi* lengkap dengan nilai $\lambda_{max}$, $CI$, $RI$, dan $CR$.

2. **Detail Matriks & Langkah Perhitungan Matematis (Transparan)**:
   - Tab navigasi untuk setiap tahapan matriks:
     1. Kriteria vs Kriteria ($S, K, B$)
     2. Alternatif pada Kriteria Style
     3. Alternatif pada Kriteria Keandalan
     4. Alternatif pada Kriteria Konsumsi BBM
   - Menampilkan **Matriks Perbandingan Berpasangan Awal ($A$)** dengan total kolom.
   - Menampilkan **Matriks Ternormalisasi ($A_{norm}$)** dan perhitungan rata-rata baris (Bobot Prioritas).
   - Menampilkan langkah detail perhitungan $\lambda_{max}$, Indeks Konsistensi ($CI$), Random Index ($RI$), dan Rasio Konsistensi ($CR$).

3. **Matriks Sintesis Akhir**:
   - Menampilkan tabel perkalian silang bobot kriteria $\times$ bobot alternatif per mobil beserta rumus penjumlahannya.

4. **Simulator Sensitivitas & What-If Analysis (Interaktif)**:
   - Slider interaktif untuk mengubah persentase bobot kriteria secara real-time.
   - Grafik skor dan tabel ranking berubah otomatis seketika saat slider digeser.
   - Tombol *Reset ke Bobot Asli* untuk kembali ke data default Excel.

5. **Ekspor & Cetak Laporan (Print-Ready)**:
   - Tombol **Cetak PDF**: Tata letak CSS khusus print `@media print` yang menyusun seluruh tabel dan hasil kalkulasi rapi tanpa tombol navigasi, siap dicetak atau disimpan ke PDF untuk tugas kuliah/laporan dosen.
   - Tombol **Ekspor CSV**: Mengunduh seluruh hasil skor dan perankingan ke format file Excel/CSV.

6. **Dukungan Upload Excel & Reset**:
   - Dialog modal untuk mengunggah file `.xlsx` baru jika ingin menguji dataset AHP lainnya.
   - Tombol *Reset Excel* untuk mengembalikan data ke kondisi awal.

7. **Desain Modern & Mode Gelap (Dark Mode)**:
   - Tampilan responsif (desktop, tablet, smartphone) menggunakan Tailwind CSS dan Google Font Plus Jakarta Sans.
   - Tombol toggle Dark/Light mode yang tersimpan di `localStorage`.

---

## 🚀 Cara Menjalankan Aplikasi

### Cara 1: Menggunakan File Batch (Paling Mudah di Windows)
Cukup klik ganda (double-click) file:
```
run.bat
```
Script ini akan otomatis memeriksa library Python yang dibutuhkan dan langsung membuka browser di `http://127.0.0.1:5050`.

---

### Cara 2: Menjalankan via Terminal / Command Prompt / PowerShell

1. Pastikan Anda berada di direktori proyek:
   ```powershell
   cd <folder-proyek-ahp>
   ```

2. Pasang dependensi jika belum terpasang:
   ```powershell
   pip install -r requirements.txt
   ```

3. Jalankan server Flask:
   ```powershell
   python app.py
   ```

4. Buka peramban web (browser) favorit Anda dan akses:
   ```
   http://127.0.0.1:5050
   ```

---

## 📁 Struktur Direktori Project

```
AHP/
│
├── AHP_Studi_Kasus_Mobil.xlsx   # File Excel sumber data AHP
├── app.py                       # Backend server Flask & endpoint REST API
├── ahp_engine.py                # Engine kalkulasi matematika metode AHP (Pure Python)
├── test_app.py                  # Unit test & integrasi verifikasi kalkulasi
├── requirements.txt             # Daftar dependensi Python (Flask, openpyxl, Werkzeug)
├── run.bat                      # Script 1-klik untuk menjalankan di Windows
├── README.md                    # Dokumentasi lengkap sistem
├── .gitignore                   # Konfigurasi file yang diabaikan Git
│
├── templates/
│   └── index.html               # Frontend dashboard interaktif (Jinja2 + Tailwind)
│
└── static/
    ├── css/
    │   └── custom.css           # Styling tambahan & layout cetak PDF (@media print)
    └── js/
        └── app.js               # Kontrol Chart.js, simulasi slider, tema & biodata
```

---

## 📐 Landasan Teori AHP (Thomas L. Saaty)

1. **Matriks Perbandingan Berpasangan ($A$)**:
   Jika elemen $i$ dibanding $j$ bernilai $a_{ij}$, maka $a_{ji} = \frac{1}{a_{ij}}$ dan $a_{ii} = 1$.

2. **Normalisasi Matriks**:
   $$r_{ij} = \frac{a_{ij}}{\sum_{k=1}^n a_{kj}}$$

3. **Bobot Prioritas ($w_i$)**:
   $$w_i = \frac{1}{n} \sum_{j=1}^n r_{ij}$$

4. **Nilai Eigen Terbesar ($\lambda_{max}$)**:
   $$\lambda_{max} = \sum_{i=1}^n \left( \left(\sum_{k=1}^n a_{ki}\right) \times w_i \right)$$

5. **Consistency Index ($CI$)**:
   $$CI = \frac{\lambda_{max} - n}{n - 1}$$

6. **Consistency Ratio ($CR$)**:
   $$CR = \frac{CI}{RI}$$
   - Untuk $n=3$, $RI = 0.58$
   - Untuk $n=4$, $RI = 0.90$
   - Syarat Konsisten: $CR \le 0.10$ ($10\%$).
