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
const ReminderPopup = {
  template: `
    <transition name="reminder-popup-fade">
      <div v-if="visible" class="reminder-popup-overlay" @click.self="dismiss">
        <div class="reminder-popup-card">
          <!-- Header -->
          <div class="reminder-popup-header">
            <div class="reminder-popup-icon-wrap">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div>
              <div class="reminder-popup-title">Pengingat Hari Ini</div>
              <div class="reminder-popup-date">{{ todayLabel }}</div>
            </div>
          </div>

          <!-- List Pengingat Pending -->
          <div class="reminder-popup-body">
            <p class="reminder-popup-intro">Kamu punya <strong>{{ pendingCount }} pengingat</strong> yang belum selesai hari ini:</p>
            <div v-for="notif in pendingNotifs" :key="notif.id" class="reminder-popup-item">
              <div class="reminder-popup-item-time">{{ notif.time }}</div>
              <div class="reminder-popup-item-info">
                <div class="reminder-popup-item-title">{{ notif.title }}</div>
                <div class="reminder-popup-item-sub">{{ notif.subtitle }}</div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="reminder-popup-footer">
            <button class="reminder-popup-btn-open" @click="openNotifPanel">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              Lihat Notifikasi
            </button>
            <button class="reminder-popup-btn-dismiss" @click="dismiss">Nanti saja</button>
          </div>
        </div>
      </div>
    </transition>
  `,

  emits: ['open-notif', 'dismiss'],

  data() {
    return {
      visible: false,
      todayStr: '',
      pendingNotifs: []
    };
  },

  computed: {
    pendingCount() {
      return this.pendingNotifs.length;
    },
    todayLabel() {
      const now = new Date();
      const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }
  },

  mounted() {
    const d = new Date();
    this.todayStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    // Tunda sedikit supaya app sudah siap render, lalu cek
    setTimeout(() => this.checkAndShow(), 800);
  },

  methods: {
    getTodayStr() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },

    checkAndShow() {
      // Cek popup sudah pernah di-dismiss hari ini?
      try {
        const dismissed = JSON.parse(localStorage.getItem('ws_reminder_popup_dismissed') || '{}');
        if (dismissed[this.todayStr]) return; // sudah dismiss hari ini, jangan tampil lagi
      } catch(e) {}

      // Ambil status actionable
      let actionStatus = {};
      try {
        actionStatus = JSON.parse(localStorage.getItem('ws_notif_action_status') || '{}');
      } catch(e) {}

      const status = actionStatus[this.todayStr] || {};
      const allActions = [
        { id: 'logbook_1530',   title: 'Isi My 8-9 Job Logbook',     subtitle: 'Catat aktivitas & pencapaian kerja hari ini', time: '15:30' },
        { id: 'memories_2030',  title: 'Isi My Memories & Growth',    subtitle: 'Tambahkan kenangan & refleksi malam ini',    time: '20:30' }
      ];

      // Hanya tampilkan yang belum selesai
      this.pendingNotifs = allActions.filter(n => !status[n.id]);

      if (this.pendingNotifs.length > 0) {
        this.visible = true;
        NotifSound.playNotif();
      }
    },

    openNotifPanel() {
      this.dismiss();
      this.$emit('open-notif');
    },

    dismiss() {
      this.visible = false;
      // Simpan bahwa sudah dismiss hari ini
      try {
        const dismissed = JSON.parse(localStorage.getItem('ws_reminder_popup_dismissed') || '{}');
        dismissed[this.todayStr] = true;
        localStorage.setItem('ws_reminder_popup_dismissed', JSON.stringify(dismissed));
      } catch(e) {}
      this.$emit('dismiss');
    }
  }
};


// ============================================================================
// NOTIFICATION PANEL
// ============================================================================
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
          time: '15:30',
          page: 'jobLogbook',
          done: !!status['logbook_1530']
        },
        {
          id: 'memories_2030',
          title: 'Isi My Memories & Growth',
          subtitle: 'Tambahkan kenangan & refleksi malam ini',
          time: '20:30',
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
