// ============================================================================
// NOTIFICATION SYSTEM — notifications.js
// ============================================================================
//
// NotifSound        — Web Audio engine (playNotif, playCheck)
//
// ReminderPopup     — Popup otomatis, 3 mode:
//   • "open"   → buka web, semua jam belum lewat → list semua pending (SELALU muncul)
//   • "missed" → buka web, ada jam sudah lewat & belum dikerjakan → carousel slide
//   • "live"   → web sedang buka, jam task tiba tepat waktu (polling 30 detik)
//   Setelah missed di-dismiss → mode open langsung muncul otomatis (jika ada upcoming)
//   Bell goyang + bunyi setiap 8 menit selama masih ada notif pending
//
// NotificationPanel — Panel slide dari kanan, dibuka via bell icon
//   Section 1: Hari Ini  (Task Plan + Content urgen dari Supabase)
//   Section 2: Pengingat (action items dengan status done/undone)
//
// Storage: WorkspaceStorage (Supabase-synced, cross-device)
//   ws_notif_action_status  → { "YYYY-MM-DD": { id: true/false } }
//   ws_timed_popup_shown    → { "YYYY-MM-DD": { id: true } }
// ============================================================================

// ── Web Audio: generate suara pakai AudioContext (no file needed) ──

// ── Web Audio: generate suara pakai AudioContext (no file needed) ──
const NotifSound = {
  _ctx: null,
  _pendingSound: false,  // flag: ada suara pending menunggu interaksi user
  _get() {
    if (!this._ctx) {
      try { this._ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    // Resume context kalau suspended (browser autoplay policy)
    if (this._ctx && this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  },

  // Versi aman: kalau AudioContext masih suspended (belum ada interaksi user),
  // tandai _pendingSound supaya suara diputar saat user pertama kali klik popup.
  playNotifSafe() {
    const ctx = this._get();
    if (!ctx || ctx.state === 'suspended') {
      // AudioContext belum bisa dimainkan, tandai pending
      this._pendingSound = true;
      return;
    }
    this._pendingSound = false;
    this.playNotif();
  },

  // Dipanggil saat user berinteraksi dengan popup (klik tombol apapun)
  // Mainkan suara pending jika ada
  flushPendingSound() {
    if (!this._pendingSound) return;
    this._pendingSound = false;
    const ctx = this._get();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => this.playNotif()).catch(() => {});
    } else {
      this.playNotif();
    }
  },

  // Suara notif: karakter "marimba warm" — 3 nada naik dengan reverb tail
  playNotif() {
    const ctx = this._get(); if (!ctx) return;
    const now = ctx.currentTime;

    // Nada utama: do-mi-sol dengan volume lebih kencang
    const notes = [
      { freq: 523.25, t: 0,    dur: 0.55, vol: 0.55 },  // C5
      { freq: 659.25, t: 0.18, dur: 0.55, vol: 0.50 },  // E5
      { freq: 783.99, t: 0.36, dur: 0.75, vol: 0.48 },  // G5
      { freq: 1046.5, t: 0.54, dur: 0.65, vol: 0.38 },  // C6 (octave tinggi, lembut)
    ];

    notes.forEach(({ freq, t, dur, vol }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      // Slight detune biar ada karakter "marimba"
      const osc2  = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(ctx.destination);
      gain2.connect(ctx.destination);

      osc.type  = 'triangle';
      osc2.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + t);
      osc2.frequency.setValueAtTime(freq * 2, now + t); // harmonik

      // Attack → sustain → decay
      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(vol, now + t + 0.015);
      gain.gain.setValueAtTime(vol * 0.85, now + t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + dur);

      gain2.gain.setValueAtTime(0, now + t);
      gain2.gain.linearRampToValueAtTime(vol * 0.2, now + t + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + t + dur * 0.6);

      osc.start(now + t);  osc.stop(now + t + dur + 0.1);
      osc2.start(now + t); osc2.stop(now + t + dur + 0.1);
    });

    // Suara "shimmer" tipis di belakang (biar berasa ada notif penting)
    const shimmer = ctx.createOscillator();
    const sGain   = ctx.createGain();
    shimmer.connect(sGain); sGain.connect(ctx.destination);
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(2093, now + 0.5); // C7
    sGain.gain.setValueAtTime(0, now + 0.5);
    sGain.gain.linearRampToValueAtTime(0.12, now + 0.52);
    sGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    shimmer.start(now + 0.5); shimmer.stop(now + 1.4);
  },

  // Suara checklist: 3 nada ceria naik (do-mi-sol) + sparkle
  playCheck() {
    const ctx = this._get(); if (!ctx) return;
    const now = ctx.currentTime;

    [[523, 0, 0.18, 0.45], [659, 0.14, 0.18, 0.42], [784, 0.28, 0.28, 0.40]].forEach(([freq, delay, dur, vol]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(vol, now + delay + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
      osc.start(now + delay); osc.stop(now + delay + dur + 0.05);
    });
    // Sparkle high
    const sp = ctx.createOscillator(); const sg = ctx.createGain();
    sp.connect(sg); sg.connect(ctx.destination);
    sp.type = 'sine'; sp.frequency.setValueAtTime(1568, now + 0.38);
    sg.gain.setValueAtTime(0, now + 0.38);
    sg.gain.linearRampToValueAtTime(0.22, now + 0.39);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    sp.start(now + 0.38); sp.stop(now + 0.75);
  }
};

const ReminderPopup = {
  template: `
    <transition name="reminder-popup-fade">
      <div v-if="visible" class="reminder-popup-overlay" @click.self="dismiss">
        <div class="reminder-popup-card">

          <!-- ── Header ── -->
          <div class="reminder-popup-header" :class="headerClass">
            <div class="reminder-popup-icon-wrap">
              <!-- mode missed: icon warning -->
              <svg v-if="mode === 'missed'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <!-- mode live / open: icon bell -->
              <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div style="flex:1; min-width:0;">
              <div class="reminder-popup-title">{{ headerTitle }}</div>
              <div class="reminder-popup-date">{{ todayLabel }}</div>
            </div>
            <!-- Counter slide (mode missed, >1 item) -->
            <div v-if="mode === 'missed' && queue.length > 1" class="reminder-popup-counter">
              {{ currentIdx + 1 }} / {{ queue.length }}
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════
               MODE: open  —  review harian: Hari Ini + Pengingat
          ══════════════════════════════════════════════════ -->
          <template v-if="mode === 'open'">
            <div class="reminder-popup-body reminder-popup-body-scroll">

              <!-- Section gabungan: Hari Ini (info items + pengingat), diurutkan berdasarkan waktu -->
              <div class="reminder-popup-section-label">
                <span class="reminder-popup-dot reminder-popup-dot-terra"></span> Hari Ini
              </div>
              <template v-for="entry in mergedTodayItems" :key="entry.key">
                <!-- Info item (task plan / content) -->
                <div v-if="entry.kind === 'info'" class="reminder-popup-item reminder-popup-item-info">
                  <div v-if="entry.item.time" class="reminder-popup-item-time">{{ entry.item.time }}</div>
                  <div class="reminder-popup-item-icon">{{ entry.item.icon }}</div>
                  <div class="reminder-popup-item-info-text" style="flex:1; min-width:0;">
                    <div class="reminder-popup-item-title">{{ entry.item.title }}</div>
                    <div class="reminder-popup-item-sub">{{ entry.item.sub }}</div>
                  </div>
                </div>

                <!-- Pengingat item -->
                <div v-else class="reminder-popup-item">
                  <div class="reminder-popup-item-time">{{ entry.item.time }}</div>
                  <div class="reminder-popup-item-info" style="flex:1; min-width:0;">
                    <div class="reminder-popup-item-title">{{ entry.item.title }}</div>
                    <div class="reminder-popup-item-sub" style="white-space:pre-wrap;">{{ entry.item.subtitle }}</div>
                  </div>
                </div>
              </template>

              <!-- Kalau tidak ada apa-apa -->
              <p v-if="mergedTodayItems.length === 0"
                 style="font-size:12px; color:var(--text-muted); text-align:center; padding:8px 0;">
                Tidak ada agenda hari ini 🎉
              </p>
            </div>
            <div class="reminder-popup-footer">
              <button class="reminder-popup-btn-open" @click="flushSoundThenOpenNotif">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Lihat Notifikasi
              </button>
              <button class="reminder-popup-btn-dismiss" @click="flushSoundThenDismiss">Nanti saja</button>
            </div>
          </template>

          <!-- ══════════════════════════════════════════════════
               MODE: live  —  1 notif, jam tepat waktu
          ══════════════════════════════════════════════════ -->
          <template v-else-if="mode === 'live'">
            <div class="reminder-popup-body">
              <div class="reminder-popup-item" style="border-left-color: var(--color-terracotta, #D67B52);">
                <!-- Icon: task plan vs pengingat biasa -->
                <div v-if="currentItem.isTaskPlan" class="reminder-popup-item-time" style="display:flex; flex-direction:column; align-items:center; gap:3px; min-width:38px;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span style="font-size:10px; font-weight:700; color:var(--color-terracotta,#D67B52); white-space:nowrap;">{{ currentItem.time }}</span>
                </div>
                <div v-else class="reminder-popup-item-time">{{ currentItem.time }}</div>
                <div class="reminder-popup-item-info">
                  <div class="reminder-popup-item-title">{{ currentItem.title }}</div>
                  <div class="reminder-popup-item-sub" style="white-space:pre-wrap;">{{ currentItem.subtitle }}</div>
                </div>
              </div>
            </div>
            <div class="reminder-popup-footer">
              <button class="reminder-popup-btn-open" @click="openNotifPanel">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Lihat Notifikasi
              </button>
              <button class="reminder-popup-btn-dismiss" @click="dismiss">Oke, Siap!</button>
            </div>
          </template>

          <!-- ══════════════════════════════════════════════════
               MODE: missed  —  mirip mode open, slide nav kalau > 1 item
          ══════════════════════════════════════════════════ -->
          <template v-else-if="mode === 'missed'">

            <!-- 1 item: langsung tampil, footer mirip mode open -->
            <template v-if="queue.length === 1">
              <div class="reminder-popup-body">
                <p class="reminder-popup-intro">
                  Kamu punya <strong>1 pengingat</strong> yang kelewat hari ini:
                </p>
                <div class="reminder-popup-item reminder-popup-item-missed">
                  <div class="reminder-popup-item-time reminder-popup-item-time-missed">{{ queue[0].time }}</div>
                  <div class="reminder-popup-item-info">
                    <div class="reminder-popup-item-title">{{ queue[0].title }}</div>
                    <div class="reminder-popup-item-sub" style="white-space:pre-wrap;">{{ queue[0].subtitle }}</div>
                  </div>
                </div>
              </div>
              <div class="reminder-popup-footer">
                <button class="reminder-popup-btn-open reminder-popup-btn-amber" @click="openNotifPanel">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  Lihat Notifikasi
                </button>
                <button class="reminder-popup-btn-dismiss" @click="dismiss">Oke</button>
              </div>
            </template>

            <!-- > 1 item: carousel dengan slide nav, footer ada Sebelumnya/Berikutnya/Oke -->
            <template v-else>
              <transition :name="slideDir === 'next' ? 'rp-slide-left' : 'rp-slide-right'" mode="out-in">
                <div :key="currentItem.id" class="reminder-popup-body">
                  <p class="reminder-popup-intro">
                    Kamu punya <strong>{{ queue.length }} pengingat</strong> yang kelewat hari ini:
                  </p>
                  <div class="reminder-popup-item reminder-popup-item-missed">
                    <div class="reminder-popup-item-time reminder-popup-item-time-missed">{{ currentItem.time }}</div>
                    <div class="reminder-popup-item-info">
                      <div class="reminder-popup-item-title">{{ currentItem.title }}</div>
                      <div class="reminder-popup-item-sub" style="white-space:pre-wrap;">{{ currentItem.subtitle }}</div>
                    </div>
                  </div>
                </div>
              </transition>

              <!-- Progress dots -->
              <div class="reminder-popup-dots">
                <span
                  v-for="(_, i) in queue"
                  :key="i"
                  class="reminder-popup-dot"
                  :class="{ 'reminder-popup-dot-active': i === currentIdx }"
                  @click="jumpTo(i)">
                </span>
              </div>

              <!-- Footer: slide nav, Oke di slide terakhir -->
              <div class="reminder-popup-footer">
                <button v-if="currentIdx > 0" class="reminder-popup-btn-nav" @click="prev">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Sebelumnya
                </button>
                <div style="flex:1"></div>
                <button v-if="currentIdx < queue.length - 1" class="reminder-popup-btn-open reminder-popup-btn-amber" @click="next">
                  Berikutnya
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <button v-else class="reminder-popup-btn-dismiss" @click="dismiss">Oke</button>
              </div>
            </template>

          </template>

        </div>
      </div>
    </transition>
  `,

  emits: ['open-notif', 'dismiss'],

  data() {
    return {
      visible: false,
      mode: 'open',       // 'open' | 'live' | 'missed'
      todayStr: '',
      // mode open — Section 2 (actionable pending)
      pendingNotifs: [],
      // mode open — Section 1 (task plan + content hari ini)
      infoItems: [],
      // mode live & missed
      queue: [],
      currentIdx: 0,
      slideDir: 'next',
      _checkInterval: null,
      _bellInterval: null,
      _pendingOpenAfterMissed: null
    };
  },

  computed: {
    currentItem() {
      return this.queue[this.currentIdx] || {};
    },
    headerTitle() {
      if (this.mode === 'missed') return 'Notifikasi Kelewat';
      if (this.mode === 'live') {
        return this.currentItem && this.currentItem.isTaskPlan
          ? '⏰ Task Plan Dimulai!'
          : 'Waktunya Sekarang!';
      }
      return 'Pengingat Hari Ini';
    },
    headerClass() {
      return this.mode === 'missed' ? 'reminder-popup-header-amber' : '';
    },
    todayLabel() {
      const now = new Date();
      const days   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    },

    // ── Gabungan Section 1 (info) + Section 2 (pengingat), diurutkan berdasarkan waktu ──
    // Item tanpa waktu diletakkan paling atas.
    mergedTodayItems() {
      const result = [];

      this.infoItems.forEach(item => {
        let timeVal = -1; // tanpa waktu → paling atas
        if (item.time) {
          const m = String(item.time).match(/^(\d{1,2}):(\d{2})/);
          if (m) timeVal = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
        }
        result.push({ kind: 'info', key: 'info-' + item.id, timeVal, item });
      });

      this.pendingNotifs.forEach(notif => {
        let timeVal = -1;
        if (notif.time) {
          const m = String(notif.time).match(/^(\d{1,2}):(\d{2})/);
          if (m) timeVal = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
          else if (typeof notif.timeVal === 'number') timeVal = notif.timeVal;
        } else if (typeof notif.timeVal === 'number') {
          timeVal = notif.timeVal;
        }
        result.push({ kind: 'notif', key: 'notif-' + notif.id, timeVal, item: notif });
      });

      return result.sort((a, b) => a.timeVal - b.timeVal);
    }
  },

  mounted() {
    this.todayStr = this._getTodayStr();
    // Cek missed / open saat web dibuka (delay 900ms biar WorkspaceStorage selesai init)
    setTimeout(() => this._checkOnOpen(), 900);
    // Polling live setiap 30 detik
    this._checkInterval = setInterval(() => this._checkLive(), 20000);
    // Bell reminder: goyang + bunyi setiap 8 menit kalau masih ada notif pending & popup tidak visible
    this._bellInterval  = setInterval(() => this._checkBellReminder(), 8 * 60 * 1000);
  },

  beforeUnmount() {
    clearInterval(this._checkInterval);
    clearInterval(this._bellInterval);
  },

  methods: {
    _getTodayStr() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },

    _nowMinutes() {
      const n = new Date();
      return n.getHours() * 60 + n.getMinutes();
    },

    _allActions() {
      const base = [];
      // Kumpulkan skipDays dari habits untuk filter libur hari ini
      const todayStr = this.todayStr;
      let skippedHabitNotifIds = new Set();
      try {
        const raw = WorkspaceStorage.getItem('aesthetic_habit_tracker_habits');
        if (raw) {
          const habits = JSON.parse(raw);
          habits.forEach(h => {
            if (Array.isArray(h.skipDays) && h.skipDays.includes(todayStr)) {
              skippedHabitNotifIds.add('habit_' + h.id);
            }
          });
        }
      } catch(e) {}
      try {
        const raw = WorkspaceStorage.getItem('ws_habit_notifs');
        if (raw) {
          const habits = JSON.parse(raw);
          habits.forEach(h => {
            // Juga skip jika kebetulan masih ada di ws_habit_notifs (safety fallback)
            if (skippedHabitNotifIds.has(h.id)) return;
            if (!base.find(b => b.id === h.id)) base.push({ ...h, isHabit: true });
          });
        }
      } catch(e) {}
      // Manual reminders hari ini
      try {
        const raw = WorkspaceStorage.getItem('ws_manual_notifs');
        if (raw) {
          const manuals = JSON.parse(raw);
          manuals.filter(m => reminderOccursOnDate(m, this.todayStr)).forEach(m => {
            if (!base.find(b => b.id === m.id)) {
              base.push({
                id: m.id,
                title: m.title,
                subtitle: m.subtitle || 'Pengingat manual',
                time: m.time,
                timeVal: m.timeVal,
                page: m.page || null,
                isHabit: false,
                isManual: true
              });
            }
          });
        }
      } catch(e) {}
      return base.sort((a, b) => a.timeVal - b.timeVal);
    },

    // ── Task Plan hari ini yang punya waktu mulai (TERPISAH dari _allActions) ──
    // Tidak masuk pendingNotifs/actionable — hanya untuk live polling jam mulai
    _allTaskPlanActions() {
      const list = [];
      try {
        const raw = WorkspaceStorage.getItem('personal_workspace_job_plans');
        if (raw) {
          const plans = JSON.parse(raw);
          plans.filter(p => p.date === this.todayStr && p.time).forEach(p => {
            const id = 'taskplan-' + p.id;
            const [hh, mm] = p.time.split(':').map(Number);
            const timeVal  = hh * 60 + mm;
            const timeLabel = p.timeEnd ? p.time + ' – ' + p.timeEnd : p.time;
            list.push({
              id,
              title: p.tasks,
              subtitle: 'Task Plan · ' + (p.category || 'Umum') + (p.requester ? ' · dari ' + p.requester : ''),
              time: timeLabel,
              timeVal,
              isTaskPlan: true
            });
          });
        }
      } catch(e) {}
      return list.sort((a, b) => a.timeVal - b.timeVal);
    },

    _isDone(id) {
      try {
        const raw = WorkspaceStorage.getItem('ws_notif_action_status');
        const s = JSON.parse(raw || '{}');
        return !!(s[this.todayStr] || {})[id];
      } catch(e) { return false; }
    },

    _getShownLog() {
      try {
        const raw = WorkspaceStorage.getItem('ws_timed_popup_shown');
        return JSON.parse(raw || '{}');
      } catch(e) { return {}; }
    },

    _markShown(id) {
      const log = this._getShownLog();
      if (!log[this.todayStr]) log[this.todayStr] = {};
      log[this.todayStr][id] = true;
      WorkspaceStorage.setItem('ws_timed_popup_shown', JSON.stringify(log));
    },

    // ── Dipanggil sekali saat web dibuka ──────────────────────────────────
    _checkOnOpen() {
      const all    = this._allActions();
      const nowMin = this._nowMinutes();

      const pendingItems  = all.filter(a => !this._isDone(a.id));
      if (pendingItems.length === 0) return; // semua sudah selesai hari ini, skip

      // Item tanpa waktu (timeVal -1 / allDay) tidak pernah "missed" — selalu upcoming
      // Gunakan > (bukan >=) agar item yang waktunya TEPAT saat ini masuk upcoming,
      // beri grace 1 menit sebelum dianggap missed.
      const missedItems   = pendingItems.filter(a => a.timeVal >= 0 && nowMin > a.timeVal);
      const upcomingItems = pendingItems.filter(a => a.timeVal < 0 || nowMin <= a.timeVal);

      // PRIORITAS 1 — ada yang kelewat → muncul mode missed dulu
      if (missedItems.length > 0) {
        this.mode       = 'missed';
        this.queue      = missedItems;
        this.currentIdx = 0;
        // Kalau masih ada upcoming juga → antri mode open setelah missed di-dismiss
        // Kalau tidak ada upcoming, tetap tampilkan mode open dengan semua pendingItems
        // supaya user tetap bisa lihat ringkasan hari ini (fix: muncul di malam hari)
        this._pendingOpenAfterMissed = pendingItems;
        this.visible    = true;
        this._triggerBellShake();
        NotifSound.playNotifSafe();
        return;
      }

      // PRIORITAS 2 — semua jam belum lewat → mode open (SELALU tampil, tanpa cek dismiss)
      // Juga muncul kalau semua sudah missed tapi ada yang pending (fix malam hari sudah ditangani di atas)
      if (pendingItems.length > 0) {
        this.mode          = 'open';
        // Tampilkan semua pending (upcoming dulu, lalu missed) supaya muncul di semua jam
        this.pendingNotifs = pendingItems;
        this.infoItems     = this._loadInfoItems();
        this._pendingOpenAfterMissed = null;
        this.visible       = true;
        this._triggerBellShake();
        NotifSound.playNotifSafe();
      }
    },

    // ── Load Section 1 items (Task Plan + Content urgen) untuk mode open ──
    _loadInfoItems() {
      const items = [];
      const today = this.todayStr;

      // Task Plan hari ini
      try {
        const plans = JSON.parse(WorkspaceStorage.getItem('personal_workspace_job_plans') || '[]');
        plans.filter(p => p.date === today && p.phase !== 'Completed').forEach(p => {
          const timeLabel = p.time ? (p.timeEnd ? p.time + ' – ' + p.timeEnd : p.time) : null;
          items.push({
            id: 'task-' + p.id,
            icon: '📋',
            title: p.tasks,
            sub: `Task Plan · ${p.category || 'Umum'}`,
            time: timeLabel
          });
        });
      } catch(e) {}

      // Content Plan urgen (hari ini, H-1, H-2, terlambat)
      try {
        const contents = JSON.parse(WorkspaceStorage.getItem('personal_workspace_content_items') || '[]');
        const todayDate = new Date(today);
        contents.forEach(item => {
          if (!item.dueDate) return;
          const diff = Math.round((new Date(item.dueDate) - todayDate) / 86400000);
          if (diff > 2) return;
          const label = diff < 0 ? `Terlambat ${Math.abs(diff)}h` : diff === 0 ? 'Rilis Hari Ini' : `H-${diff}`;
          items.push({
            id: 'content-' + item.id,
            icon: '🎬',
            title: item.title,
            sub: `Content · ${item.platform || ''} · ${label}`,
            time: item.dueTime || null
          });
        });
      } catch(e) {}

      return items;
    },

    // ── Polling live: muncul tepat saat jam task tiba ─────────────────────
    _checkLive() {
      if (this.visible) return;
      const nowMin   = this._nowMinutes();
      const shownLog = this._getShownLog()[this.todayStr] || {};

      // Cek habit/manual reminders — skip item tanpa waktu (timeVal -1) dari live trigger
      let due = this._allActions().find(a => {
        if (a.timeVal < 0) return false; // allDay/tanpa waktu → tidak perlu live trigger jam
        const diff = nowMin - a.timeVal;
        return diff >= 0 && diff < 2 && !this._isDone(a.id) && !shownLog[a.id];
      });

      // Cek task plans (terpisah, tidak ada done-state)
      if (!due) {
        due = this._allTaskPlanActions().find(a => {
          const diff = nowMin - a.timeVal;
          return diff >= 0 && diff < 2 && !shownLog[a.id];
        });
      }

      if (!due) return;

      this._markShown(due.id);
      this.mode       = 'live';
      this.queue      = [due];
      this.currentIdx = 0;
      this.visible    = true;
      this._triggerBellShake();
      NotifSound.playNotif();
    },

    // ── Bell goyang berkala (setiap 8 menit) kalau masih ada notif pending ──
    _checkBellReminder() {
      if (this.visible) return; // popup sedang tampil, skip
      const all     = this._allActions();
      const pending = all.filter(a => !this._isDone(a.id));
      if (pending.length === 0) return; // semua selesai, tidak perlu goyang
      this._triggerBellShake();
      NotifSound.playNotif();
    },

    // ── Trigger bell shake on all bell buttons ────────────────────────────
    _triggerBellShake() {
      const bells = document.querySelectorAll('.desk-notif-float-btn, .ws-notif-btn');
      bells.forEach(btn => {
        btn.classList.remove('bell-has-notif');
        void btn.offsetWidth;
        btn.classList.add('bell-has-notif');
        setTimeout(() => btn.classList.remove('bell-has-notif'), 4000);
      });
    },

    // ── Carousel navigation (mode missed) ────────────────────────────────
    next() {
      if (this.currentIdx < this.queue.length - 1) {
        this.slideDir = 'next';
        this.currentIdx++;
      }
    },

    prev() {
      if (this.currentIdx > 0) {
        this.slideDir = 'prev';
        this.currentIdx--;
      }
    },

    jumpTo(i) {
      this.slideDir   = i > this.currentIdx ? 'next' : 'prev';
      this.currentIdx = i;
    },

    // ── Actions ──────────────────────────────────────────────────────────
    openNotifPanel() {
      this.dismiss();
      this.$emit('open-notif');
    },

    // Flush suara pending (akibat autoplay policy) sebelum dismiss/open panel
    // Dipanggil saat user klik tombol di mode open — ini adalah "interaksi pertama"
    flushSoundThenDismiss() {
      NotifSound.flushPendingSound();
      this.dismiss();
    },

    flushSoundThenOpenNotif() {
      NotifSound.flushPendingSound();
      this.openNotifPanel();
    },

    dismiss() {
      const wasMissed = this.mode === 'missed';
      this.visible = false;

      // Kalau setelah missed → selalu cek ulang upcoming secara langsung,
      // jangan hanya andalkan _pendingOpenAfterMissed (bisa null kalau race condition).
      if (wasMissed) {
        const savedPending = this._pendingOpenAfterMissed;
        this._pendingOpenAfterMissed = null;
        setTimeout(() => {
          // Re-check langsung: ambil semua actions yang belum done (termasuk yang sudah missed)
          // supaya mode open tetap muncul di malam hari meski semua jam sudah lewat
          const all    = this._allActions();
          const allPendingItems = all.filter(a => !this._isDone(a.id));

          // Gunakan hasil re-check; fallback ke savedPending kalau re-check kosong
          const pendingToShow = allPendingItems.length > 0 ? allPendingItems : (savedPending || []);

          if (pendingToShow.length > 0) {
            this.mode          = 'open';
            this.pendingNotifs = pendingToShow;
            this.infoItems     = this._loadInfoItems();
            this.visible       = true;
            NotifSound.playNotifSafe();
          }
        }, 600);
      }

      this.$emit('dismiss');
    },
  }
};


