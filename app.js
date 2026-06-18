// ============================================================================
// LOGIKA UTAMA APLIKASI VUE 3 (app.js)
// ============================================================================
// Berfungsi untuk mengelola navigasi halaman, state global bulan (untuk Habit Tracker 
// & Kalender), koordinat drag-and-drop benda di meja, serta memuat pengaturan ikon.
// Semua data otomatis tersimpan di penyimpanan lokal browser Anda (localStorage).
// Sangat sederhana, tanpa kompilasi rumit, sehingga Anda bisa langsung edit file ini!

    const { createApp, ref, reactive, onMounted } = Vue;

const App = {
  setup() {
    // --- 1. STATE NAVIGASI & DIALOG ---
    // activePage menentukan halaman mana yang sedang aktif ('dashboard' atau key halaman sub-program)
    const activePage = ref('dashboard');
    const showSettings = ref(false);
    const showNavDrawer = ref(false);
    const showNotifPanel = ref(false);
    const showInspirationModal = ref(false);
    const showDzikirModal = ref(false);

    // --- TAB BAR STATE (mirip Chrome) ---
    // Lucide SVG path strings — dirender via v-html di tab favicon
    const _lc = (paths) =>
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

    const PAGE_LABELS = {
      dashboard: {
        label: 'My Desk',
        icon: _lc('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>')
      },
      jobLogbook: {
        label: 'Job Logbook',
        icon: _lc('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>')
      },
      calendarMoment: {
        label: 'Calendar Moment',
        icon: _lc('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>')
      },
      contentTracker: {
        label: 'Content Tracker',
        icon: _lc('<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>')
      },
      interviewPractice: {
        label: 'Interview Practice',
        icon: _lc('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>')
      },
      dailyNutrition: {
        label: 'Daily Nutrition',
        icon: _lc('<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>')
      },
      habitTracker: {
        label: 'Habit Tracker',
        icon: _lc('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>')
      },
      pomodoroTimer: {
        label: 'Pomodoro',
        icon: _lc('<path d="M5 2h14"/><path d="M5 22h14"/><path d="M19 2v4c0 3-2.5 4.5-5 5.5 2.5 1 5 2.5 5 5.5v4"/><path d="M5 2v4c0 3 2.5 4.5 5 5.5-2.5 1-5 2.5-5 5.5v4"/>')
      },
      googleCalendar: {
        label: 'Daily N',
        icon: _lc('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>')
      },
      financialTracker: {
        label: 'Financial',
        icon: _lc('<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>')
      },
      careerFoundation: {
        label: 'Career',
        icon: _lc('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>')
      },
      missedTasksPage: {
        label: 'Tugas Terlewat',
        icon: _lc('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')
      },
    };

    // openTabs: array of { id, pageKey } — urutan tab
    const openTabs = ref([
      { id: 'tab-dashboard', pageKey: 'dashboard' }
    ]);
    const activeTabId = ref('tab-dashboard');
    let _tabCounter = 1;

    // Buka tab baru atau fokus ke tab yang sudah ada
    const openOrFocusTab = (pageKey) => {
      // Cek apakah tab dengan pageKey ini sudah ada
      const existing = openTabs.value.find(t => t.pageKey === pageKey);
      if (existing) {
        activeTabId.value = existing.id;
        activePage.value = pageKey;
        return;
      }
      // Buat tab baru
      const newId = `tab-${++_tabCounter}`;
      openTabs.value.push({ id: newId, pageKey });
      activeTabId.value = newId;
      activePage.value = pageKey;
    };

    // Tutup tab
    const closeTab = (tabId) => {
      const idx = openTabs.value.findIndex(t => t.id === tabId);
      if (idx === -1) return;
      // Jangan tutup kalau cuma 1 tab tersisa
      if (openTabs.value.length <= 1) return;
      openTabs.value.splice(idx, 1);
      // Kalau tab yang ditutup adalah tab aktif, pindah ke tab sebelah kiri (atau kanan)
      if (activeTabId.value === tabId) {
        const newIdx = Math.max(0, idx - 1);
        activeTabId.value = openTabs.value[newIdx].id;
        activePage.value = openTabs.value[newIdx].pageKey;
      }
    };

    // Pindah ke tab
    const switchTab = (tab) => {
      activeTabId.value = tab.id;
      activePage.value = tab.pageKey;
    };

    // Desk quote ticker state
    const deskQuotes = ref([]);
    const deskQuoteIndex = ref(0);
    const deskQuoteVisible = ref(false);

    const loadDeskQuotes = () => {
      try {
        const saved = WorkspaceStorage.getItem('inspiration_quotes');
        if (saved) {
          const parsed = JSON.parse(saved);
          deskQuotes.value = parsed;
          deskQuoteVisible.value = parsed.length > 0;
        }
      } catch(_e) {}
    };

    const deskCurrentQuote = Vue.computed(() => {
      if (!deskQuotes.value.length) return '';
      return deskQuotes.value[deskQuoteIndex.value]?.quote || '';
    });
    const deskCurrentSource = Vue.computed(() => {
      if (!deskQuotes.value.length) return '';
      return deskQuotes.value[deskQuoteIndex.value]?.source || '';
    });

    let _deskQuoteTimer = null;
    const startDeskQuoteCycle = () => {
      if (_deskQuoteTimer) clearInterval(_deskQuoteTimer);
      _deskQuoteTimer = setInterval(() => {
        loadDeskQuotes();
        if (deskQuotes.value.length > 1) {
          deskQuoteIndex.value = (deskQuoteIndex.value + 1) % deskQuotes.value.length;
        }
      }, 7000);
    };

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

    // Helper: hex -> { r, g, b }
    const hexToRgb = (hex) => {
      const h = hex.replace('#', '');
      return {
        r: parseInt(h.substring(0,2), 16),
        g: parseInt(h.substring(2,4), 16),
        b: parseInt(h.substring(4,6), 16)
      };
    };
    // Helper: { r, g, b } -> hex
    const rgbToHex = ({ r, g, b }) =>
      '#' + [r, g, b].map(v => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2,'0')).join('');
    // Darken: kurangi brightness sekian persen
    const darkenColor = (hex, amount) => {
      const { r, g, b } = hexToRgb(hex);
      return rgbToHex({ r: r * (1 - amount), g: g * (1 - amount), b: b * (1 - amount) });
    };
    // Lighten: naikkan brightness (disimpan untuk penggunaan di masa depan)
    const _lightenColor = (hex, amount) => {
      const { r, g, b } = hexToRgb(hex);
      return rgbToHex({ r: r + (255 - r) * amount, g: g + (255 - g) * amount, b: b + (255 - b) * amount });
    };
    void _lightenColor; // suppress unused warning

    const setDominantColor = (colorHex) => {
      dominantColor.value = colorHex;
      WorkspaceStorage.setItem('aesthetic_workspace_dominant_color', colorHex);
      // Warna utama tema
      document.documentElement.style.setProperty('--color-terracotta', colorHex);
      // RGB triplet untuk dipakai di rgba() — misal neumorphic tab border
      const { r: tr, g: tg, b: tb } = hexToRgb(colorHex);
      document.documentElement.style.setProperty('--color-terracotta-rgb', `${tr}, ${tg}, ${tb}`);
      // --color-amber: versi lebih gelap dari tema, dipakai mode missed popup
      const amberColor = darkenColor(colorHex, 0.18);
      document.documentElement.style.setProperty('--color-amber', amberColor);
      // --color-amber-bg: background item missed (sangat transparan)
      const { r, g, b } = hexToRgb(amberColor);
      document.documentElement.style.setProperty('--color-amber-bg', `rgba(${r},${g},${b},0.10)`);
      document.documentElement.style.setProperty('--color-amber-bg-light', `rgba(${r},${g},${b},0.06)`);
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
        label: '8. Daily N',
        num: '08'
      },
      financialTracker: {
        iconId: 'Lime Green Pager',   // ganti iconId sesuai icon yang kamu mau
        x: 40,
        y: 70,
        customUrl: '',
        label: '9. Financial Tracker',
        num: '09'
      },
      careerFoundation: {
        iconId: 'alarm_clock',
        x: 55,
        y: 80,
        customUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2080%2080%22%20fill%3D%22none%22%3E%3Cellipse%20cx%3D%2240%22%20cy%3D%2272%22%20rx%3D%2228%22%20ry%3D%225%22%20fill%3D%22rgba%2861%2C46%2C34%2C0.10%29%22/%3E%3Crect%20x%3D%2210%22%20y%3D%2230%22%20width%3D%2260%22%20height%3D%2240%22%20rx%3D%226%22%20fill%3D%22%23FAF7F2%22%20stroke%3D%22%23E8DFD8%22%20stroke-width%3D%222%22/%3E%3Crect%20x%3D%2210%22%20y%3D%2230%22%20width%3D%2260%22%20height%3D%2210%22%20rx%3D%226%22%20fill%3D%22%23F0EAE2%22/%3E%3Crect%20x%3D%2210%22%20y%3D%2236%22%20width%3D%2260%22%20height%3D%224%22%20fill%3D%22%23F0EAE2%22/%3E%3Crect%20x%3D%2232%22%20y%3D%2246%22%20width%3D%2216%22%20height%3D%2210%22%20rx%3D%223%22%20fill%3D%22%23D67B52%22%20opacity%3D%220.9%22/%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2251%22%20r%3D%222.5%22%20fill%3D%22%23FAF7F2%22/%3E%3Cpath%20d%3D%22M28%2030%20C28%2022%2052%2022%2052%2030%22%20stroke%3D%22%23C8BDB5%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20fill%3D%22none%22/%3E%3Ctext%20x%3D%2254%22%20y%3D%2222%22%20font-size%3D%2210%22%20fill%3D%22%23D67B52%22%20opacity%3D%220.8%22%3E%26%2310022%3B%3C/text%3E%3Cline%20x1%3D%2210%22%20y1%3D%2240%22%20x2%3D%2270%22%20y2%3D%2240%22%20stroke%3D%22%23E8DFD8%22%20stroke-width%3D%221.5%22/%3E%3C/svg%3E',
        label: '11. Career Foundation',
        num: '11'
      }
    };

    const assignedIcons = reactive({});

    // Drag and Drop tracking state
    let draggingKey = null;
    let dragStartOffset = { x: 0, y: 0 }; // object properties mutated, not reassigned
    let hasDragged = false;
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
        if (!assignedIcons.financialTracker) {
          assignedIcons.financialTracker = { ...defaultAssignedIcons.financialTracker };
        }
        if (!assignedIcons.careerFoundation) {
          assignedIcons.careerFoundation = { ...defaultAssignedIcons.careerFoundation };
        }
        // Force-update customUrl jika sebelumnya pakai iconId 'notebook' yang tidak ada di assets
        if (!assignedIcons.careerFoundation.customUrl && assignedIcons.careerFoundation.iconId === 'notebook') {
          assignedIcons.careerFoundation.customUrl = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2080%2080%22%20fill%3D%22none%22%3E%3Cellipse%20cx%3D%2240%22%20cy%3D%2272%22%20rx%3D%2228%22%20ry%3D%225%22%20fill%3D%22rgba%2861%2C46%2C34%2C0.10%29%22/%3E%3Crect%20x%3D%2210%22%20y%3D%2230%22%20width%3D%2260%22%20height%3D%2240%22%20rx%3D%226%22%20fill%3D%22%23FAF7F2%22%20stroke%3D%22%23E8DFD8%22%20stroke-width%3D%222%22/%3E%3Crect%20x%3D%2210%22%20y%3D%2230%22%20width%3D%2260%22%20height%3D%2210%22%20rx%3D%226%22%20fill%3D%22%23F0EAE2%22/%3E%3Crect%20x%3D%2210%22%20y%3D%2236%22%20width%3D%2260%22%20height%3D%224%22%20fill%3D%22%23F0EAE2%22/%3E%3Crect%20x%3D%2232%22%20y%3D%2246%22%20width%3D%2216%22%20height%3D%2210%22%20rx%3D%223%22%20fill%3D%22%23D67B52%22%20opacity%3D%220.9%22/%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2251%22%20r%3D%222.5%22%20fill%3D%22%23FAF7F2%22/%3E%3Cpath%20d%3D%22M28%2030%20C28%2022%2052%2022%2052%2030%22%20stroke%3D%22%23C8BDB5%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20fill%3D%22none%22/%3E%3Ctext%20x%3D%2254%22%20y%3D%2222%22%20font-size%3D%2210%22%20fill%3D%22%23D67B52%22%20opacity%3D%220.8%22%3E%26%2310022%3B%3C/text%3E%3Cline%20x1%3D%2210%22%20y1%3D%2240%22%20x2%3D%2270%22%20y2%3D%2240%22%20stroke%3D%22%23E8DFD8%22%20stroke-width%3D%221.5%22/%3E%3C/svg%3E';
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

    // Navigation helper — buka di tab baru jika belum terbuka, atau fokus tab existing
    const navigateTo = (pageKey) => {
      openOrFocusTab(pageKey);
      showNavDrawer.value = false;
    };

    // Click handler for desk icons — skip navigation if it was a drag
    const handleIconClick = (pageKey) => {
      if (hasDragged) return;
      openOrFocusTab(pageKey);
    };

    // Drag-and-drop mechanics
    const startDrag = (event, pageKey) => {
      // Don't drag if clicking buttons/inputs inside label, only handle main element
      if (event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT') return;
      
      draggingKey = pageKey;
      hasDragged = false;
      const clientX = event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX;
      const clientY = event.type.startsWith('touch') ? event.touches[0].clientY : event.clientY;

      const rect = event.currentTarget.getBoundingClientRect();
      
      // Save click offset inside the dragged element
      dragStartOffset.x = clientX - rect.left;
      dragStartOffset.y = clientY - rect.top;

      // Add dynamic dragging listeners globally
      globalThis.addEventListener('mousemove', onDrag);
      globalThis.addEventListener('touchmove', onDrag, { passive: false });
      globalThis.addEventListener('mouseup', endDrag);
      globalThis.addEventListener('touchend', endDrag);
    };

    const onDrag = (event) => {
      if (!draggingKey) return;
      event.preventDefault();
      hasDragged = true;

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
      // hasDragged stays true briefly so the @click handler can read it,
      // then reset after a microtask (click fires after mouseup)
      setTimeout(() => { hasDragged = false; }, 0);
      globalThis.removeEventListener('mousemove', onDrag);
      globalThis.removeEventListener('touchmove', onDrag);
      globalThis.removeEventListener('mouseup', endDrag);
      globalThis.removeEventListener('touchend', endDrag);
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

    onMounted(async () => {
      // ✅ FIX: Tunggu Supabase storage selesai fetch data sebelum baca/tulis apapun.
      // Tanpa ini, komponen baca data sebelum Supabase kelar → dapat null →
      // tulis default value → overwrite data device utama di Supabase.
      await globalThis._workspaceStorageReady;

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
      globalThis.addEventListener('navigate-to-page', (e) => {
        navigateTo(e.detail);
      });

      // Handle navigation from MissedTasksPage (ws-navigate event)
      globalThis.addEventListener('ws-navigate', (e) => {
        if (e.detail && e.detail.page) navigateTo(e.detail.page);
      });

      // Handle klik notifikasi push (habit) — diteruskan dari push-notifications.js
      globalThis.addEventListener('ws-trigger-habit', (e) => {
        if (e.detail && e.detail.habitId) onTriggerHabit(e.detail.habitId);
      });

      // Load & start quote ticker after storage ready
      globalThis._workspaceStorageReady.then(() => {
        loadDeskQuotes();
        startDeskQuoteCycle();
      });

      // Refresh quotes when InspirationBoard saves new ones
      globalThis.addEventListener('inspiration-quotes-updated', () => {
        loadDeskQuotes();
      });
    });

    // Badge notif bell — diupdate reactif oleh event 'unread-count-changed' dari NotificationPanel
    const notifPanelRef = ref(null);
    const notifUnreadCount = ref(0);

    // Pending habit trigger — set saat klik habit di notif, dikonsumsi oleh HabitTracker
    const pendingHabitTrigger = ref(null);

    // Handler dipanggil oleh <notification-panel @unread-count-changed="...">
    const onUnreadCountChanged = (count) => {
      notifUnreadCount.value = count;
    };

    // Handler dipanggil saat item "Dzikir Waktu" yang masih terkunci diklik di notif panel
    // → buka modal Dzikir Counter supaya user bisa langsung menuntaskan dzikirnya.
    const onOpenDzikir = () => {
      showNotifPanel.value = false;
      showDzikirModal.value = true;
    };

    // Handler dipanggil saat klik habit di notif panel / reminder popup
    const onTriggerHabit = (habitId) => {
      openOrFocusTab('habitTracker');
      showNotifPanel.value = false;
      // Beri jeda kecil agar HabitTracker sempat mount sebelum trigger dikirim
      setTimeout(() => {
        pendingHabitTrigger.value = habitId;
      }, 120);
    };

    // Reset trigger setelah HabitTracker mengonsumsinya
    const onHabitTriggered = () => {
      pendingHabitTrigger.value = null;
    };

    return {
      activePage,
      showSettings,
      showNavDrawer,
      showNotifPanel,
      showInspirationModal,
      showDzikirModal,
      // Tab bar
      openTabs,
      activeTabId,
      PAGE_LABELS,
      closeTab,
      switchTab,
      openOrFocusTab,
      deskQuotes,
      deskQuoteIndex,
      deskQuoteVisible,
      deskCurrentQuote,
      deskCurrentSource,
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
      handleIconClick,
      handleUpdateMapping,
      notifPanelRef,
      notifUnreadCount,
      onUnreadCountChanged,
      onOpenDzikir,
      pendingHabitTrigger,
      onTriggerHabit,
      onHabitTriggered


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
// ============================================================================
// FLOATING COUNTDOWN TIMER — Global Persistent Component
// ============================================================================
// Aturan sederhana:
//   - HANYA muncul jika localStorage('pomo_floating_state').everStarted === true
//     DAN (isRunning === true ATAU timeLeft > 0 / sedang pause)
//   - Saat PomodoroTimer mount: dia set everStarted=true tiap broadcast
//   - Saat PomodoroTimer reset: dia hapus localStorage dan broadcast everStarted=false
//   - Tombol pause: FloatingCountdownTimer handle sendiri (PomodoroTimer sudah unmount)
//   - Klik area timer: navigate ke pomodoroTimer
// ============================================================================
const FloatingCountdownTimer = {
  template: `
    <transition name="fct-slide">
      <div v-if="visible" class="fct-wrapper" @click.self="goToPomodoro">
        <div class="fct-icon" @click="goToPomodoro" style="cursor:pointer;" title="Buka Jam Pasir Pomodoro">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
               class="fct-hg-icon"
               :style="{ animationPlayState: isRunning ? 'running' : 'paused' }">
            <path d="M5 2h14"></path>
            <path d="M5 22h14"></path>
            <path d="M19 2v4c0 3-2.5 4.5-5 5.5c2.5 1 5 2.5 5 5.5v4"></path>
            <path d="M5 2v4c0 3 2.5 4.5 5 5.5c-2.5 1-5 2.5-5 5.5v4"></path>
          </svg>
        </div>
        <div class="fct-body" @click="goToPomodoro" style="cursor:pointer;">
          <span class="fct-label">{{ isRunning ? 'WAKTU TERSISA' : 'DIJEDA' }}</span>
          <span class="fct-time" :style="{ opacity: isRunning ? 1 : 0.55 }">{{ formattedTime }}</span>
        </div>
        <svg class="fct-ring" viewBox="0 0 36 36" width="52" height="52"
             @click="goToPomodoro" style="cursor:pointer;">
          <circle class="fct-ring-bg" cx="18" cy="18" r="15.5" fill="none" stroke-width="2.5"/>
          <circle class="fct-ring-fill" cx="18" cy="18" r="15.5" fill="none" stroke-width="2.5"
            :stroke-dasharray="97.4" :stroke-dashoffset="ringOffset"
            stroke-linecap="round" transform="rotate(-90 18 18)"
            :style="{ opacity: isRunning ? 1 : 0.45 }"/>
        </svg>
        <button class="fct-pause-btn" @click.stop="togglePause"
                :title="isRunning ? 'Jeda timer' : 'Lanjutkan timer'">
          <svg v-if="isRunning" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
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
      isRunning:     false,
      timeLeft:      0,
      totalDuration: 0,
      deadline:      null,
      currentMode:   'focus',
      everStarted:   false,
    };
  },
  computed: {
    visible() {
      // Hanya tampil jika pernah distart DAN masih ada waktu (running atau pause)
      // DAN bukan di halaman yang sudah punya timer sendiri
      return this.everStarted
          && (this.isRunning || this.timeLeft > 0)
          && this.activePage !== 'dashboard'
          && this.activePage !== 'pomodoroTimer';
    },
    formattedTime() {
      const t = Math.max(0, this.timeLeft);
      return `${String(Math.floor(t / 60)).padStart(2,'0')} : ${String(t % 60).padStart(2,'0')}`;
    },
    ringOffset() {
      if (this.totalDuration <= 0) return 97.4;
      const fraction = Math.min(1, Math.max(0,
        (this.totalDuration - this.timeLeft) / this.totalDuration));
      return (97.4 * fraction).toFixed(2);
    }
  },
  mounted() {
    this._loadFromStorage();
    globalThis.addEventListener('pomo-state-update', this._onPomoUpdate);
    this._ticker = setInterval(this._tick, 1000);
  },
  beforeUnmount() {
    globalThis.removeEventListener('pomo-state-update', this._onPomoUpdate);
    clearInterval(this._ticker);
  },
  methods: {
    // ── Baca state dari localStorage saat pertama mount ──
    _loadFromStorage() {
      try {
        const raw = localStorage.getItem('pomo_floating_state');
        if (!raw) return;
        const s = JSON.parse(raw);
        // Guard utama: hanya apply kalau memang pernah distart
        if (!s.everStarted) return;
        this._applyState(s);
      } catch(_e) { /* ignore parse errors */ }
    },

    // ── Tick setiap detik ──
    _tick() {
      // Saat di halaman PomodoroTimer, dia yang handle — skip
      if (this.activePage === 'pomodoroTimer') return;
      // Saat pause, timeLeft sudah tersimpan — tidak perlu hitung dari deadline
      if (!this.isRunning) return;
      // Running: hitung dari deadline
      if (!this.deadline) return;
      const remaining = Math.round((this.deadline - Date.now()) / 1000);
      if (remaining <= 0) {
        this.timeLeft    = 0;
        this.isRunning   = false;
        this.deadline    = null;
        this.everStarted = false;
        localStorage.removeItem('pomo_floating_state');
      } else {
        this.timeLeft = remaining;
      }
    },

    // ── Terima update dari PomodoroTimer via CustomEvent ──
    _onPomoUpdate(e) {
      this._applyState(e.detail);
    },

    _applyState(s) {
      // Jika everStarted false → reset semua (timer direset/belum pernah jalan)
      if (!s.everStarted) {
        this.everStarted   = false;
        this.isRunning     = false;
        this.timeLeft      = 0;
        this.totalDuration = 0;
        this.deadline      = null;
        return;
      }
      this.everStarted   = true;
      this.isRunning     = !!s.isRunning;
      this.totalDuration = s.totalDuration || 0;
      this.currentMode   = s.currentMode   || 'focus';
      this.deadline      = s.deadline      || null;

      if (this.isRunning && this.deadline) {
        // Running: hitung timeLeft aktual dari deadline
        this.timeLeft = Math.max(0, Math.round((this.deadline - Date.now()) / 1000));
      } else {
        // Pause atau idle: pakai timeLeft yang tersimpan
        this.timeLeft = s.timeLeft || 0;
      }
    },

    // ── Pause / Resume — FloatingCountdownTimer handle sendiri ──
    // PomodoroTimer sudah unmount saat user di halaman lain.
    // Saat user balik ke pomodoroTimer, loadState() akan baca localStorage
    // dan resume dari state yang tersimpan di sini.
    togglePause() {
      if (this.isRunning) {
        // ── PAUSE ──
        const actualLeft = this.deadline
          ? Math.max(0, Math.round((this.deadline - Date.now()) / 1000))
          : this.timeLeft;

        this.isRunning = false;
        this.deadline  = null;
        this.timeLeft  = actualLeft;

        const state = {
          isRunning:     false,
          timeLeft:      actualLeft,
          totalDuration: this.totalDuration,
          currentMode:   this.currentMode,
          deadline:      null,
          everStarted:   true,
          ts:            Date.now()
        };
        localStorage.setItem('pomo_floating_state', JSON.stringify(state));

      } else if (this.timeLeft > 0) {
        // ── RESUME ──
        const newDeadline = Date.now() + (this.timeLeft * 1000);

        this.isRunning = true;
        this.deadline  = newDeadline;

        const state = {
          isRunning:     true,
          timeLeft:      this.timeLeft,
          totalDuration: this.totalDuration,
          currentMode:   this.currentMode,
          deadline:      newDeadline,
          everStarted:   true,
          ts:            Date.now()
        };
        localStorage.setItem('pomo_floating_state', JSON.stringify(state));
      }
    },

    goToPomodoro() {
      globalThis.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'pomodoroTimer' }));
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
app.component('financial-tracker', FinancialTracker);
app.component('career-foundation', CareerFoundation);
app.component('notification-panel', NotificationPanel);
app.component('reminder-popup', ReminderPopup);
app.component('missed-tasks-page', MissedTasksPage);
app.component('inspiration-board', InspirationBoard);
app.component('dzikir-counter', DzikirCounter);
app.component('push-notif-toggle', PushNotifToggle);

app.mount('#app');
