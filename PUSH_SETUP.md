# 🔔 Setup Notifikasi Background (Web Push)

Fitur ini membuat notifikasi pengingat tetap muncul **walau tab/browser ditutup atau HP terkunci**,
selama HP/laptop menyala dan terkoneksi internet (lihat catatan iOS di bawah).

Cara kerja singkat:

```
Supabase pg_cron (tiap 1 menit)
        │
        ▼
Edge Function "send-reminders"  ──► cek reminder yang jatuh tempo (habit, manual, task plan)
        │
        ▼
Web Push ke setiap device terdaftar  ──► Service Worker (sw.js) ──► Notifikasi sistem OS
```

---

## File baru / yang diubah

| File | Keterangan |
|---|---|
| `sw.js` | **Baru** — Service Worker, menerima push & menampilkan notifikasi |
| `manifest.json` | **Baru** — PWA manifest (wajib untuk push di iOS Safari) |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | **Baru** — ikon PWA (silakan ganti dengan logo kamu) |
| `push-notifications.js` | **Baru** — registrasi SW, subscribe/unsubscribe, komponen toggle |
| `supabase_push_setup.sql` | **Baru** — SQL untuk tabel `push_subscriptions` + cron job |
| `supabase/functions/send-reminders/index.ts` | **Baru** — Edge Function pengirim push |
| `index.html` | Tambah link manifest/icon + load `push-notifications.js` |
| `supabase-storage.js` | Expose `_wsSupabaseClient` & `_wsGetUserId` |
| `notifications.js` | Tambah `<push-notif-toggle>` di panel notifikasi |
| `app.js` | Registrasi komponen `push-notif-toggle` + handle klik notif habit |

Semua file baru ditaruh **sejajar dengan `index.html`** (root project), kecuali folder `supabase/` yang
dipakai untuk deploy Edge Function.

---

## Langkah 1 — Jalankan SQL di Supabase

1. Buka dashboard Supabase project kamu → **SQL Editor** → New query
2. Buka file **`supabase_push_setup.sql`**, copy semua isinya
3. **Sebelum di-Run**, ganti dulu:
   - `<PROJECT_REF>` → ref project (lihat di **Project Settings → General**, contoh: `wsrzmemfhrcxqqseanxm`)
   - `<SERVICE_ROLE_KEY>` → **Project Settings → API → service_role key** (klik "Reveal")
4. Klik **Run**

Ini akan membuat tabel `push_subscriptions` + menjadwalkan cron job tiap 1 menit.

> Belum ada Edge Function-nya, jadi cron job ini akan gagal (error) sampai Langkah 2 selesai —
> itu normal, tidak masalah.

---

## Langkah 2 — Deploy Edge Function via Supabase CLI

Butuh **Node.js** terpasang di komputermu.

```bash
# 1. Install Supabase CLI (sekali saja)
npm install -g supabase

# 2. Login
supabase login

# 3. Link ke project kamu (jalankan di folder project, sejajar dengan folder supabase/)
supabase link --project-ref <PROJECT_REF>

# 4. Set secrets (VAPID keys — SUDAH digenerate, tinggal pakai)
supabase secrets set VAPID_PUBLIC_KEY="BK6q5hjI5UQgKGzMvb_hgHNt762mpI70uv7eX9XTvcZSTsmdtDqsgcSKwd3kNYbk_tMIynrgEKQU8TJNtkGeUWo"
supabase secrets set VAPID_PRIVATE_KEY="EZiVF-snYhTTAXzgdT71brCiBzTdFOzqNTawHyP43Cg"
supabase secrets set VAPID_SUBJECT="mailto:kamu@email.com"

# 5. Deploy function
supabase functions deploy send-reminders
```

> ⚠️ **`VAPID_PRIVATE_KEY` bersifat rahasia** — jangan commit ke repo publik, jangan share.
> `VAPID_PUBLIC_KEY` aman untuk ada di kode frontend (sudah ditaruh di `push-notifications.js`).

`SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` **otomatis tersedia** di Edge Function, tidak perlu di-set manual.

---

## Langkah 3 — Cek timezone

Edge Function menghitung "jam sekarang" pakai timezone **WIB (UTC+7)** secara default — cocok untuk
Bandung. Kalau kamu sering pakai dari zona waktu lain, ubah secret:

```bash
supabase secrets set APP_TZ_OFFSET_MINUTES="420"   # WIB = 420, WITA = 480, WIT = 540
```

---

## Langkah 4 — Test cron job

1. Kembali ke **SQL Editor**, jalankan:
   ```sql
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
   ```
   Pastikan ada hasil dengan `status = succeeded` (tunggu 1-2 menit setelah deploy).
2. Kalau `status = failed`, klik baris untuk lihat error — biasanya karena
   `<PROJECT_REF>` / `<SERVICE_ROLE_KEY>` di SQL belum diganti dengan benar. Perbaiki dengan:
   ```sql
   SELECT cron.unschedule('send-push-reminders');
   -- lalu jalankan ulang blok SELECT cron.schedule(...) dengan value yang benar
   ```

---

## Langkah 5 — Nyalakan di web

1. Deploy/upload semua file (termasuk file baru) ke hosting kamu
2. Buka web-nya, klik ikon 🔔 notifikasi → akan ada section baru **"Notifikasi Background"**
3. Klik switch-nya → browser akan minta izin notifikasi → klik **Allow**
4. Switch jadi aktif (oranye) — device ini sekarang terdaftar

### Cara test cepat
1. Buat **Pengingat Manual** baru dengan jam ±2 menit dari sekarang
2. Tutup tab/browser sepenuhnya (atau kunci HP)
3. Tunggu sampai jamnya tiba → notifikasi sistem akan muncul

---

## Catatan khusus iOS (iPhone/iPad)

Safari iOS **hanya** mengizinkan Web Push jika web sudah di-**"Add to Home Screen"** (jadi app icon
di homescreen) dan minimal **iOS 16.4**. Langkahnya:

1. Buka web di Safari
2. Tap tombol **Share** → **Add to Home Screen**
3. Buka app dari **icon di homescreen** (bukan dari Safari biasa)
4. Baru aktifkan toggle "Notifikasi Background" dari situ

---

## Troubleshooting

| Masalah | Kemungkinan sebab |
|---|---|
| Switch langsung balik ke "off" / muncul alert error | Cek console browser; biasanya tabel `push_subscriptions` belum ada (Langkah 1) atau RLS menolak — pastikan user sudah login (password popup sudah diisi) |
| Notif tidak muncul sama sekali | Cek `cron.job_run_details` — apakah cron jalan & `totalDue` > 0? Cek juga apakah `ws_habit_notifs` / `ws_manual_notifs` punya `time`/`timeVal` yang valid |
| Notif muncul dobel | `ws_push_sent` mungkin gagal tersimpan — cek log Edge Function (`supabase functions logs send-reminders`) |
| iOS tidak dapat notif | Pastikan dibuka dari ikon Home Screen (PWA mode), bukan tab Safari biasa |
| Subscription "menghilang" sendiri | Browser/OS kadang membersihkan push subscription setelah lama tidak dibuka — cukup nyalakan toggle lagi |

---

## Keterbatasan yang perlu diketahui

- Tidak akan jalan kalau HP/laptop benar-benar **dimatikan** (lihat diskusi sebelumnya)
- Akurasi waktu ±1 menit (cron jalan tiap 1 menit)
- Saat ini hanya 3 sumber reminder yang dicek: **Habit Tracker** (jadwal harian), **Pengingat Manual**,
  dan **Task Plan** (jam mulai). Kalau ada sumber reminder lain yang ingin ditambahkan, edit
  `supabase/functions/send-reminders/index.ts`