// ── Helper: cek apakah pengingat manual berlaku pada tanggal tertentu ──
// Mendukung recurrence ala Google Calendar: none, daily, weekly, monthly, yearly, weekday, custom
// startDate (m.date) = tanggal mulai berlaku; recurrence menentukan pengulangan setelahnya
if (typeof reminderOccursOnDate === 'undefined') {
  var reminderOccursOnDate = function(m, dateStr) {
    if (!m || !m.date || !dateStr) return false;
    const rec = m.recurrence || 'none';
    if (dateStr < m.date) return false; // belum mulai
    if (m.endDate && dateStr > m.endDate) return false; // sudah berakhir
    // Tanggal yang di-exclude (mode "acara ini saja" saat edit seri)
    if (m.excludedDates && m.excludedDates.includes(dateStr)) return false;

    // ── Custom recurrence (interval bebas, bisa harian/mingguan/bulanan/tahunan) ──
    if (rec === 'custom' && m.customRecurrence) {
      const c = m.customRecurrence;
      const start = new Date(m.date + 'T00:00:00');
      const target = new Date(dateStr + 'T00:00:00');
      if (isNaN(start) || isNaN(target)) return m.date === dateStr;
      // cek endDate / count
      if (c.endType === 'date' && c.endDate && dateStr > c.endDate) return false;
      const msPerDay = 86400000;
      const diffDays = Math.round((target - start) / msPerDay);
      const interval = Math.max(1, c.interval || 1);
      if (c.unit === 'day') {
        if (diffDays % interval !== 0) return false;
        if (c.endType === 'count') return Math.floor(diffDays / interval) < c.count;
        return true;
      }
      if (c.unit === 'week') {
        const days = c.days && c.days.length > 0 ? c.days : [start.getDay()];
        if (!days.includes(target.getDay())) return false;
        const weekDiff = Math.floor(diffDays / 7);
        if (weekDiff % interval !== 0) return false;
        if (c.endType === 'count') {
          let count = 0;
          const cur = new Date(start);
          while (cur <= target) {
            const wd = Math.round((cur - start) / msPerDay);
            const wk = Math.floor(wd / 7);
            if (wk % interval === 0 && days.includes(cur.getDay())) count++;
            cur.setDate(cur.getDate() + 1);
          }
          return count <= c.count;
        }
        return true;
      }
      if (c.unit === 'month') {
        if (target.getDate() !== start.getDate()) return false;
        const monthDiff = (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth());
        if (monthDiff % interval !== 0) return false;
        if (c.endType === 'count') return Math.floor(monthDiff / interval) < c.count;
        return true;
      }
      if (c.unit === 'year') {
        if (target.getDate() !== start.getDate() || target.getMonth() !== start.getMonth()) return false;
        const yearDiff = target.getFullYear() - start.getFullYear();
        if (yearDiff % interval !== 0) return false;
        if (c.endType === 'count') return Math.floor(yearDiff / interval) < c.count;
        return true;
      }
      return false;
    }

    if (rec === 'none') return m.date === dateStr;

    const start = new Date(m.date + 'T00:00:00');
    const target = new Date(dateStr + 'T00:00:00');
    if (isNaN(start) || isNaN(target)) return m.date === dateStr;

    switch (rec) {
      case 'daily':
        return true;
      case 'weekday': {
        const day = target.getDay(); // 0=Minggu, 6=Sabtu
        return day >= 1 && day <= 5;
      }
      case 'weekly': {
        return start.getDay() === target.getDay();
      }
      case 'monthly': {
        return start.getDate() === target.getDate();
      }
      case 'yearly': {
        return start.getDate() === target.getDate() && start.getMonth() === target.getMonth();
      }
      default:
        return m.date === dateStr;
    }
  };
}

// ── Helper: ambil jumlah putaran dzikir yang sudah tuntas hari ini ──
function _getDzikirCompletedCountToday() {
  try {
    const raw = WorkspaceStorage.getItem('dzikir_completed_today');
    if (!raw) return 0;
    const data = JSON.parse(raw);
    const now = new Date();
    const todayStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
    if (data.date !== todayStr) return 0;
    return data.count || 0;
  } catch (e) {
    return 0;
  }
}

// ── Helper: cek apakah habit Dzikir Waktu ke-N sudah terbuka ──
// Dipakai untuk gating habit berkategori "Dzikir Waktu" di Panel Notifikasi.
// Habit diurutkan berdasarkan timeVal (jam); putaran dzikir ke-N membuka habit urutan ke-N.
// "habitIndex" = posisi habit ini di antara semua habit Dzikir Waktu (0-based),
// diurutkan ascending berdasarkan timeVal.
if (typeof isDzikirReadyForHabit === 'undefined') {
  var isDzikirReadyForHabit = function(timeVal, habitIndex) {
    try {
      const completedCount = _getDzikirCompletedCountToday();
      if (completedCount <= 0) return false;
      // habitIndex 0-based: putaran ke-1 buka index 0, putaran ke-2 buka index 1, dst.
      const idx = (typeof habitIndex === 'number' && habitIndex >= 0) ? habitIndex : 0;
      return completedCount > idx;
    } catch (e) {
      return false;
    }
  };
}


// ── Helper: ambil notif belum dikerjakan dari hari tertentu ──
function _snapshotMissedForDate(dateStr) {
  try {
    const statusRaw = WorkspaceStorage.getItem('ws_notif_action_status');
    const actionStatus = statusRaw ? JSON.parse(statusRaw) : {};
    const status = actionStatus[dateStr] || {};

    const base = [];
    try {
      const raw = WorkspaceStorage.getItem('ws_habit_notifs');
      if (raw) JSON.parse(raw).forEach(h => {
        if (!base.find(b => b.id === h.id))
          base.push({ id: h.id, title: h.title, subtitle: h.subtitle || 'Habit harian', time: h.time, type: 'habit', color: h.color });
      });
    } catch(e) {}
    try {
      const raw = WorkspaceStorage.getItem('ws_manual_notifs');
      if (raw) JSON.parse(raw).filter(m => reminderOccursOnDate(m, dateStr)).forEach(m => {
        if (!base.find(b => b.id === m.id))
          base.push({ id: m.id, title: m.title, subtitle: m.subtitle || 'Pengingat manual', time: m.time, endTime: m.endTime || null, type: 'manual' });
      });
    } catch(e) {}
    // Task Plan hari itu yang punya waktu -> snapshot juga sebagai missed
    try {
      const raw = WorkspaceStorage.getItem('personal_workspace_job_plans');
      if (raw) JSON.parse(raw).filter(p => p.date === dateStr && p.time).forEach(p => {
        const id = 'taskplan-' + p.id;
        if (base.find(b => b.id === id)) return;
        const timeLabel = p.timeEnd ? p.time + ' – ' + p.timeEnd : p.time;
        base.push({ id, title: p.tasks, subtitle: 'Task Plan · ' + (p.category || 'Umum'), time: timeLabel, type: 'taskplan' });
      });
    } catch(e) {}
    return base.filter(n => !status[n.id]);
  } catch(e) { return []; }
}

