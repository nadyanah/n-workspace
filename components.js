// ============================================================================
// DAFTAR KOMPONEN MODULAR VUE 3 (components.js)
// ============================================================================
// File ini menyimpan seluruh kode dari 6 halaman utama beserta Pengaturan Ikon Meja.
// Semuanya ditulis dalam format Vue 3 murni (berjalan langsung di browser Anda).
// Silakan gunakan pintasan Baris atau pencarian untuk mengedit halaman tertentu:
//
// 📌 DAFTAR ISI HALAMAN:
// 1. My 8-4 Job Logbook ......... (Baris ~30)  - Pencatatan aktivitas harian & ekspor data
// 2. Calendar Moment ............ (Baris ~600) - Kalender digital dan catatan memo cepat
// 3. Content Plan & Tracker ..... (Baris ~815) - Penjadwalan postingan media sosial/konten
// 4. Interview Practice ......... (Baris ~960) - Latihan wawancara interaktif dengan audio
// 5. Daily Nutrition & Insights . (Baris ~1135)- Pelacakan nutrisi harian & asupan air
// 6. Habit Tracker .............. (Baris ~1280)- Grafik progress habit bulanan & checklist
// 7. Icon Manager (Pengaturan) .. (Baris ~1780)- Pengubah model ikon & custom URL gambar
// ============================================================================

// ── Helper global: cek apakah pengingat manual berlaku pada tanggal tertentu ──
// Mendukung recurrence ala Google Calendar: none, daily, weekly, monthly, yearly, weekday
// m.date = tanggal mulai berlaku (start date); recurrence menentukan pengulangan setelahnya
if (typeof reminderOccursOnDate === 'undefined') {
  var reminderOccursOnDate = function(m, dateStr) {
    if (!m || !m.date || !dateStr) return false;
    const rec = m.recurrence || 'none';
    if (dateStr < m.date) return false; // belum mulai
    if (m.endDate && dateStr > m.endDate) return false; // sudah berakhir
    if (m.excludedDates && m.excludedDates.includes(dateStr)) return false; // tanggal yang di-skip (mode "acara ini saja")

    // ── Custom recurrence ──
    if (rec === 'custom' && m.customRecurrence) {
      const c = m.customRecurrence;
      const start = new Date(m.date + 'T00:00:00');
      const target = new Date(dateStr + 'T00:00:00');
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
          // Hitung berapa kali sudah occur dari start s/d target
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
        const day = target.getDay();
        return day >= 1 && day <= 5;
      }
      case 'weekly':
        return start.getDay() === target.getDay();
      case 'monthly':
        return start.getDate() === target.getDate();
      case 'yearly':
        return start.getDate() === target.getDate() && start.getMonth() === target.getMonth();
      default:
        return m.date === dateStr;
    }
  };
}

// ── Helper global: format tanggal ke 'YYYY-MM-DD' berdasarkan LOCAL timezone ──
// Menggantikan new Date().toISOString().split('T')[0] yang pakai UTC dan bisa
// "geser" mundur 1 hari saat user di timezone +UTC (WIB = UTC+7) sebelum jam 07.00.
if (typeof localDateStr === 'undefined') {
  var localDateStr = function(date) {
    const d = date instanceof Date ? date : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  // Helper untuk YYYY-MM (bulan & tahun lokal)
  var localMonthStr = function(date) {
    const d = date instanceof Date ? date : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };
}

// 1. My 8-4 Job Logbook Component
const JobLogbook = {
  template: `
    <div class="job-logbook">
      <div v-show="!showFullNotesPage" class="animate-fade-in">
        <!-- ── Page Header ── -->
        <div style="margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid var(--color-sand);">
          <!-- Title row -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
            <div>
              <h2 style="margin: 0 0 4px 0; font-size: 24px; font-weight: 800; color: var(--text-dark);">My 8-9 Job Logbook</h2>
              <p style="color: var(--text-muted); font-size: 13px; margin: 0; max-width: 520px; line-height: 1.5;">Perekaman aktivitas harian kerja, kategori dinamis, hasil capaian, rencana aksi selanjutnya, dan koordinasi dokumen pendukung.</p>
            </div>
            <!-- Actions: primary buttons only -->
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap;">
              <button class="btn text-mono" @click="showManageCategories = true" style="background-color: #FFF4ED; border: 1.5px solid #D67B52; color: #8C4B2D; font-weight: bold; cursor: pointer; padding: 7px 14px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px; border-radius: 8px;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                Kelola Kategori
              </button>
              <button class="btn btn-primary" @click="showAddLog = true" style="padding: 10px 20px; font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Catat Hari Baru
              </button>
            </div>
          </div>

          <!-- Filter row: always visible below the title row -->
          <div style="margin-top: 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;" @click.self="showRangePicker = false">

            <!-- Keyword Search -->
            <div style="position: relative; flex-shrink: 0;">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 9px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
              <input type="text" v-model="searchQuery" placeholder="Cari kata kunci..." @click.stop
                style="width: 200px; height: 34px; padding: 0 10px 0 28px; border: 1.5px solid var(--color-sand); border-radius: 8px; font-size: 12.5px; font-family: 'Outfit', sans-serif; color: var(--text-dark); background: var(--bg-cream); box-sizing: border-box; outline: none; transition: border-color 0.15s;"
                @focus="$event.target.style.borderColor='var(--color-terracotta)'" @blur="$event.target.style.borderColor='var(--color-sand)'" />
            </div>

            <!-- Date Range Button + Dropdown -->
            <div style="position: relative; flex-shrink: 0;">
              <button type="button" @click.stop="showRangePicker = !showRangePicker"
                :style="(filterStartDate || filterEndDate) ? { borderColor: 'var(--color-terracotta)', background: '#FFF4ED', color: 'var(--color-terracotta)' } : { borderColor: 'var(--color-sand)', background: 'var(--bg-cream)', color: 'var(--text-muted)' }"
                style="height: 34px; padding: 0 12px; border: 1.5px solid; border-radius: 8px; font-size: 12px; font-family: 'Outfit', sans-serif; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; transition: all 0.15s;">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <template v-if="filterStartDate || filterEndDate">{{ filterStartDate ? formatDate(filterStartDate) : '?' }} – {{ filterEndDate ? formatDate(filterEndDate) : '?' }}</template>
                <template v-else>Rentang Tanggal</template>
              </button>
              <!-- Calendar Dropdown -->
              <div v-if="showRangePicker" @click.stop style="position: absolute; top: calc(100% + 6px); left: 0; z-index: 9999; background: #fff; border: 1.5px solid var(--color-sand); border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.14); padding: 14px; min-width: 272px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <button type="button" @click="rangeCalPrevMonth" style="background: none; border: none; cursor: pointer; font-size: 15px; color: var(--text-dark); padding: 4px 8px; border-radius: 6px; line-height: 1;">&lt;</button>
                  <span style="font-weight: 700; font-size: 13.5px; color: var(--text-dark);">{{ rangeCalMonthLabel }}</span>
                  <button type="button" @click="rangeCalNextMonth" style="background: none; border: none; cursor: pointer; font-size: 15px; color: var(--text-dark); padding: 4px 8px; border-radius: 6px; line-height: 1;">&gt;</button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 3px;">
                  <span v-for="(d, i) in ['S','S','R','K','J','S','M']" :key="'fh'+i" style="text-align: center; font-size: 10px; font-weight: 700; color: var(--text-muted); padding: 2px 0;">{{ d }}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;">
                  <span v-for="cell in rangeCalCells" :key="cell.key" @click="cell.date ? onRangeCalClick(cell.date) : null"
                    :style="getRangeCellStyle(cell)"
                    style="text-align: center; font-size: 12.5px; padding: 5px 2px; border-radius: 6px; cursor: pointer; user-select: none; transition: background 0.12s;">
                    {{ cell.label }}
                  </span>
                </div>
                <div style="margin-top: 8px; font-size: 11px; color: var(--text-muted); text-align: center; line-height: 1.4;">
                  <span v-if="!filterStartDate">Klik tanggal mulai</span>
                  <span v-else-if="!filterEndDate">Klik tanggal akhir</span>
                  <span v-else style="color: var(--color-terracotta); font-weight: 600;">✓ Rentang dipilih</span>
                </div>
                <button v-if="filterStartDate || filterEndDate" type="button" @click="filterStartDate=''; filterEndDate=''; showRangePicker=false;"
                  style="margin-top: 7px; width: 100%; background: var(--bg-cream); border: 1px solid var(--color-sand); color: var(--text-dark); border-radius: 7px; padding: 5px; font-size: 11.5px; cursor: pointer; font-weight: 600;">
                  Hapus Rentang
                </button>
              </div>
            </div>

            <!-- Category Filter -->
            <div style="position: relative; flex-shrink: 0;" @click.stop>
              <button @click.stop="showFilterCategoryDD = !showFilterCategoryDD"
                :style="filterCategory ? { borderColor: 'var(--color-terracotta)', background: '#FFF4ED', color: 'var(--color-terracotta)' } : { borderColor: 'var(--color-sand)', background: 'var(--bg-cream)', color: 'var(--text-dark)' }"
                style="height: 34px; padding: 0 28px 0 10px; border: 1.5px solid; border-radius: 8px; font-size: 12.5px; font-family: 'Outfit', sans-serif; font-weight: 600; cursor: pointer; min-width: 140px; outline: none; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; white-space: nowrap; position: relative;">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
                {{ filterCategory || 'Semua Kategori' }}
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                  style="position: absolute; right: 8px;"
                  :style="{ transform: showFilterCategoryDD ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.18s' }">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div v-if="showFilterCategoryDD" @click.stop
                style="position: absolute; top: calc(100% + 5px); left: 0; z-index: 99999;
                       background: var(--color-paper, #FAF7F2);
                       border: 1.5px solid var(--color-sand-light, #EDE8E1);
                       border-radius: 14px;
                       box-shadow: 0 8px 32px rgba(61,46,34,0.16), 0 2px 8px rgba(61,46,34,0.08);
                       padding: 6px; min-width: 170px; max-height: 240px; overflow-y: auto;
                       scrollbar-width: thin; scrollbar-color: var(--color-sand) transparent;">
                <button @click.stop="filterCategory = ''; showFilterCategoryDD = false"
                  :style="!filterCategory ? { background: 'var(--color-sand-light,#EDE8E1)' } : {}"
                  style="width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; background: transparent; transition: background 0.13s;"
                  onmouseover="this.style.background='var(--color-cream,#FDF5EB)'" onmouseout="this.style.background='transparent'">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--color-sand,#C8BDB5)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
                  <span style="flex: 1; font-size: 12.5px; font-weight: 600; color: var(--text-secondary,#7A6F66);">Semua Kategori</span>
                  <svg v-if="!filterCategory" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <div style="height: 1px; background: var(--color-sand-light,#EDE8E1); margin: 3px 6px;"></div>
                <button v-for="cat in allCategories" :key="cat"
                  @click.stop="filterCategory = cat; showFilterCategoryDD = false"
                  :style="filterCategory === cat ? { background: 'rgba(214,123,82,0.08)' } : {}"
                  style="width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; background: transparent; transition: background 0.13s;"
                  onmouseover="this.style.background='rgba(214,123,82,0.07)'" onmouseout="this.style.background='transparent'">
                  <span :style="{ color: getCategoryColor(cat) }" style="flex-shrink: 0; display: inline-flex; align-items: center;">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  </span>
                  <span style="flex: 1; font-size: 12.5px; font-weight: 600; color: var(--text-dark,#3D2E22); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ cat }}</span>
                  <svg v-if="filterCategory === cat" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
              </div>
            </div>

            <!-- Active badge + Reset (only when filters active) -->
            <span v-if="searchQuery || filterStartDate || filterEndDate || filterCategory"
              style="background: var(--color-terracotta); color: #fff; font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 20px; white-space: nowrap;">
              {{ [searchQuery, (filterStartDate || filterEndDate) ? 1 : 0, filterCategory].filter(Boolean).length }} aktif
            </span>
            <button v-if="searchQuery || filterStartDate || filterEndDate || filterCategory"
              class="btn btn-secondary" @click="resetFilters"
              style="height: 34px; padding: 0 12px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; border-color: var(--color-terracotta); color: var(--color-terracotta); font-family: 'Outfit', sans-serif; display: inline-flex; align-items: center; gap: 5px; border-radius: 8px;">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
              Reset
            </button>
          </div>
        </div>



        <!-- ── Quick Notes ── -->
        <div style="margin-bottom: 24px; padding: 18px 20px; border-radius: 12px; background-color: transparent; border: 1.5px dashed var(--color-sand);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="font-size: 14px; font-weight: 700; color: var(--text-dark); display: flex; align-items: center; gap: 8px; margin: 0;">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-terracotta);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Quick Notes
              <span style="background: var(--color-terracotta); color: #fff; font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 20px;">{{ notes.length }}</span>
            </h3>
            <button class="btn btn-secondary" @click="showFullNotesPage = true" style="font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 600; padding: 7px 14px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; background-color: var(--bg-card);">
              Lihat Semua Note
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
          
          <div v-if="notes.length === 0" style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">
            Belum ada catatan. Klik "Lihat Semua Note" untuk menambahkan.
          </div>
          
          <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px;">
            <div v-for="note in recentNotes" :key="note.id" 
                 :style="{ backgroundColor: getNoteColorStyle(note.color).bg }"
                 style="border-radius: 10px; padding: 9px; cursor: pointer; transition: transform 0.2s;"
                 @click="showFullNotesPage = true"
                 onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding: 0 2px;">
                <span :style="{ color: getNoteColorStyle(note.color).headerText }" style="font-size: 11.5px; font-weight: 700;">
                  {{ note.category }}
                </span>
                <span :style="{ color: getNoteColorStyle(note.color).headerText }" style="font-weight: 700; opacity: 0.5; font-size: 14px; line-height: 1;">···</span>
              </div>
              
              <div style="background-color: #ffffff; border-radius: 8px; padding: 9px 10px; min-height: 76px; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
                <div style="font-size: 9.5px; color: var(--text-muted); margin-bottom: 3px; font-weight: 600;">{{ formatDate(note.date) }}</div>
                <h4 style="font-size: 12.5px; font-weight: 800; color: var(--text-dark); margin: 0 0 4px 0; line-height: 1.3;">
                  {{ note.title }}
                </h4>
                <p style="font-size: 11.5px; color: var(--text-muted); line-height: 1.45; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  {{ note.body }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <transition name="modal-fade">
          <div v-if="showAddLog" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(44, 38, 33, 0.6); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 99999;" @click.self="safeCloseAddLog">
            <div style="background: var(--bg-card); max-width: 540px; width: 90%; padding: 28px; border-radius: 16px; box-shadow: 0 16px 40px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;">
              
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-size: 18px; margin: 0; color: var(--text-dark); display: flex; align-items: center; gap: 8px;">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-terracotta);"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                  {{ editingLogId ? 'Edit Log Kerja' : 'Catat Logbook Harian' }}
                </h3>
                <button @click="cancelAddLog" style="background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:24px; line-height:1;">✕</button>
              </div>

              <!-- Banner info: sedang mengkonversi task plan -->
              <div v-if="pendingConvertPlanId && !editingLogId"
                   style="display:flex; align-items:center; gap:8px; background:#f0fdf4; border:1.5px solid #86efac; border-radius:8px; padding:8px 12px; margin-bottom:16px; font-size:12px; color:#065f46; font-weight:600;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
                Melanjutkan dari Task Plan — task akan dipindah ke riwayat setelah kamu klik Simpan. Batal untuk kembali.
              </div>

              <form @submit.prevent="saveLog">
                <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 12px; margin-bottom: 16px;">
                  <div class="form-group" style="margin: 0;">
                    <label>Tanggal</label>
                    <input type="date" class="form-input" v-model="form.date" required style="height: 42px;" />
                  </div>
                  <div class="form-group" style="margin: 0;">
                    <label>Kategori Pekerjaan</label>
                    <select class="form-input" v-model="form.category" required style="height: 42px;">
                      <option v-for="cat in allCategories" :key="cat" :value="cat">{{ cat }}</option>
                    </select>
                  </div>
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                  <label>Tugas / Deskripsi Kerja</label>
                  <textarea class="form-input" v-model="form.tasks" rows="3" placeholder="Sebutkan kegiatan atau tugas penting yang dikerjakan hari ini..." required></textarea>
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                  <label>Hasil yang Dicapai</label>
                  <textarea class="form-input" v-model="form.achievements" rows="2" placeholder="Apa hasil konkrit atau output dari tugas di atas?..." required></textarea>
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <label style="margin: 0;">Langkah Selanjutnya (Next Action)</label>
                    <button type="button" @click="addNextActionItem"
                      style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: var(--color-terracotta); background: #FFF4ED; border: 1.5px solid #F5C8A8; border-radius: 6px; padding: 3px 9px; cursor: pointer;">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Tambah Langkah
                    </button>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div v-for="(item, naIdx) in form.nextActions" :key="item.id"
                         style="display: flex; align-items: center; gap: 6px;">
                      <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); min-width: 18px; text-align: right;">{{ naIdx + 1 }}.</span>
                      <input type="text" class="form-input"
                             v-model="item.text"
                             :placeholder="'Langkah selanjutnya ' + (naIdx + 1) + '...'"
                             style="flex: 1; padding: 8px 10px; font-size: 13px;" />
                      <button type="button" @click="removeNextActionItem(naIdx)"
                              v-if="form.nextActions.length > 1"
                              style="flex-shrink: 0; width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center; background: #FEF2F2; border: 1.5px solid #FCA5A5; border-radius: 6px; cursor: pointer; color: var(--color-rose);">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                  <label>Tautan Dokumen, Link (Opsional)</label>
                  <input type="url" class="form-input" v-model="form.documentLink" placeholder="https://link-pendukung.com/laporan" />
                </div>
                <div class="form-group" style="margin-bottom: 24px; display: flex; align-items: center; gap: 8px; background: #FCFAF7; padding: 12px; border: 1.5px solid #EAE5DD; border-radius: 8px;">
                  <input type="checkbox" id="syncToContentCheckbox" v-model="syncToContentOnSave" style="width: 16px; height: 16px; accent-color: var(--color-terracotta); cursor: pointer;" />
                  <label for="syncToContentCheckbox" style="margin: 0; cursor: pointer; font-size: 12px; font-weight: 600; color: #5D4F43; display: flex; align-items: center; gap: 6px; user-select: none;">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-terracotta)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    Sync Langsung Jadi Konten Baru di Board
                  </label>
                </div>
                <div style="display: flex; gap: 10px;">
                  <button type="button" class="btn" @click="cancelAddLog" style="flex: 1; background-color: var(--bg-cream); border: 1.5px solid var(--color-sand); color: var(--text-dark); font-weight: bold; cursor: pointer; border-radius: 8px;">Batal</button>
                  <button type="submit" class="btn btn-primary" style="flex: 2;">{{ editingLogId ? 'Simpan Perubahan' : 'Simpan Entri Kerja' }}</button>
                </div>
              </form>
            </div>
          </div>
        </transition>

         <!-- ── Analytics + Distribusi ── -->
        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-bottom: 20px; align-items: stretch;">
          <!-- Ringkasan Analitik -->
          <div class="drawer-section" style="margin-bottom: 0; padding: 18px 20px; border-radius: 12px; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid var(--color-sand); padding-bottom: 12px; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
              <h3 style="font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px; margin: 0;">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-terracotta);"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                Ringkasan Analitik Performa
              </h3>
              <div style="display: flex; gap: 3px; background: var(--bg-cream); border: 1.5px solid var(--color-sand); border-radius: 8px; padding: 2px;">
                <button class="btn" :style="analyticsPeriod === 'semua' ? { background: 'var(--color-terracotta)', color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '6px' } : { background: 'transparent', color: 'var(--text-dark)', fontSize: '11px', padding: '4px 10px' }" @click="analyticsPeriod = 'semua'">Semua</button>
                <button class="btn" :style="analyticsPeriod === 'today' ? { background: 'var(--color-terracotta)', color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '6px' } : { background: 'transparent', color: 'var(--text-dark)', fontSize: '11px', padding: '4px 10px' }" @click="analyticsPeriod = 'today'">Hari Ini</button>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; flex: 1;">
              <div style="background-color: var(--bg-cream); border: 1px solid var(--color-sand); border-radius: 10px; padding: 14px 10px; text-align: center;">
                <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.04em; display: block; line-height: 1.3; margin-bottom: 8px;">Pekerjaan</span>
                <p class="text-mono" style="font-size: 22px; font-weight: bold; color: var(--text-dark); margin: 0;">{{ filteredLogs.length }}</p>
              </div>
              <div style="background-color: var(--bg-cream); border: 1px solid var(--color-sand); border-radius: 10px; padding: 14px 10px; text-align: center;">
                <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.04em; display: block; line-height: 1.3; margin-bottom: 8px;">Task Plan</span>
                <p class="text-mono" style="font-size: 22px; font-weight: bold; color: var(--text-dark); margin: 0;">{{ plans.length }}</p>
              </div>
              <div style="background-color: var(--bg-cream); border: 1px solid var(--color-sand); border-radius: 10px; padding: 14px 10px; text-align: center;">
                <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.04em; display: block; line-height: 1.3; margin-bottom: 8px;">Rentang</span>
                <p class="text-mono" style="font-size: 22px; font-weight: bold; color: var(--text-dark); margin: 0;">{{ selectedRangeDaysCount }} <span style="font-size: 11px; font-weight: normal;">hr</span></p>
              </div>
              <div style="background-color: var(--bg-cream); border: 1px solid var(--color-sand); border-radius: 10px; padding: 14px 10px; text-align: center;">
                <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.04em; display: block; line-height: 1.3; margin-bottom: 8px;">Penyelesaian</span>
                <p class="text-mono" style="font-size: 22px; font-weight: bold; color: var(--text-dark); margin: 0;">{{ nextActionCompletionRate }}</p>
              </div>
            </div>
          </div>
          <!-- Distribusi Kategori -->
          <div class="drawer-section" style="margin-bottom: 0; padding: 18px 20px; border-radius: 12px; display: flex; flex-direction: column;">
            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 14px; border-bottom: 1.5px solid var(--color-sand); padding-bottom: 10px; display: flex; align-items: center; gap: 6px;">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-sage);"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></svg>
              Distribusi Kategori
            </h3>
            <div style="display: flex; flex-direction: column; gap: 9px; flex: 1; overflow-y: auto; max-height: 130px; padding-right: 4px;">
              <div v-for="(pct, cat) in categoryPercentages" :key="cat">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; margin-bottom: 4px;">
                  <span style="font-weight: 600; color: var(--text-dark);">{{ cat }}</span>
                  <span class="text-mono" style="font-weight: bold; color: var(--text-muted);">{{ pct.count }}x ({{ pct.percentage }}%)</span>
                </div>
                <div style="width: 100%; background-color: var(--color-sand); height: 5px; border-radius: 10px; overflow: hidden;">
                  <div :style="{ width: pct.percentage + '%', backgroundColor: getCategoryColor(cat) }" style="height: 100%; border-radius: 10px; transition: width 0.3s ease;"></div>
                </div>
              </div>
              <div v-if="filteredLogs.length === 0" style="text-align: center; font-size: 12px; color: var(--text-muted); font-style: italic; margin-top: 10px;">
                Tidak ada data dalam filter aktif ini.
              </div>
            </div>
          </div>
        </div>

        <!-- ── Modal Kelola Kategori ── -->
        <transition name="modal-fade">
          <div v-if="showManageCategories" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(44,38,33,0.55); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 99999;" @click.self="showManageCategories = false">
            <div style="background: var(--bg-card); max-width: 460px; width: 90%; padding: 28px; border-radius: 16px; box-shadow: 0 16px 40px rgba(0,0,0,0.18); max-height: 80vh; overflow-y: auto;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 8px; color: var(--text-dark);">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #D67B52;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  Kelola Kategori Pekerjaan
                </h3>
                <button @click="showManageCategories = false" style="background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 22px; line-height: 1;">✕</button>
              </div>

              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">Kategori ini dipakai di Logbook dan Task Plan. Kategori default tidak bisa dihapus.</p>

              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; padding: 14px; background: var(--bg-cream); border-radius: 10px; border: 1px solid var(--color-sand);">
                <span v-for="cat in allCategories" :key="cat"
                  :style="{ backgroundColor: getCategoryColor(cat) + '18', color: getCategoryColor(cat), borderColor: getCategoryColor(cat) + '50' }"
                  style="padding: 4px 12px; border-radius: 20px; font-size: 12.5px; font-weight: 600; border: 1.5px solid; display: inline-flex; align-items: center; gap: 6px;">
                  {{ cat }}
                  <button v-if="!defaultCategories.includes(cat)" @click="deleteCategory(cat)"
                    style="background: none; border: none; cursor: pointer; font-size: 13px; line-height: 1; color: inherit; opacity: 0.5; padding: 0; display: inline-flex; transition: opacity 0.15s;"
                    @mouseenter="$event.target.style.opacity='1'" @mouseleave="$event.target.style.opacity='0.5'"
                    title="Hapus kategori">✕</button>
                </span>
              </div>

              <div style="border-top: 1.5px solid var(--color-sand); padding-top: 16px;">
                <label style="font-size: 12px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em;">Tambah Kategori Baru</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                  <input type="text" class="form-input" v-model="newCategoryInput" placeholder="Nama kategori baru..."
                    @keydown.enter="addCategory" style="flex: 1; height: 40px;" />
                  <button class="btn btn-primary" @click="addCategory" style="height: 40px; padding: 0 20px; cursor: pointer; white-space: nowrap; font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 600;">
                    + Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- ── Floating Form Task Plan ── -->
        <transition name="modal-fade">
          <div v-if="showAddPlan" style="position: fixed; bottom: 32px; right: 32px; z-index: 9999; width: 400px; max-width: calc(100vw - 48px); background: var(--bg-card); border-radius: 16px; box-shadow: 0 12px 40px rgba(44,38,33,0.18), 0 2px 8px rgba(0,0,0,0.08); border: 1.5px solid var(--color-sand); animation: popIn 0.22s ease;">
            <!-- Header floating -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 18px 0; margin-bottom: 14px;">
              <p style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 0; display: flex; align-items: center; gap: 6px;">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-terracotta);"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                {{ editingPlanId ? 'Edit Task Plan' : 'Tambah Task Plan Baru' }}
              </p>
              <button @click="cancelPlanForm" style="background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 20px; line-height: 1; padding: 0 2px;" title="Tutup">✕</button>
            </div>
            <div style="padding: 0 18px 18px;">
              <!-- Baris 1: Tanggal -->
              <div style="margin-bottom: 10px;">
                <div class="form-group" style="margin: 0;">
                  <label>Plan Tanggal</label>
                  <input type="date" class="form-input" v-model="planForm.date" style="height: 38px; width: 100%;" />
                </div>
              </div>
              <!-- Baris 2: Waktu Mulai & Berakhir dengan separator dash -->
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                <div class="form-group" style="margin: 0; flex: 1;">
                  <label>Waktu Mulai</label>
                  <input type="time" class="form-input" v-model="planForm.time" style="height: 38px; width: 100%;" />
                </div>
                <span style="color: var(--text-muted); font-size: 18px; font-weight: 400; margin-top: 18px; flex-shrink: 0;">–</span>
                <div class="form-group" style="margin: 0; flex: 1;">
                  <label>Waktu Berakhir</label>
                  <input type="time" class="form-input" v-model="planForm.timeEnd" style="height: 38px; width: 100%;" />
                </div>
              </div>
              <div class="form-group" style="margin: 0 0 10px;">
                <label>Kategori</label>
                <select class="form-input" v-model="planForm.category" style="height: 38px;">
                  <option v-for="cat in allCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="form-group" style="margin: 0 0 10px;">
                <label>Tugas / Deskripsi</label>
                <textarea class="form-input" v-model="planForm.tasks" rows="2" placeholder="Deskripsikan tugas yang perlu dikerjakan..."></textarea>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
                <div class="form-group" style="margin: 0;">
                  <label>Prioritas</label>
                  <select class="form-input" v-model="planForm.priority" style="height: 38px;">
                    <option value="Low">🟢 Low</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="High">🔴 High</option>
                  </select>
                </div>
                <div class="form-group" style="margin: 0;">
                  <label>Requester</label>
                  <input type="text" class="form-input" v-model="planForm.requester" placeholder="Nama peminta..." style="height: 38px;" />
                </div>
              </div>
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button class="btn btn-secondary" @click="cancelPlanForm" style="cursor: pointer; padding: 7px 16px; border-radius: 8px; font-weight: 600; font-size: 12.5px;">Batal</button>
                <button class="btn btn-primary" @click="savePlan" style="cursor: pointer; padding: 7px 18px; border-radius: 8px; font-weight: 600; font-size: 12.5px;">
                  {{ editingPlanId ? 'Simpan Perubahan' : 'Simpan Task' }}
                </button>
              </div>
            </div>
          </div>
        </transition>

        <div class="drawer-section" style="margin-bottom: 24px; padding: 20px; border-radius: 12px; background-color: var(--bg-cream); border: 1.5px solid var(--color-sand);">
          <div class="flex-between" style="align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
            <h3 style="font-size: 14px; font-weight: 700; color: var(--text-dark); display: flex; align-items: center; gap: 8px; margin: 0;">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-terracotta);"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></svg>
              Task Plan
              <span v-if="plans.length > 0" style="background: var(--color-terracotta); color: #fff; font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 20px;">{{ plans.length }}</span>
            </h3>
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">

              <!-- Prioritas dropdown (minimalis) -->
              <div v-if="plans.length > 0" style="position: relative;" @click.stop>
                <button @click.stop="showPriorityDD = !showPriorityDD; showJadwalDD = false"
                  :style="planFilterPriority ? { borderColor: 'var(--color-terracotta)', background: '#FFF4ED', color: 'var(--color-terracotta)' } : { borderColor: 'var(--color-sand)', background: 'var(--bg-cream)', color: 'var(--text-muted)' }"
                  style="height: 32px; padding: 0 10px; border: 1.5px solid; border-radius: 8px; font-size: 12px; font-family: 'Outfit', sans-serif; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; transition: all 0.15s;">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="13" y2="12"></line><line x1="8" y1="18" x2="11" y2="18"></line></svg>
                  <span v-if="!planFilterPriority">Prioritas</span>
                  <span v-else>{{ planFilterPriority === 'High' ? '🔴' : planFilterPriority === 'Medium' ? '🟡' : '🟢' }} {{ planFilterPriority }}</span>
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :style="{ transform: showPriorityDD ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.18s' }"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div v-if="showPriorityDD" @click.stop
                  style="position: absolute; top: calc(100% + 5px); left: 0; z-index: 99999;
                         background: var(--color-paper, #FAF7F2);
                         border: 1.5px solid var(--color-sand-light, #EDE8E1);
                         border-radius: 14px;
                         box-shadow: 0 8px 32px rgba(61,46,34,0.16), 0 2px 8px rgba(61,46,34,0.08);
                         padding: 6px; min-width: 175px;">
                  <button @click.stop="planFilterPriority = ''; showPriorityDD = false"
                    :style="!planFilterPriority ? { background: 'var(--color-sand-light,#EDE8E1)' } : {}"
                    style="width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; background: transparent; transition: background 0.13s;"
                    onmouseover="this.style.background='var(--color-cream,#FDF5EB)'" onmouseout="this.style.background='transparent'">
                    <span style="font-size: 13px;">—</span>
                    <span style="flex: 1; font-size: 12.5px; font-weight: 600; color: var(--text-secondary,#7A6F66);">Semua ({{ plans.length }})</span>
                    <svg v-if="!planFilterPriority" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                  <div style="height: 1px; background: var(--color-sand-light,#EDE8E1); margin: 3px 6px;"></div>
                  <button @click.stop="planFilterPriority = 'High'; showPriorityDD = false"
                    :style="planFilterPriority === 'High' ? { background: 'rgba(185,28,28,0.06)' } : {}"
                    style="width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; background: transparent; transition: background 0.13s;"
                    onmouseover="this.style.background='rgba(185,28,28,0.05)'" onmouseout="this.style.background='transparent'">
                    <span style="font-size: 13px;">🔴</span>
                    <span style="flex: 1; font-size: 12.5px; font-weight: 600; color: #B91C1C;">High ({{ plans.filter(p => p.priority === 'High').length }})</span>
                    <svg v-if="planFilterPriority === 'High'" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                  <button @click.stop="planFilterPriority = 'Medium'; showPriorityDD = false"
                    :style="planFilterPriority === 'Medium' ? { background: 'rgba(133,77,14,0.06)' } : {}"
                    style="width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; background: transparent; transition: background 0.13s;"
                    onmouseover="this.style.background='rgba(133,77,14,0.05)'" onmouseout="this.style.background='transparent'">
                    <span style="font-size: 13px;">🟡</span>
                    <span style="flex: 1; font-size: 12.5px; font-weight: 600; color: #854D0E;">Medium ({{ plans.filter(p => p.priority === 'Medium').length }})</span>
                    <svg v-if="planFilterPriority === 'Medium'" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                  <button @click.stop="planFilterPriority = 'Low'; showPriorityDD = false"
                    :style="planFilterPriority === 'Low' ? { background: 'rgba(22,101,52,0.06)' } : {}"
                    style="width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; background: transparent; transition: background 0.13s;"
                    onmouseover="this.style.background='rgba(22,101,52,0.05)'" onmouseout="this.style.background='transparent'">
                    <span style="font-size: 13px;">🟢</span>
                    <span style="flex: 1; font-size: 12.5px; font-weight: 600; color: #166534;">Low ({{ plans.filter(p => p.priority === 'Low').length }})</span>
                    <svg v-if="planFilterPriority === 'Low'" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                </div>
              </div>

              <!-- Jadwal dropdown (minimalis) -->
              <div v-if="plans.length > 0" style="position: relative;" @click.stop>
                <button @click.stop="showJadwalDD = !showJadwalDD; showPriorityDD = false"
                  :style="planFilterSchedule ? { borderColor: 'var(--color-terracotta)', background: '#FFF4ED', color: 'var(--color-terracotta)' } : { borderColor: 'var(--color-sand)', background: 'var(--bg-cream)', color: 'var(--text-muted)' }"
                  style="height: 32px; padding: 0 10px; border: 1.5px solid; border-radius: 8px; font-size: 12px; font-family: 'Outfit', sans-serif; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; transition: all 0.15s;">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span v-if="!planFilterSchedule">Jadwal</span>
                  <span v-else-if="planFilterSchedule === 'overdue'">Lewat</span>
                  <span v-else-if="planFilterSchedule === 'today'">Hari Ini</span>
                  <span v-else-if="planFilterSchedule === 'tomorrow'">Besok</span>
                  <span v-else-if="planFilterSchedule === 'upcoming'">Akan Datang</span>
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :style="{ transform: showJadwalDD ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.18s' }"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div v-if="showJadwalDD" @click.stop
                  style="position: absolute; top: calc(100% + 5px); left: 0; z-index: 99999;
                         background: var(--color-paper, #FAF7F2);
                         border: 1.5px solid var(--color-sand-light, #EDE8E1);
                         border-radius: 14px;
                         box-shadow: 0 8px 32px rgba(61,46,34,0.16), 0 2px 8px rgba(61,46,34,0.08);
                         padding: 6px; min-width: 185px;">
                  <button @click.stop="planFilterSchedule = ''; showJadwalDD = false"
                    :style="!planFilterSchedule ? { background: 'var(--color-sand-light,#EDE8E1)' } : {}"
                    style="width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; background: transparent; transition: background 0.13s;"
                    onmouseover="this.style.background='var(--color-cream,#FDF5EB)'" onmouseout="this.style.background='transparent'">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--color-sand,#C8BDB5)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    <span style="flex: 1; font-size: 12.5px; font-weight: 600; color: var(--text-secondary,#7A6F66);">Semua Jadwal ({{ plans.filter(p => !(p.phase === 'Completed' && p.loggedToHistory)).length }})</span>
                    <svg v-if="!planFilterSchedule" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                  <div style="height: 1px; background: var(--color-sand-light,#EDE8E1); margin: 3px 6px;"></div>
                  <button @click.stop="planFilterSchedule = 'overdue'; showJadwalDD = false"
                    :style="planFilterSchedule === 'overdue' ? { background: 'rgba(185,28,28,0.06)' } : {}"
                    style="width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; background: transparent; transition: background 0.13s;"
                    onmouseover="this.style.background='rgba(185,28,28,0.05)'" onmouseout="this.style.background='transparent'">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <span style="flex: 1; font-size: 12.5px; font-weight: 600; color: #B91C1C;">Lewat Jadwal ({{ plans.filter(p => p.date < todayStr && !(p.phase === 'Completed' && p.loggedToHistory)).length }})</span>
                    <svg v-if="planFilterSchedule === 'overdue'" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                  <button @click.stop="planFilterSchedule = 'today'; showJadwalDD = false"
                    :style="planFilterSchedule === 'today' ? { background: 'rgba(214,123,82,0.08)' } : {}"
                    style="width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; background: transparent; transition: background 0.13s;"
                    onmouseover="this.style.background='rgba(214,123,82,0.07)'" onmouseout="this.style.background='transparent'">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span style="flex: 1; font-size: 12.5px; font-weight: 600; color: var(--color-terracotta,#D67B52);">Hari Ini ({{ plans.filter(p => p.date === todayStr && !(p.phase === 'Completed' && p.loggedToHistory)).length }})</span>
                    <svg v-if="planFilterSchedule === 'today'" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                  <button @click.stop="planFilterSchedule = 'tomorrow'; showJadwalDD = false"
                    :style="planFilterSchedule === 'tomorrow' ? { background: 'rgba(214,123,82,0.08)' } : {}"
                    style="width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; background: transparent; transition: background 0.13s;"
                    onmouseover="this.style.background='rgba(214,123,82,0.07)'" onmouseout="this.style.background='transparent'">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span style="flex: 1; font-size: 12.5px; font-weight: 600; color: var(--color-terracotta,#D67B52);">Besok ({{ plans.filter(p => p.date === tomorrowStr && !(p.phase === 'Completed' && p.loggedToHistory)).length }})</span>
                    <svg v-if="planFilterSchedule === 'tomorrow'" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                  <button @click.stop="planFilterSchedule = 'upcoming'; showJadwalDD = false"
                    :style="planFilterSchedule === 'upcoming' ? { background: 'rgba(29,78,216,0.06)' } : {}"
                    style="width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; background: transparent; transition: background 0.13s;"
                    onmouseover="this.style.background='rgba(29,78,216,0.05)'" onmouseout="this.style.background='transparent'">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline><path d="M17 12h2"></path></svg>
                    <span style="flex: 1; font-size: 12.5px; font-weight: 600; color: #1D4ED8;">Akan Datang ({{ plans.filter(p => p.date > todayStr && !(p.phase === 'Completed' && p.loggedToHistory)).length }})</span>
                    <svg v-if="planFilterSchedule === 'upcoming'" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                </div>
              </div>

              <!-- Catat Logbook Harian button -->
              <button class="btn" @click="showAddLog = true; editingLogId = null; pendingConvertPlanId = null; form = { date: todayStr, category: 'Administrasi', tasks: '', achievements: '', nextActions: [{ id: 'na-' + Date.now(), text: '', completed: false }], documentLink: '' }; $nextTick(() => { const el = document.querySelector('.job-logbook'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); })"
                style="height: 32px; padding: 0 12px; font-family: 'Outfit', sans-serif; font-size: 12px; border-radius: 8px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; background: #FFF4ED; border: 1.5px solid #D67B52; color: #8C4B2D;">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                Catat Logbook
              </button>
              <button class="btn btn-primary" @click="openAddPlan"
                style="height: 32px; padding: 0 14px; font-family: 'Outfit', sans-serif; font-size: 12px; border-radius: 8px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Tambah Task
              </button>
              <!-- Collapse toggle -->
              <button @click="taskPlanCollapsed = !taskPlanCollapsed"
                :title="taskPlanCollapsed ? 'Buka section Task Plan' : 'Tutup section Task Plan'"
                style="background: var(--bg-card); border: 1.5px solid var(--color-sand); border-radius: 8px; padding: 6px 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: background 0.15s;">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                  :style="{ transition: 'transform 0.25s ease', transform: taskPlanCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <div v-show="!taskPlanCollapsed">

          <div v-if="plans.length === 0 && !showAddPlan" style="text-align: center; padding: 32px 20px; background: #fff; border-radius: 10px; border: 1.5px dashed var(--color-sand);">
            <p style="font-size: 28px; margin-bottom: 8px;">📋</p>
            <p style="font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 4px;">Belum ada task yang direncanakan</p>
            <p style="font-size: 12.5px; color: var(--text-muted);">Klik "Tambah Task" untuk mulai merencanakan pekerjaanmu</p>
          </div>

          <div v-if="plans.length > 0 && sortedFilteredPlans.length === 0" style="text-align: center; padding: 20px; background: #fff; border-radius: 10px; border: 1.5px dashed var(--color-sand);">
            <p style="font-size: 13px; color: var(--text-muted);">Tidak ada task yang cocok dengan filter yang dipilih.</p>
          </div>

          <div v-if="sortedFilteredPlans.length > 0"
            style="display: flex; flex-direction: column; gap: 10px; max-height: 420px; overflow-y: auto; padding-right: 4px; scrollbar-width: thin; scrollbar-color: var(--color-sand) transparent;">
            
            <div v-for="(plan, idx) in sortedFilteredPlans" :key="plan.id"
              :style="plan.date === todayStr ? {
                background: 'linear-gradient(135deg, #FBF0EA 0%, #FFF4ED 100%)',
                border: '1.5px solid var(--color-gold)',
                borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px',
                transition: 'box-shadow 0.2s, border-color 0.2s'
              } : {
                background: '#fff',
                border: '1.5px solid var(--color-sand)',
                borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px',
                transition: 'box-shadow 0.2s, border-color 0.2s'
              }"
              @mouseenter="$event.currentTarget.style.boxShadow = plan.date === todayStr ? '0 4px 20px rgba(214,123,82,0.20)' : '0 4px 16px rgba(214,123,82,0.10)'; if(plan.date !== todayStr) $event.currentTarget.style.borderColor='var(--color-gold)'"
              @mouseleave="$event.currentTarget.style.boxShadow='none'; if(plan.date !== todayStr) $event.currentTarget.style.borderColor='var(--color-sand)'">
              
              <div class="flex-between" style="align-items: flex-start; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 1;">
                  <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {{ formatDate(plan.date) }}
                  </span>
                  <span v-if="plan.time" style="font-size: 11.5px; font-weight: 700; color: var(--color-terracotta); background: rgba(214,123,82,0.10); padding: 2px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {{ plan.time }}<span v-if="plan.timeEnd"> – {{ plan.timeEnd }}</span>
                  </span>
                  <span :style="{ backgroundColor: getCategoryColor(plan.category) + '15', color: getCategoryColor(plan.category), borderColor: getCategoryColor(plan.category) + '40' }"
                    style="padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1.5px solid;">
                    {{ plan.category }}
                  </span>
                  <span v-if="plan.priority"
                    :style="{
                      background: plan.priority === 'High' ? '#FEE2E2' : plan.priority === 'Medium' ? '#FEF9C3' : '#DCFCE7',
                      color: plan.priority === 'High' ? '#B91C1C' : plan.priority === 'Medium' ? '#854D0E' : '#166534',
                      borderColor: plan.priority === 'High' ? '#FCA5A5' : plan.priority === 'Medium' ? '#FDE047' : '#86EFAC'
                    }"
                    style="padding: 2px 8px; border-radius: 20px; font-size: 10.5px; font-weight: 700; border: 1.5px solid;">
                    {{ plan.priority === 'High' ? '🔴' : plan.priority === 'Medium' ? '🟡' : '🟢' }} {{ plan.priority }}
                  </span>
                  <span v-if="plan.requester"
                    style="background: #EFF6FF; color: #1D4ED8; border: 1.5px solid #BFDBFE; padding: 2px 8px; border-radius: 20px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px;">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    {{ plan.requester }}
                  </span>
                  <span v-if="plan.date < todayStr" style="background: #FEF2F2; color: #B91C1C; border: 1.5px solid #FCA5A5; padding: 2px 8px; border-radius: 20px; font-size: 10.5px; font-weight: 700;">
                    ⚠ Lewat Jadwal
                  </span>
                  <span v-else-if="plan.date === todayStr" style="background: #FBF0EA; color: var(--color-terracotta); border: 1.5px solid var(--color-gold); padding: 2px 8px; border-radius: 20px; font-size: 10.5px; font-weight: 700;">
                    ✦ Hari Ini
                  </span>
                </div>
                
                <div style="display: flex; gap: 6px; flex-shrink: 0; align-items: center;">
                  <!-- ── Custom Phase Dropdown ── -->
                  <div style="position: relative; display: inline-flex; align-items: center;">
                    <!-- Trigger pill -->
                    <button
                      @click.stop="openPhaseDropdownId = (openPhaseDropdownId === plan.id ? null : plan.id)"
                      :style="{
                        background: (plan.phase === 'Completed') ? 'rgba(74,160,100,0.12)' : (plan.phase === 'In Progress') ? 'rgba(214,123,82,0.12)' : 'rgba(160,150,144,0.10)',
                        color:      (plan.phase === 'Completed') ? '#2D7A4F'               : (plan.phase === 'In Progress') ? 'var(--color-terracotta,#D67B52)' : 'var(--text-secondary,#7A6F66)',
                        borderColor:(plan.phase === 'Completed') ? 'rgba(74,160,100,0.35)' : (plan.phase === 'In Progress') ? 'rgba(214,123,82,0.35)'           : 'var(--color-sand,#C8BDB5)'
                      }"
                      style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 8px; border: 1.5px solid; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; background: none; white-space: nowrap; transition: box-shadow 0.15s;"
                    >
                      <!-- Status icon -->
                      <svg v-if="plan.phase === 'Completed'" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="rgba(74,160,100,0.18)" stroke="#2D7A4F"/><polyline points="8 12 11 15 16 9" stroke="#2D7A4F"/></svg>
                      <svg v-else-if="plan.phase === 'In Progress'" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="rgba(214,123,82,0.15)" stroke="var(--color-terracotta,#D67B52)"/><line x1="12" y1="8" x2="12" y2="12" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5"/><circle cx="12" cy="15.5" r="1" fill="var(--color-terracotta,#D67B52)"/></svg>
                      <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke="var(--color-sand,#C8BDB5)"/></svg>
                      {{ plan.phase || 'To-do' }}
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                        :style="{ transform: openPhaseDropdownId === plan.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.18s' }">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>

                    <!-- Floating dropdown panel -->
                    <div v-if="openPhaseDropdownId === plan.id"
                      @click.stop
                      style="position: absolute; top: calc(100% + 6px); right: 0; z-index: 99999;
                             background: var(--color-paper, #FAF7F2);
                             border: 1.5px solid var(--color-sand-light, #EDE8E1);
                             border-radius: 14px;
                             box-shadow: 0 8px 32px rgba(61,46,34,0.16), 0 2px 8px rgba(61,46,34,0.08);
                             padding: 6px;
                             min-width: 170px;
                             overflow: hidden;">

                      <!-- To-do -->
                      <button @click.stop="updatePlanPhase(plan.id, 'To-do'); openPhaseDropdownId = null"
                        :style="(plan.phase === 'To-do' || !plan.phase) ? { background: 'var(--color-sand-light,#EDE8E1)' } : {}"
                        style="width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; transition: background 0.13s; background: transparent;"
                        onmouseover="this.style.background='var(--color-cream,#FDF5EB)'" onmouseout="if(!this.dataset.active) this.style.background='transparent'">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke="var(--color-sand,#C8BDB5)"/></svg>
                        <span style="flex: 1; font-size: 13px; font-weight: 600; color: var(--text-secondary,#7A6F66);">To-do</span>
                        <svg v-if="plan.phase === 'To-do' || !plan.phase" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </button>

                      <!-- In Progress -->
                      <button @click.stop="updatePlanPhase(plan.id, 'In Progress'); openPhaseDropdownId = null"
                        :style="plan.phase === 'In Progress' ? { background: 'rgba(214,123,82,0.08)' } : {}"
                        style="width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; transition: background 0.13s; background: transparent;"
                        onmouseover="this.style.background='rgba(214,123,82,0.07)'" onmouseout="this.style.background='transparent'">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="rgba(214,123,82,0.15)" stroke="var(--color-terracotta,#D67B52)"/><line x1="12" y1="8" x2="12" y2="12" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5"/><circle cx="12" cy="15.5" r="1" fill="var(--color-terracotta,#D67B52)"/></svg>
                        <span style="flex: 1; font-size: 13px; font-weight: 600; color: var(--color-terracotta,#D67B52);">In Progress</span>
                        <svg v-if="plan.phase === 'In Progress'" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </button>

                      <!-- Divider -->
                      <div style="height: 1px; background: var(--color-sand-light,#EDE8E1); margin: 4px 6px;"></div>

                      <!-- Completed -->
                      <button @click.stop="updatePlanPhase(plan.id, 'Completed'); openPhaseDropdownId = null"
                        :style="plan.phase === 'Completed' ? { background: 'rgba(74,160,100,0.08)' } : {}"
                        style="width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; transition: background 0.13s; background: transparent;"
                        onmouseover="this.style.background='rgba(74,160,100,0.07)'" onmouseout="this.style.background='transparent'">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="rgba(74,160,100,0.18)" stroke="#2D7A4F"/><polyline points="8 12 11 15 16 9" stroke="#2D7A4F" stroke-width="2.5"/></svg>
                        <span style="flex: 1; font-size: 13px; font-weight: 600; color: #2D7A4F;">Completed</span>
                        <svg v-if="plan.phase === 'Completed'" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#2D7A4F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </button>

                    </div>
                  </div>
                  <!-- ── Waktu Quick-Set Dropdown ── -->
                  <div style="position: relative; display: inline-flex; align-items: center;" @click.stop>
                    <button @click.stop="openTimeDropdown(plan)"
                      title="Set Waktu Mulai - Berakhir"
                      style="background: var(--bg-cream); color: var(--text-dark); border: 1.5px solid var(--color-sand); border-radius: 8px; padding: 4px 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </button>

                    <!-- Floating time popover -->
                    <div v-if="openTimeDropdownId === plan.id"
                      @click.stop
                      style="position: absolute; top: calc(100% + 6px); right: 0; z-index: 99999;
                             background: var(--color-paper, #FAF7F2);
                             border: 1.5px solid var(--color-sand-light, #EDE8E1);
                             border-radius: 14px;
                             box-shadow: 0 8px 32px rgba(61,46,34,0.16), 0 2px 8px rgba(61,46,34,0.08);
                             padding: 12px;
                             min-width: 230px;">
                      <p style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">Atur Waktu</p>
                      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
                        <div style="flex: 1;">
                          <label style="font-size: 10.5px; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 3px;">Mulai</label>
                          <input type="time" class="form-input" v-model="timeEditForm.time" style="height: 34px; width: 100%; font-size: 12.5px;" />
                        </div>
                        <span style="color: var(--text-muted); font-size: 16px; margin-top: 16px;">–</span>
                        <div style="flex: 1;">
                          <label style="font-size: 10.5px; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 3px;">Berakhir</label>
                          <input type="time" class="form-input" v-model="timeEditForm.timeEnd" style="height: 34px; width: 100%; font-size: 12.5px;" />
                        </div>
                      </div>
                      <div style="display: flex; gap: 6px; justify-content: flex-end;">
                        <button @click.stop="openTimeDropdownId = null" class="btn btn-secondary" style="cursor: pointer; padding: 6px 12px; border-radius: 8px; font-weight: 600; font-size: 12px;">Batal</button>
                        <button @click.stop="saveTimeFromDropdown(plan)" class="btn btn-primary" style="cursor: pointer; padding: 6px 14px; border-radius: 8px; font-weight: 600; font-size: 12px;">Simpan</button>
                      </div>
                    </div>
                  </div>
                  <button @click="startEditPlan(plan)"
                    title="Edit task plan ini"
                    style="background: var(--bg-cream); color: var(--text-dark); border: 1.5px solid var(--color-sand); border-radius: 8px; padding: 4px 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                  </button>
                  <button @click="deletePlan(plan.id)"
                    title="Hapus task"
                    style="background: #FEF2F2; color: #B91C1C; border: 1.5px solid #FCA5A5; border-radius: 8px; padding: 4px 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
              
              <p :style="plan.date === todayStr ? { fontSize: '13.5px', color: '#5A3E2B', margin: '0', lineHeight: '1.5', fontWeight: '600' } : { fontSize: '13.5px', color: 'var(--text-dark)', margin: '0', lineHeight: '1.5' }">{{ plan.tasks }}</p>
            </div>

          </div>
          </div><!-- end collapse wrapper -->
        </div>

        <!-- ── Riwayat Kegiatan Kerja ── -->
        <div class="drawer-section" style="margin-bottom: 0; padding: 20px 22px; border-radius: 12px; min-width: 0; overflow: visible;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 0;">Riwayat Kegiatan Kerja</h3>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted);">
              <span>Tampilkan</span>
              <div style="position: relative;" @click.stop>
                <button @click.stop="showTampilkanDD = !showTampilkanDD"
                  style="height: 34px; padding: 0 26px 0 10px; border: 1.5px solid var(--color-sand,#C8BDB5); border-radius: 8px; font-size: 13px; font-family: inherit; font-weight: 600; cursor: pointer; background: var(--bg-cream); color: var(--text-dark); display: inline-flex; align-items: center; white-space: nowrap; transition: all 0.15s; position: relative;"
                  :style="showTampilkanDD ? { borderColor: 'var(--color-terracotta)', background: '#FFF4ED' } : {}">
                  {{ itemsPerPage }}
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                    style="position: absolute; right: 7px;"
                    :style="{ transform: showTampilkanDD ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.18s' }">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <div v-if="showTampilkanDD" @click.stop
                  style="position: absolute; top: calc(100% + 5px); right: 0; z-index: 99999;
                         background: var(--color-paper, #FAF7F2);
                         border: 1.5px solid var(--color-sand-light, #EDE8E1);
                         border-radius: 14px;
                         box-shadow: 0 8px 32px rgba(61,46,34,0.16), 0 2px 8px rgba(61,46,34,0.08);
                         padding: 6px; min-width: 100px;">
                  <button v-for="n in [5, 10, 20]" :key="n"
                    @click.stop="itemsPerPage = n; showTampilkanDD = false"
                    :style="itemsPerPage === n ? { background: 'rgba(214,123,82,0.10)', color: 'var(--color-terracotta,#D67B52)' } : {}"
                    style="width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 9px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; text-align: left; background: transparent; color: var(--text-dark); transition: background 0.13s;"
                    onmouseover="this.style.background='rgba(214,123,82,0.07)'" onmouseout="this.style.background='transparent'">
                    {{ n }} entri
                    <svg v-if="itemsPerPage === n" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="filteredAndSortedLogs.length === 0" style="padding: 60px 20px; text-align: center; color: var(--text-muted); background-color: var(--bg-cream); border-radius: 12px; border: 1px dashed var(--color-sand);">
            <p style="font-size: 15px; margin-bottom: 6px; font-weight: 500;">Tidak ada catatan tugas yang cocok.</p>
            <p style="font-size: 12.5px; color: var(--text-muted);">Coba ubah kata kunci pencarian atau bersihkan filter rentang waktu Anda.</p>
          </div>

          <div v-else>
            <div class="log-table-container">
              <table class="log-table">
                <thead>
                  <tr>
                    <th style="cursor: pointer; user-select: none;" @click="toggleSort('date')">Tanggal {{ sortBy === 'date' ? (sortDesc ? '▼' : '▲') : '' }}</th>
                    <th style="cursor: pointer; user-select: none;" @click="toggleSort('category')">Kategori {{ sortBy === 'category' ? (sortDesc ? '▼' : '▲') : '' }}</th>
                    <th style="cursor: pointer; user-select: none;" @click="toggleSort('tasks')">Tugas / Kegiatan {{ sortBy === 'tasks' ? (sortDesc ? '▼' : '▲') : '' }}</th>
                    <th>Hasil yang Dicapai</th>
                    <th>Next Action</th>
                    <th style="text-align: center;">Tautan</th>
                    <th style="text-align: center;">Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(log, idx) in paginatedLogs" :key="log.id || idx">
                    <td class="text-mono" style="font-weight: bold; font-size: 12.5px; white-space: nowrap; color: var(--text-dark);">{{ formatDate(log.date) }}</td>
                    <td>
                      <span class="pill" :style="{ backgroundColor: getCategoryColor(log.category) + '12', color: getCategoryColor(log.category), borderColor: getCategoryColor(log.category) + '30' }" style="padding: 4px 10px; border-radius: 6px; font-size: 11.5px; font-weight: bold; border: 1px solid;">{{ log.category }}</span>
                    </td>
                    <td style="max-width: 250px; font-size: 13.5px; line-height: 1.4;" :title="log.tasks">{{ log.tasks }}</td>
                    <td style="max-width: 200px; font-size: 13.5px; line-height: 1.4; color: var(--text-dark);" :title="log.achievements">{{ log.achievements }}</td>
                    <td style="min-width: 200px; max-width: 240px; font-size: 13px; line-height: 1.4; padding: 6px 8px;">
                      <div v-if="getNextActions(log).length === 0" style="font-style: italic; color: var(--text-muted); font-size: 12px;">—</div>
                      <div v-else style="display: flex; flex-direction: column; gap: 5px;">
                        <div v-for="(na, naIdx) in getNextActions(log)" :key="na.id || naIdx"
                             style="display: flex; align-items: flex-start; gap: 6px;">
                          <span style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); opacity: 0.6; min-width: 14px; padding-top: 2px;">{{ naIdx + 1 }}.</span>
                          <span :style="na.completed ? { textDecoration: 'line-through', opacity: 0.45, color: '#10B981' } : {}"
                                style="flex: 1; font-style: italic; color: var(--text-muted); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;"
                                :title="na.text">{{ na.text }}</span>
                          <button @click="logNextActionItem(log, naIdx)"
                                  :disabled="na.completed"
                                  :title="na.completed ? 'Tindakan Selesai!' : 'Tambah ke Task Plan'"
                                  style="border-radius: 5px; padding: 3px 5px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid; font-size: 10px; cursor: pointer; width: 22px; height: 22px; flex-shrink: 0; transition: all 0.2s;"
                                  :style="na.completed ? { backgroundColor: '#DEF7EC', color: '#0E9F6E', borderColor: '#81E3B4', cursor: 'default' } : { backgroundColor: '#EBF5FF', color: '#1C64F2', borderColor: '#A4CAFE' }">
                            <svg v-if="na.completed" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <svg v-else viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td style="text-align: center; white-space: nowrap;">
                      <a v-if="log.documentLink" :href="log.documentLink" target="_blank" class="text-mono" style="color: var(--color-terracotta); text-decoration: underline; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;" referrerPolicy="no-referrer">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        Buka
                      </a>
                      <span v-else style="color: var(--text-muted); font-size: 12px; font-style: italic;">—</span>
                    </td>
                    <td style="text-align: center; white-space: nowrap;">
                      <div style="display: inline-flex; gap: 6px; align-items: center; justify-content: center;">
                        <button class="card-nav-btn" @click="startEditLog(log)" title="Edit log" style="font-size: 14px; padding: 6px; color: var(--color-terracotta); display: inline-flex; align-items: center; justify-content: center; background: #FFF4ED; border: 1.5px solid #F5C8A8; border-radius: 6px; cursor: pointer;">
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                        </button>
                        <button class="card-nav-btn" @click="syncToContent(log)" title="Sync Jadi Konten Baru" style="font-size: 14px; padding: 6px; color: #10B981; display: inline-flex; align-items: center; justify-content: center; background: #ECFDF5; border: 1.5px solid #A7F3D0; border-radius: 6px; cursor: pointer;">
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                        </button>
                        <button class="card-nav-btn" @click="deleteLogById(log.id || log.date)" title="Hapus log" style="font-size: 14px; padding: 6px; color: var(--color-rose); display: inline-flex; align-items: center; justify-content: center; background: #FEF2F2; border: 1.5px solid #FCA5A5; border-radius: 6px; cursor: pointer;">
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 6px; margin-bottom: 2px;">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); opacity: 0.4;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              <span style="font-size: 11px; color: var(--text-muted); opacity: 0.5; font-style: italic; letter-spacing: 0.03em;">geser tabel untuk melihat lebih banyak kolom</span>
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); opacity: 0.4;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 14px; border-top: 1.5px solid var(--color-sand); flex-wrap: wrap; gap: 10px;">
              <span style="font-size: 12.5px; color: var(--text-muted);">Menampilkan <strong>{{ paginationInfo.start }}</strong>–<strong>{{ paginationInfo.end }}</strong> dari <strong>{{ filteredAndSortedLogs.length }}</strong> entri</span>
              <div style="display: flex; gap: 5px; align-items: center;">
                <button class="btn btn-secondary" :disabled="currentPage === 1" @click="currentPage--" style="padding: 5px 11px; font-size: 13px; cursor: pointer; border-radius: 7px;">◀</button>
                <button class="btn btn-secondary" v-for="page in totalPages" :key="page" @click="currentPage = page" :style="currentPage === page ? { background: 'var(--color-terracotta)', color: '#fff', borderColor: 'var(--color-terracotta)', fontWeight: 'bold' } : {}" style="padding: 5px 11px; font-size: 13px; cursor: pointer; border-radius: 7px; min-width: 32px; text-align: center;">{{ page }}</button>
                <button class="btn btn-secondary" :disabled="currentPage === totalPages" @click="currentPage++" style="padding: 5px 11px; font-size: 13px; cursor: pointer; border-radius: 7px;">▶</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="showFullNotesPage" class="animate-fade-in" style="animation: popIn 0.3s ease;">
        <div style="border-bottom: 2px solid var(--color-sand); padding-bottom: 16px; margin-bottom: 24px;">
          <!-- Row 1: Back + Title -->
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
            <button class="btn btn-secondary" @click="showFullNotesPage = false" style="padding: 8px; border-radius: 8px;" title="Kembali ke Logbook">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <div>
              <h2 style="margin: 0; display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 800; color: var(--text-dark);">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--color-terracotta)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                All Notes
              </h2>
              <p style="color: var(--text-muted); font-size: 13.5px; margin-top: 2px;">Simpan ide, referensi, atau rekap meeting dengan rapi.</p>
            </div>
          </div>
          <!-- Row 2: Filter buttons + Note Baru -->
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <!-- Filter Tanggal button -->
            <div style="position: relative;" @click.stop>
              <button type="button" @click.stop="noteShowRangePicker = !noteShowRangePicker; showNoteFilterCatDD = false"
                :style="(noteFilterStartDate || noteFilterEndDate) ? { borderColor: 'var(--color-terracotta)', background: '#FFF4ED', color: 'var(--color-terracotta)' } : { borderColor: 'var(--color-sand)', background: 'var(--bg-cream)', color: 'var(--text-muted)' }"
                style="height: 32px; padding: 0 12px; border: 1.5px solid; border-radius: 8px; font-size: 12px; font-family: 'Outfit', sans-serif; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; transition: all 0.15s;">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <template v-if="noteFilterStartDate || noteFilterEndDate">{{ noteFilterStartDate ? formatDate(noteFilterStartDate) : '?' }} – {{ noteFilterEndDate ? formatDate(noteFilterEndDate) : '?' }}</template>
                <template v-else>Tanggal</template>
              </button>
              <div v-if="noteShowRangePicker" @click.stop style="position: absolute; top: calc(100% + 6px); left: 0; z-index: 999; background: #fff; border: 1.5px solid var(--color-sand); border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.13); padding: 16px; min-width: 280px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                  <button type="button" @click="noteRangeCalPrevMonth" style="background: none; border: none; cursor: pointer; font-size: 16px; color: var(--text-dark); padding: 4px 8px; border-radius: 6px;">&lt;</button>
                  <span style="font-weight: 700; font-size: 14px; color: var(--text-dark);">{{ noteRangeCalMonthLabel }}</span>
                  <button type="button" @click="noteRangeCalNextMonth" style="background: none; border: none; cursor: pointer; font-size: 16px; color: var(--text-dark); padding: 4px 8px; border-radius: 6px;">&gt;</button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 4px;">
                  <span v-for="(d, i) in ['S','S','R','K','J','S','M']" :key="'nh'+i" style="text-align: center; font-size: 10.5px; font-weight: 700; color: var(--text-muted); padding: 2px 0;">{{ d }}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;">
                  <span v-for="cell in noteRangeCalCells" :key="cell.key" @click="cell.date ? onNoteRangeCalClick(cell.date) : null"
                    :style="getNoteRangeCellStyle(cell)"
                    style="text-align: center; font-size: 13px; padding: 6px 2px; border-radius: 7px; cursor: pointer; user-select: none; transition: background 0.12s;">
                    {{ cell.label }}
                  </span>
                </div>
                <div style="margin-top: 10px; font-size: 11px; color: var(--text-muted); text-align: center; line-height: 1.4;">
                  <span v-if="!noteFilterStartDate">Klik tanggal mulai</span>
                  <span v-else-if="!noteFilterEndDate">Klik tanggal akhir</span>
                  <span v-else style="color: var(--color-terracotta); font-weight: 600;">✓ Rentang dipilih</span>
                </div>
                <button v-if="noteFilterStartDate || noteFilterEndDate" type="button" @click="noteFilterStartDate=''; noteFilterEndDate=''; noteShowRangePicker=false"
                  style="margin-top: 8px; width: 100%; background: var(--bg-cream); border: 1px solid var(--color-sand); color: var(--text-dark); border-radius: 7px; padding: 6px; font-size: 12px; cursor: pointer; font-weight: 600;">
                  Hapus Rentang
                </button>
              </div>
            </div>

            <!-- Filter Kategori button (inline compact) -->
            <div style="position: relative;" @click.stop>
              <button @click.stop="showNoteFilterCatDD = !showNoteFilterCatDD; noteShowRangePicker = false"
                :style="noteFilterCategory ? { borderColor: 'var(--color-terracotta)', background: '#FFF4ED', color: 'var(--color-terracotta)' } : { borderColor: 'var(--color-sand)', background: 'var(--bg-cream)', color: 'var(--text-muted)' }"
                style="height: 32px; padding: 0 10px 0 10px; border: 1.5px solid; border-radius: 8px; font-size: 12px; font-family: 'Outfit', sans-serif; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; transition: all 0.15s;">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
                {{ noteFilterCategory || 'Kategori' }}
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :style="{ transform: showNoteFilterCatDD ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.18s' }"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div v-if="showNoteFilterCatDD" @click.stop
                style="position: absolute; top: calc(100% + 5px); left: 0; z-index: 99999; background: var(--color-paper,#FAF7F2); border: 1.5px solid var(--color-sand-light,#EDE8E1); border-radius: 14px; box-shadow: 0 8px 32px rgba(61,46,34,0.16); padding: 6px; min-width: 180px; max-height: 220px; overflow-y: auto;">
                <button @click.stop="noteFilterCategory = ''; showNoteFilterCatDD = false"
                  :style="!noteFilterCategory ? { background: 'var(--color-sand-light,#EDE8E1)' } : {}"
                  style="width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; background: transparent; transition: background 0.13s;"
                  onmouseover="this.style.background='var(--color-cream,#FDF5EB)'" onmouseout="this.style.background='transparent'">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--color-sand,#C8BDB5)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
                  <span style="flex: 1; font-size: 12.5px; font-weight: 600; color: var(--text-secondary,#7A6F66);">Semua Kategori</span>
                  <svg v-if="!noteFilterCategory" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <div style="height:1px; background:var(--color-sand-light,#EDE8E1); margin:3px 6px;"></div>
                <button v-for="cat in noteCategories" :key="'nfcat-'+cat"
                  @click.stop="noteFilterCategory = cat; showNoteFilterCatDD = false"
                  :style="noteFilterCategory === cat ? { background: 'rgba(214,123,82,0.08)' } : {}"
                  style="width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px 10px; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; background: transparent; transition: background 0.13s;"
                  onmouseover="this.style.background='rgba(214,123,82,0.07)'" onmouseout="this.style.background='transparent'">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                  <span style="flex: 1; font-size: 12.5px; font-weight: 600; color: var(--text-dark,#3D2E22);">{{ cat }}</span>
                  <svg v-if="noteFilterCategory === cat" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
              </div>
            </div>

            <!-- Reset filter -->
            <button v-if="noteFilterStartDate || noteFilterEndDate || noteFilterCategory"
              @click="noteFilterStartDate=''; noteFilterEndDate=''; noteFilterCategory=''; noteShowRangePicker=false"
              style="height: 32px; padding: 0 10px; border: 1.5px solid var(--color-terracotta); background: transparent; color: var(--color-terracotta); border-radius: 8px; font-size: 12px; font-family: 'Outfit', sans-serif; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; transition: all 0.15s;">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
              Reset
            </button>

            <!-- Spacer -->
            <div style="flex: 1;"></div>

            <!-- Jumlah + Note Baru -->
            <span style="font-size: 11.5px; color: var(--text-muted); font-weight: 600; white-space: nowrap;">{{ filteredNotes.length }} note</span>
            <button class="btn btn-primary" @click="openAddNoteForm" style="height: 32px; padding: 0 14px; font-size: 12.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; white-space: nowrap;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Note Baru
            </button>
          </div>
        </div>

        <div v-if="filteredNotes.length === 0" style="text-align: center; padding: 60px 20px; color: var(--text-muted); border: 1.5px dashed var(--color-sand); border-radius: 16px; background: var(--bg-cream);">
          <p style="font-size: 32px; margin-bottom: 12px;">📝</p>
          <p style="font-size: 15px; font-weight: 600;">Belum ada catatan yang ditemukan.</p>
        </div>

        <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;">
          <div v-for="note in filteredNotes" :key="note.id" 
               :style="{ backgroundColor: getNoteColorStyle(note.color).bg, borderRadius: '20px', padding: '22px 20px 18px', position: 'relative', transition: 'all 0.22s', cursor: 'default', border: '1.5px solid ' + getNoteColorStyle(note.color).border }"
               onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 16px 36px rgba(0,0,0,0.10)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            
            <!-- Top row: category label + actions -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <span :style="{ color: getNoteColorStyle(note.color).headerText }"
                style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; display: inline-flex; align-items: center; gap: 5px;">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle></svg>
                {{ note.category }}
              </span>
              <div style="display: flex; gap: 2px;">
                <button @click="editNote(note)" title="Edit" style="background: none; border: none; cursor: pointer; padding: 5px; border-radius: 6px; opacity: 0.55; transition: opacity 0.15s, background 0.15s;" onmouseover="this.style.opacity='1'; this.style.background='rgba(0,0,0,0.06)'" onmouseout="this.style.opacity='0.55'; this.style.background='none'">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" :stroke="getNoteColorStyle(note.color).headerText" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button @click="deleteNote(note.id)" title="Hapus" style="background: none; border: none; cursor: pointer; padding: 5px; border-radius: 6px; opacity: 0.55; transition: opacity 0.15s, background 0.15s;" onmouseover="this.style.opacity='1'; this.style.background='rgba(185,28,28,0.08)'" onmouseout="this.style.opacity='0.55'; this.style.background='none'">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" :stroke="getNoteColorStyle(note.color).headerText" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>

            <!-- Big title -->
            <h3 :style="{ color: getNoteColorStyle(note.color).headerText }"
              style="font-size: 19px; font-weight: 800; margin: 0 0 10px 0; line-height: 1.25; letter-spacing: -0.01em;">
              {{ note.title }}
            </h3>

            <!-- Body preview -->
            <p style="font-size: 13px; line-height: 1.55; margin: 0 0 16px 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;"
              :style="{ color: getNoteColorStyle(note.color).headerText, opacity: '0.72' }">
              {{ note.body }}
            </p>

            <!-- Bottom row: date tag -->
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span :style="{ background: getNoteColorStyle(note.color).headerText + '15', color: getNoteColorStyle(note.color).headerText }"
                style="font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px;">
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {{ formatDate(note.date) }}
              </span>

            </div>
          </div>
        </div>

        <transition name="modal-fade">
          <div v-if="showAddNoteForm" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(44, 38, 33, 0.6); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 99999;" @click.self="safeCloseNoteForm">
            <div style="background: var(--bg-card); max-width: 480px; width: 90%; padding: 28px; border-radius: 16px; box-shadow: 0 16px 40px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;">
              
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-size: 18px; margin: 0; color: var(--text-dark); display: flex; align-items: center; gap: 8px;">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-terracotta)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                  {{ editingNoteId ? 'Edit Note' : 'Buat Note Baru' }}
                </h3>
                <button @click="cancelNoteForm" style="background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:24px; line-height:1;">✕</button>
              </div>

              <form @submit.prevent="saveNote">
                <div class="form-group" style="margin-bottom: 16px;">
                  <label>Judul / Header Note</label>
                  <input type="text" class="form-input" v-model="noteForm.title" placeholder="cth. Introduction to Psychology" required style="font-weight: 600;" />
                </div>
                
                <div class="form-group" style="margin-bottom: 16px;">
                  <label>Kategori</label>
                  <div style="display: flex; gap: 8px;">
                    <select class="form-input" v-model="noteForm.category" required style="flex: 1;">
                      <option v-for="cat in noteCategories" :key="'opt-' + cat" :value="cat">{{ cat }}</option>
                    </select>
                    <button type="button" class="btn btn-secondary" @click="showNoteCatManager = !showNoteCatManager" style="padding: 0 12px; font-size: 16px;" title="Kelola Kategori">⚙️</button>
                  </div>
                  <div v-if="showNoteCatManager" style="margin-top: 8px; background: var(--bg-cream); padding: 12px; border-radius: 8px; border: 1.5px solid var(--color-sand);">
                    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;">
                      <span v-for="cat in noteCategories" :key="'chip-' + cat" style="background: #fff; border: 1px solid var(--color-sand); padding: 2px 8px; border-radius: 12px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;">
                        {{ cat }}
                        <button type="button" @click="deleteNoteCategory(cat)" style="background: none; border: none; cursor: pointer; color: #DC2626;">✕</button>
                      </span>
                    </div>
                    <div style="display: flex; gap: 6px;">
                      <input type="text" class="form-input" v-model="newNoteCatInput" placeholder="Kategori baru..." style="height: 32px; font-size: 12px;" @keydown.enter.prevent="addNoteCategory" />
                      <button type="button" class="btn btn-primary" @click="addNoteCategory" style="height: 32px; padding: 0 12px; font-size: 12px;">Tambah</button>
                    </div>
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 20px;">
                  <label>Isi Note</label>
                  <textarea class="form-input" v-model="noteForm.body" rows="6" placeholder="Ketik isi catatan di sini..." required></textarea>
                </div>

                <!-- Color Picker -->
                <div style="margin-bottom: 20px;">
                  <label style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">Warna Kartu</label>
                  <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <button v-for="c in noteColorOptions" :key="c.key" type="button"
                      @click="noteForm.color = c.key"
                      :title="c.label"
                      :style="{
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: c.bg,
                        border: noteForm.color === c.key ? '3px solid ' + c.headerText : '2px solid transparent',
                        boxShadow: noteForm.color === c.key ? '0 0 0 2px #fff, 0 0 0 4px ' + c.headerText : 'none',
                        cursor: 'pointer', transition: 'all 0.15s', flexShrink: '0',
                        outline: 'none', padding: '0',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                      }">
                      <svg v-if="noteForm.color === c.key" viewBox="0 0 24 24" width="13" height="13" fill="none" :stroke="c.headerText" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    <!-- Custom hex color picker -->
                    <div style="position:relative; flex-shrink:0;">
                      <button type="button" @click.stop="showNoteCustomColor = !showNoteCustomColor"
                        :style="{
                          width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer',
                          background: noteForm.color && noteForm.color.startsWith('#') ? noteForm.color : 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)',
                          border: (noteForm.color && noteForm.color.startsWith('#')) ? '3px solid #555' : '2px dashed #bbb',
                          boxShadow: (noteForm.color && noteForm.color.startsWith('#')) ? '0 0 0 2px #fff, 0 0 0 4px #555' : 'none',
                          outline: 'none', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                        }" title="Warna kustom">
                        <svg v-if="!(noteForm.color && noteForm.color.startsWith('#'))" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#888" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
                      </button>
                      <div v-if="showNoteCustomColor" @click.stop
                        style="position:absolute; top:calc(100% + 6px); left:0; z-index:9999; background:#fff; border:1.5px solid var(--color-sand); border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.12); padding:12px; min-width:180px;">
                        <div style="font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:8px;">Pilih warna kustom</div>
                        <input type="color" v-model="noteCustomColorInput"
                          style="width:100%; height:36px; border:none; border-radius:6px; cursor:pointer; padding:2px;" />
                        <div style="display:flex; gap:6px; margin-top:8px;">
                          <button type="button" @click="noteForm.color = noteCustomColorInput; showNoteCustomColor = false"
                            style="flex:1; background:var(--color-terracotta); color:#fff; border:none; border-radius:7px; padding:6px; font-size:12px; font-weight:700; cursor:pointer;">Pilih</button>
                          <button type="button" @click="showNoteCustomColor=false"
                            style="flex:1; background:var(--bg-cream); border:1px solid var(--color-sand); color:var(--text-dark); border-radius:7px; padding:6px; font-size:12px; font-weight:600; cursor:pointer;">Batal</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Preview pill -->
                  <div v-if="noteForm.color" style="margin-top:10px; display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:20px; font-size:11.5px; font-weight:600;"
                    :style="{ background: getNoteColorStyle(noteForm.color).bg, color: getNoteColorStyle(noteForm.color).headerText, border: '1.5px solid ' + getNoteColorStyle(noteForm.color).border }">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
                    Preview kartu
                  </div>
                </div>
                
                <div style="display: flex; gap: 10px;">
                  <button type="button" class="btn" @click="cancelNoteForm" style="flex: 1; background-color: var(--bg-cream); border: 1.5px solid var(--color-sand); color: var(--text-dark); font-weight: bold; cursor: pointer; border-radius: 8px;">Batal</button>
                  <button type="submit" class="btn btn-primary" style="flex: 2;">{{ editingNoteId ? 'Simpan Perubahan' : 'Simpan Note' }}</button>
                </div>
              </form>
            </div>
          </div>
        </transition>

      </div>

      <!-- ── Done Celebration Modal ── -->
      <transition name="reminder-popup-fade">
        <div v-if="showDoneModal" class="reminder-popup-overlay" style="z-index: 10000;">
          <div class="reminder-popup-card">

            <!-- Header — struktur identik reminder popup live/open -->
            <div class="reminder-popup-header">
              <div class="reminder-popup-icon-wrap">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div style="flex: 1; min-width: 0;">
                <div class="reminder-popup-title">Task Selesai! ✦</div>
                <div class="reminder-popup-date">Kerja bagus — task plan berhasil diselesaikan</div>
              </div>
              <span style="font-size: 17px; animation: doneConfetti 1.3s ease infinite; flex-shrink: 0;">🎊</span>
            </div>

            <!-- Body -->
            <div class="reminder-popup-body">
              <p class="reminder-popup-intro">Task yang baru saja kamu tandai selesai:</p>

              <div class="reminder-popup-item">
                <div class="reminder-popup-item-time">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                  <div class="reminder-popup-item-title">{{ pendingDonePlan ? pendingDonePlan.tasks : '' }}</div>
                  <div v-if="pendingDonePlan && pendingDonePlan.category" class="reminder-popup-item-sub">{{ pendingDonePlan.category }}</div>
                </div>
              </div>

              <p class="reminder-popup-intro" style="margin-top: 12px; margin-bottom: 0;">Mau langsung catat ke <strong style="color: var(--text-dark);">Riwayat Kegiatan Kerja</strong>?</p>
            </div>

            <!-- Footer -->
            <div class="reminder-popup-footer">
              <button class="reminder-popup-btn-dismiss" @click="closeDoneModal">Nanti Dulu</button>
              <button class="reminder-popup-btn-open" @click="confirmDoneAndLog">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                Ya, Catat Sekarang!
              </button>
            </div>

          </div>
        </div>
      </transition>

    </div>
  `,
  data() {
    return {
      // Data Logbook yang lama
      showAddLog: false,
      editingLogId: null,
      showManageCategories: false,
      syncToContentOnSave: false,
      logs: [],
      plans: [],
      customCategories: [],
      newCategoryInput: '',
      showCategoryManager: false,
      showAddPlan: false,
      taskPlanCollapsed: false,
      editingPlanId: null,
      pendingConvertPlanId: null,  // ID task plan yang sedang dikonversi ke log (baru dihapus saat save)
      showDoneModal: false,
      pendingDonePlan: null,
      openPhaseDropdownId: null,
      openTimeDropdownId: null,
      timeEditForm: { time: '', timeEnd: '' },
      showFilterCategoryDD: false,
      showPriorityDD: false,
      showJadwalDD: false,
      showTampilkanDD: false,
      planFilterPriority: '',
      planFilterSchedule: '',
      planForm: {
        date: localDateStr(),
        time: '',
        timeEnd: '',
        category: 'Administrasi',
        tasks: '',
        priority: 'Medium',
        requester: '',
        phase: 'To-do'
      },
      searchQuery: '',
      filterStartDate: '',
      filterEndDate: '',
      filterCategory: '',
      showRangePicker: false,
      rangeCalYear: new Date().getFullYear(),
      rangeCalMonth: new Date().getMonth(),
      sortBy: 'date',
      sortDesc: true,
      currentPage: 1,
      itemsPerPage: 5,
      analyticsPeriod: 'semua',
      pendingNextActionSourceLogId: null,
      pendingNextActionItemIdx: -1,
      form: {
        date: localDateStr(),
        category: 'Administrasi',
        tasks: '',
        achievements: '',
        nextActions: [{ id: 'na-' + Date.now(), text: '', completed: false }],
        documentLink: ''
      },
      
      // Data Khusus Fitur Notes
      showFullNotesPage: false,
      showAddNoteForm: false,
      showNoteCatManager: false,
      newNoteCatInput: '',
      noteFilterCategory: '',
      noteFilterDate: '',
      noteFilterStartDate: '',
      noteFilterEndDate: '',
      noteShowRangePicker: false,
      noteRangeCalViewDate: localMonthStr(),
      noteFilterSchedule: '',
      showNoteFilterCatDD: false,
      showNoteJadwalDD: false,
      showNoteCustomColor: false,
      noteCustomColorInput: '#D1FAE5',
      notes: [],
      noteCategories: ['Psychology', 'Groceries', 'Work', 'Ideas'],
      editingNoteId: null, // Baru: untuk menyimpan ID note yang sedang di-edit
      noteForm: {
        category: 'Work',
        title: '',
        body: '',
        color: 'green'
      }
    };
  },
  computed: {
    // Computed Logbook (Existing)
    todayStr() {
      return localDateStr();
    },
    tomorrowStr() {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return localDateStr(d);
    },
    noteColorOptions() {
      return [
        { key: 'pink',   label: 'Merah Muda', bg: '#FCE7F3', headerText: '#831843', border: '#f3ccde' },
        { key: 'yellow', label: 'Kuning',     bg: '#FEF3C7', headerText: '#92400E', border: '#f5d782' },
        { key: 'green',  label: 'Hijau',      bg: '#D1FAE5', headerText: '#065F46', border: '#6ee7b7' },
        { key: 'blue',   label: 'Biru',       bg: '#DBEAFE', headerText: '#1E3A8A', border: '#93c5fd' },
        { key: 'purple', label: 'Ungu',       bg: '#F3E8FF', headerText: '#4C1D95', border: '#c4b5fd' },
        { key: 'rose',   label: 'Rose',       bg: '#FFE4E6', headerText: '#9F1239', border: '#fda4af' },
        { key: 'orange', label: 'Oranye',     bg: '#FFEDD5', headerText: '#7C2D12', border: '#fdba74' },
        { key: 'teal',   label: 'Teal',       bg: '#CCFBF1', headerText: '#134E4A', border: '#5eead4' },
      ];
    },
    defaultCategories() {
      return ['Administrasi', 'HR Operational'];
    },
    rangeCalMonthLabel() {
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      return `${months[this.rangeCalMonth]} ${this.rangeCalYear}`;
    },
    rangeCalCells() {
      const year = this.rangeCalYear;
      const month = this.rangeCalMonth;
      const firstDay = new Date(year, month, 1).getDay();
      const startOffset = (firstDay === 0) ? 6 : firstDay - 1;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const cells = [];
      for (let i = 0; i < startOffset; i++) cells.push({ key: 'e' + i, date: null, label: '' });
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        cells.push({ key: dateStr, date: dateStr, label: d });
      }
      return cells;
    },
    allCategories() {
      return [...this.defaultCategories, ...this.customCategories];
    },
    filteredLogs() {
      return this.logs.filter(log => {
        const q = this.searchQuery.toLowerCase().trim();
        const matchesQuery = !q || ['category','tasks','achievements','documentLink'].some(k => log[k] && log[k].toLowerCase().includes(q)) || (log.nextActions || []).some(na => na.text && na.text.toLowerCase().includes(q)) || (log.nextAction && log.nextAction.toLowerCase().includes(q));
        const matchesCategory = !this.filterCategory || log.category === this.filterCategory;
        const matchesDates = (!this.filterStartDate || log.date >= this.filterStartDate) && (!this.filterEndDate || log.date <= this.filterEndDate);
        const matchesPeriod = this.analyticsPeriod !== 'today' || log.date === this.todayStr;
        return matchesQuery && matchesCategory && matchesDates && matchesPeriod;
      });
    },
    selectedRangeDaysCount() {
      if (this.analyticsPeriod === 'today') return 1;
      if (this.filterStartDate && this.filterEndDate) {
        const diff = (new Date(this.filterEndDate) - new Date(this.filterStartDate)) / (1000*60*60*24);
        return Math.ceil(diff) + 1;
      }
      if (this.filterStartDate) {
        const diff = (new Date() - new Date(this.filterStartDate)) / (1000*60*60*24);
        return Math.ceil(diff) + 1;
      }
      if (this.filteredLogs.length === 0) return 0;
      const dates = this.filteredLogs.map(l => new Date(l.date).getTime());
      return Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000*60*60*24)) + 1;
    },
    nextActionCompletionRate() {
      let total = 0, completed = 0;
      this.filteredLogs.forEach(l => {
        const actions = this.getNextActions ? this.getNextActions(l) : (l.nextActions || (l.nextAction ? [{ text: l.nextAction, completed: !!l.nextActionCompleted }] : []));
        actions.forEach(na => { if (na.text && na.text.trim()) { total++; if (na.completed) completed++; } });
      });
      if (total === 0) return '0%';
      return Math.round((completed / total) * 100) + '%';
    },
    sortedFilteredPlans() {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      const today = this.todayStr;
      const q = this.searchQuery.toLowerCase().trim();
      return [...this.plans]
        .filter(p => {
          // Plan yang sudah Completed DAN sudah benar-benar tercatat ke Riwayat Kerja baru disembunyikan.
          // Kalau baru "Completed" tapi user batal/nanti saat ditanya mau dicatat atau tidak,
          // plan tetap harus tampil di list supaya bisa dicatat kapan saja.
          if (p.phase === 'Completed' && p.loggedToHistory && !(this.pendingDonePlan && this.pendingDonePlan.id === p.id)) return false;
          // ── local plan filters ──
          if (this.planFilterPriority && p.priority !== this.planFilterPriority) return false;
          if (this.planFilterSchedule === 'overdue' && !(p.date < today)) return false;
          if (this.planFilterSchedule === 'today' && p.date !== today) return false;
          if (this.planFilterSchedule === 'tomorrow' && p.date !== this.tomorrowStr) return false;
          if (this.planFilterSchedule === 'upcoming' && p.date <= today) return false;
          // ── global filter bar ──
          if (q && !['tasks','category','requester'].some(k => p[k] && p[k].toLowerCase().includes(q))) return false;
          if (this.filterCategory && p.category !== this.filterCategory) return false;
          if (this.filterStartDate && p.date < this.filterStartDate) return false;
          if (this.filterEndDate && p.date > this.filterEndDate) return false;
          return true;
        })
        .sort((a, b) => {
          const aOverdue = a.date < today;
          const bOverdue = b.date < today;
          const aToday  = a.date === today;
          const bToday  = b.date === today;
          const aGroup  = aOverdue ? 0 : aToday ? 1 : 2;
          const bGroup  = bOverdue ? 0 : bToday ? 1 : 2;
          if (aGroup !== bGroup) return aGroup - bGroup;
          if (a.date !== b.date) return a.date < b.date ? -1 : 1;
          const aTime = a.time || '99:99';
          const bTime = b.time || '99:99';
          if (aTime !== bTime) return aTime < bTime ? -1 : 1;
          return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
        });
    },
    filteredAndSortedLogs() {
      const sorted = [...this.logs.filter(log => {
        const q = this.searchQuery.toLowerCase().trim();
        const matchesQuery = !q || ['category','tasks','achievements','documentLink'].some(k => log[k] && log[k].toLowerCase().includes(q)) || (log.nextActions || []).some(na => na.text && na.text.toLowerCase().includes(q)) || (log.nextAction && log.nextAction.toLowerCase().includes(q));
        const matchesCategory = !this.filterCategory || log.category === this.filterCategory;
        const matchesDates = (!this.filterStartDate || new Date(log.date) >= new Date(this.filterStartDate)) && (!this.filterEndDate || new Date(log.date) <= new Date(this.filterEndDate));
        return matchesQuery && matchesCategory && matchesDates;
      })];
      sorted.sort((a, b) => {
        const valA = this.sortBy === 'date' ? new Date(a[this.sortBy] || 0) : (a[this.sortBy] || '').toString().toLowerCase();
        const valB = this.sortBy === 'date' ? new Date(b[this.sortBy] || 0) : (b[this.sortBy] || '').toString().toLowerCase();
        if (valA < valB) return this.sortDesc ? 1 : -1;
        if (valA > valB) return this.sortDesc ? -1 : 1;
        return 0;
      });
      return sorted;
    },
    totalPages() { return Math.ceil(this.filteredAndSortedLogs.length / this.itemsPerPage) || 1; },
    paginatedLogs() {
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredAndSortedLogs.slice(start, start + this.itemsPerPage);
    },
    paginationInfo() {
      if (this.filteredAndSortedLogs.length === 0) return { start: 0, end: 0 };
      const start = (this.currentPage - 1) * this.itemsPerPage + 1;
      return { start, end: Math.min(start + this.itemsPerPage - 1, this.filteredAndSortedLogs.length) };
    },
    categoryPercentages() {
      const counts = {};
      const total = this.filteredLogs.length;
      this.filteredLogs.forEach(l => { counts[l.category] = (counts[l.category] || 0) + 1; });
      const results = {};
      Object.keys(counts).forEach(cat => {
        results[cat] = { count: counts[cat], percentage: total > 0 ? Math.round((counts[cat] / total) * 100) : 0 };
      });
      return results;
    },
    
    // Computed Khusus Notes
    recentNotes() {
      return [...this.notes].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    },
    filteredNotes() {
      const today = this.todayStr;
      return this.notes.filter(n => {
        const matchCat = !this.noteFilterCategory || n.category === this.noteFilterCategory;
        const matchStart = !this.noteFilterStartDate || n.date >= this.noteFilterStartDate;
        const matchEnd = !this.noteFilterEndDate || n.date <= this.noteFilterEndDate;
        let matchSched = true;
        if (this.noteFilterSchedule === 'today') matchSched = n.date === today;
        else if (this.noteFilterSchedule === 'upcoming') matchSched = n.date > today;
        else if (this.noteFilterSchedule === 'overdue') matchSched = n.date < today;
        return matchCat && matchStart && matchEnd && matchSched;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    noteRangeCalMonthLabel() {
      const [y, m] = (this.noteRangeCalViewDate || localMonthStr()).split('-').map(Number);
      return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    },
    noteRangeCalCells() {
      const [y, m] = (this.noteRangeCalViewDate || localMonthStr()).split('-').map(Number);
      const firstDay = new Date(y, m - 1, 1).getDay();
      const daysInMonth = new Date(y, m, 0).getDate();
      const cells = [];
      for (let i = 0; i < firstDay; i++) cells.push({ key: 'e' + i, label: '', date: null });
      for (let d = 1; d <= daysInMonth; d++) {
        const dd = String(d).padStart(2,'0'), mm = String(m).padStart(2,'0');
        cells.push({ key: `${y}-${mm}-${dd}`, label: d, date: `${y}-${mm}-${dd}` });
      }
      return cells;
    }
  },
  async created() {
    // ✅ FIX: Tunggu Supabase storage siap sebelum baca data
    await globalThis._workspaceStorageReady;

    // Load Logbook Data
    const savedCats = WorkspaceStorage.getItem('personal_workspace_job_categories');
    if (savedCats) { try { this.customCategories = JSON.parse(savedCats); } catch (_e) { this.customCategories = []; } }
    const savedPlans = WorkspaceStorage.getItem('personal_workspace_job_plans');
    if (savedPlans) { try { this.plans = JSON.parse(savedPlans); } catch (_e) { this.plans = []; } }
    const saved = WorkspaceStorage.getItem('personal_workspace_job_logs');
    if (saved) {
      try {
        this.logs = JSON.parse(saved);
        this.logs.forEach((l, i) => { if (!l.id) l.id = 'log-' + i + '-' + Date.now(); });
      } catch (_e) { this.logs = []; }
    }
    
    // Load Notes Data
    const savedNotes = WorkspaceStorage.getItem('personal_workspace_job_notes');
    if (savedNotes) { try { this.notes = JSON.parse(savedNotes); } catch(_e) { this.notes = []; } }
    const savedNoteCats = WorkspaceStorage.getItem('personal_workspace_job_note_cats');
    if (savedNoteCats) { try { this.noteCategories = JSON.parse(savedNoteCats); } catch(_e) { /* ignore */ } }
  },
  methods: {
    // ── Logbook Methods (Existing) ──
    addCategory() {
      const name = this.newCategoryInput.trim();
      if (!name) return;
      if (this.allCategories.includes(name)) { alert('Kategori sudah ada!'); return; }
      this.customCategories.push(name);
      WorkspaceStorage.setItem('personal_workspace_job_categories', JSON.stringify(this.customCategories));
      this.newCategoryInput = '';
    },
    deleteCategory(cat) {
      if (!confirm(`Hapus kategori "${cat}"?`)) return;
      this.customCategories = this.customCategories.filter(c => c !== cat);
      WorkspaceStorage.setItem('personal_workspace_job_categories', JSON.stringify(this.customCategories));
    },
    openAddPlan() {
      if (this.showAddPlan && !this.editingPlanId) {
        this.showAddPlan = false;
        return;
      }
      this.editingPlanId = null;
      this.planForm.tasks = '';
      this.planForm.date = this.todayStr;
      this.planForm.time = '';
      this.planForm.timeEnd = '';
      this.planForm.category = this.allCategories[0] || 'Administrasi';
      this.planForm.priority = 'Medium';
      this.planForm.requester = '';
      this.showAddPlan = true;
    },
    openTimeDropdown(plan) {
      if (this.openTimeDropdownId === plan.id) {
        this.openTimeDropdownId = null;
        return;
      }
      this.openPhaseDropdownId = null;
      this.timeEditForm.time = plan.time || '';
      this.timeEditForm.timeEnd = plan.timeEnd || '';
      this.openTimeDropdownId = plan.id;
    },
    saveTimeFromDropdown(plan) {
      plan.time = this.timeEditForm.time;
      plan.timeEnd = this.timeEditForm.timeEnd;
      // Jika task plan ini sedang dibuka di form Edit Task Plan, sinkronkan juga inputnya
      if (this.editingPlanId === plan.id) {
        this.planForm.time = plan.time;
        this.planForm.timeEnd = plan.timeEnd;
      }
      this.savePlansToStorage();
      this.openTimeDropdownId = null;
    },
    startEditPlan(plan) {
      this.editingPlanId = plan.id;
      this.planForm.date = plan.date;
      this.planForm.category = plan.category;
      this.planForm.tasks = plan.tasks;
      this.planForm.priority = plan.priority || 'Medium';
      this.planForm.requester = plan.requester || '';
      this.planForm.time = plan.time || '';
      this.planForm.timeEnd = plan.timeEnd || '';
      this.showAddPlan = true;
      this.$nextTick(() => {
        const el = document.querySelector('.job-logbook');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },
    cancelPlanForm() {
      this.showAddPlan = false;
      this.editingPlanId = null;
      this.pendingNextActionSourceLogId = null;
      this.pendingNextActionItemIdx = -1;
      this.planForm.tasks = '';
      this.planForm.date = this.todayStr;
      this.planForm.time = '';
      this.planForm.timeEnd = '';
      this.planForm.priority = 'Medium';
      this.planForm.requester = '';
    },
    savePlan() {
      if (!this.planForm.tasks.trim()) { alert('Tugas tidak boleh kosong!'); return; }
      if (this.editingPlanId) {
        const idx = this.plans.findIndex(p => p.id === this.editingPlanId);
        if (idx !== -1) {
          this.plans[idx].date = this.planForm.date;
          this.plans[idx].time = this.planForm.time;
          this.plans[idx].timeEnd = this.planForm.timeEnd;
          this.plans[idx].category = this.planForm.category;
          this.plans[idx].tasks = this.planForm.tasks.trim();
          this.plans[idx].priority = this.planForm.priority;
          this.plans[idx].requester = this.planForm.requester.trim();
        }
        this.editingPlanId = null;
      } else {
        const newPlan = {
          id: 'plan-' + Date.now(),
          date: this.planForm.date,
          time: this.planForm.time,
          timeEnd: this.planForm.timeEnd,
          category: this.planForm.category,
          tasks: this.planForm.tasks.trim(),
          priority: this.planForm.priority,
          requester: this.planForm.requester.trim(),
          phase: 'To-do'
        };
        this.plans.unshift(newPlan);
      }
      // Tandai item next action yang spesifik sebagai selesai
      if (this.pendingNextActionSourceLogId) {
        const src = this.logs.find(l => l.id === this.pendingNextActionSourceLogId);
        if (src) {
          this.getNextActions(src); // compute but result used implicitly via src reference
          const idx2 = this.pendingNextActionItemIdx;
          if (src.nextActions && idx2 >= 0 && idx2 < src.nextActions.length) {
            src.nextActions[idx2].completed = true;
          } else if (src.nextAction) {
            // Legacy: tandai whole log
            src.nextActionCompleted = true;
          }
        }
        this.pendingNextActionSourceLogId = null;
        this.pendingNextActionItemIdx = -1;
        this.saveToStorage();
      }
      this.savePlansToStorage();
      this.planForm.tasks = '';
      this.planForm.date = this.todayStr;
      this.planForm.time = '';
      this.planForm.timeEnd = '';
      this.planForm.priority = 'Medium';
      this.planForm.requester = '';
      this.showAddPlan = false;
    },
    deletePlan(id) {
      if (!confirm('Hapus task plan ini?')) return;
      this.plans = this.plans.filter(p => p.id !== id);
      if (this.editingPlanId === id) { this.editingPlanId = null; this.showAddPlan = false; }
      this.savePlansToStorage();
    },
    updatePlanPhase(id, phase) {
      const plan = this.plans.find(p => p.id === id);
      if (plan) {
        plan.phase = phase;
        this.savePlansToStorage();
        if (phase === 'Completed') {
          this.$nextTick(() => {
            this.pendingDonePlan = plan;
            this.showDoneModal = true;
          });
        }
      }
    },
    closeDoneModal() {
      // Tutup popup saja — plan tetap Completed, tidak dihapus dari list
      this.showDoneModal = false;
      this.pendingDonePlan = null;
    },
    confirmDoneAndLog() {
      if (this.pendingDonePlan) this.convertPlanToLog(this.pendingDonePlan);
      this.showDoneModal = false;
      this.pendingDonePlan = null;
    },
    cancelAddLog() {
      // Batal isi form — kembalikan task plan ke list jika sedang dikonversi
      this.showAddLog = false;
      this.editingLogId = null;
      this.pendingConvertPlanId = null;
      // Form di-reset (opsional — supaya bersih saat dibuka berikutnya)
      this.form = { date: this.todayStr, category: 'Administrasi', tasks: '', achievements: '', nextActions: [{ id: 'na-' + Date.now(), text: '', completed: false }], documentLink: '' };
    },
    safeCloseAddLog() {
      // Cek apakah ada data yang sudah diisi sebelum menutup via klik overlay
      const hasData = this.form.tasks.trim() || this.form.achievements.trim() || this.form.nextActions.some(a => a.text.trim());
      if (hasData) {
        if (!confirm('Kamu sudah mengisi beberapa data. Yakin mau tutup dan buang perubahan?')) return;
      }
      this.cancelAddLog();
    },
    convertPlanToLog(plan) { // baru dihapus saat saveLog dipanggil
      this.pendingConvertPlanId = plan.id;
      this.form.date = plan.date;
      this.form.category = this.allCategories.includes(plan.category) ? plan.category : this.allCategories[0];
      this.form.tasks = plan.tasks;
      this.form.achievements = '';
      this.form.nextActions = [{ id: 'na-' + Date.now(), text: '', completed: false }];
      this.form.documentLink = '';
      // TIDAK hapus plan dulu — baru dihapus di saveLog saat user submit
      this.showAddLog = true;
      this.$nextTick(() => {
        const formEl = document.querySelector('.job-logbook');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
      });
    },
    savePlansToStorage() {
      WorkspaceStorage.setItem('personal_workspace_job_plans', JSON.stringify(this.plans));
      globalThis.dispatchEvent(new CustomEvent('ws-plans-updated'));
    },
    rangeCalPrevMonth() { if (this.rangeCalMonth === 0) { this.rangeCalMonth = 11; this.rangeCalYear--; } else this.rangeCalMonth--; },
    rangeCalNextMonth() { if (this.rangeCalMonth === 11) { this.rangeCalMonth = 0; this.rangeCalYear++; } else this.rangeCalMonth++; },
    onRangeCalClick(dateStr) {
      if (!this.filterStartDate || (this.filterStartDate && this.filterEndDate)) { this.filterStartDate = dateStr; this.filterEndDate = ''; }
      else {
        if (dateStr < this.filterStartDate) { this.filterEndDate = this.filterStartDate; this.filterStartDate = dateStr; }
        else this.filterEndDate = dateStr;
        this.showRangePicker = false;
      }
    },
    getRangeCellStyle(cell) {
      if (!cell.date) return { visibility: 'hidden' };
      const isStart = cell.date === this.filterStartDate, isEnd = cell.date === this.filterEndDate;
      const inRange = this.filterStartDate && this.filterEndDate && cell.date > this.filterStartDate && cell.date < this.filterEndDate;
      const isToday = cell.date === this.todayStr;
      if (isStart || isEnd) return { background: 'var(--color-terracotta)', color: '#fff', fontWeight: 'bold', borderRadius: '50%' };
      if (inRange) return { background: 'rgba(214,123,82,0.15)', color: 'var(--text-dark)', borderRadius: '4px' };
      if (isToday) return { border: '1.5px solid var(--color-terracotta)', color: 'var(--color-terracotta)', fontWeight: 'bold', borderRadius: '50%' };
      return { color: 'var(--text-dark)' };
    },
    noteRangeCalPrevMonth() {
      const [y, m] = this.noteRangeCalViewDate.split('-').map(Number);
      const d = new Date(y, m - 2, 1);
      this.noteRangeCalViewDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    },
    noteRangeCalNextMonth() {
      const [y, m] = this.noteRangeCalViewDate.split('-').map(Number);
      const d = new Date(y, m, 1);
      this.noteRangeCalViewDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    },
    onNoteRangeCalClick(dateStr) {
      if (!this.noteFilterStartDate || (this.noteFilterStartDate && this.noteFilterEndDate)) {
        this.noteFilterStartDate = dateStr; this.noteFilterEndDate = '';
      } else {
        if (dateStr < this.noteFilterStartDate) { this.noteFilterEndDate = this.noteFilterStartDate; this.noteFilterStartDate = dateStr; }
        else this.noteFilterEndDate = dateStr;
        this.noteShowRangePicker = false;
      }
    },
    getNoteRangeCellStyle(cell) {
      if (!cell.date) return { visibility: 'hidden' };
      const isStart = cell.date === this.noteFilterStartDate, isEnd = cell.date === this.noteFilterEndDate;
      const inRange = this.noteFilterStartDate && this.noteFilterEndDate && cell.date > this.noteFilterStartDate && cell.date < this.noteFilterEndDate;
      const isToday = cell.date === this.todayStr;
      if (isStart || isEnd) return { background: 'var(--color-terracotta)', color: '#fff', fontWeight: 'bold', borderRadius: '50%' };
      if (inRange) return { background: 'rgba(214,123,82,0.15)', color: 'var(--text-dark)', borderRadius: '4px' };
      if (isToday) return { border: '1.5px solid var(--color-terracotta)', color: 'var(--color-terracotta)', fontWeight: 'bold', borderRadius: '50%' };
      return { color: 'var(--text-dark)' };
    },
    formatDate(d) {
      try { return new Date(d).toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); }
      catch (_e) { return d; }
    },
    getCategoryColor(cat) {
      const colors = { 'Administrasi': '#4F46E5', 'HR Operational': '#10B981', 'Coding': '#06B6D4', 'Design': '#EC4899', 'Lainnya': '#6B7280' };
      if (colors[cat]) return colors[cat];
      let hash = 0;
      for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
      return `hsl(${Math.abs(hash) % 360}, 65%, 45%)`;
    },
    startEditLog(log) {
      this.editingLogId = log.id;
      this.form.date = log.date;
      this.form.category = this.allCategories.includes(log.category) ? log.category : this.allCategories[0];
      this.form.tasks = log.tasks;
      this.form.achievements = log.achievements;
      // Backward compat: migrasi nextAction string lama ke nextActions array
      if (log.nextActions && log.nextActions.length > 0) {
        this.form.nextActions = log.nextActions.map(na => ({ ...na }));
      } else if (log.nextAction && log.nextAction.trim()) {
        this.form.nextActions = [{ id: 'na-' + Date.now(), text: log.nextAction, completed: !!log.nextActionCompleted }];
      } else {
        this.form.nextActions = [{ id: 'na-' + Date.now(), text: '', completed: false }];
      }
      this.form.documentLink = log.documentLink || '';
      this.showAddLog = true;
    },
    saveLog() {
      if (this.editingLogId) {
        // Edit mode: update the existing log
        const idx = this.logs.findIndex(l => l.id === this.editingLogId);
        if (idx !== -1) {
          this.logs[idx].date = this.form.date;
          this.logs[idx].category = this.form.category;
          this.logs[idx].tasks = this.form.tasks;
          this.logs[idx].achievements = this.form.achievements;
          this.logs[idx].nextActions = this.form.nextActions.filter(na => na.text.trim());
          this.logs[idx].documentLink = this.form.documentLink;
        }
        this.editingLogId = null;
        this.saveToStorage();
        this.form = { date: this.todayStr, category: 'Administrasi', tasks: '', achievements: '', nextActions: [{ id: 'na-' + Date.now(), text: '', completed: false }], documentLink: '' };
        this.showAddLog = false;
        return;
      }
      if (this.pendingNextActionSourceLogId) {
        const src = this.logs.find(l => l.id === this.pendingNextActionSourceLogId);
        if (src) src.nextActionCompleted = true;
        this.pendingNextActionSourceLogId = null;
      }
      const newLog = {
        id: 'log-' + Date.now(),
        date: this.form.date,
        category: this.form.category,
        tasks: this.form.tasks,
        achievements: this.form.achievements,
        nextActions: this.form.nextActions.filter(na => na.text.trim()),
        documentLink: this.form.documentLink
      };
      this.logs.unshift(newLog);
      // Baru hapus task plan saat log benar-benar disimpan
      if (this.pendingConvertPlanId) {
        // Jangan hapus plan — cukup tandai Completed + loggedToHistory supaya tetap tampil
        // (coret) di agenda view, tapi hilang dari list Task Plan aktif
        const donePlan = this.plans.find(p => p.id === this.pendingConvertPlanId);
        if (donePlan) { donePlan.phase = 'Completed'; donePlan.loggedToHistory = true; }
        this.pendingConvertPlanId = null;
        this.savePlansToStorage();
      }
      this.saveToStorage();
      const shouldSync = this.syncToContentOnSave;
      this.form = { date: this.todayStr, category: 'Administrasi', tasks: '', achievements: '', nextActions: [{ id: 'na-' + Date.now(), text: '', completed: false }], documentLink: '' };
      this.showAddLog = false;
      this.currentPage = 1;
      if (shouldSync) { this.syncToContent(newLog); this.syncToContentOnSave = false; }
    },
    // Helper: normalisasi data log lama (string) atau baru (array) ke array
    getNextActions(log) {
      if (log.nextActions && log.nextActions.length > 0) return log.nextActions;
      if (log.nextAction && log.nextAction.trim()) {
        return [{ id: 'legacy', text: log.nextAction, completed: !!log.nextActionCompleted }];
      }
      return [];
    },
    // Form helpers
    addNextActionItem() {
      this.form.nextActions.push({ id: 'na-' + Date.now(), text: '', completed: false });
    },
    removeNextActionItem(idx) {
      if (this.form.nextActions.length > 1) this.form.nextActions.splice(idx, 1);
    },
    // Tombol tambah task dari item next action tertentu
    logNextActionItem(log, naIdx) {
      const actions = this.getNextActions(log);
      const na = actions[naIdx];
      if (!na || na.completed) return;
      this.editingPlanId = null;
      this.planForm.tasks = na.text;
      this.planForm.category = this.allCategories.includes(log.category) ? log.category : 'Administrasi';
      this.planForm.date = this.todayStr;
      this.planForm.time = '';
      this.planForm.timeEnd = '';
      this.planForm.priority = 'Medium';
      this.planForm.requester = '';
      // Simpan referensi: log id + index item
      this.pendingNextActionSourceLogId = log.id;
      this.pendingNextActionItemIdx = naIdx;
      this.showAddPlan = true;
      this.$nextTick(() => { const el = document.querySelector('.job-logbook'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    },
    logNextAction(log) {
      // Legacy — tidak dipakai lagi, tapi tetap ada untuk safety
      this.logNextActionItem(log, 0);
    },
    syncToContent(log) {
      globalThis.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'contentTracker' }));
      setTimeout(() => { globalThis.dispatchEvent(new CustomEvent('sync-logbook-content', { detail: { tasks: log.tasks, achievements: log.achievements, category: log.category } })); }, 250);
    },
    deleteLogById(id) {
      if (confirm('Yakin ingin menghapus catatan log kerja ini?')) { this.logs = this.logs.filter(l => l.id !== id && l.date !== id); this.saveToStorage(); }
    },
    toggleSort(field) { if (this.sortBy === field) this.sortDesc = !this.sortDesc; else { this.sortBy = field; this.sortDesc = true; } },
    resetFilters() { this.searchQuery = ''; this.filterStartDate = ''; this.filterEndDate = ''; this.filterCategory = ''; this.showRangePicker = false; },
    saveToStorage() { WorkspaceStorage.setItem('personal_workspace_job_logs', JSON.stringify(this.logs)); },
    exportToExcel() {
      const dataToExport = this.logs.map(log => ({ Tanggal: log.date, Kategori: log.category, 'Tugas / Pekerjaan': log.tasks, Capaian: log.achievements, 'Aksi Selanjutnya': (log.nextActions && log.nextActions.length ? log.nextActions.map((na,i) => (i+1)+'. '+na.text).join('; ') : (log.nextAction || '')), 'Tautan Dokumen': log.documentLink }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Job Logbook');
      XLSX.writeFile(workbook, 'Job_Logbook_' + localDateStr() + '.xlsx');
    },
    exportToPDF() {
      const { jsPDF } = globalThis.jspdf;
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(44, 38, 33);
      doc.text('Aesthetic Job Logbook', 14, 18);
      doc.setFont('Helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(120, 111, 102);
      doc.text('Daftar riwayat pencatatan tugas, capaian kerja harian, dan dokumen pendukung.', 14, 24);
      doc.autoTable({
        startY: 28,
        head: [['Tanggal', 'Kategori', 'Tugas / Aktivitas', 'Hasil Capaian', 'Aksi Selanjutnya']],
        body: this.logs.map(log => [log.date, log.category, log.tasks || '-', log.achievements || '-', (log.nextActions && log.nextActions.length ? log.nextActions.map((na,i) => (i+1)+'. '+na.text).join('; ') : (log.nextAction || '-'))]),
        headStyles: { fillColor: [141, 110, 99], textColor: [255, 255, 255], fontStyle: 'bold' },
        bodyStyles: { textColor: [44, 38, 33], fontSize: 9 },
        alternateRowStyles: { fillColor: [253, 251, 247] },
        margin: { left: 14, right: 14 }
      });
      doc.save('Job_Logbook_' + localDateStr() + '.pdf');
    },

    // ── Methods Khusus Fitur Notes ──
    openAddNoteForm() {
      this.editingNoteId = null;
      this.noteForm.title = '';
      this.noteForm.body = '';
      this.noteForm.color = 'green';
      this.noteForm.category = this.noteCategories[0] || 'Work';
      this.showAddNoteForm = true;
    },
    editNote(note) {
      this.editingNoteId = note.id;
      this.noteForm.title = note.title;
      this.noteForm.category = note.category;
      this.noteForm.body = note.body;
      this.noteForm.color = note.color || 'green';
      this.showAddNoteForm = true;
    },
    cancelNoteForm() {
      this.showAddNoteForm = false;
      this.editingNoteId = null;
      this.noteForm.title = '';
      this.noteForm.body = '';
      this.noteForm.color = 'green';
    },
    safeCloseNoteForm() {
      const hasData = this.noteForm.title.trim() || this.noteForm.body.trim();
      if (hasData) {
        if (!confirm('Kamu sudah mengisi beberapa data. Yakin mau tutup dan buang perubahan?')) return;
      }
      this.cancelNoteForm();
    },
    saveNote() {
      if (this.editingNoteId) {
        const idx = this.notes.findIndex(n => n.id === this.editingNoteId);
        if (idx !== -1) {
          this.notes[idx].title = this.noteForm.title;
          this.notes[idx].category = this.noteForm.category;
          this.notes[idx].body = this.noteForm.body;
          this.notes[idx].color = this.noteForm.color || 'green';
        }
        this.editingNoteId = null;
      } else {
        const newN = {
          id: 'note-' + Date.now(),
          date: localDateStr(),
          category: this.noteForm.category,
          title: this.noteForm.title,
          body: this.noteForm.body,
          color: this.noteForm.color || 'green'
        };
        this.notes.unshift(newN);
      }
      this.saveNotesToStorage();
      this.showAddNoteForm = false;
      this.showNoteCustomColor = false;
      this.noteForm.title = '';
      this.noteForm.body = '';
      this.noteForm.color = 'green';
    },
    deleteNote(id) {
      if(!confirm('Hapus note ini secara permanen?')) return;
      this.notes = this.notes.filter(n => n.id !== id);
      this.saveNotesToStorage();
    },
    saveNotesToStorage() { 
      WorkspaceStorage.setItem('personal_workspace_job_notes', JSON.stringify(this.notes)); 
    },
    addNoteCategory() {
      if (this.newNoteCatInput && !this.noteCategories.includes(this.newNoteCatInput)) {
        this.noteCategories.push(this.newNoteCatInput);
        WorkspaceStorage.setItem('personal_workspace_job_note_cats', JSON.stringify(this.noteCategories));
        this.newNoteCatInput = '';
      }
    },
    deleteNoteCategory(cat) {
      if(!confirm(`Hapus kategori note "${cat}"?`)) return;
      this.noteCategories = this.noteCategories.filter(c => c !== cat);
      WorkspaceStorage.setItem('personal_workspace_job_note_cats', JSON.stringify(this.noteCategories));
      if (this.noteForm.category === cat) this.noteForm.category = this.noteCategories[0] || '';
    },
    getNoteColorStyle(color) {
      const styles = {
        pink:   { bg: '#FCE7F3', headerText: '#831843', text: '#2C2621', border: '#f3ccde' },
        blue:   { bg: '#DBEAFE', headerText: '#1E3A8A', text: '#2C2621', border: '#93c5fd' },
        green:  { bg: '#D1FAE5', headerText: '#065F46', text: '#2C2621', border: '#6ee7b7' },
        yellow: { bg: '#FEF3C7', headerText: '#92400E', text: '#2C2621', border: '#f5d782' },
        purple: { bg: '#F3E8FF', headerText: '#4C1D95', text: '#2C2621', border: '#c4b5fd' },
        rose:   { bg: '#FFE4E6', headerText: '#9F1239', text: '#2C2621', border: '#fda4af' },
        orange: { bg: '#FFEDD5', headerText: '#7C2D12', text: '#2C2621', border: '#fdba74' },
        teal:   { bg: '#CCFBF1', headerText: '#134E4A', text: '#2C2621', border: '#5eead4' },
      };
      if (color && color.startsWith('#')) {
        return { bg: color + '33', headerText: color, text: '#2C2621', border: color + '66' };
      }
      return styles[color] || styles.green;
    }
  },
  watch: {
    searchQuery()     { this.currentPage = 1; },
    filterCategory()  { this.currentPage = 1; },
    filterStartDate() { this.currentPage = 1; },
    filterEndDate()   { this.currentPage = 1; },
  },
  mounted() {
    this._closeRangePicker = () => { if (this.showRangePicker) this.showRangePicker = false; if (this.noteShowRangePicker) this.noteShowRangePicker = false; };
    document.addEventListener('click', this._closeRangePicker);
    this._closePhaseDropdown = () => { if (this.openPhaseDropdownId !== null) this.openPhaseDropdownId = null; };
    document.addEventListener('click', this._closePhaseDropdown);
    this._closeAllCustomDD = () => {
      this.showFilterCategoryDD = false;
      this.showPriorityDD = false;
      this.showJadwalDD = false;
      this.showTampilkanDD = false;
      this.showNoteFilterCatDD = false;
      this.showNoteJadwalDD = false;
      this.showNoteCustomColor = false;
    };
    document.addEventListener('click', this._closeAllCustomDD);
  },
  unmounted() {
    document.removeEventListener('click', this._closeRangePicker);
    document.removeEventListener('click', this._closePhaseDropdown);
    document.removeEventListener('click', this._closeAllCustomDD);
  }
};


// 2. Calendar Moment Component (Multi-moment upgrade with bento layout & memory jar)

// 2. Calendar Moment Component (Multi-moment upgrade with bento layout & memory jar)
const CalendarMoment = {
  template: `
    <div class="calendar-moment animate-fade-in" style="width: 100%; padding: 0;">
      
      <!-- ═══ HEADER + FILTER UNIFIED ═══ -->
      <div style="margin-bottom: 28px;">

        <!-- Judul -->
        <div style="margin-bottom: 16px;">
          <h2 style="font-size: 24px; font-weight: 800; color: #3E352F; margin: 0 0 4px 0; line-height: 1.2;">My Memories & Growth</h2>
          <p style="color: var(--text-muted); font-size: 13px; margin: 0; line-height: 1.5;">Abadikan jejak perkembangan dirimu, susun peristiwa indah, dan tata kenangan foto harian.</p>
        </div>

        <!-- Filter Bar -->
        <div style="background: #FAF6F0; border: 1.5px solid var(--color-sand); border-radius: 14px; padding: 12px 16px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">

          <!-- Search -->
          <div style="position: relative; flex: 1; min-width: 160px;">
            <input type="text" v-model="searchQuery" class="g-form-input"
                   placeholder="Cari judul, catatan..."
                   style="padding-left: 30px; background: #FFFFFF; border-radius: 8px; border: 1.5px solid var(--color-sand); font-size: 12.5px; height: 36px; width: 100%; box-shadow: var(--shadow-xs); box-sizing: border-box;" />
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="position: absolute; left: 10px; top: 12px; color: var(--text-muted);"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          </div>

          <!-- Separator -->
          <div style="width: 1px; height: 24px; background: var(--color-sand); flex-shrink: 0;"></div>

          <!-- View switcher -->
          <div style="display: flex; gap: 2px; background: #fff; border: 1.5px solid var(--color-sand); border-radius: 8px; padding: 2px; flex-shrink: 0;">
            <button type="button" @click="currentView = 'calendar'"
                    :style="currentView==='calendar' ? {background:'var(--color-terracotta)',color:'#fff'} : {background:'transparent',color:'#5D4F43'}"
                    style="border:none; font-size:11.5px; padding:0 10px; border-radius:6px; font-weight:700; height:30px; display:inline-flex; align-items:center; gap:4px; cursor:pointer; transition:all 0.15s; white-space:nowrap;">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Kalender
            </button>
            <button type="button" @click="currentView = 'timeline'"
                    :style="currentView==='timeline' ? {background:'var(--color-terracotta)',color:'#fff'} : {background:'transparent',color:'#5D4F43'}"
                    style="border:none; font-size:11.5px; padding:0 10px; border-radius:6px; font-weight:700; height:30px; display:inline-flex; align-items:center; gap:4px; cursor:pointer; transition:all 0.15s; white-space:nowrap;">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
              Kenangan
            </button>
            <button type="button" @click="currentView = 'wheel'"
                    :style="currentView==='wheel' ? {background:'var(--color-terracotta)',color:'#fff'} : {background:'transparent',color:'#5D4F43'}"
                    style="border:none; font-size:11.5px; padding:0 10px; border-radius:6px; font-weight:700; height:30px; display:inline-flex; align-items:center; gap:4px; cursor:pointer; transition:all 0.15s; white-space:nowrap;">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m16.2 7.8 2.2-2.2"></path><path d="m12 12 4.2-4.2"></path></svg>
              Roda
            </button>
          </div>

          <!-- Separator -->
          <div style="width: 1px; height: 24px; background: var(--color-sand); flex-shrink: 0;"></div>

          <!-- Navigasi bulan (calendar view) -->
          <div v-if="currentView === 'calendar'" style="display:inline-flex; align-items:center; gap:2px; background:#fff; border:1.5px solid var(--color-sand); border-radius:8px; padding:2px 4px; flex-shrink:0;">
            <button @click="prevMonth" type="button" style="background:none; border:none; font-size:13px; font-weight:800; color:#5D4F43; cursor:pointer; padding:3px 9px; border-radius:6px;" onmouseover="this.style.background='#FAF6F0'" onmouseout="this.style.background='none'">&lt;</button>
            <span style="font-size:13px; font-weight:800; color:#3E352F; min-width:115px; text-align:center; user-select:none;">{{ currentMonthName }}</span>
            <button @click="nextMonth" type="button" style="background:none; border:none; font-size:13px; font-weight:800; color:#5D4F43; cursor:pointer; padding:3px 9px; border-radius:6px;" onmouseover="this.style.background='#FAF6F0'" onmouseout="this.style.background='none'">&gt;</button>
          </div>

          <!-- Kategori dropdown -->
          <div v-if="currentView !== 'calendar'" style="position:relative; flex-shrink:0;">
            <div @click.stop="toggleCategoryFilterDropdown"
                 style="background:#fff; border:1.5px solid var(--color-sand); border-radius:8px; height:36px; padding:0 10px; display:flex; align-items:center; gap:7px; cursor:pointer; user-select:none; white-space:nowrap; min-width:140px;">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="var(--text-muted)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54Z"></path></svg>
              <span style="font-size:12.5px; font-weight:600; color:#5D4F43; flex:1;">{{ activeCategoryFilter === 'Semua' ? 'Semua Kategori' : activeCategoryFilter }}</span>
              <span style="font-size:9px; color:var(--text-muted);">▼</span>
            </div>
            <div v-if="showCategoryFilterDropdown"
                 style="position:absolute; top:calc(100% + 4px); left:0; min-width:100%; background:#fff; border:1.5px solid var(--color-sand); border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.12); z-index:1000; padding:5px; max-height:200px; overflow-y:auto;">
              <div @click="selectCategoryFilter('Semua')"
                   style="cursor:pointer; padding:7px 11px; border-radius:7px; font-size:12.5px; font-weight:600; display:flex; align-items:center; justify-content:space-between;"
                   :style="activeCategoryFilter==='Semua' ? {background:'#FAF0EC',color:'var(--color-terracotta)'} : {color:'#3E352F'}"
                   onmouseover="this.style.background='#FAF8F5'" onmouseout="this.style.background=''">
                <span>Semua Kategori</span>
                <span style="font-size:10px; background:rgba(0,0,0,0.05); padding:1px 6px; border-radius:5px; font-weight:700;">{{ getCategoryCount('Semua') }}</span>
              </div>
              <div v-for="cat in dynamicCategories" :key="cat" @click="selectCategoryFilter(cat)"
                   style="cursor:pointer; padding:7px 11px; border-radius:7px; font-size:12.5px; font-weight:600; display:flex; align-items:center; justify-content:space-between; margin-top:2px;"
                   :style="activeCategoryFilter===cat ? {background:'#FAF0EC',color:'var(--color-terracotta)'} : {color:'#3E352F'}"
                   onmouseover="this.style.background='#FAF8F5'" onmouseout="this.style.background=''">
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px;">{{ cat }}</span>
                <span style="font-size:10px; background:rgba(0,0,0,0.05); padding:1px 6px; border-radius:5px; font-weight:700;">{{ getCategoryCount(cat) }}</span>
              </div>
            </div>
          </div>

          <!-- Tahun (wheel only) -->
          <div v-if="currentView === 'wheel'" style="display:inline-flex; align-items:center; gap:6px; background:#fff; border:1.5px solid var(--color-sand); border-radius:8px; padding:0 10px; height:36px; flex-shrink:0;">
            <span style="font-size:11.5px; font-weight:700; color:var(--text-muted);">Tahun:</span>
            <div style="position:relative;">
              <select v-model="wheelYearFilter" @change="wheelActiveIndex = 0"
                      style="font-size:12.5px; font-weight:700; color:#3E352F; background:transparent; border:none; outline:none; cursor:pointer; padding-right:14px; appearance:none;">
                <option value="">Semua</option>
                <option v-for="yr in availableYears" :key="yr" :value="yr">{{ yr }}</option>
              </select>
              <div style="position:absolute; right:0; top:3px; font-size:8px; color:var(--text-muted); pointer-events:none;">▼</div>
            </div>
          </div>

          <!-- Rentang tanggal (timeline & wheel) -->
          <div v-if="currentView === 'timeline' || currentView === 'wheel'" style="position:relative; flex-shrink:0;">
            <div @click.stop="toggleMiniCalendar"
                 style="display:inline-flex; align-items:center; gap:6px; background:#fff; border:1.5px solid var(--color-sand); border-radius:8px; padding:0 10px; height:36px; cursor:pointer; user-select:none; white-space:nowrap;">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta)" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span style="font-size:12.5px; font-weight:600; color:#5D4F43;">
                <template v-if="wheelStartDate && wheelEndDate">{{ wheelStartDate.substring(8,10) }}/{{ wheelStartDate.substring(5,7) }} – {{ wheelEndDate.substring(8,10) }}/{{ wheelEndDate.substring(5,7) }}</template>
                <template v-else-if="wheelStartDate">Sejak {{ wheelStartDate.substring(8,10) }}/{{ wheelStartDate.substring(5,7) }}</template>
                <template v-else>Semua Tanggal</template>
              </span>
              <button v-if="wheelStartDate || wheelEndDate" @click.stop="clearMiniCalendar" type="button"
                      style="background:#FAF0EC; border:1px solid #F3E2DB; border-radius:50%; width:15px; height:15px; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:bold; color:var(--color-terracotta); cursor:pointer; flex-shrink:0;">×</button>
            </div>
            <!-- Mini calendar popover -->
            <div v-if="showMiniCalendar" @click.stop
                 style="position:absolute; top:calc(100% + 6px); right:0; background:#fff; border:1.5px solid var(--color-sand); border-radius:14px; box-shadow:0 8px 32px rgba(0,0,0,0.13); z-index:1010; padding:14px; width:252px; cursor:default;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #FAF6F0; padding-bottom:8px;">
                <button type="button" @click="prevMiniCalendarMonth" style="background:none; border:none; font-weight:bold; color:#5D4F43; cursor:pointer; padding:2px 8px; border-radius:6px;" onmouseover="this.style.background='#FAF6F0'" onmouseout="this.style.background=''">&lt;</button>
                <span style="font-size:12.5px; font-weight:800; color:#3E352F;">{{ ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][miniCalendarDate.getMonth()] }} {{ miniCalendarDate.getFullYear() }}</span>
                <button type="button" @click="nextMiniCalendarMonth" style="background:none; border:none; font-weight:bold; color:#5D4F43; cursor:pointer; padding:2px 8px; border-radius:6px;" onmouseover="this.style.background='#FAF6F0'" onmouseout="this.style.background=''">&gt;</button>
              </div>
              <div style="display:flex; gap:4px; margin-bottom:10px;">
                <button type="button" @click="applyPresetRange('today')" style="flex:1; font-size:9.5px; font-weight:700; border:1.2px solid var(--color-sand); border-radius:6px; padding:4px 0; background:#FFFDF9; color:#5D4F43; cursor:pointer;" onmouseover="this.style.background='#FAF0EC';this.style.color='var(--color-terracotta)'" onmouseout="this.style.background='#FFFDF9';this.style.color='#5D4F43'">Hari Ini</button>
                <button type="button" @click="applyPresetRange('7days')" style="flex:1; font-size:9.5px; font-weight:700; border:1.2px solid var(--color-sand); border-radius:6px; padding:4px 0; background:#FFFDF9; color:#5D4F43; cursor:pointer;" onmouseover="this.style.background='#FAF0EC';this.style.color='var(--color-terracotta)'" onmouseout="this.style.background='#FFFDF9';this.style.color='#5D4F43'">7 Hari</button>
                <button type="button" @click="applyPresetRange('thismonth')" style="flex:1; font-size:9.5px; font-weight:700; border:1.2px solid var(--color-sand); border-radius:6px; padding:4px 0; background:#FFFDF9; color:#5D4F43; cursor:pointer;" onmouseover="this.style.background='#FAF0EC';this.style.color='var(--color-terracotta)'" onmouseout="this.style.background='#FFFDF9';this.style.color='#5D4F43'">Bulan Ini</button>
              </div>
              <div style="display:grid; grid-template-columns:repeat(7,1fr); text-align:center; font-size:10px; font-weight:700; color:#7A6F66; gap:3px; border-bottom:1px solid #FAF6F0; padding-bottom:4px; margin-bottom:4px;">
                <span v-for="w in ['Min','Sen','Sel','Rab','Kam','Jum','Sab']" :key="w">{{ w }}</span>
              </div>
              <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:3px;">
                <div v-for="(cell,cIdx) in getMiniCalendarCells()" :key="cIdx" @click="selectMiniCalendarDay(cell)"
                     style="cursor:pointer; padding:5px 0; font-size:11px; font-weight:700; border-radius:6px; display:flex; align-items:center; justify-content:center; user-select:none;"
                     :style="[cell.isOtherMonth?{opacity:0.3}:{}, (cell.dateString===wheelStartDate||cell.dateString===wheelEndDate)?{background:'var(--color-terracotta)',color:'#fff'}:(wheelStartDate&&wheelEndDate&&cell.dateString>=wheelStartDate&&cell.dateString<=wheelEndDate)?{background:'#FAF0EC',color:'var(--color-terracotta)'}:{color:'#3E352F'}]"
                     onmouseover="if(this.style.background!=='var(--color-terracotta)')this.style.background='#FAF8F5'"
                     onmouseout="if(!this.style.color.includes('rgb(214')&&this.style.background!=='var(--color-terracotta)')this.style.background=''">
                  {{ cell.dayNumber }}
                </div>
              </div>
              <div style="display:flex; gap:6px; margin-top:10px; padding-top:10px; border-top:1px solid #FAF6F0;">
                <button type="button" @click="clearMiniCalendar" style="font-size:10px; font-weight:700; background:#FAF0EC; color:var(--color-terracotta); border:1px solid #F3E2DB; padding:4px 10px; border-radius:6px; cursor:pointer; margin-right:auto;">Hapus</button>
                <button type="button" @click="cancelMiniCalendar" style="font-size:10px; font-weight:700; background:#FAF8F5; color:#5D4F43; border:1px solid var(--color-sand); padding:4px 10px; border-radius:6px; cursor:pointer;">Batal</button>
                <button type="button" @click="applyMiniCalendar" style="font-size:10px; font-weight:700; background:var(--color-terracotta); color:#fff; border:none; padding:4px 12px; border-radius:6px; cursor:pointer;">Setel</button>
              </div>
            </div>
          </div>

          <!-- Spacer -->
          <div style="flex:1; min-width:0;"></div>

          <!-- Reset -->
          <button @click="resetFilters" type="button"
                  style="height:36px; font-size:12px; font-weight:700; border-radius:8px; border:1.5px solid var(--color-sand); padding:0 14px; background:#fff; display:inline-flex; align-items:center; gap:5px; flex-shrink:0; cursor:pointer; color:#5D4F43;">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 10 10 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            Reset
          </button>

          <!-- Putar Roda (wheel only) -->
          <button v-if="currentView === 'wheel'" @click="spinWheel" type="button"
                  :disabled="isSpinning || wheelMoments.length === 0"
                  style="height:36px; font-weight:700; font-size:12px; border-radius:8px; display:inline-flex; align-items:center; gap:5px; background:var(--color-terracotta); border:none; color:#fff; padding:0 16px; flex-shrink:0; box-shadow:0 4px 10px rgba(214,123,82,0.2); cursor:pointer;"
                  :style="isSpinning ? {opacity:0.7,cursor:'not-allowed'} : {}">
            <span v-if="isSpinning" style="display:inline-block; animation:spin 1s linear infinite;">🔄</span>
            <span v-else>🎡</span>
            {{ isSpinning ? 'Berputar...' : 'Putar Roda' }}
          </button>

        </div>
      </div>

      <!-- VIEW A: CALENDAR GRID VIEW -->
      <div v-if="currentView === 'calendar'" class="calendar-wrapper animate-fade-in">

        <!-- Instructions warning of the awesome dragging functionality -->
        <div style="background-color: #FFFDF0; border: 1.2px dashed #FCECB6; padding: 10px 14px; border-radius: 10px; margin-bottom: 18px; font-size: 12px; color: #8C7864; display: flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #D67B52;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          <span><strong>Tips Polaroid Melayang:</strong> Jika mengunggah foto ke mading kalender, Anda bisa memindahkan posisi polaroid dengan <strong>klik-tahan-seret (drag)</strong>. Gunakan <strong>scroll-wheel mouse</strong> untuk memperbesar/memperkecil (zoom), serta tombol pegangan putar (rotate) di sudut atas foto!</span>
        </div>

        <!-- The Calendar Grid -->
        <div class="calendar-grid">
          <div v-for="dayName in ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']" 
               :key="dayName" 
               class="calendar-day-header">
            {{ dayName }}
          </div>
          
          <div v-for="cell in calendarCells" 
               :key="cell.dateString" 
               class="calendar-cell" 
               :class="{ 'other-month': cell.isOtherMonth, today: cell.isToday }"
               @click="openAddMoment(cell)"
               style="overflow: visible;">
            
            <div class="calendar-cell-top flex-between" style="width: 100%; height: 20px;">
              <span class="day-number" style="font-weight:700;">{{ cell.dayNumber }}</span>
            </div>
            
            <!-- Sticker and image slots -->
            <div class="calendar-sticker-slot" style="position: relative; width: 100%; height: calc(100% - 20px); min-height: 48px;">
              <div v-if="cell.moments.length > 0" class="cell-moments-outer">
                <!-- 1. If we have image inside the moments, render separate/stacked photos that are all interactive -->
                <div v-if="cell.moments.some(m => m.image)" class="cell-moments-stacked-photos" style="width: 100%; height: 100%; position: relative;">
                  <div v-for="(m, idx) in cell.moments.filter(x => x.image)" 
                       :key="m.id"
                       class="photo-interactive-wrapper animate-pop-in" 
                       @click.stop
                       :style="{
                         transform: 'translate(' + (m.dragX || 0) + 'px, ' + (m.dragY || 0) + 'px) rotate(' + (m.rotation || 0) + 'deg) scale(' + (m.scale !== undefined ? m.scale : 1.1) + ')',
                         zIndex: isDraggingThisPhoto(m.id) ? 100 : (10 + idx)
                       }"
                       @mousedown="startDragPhoto($event, cell.dateString, m)"
                       @touchstart="startDragPhoto($event, cell.dateString, m)"
                       @wheel.prevent="handleWheelZoom($event, cell.dateString, m)">
                    
                    <div class="stacked-photo-container" style="width: 100%; height: 100%; position: relative;">
                      <img :src="m.image" 
                           class="cell-moment-photo" 
                           referrerPolicy="no-referrer"
                           style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px; border: 2px solid #FFFFFF; box-shadow: var(--shadow-sm);" />
                      
                      <!-- Display corresponding sticker-like pinned badge on the polaroid -->
                      <span class="photo-moment-sticker-badge" style="position: absolute; top: -6px; right: -6px; background: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); border: 1px solid var(--color-sand); z-index: 10;" :title="m.title">
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="var(--color-terracotta)" stroke="var(--color-terracotta)" stroke-width="2.5" class="lucide-inline"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                      </span>

                      <!-- Interactive Handles Overlay Layer -->
                      <div class="photo-handle-overlay">
                        <button class="photo-reset-handle" 
                                @click.stop="resetPhotoPosition(cell.dateString, m)" 
                                title="Reset posisi">
                          ↺
                        </button>
                        <div class="photo-rotate-handle" 
                             @mousedown.stop.prevent="startRotatePhoto($event, cell.dateString, m)"
                             @touchstart.stop.prevent="startRotatePhoto($event, cell.dateString, m)"
                             title="Geser arah gerak untuk putar">
                          ↻
                        </div>
                        <div class="photo-scale-handle" 
                             @mousedown.stop.prevent="startScalePhoto($event, cell.dateString, m)"
                             @touchstart.stop.prevent="startScalePhoto($event, cell.dateString, m)"
                             title="Tarik untuk ubah ukuran">
                          ⤨
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 2. Otherwise/No image: render beautiful list of compact moment tags -->
                <div v-else class="cell-moments-stickers-wrap" style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start; width: 100%; padding: 4px;">
                  <div v-for="(m, mIdx) in cell.moments.slice(0, 2)" 
                       :key="m.id" 
                       class="calendar-sticker animate-pop-in" 
                       style="font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700; background: #FAF0EC; color: var(--color-terracotta); border: 1px solid #F3E2DB; padding: 2px 6px; border-radius: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; display: flex; align-items: center; gap: 3px;"
                       :title="m.title">
                    <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" stroke-width="3" class="lucide-inline"><circle cx="12" cy="12" r="10"></circle></svg>
                    {{ m.title || 'Momen' }}
                  </div>
                  <span v-if="cell.moments.length > 2" class="cell-stickers-overflow" style="font-size: 10px; font-weight: 800; color: var(--color-terracotta); margin-left: 4px;">+{{ cell.moments.length - 2 }}</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <!-- VIEW C: GELAS KENANGAN LINEAR FEED TIMELINE (Centered and spanning full width) -->
      <div v-else-if="currentView === 'timeline'" class="timeline-wrapper animate-fade-in" style="width: 100%;">
        
        <!-- Main Timeline feed column -->
        <div style="width: 100%;">
          
          <!-- Empty View -->
          <div v-if="filteredTimelineMoments.length === 0" style="padding: 70px 24px; text-align: center; background-color: #FFFFFF; border: 1.5px dashed var(--color-sand); border-radius: 20px; color: var(--text-muted); width: 100%;">
            <p style="font-size: 14px; font-weight: 700; margin: 0; color: #8F8175;">Belum menemukan cerita kenangan yang cocok.</p>
            <p style="font-size: 11.5px; margin-top: 4px;">Cobalah untuk mengubah kata kunci pencarian, filter kategori, atau tambah momen kenangan baru!</p>
          </div>

          <!-- Vertical Center Spine Timeline layout -->
          <div v-else class="timeline-long-container" style="padding-top: 20px; padding-bottom: 60px;">
            <div class="timeline-spine"></div>
            
            <div v-for="(group, groupIdx) in timelineGroups" 
                 :key="group.dateString" 
                 class="timeline-item-row"
                 :class="{ 'left-align': groupIdx % 2 === 0 }"
                 style="transition: all 0.4s ease;">
                 
              <!-- Spine Date Label overlay above dot -->
              <div class="timeline-node-pill">
                <div class="timeline-pill-label" style="font-size: 10.5px; letter-spacing: 0.5px; padding: 4px 12px; display: inline-flex; align-items: center; gap: 4px;">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  {{ formatTimelineDate(group.dateString) }}
                </div>
              </div>
              <div class="timeline-node-dot"></div>

              <!-- Content card on one side -->
              <div class="timeline-card-side">
                <div style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
                  <!-- Row container to align elements having same date side-by-side -->
                  <div style="display: flex; gap: 16px; flex-wrap: wrap; width: 100%;"
                       :style="groupIdx % 2 === 0 ? 'justify-content: flex-end;' : 'justify-content: flex-start;'">
                    
                    <div v-for="item in group.moments" 
                         :key="item.id" 
                         :id="'moment-card-' + item.id"
                         class="timeline-moment-card animate-fade-in" 
                         style="position: relative; padding: 22px; border-radius: 18px; flex: 1; min-width: 260px; max-width: 100%; box-sizing: border-box;">
                         
                      <!-- Trash / Edit Actions top right corner of card -->
                      <div style="position: absolute; top: 18px; right: 18px; display: flex; gap: 8px; z-index: 10;">
                        <button class="card-nav-btn" @click="openEditFromTimeline(item)" style="border: none; background: none; cursor: pointer; padding: 6px; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; hover:background: #EFEBE4;" title="Sunting">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #5D4F43;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                        </button>
                        <button class="card-nav-btn" @click="deleteSpecificMomentFromTimeline(item)" style="border: none; background: none; cursor: pointer; padding: 6px; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; hover:background: #FCE8E6;" title="Hapus">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #DC2626;"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      </div>

                      <!-- 1:1 Polaroid Photo with absolute aspect ratio 1:1 -->
                      <div v-if="item.image" class="timeline-photo-wrapper" style="margin: 0 0 16px 0; border: 6px solid #FFFFFF; box-shadow: var(--shadow-sm); background: #FFFFFF; border-radius: 8px; overflow: hidden; max-height: unset; aspect-ratio: 1/1 !important;">
                        <img :src="item.image" style="width: 100%; aspect-ratio: 1/1 !important; object-fit: cover; display: block;" referrerPolicy="no-referrer" />
                      </div>
                      <!-- 1:1 Polaroid Default Placeholder if no image, so all match 1:1 beautifully -->
                      <div v-else style="margin: 0 0 16px 0; width: 100%; aspect-ratio: 1/1 !important; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background-color: #FAF6F0; border: 1.5px dashed var(--color-sand); border-radius: 8px;">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--text-muted); opacity: 0.6;"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                        <span style="font-family: 'Space Mono', monospace; font-size: 11px; color: var(--text-muted); font-weight: 600;">Kenangan Tanpa Foto</span>
                      </div>

                      <!-- Badge Category & Mood inline list -->
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span v-if="item.category" style="background: #FAF0EC; border: 1px solid #F3E2DB; border-radius: 8px; padding: 4px 10px; font-size: 11px; font-weight: 800; color: var(--color-terracotta); display: inline-flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" class="lucide-inline"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                          {{ item.category }}
                        </span>
                        <span v-if="item.timeStart" style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #1D4ED8; display: inline-flex; align-items: center; gap: 5px; font-family: 'Hack', monospace;">
                          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          {{ item.timeStart }}<template v-if="item.timeEnd"> – {{ item.timeEnd }}</template>
                        </span>
                      </div>

                      <!-- Title of memory -->
                      <h3 class="timeline-moment-title" style="margin: 0 0 8px 0; color: #3E352F; font-size: 18px; font-weight: 800; line-height: 1.3; text-align: left;">
                        {{ item.title || 'Momen Tanpa Judul' }}
                      </h3>

                      <!-- Main Catatan Harian -->
                      <p class="timeline-moment-notes" style="font-size: 13.5px; color: var(--text-dark); line-height: 1.6; margin: 0; font-family: 'Inter', sans-serif; text-align: left;">
                        {{ item.notes || 'Tidak ada catatan penjelasan untuk momen ini.' }}
                      </p>

                      <!-- Secondary Highlight info if important note exists -->
                      <div v-if="item.importantNote" class="timeline-moment-important" style="margin-top: 14px; font-size: 12.5px; background: #FFFDF9; border-left: 3px solid var(--color-terracotta); padding: 8px 12px; border-radius: 6px; color: #5D4F43; text-align: left;">
                        <strong style="color: var(--color-terracotta);">Peristiwa Utama & Intisari:</strong> {{ item.importantNote }}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <!-- Other side remains balanced and empty for bento style spine -->
              <div class="timeline-empty-side"></div>
            </div>
          </div>

        </div>
      </div>

      <!-- VIEW C: WHEEL OF MEMORIES (RODA MEMORI) -->
      <div v-else-if="currentView === 'wheel'" class="wheel-wrapper animate-fade-in" style="width: 100%; display: flex; flex-direction: column; gap: 20px;">
        
        <!-- THE AMAZING SPINNING ORBITAL CAROUSEL -->
        <div style="width: 100%; overflow: hidden;">
          
          <!-- Empty View inside the Wheel layout -->
          <div v-if="wheelMoments.length === 0" style="padding: 100px 24px; text-align: center; background-color: #FFFFFF; border: 2.5px dashed var(--color-sand); border-radius: 24px; color: var(--text-muted); width: 100%;">
            <span style="font-size: 36px; display: block; margin-bottom: 12px;">🎡</span>
            <p style="font-size: 15px; font-weight: 800; margin: 0; color: #8F8175;">Belum menemukan cerita kenangan dalam lingkaran filter ini.</p>
            <p style="font-size: 12px; margin-top: 6px; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.5;">Gunakan tombol "Reset Filter" di atas atau ubah filter Tahun / Rentang Tanggal di kemudi untuk melihat lingkaran memori Anda!</p>
          </div>

          <div v-else 
               class="wheel-outer-container" 
               style="position: relative; width: 100%; min-height: 520px; overflow: hidden; background: radial-gradient(circle at center, #FFFFFF 0%, #FAFAF7 60%, #F5F1E8 100%); border: 1.5px solid var(--color-sand); border-radius: 28px; padding: 20px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-inner);">
            
            <!-- Orbit Navigation Chevron buttons left and right -->
            <button type="button" 
                    @click="wheelActiveIndex = (wheelActiveIndex - 1 + wheelMoments.length) % wheelMoments.length"
                    class="card-nav-btn animate-pop-in"
                    title="Sebelumnya"
                    style="position: absolute; left: 18px; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; background: #FFFFFF; border: 1.5px solid var(--color-sand); box-shadow: var(--shadow-md); font-size: 16px; font-weight: bold; color: #5D4F43; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; transition: all 0.2s;"
                    onmouseover="this.style.background='var(--color-sand)'; this.style.color='#FFFFFF';"
                    onmouseout="this.style.background='#FFFFFF'; this.style.color='#5D4F43';">
              &lsaquo;
            </button>
            
            <button type="button" 
                    @click="wheelActiveIndex = (wheelActiveIndex + 1) % wheelMoments.length"
                    class="card-nav-btn animate-pop-in"
                    title="Selanjutnya"
                    style="position: absolute; right: 18px; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; background: #FFFFFF; border: 1.5px solid var(--color-sand); box-shadow: var(--shadow-md); font-size: 16px; font-weight: bold; color: #5D4F43; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; transition: all 0.2s;"
                    onmouseover="this.style.background='var(--color-sand)'; this.style.color='#FFFFFF';"
                    onmouseout="this.style.background='#FFFFFF'; this.style.color='#5D4F43';">
              &rsaquo;
            </button>

            <!-- Orbit card ring -->
            <div style="position: absolute; width: 100%; height: 100%; pointer-events: none;">
              <!-- Individual mini orbiting photos (Semirip Mockup Gambar) -->
              <template v-for="(item, idx) in wheelMoments" :key="item.id">
                <div v-show="Math.min(Math.abs(idx - wheelActiveIndex), wheelMoments.length - Math.abs(idx - wheelActiveIndex)) <= 6"
                     @click="wheelActiveIndex = idx"
                     class="orbit-photo-item animate-pop-in"
                     style="position: absolute; overflow: hidden; display: flex; align-items: center; justify-content: center; pointer-events: auto; cursor: pointer; transition: left 0.8s cubic-bezier(0.25, 1, 0.4, 1), top 0.8s cubic-bezier(0.25, 1, 0.4, 1), transform 0.8s cubic-bezier(0.25, 1, 0.4, 1), opacity 0.8s;"
                     :style="getOrbitStyle(item, idx)">
                  
                  <img v-if="item.image" 
                       :src="item.image" 
                       style="width: 100%; height: 100%; object-fit: cover; display: block;" 
                       referrerPolicy="no-referrer" />
                  <div v-else 
                       style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #FFFDF9 0%, #FAF0EC 100%); text-align: center; padding: 4px; box-sizing: border-box; gap: 4px;">
                    <span style="font-size: 24px;">{{ item.sticker || '🌸' }}</span>
                    <span style="font-family: 'Outfit', sans-serif; font-size: 8px; font-weight: 850; color: var(--color-terracotta); text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; padding: 0 4px;">
                      {{ item.title || 'Cerita' }}
                    </span>
                  </div>
                  
                </div>
              </template>
            </div>

            <!-- CENTRAL CORNER GLASS CHAMBER FOR DETAILS (Momen paling tengah, Tanpa background box, foto, edit, delete, melainkan murni teks tipografi elegan) -->
            <div v-if="wheelMoments[wheelActiveIndex]"
                 style="position: relative; width: 340px; background: transparent; border: none; box-shadow: none; padding: 12px; z-index: 50; max-width: 85%; animation: popIn 0.4s ease; display: flex; flex-direction: column; align-items: center; text-align: center; pointer-events: none;">
              
              <!-- Metadata Indicators: Tanggal & Kategori -->
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; pointer-events: auto;">
                <span style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 11px; color: var(--color-terracotta); text-transform: uppercase;">
                  📅 {{ formatTimelineDate(wheelMoments[wheelActiveIndex].dateString) }}
                </span>
                
                <span v-if="wheelMoments[wheelActiveIndex].category" 
                      style="background: #FAF0EC; border: 1px solid #F3E2DB; border-radius: 6px; padding: 2px 8px; font-size: 9.5px; font-weight: 850; color: var(--color-terracotta); text-transform: uppercase;">
                  {{ wheelMoments[wheelActiveIndex].category }}
                </span>
              </div>

              <!-- Title content - Centered (Judul Momen / Aktivitas) -->
              <h3 style="font-size: 20px; font-weight: 850; color: #3E352F; margin: 0 0 10px 0; text-align: center; line-height: 1.3; pointer-events: auto;">
                {{ wheelMoments[wheelActiveIndex].title || 'Momen Tanpa Judul' }}
              </h3>

              <!-- Catatan notes description - Centered (Catatan Tambahan / Cerita Pendek) -->
              <p style="font-family: 'Inter', sans-serif; font-size: 13.5px; color: #5D4F43; line-height: 1.6; margin: 0; text-align: center; max-height: 130px; overflow-y: auto; width: 100%; padding: 0 6px; pointer-events: auto; font-weight: 500;">
                {{ wheelMoments[wheelActiveIndex].notes || 'Tidak ada uraian catatan untuk momen penting ini.' }}
              </p>

            </div>

          </div>
        </div>

      </div>

      <!-- ADD / EDIT DETAIL MOMENT MODAL -->
      <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
        <div class="moment-modal animate-fade-in" style="max-height: 90vh; overflow-y: auto; padding: 24px; border-radius: var(--border-radius-md); box-shadow: var(--shadow-lg); background-color: #FFFFFF;">
          <!-- Modal Header -->
          <div class="flex-between" style="border-bottom: 2px solid var(--color-sand); margin-bottom: 20px; padding-bottom: 14px;">
            <h3 style="font-size: 19px; font-weight: 800; color: var(--text-dark); display: inline-flex; align-items: center; gap: 8px; margin: 0;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--text-dark);"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
              <span>Kelola Momen Kenangan</span>
              <span style="font-size: 13.5px; font-weight: 600; color: var(--color-terracotta);">— {{ formatTimelineDate(selectedCell ? selectedCell.dateString : '') }}</span>
            </h3>
            <button class="close-btn" @click="showModal = false" style="font-size: 26px; border: none; background: none; cursor: pointer; color: var(--text-muted);">&times;</button>
          </div>
          
          <!-- Add Button at Top -->
          <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; background: #FAF8F5; border: 1.5px dashed var(--color-sand); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 13px; font-weight: 600; color: var(--text-muted);">
              Tulis catatan mading momen harian Anda:
            </span>
            <button type="button" 
                    class="btn btn-primary" 
                    style="padding: 6px 12px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 4px; border-radius: 8px; height: 32px;" 
                    @click="addNewMomentBlock">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              + Momen Baru
            </button>
          </div>

          <!-- List of Active Moment Forms -->
          <form @submit.prevent="saveAllMoments" style="display: flex; flex-direction: column; gap: 18px;">
            
            <div v-if="modalMoments.length === 0" style="color: var(--text-muted); text-align: center; padding: 40px 10px; background: #FAF8F5; border-radius: 16px; border: 1.5px solid var(--color-sand);">
              <p style="font-size: 13.5px; font-weight: 600; margin: 0; color: #7A6F66;">Belum ada momen tercatat pada tanggal ini.</p>
              <p style="font-size: 11.5px; margin-top: 4px; margin-bottom: 14px; opacity: 0.85;">Klik tombol di bawah untuk menyusun memori indahmu!</p>
              <button type="button" class="btn btn-primary btn-sm" @click="addNewMomentBlock">
                Mulai Catat Momen Pertama
              </button>
            </div>

            <div v-else style="display: grid; grid-template-columns: repeat(auto-fit, minmax(430px, 1fr)); gap: 20px; max-height: 62vh; overflow-y: auto; padding-right: 6px; margin-bottom: 8px;">
              <div v-for="(m, index) in modalMoments" 
                   :key="m.id" 
                   style="border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 14px; border: 1.5px solid var(--color-sand); background-color: #FFFFFF; position: relative;"
                   :style="selectedMomentId === m.id ? { borderColor: 'var(--color-terracotta)', boxShadow: '0 0 0 3.5px rgba(214, 123, 82, 0.15)' } : {}">
                
                <!-- Card Inner Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.2px solid var(--color-sand); padding-bottom: 10px; margin-bottom: 4px;">
                  <span style="font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 800; color: var(--text-dark); display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 16px;">✨</span>
                    <span>Momen #{{ index + 1 }}</span>
                  </span>
                  <button type="button" 
                          @click="removeMomentBlock(index)" 
                          style="background: #FCE8E6; border: none; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #DC2626; font-size: 14px; font-weight: bold; cursor: pointer; transition: all 0.15s;"
                          title="Hapus momen ini">
                    &times;
                  </button>
                </div>

                <!-- Title & Custom Category Block in one grid row -->
                <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div class="form-group">
                    <label>Judul Momen / Aktivitas</label>
                    <input type="text" 
                           class="form-input" 
                           v-model="m.title" 
                           placeholder="cth., Makan Malam Bersama" 
                           required />
                  </div>
                  <div class="form-group" style="position: relative;">
                    <label>Kategori</label>
                    <div style="position: relative; display: flex; align-items: center; width: 100%;">
                      <input type="text" 
                             class="form-input" 
                             v-model="m.category" 
                             placeholder="Tulis kategori baru atau pilih di samping..." 
                             @focus="m.showCategoryList = true"
                             @blur="setTimeout(() => { m.showCategoryList = false; }, 200)"
                             style="padding-right: 32px; width: 100%;"
                             required />
                      <button type="button"
                              @click.stop="toggleBlockCategoryDropdown(m)"
                              style="position: absolute; right: 8px; background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 10px; padding: 4px; display: flex; align-items: center; justify-content: center; height: 100%; width: 24px;">
                        ▼
                      </button>
                    </div>
                    <!-- Dropdown Options of Saved/Dynamic Categories -->
                    <div v-if="m.showCategoryList && dynamicCategories.length > 0" 
                         style="position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #FFFFFF; border: 1.5px solid var(--color-sand); border-radius: 10px; box-shadow: var(--shadow-md); z-index: 2000; padding: 4px; max-height: 150px; overflow-y: auto;">
                      <div v-for="cat in dynamicCategories" 
                           :key="cat"
                           @mousedown="selectBlockCategory(m, cat)"
                           style="cursor: pointer; padding: 8px 10px; border-radius: 6px; font-size: 12.5px; font-weight: 600; color: #3E352F; transition: background 0.15s; text-align: left;"
                           onmouseover="this.style.background='#FAF6F0'" onmouseout="this.style.background=''">
                        {{ cat }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Waktu Mulai - Waktu Berakhir -->
                <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 5px;">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-terracotta);"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Waktu Mulai
                    </label>
                    <input type="time" class="form-input" v-model="m.timeStart" style="height: 38px; width: 100%;" />
                  </div>
                  <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 5px;">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-terracotta);"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Waktu Berakhir
                    </label>
                    <input type="time" class="form-input" v-model="m.timeEnd" style="height: 38px; width: 100%;" />
                  </div>
                </div>

                <!-- Notes details -->
                <div class="form-group">
                  <label>Catatan Tambahan / Cerita Pendek</label>
                  <textarea class="form-input" 
                            v-model="m.notes" 
                            rows="2" 
                            placeholder="Tuliskan cerita/kenangan indahmu hari ini..."></textarea>
                </div>

                <!-- Individual Moment Picture Upload component -->
                <div class="form-group">
                  <label>Foto Kenangan Momen</label>
                  <div class="image-upload-area" @click="triggerFileUpload(index)" style="background-color: var(--bg-cream); border: 1.5px dashed var(--color-sand); border-radius: var(--border-radius-sm); padding: 12px; cursor: pointer; text-align: center; transition: all 0.2s; position: relative; overflow: hidden; min-height: 80px; display: flex; align-items: center; justify-content: center;">
                    <input type="file" 
                           :id="'file-input-' + index" 
                           @change="handleBlockFileChange($event, m)" 
                           accept="image/*" 
                           style="display: none;" />
                    
                    <div v-if="m.image" style="position: relative; line-height: 0; width: 100%;">
                      <img :src="m.image" 
                           style="max-height: 140px; width: 100%; object-fit: cover; border-radius: 8px; border: 2.5px solid #FFFFFF; box-shadow: var(--shadow-sm);" 
                           referrerPolicy="no-referrer" />
                      <button type="button" 
                               @click.stop="m.image = ''" 
                               class="btn btn-secondary btn-sm" 
                               style="position: absolute; top: 6px; right: 6px; background: rgba(255, 255, 255, 0.95); padding: 4px 8px; font-size: 11px; font-weight: 600; color: #DC2626; border-radius: 6px; line-height: 1.2;">
                         Hapus Foto
                      </button>
                    </div>
                    
                    <div v-else style="padding: 6px; color: var(--text-muted); font-size: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; width: 100%;">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" class="lucide-inline" style="color: var(--text-muted);"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                      <strong style="color: var(--text-dark); font-size: 13px;">Pilih / Unggah Foto Momen</strong>
                      <p style="font-size: 11px; opacity: 0.85; margin: 0; line-height: 1.3;">Polaroid harian akan langsung melayang di kalender</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Modal Action Buttons -->
            <div style="display: flex; gap: 10px; margin-top: 12px; border-top: 1.5px solid var(--color-sand); padding-top: 16px;">
              <button type="button" class="btn btn-secondary" style="flex: 1; padding: 10px 0; font-weight: 700; border: 1.5px solid var(--color-sand);" @click="showModal = false">
                Batal
              </button>
              <button type="submit" class="btn btn-primary" style="flex: 1.5; padding: 10px 0; font-weight: 700; background-color: var(--color-terracotta); border-color: var(--color-terracotta);">
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `,
  data() {
    return {
      currentView: 'calendar',
      currentDate: new Date(),
      showModal: false,
      selectedCell: null,
      selectedMomentId: null,
      moments: {},
      modalMoments: [],
      searchQuery: '',
      activeCategoryFilter: 'Semua',
      activeMoodFilter: 'Semua',
      showCategoryFilterDropdown: false,
      scrollRotation: 0,
      stickerOptions: ['😊', '🥰', '🥳', '😎', '😢', '😭', '😡', '😱', '😴', '🧠'],
      draggingPhoto: null,
      timelineStartDate: '',
      timelineEndDate: '',
      wheelYearFilter: '',
      wheelStartDate: '',
      wheelEndDate: '',
      wheelActiveIndex: 0,
      wheelRotationAngle: 0,
      isSpinning: false,
      showMiniCalendar: false,
      backupStartDate: '',
      backupEndDate: '',
      miniCalendarDate: new Date()
    };
  },
  computed: {
    calendarCells() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const startDayOfWeek = firstDay.getDay(); 
      const totalDays = new Date(year, month + 1, 0).getDate();
      const cells = [];
      const prevMonthTotalDays = new Date(year, month, 0).getDate();
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = prevMonthTotalDays - i;
        const prevMonthDate = new Date(year, month - 1, d);
        const dateStr = this.formatDateString(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), d);
        cells.push({
          dayNumber: d,
          dateString: dateStr,
          moments: this.getMomentsForDate(dateStr),
          isToday: false,
          isOtherMonth: true
        });
      }
      const today = new Date();
      for (let d = 1; d <= totalDays; d++) {
        const dateStr = this.formatDateString(year, month, d);
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
        cells.push({
          dayNumber: d,
          dateString: dateStr,
          moments: this.getMomentsForDate(dateStr),
          isToday,
          isOtherMonth: false
        });
      }
      const totalCells = cells.length;
      const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
      for (let d = 1; d <= remaining; d++) {
        const nextMonthDate = new Date(year, month + 1, d);
        const dateStr = this.formatDateString(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), d);
        cells.push({
          dayNumber: d,
          dateString: dateStr,
          moments: this.getMomentsForDate(dateStr),
          isToday: false,
          isOtherMonth: true
        });
      }
      return cells;
    },
    currentMonthName() {
      const monthsIndo = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return monthsIndo[this.currentDate.getMonth()] + ' ' + this.currentDate.getFullYear();
    },
    dynamicCategories() {
      const cats = new Set();
      Object.keys(this.moments).forEach(dateStr => {
        let dayMoments = this.moments[dateStr] || [];
        if (dayMoments && !Array.isArray(dayMoments)) {
          dayMoments = [dayMoments];
        }
        dayMoments.forEach(m => {
          if (m && m.category) {
            cats.add(m.category.trim());
          }
        });
      });
      return Array.from(cats).sort();
    },
    filteredTimelineMoments() {
      const list = [];
      Object.keys(this.moments).forEach(dateStr => {
        let dayMoments = this.moments[dateStr] || [];
        if (dayMoments && !Array.isArray(dayMoments)) {
          dayMoments = [dayMoments];
        }
        dayMoments.forEach(m => {
          if (m) {
            list.push({
              ...m,
              dateString: dateStr
            });
          }
        });
      });
      list.sort((a, b) => b.dateString.localeCompare(a.dateString));
      return list.filter(m => {
        if (this.wheelStartDate) {
          if (m.dateString < this.wheelStartDate) return false;
        }
        if (this.wheelEndDate) {
          if (m.dateString > this.wheelEndDate) return false;
        }
        if (this.activeCategoryFilter !== 'Semua') {
          if (!m.category || m.category.trim().toLowerCase() !== this.activeCategoryFilter.trim().toLowerCase()) return false;
        }
        if (this.activeMoodFilter !== 'Semua') {
          if (m.sticker !== this.activeMoodFilter) return false;
        }
        if (this.searchQuery.trim() !== '') {
          const q = this.searchQuery.toLowerCase();
          const titleMatch = (m.title || '').toLowerCase().includes(q);
          const notesMatch = (m.notes || '').toLowerCase().includes(q);
          const categoryMatch = (m.category || '').toLowerCase().includes(q);
          const dateMatch = m.dateString.includes(q);
          const importantMatch = (m.importantNote || '').toLowerCase().includes(q);
          return titleMatch || notesMatch || categoryMatch || dateMatch || importantMatch;
        }
        return true;
      });
    },
    timelineGroups() {
      const list = this.filteredTimelineMoments;
      const groups = [];
      const groupMap = {};
      list.forEach(m => {
        if (!groupMap[m.dateString]) {
          groupMap[m.dateString] = {
            dateString: m.dateString,
            moments: []
          };
          groups.push(groupMap[m.dateString]);
        }
        groupMap[m.dateString].moments.push(m);
      });
      return groups;
    },
    wheelMoments() {
      const list = [];
      Object.keys(this.moments).forEach(dateStr => {
        let dayMoments = this.moments[dateStr] || [];
        if (dayMoments && !Array.isArray(dayMoments)) {
          dayMoments = [dayMoments];
        }
        dayMoments.forEach(m => {
          if (m) {
            list.push({ ...m, dateString: dateStr });
          }
        });
      });
      list.sort((a, b) => b.dateString.localeCompare(a.dateString));
      return list.filter(m => {
        if (this.wheelYearFilter) {
          const yearOfM = m.dateString.substring(0, 4);
          if (yearOfM !== this.wheelYearFilter) return false;
        }
        if (this.wheelStartDate) {
          if (m.dateString < this.wheelStartDate) return false;
        }
        if (this.wheelEndDate) {
          if (m.dateString > this.wheelEndDate) return false;
        }
        if (this.activeCategoryFilter !== 'Semua') {
          if (!m.category || m.category.trim().toLowerCase() !== this.activeCategoryFilter.trim().toLowerCase()) return false;
        }
        if (this.searchQuery.trim() !== '') {
          const q = this.searchQuery.toLowerCase();
          const titleMatch = (m.title || '').toLowerCase().includes(q);
          const notesMatch = (m.notes || '').toLowerCase().includes(q);
          const categoryMatch = (m.category || '').toLowerCase().includes(q);
          const dateMatch = m.dateString.includes(q);
          const importantMatch = (m.importantNote || '').toLowerCase().includes(q);
          return titleMatch || notesMatch || categoryMatch || dateMatch || importantMatch;
        }
        return true;
      });
    },
    availableYears() {
      const yearsSet = new Set();
      Object.keys(this.moments).forEach(dateStr => {
        const yr = dateStr.substring(0, 4);
        if (yr && yr.length === 4) {
          yearsSet.add(yr);
        }
      });
      return Array.from(yearsSet).sort().reverse();
    },
    memoryJarBubbles() {
      const list = [];
      let idx = 0;
      Object.keys(this.moments).forEach(dateStr => {
        let dayMoments = this.moments[dateStr] || [];
        if (dayMoments && !Array.isArray(dayMoments)) {
          dayMoments = [dayMoments];
        }
        dayMoments.forEach(m => {
          if (m) {
            list.push({
              id: m.id,
              sticker: m.sticker,
              title: m.title,
              category: m.category,
              x: 10 + (idx * 27) % 80,
              y: 20 + (idx * 21) % 70,
              size: m.isImportant ? 28 : 22,
              delay: (idx * 0.3) % 3
            });
            idx++;
          }
        });
      });
      return list;
    }
  },
  async created() {
    // ✅ FIX: Tunggu Supabase storage siap sebelum baca data
    await globalThis._workspaceStorageReady;

    const saved = WorkspaceStorage.getItem('personal_workspace_calendar_moments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const sanitized = {};
          Object.keys(parsed).forEach(key => {
            const val = parsed[key];
            if (Array.isArray(val)) {
              sanitized[key] = val.filter(i => i && typeof i === 'object');
            } else if (val && typeof val === 'object') {
              sanitized[key] = [val];
            }
          });
          this.moments = sanitized;
        } else {
          this.moments = {};
        }
      } catch (_e) {
        this.moments = {};
      }
    } else {
      this.moments = {
        '2026-05-20': [
          {
            id: 'm-1',
            title: 'Matahari Terbenam di Pantai',
            sticker: '🥰',
            category: '🌸 Cinta',
            notes: 'Melihat senja jingga keemasan yang memantul indah di air laut bersama dia. Angin sepoi-sepoi menemani obrolan hangat kami tentang masa depan.',
            importantNote: 'Mengakui rasa kagum di bawah sinar mentari terbenam',
            isImportant: true,
            image: '',
            dragX: 0,
            dragY: 0,
            scale: 1.1,
            rotation: -5
          }
        ],
        '2026-05-12': [
          {
            id: 'm-2',
            title: 'Berhasil Push Code Pertama',
            sticker: '🥳',
            category: '🌿 Pertumbuhan',
            notes: 'Setelah bergadang 2 malam akhirnya website portofolio interaktif ini berhasil live tanpa error sama sekali. Sangat bangga!',
            importantNote: 'Launch workspace visual interaktif di production',
            isImportant: true,
            image: '',
            dragX: 0,
            dragY: 0,
            scale: 1.15,
            rotation: 4
          }
        ],
        '2026-05-27': [
          {
            id: 'm-3',
            title: 'Mendaki Bukit Paralayang',
            sticker: '😎',
            category: '🍃 Petualangan',
            notes: 'Menjelajahi jalur pendakian bebatuan di pagi buta untuk mengejar matahari terbit. Udara yang sangat dingin terbayar lunas dengan gradasi langit ungu pink.',
            importantNote: 'Mengejar sunrise kabut pagi di bukit paralayang',
            isImportant: true,
            image: '',
            dragX: 0,
            dragY: 0,
            scale: 1.05,
            rotation: -2
          }
        ]
      };
      this.saveToStorage();
    }
    globalThis.addEventListener('mousemove', this.handleDragPhotoMove);
    globalThis.addEventListener('mouseup', this.handleDragPhotoEnd);
    globalThis.addEventListener('touchmove', this.handleDragPhotoMove, { passive: false });
    globalThis.addEventListener('touchend', this.handleDragPhotoEnd);
    globalThis.addEventListener('scroll', this.handleScrollRotation);
    globalThis.addEventListener('click', this.handleDocumentClick);
  },
  beforeUnmount() {
    globalThis.removeEventListener('mousemove', this.handleDragPhotoMove);
    globalThis.removeEventListener('mouseup', this.handleDragPhotoEnd);
    globalThis.removeEventListener('touchmove', this.handleDragPhotoMove);
    globalThis.removeEventListener('touchend', this.handleDragPhotoEnd);
    globalThis.removeEventListener('scroll', this.handleScrollRotation);
    globalThis.removeEventListener('click', this.handleDocumentClick);
  },
  watch: {
    wheelMoments(newVal) {
      if (newVal && newVal.length > 0) {
        if (this.wheelActiveIndex >= newVal.length) {
          this.wheelActiveIndex = 0;
        }
      } else {
        this.wheelActiveIndex = 0;
      }
    }
  },
  methods: {
    getOrbitStyle(item, idx) {
      const total = this.wheelMoments.length;
      if (total === 0) return {};
      const step = 360 / total;
      const angle = (idx * step) + this.wheelRotationAngle;
      const rad = (angle * Math.PI) / 180;
      
      const isMobile = globalThis.innerWidth < 640;
      const radiusX = isMobile ? 120 : 255;
      const radiusY = isMobile ? 100 : 210;
      const size = isMobile ? 76 : 112;
      const halfSize = size / 2;
      
      const x = Math.sin(rad) * radiusX;
      const y = -Math.cos(rad) * radiusY;
      
      const isCurrent = idx === this.wheelActiveIndex;
      const diff = Math.min(Math.abs(idx - this.wheelActiveIndex), total - Math.abs(idx - this.wheelActiveIndex));
      const scale = isCurrent ? 1.15 : Math.max(0.6, 1.05 - (diff * 0.12));
      const zIndex = isCurrent ? 80 : (30 - diff);
      const opacity = Math.max(0.1, 1 - (diff * 0.16));
      
      // Rotate cards naturally to align on the perimeter of the sphere wheel
      const cardRotation = angle;
      
      return {
        width: size + 'px',
        height: size + 'px',
        left: 'calc(50% + ' + x + 'px - ' + halfSize + 'px)',
        top: 'calc(50% + ' + y + 'px - ' + halfSize + 'px)',
        transform: 'rotate(' + cardRotation + 'deg) scale(' + scale + ')',
        zIndex: zIndex,
        opacity: opacity,
        borderRadius: isMobile ? '16px' : '24px',
        boxShadow: isCurrent ? '0 10px 24px rgba(214, 123, 82, 0.35)' : '0 6px 14px rgba(0,0,0,0.06)',
        border: isCurrent ? '3px solid var(--color-terracotta)' : '1px solid rgba(239, 235, 228, 0.4)'
      };
    },
    getMomentsForDate(dateStr) {
      const val = this.moments[dateStr];
      if (Array.isArray(val)) return val;
      if (val && typeof val === 'object') return [val];
      return [];
    },
    formatDateString(year, month, day) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    },
    formatTimelineDate(dateStr) {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-');
      const monthsIndo = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return day + ' ' + monthsIndo[parseInt(month) - 1] + ' ' + year;
    },
    getRotationAngle(dayNum) {
      const angles = [-4, 3, -1, 4, -3, 2];
      return (angles[dayNum % angles.length]) + 'deg';
    },
    prevMonth() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      this.currentDate = new Date(year, month - 1, 1);
    },
    nextMonth() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      this.currentDate = new Date(year, month + 1, 1);
    },
    getFirstImageFromMoments(momentsList) {
      if (!momentsList || momentsList.length === 0) return '';
      const found = momentsList.find(m => m.image);
      return found ? found.image : '';
    },
    getStickerLabel(stk) {
      const labels = {
        '😊': 'Happy',
        '🥰': 'Love',
        '🥳': 'Excited',
        '😎': 'Cool',
        '😢': 'Sad',
        '😭': 'Crying',
        '😡': 'Angry',
        '😱': 'Shocked',
        '😴': 'Sleepy',
        '🧠': 'Thoughtful'
      };
      return labels[stk] || 'Mood';
    },
    openAddMoment(cell) {
      this.selectedCell = cell;
      this.selectedMomentId = null;
      const list = this.getMomentsForDate(cell.dateString);
      this.modalMoments = JSON.parse(JSON.stringify(list)).map(m => ({ ...m, showCategoryList: false }));
      
      if (this.modalMoments.length === 0) {
        this.addNewMomentBlock();
      }
      this.showModal = true;
    },
    addNewMomentBlock() {
      const dayNum = this.selectedCell ? this.selectedCell.dayNumber : 1;
      const baseRotation = parseInt(this.getRotationAngle(dayNum)) || 0;
      const count = this.modalMoments.length;
      const rotationOffset = count * 3;
      
      this.modalMoments.push({
        id: 'm-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: '',
        sticker: '✨',
        category: '',
        notes: '',
        importantNote: '',
        isImportant: true,
        image: '',
        timeStart: '',
        timeEnd: '',
        dragX: 0,
        dragY: 0,
        scale: 1.1,
        rotation: baseRotation + rotationOffset,
        showCategoryList: false
      });
    },
    selectBlockCategory(mItem, catName) {
      mItem.category = catName;
      mItem.showCategoryList = false;
    },
    toggleBlockCategoryDropdown(mItem) {
      mItem.showCategoryList = !mItem.showCategoryList;
    },
    removeMomentBlock(index) {
      this.modalMoments.splice(index, 1);
    },
    triggerFileUpload(index) {
      const el = document.getElementById('file-input-' + index);
      if (el) el.click();
    },
    handleBlockFileChange(event, mItem) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const maxWidth = 450;
          const maxHeight = 450;
          let w = img.width;
          let h = img.height;
          
          if (w > maxWidth || h > maxHeight) {
            if (w > h) {
              h = Math.round((h * maxWidth) / w);
              w = maxWidth;
            } else {
              w = Math.round((w * maxHeight) / h);
              h = maxHeight;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          mItem.image = canvas.toDataURL('image/jpeg', 0.7);
        };
      };
    },
    saveAllMoments() {
      if (!this.selectedCell) return;
      const dateStr = this.selectedCell.dateString;
      
      const finalMoments = this.modalMoments.filter(m => {
        return (m.title || '').trim() !== '' || 
               (m.notes || '').trim() !== '' || 
               (m.image || '') !== '' || 
               (m.importantNote || '').trim() !== '';
      }).map(m => {
        const copy = { ...m };
        delete copy.showCategoryList;
        return copy;
      });
      
      if (finalMoments.length === 0) {
        delete this.moments[dateStr];
      } else {
        this.moments[dateStr] = finalMoments;
      }
      
      this.saveToStorage();
      this.showModal = false;
    },
    getCategoryStyle(category) {
      const clean = (category || '').trim();
      if (clean.includes('Cinta')) {
        return {
          backgroundColor: '#FFF5F6',
          borderColor: '#FFC8D2',
          borderLeft: '5px solid #FF8DA1'
        };
      } else if (clean.includes('Pertumbuhan')) {
        return {
          backgroundColor: '#F3FCF5',
          borderColor: '#C6EED5',
          borderLeft: '5px solid #4CAF50'
        };
      } else if (clean.includes('Petualangan')) {
        return {
          backgroundColor: '#F0FDFD',
          borderColor: '#BEECEF',
          borderLeft: '5px solid #00ACC1'
        };
      } else if (clean.includes('Kebahagiaan')) {
        return {
          backgroundColor: '#F9F5FC',
          borderColor: '#E7D8F9',
          borderLeft: '5px solid #9C27B0'
        };
      } else if (clean.includes('Nostalgia')) {
        return {
          backgroundColor: '#FFFDF0',
          borderColor: '#FCECB6',
          borderLeft: '5px solid #FFB300'
        };
      } else if (clean.includes('Kedamaian')) {
        return {
          backgroundColor: '#F4FAFF',
          borderColor: '#CEE6FF',
          borderLeft: '5px solid #2196F3'
        };
      }
      return {
        backgroundColor: '#FFFDF9',
        borderColor: '#E6DFD5',
        borderLeft: '5px solid #8D6E63'
      };
    },
    getWashiColor(category) {
      const clean = (category || '').trim();
      if (clean.includes('Cinta')) return '#FFB2C1';
      if (clean.includes('Pertumbuhan')) return '#A5D6A7';
      if (clean.includes('Petualangan')) return '#80DEEA';
      if (clean.includes('Kebahagiaan')) return '#CE93D8';
      if (clean.includes('Nostalgia')) return '#FFE082';
      if (clean.includes('Kedamaian')) return '#90CAF9';
      return '#BCAAA4';
    },
    getCategoryCount(cat) {
      const allMoments = Object.values(this.moments).flat().filter(m => m);
      if (cat === 'Semua') {
        return allMoments.length;
      }
      const cleanCat = cat.substring(2).trim(); // Skip emoticon (e.g., '🌸 Cinta' -> 'Cinta')
      return allMoments.filter(m => m.category && m.category.trim().includes(cleanCat)).length;
    },
    deleteSpecificMomentFromTimeline(item) {
      if (confirm('Apakah kamu yakin ingin menghapus momen penting ini dari gelas kenangan?')) {
        const dateStr = item.dateString;
        let momentsList = this.getMomentsForDate(dateStr);
        momentsList = momentsList.filter(m => m.id !== item.id);
        
        if (momentsList.length === 0) {
          delete this.moments[dateStr];
        } else {
          this.moments[dateStr] = momentsList;
        }
        this.saveToStorage();
      }
    },
    addQuickMomentToday() {
      const today = new Date();
      const y = today.getFullYear();
      const m = today.getMonth();
      const d = today.getDate();
      const dateStr = this.formatDateString(y, m, d);
      
      this.selectedCell = {
        dateString: dateStr,
        dayNumber: d,
        moments: this.getMomentsForDate(dateStr)
      };
      this.selectedMomentId = null;
      this.modalMoments = JSON.parse(JSON.stringify(this.getMomentsForDate(dateStr)));
      if (this.modalMoments.length === 0) {
        this.addNewMomentBlock();
      }
      this.showModal = true;
    },
    openEditFromTimeline(item) {
      this.selectedCell = {
        dateString: item.dateString,
        dayNumber: parseInt(item.dateString.split('-')[2]),
        moments: this.getMomentsForDate(item.dateString)
      };
      this.selectedMomentId = item.id;
      this.modalMoments = JSON.parse(JSON.stringify(this.getMomentsForDate(item.dateString)));
      this.showModal = true;
    },
    saveToStorage() {
      WorkspaceStorage.setItem('personal_workspace_calendar_moments', JSON.stringify(this.moments));
    },
    isDraggingThisPhoto(id) {
      return this.draggingPhoto && this.draggingPhoto.momentId === id;
    },
    startDragPhoto(event, dateString, momentItem) {
      if (this.draggingPhoto) return;
      const isTouch = event.type.startsWith('touch');
      const clientX = isTouch ? event.touches[0].clientX : event.clientX;
      const clientY = isTouch ? event.touches[0].clientY : event.clientY;
      
      let initialRotation = momentItem.rotation;
      if (initialRotation === undefined) {
        const dayNum = parseInt(dateString.split('-')[2]);
        const angleStr = this.getRotationAngle(dayNum);
        initialRotation = parseInt(angleStr) || 0;
      }

      this.draggingPhoto = {
        type: 'drag',
        dateString,
        momentId: momentItem.id,
        startX: clientX,
        startY: clientY,
        initDragX: momentItem.dragX || 0,
        initDragY: momentItem.dragY || 0,
        initRotation: initialRotation,
        hasMoved: false
      };
    },
    startRotatePhoto(event, dateString, momentItem) {
      if (this.draggingPhoto) return;
      const isTouch = event.type.startsWith('touch');
      const clientX = isTouch ? event.touches[0].clientX : event.clientX;
      const clientY = isTouch ? event.touches[0].clientY : event.clientY;
      
      let initialRotation = momentItem.rotation;
      if (initialRotation === undefined) {
        const dayNum = parseInt(dateString.split('-')[2]);
        const angleStr = this.getRotationAngle(dayNum);
        initialRotation = parseInt(angleStr) || 0;
      }

      this.draggingPhoto = {
        type: 'rotate',
        dateString,
        momentId: momentItem.id,
        startX: clientX,
        startY: clientY,
        initRotation: initialRotation,
        hasMoved: true
      };
    },
    startScalePhoto(event, dateString, momentItem) {
      if (this.draggingPhoto) return;
      const isTouch = event.type.startsWith('touch');
      const clientX = isTouch ? event.touches[0].clientX : event.clientX;
      const clientY = isTouch ? event.touches[0].clientY : event.clientY;

      this.draggingPhoto = {
        type: 'scale',
        dateString,
        momentId: momentItem.id,
        startX: clientX,
        startY: clientY,
        initScale: momentItem.scale !== undefined ? momentItem.scale : 1.1,
        hasMoved: true
      };
    },
    handleDragPhotoMove(event) {
      if (!this.draggingPhoto) return;
      
      const isTouch = event.type.startsWith('touch');
      if (isTouch && event.cancelable) {
        event.preventDefault();
      }
      const clientX = isTouch ? event.touches[0].clientX : event.clientX;
      const clientY = isTouch ? event.touches[0].clientY : event.clientY;
      
      const dx = clientX - this.draggingPhoto.startX;
      const dy = clientY - this.draggingPhoto.startY;
      
      if (this.draggingPhoto.type === 'drag') {
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          this.draggingPhoto.hasMoved = true;
        }
      }
      
      const dateString = this.draggingPhoto.dateString;
      const momentId = this.draggingPhoto.momentId;
      const list = this.moments[dateString];
      if (list && Array.isArray(list)) {
        const found = list.find(m => m.id === momentId);
        if (found) {
          if (this.draggingPhoto.type === 'drag') {
            if (event.shiftKey || event.ctrlKey || event.altKey) {
              found.rotation = (this.draggingPhoto.initRotation || 0) + Math.round(dx * 0.4);
            } else {
              found.dragX = this.draggingPhoto.initDragX + dx;
              found.dragY = this.draggingPhoto.initDragY + dy;
            }
          } else if (this.draggingPhoto.type === 'rotate') {
            found.rotation = (this.draggingPhoto.initRotation || 0) + Math.round(dx * 0.6);
          } else if (this.draggingPhoto.type === 'scale') {
            const deltaScale = (dx + dy) / 80;
            found.scale = Math.max(0.4, Math.min(3, (this.draggingPhoto.initScale || 1.1) + deltaScale));
          }
        }
      }
    },
    handleDragPhotoEnd() {
      if (!this.draggingPhoto) return;
      
      const { type, dateString, hasMoved } = this.draggingPhoto;
      this.draggingPhoto = null;
      this.saveToStorage();
      
      if (type === 'drag' && !hasMoved) {
        const cell = this.calendarCells.find(c => c.dateString === dateString);
        if (cell) {
          this.openAddMoment(cell);
        }
      }
    },
    handleWheelZoom(event, dateString, momentItem) {
      const delta = event.deltaY < 0 ? 0.05 : -0.05;
      const list = this.moments[dateString];
      if (list && Array.isArray(list)) {
        const found = list.find(m => m.id === momentItem.id);
        if (found) {
          const currentScale = found.scale !== undefined ? found.scale : 1.1;
          found.scale = Math.max(0.4, Math.min(3, currentScale + delta));
          this.saveToStorage();
        }
      }
    },
    resetPhotoPosition(dateString, momentItem) {
      const list = this.moments[dateString];
      if (list && Array.isArray(list)) {
        const found = list.find(m => m.id === momentItem.id);
        if (found) {
          found.dragX = 0;
          found.dragY = 0;
          found.scale = 1.1;
          const dayNum = parseInt(dateString.split('-')[2]);
          found.rotation = parseInt(this.getRotationAngle(dayNum));
          this.saveToStorage();
        }
      }
    },
    toggleCategoryFilterDropdown() {
      this.showCategoryFilterDropdown = !this.showCategoryFilterDropdown;
    },
    selectCategoryFilter(cat) {
      this.activeCategoryFilter = cat;
      this.showCategoryFilterDropdown = false;
    },
    handleDocumentClick(e) {
      if (this.showCategoryFilterDropdown) {
        this.showCategoryFilterDropdown = false;
      }
    },
    resetFilters() {
      this.searchQuery = '';
      this.activeCategoryFilter = 'Semua';
      this.timelineStartDate = '';
      this.timelineEndDate = '';
      this.wheelYearFilter = '';
      this.wheelStartDate = '';
      this.wheelEndDate = '';
      this.wheelActiveIndex = 0;
    },
    spinWheel() {
      if (this.isSpinning || this.wheelMoments.length === 0) return;
      this.isSpinning = true;
      
      const total = this.wheelMoments.length;
      const targetIndex = Math.floor(Math.random() * total);
      
      const extraCycles = 5 + Math.floor(Math.random() * 5); // 5 to 10 full turns
      const stepAngle = 360 / total;
      const targetAngle = this.wheelRotationAngle + (extraCycles * 360) + (targetIndex - this.wheelActiveIndex) * stepAngle;
      
      const startAngle = this.wheelRotationAngle;
      const startTime = performance.now();
      const duration = 2500; // 2.5 seconds spin
      
      const animate = (now) => {
        const elapsed = now - startTime;
        if (elapsed >= duration) {
          this.wheelRotationAngle = targetAngle;
          this.wheelActiveIndex = targetIndex;
          this.isSpinning = false;
        } else {
          const progress = elapsed / duration;
          const easeOut = 1 - Math.pow(1 - progress, 3);
          this.wheelRotationAngle = startAngle + (targetAngle - startAngle) * easeOut;
          
          const rawIndex = Math.round((this.wheelRotationAngle / stepAngle)) % total;
          let idxVal = (total - rawIndex) % total;
          if (idxVal < 0) idxVal += total;
          this.wheelActiveIndex = idxVal;
          if (this.wheelActiveIndex >= total) this.wheelActiveIndex = 0;
          
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    },
    getMiniCalendarCells() {
      const yr = this.miniCalendarDate.getFullYear();
      const mo = this.miniCalendarDate.getMonth();
      const firstDay = new Date(yr, mo, 1);
      const startDayOfWeek = firstDay.getDay(); 
      const totalDays = new Date(yr, mo + 1, 0).getDate();
      const cells = [];
      
      const prevMonthTotalDays = new Date(yr, mo, 0).getDate();
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthTotalDays - i;
        const dObj = new Date(yr, mo - 1, day);
        const dStr = this.formatDateString(dObj.getFullYear(), dObj.getMonth(), day);
        cells.push({ dayNumber: day, dateString: dStr, isOtherMonth: true });
      }
      
      for (let d = 1; d <= totalDays; d++) {
        const dStr = this.formatDateString(yr, mo, d);
        cells.push({ dayNumber: d, dateString: dStr, isOtherMonth: false });
      }
      
      const totalCells = cells.length;
      const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
      for (let d = 1; d <= remaining; d++) {
        const dObj = new Date(yr, mo + 1, d);
        const dStr = this.formatDateString(dObj.getFullYear(), dObj.getMonth(), d);
        cells.push({ dayNumber: d, dateString: dStr, isOtherMonth: true });
      }
      return cells;
    },
    selectMiniCalendarDay(cell) {
      const dStr = cell.dateString;
      if (!this.wheelStartDate || (this.wheelStartDate && this.wheelEndDate)) {
        this.wheelStartDate = dStr;
        this.wheelEndDate = '';
      } else {
        if (dStr < this.wheelStartDate) {
          const temp = this.wheelStartDate;
          this.wheelStartDate = dStr;
          this.wheelEndDate = temp;
        } else {
          this.wheelEndDate = dStr;
        }
      }
      this.wheelActiveIndex = 0; // reset active index to avoid out of bounds
    },
    toggleMiniCalendar() {
      this.showMiniCalendar = !this.showMiniCalendar;
      if (this.showMiniCalendar) {
        this.backupStartDate = this.wheelStartDate;
        this.backupEndDate = this.wheelEndDate;
      }
    },
    cancelMiniCalendar() {
      this.wheelStartDate = this.backupStartDate || '';
      this.wheelEndDate = this.backupEndDate || '';
      this.showMiniCalendar = false;
      this.wheelActiveIndex = 0;
    },
    clearMiniCalendar() {
      this.wheelStartDate = '';
      this.wheelEndDate = '';
      this.wheelActiveIndex = 0;
    },
    applyMiniCalendar() {
      this.showMiniCalendar = false;
    },
    applyPresetRange(rangeType) {
      const today = new Date();
      if (rangeType === 'today') {
        const dStr = this.formatDateString(today.getFullYear(), today.getMonth(), today.getDate());
        this.wheelStartDate = dStr;
        this.wheelEndDate = dStr;
      } else if (rangeType === '7days') {
        const past = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
        const startStr = this.formatDateString(past.getFullYear(), past.getMonth(), past.getDate());
        const endStr = this.formatDateString(today.getFullYear(), today.getMonth(), today.getDate());
        this.wheelStartDate = startStr;
        this.wheelEndDate = endStr;
      } else if (rangeType === 'thismonth') {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const startStr = this.formatDateString(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate());
        const endStr = this.formatDateString(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate());
        this.wheelStartDate = startStr;
        this.wheelEndDate = endStr;
      }
      this.wheelActiveIndex = 0;
    },
    prevMiniCalendarMonth() {
      this.miniCalendarDate = new Date(this.miniCalendarDate.getFullYear(), this.miniCalendarDate.getMonth() - 1, 1);
    },
    nextMiniCalendarMonth() {
      this.miniCalendarDate = new Date(this.miniCalendarDate.getFullYear(), this.miniCalendarDate.getMonth() + 1, 1);
    },
    getCategoryCount(cat) {
      let count = 0;
      Object.keys(this.moments).forEach(dateStr => {
        let dayMoments = this.moments[dateStr] || [];
        if (dayMoments && !Array.isArray(dayMoments)) {
          dayMoments = [dayMoments];
        }
        dayMoments.forEach(m => {
          if (m) {
            if (cat === 'Semua') {
              count++;
            } else if (m.category && m.category.trim().toLowerCase() === cat.trim().toLowerCase()) {
              count++;
            }
          }
        });
      });
      return count;
    },
    handleScrollRotation() {
      this.scrollRotation = globalThis.scrollY * 0.12;
    },
    filterByMoodFromWheel(emoji) {
      if (this.activeMoodFilter === emoji) {
        this.activeMoodFilter = 'Semua';
      } else {
        this.activeMoodFilter = emoji;
      }
    },
    resetAllTimelineFilters() {
      this.activeMoodFilter = 'Semua';
      this.activeCategoryFilter = 'Semua';
    },
    spinAndPickRandomMemory() {
      const allList = this.filteredTimelineMoments;
      if (allList.length === 0) {
        alert('Belum ada kenangan untuk diputar. Yuk tulis momen pertama harian Anda!');
        return;
      }
      
      let spins = 0;
      const originalRot = this.scrollRotation;
      const intervalId = setInterval(() => {
        this.scrollRotation += 35;
        spins++;
        if (spins > 15) {
          clearInterval(intervalId);
          
          const randomIndex = Math.floor(Math.random() * allList.length);
          const selectedItem = allList[randomIndex];
          
          this.scrollRotation = originalRot + (randomIndex * 45);
          
          const elId = 'moment-card-' + selectedItem.id;
          const el = document.getElementById(elId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            el.style.borderColor = 'var(--color-terracotta)';
            el.style.transform = 'scale(1.03)';
            el.style.boxShadow = '0 0 25px rgba(214, 123, 82, 0.45)';
            
            setTimeout(() => {
              el.style.borderColor = '';
              el.style.transform = '';
              el.style.boxShadow = '';
            }, 2500);
          }
        }
      }, 50);
    }
  }
};
// 3. Content Plan and Tracker Component
const ContentTracker = {
  template: `
    <div class="content-tracker" @click="showPlatDropdown = false; showUserDropdown = false">
      <div class="flex-between">
        <h2 style="font-size: 24px; font-weight: 800; color: var(--text-dark);">Content Plan & Tracker</h2>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="btn btn-secondary" style="padding: 10px; display: inline-flex; align-items: center; justify-content: center; height: 38px; border: 1.5px solid #EAE5DD; background-color: #FFFFFF;" @click="showSettingsModal = true" title="Pengaturan Board">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
          <button class="btn btn-primary" @click="openAddModal">Tambah Ide Konten</button>
        </div>
      </div>

      <!-- Filters Bar -->
      <div style="background-color: #FCFAF7; border: 1.5px solid #EAE5DD; border-radius: 12px; padding: 12px 16px; margin: 16px 0; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;">
        <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; flex: 1;">
          <!-- Search Input -->
          <div style="position: relative; min-width: 180px; flex: 1;">
            <input type="text" v-model="filterSearch" placeholder="Cari Judul, Deskripsi, User..." class="form-input" style="height: 36px; padding: 6px 12px 6px 30px; font-size: 12px; width: 100%; border-radius: 8px; border: 1.5px solid #EAE5DD;" />
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="position: absolute; left: 10px; top: 11.5px; color: #7A6F66;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>

          <!-- Filter Platform -->
          <div>
            <select v-model="filterPlatform" class="form-input" style="height: 36px; padding: 4px 8px; font-size: 12px; border-radius: 8px; border: 1.5px solid #EAE5DD; background-color: #FFF; min-width: 130px; line-height: 24px;">
              <option value="Semua">Semua Platform</option>
              <option v-for="plat in platforms" :key="plat" :value="plat">{{ plat }}</option>
            </select>
          </div>

          <!-- Filter Username -->
          <div>
            <select v-model="filterUsername" class="form-input" style="height: 36px; padding: 4px 8px; font-size: 12px; border-radius: 8px; border: 1.5px solid #EAE5DD; background-color: #FFF; min-width: 130px; line-height: 24px;">
              <option value="Semua">Semua User/Kreator</option>
              <option v-for="u in usernames" :key="u" :value="u">{{ u }}</option>
            </select>
          </div>

          <!-- Filter Urgensi Rilis -->
          <div>
            <select v-model="filterUrgency" class="form-input" style="height: 36px; padding: 4px 8px; font-size: 12px; border-radius: 8px; border: 1.5px solid #EAE5DD; background-color: #FFF; min-width: 155px; line-height: 24px;">
              <option value="Semua">Semua Urgensi Rilis</option>
              <option value="Lewat Batas">Lewat Batas Rilis</option>
              <option value="Hari Ini">Rilis Hari Ini</option>
              <option value="H-1">Mendekati Rilis (H-1)</option>
              <option value="H-2">Mendekati Rilis (H-2)</option>
              <option value="Urgen">Mendesak (Semua Urgen)</option>
              <option value="Aman">Aman / Tidak Urgen</option>
            </select>
          </div>
        </div>

        <!-- Quick Actions e.g Clear Filters -->
        <div style="display: flex; gap: 6px;" v-if="filterSearch || filterPlatform !== 'Semua' || filterUsername !== 'Semua' || filterUrgency !== 'Semua'">
          <button class="btn btn-secondary" style="font-size: 11px; height: 32px; padding: 0 10px; display: inline-flex; align-items: center; gap: 4px; border: 1px dashed #D67B52; color: #D67B52; background-color: #FFF;" @click="clearFilters">
            Hapus Filter ✕
          </button>
        </div>
      </div>

      <!-- Kanban Board Wrapper with Scroll -->
      <div style="overflow-x: auto; padding-bottom: 12px; margin-top: 16px;">
        <div class="board-container" :style="{ gridTemplateColumns: 'repeat(' + columns.length + ', minmax(220px, 1fr))', minWidth: (columns.length * 240) + 'px' }">
          <div v-for="col in columns" 
               :key="col" 
               class="board-col" 
               :style="{ backgroundColor: draggedOverCol === col ? '#F5F2EB' : '', borderColor: draggedOverCol === col ? 'var(--color-terracotta)' : '', minHeight: '520px' }"
               @dragover.prevent="draggedOverCol = col"
               @dragleave="draggedOverCol = null"
               @drop="onDrop($event, col)">
            <div class="board-col-title">
              <span style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #1C3B34;">{{ col }}</span>
              <span class="board-col-count">{{ getItemsInCol(col).length }}</span>
            </div>
            
            <div class="board-cards" style="min-height: 440px;">
              <div v-for="item in getItemsInCol(col)" 
                   :key="item.id" 
                   class="board-card" 
                   draggable="true" 
                   @dragstart="onDragStart($event, item)"
                   @dragend="draggedOverCol = null"
                   style="transition: transform 0.2s; position: relative;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
                  <div class="board-card-title" style="font-family: 'Outfit', sans-serif; font-size: 13.5px; font-weight: 600; color: #2C2621; word-break: break-word; flex: 1; margin-bottom: 0;">
                    {{ item.title }}
                  </div>
                  <!-- Bulan Kedip Visual Animation di Ujung Setiap Task -->
                  <div v-if="getDueDateAlert(item.dueDate).isUrgent" class="blink-moon-glow" :title="getDueDateAlert(item.dueDate).label" style="flex-shrink: 0; display: inline-flex;">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" :stroke="getDueDateAlert(item.dueDate).color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" :style="{ color: getDueDateAlert(item.dueDate).color }">
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                    </svg>
                  </div>
                </div>

                <!-- Visual Notification Near Target Release date (H-2 / Mendekati / Terlewat) -->
                <div v-if="getDueDateAlert(item.dueDate).isUrgent" 
                     :style="{
                       display: 'inline-flex',
                       alignItems: 'center',
                       gap: '4px',
                       fontSize: '9.5px',
                       fontWeight: '700',
                       color: getDueDateAlert(item.dueDate).color,
                       backgroundColor: getDueDateAlert(item.dueDate).bgColor,
                       border: '1px solid ' + getDueDateAlert(item.dueDate).borderColor,
                       padding: '2px 6px',
                       borderRadius: '4px',
                       marginBottom: '8px',
                       width: 'fit-content'
                     }">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  {{ getDueDateAlert(item.dueDate).label }}
                </div>
                
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; align-items: center;" v-if="visibility.platform || visibility.username">
                  <span v-if="visibility.platform" class="pill" :class="getPlatformClass(item.platform)" style="font-size: 10px; padding: 2px 6px;">
                    {{ item.platform }}
                  </span>
                  <span v-if="visibility.username && item.username" style="font-size: 10px; font-weight: 600; color: #7A6F66; background-color: #F8F5F0; border: 1px solid #EAE5DD; padding: 2px 6px; border-radius: 4px; font-family: 'Space Mono', monospace;">
                    {{ item.username }}
                  </span>
                </div>

                <div v-if="visibility.notes && item.notes" style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.4; background: #FCFAF7; padding: 6px 8px; border-radius: 6px; border-left: 3px solid var(--color-gold); word-break: break-word;">
                  {{ item.notes }}
                </div>

                <div class="board-card-footer" style="border-top: 1px dashed #FAF6F0; padding-top: 8px; margin-top: 8px;">
                  <span class="text-mono" v-if="visibility.dueDate" style="font-size: 10px; color: #000000; display: inline-flex; align-items: center; gap: 4px;">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #000000;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {{ item.dueDate }}<span v-if="item.dueTime"> · {{ item.dueTime }}</span>
                  </span>
                  <span class="text-mono" v-else></span>
                  
                  <div class="board-card-actions" style="display: flex; gap: 4px; align-items: center;">
                    <!-- Edit Button next to Delete Button -->
                    <button class="card-nav-btn" @click="startEdit(item)" title="Ubah Konten" style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; padding: 0; color: #000000; background: #F5F2EB; border: 1.5px solid #EAE5DD; border-radius: 4px;">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #000000;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <!-- Delete Button -->
                    <button class="card-nav-btn" @click="deleteItem(item)" title="Hapus" style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; padding: 0; color: #000000; background: #F5F2EB; border: 1.5px solid #EAE5DD; border-radius: 4px;">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #000000;"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Drop here visual helper if empty -->
              <div v-if="getItemsInCol(col).length === 0" style="border: 1.5px dashed #EAE5DD; border-radius: 8px; padding: 16px; text-align: center; color: #9A8F85; font-size: 11px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 4px; opacity: 0.6;"><path d="M12 5v14M5 12h14"></path></svg>
                Tarik ke sini
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Content Modal -->
      <div v-if="showAddModal" class="modal-backdrop" @click.self="showAddModal = false">
        <div class="moment-modal" style="max-height: 90vh; overflow-y: auto; max-width: 500px; width: 100%;">
          <div class="flex-between" style="margin-bottom: 18px;">
            <h3 style="font-size: 18px; font-weight: 700; color: var(--text-dark);">
              {{ isEditing ? 'Ubah Konten Planning' : 'Buat Konten Planning Baru' }}
            </h3>
            <button class="close-btn" @click="showAddModal = false">×</button>
          </div>
          <form @submit.prevent="saveItem">
            <div class="form-group">
              <label>Judul Konten</label>
              <input type="text" class="form-input" v-model="form.title" placeholder="cth., Video Panduan Setup Vue 3" required />
            </div>
            
            <div class="grid-2">
              <div class="form-group" style="position: relative;">
                <label>Platform / Channel</label>
                <div style="position: relative;">
                  <div @click.stop="showPlatDropdown = !showPlatDropdown; showUserDropdown = false;" 
                       class="form-input" 
                       style="height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; cursor: pointer; border: 1.5px solid #EAE5DD; border-radius: 8px; background-color: #FFF; font-size: 13.5px; user-select: none;">
                    <span style="font-weight: 500; color: #2C2621;">
                      {{ form.platform === '__CUSTOM__' ? 'Platform Kustom...' : form.platform }}
                    </span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #7A6F66;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                  
                  <div v-if="showPlatDropdown" 
                       style="position: absolute; top: 100%; left: 0; right: 0; background: #FFFFFF; border: 1.5px solid #EAE5DD; border-radius: 8px; box-shadow: var(--shadow-md); z-index: 9999; margin-top: 4px; max-height: 200px; overflow-y: auto;">
                    <div v-for="plat in platforms" 
                         :key="plat" 
                         @click="selectPlatform(plat)"
                         style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; cursor: pointer; transition: background-color 0.2s;"
                         class="custom-dropdown-item">
                      <span style="font-size: 13px; color: #2C2621;">{{ plat }}</span>
                      
                      <button v-if="platforms.length > 1"
                              type="button" 
                              @click.stop="removePlatform(plat)" 
                              title="Hapus platform ini dari daftar"
                              style="background: transparent; border: 1px solid transparent; color: #DC2626; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px;"
                              class="btn-delete-option">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                    
                    <div @click="selectCustomPlatform" 
                         style="padding: 8px 12px; font-size: 12.5px; font-weight: 600; color: var(--color-terracotta); border-top: 1.5px dashed #F5F2EB; cursor: pointer; background: #FCFAF7;"
                         class="custom-dropdown-add-btn">
                      + Tambah Platform Kustom...
                    </div>
                  </div>
                </div>
                <input type="text"
                       v-if="form.platform === '__CUSTOM__'"
                       class="form-input animate-fade-in"
                       v-model="customPlatformName"
                       placeholder="Ketik platform kustom Anda..."
                       style="margin-top: 6px; height: 38px;"
                       required />
              </div>
              <div class="form-group">
                <label>Target Tanggal Rilis</label>
                <input type="date" class="form-input" v-model="form.dueDate" required style="height: 38px;" />
              </div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label>Target Jam Rilis</label>
                <input type="time" class="form-input" v-model="form.dueTime" style="height: 38px;" />
              </div>
            </div>

            <!-- Username Select (bisa custom sendiri inputannya, dengan tombol minus hapus pilihan) -->
            <div class="form-group" style="position: relative;">
              <label>Username Kontributor / Creator</label>
              <div style="position: relative;">
                <div @click.stop="showUserDropdown = !showUserDropdown; showPlatDropdown = false;" 
                     class="form-input" 
                     style="height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; cursor: pointer; border: 1.5px solid #EAE5DD; border-radius: 8px; background-color: #FFF; font-size: 13.5px; user-select: none;">
                  <span style="font-weight: 500; color: #2C2621;">
                    {{ form.username === '__NEW_USER__' ? 'Username Kustom...' : form.username }}
                  </span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #7A6F66;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                
                <div v-if="showUserDropdown" 
                     style="position: absolute; top: 100%; left: 0; right: 0; background: #FFFFFF; border: 1.5px solid #EAE5DD; border-radius: 8px; box-shadow: var(--shadow-md); z-index: 9999; margin-top: 4px; max-height: 200px; overflow-y: auto;">
                  <div v-for="u in usernames" 
                       :key="u" 
                       @click="selectUsername(u)"
                       style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; cursor: pointer; transition: background-color 0.2s;"
                       class="custom-dropdown-item">
                    <span style="font-size: 13px; color: #2C2621;">{{ u }}</span>
                    
                    <button v-if="usernames.length > 1"
                            type="button" 
                            @click.stop="removeUsername(u)" 
                            title="Hapus username ini dari daftar"
                            style="background: transparent; border: 1px solid transparent; color: #DC2626; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px;"
                            class="btn-delete-option">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                  
                  <div @click="selectCustomUsername" 
                       style="padding: 8px 12px; font-size: 12.5px; font-weight: 600; color: var(--color-terracotta); border-top: 1.5px dashed #F5F2EB; cursor: pointer; background: #FCFAF7;"
                       class="custom-dropdown-add-btn">
                    + Tambah Username Kustom...
                  </div>
                </div>
              </div>
              <input type="text"
                     v-if="form.username === '__NEW_USER__'"
                     class="form-input animate-fade-in"
                     v-model="customUsernameVal"
                     placeholder="Ketik username baru (cth: @nadya)..."
                     style="margin-top: 6px; height: 38px;"
                     required />
            </div>

            <div class="form-group">
              <label>Catatan / Outline</label>
              <textarea class="form-input" v-model="form.notes" rows="8" placeholder="Sebutkan outline utama konten..." style="min-height: 180px; resize: vertical;"></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; height: 42px; font-weight: 700;">
              {{ isEditing ? 'Simpan Perubahan' : 'Masukkan Ide' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Settings Board Modal -->
      <div v-if="showSettingsModal" class="modal-backdrop" @click.self="showSettingsModal = false">
        <div class="moment-modal text-left" style="max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; text-align: left;">
          <div class="flex-between" style="border-bottom: 1.5px solid #EAE5DD; padding-bottom: 12px; margin-bottom: 16px;">
            <h3 style="font-size: 18px; font-weight: 700; color: var(--text-dark); margin: 0;">Pengaturan Kanban & Atribut</h3>
            <button class="close-btn" @click="showSettingsModal = false">×</button>
          </div>
          
          <!-- Column Management -->
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 13.5px; font-weight: 700; color: #7A6F66; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Kustom Kolom / Tahapan Status</h4>
            
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
              <input type="text" class="form-input" v-model="newColumnName" placeholder="Contoh: Review Akhir" style="flex: 1; height: 38px; padding: 6px 10px; font-size: 12.5px;" @keyup.enter="addColumn" />
              <button class="btn btn-primary" style="height: 38px; padding: 0 16px; font-size: 12.5px; font-weight: 700;" @click="addColumn">Tambah</button>
            </div>

            <div style="max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; background: #FCFAF7; padding: 10px; border-radius: 8px; border: 1.5px solid #EAE5DD;">
              <div v-for="(col, index) in columns" :key="col" style="display: flex; align-items: center; justify-content: space-between; background: #FFF; border: 1.5px solid #FAF0EC; padding: 6px 10px; border-radius: 6px; gap: 8px;">
                <input type="text" 
                       :value="col" 
                       @change="renameColumn(col, $event.target.value)"
                       style="border: none; font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 700; color: #1C3B34; flex: 1; outline: none; background: transparent; padding: 2px;" 
                       title="Klik untuk mengubah nama kolom" />
                
                <div style="display: flex; gap: 4px; align-items: center;">
                  <button class="card-nav-btn" :disabled="index === 0" @click="moveColumn(index, -1)" style="padding: 2px 6px; background: #F8F5F0; border: 1px solid #EAE5DD; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;" title="Geser ke Kiri">◀</button>
                  <button class="card-nav-btn" :disabled="index === columns.length - 1" @click="moveColumn(index, 1)" style="padding: 2px 6px; background: #F8F5F0; border: 1px solid #EAE5DD; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;" title="Geser ke Kanan">▶</button>
                  <button class="card-nav-btn" @click="deleteColumn(col)" style="color: #DC2626; padding: 2px 6px; background: #FFFBFB; border: 1px solid #F8ECEC; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;" title="Hapus Kolom">✕</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Property Visibility on Card View Settings -->
          <div style="border-top: 1.5px solid #EAE5DD; padding-top: 16px; margin-bottom: 20px;">
            <h4 style="font-size: 13.5px; font-weight: 700; color: #7A6F66; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Atribut Property Visibility (Kartu Depan)</h4>
            <div style="display: flex; flex-direction: column; gap: 8px; background: #FCFAF7; padding: 12px; border-radius: 8px; border: 1.5px solid #EAE5DD;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: #5D4F43; font-weight: 600;">
                <input type="checkbox" v-model="visibility.platform" style="accent-color: var(--color-terracotta);" @change="saveVisibility" /> Tampilkan Platform / Channel
              </label>
              <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: #5D4F43; font-weight: 600;">
                <input type="checkbox" v-model="visibility.dueDate" style="accent-color: var(--color-terracotta);" @change="saveVisibility" /> Tampilkan Target Tanggal Rilis
              </label>
              <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: #5D4F43; font-weight: 600;">
                <input type="checkbox" v-model="visibility.notes" style="accent-color: var(--color-terracotta);" @change="saveVisibility" /> Tampilkan Catatan / Outline
              </label>
              <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: #5D4F43; font-weight: 600;">
                <input type="checkbox" v-model="visibility.username" style="accent-color: var(--color-terracotta);" @change="saveVisibility" /> Tampilkan Username Kontributor
              </label>
            </div>
          </div>

          <!-- Kustomisasi Warna Notifikasi Urgensi -->
          <div style="border-top: 1.5px solid #EAE5DD; padding-top: 16px; margin-bottom: 20px;">
            <h4 style="font-size: 13.5px; font-weight: 700; color: #7A6F66; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Warna Visual Notifikasi Urgensi Rilis</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #FCFAF7; padding: 12px; border-radius: 8px; border: 1.5px solid #EAE5DD;">
              <!-- Overdue Color Picker -->
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 11px; font-weight: 700; color: #5D4F43;">Lewat Batas Rilis</label>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <input type="color" v-model="alertColors.overdue" @change="saveAlertColors" style="border: 1px solid #EAE5DD; border-radius: 4px; padding: 0; width: 32px; height: 32px; cursor: pointer; background: transparent;" />
                  <span style="font-family: monospace; font-size: 11px; color: #7A6F66; text-transform: uppercase;">{{ alertColors.overdue }}</span>
                </div>
              </div>
              <!-- Today Color Picker -->
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 11px; font-weight: 700; color: #5D4F43;">Rilis Hari Ini</label>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <input type="color" v-model="alertColors.today" @change="saveAlertColors" style="border: 1px solid #EAE5DD; border-radius: 4px; padding: 0; width: 32px; height: 32px; cursor: pointer; background: transparent;" />
                  <span style="font-family: monospace; font-size: 11px; color: #7A6F66; text-transform: uppercase;">{{ alertColors.today }}</span>
                </div>
              </div>
              <!-- H-1 Color Picker -->
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 11px; font-weight: 700; color: #5D4F43;">Mendekati Rilis (H-1)</label>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <input type="color" v-model="alertColors.h1" @change="saveAlertColors" style="border: 1px solid #EAE5DD; border-radius: 4px; padding: 0; width: 32px; height: 32px; cursor: pointer; background: transparent;" />
                  <span style="font-family: monospace; font-size: 11px; color: #7A6F66; text-transform: uppercase;">{{ alertColors.h1 }}</span>
                </div>
              </div>
              <!-- H-2 Color Picker -->
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 11px; font-weight: 700; color: #5D4F43;">Mendekati Rilis (H-2)</label>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <input type="color" v-model="alertColors.h2" @change="saveAlertColors" style="border: 1px solid #EAE5DD; border-radius: 4px; padding: 0; width: 32px; height: 32px; cursor: pointer; background: transparent;" />
                  <span style="font-family: monospace; font-size: 11px; color: #7A6F66; text-transform: uppercase;">{{ alertColors.h2 }}</span>
                </div>
              </div>
            </div>
          </div>

          <button class="btn btn-primary" style="width: 100%; height: 38px; font-weight: 700;" @click="showSettingsModal = false">Tutup Pengaturan</button>
        </div>
      </div>

      <!-- Legend/Keterangan Warna Visual Notifikasi Rilis di bagian paling bawah -->
      <div style="background-color: #FCFAF7; border: 1.5px solid #EAE5DD; border-radius: 12px; padding: 16px 20px; margin-top: 24px;">
        <h4 style="font-size: 13.5px; font-weight: 700; color: #1C3B34; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" class="lucide-inline" style="color: var(--color-terracotta)"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          Keterangan Warna Visual Notifikasi & Urgensi Rilis Konten
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
          <!-- Lewat Batas Rilis -->
          <div :style="{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '10px', borderRadius: '8px', background: hexToRgba(alertColors.overdue, 0.04), border: '1.5px solid ' + hexToRgba(alertColors.overdue, 0.18) }">
            <div class="blink-moon-glow" style="margin-top: 2px;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" :stroke="alertColors.overdue" stroke-width="2.5" :style="{ color: alertColors.overdue }"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
            </div>
            <div>
              <div :style="{ fontSize: '12px', fontWeight: '700', color: alertColors.overdue }">Lewat Batas Rilis!</div>
              <div style="font-size: 11px; color: #7A6F66; line-height: 1.35; margin-top: 2px;">Target rilis telah melampaui tanggal hari ini (Terlambat).</div>
            </div>
          </div>

          <!-- Rilis Hari Ini -->
          <div :style="{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '10px', borderRadius: '8px', background: hexToRgba(alertColors.today, 0.04), border: '1.5px solid ' + hexToRgba(alertColors.today, 0.18) }">
            <div class="blink-moon-glow" style="margin-top: 2px;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" :stroke="alertColors.today" stroke-width="2.5" :style="{ color: alertColors.today }"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
            </div>
            <div>
              <div :style="{ fontSize: '12px', fontWeight: '700', color: alertColors.today }">Rilis Hari Ini!</div>
              <div style="font-size: 11px; color: #7A6F66; line-height: 1.35; margin-top: 2px;">Target rilis adalah hari ini. Segera publish konten Anda!</div>
            </div>
          </div>

          <!-- Mendekati Rilis H-1 -->
          <div :style="{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '10px', borderRadius: '8px', background: hexToRgba(alertColors.h1, 0.04), border: '1.5px solid ' + hexToRgba(alertColors.h1, 0.18) }">
            <div class="blink-moon-glow" style="margin-top: 2px;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" :stroke="alertColors.h1" stroke-width="2.5" :style="{ color: alertColors.h1 }"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
            </div>
            <div>
              <div :style="{ fontSize: '12px', fontWeight: '700', color: alertColors.h1 }">Mendekati Rilis (H-1)</div>
              <div style="font-size: 11px; color: #7A6F66; line-height: 1.35; margin-top: 2px;">Tersisa 1 hari sebelum target publish. Persiapkan materi rilis.</div>
            </div>
          </div>

          <!-- Mendekati Rilis H-2 -->
          <div :style="{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '10px', borderRadius: '8px', background: hexToRgba(alertColors.h2, 0.04), border: '1.5px solid ' + hexToRgba(alertColors.h2, 0.18) }">
            <div class="blink-moon-glow" style="margin-top: 2px;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" :stroke="alertColors.h2" stroke-width="2.5" :style="{ color: alertColors.h2 }"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
            </div>
            <div>
              <div :style="{ fontSize: '12px', fontWeight: '700', color: alertColors.h2 }">Mendekati Rilis (H-2)</div>
              <div style="font-size: 11px; color: #7A6F66; line-height: 1.35; margin-top: 2px;">Tersisa 2 hari sebelum target publish. Masuk tenggat review.</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  data() {
    return {
      showAddModal: false,
      showSettingsModal: false,
      isEditing: false,
      editingItemId: null,
      draggedOverCol: null,
      draggedItem: null,
      newColumnName: '',
      customPlatformName: '',
      customUsernameVal: '',
      showPlatDropdown: false,
      showUserDropdown: false,
      
      // Filters
      filterSearch: '',
      filterPlatform: 'Semua',
      filterUsername: 'Semua',
      filterUrgency: 'Semua',

      alertColors: {
        overdue: '#DC2626',
        today: '#D67B52',
        h1: '#B07D3E',
        h2: '#7F623F'
      },

      columns: [],
      platforms: [],
      usernames: [],
      visibility: {
        platform: true,
        dueDate: true,
        notes: true,
        username: true
      },
      items: [],
      form: {
        title: '',
        platform: 'Instagram',
        dueDate: localDateStr(),
        dueTime: '',
        notes: '',
        username: '@nadya'
      }
    };
  },
  async created() {
    // ✅ FIX: Tunggu Supabase storage siap sebelum baca data
    await globalThis._workspaceStorageReady;

    // 1. Load Columns
    const savedCols = WorkspaceStorage.getItem('personal_workspace_content_columns');
    if (savedCols) {
      this.columns = JSON.parse(savedCols);
    } else {
      this.columns = ['Idea', 'Writing', 'In Production', 'Scheduled', 'Published'];
    }

    // 2. Load Platforms
    const savedPlats = WorkspaceStorage.getItem('personal_workspace_content_platforms');
    if (savedPlats) {
      this.platforms = JSON.parse(savedPlats);
    } else {
      this.platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter / X', 'Blog'];
    }

    // 3. Load Usernames
    const savedUsers = WorkspaceStorage.getItem('personal_workspace_content_usernames');
    if (savedUsers) {
      this.usernames = JSON.parse(savedUsers);
    } else {
      this.usernames = ['@nadya', '@nanda', '@tim_sosmed'];
    }

    // 4. Load Property Visibility Settings
    const savedVis = WorkspaceStorage.getItem('personal_workspace_content_visibility');
    if (savedVis) {
      this.visibility = JSON.parse(savedVis);
    }

    // Set form defaults based on arrays
    if (this.platforms.length > 0) this.form.platform = this.platforms[0];
    if (this.usernames.length > 0) this.form.username = this.usernames[0];

    // 5. Load Alert Colors
    const savedColors = WorkspaceStorage.getItem('personal_workspace_content_alert_colors');
    if (savedColors) {
      try {
        this.alertColors = { ...this.alertColors, ...JSON.parse(savedColors) };
      } catch (_e) {
        console.error(e);
      }
    }

    // 6. Load Items
    const savedItems = WorkspaceStorage.getItem('personal_workspace_content_items');
    if (savedItems) {
      this.items = JSON.parse(savedItems);
    } else {
      this.items = [
        { id: 1, title: 'Personal Aesthetic Site Walkthrough', platform: 'YouTube', dueDate: '2026-06-05', status: 'Writing', username: '@nadya', notes: 'Draft video script for visual features' },
        { id: 2, title: 'Warm Retro Color Schemes Inspiration', platform: 'Instagram', dueDate: '2026-06-01', status: 'Idea', username: '@nanda', notes: 'Create carousel showing beige/cream grids' },
        { id: 3, title: 'Ditch the Blue: Creative Web Design', platform: 'Blog', dueDate: '2026-05-30', status: 'Scheduled', username: '@tim_sosmed', notes: 'Blog post discussing styled vectors and organic tones' }
      ];
      this.saveToStorage();
    }

    // 7. Event Listener for syncing logbook entries to content planning
    this.handleSyncEvent = (e) => {
      const data = e.detail;
      this.openAddModal();
      this.form.notes = `Tugas / Deskripsi Kerja:\n${data.tasks}\n\nHasil yang Dicapai:\n${data.achievements}`;
      this.form.title = `Konten - ${data.tasks.substring(0, 35)}${data.tasks.length > 35 ? '...' : ''}`;
    };
    globalThis.addEventListener('sync-logbook-content', this.handleSyncEvent);
  },
  beforeUnmount() {
    if (this.handleSyncEvent) {
      globalThis.removeEventListener('sync-logbook-content', this.handleSyncEvent);
    }
  },
  methods: {
    getItemsInCol(col) {
      const filtered = this.items.filter(item => {
        if (item.status !== col) return false;
        if (this.filterPlatform !== 'Semua') {
          if (item.platform !== this.filterPlatform) return false;
        }
        if (this.filterUsername !== 'Semua') {
          if (item.username !== this.filterUsername) return false;
        }
        if (this.filterUrgency !== 'Semua') {
          const alert = this.getDueDateAlert(item.dueDate);
          if (this.filterUrgency === 'Lewat Batas') {
            if (alert.label !== 'Lewat Batas Rilis!') return false;
          } else if (this.filterUrgency === 'Hari Ini') {
            if (alert.label !== 'Rilis Hari Ini!') return false;
          } else if (this.filterUrgency === 'H-1') {
            if (alert.label !== 'Mendekati Rilis (H-1)') return false;
          } else if (this.filterUrgency === 'H-2') {
            if (alert.label !== 'Mendekati Rilis (H-2)') return false;
          } else if (this.filterUrgency === 'Urgen') {
            if (!alert.isUrgent) return false;
          } else if (this.filterUrgency === 'Aman') {
            if (alert.isUrgent) return false;
          }
        }
        if (this.filterSearch.trim()) {
          const s = this.filterSearch.toLowerCase();
          const titleMatch = (item.title || '').toLowerCase().includes(s);
          const notesMatch = (item.notes || '').toLowerCase().includes(s);
          const userMatch = (item.username || '').toLowerCase().includes(s);
          if (!titleMatch && !notesMatch && !userMatch) return false;
        }
        return true;
      });

      return filtered;
    },
    hexToRgba(hex, opacity) {
      if (!hex) return 'rgba(0,0,0,' + opacity + ')';
      let cleanHex = hex.replace('#', '');
      if (cleanHex.length === 3) {
        cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
      }
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    getPlatformClass(plat) {
      switch(plat) {
        case 'YouTube': return 'pill-terracotta';
        case 'Instagram': return 'pill-gold';
        case 'Blog': return 'pill-sage';
        case 'TikTok': return 'pill-terracotta';
        default: return 'pill-sage';
      }
    },
    deleteItem(item) {
      const index = this.items.findIndex(i => i.id === item.id);
      if (index !== -1) {
        this.items.splice(index, 1);
        this.saveToStorage();
      }
    },
    removePlatform(plat) {
      if (this.platforms.length <= 1) return;
      if (confirm(`Apakah Anda yakin ingin menghapus pilihan platform '${plat}' dari daftar pilihan?`)) {
        this.platforms = this.platforms.filter(p => p !== plat);
        WorkspaceStorage.setItem('personal_workspace_content_platforms', JSON.stringify(this.platforms));
        if (this.form.platform === plat) {
          this.form.platform = this.platforms[0] || '';
        }
        this.saveToStorage();
      }
    },
    removeUsername(u) {
      if (this.usernames.length <= 1) return;
      if (confirm(`Apakah Anda yakin ingin menghapus pilihan username '${u}' dari daftar pilihan?`)) {
        this.usernames = this.usernames.filter(x => x !== u);
        WorkspaceStorage.setItem('personal_workspace_content_usernames', JSON.stringify(this.usernames));
        if (this.form.username === u) {
          this.form.username = this.usernames[0] || '';
        }
        this.saveToStorage();
      }
    },
    selectPlatform(plat) {
      this.form.platform = plat;
      this.showPlatDropdown = false;
    },
    selectUsername(u) {
      this.form.username = u;
      this.showUserDropdown = false;
    },
    selectCustomPlatform() {
      this.form.platform = '__CUSTOM__';
      this.customPlatformName = '';
      this.showPlatDropdown = false;
    },
    selectCustomUsername() {
      this.form.username = '__NEW_USER__';
      this.customUsernameVal = '';
      this.showUserDropdown = false;
    },
    getDueDateAlert(dueDate) {
      if (!dueDate) return { isUrgent: false, label: '' };
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          const c = this.alertColors.overdue || '#DC2626';
          return { isUrgent: true, label: 'Lewat Batas Rilis!', color: c, bgColor: this.hexToRgba(c, 0.04), borderColor: this.hexToRgba(c, 0.18) };
        } else if (diffDays === 0) {
          const c = this.alertColors.today || '#D67B52';
          return { isUrgent: true, label: 'Rilis Hari Ini!', color: c, bgColor: this.hexToRgba(c, 0.04), borderColor: this.hexToRgba(c, 0.18) };
        } else if (diffDays === 1) {
          const c = this.alertColors.h1 || '#B07D3E';
          return { isUrgent: true, label: 'Mendekati Rilis (H-1)', color: c, bgColor: this.hexToRgba(c, 0.04), borderColor: this.hexToRgba(c, 0.18) };
        } else if (diffDays === 2) {
          const c = this.alertColors.h2 || '#7F623F';
          return { isUrgent: true, label: 'Mendekati Rilis (H-2)', color: c, bgColor: this.hexToRgba(c, 0.04), borderColor: this.hexToRgba(c, 0.18) };
        }
      } catch (_e) {
        console.error(e);
      }
      return { isUrgent: false, label: '' };
    },
    saveAlertColors() {
      WorkspaceStorage.setItem('personal_workspace_content_alert_colors', JSON.stringify(this.alertColors));
    },
    openAddModal() {
      this.isEditing = false;
      this.editingItemId = null;
      this.form.title = '';
      this.form.notes = '';
      this.form.dueTime = '';
      this.form.platform = this.platforms[0] || 'Instagram';
      this.form.username = this.usernames[0] || '@nadya';
      this.customPlatformName = '';
      this.customUsernameVal = '';
      this.showPlatDropdown = false;
      this.showUserDropdown = false;
      this.showAddModal = true;
    },
    startEdit(item) {
      this.isEditing = true;
      this.editingItemId = item.id;
      this.form.title = item.title;
      this.form.notes = item.notes || '';
      this.showPlatDropdown = false;
      this.showUserDropdown = false;
      
      const hasPlat = this.platforms.includes(item.platform);
      if (hasPlat) {
        this.form.platform = item.platform;
        this.customPlatformName = '';
      } else {
        this.form.platform = '__CUSTOM__';
        this.customPlatformName = item.platform;
      }
      
      this.form.dueDate = item.dueDate;
      this.form.dueTime = item.dueTime || '';
      
      const hasUser = this.usernames.includes(item.username);
      if (hasUser) {
        this.form.username = item.username;
        this.customUsernameVal = '';
      } else {
        this.form.username = '__NEW_USER__';
        this.customUsernameVal = item.username;
      }
      this.showAddModal = true;
    },
    saveItem() {
      let finalPlatform = this.form.platform;
      if (this.form.platform === '__CUSTOM__') {
        const customPlat = this.customPlatformName.trim();
        if (!customPlat) {
          alert('Silakan tulis nama platform baru!');
          return;
        }
        if (!this.platforms.includes(customPlat)) {
          this.platforms.push(customPlat);
          WorkspaceStorage.setItem('personal_workspace_content_platforms', JSON.stringify(this.platforms));
        }
        finalPlatform = customPlat;
      }

      let finalUsername = this.form.username;
      if (this.form.username === '__NEW_USER__') {
        let customUser = this.customUsernameVal.trim();
        if (!customUser) {
          alert('Silakan tulis username baru!');
          return;
        }
        if (!customUser.startsWith('@')) {
          customUser = '@' + customUser;
        }
        if (!this.usernames.includes(customUser)) {
          this.usernames.push(customUser);
          WorkspaceStorage.setItem('personal_workspace_content_usernames', JSON.stringify(this.usernames));
        }
        finalUsername = customUser;
      }

      if (this.isEditing && this.editingItemId !== null) {
        const existing = this.items.find(i => i.id === this.editingItemId);
        if (existing) {
          existing.title = this.form.title;
          existing.platform = finalPlatform;
          existing.dueDate = this.form.dueDate;
          existing.dueTime = this.form.dueTime;
          existing.notes = this.form.notes;
          existing.username = finalUsername;
        }
      } else {
        const newItem = {
          id: Date.now(),
          status: this.columns[0] || 'Idea',
          title: this.form.title,
          platform: finalPlatform,
          dueDate: this.form.dueDate,
          dueTime: this.form.dueTime,
          notes: this.form.notes,
          username: finalUsername
        };
        this.items.push(newItem);
      }
      this.saveToStorage();
      
      // Reset form & helpers
      this.showAddModal = false;
      this.isEditing = false;
      this.editingItemId = null;
      this.form.title = '';
      this.form.notes = '';
      this.form.dueTime = '';
      this.form.platform = this.platforms[0] || 'Instagram';
      this.form.username = this.usernames[0] || '@nadya';
      this.customPlatformName = '';
      this.customUsernameVal = '';
    },
    
    // HTML5 Drag and Drop Handlers
    onDragStart(event, item) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', item.id.toString());
      this.draggedItem = item;
    },
    onDrop(event, col) {
      event.preventDefault();
      const itemId = event.dataTransfer.getData('text/plain') || (this.draggedItem ? this.draggedItem.id.toString() : '');
      const item = this.items.find(i => i.id.toString() === itemId);
      if (item) {
        item.status = col;
        this.saveToStorage();
      }
      this.draggedItem = null;
      this.draggedOverCol = null;
    },

    // Column settings
    addColumn() {
      const trimmed = this.newColumnName.trim();
      if (!trimmed) {
        alert("Nama kolom tidak boleh kosong!");
        return;
      }
      if (this.columns.includes(trimmed)) {
        alert("Kolom sudah terdaftar!");
        return;
      }
      this.columns.push(trimmed);
      this.newColumnName = '';
      this.saveToStorage();
    },
    deleteColumn(col) {
      if (this.columns.length <= 1) {
        alert("Sisa minimal 1 kolom tidak bisa dihapus!");
        return;
      }
      if (confirm(`Apakah Anda yakin menghapus kolom '${col}'? Semua konten di dalam kolom ini dipindahkan ke status kolom lainnya.`)) {
        const itemMoveCol = this.columns[0] === col ? this.columns[1] : this.columns[0];
        this.items.forEach(item => {
          if (item.status === col) {
            item.status = itemMoveCol;
          }
        });
        this.columns = this.columns.filter(c => c !== col);
        this.saveToStorage();
      }
    },
    renameColumn(oldVal, newVal) {
      const trimmed = newVal.trim();
      if (!trimmed) {
        alert("Nama kolom tidak boleh kosong!");
        return;
      }
      if (this.columns.includes(trimmed) && trimmed !== oldVal) {
        alert("Nama kolom tersebut sudah terpakai!");
        return;
      }
      const idx = this.columns.indexOf(oldVal);
      if (idx !== -1) {
        this.columns.splice(idx, 1, trimmed);
        this.items.forEach(item => {
          if (item.status === oldVal) {
            item.status = trimmed;
          }
        });
        this.saveToStorage();
      }
    },
    moveColumn(index, dir) {
      const targetIndex = index + dir;
      if (targetIndex >= 0 && targetIndex < this.columns.length) {
        const columnsCopy = [...this.columns];
        const [moved] = columnsCopy.splice(index, 1);
        columnsCopy.splice(targetIndex, 0, moved);
        this.columns = columnsCopy;
        this.saveToStorage();
      }
    },

    // Visibility settings toggler
    saveVisibility() {
      WorkspaceStorage.setItem('personal_workspace_content_visibility', JSON.stringify(this.visibility));
    },

    // Filters clearing
    clearFilters() {
      this.filterSearch = '';
      this.filterPlatform = 'Semua';
      this.filterUsername = 'Semua';
      this.filterUrgency = 'Semua';
    },

    saveToStorage() {
      WorkspaceStorage.setItem('personal_workspace_content_items', JSON.stringify(this.items));
      WorkspaceStorage.setItem('personal_workspace_content_columns', JSON.stringify(this.columns));
      WorkspaceStorage.setItem('personal_workspace_content_platforms', JSON.stringify(this.platforms));
      WorkspaceStorage.setItem('personal_workspace_content_usernames', JSON.stringify(this.usernames));
    }
  }
};

// 4. Interview Practice Component
const InterviewPractice = {
  template: `
    <div class="interview-practice">

      <!-- ═══ HERO HEADER ═══ -->
      <div class="ip-hero">
        <div class="ip-hero-left">
          <div class="ip-hero-eyebrow">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            Practice Room
          </div>
          <h2 class="ip-hero-title">Daily Interview Practice</h2>
          <p class="ip-hero-sub">Tarik tuas, acak pertanyaan, rekam suara dengan framework STAR / PREP / PPF.</p>
        </div>
        <div class="ip-hero-actions">
          <!-- Mode Toggle -->
          <div class="ip-mode-toggle">
            <button type="button" class="ip-mode-btn" :class="{ 'ip-mode-btn--active-manual': activeMode==='manual' }" @click="setMode('manual')">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
              Self-Interview
            </button>
            <button type="button" class="ip-mode-btn" :class="{ 'ip-mode-btn--active-ai': activeMode==='ai' }" @click="setMode('ai')">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28Z"></path></svg>
              Interview with AI
            </button>
          </div>
          <!-- Kelola Button -->
          <button class="ip-manage-btn" @click="toggleManagePanel"
                  :disabled="activeMode === 'ai'"
                  :style="activeMode==='ai' ? {opacity:'0.38',cursor:'not-allowed'} : {}">
            <template v-if="showManagePanel && activeMode==='manual'">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              Sembunyikan
            </template>
            <template v-else>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Kelola Soal
            </template>
          </button>
        </div>
      </div>

      <!-- ═══ MODE BADGE ═══ -->
      <div style="margin-bottom: 20px;">
        <div v-if="activeMode==='manual'" class="ip-mode-badge ip-mode-badge--manual">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
          Mode: Self-Interview — Bank soal dari daftar pertanyaan kamu
        </div>
        <div v-else class="ip-mode-badge ip-mode-badge--ai">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28Z"></path></svg>
          Mode: Interview with AI — Bank soal diisi dinamis dari Gemini API
          <span v-if="aiQuestionBank.length > 0" class="ip-ai-count-pill">{{ aiQuestionBank.length }} soal siap</span>
        </div>
      </div>

      <!-- ═══ MANUAL MODE: Question Manager Panel ═══ -->
      <div v-if="activeMode==='manual'" v-show="showManagePanel" class="questions-manage-drawer animate-fade-in" style="margin-bottom: 28px;">
        <h3 style="font-size:15px; font-weight:800; color:var(--color-forest,#1C3B34); margin:0 0 14px 0; display:flex; align-items:center; gap:6px;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-terracotta);"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
          Kelola & Update Daftar Pertanyaan
        </h3>
        <div style="background:var(--bg-card,#fff); border:1.5px solid var(--color-sand,#E8DFD8); border-radius:12px; padding:16px; display:grid; gap:12px; margin-bottom:16px;">
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
            <div>
              <label style="font-size:11.5px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">Kategori</label>
              <select class="form-input" v-model="formCategory" style="padding:10px; font-size:13px; border:1.5px solid var(--color-sand); height:42px;">
                <option value="General HR">General HR</option>
                <option value="Technical Speciality">Technical Speciality</option>
                <option value="General Technical">General Technical</option>
                <option value="Performance Tuning">Performance Tuning</option>
                <option value="Behavioral &amp; Teamwork">Behavioral &amp; Teamwork</option>
              </select>
            </div>
            <div>
              <label style="font-size:11.5px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">Teks Pertanyaan</label>
              <input type="text" class="form-input" v-model="formText" placeholder="Contoh: Mengapa kami harus menerima Anda?" style="padding:10px; font-size:13.5px; border:1.5px solid var(--color-sand); height:42px;" />
            </div>
            <div>
              <label style="font-size:11.5px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">
                Framework Jawaban
              </label>
              <div class="ip-framework-select-wrap">
                <!-- Tanpa Framework -->
                <button type="button"
                  class="ip-fw-pill-btn"
                  :class="{ 'ip-fw-pill-btn--active ip-fw-pill-btn--none': formFramework === '' }"
                  @click="formFramework = ''">
                  <span class="ip-fw-pill-icon">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  </span>
                  Bebas
                </button>
                <!-- STAR / PREP / PPF -->
                <button type="button"
                  v-for="fw in ['STAR','PREP','PPF']" :key="fw"
                  class="ip-fw-pill-btn"
                  :class="{ 'ip-fw-pill-btn--active': formFramework === fw }"
                  @click="formFramework = fw">
                  <span class="ip-fw-pill-icon">
                    <svg v-if="fw==='STAR'" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <svg v-if="fw==='PREP'" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                    <svg v-if="fw==='PPF'" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
                  </span>
                  {{ fw }}
                </button>
              </div>
              <div class="ip-fw-hint-box" v-if="formFramework === ''">
                <span style="color:var(--text-muted);">—</span>
                <span>Jawab bebas tanpa kerangka khusus. Framework Guide tidak akan terbuka otomatis.</span>
              </div>
              <div class="ip-fw-hint-box" v-if="formFramework === 'STAR'">
                <span style="color:var(--color-terracotta);">★</span>
                <span>Situation · Task · Action · Result — untuk pertanyaan behavioral.</span>
              </div>
              <div class="ip-fw-hint-box" v-if="formFramework === 'PREP'">
                <span style="color:var(--color-terracotta);">💡</span>
                <span>Point · Reason · Example · Point — untuk opini atau teknis.</span>
              </div>
              <div class="ip-fw-hint-box" v-if="formFramework === 'PPF'">
                <span style="color:var(--color-terracotta);">✦</span>
                <span>Present · Past · Future — untuk "Ceritakan diri Anda!".</span>
              </div>
            </div>
          </div>
          <div>
            <label style="font-size:11.5px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">Tips / Hints Jawaban</label>
            <textarea class="form-input" v-model="formHints" rows="2" placeholder="Saran kerangka jawaban..." style="padding:10px; font-size:13px; border:1.5px solid var(--color-sand);"></textarea>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:4px;">
            <button v-show="editingId !== null" class="btn btn-secondary" @click="cancelEdit" style="font-size:12.5px; padding:8px 16px;">Batal</button>
            <button class="spin-btn-teal" @click="saveCustomQuestion" style="font-size:13px; padding:8px 24px; box-shadow:none;">
              {{ editingId !== null ? 'Update Pertanyaan' : 'Tambah Pertanyaan' }}
            </button>
          </div>
        </div>
        <div style="overflow-x:auto; background:var(--bg-card,#fff); border:1.5px solid var(--color-sand); border-radius:12px;">
          <table class="questions-manage-table">
            <thead>
              <tr>
                <th style="width:16%;">Kategori</th>
                <th style="width:10%; text-align:center;">Framework</th>
                <th style="width:38%;">Pertanyaan</th>
                <th style="width:24%;">Hints</th>
                <th style="width:12%; text-align:center;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in questions" :key="q.id">
                <td><span class="framework-step-pill" style="margin:0; font-size:10px;">{{ q.category }}</span></td>
                <td style="text-align:center;">
                  <span v-if="q.framework" class="ip-fw-badge" :class="'ip-fw-badge--' + q.framework.toLowerCase()">{{ q.framework }}</span>
                  <span v-else class="ip-fw-badge ip-fw-badge--none">Bebas</span>
                </td>
                <td style="font-weight:600; color:var(--color-forest,#1C3B34);">{{ q.text }}</td>
                <td style="font-size:11.5px; color:var(--text-muted);">{{ q.hints }}</td>
                <td style="text-align:center;">
                  <div style="display:flex; gap:6px; justify-content:center;">
                    <button class="card-nav-btn" @click="startEdit(q)" style="background:var(--bg-cream); border:1px solid var(--color-sand); width:26px; height:26px; display:inline-flex; align-items:center; justify-content:center;">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                    </button>
                    <button class="card-nav-btn" @click="deleteCustomQuestion(q.id)" style="background:var(--bg-cream); border:1px solid var(--color-sand); color:var(--color-terracotta); width:26px; height:26px; display:inline-flex; align-items:center; justify-content:center;">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div style="padding:12px; background:var(--bg-cream); text-align:right; border-top:1px solid var(--color-sand);">
            <button class="btn btn-secondary" @click="resetDefaultQuestions" style="font-size:12px; padding:6px 12px; border:1.5px dashed var(--color-sand); background:var(--bg-card); display:inline-flex; align-items:center; gap:4px;">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg> Reset ke Default
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ AI MODE: Setup Panel ═══ -->
      <div v-if="activeMode==='ai'" class="ip-ai-panel animate-fade-in" style="margin-bottom:24px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:8px;">
          <div>
            <h4 style="font-size:15px; font-weight:800; color:var(--color-forest,#1C3B34); margin:0; display:flex; align-items:center; gap:6px;">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--color-terracotta);"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28Z"></path></svg>
              Konfigurasi AI — Rancang Pertanyaan Otomatis
            </h4>
            <p style="font-size:11.5px; color:var(--text-muted); margin:3px 0 0 0;">Isi target posisi &amp; tipe pertanyaan, lalu klik Rancang untuk mengisi bank soal sesi ini.</p>
          </div>
          <span style="font-size:9px; font-weight:800; background:var(--color-terracotta); color:#fff; padding:3px 10px; border-radius:20px; letter-spacing:0.5px;">GEMINI AI</span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px;">
          <div>
            <label style="font-size:11.5px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:5px;">Target Posisi *</label>
            <input type="text" v-model="aiTargetPosition" placeholder="cth: HR Generalist, Data Analyst, Backend Engineer..." style="width:100%; padding:9px 12px; font-size:12.5px; border:1.5px solid var(--color-sand); border-radius:8px; background:var(--bg-card,#fff); box-sizing:border-box; height:40px;" />
          </div>
          <div>
            <label style="font-size:11.5px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:5px;">Tipe Pertanyaan *</label>
            <div style="display:flex; gap:16px; height:40px; align-items:center;">
              <label style="display:inline-flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; cursor:pointer; color:var(--text-dark);">
                <input type="radio" v-model="aiQuestionType" value="General HR" style="accent-color:var(--color-terracotta);" /> General HR
              </label>
              <label style="display:inline-flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; cursor:pointer; color:var(--text-dark);">
                <input type="radio" v-model="aiQuestionType" value="Spesifik &amp; Mendalam" style="accent-color:var(--color-terracotta);" /> Spesifik &amp; Mendalam
              </label>
            </div>
          </div>
        </div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <button @click="generateQuestionsFromAI" :disabled="isGeneratingAi || !aiTargetPosition.trim()" class="spin-btn-teal" style="font-size:13px; padding:10px 20px; display:inline-flex; align-items:center; gap:6px; box-shadow:none;" :style="(!aiTargetPosition.trim()) ? {opacity:'0.5',cursor:'not-allowed'} : {}">
            <template v-if="isGeneratingAi">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4"></path></svg>
              Menggali Tren Industri...
            </template>
            <template v-else>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28Z"></path></svg>
              Rancang Pertanyaan AI ✨
            </template>
          </button>
          <button v-if="aiTargetPosition || aiQuestionBank.length > 0" @click="resetAiTopic" type="button" style="height:40px; font-size:12.5px; font-weight:700; border-radius:8px; border:1.5px solid var(--color-sand); padding:0 16px; background:var(--bg-card,#fff); display:inline-flex; align-items:center; gap:5px; cursor:pointer; color:var(--text-muted);">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 10 10 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            Reset Topik
          </button>
          <span v-if="aiQuestionBank.length > 0" style="font-size:12px; color:var(--color-forest,#1C3B34); font-weight:700; background:#EBF5F0; border:1px solid #A8D5C0; padding:4px 12px; border-radius:20px;">
            ✓ {{ aiQuestionBank.length }} pertanyaan siap di bank soal
          </span>
        </div>
        <div v-if="aiQuestionsError" style="margin-top:12px; background:#FDF4F5; border:1px solid #F5C6CB; padding:10px 12px; border-radius:8px; color:#721C24; font-size:12px;">
          ⚠️ {{ aiQuestionsError }}
        </div>
        <div v-if="aiQuestionBank.length > 0" class="animate-fade-in" style="margin-top:16px; background:var(--bg-card,#fff); border:1.5px solid var(--color-sand); border-radius:12px; padding:14px;">
          <h5 style="font-size:12px; font-weight:800; color:var(--color-forest,#1C3B34); margin:0 0 10px 0; border-bottom:1.5px dashed var(--color-sand); padding-bottom:8px;">
            Bank Soal Sesi Ini — {{ aiTargetPosition }} ({{ aiQuestionType }})
          </h5>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div v-for="(aq, idx) in aiQuestionBank" :key="idx" class="ip-ai-q-item">
              <div style="flex:1;">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                  <span class="framework-step-pill" style="font-size:9px; margin:0;">{{ aq.framework || 'STAR' }}</span>
                  <span style="font-size:10px; color:var(--text-muted); font-weight:600;">{{ aq.category }}</span>
                </div>
                <div style="font-size:13px; font-weight:700; color:var(--text-dark); line-height:1.45;">{{ aq.text }}</div>
                <div style="font-size:11.5px; color:var(--text-muted); margin-top:3px;"><strong>Hint:</strong> {{ aq.hints }}</div>
              </div>
              <button @click="practiceThisQuestion(aq)" class="ip-latih-btn">🎯 Latih</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ MAIN GRID ═══ -->
      <div class="ip-main-grid">

        <!-- ── LEFT COLUMN: Frameworks ── -->
        <aside class="ip-sidebar">
          <div class="frameworks-container">
            <span class="framework-acc-title" style="display:flex; align-items:center; gap:6px;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
              Frameworks Guide
            </span>
            <!-- STAR -->
            <div class="framework-acc-item" :class="{ expanded: expandedFrameworks.star || activeFramework==='STAR' }">
              <button class="framework-acc-trigger" @click="expandedFrameworks.star = !expandedFrameworks.star">
                <span style="display:inline-flex; align-items:center; gap:4px;">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--color-terracotta);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  STAR Formula
                </span>
                <span style="display:inline-flex; align-items:center; gap:4px;">
                  <span v-if="activeFramework==='STAR'" style="font-size:9px; background:var(--color-terracotta); color:#fff; padding:1px 6px; border-radius:10px;">Aktif</span>
                  {{ expandedFrameworks.star ? '▴' : '▾' }}
                </span>
              </button>
              <div v-show="expandedFrameworks.star || activeFramework==='STAR'" class="framework-acc-content animate-fade-in">
                <p style="margin-bottom:8px; font-weight:bold; color:var(--color-forest,#1C3B34);">Untuk pertanyaan berbasis perilaku (behavioral):</p>
                <div><span class="framework-step-pill">S - Situation</span> Latar belakang masalah.</div>
                <div><span class="framework-step-pill">T - Task</span> Tanggung jawab &amp; tantangan.</div>
                <div><span class="framework-step-pill">A - Action</span> Tindakan yang Anda ambil.</div>
                <div><span class="framework-step-pill">R - Result</span> Hasil akhir terukur.</div>
              </div>
            </div>
            <!-- PREP -->
            <div class="framework-acc-item" :class="{ expanded: expandedFrameworks.prep || activeFramework==='PREP' }">
              <button class="framework-acc-trigger" @click="expandedFrameworks.prep = !expandedFrameworks.prep">
                <span style="display:inline-flex; align-items:center; gap:4px;">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                  PREP Formula
                </span>
                <span style="display:inline-flex; align-items:center; gap:4px;">
                  <span v-if="activeFramework==='PREP'" style="font-size:9px; background:var(--color-terracotta); color:#fff; padding:1px 6px; border-radius:10px;">Aktif</span>
                  {{ expandedFrameworks.prep ? '▴' : '▾' }}
                </span>
              </button>
              <div v-show="expandedFrameworks.prep || activeFramework==='PREP'" class="framework-acc-content animate-fade-in">
                <p style="margin-bottom:8px; font-weight:bold; color:var(--color-forest,#1C3B34);">Untuk pertanyaan opini atau teknis:</p>
                <div><span class="framework-step-pill">P - Point</span> Kemukakan gagasan pokok.</div>
                <div><span class="framework-step-pill">R - Reason</span> Beri alasan logis.</div>
                <div><span class="framework-step-pill">E - Example</span> Ilustrasi nyata.</div>
                <div><span class="framework-step-pill">P - Point</span> Simpulkan kembali.</div>
              </div>
            </div>
            <!-- PPF -->
            <div class="framework-acc-item" :class="{ expanded: expandedFrameworks.ppf || activeFramework==='PPF' }">
              <button class="framework-acc-trigger" @click="expandedFrameworks.ppf = !expandedFrameworks.ppf">
                <span style="display:inline-flex; align-items:center; gap:4px;">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
                  PPF Formula
                </span>
                <span style="display:inline-flex; align-items:center; gap:4px;">
                  <span v-if="activeFramework==='PPF'" style="font-size:9px; background:var(--color-terracotta); color:#fff; padding:1px 6px; border-radius:10px;">Aktif</span>
                  {{ expandedFrameworks.ppf ? '▴' : '▾' }}
                </span>
              </button>
              <div v-show="expandedFrameworks.ppf || activeFramework==='PPF'" class="framework-acc-content animate-fade-in">
                <p style="margin-bottom:8px; font-weight:bold; color:var(--color-forest,#1C3B34);">Untuk "Ceritakan tentang diri Anda!":</p>
                <div><span class="framework-step-pill">P - Present</span> Posisi &amp; keahlian saat ini.</div>
                <div><span class="framework-step-pill">P - Past</span> Pencapaian masa lalu.</div>
                <div><span class="framework-step-pill">F - Future</span> Prospek &amp; kecocokan Anda.</div>
              </div>
            </div>
          </div>
        </aside>

        <!-- ── RIGHT COLUMN: Spin + Workspace ── -->
        <div class="ip-content-col">

          <!-- Filter / AI info bar -->
          <div v-if="activeMode==='manual'" class="ip-filter-bar">
            <div style="display:flex; align-items:center; gap:6px; font-size:13px; font-weight:700; color:var(--text-muted);">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--color-terracotta);"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
              Filter Kategori:
              <button class="pomo-category-select-btn" @click="toggleCategoryDropdown">
                <span>{{ selectedCategory }}</span><span>▼</span>
              </button>
            </div>
            <div v-show="showCategoryDropdown" class="pomo-category-dropdown animate-fade-in">
              <button class="pomo-category-option" :class="{ active: selectedCategory==='All Categories' }" @click="selectCategory('All Categories')">All Categories</button>
              <button class="pomo-category-option" :class="{ active: selectedCategory==='General HR' }" @click="selectCategory('General HR')">General HR</button>
              <button class="pomo-category-option" :class="{ active: selectedCategory==='Technical Speciality' }" @click="selectCategory('Technical Speciality')">Technical Speciality</button>
              <button class="pomo-category-option" :class="{ active: selectedCategory==='General Technical' }" @click="selectCategory('General Technical')">General Technical</button>
              <button class="pomo-category-option" :class="{ active: selectedCategory==='Performance Tuning' }" @click="selectCategory('Performance Tuning')">Performance Tuning</button>
              <button class="pomo-category-option" :class="{ active: selectedCategory==='Behavioral &amp; Teamwork' }" @click="selectCategory('Behavioral &amp; Teamwork')">Behavioral &amp; Teamwork</button>
            </div>
          </div>
          <div v-if="activeMode==='ai'" style="font-size:13px; font-weight:700; color:var(--text-muted); display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--color-terracotta);"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28Z"></path></svg>
            <span v-if="aiQuestionBank.length > 0">Spin dari bank soal AI — <strong>{{ aiTargetPosition }}</strong> ({{ aiQuestionType }})</span>
            <span v-else style="color:var(--color-terracotta);">Belum ada bank soal AI. Isi konfigurasi di atas lalu klik Rancang Pertanyaan AI ✨</span>
          </div>

          <!-- Reel Slot Machine -->
          <div class="reel-slot-wrapper">
            <div class="reel-spinner-window">
              <div class="reel-row reel-row-faded">{{ reelAboveText }}</div>
              <div class="reel-row reel-row-center">
                <span style="font-size:11px; font-weight:800; color:var(--color-terracotta); text-transform:uppercase; letter-spacing:1.5px; display:block; margin-bottom:6px;">
                  {{ isSpinning ? '🎰 SPINNING WHEEL...' : '🎯 PERTANYAAN PILIHAN' }}
                </span>
                <span style="font-size:16.5px; display:block;">{{ reelCenterText }}</span>
              </div>
              <div class="reel-row reel-row-faded">{{ reelBelowText }}</div>
            </div>
            <div class="lever-widget">
              <div class="lever-tip-text">pull lever<br>↓</div>
              <div class="lever-track-container">
                <div class="lever-track-slot">
                  <div class="lever-rod-shaft" :style="{ height: (30 + leverTopValue) + 'px' }"></div>
                  <div class="lever-handle-knob" :style="{ top: leverTopValue + 'px' }" @mousedown="pullLever" @touchstart.prevent="pullLever"></div>
                  <div class="lever-base-indicator"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Spin Buttons -->
          <div class="ip-spin-btns">
            <button class="spin-btn-teal" @click="spinRollOnce" :disabled="isSpinning" style="display:inline-flex; align-items:center; justify-content:center; gap:6px;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
              Spin!
            </button>
            <button v-if="chosenAfterLever && selectedQ" class="ip-reset-btn" @click="resetToReSpin">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
              Reset Pilihan
            </button>
          </div>

          <!-- Practice Workspace -->
          <div v-if="chosenAfterLever && selectedQ" class="interview-workspace animate-fade-in">

            <!-- Question Display -->
            <div class="question-display">
              <span style="font-size:11px; font-weight:800; color:var(--color-terracotta); text-transform:uppercase; letter-spacing:1px;">Ready Practice Bench</span>
              <h3 style="font-size:18px; font-weight:800; margin-top:6px; color:var(--color-forest,#1C3B34); line-height:1.45;">{{ selectedQ.text }}</h3>
              <div style="margin-top:10px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span style="font-size:12px; font-weight:700; color:var(--text-muted); display:inline-flex; align-items:center; gap:4px;">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                  Kategori:
                </span>
                <span class="framework-step-pill" style="display:inline-block; margin:0;">{{ selectedQ.category }}</span>
                <span v-if="selectedQ.framework" style="display:inline-flex; align-items:center; gap:4px; background:#FAF0EC; border:1px solid rgba(214,123,82,0.3); padding:2px 10px; border-radius:20px; font-size:11px; font-weight:800; color:var(--color-terracotta);">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28Z"></path></svg>
                  Framework: {{ selectedQ.framework }}
                </span>
              </div>
            </div>

            <!-- Voice Recorder -->
            <div class="practice-controls">
              <div class="recording-status" v-if="isRecording"><span class="status-dot"></span> Perekaman Aktif...</div>
              <div class="recording-status" style="color:var(--text-muted); font-size:14px; font-family:'Outfit',sans-serif; font-weight:700; display:inline-flex; align-items:center; gap:6px;" v-else>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--color-forest,#1C3B34);"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                Mikrofon Siaga
              </div>
              <div class="audio-record-timeline text-mono" style="font-size:32px; letter-spacing:-1px; margin:8px 0; color:var(--color-forest,#1C3B34);">{{ formattedTime }}</div>
              <div class="record-btn-group">
                <button v-if="!isRecording" class="btn btn-primary" @click="startRecording" style="font-weight:800; padding:12px 28px; background:var(--color-terracotta); border-color:var(--color-terracotta); display:inline-flex; align-items:center; justify-content:center; gap:6px;">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                  Mulai Merekam
                </button>
                <button v-else class="btn btn-secondary" @click="stopRecording" style="font-weight:800; padding:12px 28px; background:#DC3545; color:#FFF; border-color:#DC3545; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#FFF" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect></svg>
                  Selesai Merekam
                </button>
              </div>
              <div v-if="practiceRuns.length > 0" class="audio-list">
                <h4 style="font-size:13px; color:var(--text-muted); margin-bottom:8px; font-weight:700;">Rekaman Jawaban</h4>
                <div v-for="(run, idx) in practiceRuns" :key="idx" class="audio-item" style="background:var(--bg-card,#fff); border:1.5px solid var(--color-sand); border-radius:12px; padding:10px 14px;">
                  <span class="text-mono" style="font-size:12px; font-weight:bold; color:var(--color-forest,#1C3B34);">Run #{{ idx + 1 }} ({{ run.duration }}s)</span>
                  <audio :src="run.audioUrl" controls style="height:32px;"></audio>
                  <button class="card-nav-btn" @click="deleteRecording(idx)" style="background:var(--bg-cream); border:1px solid var(--color-sand); width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center;">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Notes + Hint -->
            <div class="drawer-section" style="margin-bottom:0; background:var(--bg-card,#fff); border:1.5px solid var(--color-sand); border-radius:16px; padding:20px;">
              <h4 style="font-size:15px; margin-bottom:12px; font-weight:800; color:var(--color-forest,#1C3B34);">Poin Kunci &amp; Kerangka Jawaban</h4>
              <div style="background:var(--bg-cream); padding:14px; border-left:4px solid var(--color-terracotta); border-radius:8px; margin-bottom:16px; font-size:13px; line-height:1.55; color:var(--text-muted); display:flex; align-items:flex-start; gap:8px;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--color-terracotta); flex-shrink:0; margin-top:2px;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                <span><strong>Petunjuk Jawaban:</strong> {{ selectedQ.hints }}</span>
              </div>
              <textarea class="form-input" v-model="savedNotes[selectedQ.id]" rows="6"
                        placeholder="Rancang draf jawaban terbaikmu (STAR/PREP/PPF). Otomatis tersimpan di browser..."
                        style="border:1.5px solid var(--color-sand); border-radius:10px; font-size:13.5px;"
                        @input="saveNotes"></textarea>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="simulator-locked-placeholder animate-fade-in">
            <div class="ip-empty-icon">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--color-sand);"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            </div>
            <h3 style="font-weight:800; color:var(--color-forest,#1C3B34); margin:0 0 8px 0; font-size:18px;">Simulator Belum Aktif</h3>
            <p style="color:var(--text-muted); font-size:13.5px; max-width:440px; margin:0 auto 20px auto; line-height:1.6;">
              <template v-if="activeMode==='manual'">Sesuaikan kategori pertanyaan lalu klik <strong style="color:var(--color-terracotta);">"Spin!"</strong> atau tarik Tuas untuk mengacak pertanyaan.</template>
              <template v-else-if="aiQuestionBank.length === 0">Isi konfigurasi AI di atas, lalu klik <strong style="color:var(--color-terracotta);">"Rancang Pertanyaan AI ✨"</strong> untuk mengisi bank soal, kemudian klik Spin!</template>
              <template v-else>Bank soal AI siap! Klik <strong style="color:var(--color-terracotta);">"Spin!"</strong> atau tarik Tuas untuk mulai latihan.</template>
            </p>
            <div class="ip-empty-tip">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--color-terracotta);"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
              <span>{{ activeMode==='manual' ? 'Tips: Gunakan Kelola Soal untuk menambah pertanyaan baru!' : 'Tips: Mode AI — bank soal diisi otomatis dari Gemini!' }}</span>
            </div>
          </div>

        </div><!-- end ip-content-col -->
      </div><!-- end ip-main-grid -->
    </div>
  `,
  data() {
    return {
      // ── Mode ──
      activeMode: 'manual', // 'manual' | 'ai'

      // ── Manual mode ──
      questions: [
        { id: 1, category: 'General HR', text: 'Ceritakan tentang diri Anda dan latar belakang keahlian Anda.', hints: 'Fokuskan perkenalan maksimal 2 menit. Gunakan formula Present-Past-Future (posisi saat ini, soroti 2 pencapaian masa lalu, dan kenapa Anda bersemangat untuk peran ini).', framework: 'PPF' },
        { id: 2, category: 'Technical Speciality', text: 'Bagaimana cara Anda menjelaskan konsep Virtual DOM di Vue/React kepada prospek bisnis?', hints: 'Gunakan analogi sederhana. Coba gambarkan Virtual DOM sebagai cetak biru bangunan, dan Real DOM sebagai bangunan fisik asli.', framework: 'PREP' },
        { id: 3, category: 'General Technical', text: 'Bisa deskripsikan kendala teknis tersulit yang pernah Anda selesaikan di project sebelumnya?', hints: 'Gunakan metode STAR (Situation, Task, Action, Result). Pastikan terdapat besaran angka terukur di bagian Result.', framework: 'STAR' },
        { id: 4, category: 'Performance Tuning', text: 'Apa pendekatan andalan Anda saat mengoptimasi loading aplikasi web yang lambat?', hints: 'Lakukan audit performa (Lighthouse, DevTools), kompresi aset gambar, analisis bundle size, aktifkan lazy loading router.', framework: 'PREP' },
        { id: 5, category: 'Behavioral & Teamwork', text: 'Bagaimana tindakan Anda ketika ada perbedaan keputusan arsitektur di dalam tim?', hints: 'Garis bawahi pentingnya komunikasi objektif berbasis data performa/user, dengarkan semua opini tim, lalu cari kesepakatan konsensus.', framework: 'STAR' }
      ],
      selectedQ: null,

      // ── AI mode ──
      aiTargetPosition: '',
      aiQuestionType: 'General HR',
      aiQuestionBank: [],      // bank soal sementara sesi AI
      isGeneratingAi: false,
      aiQuestionsError: '',

      // ── Recording ──
      isRecording: false,
      recordingTimer: null,
      recordingSeconds: 0,
      mediaRecorder: null,
      audioChunks: [],
      recordingsDb: {},
      savedNotes: {},

      // ── Reel spinner ──
      selectedCategory: 'All Categories',
      showCategoryDropdown: false,
      isSpinning: false,
      leverTopValue: 8,
      chosenAfterLever: false,
      reelAboveText: 'Selesai Wawancara Kerja',
      reelCenterText: 'Tarik tuas disamping atau tekan Spin!',
      reelBelowText: 'Persiapkan karir gemilang Anda',

      // ── Manage panel ──
      showManagePanel: false,
      formCategory: 'General HR',
      formText: '',
      formHints: '',
      formFramework: 'STAR',
      editingId: null,
      quickCustomQuestionText: '',

      // ── Frameworks ──
      activeFramework: null,   // null | 'STAR' | 'PREP' | 'PPF'
      expandedFrameworks: { star: true, prep: false, ppf: false }
    };
  },
  computed: {
    formattedTime() {
      const mm = String(Math.floor(this.recordingSeconds / 60)).padStart(2, '0');
      const ss = String(this.recordingSeconds % 60).padStart(2, '0');
      return `${mm}:${ss}`;
    },
    practiceRuns() {
      if (!this.selectedQ) return [];
      return this.recordingsDb[this.selectedQ.id] || [];
    },
    activeQuestionBank() {
      // returns the right pool depending on mode
      if (this.activeMode === 'ai') return this.aiQuestionBank;
      if (this.selectedCategory === 'All Categories') return this.questions;
      return this.questions.filter(q => q.category === this.selectedCategory);
    }
  },
  async created() {
    // ✅ FIX: Tunggu Supabase storage siap sebelum baca data
    await globalThis._workspaceStorageReady;

    const savedQ = WorkspaceStorage.getItem('personal_workspace_interview_questions');
    if (savedQ) this.questions = JSON.parse(savedQ);
    else WorkspaceStorage.setItem('personal_workspace_interview_questions', JSON.stringify(this.questions));
    const savedN = WorkspaceStorage.getItem('personal_workspace_interview_notes');
    if (savedN) this.savedNotes = JSON.parse(savedN);
  },
  methods: {
    // ── Mode ──
    setMode(mode) {
      this.activeMode = mode;
      this.resetToReSpin();
      this.showManagePanel = false;
    },

    // ── Category (manual) ──
    toggleCategoryDropdown() { this.showCategoryDropdown = !this.showCategoryDropdown; },
    selectCategory(cat) { this.selectedCategory = cat; this.showCategoryDropdown = false; this.resetToReSpin(); },
    toggleManagePanel() { if (this.activeMode === 'ai') return; this.showManagePanel = !this.showManagePanel; this.cancelEdit(); },

    // ── Reset ──
    resetToReSpin() {
      this.selectedQ = null;
      this.chosenAfterLever = false;
      this.activeFramework = null;
      this.reelAboveText = 'Menunggu acakan tuas';
      this.reelCenterText = 'Tarik tuas disamping atau tekan Spin!';
      this.reelBelowText = 'Persiapan matang kunci sukses';
      if (this.isRecording) this.stopRecording();
    },
    resetAiTopic() {
      this.aiTargetPosition = '';
      this.aiQuestionType = 'General HR';
      this.aiQuestionBank = [];
      this.aiQuestionsError = '';
      this.resetToReSpin();
    },

    // ── Sounds ──
    playTickSound() {
      try {
        const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(320 + Math.random() * 80, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.06, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.05);
      } catch (_e) { /* ignore */ }
    },
    playWinSound() {
      try {
        const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.type = 'sine'; osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
          osc.connect(gain); gain.connect(ctx.destination); osc.start(ctx.currentTime + idx * 0.08); osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
        });
      } catch (_e) { /* ignore */ }
    },

    // ── Lever & Spin ──
    pullLever() {
      if (this.isSpinning) return;
      this.leverTopValue = 85; this.playTickSound();
      setTimeout(() => { this.leverTopValue = 8; this.startReelSpin(); }, 250);
    },
    spinRollOnce() { if (this.isSpinning) return; this.startReelSpin(); },
    startReelSpin() {
      const pool = this.activeQuestionBank;
      if (!pool || pool.length === 0) {
        alert(this.activeMode === 'ai' ? 'Bank soal AI kosong! Silakan klik "Rancang Pertanyaan AI ✨" terlebih dahulu.' : 'Tidak ada pertanyaan dalam kategori ini!');
        return;
      }
      this.isSpinning = true; this.chosenAfterLever = false; this.selectedQ = null; this.activeFramework = null;
      if (this.isRecording) this.stopRecording();
      let cycles = 0; const total = 16;
      const iv = setInterval(() => {
        cycles++; this.playTickSound();
        const i = Math.floor(Math.random() * pool.length);
        this.reelCenterText = pool[i].text;
        this.reelAboveText = pool[(i - 1 + pool.length) % pool.length].text;
        this.reelBelowText = pool[(i + 1) % pool.length].text;
        if (cycles >= total) { clearInterval(iv); this.finalizeLand(); }
      }, 80);
    },
    finalizeLand() {
      const pool = this.activeQuestionBank;
      const i = Math.floor(Math.random() * pool.length);
      const landed = pool[i];
      this.selectedQ = landed;
      this.reelCenterText = landed.text;
      this.reelAboveText = pool[(i - 1 + pool.length) % pool.length].text;
      this.reelBelowText = pool[(i + 1) % pool.length].text;
      this.isSpinning = false; this.chosenAfterLever = true;
      // Dynamic framework link
      if (landed.framework) {
        const fw = landed.framework.toUpperCase();
        if (fw === 'STAR') { this.activeFramework = 'STAR'; this.expandedFrameworks.star = true; }
        else if (fw === 'PREP') { this.activeFramework = 'PREP'; this.expandedFrameworks.prep = true; }
        else if (fw === 'PPF') { this.activeFramework = 'PPF'; this.expandedFrameworks.ppf = true; }
      }
      this.playWinSound();
    },

    // ── CRUD ──
    saveQuestionsToLocalStorage() { WorkspaceStorage.setItem('personal_workspace_interview_questions', JSON.stringify(this.questions)); },
    saveCustomQuestion() {
      if (!this.formText.trim()) { alert('Teks pertanyaan tidak boleh kosong!'); return; }
      if (this.editingId !== null) {
        const idx = this.questions.findIndex(q => q.id === this.editingId);
        if (idx !== -1) { this.questions[idx].category = this.formCategory; this.questions[idx].text = this.formText.trim(); this.questions[idx].hints = this.formHints.trim() || 'Fokuskan penyampaian dengan kerangka berpikir rasional.'; this.questions[idx].framework = this.formFramework || null; }
        this.editingId = null;
      } else {
        this.questions.push({ id: Date.now(), category: this.formCategory, text: this.formText.trim(), hints: this.formHints.trim() || 'Fokuskan penyampaian dengan kerangka berpikir rasional.', framework: this.formFramework || null });
      }
      this.saveQuestionsToLocalStorage(); this.formText = ''; this.formHints = ''; this.formFramework = 'STAR';
      alert('Pertanyaan berhasil disimpan!');
    },
    startEdit(q) { this.editingId = q.id; this.formCategory = q.category; this.formText = q.text; this.formHints = q.hints; this.formFramework = q.framework || ''; globalThis.scrollTo({ top: 300, behavior: 'smooth' }); },
    cancelEdit() { this.editingId = null; this.formText = ''; this.formHints = ''; this.formFramework = 'STAR'; },
    deleteCustomQuestion(id) {
      if (confirm('Hapus pertanyaan ini?')) { this.questions = this.questions.filter(q => q.id !== id); this.saveQuestionsToLocalStorage(); this.resetToReSpin(); }
    },
    resetDefaultQuestions() {
      if (confirm('Kembalikan ke pertanyaan default? Semua pertanyaan kustom akan dihapus.')) {
        this.questions = [
          { id: 1, category: 'General HR', text: 'Ceritakan tentang diri Anda dan latar belakang keahlian Anda.', hints: 'Gunakan formula Present-Past-Future.', framework: 'PPF' },
          { id: 2, category: 'Technical Speciality', text: 'Bagaimana cara Anda menjelaskan konsep Virtual DOM kepada prospek bisnis?', hints: 'Gunakan analogi sederhana.', framework: 'PREP' },
          { id: 3, category: 'General Technical', text: 'Bisa deskripsikan kendala teknis tersulit yang pernah Anda selesaikan?', hints: 'Gunakan metode STAR dengan angka terukur.', framework: 'STAR' },
          { id: 4, category: 'Performance Tuning', text: 'Apa pendekatan andalan Anda saat mengoptimasi loading aplikasi web yang lambat?', hints: 'Audit performa, kompresi aset, lazy loading.', framework: 'PREP' },
          { id: 5, category: 'Behavioral & Teamwork', text: 'Bagaimana tindakan Anda ketika ada perbedaan keputusan arsitektur di tim?', hints: 'Komunikasi objektif berbasis data, cari konsensus.', framework: 'STAR' }
        ];
        this.saveQuestionsToLocalStorage(); this.resetToReSpin();
      }
    },

    // ── Practice helpers ──
    practiceThisQuestion(aq) {
      this.selectedQ = { id: Date.now() + Math.random(), category: aq.category || 'AI', text: aq.text, hints: aq.hints, framework: aq.framework || null };
      this.chosenAfterLever = true; this.showManagePanel = false;
      if (this.selectedQ.framework) {
        const fw = this.selectedQ.framework.toUpperCase();
        this.activeFramework = fw;
        if (fw === 'STAR') this.expandedFrameworks.star = true;
        else if (fw === 'PREP') this.expandedFrameworks.prep = true;
        else if (fw === 'PPF') this.expandedFrameworks.ppf = true;
      }
      this.playWinSound();
    },
    practiceQuickCustom() {
      if (!this.quickCustomQuestionText.trim()) { alert('Silakan isi teks pertanyaan!'); return; }
      this.selectedQ = { id: Date.now(), category: 'Kustom', text: this.quickCustomQuestionText.trim(), hints: 'Gunakan kerangka STAR atau PREP/PPF untuk menjawab pertanyaan ini.', framework: null };
      this.chosenAfterLever = true; this.showManagePanel = false; this.quickCustomQuestionText = ''; this.playWinSound();
    },

    // ── Recording ──
    async startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioChunks = []; this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) this.audioChunks.push(e.data); };
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.audioChunks, { type: 'audio/wav' });
          if (!this.recordingsDb[this.selectedQ.id]) this.recordingsDb[this.selectedQ.id] = [];
          this.recordingsDb[this.selectedQ.id].push({ audioUrl: URL.createObjectURL(blob), duration: this.recordingSeconds });
          this.recordingSeconds = 0;
        };
        this.isRecording = true; this.mediaRecorder.start(); this.recordingSeconds = 0;
        this.recordingTimer = setInterval(() => { this.recordingSeconds++; }, 1000);
      } catch (err) { alert('Gagal mengakses mikrofon. Pastikan izin mikrofon disetujui!'); }
    },
    stopRecording() {
      if (this.mediaRecorder && this.isRecording) { this.mediaRecorder.stop(); this.mediaRecorder.stream.getTracks().forEach(t => t.stop()); this.isRecording = false; clearInterval(this.recordingTimer); }
    },
    deleteRecording(idx) { if (this.recordingsDb[this.selectedQ.id]) this.recordingsDb[this.selectedQ.id].splice(idx, 1); },
    saveNotes() { WorkspaceStorage.setItem('personal_workspace_interview_notes', JSON.stringify(this.savedNotes)); },

    // ── AI Generate ──
    async generateQuestionsFromAI() {
      const pos = this.aiTargetPosition.trim();
      if (!pos) { alert('Silakan isi Target Posisi terlebih dahulu!'); return; }
      if (!this.aiQuestionType) { alert('Pilih Tipe Pertanyaan terlebih dahulu!'); return; }
      this.isGeneratingAi = true; this.aiQuestionsError = ''; this.aiQuestionBank = [];

      try {
        const res = await fetch('/api/interview/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position: pos, type: this.aiQuestionType })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Server error: ' + res.status);
        }
        const data = await res.json();
        const questions = data.questions || data;
        if (!Array.isArray(questions) || questions.length === 0) throw new Error('Format response AI tidak valid.');
        this.aiQuestionBank = questions.map((q, i) => ({
          id: 'ai_' + Date.now() + '_' + i,
          text: q.text || '',
          category: q.category || pos,
          hints: q.hints || 'Gunakan framework yang direkomendasikan untuk menjawab.',
          framework: (q.framework || 'STAR').toUpperCase()
        }));
      } catch (err) {
        this.aiQuestionsError = 'Gagal menghasilkan pertanyaan: ' + err.message;
      } finally {
        this.isGeneratingAi = false;
      }
    }
  }
};


// 5. Daily Nutrition & Insights Component
const DailyNutrition = {
  template: `
    <div class="daily-nutrition">
      <!-- HEADER -->
      <div class="flex-between" style="border-bottom: 2px solid var(--color-sand); padding-bottom: 16px; margin-bottom: 24px; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 800; color: var(--text-dark); margin: 0 0 4px 0;">Daily Nutrition & Mind Insights</h2>
          <p style="color: var(--text-muted); font-size: 13.5px; margin-top: 4px; max-width: 600px; line-height: 1.6;">
            Nutrisi harian bagi kecerdasan pikiran. Jaga konsistensi belajar dengan mendelegasikan ringkasan konsep, intisari keilmuan, dan kilatan ide kreatif dalam satu timeline teratur.
          </p>
        </div>
        <button class="btn btn-primary" @click="showAddLog = true" style="flex-shrink: 0; display: inline-flex; align-items: center; gap: 7px;">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Tambah Insight
        </button>
      </div>

      <!-- FLOATING POPUP MODAL: FORM TAMBAH / EDIT INSIGHT -->
      <transition name="insight-modal-fade">
        <div v-if="showAddLog"
          style="position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; background: rgba(30,22,16,0.45); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); padding: 16px;"
          @click.self="safeCloseEditInsight">
          <div style="background: var(--color-paper, #FAF7F2); width: min(820px, 96vw); max-height: 94vh; border-radius: 20px; box-shadow: 0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12); display: flex; flex-direction: column; overflow: hidden; animation: insightPopIn 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275);">

            <!-- Modal Header -->
            <div style="display: flex; align-items: center; gap: 12px; padding: 18px 24px 15px; background: var(--color-terracotta, #D67B52); color: #fff; flex-shrink: 0;">
              <div style="width: 38px; height: 38px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 15px; font-weight: 800; letter-spacing: 0.2px;">{{ editingInsightId ? 'Edit Insight' : 'Catat Pembelajaran / Insight Baru' }}</div>
                <div style="font-size: 11.5px; opacity: 0.82; margin-top: 1px;">Nutrisi pikiran harianmu ✦</div>
              </div>
              <button @click="cancelEditInsight"
                style="background: rgba(255,255,255,0.18); border: none; border-radius: 10px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-size: 17px; flex-shrink: 0; transition: background 0.15s;"
                onmouseover="this.style.background='rgba(255,255,255,0.32)'" onmouseout="this.style.background='rgba(255,255,255,0.18)'">✕</button>
            </div>

            <!-- Modal Body (scrollable) -->
            <div style="overflow-y: auto; padding: 22px 26px 4px; flex: 1;">
              <form @submit.prevent="saveInsight" id="insight-popup-form">

                <!-- ROW 1: Tanggal + Sumber (2 cols) -->
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px; margin-bottom: 12px;">
                  <div class="form-group" style="margin: 0;">
                    <label style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: block;">Tanggal</label>
                    <input type="date" class="form-input" v-model="form.date" required style="height: 40px;" />
                  </div>
                  <div class="form-group" style="margin: 0;">
                    <label style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: block;">Sumber / Source</label>
                    <input type="text" class="form-input" v-model="form.source" placeholder="cth., Buku, Artikel, Podcast, YouTube..." style="height: 40px;" />
                  </div>
                </div>

                <!-- ROW 1b: Link URL -->
                <div class="form-group" style="margin-bottom: 12px;">
                  <label style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: block;">Link URL Sumber <span style="font-weight: 400; font-style: italic; text-transform: none; letter-spacing: 0;">(opsional — bisa dibuka langsung dari card)</span></label>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="position: relative; flex: 1;">
                      <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      </span>
                      <input type="url" class="form-input" v-model="form.url" placeholder="https://..." style="height: 40px; padding-left: 34px;" />
                    </div>
                    <a v-if="form.url && form.url.startsWith('http')" :href="form.url" target="_blank" rel="noopener"
                       style="height: 40px; padding: 0 14px; background: var(--color-terracotta,#D67B52); color: #fff; border-radius: 8px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; text-decoration: none; flex-shrink: 0;">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Buka
                    </a>
                  </div>
                </div>

                <!-- ROW 2: Kategori + tombol kelola -->
                <div class="form-group" style="margin-bottom: 12px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <label style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin: 0;">Topik / Kategori</label>
                    <button type="button" @click="showCatManager = !showCatManager"
                      style="background: none; border: none; cursor: pointer; font-size: 11.5px; font-weight: 600; color: var(--color-terracotta); display: inline-flex; align-items: center; gap: 4px; padding: 0;"
                      title="Kelola kategori">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                      Kelola Kategori
                    </button>
                  </div>
                  <select class="form-input" v-model="form.category" required style="width: 100%; height: 40px;">
                    <option v-for="cat in allInsightCategories" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                </div>

                <!-- Mini category manager -->
                <div v-if="showCatManager" style="margin-bottom: 14px; background: #FDFBF7; border: 1.5px solid var(--color-sand); border-radius: 10px; padding: 12px; animation: popIn 0.15s ease;">
                  <p style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em;">Kelola Kategori Insight</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;">
                    <span v-for="cat in customInsightCategories" :key="cat"
                      style="background: var(--bg-cream); border: 1.5px solid var(--color-sand); border-radius: 20px; padding: 3px 10px; font-size: 12px; display: inline-flex; align-items: center; gap: 5px; color: var(--text-dark);">
                      {{ cat }}
                      <button type="button" @click="deleteInsightCategory(cat)"
                        style="background: none; border: none; cursor: pointer; font-size: 13px; line-height: 1; color: var(--color-rose); padding: 0;">✕</button>
                    </span>
                    <span v-if="customInsightCategories.length === 0" style="font-size: 12px; color: var(--text-muted); font-style: italic;">Belum ada kategori kustom</span>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <input type="text" class="form-input" v-model="newInsightCatInput" placeholder="Nama kategori baru..."
                      @keydown.enter.prevent="addInsightCategory" style="flex: 1; height: 36px; font-size: 13px;" />
                    <button type="button" @click="addInsightCategory"
                      style="background: var(--color-terracotta); color: #fff; border: none; border-radius: 8px; padding: 0 14px; height: 36px; cursor: pointer; font-size: 13px; font-weight: 600; flex-shrink: 0;">Tambah</button>
                  </div>
                </div>

                <!-- Judul -->
                <div class="form-group" style="margin-bottom: 14px;">
                  <label style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: block;">Intisari Pemikiran / Judul</label>
                  <input type="text" class="form-input" v-model="form.title" placeholder="cth., Strategi Desain Nol-Warna Biru" required style="height: 40px;" />
                </div>

                <!-- RANGKUMAN DETAIL — Rich Text Editor -->
                <div class="form-group" style="margin-bottom: 14px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px; flex-wrap: wrap;">
                    <label style="margin: 0; font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Rangkuman Detail (Konsep)</label>
                    <span style="font-size: 11px; color: var(--text-muted); font-style: italic;">Format teks bebas, bullet, heading tersedia di toolbar</span>
                  </div>
                  <!-- Rich Text Toolbar -->
                  <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 7px 10px; background: #F5F0EB; border: 1.5px solid var(--color-sand); border-bottom: none; border-radius: 10px 10px 0 0; align-items: center;">
                    <button type="button" @click="rtExec('bold')" title="Bold (Ctrl+B)"
                      style="width:30px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; color:var(--text-dark); font-family:serif; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'"><b>B</b></button>
                    <button type="button" @click="rtExec('italic')" title="Italic (Ctrl+I)"
                      style="width:30px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; color:var(--text-dark); font-family:serif; font-style:italic; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'"><i>I</i></button>
                    <button type="button" @click="rtExec('underline')" title="Underline (Ctrl+U)"
                      style="width:30px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px; color:var(--text-dark); text-decoration:underline; font-family:serif; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'"><u>U</u></button>
                    <button type="button" @click="rtExec('strikeThrough')" title="Strikethrough"
                      style="width:30px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px; color:var(--text-dark); font-family:serif; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'"><s>S</s></button>
                    <div style="width:1px; height:20px; background:var(--color-sand); margin:0 3px; flex-shrink:0;"></div>
                    <button type="button" @click="rtExec('insertUnorderedList')" title="Bullet List"
                      style="width:30px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:15px; color:var(--text-dark); transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.3"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
                    </button>
                    <button type="button" @click="rtExec('insertOrderedList')" title="Numbered List"
                      style="width:30px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:15px; color:var(--text-dark); transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.3"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 10h2" stroke-linecap="round"/><path d="M4 14c0-1 2-1 2-2s-2-1-2 0" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 18h2l-2 2h2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div style="width:1px; height:20px; background:var(--color-sand); margin:0 3px; flex-shrink:0;"></div>
                    <button type="button" @click="rtExec('formatBlock','h3')" title="Heading"
                      style="height:28px; padding:0 8px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; font-size:11px; font-weight:800; color:var(--text-dark); white-space:nowrap; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">H3</button>
                    <button type="button" @click="rtExec('formatBlock','p')" title="Paragraf normal"
                      style="height:28px; padding:0 8px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; font-size:11px; font-weight:600; color:var(--text-muted); white-space:nowrap; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">¶</button>
                    <div style="width:1px; height:20px; background:var(--color-sand); margin:0 3px; flex-shrink:0;"></div>
                    <!-- Highlight color -->
                    <button type="button" @click="rtExec('hiliteColor','#FEF9C3')" title="Highlight Kuning"
                      style="width:28px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
                      <span style="font-size:12px; font-weight:800; color:#854D0E; background:#FEF9C3; padding:1px 4px; border-radius:3px;">A</span>
                    </button>
                    <button type="button" @click="rtExec('hiliteColor','#FCE7F3')" title="Highlight Pink"
                      style="width:28px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
                      <span style="font-size:12px; font-weight:800; color:#9D174D; background:#FCE7F3; padding:1px 4px; border-radius:3px;">A</span>
                    </button>
                    <button type="button" @click="rtExec('hiliteColor','#D1FAE5')" title="Highlight Hijau"
                      style="width:28px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
                      <span style="font-size:12px; font-weight:800; color:#065F46; background:#D1FAE5; padding:1px 4px; border-radius:3px;">A</span>
                    </button>
                    <button type="button" @click="rtExec('hiliteColor','transparent')" title="Hapus Highlight"
                      style="width:28px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <!-- ContentEditable Editor Area -->
                  <div
                    ref="detailsEditor"
                    contenteditable="true"
                    @input="onDetailsInput"
                    @paste="onDetailsPaste"
                    style="width: 100%; min-height: 220px; max-height: 400px; overflow-y: auto; padding: 14px 16px; border: 1.5px solid var(--color-sand); border-top: none; border-radius: 0 0 10px 10px; background: #fff; font-size: 14px; color: var(--text-dark); line-height: 1.7; outline: none; resize: vertical; box-sizing: border-box; font-family: inherit; white-space: pre-wrap;"
                    :style="{ minHeight: '220px' }"
                    data-placeholder="Sederhanakan pemahaman materi tersebut dengan kalimatmu sendiri... Bisa pakai Enter untuk paragraf baru, bullet list, heading, bold, dll."
                  ></div>
                  <p v-if="!form.details" style="font-size: 11px; color: #EF4444; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Rangkuman detail wajib diisi
                  </p>
                </div>

                <!-- Takeaway -->
                <!-- TAKEAWAY — Rich Text Editor -->
                <div class="form-group" style="margin-bottom: 10px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px; flex-wrap: wrap;">
                    <label style="margin: 0; font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Poin Keberlanjutan / Takeaway Utama</label>
                    <span style="font-size: 11px; color: var(--text-muted); font-style: italic;">Ringkas & actionable</span>
                  </div>
                  <!-- Toolbar Takeaway -->
                  <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 7px 10px; background: #F5F0EB; border: 1.5px solid var(--color-sand); border-bottom: none; border-radius: 10px 10px 0 0; align-items: center;">
                    <button type="button" @click="rtExecTw('bold')" title="Bold"
                      style="width:30px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; color:var(--text-dark); font-family:serif; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'"><b>B</b></button>
                    <button type="button" @click="rtExecTw('italic')" title="Italic"
                      style="width:30px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; color:var(--text-dark); font-family:serif; font-style:italic; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'"><i>I</i></button>
                    <button type="button" @click="rtExecTw('underline')" title="Underline"
                      style="width:30px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px; color:var(--text-dark); text-decoration:underline; font-family:serif; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'"><u>U</u></button>
                    <button type="button" @click="rtExecTw('strikeThrough')" title="Strikethrough"
                      style="width:30px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px; color:var(--text-dark); font-family:serif; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'"><s>S</s></button>
                    <div style="width:1px; height:20px; background:var(--color-sand); margin:0 3px;"></div>
                    <button type="button" @click="rtExecTw('insertUnorderedList')" title="Bullet List"
                      style="width:30px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.3"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
                    </button>
                    <div style="width:1px; height:20px; background:var(--color-sand); margin:0 3px;"></div>
                    <button type="button" @click="rtExecTw('hiliteColor','#FEF9C3')" title="Highlight Kuning"
                      style="width:28px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
                      <span style="font-size:12px; font-weight:800; color:#854D0E; background:#FEF9C3; padding:1px 4px; border-radius:3px;">A</span>
                    </button>
                    <button type="button" @click="rtExecTw('hiliteColor','#FCE7F3')" title="Highlight Pink"
                      style="width:28px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
                      <span style="font-size:12px; font-weight:800; color:#9D174D; background:#FCE7F3; padding:1px 4px; border-radius:3px;">A</span>
                    </button>
                    <button type="button" @click="rtExecTw('hiliteColor','#D1FAE5')" title="Highlight Hijau"
                      style="width:28px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
                      <span style="font-size:12px; font-weight:800; color:#065F46; background:#D1FAE5; padding:1px 4px; border-radius:3px;">A</span>
                    </button>
                    <button type="button" @click="rtExecTw('hiliteColor','transparent')" title="Hapus Highlight"
                      style="width:28px; height:28px; border:1.5px solid transparent; border-radius:6px; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.12s;"
                      onmouseover="this.style.background='#EDE6DE';this.style.borderColor='var(--color-sand)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <!-- ContentEditable Takeaway -->
                  <div
                    ref="takeawayEditor"
                    contenteditable="true"
                    @input="onTakeawayInput"
                    @paste="onTakeawayPaste"
                    style="width: 100%; min-height: 80px; max-height: 200px; overflow-y: auto; padding: 12px 16px; border: 1.5px solid var(--color-sand); border-top: none; border-radius: 0 0 10px 10px; background: #fff; font-size: 14px; color: var(--text-dark); line-height: 1.7; outline: none; box-sizing: border-box; font-family: inherit; white-space: pre-wrap;"
                    data-placeholder="Garis besar actionable lesson, poin penting, atau hal yang ingin diingat..."
                  ></div>
                  <p v-if="!form.takeaway" style="font-size: 11px; color: #EF4444; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Takeaway wajib diisi
                  </p>
                </div>

              </form>
            </div>

            <!-- Modal Footer (sticky) -->
            <div style="display: flex; gap: 10px; padding: 14px 26px 18px; border-top: 1.5px solid var(--color-sand-light, #EDE8E1); flex-shrink: 0; background: var(--color-paper, #FAF7F2); align-items: center;">
              <span style="font-size: 11px; color: var(--text-muted); margin-right: auto; display: flex; align-items: center; gap: 5px;">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Klik di luar popup untuk menutup
              </span>
              <button type="button" @click="cancelEditInsight"
                style="padding: 10px 20px; background: transparent; border: 1.5px solid var(--color-sand); color: var(--text-secondary, #7A6F66); border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; white-space: nowrap;"
                onmouseover="this.style.background='var(--bg-cream)'" onmouseout="this.style.background='transparent'">Batal</button>
              <button type="button" @click="saveInsightFromModal"
                style="padding: 10px 28px; background: var(--color-terracotta, #D67B52); color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: background 0.18s, transform 0.12s; box-shadow: 0 4px 12px rgba(214,123,82,0.25); white-space: nowrap;"
                onmouseover="this.style.background='var(--color-terracotta-dark, #B8663F)'; this.style.transform='scale(1.02)'" onmouseout="this.style.background='var(--color-terracotta, #D67B52)'; this.style.transform='scale(1)'">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                {{ editingInsightId ? 'Simpan Perubahan' : 'Simpan Nutrisi Pikiran' }}
              </button>
            </div>

          </div>
        </div>
      </transition>

      <!-- FILTER BAR -->
      <div class="drawer-section" style="margin-bottom: 24px; padding: 18px 20px; background: var(--bg-cream); border: 1.5px solid var(--color-sand); border-radius: 12px;">
        <p style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          Filter & Pencarian
        </p>
        <div style="display: grid; grid-template-columns: 2fr 1fr 1.5fr 1fr; gap: 12px; align-items: end;">
          <!-- Search -->
          <div class="form-group" style="margin: 0;">
            <label style="font-size: 11.5px; font-weight: 600; color: var(--text-muted);">Kata Kunci</label>
            <input type="text" class="form-input" v-model="searchQuery" placeholder="Cari judul, rangkuman, takeaway..." style="height: 40px;" />
          </div>
          <!-- Category filter -->
          <div class="form-group" style="margin: 0;">
            <label style="font-size: 11.5px; font-weight: 600; color: var(--text-muted);">Kategori</label>
            <select class="form-input" v-model="filterCategory" style="height: 40px;">
              <option value="">Semua Kategori</option>
              <option v-for="cat in allInsightCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <!-- Date range -->
          <div class="form-group" style="margin: 0; position: relative;">
            <label style="font-size: 11.5px; font-weight: 600; color: var(--text-muted);">Rentang Tanggal</label>
            <button type="button" class="form-input" @click.stop="showDatePicker = !showDatePicker"
              style="width: 100%; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px; background: #fff; height: 40px; box-sizing: border-box; white-space: nowrap; overflow: hidden;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; color: var(--color-terracotta);"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span style="font-size: 12px; color: var(--text-dark); overflow: hidden; text-overflow: ellipsis;">
                <template v-if="filterStartDate || filterEndDate">
                  {{ filterStartDate || '?' }} – {{ filterEndDate || '?' }}
                </template>
                <template v-else><span style="color: var(--text-muted);">Pilih rentang...</span></template>
              </span>
            </button>
            <!-- Mini calendar dropdown -->
            <div v-if="showDatePicker" @click.stop style="position: absolute; top: calc(100% + 6px); left: 0; z-index: 999; background: #fff; border: 1.5px solid var(--color-sand); border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.13); padding: 16px; min-width: 270px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <button type="button" @click="calPrevMonth" style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 6px;">&lt;</button>
                <span style="font-weight: 700; font-size: 14px; color: var(--text-dark);">{{ calMonthLabel }}</span>
                <button type="button" @click="calNextMonth" style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 6px;">&gt;</button>
              </div>
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 4px;">
                <span v-for="(d,i) in ['S','S','R','K','J','S','M']" :key="'nh'+i" style="text-align:center;font-size:10px;font-weight:700;color:var(--text-muted);padding:2px 0;">{{d}}</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;">
                <span v-for="cell in calCells" :key="cell.key" @click="cell.date ? onCalClick(cell.date) : null"
                  :style="getCalCellStyle(cell)"
                  style="text-align:center;font-size:12px;padding:5px 2px;border-radius:6px;cursor:pointer;user-select:none;transition:background 0.1s;">
                  {{cell.label}}
                </span>
              </div>
              <div style="margin-top:8px;font-size:11px;color:var(--text-muted);text-align:center;">
                <span v-if="!filterStartDate">Klik tanggal mulai</span>
                <span v-else-if="!filterEndDate">Klik tanggal akhir</span>
                <span v-else style="color:var(--color-terracotta);font-weight:600;">✓ Rentang dipilih</span>
              </div>
              <button v-if="filterStartDate || filterEndDate" type="button" @click="filterStartDate='';filterEndDate='';showDatePicker=false;"
                style="margin-top:8px;width:100%;background:var(--bg-cream);border:1px solid var(--color-sand);color:var(--text-dark);border-radius:7px;padding:6px;font-size:12px;cursor:pointer;font-weight:600;">
                Hapus Rentang
              </button>
            </div>
          </div>
          <!-- Reset -->
          <div class="form-group" style="margin: 0;">
            <button class="btn btn-secondary" @click="resetFilters" style="width: 100%; height: 40px; cursor: pointer; justify-content: center;">Reset Filter</button>
          </div>
        </div>
      </div>

      <!-- STATS ROW -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
        <div class="drawer-section" style="margin: 0; padding: 16px 20px; text-align: center;">
          <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 6px;">Total Insight</p>
          <p class="text-mono" style="font-size: 28px; font-weight: 800; color: var(--text-dark);">{{ filteredInsights.length }}</p>
        </div>
        <div class="drawer-section" style="margin: 0; padding: 16px 20px; text-align: center;">
          <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 6px;">Kategori Aktif</p>
          <p class="text-mono" style="font-size: 28px; font-weight: 800; color: var(--color-sage);">{{ activeCategories.length }}</p>
        </div>
        <div class="drawer-section" style="margin: 0; padding: 16px 20px; text-align: center;">
          <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 6px;">Insight Terakhir</p>
          <p style="font-size: 13px; font-weight: 700; color: var(--color-terracotta); margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="latestInsightTitle">{{ latestInsightTitle }}</p>
        </div>
      </div>

      <!-- TIMELINE -->
      <div class="nutrition-container">
        <div v-if="filteredInsights.length === 0" style="padding: 60px 20px; text-align: center; color: var(--text-muted); background: var(--bg-cream); border-radius: 12px; border: 1.5px dashed var(--color-sand);">
          <p style="font-size: 32px; margin-bottom: 10px;">🧠</p>
          <p style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">Belum ada insight yang cocok</p>
          <p style="font-size: 12.5px;">Coba ubah filter atau tambah insight baru</p>
        </div>
        <div v-else class="timeline">
          <div v-for="(ins, idx) in filteredInsights" :key="ins.id || idx" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-date">{{ formatDate(ins.date) }}</div>
            <div class="timeline-card">

              <!-- Card Header: kategori + source + actions -->
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px; padding-bottom: 0;">
                <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-width: 0;">
                  <span class="timeline-category" :style="{ background: getCatColor(ins.category) + '18', color: getCatColor(ins.category), border: '1.5px solid ' + getCatColor(ins.category) + '40' }">
                    {{ ins.category }}
                  </span>
                  <span v-if="ins.source" style="background: var(--bg-cream); border: 1.5px solid var(--color-sand); color: var(--text-muted); border-radius: 20px; padding: 2px 9px; font-size: 10.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    {{ ins.source }}
                  </span>
                  <a v-if="ins.url && ins.url.startsWith('http')" :href="ins.url" target="_blank" rel="noopener"
                     style="background: rgba(214,123,82,0.1); border: 1.5px solid rgba(214,123,82,0.3); color: var(--color-terracotta,#D67B52); border-radius: 20px; padding: 2px 9px; font-size: 10.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; text-decoration: none; transition: background 0.15s;"
                     onmouseover="this.style.background='rgba(214,123,82,0.2)'" onmouseout="this.style.background='rgba(214,123,82,0.1)'">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Buka Link
                  </a>
                </div>
                <div style="display: inline-flex; gap: 5px; flex-shrink: 0; align-items: center;">
                  <button class="card-nav-btn" @click="viewInsightDetail(ins)" title="Buka detail lengkap"
                    style="background: #FFF4ED; border: 1.5px solid #F5C8A8; border-radius: 6px; padding: 5px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
                  </button>
                  <button class="card-nav-btn" @click="startEditInsight(idx)" title="Edit insight" style="background: #EFF6FF; border: 1.5px solid #93C5FD; border-radius: 6px; padding: 5px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="card-nav-btn" @click="deleteInsight(idx)" title="Hapus insight" style="background: #FEF2F2; border: 1.5px solid #FCA5A5; border-radius: 6px; padding: 5px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                  <button class="card-nav-btn" @click="toggleInsightExpand(ins.id || idx)" :title="expandedInsights.has(ins.id || idx) ? 'Sembunyikan detail' : 'Lihat detail'"
                    style="background: var(--bg-cream); border: 1.5px solid var(--color-sand); border-radius: 6px; padding: 5px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                    <svg :style="{ transform: expandedInsights.has(ins.id || idx) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }"
                      viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Judul selalu tampil -->
              <h3 class="timeline-title" style="font-size: 15.5px; font-weight: 800; color: var(--text-dark); margin: 0 0 10px 0; line-height: 1.4; padding: 0 0 10px 0;">{{ ins.title }}</h3>

              <!-- Collapsible body -->
              <div :style="{ maxHeight: expandedInsights.has(ins.id || idx) ? 'none' : '0px', overflow: 'hidden', transition: 'max-height 0.3s ease' }">
                <!-- Divider -->
                <div style="height: 1px; background: var(--color-sand); margin-bottom: 12px;"></div>

                <!-- Detail / rangkuman -->
                <div class="insight-rich-content" style="font-size: 13.5px; color: var(--text-dark); line-height: 1.75; margin-bottom: 14px;" v-html="ins.details"></div>

                <!-- Takeaway -->
                <div class="timeline-takeaway" style="display: flex; gap: 10px; align-items: flex-start;">
                  <span style="font-size: 16px; flex-shrink: 0; margin-top: 1px;">💡</span>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-sage); margin-bottom: 4px;">Takeaway</div>
                    <div style="font-size: 13px; color: var(--text-dark); line-height: 1.65;" v-html="ins.takeaway"></div>
                  </div>
                </div>
              </div>



            </div>
          </div>
        </div>
      </div>

      <!-- DETAIL INSIGHT POPUP (Card khusus, scrollable) -->
      <transition name="insight-modal-fade">
        <div v-if="viewingInsight"
          style="position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; background: rgba(30,22,16,0.45); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); padding: 16px;"
          @click.self="closeInsightDetail">
          <div style="background: var(--color-paper, #FAF7F2); width: min(720px, 96vw); max-height: 88vh; border-radius: 20px; box-shadow: 0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12); display: flex; flex-direction: column; overflow: hidden; animation: insightPopIn 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275);">

            <!-- Header -->
            <div style="display: flex; align-items: flex-start; gap: 12px; padding: 18px 24px; background: var(--color-terracotta, #D67B52); color: #fff; flex-shrink: 0;">
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px;">
                  <span style="background: rgba(255,255,255,0.2); border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 700;">{{ viewingInsight.category }}</span>
                  <span v-if="viewingInsight.source" style="background: rgba(255,255,255,0.15); border-radius: 20px; padding: 2px 10px; font-size: 10.5px; font-weight: 600;">{{ viewingInsight.source }}</span>
                  <span style="font-size: 11px; opacity: 0.85;">{{ formatDate(viewingInsight.date) }}</span>
                </div>
                <div style="font-size: 17px; font-weight: 800; line-height: 1.4;">{{ viewingInsight.title }}</div>
              </div>
              <button @click="closeInsightDetail"
                style="background: rgba(255,255,255,0.18); border: none; border-radius: 10px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-size: 17px; flex-shrink: 0; transition: background 0.15s;"
                onmouseover="this.style.background='rgba(255,255,255,0.32)'" onmouseout="this.style.background='rgba(255,255,255,0.18)'">✕</button>
            </div>

            <!-- Body (scrollable) -->
            <div style="overflow-y: auto; padding: 22px 26px; flex: 1;">
              <a v-if="viewingInsight.url && viewingInsight.url.startsWith('http')" :href="viewingInsight.url" target="_blank" rel="noopener"
                 style="display: inline-flex; align-items: center; gap: 6px; background: rgba(214,123,82,0.1); border: 1.5px solid rgba(214,123,82,0.3); color: var(--color-terracotta,#D67B52); border-radius: 20px; padding: 5px 12px; font-size: 12px; font-weight: 600; text-decoration: none; margin-bottom: 16px;">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Buka Link Sumber
              </a>
              <div class="insight-rich-content" style="font-size: 14px; color: var(--text-dark); line-height: 1.8; margin-bottom: 20px;" v-html="viewingInsight.details"></div>
              <div style="height: 1px; background: var(--color-sand); margin-bottom: 16px;"></div>
              <div style="display: flex; gap: 10px; align-items: flex-start; background: var(--bg-cream); border: 1.5px solid var(--color-sand); border-radius: 12px; padding: 14px 16px;">
                <span style="font-size: 18px; flex-shrink: 0; margin-top: 1px;">💡</span>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-sage); margin-bottom: 6px;">Takeaway</div>
                  <div style="font-size: 13.5px; color: var(--text-dark); line-height: 1.75;" v-html="viewingInsight.takeaway"></div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="display: flex; gap: 10px; padding: 14px 26px 18px; border-top: 1.5px solid var(--color-sand-light, #EDE8E1); flex-shrink: 0; background: var(--color-paper, #FAF7F2); align-items: center; justify-content: flex-end;">
              <button type="button" @click="closeInsightDetail"
                style="padding: 10px 22px; background: transparent; border: 1.5px solid var(--color-sand); color: var(--text-secondary, #7A6F66); border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s;"
                onmouseover="this.style.background='var(--bg-cream)'" onmouseout="this.style.background='transparent'">Tutup</button>
            </div>

          </div>
        </div>
      </transition>

      <!-- ══════════════════════════════════════════════════════════ -->
      <!-- PLAN NEXT INSIGHT SECTION                                  -->
      <!-- ══════════════════════════════════════════════════════════ -->
      <div style="margin-top: 40px;">

        <!-- Section Header -->
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; border-top: 2px solid var(--color-sand); padding-top: 28px; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-dark); margin: 0 0 4px 0; display: flex; align-items: center; gap: 8px;">
              <span style="background: linear-gradient(135deg, rgba(214,123,82,0.15), rgba(90,135,100,0.12)); border: 1.5px solid var(--color-sand); border-radius: 8px; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--color-terracotta)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
              </span>
              Plan Next Insight
            </h3>
            <p style="color: var(--text-muted); font-size: 12.5px; margin: 0; line-height: 1.5; max-width: 480px;">Daftar antrian sumber belajar yang ingin kamu telaah — klik <strong style="color: var(--color-terracotta);">✦ Jadi Insight</strong> saat sudah selesai dipelajari untuk langsung pindah ke timeline.</p>
          </div>
          <button @click="showAddPlan = true"
            style="flex-shrink: 0; height: 38px; padding: 0 16px; background: var(--bg-cream); border: 1.5px solid var(--color-sand); color: var(--text-dark); border-radius: 9px; font-size: 12.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: border-color 0.15s, background 0.15s;"
            onmouseover="this.style.borderColor='var(--color-terracotta)'; this.style.background='#FFF4ED'; this.style.color='var(--color-terracotta)'"
            onmouseout="this.style.borderColor='var(--color-sand)'; this.style.background='var(--bg-cream)'; this.style.color='var(--text-dark)'">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Plan
          </button>
        </div>

        <!-- PLAN MODAL -->
        <transition name="insight-modal-fade">
          <div v-if="showAddPlan"
            style="position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; background: rgba(30,22,16,0.45); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); padding: 16px;"
            @click.self="safeClosePlan">
            <div style="background: var(--color-paper, #FAF7F2); width: min(540px, 96vw); border-radius: 20px; box-shadow: 0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12); display: flex; flex-direction: column; overflow: hidden; animation: insightPopIn 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275);">

              <!-- Modal Header -->
              <div style="display: flex; align-items: center; gap: 12px; padding: 16px 22px 14px; background: var(--color-sage, #5A8764); color: #fff; flex-shrink: 0;">
                <div style="width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 14.5px; font-weight: 800; letter-spacing: 0.2px;">{{ editingPlanId ? 'Edit Plan Insight' : 'Tambah Plan Next Insight' }}</div>
                  <div style="font-size: 11px; opacity: 0.82; margin-top: 1px;">Antrian sumber belajar berikutnya ✦</div>
                </div>
                <button @click="cancelPlan"
                  style="background: rgba(255,255,255,0.18); border: none; border-radius: 9px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-size: 16px; flex-shrink: 0; transition: background 0.15s;"
                  onmouseover="this.style.background='rgba(255,255,255,0.32)'" onmouseout="this.style.background='rgba(255,255,255,0.18)'">✕</button>
              </div>

              <!-- Modal Body -->
              <div style="padding: 20px 24px 6px; overflow-y: auto;">

                <!-- Judul -->
                <div class="form-group" style="margin-bottom: 12px;">
                  <label style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: block;">Judul / Topik yang Ingin Dipelajari <span style="color:#EF4444;">*</span></label>
                  <input type="text" class="form-input" v-model="planForm.title" placeholder="cth., Atomic Habits - Rangkuman Konsep Kebiasaan..." style="height: 40px;" />
                </div>

                <!-- Sumber + Kategori (2 cols) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                  <div class="form-group" style="margin: 0;">
                    <label style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: block;">Sumber</label>
                    <input type="text" class="form-input" v-model="planForm.source" placeholder="cth., Buku, YouTube, Artikel..." style="height: 40px;" />
                  </div>
                  <div class="form-group" style="margin: 0;">
                    <label style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: block;">Kategori <span style="color:#EF4444;">*</span></label>
                    <select class="form-input" v-model="planForm.category" style="height: 40px; width: 100%;">
                      <option v-for="cat in allInsightCategories" :key="'plan-cat-'+cat" :value="cat">{{ cat }}</option>
                    </select>
                  </div>
                </div>

                <!-- Link URL -->
                <div class="form-group" style="margin-bottom: 16px;">
                  <label style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: block;">Link URL <span style="font-weight:400; font-style:italic; text-transform:none; letter-spacing:0;">(opsional)</span></label>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="position: relative; flex: 1;">
                      <span style="position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      </span>
                      <input type="url" class="form-input" v-model="planForm.url" placeholder="https://..." style="height: 40px; padding-left: 32px;" />
                    </div>
                    <a v-if="planForm.url && planForm.url.startsWith('http')" :href="planForm.url" target="_blank" rel="noopener"
                       style="height: 40px; padding: 0 14px; background: var(--color-sage, #5A8764); color: #fff; border-radius: 8px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; text-decoration: none; flex-shrink: 0;">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Buka
                    </a>
                  </div>
                </div>

              </div>

              <!-- Modal Footer -->
              <div style="display: flex; gap: 10px; padding: 12px 24px 18px; border-top: 1.5px solid var(--color-sand-light, #EDE8E1); flex-shrink: 0; background: var(--color-paper, #FAF7F2); align-items: center;">
                <span style="font-size: 11px; color: var(--text-muted); margin-right: auto;">✦ Klik di luar untuk menutup</span>
                <button type="button" @click="cancelPlan"
                  style="padding: 9px 18px; background: transparent; border: 1.5px solid var(--color-sand); color: var(--text-secondary, #7A6F66); border-radius: 9px; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: background 0.15s;"
                  onmouseover="this.style.background='var(--bg-cream)'" onmouseout="this.style.background='transparent'">Batal</button>
                <button type="button" @click="savePlan"
                  style="padding: 9px 24px; background: var(--color-sage, #5A8764); color: #fff; border: none; border-radius: 9px; font-size: 12.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.18s, transform 0.12s; box-shadow: 0 4px 12px rgba(90,135,100,0.25);"
                  onmouseover="this.style.background='#456B52'; this.style.transform='scale(1.02)'" onmouseout="this.style.background='var(--color-sage, #5A8764)'; this.style.transform='scale(1)'">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  {{ editingPlanId ? 'Simpan Perubahan' : 'Tambah ke Antrian' }}
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- PLAN LIST -->
        <div v-if="nextPlans.length === 0"
          style="padding: 40px 20px; text-align: center; color: var(--text-muted); background: var(--bg-cream); border-radius: 12px; border: 1.5px dashed var(--color-sand);">
          <p style="font-size: 26px; margin-bottom: 8px;">📚</p>
          <p style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Antrian kosong</p>
          <p style="font-size: 12px;">Tambahkan sumber yang ingin kamu pelajari berikutnya!</p>
        </div>

        <div v-else style="display: flex; flex-direction: column; gap: 10px;">
          <div v-for="(plan, idx) in nextPlans" :key="plan.id"
            style="background: var(--color-paper, #FAF7F2); border: 1.5px solid var(--color-sand); border-radius: 12px; padding: 14px 16px; display: flex; align-items: flex-start; gap: 12px; transition: box-shadow 0.15s;"
            onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='none'">

            <!-- Plan info -->
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 5px;">
                <!-- Kategori badge -->
                <span :style="{ background: getCatColor(plan.category) + '18', color: getCatColor(plan.category), border: '1.5px solid ' + getCatColor(plan.category) + '40' }"
                  style="border-radius: 20px; padding: 2px 9px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px;">
                  {{ plan.category }}
                </span>
                <!-- Sumber badge -->
                <span v-if="plan.source"
                  style="background: var(--bg-cream); border: 1.5px solid var(--color-sand); color: var(--text-muted); border-radius: 20px; padding: 2px 9px; font-size: 10.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 3px; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  {{ plan.source }}
                </span>
                <!-- Link badge -->
                <a v-if="plan.url && plan.url.startsWith('http')" :href="plan.url" target="_blank" rel="noopener"
                   style="background: rgba(90,135,100,0.1); border: 1.5px solid rgba(90,135,100,0.3); color: var(--color-sage, #5A8764); border-radius: 20px; padding: 2px 9px; font-size: 10.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 3px; text-decoration: none; transition: background 0.15s;"
                   onmouseover="this.style.background='rgba(90,135,100,0.2)'" onmouseout="this.style.background='rgba(90,135,100,0.1)'">
                  <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Buka Link
                </a>
              </div>
              <!-- Judul -->
              <p style="font-size: 13.5px; font-weight: 700; margin: 0; line-height: 1.45; color: var(--text-dark);">{{ plan.title }}</p>
            </div>

            <!-- Actions -->
            <div style="display: inline-flex; gap: 5px; flex-shrink: 0; align-items: center; margin-top: 1px;">
              <!-- Jadi Insight button -->
              <button @click="convertPlanToInsight(idx)" title="Sudah dipelajari? Jadikan insight baru!"
                style="background: #FFF4ED; border: 1.5px solid rgba(214,123,82,0.45); border-radius: 6px; padding: 5px 9px; display: inline-flex; align-items: center; gap: 5px; cursor: pointer; font-size: 11px; font-weight: 700; color: var(--color-terracotta, #D67B52); white-space: nowrap; transition: background 0.15s, border-color 0.15s;"
                onmouseover="this.style.background='rgba(214,123,82,0.18)'; this.style.borderColor='var(--color-terracotta)'"
                onmouseout="this.style.background='#FFF4ED'; this.style.borderColor='rgba(214,123,82,0.45)'">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                ✦ Jadi Insight
              </button>
              <!-- Edit -->
              <button @click="startEditPlan(idx)" title="Edit plan"
                style="background: #EFF6FF; border: 1.5px solid #93C5FD; border-radius: 6px; padding: 5px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <!-- Hapus -->
              <button @click="deletePlan(idx)" title="Hapus plan"
                style="background: #FEF2F2; border: 1.5px solid #FCA5A5; border-radius: 6px; padding: 5px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>

          </div>

          <!-- Footer info -->
          <p style="font-size: 11.5px; color: var(--text-muted); text-align: right; margin-top: 4px;">
            {{ nextPlans.length }} plan dalam antrian
          </p>
        </div>

      </div>
      <!-- END PLAN NEXT INSIGHT -->

    </div>
  `,
  data() {
    return {
      showAddLog: false,
      showCatManager: false,
      showDatePicker: false,
      searchQuery: '',
      filterCategory: '',
      filterStartDate: '',
      filterEndDate: '',
      calYear: new Date().getFullYear(),
      calMonth: new Date().getMonth(),
      newInsightCatInput: '',
      customInsightCategories: [],
      insights: [],
      expandedInsights: new Set(),
      editingInsightId: null,
      viewingInsight: null,
      form: {
        date: localDateStr(),
        category: 'Teknologi',
        source: '',
        url: '',
        title: '',
        details: '',
        takeaway: ''
      },
      // Plan Next Insight
      showAddPlan: false,
      nextPlans: [],
      editingPlanId: null,
      pendingConvertPlanIdx: null,
      planForm: {
        title: '',
        source: '',
        category: 'Teknologi',
        url: ''
      }
    };
  },
  computed: {
    defaultInsightCategories() {
      return ['Self', 'Quotes Life', 'Framework Life', 'Journaling', 'Psikologi', 'Teknologi'];
    },
    allInsightCategories() {
      return [...this.defaultInsightCategories, ...this.customInsightCategories];
    },
    calMonthLabel() {
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      return `${months[this.calMonth]} ${this.calYear}`;
    },
    calCells() {
      const year = this.calYear, month = this.calMonth;
      const firstDay = new Date(year, month, 1).getDay();
      const startOffset = firstDay === 0 ? 6 : firstDay - 1;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const cells = [];
      for (let i = 0; i < startOffset; i++) cells.push({ key: 'e' + i, date: null, label: '' });
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        cells.push({ key: dateStr, date: dateStr, label: d });
      }
      return cells;
    },
    filteredInsights() {
      return this.insights
        .filter(i => {
          const q = this.searchQuery.toLowerCase();
          const matchQuery = !q || [i.title, i.details, i.takeaway, i.category, i.source].some(f => f && f.toLowerCase().includes(q));
          const matchCat = !this.filterCategory || i.category === this.filterCategory;
          const matchStart = !this.filterStartDate || i.date >= this.filterStartDate;
          const matchEnd = !this.filterEndDate || i.date <= this.filterEndDate;
          return matchQuery && matchCat && matchStart && matchEnd;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    activeCategories() {
      return [...new Set(this.filteredInsights.map(i => i.category))];
    },
    latestInsightTitle() {
      const sorted = [...this.insights].sort((a, b) => new Date(b.date) - new Date(a.date));
      return sorted[0]?.title || '—';
    }
  },
  async created() {
    // ✅ FIX: Tunggu Supabase storage siap sebelum baca data
    await globalThis._workspaceStorageReady;

    const savedCats = WorkspaceStorage.getItem('personal_workspace_insight_categories');
    if (savedCats) { try { this.customInsightCategories = JSON.parse(savedCats); } catch(_e) { this.customInsightCategories = []; } }

    const saved = WorkspaceStorage.getItem('personal_workspace_nutrition_insights');
    if (saved) {
      try {
        this.insights = JSON.parse(saved);
        this.insights.forEach((ins, i) => { if (!ins.id) ins.id = 'ins-' + i + '-' + Date.now(); });
      } catch(_e) { this.insights = []; }
    } else {
      this.insights = [
        { id: 'ins-1', date: '2026-05-28', category: 'Teknologi', source: 'Vue.js Docs', title: 'Why SPA CDNs Boost Developer Workflow', details: 'Using Vue via CDN directly speeds up small tools and static assets logic. You escape complex local package manager installation steps and launch immediately.', takeaway: 'For lightweight standalone apps, clean ESM CDN tags remove build overhead completely.' },
        { id: 'ins-2', date: '2026-05-26', category: 'Produktivitas', source: 'Personal Experience', title: 'The Power of Scattered Visual Flat-lays', details: 'Allowing customized drag-and-drop flat lay positions mirrors natural office setups. A cluttered virtual desk lowers access friction for visual thinkers.', takeaway: 'Interactivity in UI builds deeper emotional ownership for productivity systems.' },
        { id: 'ins-3', date: '2026-05-25', category: 'UX Design', source: 'Color Psychology Article', title: 'Zero Blue Color Psychology', details: 'By selecting terracotta and sage earth-toned cream bases, layouts feel warmer, organic, and closely resemble tangible paper/stickers instead of clinical digital devices.', takeaway: 'Subtle warm palettes foster longer reading retention and reduce screen fatigue.' }
      ];
      this.saveToStorage();
    }

    // Load plan next insights
    try {
      const savedPlans = WorkspaceStorage.getItem('personal_workspace_next_plans');
      if (savedPlans) this.nextPlans = JSON.parse(savedPlans);
    } catch(_e) { this.nextPlans = []; }
  },
  methods: {
    calPrevMonth() { if (this.calMonth === 0) { this.calMonth = 11; this.calYear--; } else this.calMonth--; },
    calNextMonth() { if (this.calMonth === 11) { this.calMonth = 0; this.calYear++; } else this.calMonth++; },
    onCalClick(dateStr) {
      if (!this.filterStartDate || (this.filterStartDate && this.filterEndDate)) { this.filterStartDate = dateStr; this.filterEndDate = ''; }
      else {
        if (dateStr < this.filterStartDate) { this.filterEndDate = this.filterStartDate; this.filterStartDate = dateStr; }
        else this.filterEndDate = dateStr;
        this.showDatePicker = false;
      }
    },
    getCalCellStyle(cell) {
      if (!cell.date) return { visibility: 'hidden' };
      const today = localDateStr();
      const isStart = cell.date === this.filterStartDate, isEnd = cell.date === this.filterEndDate;
      const inRange = this.filterStartDate && this.filterEndDate && cell.date > this.filterStartDate && cell.date < this.filterEndDate;
      if (isStart || isEnd) return { background: 'var(--color-terracotta)', color: '#fff', fontWeight: 'bold', borderRadius: '50%' };
      if (inRange) return { background: 'rgba(214,123,82,0.15)', color: 'var(--text-dark)', borderRadius: '4px' };
      if (cell.date === today) return { border: '1.5px solid var(--color-terracotta)', color: 'var(--color-terracotta)', fontWeight: 'bold', borderRadius: '50%' };
      return { color: 'var(--text-dark)' };
    },
    resetFilters() { this.searchQuery = ''; this.filterCategory = ''; this.filterStartDate = ''; this.filterEndDate = ''; this.showDatePicker = false; },
    getCatColor(cat) {
      const map = { 'Teknologi': '#06B6D4', 'Produktivitas': '#10B981', 'Filsafat': '#8B5CF6', 'Arsitektur': '#F59E0B', 'UX Design': '#EC4899', 'Bisnis': '#3B82F6', 'Psikologi': '#EF4444' };
      if (map[cat]) return map[cat];
      let hash = 0;
      for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
      return `hsl(${Math.abs(hash) % 360}, 60%, 45%)`;
    },
    // ── Rich Text Editor helpers ──
    rtExec(cmd, val) {
      const editor = this.$refs.detailsEditor;
      if (editor) editor.focus();
      document.execCommand(cmd, false, val || null);
      if (editor) this.form.details = editor.innerHTML;
    },
    onDetailsInput(e) {
      this.form.details = e.target.innerHTML;
    },
    onDetailsPaste(e) {
      // Paste sebagai plain text supaya tidak bawa styling dari luar
      e.preventDefault();
      const text = (e.clipboardData || globalThis.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text);
    },
    syncEditorContent() {
      this.$nextTick(() => {
        const editor = this.$refs.detailsEditor;
        if (editor) editor.innerHTML = this.form.details || '';
        const twEditor = this.$refs.takeawayEditor;
        if (twEditor) twEditor.innerHTML = this.form.takeaway || '';
      });
    },
    saveInsightFromModal() {
      if (!this.form.date) return alert('Tanggal wajib diisi!');
      if (!this.form.title || !this.form.title.trim()) return alert('Judul/Intisari wajib diisi!');
      if (!this.form.details || this.form.details.replace(/<[^>]*>/g,'').trim() === '') {
        return alert('Rangkuman Detail wajib diisi!');
      }
      if (!this.form.takeaway || this.form.takeaway.replace(/<[^>]*>/g,'').trim() === '') {
        return alert('Takeaway utama wajib diisi!');
      }
      this.saveInsight();
    },
    rtExecTw(cmd, val) {
      const editor = this.$refs.takeawayEditor;
      if (editor) editor.focus();
      document.execCommand(cmd, false, val || null);
      if (editor) this.form.takeaway = editor.innerHTML;
    },
    onTakeawayInput(e) {
      this.form.takeaway = e.target.innerHTML;
    },
    onTakeawayPaste(e) {
      e.preventDefault();
      const text = (e.clipboardData || globalThis.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text);
    },
    addInsightCategory() {
      const name = this.newInsightCatInput.trim();
      if (!name || this.allInsightCategories.includes(name)) return;
      this.customInsightCategories.push(name);
      WorkspaceStorage.setItem('personal_workspace_insight_categories', JSON.stringify(this.customInsightCategories));
      this.newInsightCatInput = '';
    },
    deleteInsightCategory(cat) {
      if (!confirm(`Hapus kategori "${cat}"?`)) return;
      this.customInsightCategories = this.customInsightCategories.filter(c => c !== cat);
      WorkspaceStorage.setItem('personal_workspace_insight_categories', JSON.stringify(this.customInsightCategories));
      if (this.form.category === cat) this.form.category = this.allInsightCategories[0];
    },
    formatDate(d) {
      try { return new Date(d).toLocaleDateString('id-ID', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }); }
      catch(_e) { return d; }
    },
    saveInsight() {
      if (this.editingInsightId) {
        // Update existing insight
        const idx = this.insights.findIndex(i => i.id === this.editingInsightId);
        if (idx !== -1) {
          this.insights[idx] = { ...this.form, id: this.editingInsightId };
        }
        this.editingInsightId = null;
      } else {
        // Add new insight
        const newIns = { ...this.form, id: 'ins-' + Date.now() };
        this.insights.push(newIns);
      }
      // Kalau berasal dari konversi plan, baru hapus plan-nya sekarang
      if (this.pendingConvertPlanIdx !== null) {
        this.nextPlans.splice(this.pendingConvertPlanIdx, 1);
        this.savePlansToStorage();
        this.pendingConvertPlanIdx = null;
      }
      this.saveToStorage();
      this.form = { date: localDateStr(), category: this.form.category, source: '', url: '', title: '', details: '', takeaway: '' };
      this.showAddLog = false;
      this.$nextTick(() => {
        const ed = this.$refs.detailsEditor; if (ed) ed.innerHTML = '';
        const tw = this.$refs.takeawayEditor; if (tw) tw.innerHTML = '';
      });
    },
    startEditInsight(idx) {
      const ins = this.filteredInsights[idx];
      if (!ins) return;
      this.editingInsightId = ins.id;
      this.form = { date: ins.date, category: ins.category, source: ins.source || '', url: ins.url || '', title: ins.title, details: ins.details, takeaway: ins.takeaway };
      this.showAddLog = true;
      this.syncEditorContent();
    },
    cancelEditInsight() {
      this.editingInsightId = null;
      this.pendingConvertPlanIdx = null;
      this.form = { date: localDateStr(), category: 'Teknologi', source: '', url: '', title: '', details: '', takeaway: '' };
      this.showAddLog = false;
      this.$nextTick(() => {
        const ed = this.$refs.detailsEditor; if (ed) ed.innerHTML = '';
        const tw = this.$refs.takeawayEditor; if (tw) tw.innerHTML = '';
      });
    },
    safeCloseEditInsight() {
      const hasData = this.form.title && this.form.title.trim() || this.form.source && this.form.source.trim() || this.form.details && this.form.details.trim() || this.form.takeaway && this.form.takeaway.trim();
      if (hasData) {
        if (!confirm('Kamu sudah mengisi beberapa data. Yakin mau tutup dan buang perubahan?')) return;
      }
      this.cancelEditInsight();
    },
    deleteInsight(idx) {
      if (!confirm('Hapus insight ini?')) return;
      const sorted = this.filteredInsights;
      const insToDelete = sorted[idx];
      const realIdx = this.insights.findIndex(i => i.id === insToDelete.id);
      if (realIdx !== -1) this.insights.splice(realIdx, 1);
      this.saveToStorage();
    },
    toggleInsightExpand(id) {
      const s = new Set(this.expandedInsights);
      if (s.has(id)) { s.delete(id); } else { s.add(id); }
      this.expandedInsights = s;
    },
    viewInsightDetail(ins) {
      this.viewingInsight = ins;
    },
    closeInsightDetail() {
      this.viewingInsight = null;
    },
    saveToStorage() {
      WorkspaceStorage.setItem('personal_workspace_nutrition_insights', JSON.stringify(this.insights));
    },

    // ── Plan Next Insight methods ──
    savePlan() {
      if (!this.planForm.title || !this.planForm.title.trim()) return alert('Judul wajib diisi!');
      if (!this.planForm.category) return alert('Kategori wajib dipilih!');
      if (this.editingPlanId) {
        const idx = this.nextPlans.findIndex(p => p.id === this.editingPlanId);
        if (idx !== -1) this.nextPlans[idx] = { ...this.nextPlans[idx], ...this.planForm };
        this.editingPlanId = null;
      } else {
        this.nextPlans.push({ id: 'plan-' + Date.now(), ...this.planForm, createdAt: new Date().toISOString() });
      }
      this.savePlansToStorage();
      this.cancelPlan();
    },
    cancelPlan() {
      this.showAddPlan = false;
      this.editingPlanId = null;
      this.planForm = { title: '', source: '', category: this.allInsightCategories[0] || 'Teknologi', url: '' };
    },
    safeClosePlan() {
      const hasData = this.planForm.title && this.planForm.title.trim() || this.planForm.source && this.planForm.source.trim() || this.planForm.url && this.planForm.url.trim();
      if (hasData) {
        if (!confirm('Kamu sudah mengisi beberapa data. Yakin mau tutup dan buang perubahan?')) return;
      }
      this.cancelPlan();
    },
    startEditPlan(idx) {
      const plan = this.nextPlans[idx];
      if (!plan) return;
      this.editingPlanId = plan.id;
      this.planForm = { title: plan.title, source: plan.source || '', category: plan.category, url: plan.url || '' };
      this.showAddPlan = true;
    },
    deletePlan(idx) {
      if (!confirm('Hapus plan ini?')) return;
      this.nextPlans.splice(idx, 1);
      this.savePlansToStorage();
    },
    convertPlanToInsight(idx) {
      const plan = this.nextPlans[idx];
      if (!plan) return;
      // Pre-fill form insight dengan data dari plan
      this.editingInsightId = null;
      this.pendingConvertPlanIdx = idx;
      this.form = {
        date: localDateStr(),
        category: plan.category,
        source: plan.source || '',
        url: plan.url || '',
        title: plan.title,
        details: '',
        takeaway: ''
      };
      // Buka modal tambah insight — plan baru dihapus saat save berhasil
      this.showAddLog = true;
      this.syncEditorContent();
    },
    savePlansToStorage() {
      WorkspaceStorage.setItem('personal_workspace_next_plans', JSON.stringify(this.nextPlans));
    }
  }
};

// 6. Habit Tracker Component (PORTED FROM REACT TO VUE 3)
const HabitTracker = {
  template: `
    <div class="habit-tracker">

      <!-- MODAL: Buat Habit Komitmen Baru -->
      <transition name="modal-fade">
        <div v-if="showModal" class="habit-modal-backdrop" @click.self="closeModal">
          <div class="habit-modal-box">
            <div class="flex-between" style="margin-bottom: 20px;">
              <h3 style="font-size: 17px; color: var(--text-dark); display: flex; align-items: center; gap: 8px; margin: 0;">
                <svg v-if="editingHabitId" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-terracotta);"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-forest);"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 6v12"></path><path d="M8 10h8"></path></svg>
                {{ editingHabitId ? 'Edit Habit' : 'Buat Habit Komitmen Baru' }}
              </h3>
              <button class="close-btn" @click="closeModal" style="font-size: 18px; line-height: 1; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">x</button>
            </div>

            <form @submit.prevent="saveHabitForm">
              <div class="form-group">
                <label>Nama Kebiasaan / Habit</label>
                <input type="text" class="form-input" v-model="form.name" placeholder="cth., Meditasi, Minum Air Putih, Olahraga..." required />
              </div>

              <div class="form-group">
                <label>Kategori</label>
                <div style="position: relative;">
                  <!-- Trigger — same style as Platform/Channel -->
                  <div @click.stop="showCategoryList = !showCategoryList"
                       class="form-input"
                       style="height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; cursor: pointer; border: 1.5px solid var(--color-sand); border-radius: 8px; background-color: #fff; font-size: 13.5px; user-select: none;">
                    <span style="font-weight: 500; color: var(--text-dark);">
                      {{ form.category === '__CUSTOM_CAT__' ? 'Kategori Kustom...' : form.category }}
                    </span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--text-muted);"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>

                  <!-- Floating dropdown -->
                  <div v-if="showCategoryList"
                       style="position: absolute; top: 100%; left: 0; right: 0; background: #ffffff; border: 1.5px solid var(--color-sand); border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.10); z-index: 9999; margin-top: 4px; max-height: 200px; overflow-y: auto;">
                    <div v-for="cat in allCategories" :key="'catopt-' + cat"
                         @click="selectCategory(cat)"
                         style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; cursor: pointer; transition: background-color 0.15s;"
                         class="custom-dropdown-item">
                      <span style="font-size: 13px; color: var(--text-dark);">{{ cat }}</span>
                      <button v-if="!['Kesehatan','Produktivitas','Pikiran','Rutinitas','Dzikir Waktu'].includes(cat)"
                              type="button"
                              @click.stop="deleteCategory(cat)"
                              title="Hapus kategori ini"
                              style="background: transparent; border: 1px solid transparent; color: #DC2626; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px;"
                              class="btn-delete-option">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                    <div @click="selectCustomCategory"
                         style="padding: 8px 12px; font-size: 12.5px; font-weight: 600; color: var(--color-terracotta); border-top: 1.5px dashed var(--color-sand); cursor: pointer; background: var(--bg-cream);"
                         class="custom-dropdown-add-btn">
                      + Tambah Kategori Kustom...
                    </div>
                  </div>
                </div>

                <!-- Custom category text input -->
                <input type="text"
                       v-if="form.category === '__CUSTOM_CAT__'"
                       class="form-input"
                       v-model="newCategoryInput"
                       placeholder="Ketik nama kategori kustom..."
                       style="margin-top: 6px; height: 38px;"
                       @keyup.enter="confirmCustomCategory"
                       maxlength="30" />
                <button v-if="form.category === '__CUSTOM_CAT__' && newCategoryInput.trim()"
                        type="button"
                        @click="confirmCustomCategory"
                        style="margin-top: 5px; background-color: var(--color-sage); color: #fff; border: none; border-radius: 7px; padding: 5px 12px; cursor: pointer; font-size: 12px; font-weight: 600;">
                  Simpan Kategori
                </button>
              </div>

              <div class="form-group">
                <label>Pilih Warna Tema</label>
                <div style="display: flex; align-items: center; gap: 10px; margin-top: 6px; flex-wrap: wrap;">
                  <input type="color" v-model="form.customColor"
                         style="width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid var(--color-sand); padding: 2px; cursor: pointer; background: none;"
                         title="Pilih warna bebas" />
                  <span style="font-size: 11px; color: var(--text-muted);">atau pilih preset:</span>
                  <button v-for="col in ['emerald', 'rose', 'sky', 'amber', 'violet', 'teal']"
                          :key="col"
                          type="button"
                          class="sticker-opt"
                          :style="{ backgroundColor: getColorCode(col), opacity: form.color === col ? 1 : 0.4 }"
                          style="width: 28px; height: 28px; border: 1.5px solid var(--text-dark); border-radius: 8px; cursor: pointer; padding: 0; flex-shrink: 0;"
                          @click="form.color = col; form.customColor = getColorCode(col)">
                    <span v-if="form.color === col" style="color: #fff; font-size: 10px;">v</span>
                  </button>
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 24px;">
                <div class="flex-between">
                  <label>Target Hari Sebulan</label>
                  <span class="text-mono" style="font-weight: bold; font-size: 12px; color: var(--color-terracotta);">{{ form.target }} hari</span>
                </div>
                <input type="range" min="1" max="31" v-model.number="form.target" style="width: 100%; margin-top: 6px; cursor: pointer; accent-color: var(--color-terracotta);" />
              </div>

              <div class="form-group" style="margin-bottom: 24px;">
                <label style="display: flex; align-items: center; gap: 6px;">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-terracotta);"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Waktu Pengerjaan (Opsional)
                </label>
                <input type="time" class="form-input" v-model="form.timeSchedule" style="height: 42px;" />
                <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px; display: block;">Jam berapa habit ini biasanya dikerjakan?</span>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%;">{{ editingHabitId ? 'Simpan Perubahan' : 'Simpan Komitmen' }}</button>
            </form>

            <div style="margin-top: 20px; background-color: var(--bg-cream); border: 1px dashed var(--color-sand); border-radius: 12px; padding: 14px; font-size: 12px; line-height: 1.5; color: var(--text-muted);">
              <strong>Tips Menjaga Habit:</strong> Catat setiap selesai beraktivitas di malam hari demi menstimulasi hormon dopamin alami lewat kepuasan berlabel centang!
            </div>
          </div>
        </div>
      </transition>

      <!-- PAGE HEADER -->
      <div class="flex-between" style="border-bottom: 1.5px solid var(--color-sand); padding-bottom: 16px; margin-bottom: 24px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 800; color: var(--text-dark); margin: 0 0 4px 0;">Aesthetic Habit Tracker</h2>
          <p style="color: var(--text-muted); font-size: 13.5px; margin-top: 4px;">Indikator kedisiplinan log harian pribadi dengan akumulasi data otomatis dan grafik progress terupdate.</p>
        </div>

        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: flex-end;">
          <!-- Button Buat Habit -->
          <button class="btn btn-primary habit-create-btn" @click="showModal = true" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 13px;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 6v12"></path><path d="M8 10h8"></path></svg>
            Buat Habit Baru
          </button>

          <!-- Month Controller -->
          <div class="flex-gap" style="background-color: var(--bg-cream); padding: 8px 16px; border-radius: 40px; border: 1.5px solid var(--color-sand);">
            <button class="card-nav-btn text-mono" @click="prevMonth" style="font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <span class="text-mono" style="font-weight: bold; font-size: 14px; min-width: 130px; text-align: center; color: var(--text-dark);">
              {{ getActiveMonthName() }} 2026
            </span>
            <button class="card-nav-btn text-mono" @click="nextMonth" style="font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 1. Stats Grid Row -->
      <div class="grid-2" style="grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
        <div class="drawer-section" style="margin-bottom: 0; text-align: center;">
          <h4 style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Jumlah Habit</h4>
          <p class="text-mono" style="font-size: 28px; font-weight: bold; color: var(--text-dark); margin-top: 6px;">{{ habits.length }}</p>
        </div>
        <div class="drawer-section" style="margin-bottom: 0; text-align: center;">
          <h4 style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Total Checklist</h4>
          <p class="text-mono" style="font-size: 28px; font-weight: bold; color: var(--color-terracotta); margin-top: 6px;">{{ totalChecksThisMonth }} <span style="font-size: 12px; font-weight: normal;">kali</span></p>
        </div>
        <div class="drawer-section" style="margin-bottom: 0; text-align: center;">
          <h4 style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Konsistensi Bulan Ini</h4>
          <p class="text-mono" style="font-size: 28px; font-weight: bold; color: var(--color-sage); margin-top: 6px;">{{ overallCompletionRate }}%</p>
        </div>
        <div class="drawer-section" style="margin-bottom: 0; text-align: center;">
          <h4 style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; gap: 4px;">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-terracotta);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            Star Habit
          </h4>
          <p class="text-mono" style="font-size: 13px; font-weight: bold; color: var(--color-forest); margin-top: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="starHabit">
            {{ starHabit }}
          </p>
        </div>
      </div>

      <!-- 2. Interactive SVG Progress Chart with habit filter -->
      <div class="drawer-section" style="margin-bottom: 28px; padding: 24px;">
        <div class="flex-between" style="margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 16px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-terracotta);"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              Grafik Progress Harian (Bulan {{ getActiveMonthName() }})
            </h3>
            <p style="color: var(--text-muted); font-size: 12px; margin: 0;">
              <span v-if="selectedChartHabitId === null">Menampilkan akumulasi semua habit dari tanggal 1 sampai {{ daysInMonth }}.</span>
              <span v-else>Menampilkan progres habit: <strong>{{ selectedChartHabitName }}</strong></span>
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="background-color: var(--bg-cream); font-size: 12px; font-weight: 600; color: var(--color-sage); padding: 4px 12px; border-radius: 20px; border: 1px solid var(--color-sand);">
              Rata-rata Harian: {{ chartCompletionRate }}% Selesai
            </div>
            <!-- Toggle collapse button -->
            <button @click="chartCollapsed = !chartCollapsed"
              :title="chartCollapsed ? 'Buka grafik' : 'Tutup grafik'"
              style="background: var(--bg-cream); border: 1.5px solid var(--color-sand); border-radius: 8px; padding: 6px 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0;">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                :style="{ transition: 'transform 0.25s ease', transform: chartCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div v-show="!chartCollapsed">
        <div v-if="habits.length > 0" style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;">
          <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); white-space: nowrap;">Filter Habit:</label>
          <div style="position: relative; display: inline-flex; align-items: center;">
            <span v-if="selectedChartHabitId !== null" :style="{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: activeChartColor, display: 'inline-block', position: 'absolute', left: '10px', pointerEvents: 'none', zIndex: 1 }"></span>
            <select
              v-model="selectedChartHabitId"
              style="font-size: 12px; font-weight: 600; padding: 6px 32px 6px 26px; border-radius: 20px; border: 1.5px solid var(--color-sand); background: var(--bg-cream); color: var(--text-dark); cursor: pointer; outline: none; appearance: none; -webkit-appearance: none; min-width: 180px; max-width: 260px; transition: border-color 0.2s;"
              @focus="$event.target.style.borderColor='var(--color-terracotta)'"
              @blur="$event.target.style.borderColor='var(--color-sand)'"
            >
              <option :value="null">🌿 Semua Habit</option>
              <option v-for="habit in habits" :key="'dd-' + habit.id" :value="habit.id">{{ habit.name }}</option>
            </select>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; right: 10px; pointer-events: none; color: var(--text-muted);"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>

        <!-- Render Custom SVG Line Chart -->
        <div style="width: 100%; overflow-x: auto; padding-bottom: 6px;">
          <div style="min-width: 600px; width: 100%;">
            <svg viewBox="0 0 800 180" style="width: 100%; height: auto; overflow: visible;">
              <defs>
                <linearGradient :id="'habitGrad-' + chartColorId" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" :stop-color="activeChartColor" stop-opacity="0.25" />
                  <stop offset="100%" :stop-color="activeChartColor" stop-opacity="0.02" />
                </linearGradient>
              </defs>

              <!-- Horizontal Grid Lines -->
              <g opacity="0.15" v-for="gridVal in [0, 25, 50, 75, 100]" :key="gridVal">
                <line x1="45" :y1="getChartY(gridVal)" x2="780" :y2="getChartY(gridVal)" stroke="var(--text-dark)" stroke-dasharray="3 3" stroke-width="1" />
                <text x="35" :y="getChartY(gridVal) + 4" text-anchor="end" style="font-size: 9px; font-family: monospace;" fill="var(--text-dark)">{{ gridVal }}%</text>
              </g>

              <!-- Fill Area -->
              <path :d="chartAreaPath" :fill="'url(#habitGrad-' + chartColorId + ')'" />

              <!-- Line Stroke -->
              <path :d="chartLinePath" fill="none" :stroke="activeChartColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

              <!-- Daily Interaction -->
              <g v-for="(day, dIdx) in currentDailyProgressList" :key="day.day">
                <rect :x="getChartX(dIdx) - 10" y="15" width="20" height="125" fill="transparent" style="cursor: pointer;"
                      @mouseenter="hoveredChartDay = day" @mouseleave="hoveredChartDay = null" />
                <circle :cx="getChartX(dIdx)"
                        :cy="getChartY(day.percentage)"
                        :r="hoveredChartDay && hoveredChartDay.day === day.day ? 6 : 3"
                        :fill="hoveredChartDay && hoveredChartDay.day === day.day ? activeChartColor : '#ffffff'"
                        :stroke="activeChartColor"
                        :stroke-width="hoveredChartDay && hoveredChartDay.day === day.day ? 2 : 1.5" />
              </g>

              <!-- Day Axis Labels -->
              <template v-for="(day, dIdx) in currentDailyProgressList" :key="'lbl-' + day.day">
                <text v-if="day.day % (daysInMonth > 20 ? 3 : 1) === 1 || day.day === daysInMonth"
                      :x="getChartX(dIdx)" y="160" text-anchor="middle"
                      style="font-size: 9px; font-weight: 500;" fill="var(--text-muted)">
                  Tgl {{ day.day }}
                </text>
              </template>
            </svg>
          </div>
        </div>

        <!-- Live Tooltip -->
        <div style="height: 30px; display: flex; align-items: center; justify-content: center; margin-top: 10px;">
          <span v-if="hoveredChartDay" class="text-mono" style="font-size: 13px; color: var(--color-terracotta); background-color: var(--bg-cream); padding: 4px 16px; border-radius: 20px; border: 1.5px solid var(--color-sand);">
            <strong>Tanggal {{ hoveredChartDay.day }}:</strong>
            <span v-if="selectedChartHabitId === null"> Selesai {{ hoveredChartDay.completed }} dari {{ habits.length }} habit ({{ hoveredChartDay.percentage }}%)</span>
            <span v-else> {{ hoveredChartDay.percentage === 100 ? 'Selesai' : 'Belum selesai' }} ({{ hoveredChartDay.percentage }}%)</span>
          </span>
          <span v-else style="font-size: 11.5px; color: var(--text-muted); font-style: italic;">
            Letakkan kursor di atas grafik untuk memantau detail harian
          </span>
        </div>
        </div><!-- end v-show chartCollapsed -->
      </div>

      <!-- 3. Habit Table Grid (31 kolom) -->
      <div class="drawer-section" style="margin-bottom: 28px; padding: 20px;">
        <div class="flex-between" style="margin-bottom: 16px;">
          <h3 style="font-size: 16px; margin: 0; display: flex; align-items: center; gap: 6px;">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-terracotta);"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Tabel Habit Bulan {{ getActiveMonthName() }}
          </h3>
          <span style="font-size: 12px; color: var(--text-muted); font-style: italic;">{{ daysInMonth }} hari</span>
        </div>

        <div v-if="habits.length === 0" style="padding: 40px; text-align: center; color: var(--text-muted);">
          <p>Belum ada habit. Klik "Buat Habit Baru" untuk mulai!</p>
        </div>

        <div v-else style="overflow-x: auto;">
          <table class="habit-table">
            <thead>
              <tr>
                <th class="habit-table-name-col">Habit</th>
                <th v-for="day in daysInMonth" :key="'th-' + day" class="habit-table-day-col">{{ day }}</th>
                <th class="habit-table-stat-col">Done</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="habit in habitsTableSorted" :key="'row-' + habit.id"
                  :data-habit-id="habit.id"
                  :class="{ 'habit-row-notif-flash': notifFlashHabitId === habit.id }">
                <td class="habit-table-name-cell">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span :style="{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getHabitColor(habit), display: 'inline-block', flexShrink: 0 }"></span>
                    <div style="display: flex; flex-direction: column; min-width: 0;">
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px;" :title="habit.name">{{ habit.name }}</span>
                      <span v-if="habit.timeSchedule" style="font-size: 10px; font-weight: 700; color: var(--color-terracotta); opacity: 0.8; margin-top: 1px;">⏰ {{ habit.timeSchedule }}</span>
                    </div>
                  </div>
                </td>
                <td v-for="day in daysInMonth" :key="'cell-' + habit.id + '-' + day" class="habit-table-day-cell">
                  <button
                    @click="toggleDayCheckWithSound(habit.id, day)"
                    @mousedown="startPress($event)"
                    @mouseup="endPress($event)"
                    @touchstart="startPress($event)"
                    @touchend="endPress($event)"
                    class="habit-day-btn"
                    :class="{
                      'habit-day-btn-checked': isDayChecked(habit, day),
                      'habit-day-btn-notif-pop': notifFlashHabitId === habit.id && day === new Date().getDate()
                    }"
                    :style="isDayChecked(habit, day) ? { backgroundColor: 'transparent', borderColor: 'transparent', color: getHabitColor(habit) } : { color: 'var(--color-sand)' }"
                    :title="'Tanggal ' + day"
                    style="background: none; border: none; padding: 1px;"
                  >
                    <!-- Lucide tree-deciduous icon (checked = filled color, unchecked = muted outline) -->
                    <svg viewBox="0 0 24 24" :width="isDayChecked(habit, day) ? 17 : 15" :height="isDayChecked(habit, day) ? 17 : 15" fill="none" stroke="currentColor" :stroke-width="isDayChecked(habit, day) ? 2 : 1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.07V6a3 3 0 0 1 6 0v.07a3.5 3.5 0 0 1 3.24 5.61A4 4 0 0 1 16 19Z"/>
                      <path d="M12 19v3"/>
                    </svg>
                  </button>
                </td>
                <td class="habit-table-stat-cell">
                  <span class="text-mono" style="font-weight: bold; font-size: 12px;" :style="{ color: getHabitColor(habit) }">
                    {{ getCheckedDaysCount(habit) }}/{{ daysInMonth }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. Habit Cards (progress view) -->
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <h3 style="font-size: 16px; margin: 0; display: flex; align-items: center; gap: 6px;">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-terracotta);"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            Kartu Progress Habit
            <span v-if="habitSearchQuery" style="font-size: 11px; font-weight: normal; color: var(--text-muted); background: var(--bg-cream); border: 1px solid var(--color-sand); border-radius: 20px; padding: 2px 8px; margin-left: 4px;">{{ filteredHabitCards.length }} hasil</span>
          </h3>
          <!-- Search Bar -->
          <div v-if="habits.length > 0" style="position: relative; display: flex; align-items: center;">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 10px; color: var(--text-muted); pointer-events: none;">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              v-model="habitSearchQuery"
              placeholder="Cari habit..."
              style="font-size: 12px; padding: 7px 30px 7px 30px; border-radius: 20px; border: 1.5px solid var(--color-sand); background: var(--bg-cream); color: var(--text-dark); outline: none; width: 180px; transition: border-color 0.2s;"
              @focus="$event.target.style.borderColor='var(--color-terracotta)'"
              @blur="$event.target.style.borderColor='var(--color-sand)'"
            />
            <button v-if="habitSearchQuery" @click="habitSearchQuery = ''" style="position: absolute; right: 8px; background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; padding: 0; font-size: 14px; line-height: 1;">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div v-if="habits.length === 0" style="padding: 60px; text-align: center; color: var(--text-muted); background-color: var(--bg-cream); border-radius: 16px; border: 1px dashed var(--color-sand);">
          <p style="font-size: 14px; margin-bottom: 8px;">Belum ada komitmen habit yang didaftarkan.</p>
          <p style="font-size: 12px; color: var(--text-muted);">Klik "Buat Habit Baru" di atas untuk mulai merekam progres harian!</p>
        </div>

        <div v-else-if="filteredHabitCards.length === 0" style="padding: 40px; text-align: center; color: var(--text-muted); background-color: var(--bg-cream); border-radius: 16px; border: 1px dashed var(--color-sand);">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-sand); margin-bottom: 10px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p style="font-size: 13px;">Tidak ada habit yang cocok dengan "<strong>{{ habitSearchQuery }}</strong>"</p>
        </div>

        <div v-else class="grid-2" style="grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: start;">
          <div v-for="habit in filteredHabitCards" :key="habit.id" class="drawer-section" style="margin-bottom: 0; padding: 20px; display: flex; flex-direction: column; gap: 16px;">

            <div class="flex-between">
              <div>
                <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: var(--color-terracotta); border: 1px solid var(--color-sand); padding: 4px 10px; border-radius: 10px; background-color: var(--bg-cream); display: inline-flex; align-items: center; gap: 4px;">
                  <span v-if="habit.category === 'Kesehatan'" style="display: inline-flex; align-items: center;"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg></span>
                  <span v-else-if="habit.category === 'Produktivitas'" style="display: inline-flex; align-items: center;"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span>
                  <span v-else-if="habit.category === 'Pikiran'" style="display: inline-flex; align-items: center;"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.88A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.88A2.5 2.5 0 0 0 14.5 2Z"></path></svg></span>
                  <span v-else-if="habit.category === 'Rutinitas'" style="display: inline-flex; align-items: center;"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></span>
                  <span v-else style="display: inline-flex; align-items: center;"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M12 22v-5"/><path d="M9 8c0-1.7 1.3-3 3-3s3 1.3 3 3c0 2.5-2 4-3 5-1-1-3-2.5-3-5z"/></svg></span>
                  <span>{{ habit.category }}</span>
                </span>
                <h4 style="font-size: 16px; margin-top: 6px; color: var(--text-dark);">{{ habit.name }}</h4>
                <div style="display: flex; align-items: center; gap: 6px; margin-top: 5px; flex-wrap: wrap;">
                  <span v-if="habit.timeSchedule" style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: var(--color-terracotta); background: rgba(214,123,82,0.10); padding: 2px 8px; border-radius: 20px; border: 1px solid rgba(214,123,82,0.25);">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {{ habit.timeSchedule }}
                  </span>
                  <span v-if="!habit.timeSchedule" style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: var(--text-muted); background: var(--bg-cream); padding: 2px 8px; border-radius: 20px; border: 1px dashed var(--color-sand);">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Tanpa jadwal
                  </span>
                  <span v-if="isDoneTodayHabit(habit)" style="display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 2px 8px; border-radius: 20px; border: 1px solid #86efac;">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Selesai Hari Ini
                  </span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <button class="card-nav-btn" @click="openEditHabit(habit)" title="Edit Habit" style="padding: 4px; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; background-color: #EFF6FF; border: 1px solid #BFDBFE;">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #3B82F6;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                </button>
                <button class="card-nav-btn" @click="removeHabit(habit.id)" title="Hapus Habit" style="padding: 4px; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; background-color: var(--bg-cream); border: 1px solid var(--color-sand);">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #D67B52;"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>

            <!-- Progress Bar -->
            <div style="background-color: var(--bg-cream); border: 1px solid var(--color-sand); border-radius: 12px; padding: 10px;">
              <div class="flex-between" style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">
                <span>Perkembangan target: <strong>{{ getCheckedDaysCount(habit) }} / {{ habit.targetDaysPerMonth }} hari</strong></span>
                <span class="text-mono" style="font-weight: bold; color: var(--text-dark);">{{ getCompletionRate(habit) }}%</span>
              </div>
              <div style="width: 100%; background-color: var(--color-sand); height: 8px; border-radius: 10px; overflow: hidden;">
                <div :style="{ width: Math.min(getCompletionRate(habit), 100) + '%', backgroundColor: getHabitColor(habit) }" style="height: 100%; transition: width 0.3s ease; border-radius: 10px;"></div>
              </div>
              <span v-if="getCheckedDaysCount(habit) >= habit.targetDaysPerMonth" style="font-size: 10.5px; font-weight: bold; color: var(--color-sage); margin-top: 6px; display: inline-flex; align-items: center; gap: 4px;">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-terracotta);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Target Kerapatan Tercapai!
              </span>
            </div>

          </div>
        </div>
      </div>

    </div>
  `,
  props: {
    currentYearMonth: String,
    daysInMonth: Number,
    activeMonthKey: String,
    pendingHabitTrigger: { type: String, default: null }
  },
  emits: ['prev-month', 'next-month', 'habit-triggered'],
  data() {
    return {
      habits: [],
      hoveredChartDay: null,
      showModal: false,
      editingHabitId: null,
      selectedChartHabitId: null,
      habitSearchQuery: '',
      chartCollapsed: false,
      showAddCategory: false,
      showCategoryList: false,
      newCategoryInput: '',
      customCategories: [],
      notifFlashHabitId: null,  // habit yang sedang di-flash dari notif trigger
      form: {
        name: '',
        category: 'Kesehatan',
        color: 'emerald',
        customColor: '#10b981',
        target: 20,
        timeSchedule: ''
      }
    };
  },
  computed: {
    filteredHabitCards() {
      let list = this.habits;
      if (this.habitSearchQuery.trim()) {
        const q = this.habitSearchQuery.trim().toLowerCase();
        list = list.filter(h =>
          h.name.toLowerCase().includes(q) ||
          (h.category && h.category.toLowerCase().includes(q))
        );
      }
      const today = new Date().getDate();
      const isDoneToday = (h) => {
        const checked = h.history[this.currentYearMonth] || [];
        return checked.includes(today);
      };
      const parseTime = (t) => {
        if (!t) return 9999;
        const [hh, mm] = t.split(':').map(Number);
        return hh * 60 + (mm || 0);
      };
      return [...list].sort((a, b) => {
        const aDone = isDoneToday(a);
        const bDone = isDoneToday(b);
        if (aDone !== bDone) return aDone ? 1 : -1;
        return parseTime(a.timeSchedule) - parseTime(b.timeSchedule);
      });
    },
    allCategories() {
      const base = ['Kesehatan', 'Produktivitas', 'Pikiran', 'Rutinitas', 'Dzikir Waktu'];
      return [...base, ...this.customCategories.filter(c => !base.includes(c))];
    },
    totalChecksThisMonth() {
      let count = 0;
      this.habits.forEach(h => {
        const checked = h.history[this.currentYearMonth] || [];
        count += checked.length;
      });
      return count;
    },
    overallCompletionRate() {
      if (this.habits.length === 0) return 0;
      const totalSlots = this.habits.length * this.daysInMonth;
      return Math.round((this.totalChecksThisMonth / totalSlots) * 100);
    },
    habitsTableSorted() {
      const parseTime = (t) => {
        if (!t) return 9999;
        const [hh, mm] = t.split(':').map(Number);
        return hh * 60 + (mm || 0);
      };
      return [...this.habits].sort((a, b) => parseTime(a.timeSchedule) - parseTime(b.timeSchedule));
    },
    starHabit() {
      if (this.habits.length === 0) return 'Belum Ada';
      let maxChecked = -1;
      let worstName = 'Belum Ada';
      this.habits.forEach(h => {
        const checked = h.history[this.currentYearMonth] || [];
        if (checked.length > maxChecked) {
          maxChecked = checked.length;
          worstName = h.name;
        }
      });
      return maxChecked > 0 ? worstName : 'Belum Ada';
    },
    selectedChartHabitName() {
      if (this.selectedChartHabitId === null) return 'Semua Habit';
      const h = this.habits.find(h => h.id === this.selectedChartHabitId);
      return h ? h.name : 'Semua Habit';
    },
    activeChartColor() {
      if (this.selectedChartHabitId === null) return 'var(--color-terracotta)';
      const h = this.habits.find(h => h.id === this.selectedChartHabitId);
      return h ? this.getHabitColor(h) : 'var(--color-terracotta)';
    },
    chartColorId() {
      return this.selectedChartHabitId || 'all';
    },
    currentDailyProgressList() {
      const list = [];
      for (let day = 1; day <= this.daysInMonth; day++) {
        if (this.selectedChartHabitId === null) {
          let completedOnDay = 0;
          this.habits.forEach(h => {
            const checked = h.history[this.currentYearMonth] || [];
            if (checked.includes(day)) completedOnDay++;
          });
          const totalHabits = this.habits.length;
          const percentage = totalHabits > 0 ? Math.round((completedOnDay / totalHabits) * 100) : 0;
          list.push({ day, completed: completedOnDay, percentage });
        } else {
          const h = this.habits.find(h => h.id === this.selectedChartHabitId);
          if (h) {
            const checked = h.history[this.currentYearMonth] || [];
            const done = checked.includes(day) ? 1 : 0;
            list.push({ day, completed: done, percentage: done * 100 });
          } else {
            list.push({ day, completed: 0, percentage: 0 });
          }
        }
      }
      return list;
    },
    chartCompletionRate() {
      if (this.selectedChartHabitId === null) return this.overallCompletionRate;
      const h = this.habits.find(h => h.id === this.selectedChartHabitId);
      if (!h) return 0;
      const checked = h.history[this.currentYearMonth] || [];
      return Math.round((checked.length / this.daysInMonth) * 100);
    },
    chartLinePath() {
      let path = '';
      this.currentDailyProgressList.forEach((day, index) => {
        const x = this.getChartX(index);
        const y = this.getChartY(day.percentage);
        if (index === 0) {
          path += `M ${x} ${y}`;
        } else {
          path += ` L ${x} ${y}`;
        }
      });
      return path;
    },
    chartAreaPath() {
      let path = '';
      if (this.currentDailyProgressList.length === 0) return '';
      const firstX = this.getChartX(0);
      const lastX = this.getChartX(this.currentDailyProgressList.length - 1);
      path += `M ${firstX} 145`;
      this.currentDailyProgressList.forEach((day, index) => {
        const x = this.getChartX(index);
        const y = this.getChartY(day.percentage);
        path += ` L ${x} ${y}`;
      });
      path += ` L ${lastX} 145 Z`;
      return path;
    }
  },
  watch: {
    pendingHabitTrigger(habitId) {
      if (!habitId) return;
      this._autoTriggerHabitFromNotif(habitId);
    }
  },
  async created() {
    // ✅ FIX: Tunggu Supabase storage siap sebelum baca data
    await globalThis._workspaceStorageReady;

    const savedCats = WorkspaceStorage.getItem('aesthetic_habit_custom_categories');
    if (savedCats) {
      this.customCategories = JSON.parse(savedCats);
    }
    const saved = WorkspaceStorage.getItem('aesthetic_habit_tracker_habits');
    if (saved) {
      this.habits = JSON.parse(saved);
      this.$nextTick(() => this.syncHabitsToNotif());
    } else {
      this.habits = [
        {
          id: 'habit-1',
          name: 'Minum Air Putih 2 Liter',
          category: 'Kesehatan',
          color: 'sky',
          customColor: '#0284c7',
          targetDaysPerMonth: 25,
          history: { '2026-05': [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 14, 15, 16, 17, 19, 20, 21, 23, 24, 25, 27, 28, 29] }
        },
        {
          id: 'habit-2',
          name: 'Olahraga Pagi (30 Menit)',
          category: 'Kesehatan',
          color: 'emerald',
          customColor: '#10b981',
          targetDaysPerMonth: 18,
          history: { '2026-05': [2, 4, 6, 9, 11, 13, 16, 18, 20, 23, 25, 27, 29] }
        },
        {
          id: 'habit-3',
          name: 'Membaca Buku (10 Halaman)',
          category: 'Produktivitas',
          color: 'amber',
          customColor: '#d97706',
          targetDaysPerMonth: 20,
          history: { '2026-05': [1, 2, 3, 4, 8, 9, 10, 15, 16, 17, 21, 22, 23, 24, 28, 29] }
        },
        {
          id: 'habit-4',
          name: 'Meditasi Jiwa Tenang',
          category: 'Pikiran',
          color: 'violet',
          customColor: '#8b5cf6',
          targetDaysPerMonth: 15,
          history: { '2026-05': [1, 3, 7, 10, 14, 18, 21, 24, 28, 29] }
        }
      ];
      this.saveToStorage();
    }
  },
  mounted() {
    // Kalau pendingHabitTrigger sudah di-set sebelum komponen mount
    if (this.pendingHabitTrigger) {
      this.$nextTick(() => {
        this._autoTriggerHabitFromNotif(this.pendingHabitTrigger);
      });
    }
    // Reload habits jika ada perubahan dari luar (mis. toggle dari Agenda Google Calendar)
    this._onExternalHabitsUpdated = () => {
      try {
        const saved = WorkspaceStorage.getItem('aesthetic_habit_tracker_habits');
        if (saved) this.habits = JSON.parse(saved);
      } catch(_e) { /* ignore */ }
    };
    globalThis.addEventListener('ws-plans-updated', this._onExternalHabitsUpdated);
  },
  beforeUnmount() {
    globalThis.removeEventListener('ws-plans-updated', this._onExternalHabitsUpdated);
  },
  methods: {
    closeModal() {
      this.showModal = false;
      this.editingHabitId = null;
      this.showCategoryList = false;
      this.form.category = this.allCategories[0] || 'Kesehatan';
      this.newCategoryInput = '';
    },
    openEditHabit(habit) {
      this.editingHabitId = habit.id;
      this.form.name = habit.name;
      this.form.category = habit.category;
      this.form.color = habit.color || 'emerald';
      this.form.customColor = habit.customColor || '#10b981';
      this.form.target = habit.targetDaysPerMonth;
      this.form.timeSchedule = habit.timeSchedule || '';
      this.showModal = true;
    },
    saveHabitForm() {
      if (!this.form.name.trim()) return;
      if (this.editingHabitId) {
        this.habits = this.habits.map(h => {
          if (h.id !== this.editingHabitId) return h;
          return {
            ...h,
            name: this.form.name,
            category: this.form.category,
            color: this.form.color,
            customColor: this.form.customColor,
            targetDaysPerMonth: this.form.target,
            timeSchedule: this.form.timeSchedule || ''
          };
        });
        this.saveToStorage();
        this.editingHabitId = null;
        this.showModal = false;
        this.showCategoryList = false;
        this.newCategoryInput = '';
      } else {
        this.createHabit();
      }
    },
    isDoneTodayHabit(habit) {
      const today = new Date().getDate();
      const checked = habit.history[this.currentYearMonth] || [];
      return checked.includes(today);
    },
    selectCategory(cat) {
      this.form.category = cat;
      this.showCategoryList = false;
      this.newCategoryInput = '';
    },
    selectCustomCategory() {
      this.form.category = '__CUSTOM_CAT__';
      this.newCategoryInput = '';
      this.showCategoryList = false;
    },
    confirmCustomCategory() {
      const name = this.newCategoryInput.trim();
      if (!name) return;
      if (!this.customCategories.includes(name) && !['Kesehatan','Produktivitas','Pikiran','Rutinitas','Dzikir Waktu'].includes(name)) {
        this.customCategories.push(name);
        this.saveCategoriesToStorage();
      }
      this.form.category = name;
      this.newCategoryInput = '';
    },
    deleteCategory(cat) {
      if (!confirm(`Hapus kategori "${cat}"? Habit yang memakai kategori ini tidak akan terhapus.`)) return;
      this.customCategories = this.customCategories.filter(c => c !== cat);
      if (this.form.category === cat || this.form.category === '__CUSTOM_CAT__') {
        this.form.category = 'Kesehatan';
        this.newCategoryInput = '';
      }
      this.saveCategoriesToStorage();
    },
    saveCategoriesToStorage() {
      WorkspaceStorage.setItem('aesthetic_habit_custom_categories', JSON.stringify(this.customCategories));
    },
    getActiveMonthName() {
      const names = {
        '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
        '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
        '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
      };
      return names[this.activeMonthKey] || 'Mei';
    },
    getChartX(index) {
      const paddingLeft = 45;
      const chartWidth = 735;
      return paddingLeft + (index / Math.max(this.daysInMonth - 1, 1)) * chartWidth;
    },
    getChartY(percentage) {
      const _paddingTop = 15; void _paddingTop;
      const chartHeight = 130;
      return 145 - (percentage / 100) * chartHeight;
    },
    getColorCode(color) {
      const mapping = {
        emerald: '#10b981',
        rose: '#f43f5e',
        sky: '#0284c7',
        amber: '#d97706',
        violet: '#8b5cf6',
        teal: '#0d9488'
      };
      return mapping[color] || '#10b981';
    },
    getHabitColor(habit) {
      if (habit.customColor && habit.customColor !== this.getColorCode(habit.color)) {
        return habit.customColor;
      }
      return habit.customColor || this.getColorCode(habit.color || 'emerald');
    },
    getCategoryIcon(category) {
      const icons = { 'Kesehatan': '❤️', 'Produktivitas': '✨', 'Pikiran': '🧠', 'Rutinitas': '⏰', 'Dzikir Waktu': '📿' };
      return icons[category] || '🌱';
    },
    isDayChecked(habit, day) {
      const checked = habit.history[this.currentYearMonth] || [];
      return checked.includes(day);
    },
    getCheckedDaysCount(habit) {
      const checked = habit.history[this.currentYearMonth] || [];
      return checked.length;
    },
    getCompletionRate(habit) {
      const count = this.getCheckedDaysCount(habit);
      return Math.round((count / this.daysInMonth) * 100);
    },
    playCheckSound(isChecking) {
      try {
        const ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (isChecking) {
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
          osc.type = 'sine';
        } else {
          osc.frequency.setValueAtTime(500, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.type = 'sine';
        }
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } catch(_e) { /* ignore */ }
    },
    startPress(event) {
      const btn = event.currentTarget;
      btn.style.transform = 'scale(0.82)';
      btn.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.25)';
    },
    endPress(event) {
      const btn = event.currentTarget;
      btn.style.transform = '';
      btn.style.boxShadow = '';
    },
    toggleDayCheckWithSound(habitId, day) {
      const habit = this.habits.find(h => h.id === habitId);
      const checked = habit ? (habit.history[this.currentYearMonth] || []) : [];
      const isCurrentlyChecked = checked.includes(day);
      this.playCheckSound(!isCurrentlyChecked);
      this.toggleDayCheck(habitId, day);
    },
    toggleDayCheck(habitId, day) {
      let nowChecked = false;
      this.habits = this.habits.map(h => {
        if (h.id !== habitId) return h;
        const historyCopy = { ...h.history };
        const checkedList = historyCopy[this.currentYearMonth] ? [...historyCopy[this.currentYearMonth]] : [];
        let newChecked;
        if (checkedList.includes(day)) {
          newChecked = checkedList.filter(d => d !== day);
          nowChecked = false;
        } else {
          newChecked = [...checkedList, day].sort((a, b) => a - b);
          nowChecked = true;
        }
        historyCopy[this.currentYearMonth] = newChecked;
        return { ...h, history: historyCopy };
      });
      this.saveToStorage();

      // Kalau hari yang ditoggle adalah HARI INI, sinkronkan juga status-nya ke
      // ws_notif_action_status supaya Panel Notifikasi & Agenda View (Google Calendar) ikut update.
      this.syncTodayStatusToNotif(habitId, day, nowChecked);
    },
    // ── Sinkronisasi checklist hari-ini dari tabel Habit → ws_notif_action_status ──
    // Memberi tahu Notification Panel & Agenda View (Google Calendar) via event,
    // sehingga ketika trigger berasal dari tabel Habit, kedua tampilan tersebut ikut berubah.
    syncTodayStatusToNotif(habitId, day, checked) {
      const now = new Date();
      const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      // hanya sinkron kalau yang ditoggle adalah tanggal hari ini di bulan yang sedang aktif
      if (day !== now.getDate() || this.currentYearMonth !== ym) return;

      const todayStr = `${ym}-${String(now.getDate()).padStart(2, '0')}`;
      const notifId = 'habit_' + habitId;
      try {
        const raw = WorkspaceStorage.getItem('ws_notif_action_status');
        const status = raw ? JSON.parse(raw) : {};
        if (!status[todayStr]) status[todayStr] = {};
        if (checked) {
          status[todayStr][notifId] = true;
        } else {
          delete status[todayStr][notifId];
        }
        WorkspaceStorage.setItem('ws_notif_action_status', JSON.stringify(status));
      } catch(_e) { /* ignore */ }

      // Beri tahu Panel Notifikasi & Agenda View (Google Calendar) untuk refresh status
      globalThis.dispatchEvent(new CustomEvent('ws-notif-status-updated', {
        detail: { date: todayStr, id: notifId, habitId, done: checked, source: 'habitTracker' }
      }));
    },
    createHabit() {
      if (!this.form.name.trim()) return;
      const newHabit = {
        id: 'habit-' + Date.now(),
        name: this.form.name,
        category: this.form.category,
        color: this.form.color,
        customColor: this.form.customColor,
        targetDaysPerMonth: this.form.target,
        timeSchedule: this.form.timeSchedule || '',
        history: { [this.currentYearMonth]: [] }
      };
      this.habits.unshift(newHabit);
      this.saveToStorage();
      this.form.name = '';
      this.form.target = 20;
      this.form.timeSchedule = '';
      this.showModal = false;
      this.showCategoryList = false;
      this.newCategoryInput = '';
    },
    removeHabit(id) {
      if (confirm('Apakah Anda yakin ingin menghapus habit komitmen ini?')) {
        this.habits = this.habits.filter(h => h.id !== id);
        if (this.selectedChartHabitId === id) this.selectedChartHabitId = null;
        this.saveToStorage();
      }
    },
    saveToStorage() {
      WorkspaceStorage.setItem('aesthetic_habit_tracker_habits', JSON.stringify(this.habits));
      this.syncHabitsToNotif();
    },

    // ── Auto-trigger habit dari notifikasi ──────────────────────────────
    _autoTriggerHabitFromNotif(habitId) {
      const today = new Date().getDate();
      const habit = this.habits.find(h => h.id === habitId);
      if (!habit) {
        this.$emit('habit-triggered');
        return;
      }

      const checked = habit.history[this.currentYearMonth] || [];
      const alreadyChecked = checked.includes(today);

      if (!alreadyChecked) {
        // Centang hari ini
        this.playCheckSound(true);
        this.toggleDayCheck(habitId, today);
      }

      // Set flash ID untuk animasi visual di tabel
      this.notifFlashHabitId = habitId;

      // Scroll ke baris habit di tabel
      this.$nextTick(() => {
        const tableRow = this.$el.querySelector(`tr[data-habit-id="${habitId}"]`);
        if (tableRow) {
          tableRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Hapus flash setelah animasi selesai
        setTimeout(() => {
          this.notifFlashHabitId = null;
          this.$emit('habit-triggered');
        }, 1800);
      });
    },
    syncHabitsToNotif() {
      // Ambil habits yang punya timeSchedule, ekspor ke storage untuk notif
      const habitsWithTime = this.habits
        .filter(h => h.timeSchedule && h.timeSchedule.trim())
        .map(h => ({
          id: 'habit_' + h.id,
          title: h.name,
          subtitle: h.category + ' · Habit harian',
          time: h.timeSchedule,
          timeVal: (() => {
            const [hh, mm] = h.timeSchedule.split(':').map(Number);
            return hh * 60 + (mm || 0);
          })(),
          habitId: h.id,
          color: h.customColor || '#10b981',
          page: 'habitTracker',
          category: h.category || '',
          isDzikirWaktu: h.category === 'Dzikir Waktu',
        }));
      WorkspaceStorage.setItem('ws_habit_notifs', JSON.stringify(habitsWithTime));
    },
    prevMonth() {
      this.$emit('prev-month');
    },
    nextMonth() {
      this.$emit('next-month');
    }
  }
};

// 7. Customization / Icon Mapping Menu Component
const IconManager = {
  props: {
    assignedIcons: Object,
    availableIcons: Array,
    pool: Object
  },
  template: `
    <div class="drawer-backdrop" @click.self="$emit('close')">
      <div class="drawer-content" style="animation: slideInRight 0.3s cubic-bezier(0.1, 0.9, 0.2, 1);">
        <div class="drawer-header">
          <h3>Pengaturan Ikon Menu Meja</h3>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>
        <p style="color: var(--text-muted); font-size: 13.5px; margin-bottom: 20px;">
          Sesuaikan ikon barang dari gambar untuk mewakili setiap halaman pribadi Anda. Pilihan ini akan langsung dimuat secara responsif pada meja kerja virtual Anda!
        </p>
        <!-- Dynamic Page Mapping -->
        <div v-for="page in pages" :key="page.id" class="drawer-section">
          <div class="page-assign-card">
            <div class="flex-between">
              <span style="font-weight: 600; font-size: 14.5px; color: var(--color-terracotta);">
                {{ page.num }}. {{ page.name }}
              </span>
              <span class="text-mono" style="font-size: 11px; font-weight: 500; color: var(--text-muted);">
                Aktif: {{ pool[assignedIcons[page.key].iconId]?.name || 'Custom URL' }}
              </span>
            </div>
            <!-- Upload / URL Input -->
            <div class="form-group" style="margin-bottom: 8px;">
              <label style="font-size: 11px;">Gunakan Custom Image URL (Opsional)</label>
              <input type="text" 
                     class="form-input" 
                     style="font-size: 12px; padding: 6px 10px;"
                     :value="assignedIcons[page.key].customUrl" 
                     @input="updateCustomUrl(page.key, $event.target.value)" 
                     placeholder="https://example.com/icon.png" />
            </div>
            <!-- SVG Illustration Grid selector -->
            <label style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Pilih Ikon-Meja Terkait:</label>
            <div class="asset-picker-grid">
              <div v-for="iconId in availableIcons" 
                   :key="iconId" 
                   class="asset-picker-item" 
                   :class="{ active: assignedIcons[page.key].iconId === iconId && !assignedIcons[page.key].customUrl }"
                   @click="selectIcon(page.key, iconId)"
                   :title="pool[iconId].name">
                <div style="width: 25px; height: 25px;" v-html="pool[iconId].svg"></div>
              </div>
            </div>
          </div>
        </div>
        <div style="margin-top: auto; padding-top: 16px;">
          <button class="btn btn-secondary" style="width: 100%;" @click="$emit('reset-layout')">
            Reset Posisi Layout Meja
          </button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      pages: [
        { id: 1, key: 'jobLogbook', num: 1, name: 'my 8-4 job logbook' },
        { id: 2, key: 'calendarMoment', num: 2, name: 'calendar moment' },
        { id: 3, key: 'contentTracker', num: 3, name: 'content plan and tracker' },
        { id: 4, key: 'interviewPractice', num: 4, name: 'interview practice' },
        { id: 5, key: 'dailyNutrition', num: 5, name: 'daily nutrition' },
        { id: 6, key: 'habitTracker', num: 6, name: 'personal habit tracker' },
        { id: 7, key: 'pomodoroTimer', num: 7, name: 'jam pasir pomodoro' },
        { id: 8, key: 'googleCalendar', num: 8, name: 'daily n' },
        { id: 9, key: 'financialTracker', num: 9, name: 'financial tracker' },
        { id: 11, key: 'careerFoundation', num: 11, name: 'career foundation' }
      ]
    };
  },
  methods: {
    selectIcon(pageKey, iconId) {
      this.$emit('update-mapping', { pageKey, iconId, customUrl: '' });
    },
    updateCustomUrl(pageKey, value) {
      this.$emit('update-mapping', { pageKey, customUrl: value });
    }
  }
};

// ============================================================================
// 8. JAM PASIR POMODORO WORKSPACE WEB VIEW (Vue 3 Component)
// ============================================================================
// Menghadirkan Pomodoro Timer interaktif berbentuk animasi Jam Pasir miring/terbalik
// dengan audio meditasi prosedural mandiri (Web Audio API) bebas lag.
// ============================================================================

// Procedural Audio Helper Functions using Browser AudioContext
let globalAudioCtx = null;
let ambienceNoiseNode = null;

const getAudioContext = () => {
  if (!globalAudioCtx) {
    globalAudioCtx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
};

const playTickSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, now);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.015, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  } catch (_e) { /* ignore */ }
};

const playZenBell = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Low, peaceful rich harmonics for Zen bowl feel
    const harmonics = [135, 270, 405, 540, 675];
    const volumes = [0.3, 0.15, 0.08, 0.04, 0.02];
    
    harmonics.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volumes[idx], now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 5);
    });
  } catch (_e) { /* ignore */ }
};

const playClassicAlarm = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Pulsing electronic alarm ringing
    for (let i = 0; i < 5; i++) {
      const t = now + i * 0.4;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, t);
      
      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(0.12, t + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, t + 0.25);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    }
  } catch (_e) { /* ignore */ }
};

const playGendingAlarm = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [392.00, 440.00, 523.25, 587.33]; // G4, A4, C5, D5 melodic arpeggio
    
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.2;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      
      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(0.2, t + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.8);
    });
  } catch (_e) { /* ignore */ }
};

const playSwooshSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.3);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (_e) { /* ignore */ }
};

const playForestBirdChirp = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const baseFreq = 750 + Math.random() * 450;
    
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.12;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 350, t + 0.06);
      
      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(0.008, t + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  } catch (_e) { /* ignore */ }
};

const startProceduralAmbience = (type) => {
  try {
    stopProceduralAmbience();
    if (type === 'none') return;
    
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Render loopable white noise buffer
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const sourceNode = ctx.createBufferSource();
    sourceNode.buffer = noiseBuffer;
    sourceNode.loop = true;
    
    const filterNode = ctx.createBiquadFilter();
    filterNode.type = 'lowpass';
    
    const gainNode = ctx.createGain();
    
    if (type === 'rain') {
      filterNode.frequency.value = 1100;
      gainNode.gain.value = 0.045;
    } else if (type === 'waves') {
      // Sweeping wind/ocean wave simulator
      filterNode.frequency.value = 350;
      gainNode.gain.value = 0.035;
      
      const sweepOsc = ctx.createOscillator();
      sweepOsc.frequency.value = 0.12; // slow waves
      const sweepGain = ctx.createGain();
      sweepGain.gain.value = 450;
      
      sweepOsc.connect(sweepGain);
      sweepGain.connect(filterNode.frequency);
      sweepOsc.start();
      sourceNode._sweep = sweepOsc;
    } else if (type === 'forest') {
      filterNode.frequency.value = 750;
      gainNode.gain.value = 0.02;
      
      // Infinite bird intervals
      const birdTimer = setInterval(() => {
        playForestBirdChirp();
      }, 7000);
      sourceNode._birdTimer = birdTimer;
    }
    
    sourceNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);
    sourceNode.start();
    
    ambienceNoiseNode = sourceNode;
  } catch (_e) { /* ignore */ }
};

const stopProceduralAmbience = () => {
  if (ambienceNoiseNode) {
    try {
      if (ambienceNoiseNode._sweep) ambienceNoiseNode._sweep.stop();
      if (ambienceNoiseNode._birdTimer) clearInterval(ambienceNoiseNode._birdTimer);
      ambienceNoiseNode.stop();
    } catch (_e) { /* ignore */ }
    ambienceNoiseNode = null;
  }
};

const PomodoroTimer = {
  template: `
    <div class="pomodoro-timer-screen" :class="'theme-' + currentTheme">
      
      <!-- Top Screen Banner / Header -->
      <div class="flex-between" style="padding-bottom: 20px; margin-bottom: 24px; align-items: center; border-bottom: none;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <!-- Rounded Square Icon with exact custom gradient and soft shadow -->
          <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #F39C12, #D67B52); border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(214, 123, 82, 0.25);">
            <!-- Stunning minimalist glass hour representation -->
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 2h14"></path>
              <path d="M5 22h14"></path>
              <path d="M19 2v4c0 3-2.5 4.5-5 5.5c2.5 1 5 2.5 5 5.5v4"></path>
              <path d="M5 2v4c0 3 2.5 4.5 5 5.5c-2.5 1-5 2.5-5 5.5v4"></path>
            </svg>
          </div>
          <div>
            <h2 style="font-size: 24px; font-weight: 800; color: #2C2621; margin: 0; line-height: 1.2; letter-spacing: -0.5px;">Jam Pasir Pomodoro</h2>
            <p style="color: #8F847A; font-family: 'Outfit', sans-serif; font-size: 13.5px; margin-top: 2px; font-weight: 500; letter-spacing: 0.2px;">Visual Metaphoric Timepiece</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <!-- Sound Toggle Icon Button with custom SVG -->
          <button @click="toggleMute" :title="isMuted ? 'Buka Suara' : 'Senyapkan'" style="padding: 0; border: 1.5px solid #E6DFD5; background-color: #FCFAF6; border-radius: 12px; width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: #7A6F66; transition: all 0.2s; box-shadow: 0 2px 5px rgba(44,38,33,0.02);">
            <svg v-if="isMuted" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </button>
          
          <!-- Settings Modal Button with custom SVG -->
          <button @click="showSettingsModal = true" style="font-weight: 700; padding: 0 16px; height: 42px; border: 1.5px solid #E6DFD5; background-color: #FCFAF6; border-radius: 12px; font-family: 'Outfit', sans-serif; font-size: 13.5px; display: flex; align-items: center; gap: 8px; cursor: pointer; color: #4A3F35; transition: all 0.2s; box-shadow: 0 2px 5px rgba(44,38,33,0.02);">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Pengaturan</span>
          </button>
        </div>
      </div>

      <!-- Main Container Card -->
      <div class="pomo-page-card">
        <!-- 1. Modes Selector Tab Panels -->
        <div class="pomo-tabs-row">
          <button class="pomo-tab-btn" :class="{ active: currentMode === 'focus' }" @click="changeMode('focus')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Kerja ({{ minutesFocus }}m)
          </button>
          <button class="pomo-tab-btn" :class="{ active: currentMode === 'shortBreak' }" @click="changeMode('shortBreak')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
            Istirahat ({{ minutesShortBreak }}m)
          </button>
          <button class="pomo-tab-btn" :class="{ active: currentMode === 'longBreak' }" @click="changeMode('longBreak')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707"></path>
            </svg>
            Panjang ({{ minutesLongBreak }}m)
          </button>
        </div>

        <!-- 2. Dynamic Motivational Quotes Box -->
        <div class="pomo-quote-box">
          "{{ currentQuote }}"
        </div>

        <!-- 3. Grid Row containing Hourglass illustration & Numeric timer values side by side -->
        <div class="grid-2 animate-fade-in" style="grid-template-columns: 1fr 1.15fr; gap: 48px; align-items: center; padding: 20px 0;">
          
          <!-- Column A: Animated rotating Hourglass Box -->
          <div style="text-align: center; position: relative; display: flex; align-items: center; justify-content: center; min-height: 280px;">
            <!-- Soft atmospheric glow behind the hourglass -->
            <div style="position: absolute; width: 265px; height: 265px; background: radial-gradient(circle, rgba(214, 123, 82, 0.08) 0%, rgba(214, 123, 82, 0) 70%); pointer-events: none; border-radius: 50%; z-index: 1;"></div>
            
            <div class="hourglass-g-wrapper" style="position: relative; z-index: 2;">
              <div class="hourglass-g" :style="{ transform: 'rotate(' + rotationDegrees + 'deg)' }">
                
                <!-- Dynamic Hourglass Render - Tall Aspect Ratio (viewBox 0 0 100 140) -->
                <svg viewBox="0 0 100 140" style="width: 100%; height: 100%;">
                  <defs>
                    <!-- Clips the top sand to shrink downwards -->
                    <clipPath id="pomo-top-clip">
                      <rect x="0" :y="26.5 + (40.5 * progressFraction)" width="100" height="40.5" />
                    </clipPath>
                    <!-- Clips the bottom sand pile to rise upwards -->
                    <clipPath id="pomo-bottom-clip">
                      <rect x="0" :y="107.5 - (40.5 * progressFraction)" width="100" height="40.5" />
                    </clipPath>
                  </defs>

                  <!-- Physical Frame Base caps -->
                  <rect x="23" y="19" width="54" height="7.5" rx="2" fill="#2C2621" />
                  <rect x="23" y="107.5" width="54" height="7.5" rx="2" fill="#2C2621" />
                  
                  <!-- Left and Right Supporting Columns -->
                  <rect x="21" y="26.5" width="3.5" height="81" fill="#2C2621" rx="0.5" />
                  <rect x="75.5" y="26.5" width="3.5" height="81" fill="#2C2621" rx="0.5" />

                  <!-- Main Transparent Bulb Shell Background (soft white to give glass texture) -->
                  <path d="M 31 26.5 L 69 26.5 C 69 48, 54 55, 54 67 C 54 79, 69 86, 69 107.5 L 31 107.5 C 31 86, 46 79, 46 67 C 46 55, 31 48, 31 26.5 Z" 
                        fill="#FFFFFF" fill-opacity="0.85" stroke="#2C2621" stroke-width="3" stroke-linejoin="round" />

                  <!-- Draining Top Sand Volume -->
                  <path d="M 31 26.5 L 69 26.5 C 69 48, 54 55, 54 67 L 46 67 C 46 55, 31 48, 31 26.5 Z" 
                        fill="var(--pomo-primary)" clip-path="url(#pomo-top-clip)" />

                  <!-- Dynamic Moving Grains Stream line (only visible when running) -->
                  <line v-if="isRunning && timeLeft > 0" x1="50" y1="67" x2="50" y2="105.5" stroke="var(--pomo-primary)" stroke-width="1.8" 
                        stroke-dasharray="2,3" class="sand-stream-active" />

                  <!-- Piling Bottom Sand Volume -->
                  <path d="M 46 67 L 54 67 C 54 79, 69 86, 69 107.5 L 31 107.5 C 31 86, 46 79, 46 67 Z" 
                        fill="var(--pomo-primary)" clip-path="url(#pomo-bottom-clip)" />

                  <!-- Animated Sand mound heap tip sitting at center base -->
                  <path v-if="progressFraction > 0 && progressFraction < 1" d="M 36 107.5 Q 50 82 64 107.5 Z" fill="var(--pomo-primary)" />

                  <!-- Glass Glare shimmer highlight for stunning realism -->
                  <path d="M 34 32 C 34 46, 43 53, 45 61" fill="none" stroke="#FFFFFF" stroke-opacity="0.65" stroke-width="1.5" stroke-linecap="round" />
                  <path d="M 66 102 C 66 88, 57 81, 55 73" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1.2" stroke-linecap="round" />
                </svg>

              </div>
            </div>
          </div>

          <!-- Column B: Numeric remaining time & controls info -->
          <div style="text-align: left; display: flex; flex-direction: column; justify-content: center;">
            <span style="font-size: 13.5px; font-weight: 700; color: #9A8E85; text-transform: uppercase; letter-spacing: 1.5px; font-family: 'Outfit', sans-serif;">
              WAKTU TERSISA
            </span>
            <div style="font-size: 92px; font-weight: 700; color: #2C2621; margin: 4px 0 16px 0; line-height: 1; font-family: 'Outfit', 'Inter', sans-serif; letter-spacing: -2px;">
              {{ formattedTime }}
            </div>

            <!-- Stationary vs Flowing status flag badge -->
            <div style="margin-bottom: 24px;">
              <span class="pill" 
                    :style="{ 
                      backgroundColor: isRunning ? 'var(--pomo-pill-bg)' : 'rgba(16, 185, 129, 0.08)', 
                      color: isRunning ? 'var(--pomo-primary)' : '#10B981',
                      borderColor: isRunning ? 'color-mix(in srgb, var(--pomo-primary) 20%, transparent)' : 'rgba(16, 185, 129, 0.2)'
                    }" 
                    style="font-size: 13.5px; font-weight: 700; padding: 6px 14px; border-radius: 40px; border: 1.2px solid; display: inline-flex; align-items: center; gap: 6px; font-family: 'Outfit', sans-serif; transition: all 0.2s ease;">
                <!-- Elegant SVG check status icon -->
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>{{ isRunning ? 'Sandglass is flowing' : 'Sandglass is stationary' }}</span>
              </span>
            </div>

            <!-- Visual Line Progress Bar matching image layout -->
            <div style="width: 250px; max-width: 100%; height: 6px; background-color: #EDEAE4; border-radius: 10px; overflow: hidden; position: relative;">
              <div :style="{ width: ((1 - progressFraction) * 100) + '%', backgroundColor: 'var(--pomo-primary)' }" style="height: 100%; border-radius: 10px; transition: width 0.3s ease;"></div>
            </div>
          </div>
        </div>

        <!-- 4. Under Card Button actions line -->
        <div style="display: flex; gap: 16px; justify-content: center; margin-top: 24px; flex-wrap: wrap;">
          <!-- Primary Focus Toggle Button -->
          <button @click="toggleTimer" style="background-color: var(--pomo-primary); border: none; padding: 14px 36px; font-size: 16px; font-weight: 700; display: inline-flex; align-items: center; gap: 10px; border-radius: 16px; cursor: pointer; color: #FFFFFF; font-family: 'Outfit', sans-serif; transition: all 0.2s; box-shadow: 0 4px 14px color-mix(in srgb, var(--pomo-primary) 25%, transparent);">
            <svg v-if="!isRunning" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="none">
              <polygon points="6 3 20 12 6 21 6 3"></polygon>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="none">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
            <span>{{ isRunning ? 'Jeda Fokus' : 'Mulai Fokus' }}</span>
          </button>
          
          <!-- Physical Flip Button -->
          <button @click="flipHourglass" title="Balik jam pasir" style="padding: 14px 28px; font-size: 14.5px; border-radius: 16px; font-weight: 700; font-family: 'Outfit', sans-serif; background-color: #EDEAE4; border: none; color: #5A4E42; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; cursor: pointer;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
            <span>Balik Jam Pasir (Flip)</span>
          </button>

          <!-- Simple Reset Button -->
          <button @click="resetTimer(true)" title="Setel Ulang" style="padding: 12px; width: 48px; height: 48px; border-radius: 16px; font-size: 14.5px; background-color: #EDEAE4; border: none; color: #5A4E42; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Riwayat Sesi Hari Ini Card perfectly matching layout image bottom -->
      <div class="pomo-history-card animate-fade-in" style="margin-top: 24px; background: #FCFAF6; border: 1.5px solid #E6DFD5; border-radius: 16px; padding: 24px; box-shadow: var(--shadow-sm); text-align: left;">
        <div style="font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 700; color: #2C2621; display: flex; align-items: center; gap: 10px; border-bottom: 1.2px solid rgba(44,38,33,0.06); padding-bottom: 12px; margin-bottom: 16px;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #7A6F66;">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Riwayat Sesi Hari Ini</span>
        </div>

        <div v-if="historyLogs.length === 0" style="text-align: center; padding: 20px 0; color: var(--text-muted); font-size: 14px; font-style: italic; font-family: 'Outfit', sans-serif;">
          Belum ada sesi Pomodoro yang diselesaikan hari ini. Semangat!
        </div>
        <div v-else class="flex-column" style="gap: 8px; display: flex; flex-direction: column;">
          <div v-for="log in historyLogs" :key="log.id" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background-color: #FAF8F4; border-radius: 10px; border: 1px solid rgba(44,38,33,0.04);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 16px; display: inline-flex; align-items: center;">
                <span v-if="log.mode === 'focus'" style="display: inline-flex; align-items: center;"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #D67B52;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></span>
                <span v-else style="display: inline-flex; align-items: center;"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-sage);"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg></span>
              </span>
              <div>
                <span style="font-weight: 700; font-size: 13.5px; color: #2C2621;">{{ log.label }}</span>
                <span style="font-size: 12px; color: var(--text-muted); margin-left: 8px;">({{ log.duration }} menit)</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="text-mono" style="font-size: 12px; color: var(--text-muted); font-weight: 600;">{{ log.time }}</span>
              <button @click="deleteHistoryLog(log.id)" style="background: none; border: none; cursor: pointer; color: #9A8A7C; padding: 2px; display: inline-flex; align-items: center; justify-content: center;" title="Hapus catatan">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Ambient noise audio activation guide banner if required / visible -->
      <div v-if="ambienceType !== 'none' && !isRunning && !isMuted" class="drawer-section" style="margin-top: 24px; background-color: var(--pomo-pill-bg); border-color: var(--pomo-primary); padding: 14px; border-radius: 12px; text-align: center;">
        <p style="font-size: 13px; color: var(--pomo-primary); font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          Latar Belakang "{{ getAmbienceLabel(ambienceType) }}" siap berdengung saat waktu mulai fokus ditekan!
        </p>
      </div>

      <!-- Splendid In-App Completion Banner (instead of generic blocked alerts) -->
      <transition name="popIn">
        <div v-if="showSuccessBanner" style="position: fixed; top: 24px; left: 50%; transform: translateX(-50%); z-index: 200; background-color: var(--pomo-pill-bg); border: 2.5px solid var(--pomo-primary); border-radius: 16px; padding: 24px; width: 90%; max-width: 450px; box-shadow: var(--shadow-lg); text-align: center;">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--pomo-primary); display: block; margin: 0 auto 12px auto;"><path d="M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 8h12"></path><path d="M18.5 17.5 22 21"></path><path d="m16 16 2.5 2.5"></path><path d="v13.5a1.5 1.5 0 0 1-3 0V20"></path><path d="M12 16v13.5A1.5 1.5 0 0 1 9 20"></path><path d="M5.5 17.5 2 21"></path><path d="m8 16-2.5 2.5"></path></svg>
          <h4 style="font-size: 18px; font-weight: bold; color: var(--pomo-primary); ">WAKTU SESI SELESAI!</h4>
          <p style="font-size: 13.5px; margin-top: 6px; color: var(--text-dark);">
            Sesi {{ currentMode === 'focus' ? 'Fokus Kerja' : 'Istirahat' }} Anda telah diselesaikan dengan sangat baik. Terus pertahankan ritme disiplin ini!
          </p>
          <button class="btn btn-primary" @click="showSuccessBanner = false" :style="{ backgroundColor: 'var(--pomo-primary)', borderColor: 'var(--pomo-primary)', color: '#fff' }" style="margin-top: 14px; padding: 6px 16px; font-size: 13px; width: auto; border-radius: 8px; cursor: pointer;">
            Tutup & Lanjutkan
          </button>
        </div>
      </transition>

      <!-- 5. Settings Modal Form Dialog mapping coordinates perfectly onto Image #2 -->
      <div v-if="showSettingsModal" class="modal-backdrop" @click.self="showSettingsModal = false">
        <div class="drawer-section" style="width: 100%; max-width: 480px; background-color: #FAF6F0; border-radius: 20px; border: 2px solid var(--color-sand); padding: 24px; box-shadow: var(--shadow-lg); animation: popIn 0.25s ease;">
          
          <div class="flex-between" style="border-bottom: 1.5px solid var(--color-sand); padding-bottom: 12px; margin-bottom: 18px;">
            <h3 style="font-size: 18px; color: var(--text-dark); display: flex; align-items: center; gap: 8px;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--text-dark);"><circle cx="12" cy="12" r="3"></circle><path d="m19.4 15-1.2-.4a1.6 1.6 0 0 1-1-1.5V11.2c0-.6.4-1.2 1-1.5l1.2-.4M4.6 9l1.2.4c.6.3 1 .9 1 1.5v1.6a1.6 1.6 0 0 1-1 1.5L4.6 15m4.4-6-.4-1.2A1.6 1.6 0 0 1 10.1 6.8h1.6c.6 0 1.2.4 1.5 1l.4 1.2M15 19.4l-.4-1.2A1.6 1.6 0 0 1 13.1 17.2h-1.6a1.6 1.6 0 0 1-1.5-1l-.4-1.2"></path></svg>
              Pengaturan Jam Pasir
            </h3>
            <button class="card-nav-btn" @click="showSettingsModal = false" style="font-size: 20px; font-weight: bold; background: none; border: none; cursor: pointer; color: var(--text-muted);">×</button>
          </div>

          <!-- Durations controls standard slider bindings -->
          <div style="margin-bottom: 20px;">
            <label class="text-mono" style="font-size: 11px; font-weight: bold; color: var(--text-muted); display: block; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              ⏳ Sesuaikan Durasi Waktu (Menit)
            </label>
            
            <div style="margin-bottom: 14px;">
              <div class="flex-between" style="font-size: 13px; margin-bottom: 4px;">
                <span style="font-weight: 600; color: var(--text-dark);">Fokus / Kerja:</span>
                <strong style="color: var(--pomo-primary);">{{ minutesFocus }} min</strong>
              </div>
              <input type="range" min="1" max="60" class="pomo-slider" v-model.number="minutesFocus" @change="saveState" />
            </div>

            <div style="margin-bottom: 14px;">
              <div class="flex-between" style="font-size: 13px; margin-bottom: 4px;">
                <span style="font-weight: 600; color: var(--text-dark);">Istirahat Pendek:</span>
                <strong style="color: var(--pomo-primary);">{{ minutesShortBreak }} min</strong>
              </div>
              <input type="range" min="1" max="20" class="pomo-slider" v-model.number="minutesShortBreak" @change="saveState" />
            </div>

            <div>
              <div class="flex-between" style="font-size: 13px; margin-bottom: 4px;">
                <span style="font-weight: 600; color: var(--text-dark);">Istirahat Panjang:</span>
                <strong style="color: var(--pomo-primary);">{{ minutesLongBreak }} min</strong>
              </div>
              <input type="range" min="1" max="45" class="pomo-slider" v-model.number="minutesLongBreak" @change="saveState" />
            </div>
          </div>

          <!-- Sound Ambient setups -->
          <div style="margin-bottom: 20px; border-top: 1.5px solid var(--color-sand); padding-top: 14px;">
            <label class="text-mono" style="font-size: 11px; font-weight: bold; color: var(--text-muted); display: block; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px;">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
              Suara Latar & Ambience
            </label>

            <div class="form-group">
              <label style="font-size: 12.5px; font-weight: 600; color: var(--text-dark);">Ambience Latar:</label>
              <select class="form-input" v-model="ambienceType" @change="handleAmbienceChange" style="font-size: 13px; padding: 6px 12px; height: 38px;">
                <option value="none">Hening (Hening Malam)</option>
                <option value="rain">Hujan Rintik (Rain)</option>
                <option value="waves">Deburan Ombak (Ocean)</option>
                <option value="forest">Hutan Damai (Forest)</option>
              </select>
            </div>

            <!-- Ticking Enabled toggle switch -->
            <div class="form-group" style="margin-top: 12px;">
              <div class="switch-container">
                <span style="font-size: 12.5px; font-weight: 600; color: var(--text-dark);">Detak Jam (Ticking Tock):</span>
                <label class="switch-box">
                  <input type="checkbox" v-model="tickingEnabled" @change="saveState" />
                  <span class="switch-slider"></span>
                </label>
              </div>
            </div>

            <div class="form-group" style="margin-top: 12px;">
              <label style="font-size: 12.5px; font-weight: 600; color: var(--text-dark);">Suara Alarm Selesai:</label>
              <select class="form-input" v-model="alarmType" @change="saveState" style="font-size: 13px; padding: 6px 12px; height: 38px;">
                <option value="zen">Genta Zen (Tibetan Bell)</option>
                <option value="classic">Kring Alarm Klasik</option>
                <option value="gending">Gending Melodi</option>
              </select>
            </div>
          </div>

          <!-- Divider and Close action row -->
          <div style="border-top: 1.5px solid var(--color-sand); margin-bottom: 20px;"></div>

          <button class="btn btn-primary" @click="showSettingsModal = false" :style="{ backgroundColor: 'var(--pomo-primary)', borderColor: 'var(--pomo-primary)', color: '#fff' }" style="width: 100%; border-radius: 12px; font-weight: bold; cursor: pointer;">
            Selesai & Tutup Pengaturan
          </button>
        </div>
      </div>

    </div>
  `,
  data() {
    return {
      minutesFocus: 25,
      minutesShortBreak: 5,
      minutesLongBreak: 15,
      currentMode: 'focus', // 'focus', 'shortBreak', 'longBreak'
      timeLeft: 25 * 60,
      totalDuration: 25 * 60,
      isRunning: false,
      isMuted: false,
      rotationDegrees: 0,
      showSettingsModal: false,
      showSuccessBanner: false,
      ambienceType: 'none', // 'none', 'rain', 'waves', 'forest'
      tickingEnabled: false,
      alarmType: 'zen', // 'zen', 'classic', 'gending'
      currentTheme: 'warm-sand', // 'warm-sand', 'midnight', 'sunset-rose', 'nordic-sage'
      quotes: {
        focus: [
          "Mari fokus penuh. Setiap bulir pasir membawa Anda lebih dekat ke tujuan.",
          "Konsentrasi adalah kunci. Abaikan gangguan sekitar and nikmati prosesnya.",
          "Satu bulir demi satu bulir, waktu mengalir membawa hasil luar biasa.",
          "Waktu Anda berharga. Manfaatkan momen ini untuk karya terbaik Anda."
        ],
        shortBreak: [
          "Waktunya istirahat sejenak. Regangkan tubuh dan hirup napas dalam.",
          "Ambil air minum dan segarkan kembali pikiran Anda.",
          "Istirahat pendek untuk mengisi energi kembali."
        ],
        longBreak: [
          "Matikan layar, hirup udara segar, saatnya relaksasi menyeluruh.",
          "Anda telah berkinerja luar biasa. Mari kita isi kembali baterai energi diri.",
          "Nikmati ketenangan sebelum melangkah ke capaian berikutnya."
        ]
      },
      currentQuoteIndex: 0,
      timerInterval: null,
      historyLogs: [],
      hasEverStarted: false
    };
  },
  computed: {
    formattedTime() {
      const m = Math.floor(this.timeLeft / 60);
      const s = this.timeLeft % 60;
      return `${String(m).padStart(2, '0')} : ${String(s).padStart(2, '0')}`;
    },
    progressFraction() {
      if (this.totalDuration <= 0) return 0;
      // Drained sand fraction = elapsed / total
      const elapsed = this.totalDuration - this.timeLeft;
      const progress = elapsed / this.totalDuration;
      return parseFloat(Math.min(1.0, Math.max(0.0, progress)).toFixed(4));
    },
    currentQuote() {
      const modeQuotes = this.quotes[this.currentMode] || this.quotes.focus;
      return modeQuotes[this.currentQuoteIndex % modeQuotes.length];
    }
  },
  watch: {
    minutesFocus(newVal) {
      if (this.currentMode === 'focus' && !this.isRunning) {
        this.timeLeft = newVal * 60;
        this.totalDuration = newVal * 60;
      }
    },
    minutesShortBreak(newVal) {
      if (this.currentMode === 'shortBreak' && !this.isRunning) {
        this.timeLeft = newVal * 60;
        this.totalDuration = newVal * 60;
      }
    },
    minutesLongBreak(newVal) {
      if (this.currentMode === 'longBreak' && !this.isRunning) {
        this.timeLeft = newVal * 60;
        this.totalDuration = newVal * 60;
      }
    }
  },
  async mounted() {
    // ✅ FIX: Tunggu Supabase storage siap sebelum baca data
    await globalThis._workspaceStorageReady;
    this.loadState();
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    stopProceduralAmbience();
    // Hanya simpan ke localStorage kalau timer pernah distart oleh user
    // Tanpa ini, setiap navigasi pergi dari Pomodoro akan nulis state ke localStorage
    // meskipun timer belum pernah dipakai (timeLeft default 1500 selalu > 0)
    if (this.hasEverStarted && this.timeLeft > 0) {
      const deadline = this.isRunning
        ? Date.now() + (this.timeLeft * 1000)
        : null;
      const state = {
        isRunning: this.isRunning,
        timeLeft: this.timeLeft,
        totalDuration: this.totalDuration,
        currentMode: this.currentMode,
        deadline: deadline,
        everStarted: true,
        ts: Date.now()
      };
      localStorage.setItem('pomo_floating_state', JSON.stringify(state));
    }
  },
  methods: {
    loadState() {
      const state = WorkspaceStorage.getItem('personal_workspace_pomo_tracker');
      if (state) {
        try {
          const parsed = JSON.parse(state);
          this.minutesFocus = parsed.minutesFocus || 25;
          this.minutesShortBreak = parsed.minutesShortBreak || 5;
          this.minutesLongBreak = parsed.minutesLongBreak || 15;
          this.currentTheme = parsed.currentTheme || 'warm-sand';
          this.ambienceType = parsed.ambienceType || 'none';
          this.tickingEnabled = !!parsed.tickingEnabled;
          this.alarmType = parsed.alarmType || 'zen';
          this.isMuted = !!parsed.isMuted;
        } catch (_e) { /* ignore */ }
      }
      // Load history logs
      const savedLogs = WorkspaceStorage.getItem('personal_workspace_pomo_history_logs');
      if (savedLogs) {
        try {
          this.historyLogs = JSON.parse(savedLogs);
        } catch (_e) {
          this.historyLogs = [];
        }
      } else {
        this.historyLogs = [];
      }
      // Cek apakah ada timer aktif atau pause di localStorage
      try {
        const raw = localStorage.getItem('pomo_floating_state');
        if (raw) {
          const floatState = JSON.parse(raw);
          // Hanya resume kalau pernah distart (everStarted) dan masih ada sisa waktu
          if (floatState.everStarted && floatState.timeLeft > 0) {
            this.currentMode = floatState.currentMode || 'focus';
            this.totalDuration = floatState.totalDuration || this.minutesFocus * 60;

            if (floatState.isRunning && floatState.deadline) {
              // Sedang running — hitung sisa dari deadline
              const remaining = Math.round((floatState.deadline - Date.now()) / 1000);
              if (remaining > 0) {
                this.timeLeft = remaining;
                this.isRunning = false;
                this.startTimer();
                return;
              }
            } else if (!floatState.isRunning && floatState.timeLeft > 0) {
              // Sedang pause — restore timeLeft tanpa start
              this.timeLeft = floatState.timeLeft;
              this.isRunning = false;
              return;
            }
          }
        }
      } catch(_e) { /* ignore */ }
      this.resetTimer(false);
    },
    saveState() {
      const state = {
        minutesFocus: this.minutesFocus,
        minutesShortBreak: this.minutesShortBreak,
        minutesLongBreak: this.minutesLongBreak,
        currentTheme: this.currentTheme,
        ambienceType: this.ambienceType,
        tickingEnabled: this.tickingEnabled,
        alarmType: this.alarmType,
        isMuted: this.isMuted
      };
      WorkspaceStorage.setItem('personal_workspace_pomo_tracker', JSON.stringify(state));
    },
    selectTheme(theme) {
      this.currentTheme = theme;
      this.saveState();
    },
    getAmbienceLabel(val) {
      const labels = {
        'none': 'Hening',
        'rain': 'Hujan Rintik',
        'waves': 'Deburan Ombak',
        'forest': 'Hutan Damai'
      };
      return labels[val] || val;
    },
    toggleMute() {
      this.isMuted = !this.isMuted;
      this.saveState();
      
      if (this.isMuted) {
        stopProceduralAmbience();
      } else if (this.isRunning && this.ambienceType !== 'none') {
        startProceduralAmbience(this.ambienceType);
      }
    },
    changeMode(mode) {
      this.currentMode = mode;
      
      // Cycling motivation quote
      const modeQuotes = this.quotes[this.currentMode];
      this.currentQuoteIndex = Math.floor(Math.random() * modeQuotes.length);
      
      this.resetTimer(true);
    },
    resetTimer(stopActive = true) {
      if (stopActive) {
        this.pauseTimer();
      }
      
      let mins = this.minutesFocus;
      if (this.currentMode === 'shortBreak') mins = this.minutesShortBreak;
      if (this.currentMode === 'longBreak')  mins = this.minutesLongBreak;
      
      this.timeLeft      = mins * 60;
      this.totalDuration = mins * 60;
      this.showSuccessBanner = false;
      this.hasEverStarted = false;

      // Selalu bersihkan floating state saat timer direset agar floating tidak muncul lagi
      localStorage.removeItem('pomo_floating_state');
      globalThis.dispatchEvent(new CustomEvent('pomo-state-update', { detail: {
        isRunning: false, timeLeft: 0, totalDuration: 0, deadline: null, everStarted: false
      }}));
    },
    toggleTimer() {
      if (this.isRunning) {
        this.pauseTimer();
      } else {
        this.startTimer();
      }
    },
    // Broadcast current timer state ke localStorage agar FloatingCountdownTimer
    // bisa membacanya secara global dari halaman mana pun
    broadcastTimerState() {
      const deadline = (this.isRunning && this.timeLeft > 0)
        ? Date.now() + (this.timeLeft * 1000)
        : null;
      const state = {
        isRunning: this.isRunning,
        timeLeft: this.timeLeft,
        totalDuration: this.totalDuration,
        currentMode: this.currentMode,
        formattedTime: this.formattedTime,
        deadline: deadline,
        everStarted: true,
        ts: Date.now()
      };
      localStorage.setItem('pomo_floating_state', JSON.stringify(state));
      globalThis.dispatchEvent(new CustomEvent('pomo-state-update', { detail: state }));
    },
    startTimer() {
      if (this.timerInterval) return;
      
      // Ensure Web Audio initialisation gets activated
      getAudioContext();
      
      this.isRunning = true;
      this.hasEverStarted = true;
      this.showSuccessBanner = false;
      
      // Fire ambient generator (if enabled)
      if (!this.isMuted && this.ambienceType !== 'none') {
        startProceduralAmbience(this.ambienceType);
      }
      
      this.broadcastTimerState();
      
      this.timerInterval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
          this.broadcastTimerState();
          
          // Regular clock ticking hum
          if (this.tickingEnabled && !this.isMuted) {
            playTickSound();
          }
        } else {
          this.handleTimerEnd();
        }
      }, 1000);
    },
    pauseTimer() {
      this.isRunning = false;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      stopProceduralAmbience();
      this.broadcastTimerState();
    },
    flipHourglass() {
      playSwooshSound();
      
      // Increment 180 degrees spin
      this.rotationDegrees += 180;
      
      // Reset remaining seconds to full count and auto-trigger stream flows
      this.resetTimer(false);
      this.startTimer();
    },
    handleTimerEnd() {
      this.isRunning = false;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      stopProceduralAmbience();
      this.broadcastTimerState();
      
      // Fire procedural finish notification rings
      if (!this.isMuted) {
        if (this.alarmType === 'zen') playZenBell();
        else if (this.alarmType === 'classic') playClassicAlarm();
        else if (this.alarmType === 'gending') playGendingAlarm();
      }
      
      // Display visual banner instead of blocking system prompts
      this.showSuccessBanner = true;

      // Log the completed session to history
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      let durationMins = this.minutesFocus;
      let modeLabel = 'Fokus Kerja';
      
      if (this.currentMode === 'shortBreak') {
        durationMins = this.minutesShortBreak;
        modeLabel = 'Istirahat Pendek';
      } else if (this.currentMode === 'longBreak') {
        durationMins = this.minutesLongBreak;
        modeLabel = 'Istirahat Panjang';
      }

      this.historyLogs.unshift({
        id: Date.now(),
        mode: this.currentMode,
        label: modeLabel,
        duration: durationMins,
        time: timeStr
      });
      this.historyLogs = this.historyLogs.slice(0, 10);
      WorkspaceStorage.setItem('personal_workspace_pomo_history_logs', JSON.stringify(this.historyLogs));
    },
    deleteHistoryLog(id) {
      this.historyLogs = this.historyLogs.filter(log => log.id !== id);
      WorkspaceStorage.setItem('personal_workspace_pomo_history_logs', JSON.stringify(this.historyLogs));
    },
    handleAmbienceChange() {
      this.saveState();
      if (this.isRunning) {
        if (this.isMuted || this.ambienceType === 'none') {
          stopProceduralAmbience();
        } else {
          startProceduralAmbience(this.ambienceType);
        }
      }
    }
  }
};

// ============================================================================
// 9. GOOGLE CALENDAR SYNC COMPONENT (Vue 3 Component)
// ============================================================================
// Integrasi nyata ke Google Calendar API dengan otentikasi login email modern
// lewat Firebase SDK, dukung sinkronisasi agenda live, tambah acara, & hapus acara.
// ============================================================================
const GoogleCalendar = {
  template: `
    <div class="google-calendar-screen">
      
      <!-- Top Screen Banner / Header -->
      <div class="flex-between" style="border-bottom: 2px solid var(--color-sand); padding-bottom: 16px; margin-bottom: 24px; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 800; color: var(--text-dark); margin: 0 0 4px 0;">daily n</h2>
          <p style="color: var(--text-muted); font-size: 13.5px; margin-top: 4px;">Sinkronisasikan agenda kesibukan & jadwal harian Anda secara langsung</p>
        </div>
        <!-- Profile metadata status if signed in -->
        <div v-if="user" class="flex-gap" style="align-items: center;">
          <div style="text-align: right; display: flex; flex-direction: column; justify-content: center;">
            <span style="font-weight: 600; font-size: 14.2px; color: var(--text-dark);">{{ user.displayName || 'Pengguna Google' }}</span>
            <span style="font-size: 11px; color: var(--text-muted); font-family: monospace;">{{ user.email }}</span>
          </div>
          <img :src="user.photoURL || 'https://www.gravatar.com/avatar/?d=mp'" 
               style="width: 38px; height: 38px; border-radius: 50%; border: 1.5px solid var(--color-gold); object-fit: cover;" />
          <button class="btn btn-secondary" @click="handleSignOut" style="font-size: 11px; padding: 6px 12px; margin-left: 8px; display: inline-flex; align-items: center; gap: 4px;">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Keluar
          </button>
        </div>

        <!-- ========== AGENDA FILTER (custom color per kategori) ========== -->
        <transition name="agenda-filter-slide">
          <div v-if="localView==='agenda'" class="gcal-agenda-filter-bar" style="flex: 1 0 100%; width: 100%;">
            <div class="gcal-agenda-filter-header" @click="agendaFilterOpen = !agendaFilterOpen">
              <div style="display:flex; align-items:center; gap:7px;">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-terracotta);"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                <span style="font-size:11.5px; font-weight:700; color:var(--text-dark);">Tampilkan di agenda</span>
                <span v-if="agendaActiveFilterCount < 3" class="gcal-filter-active-badge">{{ agendaActiveFilterCount }}/3</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <button type="button" class="gcal-filter-manage-cat-btn" @click.stop="showManageCategoryModal = true" title="Kelola Kategori Pengingat">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                     :style="{ transition:'transform 0.2s', transform: agendaFilterOpen ? 'rotate(180deg)' : 'rotate(0deg)', color:'var(--text-muted)' }">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            <transition name="agenda-filter-expand">
              <div v-if="agendaFilterOpen" class="gcal-agenda-filter-list">
                <label v-for="f in agendaFilterOptions" :key="f.key" class="gcal-agenda-filter-item" :class="{ checked: agendaFilters[f.key] }">
                  <span class="gcal-filter-checkbox" :style="{ borderColor: agendaFilterColors[f.key], background: agendaFilters[f.key] ? agendaFilterColors[f.key] : 'transparent' }" @click.prevent="agendaFilters[f.key] = !agendaFilters[f.key]">
                    <svg v-if="agendaFilters[f.key]" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  <span class="gcal-filter-dot" :style="{ background: agendaFilterColors[f.key] }"></span>
                  <span class="gcal-filter-label">{{ f.label }}</span>
                  <span class="gcal-filter-color-picker" @click.stop title="Pilih warna kategori ini">
                    <input
                      type="color"
                      class="gcal-filter-color-input"
                      :value="agendaFilterColors[f.key]"
                      @input="localUpdateFilterColor(f.key, $event.target.value)"
                    />
                  </span>
                </label>
                <button type="button" class="gcal-filter-reset-btn" @click.stop="localResetFilterColors()" title="Kembalikan warna default">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/></svg>
                  Reset warna
                </button>
              </div>
            </transition>
          </div>
        </transition>

        <!-- ========== MODAL: KELOLA KATEGORI PENGINGAT ========== -->
        <div v-if="showManageCategoryModal" class="gcal-modal-overlay" @click.self="showManageCategoryModal=false">
          <div class="gcal-modal">
            <div class="gcal-modal-header">
              <span style="font-size:16px;font-weight:700;color:#3c4043;">Kelola Kategori Pengingat</span>
              <button @click="showManageCategoryModal=false" class="gcal-modal-close">&#215;</button>
            </div>
            <div class="gcal-modal-body">
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">Kategori custom dipakai saat membuat Pengingat Manual & filter agenda. Kategori default "Pengingat" tidak bisa dihapus.</p>

              <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px;">
                <span style="display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:14px; font-size:12px; font-weight:600;"
                  :style="{ backgroundColor: agendaFilterColors.manual + '18', color: agendaFilterColors.manual, border: '1px solid ' + agendaFilterColors.manual + '50' }">
                  Pengingat (Default)
                </span>
                <span v-for="cat in customReminderCategories" :key="cat.key"
                  style="display:inline-flex; align-items:center; gap:6px; padding:5px 8px 5px 12px; border-radius:14px; font-size:12px; font-weight:600;"
                  :style="{ backgroundColor: cat.color + '18', color: cat.color, border: '1px solid ' + cat.color + '50' }">
                  {{ cat.label }}
                  <button type="button" @click="deleteCustomReminderCategory(cat.key)"
                    title="Hapus kategori ini"
                    style="background:none; border:none; cursor:pointer; padding:0; display:inline-flex; align-items:center; justify-content:center; width:14px; height:14px; border-radius:50%; color:inherit; opacity:0.7;">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </span>
                <span v-if="!customReminderCategories.length" style="font-size:12px; color:var(--text-muted);">Belum ada kategori custom.</span>
              </div>

              <label style="font-size: 12px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em;">Tambah Kategori Baru</label>
              <div style="display:flex; gap:8px;">
                <input type="text" class="gcal-input" v-model="newCustomCategoryInput" placeholder="Nama kategori baru..."
                  maxlength="24" @keydown.enter="addCustomReminderCategory" style="flex:1;" />
                <button class="btn btn-primary" @click="addCustomReminderCategory" style="height:40px; padding: 0 20px; cursor: pointer; white-space: nowrap; font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 600;" :disabled="!newCustomCategoryInput.trim()">
                  Tambah
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LOCAL CALENDAR VIEW (always shown, no auth needed) -->
      <div v-if="needsAuth">

        <!-- Toolbar: month nav + view toggle + "Buat Acara" -->
        <div class="gcal-toolbar">
          <div style="display:flex; align-items:center; gap:10px;">
            <button class="gcal-today-btn" @click="localGoToday()">Hari ini</button>
            <button class="gcal-nav-btn" @click="localView==='agenda' ? localPrevDay() : localPrevMonth()">&#8249;</button>
            <button class="gcal-nav-btn" @click="localView==='agenda' ? localNextDay() : localNextMonth()">&#8250;</button>
            <span style="font-size:18px; font-weight:700; color:#3c4043; min-width:180px;">{{ localView==='agenda' ? localAgendaDateLabel : localMonthLabel }}</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="gcal-view-toggle">
              <button :class="['gcal-view-btn', localView==='month' && 'active']" @click="localView='month'">Bulan</button>
              <button :class="['gcal-view-btn', localView==='week' && 'active']" @click="localView='week'">Minggu</button>
              <button :class="['gcal-view-btn', localView==='agenda' && 'active']" @click="localView='agenda'">Agenda</button>
            </div>
            <button class="gcal-create-btn" @click="localResetReminderFormAndOpen">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;"><path d="M12 5v14M5 12h14"/></svg>
              Set Pengingat
            </button>
          </div>
        </div>

        <!-- Success / Error toast -->
        <div v-if="localSuccess" class="gcal-toast gcal-toast-success">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {{ localSuccess }}
          <button @click="localSuccess=null" style="margin-left:auto;background:none;border:none;cursor:pointer;font-size:16px;color:#15803d;">&#215;</button>
        </div>
        <div v-if="localError" class="gcal-toast gcal-toast-error">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          {{ localError }}
          <button @click="localError=null" style="margin-left:auto;background:none;border:none;cursor:pointer;font-size:16px;color:#dc2626;">&#215;</button>
        </div>

        <!-- ========== MONTH VIEW ========== -->
        <div v-if="localView==='month'" class="gcal-month-wrap">
          <div class="gcal-month-head">
            <div v-for="d in ['MIN','SEN','SEL','RAB','KAM','JUM','SAB']" :key="d" class="gcal-dow">{{ d }}</div>
          </div>
          <div class="gcal-month-grid">
            <div
              v-for="cell in localMonthCells"
              :key="cell.key"
              :class="['gcal-cell', cell.isToday && 'gcal-cell-today', !cell.inMonth && 'gcal-cell-dim', localSelectedDate===cell.dateStr && 'gcal-cell-selected']"
              @click="localSelectedDate=cell.dateStr; localView='agenda'"
              @mouseenter="monthHoverDate=cell.dateStr"
              @mouseleave="monthHoverDate=null"
              style="position:relative;"
            >
              <div class="gcal-cell-num">{{ cell.day }}</div>
              <!-- Dot indicators per item type, synced with filters -->
              <div class="gcal-cell-dots">
                <span v-for="dot in localDotsForDate(cell.dateStr)" :key="dot.type"
                      class="gcal-cell-dot" :style="{ background: dot.color }"
                      :title="dot.label + ' (' + dot.count + ')'"></span>
              </div>
              <!-- Count badge if many items -->
              <div v-if="localTotalItemsForDate(cell.dateStr) > 0" class="gcal-cell-count">
                {{ localTotalItemsForDate(cell.dateStr) }}
              </div>

              <!-- ── Hover Tooltip: list semua item hari itu ── -->
              <div
                v-if="monthHoverDate===cell.dateStr && localTotalItemsForDate(cell.dateStr) > 0"
                class="gcal-cell-tooltip"
                @click.stop
              >
                <div class="gcal-cell-tooltip-date">{{ localTooltipDateLabel(cell.dateStr) }}</div>
                <div class="gcal-cell-tooltip-items">
                  <div
                    v-for="item in localAllItemsForDate(cell.dateStr)"
                    :key="item.id"
                    class="gcal-cell-tooltip-item"
                  >
                    <span class="gcal-cell-tooltip-dot" :style="{ background: item.color }"></span>
                    <span class="gcal-cell-tooltip-title" :style="item.done ? 'text-decoration:line-through;opacity:0.5;' : ''">{{ item.title }}</span>
                    <span v-if="item.startMin !== null" class="gcal-cell-tooltip-time">{{ localFmtMin(item.startMin) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== WEEK VIEW ========== -->
        <div v-if="localView==='week'" class="gcal-week-wrap gcal-week-list-wrap">
          <div
            v-for="d in localWeekDays"
            :key="d.dateStr"
            :class="['gcal-week-list-row', d.isToday && 'gcal-week-list-row-today']"
          >
            <div class="gcal-week-list-date" @click="localSelectedDate=d.dateStr; localView='agenda'" title="Buka agenda hari ini">
              <span class="gcal-week-list-dow">{{ d.dowLabel }}</span>
              <span :class="['gcal-week-list-num', d.isToday && 'gcal-week-list-num-today']">{{ d.dayNum }}</span>
            </div>
            <div class="gcal-week-list-items">
              <div v-if="localAllItemsForDate(d.dateStr).length === 0" class="gcal-week-list-empty">—</div>
              <div
                v-for="item in localAllItemsForDate(d.dateStr)"
                :key="item.id"
                class="gcal-week-list-pill"
                :style="{
                  background: localTintColor(item.color, 0.16),
                  borderColor: localTintColor(item.color, 0.45),
                  color: item.color,
                  opacity: item.done ? 0.5 : 1
                }"
                :title="item.title + (item.startMin !== null ? ' · ' + localFmtMin(item.startMin) : '')"
                @click.stop="localSelectedDate=d.dateStr; localView='agenda'"
              >
                <span v-if="item.startMin !== null" class="gcal-week-list-pill-time">{{ localFmtMin(item.startMin) }}</span>
                <span class="gcal-week-list-pill-title" :style="item.done ? 'text-decoration:line-through;' : ''">{{ item.title }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== AGENDA VIEW ========== -->
        <div v-if="localView==='agenda'" class="gcal-agenda-wrap">

          <div v-if="localAgendaItems[0].allDayItems.length===0 && localAgendaItems[0].timedBlocks.length===0" class="gcal-agenda-empty">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.4" style="color:#bdc1c6; margin:0 auto 12px; display:block;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <p style="font-size:15px;color:#5f6368;font-weight:600;">Tidak ada acara mendatang</p>
            <p style="font-size:13px;color:#9aa0a6;margin-top:4px;">Klik "Set Pengingat" untuk menambahkan pengingat baru.</p>
          </div>

          <template v-for="group in localAgendaItems" :key="group.dateStr">
            <!-- Date header -->
            <div class="gcal-agenda-day-header">
              <span class="gcal-agenda-day-hdr-dow">{{ group.dow }}</span>
              <span :class="['gcal-agenda-day-hdr-num', group.isToday && 'gcal-agenda-day-hdr-num-today']">{{ group.day }}</span>
            </div>

            <!-- All-day / no-time items -->
            <div v-if="group.allDayItems.length > 0" class="gcal-agenda-allday">
              <div v-for="item in group.allDayItems" :key="item.id"
                class="gcal-agenda-allday-item"
                :class="{ 'gcal-agenda-item-done': item.done }"
                :style="{ background: localTintColor(item.color, 0.16), borderColor: localTintColor(item.color, 0.45), color: item.color, cursor: 'pointer' }"
                @click.stop="localShowAgendaDetail(item)"
                title="Lihat detail">
                <span class="gcal-agenda-check-icon" style="pointer-events:none; flex-shrink:0;">
                  <svg v-if="item.done" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></svg>
                  <svg v-else-if="item.type==='task'" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  <svg v-else-if="item.type==='habit'" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  <svg v-else-if="item.type==='content'" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  <svg v-else viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </span>
                <span class="gcal-agenda-allday-item-title" :style="item.done ? 'text-decoration:line-through; opacity:0.55;' : ''">{{ item.title }}</span>
              </div>
            </div>

            <!-- Hour grid timeline -->
            <div class="gcal-agenda-timeline-wrap">
              <div class="gcal-agenda-timeline-time-col">
                <div v-for="h in localHours" :key="h" class="gcal-agenda-hour-label">{{ h }}</div>
              </div>
              <div class="gcal-agenda-timeline-col">
                <div v-for="h in localHours" :key="h" class="gcal-agenda-hour-cell"></div>
                <div v-if="group.nowLineTop !== null" class="gcal-agenda-now-line" :style="{top: (group.nowLineTop*1) + 'px'}"></div>
                <div
                  v-for="block in group.timedBlocks"
                  :key="block.id"
                  class="gcal-agenda-block"
                  :class="['gcal-agenda-block-' + block.type, block.done && 'gcal-agenda-item-done']"
                  :style="{
                    top: block.top + 'px',
                    height: block.height + 'px',
                    background: localTintColor(block.color, 0.14),
                    borderColor: localTintColor(block.color, 0.5),
                    color: block.color,
                    left: 'calc(' + (block.col * (100/block.totalCols)) + '% + 2px)',
                    width: 'calc(' + (100/block.totalCols) + '% - 4px)',
                    cursor: 'pointer'
                  }"
                  title="Lihat detail"
                  @click.stop="localShowAgendaDetail(block)"
                >
                  <span class="gcal-agenda-block-title" :style="block.done ? 'text-decoration:line-through; opacity:0.55;' : ''">{{ block.title }}</span>
                  <span class="gcal-agenda-block-time">{{ block.endLabel ? block.startLabel + ' – ' + block.endLabel : block.startLabel }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>


        <!-- ========== AGENDA DETAIL POPUP (mirip Google Calendar) ========== -->
        <transition name="agenda-detail-pop">
          <div v-if="agendaDetailItem" class="agenda-detail-overlay" @click.self="agendaDetailItem = null">
            <div class="agenda-detail-card" :style="{ '--agenda-detail-color': agendaDetailItem.color || '#D67B52' }">
              <!-- Top action bar: edit, delete, close -->
              <div class="agenda-detail-topbar">
                <div style="display:flex; align-items:center; gap:6px;">
                  <!-- Edit button (hanya untuk manual) -->
                  <button v-if="agendaDetailItem.type === 'manual'"
                    @click="localEditFromDetail(agendaDetailItem)"
                    class="agenda-detail-icon-btn"
                    title="Edit pengingat">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <!-- Delete button (hanya untuk manual) -->
                  <button v-if="agendaDetailItem.type === 'manual'"
                    @click="localDeleteFromDetail(agendaDetailItem)"
                    class="agenda-detail-icon-btn agenda-detail-icon-btn-danger"
                    title="Hapus pengingat">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
                <button @click="agendaDetailItem = null" class="agenda-detail-icon-btn" title="Tutup">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <!-- Title row with color dot -->
              <div class="agenda-detail-title-row">
                <span class="agenda-detail-color-dot" :style="{ background: agendaDetailItem.color || '#D67B52' }"></span>
                <div>
                  <div class="agenda-detail-title" :style="agendaDetailItem.done ? 'text-decoration:line-through; opacity:0.5;' : ''">{{ agendaDetailItem.title }}</div>
                  <div class="agenda-detail-badge-row">
                    <span v-if="agendaDetailItem.done" class="agenda-detail-badge agenda-detail-badge-done">✓ Selesai</span>
                    <span v-else-if="agendaDetailItem.type === 'manual'" class="agenda-detail-badge agenda-detail-badge-manual">Pengingat<template v-if="agendaDetailItem.raw && agendaDetailItem.raw.category && agendaDetailItem.raw.category !== 'manual'"> - {{ localCategoryLabel(agendaDetailItem.raw.category) }}</template></span>
                    <span v-else-if="agendaDetailItem.type === 'habit'" class="agenda-detail-badge agenda-detail-badge-habit">Habit</span>
                    <span v-else-if="agendaDetailItem.type === 'task'" class="agenda-detail-badge agenda-detail-badge-task">Task Plan</span>
                    <span v-else-if="agendaDetailItem.type === 'content'" class="agenda-detail-badge agenda-detail-badge-content">Content Plan</span>
                    <span v-else-if="agendaDetailItem.type === 'event'" class="agenda-detail-badge agenda-detail-badge-event">Acara</span>
                  </div>
                </div>
              </div>

              <!-- Detail rows -->
              <div class="agenda-detail-body">

                <!-- Waktu -->
                <div class="agenda-detail-row">
                  <span class="agenda-detail-row-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </span>
                  <span class="agenda-detail-row-text">
                    <template v-if="agendaDetailItem.startLabel && agendaDetailItem.endLabel">
                      {{ localFmtDateLabel(agendaDetailItem.dateStr) }} · {{ agendaDetailItem.startLabel }} – {{ agendaDetailItem.endLabel }}
                    </template>
                    <template v-else-if="agendaDetailItem.startLabel">
                      {{ localFmtDateLabel(agendaDetailItem.dateStr) }} · {{ agendaDetailItem.startLabel }}
                    </template>
                    <template v-else>
                      {{ localFmtDateLabel(agendaDetailItem.dateStr) }} · Sepanjang hari
                    </template>
                    <!-- Recurrence label -->
                    <span v-if="agendaDetailItem.raw && agendaDetailItem.raw.recurrence && agendaDetailItem.raw.recurrence !== 'none'"
                      class="agenda-detail-recur-badge">
                      <template v-if="agendaDetailItem.raw.recurrence === 'custom' && agendaDetailItem.raw.customRecurrence">
                        {{ (() => { const c = agendaDetailItem.raw.customRecurrence; const un = {day:'hari',week:'minggu',month:'bulan',year:'tahun'}; const dn=['Min','Sen','Sel','Rab','Kam','Jum','Sab']; let s='Setiap '+(c.interval>1?c.interval+' ':'')+un[c.unit]; if(c.unit==='week'&&c.days&&c.days.length>0) s+=' · '+[...c.days].sort((a,b)=>a-b).map(d=>dn[d]).join(', '); return s; })() }}
                      </template>
                      <template v-else>
                        {{ localRecurrenceLabel(agendaDetailItem.raw.recurrence, agendaDetailItem.raw.date) }}
                      </template>
                    </span>
                  </span>
                </div>

                <!-- Keterangan / subtitle -->
                <div v-if="agendaDetailItem.raw && agendaDetailItem.raw.subtitle" class="agenda-detail-row">
                  <span class="agenda-detail-row-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
                  </span>
                  <span class="agenda-detail-row-text">{{ agendaDetailItem.raw.subtitle }}</span>
                </div>

                <!-- Kategori (untuk manual) -->
                <div v-if="agendaDetailItem.type === 'manual' && agendaDetailItem.raw" class="agenda-detail-row">
                  <span class="agenda-detail-row-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                  </span>
                  <span class="agenda-detail-row-text">
                    {{ localCategoryLabel(agendaDetailItem.raw.category) }}
                  </span>
                </div>

                <!-- Arahkan ke halaman (untuk manual) — tampilkan path Page › Section › Item -->
                <div v-if="agendaDetailItem.type === 'manual' && agendaDetailItem.raw && agendaDetailItem.raw.page" class="agenda-detail-row">
                  <span class="agenda-detail-row-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </span>
                  <span class="agenda-detail-row-text" style="color: var(--color-terracotta, #D67B52); font-weight:600; cursor:pointer; line-height:1.6;" @click="localNavigateFromDetail(agendaDetailItem.raw.page)">
                    {{ localPageLabel(agendaDetailItem.raw.page) }}
                    <template v-if="agendaDetailItem.raw.section">
                      <span style="opacity:0.5; font-weight:400; margin:0 3px;">›</span>
                      <span style="color:var(--text-dark); font-weight:600;">{{ agendaDetailItem.raw.section.replace(/^(col_|cat_|bank_)/, '') }}</span>
                    </template>
                    <template v-if="agendaDetailItem.raw.targetItem">
                      <span style="opacity:0.5; font-weight:400; margin:0 3px;">›</span>
                      <span style="color:var(--text-secondary); font-weight:500; font-size:11.5px;">{{ agendaDetailItem.raw.targetItem }}</span>
                    </template>
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:4px; vertical-align:middle;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </span>
                </div>

                <!-- Arahkan ke halaman (untuk content plan) -->
                <div v-if="agendaDetailItem.type === 'content'" class="agenda-detail-row">
                  <span class="agenda-detail-row-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </span>
                  <span class="agenda-detail-row-text" style="color: var(--color-terracotta, #D67B52); font-weight:600; cursor:pointer; line-height:1.6;" @click="localNavigateFromDetail('contentTracker')">
                    Content Tracker
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:4px; vertical-align:middle;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </span>
                </div>

                <!-- Visibilitas (untuk manual) -->
                <div v-if="agendaDetailItem.type === 'manual'" class="agenda-detail-row">
                  <span class="agenda-detail-row-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <span class="agenda-detail-row-text">Hanya saya</span>
                </div>

                <!-- Habit: info jadwal & link ke Habit Tracker -->
                <div v-if="agendaDetailItem.type === 'habit'" class="agenda-detail-row">
                  <span class="agenda-detail-row-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </span>
                  <span class="agenda-detail-row-text" style="color: var(--color-terracotta, #D67B52); font-weight:600; cursor:pointer; line-height:1.6;" @click="localNavigateFromDetail('habitTracker')">
                    Habit Tracker
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:4px; vertical-align:middle;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </span>
                </div>

                <!-- Task Plan: deskripsi & link ke Job Logbook -->
                <div v-if="agendaDetailItem.type === 'task' && agendaDetailItem.raw" class="agenda-detail-row">
                  <span class="agenda-detail-row-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </span>
                  <span class="agenda-detail-row-text" style="color: var(--color-terracotta, #D67B52); font-weight:600; cursor:pointer; line-height:1.6;" @click="localNavigateFromDetail('jobLogbook')">
                    Job Logbook
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:4px; vertical-align:middle;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </span>
                </div>
                <div v-if="agendaDetailItem.type === 'task' && agendaDetailItem.raw && agendaDetailItem.raw.category" class="agenda-detail-row">
                  <span class="agenda-detail-row-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                  </span>
                  <span class="agenda-detail-row-text">{{ agendaDetailItem.raw.category }}</span>
                </div>

              </div>

              <!-- Footer: Tandai Selesai (untuk semua tipe yang actionable, kecuali task/Job Logbook) + Buka halaman untuk non-actionable -->
              <div class="agenda-detail-footer">
                <template v-if="agendaDetailItem.actionable && agendaDetailItem.type !== 'task'">
                  <button v-if="!agendaDetailItem.done"
                    @click="localMarkDoneFromDetail(agendaDetailItem)"
                    class="agenda-detail-btn-done">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Tandai selesai
                  </button>
                  <button v-else
                    @click="localMarkDoneFromDetail(agendaDetailItem)"
                    class="agenda-detail-btn-undone">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                    Batalkan selesai
                  </button>
                </template>
                <button v-if="agendaDetailItem.type === 'habit'"
                  @click="localNavigateFromDetail('habitTracker')"
                  class="agenda-detail-btn-nav">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  Buka Habit Tracker
                </button>
                <button v-if="agendaDetailItem.type === 'task'"
                  @click="localNavigateFromDetail('jobLogbook')"
                  class="agenda-detail-btn-nav">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Buka Job Logbook
                </button>
                <button v-if="agendaDetailItem.type === 'task'"
                  @click="localDeleteTaskPlanFromDetail(agendaDetailItem)"
                  class="agenda-detail-btn-delete"
                  title="Hapus task plan ini dari Agenda View dan Panel Notifikasi">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- ========== POPUP: PILIH LINGKUP HAPUS/EDIT ACARA RUTIN (mirip Google Calendar) ========== -->
        <transition name="agenda-detail-pop">
          <div v-if="recurActionPopup" class="agenda-detail-overlay" @click.self="recurActionPopup = null">
            <div class="recur-action-card">
              <div class="recur-action-title">{{ recurActionPopup.mode === 'delete' ? 'Hapus acara rutin' : 'Edit acara rutin' }}</div>

              <label class="recur-action-opt">
                <input type="radio" v-model="recurActionChoice" value="this" class="recur-action-radio" />
                <span>Acara ini</span>
              </label>
              <label class="recur-action-opt">
                <input type="radio" v-model="recurActionChoice" value="following" class="recur-action-radio" />
                <span>Acara ini dan acara berikutnya</span>
              </label>
              <label class="recur-action-opt">
                <input type="radio" v-model="recurActionChoice" value="all" class="recur-action-radio" />
                <span>Semua acara</span>
              </label>

              <div class="recur-action-footer">
                <button class="recur-action-btn-cancel" @click="recurActionPopup = null">Batal</button>
                <button class="recur-action-btn-ok" @click="localConfirmRecurAction">Oke</button>
              </div>
            </div>
          </div>
        </transition>

        <!-- ========== MODAL: FORM SET PENGINGAT MANUAL ========== -->
        <div v-if="localShowForm" class="gcal-modal-overlay" @click.self="localCancelReminderForm">
          <div class="gcal-modal gcal-modal-wide">
            <div class="gcal-modal-header">
              <span style="font-size:16px;font-weight:700;color:#3c4043;">{{ localNewReminder._editId || localNewReminder._excludeFromSeriesId || localNewReminder._splitFromSeriesId ? 'Edit Pengingat Manual' : 'Set Pengingat Manual' }}</span>
              <button @click="localCancelReminderForm" class="gcal-modal-close">&#215;</button>
            </div>
            <div class="gcal-modal-body" style="padding:20px;">

              <!-- ── 2-kolom layout utama ── -->
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:start;">

                <!-- ── KOLOM KIRI: Judul, Keterangan, Waktu, Tanggal ── -->
                <div style="display:flex; flex-direction:column; gap:13px;">
                  <div>
                    <label class="gcal-label">Judul Pengingat *</label>
                    <input type="text" class="gcal-input" v-model="localNewReminder.title" placeholder="cth., Minum obat, Hubungi klien..." maxlength="60" />
                  </div>
                  <div>
                    <label class="gcal-label">Keterangan (opsional)</label>
                    <textarea class="gcal-input" v-model="localNewReminder.subtitle" rows="2" style="resize:none;" maxlength="80" placeholder="Catatan singkat..."></textarea>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div>
                      <label class="gcal-label" style="display:flex;align-items:center;gap:6px;">
                        Jam Mulai
                        <span style="font-size:9.5px;color:var(--text-muted);font-weight:400;font-style:italic;">(opsional)</span>
                      </label>
                      <input type="time" class="gcal-input" v-model="localNewReminder.time" :disabled="localNewReminder.allDay" :style="localNewReminder.allDay ? 'opacity:0.4;cursor:not-allowed;' : ''" />
                    </div>
                    <div>
                      <label class="gcal-label" style="display:flex;align-items:center;gap:6px;">
                        Jam Selesai
                        <span style="font-size:9.5px;color:var(--text-muted);font-weight:400;font-style:italic;">(opsional)</span>
                      </label>
                      <input type="time" class="gcal-input" v-model="localNewReminder.endTime" :disabled="localNewReminder.allDay" :style="localNewReminder.allDay ? 'opacity:0.4;cursor:not-allowed;' : ''" />
                    </div>
                  </div>
                  <!-- Toggle: Tanpa waktu / sepanjang hari -->
                  <div style="display:flex;align-items:center;gap:8px;margin-top:-4px;">
                    <label style="display:flex;align-items:center;gap:7px;cursor:pointer;user-select:none;">
                      <div @click="localNewReminder.allDay = !localNewReminder.allDay; if(localNewReminder.allDay){ localNewReminder.time=''; localNewReminder.endTime=''; }"
                           style="width:32px;height:17px;border-radius:9px;transition:background 0.2s;display:flex;align-items:center;padding:0 2px;cursor:pointer;flex-shrink:0;"
                           :style="localNewReminder.allDay ? 'background:var(--color-terracotta,#D67B52);' : 'background:#ccc;'">
                        <div style="width:13px;height:13px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.22);transition:transform 0.2s;"
                             :style="localNewReminder.allDay ? 'transform:translateX(15px);' : 'transform:translateX(0);'"></div>
                      </div>
                      <span style="font-size:11.5px;color:var(--text-secondary,#7A6F66);">Tanpa waktu (sepanjang hari)</span>
                    </label>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div>
                      <label class="gcal-label">Tanggal Mulai *</label>
                      <input type="date" class="gcal-input" v-model="localNewReminder.date" />
                    </div>
                    <div>
                      <label class="gcal-label">Tanggal Selesai</label>
                      <input type="date" class="gcal-input" v-model="localNewReminder.endDate" :min="localNewReminder.date" />
                    </div>
                  </div>
                  <p style="font-size:10.5px; color:var(--text-muted); margin:0; line-height:1.5;">
                    Tanggal Selesai membatasi kapan aturan ulang berakhir — kosongkan agar berlaku terus.
                  </p>
                </div>

                <!-- ── KOLOM KANAN: Halaman → Section → Item + Kategori ── -->
                <div style="background:var(--color-cream,#FDF5EB); border-radius:12px; padding:14px; border:1px solid var(--color-sand,#D6CEC5);">

                  <!-- Label kolom kanan -->
                  <div style="display:flex;align-items:center;gap:7px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--color-sand,#D6CEC5);">
                    <div style="width:24px;height:24px;background:var(--color-terracotta,#D67B52);border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                    </div>
                    <span style="font-size:11px;font-weight:700;color:var(--text-dark);text-transform:uppercase;letter-spacing:0.6px;font-family:'Hack',monospace;">Arahkan ke</span>
                  </div>

                  <!-- Page -->
                  <div style="margin-bottom:12px;">
                    <label class="gcal-label">Halaman</label>
                    <select v-model="localNewReminder.page" class="gcal-input" style="cursor:pointer;" @change="localOnPageChange()">
                      <option value="">— Tidak ada tujuan —</option>
                      <option value="jobLogbook">Job Logbook</option>
                      <option value="calendarMoment">Calendar Moment</option>
                      <option value="contentTracker">Content Tracker</option>
                      <option value="interviewPractice">Interview Practice</option>
                      <option value="dailyNutrition">Daily Nutrition (Insight)</option>
                      <option value="habitTracker">Habit Tracker</option>
                      <option value="pomodoroTimer">Pomodoro Timer</option>
                      <option value="googleCalendar">Daily n (Kalender)</option>
                      <option value="financialTracker">Financial Tracker</option>
                      <option value="CareerFoundation">Career Foundation</option>
                    </select>
                  </div>

                  <!-- Section — muncul jika halaman dipilih & punya section -->
                  <transition name="agenda-filter-slide">
                    <div v-if="localNewReminder.page && localReminderSections.length > 0" style="margin-bottom:12px;">
                      <label class="gcal-label" style="display:flex;align-items:center;gap:4px;">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        Section
                      </label>
                      <select v-model="localNewReminder.section" class="gcal-input" style="cursor:pointer;" @change="localOnSectionChange()">
                        <option value="">— Pilih section —</option>
                        <option v-for="sec in localReminderSections" :key="sec.value" :value="sec.value">{{ sec.label }}</option>
                      </select>
                    </div>
                  </transition>

                  <!-- Item — muncul jika section dipilih & punya item -->
                  <transition name="agenda-filter-slide">
                    <div v-if="localNewReminder.section && localReminderItems.length > 0" style="margin-bottom:12px;">
                      <label class="gcal-label" style="display:flex;align-items:center;gap:4px;">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="var(--color-terracotta,#D67B52)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-left:-5px;"><polyline points="9 18 15 12 9 6"/></svg>
                        Item Spesifik
                      </label>
                      <select v-model="localNewReminder.targetItem" class="gcal-input" style="cursor:pointer;">
                        <option value="">— Pilih item (opsional) —</option>
                        <option v-for="item in localReminderItems" :key="item.value" :value="item.value">{{ item.label }}</option>
                      </select>
                    </div>
                  </transition>

                  <!-- Summary path chip -->
                  <div v-if="localNewReminder.page" style="margin-top:4px; padding:8px 10px; background:rgba(214,123,82,0.1); border-radius:8px; font-size:11.5px; color:var(--text-secondary,#7A6F66); line-height:1.7;">
                    <strong style="color:var(--color-terracotta,#D67B52);">{{ localPageLabel(localNewReminder.page) }}</strong>
                    <template v-if="localNewReminder.section">
                      <span style="opacity:0.45; margin:0 3px;">›</span>
                      <span style="font-weight:600;color:var(--text-dark);">{{ localReminderSections.find(s=>s.value===localNewReminder.section)?.label || localNewReminder.section }}</span>
                    </template>
                    <template v-if="localNewReminder.targetItem">
                      <br/>
                      <span style="opacity:0.45; padding-left:8px;">↳</span>
                      <span style="font-size:11px;color:var(--text-muted);">{{ localReminderItems.find(i=>i.value===localNewReminder.targetItem)?.label || localNewReminder.targetItem }}</span>
                    </template>
                  </div>
                  <div v-else style="margin-top:4px; padding:10px; border-radius:8px; border:1.5px dashed var(--color-sand,#D6CEC5); text-align:center;">
                    <p style="font-size:11px; color:var(--text-muted); margin:0; line-height:1.6;">Pilih halaman untuk mengarahkan pengingat ini ke section & item tertentu.</p>
                  </div>

                  <!-- Ulangi — dipindah ke kolom kanan agar dropdown punya ruang terbuka -->
                  <div style="margin-top:14px; padding-top:12px; border-top:1px solid var(--color-sand,#D6CEC5); position:relative;">
                    <label class="gcal-label">Ulangi</label>
                    <button type="button" class="gcal-input" @click="localShowRecurrenceDropdown = !localShowRecurrenceDropdown"
                      style="width:100%; text-align:left; cursor:pointer; display:flex; align-items:center; justify-content:space-between; background:#fff;">
                      <span>{{ localIsCustomRecurrence ? localCustomRecurrenceLabel : localRecurrenceLabel(localNewReminder.recurrence, localNewReminder.date) }}</span>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :style="{ transform: localShowRecurrenceDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div v-if="localShowRecurrenceDropdown" @click.stop
                      style="position:absolute; top:calc(100% + 4px); left:0; right:0; z-index:999; background:#fff; border:1px solid #dadce0; border-radius:8px; box-shadow:0 4px 16px rgba(0,0,0,0.15); overflow-y:auto; max-height:260px;">
                      <div v-for="opt in ['none','daily','weekly','monthly','yearly','weekday']" :key="opt"
                        @click="localNewReminder.recurrence = opt; localShowRecurrenceDropdown = false"
                        :class="{ 'gcal-recurrence-opt-active': localNewReminder.recurrence === opt && !localIsCustomRecurrence }"
                        class="gcal-recurrence-opt">
                        {{ localRecurrenceLabel(opt, localNewReminder.date) }}
                      </div>
                      <div style="border-top:1px solid #f0f0f0; margin:4px 0;"></div>
                      <div @click="localOpenCustomRecurrence"
                        :class="{ 'gcal-recurrence-opt-active': localIsCustomRecurrence }"
                        class="gcal-recurrence-opt"
                        style="display:flex; align-items:center; gap:6px; color:#1C1C1C; font-weight:600;">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                        Sesuaikan...
                      </div>
                    </div>
                  </div>

                  <!-- Kategori Pengingat -->
                  <div style="margin-top:12px;">
                    <label class="gcal-label">Kategori Pengingat</label>
                    <select v-model="localNewReminder.category" class="gcal-input" style="cursor:pointer;">
                      <option value="manual">Pengingat (Default)</option>
                      <option v-for="cat in customReminderCategories" :key="cat.key" :value="cat.key">
                        {{ cat.label }}
                      </option>
                    </select>
                  </div>

                </div>
              </div>

              <!-- ── Footer tombol, full width di bawah kedua kolom ── -->
              <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px;padding-top:14px;border-top:1.5px solid var(--color-sand,#D6CEC5);">
                <button class="gcal-btn-ghost" @click="localCancelReminderForm">Batal</button>
                <button class="gcal-btn-save" :disabled="!localNewReminder.title.trim() || !localNewReminder.date" @click="localAddReminder()">Simpan Pengingat</button>
              </div>

            </div>
          </div>
        </div>

        <!-- ═══ Modal Pengulangan Kustom ═══ -->
        <transition name="insight-modal-fade">
          <div v-if="showCustomRecurrenceModal"
               style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.38);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;z-index:99999;padding:16px;box-sizing:border-box;"
               @click.self="showCustomRecurrenceModal = false">
            <div style="background:var(--color-paper,#FAF7F2);border-radius:18px;box-shadow:0 12px 48px rgba(0,0,0,0.18),0 2px 8px rgba(0,0,0,0.08);width:min(400px,95vw);overflow:hidden;font-family:inherit;">

              <!-- Header -->
              <div style="padding:18px 22px 14px;background:var(--color-terracotta,#D67B52);display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                  </div>
                  <span style="font-size:15px;font-weight:700;color:#fff;letter-spacing:0.2px;">Pengulangan kustom</span>
                </div>
                <button @click="showCustomRecurrenceModal = false"
                        style="width:28px;height:28px;border:none;background:rgba(255,255,255,0.18);border-radius:8px;cursor:pointer;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;line-height:1;">&#215;</button>
              </div>

              <!-- Body -->
              <div style="padding:20px 22px;display:flex;flex-direction:column;gap:18px;">

                <!-- Ulangi setiap N [satuan] -->
                <div>
                  <label style="font-size:11px;font-weight:700;color:var(--text-muted,#A09690);text-transform:uppercase;letter-spacing:0.6px;display:block;margin-bottom:8px;">Ulangi setiap</label>
                  <div style="display:flex;gap:10px;align-items:center;">
                    <div style="display:flex;flex-direction:column;border:1.5px solid var(--color-sand,#D6CEC5);border-radius:10px;overflow:hidden;background:var(--color-cream,#FDF5EB);">
                      <button @click="customRecurrenceForm.interval = Math.min(99, customRecurrenceForm.interval + 1)"
                              style="border:none;background:none;padding:4px 12px;cursor:pointer;font-size:10px;color:var(--text-secondary,#7A6F66);line-height:1;transition:background 0.15s;"
                              onmouseover="this.style.background='rgba(214,123,82,0.1)'" onmouseout="this.style.background='none'">▲</button>
                      <input type="number" v-model.number="customRecurrenceForm.interval" min="1" max="99"
                             style="width:52px;text-align:center;border:none;border-top:1.5px solid var(--color-sand,#D6CEC5);border-bottom:1.5px solid var(--color-sand,#D6CEC5);padding:6px 0;font-size:14px;font-weight:700;color:var(--text-dark,#3D2E22);outline:none;background:var(--color-cream,#FDF5EB);font-family:'Hack',monospace;" />
                      <button @click="customRecurrenceForm.interval = Math.max(1, customRecurrenceForm.interval - 1)"
                              style="border:none;background:none;padding:4px 12px;cursor:pointer;font-size:10px;color:var(--text-secondary,#7A6F66);line-height:1;transition:background 0.15s;"
                              onmouseover="this.style.background='rgba(214,123,82,0.1)'" onmouseout="this.style.background='none'">▼</button>
                    </div>
                    <select v-model="customRecurrenceForm.unit" @change="onCustomRecurrenceUnitChange"
                            style="flex:1;height:42px;border:1.5px solid var(--color-sand,#D6CEC5);border-radius:10px;padding:0 12px;font-size:13.5px;font-weight:600;color:var(--text-dark,#3D2E22);background:var(--color-cream,#FDF5EB);cursor:pointer;outline:none;">
                      <option value="day">hari</option>
                      <option value="week">minggu</option>
                      <option value="month">bulan</option>
                      <option value="year">tahun</option>
                    </select>
                  </div>
                </div>

                <!-- Hari dalam minggu — hanya tampil kalau unit = week -->
                <div v-if="customRecurrenceForm.unit === 'week'">
                  <label style="font-size:11px;font-weight:700;color:var(--text-muted,#A09690);text-transform:uppercase;letter-spacing:0.6px;display:block;margin-bottom:8px;">Hari</label>
                  <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button v-for="(dayLabel, idx) in ['M','S','S','R','K','J','S']" :key="idx"
                            @click="localToggleCustomDay(idx)"
                            :style="customRecurrenceForm.days.includes(idx)
                              ? 'background:var(--color-terracotta,#D67B52);color:#fff;border-color:var(--color-terracotta,#D67B52);'
                              : 'background:var(--color-cream,#FDF5EB);color:var(--text-secondary,#7A6F66);border-color:var(--color-sand,#D6CEC5);'"
                            style="width:36px;height:36px;border-radius:50%;border:1.5px solid;font-size:11.5px;font-weight:700;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Hack',monospace;">
                      {{ dayLabel }}
                    </button>
                  </div>
                </div>

                <!-- Berakhir -->
                <div style="background:var(--color-cream,#FDF5EB);border-radius:12px;padding:14px;border:1px solid var(--color-sand,#D6CEC5);">
                  <label style="font-size:11px;font-weight:700;color:var(--text-muted,#A09690);text-transform:uppercase;letter-spacing:0.6px;display:block;margin-bottom:12px;">Berakhir</label>
                  <div style="display:flex;flex-direction:column;gap:10px;">

                    <!-- Tidak pernah -->
                    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px 10px;border-radius:8px;transition:background 0.15s;"
                           :style="customRecurrenceForm.endType==='never' ? 'background:rgba(214,123,82,0.1);' : ''"
                           onmouseover="this.style.background='rgba(214,123,82,0.06)'" onmouseout="this.style.background=customRecurrenceForm?.endType==='never'?'rgba(214,123,82,0.1)':''">
                      <div @click="customRecurrenceForm.endType='never'"
                           style="width:18px;height:18px;border-radius:50%;border:2px solid;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;"
                           :style="customRecurrenceForm.endType==='never' ? 'border-color:var(--color-terracotta,#D67B52);' : 'border-color:var(--color-sand,#D6CEC5);'">
                        <div v-if="customRecurrenceForm.endType==='never'" style="width:9px;height:9px;border-radius:50%;background:var(--color-terracotta,#D67B52);"></div>
                      </div>
                      <span style="font-size:13px;color:var(--text-dark,#3D2E22);">Tidak pernah</span>
                    </label>

                    <!-- Tanggal -->
                    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px 10px;border-radius:8px;transition:background 0.15s;"
                           :style="customRecurrenceForm.endType==='date' ? 'background:rgba(214,123,82,0.1);' : ''"
                           onmouseover="this.style.background='rgba(214,123,82,0.06)'" onmouseout="this.style.background=customRecurrenceForm?.endType==='date'?'rgba(214,123,82,0.1)':''">
                      <div @click="customRecurrenceForm.endType='date'"
                           style="width:18px;height:18px;border-radius:50%;border:2px solid;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;"
                           :style="customRecurrenceForm.endType==='date' ? 'border-color:var(--color-terracotta,#D67B52);' : 'border-color:var(--color-sand,#D6CEC5);'">
                        <div v-if="customRecurrenceForm.endType==='date'" style="width:9px;height:9px;border-radius:50%;background:var(--color-terracotta,#D67B52);"></div>
                      </div>
                      <span style="font-size:13px;color:var(--text-dark,#3D2E22);flex-shrink:0;">Aktif hingga</span>
                      <input type="date" v-model="customRecurrenceForm.endDate"
                             @click="customRecurrenceForm.endType='date'"
                             :min="localNewReminder.date"
                             :style="customRecurrenceForm.endType!=='date'?'opacity:0.4;':''"
                             style="flex:1;height:34px;border:1.5px solid var(--color-sand,#D6CEC5);border-radius:8px;padding:0 10px;font-size:12.5px;color:var(--text-dark,#3D2E22);background:var(--color-paper,#FAF7F2);outline:none;cursor:pointer;" />
                    </label>

                    <!-- Setelah N kali -->
                    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px 10px;border-radius:8px;transition:background 0.15s;"
                           :style="customRecurrenceForm.endType==='count' ? 'background:rgba(214,123,82,0.1);' : ''"
                           onmouseover="this.style.background='rgba(214,123,82,0.06)'" onmouseout="this.style.background=customRecurrenceForm?.endType==='count'?'rgba(214,123,82,0.1)':''">
                      <div @click="customRecurrenceForm.endType='count'"
                           style="width:18px;height:18px;border-radius:50%;border:2px solid;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;"
                           :style="customRecurrenceForm.endType==='count' ? 'border-color:var(--color-terracotta,#D67B52);' : 'border-color:var(--color-sand,#D6CEC5);'">
                        <div v-if="customRecurrenceForm.endType==='count'" style="width:9px;height:9px;border-radius:50%;background:var(--color-terracotta,#D67B52);"></div>
                      </div>
                      <span style="font-size:13px;color:var(--text-dark,#3D2E22);flex-shrink:0;">Setelah</span>
                      <input type="number" v-model.number="customRecurrenceForm.count" min="1" max="999"
                             @click="customRecurrenceForm.endType='count'"
                             :style="customRecurrenceForm.endType!=='count'?'opacity:0.4;':''"
                             style="width:58px;height:34px;border:1.5px solid var(--color-sand,#D6CEC5);border-radius:8px;text-align:center;font-size:13.5px;font-weight:700;color:var(--text-dark,#3D2E22);outline:none;padding:0;background:var(--color-paper,#FAF7F2);font-family:'Hack',monospace;" />
                      <span style="font-size:13px;color:var(--text-secondary,#7A6F66);">kali</span>
                    </label>

                  </div>
                </div>

              </div>

              <!-- Footer -->
              <div style="display:flex;justify-content:flex-end;gap:8px;padding:12px 22px 18px;">
                <button @click="showCustomRecurrenceModal = false" class="gcal-btn-ghost">Batal</button>
                <button @click="localSaveCustomRecurrence" class="gcal-btn-save">Selesai</button>
              </div>

            </div>
          </div>
        </transition>

        <!-- Bottom connect banner (subtle) -->
        <div class="gcal-sync-banner">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M16 3h5v5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 21H3v-5"/></svg>
          Acara tersimpan lokal. Hubungkan akun Google untuk sinkronisasi real-time.
          <button class="gcal-sync-link" @click="handleGoogleSignIn" :disabled="loading">
            {{ loading ? 'Menghubungkan...' : 'Hubungkan sekarang →' }}
          </button>
        </div>

      </div>

      <!-- Main Authorized View panels -->
      <div v-else>
        
        <!-- Action Notification Toasts -->
        <div v-if="error" style="background-color: #FDF2F2; color: #DC2626; padding: 14px 18px; border-radius: 12px; margin-bottom: 20px; font-size: 13.5px; border-left: 4px solid #DC2626; display: flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #DC2626;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <strong>Kesalahan:</strong> {{ error }}
        </div>
        
        <div v-if="successMsg" style="background-color: #F0FDF4; color: #15803D; padding: 14px 18px; border-radius: 12px; margin-bottom: 20px; font-size: 13.5px; border-left: 4px solid #15803D; display: flex; justify-content: space-between; align-items: center;">
          <span style="display: flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #15803D;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 8 12 12 16 14"></polyline></svg>
            {{ successMsg }}
          </span>
          <button @click="successMsg = null" style="background: none; border: none; font-weight: bold; cursor: pointer; color: #15803D; font-size: 16px;">×</button>
        </div>

        <!-- Layout Grids -->
        <div class="grid-2" style="grid-template-columns: 1.2fr 0.8fr; gap: 24px; align-items: start;">
          
          <!-- Column A: Live Google Calendar Agenda Feed -->
          <div>
            <div class="calendar-card" style="padding-bottom: 16px;">
              
              <div class="flex-between" style="align-items: center; margin-bottom: 22px; flex-wrap: wrap; gap: 12px;">
                <h3 style="font-size: 19px; font-weight: 700; margin: 0; display: inline-flex; align-items: center; gap: 8px;">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-terracotta);" class="lucide-inline"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>Agenda Acara Terdekat</span>
                  <span class="g-cal-badge">{{ filteredEvents.length }} Acara</span>
                </h3>

                <!-- Filter Controls buttons styled similarly -->
                <div style="display: flex; gap: 6px;">
                  <button class="pomo-tab-btn" :class="{ active: filterGroup === 'all' }" @click="filterGroup = 'all'" style="font-size: 11.5px; padding: 6px 12px; border-radius: 20px;">
                    Semua
                  </button>
                  <button class="pomo-tab-btn" :class="{ active: filterGroup === 'today' }" @click="filterGroup = 'today'" style="font-size: 11.5px; padding: 6px 12px; border-radius: 20px;">
                    Hari Ini
                  </button>
                  <button class="pomo-tab-btn" :class="{ active: filterGroup === 'week' }" @click="filterGroup = 'week'" style="font-size: 11.5px; padding: 6px 12px; border-radius: 20px;">
                    7 Hari Ini
                  </button>
                </div>
              </div>

              <!-- Loading spinner block -->
              <div v-if="loading" style="text-align: center; padding: 56px 0;">
                <div class="loading-spinner"></div>
                <p style="color: var(--text-muted); font-size: 13px; margin-top: 10px;">Mengambil agenda dari Google Calendar live...</p>
              </div>

              <!-- Empty state placeholder -->
              <div v-else-if="filteredEvents.length === 0" style="text-align: center; padding: 48px 24px; background-color: var(--bg-cream); border: 1.5px dashed var(--color-sand); border-radius: 16px;">
                <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-sage); margin: 0 auto 12px auto; display: block;"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>
                <p style="color: var(--text-dark); font-weight: bold; font-size: 15px;">Kalender Anda bersih hari ini</p>
                <p style="color: var(--text-muted); font-size: 12.8px; margin-top: 6px; max-width: 320px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                  Tidak ada agenda acara terdaftar pada filter ini. Tambahkan acara baru menggunakan form isian di sebelah kanan!
                </p>
              </div>

              <div v-else>
                <!-- Render Interactive Timelines -->
                <div v-for="event in filteredEvents" :key="event.id" class="event-item-card">
                  <div style="flex-grow: 1;">
                    <h4 style="font-size: 15.5px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px;">
                      {{ event.summary || 'Acara Tanpa Judul' }}
                    </h4>
                    <p v-if="event.description" style="font-size: 12.8px; color: var(--text-muted); margin-bottom: 8px; line-height: 1.5; white-space: pre-line;">
                      {{ event.description }}
                    </p>
                    
                    <div class="event-meta">
                      <span style="display: inline-flex; align-items: center; gap: 4px;">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--text-muted);"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {{ formatEventTime(event) }}
                      </span>
                      <span v-if="event.location" style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-terracotta);">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-terracotta);"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {{ event.location }}
                      </span>
                    </div>
                  </div>

                  <!-- Mandatory confirmation dialog on deletions -->
                  <button @click="deleteEvent(event)" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; transition: background 0.2s; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px;" class="hover:bg-sand" title="Hapus Acara">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:#D67B52"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- Column B: Add New Event Input Form Panel -->
          <div>
            <div class="calendar-card">
              <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; border-bottom: 1px solid var(--color-sand); padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-forest);" class="lucide-inline"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
                <span>Tambah Acara Baru</span>
              </h3>

              <form @submit.prevent="addEvent">
                <div style="margin-bottom: 14px;">
                  <label class="g-form-label">Judul Acara *</label>
                  <input type="text" class="g-form-input" v-model="newEvent.summary" placeholder="Contoh: Rapat Koordinasi Bulanan" required />
                </div>

                <div style="margin-bottom: 14px;">
                  <label class="g-form-label">Deskripsi</label>
                  <textarea class="g-form-input" style="height: 72px; resize: none;" v-model="newEvent.description" placeholder="Tuliskan keterangan singkat agenda..."></textarea>
                </div>

                <div style="margin-bottom: 14px;">
                  <label class="g-form-label">Lokasi Rumah / Meeting Zoom</label>
                  <input type="text" class="g-form-input" v-model="newEvent.location" placeholder="Tulis lokasi atau link rapat..." />
                </div>

                <!-- Date times controls -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
                  <div>
                    <label class="g-form-label">Tanggal Mulai *</label>
                    <input type="date" class="g-form-input" v-model="newEvent.startDate" required />
                  </div>
                  <div>
                    <label class="g-form-label">Waktu Mulai *</label>
                    <input type="time" class="g-form-input" v-model="newEvent.startTime" required />
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 22px;">
                  <div>
                    <label class="g-form-label">Tanggal Selesai</label>
                    <input type="date" class="g-form-input" v-model="newEvent.endDate" />
                  </div>
                  <div>
                    <label class="g-form-label">Waktu Selesai</label>
                    <input type="time" class="g-form-input" v-model="newEvent.endTime" />
                  </div>
                </div>

                <!-- Safe Submit with workspace verification checks -->
                <button class="btn btn-primary" type="submit" :style="{ backgroundColor: '#4285F4', borderColor: '#4285F4', color: '#fff' }" style="width: 100%; border-radius: 12px; font-weight: bold; cursor: pointer; padding: 12px 20px; font-size: 14.5px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;" :disabled="submitting">
                  <span v-if="submitting">Menyimpan...</span>
                  <span v-else style="display: flex; align-items: center; gap: 6px;">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                    Simpan ke Google Calendar
                  </span>
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  data() {
    return {
      auth: null,
      provider: null,
      user: null,
      accessToken: null,
      needsAuth: true,
      loading: false,
      submitting: false,
      events: [],
      error: null,
      successMsg: null,
      newEvent: {
        summary: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        location: ''
      },
      filterGroup: 'all', // 'all', 'today', 'week'
      // --- Local Calendar State ---
      localView: 'agenda',
      localCurDate: new Date(),
      localSelectedDate: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })(),
      localEvents: (() => {
        try {
          return JSON.parse(localStorage.getItem('gcal_local_events') || '[]');
        } catch(_e) { return []; }
      })(),
      localShowForm: false,
      localNewEv: { title:'', startDate:'', startTime:'', endDate:'', endTime:'', location:'', desc:'', color:'#4285F4', allDay: false },
      localNewReminder: { title:'', subtitle:'', date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })(), endDate: '', time:'', endTime:'', page:'', section:'', targetItem:'', category: 'manual', recurrence: 'none' },
      localShowRecurrenceDropdown: false,
      showCustomRecurrenceModal: false,
      customRecurrenceForm: { interval: 1, unit: 'week', days: [], endType: 'never', endDate: '', count: 13 },
      customRecurrenceSaved: null, // hasil akhir custom recurrence yang sudah disimpan
      newCustomCategoryInput: '',
      showManageCategoryModal: false,
      customReminderCategories: (() => {
        try {
          const raw = WorkspaceStorage.getItem('gcal_custom_reminder_categories');
          return raw ? JSON.parse(raw) : [];
        } catch(_e) { return []; }
      })(),
      localStorageTick: 0,
      agendaDetailItem: null,
      // ── Popup pilihan "acara ini / dan seterusnya / semua" untuk hapus & edit pengingat manual berulang ──
      recurActionPopup: null, // { mode: 'delete'|'edit', block }
      recurActionChoice: 'this', // pilihan radio aktif di popup tersebut
      agendaFilterOpen: false,
      agendaFilters: { task: true, habit: true, manual: true, content: true },
      // agendaFilterOptions moved to computed (includes custom categories)
      // Warna kustom per kategori filter agenda (bisa diubah lewat color picker)
      agendaFilterColors: (() => {
        const defaults = { task: '#D67B52', habit: '#A3B18A', manual: '#F59E0B', content: '#8E7CC3' };
        try {
          const raw = WorkspaceStorage.getItem('gcal_agenda_filter_colors');
          return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
        } catch(_e) { return { ...defaults }; }
      })(),
      localSuccess: null,
      localError: null,
      localColors: [
        { val: '#4285F4' }, { val: '#EA4335' }, { val: '#34A853' },
        { val: '#FBBC05' }, { val: '#8E24AA' }, { val: '#F6BF26' },
        { val: '#3F9142' }, { val: '#0B8043' }, { val: '#D50000' },
        { val: '#E67C73' }, { val: '#039BE5' }
      ],
      localHours: ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'],
      monthHoverDate: null,
    };
  },
  computed: {
    localIsCustomRecurrence() {
      return this.customRecurrenceSaved !== null && this.localNewReminder.recurrence === 'custom';
    },
    localCustomRecurrenceLabel() {
      const c = this.customRecurrenceSaved;
      if (!c) return 'Sesuaikan...';
      const unitMap = { day: c.interval === 1 ? 'hari' : 'hari', week: c.interval === 1 ? 'minggu' : 'minggu', month: c.interval === 1 ? 'bulan' : 'bulan', year: c.interval === 1 ? 'tahun' : 'tahun' };
      const dayNames = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
      let base = `Setiap ${c.interval > 1 ? c.interval + ' ' : ''}${unitMap[c.unit] || c.unit}`;
      if (c.unit === 'week' && c.days && c.days.length > 0) {
        const sorted = [...c.days].sort((a,b)=>a-b);
        base += ' pada ' + sorted.map(d => dayNames[d]).join(', ');
      }
      if (c.endType === 'date' && c.endDate) base += ' · s/d ' + c.endDate.replace(/-/g, '/').slice(2);
      else if (c.endType === 'count' && c.count) base += ' · ' + c.count + 'x';
      return base;
    },
    filteredEvents() {
      if (this.filterGroup === 'all') return this.events;
      const todayStr = localDateStr();
      if (this.filterGroup === 'today') {
        return this.events.filter(e => {
          const eDate = e.start?.dateTime || e.start?.date || '';
          return eDate.startsWith(todayStr);
        });
      }
      if (this.filterGroup === 'week') {
        const today = new Date();
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);
        return this.events.filter(e => {
          const eDateStr = e.start?.dateTime || e.start?.date;
          if (!eDateStr) return false;
          const eDate = new Date(eDateStr);
          return eDate >= today && eDate <= endOfWeek;
        });
      }
      return this.events;
    },
    // --- Local Calendar Computeds ---
    localMonthLabel() {
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      return months[this.localCurDate.getMonth()] + ' ' + this.localCurDate.getFullYear();
    },
    localAgendaDateLabel() {
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      const dows = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      const todayStr = this.localFmtDate(new Date());
      const dt = new Date(this.localSelectedDate + 'T12:00:00');
      const label = dows[dt.getDay()] + ', ' + dt.getDate() + ' ' + months[dt.getMonth()] + ' ' + dt.getFullYear();
      return this.localSelectedDate === todayStr ? 'Hari Ini · ' + label : label;
    },
    localMonthCells() {
      const yr = this.localCurDate.getFullYear();
      const mo = this.localCurDate.getMonth();
      const today = new Date(); const todayStr = this.localFmtDate(today);
      const firstDay = new Date(yr, mo, 1);
      const startDow = firstDay.getDay(); // 0=Sun
      const daysInMonth = new Date(yr, mo + 1, 0).getDate();
      const prevDays = new Date(yr, mo, 0).getDate();
      const cells = [];
      // prev month filler
      for (let i = startDow - 1; i >= 0; i--) {
        const d = prevDays - i;
        const dt = new Date(yr, mo - 1, d);
        const ds = this.localFmtDate(dt);
        cells.push({ key: 'p'+d, day: d, inMonth: false, isToday: ds===todayStr, dateStr: ds });
      }
      // current month
      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(yr, mo, d);
        const ds = this.localFmtDate(dt);
        cells.push({ key: 'c'+d, day: d, inMonth: true, isToday: ds===todayStr, dateStr: ds });
      }
      // next month filler
      const remaining = 42 - cells.length;
      for (let d = 1; d <= remaining; d++) {
        const dt = new Date(yr, mo + 1, d);
        const ds = this.localFmtDate(dt);
        cells.push({ key: 'n'+d, day: d, inMonth: false, isToday: ds===todayStr, dateStr: ds });
      }
      return cells;
    },
    localWeekDays() {
      const dow = ['MIN','SEN','SEL','RAB','KAM','JUM','SAB'];
      const today = new Date(); const todayStr = this.localFmtDate(today);
      // Start of week from localCurDate (Sunday)
      const d = new Date(this.localCurDate);
      d.setDate(d.getDate() - d.getDay());
      const days = [];
      for (let i = 0; i < 7; i++) {
        const dt = new Date(d); dt.setDate(d.getDate() + i);
        const ds = this.localFmtDate(dt);
        days.push({ dateStr: ds, dowLabel: dow[i], dayNum: dt.getDate(), isToday: ds===todayStr });
      }
      return days;
    },
    localCurrentHourLabel() {
      const h = new Date().getHours();
      return (h < 10 ? '0' : '') + h + ':00';
    },
    localWeekNowTop() {
      const now = new Date();
      return now.getHours() * 60 + now.getMinutes();
    },
    agendaFilterOptions() {
      const base = [
        { key: 'task',   label: 'Task Plan (Job Logbook)', color: '#D67B52' },
        { key: 'habit',  label: 'Habit (Habit Tracker)',   color: '#A3B18A' },
        { key: 'manual', label: 'Pengingat (edit by n)',   color: '#F59E0B' },
        { key: 'content', label: 'Content Plan (Content Tracker)', color: '#8E7CC3' },
      ];
      const custom = this.customReminderCategories.map(cat => ({
        key: cat.key, label: cat.label + ' (Kategori Custom)', color: cat.color || '#9CA3AF'
      }));
      return [...base, ...custom];
    },
    agendaActiveFilterCount() {
      return Object.values(this.agendaFilters).filter(Boolean).length;
    },

    // ── Cascading Reminder: Section options berdasarkan page yang dipilih ──
    localReminderSections() {
      const page = this.localNewReminder.page;
      if (!page) return [];
      try {
        switch (page) {
          case 'jobLogbook': return [
            { value: 'plans', label: '📋 Task Plan' },
            { value: 'logs',  label: '📝 Log Harian' },
            { value: 'notes', label: '🗒️ Catatan / Notes' },
          ];
          case 'calendarMoment': return [
            { value: 'moments', label: '📅 Momen / Kenangan' },
          ];
          case 'contentTracker': {
            const cols = JSON.parse(WorkspaceStorage.getItem('personal_workspace_content_columns') || '[]');
            const defaults = ['Idea','Writing','In Production','Scheduled','Published'];
            const list = cols.length ? cols : defaults;
            return list.map(c => ({ value: 'col_' + c, label: '📊 ' + c }));
          }
          case 'interviewPractice': {
            const qs = JSON.parse(WorkspaceStorage.getItem('personal_workspace_interview_questions') || '[]');
            const cats = [...new Set(qs.map(q => q.category).filter(Boolean))];
            const base = ['General HR','Technical Speciality','General Technical','Performance Tuning','Behavioral & Teamwork'];
            const allCats = [...new Set([...base, ...cats])];
            return [
              { value: 'all', label: '🎯 Semua Kategori' },
              ...allCats.map(c => ({ value: 'cat_' + c, label: '🎤 ' + c })),
            ];
          }
          case 'dailyNutrition': {
            const customCats = JSON.parse(WorkspaceStorage.getItem('personal_workspace_insight_categories') || '[]');
            const defaultCats = ['Self','Quotes Life','Framework Life','Journaling','Psikologi','Teknologi'];
            const allCats = [...new Set([...defaultCats, ...customCats])];
            return [
              { value: 'all', label: '💡 Semua Insight' },
              { value: 'plans', label: '📌 Plan Insight Berikutnya' },
              ...allCats.map(c => ({ value: 'cat_' + c, label: '🏷️ ' + c })),
            ];
          }
          case 'habitTracker': {
            const habits = JSON.parse(WorkspaceStorage.getItem('aesthetic_habit_tracker_habits') || '[]');
            const cats = [...new Set(habits.map(h => h.category).filter(Boolean))];
            const baseCats = ['Kesehatan','Produktivitas','Pikiran','Rutinitas'];
            const allCats = [...new Set([...baseCats, ...cats])];
            return [
              { value: 'all', label: '✅ Semua Habit' },
              ...allCats.map(c => ({ value: 'cat_' + c, label: '🏷️ ' + c })),
            ];
          }
          case 'pomodoroTimer': return [
            { value: 'focus',      label: '🍅 Sesi Fokus' },
            { value: 'shortBreak', label: '☕ Istirahat Pendek' },
            { value: 'longBreak',  label: '🛌 Istirahat Panjang' },
          ];
          case 'financialTracker': {
            const banks = JSON.parse(WorkspaceStorage.getItem('fin_banks') || '[]');
            return [
              { value: 'all',       label: '💰 Semua Transaksi' },
              { value: 'income',    label: '↑ Pemasukan' },
              { value: 'expense',   label: '↓ Pengeluaran' },
              { value: 'reimburse', label: '↺ Reimburse' },
              { value: 'transfer',  label: '⇄ Transfer' },
              ...banks.map(b => ({ value: 'bank_' + b.id, label: '🏦 ' + b.name })),
            ];
          }
          case 'googleCalendar': return [
            { value: 'month',  label: '📆 Tampilan Bulan' },
            { value: 'week',   label: '📅 Tampilan Minggu' },
            { value: 'agenda', label: '📋 Tampilan Agenda' },
          ];
          default: return [];
        }
      } catch(_e) { return []; }
    },

    // ── Cascading Reminder: Item options berdasarkan page + section yang dipilih ──
    localReminderItems() {
      const page = this.localNewReminder.page;
      const section = this.localNewReminder.section;
      if (!page || !section) return [];
      try {
        switch (page) {
          case 'jobLogbook': {
            if (section === 'plans') {
              const plans = JSON.parse(WorkspaceStorage.getItem('personal_workspace_job_plans') || '[]');
              return plans.map(p => ({ value: p.id, label: (p.phase === 'Completed' ? '✅ ' : '📌 ') + (p.tasks || 'Task tanpa judul').slice(0,60) }));
            }
            if (section === 'logs') {
              const logs = JSON.parse(WorkspaceStorage.getItem('personal_workspace_job_logs') || '[]');
              return [...logs].reverse().slice(0,20).map(l => ({ value: l.id, label: '📝 [' + l.date + '] ' + (l.tasks || '').slice(0,50) }));
            }
            if (section === 'notes') {
              const notes = JSON.parse(WorkspaceStorage.getItem('personal_workspace_job_notes') || '[]');
              return notes.map(n => ({ value: n.id, label: '🗒️ ' + (n.title || n.body || 'Catatan').slice(0,60) }));
            }
            return [];
          }
          case 'contentTracker': {
            const colName = section.replace('col_', '');
            const items = JSON.parse(WorkspaceStorage.getItem('personal_workspace_content_items') || '[]');
            return items.filter(i => i.status === colName).map(i => ({ value: String(i.id), label: '📊 ' + (i.title || '').slice(0,60) + (i.platform ? ' · ' + i.platform : '') }));
          }
          case 'interviewPractice': {
            const qs = JSON.parse(WorkspaceStorage.getItem('personal_workspace_interview_questions') || '[]');
            if (section === 'all') return qs.map(q => ({ value: String(q.id), label: '🎤 ' + q.text.slice(0,70) }));
            const catName = section.replace('cat_', '');
            return qs.filter(q => q.category === catName).map(q => ({ value: String(q.id), label: '🎤 ' + q.text.slice(0,70) }));
          }
          case 'dailyNutrition': {
            if (section === 'plans') {
              const plans = JSON.parse(WorkspaceStorage.getItem('personal_workspace_next_plans') || '[]');
              return plans.map(p => ({ value: p.id || p.title, label: '📌 ' + (p.title || '').slice(0,60) }));
            }
            const insights = JSON.parse(WorkspaceStorage.getItem('personal_workspace_nutrition_insights') || '[]');
            if (section === 'all') return [...insights].reverse().slice(0,20).map(i => ({ value: i.id, label: '💡 ' + (i.title || '').slice(0,60) }));
            const catName = section.replace('cat_', '');
            return insights.filter(i => i.category === catName).map(i => ({ value: i.id, label: '💡 ' + (i.title || '').slice(0,60) }));
          }
          case 'habitTracker': {
            const habits = JSON.parse(WorkspaceStorage.getItem('aesthetic_habit_tracker_habits') || '[]');
            if (section === 'all') return habits.map(h => ({ value: h.id, label: '✅ ' + h.name + (h.timeSchedule ? ' · ' + h.timeSchedule : '') }));
            const catName = section.replace('cat_', '');
            return habits.filter(h => h.category === catName).map(h => ({ value: h.id, label: '✅ ' + h.name + (h.timeSchedule ? ' · ' + h.timeSchedule : '') }));
          }
          case 'financialTracker': {
            if (section.startsWith('bank_')) {
              const bankId = section.replace('bank_', '');
              const txs = JSON.parse(WorkspaceStorage.getItem('fin_transactions') || '[]');
              return txs.filter(t => t.bankId === bankId).slice(-15).reverse().map(t => ({ value: t.id, label: (t.type === 'income' ? '↑ ' : '↓ ') + (t.description || t.category || '').slice(0,50) + (t.amount ? ' · Rp' + Number(t.amount).toLocaleString('id-ID') : '') }));
            }
            return [];
          }
          // section-only pages, no sub-items needed
          default: return [];
        }
      } catch(_e) { return []; }
    },

    localAgendaItems() {
      // depend on tick so this recomputes after manual reminder save
      void this.localStorageTick;
      const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
      const dows = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
      const todayStr = this.localFmtDate(new Date());
      const selectedDate = this.localSelectedDate || todayStr;
      const ds = selectedDate;
      const dt = new Date(ds + 'T12:00:00');
      const isToday = ds === todayStr;
      const TYPE_COLORS = this.agendaFilterColors;
      // Active filters
      const showTask   = this.agendaFilters.task;
      const showHabit  = this.agendaFilters.habit;

      // ── Status selesai (ws_notif_action_status) untuk tanggal ds ──
      let actionStatus = {};
      try {
        const raw = WorkspaceStorage.getItem('ws_notif_action_status');
        const s = JSON.parse(raw || '{}');
        actionStatus = s[ds] || {};
      } catch(_e) { /* ignore */ }
      const isActionDone = (rawId) => !!actionStatus[rawId];

      const allDayItems = [];
      const timed = []; // { id, title, type, color, startMin, endMin, raw }

      // --- Local events (gcal_local_events) ---
      this.localEvents.filter(ev => ev.startDate === ds).forEach(ev => {
        const color = ev.color || '#4285F4';
        if (ev.allDay) {
          allDayItems.push({ id: ev.id, title: ev.title, type: 'event', color, raw: ev });
        } else {
          const [sh, sm] = (ev.startTime || '00:00').split(':').map(Number);
          const [eh, em] = (ev.endTime || '01:00').split(':').map(Number);
          const startMin = sh * 60 + (sm || 0);
          let endMin = eh * 60 + (em || 0);
          if (endMin <= startMin) endMin = startMin + 30;
          timed.push({ id: ev.id, title: ev.title, type: 'event', color, startMin, endMin, raw: ev });
        }
      });

      // --- Task Plan ---
      if (showTask) {
        try {
          const plans = JSON.parse(WorkspaceStorage.getItem('personal_workspace_job_plans') || '[]');
          plans.filter(p => p.date === ds).forEach(p => {
            const id = 'tp-' + p.id;
            const done = p.phase === 'Completed';
            if (p.time) {
              const [sh, sm] = p.time.split(':').map(Number);
              const startMin = sh * 60 + (sm || 0);
              let endMin;
              if (p.timeEnd) {
                const [eh, em] = p.timeEnd.split(':').map(Number);
                endMin = eh * 60 + (em || 0);
                if (endMin <= startMin) endMin = startMin + 30;
              } else {
                endMin = startMin + 60;
              }
              timed.push({ id, title: p.tasks, type: 'task', color: TYPE_COLORS.task, startMin, endMin, raw: p, done, actionable: true, isTaskPlan: true });
            } else {
              allDayItems.push({ id, title: p.tasks, type: 'task', color: TYPE_COLORS.task, raw: p, done, actionable: true, isTaskPlan: true });
            }
          });
        } catch(_e) { /* ignore */ }
      }

      // --- Habit reminders (hari ini: dari ws_habit_notifs; hari lalu/depan: dari histori habit) ---
      if (showHabit) {
        try {
          this.localHabitItemsForDate(ds).forEach(h => {
            const done = h.done;
            if (h.time) {
              const [sh, sm] = h.time.split(':').map(Number);
              const startMin = sh * 60 + (sm || 0);
              timed.push({ id: h.id, title: h.title, type: 'habit', color: TYPE_COLORS.habit, startMin, endMin: startMin + 30, raw: h, done, actionable: h.actionable });
            } else {
              allDayItems.push({ id: h.id, title: h.title, type: 'habit', color: TYPE_COLORS.habit, raw: h, done, actionable: h.actionable });
            }
          });
        } catch(_e) { /* ignore */ }
      }

      // --- Manual reminders (default + custom categories) ---
      try {
        const manuals = JSON.parse(WorkspaceStorage.getItem('ws_manual_notifs') || '[]');
        manuals.filter(m => reminderOccursOnDate(m, ds)).forEach(m => {
          const cat = m.category || 'manual';
          if (this.agendaFilters[cat] === false) return;
          const id = 'manual-' + m.id;
          const done = isActionDone(m.id);
          const color = TYPE_COLORS[cat] || TYPE_COLORS.manual;
          if (m.time) {
            const [sh, sm] = m.time.split(':').map(Number);
            const startMin = sh * 60 + (sm || 0);
            let endMin = startMin + 30;
            if (m.endTimeVal != null && m.endTimeVal > startMin) endMin = m.endTimeVal;
            else if (m.endTime) {
              const [eh, em] = m.endTime.split(':').map(Number);
              const ev = eh * 60 + (em || 0);
              if (ev > startMin) endMin = ev;
            }
            timed.push({ id, title: m.title, type: 'manual', category: cat, color, startMin, endMin, raw: m, done, actionable: true });
          } else {
            allDayItems.push({ id, title: m.title, type: 'manual', category: cat, color, raw: m, done, actionable: true });
          }
        });
      } catch(_e) { /* ignore */ }

      // --- Content Plan (Content Tracker) — berdasarkan Target Tanggal & Jam Rilis ---
      if (this.agendaFilters.content) {
        try {
          const contents = JSON.parse(WorkspaceStorage.getItem('personal_workspace_content_items') || '[]');
          contents.filter(c => c.dueDate === ds).forEach(c => {
            const id = 'content-' + c.id;
            const subtitle = `Content · ${c.platform || ''}${c.username ? ' · ' + c.username : ''} · ${c.status || ''}`;
            if (c.dueTime) {
              const [sh, sm] = c.dueTime.split(':').map(Number);
              const startMin = sh * 60 + (sm || 0);
              const endMin = startMin + 30;
              timed.push({ id, title: c.title, type: 'content', color: TYPE_COLORS.content, startMin, endMin, raw: { ...c, subtitle }, actionable: false });
            } else {
              allDayItems.push({ id, title: c.title, type: 'content', color: TYPE_COLORS.content, raw: { ...c, subtitle }, actionable: false });
            }
          });
        } catch(_e) { /* ignore */ }
      }

      // --- Assign overlap columns for timed items ---
      timed.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
      const columns = []; // each: last endMin
      timed.forEach(item => {
        let colIdx = columns.findIndex(endMin => endMin <= item.startMin);
        if (colIdx === -1) { colIdx = columns.length; columns.push(0); }
        columns[colIdx] = item.endMin;
        item.col = colIdx;
      });
      const totalCols = Math.max(1, columns.length);

      const fmt = (min) => String(Math.floor(min/60)%24).padStart(2,'0') + ':' + String(min%60).padStart(2,'0');
      const timedBlocks = timed.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        color: item.color,
        raw: item.raw,
        isTaskPlan: !!item.isTaskPlan,
        top: item.startMin,
        height: Math.max(item.endMin - item.startMin, 15),
        col: item.col,
        totalCols,
        startLabel: fmt(item.startMin),
        endLabel: fmt(item.endMin),
        done: !!item.done,
        actionable: !!item.actionable
      }));

      let nowLineTop = null;
      if (isToday) {
        const now = new Date();
        nowLineTop = now.getHours() * 60 + now.getMinutes();
      }

      return [{
        dateStr: ds, isToday,
        dow: dows[dt.getDay()], day: dt.getDate(), mon: months[dt.getMonth()],
        allDayItems,
        timedBlocks,
        nowLineTop
      }];
    }
  },
  mounted() {
    this.initFirebase();
    this.localCurDate = new Date();
    this._onPlansUpdated = () => { this.localStorageTick++; };
    globalThis.addEventListener('ws-plans-updated', this._onPlansUpdated);
    // Refresh agenda view kalau status selesai (ws_notif_action_status) berubah dari
    // tempat lain (Panel Notifikasi atau Tabel Habit), supaya block agenda ikut update.
    this._onNotifStatusUpdated = () => { this.localStorageTick++; };
    globalThis.addEventListener('ws-notif-status-updated', this._onNotifStatusUpdated);
    // Pastikan setiap kategori custom punya state filter & warna default
    this.customReminderCategories.forEach(cat => {
      if (!(cat.key in this.agendaFilters)) this.agendaFilters[cat.key] = true;
      if (!(cat.key in this.agendaFilterColors)) this.agendaFilterColors[cat.key] = cat.color || '#9CA3AF';
    });
  },
  beforeUnmount() {
    globalThis.removeEventListener('ws-plans-updated', this._onPlansUpdated);
    globalThis.removeEventListener('ws-notif-status-updated', this._onNotifStatusUpdated);
  },
  methods: {
    // ── Custom warna kategori filter agenda ──
    localUpdateFilterColor(key, value) {
      this.agendaFilterColors = { ...this.agendaFilterColors, [key]: value };
      try { WorkspaceStorage.setItem('gcal_agenda_filter_colors', JSON.stringify(this.agendaFilterColors)); } catch(_e) { /* ignore */ }
      this.localStorageTick++;
    },
    localResetFilterColors() {
      this.agendaFilterColors = { task: '#D67B52', habit: '#A3B18A', manual: '#F59E0B', content: '#8E7CC3' };
      try { WorkspaceStorage.setItem('gcal_agenda_filter_colors', JSON.stringify(this.agendaFilterColors)); } catch(_e) { /* ignore */ }
      this.localStorageTick++;
    },
    // ── FIX: format Date object ke 'YYYY-MM-DD' berdasarkan LOCAL timezone,
    // bukan UTC seperti toISOString(). Mencegah tanggal "geser" mundur 1 hari
    // saat user berada di timezone +UTC (misal WIB) terutama tengah malam.
    localFmtDate(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },
    // ── Helper: tanggal sehari sebelum dateStr (dipakai saat split seri "acara ini dan seterusnya") ──
    localDayBefore(dateStr) {
      const d = new Date(dateStr + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      return this.localFmtDate(d);
    },
    // ── Helper: ubah warna hex jadi rgba transparan, untuk background pill yang lembut ──
    localTintColor(hex, alpha) {
      if (!hex) return `rgba(0,0,0,${alpha})`;
      const h = hex.replace('#', '');
      const r = parseInt(h.substring(0,2), 16);
      const g = parseInt(h.substring(2,4), 16);
      const b = parseInt(h.substring(4,6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    },
    // ── HELPER: ambil semua habit untuk SATU tanggal (hari ini ATAU masa lalu) ──
    // Hari ini  → pakai ws_habit_notifs (sudah include jadwal jam) + status dari ws_notif_action_status
    // Hari lalu → pakai aesthetic_habit_tracker_habits + habit.history['YYYY-MM'] utk cek selesai/tidak
    //   (history menyimpan tanggal yg di-checklist; jika tgl tsb ada di history -> done = true)
    //   Habit yg dibuat SETELAH tanggal tsb (createdAt > dateStr) tidak ditampilkan,
    //   supaya histori tidak menampilkan habit yang belum exist saat itu.
    localHabitItemsForDate(dateStr) {
      const todayStr = this.localFmtDate(new Date());
      const isToday = dateStr === todayStr;
      const result = [];

      if (isToday) {
        let actionStatus = {};
        try {
          const raw = WorkspaceStorage.getItem('ws_notif_action_status');
          const s = JSON.parse(raw || '{}');
          actionStatus = s[dateStr] || {};
        } catch(_e) { /* ignore */ }
        try {
          const habits = JSON.parse(WorkspaceStorage.getItem('ws_habit_notifs') || '[]');
          habits.forEach(h => {
            result.push({
              id: h.id, // sama dengan key di ws_habit_notifs & notif panel (mis. 'habit_xxx')
              habitId: h.habitId || h.id.replace(/^habit_/, ''),
              title: h.title,
              time: h.time || null,
              done: !!actionStatus[h.id],
              actionable: true
            });
          });
        } catch(_e) { /* ignore */ }
        return result;
      }

      // --- Tanggal masa lalu / masa depan: baca dari data habit asli + history ---
      try {
        const [yr, mo, dayNum] = dateStr.split('-').map(Number);
        const yearMonthKey = `${String(yr).padStart(4,'0')}-${String(mo).padStart(2,'0')}`;
        const habits = JSON.parse(WorkspaceStorage.getItem('aesthetic_habit_tracker_habits') || '[]');
        habits.forEach(h => {
          // Jika habit punya createdAt dan tanggal yg dilihat sebelum habit dibuat, skip
          if (h.createdAt) {
            const createdDateStr = String(h.createdAt).split('T')[0];
            if (dateStr < createdDateStr) return;
          }
          const checkedDays = (h.history && h.history[yearMonthKey]) || [];
          const done = checkedDays.includes(dayNum);
          result.push({
            id: 'habit-' + h.id,
            title: h.name,
            time: h.timeSchedule || null,
            done,
            actionable: false // histori: tidak bisa di-toggle dari Google Calendar
          });
        });
      } catch(_e) { /* ignore */ }

      return result;
    },
    localGoToLogbook() {
      globalThis.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'jobLogbook' }));
    },
    // ── Navigasi ke halaman Habit Tracker (klik area block habit, di luar bullet checklist) ──
    localGoToHabitTracker() {
      globalThis.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'habitTracker' }));
    },
    // ── Cascading reminder: reset section & item saat page berganti ──
    localOnPageChange() {
      this.localNewReminder.section = '';
      this.localNewReminder.targetItem = '';
    },
    // ── Cascading reminder: reset item saat section berganti ──
    localOnSectionChange() {
      this.localNewReminder.targetItem = '';
    },
    // ============ LOCAL CALENDAR METHODS ============
    // Task Plan → toggle done langsung di storage (tanpa navigasi, agar checklist lain tidak hilang)
    // Habit/Manual → toggle done via ws_notif_action_status
    localHandleAgendaAction(block) {
      if (block.isTaskPlan) {
        this.localToggleTaskPlanDone(block);
        return;
      }
      this.localToggleAgendaDone(block);
    },
    localToggleTaskPlanDone(block) {
      try {
        const plans = JSON.parse(WorkspaceStorage.getItem('personal_workspace_job_plans') || '[]');
        const planId = block.raw && block.raw.id;
        if (!planId) return;
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;
        const nowDone = plan.phase !== 'Completed';
        plan.phase = nowDone ? 'Completed' : 'To-do';
        WorkspaceStorage.setItem('personal_workspace_job_plans', JSON.stringify(plans));
        // Trigger recompute agenda view — cukup increment tick, tanpa broadcast ke komponen lain
        this.localStorageTick++;
        if (nowDone && typeof NotifSound !== 'undefined') NotifSound.playCheck && NotifSound.playCheck();
      } catch(_e) { /* ignore */ }
    },
    localToggleAgendaDone(block) {
      const ds = this.localSelectedDate || this.localFmtDate(new Date());
      const storageKey = (block.raw && block.raw.id) ? block.raw.id : block.id;
      let nowDone = false;
      try {
        const raw = WorkspaceStorage.getItem('ws_notif_action_status');
        const s = raw ? JSON.parse(raw) : {};
        if (!s[ds]) s[ds] = {};
        nowDone = !s[ds][storageKey];
        if (nowDone) { s[ds][storageKey] = true; } else { delete s[ds][storageKey]; }
        WorkspaceStorage.setItem('ws_notif_action_status', JSON.stringify(s));
        this.localStorageTick++;
        if (nowDone && typeof NotifSound !== 'undefined') NotifSound.playCheck && NotifSound.playCheck();
        // Beri tahu Panel Notifikasi (dan komponen lain) bahwa status selesai berubah,
        // supaya badge & daftar di panel notif langsung ikut update.
        globalThis.dispatchEvent(new CustomEvent('ws-notif-status-updated', {
          detail: { date: ds, id: storageKey, done: nowDone, source: 'agendaView' }
        }));
      } catch(_e) { /* ignore */ }

      // Jika item ini habit, sinkronkan juga ke tabel Habit Tracker (centang/uncentang hari ini)
      if (block.type === 'habit' && block.raw && block.raw.habitId) {
        this.localSyncHabitHistory(block.raw.habitId, ds, nowDone);
      }
    },
    // ── Sinkronisasi checklist habit dari Agenda ke tabel Habit Tracker ──
    localSyncHabitHistory(habitId, dateStr, checked) {
      try {
        const raw = WorkspaceStorage.getItem('aesthetic_habit_tracker_habits');
        if (!raw) return;
        const habits = JSON.parse(raw);
        const [yr, mo, dayNum] = dateStr.split('-').map(Number);
        const ym = `${String(yr).padStart(4,'0')}-${String(mo).padStart(2,'0')}`;
        const day = dayNum;
        const updated = habits.map(h => {
          if (h.id !== habitId) return h;
          const hist = { ...h.history };
          let arr = hist[ym] ? [...hist[ym]] : [];
          if (checked) {
            if (!arr.includes(day)) arr.push(day);
          } else {
            arr = arr.filter(d => d !== day);
          }
          hist[ym] = arr.sort((a, b) => a - b);
          return { ...h, history: hist };
        });
        WorkspaceStorage.setItem('aesthetic_habit_tracker_habits', JSON.stringify(updated));
        // Beri tahu komponen Habit Tracker (jika sedang aktif) untuk reload data
        globalThis.dispatchEvent(new CustomEvent('ws-plans-updated'));
      } catch(_e) { /* ignore */ }
    },
    localSaveEvents() {
      try { localStorage.setItem('gcal_local_events', JSON.stringify(this.localEvents)); } catch(_e){ /* ignore */ }
    },

    // ─────────────────────────────────────────────
    // AGENDA DETAIL POPUP METHODS
    // ─────────────────────────────────────────────
    localShowAgendaDetail(block) {
      // Gabungkan data block dengan dateStr halaman yang sedang tampil
      const ds = this.localSelectedDate || this.localFmtDate(new Date());
      this.agendaDetailItem = { ...block, dateStr: ds };
    },

    localFmtDateLabel(dateStr) {
      if (!dateStr) return '';
      try {
        const dt = new Date(dateStr + 'T12:00:00');
        const days   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
        const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        return `${days[dt.getDay()]}, ${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
      } catch(_e) { return dateStr; }
    },

    localRecurrenceLabel(rec, startDate) {
      if (!rec || rec === 'none') return 'Tidak berulang';
      if (rec === 'daily') return 'Setiap hari';
      if (rec === 'weekday') return 'Setiap hari kerja (Sen–Jum)';
      if (rec === 'monthly') {
        if (startDate) {
          const d = new Date(startDate + 'T12:00:00');
          return `Setiap tanggal ${d.getDate()}`;
        }
        return 'Bulanan';
      }
      if (rec === 'yearly') {
        if (startDate) {
          const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
          const d = new Date(startDate + 'T12:00:00');
          return `Setiap tahun, ${d.getDate()} ${months[d.getMonth()]}`;
        }
        return 'Tahunan';
      }
      if (rec === 'weekly') {
        if (startDate) {
          const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
          const d = new Date(startDate + 'T12:00:00');
          return `Setiap ${days[d.getDay()]}`;
        }
        return 'Mingguan';
      }
      return rec;
    },

    localCategoryLabel(cat) {
      if (!cat || cat === 'manual') return 'Pengingat';
      // Cek custom categories
      const custom = this.customReminderCategories.find(c => c.key === cat);
      if (custom) return custom.label;
      return cat;
    },

    localPageLabel(page) {
      const map = {
        jobLogbook: 'Job Logbook',
        calendarMoment: 'Calendar Moment',
        contentTracker: 'Content Tracker',
        interviewPractice: 'Interview Practice',
        dailyNutrition: 'Daily Nutrition (Insight)',
        habitTracker: 'Habit Tracker',
        pomodoroTimer: 'Pomodoro Timer',
        googleCalendar: 'Daily n (Kalender)',
        financialTracker: 'Financial Tracker',
      };
      return map[page] || page;
    },

    localNavigateFromDetail(page) {
      if (!page) return;
      globalThis.dispatchEvent(new CustomEvent('navigate-to-page', { detail: page }));
      this.agendaDetailItem = null;
    },

    localMarkDoneFromDetail(block) {
      if (!block) return;
      this.localHandleAgendaAction(block);
      // Update the popup state to reflect new done status
      const ds = block.dateStr || this.localSelectedDate || this.localFmtDate(new Date());
      const storageKey = (block.raw && block.raw.id) ? block.raw.id : block.id;
      try {
        const raw = WorkspaceStorage.getItem('ws_notif_action_status');
        const s = raw ? JSON.parse(raw) : {};
        const nowDone = !!(s[ds] && s[ds][storageKey]);
        this.agendaDetailItem = { ...this.agendaDetailItem, done: nowDone };
      } catch(_e) { /* ignore */ }
    },

    // ── Batal isi form pengingat — tutup modal & reset semua flag (termasuk split/exclude) ──
    localCancelReminderForm() {
      this.localShowForm = false;
      this.localShowRecurrenceDropdown = false;
      this.customRecurrenceSaved = null;
      const defaultDate = (this.localView === 'agenda' && this.localSelectedDate) ? this.localSelectedDate : this.localFmtDate(new Date());
      this.localNewReminder = { title:'', subtitle:'', date: defaultDate, endDate: '', time:'', endTime:'', allDay: false, page:'', section:'', targetItem:'', category: 'manual', recurrence: 'none' };
    },
    // ── Reset form pengingat sepenuhnya (hapus sisa flag split/exclude dari sesi edit sebelumnya) lalu buka modal ──
    localResetReminderFormAndOpen() {
      const defaultDate = (this.localView === 'agenda' && this.localSelectedDate) ? this.localSelectedDate : this.localFmtDate(new Date());
      this.localNewReminder = { title:'', subtitle:'', date: defaultDate, endDate: '', time:'', endTime:'', allDay: false, page:'', section:'', targetItem:'', category: 'manual', recurrence: 'none' };
      this.customRecurrenceSaved = null;
      this.localShowForm = true;
    },
    // ── Eksekusi pilihan dari popup "Hapus/Edit acara rutin" sesuai radio yang dipilih ──
    localConfirmRecurAction() {
      if (!this.recurActionPopup) return;
      const { mode, block } = this.recurActionPopup;
      const scope = this.recurActionChoice; // 'this' | 'following' | 'all'
      if (mode === 'delete') {
        this.localDeleteManualReminder(block, scope);
      } else {
        this.localOpenEditForm(block, scope);
      }
    },
    localDeleteFromDetail(block) {
      if (!block || !block.raw) return;
      const rawId = block.raw.id;
      if (!rawId) return;
      // Jika pengingat ini berulang, tanya dulu lingkup hapus (ala Google Calendar)
      const rec = block.raw.recurrence || 'none';
      if (rec !== 'none') {
        this.recurActionChoice = 'this';
        this.recurActionPopup = { mode: 'delete', block };
        return;
      }
      this.localDeleteManualReminder(block, 'all');
    },

    // ── Eksekusi hapus pengingat manual sesuai lingkup yang dipilih ──
    // scope: 'this' (hanya tanggal ini), 'following' (ini dan seterusnya), 'all' (seluruh seri)
    localDeleteManualReminder(block, scope) {
      if (!block || !block.raw) return;
      const rawId = block.raw.id;
      if (!rawId) return;
      const occurDate = block.dateStr || this.localSelectedDate || this.localFmtDate(new Date());
      try {
        const raw = WorkspaceStorage.getItem('ws_manual_notifs');
        let manuals = raw ? JSON.parse(raw) : [];
        const idx = manuals.findIndex(m => m.id === rawId);
        if (idx === -1) { this.agendaDetailItem = null; this.recurActionPopup = null; return; }

        if (scope === 'all') {
          manuals = manuals.filter(m => m.id !== rawId);
        } else if (scope === 'following') {
          if (occurDate <= manuals[idx].date) {
            // Hapus dari kejadian pertama — sama saja dengan hapus seluruh seri
            manuals = manuals.filter(m => m.id !== rawId);
          } else {
            // Seri berhenti sehari sebelum tanggal ini — acara sebelumnya tetap ada
            manuals[idx] = { ...manuals[idx], endDate: this.localDayBefore(occurDate) };
          }
        } else {
          // 'this' — skip tanggal ini saja, sisanya tetap berulang seperti biasa
          const excluded = Array.isArray(manuals[idx].excludedDates) ? [...manuals[idx].excludedDates] : [];
          if (!excluded.includes(occurDate)) excluded.push(occurDate);
          manuals[idx] = { ...manuals[idx], excludedDates: excluded };
        }

        WorkspaceStorage.setItem('ws_manual_notifs', JSON.stringify(manuals));
        this.localStorageTick++;
        globalThis.dispatchEvent(new CustomEvent('ws-manual-notif-updated'));
        this.agendaDetailItem = null;
        this.recurActionPopup = null;
      } catch(_e) { /* ignore */ }
    },

    // Hapus task plan ini dari sumber data (personal_workspace_job_plans) supaya
    // hilang sepenuhnya dari Agenda View dan Panel Notifikasi sekaligus.
    localDeleteTaskPlanFromDetail(block) {
      if (!block || !block.raw) return;
      const rawId = block.raw.id;
      if (rawId == null) return;
      if (!confirm('Hapus task plan ini dari Agenda View dan Panel Notifikasi?')) return;
      try {
        const raw = WorkspaceStorage.getItem('personal_workspace_job_plans');
        let plans = raw ? JSON.parse(raw) : [];
        plans = plans.filter(p => p.id !== rawId);
        WorkspaceStorage.setItem('personal_workspace_job_plans', JSON.stringify(plans));
        this.localStorageTick++;
        // Dispatch event supaya Panel Notifikasi yang sedang terbuka langsung refresh
        globalThis.dispatchEvent(new CustomEvent('ws-job-plans-updated'));
        this.agendaDetailItem = null;
      } catch(_e) { /* ignore */ }
    },

    localEditFromDetail(block) {
      if (!block || !block.raw) return;
      // Jika pengingat ini berulang, tanya dulu lingkup edit (ala Google Calendar)
      const rec = block.raw.recurrence || 'none';
      if (rec !== 'none') {
        this.recurActionChoice = 'this';
        this.recurActionPopup = { mode: 'edit', block };
        return;
      }
      this.localOpenEditForm(block, 'all');
    },

    // ── Buka form edit, sesuaikan prefill berdasarkan lingkup yang dipilih ──
    // scope: 'this' (buat exception khusus tanggal ini), 'following' (split seri dari tanggal ini), 'all' (edit seri penuh)
    localOpenEditForm(block, scope) {
      if (!block || !block.raw) return;
      const m = block.raw;
      const occurDate = block.dateStr || this.localSelectedDate || this.localFmtDate(new Date());

      if (scope === 'this') {
        // Buat entri baru non-berulang khusus tanggal ini, tanggal asal di-exclude dari seri lama
        this.localNewReminder = {
          title: m.title || '', subtitle: m.subtitle || '',
          date: occurDate, endDate: '',
          time: m.time || '', endTime: m.endTime || '',
          page: m.page || '', section: m.section || '', targetItem: m.targetItem || '',
          category: m.category || 'manual', recurrence: 'none',
          _editId: null, // entri baru, bukan update id lama
          _excludeFromSeriesId: m.id, _excludeDate: occurDate,
        };
        this.customRecurrenceSaved = null;
      } else if (scope === 'following') {
        // Seri lama akan dipotong (endDate = sehari sebelum tanggal ini) saat disimpan;
        // form ini jadi seri BARU mulai dari tanggal occurrence dengan recurrence yang sama
        this.localNewReminder = {
          title: m.title || '', subtitle: m.subtitle || '',
          date: occurDate, endDate: m.endDate || '',
          time: m.time || '', endTime: m.endTime || '',
          page: m.page || '', section: m.section || '', targetItem: m.targetItem || '',
          category: m.category || 'manual', recurrence: m.recurrence || 'none',
          _editId: null, // entri baru (seri kedua)
          _splitFromSeriesId: m.id, _splitBeforeDate: occurDate,
        };
        this.customRecurrenceSaved = (m.recurrence === 'custom' && m.customRecurrence) ? { ...m.customRecurrence } : null;
      } else {
        // 'all' — edit seri penuh seperti biasa
        this.localNewReminder = {
          title: m.title || '', subtitle: m.subtitle || '',
          date: m.date || this.localFmtDate(new Date()), endDate: m.endDate || '',
          time: m.time || '', endTime: m.endTime || '',
          page: m.page || '', section: m.section || '', targetItem: m.targetItem || '',
          category: m.category || 'manual', recurrence: m.recurrence || 'none',
          _editId: m.id,
        };
        this.customRecurrenceSaved = (m.recurrence === 'custom' && m.customRecurrence) ? { ...m.customRecurrence } : null;
      }

      this.agendaDetailItem = null;
      this.recurActionPopup = null;
      this.localShowForm = true;
    },

    // ── SHARED HELPER: semua item (semua tipe) untuk satu tanggal, dihormati filter ──
    localAllItemsForDate(dateStr) {
      void this.localStorageTick;
      const todayStr = this.localFmtDate(new Date());
      const isToday = dateStr === todayStr;
      const TYPE_COLORS = { ...this.agendaFilterColors, event: '#4285F4' };
      let actionStatus = {};
      try {
        const raw = WorkspaceStorage.getItem('ws_notif_action_status');
        const s = JSON.parse(raw || '{}');
        actionStatus = s[dateStr] || {};
      } catch(_e) { /* ignore */ }
      const isActionDone = (id) => !!actionStatus[id];
      const items = [];

      // Events (always shown, not filterable)
      this.localEvents.filter(ev => ev.startDate === dateStr).forEach(ev => {
        const [sh, sm] = (ev.startTime || '00:00').split(':').map(Number);
        const [eh, em] = (ev.endTime || '01:00').split(':').map(Number);
        const startMin = ev.allDay ? null : sh * 60 + (sm || 0);
        let endMin = ev.allDay ? null : eh * 60 + (em || 0);
        if (startMin !== null && endMin <= startMin) endMin = startMin + 30;
        items.push({ id: ev.id, title: ev.title, type: 'event', color: ev.color || TYPE_COLORS.event, startMin, endMin, done: false, allDay: !!ev.allDay });
      });

      // Task Plan
      if (this.agendaFilters.task) {
        try {
          const plans = JSON.parse(WorkspaceStorage.getItem('personal_workspace_job_plans') || '[]');
          plans.filter(p => p.date === dateStr).forEach(p => {
            const done = p.phase === 'Completed';
            let startMin = null, endMin = null;
            if (p.time) {
              const [sh, sm] = p.time.split(':').map(Number);
              startMin = sh * 60 + (sm || 0);
              if (p.timeEnd) { const [eh, em] = p.timeEnd.split(':').map(Number); endMin = eh * 60 + (em || 0); if (endMin <= startMin) endMin = startMin + 60; }
              else endMin = startMin + 60;
            }
            items.push({ id: 'tp-' + p.id, title: p.tasks, type: 'task', color: TYPE_COLORS.task, startMin, endMin, done, allDay: !p.time });
          });
        } catch(_e) { /* ignore */ }
      }

      // Habits (hari ini: notif; hari lalu/depan: histori habit)
      if (this.agendaFilters.habit) {
        try {
          this.localHabitItemsForDate(dateStr).forEach(h => {
            let startMin = null, endMin = null;
            if (h.time) { const [sh, sm] = h.time.split(':').map(Number); startMin = sh * 60 + (sm || 0); endMin = startMin + 30; }
            items.push({ id: h.id, title: h.title, type: 'habit', color: TYPE_COLORS.habit, startMin, endMin, done: h.done, allDay: !h.time });
          });
        } catch(_e) { /* ignore */ }
      }

      // Manual reminders (default + custom categories)
      try {
        const manuals = JSON.parse(WorkspaceStorage.getItem('ws_manual_notifs') || '[]');
        manuals.filter(m => reminderOccursOnDate(m, dateStr)).forEach(m => {
          const cat = m.category || 'manual';
          // skip jika kategori (default atau custom) sedang dinonaktifkan di filter agenda
          if (this.agendaFilters[cat] === false) return;
          const done = isActionDone(m.id);
          let startMin = null, endMin = null;
          if (m.time) {
            const [sh, sm] = m.time.split(':').map(Number);
            startMin = sh * 60 + (sm || 0);
            endMin = startMin + 30;
            if (m.endTimeVal != null && m.endTimeVal > startMin) endMin = m.endTimeVal;
            else if (m.endTime) {
              const [eh, em] = m.endTime.split(':').map(Number);
              const ev = eh * 60 + (em || 0);
              if (ev > startMin) endMin = ev;
            }
          }
          const color = TYPE_COLORS[cat] || TYPE_COLORS.manual;
          items.push({ id: 'manual-' + m.id, title: m.title, type: 'manual', category: cat, color, startMin, endMin, done, allDay: !m.time });
        });
      } catch(_e) { /* ignore */ }

      items.sort((a, b) => {
        if (a.startMin === null && b.startMin === null) return 0;
        if (a.startMin === null) return -1;
        if (b.startMin === null) return 1;
        return a.startMin - b.startMin;
      });
      return items;
    },

    // ── Dot indicators untuk month view ──
    localDotsForDate(dateStr) {
      const items = this.localAllItemsForDate(dateStr);
      const typeMeta = {
        task:   { color: this.agendaFilterColors.task,   label: 'Task Plan' },
        habit:  { color: this.agendaFilterColors.habit,  label: 'Habit' },
        manual: { color: this.agendaFilterColors.manual, label: 'Pengingat' },
        event:  { color: '#4285F4', label: 'Acara' },
      };
      const customLabel = {};
      this.customReminderCategories.forEach(c => { customLabel[c.key] = c.label; });
      const counts = {};
      const groupKeyFor = (it) => (it.type === 'manual' && it.category && it.category !== 'manual') ? it.category : it.type;
      items.forEach(it => { const gk = groupKeyFor(it); counts[gk] = (counts[gk] || 0) + 1; });
      return Object.entries(counts).map(([gk, count]) => {
        const meta = typeMeta[gk];
        if (meta) return { type: gk, count, color: meta.color || '#999', label: meta.label };
        return { type: gk, count, color: this.agendaFilterColors[gk] || '#999', label: customLabel[gk] || gk };
      });
    },

    // ── Total item count untuk badge di month view ──
    localTotalItemsForDate(dateStr) {
      return this.localAllItemsForDate(dateStr).length;
    },

    // ── Helper: format menit jadi HH:MM untuk tooltip ──
    localFmtMin(min) {
      if (min === null || min === undefined) return '';
      return String(Math.floor(min / 60) % 24).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
    },

    // ── Helper: label tanggal lengkap untuk header tooltip ──
    localTooltipDateLabel(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr + 'T12:00:00');
      const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
      return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()];
    },

    // ── Blocks untuk week view timeline (hanya item yang punya waktu) ──
    localWeekBlocksForDate(dateStr) {
      const items = this.localAllItemsForDate(dateStr).filter(it => it.startMin !== null);
      items.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
      // Overlap column assignment
      const columns = [];
      items.forEach(item => {
        let colIdx = columns.findIndex(endMin => endMin <= item.startMin);
        if (colIdx === -1) { colIdx = columns.length; columns.push(0); }
        columns[colIdx] = item.endMin;
        item.col = colIdx;
      });
      const totalCols = Math.max(1, columns.length);
      const fmt = (min) => String(Math.floor(min/60)%24).padStart(2,'0') + ':' + String(min%60).padStart(2,'0');
      return items.map(item => ({
        id: item.id, title: item.title, type: item.type, color: item.color,
        top: item.startMin, height: Math.max(item.endMin - item.startMin, 25),
        col: item.col, totalCols, startLabel: fmt(item.startMin), done: item.done
      }));
    },

    localEventsForDate(dateStr) {
      return this.localEvents.filter(ev => ev.startDate === dateStr);
    },
    localGoToday() {
      this.localCurDate = new Date();
      this.localSelectedDate = this.localFmtDate(new Date());
    },
    localPrevDay() {
      const d = new Date(this.localSelectedDate + 'T12:00:00');
      d.setDate(d.getDate() - 1);
      this.localSelectedDate = this.localFmtDate(d);
    },
    localNextDay() {
      const d = new Date(this.localSelectedDate + 'T12:00:00');
      d.setDate(d.getDate() + 1);
      this.localSelectedDate = this.localFmtDate(d);
    },
    localPrevMonth() {
      const d = new Date(this.localCurDate);
      if (this.localView === 'week') { d.setDate(d.getDate() - 7); }
      else { d.setMonth(d.getMonth() - 1); }
      this.localCurDate = d;
    },
    localNextMonth() {
      const d = new Date(this.localCurDate);
      if (this.localView === 'week') { d.setDate(d.getDate() + 7); }
      else { d.setMonth(d.getMonth() + 1); }
      this.localCurDate = d;
    },
    localOpenCustomRecurrence() {
      this.localShowRecurrenceDropdown = false;
      // Pre-fill form dari custom yang sudah ada, atau dari unit bawaan startDate
      if (this.customRecurrenceSaved) {
        this.customRecurrenceForm = { ...this.customRecurrenceSaved };
      } else {
        // Default: 1 minggu, hari sesuai tanggal mulai dipilih
        const startDate = this.localNewReminder.date;
        let dayIdx = new Date().getDay();
        if (startDate) { try { dayIdx = new Date(startDate + 'T00:00:00').getDay(); } catch(_e) {} }
        this.customRecurrenceForm = { interval: 1, unit: 'week', days: [dayIdx], endType: 'never', endDate: '', count: 13 };
      }
      this.showCustomRecurrenceModal = true;
    },
    onCustomRecurrenceUnitChange() {
      // Saat ganti ke minggu, auto-pilih hari sesuai tanggal mulai
      if (this.customRecurrenceForm.unit === 'week' && this.customRecurrenceForm.days.length === 0) {
        const startDate = this.localNewReminder.date;
        let dayIdx = new Date().getDay();
        if (startDate) { try { dayIdx = new Date(startDate + 'T00:00:00').getDay(); } catch(_e) {} }
        this.customRecurrenceForm.days = [dayIdx];
      }
    },
    localToggleCustomDay(idx) {
      const days = [...this.customRecurrenceForm.days];
      const pos = days.indexOf(idx);
      if (pos >= 0) {
        // jangan hapus kalau hanya tinggal 1
        if (days.length > 1) days.splice(pos, 1);
      } else {
        days.push(idx);
      }
      this.customRecurrenceForm.days = days;
    },
    localSaveCustomRecurrence() {
      const f = this.customRecurrenceForm;
      if (f.unit === 'week' && (!f.days || f.days.length === 0)) {
        alert('Pilih minimal satu hari!'); return;
      }
      if (f.interval < 1 || isNaN(f.interval)) { f.interval = 1; }
      if (f.endType === 'count' && (f.count < 1 || isNaN(f.count))) { f.count = 1; }
      this.customRecurrenceSaved = { ...f };
      this.localNewReminder.recurrence = 'custom';
      this.showCustomRecurrenceModal = false;
    },
    localAddReminder() {
      if (!this.localNewReminder.title.trim()) { this.localError = 'Judul pengingat tidak boleh kosong!'; return; }
      if (!this.localNewReminder.date) { this.localError = 'Tanggal mulai harus diisi!'; return; }
      if (this.localNewReminder.endDate && this.localNewReminder.endDate < this.localNewReminder.date) { this.localError = 'Tanggal selesai tidak boleh sebelum tanggal mulai!'; return; }
      if (this.localNewReminder.time && this.localNewReminder.endTime && this.localNewReminder.endTime <= this.localNewReminder.time) { this.localError = 'Jam selesai harus setelah jam mulai!'; return; }
      // timeVal: -1 kalau tanpa waktu (all-day), supaya muncul di bagian atas panel notif
      let timeVal = -1;
      if (!this.localNewReminder.allDay && this.localNewReminder.time) {
        const [hh, mm] = this.localNewReminder.time.split(':').map(Number);
        timeVal = hh * 60 + (mm || 0);
      }
      let endTimeVal = null;
      if (this.localNewReminder.endTime && !this.localNewReminder.allDay) {
        const [eh, em] = this.localNewReminder.endTime.split(':').map(Number);
        endTimeVal = eh * 60 + (em || 0);
      }
      // Jika mode edit (_editId ada), pertahankan id lama; kalau baru, buat id baru
      const editId = this.localNewReminder._editId || null;
      const id = editId || ('manual_' + Date.now());
      let manuals = [];
      try {
        const raw = WorkspaceStorage.getItem('ws_manual_notifs');
        manuals = raw ? JSON.parse(raw) : [];
      } catch(_e) { manuals = []; }
      // Hapus entri lama (jika edit mode)
      if (editId) manuals = manuals.filter(m => m.id !== editId);

      // ── Mode "acara ini saja" (edit): tanggal asal di-exclude dari seri lama, entri ini jadi exception berdiri sendiri ──
      if (this.localNewReminder._excludeFromSeriesId && this.localNewReminder._excludeDate) {
        const seriesIdx = manuals.findIndex(m => m.id === this.localNewReminder._excludeFromSeriesId);
        if (seriesIdx !== -1) {
          const excluded = Array.isArray(manuals[seriesIdx].excludedDates) ? [...manuals[seriesIdx].excludedDates] : [];
          if (!excluded.includes(this.localNewReminder._excludeDate)) excluded.push(this.localNewReminder._excludeDate);
          manuals[seriesIdx] = { ...manuals[seriesIdx], excludedDates: excluded };
        }
      }
      // ── Mode "acara ini dan seterusnya" (edit): seri lama dipotong, entri ini jadi seri baru mulai tanggal occurrence ──
      if (this.localNewReminder._splitFromSeriesId && this.localNewReminder._splitBeforeDate) {
        const seriesIdx = manuals.findIndex(m => m.id === this.localNewReminder._splitFromSeriesId);
        if (seriesIdx !== -1) {
          const oldSeries = manuals[seriesIdx];
          if (this.localNewReminder._splitBeforeDate <= oldSeries.date) {
            // Diedit dari kejadian pertama — seri lama jadi kosong, hapus saja daripada disisakan dengan endDate < date
            manuals.splice(seriesIdx, 1);
          } else {
            manuals[seriesIdx] = { ...oldSeries, endDate: this.localDayBefore(this.localNewReminder._splitBeforeDate) };
          }
        }
      }

      manuals.push({
        id,
        date: this.localNewReminder.date,
        endDate: this.localNewReminder.endDate || null,
        title: this.localNewReminder.title.trim(),
        subtitle: this.localNewReminder.subtitle.trim() || 'Pengingat manual',
        time: (this.localNewReminder.allDay || !this.localNewReminder.time) ? null : this.localNewReminder.time,
        timeVal,
        endTime: (!this.localNewReminder.allDay && this.localNewReminder.endTime) ? this.localNewReminder.endTime : null,
        endTimeVal,
        allDay: !!(this.localNewReminder.allDay || !this.localNewReminder.time),
        page: this.localNewReminder.page || null,
        section: this.localNewReminder.section || null,
        targetItem: this.localNewReminder.targetItem || null,
        category: this.localNewReminder.category || 'manual',
        recurrence: this.localNewReminder.recurrence || 'none',
        customRecurrence: (this.localNewReminder.recurrence === 'custom' && this.customRecurrenceSaved) ? { ...this.customRecurrenceSaved } : null,
        excludedDates: [],
        isHabit: false,
        isManual: true
      });
      WorkspaceStorage.setItem('ws_manual_notifs', JSON.stringify(manuals));
      this.localStorageTick++;
      this.localSuccess = (editId ? 'Pengingat berhasil diperbarui!' : 'Pengingat "' + this.localNewReminder.title.trim() + '" berhasil disimpan!');
      this.localError = null;
      this.localShowForm = false;
      this.localShowRecurrenceDropdown = false;
      this.customRecurrenceSaved = null;
      this.localSelectedDate = this.localNewReminder.date;
      this.localView = 'agenda';
      this.localNewReminder = { title:'', subtitle:'', date: this.localFmtDate(new Date()), endDate: '', time:'', endTime:'', allDay: false, page:'', section:'', targetItem:'', category: 'manual', recurrence: 'none' };
      setTimeout(() => { this.localSuccess = null; }, 3000);
    },
    // ── Recurrence helper: label & opsi sesuai tanggal mulai (ala Google Calendar) ──
    localRecurrenceLabel(rec, dateStr) {
      const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      let dayName = '', dateNum = '', monthName = '';
      try {
        const d = new Date((dateStr || this.localNewReminder.date) + 'T00:00:00');
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
    // ── Kategori Custom untuk Pengingat Manual ──
    addCustomReminderCategory() {
      const label = this.newCustomCategoryInput.trim();
      if (!label) return;
      const key = 'custom_' + label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') + '_' + Date.now().toString(36);
      const palette = ['#8E24AA', '#0B8043', '#E67C73', '#039BE5', '#F6BF26', '#3F9142', '#D50000', '#7C3AED', '#0891B2'];
      const color = palette[this.customReminderCategories.length % palette.length];
      const newCat = { key, label, color };
      this.customReminderCategories.push(newCat);
      try { WorkspaceStorage.setItem('gcal_custom_reminder_categories', JSON.stringify(this.customReminderCategories)); } catch(_e) { /* ignore */ }
      // Aktifkan filter & warna untuk kategori baru ini secara langsung
      this.agendaFilters[key] = true;
      this.agendaFilterColors[key] = color;
      try { WorkspaceStorage.setItem('gcal_agenda_filter_colors', JSON.stringify(this.agendaFilterColors)); } catch(_e) { /* ignore */ }
      // Pilih kategori baru ini langsung di form
      this.localNewReminder.category = key;
      this.newCustomCategoryInput = '';
    },
    deleteCustomReminderCategory(key) {
      // Pengingat yang sudah pakai kategori ini dikembalikan ke kategori default
      try {
        const raw = WorkspaceStorage.getItem('ws_manual_notifs');
        let manuals = raw ? JSON.parse(raw) : [];
        let changed = false;
        manuals = manuals.map(m => {
          if (m.category === key) { changed = true; return { ...m, category: 'manual' }; }
          return m;
        });
        if (changed) WorkspaceStorage.setItem('ws_manual_notifs', JSON.stringify(manuals));
      } catch(_e) { /* ignore */ }
      this.customReminderCategories = this.customReminderCategories.filter(c => c.key !== key);
      try { WorkspaceStorage.setItem('gcal_custom_reminder_categories', JSON.stringify(this.customReminderCategories)); } catch(_e) { /* ignore */ }
      // Bersihkan state filter & warna kategori yang dihapus
      delete this.agendaFilters[key];
      delete this.agendaFilterColors[key];
      try { WorkspaceStorage.setItem('gcal_agenda_filter_colors', JSON.stringify(this.agendaFilterColors)); } catch(_e) { /* ignore */ }
      // Jika form sedang memakai kategori ini, kembalikan ke default
      if (this.localNewReminder.category === key) this.localNewReminder.category = 'manual';
      this.localStorageTick++;
    },
    localAddEvent() {
      if (!this.localNewEv.title.trim()) { this.localError = 'Judul acara tidak boleh kosong!'; return; }
      if (!this.localNewEv.startDate) { this.localError = 'Tanggal mulai harus diisi!'; return; }
      const ev = {
        id: 'local_' + Date.now(),
        title: this.localNewEv.title.trim(),
        startDate: this.localNewEv.startDate,
        startTime: this.localNewEv.startTime || '00:00',
        endDate: this.localNewEv.endDate || this.localNewEv.startDate,
        endTime: this.localNewEv.endTime || (this.localNewEv.startTime ? this.addHour(this.localNewEv.startTime) : '01:00'),
        location: this.localNewEv.location || '',
        desc: this.localNewEv.desc || '',
        color: this.localNewEv.color || '#4285F4',
        allDay: !this.localNewEv.startTime
      };
      this.localEvents.push(ev);
      this.localSaveEvents();
      this.localSuccess = 'Acara "' + ev.title + '" berhasil ditambahkan!';
      this.localError = null;
      this.localShowForm = false;
      this.localNewEv = { title:'', startDate:'', startTime:'', endDate:'', endTime:'', location:'', desc:'', color:'#4285F4', allDay:false };
      // Switch to agenda view for the date
      this.localSelectedDate = ev.startDate;
      this.localView = 'agenda';
      setTimeout(() => { this.localSuccess = null; }, 3000);
    },
    localDeleteEvent(ev) {
      if (!confirm('Hapus acara "' + ev.title + '"?')) return;
      this.localEvents = this.localEvents.filter(e => e.id !== ev.id);
      this.localSaveEvents();
      this.localSuccess = 'Acara berhasil dihapus.';
      setTimeout(() => { this.localSuccess = null; }, 2500);
    },
    addHour(timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      const nh = (h + 1) % 24;
      return (nh < 10 ? '0' : '') + nh + ':' + (m < 10 ? '0' : '') + m;
    },
    localEvTop(ev) {
      const [h, m] = (ev.startTime || '00:00').split(':').map(Number);
      return (h * 60 + m);
    },
    localEvHeight(ev) {
      const [sh, sm] = (ev.startTime || '00:00').split(':').map(Number);
      const [eh, em] = (ev.endTime || '01:00').split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      return Math.max(diff, 30);
    },
    // ============ END LOCAL CALENDAR METHODS ============
    async initFirebase() {
      if (typeof firebase === 'undefined') {
        this.error = 'Firebase SDK gagal dimuat dari CDN. Silakan muat ulang halaman.';
        return;
      }
      this.loading = true;
      try {
        if (firebase.apps.length === 0) {
          const configRes = await fetch('/firebase-applet-config.json');
          const firebaseConfig = await configRes.json();
          firebase.initializeApp(firebaseConfig);
        }
        this.auth = firebase.auth();
        this.provider = new firebase.auth.GoogleAuthProvider();
        this.provider.addScope('https://www.googleapis.com/auth/calendar.events');
        this.provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
        
        // Listen for shifts in auth state
        this.auth.onAuthStateChanged((user) => {
          if (user) {
            this.user = user;
            // Check in-memory global token CACHE
            if (globalThis.googleCalendarCachedToken) {
              this.accessToken = globalThis.googleCalendarCachedToken;
              this.needsAuth = false;
              this.fetchEvents();
            } else {
              this.needsAuth = true;
            }
          } else {
            this.user = null;
            this.accessToken = null;
            globalThis.googleCalendarCachedToken = null;
            this.needsAuth = true;
          }
          this.loading = false;
        });

        // Handle redirect result if user used redirect login
        this.auth.getRedirectResult()
          .then((result) => {
            if (result && result.credential) {
              this.accessToken = result.credential.accessToken;
              globalThis.googleCalendarCachedToken = result.credential.accessToken;
              this.user = result.user;
              this.needsAuth = false;
              this.fetchEvents();
            }
          })
          .catch((err) => {
            console.error('Redirect auth error:', err);
            this.error = 'Login via redirect gagal: ' + err.message;
          });

      } catch (err) {
        console.error(err);
        this.error = 'Otentikasi Firebase gagal diinisialisasi: ' + err.message;
        this.loading = false;
      }
    },
    async handleGoogleSignIn() {
      this.loading = true;
      this.error = null;
      try {
        if (!this.auth) {
          await this.initFirebase();
        }
        const result = await this.auth.signInWithPopup(this.provider);
        this.accessToken = result.credential.accessToken;
        globalThis.googleCalendarCachedToken = result.credential.accessToken;
        this.user = result.user;
        this.needsAuth = false;
        await this.fetchEvents();
      } catch (err) {
        console.error(err);
        if (err.code === 'auth/popup-closed-by-user') {
          this.error = 'Popup masuk Google ditutup sebelum selesai. Tips: Harap izinkan popup di browser Anda atau klik tombol "Buka di Tab Baru" di bawah agar login berjalan lancar tanpa terhalang bingkai (iframe).';
        } else if (err.code === 'auth/popup-blocked') {
          this.error = 'Popup masuk diblokir oleh browser Anda. Tips: Silakan klik tombol "Buka di Tab Baru" di bawah atau matikan pemblokir iklan/popup Anda.';
        } else {
          this.error = 'Koneksi Autentikasi Google gagal: ' + err.message;
        }
      } finally {
        this.loading = false;
      }
    },
    async handleGoogleRedirectSignIn() {
      this.loading = true;
      this.error = null;
      try {
        if (!this.auth) {
          await this.initFirebase();
        }
        await this.auth.signInWithRedirect(this.provider);
      } catch (err) {
        console.error(err);
        this.error = 'Gagal memulai metode redirect: ' + err.message;
        this.loading = false;
      }
    },
    openInNewTab() {
      globalThis.open(globalThis.location.href, '_blank');
    },
    async handleSignOut() {
      if (this.auth) {
        await this.auth.signOut();
      }
      this.user = null;
      this.accessToken = null;
      globalThis.googleCalendarCachedToken = null;
      this.events = [];
      this.needsAuth = true;
    },
    async fetchEvents() {
      if (!this.accessToken) {
        this.error = 'Token akses tidak tersedia. Silakan masuk terlebih dahulu.';
        return;
      }
      this.loading = true;
      this.error = null;
      try {
        const nowIso = new Date().toISOString();
        const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(nowIso)}&orderBy=startTime&singleEvents=true&maxResults=15`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          if (response.status === 401) {
            // Expired credentials
            this.accessToken = null;
            globalThis.googleCalendarCachedToken = null;
            this.user = null;
            this.needsAuth = true;
            throw new Error('Sesi Google Calendar telah kedaluwarsa. Silakan Hubungkan kembali.');
          }
          const errData = await response.json();
          throw new Error(errData?.error?.message || 'Gagal mengambil daftar agenda Anda.');
        }
        const data = await response.json();
        this.events = data.items || [];
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async addEvent() {
      // Validate inputs
      if (!this.newEvent.summary.trim()) {
        alert('Harap isi judul acara!');
        return;
      }
      if (!this.newEvent.startDate || !this.newEvent.startTime) {
        alert('Harap tentukan tanggal dan waktu mulai acara!');
        return;
      }

      // Mandatory workspace security confirmation dialog
      const isConfirmed = globalThis.confirm(`Apakah Anda yakin ingin memasukkan acara ke Google Calendar Anda:\n\n📌 Judul: "${this.newEvent.summary}"\n📅 Hari/Tanggal: ${this.newEvent.startDate}`);
      if (!isConfirmed) return;

      this.submitting = true;
      this.error = null;
      this.successMsg = null;
      try {
        const startDateTime = new Date(`${this.newEvent.startDate}T${this.newEvent.startTime}`).toISOString();
        
        let endDateTime;
        if (this.newEvent.endDate && this.newEvent.endTime) {
          endDateTime = new Date(`${this.newEvent.endDate}T${this.newEvent.endTime}`).toISOString();
        } else {
          // Default event end standard: 1 hour after startup
          const parsedStart = new Date(startDateTime);
          parsedStart.setHours(parsedStart.getHours() + 1);
          endDateTime = parsedStart.toISOString();
        }

        const eventBody = {
          summary: this.newEvent.summary,
          description: this.newEvent.description,
          location: this.newEvent.location,
          start: { dateTime: startDateTime },
          end: { dateTime: endDateTime }
        };

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventBody)
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData?.error?.message || 'Gagal menyimpan data.');
        }

        this.successMsg = `Selesai! Acara "${this.newEvent.summary}" berhasil terpasang di Google Calendar.`;
        
        // Reset form controls
        this.newEvent = {
          summary: '',
          description: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          location: ''
        };
        
        await this.fetchEvents();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.submitting = false;
      }
    },
    async deleteEvent(eventItem) {
      // Mandatory workspace security confirmation dialog
      const isConfirmed = globalThis.confirm(`Apakah Anda yakin ingin menghapus acara "${eventItem.summary || 'Acara Tanpa Judul'}" dari Google Calendar? Tindakan ini tidak dapat dibatalkan.`);
      if (!isConfirmed) return;

      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventItem.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData?.error?.message || 'Gagal menghapus acara.');
        }

        this.successMsg = 'Acara telah berhasil dihapus dari Google Calendar Anda.';
        await this.fetchEvents();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    formatEventTime(event) {
      if (!event.start) return 'Waktu tidak ditentukan';
      const startStr = event.start.dateTime || event.start.date;
      if (!startStr) return 'Waktu tidak ditentukan';
      
      const startObj = new Date(startStr);
      const options = { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
      let formatted = startObj.toLocaleString('id-ID', options);
      
      if (event.end) {
        const endStr = event.end.dateTime || event.end.date;
        if (endStr && endStr !== startStr) {
          const endObj = new Date(endStr);
          const endHours = endObj.toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' });
          formatted += ` - ${endHours}`;
        }
      }
      return formatted;
    }
  }
};

// 10. Financial Tracker Component
const FinancialTracker = {
  template: `
    <div class="fin-tracker">

      <div style="border-bottom: 2px solid var(--color-sand); padding-bottom: 16px; margin-bottom: 28px; display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
        <div>
          <h2 style="display:flex; align-items:center; gap:10px; font-size: 24px; font-weight: 800; color: var(--text-dark);">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--color-terracotta)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            Financial Tracker
          </h2>
          <p style="color:var(--text-muted); font-size:13.5px; margin-top:4px;">Pantau tabungan, pengeluaran & reimburse (Global Ledger)</p>
          <div v-if="lastUpdated" style="display:inline-flex; align-items:center; gap:5px; margin-top:6px; background:#F0FDF4; border:1.5px solid #A7F3D0; border-radius:20px; padding:3px 10px;">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style="font-size:11px; font-weight:600; color:#059669;">Update terakhir: {{ formatLastUpdated(lastUpdated) }}</span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">

          <!-- Rentang Tanggal Picker -->
          <div style="position:relative;">
            <button type="button" @click.stop="showFinRangePicker = !showFinRangePicker"
              style="display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 14px; background:var(--bg-cream); border:1.5px solid var(--color-sand); border-radius:8px; cursor:pointer; font-size:12.5px; color:var(--text-dark); white-space:nowrap; max-width:240px; overflow:hidden;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; color:var(--color-terracotta);"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style="overflow:hidden; text-overflow:ellipsis;">
                <template v-if="finFilterStartDate || finFilterEndDate">
                  {{ finFilterStartDate ? formatDate(finFilterStartDate) : '?' }} – {{ finFilterEndDate ? formatDate(finFilterEndDate) : '?' }}
                </template>
                <template v-else><span style="color:var(--text-muted);">Pilih rentang tanggal...</span></template>
              </span>
            </button>

            <!-- Popup Kalender -->
            <div v-if="showFinRangePicker" @click.stop style="position:absolute; top:calc(100% + 6px); right:0; z-index:9999; background:#fff; border:1.5px solid var(--color-sand); border-radius:14px; box-shadow:0 8px 32px rgba(0,0,0,0.13); padding:16px; min-width:284px;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                <button type="button" @click="finRangeCalPrevMonth" style="background:none; border:none; cursor:pointer; font-size:16px; color:var(--text-dark); padding:4px 8px; border-radius:6px; line-height:1;">&lt;</button>
                <span style="font-weight:700; font-size:14px; color:var(--text-dark);">{{ finRangeCalMonthLabel }}</span>
                <button type="button" @click="finRangeCalNextMonth" style="background:none; border:none; cursor:pointer; font-size:16px; color:var(--text-dark); padding:4px 8px; border-radius:6px; line-height:1;">&gt;</button>
              </div>
              <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:2px; margin-bottom:4px;">
                <span v-for="(d,i) in ['S','S','R','K','J','S','M']" :key="'fh'+i" style="text-align:center; font-size:10.5px; font-weight:700; color:var(--text-muted); padding:2px 0;">{{ d }}</span>
              </div>
              <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:2px;">
                <span v-for="cell in finRangeCalCells" :key="cell.key" @click="cell.date ? onFinRangeCalClick(cell.date) : null"
                  :style="getFinRangeCellStyle(cell)"
                  style="text-align:center; font-size:13px; padding:6px 2px; border-radius:7px; cursor:pointer; user-select:none; transition:background 0.12s;">
                  {{ cell.label }}
                </span>
              </div>
              <div style="margin-top:10px; font-size:11px; color:var(--text-muted); text-align:center; line-height:1.4;">
                <span v-if="!finFilterStartDate">Klik tanggal mulai</span>
                <span v-else-if="!finFilterEndDate">Klik tanggal akhir</span>
                <span v-else style="color:var(--color-terracotta); font-weight:600;">✓ Rentang dipilih — klik lagi untuk reset</span>
              </div>
              <button v-if="finFilterStartDate || finFilterEndDate" type="button" @click="finFilterStartDate=''; finFilterEndDate=''; showFinRangePicker=false;"
                style="margin-top:8px; width:100%; background:var(--bg-cream); border:1px solid var(--color-sand); color:var(--text-dark); border-radius:7px; padding:6px; font-size:12px; cursor:pointer; font-weight:600;">
                Hapus Rentang
              </button>
            </div>
          </div>

          <!-- Badge aktif filter -->
          <span v-if="finFilterStartDate || finFilterEndDate"
            @click="finFilterStartDate=''; finFilterEndDate=''; showFinRangePicker=false;"
            title="Klik untuk hapus filter"
            style="display:inline-flex; align-items:center; gap:5px; height:38px; padding:0 12px; background:#FEF3C7; border:1.5px solid #FCD34D; border-radius:8px; font-size:11.5px; font-weight:600; color:#92400E; cursor:pointer; white-space:nowrap;">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            {{ finFilteredCount }} transaksi
          </span>

          <button class="btn btn-primary" @click="openAddBank" style="display:inline-flex; align-items:center; gap:6px; cursor:pointer; height:38px;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Bank
          </button>
        </div>
      </div>

      <div v-if="banks.length === 0" style="text-align:center; padding:64px 20px; background:var(--bg-cream); border-radius:16px; border:2px dashed var(--color-sand);">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--color-sand)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 16px; display:block;"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        <p style="font-size:16px; font-weight:600; color:var(--text-dark); margin-bottom:6px;">Belum ada rekening bank</p>
        <p style="font-size:13px; color:var(--text-muted);">Klik "Tambah Bank" untuk mulai mencatat keuangan kamu</p>
      </div>

      <div v-if="banks.length > 0" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px;">
        
        <div style="background-color: var(--bg-cream); border: 1px solid var(--color-sand); border-radius: 12px; padding: 14px; text-align: center;">
          <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Total Saldo Global</span>
          <p class="text-mono" style="font-size: 24px; font-weight: bold; color: var(--text-dark); margin-top: 6px;">{{ formatCurrency(totalBalance) }}</p>
          <span style="font-size: 10px; color: var(--text-muted); font-style: italic;">semua waktu</span>
        </div>
        
        <div :style="(finFilterStartDate || finFilterEndDate) ? { background: '#FFF7ED', border: '1px solid #FCD34D', borderRadius: '12px', padding: '14px', textAlign: 'center' } : { backgroundColor: 'var(--bg-cream)', border: '1px solid var(--color-sand)', borderRadius: '12px', padding: '14px', textAlign: 'center' }">
          <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Total Pengeluaran</span>
          <p class="text-mono" style="font-size: 24px; font-weight: bold; color: #EF4444; margin-top: 6px;">-{{ formatCurrency(totalOutflow) }}</p>
          <span v-if="finFilterStartDate || finFilterEndDate" style="font-size: 10px; color: #92400E; font-weight: 600;">🗓 dalam rentang</span>
          <span v-else style="font-size: 10px; color: var(--text-muted); font-style: italic;">semua waktu</span>
        </div>
        
        <div :style="(finFilterStartDate || finFilterEndDate) ? { background: '#FFF7ED', border: '1px solid #FCD34D', borderRadius: '12px', padding: '14px', textAlign: 'center' } : { backgroundColor: 'var(--bg-cream)', border: '1px solid var(--color-sand)', borderRadius: '12px', padding: '14px', textAlign: 'center' }">
          <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Reimburse Pending</span>
          <p class="text-mono" style="font-size: 24px; font-weight: bold; color: #F59E0B; margin-top: 6px;">{{ formatCurrency(totalPendingReimburse) }}</p>
          <span v-if="finFilterStartDate || finFilterEndDate" style="font-size: 10px; color: #92400E; font-weight: 600;">🗓 dalam rentang</span>
          <span v-else style="font-size: 10px; color: var(--text-muted); font-style: italic;">semua waktu</span>
        </div>
        
        <div :style="(finFilterStartDate || finFilterEndDate) ? { background: '#FFF7ED', border: '1px solid #FCD34D', borderRadius: '12px', padding: '14px', textAlign: 'center' } : { backgroundColor: 'var(--bg-cream)', border: '1px solid var(--color-sand)', borderRadius: '12px', padding: '14px', textAlign: 'center' }">
          <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Reimburse Selesai</span>
          <p class="text-mono" style="font-size: 24px; font-weight: bold; color: #6366F1; margin-top: 6px;">{{ formatCurrency(totalSettledReimburse) }}</p>
          <span v-if="finFilterStartDate || finFilterEndDate" style="font-size: 10px; color: #92400E; font-weight: 600;">🗓 dalam rentang</span>
          <span v-else style="font-size: 10px; color: var(--text-muted); font-style: italic;">semua waktu</span>
        </div>

      </div>

      <div v-if="banks.length > 0" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:16px; margin-bottom:28px;">
        <div v-for="bank in banks" :key="bank.id"
             class="fin-bank-card"
             :style="{ borderLeft: '6px solid ' + bank.color, borderColor: 'var(--color-sand)' }">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:10px; height:10px; border-radius:50%; display:inline-block; flex-shrink:0;" :style="{ background: bank.color }"></span>
                <span style="font-weight:700; font-size:14px; color:var(--text-dark);">{{ bank.name }}</span>
              </div>
              <span style="font-size:11px; color:var(--text-muted); margin-top:3px; display:block; margin-left:18px;">{{ bank.function }}</span>
            </div>
            <div style="display:flex; gap:6px;">
              <button @click="editBank(bank)" title="Edit" style="background:var(--bg-cream); border:1.5px solid var(--color-sand); border-radius:6px; padding:4px 6px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="var(--text-muted)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button @click="deleteBank(bank.id)" title="Hapus" style="background:#FEF2F2; border:1.5px solid #FCA5A5; border-radius:6px; padding:4px 6px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <div style="margin-bottom:10px;">
            <p style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); margin-bottom:3px;">Saldo Tersedia</p>
            <p style="font-size:22px; font-weight:800; font-family:'Space Mono',monospace;" :style="{ color: bank.color }">
              {{ formatCurrency(getBankBalance(bank.id)) }}
            </p>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; padding-top:10px; border-top:1px solid var(--color-sand);">
            <div>
              <p style="font-size:10px; color:var(--text-muted); font-weight:600;">Masuk</p>
              <p style="font-size:12px; font-weight:700; color:#10B981;">+{{ formatCurrencyShort(getBankInflow(bank.id)) }}</p>
            </div>
            <div>
              <p style="font-size:10px; color:var(--text-muted); font-weight:600;">Keluar</p>
              <p style="font-size:12px; font-weight:700; color:#EF4444;">-{{ formatCurrencyShort(getBankOutflow(bank.id)) }}</p>
            </div>
            <div>
              <p style="font-size:10px; color:var(--text-muted); font-weight:600;">Reimburse</p>
              <p style="font-size:12px; font-weight:700; color:#F59E0B;">{{ formatCurrencyShort(getBankPendingReimburse(bank.id)) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="banks.length > 0" class="drawer-section" style="padding:0; overflow:hidden; margin-bottom:24px;">

        <div style="padding:18px 22px 16px; border-bottom:1.5px solid var(--color-sand); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; background:var(--bg-cream);">
          <div style="display:flex; align-items:center; gap:10px;">
            <div>
              <h3 style="font-size:17px; margin:0;">Riwayat Transaksi Global</h3>
              <span style="font-size:12px; color:var(--text-muted);">Semua aktivitas dari berbagai rekening</span>
            </div>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button @click="openAddTransaction('income')" class="fin-action-btn fin-btn-income">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Tambah Saldo
            </button>
            <button @click="openAddTransaction('expense')" class="fin-action-btn fin-btn-expense">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Catat Pengeluaran
            </button>
            <button @click="openTransferModal" style="display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 14px; background:#EFF6FF; border:1.5px solid #3B82F6; color:#1D4ED8; border-radius:8px; font-size:12.5px; font-weight:600; cursor:pointer; white-space:nowrap; transition:all 0.15s;" onmouseover="this.style.background='#DBEAFE'" onmouseout="this.style.background='#EFF6FF'">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M15 6l6 6-6 6"/><path d="M19 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2"/></svg>
              Kirim ke Bank
            </button>
          </div>
        </div>

        <div style="padding:14px 22px 0; display:flex; gap:6px; flex-wrap:wrap;">
          <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
            style="font-size:12px; font-weight:600; padding:5px 14px; border-radius:20px; cursor:pointer; border:1.5px solid; transition:all 0.15s;"
            :style="activeTab === tab.key
              ? { background: tab.color, color: '#fff', borderColor: tab.color }
              : { background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--color-sand)' }">
            {{ tab.label }}
          </button>
        </div>

        <!-- Filter by Bank row -->
        <div style="padding:10px 22px 0; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span style="font-size:11.5px; font-weight:700; color:var(--text-muted); white-space:nowrap;">🏦 Filter Bank:</span>
          <button @click="filterBankId = 'all'"
            style="font-size:11.5px; font-weight:600; padding:4px 12px; border-radius:20px; cursor:pointer; border:1.5px solid; transition:all 0.15s; white-space:nowrap;"
            :style="filterBankId === 'all'
              ? { background: 'var(--text-dark)', color: '#fff', borderColor: 'var(--text-dark)' }
              : { background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--color-sand)' }">
            Semua Bank
          </button>
          <button v-for="bank in banks" :key="bank.id" @click="filterBankId = bank.id"
            style="font-size:11.5px; font-weight:600; padding:4px 12px; border-radius:20px; cursor:pointer; border:1.5px solid; transition:all 0.15s; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;"
            :style="filterBankId === bank.id
              ? { background: bank.color, color: '#fff', borderColor: bank.color }
              : { background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--color-sand)' }">
            <span style="width:7px; height:7px; border-radius:50%; display:inline-block; flex-shrink:0;"
              :style="{ background: filterBankId === bank.id ? '#fff' : bank.color }"></span>
            {{ bank.name }}
          </button>
        </div>

        <div style="padding:14px 22px 20px;">
          <div v-if="filteredTransactions.length === 0" style="text-align:center; padding:32px; color:var(--text-muted);">
            <p style="font-size:14px;">Belum ada transaksi {{ activeTab !== 'all' ? 'tipe ini' : '' }}</p>
          </div>
          <div v-else style="display:flex; flex-direction:column; gap:8px;">
            <div v-for="tx in filteredTransactions" :key="tx.id" class="fin-tx-row">
              <div class="fin-tx-icon" :style="{ background: getTxBg(tx), color: getTxColor(tx) }">
                <svg v-if="tx.isTransfer && tx.type === 'expense'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M15 6l6 6-6 6"/></svg>
                <svg v-else-if="tx.isTransfer && tx.type === 'income'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M9 6l-6 6 6 6"/></svg>
                <svg v-else-if="tx.type === 'income'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                <svg v-else-if="tx.type === 'expense' && !tx.isReimburse" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </div>
              <div style="flex:1; min-width:0;">
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                  <span style="font-size:13.5px; font-weight:600; color:var(--text-dark);">{{ tx.description }}</span>
                  <span v-if="tx.isTransfer" class="fin-badge" style="background:#DBEAFE; color:#1D4ED8; border-color:#93C5FD;">
                    ⇄ Transfer
                  </span>
                  <span v-if="tx.isReimburse" class="fin-badge"
                    :style="tx.settled ? { background:'#D1FAE5', color:'#065F46', borderColor:'#6EE7B7' } : { background:'#FEF3C7', color:'#92400E', borderColor:'#FCD34D' }">
                    {{ tx.settled ? '✓ Reimburse Lunas' : '⏳ Reimburse Pending' }}
                  </span>
                  <span class="fin-badge" :style="{ background: getBankColor(tx.bankId) + '15', color: getBankColor(tx.bankId), borderColor: getBankColor(tx.bankId) + '50' }">
                    🏦 {{ getBankName(tx.bankId) }}
                  </span>
                  <span v-if="tx.transferPairBankId" class="fin-badge" :style="{ background: getBankColor(tx.transferPairBankId) + '15', color: getBankColor(tx.transferPairBankId), borderColor: getBankColor(tx.transferPairBankId) + '50' }">
                    → 🏦 {{ getBankName(tx.transferPairBankId) }}
                  </span>
                  <span v-if="tx.category" class="fin-badge" style="background:var(--bg-cream); color:var(--text-muted); border-color:var(--color-sand);">{{ tx.category }}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px; margin-top:3px; flex-wrap:wrap;">
                  <span style="font-size:11.5px; color:var(--text-muted);">{{ formatDate(tx.date) }}</span>
                  <span v-if="tx.isReimburse && tx.paidBy" style="font-size:11.5px; color:var(--text-muted);">· ditalangi untuk: <strong>{{ tx.paidBy }}</strong></span>
                  <span v-if="tx.notes" style="font-size:11.5px; color:var(--text-muted); font-style:italic;">· {{ tx.notes }}</span>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                <span style="font-size:14px; font-weight:700; font-family:'Space Mono',monospace;"
                  :style="{ color: tx.isTransfer ? (tx.type === 'expense' ? '#3B82F6' : '#3B82F6') : tx.type === 'income' ? '#10B981' : tx.type === 'expense' ? '#EF4444' : '#F59E0B' }">
                  {{ tx.isTransfer && tx.type === 'income' ? '+' : tx.isTransfer && tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                </span>
                <div style="display:flex; gap:4px; align-items:center;">
                  <button v-if="tx.isReimburse && !tx.settled" @click="settleReimburse(tx)"
                    title="Uang dikembalikan! (Otomatis Tambah Saldo)" style="background:#D1FAE5; border:1.5px solid #6EE7B7; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:11px; font-weight:700; color:#065F46; display:inline-flex; align-items:center; gap:4px;">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Uang Cair (Tambah Saldo)
                  </button>
                  <button v-if="!tx.isTransfer" @click="openEditTx(tx)" title="Edit Transaksi"
                    style="background:#EFF6FF; border:1.5px solid #93C5FD; border-radius:6px; padding:4px 6px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button @click="deleteTx(tx.id)" title="Hapus Transaksi" style="background:#FEF2F2; border:1.5px solid #FCA5A5; border-radius:6px; padding:4px 6px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <transition name="modal-fade">
        <div v-if="showBankModal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(44, 38, 33, 0.6); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 99999;" @click.self="closeBankModal">
          <div style="background: var(--bg-card); max-width: 440px; width: 90%; padding: 28px; border-radius: 16px; box-shadow: 0 16px 40px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
              <h3 style="font-size:17px; margin:0;">{{ editingBankId ? 'Edit Rekening Bank' : 'Tambah Rekening Bank' }}</h3>
              <button @click="closeBankModal" style="background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:20px; line-height:1;">✕</button>
            </div>
            <div class="form-group">
              <label>Nama Bank</label>
              <input type="text" class="form-input" v-model="bankForm.name" placeholder="cth. BCA, Mandiri, GoPay..." />
            </div>
            <div class="form-group">
              <label>Fungsi / Peruntukan</label>
              <input type="text" class="form-input" v-model="bankForm.function" placeholder="cth. Tabungan utama, Belanja online, Investasi..." />
            </div>
            <div class="form-group">
              <label>Saldo Awal (Rp)</label>
              <input type="number" class="form-input" v-model.number="bankForm.initialBalance" placeholder="0" min="0" />
            </div>
            <div class="form-group" style="margin-bottom:20px;">
              <label>Warna Identitas</label>
              <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                <span v-for="c in bankColors" :key="c" @click="bankForm.color = c"
                  style="width:24px; height:24px; border-radius:50%; cursor:pointer; transition:transform 0.15s; display:inline-block;"
                  :style="{ background: c, outline: bankForm.color === c ? '3px solid var(--text-dark)' : 'none', outlineOffset: '2px', transform: bankForm.color === c ? 'scale(1.15)' : 'scale(1)' }">
                </span>
                <input type="color" v-model="bankForm.color" style="width:28px; height:28px; border:none; cursor:pointer; border-radius:50%; padding:0; background:none;" title="Pilih warna kustom" />
              </div>
            </div>
            <div style="display:flex; gap:10px;">
              <button class="btn" @click="closeBankModal" style="flex:1; background:var(--bg-cream); border:1.5px solid var(--color-sand); color:var(--text-dark); cursor:pointer; border-radius:8px; font-weight:600;">Batal</button>
              <button class="btn btn-primary" @click="saveBank" style="flex:2; cursor:pointer;">{{ editingBankId ? 'Simpan Perubahan' : 'Tambah Rekening' }}</button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="modal-fade">
        <div v-if="showTxModal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(44, 38, 33, 0.6); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 99999;" @click.self="closeTxModal">
          <div style="background: var(--bg-card); max-width: 460px; width: 90%; padding: 28px; border-radius: 16px; box-shadow: 0 16px 40px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
              <h3 style="font-size:17px; margin:0; display:flex; align-items:center; gap:8px;">
                <span :style="{ color: getTxColor(txForm) }">
                  <svg v-if="txForm.type === 'income'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                  <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                </span>
                {{ editingTxId ? (txForm.type === 'income' ? 'Edit Saldo Masuk' : 'Edit Pengeluaran') : (txForm.type === 'income' ? 'Tambah Saldo' : 'Catat Pengeluaran') }}
              </h3>
              <button @click="closeTxModal" style="background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:20px; line-height:1;">✕</button>
            </div>

            <div class="form-group" style="margin-bottom:14px;">
              <label>Pilih Bank / Dompet Tujuan *</label>
              <select class="form-input" v-model="txForm.bankId" required>
                <option value="" disabled>Pilih bank...</option>
                <option v-for="bank in banks" :key="bank.id" :value="bank.id">{{ bank.name }}</option>
              </select>
            </div>

            <div v-if="txForm.type === 'expense'" class="form-group" style="margin-bottom:16px;">
              <label style="font-weight: 600; color: var(--text-dark); display: block; margin-bottom: 6px;">Sifat Pengeluaran</label>
              <div style="display: flex; flex-direction: column; gap: 8px; background: var(--bg-cream); padding: 12px; border-radius: 8px; border: 1.5px solid var(--color-sand);">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0; font-size: 13px; font-weight: 500; color: var(--text-dark);">
                  <input type="radio" v-model="txForm.isReimburse" :value="false" style="width:16px; height:16px; accent-color: var(--color-terracotta);">
                  Pengeluaran Biasa (Tidak diganti)
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0; font-size: 13px; font-weight: 500; color: var(--color-terracotta);">
                  <input type="radio" v-model="txForm.isReimburse" :value="true" style="width:16px; height:16px; accent-color: var(--color-terracotta);">
                  Pengeluaran Reimburse (Akan diganti)
                </label>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:0;">
              <div class="form-group" style="margin-bottom:14px;">
                <label>Tanggal</label>
                <input type="date" class="form-input" v-model="txForm.date" required />
              </div>
              <div class="form-group" style="margin-bottom:14px;">
                <label>Jumlah (Rp)</label>
                <input type="number" class="form-input" v-model.number="txForm.amount" placeholder="0" min="1" required />
              </div>
            </div>
            
            <div class="form-group" style="margin-bottom:14px;">
              <label>Deskripsi</label>
              <input type="text" class="form-input" v-model="txForm.description" placeholder="cth. Makan siang, Gaji, Tagihan listrik..." required />
            </div>

            <div class="form-group" style="margin-bottom:14px;">
              <label>Kategori <span style="font-weight:400; color:var(--text-muted);">(opsional)</span></label>
              <input type="text" class="form-input" v-model="txForm.category" placeholder="cth. Makan, Transport, Hiburan, Tagihan..." list="fin-cat-list" />
              <datalist id="fin-cat-list">
                <option v-for="cat in allCategories" :key="cat" :value="cat"/>
              </datalist>
            </div>

            <div v-if="txForm.type === 'expense' && txForm.isReimburse" class="form-group" style="margin-bottom:14px;">
              <label>Ditalangi / Dipinjam Oleh</label>
              <input type="text" class="form-input" v-model="txForm.paidBy" placeholder="cth. Andi, Kantor, Dina..." />
            </div>

            <div class="form-group" style="margin-bottom:20px;">
              <label>Catatan <span style="font-weight:400; color:var(--text-muted);">(opsional)</span></label>
              <input type="text" class="form-input" v-model="txForm.notes" placeholder="Tambahkan catatan singkat..." />
            </div>
            
            <div style="display:flex; gap:10px;">
              <button class="btn" @click="closeTxModal" style="flex:1; background:var(--bg-cream); border:1.5px solid var(--color-sand); color:var(--text-dark); cursor:pointer; border-radius:8px; font-weight:600;">Batal</button>
              <button class="btn btn-primary" @click="saveTx" style="flex:2; cursor:pointer;">{{ editingTxId ? 'Simpan Perubahan' : 'Simpan Transaksi' }}</button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="modal-fade">
        <div v-if="showTransferModal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(44, 38, 33, 0.6); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 99999;" @click.self="closeTransferModal">
          <div style="background: var(--bg-card); max-width: 460px; width: 90%; padding: 28px; border-radius: 16px; box-shadow: 0 16px 40px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
              <h3 style="font-size:17px; margin:0; display:flex; align-items:center; gap:8px; color:var(--text-dark);">
                <span style="display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:#DBEAFE; border-radius:8px;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M15 6l6 6-6 6"/><path d="M19 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2"/></svg>
                </span>
                Kirim Uang Antar Bank
              </h3>
              <button @click="closeTransferModal" style="background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:20px; line-height:1;">✕</button>
            </div>

            <!-- Visualisasi arah transfer -->
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px; padding:14px 16px; background:#F0F9FF; border-radius:12px; border:1.5px solid #BAE6FD;">
              <div style="flex:1; text-align:center;">
                <div style="font-size:10px; font-weight:700; color:#0369A1; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">Dari</div>
                <div style="font-size:13.5px; font-weight:700; color:var(--text-dark);">{{ transferForm.fromBankId ? getBankName(transferForm.fromBankId) : '—' }}</div>
                <div v-if="transferForm.fromBankId" style="font-size:11px; color:#0369A1; font-family:'Space Mono',monospace; margin-top:2px;">{{ formatCurrency(getBankBalance(transferForm.fromBankId)) }}</div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; gap:2px; flex-shrink:0;">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M15 6l6 6-6 6"/></svg>
                <span v-if="transferForm.amount && transferForm.amount > 0" style="font-size:11px; font-weight:700; color:#1D4ED8; white-space:nowrap; font-family:'Space Mono',monospace;">{{ formatCurrency(transferForm.amount) }}</span>
              </div>
              <div style="flex:1; text-align:center;">
                <div style="font-size:10px; font-weight:700; color:#0369A1; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">Ke</div>
                <div style="font-size:13.5px; font-weight:700; color:var(--text-dark);">{{ transferForm.toBankId ? getBankName(transferForm.toBankId) : '—' }}</div>
                <div v-if="transferForm.toBankId" style="font-size:11px; color:#0369A1; font-family:'Space Mono',monospace; margin-top:2px;">{{ formatCurrency(getBankBalance(transferForm.toBankId)) }}</div>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
              <div class="form-group" style="margin:0;">
                <label>Bank Asal (Pengirim) *</label>
                <select class="form-input" v-model="transferForm.fromBankId" required style="height:42px;">
                  <option value="" disabled>Pilih bank...</option>
                  <option v-for="bank in banks" :key="bank.id" :value="bank.id">{{ bank.name }}</option>
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label>Bank Tujuan (Penerima) *</label>
                <select class="form-input" v-model="transferForm.toBankId" required style="height:42px;">
                  <option value="" disabled>Pilih bank...</option>
                  <option v-for="bank in banks.filter(b => b.id !== transferForm.fromBankId)" :key="bank.id" :value="bank.id">{{ bank.name }}</option>
                </select>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
              <div class="form-group" style="margin:0;">
                <label>Jumlah Transfer (Rp) *</label>
                <input type="number" class="form-input" v-model.number="transferForm.amount" placeholder="0" min="1" required style="height:42px;" />
              </div>
              <div class="form-group" style="margin:0;">
                <label>Tanggal Transfer</label>
                <input type="date" class="form-input" v-model="transferForm.date" required style="height:42px;" />
              </div>
            </div>

            <div class="form-group" style="margin-bottom:20px;">
              <label>Catatan <span style="font-weight:400; color:var(--text-muted);">(opsional)</span></label>
              <input type="text" class="form-input" v-model="transferForm.notes" placeholder="cth. Pindah dana tabungan, bayar cicilan..." />
            </div>

            <!-- Warning saldo kurang -->
            <div v-if="transferForm.fromBankId && transferForm.amount && transferForm.amount > getBankBalance(transferForm.fromBankId)"
              style="display:flex; align-items:center; gap:8px; background:#FEF2F2; border:1.5px solid #FCA5A5; border-radius:8px; padding:10px 12px; margin-bottom:14px;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span style="font-size:12px; font-weight:600; color:#B91C1C;">Saldo {{ getBankName(transferForm.fromBankId) }} tidak cukup! (tersedia {{ formatCurrency(getBankBalance(transferForm.fromBankId)) }})</span>
            </div>

            <div style="display:flex; gap:10px;">
              <button class="btn" @click="closeTransferModal" style="flex:1; background:var(--bg-cream); border:1.5px solid var(--color-sand); color:var(--text-dark); cursor:pointer; border-radius:8px; font-weight:600;">Batal</button>
              <button @click="saveTransfer" style="flex:2; height:42px; background:#3B82F6; border:none; border-radius:8px; color:#fff; font-size:13.5px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; transition:background 0.15s;" onmouseover="this.style.background='#2563EB'" onmouseout="this.style.background='#3B82F6'">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M15 6l6 6-6 6"/></svg>
                Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      </transition>

    </div>
  `,

  data() {
    return {
      banks: [],
      transactions: [],
      activeTab: 'all',

      showBankModal: false,
      editingBankId: null,
      bankForm: { name: '', function: '', initialBalance: 0, color: '#10B981' },

      showTxModal: false,
      editingTxId: null,
      txForm: {
        type: 'expense',
        bankId: '',
        date: localDateStr(),
        amount: null,
        description: '',
        category: '',
        isReimburse: false,
        paidBy: '',
        notes: '',
      },

      bankColors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#D67B52'],

      finFilterStartDate: '',
      finFilterEndDate: '',
      showFinRangePicker: false,
      finRangeCalYear: new Date().getFullYear(),
      finRangeCalMonth: new Date().getMonth(),

      filterBankId: 'all',

      lastUpdated: null,

      tabs: [
        { key: 'all', label: 'Semua', color: 'var(--text-dark)' },
        { key: 'income', label: '↑ Masuk', color: '#10B981' },
        { key: 'expense', label: '↓ Keluar', color: '#EF4444' },
        { key: 'reimburse', label: '↺ Reimburse', color: '#F59E0B' },
        { key: 'transfer', label: '⇄ Transfer', color: '#3B82F6' },
      ],

      showTransferModal: false,
      transferForm: {
        fromBankId: '',
        toBankId: '',
        amount: null,
        date: localDateStr(),
        notes: '',
      },
    };
  },

  computed: {
    filteredTransactions() {
      let txs = [...this.finDateFilteredTx].sort((a, b) => new Date(b.date) - new Date(a.date));
      if (this.filterBankId && this.filterBankId !== 'all') {
        txs = txs.filter(t => t.bankId === this.filterBankId);
      }
      if (this.activeTab === 'income') return txs.filter(t => t.type === 'income' && !t.isTransfer);
      if (this.activeTab === 'expense') return txs.filter(t => t.type === 'expense' && !t.isReimburse && !t.isTransfer);
      if (this.activeTab === 'reimburse') return txs.filter(t => t.isReimburse);
      if (this.activeTab === 'transfer') return txs.filter(t => t.isTransfer);
      return txs;
    },
    finFilteredCount() {
      return this.finDateFilteredTx.length;
    },
    finTodayStr() {
      return localDateStr();
    },
    finRangeCalMonthLabel() {
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      return `${months[this.finRangeCalMonth]} ${this.finRangeCalYear}`;
    },
    finRangeCalCells() {
      const year = this.finRangeCalYear;
      const month = this.finRangeCalMonth;
      const firstDay = new Date(year, month, 1).getDay();
      const startOffset = (firstDay === 0) ? 6 : firstDay - 1;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const cells = [];
      for (let i = 0; i < startOffset; i++) cells.push({ key: 'fe' + i, date: null, label: '' });
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        cells.push({ key: dateStr, date: dateStr, label: d });
      }
      return cells;
    },
    totalBalance() {
      // Saldo tetap pakai semua transaksi (saldo adalah kondisi real rekening)
      return this.banks.reduce((s, b) => s + this.getBankBalance(b.id), 0);
    },
    totalOutflow() {
      const txs = this.finDateFilteredTx;
      return txs.filter(tx => tx.type === 'expense' && !tx.isReimburse).reduce((s, tx) => s + tx.amount, 0);
    },
    totalPendingReimburse() {
      const txs = this.finDateFilteredTx;
      return txs.filter(tx => tx.isReimburse && !tx.settled).reduce((s, tx) => s + tx.amount, 0);
    },
    totalSettledReimburse() {
      const txs = this.finDateFilteredTx;
      return txs.filter(tx => tx.isReimburse && tx.settled).reduce((s, tx) => s + tx.amount, 0);
    },
    finDateFilteredTx() {
      let txs = [...this.transactions];
      if (this.finFilterStartDate) txs = txs.filter(t => t.date >= this.finFilterStartDate);
      if (this.finFilterEndDate) txs = txs.filter(t => t.date <= this.finFilterEndDate);
      return txs;
    },
    allCategories() {
      const cats = new Set(this.transactions.map(tx => tx.category).filter(Boolean));
      return [...cats];
    },
  },

  methods: {
    getBankName(bankId) {
      const b = this.banks.find(x => x.id === bankId);
      return b ? b.name : 'Unknown Bank';
    },
    getBankColor(bankId) {
      const b = this.banks.find(x => x.id === bankId);
      return b ? b.color : 'var(--text-muted)';
    },
    getBankTx(bankId) { 
      return this.transactions.filter(tx => tx.bankId === bankId); 
    },
    getBankBalance(bankId) {
      const bank = this.banks.find(b => b.id === bankId);
      if (!bank) return 0;
      const txs = this.getBankTx(bankId);
      const inflow = txs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
      const outflow = txs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
      return (bank.initialBalance || 0) + inflow - outflow;
    },
    getBankInflow(bankId) { 
      return this.getBankTx(bankId).filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0); 
    },
    getBankOutflow(bankId) { 
      return this.getBankTx(bankId).filter(tx => tx.type === 'expense' && !tx.isReimburse).reduce((s, tx) => s + tx.amount, 0); 
    },
    getBankPendingReimburse(bankId) { 
      return this.getBankTx(bankId).filter(tx => tx.isReimburse && !tx.settled).reduce((s, tx) => s + tx.amount, 0); 
    },
    formatCurrency(v) {
      if (v === undefined || v === null) return 'Rp 0';
      return 'Rp ' + Math.abs(v).toLocaleString('id-ID');
    },
    formatCurrencyShort(v) {
      if (!v) return '0';
      if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + 'M';
      if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'jt';
      if (v >= 1_000) return (v / 1_000).toFixed(0) + 'rb';
      return v.toLocaleString('id-ID');
    },
    formatDate(d) {
      try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); }
      catch(_e) { return d; }
    },
    formatLastUpdated(iso) {
      if (!iso) return null;
      try {
        const d = new Date(iso);
        const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
        const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
        const dayName = days[d.getDay()];
        const date = d.getDate();
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2,'0');
        const mins = String(d.getMinutes()).padStart(2,'0');
        return `${dayName}, ${date} ${month} ${year} · ${hours}:${mins}`;
      } catch(_e) { return null; }
    },
    getTxColor(tx) {
      if (tx.isTransfer) return '#3B82F6';
      if (tx.isReimburse) return '#F59E0B';
      if (tx.type === 'income') return '#10B981';
      return '#EF4444';
    },
    getTxBg(tx) {
      if (tx.isTransfer) return '#DBEAFE';
      if (tx.isReimburse) return '#FEF3C7';
      if (tx.type === 'income') return '#D1FAE5';
      return '#FEE2E2';
    },

    openAddBank() {
      this.editingBankId = null;
      this.bankForm = { name: '', function: '', initialBalance: 0, color: '#10B981' };
      this.showBankModal = true;
    },
    editBank(bank) {
      this.editingBankId = bank.id;
      this.bankForm = { name: bank.name, function: bank.function, initialBalance: bank.initialBalance || 0, color: bank.color };
      this.showBankModal = true;
    },
    saveBank() {
      if (!this.bankForm.name.trim()) return alert('Nama bank wajib diisi!');
      if (this.editingBankId) {
        const idx = this.banks.findIndex(b => b.id === this.editingBankId);
        if (idx !== -1) this.banks[idx] = { ...this.banks[idx], ...this.bankForm };
      } else {
        const newBank = { id: 'bank-' + Date.now(), ...this.bankForm };
        this.banks.push(newBank);
      }
      this.saveAll();
      this.closeBankModal();
    },
    deleteBank(id) {
      if (!confirm('Hapus rekening ini beserta semua transaksinya?')) return;
      this.banks = this.banks.filter(b => b.id !== id);
      this.transactions = this.transactions.filter(tx => tx.bankId !== id);
      this.saveAll();
    },
    closeBankModal() { this.showBankModal = false; this.editingBankId = null; },

    openAddTransaction(type) {
      if (this.banks.length === 0) return alert('Silakan tambah Bank/Rekening terlebih dahulu!');
      this.editingTxId = null;
      this.txForm = {
        type: type || 'expense',
        bankId: this.banks[0].id,
        date: localDateStr(),
        amount: null,
        description: '',
        category: '',
        isReimburse: false,
        paidBy: '',
        notes: '',
      };
      this.showTxModal = true;
    },
    openEditTx(tx) {
      this.editingTxId = tx.id;
      this.txForm = {
        type: tx.type,
        bankId: tx.bankId,
        date: tx.date,
        amount: tx.amount,
        description: tx.description,
        category: tx.category || '',
        isReimburse: tx.isReimburse || false,
        paidBy: tx.paidBy || '',
        notes: tx.notes || '',
      };
      this.showTxModal = true;
    },
    saveTx() {
      if (!this.txForm.bankId) return alert('Pilih Bank / Dompet tujuan!');
      if (!this.txForm.description.trim()) return alert('Deskripsi wajib diisi!');
      if (!this.txForm.amount || this.txForm.amount <= 0) return alert('Jumlah harus lebih dari 0!');

      if (this.editingTxId) {
        // Mode Edit — update transaksi yang ada
        const idx = this.transactions.findIndex(t => t.id === this.editingTxId);
        if (idx !== -1) {
          this.transactions[idx] = {
            ...this.transactions[idx],
            bankId: this.txForm.bankId,
            type: this.txForm.type,
            date: this.txForm.date,
            amount: Number(this.txForm.amount),
            description: this.txForm.description,
            category: this.txForm.category,
            isReimburse: this.txForm.type === 'expense' ? this.txForm.isReimburse : false,
            paidBy: this.txForm.type === 'expense' && this.txForm.isReimburse ? this.txForm.paidBy : '',
            notes: this.txForm.notes,
          };
        }
        this.saveAll();
        this.closeTxModal();
        return;
      }

      // Mode Tambah Baru
      const newTx = {
        id: 'tx-' + Date.now(),
        bankId: this.txForm.bankId,
        type: this.txForm.type,
        date: this.txForm.date,
        amount: Number(this.txForm.amount),
        description: this.txForm.description,
        category: this.txForm.category,
        isReimburse: this.txForm.type === 'expense' ? this.txForm.isReimburse : false,
        paidBy: this.txForm.type === 'expense' && this.txForm.isReimburse ? this.txForm.paidBy : '',
        notes: this.txForm.notes,
        settled: (this.txForm.type === 'expense' && this.txForm.isReimburse) ? false : null,
      };
      this.transactions.push(newTx);
      this.saveAll();
      this.closeTxModal();
    },
    deleteTx(id) {
      if (!confirm('Hapus transaksi ini?')) return;
      this.transactions = this.transactions.filter(tx => tx.id !== id);
      this.saveAll();
    },
    
    // SISTEM PENGEMBALIAN DANA REIMBURSE
    settleReimburse(tx) {
      const idx = this.transactions.findIndex(t => t.id === tx.id);
      if (idx !== -1) {
        // 1. Ubah status hutang/reimburse yang lama menjadi lunas
        this.transactions[idx] = { ...this.transactions[idx], settled: true };
        
        // 2. Buat otomatis transaksi INCOME untuk mengembalikan uangnya ke bank
        const refund = {
          id: 'tx-refund-' + Date.now(),
          bankId: tx.bankId,
          type: 'income',
          date: localDateStr(),
          amount: tx.amount,
          description: 'Pencairan Reimburse: ' + tx.description,
          category: 'Reimburse Lunas',
          isReimburse: false,
          paidBy: '',
          notes: 'Otomatis dibuat oleh sistem karena dana ditalangi untuk ' + (tx.paidBy || 'seseorang') + ' sudah dilunasi.',
          settled: null,
        };
        this.transactions.push(refund);
        this.saveAll();
        
        // Kasih notifikasi biar tahu saldonya udah nambah!
        alert('Hore! Uang berhasil dicairkan. Status Reimburse menjadi Lunas dan saldo direkening Anda otomatis bertambah kembali.');
      }
    },
    
    finRangeCalPrevMonth() { if (this.finRangeCalMonth === 0) { this.finRangeCalMonth = 11; this.finRangeCalYear--; } else this.finRangeCalMonth--; },
    finRangeCalNextMonth() { if (this.finRangeCalMonth === 11) { this.finRangeCalMonth = 0; this.finRangeCalYear++; } else this.finRangeCalMonth++; },
    onFinRangeCalClick(dateStr) {
      if (!this.finFilterStartDate || (this.finFilterStartDate && this.finFilterEndDate)) { this.finFilterStartDate = dateStr; this.finFilterEndDate = ''; }
      else {
        if (dateStr < this.finFilterStartDate) { this.finFilterEndDate = this.finFilterStartDate; this.finFilterStartDate = dateStr; }
        else this.finFilterEndDate = dateStr;
        this.showFinRangePicker = false;
      }
    },
    getFinRangeCellStyle(cell) {
      if (!cell.date) return { visibility: 'hidden' };
      const isStart = cell.date === this.finFilterStartDate, isEnd = cell.date === this.finFilterEndDate;
      const inRange = this.finFilterStartDate && this.finFilterEndDate && cell.date > this.finFilterStartDate && cell.date < this.finFilterEndDate;
      const isToday = cell.date === this.finTodayStr;
      if (isStart || isEnd) return { background: 'var(--color-terracotta)', color: '#fff', fontWeight: 'bold', borderRadius: '50%' };
      if (inRange) return { background: 'rgba(214,123,82,0.15)', color: 'var(--text-dark)', borderRadius: '4px' };
      if (isToday) return { border: '1.5px solid var(--color-terracotta)', color: 'var(--color-terracotta)', fontWeight: 'bold', borderRadius: '50%' };
      return { color: 'var(--text-dark)' };
    },
    closeTxModal() { this.showTxModal = false; this.editingTxId = null; },

    openTransferModal() {
      if (this.banks.length < 2) return alert('Kamu butuh minimal 2 bank/rekening untuk melakukan transfer!');
      this.transferForm = {
        fromBankId: this.banks[0].id,
        toBankId: this.banks[1].id,
        amount: null,
        date: localDateStr(),
        notes: '',
      };
      this.showTransferModal = true;
    },
    closeTransferModal() { this.showTransferModal = false; },
    saveTransfer() {
      if (!this.transferForm.fromBankId) return alert('Pilih bank asal!');
      if (!this.transferForm.toBankId) return alert('Pilih bank tujuan!');
      if (this.transferForm.fromBankId === this.transferForm.toBankId) return alert('Bank asal dan tujuan tidak boleh sama!');
      if (!this.transferForm.amount || this.transferForm.amount <= 0) return alert('Jumlah transfer harus lebih dari 0!');
      if (this.transferForm.amount > this.getBankBalance(this.transferForm.fromBankId)) {
        return alert('Saldo ' + this.getBankName(this.transferForm.fromBankId) + ' tidak mencukupi!');
      }

      const transferId = 'tf-' + Date.now();
      const fromName = this.getBankName(this.transferForm.fromBankId);
      const toName = this.getBankName(this.transferForm.toBankId);
      const desc = this.transferForm.notes
        ? this.transferForm.notes
        : `Transfer ${fromName} → ${toName}`;

      // Transaksi keluar dari bank asal
      const txOut = {
        id: 'tx-out-' + transferId,
        bankId: this.transferForm.fromBankId,
        transferPairBankId: this.transferForm.toBankId,
        type: 'expense',
        date: this.transferForm.date,
        amount: Number(this.transferForm.amount),
        description: desc,
        category: 'Transfer',
        isReimburse: false,
        isTransfer: true,
        paidBy: '',
        notes: `Transfer ke ${toName}`,
        settled: null,
      };

      // Transaksi masuk ke bank tujuan
      const txIn = {
        id: 'tx-in-' + transferId,
        bankId: this.transferForm.toBankId,
        transferPairBankId: this.transferForm.fromBankId,
        type: 'income',
        date: this.transferForm.date,
        amount: Number(this.transferForm.amount),
        description: desc,
        category: 'Transfer',
        isReimburse: false,
        isTransfer: true,
        paidBy: '',
        notes: `Transfer dari ${fromName}`,
        settled: null,
      };

      this.transactions.push(txOut, txIn);
      this.saveAll();
      this.closeTransferModal();
      this.activeTab = 'transfer';
    },

    saveAll() {
      this.lastUpdated = new Date().toISOString();
      WorkspaceStorage.setItem('fin_banks', JSON.stringify(this.banks));
      WorkspaceStorage.setItem('fin_transactions', JSON.stringify(this.transactions));
      WorkspaceStorage.setItem('fin_last_updated', this.lastUpdated);
    },
  },

  async mounted() {
    // ✅ FIX: Tunggu Supabase storage siap sebelum baca data
    await globalThis._workspaceStorageReady;

    try {
      const savedBanks = WorkspaceStorage.getItem('fin_banks');
      if (savedBanks) this.banks = JSON.parse(savedBanks);
    } catch(_e) { this.banks = []; }
    try {
      const savedTx = WorkspaceStorage.getItem('fin_transactions');
      if (savedTx) {
        let loadedTxs = JSON.parse(savedTx);
        // Migrasi data (jika ada data lama tipe 'reimburse')
        loadedTxs = loadedTxs.map(tx => {
          if (tx.type === 'reimburse') {
            return { ...tx, type: 'expense', isReimburse: true, settled: tx.settled || false };
          }
          return tx;
        });
        this.transactions = loadedTxs;
      }
    } catch(_e) { this.transactions = []; }
    this._closeFinRangePicker = () => { if (this.showFinRangePicker) this.showFinRangePicker = false; };
    document.addEventListener('click', this._closeFinRangePicker);
    try {
      const savedLastUpdated = WorkspaceStorage.getItem('fin_last_updated');
      if (savedLastUpdated) this.lastUpdated = savedLastUpdated;
    } catch(_e) { this.lastUpdated = null; }
  },
  unmounted() {
    if (this._closeFinRangePicker) document.removeEventListener('click', this._closeFinRangePicker);
  },
};

// ============================================================================
// INSPIRATION BOARD — Global Floating Component
// ============================================================================
const InspirationBoard = {
  props: ['show'],
  emits: ['close'],
  template: `
    <teleport to="body">
      <transition name="insight-modal-fade">
        <div v-if="show"
          style="position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; background: rgba(30,22,16,0.45); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); padding: 16px;"
          @click.self="$emit('close')">

          <div style="background: var(--color-paper, #FAF7F2); width: min(560px, 96vw); border-radius: 20px; box-shadow: 0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12); display: flex; flex-direction: column; overflow: hidden; animation: insightPopIn 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-height: 90vh;">

            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 12px; padding: 16px 22px 14px; background: var(--color-terracotta, #D67B52); color: #fff; flex-shrink: 0;">
              <div style="width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 17px;">✨</div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 15px; font-weight: 800; letter-spacing: 0.2px;">Papan Inspirasi</div>
                <div style="font-size: 11px; opacity: 0.82; margin-top: 1px;">kalimat & kutipan yang menghidupimu ✦</div>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <!-- View database button -->
                <button @click="showDatabase = true" title="Lihat semua inspirasi"
                  style="background: rgba(255,255,255,0.18); border: none; border-radius: 9px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; transition: background 0.15s;"
                  onmouseover="this.style.background='rgba(255,255,255,0.32)'" onmouseout="this.style.background='rgba(255,255,255,0.18)'">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </button>
                <!-- Close button -->
                <button @click="$emit('close')"
                  style="background: rgba(255,255,255,0.18); border: none; border-radius: 9px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-size: 16px; transition: background 0.15s;"
                  onmouseover="this.style.background='rgba(255,255,255,0.32)'" onmouseout="this.style.background='rgba(255,255,255,0.18)'">✕</button>
              </div>
            </div>

            <!-- Body: Form input -->
            <div style="padding: 20px 24px; overflow-y: auto; flex: 1;">

              <!-- Sumber -->
              <div style="margin-bottom: 14px;">
                <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Sumber <span style="font-weight:400; font-style:italic; text-transform:none;">(buku, orang, film, dll.)</span></label>
                <input type="text" v-model="form.source" placeholder="cth., Marcus Aurelius, Atomic Habits, Interstellar..."
                  style="width: 100%; height: 40px; padding: 0 12px; border: 1.5px solid var(--color-sand); border-radius: 9px; font-size: 13px; font-family: inherit; color: var(--text-dark); background: #fff; box-sizing: border-box; outline: none; transition: border-color 0.15s;"
                  @focus="$event.target.style.borderColor='var(--color-terracotta)'" @blur="$event.target.style.borderColor='var(--color-sand)'" />
              </div>

              <!-- Kalimat inspirasi -->
              <div style="margin-bottom: 20px;">
                <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Kata / Kalimat Inspirasi <span style="color: #EF4444;">*</span></label>
                <textarea v-model="form.quote" placeholder="Tulis kutipan atau kalimat yang menginspirasimu..." rows="4"
                  style="width: 100%; padding: 10px 12px; border: 1.5px solid var(--color-sand); border-radius: 9px; font-size: 13.5px; font-family: inherit; color: var(--text-dark); background: #fff; box-sizing: border-box; outline: none; resize: vertical; line-height: 1.6; transition: border-color 0.15s;"
                  @focus="$event.target.style.borderColor='var(--color-terracotta)'" @blur="$event.target.style.borderColor='var(--color-sand)'"></textarea>
              </div>

              <!-- Actions -->
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button @click="resetForm"
                  style="height: 38px; padding: 0 16px; background: var(--bg-cream); border: 1.5px solid var(--color-sand); color: var(--text-dark); border-radius: 9px; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit; transition: border-color 0.15s;"
                  onmouseover="this.style.borderColor='var(--color-terracotta)'" onmouseout="this.style.borderColor='var(--color-sand)'">Bersihkan</button>
                <button @click="saveQuote"
                  style="height: 38px; padding: 0 20px; background: var(--color-terracotta, #D67B52); color: #fff; border: none; border-radius: 9px; font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; gap: 6px; transition: background 0.15s;"
                  onmouseover="this.style.background='var(--color-terracotta-dark, #B8663F)'" onmouseout="this.style.background='var(--color-terracotta, #D67B52)'">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Simpan
                </button>
              </div>
            </div>

          </div>
        </div>
      </transition>

      <!-- DATABASE POPUP — lembaran semua kutipan -->
      <transition name="insight-modal-fade">
        <div v-if="showDatabase"
          style="position: fixed; inset: 0; z-index: 999999; display: flex; align-items: center; justify-content: center; background: rgba(30,22,16,0.55); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); padding: 16px;"
          @click.self="showDatabase = false">

          <div style="background: var(--color-paper, #FAF7F2); width: min(640px, 96vw); max-height: 88vh; border-radius: 20px; box-shadow: 0 24px 64px rgba(0,0,0,0.32); display: flex; flex-direction: column; overflow: hidden; animation: insightPopIn 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275);">

            <!-- DB Header -->
            <div style="display: flex; align-items: center; gap: 12px; padding: 16px 22px 14px; background: var(--color-terracotta, #D67B52); color: #fff; flex-shrink: 0;">
              <div style="width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 17px;">📖</div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 15px; font-weight: 800;">Koleksi Inspirasi</div>
                <div style="font-size: 11px; opacity: 0.82; margin-top: 1px;">{{ quotes.length }} kutipan tersimpan</div>
              </div>
              <button @click="showDatabase = false"
                style="background: rgba(255,255,255,0.18); border: none; border-radius: 9px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-size: 16px; transition: background 0.15s;"
                onmouseover="this.style.background='rgba(255,255,255,0.32)'" onmouseout="this.style.background='rgba(255,255,255,0.18)'">✕</button>
            </div>

            <!-- DB Body -->
            <div style="overflow-y: auto; padding: 20px 24px; flex: 1;">

              <!-- Empty state -->
              <div v-if="quotes.length === 0" style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <div style="font-size: 36px; margin-bottom: 12px;">✨</div>
                <div style="font-size: 14px; font-weight: 600; margin-bottom: 6px;">Belum ada kutipan</div>
                <div style="font-size: 12.5px;">Tambahkan kutipan pertamamu dari form inputan!</div>
              </div>

              <!-- Quote cards -->
              <div v-for="(q, i) in quotes" :key="q.id"
                style="background: #fff; border: 1.5px solid var(--color-sand); border-radius: 14px; padding: 16px 18px; margin-bottom: 12px; position: relative; border-left: 4px solid var(--color-terracotta, #D67B52);">

                <button @click="deleteQuote(i)" title="Hapus kutipan"
                  style="position: absolute; top: 10px; right: 10px; background: #FEF2F2; border: 1.5px solid #FCA5A5; border-radius: 6px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background 0.15s;"
                  onmouseover="this.style.background='#FEE2E2'" onmouseout="this.style.background='#FEF2F2'">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>

                <!-- Quote text -->
                <div style="font-size: 14px; color: var(--text-dark); line-height: 1.75; font-style: italic; margin-bottom: 10px; padding-right: 30px;">"{{ q.quote }}"</div>

                <!-- Source + date -->
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span v-if="q.source" style="font-size: 11.5px; font-weight: 700; color: var(--color-terracotta, #D67B52); background: rgba(214,123,82,0.1); border: 1.5px solid rgba(214,123,82,0.25); border-radius: 20px; padding: 2px 10px; display: inline-flex; align-items: center; gap: 4px;">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    {{ q.source }}
                  </span>
                  <span style="font-size: 10.5px; color: var(--text-muted);">{{ formatDate(q.createdAt) }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </transition>
    </teleport>
  `,
  data() {
    return {
      form: { source: '', quote: '' },
      quotes: [],
      showDatabase: false,
    };
  },
  methods: {
    saveQuote() {
      if (!this.form.quote.trim()) return alert('Kalimat inspirasi wajib diisi!');
      this.quotes.unshift({
        id: 'insp-' + Date.now(),
        source: this.form.source.trim(),
        quote: this.form.quote.trim(),
        createdAt: new Date().toISOString(),
      });
      this.saveToStorage();
      this.resetForm();
    },
    deleteQuote(idx) {
      if (!confirm('Hapus kutipan ini?')) return;
      this.quotes.splice(idx, 1);
      this.saveToStorage();
    },
    resetForm() {
      this.form = { source: '', quote: '' };
    },
    saveToStorage() {
      WorkspaceStorage.setItem('inspiration_quotes', JSON.stringify(this.quotes));
      globalThis.dispatchEvent(new CustomEvent('inspiration-quotes-updated'));
    },
    formatDate(iso) {
      if (!iso) return '';
      const d = new Date(iso);
      const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
      return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    },
  },
  async mounted() {
    await globalThis._workspaceStorageReady;
    try {
      const saved = WorkspaceStorage.getItem('inspiration_quotes');
      if (saved) this.quotes = JSON.parse(saved);
    } catch(_e) { this.quotes = []; }
  },
};



// ============================================================================
// DZIKIR COUNTER Component — Mini popup untuk dzikir harian dengan counter & target
// ============================================================================
const DzikirCounter = {
  props: ['show'],
  emits: ['close'],
  template: `
    <teleport to="body">
      <transition name="insight-modal-fade">
        <div v-if="show"
          style="position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; background: rgba(30,22,16,0.45); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); padding: 16px;"
          @click.self="$emit('close')">

          <div style="background: var(--color-paper, #FAF7F2); width: min(420px, 96vw); border-radius: 20px; box-shadow: 0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12); display: flex; flex-direction: column; overflow: hidden; animation: insightPopIn 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-height: 90vh;">

            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 12px; padding: 16px 22px 14px; background: var(--color-terracotta, #D67B52); color: #fff; flex-shrink: 0;">
              <div style="width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 17px;">📿</div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 15px; font-weight: 800; letter-spacing: 0.2px;">Dzikir Harian</div>
                <div style="font-size: 11px; opacity: 0.82; margin-top: 1px;">tasbih digital ✦</div>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <!-- Sound toggle button -->
                <button @click="toggleSound" :title="soundOn ? 'Matikan suara ketukan' : 'Nyalakan suara ketukan'"
                  style="background: rgba(255,255,255,0.18); border: none; border-radius: 9px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; transition: background 0.15s;"
                  onmouseover="this.style.background='rgba(255,255,255,0.32)'" onmouseout="this.style.background='rgba(255,255,255,0.18)'">
                  <svg v-if="soundOn" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                  <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                </button>
                <!-- Manage list button -->
                <button @click="showManage = true" title="Kelola daftar dzikir"
                  style="background: rgba(255,255,255,0.18); border: none; border-radius: 9px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; transition: background 0.15s;"
                  onmouseover="this.style.background='rgba(255,255,255,0.32)'" onmouseout="this.style.background='rgba(255,255,255,0.18)'">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
                <!-- Close button -->
                <button @click="$emit('close')"
                  style="background: rgba(255,255,255,0.18); border: none; border-radius: 9px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-size: 16px; transition: background 0.15s;"
                  onmouseover="this.style.background='rgba(255,255,255,0.32)'" onmouseout="this.style.background='rgba(255,255,255,0.18)'">✕</button>
              </div>
            </div>

            <!-- Body -->
            <div style="padding: 22px 24px 26px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; align-items: center;">

              <!-- Empty state: belum ada dzikir sama sekali -->
              <div v-if="list.length === 0" style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
                <div style="font-size: 36px; margin-bottom: 12px;">📿</div>
                <div style="font-size: 14px; font-weight: 600; margin-bottom: 6px; color: var(--text-dark);">Belum ada dzikir</div>
                <div style="font-size: 12.5px; margin-bottom: 16px;">Tambahkan dzikir pertamamu untuk mulai menghitung.</div>
                <button @click="showManage = true"
                  style="height: 38px; padding: 0 18px; background: var(--color-terracotta, #D67B52); color: #fff; border: none; border-radius: 9px; font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: inherit;">
                  + Tambah Dzikir
                </button>
              </div>

              <!-- Active dzikir display -->
              <template v-else>
                <!-- Selector dot kalau lebih dari 1 dzikir -->
                <div v-if="list.length > 1" style="display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap; justify-content: center;">
                  <button v-for="(d, i) in list" :key="d.id"
                    @click="activeIndex = i"
                    :title="d.text"
                    :style="{
                      fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit',
                      border: (i === activeIndex) ? '1.5px solid var(--color-terracotta)' : '1.5px solid var(--color-sand)',
                      background: (i === activeIndex) ? 'rgba(214,123,82,0.12)' : '#fff',
                      color: (i === activeIndex) ? 'var(--color-terracotta)' : 'var(--text-muted)'
                    }">
                    {{ d.text.length > 14 ? d.text.slice(0, 14) + '…' : d.text }}
                  </button>
                </div>

                <!-- Nama dzikir aktif -->
                <div style="font-size: 17px; font-weight: 800; color: var(--text-dark); text-align: center; margin-bottom: 4px; padding: 0 8px;">
                  {{ activeDzikir.text }}
                </div>
                <div v-if="activeDzikir.arabic" style="font-size: 20px; color: var(--color-terracotta); text-align: center; margin-bottom: 6px; line-height: 1.6;" dir="rtl">
                  {{ activeDzikir.arabic }}
                </div>
                <div v-if="activeDzikir.meaning" style="font-size: 12px; font-style: italic; color: var(--text-muted); text-align: center; margin-bottom: 14px; padding: 0 12px;">
                  "{{ activeDzikir.meaning }}"
                </div>
                <div v-else style="margin-bottom: 14px;"></div>

                <!-- Target -->
                <div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 18px;">
                  target {{ activeDzikir.target }}x
                </div>

                <!-- Tombol hitung utama (lingkaran besar) -->
                <button @click="increment"
                  style="width: 168px; height: 168px; border-radius: 50%; background: var(--color-terracotta, #D67B52); border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; box-shadow: 0 8px 24px rgba(214,123,82,0.35); transition: transform 0.08s, background 0.15s; user-select: none;"
                  onmousedown="this.style.transform='scale(0.94)'" onmouseup="this.style.transform='scale(1)'" onmouseleave="this.style.transform='scale(1)'"
                  ontouchstart="this.style.transform='scale(0.94)'" ontouchend="this.style.transform='scale(1)'">
                  <span style="font-size: 44px; font-weight: 800; line-height: 1; font-family: 'Space Mono', monospace;">{{ activeDzikir.count }}</span>
                  <span style="font-size: 11px; opacity: 0.85; margin-top: 6px; letter-spacing: 0.04em;">/ {{ activeDzikir.target }}</span>
                </button>

                <!-- Progress bar -->
                <div style="width: 100%; max-width: 220px; height: 6px; background: var(--color-sand); border-radius: 6px; margin-top: 20px; overflow: hidden;">
                  <div :style="{ width: Math.min(100, (activeDzikir.count / activeDzikir.target) * 100) + '%', height: '100%', background: 'var(--color-terracotta)', borderRadius: '6px', transition: 'width 0.2s' }"></div>
                </div>

                <!-- Pesan saat tercapai -->
                <transition name="insight-modal-fade">
                  <div v-if="justCompleted" style="margin-top: 14px; font-size: 12px; font-weight: 700; color: var(--color-terracotta); text-align: center;">
                    ✦ Alhamdulillah, target tercapai! Lanjut ke dzikir berikutnya...
                  </div>
                </transition>

                <!-- Indikator seluruh sesi tuntas (dipakai juga untuk buka gerbang reminder Dzikir Waktu) -->
                <div v-if="isFullyComplete && !justCompleted" style="margin-top: 10px; font-size: 11.5px; font-weight: 700; color: #16a34a; text-align: center; display: flex; align-items: center; justify-content: center; gap: 5px;">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Semua dzikir tuntas — pengingat siap ditandai selesai
                </div>

                <!-- Reset manual -->
                <div style="display: flex; gap: 14px; margin-top: 18px;">
                  <button @click="resetActive"
                    style="font-size: 11.5px; color: var(--text-muted); background: none; border: none; cursor: pointer; font-family: inherit; text-decoration: underline;">
                    Reset hitungan ini
                  </button>
                  <button @click="resetAll"
                    style="font-size: 11.5px; color: var(--text-muted); background: none; border: none; cursor: pointer; font-family: inherit; text-decoration: underline;">
                    Reset semua (sesi baru)
                  </button>
                </div>
              </template>
            </div>

          </div>
        </div>
      </transition>

      <!-- MANAGE POPUP — kelola daftar dzikir (tambah/edit/hapus) -->
      <transition name="insight-modal-fade">
        <div v-if="showManage"
          style="position: fixed; inset: 0; z-index: 999999; display: flex; align-items: center; justify-content: center; background: rgba(30,22,16,0.55); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); padding: 16px;"
          @click.self="closeManage">

          <div style="background: var(--color-paper, #FAF7F2); width: min(520px, 96vw); max-height: 88vh; border-radius: 20px; box-shadow: 0 24px 64px rgba(0,0,0,0.32); display: flex; flex-direction: column; overflow: hidden; animation: insightPopIn 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275);">

            <!-- Manage Header -->
            <div style="display: flex; align-items: center; gap: 12px; padding: 16px 22px 14px; background: var(--color-terracotta, #D67B52); color: #fff; flex-shrink: 0;">
              <div style="width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 17px;">📿</div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 15px; font-weight: 800;">Kelola Dzikir</div>
                <div style="font-size: 11px; opacity: 0.82; margin-top: 1px;">{{ list.length }} dzikir tersimpan</div>
              </div>
              <button @click="closeManage"
                style="background: rgba(255,255,255,0.18); border: none; border-radius: 9px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-size: 16px; transition: background 0.15s;"
                onmouseover="this.style.background='rgba(255,255,255,0.32)'" onmouseout="this.style.background='rgba(255,255,255,0.18)'">✕</button>
            </div>

            <!-- Manage Body -->
            <div style="overflow-y: auto; padding: 20px 24px; flex: 1;">

              <!-- Form tambah/edit -->
              <div style="background: #fff; border: 1.5px solid var(--color-sand); border-radius: 14px; padding: 16px 18px; margin-bottom: 18px;">
                <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
                  {{ editingId ? 'Edit Dzikir' : 'Tambah Dzikir Baru' }}
                </div>

                <div style="margin-bottom: 10px;">
                  <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 5px;">Nama Dzikir <span style="color:#EF4444;">*</span></label>
                  <input type="text" v-model="form.text" placeholder="cth., Subhanallah, Istighfar..."
                    style="width: 100%; height: 38px; padding: 0 12px; border: 1.5px solid var(--color-sand); border-radius: 9px; font-size: 13px; font-family: inherit; color: var(--text-dark); background: #fff; box-sizing: border-box; outline: none;"
                    @focus="$event.target.style.borderColor='var(--color-terracotta)'" @blur="$event.target.style.borderColor='var(--color-sand)'" />
                </div>

                <div style="margin-bottom: 10px;">
                  <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 5px;">Teks Arab <span style="font-weight:400; font-style:italic;">(opsional)</span></label>
                  <input type="text" v-model="form.arabic" placeholder="cth., سُبْحَانَ اللَّهِ" dir="rtl"
                    style="width: 100%; height: 38px; padding: 0 12px; border: 1.5px solid var(--color-sand); border-radius: 9px; font-size: 15px; font-family: inherit; color: var(--text-dark); background: #fff; box-sizing: border-box; outline: none;"
                    @focus="$event.target.style.borderColor='var(--color-terracotta)'" @blur="$event.target.style.borderColor='var(--color-sand)'" />
                </div>

                <div style="margin-bottom: 10px;">
                  <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 5px;">Artinya <span style="font-weight:400; font-style:italic;">(opsional)</span></label>
                  <input type="text" v-model="form.meaning" placeholder="cth., Maha Suci Allah"
                    style="width: 100%; height: 38px; padding: 0 12px; border: 1.5px solid var(--color-sand); border-radius: 9px; font-size: 13px; font-family: inherit; color: var(--text-dark); background: #fff; box-sizing: border-box; outline: none;"
                    @focus="$event.target.style.borderColor='var(--color-terracotta)'" @blur="$event.target.style.borderColor='var(--color-sand)'" />
                </div>

                <div style="margin-bottom: 14px;">
                  <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 5px;">Target Hitungan</label>
                  <input type="number" min="1" v-model.number="form.target" placeholder="33"
                    style="width: 100%; height: 38px; padding: 0 12px; border: 1.5px solid var(--color-sand); border-radius: 9px; font-size: 13px; font-family: inherit; color: var(--text-dark); background: #fff; box-sizing: border-box; outline: none;"
                    @focus="$event.target.style.borderColor='var(--color-terracotta)'" @blur="$event.target.style.borderColor='var(--color-sand)'" />
                </div>

                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                  <button v-if="editingId" @click="cancelEdit"
                    style="height: 36px; padding: 0 14px; background: var(--bg-cream); border: 1.5px solid var(--color-sand); color: var(--text-dark); border-radius: 9px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit;">
                    Batal
                  </button>
                  <button @click="saveDzikir"
                    style="height: 36px; padding: 0 18px; background: var(--color-terracotta, #D67B52); color: #fff; border: none; border-radius: 9px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit;"
                    onmouseover="this.style.background='var(--color-terracotta-dark, #B8663F)'" onmouseout="this.style.background='var(--color-terracotta, #D67B52)'">
                    {{ editingId ? 'Simpan Perubahan' : '+ Tambah' }}
                  </button>
                </div>
              </div>

              <!-- Empty state list -->
              <div v-if="list.length === 0" style="text-align: center; padding: 30px 10px; color: var(--text-muted);">
                <div style="font-size: 12.5px;">Belum ada dzikir. Tambahkan dari form di atas.</div>
              </div>

              <!-- List dzikir -->
              <div v-for="(d, i) in list" :key="d.id"
                style="background: #fff; border: 1.5px solid var(--color-sand); border-radius: 14px; padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; border-left: 4px solid var(--color-terracotta, #D67B52);">

                <!-- Tombol pindah urutan -->
                <div style="display: flex; flex-direction: column; gap: 3px; flex-shrink: 0;">
                  <button @click="moveDzikirUp(i)" :disabled="i === 0" title="Pindah ke atas"
                    :style="{ background: 'var(--bg-cream)', border: '1.5px solid var(--color-sand)', borderRadius: '6px', width: '24px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: i === 0 ? 'not-allowed' : 'pointer', opacity: i === 0 ? 0.35 : 1, padding: 0 }">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--text-dark)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </button>
                  <button @click="moveDzikirDown(i)" :disabled="i === list.length - 1" title="Pindah ke bawah"
                    :style="{ background: 'var(--bg-cream)', border: '1.5px solid var(--color-sand)', borderRadius: '6px', width: '24px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: i === list.length - 1 ? 'not-allowed' : 'pointer', opacity: i === list.length - 1 ? 0.35 : 1, padding: 0 }">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--text-dark)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                </div>

                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 13.5px; font-weight: 700; color: var(--text-dark);">{{ d.text }}</div>
                  <div v-if="d.arabic" style="font-size: 13px; color: var(--color-terracotta); margin-top: 2px;" dir="rtl">{{ d.arabic }}</div>
                  <div v-if="d.meaning" style="font-size: 11.5px; font-style: italic; color: var(--text-muted); margin-top: 2px;">"{{ d.meaning }}"</div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">target {{ d.target }}x · progres {{ d.count }}/{{ d.target }}</div>
                </div>

                <div style="display: flex; gap: 6px; flex-shrink: 0;">
                  <button @click="startEdit(d)" title="Edit"
                    style="background: var(--bg-cream); border: 1.5px solid var(--color-sand); border-radius: 7px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--text-dark)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                  </button>
                  <button @click="deleteDzikir(i)" title="Hapus"
                    style="background: #FEF2F2; border: 1.5px solid #FCA5A5; border-radius: 7px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </transition>
    </teleport>
  `,
  data() {
    return {
      list: [],
      activeIndex: 0,
      showManage: false,
      justCompleted: false,
      editingId: null,
      form: { text: '', arabic: '', meaning: '', target: 33 },
      _completeTimer: null,
      soundOn: true,
    };
  },
  computed: {
    activeDzikir() {
      return this.list[this.activeIndex] || { text: '', arabic: '', meaning: '', count: 0, target: 33 };
    },
    isFullyComplete() {
      return this.list.length > 0 && this.list.every(d => d.count >= d.target);
    },
  },
  methods: {
    vibrate(pattern) {
      // Getaran haptic — aman dipanggil meski device/browser tidak support
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(pattern); } catch (e) { /* ignore */ }
      }
    },
    toggleSound() {
      this.soundOn = !this.soundOn;
      WorkspaceStorage.setItem('dzikir_sound_on', this.soundOn ? '1' : '0');
    },
    playTapSound() {
      // Suara "tok" kayu dalam: nada rendah beresonansi + sedikit tekstur kayu
      if (!this.soundOn) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Badan suara — nada rendah, dalam, beresonansi pelan
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(68, now + 0.1);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, now);
        filter.Q.value = 0.4;

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(0.28, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);

        // Tekstur kayu — semburan noise sangat pendek biar tidak terdengar "elektronik"
        const bufferSize = Math.floor(ctx.sampleRate * 0.015);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 700;
        noiseFilter.Q.value = 0.8;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.06, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseSource.start(now);
      } catch (_e) { /* ignore */ }
    },
    increment() {
      if (!this.list.length) return;
      const d = this.list[this.activeIndex];
      // Catat status sebelum tap: apakah SEMUA dzikir sudah tuntas sebelumnya?
      const wasFullyComplete = this.isFullyComplete;
      if (d.count < d.target) {
        d.count++;
      }
      this.playTapSound();
      if (d.count >= d.target) {
        this.vibrate([30, 40, 30, 40, 60]); // pola getaran khusus saat target tercapai
        this.onTargetReached();
      } else {
        this.vibrate(15); // getaran singkat tiap tap normal
      }
      this.saveToStorage();
      // Increment counter putaran HANYA jika sesi baru saja tuntas (transisi dari belum → selesai).
      // Kalau sebelumnya sudah tuntas (wasFullyComplete), tidak dihitung lagi —
      // supaya user harus Reset dulu sebelum sesi berikutnya, dan panel habit
      // Dzikir Waktu terbuka satu per satu sesuai jumlah putaran yang benar-benar diselesaikan.
      if (!wasFullyComplete && this.isFullyComplete) {
        try {
          const now = new Date();
          const todayStr = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0');
          const raw = WorkspaceStorage.getItem('dzikir_completed_today');
          let data = raw ? JSON.parse(raw) : null;
          if (!data || data.date !== todayStr) {
            data = { date: todayStr, count: 0 };
          }
          data.count += 1;
          WorkspaceStorage.setItem('dzikir_completed_today', JSON.stringify(data));
          // Tetap simpan timestamp lama untuk backward-compat (kalau ada kode lain yg baca)
          WorkspaceStorage.setItem('dzikir_last_completed_at', String(Date.now()));
        } catch(_e) {}
        window.dispatchEvent(new CustomEvent('ws-dzikir-completed'));
      }
    },
    onTargetReached() {
      this.justCompleted = true;
      if (this._completeTimer) clearTimeout(this._completeTimer);
      this._completeTimer = setTimeout(() => {
        this.justCompleted = false;
        // Auto lanjut ke dzikir berikutnya dalam list (jika ada lebih dari satu)
        if (this.list.length > 1) {
          this.activeIndex = (this.activeIndex + 1) % this.list.length;
        }
      }, 1400);
    },
    resetActive() {
      if (!this.list.length) return;
      this.list[this.activeIndex].count = 0;
      this.justCompleted = false;
      this.saveToStorage();
    },
    resetAll() {
      if (!this.list.length) return;
      if (!confirm('Reset semua hitungan dzikir ke 0? Cocok dipakai sebelum mulai sesi dzikir waktu berikutnya.')) return;
      this.list.forEach(d => { d.count = 0; });
      this.activeIndex = 0;
      this.justCompleted = false;
      this.saveToStorage();
    },
    startEdit(d) {
      this.editingId = d.id;
      this.form = { text: d.text, arabic: d.arabic || '', meaning: d.meaning || '', target: d.target };
    },
    cancelEdit() {
      this.editingId = null;
      this.form = { text: '', arabic: '', meaning: '', target: 33 };
    },
    saveDzikir() {
      const text = this.form.text.trim();
      if (!text) return alert('Nama dzikir wajib diisi!');
      const target = (this.form.target && this.form.target > 0) ? Math.floor(this.form.target) : 33;

      if (this.editingId) {
        const idx = this.list.findIndex(d => d.id === this.editingId);
        if (idx !== -1) {
          this.list[idx].text = text;
          this.list[idx].arabic = this.form.arabic.trim();
          this.list[idx].meaning = this.form.meaning.trim();
          this.list[idx].target = target;
          if (this.list[idx].count > target) this.list[idx].count = target;
        }
      } else {
        this.list.push({
          id: 'dzikir-' + Date.now(),
          text: text,
          arabic: this.form.arabic.trim(),
          meaning: this.form.meaning.trim(),
          target: target,
          count: 0,
        });
      }
      this.saveToStorage();
      this.cancelEdit();
    },
    deleteDzikir(idx) {
      if (!confirm('Hapus dzikir ini?')) return;
      this.list.splice(idx, 1);
      if (this.activeIndex >= this.list.length) this.activeIndex = Math.max(0, this.list.length - 1);
      this.saveToStorage();
    },
    moveDzikirUp(idx) {
      if (idx <= 0 || idx >= this.list.length) return;
      const wasActive = this.list[this.activeIndex] && this.list[this.activeIndex].id;
      const tmp = this.list[idx - 1];
      this.list[idx - 1] = this.list[idx];
      this.list[idx] = tmp;
      if (wasActive) this.activeIndex = this.list.findIndex(d => d.id === wasActive);
      this.saveToStorage();
    },
    moveDzikirDown(idx) {
      if (idx < 0 || idx >= this.list.length - 1) return;
      const wasActive = this.list[this.activeIndex] && this.list[this.activeIndex].id;
      const tmp = this.list[idx + 1];
      this.list[idx + 1] = this.list[idx];
      this.list[idx] = tmp;
      if (wasActive) this.activeIndex = this.list.findIndex(d => d.id === wasActive);
      this.saveToStorage();
    },
    closeManage() {
      this.showManage = false;
      this.cancelEdit();
    },
    saveToStorage() {
      WorkspaceStorage.setItem('dzikir_list', JSON.stringify(this.list));
    },
    seedDefaults() {
      this.list = [
        { id: 'dzikir-default-1', text: 'Subhanallah', arabic: 'سُبْحَانَ اللَّهِ', meaning: 'Maha Suci Allah', target: 33, count: 0 },
        { id: 'dzikir-default-2', text: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', meaning: 'Segala puji bagi Allah', target: 33, count: 0 },
        { id: 'dzikir-default-3', text: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', meaning: 'Allah Maha Besar', target: 33, count: 0 },
        { id: 'dzikir-default-4', text: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', meaning: 'Aku memohon ampun kepada Allah', target: 100, count: 0 },
      ];
      this.saveToStorage();
    },
  },
  async mounted() {
    await globalThis._workspaceStorageReady;
    try {
      const savedSound = WorkspaceStorage.getItem('dzikir_sound_on');
      if (savedSound !== null) this.soundOn = savedSound !== '0';
      const saved = WorkspaceStorage.getItem('dzikir_list');
      if (saved) {
        this.list = JSON.parse(saved);
      } else {
        this.seedDefaults();
      }
    } catch (_e) {
      this.seedDefaults();
    }
  },
};


// ============================================================================
// 11. CAREER FOUNDATION Component
// ============================================================================
const CareerFoundation = {
  template: `
  <div class="cf-clean">

    <!-- ── Hero Header (job board style) ── -->
    <div class="cf-hero">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <div class="cf-hero-badge">
          <span class="cf-hero-badge-dot"></span>
          Dokumen Karir
        </div>
        <button @click="goToPortfolio" title="My Portfolio"
          style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;background:transparent;border:1.5px solid var(--color-sand,#C8BDB5);border-radius:8px;cursor:pointer;color:var(--text-secondary,#7A6F66);transition:background 0.15s,border-color 0.15s;"
          onmouseover="this.style.background='var(--color-sand-light,#EDE8E1)';this.style.borderColor='var(--color-terracotta,#D67B52)'"
          onmouseout="this.style.background='transparent';this.style.borderColor='var(--color-sand,#C8BDB5)'">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </button>
      </div>
      <h2 class="cf-hero-title">Career Foundation</h2>
      <p class="cf-hero-sub">Semua dokumen siap kirim — CV, cover letter, surat lamaran, dan template email dalam satu tempat.</p>
      <div class="cf-hero-stats">
        <div class="cf-hero-stat">
          <span class="cf-hero-stat-num">{{ docs.length }}</span>
          <span>dokumen tersimpan</span>
        </div>
        <div class="cf-hero-stat">
          <span class="cf-hero-stat-num">{{ docsByType('cover_letter').length }}</span>
          <span>cover letter</span>
        </div>
        <div class="cf-hero-stat">
          <span class="cf-hero-stat-num">{{ docsByType('surat_lamaran').length }}</span>
          <span>surat lamaran</span>
        </div>
      </div>
    </div>

    <!-- ── Filter pills (job board category filter) ── -->
    <div class="cf-filter-row">
      <button
        v-for="tab in tabs" :key="tab.key"
        class="cf-filter-pill"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key">
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Layout: Sidebar Kata Kunci (kiri) + Konten Tab (kanan) ── -->
    <div class="cf-body-layout">

      <!-- ── Sidebar Kata Kunci ── -->
      <div class="cf-keyword-sidebar">
        <p class="cf-keyword-sidebar-title">Kata Kunci</p>
        <p class="cf-keyword-sidebar-sub">Buat daftar kata kunci di sini, lalu pilih beberapa untuk tiap task di tabel My Portfolio.</p>
        <div class="cf-keyword-add-row">
          <input type="text" class="cf-input cf-keyword-input-add" v-model="newKeywordInput"
            placeholder="cth., Leadership" @keyup.enter="addKeywordToBank" />
          <button class="cf-btn-primary cf-keyword-add-btn" :disabled="!newKeywordInput.trim()" @click="addKeywordToBank">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        <div v-if="!keywordBank.length" class="cf-keyword-empty">Belum ada kata kunci.</div>
        <div v-else class="cf-keyword-bank-list">
          <span v-for="kw in keywordBank" :key="kw" class="cf-keyword-bank-chip">
            {{ kw }}
            <button class="cf-keyword-bank-chip-remove" title="Hapus kata kunci" @click="removeKeywordFromBank(kw)">
              <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </span>
        </div>
      </div>

      <!-- ── Konten Tab ── -->
      <div class="cf-tabs-content">

    <!-- ══ TAB: CV ATS v2 ══ -->
    <transition name="cf-fade">
    <div v-if="activeTab === 'cv'" key="cv">

      <!-- Toolbar -->
      <div class="cv2-toolbar">
        <span class="cv2-toolbar-label">Preview CV ATS</span>
        <div class="cv2-toolbar-actions">
          <button class="cf-btn-ghost" @click="cv2AddSection">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Section
          </button>
          <button class="cf-btn-ghost" @click="copyAtsCVText">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            {{ atsCopySuccess ? 'Tersalin!' : 'Salin teks CV' }}
          </button>
        </div>
      </div>

      <!-- Paper CV Preview -->
      <div class="cv2-page">

        <!-- HEADER -->
        <div class="cv2-header">
          <div class="cv2-header-top">
            <div style="flex:1; min-width:0; text-align:center;">
              <h2 class="cv2-name">{{ atsCV.name || 'NAMA LENGKAP' }}</h2>
              <div class="cv2-contacts">
                <!-- Baris 1: kota | email -->
                <div class="cv2-contacts-row">
                  <span v-if="atsCV.location">{{ atsCV.location }}</span>
                  <span v-if="atsCV.location && atsCV.email" class="cv2-contact-sep">|</span>
                  <span v-if="atsCV.email">{{ atsCV.email }}</span>
                </div>
                <!-- Baris 2: no tlp | linkedin -->
                <div class="cv2-contacts-row" v-if="atsCV.phone || atsCV.linkedin || atsCV.portfolio">
                  <span v-if="atsCV.phone">{{ atsCV.phone }}</span>
                  <span v-if="atsCV.phone && (atsCV.linkedin || atsCV.portfolio)" class="cv2-contact-sep">|</span>
                  <span v-if="atsCV.linkedin">{{ atsCV.linkedin }}</span>
                  <span v-if="atsCV.linkedin && atsCV.portfolio" class="cv2-contact-sep">|</span>
                  <span v-if="atsCV.portfolio">{{ atsCV.portfolio }}</span>
                </div>
              </div>
            </div>
            <button class="cv2-edit-btn" @click="openAtsEditSection('header')">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
          </div>
        </div>

        <!-- BODY -->
        <div class="cv2-body">

          <!-- Sections rendered in sectionOrder -->
          <template v-for="(skey, si) in sectionOrder" :key="skey">

            <!-- ── SUMMARY ── -->
            <div v-if="skey === 'summary'" class="cv2-section"
              :class="{ 'cv2-section-drag-over': dragOverIdx === si }"
              draggable="true"
              @dragstart="onSectionDragStart(si, $event)"
              @dragover.prevent="onSectionDragOver(si, $event)"
              @dragleave="onSectionDragLeave"
              @drop.prevent="onSectionDrop(si)"
              @dragend="onSectionDragEnd">
              <div class="cv2-section-head">
                <div class="cv2-section-head-left">
                  <span class="cv2-drag-handle" title="Geser untuk pindah urutan">
                    <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor"><circle cx="7" cy="5" r="1.5"/><circle cx="13" cy="5" r="1.5"/><circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/><circle cx="7" cy="15" r="1.5"/><circle cx="13" cy="15" r="1.5"/></svg>
                  </span>
                  <p class="cv2-section-title">Summary</p>
                </div>
                <div class="cv2-section-actions">
                  <button class="cv2-sec-btn" @click.stop="openAtsEditSection('summary')">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button class="cv2-sec-btn danger" @click.stop="deleteBuiltinSection('summary')" title="Hapus section">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    Hapus
                  </button>
                </div>
              </div>
              <p v-if="atsCV.summary" class="cv2-summary">{{ atsCV.summary }}</p>
              <span v-else class="cv2-empty" @click="openAtsEditSection('summary')">+ Klik untuk mengisi ringkasan profesional</span>
            </div>

            <!-- ── PROFESSIONAL EXPERIENCE ── -->
            <div v-if="skey === 'experience'" class="cv2-section"
              :class="{ 'cv2-section-drag-over': dragOverIdx === si }"
              draggable="true"
              @dragstart="onSectionDragStart(si, $event)"
              @dragover.prevent="onSectionDragOver(si, $event)"
              @dragleave="onSectionDragLeave"
              @drop.prevent="onSectionDrop(si)"
              @dragend="onSectionDragEnd">
              <div class="cv2-section-head">
                <div class="cv2-section-head-left">
                  <span class="cv2-drag-handle" title="Geser untuk pindah urutan">
                    <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor"><circle cx="7" cy="5" r="1.5"/><circle cx="13" cy="5" r="1.5"/><circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/><circle cx="7" cy="15" r="1.5"/><circle cx="13" cy="15" r="1.5"/></svg>
                  </span>
                  <p class="cv2-section-title">Professional Experience</p>
                </div>
                <div class="cv2-section-actions">
                  <button class="cv2-sec-btn" @click.stop="openAtsEditSection('experience')">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button class="cv2-sec-btn danger" @click.stop="deleteBuiltinSection('experience')" title="Hapus section">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    Hapus
                  </button>
                </div>
              </div>
              <div v-if="atsCV.experience">
                <div v-for="(exp, idx) in parsedExperience" :key="idx" class="cv2-entry cv2-entry-editable" draggable="false">
                  <div class="cv2-entry-head">
                    <span class="cv2-entry-role">{{ exp.role }}<span v-if="exp.company">, {{ exp.company }}</span></span>
                    <div class="cv2-entry-head-right">
                      <span v-if="exp.period" class="cv2-entry-period">{{ exp.period }}</span>
                      <button class="cv2-entry-edit-btn" @click.stop="openAtsEditExperienceEntry(idx)" title="Edit entri ini">
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                    </div>
                  </div>
                  <ul v-if="exp.points.length" class="cv2-entry-points">
                    <li v-for="(pt, i) in exp.points" :key="i">{{ pt }}</li>
                  </ul>
                </div>
              </div>
              <span v-else class="cv2-empty" @click="openAtsEditSection('experience')">+ Klik untuk mengisi pengalaman kerja</span>
            </div>

            <!-- ── PROJECTS ── -->
            <div v-if="skey === 'projects'" class="cv2-section"
              :class="{ 'cv2-section-drag-over': dragOverIdx === si }"
              draggable="true"
              @dragstart="onSectionDragStart(si, $event)"
              @dragover.prevent="onSectionDragOver(si, $event)"
              @dragleave="onSectionDragLeave"
              @drop.prevent="onSectionDrop(si)"
              @dragend="onSectionDragEnd">
              <div class="cv2-section-head">
                <div class="cv2-section-head-left">
                  <span class="cv2-drag-handle" title="Geser untuk pindah urutan">
                    <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor"><circle cx="7" cy="5" r="1.5"/><circle cx="13" cy="5" r="1.5"/><circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/><circle cx="7" cy="15" r="1.5"/><circle cx="13" cy="15" r="1.5"/></svg>
                  </span>
                  <p class="cv2-section-title">Projects</p>
                </div>
                <div class="cv2-section-actions">
                  <button class="cv2-sec-btn" @click.stop="openAtsEditSection('projects')">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button class="cv2-sec-btn danger" @click.stop="deleteBuiltinSection('projects')" title="Hapus section">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    Hapus
                  </button>
                </div>
              </div>
              <div v-if="atsCV.projects">
                <div v-for="(proj, idx) in parsedProjects" :key="idx" class="cv2-entry">
                  <div class="cv2-entry-head">
                    <span class="cv2-entry-role">{{ proj.name }}</span>
                    <span v-if="proj.period" class="cv2-entry-period">{{ proj.period }}</span>
                  </div>
                  <p v-if="proj.desc" class="cv2-entry-desc">{{ proj.desc }}</p>
                  <ul v-if="proj.points.length" class="cv2-entry-points">
                    <li v-for="(pt, i) in proj.points" :key="i">{{ pt }}</li>
                  </ul>
                </div>
              </div>
              <span v-else class="cv2-empty" @click="openAtsEditSection('projects')">+ Klik untuk mengisi projects</span>
            </div>

            <!-- ── SKILLS ── -->
            <div v-if="skey === 'skills'" class="cv2-section"
              :class="{ 'cv2-section-drag-over': dragOverIdx === si }"
              draggable="true"
              @dragstart="onSectionDragStart(si, $event)"
              @dragover.prevent="onSectionDragOver(si, $event)"
              @dragleave="onSectionDragLeave"
              @drop.prevent="onSectionDrop(si)"
              @dragend="onSectionDragEnd">
              <div class="cv2-section-head">
                <div class="cv2-section-head-left">
                  <span class="cv2-drag-handle" title="Geser untuk pindah urutan">
                    <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor"><circle cx="7" cy="5" r="1.5"/><circle cx="13" cy="5" r="1.5"/><circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/><circle cx="7" cy="15" r="1.5"/><circle cx="13" cy="15" r="1.5"/></svg>
                  </span>
                  <p class="cv2-section-title">Skills</p>
                </div>
                <div class="cv2-section-actions">
                  <button class="cv2-sec-btn" @click.stop="openAtsEditSection('skills')">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button class="cv2-sec-btn danger" @click.stop="deleteBuiltinSection('skills')" title="Hapus section">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    Hapus
                  </button>
                </div>
              </div>
              <div v-if="atsCV.skills" class="cv2-skills-grid">
                <span v-for="(sk, i) in parsedSkills" :key="i" class="cv2-skill-item">{{ sk }}</span>
              </div>
              <span v-else class="cv2-empty" @click="openAtsEditSection('skills')">+ Klik untuk mengisi keahlian</span>
            </div>

            <!-- ── EDUCATION ── -->
            <div v-if="skey === 'education'" class="cv2-section"
              :class="{ 'cv2-section-drag-over': dragOverIdx === si }"
              draggable="true"
              @dragstart="onSectionDragStart(si, $event)"
              @dragover.prevent="onSectionDragOver(si, $event)"
              @dragleave="onSectionDragLeave"
              @drop.prevent="onSectionDrop(si)"
              @dragend="onSectionDragEnd">
              <div class="cv2-section-head">
                <div class="cv2-section-head-left">
                  <span class="cv2-drag-handle" title="Geser untuk pindah urutan">
                    <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor"><circle cx="7" cy="5" r="1.5"/><circle cx="13" cy="5" r="1.5"/><circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/><circle cx="7" cy="15" r="1.5"/><circle cx="13" cy="15" r="1.5"/></svg>
                  </span>
                  <p class="cv2-section-title">Education</p>
                </div>
                <div class="cv2-section-actions">
                  <button class="cv2-sec-btn" @click.stop="openAtsEditSection('education')">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button class="cv2-sec-btn danger" @click.stop="deleteBuiltinSection('education')" title="Hapus section">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    Hapus
                  </button>
                </div>
              </div>
              <div v-if="atsCV.education">
                <div v-for="(edu, idx) in parsedEducation" :key="idx" class="cv2-edu-entry">
                  <div class="cv2-entry-head">
                    <span class="cv2-entry-role">{{ edu.degree }}</span>
                    <span v-if="edu.period" class="cv2-entry-period">{{ edu.period }}</span>
                  </div>
                  <p class="cv2-entry-company">{{ edu.school }}</p>
                  <p v-if="edu.detail" class="cv2-edu-detail">{{ edu.detail }}</p>
                </div>
              </div>
              <span v-else class="cv2-empty" @click="openAtsEditSection('education')">+ Klik untuk mengisi pendidikan</span>
            </div>

            <!-- ── ADDITIONAL INFORMATION ── -->
            <div v-if="skey === 'additional'" class="cv2-section"
              :class="{ 'cv2-section-drag-over': dragOverIdx === si }"
              draggable="true"
              @dragstart="onSectionDragStart(si, $event)"
              @dragover.prevent="onSectionDragOver(si, $event)"
              @dragleave="onSectionDragLeave"
              @drop.prevent="onSectionDrop(si)"
              @dragend="onSectionDragEnd">
              <div class="cv2-section-head">
                <div class="cv2-section-head-left">
                  <span class="cv2-drag-handle" title="Geser untuk pindah urutan">
                    <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor"><circle cx="7" cy="5" r="1.5"/><circle cx="13" cy="5" r="1.5"/><circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/><circle cx="7" cy="15" r="1.5"/><circle cx="13" cy="15" r="1.5"/></svg>
                  </span>
                  <p class="cv2-section-title">Additional Information</p>
                </div>
                <div class="cv2-section-actions">
                  <button class="cv2-sec-btn" @click.stop="openAtsEditSection('languages')">Edit Bahasa</button>
                  <button class="cv2-sec-btn" @click.stop="openAtsEditSection('certifications')">Edit Sertifikasi</button>
                  <button class="cv2-sec-btn danger" @click.stop="deleteBuiltinSection('additional')" title="Hapus section">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    Hapus
                  </button>
                </div>
              </div>
              <div v-if="atsCV.languages">
                <p style="font-size:12.5px; font-weight:700; color:#1a1a1a; margin:0 0 2px;">Languages:</p>
                <p style="font-size:12.5px; color:#333; margin:0 0 8px;">{{ parsedLanguages.map(function(l){ return l.name + (l.level ? ' ('+l.level+')' : ''); }).join(', ') }}</p>
              </div>
              <div v-if="atsCV.certifications">
                <p style="font-size:12.5px; font-weight:700; color:#1a1a1a; margin:0 0 2px;">Certifications:</p>
                <p v-for="(cert, i) in parsedCertifications" :key="i" class="cv2-cert-item">{{ cert }}</p>
              </div>
              <span v-if="!atsCV.languages && !atsCV.certifications" class="cv2-empty" @click="openAtsEditSection('languages')">+ Klik untuk mengisi informasi tambahan</span>
            </div>

            <!-- ── ORGANIZATION ── -->
            <div v-if="skey === 'organization'" class="cv2-section"
              :class="{ 'cv2-section-drag-over': dragOverIdx === si }"
              draggable="true"
              @dragstart="onSectionDragStart(si, $event)"
              @dragover.prevent="onSectionDragOver(si, $event)"
              @dragleave="onSectionDragLeave"
              @drop.prevent="onSectionDrop(si)"
              @dragend="onSectionDragEnd">
              <div class="cv2-section-head">
                <div class="cv2-section-head-left">
                  <span class="cv2-drag-handle" title="Geser untuk pindah urutan">
                    <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor"><circle cx="7" cy="5" r="1.5"/><circle cx="13" cy="5" r="1.5"/><circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/><circle cx="7" cy="15" r="1.5"/><circle cx="13" cy="15" r="1.5"/></svg>
                  </span>
                  <p class="cv2-section-title">Organization & Activities</p>
                </div>
                <div class="cv2-section-actions">
                  <button class="cv2-sec-btn" @click.stop="openAtsEditSection('organization')">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button class="cv2-sec-btn danger" @click.stop="deleteBuiltinSection('organization')" title="Hapus section">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    Hapus
                  </button>
                </div>
              </div>
              <div v-if="atsCV.organization">
                <div v-for="(org, idx) in parsedOrganization" :key="idx" class="cv2-entry">
                  <div class="cv2-entry-head">
                    <span class="cv2-entry-role">{{ org.role }}<span v-if="org.org"> · {{ org.org }}</span></span>
                    <span v-if="org.period" class="cv2-entry-period">{{ org.period }}</span>
                  </div>
                  <ul v-if="org.points.length" class="cv2-entry-points">
                    <li v-for="(pt, i) in org.points" :key="i">{{ pt }}</li>
                  </ul>
                </div>
              </div>
              <span v-else class="cv2-empty" @click="openAtsEditSection('organization')">+ Klik untuk mengisi organisasi & aktivitas</span>
            </div>

            <!-- ── CUSTOM SECTIONS ── -->
            <div v-if="skey.startsWith('custom:') && getCustomSection(skey)"
              class="cv2-section"
              :class="{ 'cv2-section-drag-over': dragOverIdx === si }"
              draggable="true"
              @dragstart="onSectionDragStart(si, $event)"
              @dragover.prevent="onSectionDragOver(si, $event)"
              @dragleave="onSectionDragLeave"
              @drop.prevent="onSectionDrop(si)"
              @dragend="onSectionDragEnd">
              <div class="cv2-section-head">
                <div class="cv2-section-head-left">
                  <span class="cv2-drag-handle" title="Geser untuk pindah urutan">
                    <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor"><circle cx="7" cy="5" r="1.5"/><circle cx="13" cy="5" r="1.5"/><circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/><circle cx="7" cy="15" r="1.5"/><circle cx="13" cy="15" r="1.5"/></svg>
                  </span>
                  <p class="cv2-section-title">{{ getCustomSection(skey).sec.title }}</p>
                </div>
                <div class="cv2-section-actions">
                  <button class="cv2-sec-btn" @click.stop="cv2EditCustomSection(getCustomSection(skey).idx)">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button class="cv2-sec-btn danger" @click.stop="cv2DeleteCustomSection(getCustomSection(skey).idx)">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    Hapus
                  </button>
                </div>
              </div>
              <div v-if="getCustomSection(skey).sec.content" style="white-space:pre-wrap; font-size:12.5px; color:#333; line-height:1.7;">{{ getCustomSection(skey).sec.content }}</div>
              <span v-else class="cv2-empty" @click="cv2EditCustomSection(getCustomSection(skey).idx)">+ Klik untuk mengisi section ini</span>
            </div>

          </template>

          <!-- Tombol tambah section -->
          <button class="cv2-add-section-btn" @click="cv2AddSection">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Section Baru
          </button>

        </div><!-- /cv2-body -->
      </div><!-- /cv2-page -->

      <!-- MODAL: Tambah / Edit Custom Section -->
      <transition name="cf-fade">
        <div v-if="cv2ShowCustomModal" class="cv2-modal-overlay" @click.self="cv2ShowCustomModal=false">
          <div class="cv2-modal">
            <div class="cv2-modal-head">
              <h3 class="cv2-modal-title">{{ cv2EditingCustomIdx !== null ? 'Edit Section' : 'Tambah Section Baru' }}</h3>
              <button class="cv2-modal-close" @click="cv2ShowCustomModal=false">✕</button>
            </div>
            <div class="cv2-modal-body">
              <div>
                <label class="cv2-field-label">Nama Section *</label>
                <input class="cv2-input" v-model="cv2CustomForm.title" placeholder="mis. Volunteer, Achievements, Publications..." />
              </div>
              <div>
                <label class="cv2-field-label">Isi Section</label>
                <textarea class="cv2-textarea" v-model="cv2CustomForm.content" rows="7"
                  placeholder="Tulis isi section di sini...&#10;&#10;Format bebas, atau pakai format entri:&#10;Jabatan / Nama | Organisasi | Periode&#10;- Poin 1&#10;- Poin 2"></textarea>
                <p class="cv2-hint">Format bebas. Gunakan baris baru untuk tiap poin.</p>
              </div>
            </div>
            <div class="cv2-modal-foot">
              <button class="cf-btn-ghost" @click="cv2ShowCustomModal=false">Batal</button>
              <button class="cf-btn-primary" @click="cv2SaveCustomSection">Simpan Section</button>
            </div>
          </div>
        </div>
      </transition>

    </div>
    </transition>

    <!-- ══ TAB: COVER LETTER ══ -->
    <transition name="cf-fade">
    <div v-if="activeTab === 'cover_letter'" key="cover_letter">
      <div class="cf-section-bar">
        <span class="cf-section-label">Cover Letter · {{ docsByType('cover_letter').length }} dokumen</span>
        <button class="cf-btn-primary" @click="openAddDocOfType('cover_letter')">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah
        </button>
      </div>
      <div class="cf-tip">
        <p class="cf-tip-title">Struktur Cover Letter</p>
        <p class="cf-tip-text">Opening hook → kenapa kamu tertarik → apa yang kamu bawa → closing CTA. Jaga di bawah 300 kata, personal, dan spesifik ke perusahaan.</p>
      </div>
      <div v-if="docsByType('cover_letter').length === 0" class="cf-empty">
        <p class="cf-empty-label">Belum ada Cover Letter</p>
        <p class="cf-empty-sub">Buat cover letter impresif untuk tiap lamaran.</p>
      </div>
      <div v-else class="cf-doc-list">
        <div v-for="doc in docsByType('cover_letter')" :key="doc.id" class="cf-doc-row">
          <span class="cf-doc-type-dot" style="background:#D67B52;"></span>
          <div class="cf-doc-info">
            <p class="cf-doc-title">{{ doc.title }}</p>
            <div class="cf-doc-meta">
              <span v-if="doc.target" style="font-size:11.5px;color:var(--text-muted,#6E6359);">{{ doc.target }}</span>
              <span v-if="doc.updatedAt" style="font-size:11px;color:#C8BDB5;font-family:'Hack',monospace;">{{ formatLastUpdated(doc.updatedAt) }}</span>
            </div>
          </div>
          <div class="cf-doc-actions">
            <button class="cf-doc-action-btn" @click="viewDoc(doc)">Lihat</button>
            <button class="cf-doc-action-btn" @click="editDoc(doc)">Edit</button>
            <button class="cf-doc-action-btn del" @click="deleteDoc(doc.id)">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
          <button class="cf-doc-apply-btn" @click="viewDoc(doc)">
            Buka
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </button>
        </div>
      </div>
    </div>
    </transition>

    <!-- ══ TAB: SURAT LAMARAN ══ -->
    <transition name="cf-fade">
    <div v-if="activeTab === 'surat_lamaran'" key="surat_lamaran">
      <div class="cf-section-bar">
        <span class="cf-section-label">Surat Lamaran · {{ docsByType('surat_lamaran').length }} dokumen</span>
        <button class="cf-btn-primary" @click="openAddDocOfType('surat_lamaran')">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah
        </button>
      </div>
      <div class="cf-tip">
        <p class="cf-tip-title">Surat Lamaran Formal</p>
        <p class="cf-tip-text">Sertakan: tanggal, nama HRD, perkenalan diri, posisi yang dilamar, pengalaman relevan, dan penutup sopan. Gunakan bahasa baku.</p>
      </div>
      <div v-if="docsByType('surat_lamaran').length === 0" class="cf-empty">
        <p class="cf-empty-label">Belum ada Surat Lamaran</p>
        <p class="cf-empty-sub">Buat surat lamaran formal untuk tiap perusahaan.</p>
      </div>
      <div v-else class="cf-doc-list">
        <div v-for="doc in docsByType('surat_lamaran')" :key="doc.id" class="cf-doc-row">
          <span class="cf-doc-type-dot" style="background:#059669;"></span>
          <div class="cf-doc-info">
            <p class="cf-doc-title">{{ doc.title }}</p>
            <div class="cf-doc-meta">
              <span v-if="doc.target" style="font-size:11.5px;color:var(--text-muted,#6E6359);">{{ doc.target }}</span>
              <span v-if="doc.updatedAt" style="font-size:11px;color:#C8BDB5;font-family:'Hack',monospace;">{{ formatLastUpdated(doc.updatedAt) }}</span>
            </div>
          </div>
          <div class="cf-doc-actions">
            <button class="cf-doc-action-btn" @click="viewDoc(doc)">Lihat</button>
            <button class="cf-doc-action-btn" @click="editDoc(doc)">Edit</button>
            <button class="cf-doc-action-btn del" @click="deleteDoc(doc.id)">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
          <button class="cf-doc-apply-btn" @click="viewDoc(doc)">
            Buka
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </button>
        </div>
      </div>
    </div>
    </transition>

    <!-- ══ TAB: BODY EMAIL ══ -->
    <transition name="cf-fade">
    <div v-if="activeTab === 'body_email'" key="body_email">
      <div class="cf-section-bar">
        <span class="cf-section-label">Body Email · {{ docsByType('body_email').length }} dokumen</span>
        <button class="cf-btn-primary" @click="openAddDocOfType('body_email')">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah
        </button>
      </div>
      <div class="cf-tip">
        <p class="cf-tip-title">Formula Email yang Dilirik HRD</p>
        <p class="cf-tip-text">Subject jelas (Nama | Posisi), salam profesional, 2–3 paragraf padat: perkenalan → nilai tambah → lampiran, lalu tutup dengan salam.</p>
      </div>
      <div v-if="docsByType('body_email').length === 0" class="cf-empty">
        <p class="cf-empty-label">Belum ada Body Email</p>
        <p class="cf-empty-sub">Simpan template email lamaranmu di sini.</p>
      </div>
      <div v-else class="cf-doc-list">
        <div v-for="doc in docsByType('body_email')" :key="doc.id" class="cf-doc-row">
          <span class="cf-doc-type-dot" style="background:#0369A1;"></span>
          <div class="cf-doc-info">
            <p class="cf-doc-title">{{ doc.title }}</p>
            <div class="cf-doc-meta">
              <span v-if="doc.target" style="font-size:11.5px;color:var(--text-muted,#6E6359);">{{ doc.target }}</span>
              <span v-if="doc.updatedAt" style="font-size:11px;color:#C8BDB5;font-family:'Hack',monospace;">{{ formatLastUpdated(doc.updatedAt) }}</span>
            </div>
          </div>
          <div class="cf-doc-actions">
            <button class="cf-doc-action-btn" @click="viewDoc(doc)">Lihat</button>
            <button class="cf-doc-action-btn" @click="editDoc(doc)">Edit</button>
            <button class="cf-doc-action-btn del" @click="deleteDoc(doc.id)">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
          <button class="cf-doc-apply-btn" @click="viewDoc(doc)">
            Buka
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </button>
        </div>
      </div>
    </div>
    </transition>

    <!-- ══ TAB: SEMUA DOKUMEN ══ -->
    <transition name="cf-fade">
    <div v-if="activeTab === 'all'" key="all">
      <div class="cf-section-bar">
        <span class="cf-section-label">Semua Dokumen · {{ docs.length }}</span>
        <button class="cf-btn-primary" @click="openAddDoc">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Dokumen
        </button>
      </div>
      <div v-if="docs.length === 0" class="cf-empty">
        <p class="cf-empty-label">Belum ada dokumen</p>
        <p class="cf-empty-sub">Tambahkan dokumen karir pertamamu.</p>
      </div>
      <div v-else class="cf-doc-list">
        <div v-for="doc in docs" :key="doc.id" class="cf-doc-row">
          <span class="cf-doc-type-dot" :style="{ background: docTypeColor(doc.type) }"></span>
          <div class="cf-doc-info">
            <p class="cf-doc-title">{{ doc.title }}</p>
            <div class="cf-doc-meta">
              <span class="cf-doc-type-badge" :style="{ background: docTypeColor(doc.type) + '18', color: docTypeColor(doc.type) }">{{ docTypeLabel(doc.type) }}</span>
              <span v-if="doc.target" style="font-size:11.5px;color:var(--text-muted,#6E6359);">{{ doc.target }}</span>
              <span v-if="doc.updatedAt" style="font-size:11px;color:#C8BDB5;font-family:'Hack',monospace;">{{ formatLastUpdated(doc.updatedAt) }}</span>
            </div>
          </div>
          <div class="cf-doc-actions">
            <button class="cf-doc-action-btn" @click="viewDoc(doc)">Lihat</button>
            <button class="cf-doc-action-btn" @click="editDoc(doc)">Edit</button>
            <button class="cf-doc-action-btn del" @click="deleteDoc(doc.id)">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
          <button class="cf-doc-apply-btn" @click="viewDoc(doc)">
            Buka
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </button>
        </div>
      </div>
    </div>
    </transition>

      </div>
      <!-- /cf-tabs-content -->
    </div>
    <!-- /cf-body-layout -->

    <!-- ══ MODAL: Edit Resume ══ -->
    <transition name="cf-fade">
      <div v-if="showResumeModal" class="cf-modal-overlay" @click.self="showResumeModal=false">
        <div class="cf-modal cf-modal-wide">
          <div class="cf-modal-header">
            <h3 class="cf-modal-title">Edit Profil & Resume</h3>
            <button class="cf-modal-close" @click="showResumeModal=false">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="cf-modal-body">
            <div class="cf-input-grid-2">
              <div>
                <label class="cf-field-label">Nama Lengkap *</label>
                <input class="cf-input" v-model="resumeForm.name" placeholder="Nadya Rahma Putri"/>
              </div>
              <div>
                <label class="cf-field-label">Posisi / Bidang</label>
                <input class="cf-input" v-model="resumeForm.title" placeholder="Social Media Specialist"/>
              </div>
              <div>
                <label class="cf-field-label">Email</label>
                <input class="cf-input" v-model="resumeForm.email" placeholder="nadya@email.com"/>
              </div>
              <div>
                <label class="cf-field-label">No. HP</label>
                <input class="cf-input" v-model="resumeForm.phone" placeholder="08xx-xxxx-xxxx"/>
              </div>
              <div>
                <label class="cf-field-label">Lokasi</label>
                <input class="cf-input" v-model="resumeForm.location" placeholder="Bandung, Jawa Barat"/>
              </div>
              <div>
                <label class="cf-field-label">LinkedIn / Portofolio</label>
                <input class="cf-input" v-model="resumeForm.linkedin" placeholder="linkedin.com/in/nadya"/>
              </div>
            </div>
            <div>
              <label class="cf-field-label">Tentang Saya / Summary</label>
              <textarea class="cf-textarea" v-model="resumeForm.summary" rows="4" placeholder="Perkenalan singkat tentang diri kamu..."></textarea>
            </div>
            <div class="cf-input-grid-2">
              <div>
                <label class="cf-field-label">Keahlian (satu baris = satu skill)</label>
                <textarea class="cf-textarea" v-model="resumeForm.skills" rows="4" placeholder="Copywriting&#10;Social Media Management&#10;Canva & Adobe Suite"></textarea>
              </div>
              <div>
                <label class="cf-field-label">Pengalaman Kerja</label>
                <textarea class="cf-textarea" v-model="resumeForm.experience" rows="4" placeholder="2023–kini · Content Creator @ Brand X&#10;2022–2023 · Admin Sosmed @ Startup Y"></textarea>
              </div>
              <div>
                <label class="cf-field-label">Pendidikan</label>
                <textarea class="cf-textarea" v-model="resumeForm.education" rows="3" placeholder="S1 Ilmu Komunikasi · Univ. X · 2020–2024"></textarea>
              </div>
              <div>
                <label class="cf-field-label">Bahasa</label>
                <textarea class="cf-textarea" v-model="resumeForm.languages" rows="3" placeholder="Indonesia (Native)&#10;Inggris (Aktif)"></textarea>
              </div>
            </div>
          </div>
          <div class="cf-modal-footer">
            <button class="cf-btn-ghost" @click="showResumeModal=false">Batal</button>
            <button class="cf-btn-primary" @click="saveResume">Simpan Profil</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══ MODAL: Tambah / Edit Dokumen ══ -->
    <transition name="cf-fade">
      <div v-if="showDocModal" class="cf-modal-overlay" @click.self="showDocModal=false">
        <div class="cf-modal">
          <div class="cf-modal-header">
            <h3 class="cf-modal-title">{{ editingDocId ? 'Edit Dokumen' : 'Tambah Dokumen' }}</h3>
            <button class="cf-modal-close" @click="showDocModal=false">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="cf-modal-body">
            <div>
              <label class="cf-field-label">Jenis Dokumen *</label>
              <div class="cf-type-pills">
                <button v-for="t in docTypes" :key="t.key"
                  class="cf-type-pill"
                  :class="{ active: docForm.type === t.key }"
                  @click="docForm.type = t.key">
                  {{ t.label }}
                </button>
              </div>
            </div>
            <div>
              <label class="cf-field-label">Judul Dokumen *</label>
              <input class="cf-input" v-model="docForm.title" placeholder="mis. CV Umum — Fresh Graduate 2025"/>
            </div>
            <div>
              <label class="cf-field-label">Target Perusahaan / Posisi</label>
              <input class="cf-input" v-model="docForm.target" placeholder="mis. Posisi Content Creator di Shopee"/>
            </div>
            <div>
              <label class="cf-field-label">Isi Dokumen</label>
              <textarea class="cf-textarea" v-model="docForm.content" :placeholder="docContentPlaceholder" rows="10"></textarea>
            </div>
          </div>
          <div class="cf-modal-footer">
            <button class="cf-btn-ghost" @click="showDocModal=false">Batal</button>
            <button class="cf-btn-primary" @click="saveDoc">Simpan</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══ MODAL: Lihat Dokumen ══ -->
    <transition name="cf-fade">
      <div v-if="showViewModal && viewingDoc" class="cf-modal-overlay" @click.self="showViewModal=false">
        <div class="cf-modal cf-modal-wide">
          <div class="cf-modal-header">
            <div>
              <h3 class="cf-modal-title">{{ viewingDoc.title }}</h3>
              <p v-if="viewingDoc.target" style="font-size:11.5px; color:#AAA; margin:3px 0 0;">{{ viewingDoc.target }}</p>
            </div>
            <button class="cf-modal-close" @click="showViewModal=false">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="cf-modal-body">
            <template v-if="viewingDoc.type === 'body_email'">
              <div class="cf-email-view">
                <div class="cf-email-toolbar">
                  <span class="cf-email-toolbar-tag">📧 Body Email</span>
                  <span v-if="viewingDoc.updatedAt" class="cf-email-toolbar-date">{{ formatLastUpdated(viewingDoc.updatedAt) }}</span>
                </div>
                <div class="cf-email-card">
                  <div class="cf-email-subject-bar">
                    <h4 class="cf-email-subject">{{ emailParts.subject || '(Tanpa subjek)' }}</h4>
                  </div>
                  <div class="cf-email-meta">
                    <div class="cf-email-avatar">{{ (resume.name || 'K').charAt(0).toUpperCase() }}</div>
                    <div class="cf-email-meta-text">
                      <p class="cf-email-from">
                        <span class="cf-email-from-name">{{ resume.name || 'Nama Kamu' }}</span>
                        <span class="cf-email-from-addr">&lt;{{ resume.email || 'email@kamu.com' }}&gt;</span>
                      </p>
                      <p class="cf-email-to">kepada <span class="cf-email-to-target">{{ viewingDoc.target || 'HRD Perusahaan' }}</span></p>
                    </div>
                  </div>
                  <div class="cf-email-divider"></div>
                  <p class="cf-email-body-text">{{ emailParts.body || '(Belum ada isi)' }}</p>
                </div>
              </div>
            </template>
            <template v-else>
              <p class="cf-view-content">{{ viewingDoc.content || '(Belum ada isi)' }}</p>
            </template>
          </div>
          <div class="cf-modal-footer">
            <button class="cf-btn-ghost" @click="copyDocContent(viewingDoc)">{{ copySuccess ? 'Tersalin!' : 'Salin teks' }}</button>
            <button class="cf-btn-primary" @click="editDoc(viewingDoc); showViewModal=false">Edit</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══ MODAL: Edit Experience Entry ══ -->
    <transition name="cf-fade">
      <div v-if="showExpEntryModal" class="cf-modal-overlay" @click.self="showExpEntryModal=false">
        <div class="cf-modal">
          <div class="cf-modal-header">
            <h3 class="cf-modal-title">Edit Pengalaman Kerja</h3>
            <button class="cf-modal-close" @click="showExpEntryModal=false">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="cf-modal-body">
            <div class="cf-input-grid-2">
              <div style="grid-column:1/-1"><label class="cf-field-label">Jabatan</label><input class="cf-input" v-model="atsExpEntryForm.role" placeholder="Content Creator"/></div>
              <div><label class="cf-field-label">Perusahaan / Instansi</label><input class="cf-input" v-model="atsExpEntryForm.company" placeholder="Brand X"/></div>
              <div><label class="cf-field-label">Periode</label><input class="cf-input" v-model="atsExpEntryForm.period" placeholder="Jan 2023 – kini"/></div>
            </div>
            <p style="font-size:11px; color:#AAA; margin:12px 0 0; line-height:1.6;">Poin pencapaian untuk pengalaman ini dikelola di halaman <strong>My Portfolio</strong> — task yang berstatus <strong>Fix</strong> akan otomatis tampil sebagai poin pencapaian di CV ini.</p>
          </div>
          <div class="cf-modal-footer">
            <button class="cf-btn-danger" @click="deleteAtsExperienceEntry(atsEditingExpIdx)" style="margin-right:auto">Hapus</button>
            <button class="cf-btn-ghost" @click="showExpEntryModal=false">Batal</button>
            <button class="cf-btn-primary" @click="saveAtsExperienceEntry">Simpan</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══ MODAL: Edit ATS CV Section ══ -->
    <transition name="cf-fade">
      <div v-if="showAtsCVModal" class="cf-modal-overlay" @click.self="showAtsCVModal=false">
        <div class="cf-modal">
          <div class="cf-modal-header">
            <h3 class="cf-modal-title">{{ atsSectionLabel }}</h3>
            <button class="cf-modal-close" @click="showAtsCVModal=false">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="cf-modal-body">
            <p v-if="atsSectionHint" style="font-size:11.5px; color:#AAA; margin:0; line-height:1.6;">{{ atsSectionHint }}</p>
            <template v-if="atsEditingSection === 'header'">
              <div class="cf-input-grid-2">
                <div><label class="cf-field-label">Nama Lengkap</label><input class="cf-input" v-model="atsCVForm.name" placeholder="Nadya Rahma Putri"/></div>
                <div><label class="cf-field-label">Posisi / Bidang</label><input class="cf-input" v-model="atsCVForm.title" placeholder="Social Media Specialist"/></div>
                <div><label class="cf-field-label">Email</label><input class="cf-input" v-model="atsCVForm.email" placeholder="nadya@email.com"/></div>
                <div><label class="cf-field-label">No. HP</label><input class="cf-input" v-model="atsCVForm.phone" placeholder="08xx-xxxx-xxxx"/></div>
                <div><label class="cf-field-label">Lokasi</label><input class="cf-input" v-model="atsCVForm.location" placeholder="Bandung, Jawa Barat"/></div>
                <div><label class="cf-field-label">LinkedIn</label><input class="cf-input" v-model="atsCVForm.linkedin" placeholder="linkedin.com/in/nadya"/></div>
                <div class="cf-input-grid-2" style="grid-column:1/-1;"><div><label class="cf-field-label">Portofolio</label><input class="cf-input" v-model="atsCVForm.portfolio" placeholder="nadya.design"/></div></div>
              </div>
            </template>
            <template v-if="atsEditingSection === 'summary'">
              <textarea class="cf-textarea" v-model="atsCVForm.summary" rows="6" placeholder="2-4 kalimat yang merangkum profil karir kamu..."></textarea>
            </template>
            <template v-if="atsEditingSection === 'experience'">
              <!-- List entri yang sudah ada -->
              <div v-if="atsCV.experienceEntries && atsCV.experienceEntries.length" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;">
                <div v-for="entry in atsCV.experienceEntries" :key="entry.id"
                     style="border:1.5px solid var(--color-sand,#EAE5DD); border-radius:10px; padding:12px 14px; background:#FDFCFA; position:relative;">
                  <!-- Mode tampil -->
                  <template v-if="expCardEditingId !== entry.id">
                    <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px;">
                      <div style="flex:1; min-width:0;">
                        <div style="font-weight:600; font-size:13px; color:#2C2C2C; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ entry.role }}</div>
                        <div style="font-size:12px; color:#777; margin-top:2px;">
                          <span v-if="entry.company">{{ entry.company }}</span>
                          <span v-if="entry.company && entry.period" style="margin:0 5px; color:#CCC;">·</span>
                          <span v-if="entry.period" style="font-style:italic;">{{ entry.period }}</span>
                        </div>
                        <div style="font-size:10.5px; color:#B0A898; margin-top:4px; font-family:monospace; letter-spacing:0.01em;">ID: {{ entry.id }}</div>
                      </div>
                      <div style="display:flex; gap:4px; flex-shrink:0;">
                        <button @click="expCardStartEdit(entry.id)"
                                style="padding:4px 10px; font-size:11.5px; border:1px solid #DDD; border-radius:6px; background:#FFF; color:#555; cursor:pointer;">Edit</button>
                        <button @click="expCardDelete(entry.id)"
                                style="padding:4px 8px; font-size:11.5px; border:1px solid #F5C6C6; border-radius:6px; background:#FFF8F8; color:#D9534F; cursor:pointer;">✕</button>
                      </div>
                    </div>
                  </template>
                  <!-- Mode edit inline -->
                  <template v-else>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                      <div>
                        <label style="font-size:11px; color:#999; display:block; margin-bottom:3px;">Jabatan *</label>
                        <input class="cf-input" v-model="expCardForm.role" placeholder="Content Creator" style="font-size:13px;"/>
                      </div>
                      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                        <div>
                          <label style="font-size:11px; color:#999; display:block; margin-bottom:3px;">Perusahaan</label>
                          <input class="cf-input" v-model="expCardForm.company" placeholder="Brand X" style="font-size:13px;"/>
                        </div>
                        <div>
                          <label style="font-size:11px; color:#999; display:block; margin-bottom:3px;">Periode</label>
                          <input class="cf-input" v-model="expCardForm.period" placeholder="2023 – kini" style="font-size:13px;"/>
                        </div>
                      </div>
                      <div style="display:flex; gap:6px; justify-content:flex-end; margin-top:2px;">
                        <button @click="expCardCancelEdit"
                                style="padding:5px 12px; font-size:12px; border:1px solid #DDD; border-radius:7px; background:#FFF; color:#777; cursor:pointer;">Batal</button>
                        <button @click="expCardSaveEdit"
                                style="padding:5px 14px; font-size:12px; border:none; border-radius:7px; background:var(--color-terracotta,#D4785A); color:#FFF; cursor:pointer; font-weight:600;">Simpan</button>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
              <div v-else style="text-align:center; padding:18px 0; color:#BBB; font-size:13px;">Belum ada pengalaman kerja. Tambahkan di bawah.</div>

              <!-- Form tambah entri baru -->
              <template v-if="expCardShowAdd">
                <div style="border:1.5px dashed var(--color-terracotta,#D4785A); border-radius:10px; padding:14px; background:#FFF9F7; display:flex; flex-direction:column; gap:8px;">
                  <div style="font-size:12px; font-weight:600; color:var(--color-terracotta,#D4785A); margin-bottom:2px;">Tambah Pengalaman Baru</div>
                  <div>
                    <label style="font-size:11px; color:#999; display:block; margin-bottom:3px;">Jabatan *</label>
                    <input class="cf-input" v-model="expCardForm.role" placeholder="Social Media Specialist" style="font-size:13px;" @keyup.enter="expCardSaveAdd"/>
                  </div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                    <div>
                      <label style="font-size:11px; color:#999; display:block; margin-bottom:3px;">Perusahaan</label>
                      <input class="cf-input" v-model="expCardForm.company" placeholder="Startup Y" style="font-size:13px;"/>
                    </div>
                    <div>
                      <label style="font-size:11px; color:#999; display:block; margin-bottom:3px;">Periode</label>
                      <input class="cf-input" v-model="expCardForm.period" placeholder="Jan 2022 – Des 2023" style="font-size:13px;"/>
                    </div>
                  </div>
                  <div style="display:flex; gap:6px; justify-content:flex-end; margin-top:4px;">
                    <button @click="expCardCancelAdd"
                            style="padding:5px 12px; font-size:12px; border:1px solid #DDD; border-radius:7px; background:#FFF; color:#777; cursor:pointer;">Batal</button>
                    <button @click="expCardSaveAdd"
                            style="padding:5px 14px; font-size:12px; border:none; border-radius:7px; background:var(--color-terracotta,#D4785A); color:#FFF; cursor:pointer; font-weight:600;">+ Tambah</button>
                  </div>
                </div>
              </template>
              <template v-else>
                <button @click="expCardStartAdd"
                        style="width:100%; padding:9px; border:1.5px dashed #CBCBCB; border-radius:9px; background:#FAFAFA; color:#888; font-size:12.5px; cursor:pointer; margin-top:2px;">
                  + Tambah Pengalaman Kerja
                </button>
              </template>
              <p style="font-size:11px; color:#AAA; margin:10px 0 0; line-height:1.6;">Tiap entri mendapat ID unik permanen. Poin pencapaian dikelola terpisah di halaman <strong>My Portfolio</strong>.</p>
            </template>
            <template v-if="atsEditingSection === 'education'">
              <textarea class="cf-textarea" v-model="atsCVForm.education" rows="6" placeholder="S1 Ilmu Komunikasi | Universitas Padjadjaran | 2020 - 2024 | IPK: 3.78&#10;&#10;SMA | SMAN 5 Bandung | 2017 - 2020"></textarea>
            </template>
            <template v-if="atsEditingSection === 'skills'">
              <textarea class="cf-textarea" v-model="atsCVForm.skills" rows="5" placeholder="Copywriting, Canva, Adobe Premiere, Microsoft Office, Google Analytics"></textarea>
            </template>
            <template v-if="atsEditingSection === 'organization'">
              <textarea class="cf-textarea" v-model="atsCVForm.organization" rows="8" placeholder="Ketua Divisi Kreatif | BEM Universitas | 2022 - 2023&#10;- Memimpin tim 8 orang untuk mengelola publikasi kampus"></textarea>
            </template>
            <template v-if="atsEditingSection === 'languages'">
              <textarea class="cf-textarea" v-model="atsCVForm.languages" rows="4" placeholder="Indonesia (Native)&#10;Inggris (Aktif — TOEFL 550)&#10;Mandarin (Pasif)"></textarea>
            </template>
            <template v-if="atsEditingSection === 'projects'">
              <textarea class="cf-textarea" v-model="atsCVForm.projects" rows="10" placeholder="Nama Project | Periode&#10;Deskripsi singkat project ini.&#10;- Poin pencapaian 1&#10;- Poin pencapaian 2&#10;&#10;Nama Project 2 | Periode&#10;- Poin pencapaian"></textarea>
            </template>
            <template v-if="atsEditingSection === 'certifications'">
              <textarea class="cf-textarea" v-model="atsCVForm.certifications" rows="5" placeholder="Google Digital Marketing Certificate · 2024&#10;Meta Blueprint Certified · 2023"></textarea>
            </template>
          </div>
          <div class="cf-modal-footer">
            <button class="cf-btn-ghost" @click="showAtsCVModal=false">Batal</button>
            <button v-if="atsEditingSection !== 'experience'" class="cf-btn-primary" @click="saveAtsCVSection">Simpan</button>
            <button v-else class="cf-btn-primary" @click="saveAtsCVSection">Selesai</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
  `,

  data() {
    return {
      activeTab: 'cv',
      tabs: [
        { key: 'cv',            label: 'CV ATS',           emoji: '📄', color: '#6366F1',                 shadowColor: 'rgba(99,102,241,0.3)' },
        { key: 'cover_letter',  label: 'Cover Letter',     emoji: '✉️',  color: '#D67B52',                 shadowColor: 'rgba(214,123,82,0.3)' },
        { key: 'surat_lamaran', label: 'Surat Lamaran',    emoji: '📝', color: '#059669',                 shadowColor: 'rgba(5,150,105,0.3)' },
        { key: 'body_email',    label: 'Body Email',       emoji: '📧', color: '#0369A1',                 shadowColor: 'rgba(3,105,161,0.3)' },
        { key: 'all',           label: 'Semua Dokumen',    emoji: '📂', color: 'var(--color-forest)',      shadowColor: 'rgba(40,54,24,0.3)' },
      ],

      // Resume
      resume: {
        name: '', title: '', email: '', phone: '', location: '', linkedin: '',
        summary: '', skills: '', experience: '', education: '', languages: ''
      },
      resumeForm: {
        name: '', title: '', email: '', phone: '', location: '', linkedin: '',
        summary: '', skills: '', experience: '', education: '', languages: ''
      },
      showResumeModal: false,

      // Docs
      docs: [],
      docForm: { type: 'cover_letter', title: '', target: '', content: '' },
      editingDocId: null,
      showDocModal: false,

      // View
      showViewModal: false,
      viewingDoc: null,
      copySuccess: false,

      // Meta
      lastUpdated: null,

      // Doc types catalog
      docTypes: [
        { key: 'cv',            label: 'CV ATS',          emoji: '📄', color: '#6366F1' },
        { key: 'cover_letter',  label: 'Cover Letter',    emoji: '✉️',  color: '#D67B52' },
        { key: 'surat_lamaran', label: 'Surat Lamaran',   emoji: '📝', color: '#059669' },
        { key: 'body_email',    label: 'Body Email',      emoji: '📧', color: '#0369A1' },
      ],

      // ATS CV Template
      atsCV: {
        name: '', title: '', email: '', phone: '', location: '', linkedin: '', portfolio: '',
        summary: '', experience: '', education: '', skills: '',
        organization: '', languages: '', certifications: '',
        projects: '',
        experienceEntries: [],   // Array of { id, role, company, period }
        customSections: [],
        lastUpdated: null,
      },
      atsCVForm: {
        name: '', title: '', email: '', phone: '', location: '', linkedin: '', portfolio: '',
        summary: '', experience: '', education: '', skills: '',
        organization: '', languages: '', certifications: '',
        projects: '',
      },
      showAtsCVModal: false,
      atsEditingSection: null,
      atsCopySuccess: false,

      // Experience per-entry editing (legacy modal)
      showExpEntryModal: false,
      atsEditingExpIdx: null,
      atsExpEntryForm: { role: '', company: '', period: '' },

      // New inline experience card editor state (inside showAtsCVModal for experience)
      expCardEditingId: null,      // id of card being edited inline, or null
      expCardForm: { role: '', company: '', period: '' },
      expCardShowAdd: false,       // show the "tambah entri baru" form

      // Task portfolio (My Portfolio) — { [expKey]: [{ id, title, status }] }
      // Dipakai untuk mengisi Poin Pencapaian di CV: hanya task berstatus 'fix' yang tampil.
      portfolioTasks: {},

      // Bank Kata Kunci — master list kata kunci yang bisa dipilih di tabel task My Portfolio.
      keywordBank: [],
      newKeywordInput: '',

      // CV v2 Custom Sections
      cv2ShowCustomModal: false,
      cv2EditingCustomIdx: null,
      cv2CustomForm: { title: '', content: '' },

      // Section order & drag state
      sectionOrder: ['summary','experience','projects','skills','education','additional','organization'],
      dragSrcIdx: null,
      dragOverIdx: null,
    };
  },

  computed: {
    docContentPlaceholder() {
      const map = {
        cv:            'Ringkasan poin-poin CV kamu — pengalaman, keahlian, pendidikan...',
        cover_letter:  'Dear Hiring Manager,\n\nSaya sangat tertarik dengan posisi ... di perusahaan Bapak/Ibu ...\n\n...',
        surat_lamaran: 'Kepada Yth.\nBapak/Ibu HRD ...\n\nDengan hormat,\nSaya yang bertanda tangan di bawah ini ...',
        body_email:    'Subjek: Lamaran Pekerjaan — [Posisi] | [Nama Kamu]\n\nYth. Bapak/Ibu HRD,\n\nSaya ...',
      };
      return map[this.docForm.type] || 'Tulis isi dokumen di sini...';
    },

    emailParts() {
      const doc = this.viewingDoc;
      if (!doc) return { subject: '', body: '' };
      const raw = doc.content || '';
      const lines = raw.split('\n');
      const firstLine = (lines[0] || '').trim();
      const m = firstLine.match(/^(subjek|subject)\s*:\s*(.*)$/i);
      if (m) {
        const restLines = lines.slice(1);
        while (restLines.length && restLines[0].trim() === '') restLines.shift();
        return { subject: m[2].trim() || doc.title, body: restLines.join('\n') };
      }
      return { subject: doc.title, body: raw };
    },

    atsSectionLabel() {
      const labels = {
        header: 'Identitas & Kontak',
        summary: 'Ringkasan Profesional',
        experience: 'Pengalaman Kerja',
        projects: 'Projects',
        education: 'Pendidikan',
        skills: 'Keahlian',
        organization: 'Organisasi & Aktivitas',
        languages: 'Kemampuan Bahasa',
        certifications: 'Sertifikasi & Penghargaan',
      };
      return labels[this.atsEditingSection] || 'Edit Bagian CV';
    },

    atsSectionHint() {
      const hints = {
        header: 'Isi data diri yang akan tampil di bagian atas CV',
        summary: '2-4 kalimat yang merangkum profil karir kamu',
        experience: 'Format: Jabatan | Perusahaan | Periode. Poin pencapaian dikelola di halaman My Portfolio.',
        projects: 'Format: Nama Project | Periode, lalu deskripsi atau poin dengan tanda -',
        education: 'Format: Gelar | Institusi | Periode | Detail (IPK, dll)',
        skills: 'Pisahkan setiap keahlian dengan tanda koma',
        organization: 'Format: Jabatan | Organisasi | Periode, lalu poin kegiatan',
        languages: 'Satu bahasa per baris, sertakan level kemampuan',
        certifications: 'Satu sertifikasi / penghargaan per baris',
      };
      return hints[this.atsEditingSection] || '';
    },

    parsedProjects() {
      if (!this.atsCV.projects) return [];
      const blocks = this.atsCV.projects.split(/\n\n+/);
      return blocks.map(block => {
        const lines = block.trim().split('\n');
        const header = lines[0] || '';
        const parts = header.split('|').map(s => s.trim());
        const rest = lines.slice(1).filter(l => l.trim());
        const points = rest.filter(l => /^[-•]/.test(l.trim())).map(l => l.replace(/^[-•]\s*/, '').trim());
        const desc = rest.filter(l => !/^[-•]/.test(l.trim())).join(' ');
        return { name: parts[0] || '', period: parts[1] || '', desc, points };
      }).filter(p => p.name);
    },

    parsedExperience() {
      // New format: array of { id, role, company, period }
      const entries = this.atsCV.experienceEntries;
      if (entries && entries.length) {
        return entries.map(entry => {
          const key = `${entry.role}|${entry.company}|${entry.period}`;
          const tasks = this.portfolioTasks[key] || [];
          const points = tasks.filter(t => t.status === 'fix').map(t => t.title);
          return { id: entry.id, role: entry.role, company: entry.company, period: entry.period, points, key };
        }).filter(e => e.role);
      }
      // Legacy fallback: parse from old plain-text string
      if (!this.atsCV.experience) return [];
      const blocks = this.atsCV.experience.split(/\n\n+/);
      return blocks.map((block, idx) => {
        const lines = block.trim().split('\n');
        const header = lines[0] || '';
        const parts = header.split('|').map(s => s.trim());
        const role = parts[0] || '';
        const company = parts[1] || '';
        const period = parts[2] || '';
        const key = `${role}|${company}|${period}`;
        const tasks = this.portfolioTasks[key] || [];
        const points = tasks.filter(t => t.status === 'fix').map(t => t.title);
        return { id: `legacy-${idx}`, role, company, period, points, key };
      }).filter(e => e.role);
    },

    parsedEducation() {
      if (!this.atsCV.education) return [];
      const blocks = this.atsCV.education.split(/\n\n+/);
      return blocks.map(block => {
        const parts = block.trim().split('|').map(s => s.trim());
        return { degree: parts[0] || '', school: parts[1] || '', period: parts[2] || '', detail: parts[3] || '' };
      }).filter(e => e.degree);
    },

    parsedSkills() {
      if (!this.atsCV.skills) return [];
      return this.atsCV.skills.split(',').map(s => s.trim()).filter(Boolean);
    },

    parsedOrganization() {
      if (!this.atsCV.organization) return [];
      const blocks = this.atsCV.organization.split(/\n\n+/);
      return blocks.map(block => {
        const lines = block.trim().split('\n');
        const parts = (lines[0] || '').split('|').map(s => s.trim());
        const points = lines.slice(1).filter(l => l.trim()).map(l => l.replace(/^[-•]\s*/, '').trim());
        return { role: parts[0] || '', org: parts[1] || '', period: parts[2] || '', points };
      }).filter(e => e.role);
    },

    parsedLanguages() {
      if (!this.atsCV.languages) return [];
      return this.atsCV.languages.split('\n').map(line => {
        const m = line.match(/^(.+?)\s*[\(（](.+?)[\)）]\s*$/);
        if (m) return { name: m[1].trim(), level: m[2].trim() };
        return { name: line.trim(), level: '' };
      }).filter(l => l.name);
    },

    parsedCertifications() {
      if (!this.atsCV.certifications) return [];
      return this.atsCV.certifications.split('\n').map(s => s.trim()).filter(Boolean);
    },
  },

  methods: {
    // ── My Portfolio button → buka halaman My Portfolio ──
    goToPortfolio() {
      globalThis.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'myPortfolio' }));
    },

    // ── Bank Kata Kunci (master list, dipakai untuk multiselect di tabel My Portfolio) ──
    addKeywordToBank() {
      const kw = this.newKeywordInput.trim();
      if (!kw) return;
      const exists = this.keywordBank.some(k => k.toLowerCase() === kw.toLowerCase());
      if (exists) { this.newKeywordInput = ''; return; }
      this.keywordBank = [...this.keywordBank, kw];
      this.newKeywordInput = '';
      this.saveKeywordBank();
    },
    removeKeywordFromBank(kw) {
      this.keywordBank = this.keywordBank.filter(k => k !== kw);
      this.saveKeywordBank();
    },
    saveKeywordBank() {
      try { WorkspaceStorage.setItem('career_keyword_bank', JSON.stringify(this.keywordBank)); } catch(_e) {}
    },

    // ── Resume ──
    editResume() {
      this.resumeForm = { ...this.resume };
      this.showResumeModal = true;
    },
    saveResume() {
      this.resume = { ...this.resumeForm };
      this.lastUpdated = new Date().toISOString();
      this.saveAll();
      this.showResumeModal = false;
    },

    // ── Docs ──
    docsByType(type) {
      return this.docs.filter(d => d.type === type);
    },
    openAddDoc() {
      this.editingDocId = null;
      this.docForm = { type: 'cover_letter', title: '', target: '', content: '' };
      this.showDocModal = true;
    },
    openAddDocOfType(type) {
      this.editingDocId = null;
      this.docForm = { type, title: '', target: '', content: '' };
      this.showDocModal = true;
    },
    editDoc(doc) {
      this.editingDocId = doc.id;
      this.docForm = { type: doc.type, title: doc.title, target: doc.target || '', content: doc.content || '' };
      this.showDocModal = true;
    },
    saveDoc() {
      if (!this.docForm.title.trim()) return;
      const now = new Date().toISOString();
      if (this.editingDocId) {
        const idx = this.docs.findIndex(d => d.id === this.editingDocId);
        if (idx !== -1) {
          this.docs[idx] = { ...this.docs[idx], ...this.docForm, updatedAt: now };
        }
      } else {
        this.docs.push({
          id: Date.now().toString(),
          ...this.docForm,
          updatedAt: now,
        });
      }
      this.lastUpdated = now;
      this.saveAll();
      this.showDocModal = false;
    },
    deleteDoc(id) {
      if (!confirm('Hapus dokumen ini?')) return;
      this.docs = this.docs.filter(d => d.id !== id);
      this.lastUpdated = new Date().toISOString();
      this.saveAll();
    },
    viewDoc(doc) {
      this.viewingDoc = doc;
      this.copySuccess = false;
      this.showViewModal = true;
    },
    copyDocContent(doc) {
      if (!doc.content) return;
      navigator.clipboard.writeText(doc.content).then(() => {
        this.copySuccess = true;
        setTimeout(() => { this.copySuccess = false; }, 2000);
      });
    },

    // ── Doc type helpers ──
    docTypeColor(type) {
      const t = this.docTypes.find(d => d.key === type);
      return t ? t.color : '#6E6359';
    },
    docTypeColorDark(type) {
      const map = {
        cv: '#4F46E5',
        cover_letter: '#C4673E',
        surat_lamaran: '#047857',
        body_email: '#0284C7',
      };
      return map[type] || '#555';
    },
    docTypeEmoji(type) {
      const t = this.docTypes.find(d => d.key === type);
      return t ? t.emoji : '📄';
    },
    docTypeLabel(type) {
      const t = this.docTypes.find(d => d.key === type);
      return t ? t.label : type;
    },

    // ── ATS CV ──
    openAtsEditSection(section) {
      this.atsEditingSection = section;
      // Copy current values into form
      this.atsCVForm = { ...this.atsCV };
      // Reset card editor state for experience section
      if (section === 'experience') {
        this.expCardEditingId = null;
        this.expCardForm = { role: '', company: '', period: '' };
        this.expCardShowAdd = false;
      }
      this.showAtsCVModal = true;
    },

    saveAtsCVSection() {
      const now = new Date().toISOString();
      if (this.atsEditingSection === 'header') {
        const { name, title, email, phone, location, linkedin, portfolio } = this.atsCVForm;
        Object.assign(this.atsCV, { name, title, email, phone, location, linkedin, portfolio });
      } else if (this.atsEditingSection === 'experience') {
        // experience is managed live via card methods — no extra copy needed here
      } else if (this.atsEditingSection) {
        this.atsCV[this.atsEditingSection] = this.atsCVForm[this.atsEditingSection];
      }
      // Ensure customSections array persists
      if (!this.atsCV.customSections) this.atsCV.customSections = [];
      this.atsCV.lastUpdated = now;
      this.saveAll();
      this.showAtsCVModal = false;
    },

    copyAtsCVText() {
      const cv = this.atsCV;
      let text = '';
      if (cv.name) text += cv.name + '\n';
      if (cv.title) text += cv.title + '\n';
      const contacts = [cv.email, cv.phone, cv.location, cv.linkedin, cv.portfolio].filter(Boolean);
      if (contacts.length) text += contacts.join(' | ') + '\n';
      text += '\n';
      if (cv.summary) text += 'SUMMARY\n' + cv.summary + '\n\n';
      if (this.parsedExperience.length) {
        text += 'PROFESSIONAL EXPERIENCE\n';
        this.parsedExperience.forEach(exp => {
          text += [exp.role, exp.company, exp.period].filter(Boolean).join(' | ') + '\n';
          exp.points.forEach(pt => { text += '- ' + pt + '\n'; });
        });
        text += '\n';
      }
      if (cv.projects) text += 'PROJECTS\n' + cv.projects + '\n\n';
      if (cv.skills) text += 'SKILLS\n' + cv.skills + '\n\n';
      if (cv.education) text += 'EDUCATION\n' + cv.education + '\n\n';
      if (cv.organization) text += 'ORGANIZATION & ACTIVITIES\n' + cv.organization + '\n\n';
      if (cv.languages) text += 'LANGUAGES\n' + cv.languages + '\n\n';
      if (cv.certifications) text += 'CERTIFICATIONS & AWARDS\n' + cv.certifications + '\n\n';
      if (cv.customSections && cv.customSections.length) {
        cv.customSections.forEach(sec => {
          if (sec.content) text += sec.title.toUpperCase() + '\n' + sec.content + '\n\n';
        });
      }
      navigator.clipboard.writeText(text.trim()).then(() => {
        this.atsCopySuccess = true;
        setTimeout(() => { this.atsCopySuccess = false; }, 2000);
      });
    },

    // ── Experience card editor (new, inside ATS CV modal) ──
    _genExpId() {
      return 'exp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
    },
    expCardStartAdd() {
      this.expCardEditingId = null;
      this.expCardForm = { role: '', company: '', period: '' };
      this.expCardShowAdd = true;
    },
    expCardCancelAdd() {
      this.expCardShowAdd = false;
      this.expCardForm = { role: '', company: '', period: '' };
    },
    expCardSaveAdd() {
      const { role, company, period } = this.expCardForm;
      if (!role.trim()) return;
      if (!this.atsCV.experienceEntries) this.atsCV.experienceEntries = [];
      this.atsCV.experienceEntries.push({
        id: this._genExpId(),
        role: role.trim(),
        company: company.trim(),
        period: period.trim(),
      });
      this.atsCV.lastUpdated = new Date().toISOString();
      this.saveAll();
      this.expCardForm = { role: '', company: '', period: '' };
      this.expCardShowAdd = false;
    },
    expCardStartEdit(id) {
      const entry = (this.atsCV.experienceEntries || []).find(e => e.id === id);
      if (!entry) return;
      this.expCardShowAdd = false;
      this.expCardEditingId = id;
      this.expCardForm = { role: entry.role, company: entry.company, period: entry.period };
    },
    expCardCancelEdit() {
      this.expCardEditingId = null;
      this.expCardForm = { role: '', company: '', period: '' };
    },
    expCardSaveEdit() {
      const { role, company, period } = this.expCardForm;
      if (!role.trim()) return;
      const idx = (this.atsCV.experienceEntries || []).findIndex(e => e.id === this.expCardEditingId);
      if (idx === -1) return;
      this.atsCV.experienceEntries[idx] = {
        ...this.atsCV.experienceEntries[idx],
        role: role.trim(),
        company: company.trim(),
        period: period.trim(),
      };
      this.atsCV.lastUpdated = new Date().toISOString();
      this.saveAll();
      this.expCardEditingId = null;
      this.expCardForm = { role: '', company: '', period: '' };
    },
    expCardDelete(id) {
      if (!confirm('Hapus entri pengalaman kerja ini?')) return;
      const idx = (this.atsCV.experienceEntries || []).findIndex(e => e.id === id);
      if (idx === -1) return;
      this.atsCV.experienceEntries.splice(idx, 1);
      this.atsCV.lastUpdated = new Date().toISOString();
      this.saveAll();
      if (this.expCardEditingId === id) this.expCardEditingId = null;
    },

    // ── Experience per-entry edit (legacy modal, dipakai dari tombol edit di CV preview) ──
    openAtsEditExperienceEntry(idx) {
      const exp = this.parsedExperience[idx];
      this.atsEditingExpIdx = idx;
      this.atsExpEntryForm = {
        role: exp.role,
        company: exp.company,
        period: exp.period,
      };
      this.showExpEntryModal = true;
    },
    saveAtsExperienceEntry() {
      const { role, company, period } = this.atsExpEntryForm;
      const entries = this.atsCV.experienceEntries || [];
      if (entries.length && this.atsEditingExpIdx < entries.length) {
        entries[this.atsEditingExpIdx] = {
          ...entries[this.atsEditingExpIdx],
          role: role.trim(),
          company: company.trim(),
          period: period.trim(),
        };
        this.atsCV.experienceEntries = [...entries];
      } else {
        const header = [role, company, period].filter(Boolean).join(' | ');
        const blocks = this.atsCV.experience ? this.atsCV.experience.split(/\n\n+/) : [];
        blocks[this.atsEditingExpIdx] = header;
        this.atsCV.experience = blocks.join('\n\n');
      }
      this.atsCV.lastUpdated = new Date().toISOString();
      this.saveAll();
      this.showExpEntryModal = false;
    },
    deleteAtsExperienceEntry(idx) {
      if (!confirm('Hapus entri pengalaman kerja ini?')) return;
      const entries = this.atsCV.experienceEntries || [];
      if (entries.length && idx < entries.length) {
        entries.splice(idx, 1);
        this.atsCV.experienceEntries = [...entries];
      } else {
        const blocks = this.atsCV.experience ? this.atsCV.experience.split(/\n\n+/) : [];
        blocks.splice(idx, 1);
        this.atsCV.experience = blocks.join('\n\n');
      }
      this.atsCV.lastUpdated = new Date().toISOString();
      this.saveAll();
      this.showExpEntryModal = false;
    },

    // ── Custom section lookup by skey ──
    getCustomSection(skey) {
      if (!skey || !skey.startsWith('custom:')) return null;
      const id = skey.slice(7);
      const idx = (this.atsCV.customSections || []).findIndex(s => s.id === id);
      if (idx === -1) return null;
      return { idx, sec: this.atsCV.customSections[idx] };
    },

    // ── Section drag & drop ──
    onSectionDragStart(idx, e) {
      this.dragSrcIdx = idx;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(idx));
    },
    onSectionDragOver(idx) {
      if (idx !== this.dragSrcIdx) this.dragOverIdx = idx;
    },
    onSectionDragLeave() {
      this.dragOverIdx = null;
    },
    onSectionDrop(toIdx) {
      const fromIdx = this.dragSrcIdx;
      if (fromIdx === null || fromIdx === toIdx) { this.dragOverIdx = null; return; }
      const order = [...this.sectionOrder];
      const [moved] = order.splice(fromIdx, 1);
      order.splice(toIdx, 0, moved);
      this.sectionOrder = order;
      this.dragSrcIdx = null;
      this.dragOverIdx = null;
      this.saveSectionOrder();
    },
    onSectionDragEnd() {
      this.dragSrcIdx = null;
      this.dragOverIdx = null;
    },
    saveSectionOrder() {
      WorkspaceStorage.setItem('career_section_order', JSON.stringify(this.sectionOrder));
    },

    // ── Delete built-in section ──
    deleteBuiltinSection(key) {
      const names = {
        summary: 'Summary', experience: 'Professional Experience', projects: 'Projects',
        skills: 'Skills', education: 'Education', additional: 'Additional Information',
        organization: 'Organization & Activities',
      };
      if (!confirm('Hapus section "' + (names[key] || key) + '"?\nKonten akan dihapus dan section disembunyikan.')) return;
      if (key === 'additional') {
        this.atsCV.languages = '';
        this.atsCV.certifications = '';
      } else if (this.atsCV[key] !== undefined) {
        this.atsCV[key] = '';
      }
      this.sectionOrder = this.sectionOrder.filter(k => k !== key);
      this.atsCV.lastUpdated = new Date().toISOString();
      this.saveAll();
      this.saveSectionOrder();
    },

    // ── CV v2 Custom Sections ──
    cv2AddSection() {
      this.cv2EditingCustomIdx = null;
      this.cv2CustomForm = { title: '', content: '' };
      this.cv2ShowCustomModal = true;
    },
    cv2EditCustomSection(idx) {
      this.cv2EditingCustomIdx = idx;
      const sec = this.atsCV.customSections[idx];
      this.cv2CustomForm = { title: sec.title, content: sec.content };
      this.cv2ShowCustomModal = true;
    },
    cv2DeleteCustomSection(idx) {
      if (!confirm('Hapus section ini?')) return;
      const sec = this.atsCV.customSections[idx];
      if (sec) this.sectionOrder = this.sectionOrder.filter(k => k !== 'custom:' + sec.id);
      this.atsCV.customSections.splice(idx, 1);
      this.saveAll();
      this.saveSectionOrder();
    },
    cv2SaveCustomSection() {
      if (!this.cv2CustomForm.title.trim()) return alert('Nama section wajib diisi!');
      if (!this.atsCV.customSections) this.atsCV.customSections = [];
      if (this.cv2EditingCustomIdx !== null) {
        this.atsCV.customSections[this.cv2EditingCustomIdx] = {
          ...this.atsCV.customSections[this.cv2EditingCustomIdx],
          title: this.cv2CustomForm.title.trim(),
          content: this.cv2CustomForm.content,
        };
      } else {
        const newId = 'csec-' + Date.now();
        this.atsCV.customSections.push({
          id: newId,
          title: this.cv2CustomForm.title.trim(),
          content: this.cv2CustomForm.content,
        });
        this.sectionOrder.push('custom:' + newId);
        this.saveSectionOrder();
      }
      this.saveAll();
      this.cv2ShowCustomModal = false;
    },

    // ── Storage ──
    saveAll() {
      WorkspaceStorage.setItem('career_resume', JSON.stringify(this.resume));
      WorkspaceStorage.setItem('career_docs', JSON.stringify(this.docs));
      WorkspaceStorage.setItem('career_last_updated', this.lastUpdated);
      WorkspaceStorage.setItem('career_ats_cv', JSON.stringify(this.atsCV));
    },

    // ── Formatting ──
    formatLastUpdated(iso) {
      if (!iso) return null;
      try {
        const d = new Date(iso);
        const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
        const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
        const hours = String(d.getHours()).padStart(2,'0');
        const mins = String(d.getMinutes()).padStart(2,'0');
        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${hours}:${mins}`;
      } catch(_e) { return null; }
    },
  },

  async mounted() {
    await globalThis._workspaceStorageReady;
    try {
      const r = WorkspaceStorage.getItem('career_resume');
      if (r) this.resume = { ...this.resume, ...JSON.parse(r) };
    } catch(_e) {}
    try {
      const d = WorkspaceStorage.getItem('career_docs');
      if (d) this.docs = JSON.parse(d);
    } catch(_e) {}
    try {
      const lu = WorkspaceStorage.getItem('career_last_updated');
      if (lu) this.lastUpdated = lu;
    } catch(_e) {}
    try {
      const ats = WorkspaceStorage.getItem('career_ats_cv');
      if (ats) {
        const parsed = JSON.parse(ats);
        if (!parsed.customSections) parsed.customSections = [];
        if (parsed.projects === undefined) parsed.projects = '';
        // Migrate old string experience → experienceEntries array (one-time)
        if (!parsed.experienceEntries || !Array.isArray(parsed.experienceEntries) || parsed.experienceEntries.length === 0) {
          parsed.experienceEntries = [];
          if (parsed.experience && typeof parsed.experience === 'string' && parsed.experience.trim()) {
            const blocks = parsed.experience.split(/\n\n+/);
            blocks.forEach((block, idx) => {
              const firstLine = block.trim().split('\n')[0] || '';
              const parts = firstLine.split('|').map(s => s.trim());
              const role = parts[0] || '';
              if (role) {
                parsed.experienceEntries.push({
                  id: 'exp_' + Date.now().toString(36) + '_' + idx + '_' + Math.random().toString(36).slice(2, 5),
                  role,
                  company: parts[1] || '',
                  period: parts[2] || '',
                });
              }
            });
          }
        }
        this.atsCV = { ...this.atsCV, ...parsed };
        // Append any custom sections not yet in default sectionOrder
        (parsed.customSections || []).forEach(sec => {
          const key = 'custom:' + sec.id;
          if (!this.sectionOrder.includes(key)) this.sectionOrder.push(key);
        });
      }
    } catch(_e) {}
    try {
      const so = WorkspaceStorage.getItem('career_section_order');
      if (so) {
        const saved = JSON.parse(so);
        // Merge: keep saved order, add any new built-in keys missing
        const defaults = ['summary','experience','projects','skills','education','additional','organization'];
        const merged = saved.filter(k => typeof k === 'string');
        defaults.forEach(k => { if (!merged.includes(k)) merged.push(k); });
        this.sectionOrder = merged;
      }
    } catch(_e) {}
    try {
      const pt = WorkspaceStorage.getItem('portfolio_tasks');
      if (pt) this.portfolioTasks = JSON.parse(pt);
    } catch(_e) {}
    try {
      const kb = WorkspaceStorage.getItem('career_keyword_bank');
      if (kb) this.keywordBank = JSON.parse(kb);
    } catch(_e) {}
  },
};

// ============================================================================
// MY PORTFOLIO — Filter pengalaman kerja (dari CV ATS) + tabel task portfolio
// dengan status Draft/Fix. Task di sini DIINPUT MANUAL (judul bebas, tidak lagi
// diturunkan dari poin CV). Sebaliknya: task berstatus 'fix' yang akan otomatis
// tampil sebagai Poin Pencapaian pada entri terkait di CV ATS (lihat parsedExperience
// & saveAtsExperienceEntry di CareerFoundation, key storage 'portfolio_tasks').
// Diakses dari tombol "My Portfolio" di navbar/filter row halaman Career Foundation.
// ============================================================================
const MyPortfolio = {
  template: `
  <div class="mp-clean">

    <!-- ── Hero Header ── -->
    <div class="mp-hero">
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <div class="mp-hero-badge">
          <span class="mp-hero-badge-dot"></span>
          Showcase
        </div>
        <button @click="goToCareer" title="Kembali ke Career Foundation"
          style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;background:transparent;border:1.5px solid var(--color-sand,#C8BDB5);border-radius:8px;cursor:pointer;color:var(--text-secondary,#7A6F66);transition:background 0.15s,border-color 0.15s;"
          onmouseover="this.style.background='var(--color-sand-light,#EDE8E1)';this.style.borderColor='var(--color-terracotta,#D67B52)'"
          onmouseout="this.style.background='transparent';this.style.borderColor='var(--color-sand,#C8BDB5)'">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </button>
      </div>
      <h2 class="mp-hero-title">My 'hidden gem' Portfolio</h2>
      <p class="mp-hero-sub">Catat task portfolio untuk tiap pengalaman kerja. Task berstatus <strong>Fix</strong> otomatis tampil sebagai Poin Pencapaian di CV ATS.</p>
    </div>

    <!-- ── Empty: belum ada pengalaman kerja sama sekali di CV ATS ── -->
    <div v-if="!experiences.length" class="mp-empty-state">
      <div class="mp-empty-icon">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      </div>
      <p class="mp-empty-title">Belum ada pengalaman kerja</p>
      <p class="mp-empty-sub">Isi dulu Jabatan, Perusahaan & Periode di tab CV ATS pada halaman Career Foundation, baru task portfolio bisa dicatat di sini.</p>
      <button class="cf-btn-ghost" style="margin-top: 16px;" @click="goToCareer">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        Buka Career Foundation
      </button>
    </div>

    <!-- ── Filter + Tambah Task + Tabel ── -->
    <template v-else>
      <div class="mp-filter-row">
        <span class="mp-filter-label">Pengalaman Kerja</span>
        <select class="form-input mp-filter-select" v-model="selectedExpKey">
          <option v-for="exp in experiences" :key="exp.key" :value="exp.key">
            {{ exp.role }}<template v-if="exp.company"> — {{ exp.company }}</template><template v-if="exp.period"> ({{ exp.period }})</template>
          </option>
        </select>
        <div class="mp-search-wrap">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mp-search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="form-input mp-search-input" v-model="portfolioGlobalSearch"
            placeholder="Cari semua data di My Portfolio..." />
          <button v-if="portfolioGlobalSearch" class="mp-search-clear" title="Hapus pencarian" @click="portfolioGlobalSearch = ''">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <template v-if="isGlobalSearching">
        <div v-if="!globalSearchResults.length" class="mp-empty-state" style="padding: 40px 24px;">
          <p class="mp-empty-title">Tidak ada hasil</p>
          <p class="mp-empty-sub">Tidak ada task yang cocok dengan "{{ portfolioGlobalSearch }}".</p>
        </div>
        <div v-else class="mp-search-results">
          <p class="mp-search-results-count">{{ globalSearchResults.length }} task ditemukan</p>
          <div v-for="r in globalSearchResults" :key="r.task.id" class="mp-search-result-row">
            <div class="mp-search-result-main">
              <span class="mp-search-result-exp">{{ r.expLabel }}</span>
              <p class="mp-search-result-title">{{ r.task.title }}</p>
              <div v-if="(r.task.keywords || []).length" class="mp-bukti-chips" style="margin-top:4px;">
                <span v-for="kw in r.task.keywords" :key="kw" class="mp-bukti-chip">
                  <span class="mp-bukti-chip-text">{{ kw }}</span>
                </span>
              </div>
            </div>
            <span class="mp-status-select" :class="r.task.status === 'fix' ? 'mp-status-fix' : 'mp-status-draft'" style="cursor:default;">
              {{ r.task.status === 'fix' ? 'Fix' : 'Draft' }}
            </span>
            <button class="cf-btn-ghost" @click="openSearchResult(r.expKey)">Buka</button>
          </div>
        </div>
      </template>

      <template v-else>

      <!-- ── Catatan Pengalaman: ikut menyesuaikan filter Pengalaman Kerja di atas ── -->
      <div class="mp-note-card">
        <div class="mp-note-card-head">
          <div class="mp-note-card-head-text">
            <span class="mp-note-card-label">Catatan Pengalaman</span>
            <span class="mp-note-card-sub">Catatan / refleksi umum untuk pengalaman kerja yang sedang dipilih di atas.</span>
          </div>
          <button class="mp-insight-btn" :class="{ 'mp-insight-filled': hasExperienceNote }"
            @click="openNotesModal"
            :title="hasExperienceNote ? truncate(currentExperienceNote, 90) : 'Belum ada catatan'">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            {{ hasExperienceNote ? 'Lihat Catatan' : 'Tulis Catatan' }}
          </button>
        </div>
        <p v-if="hasExperienceNote" class="mp-note-card-preview">{{ truncate(currentExperienceNote, 220) }}</p>
      </div>

      <div class="mp-add-row">
        <input type="text" class="form-input mp-add-input" v-model="newTaskTitle"
          placeholder="Judul task baru, misal: Redesign halaman checkout" @keyup.enter="addTask" />
        <button class="cf-btn-primary mp-add-btn" :disabled="!newTaskTitle.trim()" @click="addTask">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Task
        </button>
      </div>

      <div v-if="!tableTasks.length" class="mp-empty-state" style="padding: 40px 24px;">
        <p class="mp-empty-title">Belum ada task</p>
        <p class="mp-empty-sub">Tambahkan task portfolio pertama untuk pengalaman ini lewat kolom di atas.</p>
      </div>

      <template v-else>
        <div class="mp-table-container">
          <table class="mp-table">
            <thead>
              <tr>
                <th>Judul Task Pengalaman</th>
                <th style="width: 200px;">Kata Kunci</th>
                <th style="width: 240px;">Bukti Kerja</th>
                <th style="width: 160px;">Rangkuman Insight</th>
                <th style="width: 150px;">Status</th>
                <th style="width: 74px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in tableTasks" :key="task.id">
                <td>
                  <template v-if="editingTaskId === task.id">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <input type="text" class="form-input" v-model="editingTaskTitle"
                        style="flex: 1; height: 32px; font-size: 13px; padding: 0 9px; border-radius: 7px;"
                        @keyup.enter="saveEditTask"
                        @keyup.esc="cancelEditTask"
                        ref="editTaskInput" />
                      <button @click="saveEditTask" title="Simpan"
                        style="height: 32px; padding: 0 10px; background: var(--color-terracotta); color: #fff; border: none; border-radius: 7px; font-size: 11.5px; font-weight: 700; cursor: pointer; font-family: inherit; white-space: nowrap;">
                        Simpan
                      </button>
                      <button @click="cancelEditTask" title="Batal"
                        style="height: 32px; padding: 0 10px; background: var(--bg-cream); border: 1.5px solid var(--color-sand); color: var(--text-dark); border-radius: 7px; font-size: 11.5px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap;">
                        Batal
                      </button>
                    </div>
                  </template>
                  <template v-else>
                    <span>{{ task.title }}</span>
                  </template>
                </td>
                <td>
                  <div class="mp-bukti-cell">
                    <div v-if="(task.keywords || []).length" class="mp-bukti-chips">
                      <span v-for="kw in task.keywords" :key="kw" class="mp-bukti-chip">
                        <span class="mp-bukti-chip-text">{{ kw }}</span>
                        <button class="mp-bukti-chip-remove" title="Hapus kata kunci ini" @click="removeTaskKeyword(task, kw)">
                          <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </span>
                    </div>
                    <button class="mp-bukti-add-btn" @click="openKeywordModal(task.id)">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Pilih Kata Kunci
                    </button>
                  </div>
                </td>
                <td>
                  <div class="mp-bukti-cell">
                    <div v-if="getSelectedBuktiLogs(task).length" class="mp-bukti-chips">
                      <span v-for="log in getSelectedBuktiLogs(task)" :key="log.id" class="mp-bukti-chip" :title="log.tasks">
                        <span class="mp-bukti-chip-date">{{ formatDate(log.date) }}</span>
                        <span class="mp-bukti-chip-text">{{ truncate(log.tasks, 26) }}</span>
                        <button class="mp-bukti-chip-remove" title="Hapus bukti ini" @click="removeBukti(task, log.id)">
                          <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </span>
                    </div>
                    <button class="mp-bukti-add-btn" @click="openBuktiModal(task.id)">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Pilih Bukti
                    </button>
                  </div>
                </td>
                <td>
                  <button class="mp-insight-btn" :class="{ 'mp-insight-filled': hasInsightSummary(task) }"
                    @click="openInsightModal(task.id)"
                    :title="hasInsightSummary(task) ? truncate(task.insightSummary, 90) : 'Belum ada rangkuman insight'">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
                    {{ hasInsightSummary(task) ? 'Lihat Insight' : 'Tulis Insight' }}
                  </button>
                </td>
                <td>
                  <select class="form-input mp-status-select"
                    :class="task.status === 'fix' ? 'mp-status-fix' : 'mp-status-draft'"
                    :value="task.status"
                    @change="setTaskStatus(task.id, $event.target.value)">
                    <option value="draft">Draft</option>
                    <option value="fix">Fix</option>
                  </select>
                </td>
                <td>
                  <div style="display: flex; align-items: center; gap: 5px; justify-content: center;">
                    <button class="mp-task-edit-btn" title="Edit judul task" @click="startEditTask(task)"
                      style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--color-sand); border-radius: 7px; background: var(--bg-cream); color: var(--text-muted); cursor: pointer; transition: border-color 0.15s, color 0.15s;"
                      onmouseover="this.style.borderColor='var(--color-terracotta)';this.style.color='var(--color-terracotta)'" onmouseout="this.style.borderColor='var(--color-sand)';this.style.color='var(--text-muted)'">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="mp-task-delete-btn" title="Hapus task" @click="deleteTask(task.id)">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mp-fix-note">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          Task berstatus <strong>Fix</strong> akan otomatis tampil sebagai Poin Pencapaian pada entri ini di CV ATS.
        </p>
      </template>
      </template>
    </template>

    <!-- ══ MODAL: Pilih Bukti Kerja (multiselect dari Riwayat Kegiatan Kerja / Job Logbook) ══ -->
    <transition name="cf-fade">
      <div v-if="buktiModalTaskId" class="cf-modal-overlay" @click.self="closeBuktiModal">
        <div class="cf-modal cf-modal-wide">
          <div class="cf-modal-header">
            <h3 class="cf-modal-title">Pilih Bukti Kerja</h3>
            <button class="cf-modal-close" @click="closeBuktiModal">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="cf-modal-body">
            <p style="font-size:11.5px; color:var(--text-muted); margin:0 0 2px; line-height:1.6;">Pilih satu atau lebih catatan dari <strong>Riwayat Kegiatan Kerja</strong> (Job Logbook) sebagai bukti pendukung task ini.</p>
            <input type="text" class="cf-input" v-model="buktiModalSearch" placeholder="Cari berdasarkan tugas / kategori..." />
            <div v-if="!jobLogs.length" style="font-size:12.5px; color: var(--text-muted); text-align:center; padding: 28px 0;">
              Belum ada Riwayat Kegiatan Kerja. Catat dulu di halaman <strong>Job Logbook</strong>.
            </div>
            <div v-else-if="!filteredJobLogsForModal.length" style="font-size:12.5px; color: var(--text-muted); text-align:center; padding: 28px 0;">
              Tidak ada catatan yang cocok dengan pencarian.
            </div>
            <div v-else class="mp-bukti-modal-list">
              <label v-for="log in filteredJobLogsForModal" :key="log.id" class="mp-bukti-modal-item">
                <input type="checkbox" :checked="isBuktiChecked(log.id)" @change="toggleBuktiCheck(log.id)" />
                <div class="mp-bukti-modal-item-text">
                  <div class="mp-bukti-modal-item-top">
                    <span class="mp-bukti-modal-item-date">{{ formatDate(log.date) }}</span>
                    <span class="pill" :style="{ backgroundColor: getCategoryColor(log.category) + '12', color: getCategoryColor(log.category), borderColor: getCategoryColor(log.category) + '30' }" style="border: 1px solid;">{{ log.category }}</span>
                  </div>
                  <p class="mp-bukti-modal-item-task">{{ log.tasks }}</p>
                </div>
              </label>
            </div>
          </div>
          <div class="cf-modal-footer">
            <span style="font-size:12px; color: var(--text-muted); margin-right:auto;">{{ buktiModalSelectedCount }} bukti dipilih</span>
            <button class="cf-btn-primary" @click="closeBuktiModal">Selesai</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══ MODAL: Pilih Kata Kunci (multiselect dari Bank Kata Kunci di Career Foundation) ══ -->
    <transition name="cf-fade">
      <div v-if="keywordModalTaskId" class="cf-modal-overlay" @click.self="closeKeywordModal">
        <div class="cf-modal cf-modal-wide">
          <div class="cf-modal-header">
            <h3 class="cf-modal-title">Pilih Kata Kunci</h3>
            <button class="cf-modal-close" @click="closeKeywordModal">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="cf-modal-body">
            <p style="font-size:11.5px; color:var(--text-muted); margin:0 0 2px; line-height:1.6;">Pilih satu atau lebih kata kunci untuk task ini. Kelola daftar kata kunci di sidebar halaman <strong>Career Foundation</strong>.</p>
            <input type="text" class="cf-input" v-model="keywordModalSearch" placeholder="Cari kata kunci..." />
            <div v-if="!keywordBank.length" style="font-size:12.5px; color: var(--text-muted); text-align:center; padding: 28px 0;">
              Belum ada kata kunci di bank. Tambahkan dulu di sidebar halaman <strong>Career Foundation</strong>.
            </div>
            <div v-else-if="!filteredKeywordBank.length" style="font-size:12.5px; color: var(--text-muted); text-align:center; padding: 28px 0;">
              Tidak ada kata kunci yang cocok dengan pencarian.
            </div>
            <div v-else class="mp-bukti-modal-list">
              <label v-for="kw in filteredKeywordBank" :key="kw" class="mp-bukti-modal-item">
                <input type="checkbox" :checked="isTaskKeywordChecked(kw)" @change="toggleTaskKeyword(kw)" />
                <div class="mp-bukti-modal-item-text">
                  <p class="mp-bukti-modal-item-task">{{ kw }}</p>
                </div>
              </label>
            </div>
          </div>
          <div class="cf-modal-footer">
            <button class="cf-btn-primary" @click="closeKeywordModal">Selesai</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══ MODAL: Rangkuman Insight per Task ══ -->
    <transition name="cf-fade">
      <div v-if="insightModalTaskId" class="cf-modal-overlay" @click.self="closeInsightModal">
        <div class="cf-modal cf-modal-xl">
          <div class="cf-modal-header">
            <div>
              <h3 class="cf-modal-title">Rangkuman Insight</h3>
              <p v-if="insightModalTask" style="font-size: 11.5px; color: var(--text-muted); margin: 3px 0 0;">{{ insightModalTask.title }}</p>
            </div>
            <button class="cf-modal-close" @click="closeInsightModal">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- ── Mode VIEW: tampilkan insight yang sudah tersimpan, read-only ── -->
          <template v-if="insightModalMode === 'view'">
            <div class="cf-modal-body">
              <div class="mp-insight-view-box">{{ insightModalDraft }}</div>
            </div>
            <div class="cf-modal-footer">
              <button class="cf-btn-danger" style="margin-right:auto" @click="deleteInsightModal">Hapus</button>
              <button class="cf-btn-ghost" @click="closeInsightModal">Tutup</button>
              <button class="cf-btn-primary" @click="startEditInsightModal">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                Edit
              </button>
            </div>
          </template>

          <!-- ── Mode EDIT: textarea untuk menulis / mengubah insight ── -->
          <template v-else>
            <div class="cf-modal-body">
              <p style="font-size:11.5px; color:var(--text-muted); margin:0; line-height:1.6;">Tulis rangkuman insight / pembelajaran dari task ini — bisa jadi catatan refleksi, hasil belajar, atau poin penting untuk portofolio kamu.</p>
              <textarea class="cf-textarea mp-insight-textarea-lg" v-model="insightModalDraft" rows="18" placeholder="cth., Dari task ini aku belajar..."></textarea>
            </div>
            <div class="cf-modal-footer">
              <button class="cf-btn-ghost" @click="cancelEditInsightModal">Batal</button>
              <button class="cf-btn-primary" @click="saveInsightModal">Simpan</button>
            </div>
          </template>
        </div>
      </div>
    </transition>

    <!-- ══ MODAL: Catatan Pengalaman (menyesuaikan filter Pengalaman Kerja yang dipilih) ══ -->
    <transition name="cf-fade">
      <div v-if="notesModalOpen" class="cf-modal-overlay" @click.self="closeNotesModal">
        <div class="cf-modal cf-modal-xl">
          <div class="cf-modal-header">
            <div>
              <h3 class="cf-modal-title">Catatan Pengalaman</h3>
              <p v-if="selectedExperience" style="font-size: 11.5px; color: var(--text-muted); margin: 3px 0 0;">
                {{ selectedExperience.role }}<template v-if="selectedExperience.company"> — {{ selectedExperience.company }}</template><template v-if="selectedExperience.period"> ({{ selectedExperience.period }})</template>
              </p>
            </div>
            <button class="cf-modal-close" @click="closeNotesModal">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- ── Mode VIEW: tampilkan catatan yang sudah tersimpan, read-only ── -->
          <template v-if="notesModalMode === 'view'">
            <div class="cf-modal-body">
              <div class="mp-insight-view-box">{{ notesModalDraft }}</div>
            </div>
            <div class="cf-modal-footer">
              <button class="cf-btn-danger" style="margin-right:auto" @click="deleteNotesModal">Hapus</button>
              <button class="cf-btn-ghost" @click="closeNotesModal">Tutup</button>
              <button class="cf-btn-primary" @click="startEditNotesModal">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                Edit
              </button>
            </div>
          </template>

          <!-- ── Mode EDIT: textarea untuk menulis / mengubah catatan pengalaman ── -->
          <template v-else>
            <div class="cf-modal-body">
              <p style="font-size:11.5px; color:var(--text-muted); margin:0; line-height:1.6;">Tulis catatan atau refleksi umum untuk pengalaman kerja ini. Catatan akan tersimpan terpisah per pengalaman, sesuai pilihan di filter "Pengalaman Kerja".</p>
              <textarea class="cf-textarea mp-insight-textarea-lg" v-model="notesModalDraft" rows="18" placeholder="cth., Catatan umum tentang peran ini..."></textarea>
            </div>
            <div class="cf-modal-footer">
              <button class="cf-btn-ghost" @click="cancelEditNotesModal">Batal</button>
              <button class="cf-btn-primary" @click="saveNotesModal">Simpan</button>
            </div>
          </template>
        </div>
      </div>
    </transition>

  </div>
  `,

  data() {
    return {
      atsCV: { experience: '', experienceEntries: [] },
      selectedExpKey: '',
      portfolioGlobalSearch: '',
      portfolioTasks: {}, // { [expKey]: [{ id, title, status, buktiKerja: [logId, ...], insightSummary }] }
      experienceNotes: {}, // { [expKey]: noteString } — catatan umum per pengalaman kerja, ikut filter di atas
      newTaskTitle: '',
      editingTaskId: null,    // id task yang sedang diedit judulnya
      editingTaskTitle: '',   // draft judul yang sedang diedit
      jobLogs: [], // dari Riwayat Kegiatan Kerja (Job Logbook)
      buktiModalTaskId: null,
      buktiModalSearch: '',
      keywordBank: [], // master list kata kunci, dikelola di halaman Career Foundation
      keywordModalTaskId: null,
      keywordModalSearch: '',
      insightModalTaskId: null,
      insightModalDraft: '',
      insightModalMode: 'view', // 'view' (read-only) | 'edit' (textarea)
      notesModalOpen: false,
      notesModalDraft: '',
      notesModalMode: 'view', // 'view' (read-only) | 'edit' (textarea)
    };
  },

  computed: {
    // ── Hanya butuh header (Jabatan | Perusahaan | Periode) per entri CV ATS ──
    experiences() {
      // New format: experienceEntries array with permanent IDs
      const entries = this.atsCV.experienceEntries;
      if (entries && entries.length) {
        return entries
          .filter(e => e.role)
          .map(e => ({
            id: e.id,
            role: e.role,
            company: e.company || '',
            period: e.period || '',
            key: `${e.role}|${e.company || ''}|${e.period || ''}`,
          }));
      }
      // Legacy fallback: parse dari string lama
      if (!this.atsCV.experience) return [];
      const blocks = this.atsCV.experience.split(/\n\n+/);
      return blocks.map(block => {
        const lines = block.trim().split('\n');
        const header = lines[0] || '';
        const parts = header.split('|').map(s => s.trim());
        const role = parts[0] || '';
        const company = parts[1] || '';
        const period = parts[2] || '';
        return { id: null, role, company, period, key: `${role}|${company}|${period}` };
      }).filter(e => e.role);
    },

    selectedExperience() {
      return this.experiences.find(e => e.key === this.selectedExpKey) || this.experiences[0] || null;
    },

    tableTasks() {
      if (!this.selectedExperience) return [];
      return this.portfolioTasks[this.selectedExperience.key] || [];
    },

    // ── Search bar global: cari semua data task (judul, kata kunci, insight, status, pengalaman) di SEMUA pengalaman kerja ──
    isGlobalSearching() {
      return this.portfolioGlobalSearch.trim().length > 0;
    },
    globalSearchResults() {
      const q = this.portfolioGlobalSearch.trim().toLowerCase();
      if (!q) return [];
      const results = [];
      this.experiences.forEach(exp => {
        const expLabel = exp.role + (exp.company ? ' — ' + exp.company : '') + (exp.period ? ' (' + exp.period + ')' : '');
        const list = this.portfolioTasks[exp.key] || [];
        list.forEach(task => {
          const haystacks = [
            task.title || '',
            (task.keywords || []).join(' '),
            task.insightSummary || '',
            task.status === 'fix' ? 'fix' : 'draft',
            expLabel,
          ];
          if (haystacks.some(h => h.toLowerCase().includes(q))) {
            results.push({ task, expKey: exp.key, expLabel });
          }
        });
      });
      return results;
    },

    // ── Bukti Kerja: list Riwayat Kegiatan Kerja, terbaru dulu, difilter pencarian modal ──
    filteredJobLogsForModal() {
      const sorted = [...this.jobLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
      const q = this.buktiModalSearch.trim().toLowerCase();
      if (!q) return sorted;
      return sorted.filter(l =>
        (l.tasks || '').toLowerCase().includes(q) ||
        (l.category || '').toLowerCase().includes(q) ||
        (l.achievements || '').toLowerCase().includes(q)
      );
    },

    // ── Kata Kunci: bank kata kunci, difilter pencarian modal ──
    filteredKeywordBank() {
      const q = this.keywordModalSearch.trim().toLowerCase();
      if (!q) return this.keywordBank;
      return this.keywordBank.filter(kw => kw.toLowerCase().includes(q));
    },

    buktiModalSelectedCount() {
      const task = this.getTaskById(this.buktiModalTaskId);
      return task && task.buktiKerja ? task.buktiKerja.length : 0;
    },

    insightModalTask() {
      return this.getTaskById(this.insightModalTaskId);
    },

    // ── Catatan Pengalaman: otomatis ikut menyesuaikan filter Pengalaman Kerja yang dipilih ──
    currentExperienceNote() {
      if (!this.selectedExperience) return '';
      return this.experienceNotes[this.selectedExperience.key] || '';
    },

    hasExperienceNote() {
      return !!this.currentExperienceNote.trim();
    },
  },

  methods: {
    openSearchResult(expKey) {
      this.selectedExpKey = expKey;
      this.portfolioGlobalSearch = '';
    },

    addTask() {
      const title = this.newTaskTitle.trim();
      if (!title || !this.selectedExperience) return;
      const key = this.selectedExperience.key;
      const list = this.portfolioTasks[key] ? [...this.portfolioTasks[key]] : [];
      list.push({ id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title, status: 'draft', buktiKerja: [], insightSummary: '', keywords: [] });
      this.portfolioTasks = { ...this.portfolioTasks, [key]: list };
      this.newTaskTitle = '';
      this.saveTasks();
    },

    setTaskStatus(taskId, status) {
      if (!this.selectedExperience) return;
      const key = this.selectedExperience.key;
      const list = (this.portfolioTasks[key] || []).map(t => t.id === taskId ? { ...t, status } : t);
      this.portfolioTasks = { ...this.portfolioTasks, [key]: list };
      this.saveTasks();
    },

    setTaskKeyword(taskId, keyword) {
      // (deprecated single-keyword setter, dipertahankan untuk kompatibilitas data lama — tidak dipakai lagi di UI)
      if (!this.selectedExperience) return;
      const key = this.selectedExperience.key;
      const list = (this.portfolioTasks[key] || []).map(t => t.id === taskId ? { ...t, keyword } : t);
      this.portfolioTasks = { ...this.portfolioTasks, [key]: list };
      this.saveTasks();
    },

    // ── Multiselect Kata Kunci per task (dari bank kata kunci di Career Foundation) ──
    loadKeywordBank() {
      try {
        const kb = WorkspaceStorage.getItem('career_keyword_bank');
        this.keywordBank = kb ? JSON.parse(kb) : [];
      } catch(_e) { this.keywordBank = []; }
    },
    openKeywordModal(taskId) {
      this.loadKeywordBank();
      this.keywordModalTaskId = taskId;
      this.keywordModalSearch = '';
    },
    closeKeywordModal() {
      this.keywordModalTaskId = null;
      this.keywordModalSearch = '';
    },
    isTaskKeywordChecked(kw) {
      const task = this.getTaskById(this.keywordModalTaskId);
      return !!(task && (task.keywords || []).includes(kw));
    },
    toggleTaskKeyword(kw) {
      if (!this.selectedExperience || !this.keywordModalTaskId) return;
      const key = this.selectedExperience.key;
      const list = (this.portfolioTasks[key] || []).map(t => {
        if (t.id !== this.keywordModalTaskId) return t;
        const current = t.keywords || [];
        const next = current.includes(kw) ? current.filter(k => k !== kw) : [...current, kw];
        return { ...t, keywords: next };
      });
      this.portfolioTasks = { ...this.portfolioTasks, [key]: list };
      this.saveTasks();
    },
    removeTaskKeyword(task, kw) {
      if (!this.selectedExperience) return;
      const key = this.selectedExperience.key;
      const list = (this.portfolioTasks[key] || []).map(t => {
        if (t.id !== task.id) return t;
        return { ...t, keywords: (t.keywords || []).filter(k => k !== kw) };
      });
      this.portfolioTasks = { ...this.portfolioTasks, [key]: list };
      this.saveTasks();
    },

    deleteTask(taskId) {
      if (!this.selectedExperience) return;
      if (!confirm('Hapus task ini?')) return;
      const key = this.selectedExperience.key;
      const list = (this.portfolioTasks[key] || []).filter(t => t.id !== taskId);
      this.portfolioTasks = { ...this.portfolioTasks, [key]: list };
      this.saveTasks();
    },

    startEditTask(task) {
      this.editingTaskId = task.id;
      this.editingTaskTitle = task.title;
      this.$nextTick(() => {
        const el = this.$el.querySelector('[ref="editTaskInput"], input[type="text"][style*="flex: 1"]');
        if (el) el.focus();
      });
    },

    saveEditTask() {
      const title = this.editingTaskTitle.trim();
      if (!title || !this.selectedExperience || !this.editingTaskId) { this.cancelEditTask(); return; }
      const key = this.selectedExperience.key;
      const list = (this.portfolioTasks[key] || []).map(t =>
        t.id === this.editingTaskId ? { ...t, title } : t
      );
      this.portfolioTasks = { ...this.portfolioTasks, [key]: list };
      this.saveTasks();
      this.editingTaskId = null;
      this.editingTaskTitle = '';
    },

    cancelEditTask() {
      this.editingTaskId = null;
      this.editingTaskTitle = '';
    },

    saveTasks() {
      try {
        WorkspaceStorage.setItem('portfolio_tasks', JSON.stringify(this.portfolioTasks));
      } catch(_e) {}
    },

    // ── Bukti Kerja (multiselect dari Riwayat Kegiatan Kerja / Job Logbook) ──
    getTaskById(taskId) {
      if (!this.selectedExperience || !taskId) return null;
      const list = this.portfolioTasks[this.selectedExperience.key] || [];
      return list.find(t => t.id === taskId) || null;
    },

    getSelectedBuktiLogs(task) {
      const ids = task.buktiKerja || [];
      return ids.map(id => this.jobLogs.find(l => l.id === id)).filter(Boolean);
    },

    openBuktiModal(taskId) {
      this.buktiModalTaskId = taskId;
      this.buktiModalSearch = '';
    },

    closeBuktiModal() {
      this.buktiModalTaskId = null;
    },

    isBuktiChecked(logId) {
      const task = this.getTaskById(this.buktiModalTaskId);
      return !!(task && (task.buktiKerja || []).includes(logId));
    },

    toggleBuktiCheck(logId) {
      if (!this.selectedExperience || !this.buktiModalTaskId) return;
      const key = this.selectedExperience.key;
      const list = (this.portfolioTasks[key] || []).map(t => {
        if (t.id !== this.buktiModalTaskId) return t;
        const current = t.buktiKerja || [];
        const next = current.includes(logId) ? current.filter(id => id !== logId) : [...current, logId];
        return { ...t, buktiKerja: next };
      });
      this.portfolioTasks = { ...this.portfolioTasks, [key]: list };
      this.saveTasks();
    },

    removeBukti(task, logId) {
      if (!this.selectedExperience) return;
      const key = this.selectedExperience.key;
      const list = (this.portfolioTasks[key] || []).map(t => {
        if (t.id !== task.id) return t;
        return { ...t, buktiKerja: (t.buktiKerja || []).filter(id => id !== logId) };
      });
      this.portfolioTasks = { ...this.portfolioTasks, [key]: list };
      this.saveTasks();
    },

    // ── Rangkuman Insight per task (popup) ──
    hasInsightSummary(task) {
      return !!(task.insightSummary && task.insightSummary.trim());
    },

    openInsightModal(taskId) {
      const task = this.getTaskById(taskId);
      this.insightModalTaskId = taskId;
      this.insightModalDraft = (task && task.insightSummary) || '';
      // Kalau sudah ada isinya, buka dalam mode tampilan (read-only) dulu.
      // Kalau masih kosong, langsung ke mode edit supaya bisa langsung nulis.
      this.insightModalMode = (task && this.hasInsightSummary(task)) ? 'view' : 'edit';
    },

    closeInsightModal() {
      this.insightModalTaskId = null;
      this.insightModalDraft = '';
      this.insightModalMode = 'view';
    },

    startEditInsightModal() {
      this.insightModalMode = 'edit';
    },

    cancelEditInsightModal() {
      const task = this.insightModalTask;
      if (task && this.hasInsightSummary(task)) {
        // Batalkan perubahan, balik ke tampilan isi yang tersimpan sebelumnya.
        this.insightModalDraft = task.insightSummary;
        this.insightModalMode = 'view';
      } else {
        this.closeInsightModal();
      }
    },

    saveInsightModal() {
      if (!this.selectedExperience || !this.insightModalTaskId) return;
      const key = this.selectedExperience.key;
      const list = (this.portfolioTasks[key] || []).map(t => t.id === this.insightModalTaskId ? { ...t, insightSummary: this.insightModalDraft } : t);
      this.portfolioTasks = { ...this.portfolioTasks, [key]: list };
      this.saveTasks();
      if (this.insightModalDraft.trim()) {
        this.insightModalMode = 'view';
      } else {
        this.closeInsightModal();
      }
    },

    deleteInsightModal() {
      if (!confirm('Hapus rangkuman insight ini?')) return;
      if (!this.selectedExperience || !this.insightModalTaskId) return;
      const key = this.selectedExperience.key;
      const list = (this.portfolioTasks[key] || []).map(t => t.id === this.insightModalTaskId ? { ...t, insightSummary: '' } : t);
      this.portfolioTasks = { ...this.portfolioTasks, [key]: list };
      this.saveTasks();
      this.closeInsightModal();
    },

    // ── Catatan Pengalaman (popup terpisah, ikut filter Pengalaman Kerja di atas) ──
    openNotesModal() {
      if (!this.selectedExperience) return;
      this.notesModalDraft = this.currentExperienceNote;
      // Kalau sudah ada isinya, buka dalam mode tampilan (read-only) dulu.
      // Kalau masih kosong, langsung ke mode edit supaya bisa langsung nulis.
      this.notesModalMode = this.hasExperienceNote ? 'view' : 'edit';
      this.notesModalOpen = true;
    },

    closeNotesModal() {
      this.notesModalOpen = false;
      this.notesModalDraft = '';
      this.notesModalMode = 'view';
    },

    startEditNotesModal() {
      this.notesModalMode = 'edit';
    },

    cancelEditNotesModal() {
      if (this.hasExperienceNote) {
        // Batalkan perubahan, balik ke tampilan isi yang tersimpan sebelumnya.
        this.notesModalDraft = this.currentExperienceNote;
        this.notesModalMode = 'view';
      } else {
        this.closeNotesModal();
      }
    },

    saveNotesModal() {
      if (!this.selectedExperience) return;
      const key = this.selectedExperience.key;
      this.experienceNotes = { ...this.experienceNotes, [key]: this.notesModalDraft };
      this.saveExperienceNotes();
      if (this.notesModalDraft.trim()) {
        this.notesModalMode = 'view';
      } else {
        this.closeNotesModal();
      }
    },

    deleteNotesModal() {
      if (!confirm('Hapus catatan pengalaman ini?')) return;
      if (!this.selectedExperience) return;
      const key = this.selectedExperience.key;
      this.experienceNotes = { ...this.experienceNotes, [key]: '' };
      this.saveExperienceNotes();
      this.closeNotesModal();
    },

    saveExperienceNotes() {
      try {
        WorkspaceStorage.setItem('portfolio_experience_notes', JSON.stringify(this.experienceNotes));
      } catch(_e) {}
    },

    loadJobLogs() {
      try {
        const saved = WorkspaceStorage.getItem('personal_workspace_job_logs');
        const parsed = saved ? JSON.parse(saved) : [];
        parsed.forEach((l, i) => { if (!l.id) l.id = 'log-fallback-' + i; });
        this.jobLogs = parsed;
      } catch(_e) { this.jobLogs = []; }
    },

    formatDate(d) {
      try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); }
      catch (_e) { return d; }
    },

    truncate(text, n) {
      if (!text) return '';
      return text.length > n ? text.slice(0, n).trim() + '…' : text;
    },

    getCategoryColor(cat) {
      const colors = { 'Administrasi': '#4F46E5', 'HR Operational': '#10B981', 'Coding': '#06B6D4', 'Design': '#EC4899', 'Lainnya': '#6B7280' };
      if (colors[cat]) return colors[cat];
      let hash = 0;
      for (let i = 0; i < (cat || '').length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
      return `hsl(${Math.abs(hash) % 360}, 65%, 45%)`;
    },

    goToCareer() {
      globalThis.dispatchEvent(new CustomEvent('navigate-to-career-foundation'));
    },
  },

  async mounted() {
    await globalThis._workspaceStorageReady;
    try {
      const ats = WorkspaceStorage.getItem('career_ats_cv');
      if (ats) {
        const parsed = JSON.parse(ats);
        // Migrate old string experience → experienceEntries (same logic as CareerFoundation)
        if (!parsed.experienceEntries || !Array.isArray(parsed.experienceEntries) || parsed.experienceEntries.length === 0) {
          parsed.experienceEntries = [];
          if (parsed.experience && typeof parsed.experience === 'string' && parsed.experience.trim()) {
            parsed.experience.split(/\n\n+/).forEach((block, idx) => {
              const firstLine = block.trim().split('\n')[0] || '';
              const parts = firstLine.split('|').map(s => s.trim());
              const role = parts[0] || '';
              if (role) {
                parsed.experienceEntries.push({
                  id: 'exp_' + Date.now().toString(36) + '_' + idx + '_' + Math.random().toString(36).slice(2, 5),
                  role,
                  company: parts[1] || '',
                  period: parts[2] || '',
                });
              }
            });
          }
        }
        this.atsCV = { ...this.atsCV, ...parsed };
      }
    } catch(_e) {}
    try {
      const pt = WorkspaceStorage.getItem('portfolio_tasks');
      if (pt) this.portfolioTasks = JSON.parse(pt);
    } catch(_e) {}
    try {
      const en = WorkspaceStorage.getItem('portfolio_experience_notes');
      if (en) this.experienceNotes = JSON.parse(en);
    } catch(_e) {}
    this.loadKeywordBank();
    this.loadJobLogs();
    if (this.experiences.length) {
      this.selectedExpKey = this.experiences[0].key;
    }
  },
};


