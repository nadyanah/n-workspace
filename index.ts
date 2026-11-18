// ============================================================================
// SUPABASE EDGE FUNCTION — send-reminders
// ============================================================================
// Dijalankan setiap 1 menit oleh pg_cron (lihat ../../supabase_push_setup.sql).
//
// Tugas:
//  1. Ambil semua data reminder (habit, manual, task plan) tiap user dari
//     tabel `workspace_storage`
//  2. Cek item yang waktunya = waktu sekarang & belum selesai/belum dikirim
//  3. Kirim Web Push ke semua device (push_subscriptions) milik user tsb
//  4. Tandai item sebagai sudah-dikirim (ws_push_sent) agar tidak dobel
//
// Env vars yang WAJIB di-set (supabase secrets set ...):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
//   CRON_SECRET  (kunci rahasia yang sama dengan di SQL cron; function menolak request tanpa ini)
// Env var opsional:
//   APP_TZ_OFFSET_MINUTES (default 420 = WIB / UTC+7)
//
// SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY otomatis tersedia di Edge Functions.
// ============================================================================

/// <reference lib="deno.window" />

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@example.com";
const CRON_SECRET = Deno.env.get("CRON_SECRET") || "";
const TZ_OFFSET_MIN = parseInt(Deno.env.get("APP_TZ_OFFSET_MINUTES") || "420", 10); // WIB

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const STORAGE_KEYS = [
  "ws_habit_notifs",
  "ws_manual_notifs",
  "personal_workspace_job_plans",
  "ws_notif_action_status",
  "ws_push_sent"
];

function safeParse(value: string | null, fallback: unknown) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function timeToMinutes(time: string): number | null {
  const m = String(time).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

Deno.serve(async (req: Request) => {
  // Hanya cron kita yang boleh memanggil function ini
  if (!CRON_SECRET || req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Waktu "sekarang" di timezone aplikasi (default WIB)
    const shifted = new Date(Date.now() + TZ_OFFSET_MIN * 60_000);
    const todayStr = shifted.toISOString().slice(0, 10); // YYYY-MM-DD
    const nowMin = shifted.getUTCHours() * 60 + shifted.getUTCMinutes();

    // 1) Ambil semua data reminder relevan, dikelompokkan per user
    // 0) Hanya proses user yang punya device terdaftar (hemat baca database)
    const { data: subUsers, error: subUsersErr } = await supabase
      .from("push_subscriptions")
      .select("user_id");
    if (subUsersErr) throw subUsersErr;
    const userIds = [...new Set((subUsers || []).map((s: { user_id: string }) => s.user_id))];
    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, todayStr, nowMin, totalDue: 0, totalSent: 0, note: "no subscribers" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const { data: rows, error: rowsErr } = await supabase
      .from("workspace_storage")
      .select("user_id, key, value")
      .in("key", STORAGE_KEYS)
      .in("user_id", userIds);

    if (rowsErr) throw rowsErr;

    const byUser: Record<string, Record<string, string>> = {};
    for (const row of rows || []) {
      if (!byUser[row.user_id]) byUser[row.user_id] = {};
      byUser[row.user_id][row.key] = row.value;
    }

    let totalSent = 0;
    let totalDue = 0;

    for (const [userId, data] of Object.entries(byUser)) {
      const habits = safeParse(data["ws_habit_notifs"], []);
      const manuals = safeParse(data["ws_manual_notifs"], []);
      const plans = safeParse(data["personal_workspace_job_plans"], []);
      const doneStatus = safeParse(data["ws_notif_action_status"], {});
      const pushSent = safeParse(data["ws_push_sent"], {});

      const doneToday: Record<string, boolean> = doneStatus[todayStr] || {};
      const sentToday: Record<string, boolean> = { ...(pushSent[todayStr] || {}) };

      type DueItem = { id: string; title: string; body: string; page?: string; habitId?: string };
      const dueItems: DueItem[] = [];

      // ── Habit reminders (berlaku setiap hari) ──
      for (const h of habits) {
        if (typeof h.timeVal !== "number" || h.timeVal !== nowMin) continue;
        if (doneToday[h.id] || sentToday[h.id]) continue;
        dueItems.push({
          id: h.id,
          title: "⏰ " + (h.title || "Pengingat Habit"),
          body: h.subtitle || "Waktunya checklist habit ini",
          page: h.page || "habitTracker",
          habitId: h.habitId
        });
      }

      // ── Manual reminders (hari ini) ──
      for (const m of manuals) {
        if (m.date !== todayStr) continue;
        const timeVal = typeof m.timeVal === "number" ? m.timeVal : timeToMinutes(m.time || "");
        if (timeVal !== nowMin) continue;
        if (doneToday[m.id] || sentToday[m.id]) continue;
        dueItems.push({
          id: m.id,
          title: "⏰ " + (m.title || "Pengingat"),
          body: m.subtitle || "Waktunya sekarang!"
        });
      }

      // ── Task Plan (hari ini, ada jam mulai) ──
      for (const p of plans) {
        if (p.date !== todayStr || !p.time) continue;
        const timeVal = timeToMinutes(p.time);
        if (timeVal !== nowMin) continue;
        const id = "taskplan-" + p.id;
        if (sentToday[id]) continue;
        dueItems.push({
          id,
          title: "⏰ Task Plan Dimulai!",
          body: `${p.tasks} · ${p.category || "Umum"}`,
          page: "jobLogbook"
        });
      }

      if (dueItems.length === 0) continue;
      totalDue += dueItems.length;

      // 2) Ambil subscription device user ini
      const { data: subs, error: subsErr } = await supabase
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth")
        .eq("user_id", userId);

      if (subsErr) { console.error("subsErr", subsErr); continue; }
      if (!subs || subs.length === 0) {
        // Tidak ada device terdaftar → tetap tandai sent supaya tidak dicek ulang2
        for (const item of dueItems) sentToday[item.id] = true;
      } else {
        for (const item of dueItems) {
          const payload = JSON.stringify({
            title: item.title,
            body: item.body,
            tag: item.id,
            page: item.page || null,
            habitId: item.habitId || null
          });

          for (const sub of subs) {
            try {
              await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                payload
              );
              totalSent++;
            } catch (err: unknown) {
              // Subscription kadaluarsa / device sudah unsubscribe → hapus
              const pushErr = err as { statusCode?: number; body?: string; message?: string };
              if (pushErr.statusCode === 404 || pushErr.statusCode === 410) {
                await supabase.from("push_subscriptions").delete().eq("id", sub.id);
              } else {
                console.error("push error", userId, pushErr.statusCode, pushErr.body || pushErr.message);
              }
            }
          }
          sentToday[item.id] = true;
        }
      }

      // 3) Simpan status "sudah dikirim" agar tidak dobel
      pushSent[todayStr] = sentToday;
      // Buang catatan lebih dari 7 hari supaya key ini tidak membengkak
      const cutoff = new Date(shifted.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
      for (const d of Object.keys(pushSent)) { if (d < cutoff) delete pushSent[d]; }
      await supabase
        .from("workspace_storage")
        .upsert(
          { user_id: userId, key: "ws_push_sent", value: JSON.stringify(pushSent), updated_at: new Date().toISOString() },
          { onConflict: "user_id,key" }
        );
    }

    return new Response(
      JSON.stringify({ ok: true, todayStr, nowMin, totalDue, totalSent }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("send-reminders error:", err);
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