// ── Simpan snapshot missed tasks untuk satu hari tertentu ──
function saveMissedTasksSnapshot(yesterdayStr) {
  const missed = _snapshotMissedForDate(yesterdayStr);
  if (missed.length === 0) return;
  try {
    const raw = WorkspaceStorage.getItem('ws_missed_tasks');
    let log = raw ? JSON.parse(raw) : [];
    const idx = log.findIndex(e => e.date === yesterdayStr);
    if (idx !== -1) { log[idx].tasks = missed; }
    else { log.unshift({ date: yesterdayStr, tasks: missed }); }
    if (log.length > 60) log = log.slice(0, 60);
    WorkspaceStorage.setItem('ws_missed_tasks', JSON.stringify(log));
  } catch(e) {}
}

const NotificationPanel = {
  template: `
    <transition name="notif-panel-slide">
      <div v-if="show" class="notif-panel-overlay" @click.self="$emit('close')">
        <div class="notif-panel">

          <!-- Header -->
          <div class="notif-panel-header">
            <div style="display:flex; align-items:center; gap:10px;">
              <div class="notif-header-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <div>
                <div class="notif-panel-title">Notifikasi</div>
                <div class="notif-panel-date">{{ todayLabel }}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <!-- See All → buka Google Calendar -->
              <button class="notif-see-all-btn" @click="goToCalendar" title="Lihat di Google Calendar">
                See All
              </button>
              <button class="notif-close-btn" @click="$emit('close')" aria-label="Tutup notifikasi">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <!-- Toggle Notifikasi Background (Web Push) -->
          <div style="border-bottom: 1px solid var(--color-sand, #D6CEC5);">
            <!-- Toggle Header -->
            <button
              @click="showPushSettings = !showPushSettings"
              style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:10px 16px; background:none; border:none; cursor:pointer; font-family:inherit;">
              <div style="display:flex; align-items:center; gap:8px;">
                <div style="width:26px; height:26px; background:var(--color-terracotta,#D67B52); border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
                <span style="font-size:12px; font-weight:700; color:var(--text-dark); letter-spacing:0.3px;">Pengaturan Notifikasi</span>
              </div>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--text-muted)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                :style="{ transform: showPushSettings ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <!-- Collapsible Content -->
            <transition name="notif-settings-slide">
              <div v-if="showPushSettings" style="padding: 0 16px 14px;">
                <push-notif-toggle></push-notif-toggle>
              </div>
            </transition>
          </div>

          <!-- Tabs -->
          <div class="notif-tabs">
            <button class="notif-tab" :class="{ active: activeTab === 'today' }" @click="activeTab = 'today'">
              Hari Ini
              <span v-if="totalUnread > 0" class="notif-tab-badge">{{ totalUnread }}</span>
            </button>
            <button class="notif-tab" :class="{ active: activeTab === 'missed' }" @click="activeTab = 'missed'; loadMissedLog()">
              Terlewat
              <span v-if="totalMissedCount > 0" class="notif-tab-badge notif-tab-badge-red">{{ totalMissedCount }}</span>
            </button>
          </div>

          <!-- Body -->
          <div class="notif-panel-body">

            <!-- ══════════════════════════════
                 TAB: HARI INI
            ══════════════════════════════ -->
            <template v-if="activeTab === 'today'">

            <!-- ══ SECTION 3 SLOT WAKTU: PAGI / SIANG / MALAM ══ -->
            <div v-if="mergedTodayPanelItems.length === 0" class="notif-empty">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-sand); margin-bottom:6px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span>Tidak ada agenda hari ini</span>
            </div>

            <!-- ══ SECTION: INGAT HARI INI (item tanpa jam spesifik) ══ -->
            <div v-if="noTimeItems.length > 0" style="margin-bottom:6px; border-radius:10px; overflow:visible; border:1px solid var(--color-sand);">
              <button @click="openSlotNoTime = !openSlotNoTime"
                style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:9px 12px; background:rgba(163,177,138,0.12); border:none; cursor:pointer; font-family:inherit; border-radius:10px;">
                <div style="display:flex; align-items:center; gap:9px;">
                  <div style="width:28px; height:28px; background:var(--color-sage, #A3B18A); border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#fff;">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
                  </div>
                  <div style="text-align:left;">
                    <div style="font-size:11.5px; font-weight:700; color:var(--text-dark); letter-spacing:0.2px;">Ingat Hari Ini</div>
                    <div style="font-size:10px; color:var(--text-muted); margin-top:1px;">Tanpa jam tertentu</div>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span v-if="noTimeItems.length > 0"
                    style="font-size:10px; font-weight:700; padding:1px 7px; border-radius:10px; background:var(--color-sand); color:var(--text-dark);">
                    {{ noTimeItems.length }}
                  </span>
                  <span style="color:var(--text-muted);" :style="{ transform: openSlotNoTime ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.22s', display:'inline-flex' }">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </div>
              </button>
              <transition name="notif-slot-slide">
                <div v-if="openSlotNoTime">
                  <template v-for="slot in [noTimeItems]" :key="'slotNoTime'">
              <template v-for="entry in slot" :key="entry.key">
                <!-- ═ INFO ITEM ═ -->
                <template v-if="entry.kind === 'info'">
                  <div v-if="entry.item.hasTime"
                       class="notif-item notif-item-info notif-item-clickable"
                       style="border-left: 2.5px solid var(--color-terracotta, #D67B52);"
                       @click="handleInfoClick(entry.item)">
                    <div class="notif-item-icon notif-icon-task">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </div>
                    <div class="notif-item-content">
                      <div class="notif-item-title" :style="entry.item.done ? 'text-decoration: line-through; opacity: 0.55;' : ''">{{ entry.item.title }}</div>
                      <div class="notif-item-sub">{{ entry.item.subtitle }}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;">
                      <span class="notif-time-badge">{{ entry.item.time }}</span>
                      <span v-if="entry.item.badge" class="notif-badge" :class="'notif-badge-' + entry.item.badgeColor" style="margin-top:2px;">{{ entry.item.badge }}</span>
                    </div>
                  </div>
                  <div v-else
                       class="notif-item notif-item-info notif-item-clickable"
                       @click="handleInfoClick(entry.item)">
                    <div class="notif-item-icon" :class="'notif-icon-' + entry.item.type">
                      <svg v-if="entry.item.type === 'task'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      <svg v-else-if="entry.item.type === 'content-today'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div class="notif-item-content">
                      <div class="notif-item-title" :style="entry.item.done ? 'text-decoration: line-through; opacity: 0.55;' : ''">{{ entry.item.title }}</div>
                      <div class="notif-item-sub">{{ entry.item.subtitle }}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;">
                      <span v-if="entry.item.badge" class="notif-badge" :class="'notif-badge-' + entry.item.badgeColor">{{ entry.item.badge }}</span>
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-top: 2px;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </div>
                  </div>
                </template>
                <!-- ═ PENGINGAT ITEM ═ -->
                <div v-else
                     class="notif-item notif-item-action"
                     :class="{ 'notif-item-done': entry.item.done, 'notif-item-locked': entry.item.isDzikirWaktu && !entry.item.done && entry.item.dzikirLocked }"
                     :title="entry.item.done ? 'Klik untuk batalkan (tandai belum selesai)' : (entry.item.isDzikirWaktu && entry.item.dzikirLocked ? 'Dzikir untuk waktu ini belum tuntas — klik untuk buka Dzikir Counter' : 'Klik untuk tandai selesai')"
                     @click="handleActionClick(entry.item)">
                  <div class="notif-item-icon" :class="entry.item.done ? 'notif-icon-done' : 'notif-icon-action'" :style="entry.item.isHabit && !entry.item.done ? { backgroundColor: entry.item.color + '22', border: '1.5px solid ' + entry.item.color + '55' } : {}">
                    <svg v-if="entry.item.done" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg v-else-if="entry.item.isDzikirWaktu && entry.item.dzikirLocked" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <svg v-else-if="entry.item.isHabit" viewBox="0 0 24 24" width="14" height="14" fill="none" :stroke="entry.item.color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.07V6a3 3 0 0 1 6 0v.07a3.5 3.5 0 0 1 3.24 5.61A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg>
                    <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div class="notif-item-content">
                    <div class="notif-item-title" :style="entry.item.done ? 'text-decoration: line-through; opacity: 0.55;' : (entry.item.isDzikirWaktu && entry.item.dzikirLocked ? 'opacity: 0.65;' : '')">{{ entry.item.title }}</div>
                    <div class="notif-item-sub" style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
                      <span v-if="entry.item.isDzikirWaktu && !entry.item.done && entry.item.dzikirLocked" style="display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; background: #fef2f2; color: #b91c1c; border: 1px solid #fca5a5;">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Tuntaskan dzikir dulu
                      </span>
                      <span v-else-if="entry.item.isHabit && !entry.item.done" style="display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; background: #f0fdf4; color: #16a34a; border: 1px solid #86efac;">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.07V6a3 3 0 0 1 6 0v.07a3.5 3.5 0 0 1 3.24 5.61A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg>
                        Habit
                      </span>
                      <span v-if="entry.item.isManual && !entry.item.done" style="display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; background: #fefce8; color: #a16207; border: 1px solid #fde68a;">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        {{ manualCategoryLabel(entry.item) }}
                      </span>
                      <span v-if="entry.item.done">Sudah dikerjakan ✓ <span style="opacity:0.6;">· klik untuk batalkan</span></span>
                      <span v-else-if="!(entry.item.isDzikirWaktu && entry.item.dzikirLocked)" style="white-space:pre-wrap;">{{ entry.item.subtitle }}</span>
                    </div>
                  </div>
                  <div class="notif-item-right">
                    <span class="notif-time-badge">{{ entry.item.endTime ? entry.item.time + '–' + entry.item.endTime : entry.item.time }}</span>
                    <svg v-if="entry.item.isDzikirWaktu && !entry.item.done && entry.item.dzikirLocked" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" title="Terkunci — selesaikan dzikir dulu"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <svg v-else-if="!entry.item.done" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);" title="Klik untuk batalkan"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/></svg>
                  </div>
                </div>
              </template>
                  </template>
                </div>
              </transition>
            </div>

            <!-- ══ SLOT: PAGI ══ -->
            <div style="margin-bottom:6px; border-radius:10px; overflow:visible; border:1px solid var(--color-sand);">
              <button @click="openSlotPagi = !openSlotPagi"
                style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:9px 12px; background:rgba(221,161,94,0.08); border:none; cursor:pointer; font-family:inherit; border-radius:10px;">
                <div style="display:flex; align-items:center; gap:9px;">
                  <div style="width:28px; height:28px; background:var(--color-gold, #DDA15E); border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#fff;">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>
                  </div>
                  <div style="text-align:left;">
                    <div style="font-size:11.5px; font-weight:700; color:var(--text-dark); letter-spacing:0.2px;">Pagi</div>
                    <div style="font-size:10px; color:var(--text-muted); margin-top:1px;">00:00 – 11:59</div>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span v-if="slotPagi.length > 0"
                    style="font-size:10px; font-weight:700; padding:1px 7px; border-radius:10px; background:var(--color-sand); color:var(--text-dark);">
                    {{ slotPagi.length }}
                  </span>
                  <span v-else style="font-size:10px; color:var(--text-muted); opacity:0.55;">kosong</span>
                  <span style="color:var(--text-muted);" :style="{ transform: openSlotPagi ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.22s', display:'inline-flex' }">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </div>
              </button>
              <transition name="notif-slot-slide">
                <div v-if="openSlotPagi">
                  <div v-if="slotPagi.length === 0" class="notif-empty" style="padding:12px 0 10px;">
                    <span style="font-size:11.5px; color:var(--text-muted);">Tidak ada agenda</span>
                  </div>
                  <template v-for="slot in [slotPagi]" :key="'slotPagi'">
              <template v-for="entry in slot" :key="entry.key">
                <!-- ═ INFO ITEM ═ -->
                <template v-if="entry.kind === 'info'">
                  <div v-if="entry.item.hasTime"
                       class="notif-item notif-item-info notif-item-clickable"
                       style="border-left: 2.5px solid var(--color-terracotta, #D67B52);"
                       @click="handleInfoClick(entry.item)">
                    <div class="notif-item-icon notif-icon-task">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </div>
                    <div class="notif-item-content">
                      <div class="notif-item-title" :style="entry.item.done ? 'text-decoration: line-through; opacity: 0.55;' : ''">{{ entry.item.title }}</div>
                      <div class="notif-item-sub">{{ entry.item.subtitle }}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;">
                      <span class="notif-time-badge">{{ entry.item.time }}</span>
                      <span v-if="entry.item.badge" class="notif-badge" :class="'notif-badge-' + entry.item.badgeColor" style="margin-top:2px;">{{ entry.item.badge }}</span>
                    </div>
                  </div>
                  <div v-else
                       class="notif-item notif-item-info notif-item-clickable"
                       @click="handleInfoClick(entry.item)">
                    <div class="notif-item-icon" :class="'notif-icon-' + entry.item.type">
                      <svg v-if="entry.item.type === 'task'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      <svg v-else-if="entry.item.type === 'content-today'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div class="notif-item-content">
                      <div class="notif-item-title" :style="entry.item.done ? 'text-decoration: line-through; opacity: 0.55;' : ''">{{ entry.item.title }}</div>
                      <div class="notif-item-sub">{{ entry.item.subtitle }}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;">
                      <span v-if="entry.item.badge" class="notif-badge" :class="'notif-badge-' + entry.item.badgeColor">{{ entry.item.badge }}</span>
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-top: 2px;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </div>
                  </div>
                </template>
                <!-- ═ PENGINGAT ITEM ═ -->
                <div v-else
                     class="notif-item notif-item-action"
                     :class="{ 'notif-item-done': entry.item.done, 'notif-item-locked': entry.item.isDzikirWaktu && !entry.item.done && entry.item.dzikirLocked }"
                     :title="entry.item.done ? 'Klik untuk batalkan (tandai belum selesai)' : (entry.item.isDzikirWaktu && entry.item.dzikirLocked ? 'Dzikir untuk waktu ini belum tuntas — klik untuk buka Dzikir Counter' : 'Klik untuk tandai selesai')"
                     @click="handleActionClick(entry.item)">
                  <div class="notif-item-icon" :class="entry.item.done ? 'notif-icon-done' : 'notif-icon-action'" :style="entry.item.isHabit && !entry.item.done ? { backgroundColor: entry.item.color + '22', border: '1.5px solid ' + entry.item.color + '55' } : {}">
                    <svg v-if="entry.item.done" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg v-else-if="entry.item.isDzikirWaktu && entry.item.dzikirLocked" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <svg v-else-if="entry.item.isHabit" viewBox="0 0 24 24" width="14" height="14" fill="none" :stroke="entry.item.color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.07V6a3 3 0 0 1 6 0v.07a3.5 3.5 0 0 1 3.24 5.61A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg>
                    <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div class="notif-item-content">
                    <div class="notif-item-title" :style="entry.item.done ? 'text-decoration: line-through; opacity: 0.55;' : (entry.item.isDzikirWaktu && entry.item.dzikirLocked ? 'opacity: 0.65;' : '')">{{ entry.item.title }}</div>
                    <div class="notif-item-sub" style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
                      <span v-if="entry.item.isDzikirWaktu && !entry.item.done && entry.item.dzikirLocked" style="display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; background: #fef2f2; color: #b91c1c; border: 1px solid #fca5a5;">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Tuntaskan dzikir dulu
                      </span>
                      <span v-else-if="entry.item.isHabit && !entry.item.done" style="display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; background: #f0fdf4; color: #16a34a; border: 1px solid #86efac;">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.07V6a3 3 0 0 1 6 0v.07a3.5 3.5 0 0 1 3.24 5.61A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg>
                        Habit
                      </span>
                      <span v-if="entry.item.isManual && !entry.item.done" style="display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; background: #fefce8; color: #a16207; border: 1px solid #fde68a;">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        {{ manualCategoryLabel(entry.item) }}
                      </span>
                      <span v-if="entry.item.done">Sudah dikerjakan ✓ <span style="opacity:0.6;">· klik untuk batalkan</span></span>
                      <span v-else-if="!(entry.item.isDzikirWaktu && entry.item.dzikirLocked)" style="white-space:pre-wrap;">{{ entry.item.subtitle }}</span>
                    </div>
                  </div>
                  <div class="notif-item-right">
                    <span class="notif-time-badge">{{ entry.item.endTime ? entry.item.time + '–' + entry.item.endTime : entry.item.time }}</span>
                    <svg v-if="entry.item.isDzikirWaktu && !entry.item.done && entry.item.dzikirLocked" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" title="Terkunci — selesaikan dzikir dulu"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <svg v-else-if="!entry.item.done" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);" title="Klik untuk batalkan"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/></svg>
                  </div>
                </div>
              </template>
                  </template>
                </div>
              </transition>
            </div>
            <!-- ══ SLOT: SIANG ══ -->
            <div style="margin-bottom:6px; border-radius:10px; overflow:visible; border:1px solid var(--color-sand);">
              <button @click="openSlotSiang = !openSlotSiang"
                style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:9px 12px; background:rgba(214,123,82,0.07); border:none; cursor:pointer; font-family:inherit; border-radius:10px;">
                <div style="display:flex; align-items:center; gap:9px;">
                  <div style="width:28px; height:28px; background:var(--color-terracotta, #D67B52); border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#fff;">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                  </div>
                  <div style="text-align:left;">
                    <div style="font-size:11.5px; font-weight:700; color:var(--text-dark); letter-spacing:0.2px;">Siang</div>
                    <div style="font-size:10px; color:var(--text-muted); margin-top:1px;">12:00 – 17:59</div>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span v-if="slotSiang.length > 0"
                    style="font-size:10px; font-weight:700; padding:1px 7px; border-radius:10px; background:var(--color-sand); color:var(--text-dark);">
                    {{ slotSiang.length }}
                  </span>
                  <span v-else style="font-size:10px; color:var(--text-muted); opacity:0.55;">kosong</span>
                  <span style="color:var(--text-muted);" :style="{ transform: openSlotSiang ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.22s', display:'inline-flex' }">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </div>
              </button>
              <transition name="notif-slot-slide">
                <div v-if="openSlotSiang">
                  <div v-if="slotSiang.length === 0" class="notif-empty" style="padding:12px 0 10px;">
                    <span style="font-size:11.5px; color:var(--text-muted);">Tidak ada agenda</span>
                  </div>
                  <template v-for="slot in [slotSiang]" :key="'slotSiang'">
              <template v-for="entry in slot" :key="entry.key">
                <!-- ═ INFO ITEM ═ -->
                <template v-if="entry.kind === 'info'">
                  <div v-if="entry.item.hasTime"
                       class="notif-item notif-item-info notif-item-clickable"
                       style="border-left: 2.5px solid var(--color-terracotta, #D67B52);"
                       @click="handleInfoClick(entry.item)">
                    <div class="notif-item-icon notif-icon-task">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </div>
                    <div class="notif-item-content">
                      <div class="notif-item-title" :style="entry.item.done ? 'text-decoration: line-through; opacity: 0.55;' : ''">{{ entry.item.title }}</div>
                      <div class="notif-item-sub">{{ entry.item.subtitle }}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;">
                      <span class="notif-time-badge">{{ entry.item.time }}</span>
                      <span v-if="entry.item.badge" class="notif-badge" :class="'notif-badge-' + entry.item.badgeColor" style="margin-top:2px;">{{ entry.item.badge }}</span>
                    </div>
                  </div>
                  <div v-else
                       class="notif-item notif-item-info notif-item-clickable"
                       @click="handleInfoClick(entry.item)">
                    <div class="notif-item-icon" :class="'notif-icon-' + entry.item.type">
                      <svg v-if="entry.item.type === 'task'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      <svg v-else-if="entry.item.type === 'content-today'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div class="notif-item-content">
                      <div class="notif-item-title" :style="entry.item.done ? 'text-decoration: line-through; opacity: 0.55;' : ''">{{ entry.item.title }}</div>
                      <div class="notif-item-sub">{{ entry.item.subtitle }}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;">
                      <span v-if="entry.item.badge" class="notif-badge" :class="'notif-badge-' + entry.item.badgeColor">{{ entry.item.badge }}</span>
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-top: 2px;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </div>
                  </div>
                </template>
                <!-- ═ PENGINGAT ITEM ═ -->
                <div v-else
                     class="notif-item notif-item-action"
                     :class="{ 'notif-item-done': entry.item.done, 'notif-item-locked': entry.item.isDzikirWaktu && !entry.item.done && entry.item.dzikirLocked }"
                     :title="entry.item.done ? 'Klik untuk batalkan (tandai belum selesai)' : (entry.item.isDzikirWaktu && entry.item.dzikirLocked ? 'Dzikir untuk waktu ini belum tuntas — klik untuk buka Dzikir Counter' : 'Klik untuk tandai selesai')"
                     @click="handleActionClick(entry.item)">
                  <div class="notif-item-icon" :class="entry.item.done ? 'notif-icon-done' : 'notif-icon-action'" :style="entry.item.isHabit && !entry.item.done ? { backgroundColor: entry.item.color + '22', border: '1.5px solid ' + entry.item.color + '55' } : {}">
                    <svg v-if="entry.item.done" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg v-else-if="entry.item.isDzikirWaktu && entry.item.dzikirLocked" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <svg v-else-if="entry.item.isHabit" viewBox="0 0 24 24" width="14" height="14" fill="none" :stroke="entry.item.color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.07V6a3 3 0 0 1 6 0v.07a3.5 3.5 0 0 1 3.24 5.61A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg>
                    <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div class="notif-item-content">
                    <div class="notif-item-title" :style="entry.item.done ? 'text-decoration: line-through; opacity: 0.55;' : (entry.item.isDzikirWaktu && entry.item.dzikirLocked ? 'opacity: 0.65;' : '')">{{ entry.item.title }}</div>
                    <div class="notif-item-sub" style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
                      <span v-if="entry.item.isDzikirWaktu && !entry.item.done && entry.item.dzikirLocked" style="display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; background: #fef2f2; color: #b91c1c; border: 1px solid #fca5a5;">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Tuntaskan dzikir dulu
                      </span>
                      <span v-else-if="entry.item.isHabit && !entry.item.done" style="display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; background: #f0fdf4; color: #16a34a; border: 1px solid #86efac;">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.07V6a3 3 0 0 1 6 0v.07a3.5 3.5 0 0 1 3.24 5.61A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg>
                        Habit
                      </span>
                      <span v-if="entry.item.isManual && !entry.item.done" style="display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; background: #fefce8; color: #a16207; border: 1px solid #fde68a;">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        {{ manualCategoryLabel(entry.item) }}
                      </span>
                      <span v-if="entry.item.done">Sudah dikerjakan ✓ <span style="opacity:0.6;">· klik untuk batalkan</span></span>
                      <span v-else-if="!(entry.item.isDzikirWaktu && entry.item.dzikirLocked)" style="white-space:pre-wrap;">{{ entry.item.subtitle }}</span>
                    </div>
                  </div>
                  <div class="notif-item-right">
                    <span class="notif-time-badge">{{ entry.item.endTime ? entry.item.time + '–' + entry.item.endTime : entry.item.time }}</span>
                    <svg v-if="entry.item.isDzikirWaktu && !entry.item.done && entry.item.dzikirLocked" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" title="Terkunci — selesaikan dzikir dulu"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <svg v-else-if="!entry.item.done" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);" title="Klik untuk batalkan"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/></svg>
                  </div>
                </div>
              </template>
                  </template>
                </div>
              </transition>
            </div>
            <!-- ══ SLOT: MALAM ══ -->
            <div style="margin-bottom:6px; border-radius:10px; overflow:visible; border:1px solid var(--color-sand);">
              <button @click="openSlotMalam = !openSlotMalam"
                style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:9px 12px; background:rgba(40,54,24,0.05); border:none; cursor:pointer; font-family:inherit; border-radius:10px;">
                <div style="display:flex; align-items:center; gap:9px;">
                  <div style="width:28px; height:28px; background:var(--color-forest, #283618); border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#fff;">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                  </div>
                  <div style="text-align:left;">
                    <div style="font-size:11.5px; font-weight:700; color:var(--text-dark); letter-spacing:0.2px;">Malam</div>
                    <div style="font-size:10px; color:var(--text-muted); margin-top:1px;">18:00 – 23:59</div>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span v-if="slotMalam.length > 0"
                    style="font-size:10px; font-weight:700; padding:1px 7px; border-radius:10px; background:var(--color-sand); color:var(--text-dark);">
                    {{ slotMalam.length }}
                  </span>
                  <span v-else style="font-size:10px; color:var(--text-muted); opacity:0.55;">kosong</span>
                  <span style="color:var(--text-muted);" :style="{ transform: openSlotMalam ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.22s', display:'inline-flex' }">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </div>
              </button>
              <transition name="notif-slot-slide">
                <div v-if="openSlotMalam">
                  <div v-if="slotMalam.length === 0" class="notif-empty" style="padding:12px 0 10px;">
                    <span style="font-size:11.5px; color:var(--text-muted);">Tidak ada agenda</span>
                  </div>
                  <template v-for="slot in [slotMalam]" :key="'slotMalam'">
              <template v-for="entry in slot" :key="entry.key">
                <!-- ═ INFO ITEM ═ -->
                <template v-if="entry.kind === 'info'">
                  <div v-if="entry.item.hasTime"
                       class="notif-item notif-item-info notif-item-clickable"
                       style="border-left: 2.5px solid var(--color-terracotta, #D67B52);"
                       @click="handleInfoClick(entry.item)">
                    <div class="notif-item-icon notif-icon-task">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </div>
                    <div class="notif-item-content">
                      <div class="notif-item-title" :style="entry.item.done ? 'text-decoration: line-through; opacity: 0.55;' : ''">{{ entry.item.title }}</div>
                      <div class="notif-item-sub">{{ entry.item.subtitle }}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;">
                      <span class="notif-time-badge">{{ entry.item.time }}</span>
                      <span v-if="entry.item.badge" class="notif-badge" :class="'notif-badge-' + entry.item.badgeColor" style="margin-top:2px;">{{ entry.item.badge }}</span>
                    </div>
                  </div>
                  <div v-else
                       class="notif-item notif-item-info notif-item-clickable"
                       @click="handleInfoClick(entry.item)">
                    <div class="notif-item-icon" :class="'notif-icon-' + entry.item.type">
                      <svg v-if="entry.item.type === 'task'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      <svg v-else-if="entry.item.type === 'content-today'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div class="notif-item-content">
                      <div class="notif-item-title" :style="entry.item.done ? 'text-decoration: line-through; opacity: 0.55;' : ''">{{ entry.item.title }}</div>
                      <div class="notif-item-sub">{{ entry.item.subtitle }}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;">
                      <span v-if="entry.item.badge" class="notif-badge" :class="'notif-badge-' + entry.item.badgeColor">{{ entry.item.badge }}</span>
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-top: 2px;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </div>
                  </div>
                </template>
                <!-- ═ PENGINGAT ITEM ═ -->
                <div v-else
                     class="notif-item notif-item-action"
                     :class="{ 'notif-item-done': entry.item.done, 'notif-item-locked': entry.item.isDzikirWaktu && !entry.item.done && entry.item.dzikirLocked }"
                     :title="entry.item.done ? 'Klik untuk batalkan (tandai belum selesai)' : (entry.item.isDzikirWaktu && entry.item.dzikirLocked ? 'Dzikir untuk waktu ini belum tuntas — klik untuk buka Dzikir Counter' : 'Klik untuk tandai selesai')"
                     @click="handleActionClick(entry.item)">
                  <div class="notif-item-icon" :class="entry.item.done ? 'notif-icon-done' : 'notif-icon-action'" :style="entry.item.isHabit && !entry.item.done ? { backgroundColor: entry.item.color + '22', border: '1.5px solid ' + entry.item.color + '55' } : {}">
                    <svg v-if="entry.item.done" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg v-else-if="entry.item.isDzikirWaktu && entry.item.dzikirLocked" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <svg v-else-if="entry.item.isHabit" viewBox="0 0 24 24" width="14" height="14" fill="none" :stroke="entry.item.color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.07V6a3 3 0 0 1 6 0v.07a3.5 3.5 0 0 1 3.24 5.61A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg>
                    <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div class="notif-item-content">
                    <div class="notif-item-title" :style="entry.item.done ? 'text-decoration: line-through; opacity: 0.55;' : (entry.item.isDzikirWaktu && entry.item.dzikirLocked ? 'opacity: 0.65;' : '')">{{ entry.item.title }}</div>
                    <div class="notif-item-sub" style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
                      <span v-if="entry.item.isDzikirWaktu && !entry.item.done && entry.item.dzikirLocked" style="display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; background: #fef2f2; color: #b91c1c; border: 1px solid #fca5a5;">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Tuntaskan dzikir dulu
                      </span>
                      <span v-else-if="entry.item.isHabit && !entry.item.done" style="display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; background: #f0fdf4; color: #16a34a; border: 1px solid #86efac;">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.07V6a3 3 0 0 1 6 0v.07a3.5 3.5 0 0 1 3.24 5.61A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg>
                        Habit
                      </span>
                      <span v-if="entry.item.isManual && !entry.item.done" style="display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; background: #fefce8; color: #a16207; border: 1px solid #fde68a;">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        {{ manualCategoryLabel(entry.item) }}
                      </span>
                      <span v-if="entry.item.done">Sudah dikerjakan ✓ <span style="opacity:0.6;">· klik untuk batalkan</span></span>
                      <span v-else-if="!(entry.item.isDzikirWaktu && entry.item.dzikirLocked)" style="white-space:pre-wrap;">{{ entry.item.subtitle }}</span>
                    </div>
                  </div>
                  <div class="notif-item-right">
                    <span class="notif-time-badge">{{ entry.item.endTime ? entry.item.time + '–' + entry.item.endTime : entry.item.time }}</span>
                    <svg v-if="entry.item.isDzikirWaktu && !entry.item.done && entry.item.dzikirLocked" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" title="Terkunci — selesaikan dzikir dulu"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <svg v-else-if="!entry.item.done" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);" title="Klik untuk batalkan"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/></svg>
                  </div>
                </div>
              </template>
                  </template>
                </div>
              </transition>
            </div>
            <!-- Reset completed untuk hari ini -->
            <div v-if="anyDone" style="margin-top: 12px; text-align: center;">
              <button class="notif-reset-btn" @click="resetDoneToday">
                Tandai ulang semua belum selesai
              </button>
            </div>

            <!-- ══ TAMBAH PENGINGAT MANUAL ══ -->
            <div style="margin-top: 18px; border-top: 1.5px dashed var(--color-sand); padding-top: 14px;">
              <button v-if="!showManualForm"
                      @click="showManualForm = true; manualForm.date = manualForm.date || todayStr"
                      class="notif-add-manual-btn">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                Set Pengingat Manual Hari Ini
              </button>

              <!-- Form tambah manual -->
              <transition name="notif-manual-expand">
                <div v-if="showManualForm" class="notif-manual-form">
                  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                    <span style="font-size:12px; font-weight:700; color:var(--text-dark); display:flex; align-items:center; gap:6px;">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-terracotta);"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      Pengingat Manual
                    </span>
                    <button @click="cancelManualForm" style="background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:18px; line-height:1; padding:0;">✕</button>
                  </div>

                  <div style="margin-bottom:8px;">
                    <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Judul Pengingat *</label>
                    <input v-model="manualForm.title"
                           type="text"
                           placeholder="cth., Minum obat, Hubungi klien..."
                           maxlength="60"
                           style="width:100%; padding:7px 10px; border:1.5px solid var(--color-sand); border-radius:7px; font-size:12.5px; color:var(--text-dark); background:#fff; outline:none; box-sizing:border-box;"
                           @keyup.enter="saveManualReminder" />
                  </div>
                  <div style="margin-bottom:8px;">
                    <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Keterangan (opsional)</label>
                    <textarea v-model="manualForm.subtitle"
                           placeholder="Catatan singkat..."
                           maxlength="200"
                           rows="2"
                           style="width:100%; padding:7px 10px; border:1.5px solid var(--color-sand); border-radius:7px; font-size:12px; color:var(--text-dark); background:#fff; outline:none; box-sizing:border-box; resize:vertical; font-family:inherit; line-height:1.5;"></textarea>
                  </div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
                    <div>
                      <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Jam Mulai *</label>
                      <input v-model="manualForm.time"
                             type="time"
                             style="width:100%; padding:7px 10px; border:1.5px solid var(--color-sand); border-radius:7px; font-size:12.5px; color:var(--text-dark); background:#fff; outline:none; box-sizing:border-box;" />
                    </div>
                    <div>
                      <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Jam Selesai</label>
                      <input v-model="manualForm.endTime"
                             type="time"
                             style="width:100%; padding:7px 10px; border:1.5px solid var(--color-sand); border-radius:7px; font-size:12.5px; color:var(--text-dark); background:#fff; outline:none; box-sizing:border-box;" />
                    </div>
                  </div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:4px;">
                    <div>
                      <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Tanggal Mulai *</label>
                      <input v-model="manualForm.date"
                             type="date"
                             style="width:100%; padding:7px 10px; border:1.5px solid var(--color-sand); border-radius:7px; font-size:12.5px; color:var(--text-dark); background:#fff; outline:none; box-sizing:border-box;" />
                    </div>
                    <div>
                      <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Tanggal Selesai</label>
                      <input v-model="manualForm.endDate"
                             type="date" :min="manualForm.date"
                             style="width:100%; padding:7px 10px; border:1.5px solid var(--color-sand); border-radius:7px; font-size:12.5px; color:var(--text-dark); background:#fff; outline:none; box-sizing:border-box;" />
                    </div>
                  </div>
                  <p style="font-size:10.5px; color:var(--text-muted); margin:0 0 12px; line-height:1.5;">
                    Jam Selesai & Tanggal Selesai opsional — kosongkan jika tidak perlu rentang.
                  </p>

                  <!-- ========== ULANGI / RECURRENCE (ala Google Calendar) ========== -->
                  <div style="margin-bottom:12px; position:relative;">
                    <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Ulangi</label>
                    <button type="button" @click="showManualRecurrence = !showManualRecurrence"
                            style="width:100%; text-align:left; cursor:pointer; display:flex; align-items:center; justify-content:space-between; padding:7px 10px; border:1.5px solid var(--color-sand); border-radius:7px; font-size:12.5px; color:var(--text-dark); background:#fff; outline:none; box-sizing:border-box;">
                      <span>{{ manualRecurrenceLabel(manualForm.recurrence, manualForm.date) }}</span>
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :style="{ transform: showManualRecurrence ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div v-if="showManualRecurrence" @click.stop
                      style="position:absolute; top:calc(100% + 4px); left:0; right:0; z-index:50; background:#fff; border:1px solid #dadce0; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.15); overflow:hidden;">
                      <div v-for="opt in ['none','daily','weekly','monthly','yearly','weekday']" :key="opt"
                        @click="manualForm.recurrence = opt; showManualRecurrence = false"
                        :class="{ 'gcal-recurrence-opt-active': manualForm.recurrence === opt }"
                        class="gcal-recurrence-opt">
                        {{ manualRecurrenceLabel(opt, manualForm.date) }}
                      </div>
                    </div>
                  </div>
                  <div style="margin-bottom:12px;">
                    <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Arahkan ke Halaman (opsional)</label>
                    <select v-model="manualForm.page"
                            style="width:100%; padding:7px 10px; border:1.5px solid var(--color-sand); border-radius:7px; font-size:12.5px; color:var(--text-dark); background:#fff; outline:none; box-sizing:border-box; cursor:pointer;">
                      <option value="">— Tidak ada tujuan —</option>
                      <option value="jobLogbook">Job Logbook</option>
                      <option value="calendarMoment">Calendar Moment</option>
                      <option value="contentTracker">Content Tracker</option>
                      <option value="interviewPractice">Interview Practice</option>
                      <option value="dailyNutrition">Daily Nutrition</option>
                      <option value="habitTracker">Habit Tracker</option>
                      <option value="pomodoroTimer">Pomodoro Timer</option>
                      <option value="googleCalendar">Google Calendar</option>
                      <option value="financialTracker">Financial Tracker</option>
                    </select>
                  </div>

                  <div style="margin-bottom:12px;">
                    <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Kategori Pengingat</label>
                    <select v-model="manualForm.category"
                            style="width:100%; padding:7px 10px; border:1.5px solid var(--color-sand); border-radius:7px; font-size:12.5px; color:var(--text-dark); background:#fff; outline:none; box-sizing:border-box; cursor:pointer;">
                      <option value="manual">Pengingat (Default)</option>
                      <option v-for="cat in customReminderCategories" :key="cat.key" :value="cat.key">
                        {{ cat.label }}
                      </option>
                    </select>
                  </div>

                  <div style="display:flex; gap:8px;">
                    <button @click="cancelManualForm"
                            style="flex:1; padding:7px; background:var(--bg-cream); border:1.5px solid var(--color-sand); border-radius:7px; font-size:12px; font-weight:600; color:var(--text-dark); cursor:pointer;">
                      Batal
                    </button>
                    <button @click="saveManualReminder"
                            :disabled="!manualForm.title.trim() || !manualForm.time"
                            style="flex:2; padding:7px; background:var(--color-terracotta,#D67B52); border:none; border-radius:7px; font-size:12px; font-weight:700; color:#fff; cursor:pointer; opacity: (!manualForm.title.trim() || !manualForm.time) ? 0.5 : 1; transition:opacity 0.15s;">
                      Simpan Pengingat
                    </button>
                  </div>
                </div>
              </transition>
            </div>

            </template>

            <!-- ══════════════════════════════
                 TAB: TERLEWAT
            ══════════════════════════════ -->
            <template v-if="activeTab === 'missed'">

              <!-- Empty state -->
              <div v-if="missedLog.length === 0" class="notif-empty" style="padding: 32px 0; flex-direction: column;">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-sand); margin-bottom:8px;"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                <span style="font-size:12.5px; font-weight:700; color:var(--text-dark); margin-bottom:3px;">Semua pengingat sudah dikerjakan! 🎉</span>
                <span style="font-size:11px; color:var(--text-muted);">Tidak ada tugas yang terlewat</span>
              </div>

              <!-- Summary chips -->
              <div v-else style="display:flex; gap:7px; margin-bottom:14px; flex-wrap:wrap;">
                <div class="notif-missed-chip notif-missed-chip-total">
                  <span style="font-size:15px; font-weight:800; line-height:1;">{{ missedLog.length }}</span>
                  <span style="font-size:10px; color:var(--text-muted);">hari terlewat</span>
                </div>
                <div class="notif-missed-chip notif-missed-chip-total">
                  <span style="font-size:15px; font-weight:800; line-height:1;">{{ totalMissedCount }}</span>
                  <span style="font-size:10px; color:var(--text-muted);">total item</span>
                </div>
              </div>

              <!-- Log entries per day -->
              <div v-for="entry in missedLog" :key="entry.date" class="notif-missed-day">
                <div class="notif-missed-day-header" @click="toggleMissedDay(entry.date)">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <div class="notif-missed-dot" :style="{ background: missedSeverityColor(entry.tasks.length) }"></div>
                    <div>
                      <div style="font-size:12.5px; font-weight:700; color:var(--text-dark);">{{ formatMissedDate(entry.date) }}</div>
                      <div style="font-size:11px; color:var(--text-muted);">{{ daysAgo(entry.date) }}</div>
                    </div>
                  </div>
                  <div style="display:flex; align-items:center; gap:7px;">
                    <span class="notif-missed-count" :style="{ background: missedSeverityColor(entry.tasks.length) + '22', color: missedSeverityColor(entry.tasks.length), border: '1.5px solid ' + missedSeverityColor(entry.tasks.length) + '44' }">
                      {{ entry.tasks.length }} item
                    </span>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                         :style="{ transition:'transform 0.2s', transform: expandedMissedDays.includes(entry.date) ? 'rotate(180deg)' : 'rotate(0deg)', color:'var(--text-muted)' }">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                <transition name="notif-missed-expand">
                  <div v-if="expandedMissedDays.includes(entry.date)" class="notif-missed-tasks">
                    <div v-for="task in entry.tasks" :key="task.id" class="notif-missed-task-row"
                         :class="{ 'notif-missed-task-clickable': taskHasPage(task) }"
                         :title="taskHasPage(task) ? 'Klik untuk buka halaman' : ''"
                         @click="handleMissedTaskClick(task)">
                      <div class="notif-missed-task-icon" :class="'notif-missed-icon-' + (task.type || 'reminder')">
                        <svg v-if="task.type === 'habit'" viewBox="0 0 24 24" width="11" height="11" fill="none" :stroke="task.color || 'var(--color-terracotta)'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.07V6a3 3 0 0 1 6 0v.07a3.5 3.5 0 0 1 3.24 5.61A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg>
                        <svg v-else-if="task.type === 'manual'" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        <svg v-else viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      </div>
                      <div style="flex:1; min-width:0;">
                        <div style="font-size:12px; font-weight:700; color:var(--text-dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ task.title }}</div>
                        <div style="font-size:10.5px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ task.subtitle }}</div>
                      </div>
                      <div style="display:flex; align-items:center; gap:5px; flex-shrink:0;">
                        <span style="font-size:10px; font-weight:700; padding:2px 7px; border-radius:7px; background:var(--bg-cream); border:1px solid var(--color-sand); color:var(--text-dark); white-space:nowrap;">{{ task.time }}</span>
                        <svg v-if="taskHasPage(task)" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="var(--color-terracotta)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </div>
                    </div>
                    <!-- Delete day -->
                    <div style="padding: 8px 0 2px; text-align:right;">
                      <button @click.stop="deleteMissedEntry(entry.date)"
                              style="display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:7px; border:1px solid #fecaca; background:#fef2f2; color:#ef4444; font-size:10.5px; font-weight:600; cursor:pointer;">
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        Hapus
                      </button>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- Clear all -->
              <div v-if="missedLog.length > 0" style="margin-top:12px; text-align:center;">
                <button class="notif-reset-btn" @click="clearAllMissed">Hapus semua riwayat</button>
              </div>

            </template>

          </div>
        </div>
      </div>
    </transition>
  `,

  props: {
    show: { type: Boolean, default: false }
  },
  emits: ['close', 'navigate', 'unread-count-changed', 'trigger-habit', 'open-dzikir'],

  data() {
    return {
      todayStr: '',
      plans: [],
      contentItems: [],
      actionStatus: {},
      showManualForm: false,
      showManualRecurrence: false,
      manualForm: { title: '', subtitle: '', date: '', endDate: '', time: '', endTime: '', page: '', category: 'manual', recurrence: 'none' },
      customReminderCategories: (() => {
        try {
          const raw = WorkspaceStorage.getItem('gcal_custom_reminder_categories');
          return raw ? JSON.parse(raw) : [];
        } catch(_e) { return []; }
      })(),
      activeTab: 'today',
      missedLog: [],
      expandedMissedDays: [],
      showPushSettings: false,
      openSlotNoTime: false,
      openSlotPagi: false,
      openSlotSiang: false,
      openSlotMalam: false
    };
  },

  computed: {
    todayLabel() {
      const now = new Date();
      const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    },

    // Section 1: Informational
    infoNotifs() {
      const list = [];

      // Task Plan hari ini — yang sudah Completed tetap ditampilkan (dicoret), tidak dibuang
      const todayPlans = this.plans.filter(p => p.date === this.todayStr);
      todayPlans.forEach(p => {
        const done = p.phase === 'Completed';
        const priorityMap = { High: { badge: 'High', color: 'red' }, Medium: { badge: 'Med', color: 'amber' }, Low: { badge: 'Low', color: 'sage' } };
        const pm = done ? { badge: 'Selesai', color: 'sage' } : (priorityMap[p.priority] || { badge: p.priority, color: 'amber' });
        // Konversi time string "HH:MM" ke menit untuk sorting
        let timeVal = 9999; // task tanpa waktu diletakkan di bawah
        if (p.time) {
          const [hh, mm] = p.time.split(':').map(Number);
          timeVal = hh * 60 + mm;
        }
        list.push({
          id: 'task-' + p.id,
          type: 'task',
          title: p.tasks,
          subtitle: `Task Plan · ${p.category || 'Umum'}${p.requester ? ' · dari ' + p.requester : ''}`,
          badge: pm.badge,
          badgeColor: pm.color,
          page: 'jobLogbook',
          time: p.time ? (p.timeEnd ? p.time + ' – ' + p.timeEnd : p.time) : null,
          timeVal,
          hasTime: !!p.time,
          done
        });
      });

      // Content Plan — dueDate hari ini atau H-1 / H-2
      const today = new Date(this.todayStr);
      this.contentItems.forEach(item => {
        if (!item.dueDate) return;
        const due = new Date(item.dueDate);
        const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
        let badge = null, badgeColor = 'sage', subtitle = '';

        if (diff < 0) {
          badge = 'Terlambat';
          badgeColor = 'red';
          subtitle = `Content · ${item.platform || ''} · Lewat ${Math.abs(diff)} hari`;
        } else if (diff === 0) {
          badge = 'Rilis Hari Ini';
          badgeColor = 'red';
          subtitle = `Content · ${item.platform || ''} · Rilis hari ini!`;
        } else if (diff === 1) {
          badge = 'H-1';
          badgeColor = 'amber';
          subtitle = `Content · ${item.platform || ''} · Besok rilis`;
        } else if (diff === 2) {
          badge = 'H-2';
          badgeColor = 'gold';
          subtitle = `Content · ${item.platform || ''} · 2 hari lagi`;
        } else {
          return; // tidak urgen, skip
        }

        // Konversi Target Jam Rilis "HH:MM" ke menit untuk sorting (kalau diisi)
        let timeVal = 9998;
        if (item.dueTime) {
          const [hh, mm] = item.dueTime.split(':').map(Number);
          timeVal = hh * 60 + mm;
        }

        list.push({
          id: 'content-' + item.id,
          type: 'content-today',
          title: item.title,
          subtitle,
          badge,
          badgeColor,
          page: 'contentTracker',
          time: item.dueTime || null,
          timeVal,
          hasTime: !!item.dueTime
        });
      });

      // Urutkan: yang ada waktu paling pagi dulu, lalu yang tidak ada waktu
      return list.sort((a, b) => a.timeVal - b.timeVal);
    },

    // Section 2: Actionable
    actionNotifs() {
      const status = this.actionStatus[this.todayStr] || {};
      const todayStr = this.todayStr;
      // Kumpulkan habit yang sedang libur hari ini
      let skippedHabitNotifIds = new Set();
      try {
        const raw = WorkspaceStorage.getItem('aesthetic_habit_tracker_habits');
        if (raw) {
          JSON.parse(raw).forEach(h => {
            if (Array.isArray(h.skipDays) && h.skipDays.includes(todayStr)) {
              skippedHabitNotifIds.add('habit_' + h.id);
            }
          });
        }
      } catch(e) {}
      const base = [];
      try {
        const raw = WorkspaceStorage.getItem('ws_habit_notifs');
        if (raw) {
          const habits = JSON.parse(raw);
          // Hitung urutan (0-based) tiap habit Dzikir Waktu berdasarkan timeVal ascending
          const dzikirHabits = habits
            .filter(h => !!h.isDzikirWaktu || h.category === 'Dzikir Waktu')
            .sort((a, b) => (a.timeVal || 0) - (b.timeVal || 0));
          const dzikirIndexMap = {};
          dzikirHabits.forEach((h, i) => { dzikirIndexMap[h.id] = i; });

          habits.forEach(h => {
            // Skip habit yang sedang libur hari ini
            if (skippedHabitNotifIds.has(h.id)) return;
            if (!base.find(b => b.id === h.id)) {
              const isDzikirWaktu = !!h.isDzikirWaktu || h.category === 'Dzikir Waktu';
              const habitIndex = isDzikirWaktu ? (dzikirIndexMap[h.id] ?? 0) : 0;
              base.push({
                id: h.id,
                title: h.title,
                subtitle: h.subtitle || 'Habit harian',
                time: h.time,
                timeVal: h.timeVal,
                page: 'habitTracker',
                done: !!status[h.id],
                isHabit: true,
                color: h.color || 'var(--color-terracotta)',
                isDzikirWaktu,
                habitIndex,
                dzikirLocked: isDzikirWaktu ? !isDzikirReadyForHabit(h.timeVal, habitIndex) : false,
              });
            }
          });
        }
      } catch(e) {}
      // Tambahkan manual reminders hari ini
      try {
        const raw = WorkspaceStorage.getItem('ws_manual_notifs');
        if (raw) {
          const manuals = JSON.parse(raw);
          manuals.filter(m => reminderOccursOnDate(m, this.todayStr)).forEach(m => {
            if (!base.find(b => b.id === m.id)) {
              base.push({
                id: m.id,
                title: m.title,
                subtitle: m.subtitle || 'Pengingat manual',
                time: m.time,
                timeVal: m.timeVal,
                page: m.page || null,
                done: !!status[m.id],
                isHabit: false,
                isManual: true
              });
            }
          });
        }
      } catch(e) {}
      return base.sort((a, b) => a.timeVal - b.timeVal);
    },

    anyDone() {
      return this.actionNotifs.some(n => n.done);
    },

    // Total badge buat bell icon di navbar — hanya hitung yang belum selesai
    totalUnread() {
      const infoCount = this.infoNotifs.filter(n => !n.done).length;
      const undoneCount = this.actionNotifs.filter(n => !n.done).length;
      return infoCount + undoneCount;
    },

    totalMissedCount() {
      return this.missedLog.reduce((s, e) => s + e.tasks.length, 0);
    },

    // ── Gabungan Section Hari Ini: infoNotifs + actionNotifs, urut waktu ──
    // Item tanpa waktu diletakkan paling atas.
    mergedTodayPanelItems() {
      const result = [];

      this.infoNotifs.forEach(notif => {
        const hasTime = notif.hasTime && typeof notif.timeVal === 'number' && notif.timeVal < 9998;
        const timeVal = hasTime ? notif.timeVal : -1;
        result.push({ kind: 'info', key: 'info-' + notif.id, timeVal, item: notif });
      });

      this.actionNotifs.forEach(notif => {
        const timeVal = (typeof notif.timeVal === 'number') ? notif.timeVal : -1;
        result.push({ kind: 'action', key: 'action-' + notif.id, timeVal, item: notif });
      });

      return result.sort((a, b) => a.timeVal - b.timeVal);
    },

    // Item tanpa jam spesifik (timeVal -1) — section "Ingat Hari Ini", dipisah dari slot Pagi
    noTimeItems() {
      return this.mergedTodayPanelItems.filter(e => e.timeVal === -1);
    },
    // Slot Pagi: 00:00–11:59 (timeVal 0–719), item tanpa waktu sudah dipisah ke noTimeItems
    slotPagi() {
      return this.mergedTodayPanelItems.filter(e => e.timeVal >= 0 && e.timeVal < 720);
    },
    // Slot Siang: 12:00–17:59 (timeVal 720–1079)
    slotSiang() {
      return this.mergedTodayPanelItems.filter(e => e.timeVal >= 720 && e.timeVal < 1080);
    },
    // Slot Malam: 18:00–23:59 (timeVal 1080–1439)
    slotMalam() {
      return this.mergedTodayPanelItems.filter(e => e.timeVal >= 1080);
    },
  },

  watch: {
    show(val) {
      if (val) {
        this.loadData();
        this.activeTab = 'today'; // reset ke hari ini tiap kali panel dibuka
      }
    },
    // Emit ke parent setiap kali totalUnread berubah, supaya badge di bell ikut update
    totalUnread(val) {
      this.$emit('unread-count-changed', val);
    }
  },

  mounted() {
    const today = this.getTodayStr();

    // ── Deteksi hari baru: kalau lastSeenDate != hari ini, snapshot missed kemarin ──
    try {
      const lastSeen = WorkspaceStorage.getItem('ws_last_seen_date');
      if (lastSeen && lastSeen !== today) {
        // Snapshot setiap hari yang terlewat sejak lastSeen sampai kemarin
        let cursor = new Date(lastSeen);
        const todayDate = new Date(today);
        while (cursor < todayDate) {
          const ds = cursor.toISOString().slice(0, 10);
          saveMissedTasksSnapshot(ds);
          cursor.setDate(cursor.getDate() + 1);
        }
        window.dispatchEvent(new CustomEvent('snapshot-missed-tasks'));
        this.loadMissedLog();
      }
    } catch(e) {}
    // Selalu update lastSeenDate ke hari ini
    WorkspaceStorage.setItem('ws_last_seen_date', today);

    this.todayStr = today;
    this.loadData();
    this.loadMissedLog();

    // Emit count awal supaya badge langsung benar saat mount
    this.$nextTick(() => {
      this.$emit('unread-count-changed', this.totalUnread);
    });

    // Refresh data setiap menit — deteksi jika tengah malam lewat saat web masih buka
    this._interval = setInterval(() => {
      const newDay = this.getTodayStr();
      if (newDay !== this.todayStr) {
        saveMissedTasksSnapshot(this.todayStr);
        window.dispatchEvent(new CustomEvent('snapshot-missed-tasks'));
        WorkspaceStorage.setItem('ws_last_seen_date', newDay);
      }
      this.todayStr = newDay;
      this.loadData();
    }, 60000);

    // Refresh panel kalau status selesai (ws_notif_action_status) berubah dari
    // luar (Agenda View / Tabel Habit), supaya badge & checklist di panel ikut update.
    this._onNotifStatusUpdated = (e) => {
      if (e && e.detail && e.detail.source === 'notifPanel') return; // hindari refresh diri sendiri
      this.loadData();
    };
    window.addEventListener('ws-notif-status-updated', this._onNotifStatusUpdated);

    // Refresh panel kalau task plan dihapus dari Agenda View (tombol "Hapus" di detail popup)
    // atau pengingat manual diubah, supaya item langsung hilang dari panel tanpa perlu reload.
    this._onJobPlansUpdated = () => { this.loadData(); };
    window.addEventListener('ws-job-plans-updated', this._onJobPlansUpdated);
    window.addEventListener('ws-manual-notif-updated', this._onJobPlansUpdated);

    // Refresh panel begitu sesi Dzikir Counter dituntaskan, supaya gating
    // habit "Dzikir Waktu" langsung terbuka tanpa nunggu polling 60 detik.
    this._onDzikirCompleted = () => { this.loadData(); };
    window.addEventListener('ws-dzikir-completed', this._onDzikirCompleted);

    // Refresh panel saat habit di-liburkan/dibatalkan liburnya hari ini
    this._onHabitSkipChanged = () => { this.loadData(); };
    window.addEventListener('ws-habit-skip-changed', this._onHabitSkipChanged);
  },

  beforeUnmount() {
    clearInterval(this._interval);
    window.removeEventListener('ws-notif-status-updated', this._onNotifStatusUpdated);
    window.removeEventListener('ws-job-plans-updated', this._onJobPlansUpdated);
    window.removeEventListener('ws-manual-notif-updated', this._onJobPlansUpdated);
    window.removeEventListener('ws-dzikir-completed', this._onDzikirCompleted);
    window.removeEventListener('ws-habit-skip-changed', this._onHabitSkipChanged);
  },

  methods: {
    getTodayStr() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },

    loadData() {
      // Task Plans
      try {
        const raw = WorkspaceStorage.getItem('personal_workspace_job_plans');
        this.plans = raw ? JSON.parse(raw) : [];
      } catch(e) { this.plans = []; }

      // Content Items
      try {
        const raw = WorkspaceStorage.getItem('personal_workspace_content_items');
        this.contentItems = raw ? JSON.parse(raw) : [];
      } catch(e) { this.contentItems = []; }

      // Action Status — pakai WorkspaceStorage biar cross-device
      try {
        const raw = WorkspaceStorage.getItem('ws_notif_action_status');
        this.actionStatus = raw ? JSON.parse(raw) : {};
      } catch(e) { this.actionStatus = {}; }

      // Force re-compute actionNotifs (habits from ws_habit_notifs dibaca langsung di computed)
      this.actionStatus = { ...this.actionStatus };

      // Emit count terbaru setelah load
      this.$nextTick(() => {
        this.$emit('unread-count-changed', this.totalUnread);
      });
    },

    handleInfoClick(notif) {
      if (notif.page) {
        this.$emit('navigate', notif.page);
        this.$emit('close');
      }
    },

    handleActionClick(notif) {
      if (notif.done) {
        this.undoActionClick(notif);
        return;
      }
      // Gerbang khusus habit "Dzikir Waktu": kalau dzikir sesi ini belum tuntas,
      // jangan biarkan ditandai selesai — total locked, sesuai instruksi.
      if (notif.isHabit && notif.isDzikirWaktu && notif.dzikirLocked) {
        this.openDzikirCounter();
        return;
      }
      // Play suara checklist dulu
      NotifSound.playCheck();
      // Tandai selesai di notif status
      if (!this.actionStatus[this.todayStr]) {
        this.actionStatus[this.todayStr] = {};
      }
      this.actionStatus[this.todayStr][notif.id] = true;
      WorkspaceStorage.setItem('ws_notif_action_status', JSON.stringify(this.actionStatus));

      // Kalau ini adalah habit → centang juga di habit tracker
      if (notif.isHabit) {
        try {
          const habitId = notif.id.replace(/^habit_/, '');
          const raw = WorkspaceStorage.getItem('aesthetic_habit_tracker_habits');
          if (raw) {
            const habits = JSON.parse(raw);
            const today = new Date();
            const ym = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
            const day = today.getDate();
            const updated = habits.map(h => {
              if (h.id !== habitId) return h;
              const hist = { ...h.history };
              const arr = hist[ym] ? [...hist[ym]] : [];
              if (!arr.includes(day)) arr.push(day);
              hist[ym] = arr.sort((a, b) => a - b);
              return { ...h, history: hist };
            });
            WorkspaceStorage.setItem('aesthetic_habit_tracker_habits', JSON.stringify(updated));
            // Beri tahu Tabel Habit (kalau sedang aktif) untuk reload data
            window.dispatchEvent(new CustomEvent('ws-plans-updated'));
          }
        } catch(e) {}
      }

      // Beri tahu Agenda View (Google Calendar) bahwa status selesai berubah,
      // supaya block di agenda view ikut update tanpa perlu reload halaman.
      window.dispatchEvent(new CustomEvent('ws-notif-status-updated', {
        detail: { date: this.todayStr, id: notif.id, done: true, source: 'notifPanel' }
      }));

      // Emit count terbaru supaya badge langsung berkurang
      this.$nextTick(() => {
        this.$emit('unread-count-changed', this.totalUnread);
      });

      // Kalau habit → navigate ke habitTracker + trigger animasi otomatis di tabel
      if (notif.isHabit) {
        const habitId = notif.id.replace(/^habit_/, '');
        this.$emit('navigate', 'habitTracker');
        this.$emit('trigger-habit', habitId);
        this.$emit('close');
        return;
      }

      // Navigasi ke halaman (skip kalau null, misal tahajud)
      if (notif.page) this.$emit('navigate', notif.page);
      this.$emit('close');
    },

    // ── Buka Dzikir Counter — dipanggil saat item "Dzikir Waktu" masih terkunci ──
    // Tidak menandai selesai apa pun, cuma mengarahkan user untuk menuntaskan dzikirnya dulu.
    openDzikirCounter() {
      this.$emit('open-dzikir');
      this.$emit('close');
    },

    // ── Batalkan tandai selesai (misal salah klik notifikasi) ──
    // Tidak navigate / tidak close panel, supaya user bisa langsung klik item yang benar.
    undoActionClick(notif) {
      NotifSound.playCheck();
      if (this.actionStatus[this.todayStr]) {
        delete this.actionStatus[this.todayStr][notif.id];
        WorkspaceStorage.setItem('ws_notif_action_status', JSON.stringify(this.actionStatus));
      }

      // Kalau ini habit → hapus juga centangan hari ini di histori habit tracker
      if (notif.isHabit) {
        try {
          const habitId = notif.id.replace(/^habit_/, '');
          const raw = WorkspaceStorage.getItem('aesthetic_habit_tracker_habits');
          if (raw) {
            const habits = JSON.parse(raw);
            const today = new Date();
            const ym = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
            const day = today.getDate();
            const updated = habits.map(h => {
              if (h.id !== habitId) return h;
              const hist = { ...h.history };
              hist[ym] = (hist[ym] || []).filter(d => d !== day);
              return { ...h, history: hist };
            });
            WorkspaceStorage.setItem('aesthetic_habit_tracker_habits', JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('ws-plans-updated'));
          }
        } catch(e) {}
      }

      // Beri tahu Agenda View (Google Calendar) bahwa status berubah lagi
      window.dispatchEvent(new CustomEvent('ws-notif-status-updated', {
        detail: { date: this.todayStr, id: notif.id, done: false, source: 'notifPanel' }
      }));

      // Emit count terbaru supaya badge bertambah lagi
      this.$nextTick(() => {
        this.$emit('unread-count-changed', this.totalUnread);
      });
    },

    resetDoneToday() {
      if (this.actionStatus[this.todayStr]) {
        this.actionStatus[this.todayStr] = {};
        WorkspaceStorage.setItem('ws_notif_action_status', JSON.stringify(this.actionStatus));
        // Emit count setelah reset
        this.$nextTick(() => {
          this.$emit('unread-count-changed', this.totalUnread);
        });
      }
    },

    cancelManualForm() {
      this.showManualForm = false;
      this.showManualRecurrence = false;
      this.manualForm = { title: '', subtitle: '', date: '', endDate: '', time: '', endTime: '', page: '', category: 'manual', recurrence: 'none' };
    },

    manualRecurrenceLabel(rec, dateStr) {
      const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      let dayName = '', dateNum = '', monthName = '';
      try {
        const d = new Date((dateStr || this.todayStr) + 'T00:00:00');
        dayName = dayNames[d.getDay()];
        dateNum = d.getDate();
        const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        monthName = monthNames[d.getMonth()];
      } catch(_e) {}
      const map = {
        none:    'Tidak berulang',
        daily:   'Setiap hari',
        weekly:  'Setiap ' + dayName,
        monthly: 'Setiap tanggal ' + dateNum,
        yearly:  'Setiap tahun, ' + dateNum + ' ' + monthName,
        weekday: 'Setiap hari kerja (Senin–Jumat)',
        custom:  'Sesuaikan...',
      };
      return map[rec] || map.none;
    },

    manualCategoryLabel(item) {
      const cat = item.category || 'manual';
      if (cat === 'manual') return 'edit by n';
      const found = this.customReminderCategories.find(c => c.key === cat);
      return found ? found.label : 'edit by n';
    },

    deleteManualReminder(id) {
      try {
        const raw = WorkspaceStorage.getItem('ws_manual_notifs');
        let manuals = raw ? JSON.parse(raw) : [];
        manuals = manuals.filter(m => m.id !== id);
        WorkspaceStorage.setItem('ws_manual_notifs', JSON.stringify(manuals));
        this.loadData();
        this.$nextTick(() => {
          this.$emit('unread-count-changed', this.totalUnread);
        });
      } catch(e) {}
    },

    goToCalendar() {
      this.$emit('navigate', 'googleCalendar');
      this.$emit('close');
    },

    loadMissedLog() {
      try {
        const raw = WorkspaceStorage.getItem('ws_missed_tasks');
        this.missedLog = raw ? JSON.parse(raw) : [];
      } catch(e) { this.missedLog = []; }
    },

    toggleMissedDay(date) {
      const i = this.expandedMissedDays.indexOf(date);
      if (i === -1) this.expandedMissedDays.push(date);
      else this.expandedMissedDays.splice(i, 1);
    },

    deleteMissedEntry(date) {
      this.missedLog = this.missedLog.filter(e => e.date !== date);
      WorkspaceStorage.setItem('ws_missed_tasks', JSON.stringify(this.missedLog));
      this.expandedMissedDays = this.expandedMissedDays.filter(d => d !== date);
    },

    clearAllMissed() {
      this.missedLog = [];
      WorkspaceStorage.setItem('ws_missed_tasks', JSON.stringify([]));
      this.expandedMissedDays = [];
    },

    taskHasPage(task) {
      if (task.type === 'habit') return true;
      if (task.type === 'manual') return true;
      return !!task.page;
    },

    handleMissedTaskClick(task) {
      if (task.type === 'habit') {
        const habitId = task.id.replace(/^habit_/, '');
        this.$emit('navigate', 'habitTracker');
        this.$emit('trigger-habit', habitId);
        this.$emit('close');
        return;
      }
      if (task.type === 'manual') {
        // Buka panel hari ini + tampilkan form reschedule
        this.activeTab = 'today';
        this.showManualForm = true;
        // Pre-fill dengan data task terlewat
        this.manualForm = {
          title: task.title,
          subtitle: task.subtitle || '',
          date: this.todayStr,
          endDate: '',
          time: task.time || '',
          endTime: task.endTime || '',
          page: task.page || '',
          category: task.category || 'manual',
          recurrence: 'none'
        };
        return;
      }
      // reminder
      const page = task.page;
      if (page) {
        this.$emit('navigate', page);
        this.$emit('close');
      }
    },

    formatMissedDate(dateStr) {
      try {
        const d = new Date(dateStr);
        const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
        const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      } catch(e) { return dateStr; }
    },

    daysAgo(dateStr) {
      try {
        const today = new Date(); today.setHours(0,0,0,0);
        const d = new Date(dateStr); d.setHours(0,0,0,0);
        const diff = Math.round((today - d) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Hari ini';
        if (diff === 1) return 'Kemarin';
        return `${diff} hari lalu`;
      } catch(e) { return ''; }
    },

    missedSeverityColor(count) {
      if (count >= 4) return '#ef4444';
      if (count >= 2) return '#f59e0b';
      return '#10b981';
    },

    saveManualReminder() {
      if (!this.manualForm.title.trim() || !this.manualForm.time) return;
      const [hh, mm] = this.manualForm.time.split(':').map(Number);
      let endTimeVal = null;
      if (this.manualForm.endTime) {
        const [eh, em] = this.manualForm.endTime.split(':').map(Number);
        endTimeVal = eh * 60 + (em || 0);
      }
      const id = 'manual_' + Date.now();
      // Baca existing manual reminders dari storage
      let manuals = [];
      try {
        const raw = WorkspaceStorage.getItem('ws_manual_notifs');
        manuals = raw ? JSON.parse(raw) : [];
      } catch(e) { manuals = []; }
      // Pengingat berlaku mulai tanggal yang dipilih (default hari ini)
      const startDate = this.manualForm.date || this.todayStr;
      manuals.push({
        id,
        date: startDate,
        endDate: this.manualForm.endDate || null,
        title: this.manualForm.title.trim(),
        subtitle: this.manualForm.subtitle.trim() || 'Pengingat manual',
        time: this.manualForm.time,
        timeVal: hh * 60 + (mm || 0),
        endTime: this.manualForm.endTime || null,
        endTimeVal,
        page: this.manualForm.page || null,
        category: this.manualForm.category || 'manual',
        recurrence: this.manualForm.recurrence || 'none',
        isHabit: false,
        isManual: true
      });
      WorkspaceStorage.setItem('ws_manual_notifs', JSON.stringify(manuals));
      // Reload data supaya item baru langsung muncul
      this.loadData();
      this.cancelManualForm();
      NotifSound.playCheck();
      this.$nextTick(() => {
        this.$emit('unread-count-changed', this.totalUnread);
      });
    }
  }
};


