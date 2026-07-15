# 🎨 Artverse - Galeri Seni & Portal Seniman Virtual

Artverse adalah aplikasi web galeri seni interaktif rupa kelas dunia, dilengkapi dengan portal seniman/penjual untuk mengelola karya seni, live notifikasi dengan pembaruan dinamis, pelacakan pesanan, serta sistem checkout yang terintegrasi.

Proyek ini menggunakan arsitektur modern full-stack, dideploy sebagai satu proyek di **Vercel**:
- **Frontend**: React + Vite + Tailwind CSS v4 + Motion
- **Backend API**: Express.js sebagai Serverless Function
- **Database & Penyimpanan Gambar**: Supabase (PostgreSQL + Storage)

---

## 🚀 Panduan Membuka Proyek di VS Code & Menjalankan Lokal

Ikuti langkah-langkah berikut untuk mengunduh, membuka, dan menjalankan aplikasi di komputer lokal Anda menggunakan **Visual Studio Code (VS Code)**.

### Langkah 1: Persiapan Awal
Pastikan Anda sudah menginstal aplikasi berikut di komputer Anda:
1. **Node.js** (Versi 18 ke atas) -> [Unduh di sini](https://nodejs.org/)
2. **Visual Studio Code (VS Code)** -> [Unduh di sini](https://code.visualstudio.com/)
3. **Git** (Opsional, untuk push ke GitHub) -> [Unduh di sini](https://git-scm.com/)

### Langkah 2: Buka Proyek di VS Code
1. Ekstrak file ZIP proyek yang diunduh dari AI Studio ke dalam sebuah folder di komputer Anda.
2. Buka aplikasi **VS Code**.
3. Pilih menu **File** -> **Open Folder...** (atau **Open...** pada macOS).
4. Pilih folder hasil ekstraksi proyek tersebut, lalu klik **Open**.

### Langkah 3: Konfigurasi Environment Variables (`.env`)
1. Di dalam VS Code, buat file baru bernama `.env` di direktori utama (root).
2. Salin isi dari file `.env.example` ke dalam file `.env` baru tersebut.
3. Isi variabel yang diperlukan:
   ```env
   # Token keamanan untuk masuk ke Portal Penjual (Ganti sesuai keinginan Anda)
   SELLER_TOKEN=admin123

   # Wajib diisi "supabase" agar aplikasi memakai Supabase (bukan file lokal)
   DATABASE_MODE=supabase

   # Kredensial Database Supabase (Dapatkan dari Dasbor Supabase Anda)
   # SUPABASE_URL cukup URL project saja, TANPA akhiran /rest/v1/
   SUPABASE_URL=https://your-supabase-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Langkah 4: Instalasi Dependency
1. Buka terminal terintegrasi di VS Code dengan menekan tombol kombinasi ``Ctrl + ` `` (Backtick) atau pilih menu **Terminal** -> **New Terminal**.
2. Jalankan perintah berikut untuk menginstal semua library pendukung:
   ```bash
   npm install
   ```

### Langkah 5: Jalankan Server Pengembangan Lokal
1. Setelah instalasi selesai, jalankan perintah berikut untuk memulai server lokal:
   ```bash
   npm run dev
   ```
2. Aplikasi Anda sekarang berjalan secara lokal! Buka browser Anda dan akses alamat yang tertera di terminal, biasanya:
   `http://localhost:3000`

---

## 🗄️ Langkah Setup Database di Supabase

Untuk menghubungkan penyimpanan galeri Anda dengan Supabase, lakukan langkah berikut:

1. Buat akun gratis dan masuk ke dasbor [Supabase](https://supabase.com).
2. Buat proyek baru (*New Project*) dan tunggu hingga proses provisi selesai.
3. Di dasbor proyek Supabase Anda, cari menu **SQL Editor** di panel navigasi kiri.
4. Klik **New Query** untuk membuat lembar kosong baru.
5. Buka file `supabase_schema.sql` yang ada di proyek ini di VS Code, salin (copy) seluruh kodenya, lalu tempelkan (paste) ke dalam kolom SQL Editor di Supabase.
6. Klik tombol **Run** di kanan bawah untuk mengeksekusi perintah. Ini akan membuat tabel-tabel berikut secara otomatis:
   - `artworks` (Katalog karya seni)
   - `orders` (Daftar pesanan & checkout)
   - `messages` (Daftar inquiry/inbox chat)
   - `notifications` (Live notifikasi sistem)
   - `payment_settings` (Konfigurasi rekening & QRIS)
7. Pergi ke menu **Project Settings** -> **API** di dasbor Supabase untuk mengambil **Project URL** dan **anon public API Key** Anda, lalu masukkan ke dalam file `.env` lokal Anda atau set di platform deployment.

### 🖼️ Langkah Setup Storage Bucket di Supabase (Penyimpanan Gambar)

Aplikasi Artverse telah dilengkapi dengan fitur **Sistem Penyimpanan Gambar Hybrid**. Ketika penjual menambahkan lukisan atau mengunggah gambar QRIS, sistem akan otomatis melakukan pengunggahan ke Supabase Storage. Jika bucket belum disiapkan, sistem akan secara otomatis mencadangkannya dengan menyimpannya langsung di database PostgreSQL sebagai string Base64 yang aman (tanpa merusak fungsionalitas aplikasi!).

Untuk mengaktifkan penyimpanan gambar CDN di Supabase Storage, ikuti langkah berikut:
1. Di dasbor Supabase Anda, buka menu **Storage** di panel navigasi kiri.
2. Klik tombol **New Bucket** (Buat Bucket Baru).
3. Beri nama bucket tersebut tepat: `artverse`.
4. **PENTING**: Aktifkan opsi **Public** (sehingga gambar dapat diakses secara publik oleh pengunjung galeri).
5. Klik **Create Bucket**.
6. **PENTING**: Opsi "Public" di atas hanya mengizinkan orang lain *membaca/melihat* gambar lewat URL-nya — proses *mengunggah* (upload) tetap diblokir oleh Storage secara default sampai ada RLS policy yang mengizinkannya. Bagian bawah file `supabase_schema.sql` (yang sudah Anda jalankan di Langkah Setup Database di atas) sudah menyertakan policy untuk mengizinkan upload/update/delete ke bucket `artverse`. Jika Anda menjalankan schema SQL SEBELUM membuat bucket ini, jalankan ulang saja query-nya sekali lagi di SQL Editor setelah bucket dibuat.
7. Selesai! Kini setiap kali penjual mengunggah lukisan baru atau mengubah kode QRIS, gambar-gambar tersebut akan secara otomatis terunggah secara rapi ke dalam folder di bucket `artverse` Supabase Anda dengan URL CDN publik.

---

## 🐙 Langkah Mengirim Proyek ke GitHub

Setelah Anda siap, Anda dapat menaruh proyek ini ke akun GitHub Anda melalui VS Code:

1. Masuk ke akun [GitHub](https://github.com) Anda dan buat repositori baru (*New Repository*). Beri nama repositori tersebut (misal: `artverse`) dan biarkan kosong tanpa README atau .gitignore tambahan (karena proyek ini sudah menyediakannya).
2. Kembali ke VS Code, buka terminal terintegrasi, dan jalankan perintah-perintah berikut:
   ```bash
   # Inisialisasi Git di folder lokal
   git init

   # Tambahkan semua file ke area staging
   git add .

   # Buat commit pertama Anda
   git commit -m "Inisialisasi Proyek Artverse dengan Integrasi Supabase"

   # Atur nama branch utama menjadi main
   git branch -M main

   # Hubungkan repositori lokal Anda dengan GitHub (Ganti URL di bawah dengan URL repositori GitHub Anda!)
   git remote add origin https://github.com/USERNAME_ANDA/REPOSITORI_ANDA.git

   # Push proyek Anda ke GitHub
   git push -u origin main
   ```

---

## ⚡ Langkah Deployment (Full-Stack di Vercel)

File `vercel.json` di proyek ini sudah dikonfigurasi agar frontend (React) dan backend (Express API) dideploy bersamaan dalam **satu proyek Vercel** — tidak perlu Netlify terpisah.

1. Masuk ke dasbor [Vercel](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **Add New...** -> **Project**.
3. Pilih repositori `artverse` yang sudah di-push ke GitHub, lalu klik **Import**.
4. Sebelum klik Deploy, buka bagian **Environment Variables** dan tambahkan:
   - `SELLER_TOKEN` (contoh: `admin123`)
   - `DATABASE_MODE` = `supabase`
   - `SUPABASE_URL` = URL project Supabase Anda (tanpa akhiran `/rest/v1/`)
   - `SUPABASE_ANON_KEY` = anon public key dari Supabase
5. Klik **Deploy**. Vercel akan menjalankan `npm run build` (build frontend + bundling API), lalu memberi Anda satu URL publik yang melayani frontend maupun `/api/*` sekaligus.
6. Setelah deploy pertama, cek halaman Anda dan pastikan katalog karya seni muncul (artinya koneksi ke Supabase berhasil).

Catatan: `netlify.toml` masih ada di proyek ini untuk opsi split-deployment, tapi tidak diperlukan jika semuanya dideploy di Vercel.
