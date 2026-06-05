// ============================================================================
// LOGIKA UTAMA APLIKASI VUE 3 (app.js)
// ============================================================================
// Berfungsi untuk mengelola navigasi halaman, state global bulan (untuk Habit Tracker 
// & Kalender), koordinat drag-and-drop benda di meja, serta memuat pengaturan ikon.
// Semua data otomatis tersimpan di penyimpanan lokal browser Anda (localStorage).
// Sangat sederhana, tanpa kompilasi rumit, sehingga Anda bisa langsung edit file ini!

const { createApp, ref, reactive, onMounted, computed } = Vue;

const App = {
  setup() {
    // --- 1. STATE NAVIGASI & DIALOG ---
    // activePage menentukan halaman mana yang sedang aktif ('dashboard' atau key halaman sub-program)
    const activePage = ref('dashboard');
    const showSettings = ref(false);

    // Color customization variables
    const showColorPicker = ref(false);
    const dominantColor = ref('#D67B52');
    const presetColors = ref([
      { label: 'Terracotta', hex: '#D67B52' },
      { label: 'Sage Green', hex: '#5F8575' },
      { label: 'Sunset Rose', hex: '#EC4899' },
      { label: 'Ocean Dusk', hex: '#4A7A96' },
      { label: 'Lavender Dusk', hex: '#8A609C' },
      { label: 'Warm Wood', hex: '#8C6239' },
      { label: 'Forest Green', hex: '#283618' },
      { label: 'Cherry Red', hex: '#C23939' }
    ]);

    const setDominantColor = (colorHex) => {
      dominantColor.value = colorHex;
      WorkspaceStorage.setItem('aesthetic_workspace_dominant_color', colorHex);
      document.documentElement.style.setProperty('--color-terracotta', colorHex);
    };

    // Global Date State for Month Trackers (Habit & Calendar)
    const habitYearMonth = ref('2026-05'); // default
    const habitDaysInMonth = ref(31);
    const habitMonthKey = ref('05');

    const updateHabitDays = () => {
      const [year, month] = habitYearMonth.value.split('-').map(Number);
      habitDaysInMonth.value = new Date(year, month, 0).getDate();
      habitMonthKey.value = String(month).padStart(2, '0');
    };

    const prevMonth = () => {
      let [year, month] = habitYearMonth.value.split('-').map(Number);
      month--;
      if (month < 1) {
        month = 12;
        year--;
      }
      habitYearMonth.value = `${year}-${String(month).padStart(2, '0')}`;
      updateHabitDays();
    };

    const nextMonth = () => {
      let [year, month] = habitYearMonth.value.split('-').map(Number);
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
      habitYearMonth.value = `${year}-${String(month).padStart(2, '0')}`;
      updateHabitDays();
    };

    // Decorative stars on desk
    const stars = ref([
      { x: 10, y: 15 },
      { x: 14, y: 45 },
      { x: 45, y: 18 },
      { x: 85, y: 12 },
      { x: 75, y: 55 },
      { x: 65, y: 88 },
      { x: 35, y: 82 },
      { x: 92, y: 72 }
    ]);

    // Benda-benda dekorasi visual (diambil dari aset dalam assets.js)
    const iconPool = ref(DESK_ASSETS);
    const availableIconsList = ref(Object.keys(DESK_ASSETS));

    // --- 3. PETA default POSISI & IKON MEJA ---
    // x dan y merupakan persentase (%) relatif terhadap ukuran meja virtual.
    // Jika Anda ingin mengubah posisi awal benda di meja, ganti angka x dan y di bawah!
    const defaultAssignedIcons = {
      jobLogbook: {
        iconId: 'alarm_clock',
        x: 62,
        y: 35,
        customUrl: '',
        label: 'my 8-4 job logbook',
        num: '01'
      },
      calendarMoment: {
        iconId: 'globe_notes',
        x: 20,
        y: 22,
        customUrl: '',
        label: 'calendar moment',
        num: '02'
      },
      contentTracker: {
        iconId: 'phone_charger',
        x: 52,
        y: 65,
        customUrl: '',
        label: '3. content plan and tracker',
        num: '04'
      },
      interviewPractice: {
        iconId: 'telephone',
        x: 10,
        y: 50,
        customUrl: '',
        label: '4. interview practice',
        num: '02'
      },
      dailyNutrition: {
        iconId: 'tomato',
        x: 75,
        y: 60,
        customUrl: '',
        label: '5. daily nutrition',
        num: '17'
      },
      habitTracker: {
        iconId: 'cat_plush',
        x: 35,
        y: 48,
        customUrl: '',
        label: '6. personal habit tracker',
        num: '06'
      },
      pomodoroTimer: {
        iconId: 'hourglass',
        x: 85,
        y: 22,
        customUrl: '',
        label: '7. jam pasir pomodoro',
        num: '07'
      },
      googleCalendar: {
        iconId: 'google_calendar',
        x: 18,
        y: 64,
        customUrl: '',
        label: '8. Google Calendar Sync',
        num: '08'
      }
    };

    const assignedIcons = reactive({});

    // Drag and Drop tracking state
    let draggingKey = null;
    let dragStartOffset = { x: 0, y: 0 };
    const deskViewport = ref(null);

    // Load configs from storage or use defaults
    const loadConfig = () => {
      const saved = WorkspaceStorage.getItem('personal_workspace_assigned_icons');
      if (saved) {
        Object.assign(assignedIcons, JSON.parse(saved));
        // Ensure habitTracker & pomodoroTimer exist in loaded configs
        if (!assignedIcons.habitTracker) {
          assignedIcons.habitTracker = { ...defaultAssignedIcons.habitTracker };
        }
        if (!assignedIcons.pomodoroTimer) {
          assignedIcons.pomodoroTimer = { ...defaultAssignedIcons.pomodoroTimer };
        }
        if (!assignedIcons.googleCalendar) {
          assignedIcons.googleCalendar = { ...defaultAssignedIcons.googleCalendar };
        }
        saveConfig();
      } else {
        Object.assign(assignedIcons, JSON.parse(JSON.stringify(defaultAssignedIcons)));
        saveConfig();
      }
    };

    const saveConfig = () => {
      WorkspaceStorage.setItem('personal_workspace_assigned_icons', JSON.stringify(assignedIcons));
    };

    const resetLayout = () => {
      Object.assign(assignedIcons, JSON.parse(JSON.stringify(defaultAssignedIcons)));
      saveConfig();
    };

    // Navigation helper
    const navigateTo = (pageKey) => {
      activePage.value = pageKey;
    };

    // Drag-and-drop mechanics
    const startDrag = (event, pageKey) => {
      // Don't drag if clicking buttons/inputs inside label, only handle main element
      if (event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT') return;
      
      draggingKey = pageKey;
      
      // Handle touch and mouse events
      const clientX = event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX;
      const clientY = event.type.startsWith('touch') ? event.touches[0].clientY : event.clientY;

      const rect = event.currentTarget.getBoundingClientRect();
      
      // Save click offset inside the dragged element
      dragStartOffset.x = clientX - rect.left;
      dragStartOffset.y = clientY - rect.top;

      // Add dynamic dragging listeners globally
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('touchmove', onDrag, { passive: false });
      window.addEventListener('mouseup', endDrag);
      window.addEventListener('touchend', endDrag);
    };

    const onDrag = (event) => {
      if (!draggingKey) return;
      event.preventDefault();

      const clientX = event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX;
      const clientY = event.type.startsWith('touch') ? event.touches[0].clientY : event.clientY;

      const viewportRect = deskViewport.value.getBoundingClientRect();

      // Calculate relative X and Y positions inside the desk
      let relativeX = clientX - viewportRect.left - dragStartOffset.x;
      let relativeY = clientY - viewportRect.top - dragStartOffset.y;

      // Restrict boundaries (keep items inside the desk screen)
      const maxX = viewportRect.width - 120;
      const maxY = viewportRect.height - 120;

      relativeX = Math.max(10, Math.min(relativeX, maxX));
      relativeY = Math.max(10, Math.min(relativeY, maxY));

      // Save as percentage values so it remains responsive on resize
      assignedIcons[draggingKey].x = parseFloat(((relativeX / viewportRect.width) * 100).toFixed(2));
      assignedIcons[draggingKey].y = parseFloat(((relativeY / viewportRect.height) * 100).toFixed(2));
    };

    const endDrag = () => {
      if (draggingKey) {
        saveConfig();
        draggingKey = null;
      }
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchend', endDrag);
    };

    // Callback when icon manager maps icons
    const handleUpdateMapping = ({ pageKey, iconId, customUrl }) => {
      if (iconId !== undefined) {
        assignedIcons[pageKey].iconId = iconId;
      }
      if (customUrl !== undefined) {
        assignedIcons[pageKey].customUrl = customUrl;
      }
      saveConfig();
    };

    onMounted(() => {
      loadConfig();
      updateHabitDays();

      // Load and apply custom dominant color theme
      const savedThemeColor = WorkspaceStorage.getItem('aesthetic_workspace_dominant_color');
      if (savedThemeColor) {
        setDominantColor(savedThemeColor);
      } else {
        setDominantColor('#D67B52');
      }

      // Handle navigation triggered by other components (e.g. sync from Logbook)
      window.addEventListener('navigate-to-page', (e) => {
        navigateTo(e.detail);
      });
    });

    return {
      activePage,
      showSettings,
      showColorPicker,
      dominantColor,
      presetColors,
      setDominantColor,
      stars,
      iconPool,
      availableIconsList,
      assignedIcons,
      deskViewport,
      habitYearMonth,
      habitDaysInMonth,
      habitMonthKey,
      prevMonth,
      nextMonth,
      startDrag,
      resetLayout,
      navigateTo,
      handleUpdateMapping
    };
  }
};

// ============================================================================
// FLOATING COUNTDOWN TIMER — Global Persistent Component
// ============================================================================
// Membaca state Pomodoro dari localStorage (ditulis oleh PomodoroTimer setiap
// detik). Hanya tampil saat timer sedang BERJALAN (isRunning === true).
// Disembunyikan otomatis saat pause, selesai, atau idle.
// Tidak muncul di halaman 'dashboard' dan 'pomodoroTimer' (sudah ada timer-nya).
// ============================================================================
const FloatingCountdownTimer = {
  template: `
    <transition name="fct-slide">
      <div v-if="visible" class="fct-wrapper" title="Buka Jam Pasir Pomodoro" @click.self="goToPomodoro">
        <!-- Hourglass icon — click navigates to pomodoro page -->
        <div class="fct-icon" @click="goToPomodoro" style="cursor:pointer;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="fct-hg-icon">
            <path d="M5 2h14"></path>
            <path d="M5 22h14"></path>
            <path d="M19 2v4c0 3-2.5 4.5-5 5.5c2.5 1 5 2.5 5 5.5v4"></path>
            <path d="M5 2v4c0 3 2.5 4.5 5 5.5c-2.5 1-5 2.5-5 5.5v4"></path>
          </svg>
        </div>
        <!-- Timer body — click navigates to pomodoro page -->
        <div class="fct-body" @click="goToPomodoro" style="cursor:pointer;">
          <span class="fct-label">WAKTU TERSISA</span>
          <span class="fct-time">{{ formattedTime }}</span>
        </div>
        <!-- Progress ring -->
        <svg class="fct-ring" viewBox="0 0 36 36" width="52" height="52" @click="goToPomodoro" style="cursor:pointer;">
          <circle class="fct-ring-bg" cx="18" cy="18" r="15.5" fill="none" stroke-width="2.5"/>
          <circle class="fct-ring-fill" cx="18" cy="18" r="15.5" fill="none" stroke-width="2.5"
            :stroke-dasharray="97.4"
            :stroke-dashoffset="ringOffset"
            stroke-linecap="round"
            transform="rotate(-90 18 18)"/>
        </svg>
        <!-- Pause/Resume button -->
        <button class="fct-pause-btn" @click.stop="togglePause" :title="isPaused ? 'Resume timer' : 'Pause timer'">
          <svg v-if="!isPaused" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1"/>
            <rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        </button>
      </div>
    </transition>
  `,
  props: {
    activePage: { type: String, default: 'dashboard' }
  },
  data() {
    return {
      isRunning: false,
      timeLeft: 0,
      totalDuration: 0,
      deadline: null,   // timestamp ms kapan timer habis
      pausedTimeLeft: null, // sisa waktu saat di-pause dari floating timer
    };
  },
  computed: {
    isPaused() {
      // Timer ada data tapi tidak running (sedang pause)
      return !this.isRunning && (this.timeLeft > 0 || this.pausedTimeLeft !== null);
    },
    visible() {
      return (this.isRunning || this.isPaused) &&
             this.activePage !== 'dashboard' &&
             this.activePage !== 'pomodoroTimer';
    },
    formattedTime() {
      const t = Math.max(0, this.timeLeft);
      const m = Math.floor(t / 60);
      const s = t % 60;
      return `${String(m).padStart(2, '0')} : ${String(s).padStart(2, '0')}`;
    },
    ringOffset() {
      if (this.totalDuration <= 0) return 97.4;
      const elapsed = this.totalDuration - this.timeLeft;
      const fraction = Math.min(1, Math.max(0, elapsed / this.totalDuration));
      return (97.4 * fraction).toFixed(2);
    }
  },
  mounted() {
    this.loadFromStorage();
    // Dengarkan update langsung dari PomodoroTimer (saat user masih di halaman itu)
    window.addEventListener('pomo-state-update', this.onStateUpdate);
    // Tick mandiri setiap detik — menghitung dari deadline saat PomodoroTimer unmount
    this._ticker = setInterval(this.tick, 1000);
  },
  beforeUnmount() {
    window.removeEventListener('pomo-state-update', this.onStateUpdate);
    clearInterval(this._ticker);
  },
  methods: {
    // Muat state awal dari localStorage
    loadFromStorage() {
      try {
        const raw = localStorage.getItem('pomo_floating_state');
        if (!raw) return;
        const s = JSON.parse(raw);
        this.applyState(s);
      } catch(e) {}
    },
    // Dipanggil tiap detik oleh _ticker
    tick() {
      // Jika PomodoroTimer masih aktif di halaman ini, dia yang handle — skip
      if (this.activePage === 'pomodoroTimer') return;

      if (!this.isRunning || !this.deadline) {
        // Jika sedang pause, jangan reset — cukup skip
        if (this.isPaused) return;
        // Cek ulang localStorage kalau-kalau baru saja distart
        this.loadFromStorage();
        return;
      }

      // Hitung sisa waktu dari deadline
      const remaining = Math.round((this.deadline - Date.now()) / 1000);
      if (remaining <= 0) {
        // Timer habis
        this.timeLeft = 0;
        this.isRunning = false;
        this.deadline = null;
        this.pausedTimeLeft = null;
        localStorage.removeItem('pomo_floating_state');
      } else {
        this.timeLeft = remaining;
      }
    },
    // Terima update dari PomodoroTimer via CustomEvent
    onStateUpdate(e) {
      this.applyState(e.detail);
    },
    applyState(s) {
      this.isRunning = !!s.isRunning;
      this.totalDuration = s.totalDuration || 0;
      this.deadline = s.deadline || null;
      // Hitung timeLeft dari deadline agar langsung akurat
      if (this.isRunning && this.deadline) {
        this.timeLeft = Math.max(0, Math.round((this.deadline - Date.now()) / 1000));
        this.pausedTimeLeft = null;
      } else {
        this.timeLeft = s.timeLeft || 0;
        if (!this.isRunning && this.timeLeft > 0) {
          this.pausedTimeLeft = this.timeLeft;
        }
      }
    },
    // Toggle pause/resume dari floating timer
    togglePause() {
      if (this.isRunning) {
        // Pause: simpan sisa waktu, set isRunning false, update localStorage
        this.pausedTimeLeft = this.timeLeft;
        this.isRunning = false;
        this.deadline = null;
        const state = {
          isRunning: false,
          timeLeft: this.pausedTimeLeft,
          totalDuration: this.totalDuration,
          deadline: null,
          ts: Date.now()
        };
        localStorage.setItem('pomo_floating_state', JSON.stringify(state));
        // Dispatch ke PomodoroTimer kalau kebetulan masih mounted
        window.dispatchEvent(new CustomEvent('pomo-state-update', { detail: state }));
      } else if (this.pausedTimeLeft !== null && this.pausedTimeLeft > 0) {
        // Resume: set deadline baru berdasarkan pausedTimeLeft
        const newDeadline = Date.now() + (this.pausedTimeLeft * 1000);
        this.deadline = newDeadline;
        this.timeLeft = this.pausedTimeLeft;
        this.isRunning = true;
        this.pausedTimeLeft = null;
        const state = {
          isRunning: true,
          timeLeft: this.timeLeft,
          totalDuration: this.totalDuration,
          deadline: newDeadline,
          ts: Date.now()
        };
        localStorage.setItem('pomo_floating_state', JSON.stringify(state));
        window.dispatchEvent(new CustomEvent('pomo-state-update', { detail: state }));
      }
    },
    // Klik floating timer → navigasi ke halaman Jam Pasir Pomodoro
    goToPomodoro() {
      window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'pomodoroTimer' }));
    }
  }
};

// Start application
const app = createApp(App);

// Register individual modular components
app.component('job-logbook', JobLogbook);
app.component('calendar-moment', CalendarMoment);
app.component('content-tracker', ContentTracker);
app.component('interview-practice', InterviewPractice);
app.component('daily-nutrition', DailyNutrition);
app.component('habit-tracker', HabitTracker);
app.component('pomodoro-timer', PomodoroTimer);
app.component('google-calendar', GoogleCalendar);
app.component('icon-manager', IconManager);
app.component('floating-countdown-timer', FloatingCountdownTimer);

app.mount('#app');