// ============================================================================
// MISSED TASKS PAGE — Full page view untuk riwayat pengingat terlewat
// ============================================================================
const MissedTasksPage = {
  template: `
    <div class="page-module" style="max-width: 680px; margin: 0 auto; padding: 0 16px 48px;">

      <!-- Page Header -->
      <div style="margin-bottom: 28px; padding-top: 8px;">
        <h2 style="margin: 0 0 4px;">Tugas Terlewat</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin: 0;">
          Riwayat pengingat yang belum sempat dikerjakan
        </p>
      </div>

      <!-- Summary chips -->
      <div v-if="missedLog.length > 0" style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
        <div class="notif-missed-chip notif-missed-chip-total">
          <span style="font-size:18px; font-weight:800; line-height:1; color:var(--text-dark);">{{ missedLog.length }}</span>
          <span style="font-size:11px; color:var(--text-muted);">hari terlewat</span>
        </div>
        <div class="notif-missed-chip notif-missed-chip-total">
          <span style="font-size:18px; font-weight:800; line-height:1; color:var(--text-dark);">{{ totalMissedCount }}</span>
          <span style="font-size:11px; color:var(--text-muted);">total item</span>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="missedLog.length === 0"
           style="display:flex; flex-direction:column; align-items:center; justify-content:center;
                  padding: 64px 24px; background:#fff; border:1.5px solid var(--color-sand);
                  border-radius:16px; text-align:center;">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor"
             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
             style="color:var(--color-sand); margin-bottom:12px;">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <div style="font-size:15px; font-weight:700; color:var(--text-dark); margin-bottom:6px;">
          Semua bersih! 🎉
        </div>
        <div style="font-size:13px; color:var(--text-muted);">
          Tidak ada tugas yang terlewat. Keren banget!
        </div>
      </div>

      <!-- Log entries per day -->
      <div v-for="entry in missedLog" :key="entry.date" class="notif-missed-day" style="margin-bottom:10px;">
        <div class="notif-missed-day-header" @click="toggleDay(entry.date)">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="notif-missed-dot" :style="{ background: severityColor(entry.tasks.length) }"></div>
            <div>
              <div style="font-size:13px; font-weight:700; color:var(--text-dark);">{{ formatDate(entry.date) }}</div>
              <div style="font-size:11.5px; color:var(--text-muted);">{{ daysAgo(entry.date) }}</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="notif-missed-count"
                  :style="{ background: severityColor(entry.tasks.length) + '22',
                             color: severityColor(entry.tasks.length),
                             border: '1.5px solid ' + severityColor(entry.tasks.length) + '44' }">
              {{ entry.tasks.length }} item
            </span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
                 stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                 :style="{ transition:'transform 0.2s', transform: expandedDays.includes(entry.date) ? 'rotate(180deg)' : 'rotate(0deg)', color:'var(--text-muted)' }">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        <transition name="notif-missed-expand">
          <div v-if="expandedDays.includes(entry.date)" class="notif-missed-tasks">
            <div v-for="task in entry.tasks" :key="task.id" class="notif-missed-task-row"
                 :class="{ 'notif-missed-task-clickable': taskHasAction(task) }"
                 :title="taskActionLabel(task)"
                 @click="handleTaskClick(task)">
              <div class="notif-missed-task-icon" :class="'notif-missed-icon-' + (task.type || 'reminder')">
                <svg v-if="task.type === 'habit'" viewBox="0 0 24 24" width="12" height="12" fill="none"
                     :stroke="task.color || 'var(--color-terracotta)'" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.07V6a3 3 0 0 1 6 0v.07a3.5 3.5 0 0 1 3.24 5.61A4 4 0 0 1 16 19Z"/>
                  <path d="M12 19v3"/>
                </svg>
                <svg v-else-if="task.type === 'manual'" viewBox="0 0 24 24" width="12" height="12" fill="none"
                     stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="12" height="12" fill="none"
                     stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div style="flex:1; min-width:0;">
                <div style="font-size:13px; font-weight:700; color:var(--text-dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  {{ task.title }}
                </div>
                <div style="font-size:11px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  {{ task.subtitle }}
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <span style="font-size:11px; font-weight:700; padding:2px 8px; border-radius:8px;
                             background:var(--bg-cream); border:1px solid var(--color-sand);
                             color:var(--text-dark); white-space:nowrap;">
                  {{ task.endTime ? task.time + '–' + task.endTime : task.time }}
                </span>
                <!-- Action hint -->
                <span v-if="task.type === 'manual'"
                      style="font-size:10px; font-weight:600; padding:2px 7px; border-radius:7px;
                             background: rgba(214,123,82,0.1); border:1px solid rgba(214,123,82,0.3);
                             color:var(--color-terracotta); white-space:nowrap; cursor:pointer;">
                  Jadwal ulang
                </span>
                <svg v-else-if="taskHasAction(task)" viewBox="0 0 24 24" width="12" height="12" fill="none"
                     stroke="var(--color-terracotta)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            </div>

            <!-- Delete button -->
            <div style="padding:8px 0 2px; text-align:right;">
              <button @click.stop="deleteEntry(entry.date)"
                      style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px;
                             border-radius:8px; border:1px solid #fecaca; background:#fef2f2;
                             color:#ef4444; font-size:11px; font-weight:600; cursor:pointer;">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor"
                     stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
                Hapus hari ini
              </button>
            </div>
          </div>
        </transition>
      </div>

      <!-- Clear all -->
      <div v-if="missedLog.length > 0" style="margin-top:16px; text-align:center;">
        <button @click="clearAll"
                style="display:inline-flex; align-items:center; gap:6px; padding:9px 20px;
                       border-radius:10px; border:1.5px solid #fecaca; background:#fff;
                       color:#ef4444; font-size:13px; font-weight:600; cursor:pointer;
                       transition: background 0.15s;"
                onmouseover="this.style.background='#fef2f2'"
                onmouseout="this.style.background='#fff'">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
          Hapus semua riwayat
        </button>
      </div>

      <!-- RESCHEDULE MODAL (untuk task manual) -->
      <transition name="insight-modal-fade">
        <div v-if="showReschedule"
             style="position:fixed; inset:0; z-index:99999; display:flex; align-items:center; justify-content:center; background:rgba(30,22,16,0.45); backdrop-filter:blur(4px); padding:16px;"
             @click.self="showReschedule = false">
          <div style="background:var(--color-paper,#FAF7F2); width:min(400px,95vw); border-radius:18px; box-shadow:0 24px 64px rgba(0,0,0,0.28); overflow:hidden; animation: insightPopIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <!-- Modal header -->
            <div style="display:flex; align-items:center; gap:12px; padding:16px 20px 13px; background:var(--color-terracotta,#D67B52); color:#fff;">
              <div style="width:36px; height:36px; background:rgba(255,255,255,0.2); border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div style="flex:1; min-width:0;">
                <div style="font-size:14px; font-weight:800;">Jadwal Ulang Pengingat</div>
                <div style="font-size:11px; opacity:0.82; margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ rescheduleTask ? rescheduleTask.title : '' }}</div>
              </div>
              <button @click="showReschedule = false"
                style="background:rgba(255,255,255,0.18); border:none; border-radius:8px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#fff; font-size:16px; flex-shrink:0;"
                onmouseover="this.style.background='rgba(255,255,255,0.32)'" onmouseout="this.style.background='rgba(255,255,255,0.18)'">✕</button>
            </div>
            <!-- Modal body -->
            <div style="padding:18px 20px 20px;">
              <p style="font-size:12px; color:var(--text-muted); margin:0 0 14px;">
                Pengingat <strong style="color:var(--text-dark);">{{ rescheduleTask ? rescheduleTask.title : '' }}</strong> akan dijadwalkan ulang ke hari & waktu baru.
              </p>
              <div style="margin-bottom:10px;">
                <label style="font-size:11.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em; display:block; margin-bottom:5px;">Tanggal Baru</label>
                <input v-model="rescheduleDate" type="date"
                       style="width:100%; padding:8px 12px; border:1.5px solid var(--color-sand); border-radius:8px; font-size:13px; color:var(--text-dark); background:#fff; outline:none; box-sizing:border-box;" />
              </div>
              <div style="margin-bottom:16px;">
                <label style="font-size:11.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em; display:block; margin-bottom:5px;">Jam Baru</label>
                <input v-model="rescheduleTime" type="time"
                       style="width:100%; padding:8px 12px; border:1.5px solid var(--color-sand); border-radius:8px; font-size:13px; color:var(--text-dark); background:#fff; outline:none; box-sizing:border-box;" />
              </div>
              <div style="display:flex; gap:8px;">
                <button @click="showReschedule = false"
                        style="flex:1; padding:9px; background:transparent; border:1.5px solid var(--color-sand); border-radius:8px; font-size:13px; font-weight:600; color:var(--text-muted); cursor:pointer;">
                  Batal
                </button>
                <button @click="confirmReschedule"
                        :disabled="!rescheduleDate || !rescheduleTime"
                        style="flex:2; padding:9px; background:var(--color-terracotta,#D67B52); border:none; border-radius:8px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;"
                        :style="{ opacity: (!rescheduleDate || !rescheduleTime) ? 0.5 : 1 }">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Simpan Jadwal Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  `,

  data() {
    return {
      missedLog: [],
      expandedDays: [],
      showReschedule: false,
      rescheduleTask: null,
      rescheduleDate: '',
      rescheduleTime: ''
    };
  },

  computed: {
    totalMissedCount() {
      return this.missedLog.reduce((s, e) => s + e.tasks.length, 0);
    }
  },

  mounted() {
    this.loadData();
    // Refresh saat ada snapshot baru dari NotificationPanel
    window.addEventListener('snapshot-missed-tasks', this.loadData);
  },

  beforeUnmount() {
    window.removeEventListener('snapshot-missed-tasks', this.loadData);
  },

  methods: {
    loadData() {
      try {
        const raw = WorkspaceStorage.getItem('ws_missed_tasks');
        this.missedLog = raw ? JSON.parse(raw) : [];
      } catch(e) { this.missedLog = []; }
    },

    toggleDay(date) {
      const i = this.expandedDays.indexOf(date);
      if (i === -1) this.expandedDays.push(date);
      else this.expandedDays.splice(i, 1);
    },

    deleteEntry(date) {
      this.missedLog = this.missedLog.filter(e => e.date !== date);
      WorkspaceStorage.setItem('ws_missed_tasks', JSON.stringify(this.missedLog));
      this.expandedDays = this.expandedDays.filter(d => d !== date);
    },

    clearAll() {
      this.missedLog = [];
      WorkspaceStorage.setItem('ws_missed_tasks', JSON.stringify([]));
      this.expandedDays = [];
    },

    taskHasAction(task) {
      if (task.type === 'habit') return true;
      if (task.type === 'manual') return true;
      return !!task.page;
    },

    taskActionLabel(task) {
      if (task.type === 'habit') return 'Klik untuk buka Habit Tracker';
      if (task.type === 'manual') return 'Klik untuk jadwal ulang';
      return task.page ? 'Klik untuk buka halaman' : '';
    },

    handleTaskClick(task) {
      if (task.type === 'manual') {
        this.rescheduleTask = task;
        // Default: hari ini, jam yang sama
        const today = new Date();
        this.rescheduleDate = today.toISOString().split('T')[0];
        this.rescheduleTime = task.time || '';
        this.showReschedule = true;
        return;
      }
      if (task.type === 'habit') {
        // Navigasi ke halaman habitTracker via event global
        window.dispatchEvent(new CustomEvent('ws-navigate', { detail: { page: 'habitTracker' } }));
        return;
      }
      // reminder → navigate
      const page = task.page;
      if (page) {
        window.dispatchEvent(new CustomEvent('ws-navigate', { detail: { page } }));
      }
    },

    confirmReschedule() {
      if (!this.rescheduleTask || !this.rescheduleDate || !this.rescheduleTime) return;
      try {
        const raw = WorkspaceStorage.getItem('ws_manual_notifs');
        let manuals = raw ? JSON.parse(raw) : [];
        // Hapus entri lama dengan id yang sama (jika ada)
        const oldEntry = manuals.find(m => m.id === this.rescheduleTask.id);
        manuals = manuals.filter(m => m.id !== this.rescheduleTask.id);
        // Hitung timeVal baru
        const [hh, mm] = this.rescheduleTime.split(':').map(Number);
        const timeVal = hh * 60 + (mm || 0);
        // Tambah jadwal baru — pertahankan semua field asli (recurrence, category, endTime, page, dll)
        const newId = 'manual_' + Date.now();
        manuals.push({
          ...(oldEntry || {}),           // salin semua field asli jika ada
          id: newId,
          title: this.rescheduleTask.title,
          subtitle: this.rescheduleTask.subtitle || 'Pengingat manual',
          time: this.rescheduleTime,
          timeVal,
          date: this.rescheduleDate,
          endDate: null,                 // jadwal ulang: reset endDate agar berlaku mulai hari itu
          recurrence: 'none',            // jadwal ulang: jangan ulang otomatis, biarkan user set manual
          excludedDates: [],
          isManual: true,
          isHabit: false,
        });
        WorkspaceStorage.setItem('ws_manual_notifs', JSON.stringify(manuals));
        // Dispatch event agar NotificationPanel reload
        window.dispatchEvent(new CustomEvent('ws-manual-notif-updated'));
        alert(`✓ Pengingat "${this.rescheduleTask.title}" dijadwalkan ulang ke ${this.rescheduleDate} pukul ${this.rescheduleTime}`);
      } catch(e) {}
      this.showReschedule = false;
      this.rescheduleTask = null;
    },

    formatDate(dateStr) {
      try {
        const d = new Date(dateStr);
        const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
        const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      } catch(e) { return dateStr; }
    },

    daysAgo(dateStr) {
      try {
        const today = new Date(); today.setHours(0,0,0,0);
        const d = new Date(dateStr); d.setHours(0,0,0,0);
        const diff = Math.round((today - d) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Hari ini';
        if (diff === 1) return 'Kemarin';
        return `${diff} hari lalu`;
      } catch(e) { return ''; }
    },

    severityColor(count) {
      if (count >= 4) return '#ef4444';
      if (count >= 2) return '#f59e0b';
      return '#10b981';
    }
  }
};


// ============================================================================
// QuranNoonPopup — Pop up otomatis jam 12 siang, 1 ayat Al-Qur'an acak setiap hari
// ============================================================================
//   • Muncul tepat jam 12:00 (atau saat web dibuka setelah jam 12 & belum tampil hari itu)
//   • Ayat acak (1 dari 6236 ayat), tampil: Arab + terjemahan Inggris + Indonesia
//   • Tombol "Sudah Saya Ingat" → tutup popup, tidak muncul lagi hari itu
//   • Tombol "Baca Surah Ini" → buka Quran Reader langsung ke surah terkait
//   Storage: WorkspaceStorage
//     ws_quran_noon_shown → { "YYYY-MM-DD": true }
// ============================================================================
const QuranNoonPopup = {
  template: `
    <transition name="quran-noon-fade">
      <div v-if="visible" class="quran-noon-overlay" @click.self="dismissSoft">
        <div class="quran-noon-card">

          <!-- ── Header ── -->
          <div class="quran-noon-header">
            <div class="quran-noon-header-icon">☽</div>
            <div style="flex:1; min-width:0;">
              <div class="quran-noon-title">Tadabbur Siang</div>
              <div class="quran-noon-date">{{ todayLabel }}</div>
            </div>
          </div>

          <!-- ── Body ── -->
          <div class="quran-noon-body">

            <div v-if="loading" class="quran-noon-loading">
              <div class="quran-noon-spinner"></div>
              <span>Memuat ayat...</span>
            </div>

            <div v-else-if="error" class="quran-noon-error">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Gagal memuat ayat. Periksa koneksi internet.</span>
              <button class="quran-noon-retry-btn" @click="_fetchRandomAyah">Coba lagi</button>
            </div>

            <template v-else-if="ayah">
              <div class="quran-noon-surah-label">
                QS. {{ ayah.surahNameLatin }} ({{ ayah.surahNameAr }}) : {{ ayah.ayahNoInSurah }}
              </div>
              <div class="quran-noon-arabic" dir="rtl">{{ ayah.arabic }}</div>

              <div class="quran-noon-trans-block">
                <div class="quran-noon-trans-label">🇬🇧 English</div>
                <div class="quran-noon-trans-text">{{ ayah.english }}</div>
              </div>
              <div class="quran-noon-trans-block">
                <div class="quran-noon-trans-label">🇮🇩 Indonesia</div>
                <div class="quran-noon-trans-text">{{ ayah.indo }}</div>
              </div>
            </template>

          </div>

          <!-- ── Footer ── -->
          <div class="quran-noon-footer" v-if="!loading">
            <button v-if="ayah && !error" class="quran-noon-btn-secondary" @click="openInReader">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              Baca Surah Ini
            </button>
            <button class="quran-noon-btn-primary" @click="markRemembered">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Sudah Saya Ingat
            </button>
          </div>

        </div>
      </div>
    </transition>
  `,

  emits: ['open-quran'],

  data() {
    return {
      visible: false,
      loading: false,
      error: false,
      ayah: null,
      todayStr: '',
      _interval: null
    };
  },

  computed: {
    todayLabel() {
      const now = new Date();
      const days   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }
  },

  mounted() {
    this.todayStr = this._getTodayStr();
    // Cek saat web dibuka (delay 1.2s biar WorkspaceStorage selesai init) — catch-up kalau sudah lewat jam 12
    setTimeout(() => this._checkTime(), 1200);
    // Polling setiap 30 detik untuk menangkap tepat jam 12:00 saat web sedang terbuka
    this._interval = setInterval(() => this._checkTime(), 30000);
  },

  beforeUnmount() {
    clearInterval(this._interval);
  },

  methods: {
    _getTodayStr() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },

    _getShownLog() {
      try { return JSON.parse(WorkspaceStorage.getItem('ws_quran_noon_shown') || '{}'); }
      catch(e) { return {}; }
    },

    _isShownToday() {
      return !!this._getShownLog()[this.todayStr];
    },

    _markShownToday() {
      const log = this._getShownLog();
      log[this.todayStr] = true;
      WorkspaceStorage.setItem('ws_quran_noon_shown', JSON.stringify(log));
    },

    // ── Cek apakah sudah jam 12 siang & belum tampil hari ini ──
    _checkTime() {
      if (this.visible) return;
      this.todayStr = this._getTodayStr();
      if (this._isShownToday()) return;

      const now    = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      if (nowMin >= 12 * 60) {  // jam 12:00 siang sudah tercapai (atau terlewat saat web baru dibuka)
        this._markShownToday();
        this.visible = true;
        this._fetchRandomAyah();
        this._triggerBellShake();
        NotifSound.playNotifSafe();
      }
    },

    _triggerBellShake() {
      const bells = document.querySelectorAll('.desk-notif-float-btn, .ws-notif-btn');
      bells.forEach(btn => {
        btn.classList.remove('bell-has-notif');
        void btn.offsetWidth;
        btn.classList.add('bell-has-notif');
        setTimeout(() => btn.classList.remove('bell-has-notif'), 4000);
      });
    },

    // ── Ambil 1 ayat acak (dari total 6236 ayat dalam Al-Qur'an) ──
    async _fetchRandomAyah() {
      this.loading = true;
      this.error   = false;
      this.ayah    = null;
      try {
        const num  = Math.floor(Math.random() * 6236) + 1;
        const res  = await fetch(`https://api.alquran.cloud/v1/ayah/${num}/editions/quran-uthmani,en.asad,id.indonesian`);
        const json = await res.json();
        if (json.code !== 200 || !json.data || json.data.length < 3) throw new Error('bad response');

        const [arab, eng, indo] = json.data;
        this.ayah = {
          arabic:         arab.text,
          english:        eng.text,
          indo:           indo.text,
          surahNameAr:    arab.surah.name,
          surahNameLatin: arab.surah.englishName,
          surahNo:        arab.surah.number,
          ayahNoInSurah:  arab.numberInSurah
        };
      } catch(e) {
        this.error = true;
      } finally {
        this.loading = false;
      }
    },

    // ── Tombol "Sudah Saya Ingat" — tutup popup, tidak muncul lagi hari ini ──
    markRemembered() {
      NotifSound.flushPendingSound();
      NotifSound.playCheck();
      this.visible = false;
    },

    // ── Tombol "Baca Surah Ini" — set surah aktif lalu buka Quran Reader ──
    openInReader() {
      NotifSound.flushPendingSound();
      if (this.ayah) {
        try {
          const prefs = JSON.parse(WorkspaceStorage.getItem('ws_quran_prefs') || '{}');
          prefs.surahNo = this.ayah.surahNo;
          WorkspaceStorage.setItem('ws_quran_prefs', JSON.stringify(prefs));
        } catch(e) {}
      }
      this.visible = false;
      this.$emit('open-quran');
    },

    // ── Klik di luar card — tutup sementara (sudah ditandai shown saat trigger) ──
    dismissSoft() {
      NotifSound.flushPendingSound();
      this.visible = false;
    }
  }
};


