# 🗄️ Panduan Setup Supabase untuk n-workspace

Ikuti langkah-langkah ini untuk mengaktifkan penyimpanan cloud agar data kamu sinkron di semua device.

---

## Langkah 1 — Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com) dan login / daftar (gratis)
2. Klik **"New project"**
3. Isi:
   - **Name**: `n-workspace` (atau bebas)
   - **Database Password**: buat password yang kuat, simpan baik-baik
   - **Region**: pilih yang terdekat (misal **Southeast Asia - Singapore**)
4. Tunggu project selesai dibuat (~1-2 menit)

---

## Langkah 2 — Buat Tabel di Database

1. Di dashboard Supabase, buka menu **SQL Editor** (ikon database di sidebar kiri)
2. Klik **"New query"**
3. Copy-paste SQL berikut, lalu klik **Run**:

```sql
-- Buat tabel utama untuk menyimpan semua data workspace
CREATE TABLE IF NOT EXISTS workspace_storage (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  value       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Index agar query cepat
CREATE INDEX IF NOT EXISTS idx_workspace_storage_user_id 
  ON workspace_storage(user_id);

-- Row Level Security: user hanya bisa akses data miliknya sendiri
ALTER TABLE workspace_storage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON workspace_storage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON workspace_storage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON workspace_storage FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
  ON workspace_storage FOR DELETE
  USING (auth.uid() = user_id);
```

Kamu akan melihat pesan **"Success. No rows returned"** — itu berarti berhasil ✅

---

## Langkah 3 — Aktifkan Anonymous Auth

Supaya pengguna tidak perlu login tapi datanya tetap terikat ke satu identitas:

1. Buka menu **Authentication** → **Providers**
2. Scroll ke bawah, cari **"Anonymous Sign-ins"**
3. Toggle **Enable** → klik **Save**

---

## Langkah 4 — Ambil Credentials

1. Buka **Project Settings** (ikon gear ⚙️ di sidebar bawah)
2. Pilih tab **API**
3. Catat dua nilai ini:
   - **Project URL** (contoh: `https://abcdefghijkl.supabase.co`)
   - **anon / public key** (string panjang yang dimulai dengan `eyJ...`)

---

## Langkah 5 — Isi Credentials di Kode

Buka file **`supabase-storage.js`**, cari bagian ini di atas (sekitar baris 15):

```javascript
const SUPABASE_URL = 'GANTI_DENGAN_SUPABASE_URL_KAMU';
const SUPABASE_ANON_KEY = 'GANTI_DENGAN_SUPABASE_ANON_KEY_KAMU';
```

Ganti dengan nilai yang kamu dapat di Langkah 4:

```javascript
const SUPABASE_URL = 'https://abcdefghijkl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## Langkah 6 — Deploy ke Vercel

1. Push semua file ke GitHub (pastikan `supabase-storage.js` ikut di-commit)
2. Buka [https://vercel.com](https://vercel.com), connect ke repo-mu
3. Deploy — selesai! 🎉

> **Catatan**: File `.env.local` jangan di-push ke GitHub. Credentials Supabase untuk project ini ada di `supabase-storage.js` langsung karena ini adalah `anon key` (public key yang aman untuk client-side).

---

## Bagaimana Cara Kerjanya?

```
Browser A (HP kamu)          Supabase Cloud          Browser B (Laptop kamu)
      │                            │                            │
      │── setItem('logs', ...) ──►│                            │
      │                     upsert ke DB                       │
      │                            │                            │
      │                            │◄── getItem('logs') ──────│
      │                            │    return dari DB          │
      │                            │──────────────────────────►│
```

- **Pertama kali buka**: Data lama dari `localStorage` otomatis dipindahkan (migrasi) ke Supabase
- **Setiap save**: Data disimpan ke cache lokal dulu (UI tetap cepat), lalu dikirim ke Supabase setelah 800ms
- **Buka di device lain**: Data langsung dimuat dari Supabase

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Data tidak muncul | Buka DevTools → Console, cari error `[WorkspaceStorage]` |
| `Failed to fetch` | Pastikan URL dan anon key sudah benar di `supabase-storage.js` |
| Data kosong di device baru | Normal jika belum pernah simpan di device itu. Data akan muncul saat kamu buka halaman yang sama di device lama dulu |
| Anonymous auth error | Pastikan "Anonymous Sign-ins" sudah di-enable di Supabase Auth settings |

---

## File yang Diubah

| File | Perubahan |
|------|-----------|
| `supabase-storage.js` | ✨ **File baru** — layer storage yang menggantikan localStorage |
| `index.html` | Tambah Supabase CDN + load script dengan urutan yang benar |
| `components.js` | Semua `localStorage` → `WorkspaceStorage` (16 key) |
| `app.js` | Semua `localStorage` → `WorkspaceStorage` (4 key) |
