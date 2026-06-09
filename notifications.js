// ============================================================================
// NOTIFICATION SYSTEM — notifications.js
// ============================================================================
// Dua section notifikasi:
//   Section 1 — Informational (Hari Ini):
//     • Task Plan yang target-nya hari ini (dari personal_workspace_job_plans)
//     • Content Plan dengan dueDate hari ini + urgensi rilis H-1 & H-2
//
//   Section 2 — Actionable (Berbasis Waktu & Tindakan):
//     • Jam 15:30 → isi My 8-9 Job Logbook → navigasi ke jobLogbook
//     • Jam 20:30 → isi My Memories & Growth → navigasi ke calendarMoment
//     • Setiap notif punya status selesai (✓) yang tersimpan per-hari di localStorage
//
// Database schema (localStorage key: ws_notif_action_status):
//   { "YYYY-MM-DD": { "logbook_1530": true/false, "memories_2030": true/false } }
//
// FITUR BARU:
//   • Badge berkurang otomatis saat item ditandai selesai
//   • Pop-up pengingat muncul saat web dibuka jika ada Pengingat Hari Ini yang belum selesai
// ============================================================================

// ── Web Audio: generate suara pakai AudioContext (no file needed) ──
const NotifSound = {
  _ctx: null,
  _get() {
    if (!this._ctx) {
      try { this._ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    // Resume context kalau suspended (browser autoplay policy)
    if (this._ctx && this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
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

// ============================================================================
// REMINDER POPUP — Muncul otomatis saat web dibuka jika ada pengingat pending
// ============================================================================

// ============================================================================
// REMINDER POPUP — notifications.js
// ============================================================================
// Satu popup dengan dua mode:
//
//   Mode "live"   — web sedang buka, jam task baru tiba (polling 30 detik):
//                   Muncul dengan 1 notif, tombol "Lihat Notifikasi" + "Nanti saja".
//                   Header: "Waktunya Sekarang!" (terracotta).
//
//   Mode "missed" — web baru dibuka & ada jam yang sudah lewat belum dikerjakan:
//                   Design mirip mode "open" — header "Notifikasi Kelewat" (amber).
//                   1 item: footer (Lihat Notifikasi + Oke).
//                   > 1 item: carousel 1 per slide, progress dots,
//                   tombol Sebelumnya / Berikutnya, Oke di slide terakhir.
//
//   Mode "open"   — web baru dibuka, belum ada yang kelewat (sebelum jam pertama):
//                   Design lama — header "Pengingat Hari Ini", list semua pending,
//                   tombol "Lihat Notifikasi" + "Nanti saja".
//                   Hanya tampil sekali per hari (dismiss tersimpan).
//
// localStorage keys:
//   ws_notif_action_status   — { "YYYY-MM-DD": { id: true/false } }  (existing)
//   ws_reminder_popup_dismissed — { "YYYY-MM-DD": true }              (existing, mode open)
//   ws_timed_popup_shown     — { "YYYY-MM-DD": { id: true } }         (baru, mode live & missed)
// ============================================================================

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
               MODE: open  —  list semua pengingat pending
          ══════════════════════════════════════════════════ -->
          <template v-if="mode === 'open'">
            <div class="reminder-popup-body">
              <p class="reminder-popup-intro">
                Kamu punya <strong>{{ pendingNotifs.length }} pengingat</strong> yang belum selesai hari ini:
              </p>
              <div v-for="notif in pendingNotifs" :key="notif.id" class="reminder-popup-item">
                <div class="reminder-popup-item-time">{{ notif.time }}</div>
                <div class="reminder-popup-item-info">
                  <div class="reminder-popup-item-title">{{ notif.title }}</div>
                  <div class="reminder-popup-item-sub">{{ notif.subtitle }}</div>
                </div>
              </div>
            </div>
            <div class="reminder-popup-footer">
              <button class="reminder-popup-btn-open" @click="openNotifPanel">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Lihat Notifikasi
              </button>
              <button class="reminder-popup-btn-dismiss" @click="dismiss">Nanti saja</button>
            </div>
          </template>

          <!-- ══════════════════════════════════════════════════
               MODE: live  —  1 notif, jam tepat waktu
          ══════════════════════════════════════════════════ -->
          <template v-else-if="mode === 'live'">
            <div class="reminder-popup-body">
              <div class="reminder-popup-item" style="border-left-color: var(--color-terracotta, #D67B52);">
                <div class="reminder-popup-item-time">{{ currentItem.time }}</div>
                <div class="reminder-popup-item-info">
                  <div class="reminder-popup-item-title">{{ currentItem.title }}</div>
                  <div class="reminder-popup-item-sub">{{ currentItem.subtitle }}</div>
                </div>
              </div>
            </div>
            <div class="reminder-popup-footer">
              <button class="reminder-popup-btn-open" @click="openNotifPanel">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Lihat Notifikasi
              </button>
              <button class="reminder-popup-btn-dismiss" @click="dismiss">Nanti saja</button>
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
                    <div class="reminder-popup-item-sub">{{ queue[0].subtitle }}</div>
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
                      <div class="reminder-popup-item-sub">{{ currentItem.subtitle }}</div>
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
      // mode open
      pendingNotifs: [],
      // mode live & missed
      queue: [],
      currentIdx: 0,
      slideDir: 'next',
      _checkInterval: null
    };
  },

  computed: {
    currentItem() {
      return this.queue[this.currentIdx] || {};
    },
    headerTitle() {
      if (this.mode === 'missed') return 'Notifikasi Kelewat';
      if (this.mode === 'live')   return 'Waktunya Sekarang!';
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
    }
  },

  mounted() {
    this.todayStr = this._getTodayStr();
    // Cek missed / open saat web dibuka
    setTimeout(() => this._checkOnOpen(), 900);
    // Polling live setiap 30 detik
    this._checkInterval = setInterval(() => this._checkLive(), 30000);
  },

  beforeUnmount() {
    clearInterval(this._checkInterval);
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
      return [
        { id: 'logbook_1530',  title: 'Isi My 8-9 Job Logbook',   subtitle: 'Catat aktivitas & pencapaian kerja hari ini', time: '22:30', timeVal: 15*60+30, page: 'jobLogbook' },
        { id: 'memories_2030', title: 'Isi My Memories & Growth',  subtitle: 'Tambahkan kenangan & refleksi malam ini',    time: '22:30', timeVal: 20*60+30, page: 'calendarMoment' }
      ];
    },

    _isDone(id) {
      try {
        const s = JSON.parse(localStorage.getItem('ws_notif_action_status') || '{}');
        return !!(s[this.todayStr] || {})[id];
      } catch(e) { return false; }
    },

    _getShownLog() {
      try { return JSON.parse(localStorage.getItem('ws_timed_popup_shown') || '{}'); }
      catch(e) { return {}; }
    },

    _markShown(id) {
      const log = this._getShownLog();
      if (!log[this.todayStr]) log[this.todayStr] = {};
      log[this.todayStr][id] = true;
      localStorage.setItem('ws_timed_popup_shown', JSON.stringify(log));
    },

    // ── Dipanggil sekali saat web dibuka ──────────────────────────────────
    _checkOnOpen() {
      // 1. Ambil status dismiss dari localStorage
      const dismissedData = localStorage.getItem('ws_reminder_popup_dismissed');
      let isDismissedToday = false;
      try {
        if (dismissedData) {
          const parsed = JSON.parse(dismissedData);
          if (parsed[this.todayStr]) {
            isDismissedToday = true;
          }
        }
      } catch (e) {}

      const all = this._allActions();
      const nowMin = this._nowMinutes();

      // 2. Filter item: cari yang belum dikerjakan
      const pendingItems = all.filter(a => !this._isDone(a.id));
      
      // 3. Cari spesifik item yang JAM-NYA SUDAH LEWAT dan belum dikerjakan
      const missedItems = pendingItems.filter(a => nowMin >= a.timeVal);

      // 4. LOGIKA BARU: Jika ada yang terlewat, ABAIKAN status dismiss dan paksa muncul!
      if (missedItems.length > 0) {
        this.mode = 'missed';
        this.queue = missedItems;
        this.currentIdx = 0;
        this.visible = true;
        
      } 
      // 5. Jika TIDAK ADA yang terlewat, baru patuhi aturan dismiss (hanya muncul 1x sehari)
      else if (pendingItems.length > 0) {
        if (!isDismissedToday) {
          this.mode = 'open';
          this.pendingNotifs = pendingItems;
          this.visible = true;
        }
      }
    

      // 2. Belum ada yang kelewat — cek mode "open" (popup pengingat sekali sehari)
      try {
        const dismissed = JSON.parse(localStorage.getItem('ws_reminder_popup_dismissed') || '{}');
        if (dismissed[this.todayStr]) return;
      } catch(e) {}

      const pending = this._allActions().filter(a => !this._isDone(a.id));
      if (pending.length === 0) return;

      this.mode         = 'open';
      this.pendingNotifs = pending;
      this.visible       = true;
      NotifSound.playNotif();
    },

    // ── Polling live: muncul tepat saat jam task tiba ─────────────────────
    _checkLive() {
      if (this.visible) return;
      const nowMin   = this._nowMinutes();
      const shownLog = this._getShownLog()[this.todayStr] || {};

      const due = this._allActions().find(a => {
        const diff = nowMin - a.timeVal;
        return diff >= 0 && diff < 1 && !this._isDone(a.id) && !shownLog[a.id];
      });

      if (!due) return;

      this._markShown(due.id);
      this.mode       = 'live';
      this.queue      = [due];
      this.currentIdx = 0;
      this.visible    = true;
      NotifSound.playNotif();
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

    dismiss() {
      this.visible = false;
      if (this.mode === 'open') {
        try {
          const dismissed = JSON.parse(localStorage.getItem('ws_reminder_popup_dismissed') || '{}');
          dismissed[this.todayStr] = true;
          localStorage.setItem('ws_reminder_popup_dismissed', JSON.stringify(dismissed));
        } catch(e) {}
      }
      this.$emit('dismiss');
    }
  }
};

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
            <button class="notif-close-btn" @click="$emit('close')" aria-label="Tutup notifikasi">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="notif-panel-body">

            <!-- ══ SECTION 1: INFORMATIONAL ══ -->
            <div class="notif-section-label">
              <span class="notif-section-dot notif-dot-info"></span>
              Hari Ini
            </div>

            <div v-if="infoNotifs.length === 0" class="notif-empty">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-sand); margin-bottom:6px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span>Tidak ada agenda hari ini</span>
            </div>

            <div v-for="notif in infoNotifs" :key="notif.id"
                 class="notif-item notif-item-info notif-item-clickable"
                 @click="handleInfoClick(notif)">
              <div class="notif-item-icon" :class="'notif-icon-' + notif.type">
                <svg v-if="notif.type === 'task'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <svg v-else-if="notif.type === 'content-today'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="notif-item-content">
                <div class="notif-item-title">{{ notif.title }}</div>
                <div class="notif-item-sub">{{ notif.subtitle }}</div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;">
                <span v-if="notif.badge" class="notif-badge" :class="'notif-badge-' + notif.badgeColor">{{ notif.badge }}</span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-top: 2px;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </div>

            <!-- ══ SECTION 2: ACTIONABLE ══ -->
            <div class="notif-section-label" style="margin-top: 18px;">
              <span class="notif-section-dot notif-dot-action"></span>
              Pengingat Hari Ini
            </div>

            <div v-for="notif in actionNotifs" :key="notif.id"
                 class="notif-item notif-item-action"
                 :class="{ 'notif-item-done': notif.done }"
                 @click="handleActionClick(notif)">
              <div class="notif-item-icon" :class="notif.done ? 'notif-icon-done' : 'notif-icon-action'">
                <svg v-if="notif.done" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="notif-item-content">
                <div class="notif-item-title" :style="notif.done ? 'text-decoration: line-through; opacity: 0.55;' : ''">{{ notif.title }}</div>
                <div class="notif-item-sub">{{ notif.done ? 'Sudah dikerjakan ✓' : notif.subtitle }}</div>
              </div>
              <div class="notif-item-right">
                <span class="notif-time-badge">{{ notif.time }}</span>
                <svg v-if="!notif.done" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-top: 2px;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </div>

            <!-- Reset completed untuk hari ini -->
            <div v-if="anyDone" style="margin-top: 12px; text-align: center;">
              <button class="notif-reset-btn" @click="resetDoneToday">
                Tandai ulang semua belum selesai
              </button>
            </div>

          </div>
        </div>
      </div>
    </transition>
  `,

  props: {
    show: { type: Boolean, default: false }
  },
  emits: ['close', 'navigate', 'unread-count-changed'],

  data() {
    return {
      todayStr: '',
      plans: [],
      contentItems: [],
      actionStatus: {}
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

      // Task Plan hari ini
      const todayPlans = this.plans.filter(p => p.date === this.todayStr);
      todayPlans.forEach(p => {
        const priorityMap = { High: { badge: 'High', color: 'red' }, Medium: { badge: 'Med', color: 'amber' }, Low: { badge: 'Low', color: 'sage' } };
        const pm = priorityMap[p.priority] || { badge: p.priority, color: 'amber' };
        list.push({
          id: 'task-' + p.id,
          type: 'task',
          title: p.tasks,
          subtitle: `Task Plan · ${p.category || 'Umum'}${p.requester ? ' · dari ' + p.requester : ''}`,
          badge: pm.badge,
          badgeColor: pm.color,
          page: 'jobLogbook'
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

        list.push({
          id: 'content-' + item.id,
          type: 'content-today',
          title: item.title,
          subtitle,
          badge,
          badgeColor,
          page: 'contentTracker'
        });
      });

      return list;
    },

    // Section 2: Actionable
    actionNotifs() {
      const status = this.actionStatus[this.todayStr] || {};
      return [
        {
          id: 'logbook_1530',
          title: 'Isi My 8-9 Job Logbook',
          subtitle: 'Catat aktivitas & pencapaian kerja hari ini',
          time: '22:30',
          page: 'jobLogbook',
          done: !!status['logbook_1530']
        },
        {
          id: 'memories_2030',
          title: 'Isi My Memories & Growth',
          subtitle: 'Tambahkan kenangan & refleksi malam ini',
          time: '22:30',
          page: 'calendarMoment',
          done: !!status['memories_2030']
        }
      ];
    },

    anyDone() {
      return this.actionNotifs.some(n => n.done);
    },

    // Total badge buat bell icon di navbar — hanya hitung yang belum selesai
    totalUnread() {
      const infoCount = this.infoNotifs.length;
      const undoneCount = this.actionNotifs.filter(n => !n.done).length;
      return infoCount + undoneCount;
    }
  },

  watch: {
    show(val) {
      if (val) this.loadData();
    },
    // Emit ke parent setiap kali totalUnread berubah, supaya badge di bell ikut update
    totalUnread(val) {
      this.$emit('unread-count-changed', val);
    }
  },

  mounted() {
    this.todayStr = this.getTodayStr();
    this.loadData();

    // Emit count awal supaya badge langsung benar saat mount
    this.$nextTick(() => {
      this.$emit('unread-count-changed', this.totalUnread);

      const hasPending = this.actionNotifs.some(n => !n.done) || this.infoNotifs.length > 0;
      if (hasPending) {
        this._triggerBellAlert();
      }
    });

    // Refresh data setiap menit (kalau panel terbuka lama)
    this._interval = setInterval(() => {
      this.todayStr = this.getTodayStr();
      this.loadData();
    }, 60000);
  },

  beforeUnmount() {
    clearInterval(this._interval);
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

      // Action Status
      try {
        const raw = localStorage.getItem('ws_notif_action_status');
        this.actionStatus = raw ? JSON.parse(raw) : {};
      } catch(e) { this.actionStatus = {}; }

      // Emit count terbaru setelah load
      this.$nextTick(() => {
        this.$emit('unread-count-changed', this.totalUnread);
      });
    },

    _triggerBellAlert() {
      // Shake + suara semua bell button yang ada di halaman
      const bells = document.querySelectorAll('.desk-notif-float-btn, .ws-notif-btn');
      bells.forEach(btn => {
        btn.classList.remove('bell-has-notif');
        // Force reflow biar animasi re-trigger
        void btn.offsetWidth;
        btn.classList.add('bell-has-notif');
        // Hapus class setelah animasi selesai
        setTimeout(() => btn.classList.remove('bell-has-notif'), 3200);
      });
      // Play notif sound
      NotifSound.playNotif();
    },

    handleInfoClick(notif) {
      if (notif.page) {
        this.$emit('navigate', notif.page);
        this.$emit('close');
      }
    },

    handleActionClick(notif) {
      if (notif.done) return;
      // Play suara checklist dulu
      NotifSound.playCheck();
      // Tandai selesai
      if (!this.actionStatus[this.todayStr]) {
        this.actionStatus[this.todayStr] = {};
      }
      this.actionStatus[this.todayStr][notif.id] = true;
      localStorage.setItem('ws_notif_action_status', JSON.stringify(this.actionStatus));

      // Emit count terbaru supaya badge langsung berkurang
      this.$nextTick(() => {
        this.$emit('unread-count-changed', this.totalUnread);
      });

      // Navigasi ke halaman
      this.$emit('navigate', notif.page);
      this.$emit('close');
    },

    resetDoneToday() {
      if (this.actionStatus[this.todayStr]) {
        this.actionStatus[this.todayStr] = {};
        localStorage.setItem('ws_notif_action_status', JSON.stringify(this.actionStatus));
        // Emit count setelah reset
        this.$nextTick(() => {
          this.$emit('unread-count-changed', this.totalUnread);
        });
      }
    }
  }
};