// ============================================================================
// DailyQuotePopup — Pop up otomatis setiap pertama kali app dibuka di hari itu
// ============================================================================
//   • Ambil 1 kalimat acak dari Koleksi Inspirasi (inspiration_quotes)
//   • User diminta menulis ulang kalimat tersebut di textarea (latihan menulis)
//   • Tombol "Selesai Menulis" → simpan log, tampilkan feedback singkat, lalu tutup
//   • WAJIB diisi — tidak ada tombol lewati, klik di luar card juga tidak menutup popup
//   • Kalau Koleksi Inspirasi masih kosong → popup tidak muncul (skip diam-diam)
//   Storage: WorkspaceStorage
//     ws_daily_quote_shown → { "YYYY-MM-DD": true }
//     ws_quote_writing_log → { "YYYY-MM-DD": { quoteId, source, original, written, matched, time } }
// ============================================================================
const DailyQuotePopup = {
  template: `
    <transition name="daily-quote-fade">
      <div v-if="visible" class="daily-quote-overlay">
        <div class="daily-quote-card">

          <!-- ── Header ── -->
          <div class="daily-quote-header">
            <div class="daily-quote-header-icon">💡</div>
            <div style="flex:1; min-width:0;">
              <div class="daily-quote-title">Inspirasi Hari Ini</div>
              <div class="daily-quote-date">{{ todayLabel }}</div>
            </div>
          </div>

          <!-- ── Body ── -->
          <div class="daily-quote-body" v-if="quote">

            <template v-if="!submitted">
              <div class="daily-quote-text">&ldquo;{{ quote.quote }}&rdquo;</div>
              <div v-if="quote.source" class="daily-quote-source">— {{ quote.source }}</div>

              <!-- ── Toggle Mode: Tulis / Ucapkan ── -->
              <div class="daily-quote-mode-toggle">
                <button type="button"
                  class="daily-quote-mode-btn"
                  :class="{ active: inputMode === 'write' }"
                  @click.stop="switchMode('write')">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                  Tulis
                </button>
                <button type="button"
                  class="daily-quote-mode-btn"
                  :class="{ active: inputMode === 'voice' }"
                  @click.stop="switchMode('voice')">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  Ucapkan
                </button>
              </div>

              <!-- ════════ MODE: TULIS ════════ -->
              <template v-if="inputMode === 'write'">
                <div class="daily-quote-write-label">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                  Tulis ulang kalimat di atas di sini (wajib):
                </div>
                <textarea
                  v-model="writtenText"
                  class="daily-quote-textarea"
                  rows="4"
                  placeholder="Ketik ulang kalimat di atas persis sama..."
                  @keydown.enter.meta="submitWriting"
                  @keydown.enter.ctrl="submitWriting"
                ></textarea>
                <div v-if="writtenText.trim()" class="daily-quote-match-hint" :class="canSubmit ? 'match-ok' : 'match-no'">
                  {{ canSubmit ? '✓ Kalimat sudah cocok!' : '✗ Belum cocok, cek lagi...' }}
                </div>
              </template>

              <!-- ════════ MODE: VOICE ════════ -->
              <template v-else>
                <!-- Browser tidak support -->
                <div v-if="!voiceSupported" class="daily-quote-voice-unsupported">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Browser kamu belum mendukung fitur voice. Coba pakai Chrome atau Edge.
                </div>

                <!-- Voice UI -->
                <div v-else class="daily-quote-voice-area">
                  <!-- Instruksi singkat -->
                  <div class="daily-quote-write-label" style="width:100%; justify-content:center; border-top:none; padding-top:0;">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                    Ucapkan kalimat di atas keras-keras:
                  </div>

                  <!-- Tombol rekam -->
                  <button type="button"
                    class="daily-quote-record-btn"
                    :class="{ recording: isRecording }"
                    @click.stop="toggleRecording">
                    <template v-if="!isRecording">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                      {{ voiceTranscript ? 'Rekam Ulang' : 'Mulai Rekam' }}
                    </template>
                    <template v-else>
                      <span class="daily-quote-record-pulse"></span>
                      Mendengarkan...
                    </template>
                  </button>

                  <!-- Kotak hasil transkripsi -->
                  <div class="daily-quote-transcript-box" v-if="voiceTranscript || isRecording">
                    <span v-if="voiceTranscript">{{ voiceTranscript }}</span>
                    <span v-else class="daily-quote-transcript-placeholder">Sedang mendengarkan suara kamu...</span>
                  </div>

                  <!-- Hint cocok/belum -->
                  <div v-if="voiceTranscript" class="daily-quote-match-hint" :class="canSubmitVoice ? 'match-ok' : 'match-no'" style="width:100%; box-sizing:border-box;">
                    {{ canSubmitVoice ? '✓ Sudah cocok! Klik Selesai.' : '✗ Belum cocok, coba ucapkan lagi...' }}
                  </div>

                  <!-- Reset -->
                  <button v-if="voiceTranscript && !isRecording" type="button" class="daily-quote-reset-voice" @click.stop="resetVoice">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
                    Ulangi dari awal
                  </button>
                </div>
              </template>

            </template>

            <div v-else class="daily-quote-success">
              <div class="daily-quote-success-icon">🎉</div>
              <div class="daily-quote-success-text">
                <template v-if="lastMode === 'voice'">Keren! Kalimat berhasil diucapkan dengan benar.</template>
                <template v-else>Tepat! Kalimat berhasil ditulis ulang.</template>
              </div>
            </div>

          </div>

          <!-- ── Footer ── -->
          <div class="daily-quote-footer" v-if="quote && !submitted">
            <!-- Tombol submit mode tulis -->
            <button v-if="inputMode === 'write'" type="button" class="daily-quote-btn-submit" :disabled="!canSubmit" @click.stop="submitWriting">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Selesai Menulis
            </button>
            <!-- Tombol submit mode voice -->
            <button v-else type="button" class="daily-quote-btn-submit" :disabled="!canSubmitVoice" @click.stop="submitVoice">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Selesai Mengucapkan
            </button>
          </div>

        </div>
      </div>
    </transition>
  `,

  data() {
    return {
      visible: false,
      quote: null,
      writtenText: '',
      submitted: false,
      matched: false,
      lastMode: 'write',
      inputMode: 'write',        // 'write' | 'voice'
      voiceSupported: false,     // apakah SpeechRecognition tersedia
      isRecording: false,        // sedang merekam suara
      voiceTranscript: '',       // hasil transkripsi dari speech recognition
      _recognition: null,        // instance SpeechRecognition
    };
  },

  computed: {
    // todayStr selalu live — tidak stale walaupun app dibuka lintas tengah malam
    todayStr() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },
    todayLabel() {
      const now = new Date();
      const days   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    },
    canSubmit() {
      if (!this.quote) return false;
      return this._normalize(this.writtenText) === this._normalize(this.quote.quote);
    },
    canSubmitVoice() {
      if (!this.quote || !this.voiceTranscript) return false;
      return this._normalize(this.voiceTranscript) === this._normalize(this.quote.quote);
    }
  },

  mounted() {
    // Deteksi dukungan SpeechRecognition
    this.voiceSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    // Cek sekali saat app pertama kali dibuka (delay 1s biar WorkspaceStorage selesai init)
    setTimeout(() => this._checkOnOpen(), 1000);
  },

  beforeUnmount() {
    this._stopRecognition();
  },

  methods: {
    // ── Public: bisa dipanggil manual setelah reset ws_daily_quote_shown
    //    lewat DevTools tanpa perlu refresh halaman
    checkAndShow() {
      this._checkOnOpen();
    },

    // ── Ganti mode Tulis / Ucapkan, hentikan rekaman jika sedang jalan ──
    switchMode(mode) {
      if (this.inputMode === mode) return;
      this._stopRecognition();
      this.inputMode = mode;
    },

    // ══════════════════════════════════════════════
    // VOICE: Toggle rekam (mulai / stop)
    // ══════════════════════════════════════════════
    toggleRecording() {
      if (this.isRecording) {
        this._stopRecognition();
      } else {
        this._startRecognition();
      }
    },

    _startRecognition() {
      if (!this.voiceSupported) return;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();

      recog.lang = 'id-ID';          // Bahasa Indonesia (bisa deteksi kutipan Inggris juga)
      recog.continuous = false;       // Stop otomatis setelah jeda bicara
      recog.interimResults = true;    // Tampilkan hasil sementara
      recog.maxAlternatives = 1;

      // Hasil sementara & final
      recog.onresult = (event) => {
        let interim = '';
        let final   = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) final += t;
          else interim += t;
        }
        // Tampilkan interim dulu, replace dengan final kalau sudah ada
        this.voiceTranscript = (final || interim).trim();
      };

      recog.onend = () => {
        this.isRecording = false;
        this._recognition = null;
      };

      recog.onerror = (e) => {
        console.warn('[DailyQuotePopup] SpeechRecognition error:', e.error);
        this.isRecording = false;
        this._recognition = null;
        // Kalau permission ditolak, beritahu user
        if (e.error === 'not-allowed') {
          alert('Akses mikrofon ditolak. Izinkan akses mikrofon di pengaturan browser, lalu coba lagi.');
        }
      };

      recog.start();
      this._recognition = recog;
      this.isRecording  = true;
      this.voiceTranscript = '';   // reset hasil sebelumnya saat rekam baru dimulai
    },

    _stopRecognition() {
      if (this._recognition) {
        try { this._recognition.stop(); } catch(e) {}
        this._recognition = null;
      }
      this.isRecording = false;
    },

    // Reset hasil voice agar bisa rekam ulang dari awal
    resetVoice() {
      this._stopRecognition();
      this.voiceTranscript = '';
    },

    // ══════════════════════════════════════════════
    // SUBMIT: mode voice
    // ══════════════════════════════════════════════
    submitVoice() {
      if (!this.canSubmitVoice || !this.quote || this.submitted) return;
      this._stopRecognition();

      try {
        NotifSound.flushPendingSound();
        const isMatch = this._normalize(this.voiceTranscript) === this._normalize(this.quote.quote);
        this.matched = isMatch;
        this.lastMode = 'voice';
        this._saveLogWithMode(isMatch, this.voiceTranscript, 'voice');
        this._markShownToday();

        NotifSound.playCheck();
        this.submitted = true;
        setTimeout(() => { this.visible = false; }, 1400);
      } catch(err) {
        console.error('[DailyQuotePopup] submitVoice error:', err);
      }
    },

    _loadQuotes() {
      try {
        const raw = WorkspaceStorage.getItem('inspiration_quotes');
        return raw ? JSON.parse(raw) : [];
      } catch(e) { return []; }
    },

    _triggerBellShake() {
      const bells = document.querySelectorAll('.desk-notif-float-btn, .ws-notif-btn');
      bells.forEach(btn => {
        btn.classList.remove('bell-has-notif');
        void btn.offsetWidth;
        btn.classList.add('bell-has-notif');
        setTimeout(() => btn.classList.remove('bell-has-notif'), 4000);
      });
    },

    // ── Tampilkan popup setiap kali web dibuka. Aman dipanggil berulang. ──
    _checkOnOpen() {
      const quotes = this._loadQuotes();
      if (!quotes.length) return; // Koleksi Inspirasi masih kosong → skip diam-diam

      // Sudah muncul hari ini? → skip
      try {
        const raw  = WorkspaceStorage.getItem('ws_daily_quote_shown');
        const seen = raw ? JSON.parse(raw) : {};
        if (seen[this.todayStr]) return;
      } catch(e) {}

      const random = quotes[Math.floor(Math.random() * quotes.length)];
      this.quote         = random;
      this.writtenText   = '';
      this.voiceTranscript = '';
      this.submitted     = false;
      this.matched       = false;
      this.lastMode      = 'write';
      this.inputMode     = 'write';
      this._stopRecognition();

      this.visible = true;
      this._triggerBellShake();
      NotifSound.playNotifSafe();
    },

    // ── Tandai sudah ditampilkan hari ini ──
    _markShownToday() {
      try {
        const raw  = WorkspaceStorage.getItem('ws_daily_quote_shown');
        const seen = raw ? JSON.parse(raw) : {};
        seen[this.todayStr] = true;
        WorkspaceStorage.setItem('ws_daily_quote_shown', JSON.stringify(seen));
      } catch(e) {}
    },

    // ── Normalisasi teks untuk cek kecocokan (case/tanda baca/spasi diabaikan) ──
    _normalize(str) {
      return String(str || '')
        .toLowerCase()
        .replace(/[.,!?;:"'''""\-—]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    },

    // ══════════════════════════════════════════════
    // SUBMIT: mode tulis
    // ══════════════════════════════════════════════
    submitWriting() {
      if (!this.canSubmit || !this.quote || this.submitted) return;

      try {
        NotifSound.flushPendingSound();

        const isMatch = this._normalize(this.writtenText) === this._normalize(this.quote.quote);
        this.matched = isMatch;
        this.lastMode = 'write';
        this._saveLogWithMode(isMatch, this.writtenText, 'write');
        this._markShownToday();

        NotifSound.playCheck();
        this.submitted = true;

        // Auto tutup setelah feedback singkat ditampilkan
        setTimeout(() => { this.visible = false; }, 1400);
      } catch(err) {
        console.error('[DailyQuotePopup] submitWriting error:', err);
      }
    },

    // ── Simpan log dengan info mode (write / voice) ──
    _saveLogWithMode(matched, inputText, mode = 'write') {
      try {
        const raw = WorkspaceStorage.getItem('ws_quote_writing_log');
        const log = raw ? JSON.parse(raw) : {};
        log[this.todayStr] = {
          quoteId:  this.quote.id,
          source:   this.quote.source || '',
          original: this.quote.quote,
          written:  inputText.trim(),
          mode,
          matched,
          time: new Date().toISOString()
        };
        WorkspaceStorage.setItem('ws_quote_writing_log', JSON.stringify(log));
      } catch(e) {}
    }
  }
};
