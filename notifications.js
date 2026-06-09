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
            <div class="reminder-popup-body">

              <!-- Section 1: Hari Ini (task plan + content urgen) -->
              <template v-if="infoItems.length > 0">
                <div class="reminder-popup-section-label">
                  <span class="reminder-popup-dot reminder-popup-dot-terra"></span> Hari Ini
                </div>
                <div v-for="item in infoItems" :key="item.id" class="reminder-popup-item reminder-popup-item-info">
                  <div class="reminder-popup-item-icon">{{ item.icon }}</div>
                  <div class="reminder-popup-item-info-text">
                    <div class="reminder-popup-item-title">{{ item.title }}</div>
                    <div class="reminder-popup-item-sub">{{ item.sub }}</div>
                  </div>
                </div>
              </template>

              <!-- Section 2: Pengingat Hari Ini (actionable pending) -->
              <div class="reminder-popup-section-label" :style="infoItems.length > 0 ? 'margin-top:14px;' : ''">
                <span class="reminder-popup-dot reminder-popup-dot-sage"></span> Pengingat Hari Ini
              </div>
              <div v-for="notif in pendingNotifs" :key="notif.id" class="reminder-popup-item">
                <div class="reminder-popup-item-time">{{ notif.time }}</div>
                <div class="reminder-popup-item-info">
                  <div class="reminder-popup-item-title">{{ notif.title }}</div>
                  <div class="reminder-popup-item-sub">{{ notif.subtitle }}</div>
                </div>
              </div>

              <!-- Kalau tidak ada keduanya -->
              <p v-if="infoItems.length === 0 && pendingNotifs.length === 0"
                 style="font-size:12px; color:var(--text-muted); text-align:center; padding:8px 0;">
                Tidak ada agenda hari ini 🎉
              </p>
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
    // Cek missed / open saat web dibuka (delay 900ms biar WorkspaceStorage selesai init)
    setTimeout(() => this._checkOnOpen(), 900);
    // Polling live setiap 30 detik
    this._checkInterval = setInterval(() => this._checkLive(), 30000);
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
      const base = [
        { id: 'tahajud_0400',  title: 'Sholat Tahajud',           subtitle: 'Waktunya bangun & sholat tahajud 🌙',          time: '04:00', timeVal:  4*60+0,  page: null },
        { id: 'logbook_1530',  title: 'Isi My 8-9 Job Logbook',   subtitle: 'Catat aktivitas & pencapaian kerja hari ini',  time: '15:30', timeVal: 15*60+30, page: 'jobLogbook' },
        { id: 'memories_2030', title: 'Isi My Memories & Growth',  subtitle: 'Tambahkan kenangan & refleksi malam ini',      time: '20:30', timeVal: 20*60+30, page: 'calendarMoment' }
      ];
      try {
        const raw = WorkspaceStorage.getItem('ws_habit_notifs');
        if (raw) {
          const habits = JSON.parse(raw);
          habits.forEach(h => {
            if (!base.find(b => b.id === h.id)) base.push(h);
          });
        }
      } catch(e) {}
      return base.sort((a, b) => a.timeVal - b.timeVal);
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

      const missedItems   = pendingItems.filter(a => nowMin >= a.timeVal);
      const upcomingItems = pendingItems.filter(a => nowMin  < a.timeVal);

      // PRIORITAS 1 — ada yang kelewat → muncul mode missed dulu
      if (missedItems.length > 0) {
        this.mode       = 'missed';
        this.queue      = missedItems;
        this.currentIdx = 0;
        // Kalau masih ada upcoming juga → antri mode open setelah missed di-dismiss
        this._pendingOpenAfterMissed = upcomingItems.length > 0 ? upcomingItems : null;
        this.visible    = true;
        this._triggerBellShake();
        NotifSound.playNotif();
        return;
      }

      // PRIORITAS 2 — semua jam belum lewat → mode open (SELALU tampil, tanpa cek dismiss)
      if (upcomingItems.length > 0) {
        this.mode          = 'open';
        this.pendingNotifs = upcomingItems;
        this.infoItems     = this._loadInfoItems();
        this._pendingOpenAfterMissed = null;
        this.visible       = true;
        this._triggerBellShake();
        NotifSound.playNotif();
      }
    },

    // ── Load Section 1 items (Task Plan + Content urgen) untuk mode open ──
    _loadInfoItems() {
      const items = [];
      const today = this.todayStr;

      // Task Plan hari ini
      try {
        const plans = JSON.parse(WorkspaceStorage.getItem('personal_workspace_job_plans') || '[]');
        plans.filter(p => p.date === today).forEach(p => {
          items.push({
            id: 'task-' + p.id,
            icon: '📋',
            title: p.tasks,
            sub: `Task Plan · ${p.category || 'Umum'}`
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
            sub: `Content · ${item.platform || ''} · ${label}`
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

    dismiss() {
      this.visible = false;

      // Kalau setelah missed ada open yang antri → muncul setelah 600ms
      if (this.mode === 'missed' && this._pendingOpenAfterMissed) {
        const upcoming = this._pendingOpenAfterMissed;
        this._pendingOpenAfterMissed = null;
        setTimeout(() => {
          this.mode          = 'open';
          this.pendingNotifs = upcoming;
          this.infoItems     = this._loadInfoItems();
          this.visible       = true;
          NotifSound.playNotif();
        }, 600);
      }

      this.$emit('dismiss');
    },
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
              <div class="notif-item-icon" :class="notif.done ? 'notif-icon-done' : 'notif-icon-action'" :style="notif.isHabit && !notif.done ? { backgroundColor: notif.color + '22', border: '1.5px solid ' + notif.color + '55' } : {}">
                <svg v-if="notif.done" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else-if="notif.isHabit" viewBox="0 0 24 24" width="14" height="14" fill="none" :stroke="notif.color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.07V6a3 3 0 0 1 6 0v.07a3.5 3.5 0 0 1 3.24 5.61A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg>
                <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="notif-item-content">
                <div class="notif-item-title" :style="notif.done ? 'text-decoration: line-through; opacity: 0.55;' : ''">{{ notif.title }}</div>
                <div class="notif-item-sub" style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
                  <span v-if="notif.isHabit && !notif.done" style="display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; background: #f0fdf4; color: #16a34a; border: 1px solid #86efac;">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.07V6a3 3 0 0 1 6 0v.07a3.5 3.5 0 0 1 3.24 5.61A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg>
                    Habit
                  </span>
                  {{ notif.done ? 'Sudah dikerjakan ✓' : notif.subtitle }}
                </div>
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
      const base = [
        {
          id: 'tahajud_0400',
          title: 'Sholat Tahajud',
          subtitle: 'Waktunya bangun & sholat tahajud 🌙',
          time: '04:00',
          timeVal: 4*60,
          page: null,
          done: !!status['tahajud_0400'],
          isHabit: false
        },
        {
          id: 'logbook_1530',
          title: 'Isi My 8-9 Job Logbook',
          subtitle: 'Catat aktivitas & pencapaian kerja hari ini',
          time: '15:30',
          timeVal: 15*60+30,
          page: 'jobLogbook',
          done: !!status['logbook_1530'],
          isHabit: false
        },
        {
          id: 'memories_2030',
          title: 'Isi My Memories & Growth',
          subtitle: 'Tambahkan kenangan & refleksi malam ini',
          time: '20:30',
          timeVal: 20*60+30,
          page: 'calendarMoment',
          done: !!status['memories_2030'],
          isHabit: false
        }
      ];
      try {
        const raw = WorkspaceStorage.getItem('ws_habit_notifs');
        if (raw) {
          const habits = JSON.parse(raw);
          habits.forEach(h => {
            if (!base.find(b => b.id === h.id)) {
              base.push({
                id: h.id,
                title: h.title,
                subtitle: h.subtitle || 'Habit harian',
                time: h.time,
                timeVal: h.timeVal,
                page: 'habitTracker',
                done: !!status[h.id],
                isHabit: true,
                color: h.color || 'var(--color-terracotta)'
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
      if (notif.done) return;
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
          }
        } catch(e) {}
      }

      // Emit count terbaru supaya badge langsung berkurang
      this.$nextTick(() => {
        this.$emit('unread-count-changed', this.totalUnread);
      });

      // Navigasi ke halaman (skip kalau null, misal tahajud)
      if (notif.page) this.$emit('navigate', notif.page);
      this.$emit('close');
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
    }
  }
};
