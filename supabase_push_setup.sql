-- ============================================================================
-- SETUP PUSH NOTIFICATION — jalankan di Supabase SQL Editor
-- ============================================================================
-- Jalankan SEMUA blok di bawah secara berurutan (boleh sekaligus, klik Run).
-- ============================================================================


-- ── 1) Tabel untuk menyimpan push subscription tiap device ────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── 2) Aktifkan extension yang diperlukan untuk cron ───────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;


-- ── 3) Jadwalkan cron job: panggil Edge Function setiap 1 menit ────────────
-- GANTI dua placeholder di bawah:
--   <PROJECT_REF>          -> ref project Supabase kamu (lihat di Project Settings > General)
--   <SERVICE_ROLE_KEY>     -> Service Role key (Project Settings > API > service_role)
--
-- Catatan keamanan: service_role key tersimpan di tabel cron.job (perlu akses
-- DB untuk melihatnya). Untuk personal project ini biasanya aman, tapi kalau
-- mau lebih aman, simpan key via Supabase Vault dan ambil dengan
-- vault.decrypted_secrets di body request.

SELECT cron.schedule(
  'send-push-reminders',
  '* * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
               ),
    body    := jsonb_build_object('trigger', 'cron')
  );
  $$
);


-- ── (Opsional) Hapus / unschedule cron job ─────────────────────────────────
-- SELECT cron.unschedule('send-push-reminders');

-- ── (Opsional) Cek riwayat eksekusi cron job ───────────────────────────────
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
