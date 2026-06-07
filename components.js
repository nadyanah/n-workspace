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

// 1. My 8-4 Job Logbook Component
// 1. My 8-4 Job Logbook Component
const JobLogbook = {
  template: `
    <div class="job-logbook">
      <div v-show="!showFullNotesPage" class="animate-fade-in">
        <div class="flex-between" style="border-bottom: 2px solid var(--color-sand); padding-bottom: 16px; margin-bottom: 24px; align-items: center;">
          <div>
            <h2>My 8-9 Job Logbook</h2>
            <p style="color: var(--text-muted); font-size: 13.5px; margin-top: 4px;">Perekaman aktivitas harian kerja, kategori dinamis, hasil capaian, rencana aksi selanjutnya, dan koordinasi dokumen pendukung.</p>
          </div>
          <div class="flex-gap">
            <button class="btn text-mono" @click="exportToExcel" style="background-color: #DEF7EC; border: 1.5px solid #31C48D; color: #03543F; font-weight: bold; cursor: pointer; padding: 10px 16px; display: inline-flex; align-items: center; gap: 6px;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M8 13h8"></path><path d="M8 17h8"></path><path d="M8 9h1"></path></svg>
              Excel
            </button>
            <button class="btn text-mono" @click="exportToPDF" style="background-color: #FDE8E8; border: 1.5px solid #F05252; color: #9B1C1C; font-weight: bold; cursor: pointer; padding: 10px 16px; display: inline-flex; align-items: center; gap: 6px;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
              PDF
            </button>
            <button class="btn btn-primary" @click="showAddLog = true">
             + Catat Hari Baru
            </button>
          </div>
        </div>

        <div class="drawer-section" style="margin-bottom: 24px; padding: 20px; border-radius: 12px; background-color: transparent; border: 1.5px dashed var(--color-sand);">
          <div class="flex-between" style="align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-dark); display: flex; align-items: center; gap: 8px; margin: 0;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-terracotta);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Quick Notes
              <span style="background: var(--color-terracotta); color: #fff; font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 20px;">{{ notes.length }}</span>
            </h3>
            <button class="btn btn-secondary" @click="showFullNotesPage = true" style="font-size: 13px; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; background-color: var(--bg-card);">
              Lihat Semua Note
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
          
          <div v-if="notes.length === 0" style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13.5px;">
            Belum ada catatan. Klik "Lihat Semua Note" untuk menambahkan.
          </div>
          
          <div v-else style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
            <div v-for="note in recentNotes" :key="note.id" 
                 :style="{ backgroundColor: getNoteColorStyle(note.color).bg }"
                 style="border-radius: 16px; padding: 14px; cursor: pointer; transition: transform 0.2s;"
                 @click="showFullNotesPage = true"
                 onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
              
              <div class="flex-between" style="margin-bottom: 10px; padding: 0 4px;">
                <span :style="{ color: getNoteColorStyle(note.color).headerText }" style="font-size: 14px; font-weight: 700;">
                  {{ note.category }}
                </span>
                <span :style="{ color: getNoteColorStyle(note.color).headerText }" style="font-weight: 700; opacity: 0.6;">...</span>
              </div>
              
              <div style="background-color: #ffffff; border-radius: 12px; padding: 14px; min-height: 120px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                <div style="font-size: 10.5px; color: var(--text-muted); margin-bottom: 4px; font-weight: 600;">{{ formatDate(note.date) }}</div>
                <h4 style="font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 800; color: var(--text-dark); margin: 0 0 6px 0; line-height: 1.3;">
                  {{ note.title }}
                </h4>
                <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                  {{ note.body }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <transition name="modal-fade">
          <div v-if="showAddLog" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(44, 38, 33, 0.6); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 99999;" @click.self="showAddLog = false">
            <div style="background: var(--bg-card); max-width: 540px; width: 90%; padding: 28px; border-radius: 16px; box-shadow: 0 16px 40px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;">
              
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-size: 18px; margin: 0; color: var(--text-dark); display: flex; align-items: center; gap: 8px;">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-terracotta);"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                  Catat Logbook Harian
                </h3>
                <button @click="showAddLog = false" style="background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:24px; line-height:1;">✕</button>
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
                  <label>Langkah Selanjutnya (Next Action)</label>
                  <textarea class="form-input" v-model="form.nextAction" rows="2" placeholder="Apa rencana kelanjutan terkait tugas ini?..." required></textarea>
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
                  <button type="button" class="btn" @click="showAddLog = false" style="flex: 1; background-color: var(--bg-cream); border: 1.5px solid var(--color-sand); color: var(--text-dark); font-weight: bold; cursor: pointer; border-radius: 8px;">Batal</button>
                  <button type="submit" class="btn btn-primary" style="flex: 2;">Simpan Entri Kerja</button>
                </div>
              </form>
            </div>
          </div>
        </transition>

        <div class="drawer-section" style="margin-bottom: 24px; padding: 20px; border-radius: 12px; background: #FDFAF6; border: 1.5px solid var(--color-sand);">
          <div class="flex-between" style="align-items: center; margin-bottom: 14px;">
            <h3 style="font-size: 15px; font-weight: 700; color: var(--text-dark); display: flex; align-items: center; gap: 8px; margin: 0;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-terracotta);"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><rect x="9" y="3" width="6" height="4" rx="1"></rect><path d="M9 12h6"></path><path d="M9 16h4"></path></svg>
              Kelola Kategori Pekerjaan
            </h3>
            <button @click="showCategoryManager = !showCategoryManager" class="btn btn-secondary" style="font-size: 12px; padding: 6px 14px; cursor: pointer;">
              {{ showCategoryManager ? 'Sembunyikan' : 'Atur Kategori' }}
            </button>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: showCategoryManager ? '16px' : '0';">
            <span v-for="cat in allCategories" :key="cat"
              :style="{ backgroundColor: getCategoryColor(cat) + '15', color: getCategoryColor(cat), borderColor: getCategoryColor(cat) + '40' }"
              style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1.5px solid; display: inline-flex; align-items: center; gap: 6px;">
              {{ cat }}
              <button v-if="!defaultCategories.includes(cat)" @click="deleteCategory(cat)"
                style="background: none; border: none; cursor: pointer; font-size: 13px; line-height: 1; color: inherit; opacity: 0.6; padding: 0; display: inline-flex;"
                title="Hapus kategori">✕</button>
            </span>
          </div>

          <div v-if="showCategoryManager" style="display: flex; gap: 10px; align-items: center; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--color-sand);">
            <input type="text" class="form-input" v-model="newCategoryInput" placeholder="Nama kategori baru..."
              @keydown.enter="addCategory"
              style="flex: 1; height: 40px;" />
            <button class="btn btn-primary" @click="addCategory" style="height: 40px; padding: 0 20px; cursor: pointer; white-space: nowrap;">
              + Tambah
            </button>
          </div>
        </div>

        <div class="drawer-section" style="margin-bottom: 24px; padding: 20px; border-radius: 12px; background-color: var(--bg-cream); border: 1.5px solid var(--color-sand);">
          <div class="flex-between" style="align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-dark); display: flex; align-items: center; gap: 8px; margin: 0;">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-terracotta);"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></svg>
              Task Plan
              <span v-if="plans.length > 0" style="background: var(--color-terracotta); color: #fff; font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 20px;">{{ plans.length }}</span>
            </h3>
            <button class="btn btn-primary" @click="openAddPlan"
              style="font-size: 13px; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              {{ showAddPlan ? 'Tutup' : 'Tambah Task' }}
            </button>
          </div>

          <div v-if="showAddPlan" style="background: #fff; border: 1.5px solid var(--color-sand); border-radius: 12px; padding: 18px; margin-bottom: 16px; animation: popIn 0.2s ease;">
            <p style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-terracotta);"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
              {{ editingPlanId ? 'Edit Task Plan' : 'Tambah Task Plan Baru' }}
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group" style="margin: 0;">
                <label>Tanggal Target</label>
                <input type="date" class="form-input" v-model="planForm.date" style="height: 40px;" />
              </div>
              <div class="form-group" style="margin: 0;">
                <label>Kategori Pekerjaan</label>
                <select class="form-input" v-model="planForm.category" style="height: 40px;">
                  <option v-for="cat in allCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
            </div>
            <div class="form-group" style="margin: 0 0 12px;">
              <label>Tugas / Deskripsi</label>
              <textarea class="form-input" v-model="planForm.tasks" rows="2" placeholder="Deskripsikan tugas yang perlu dikerjakan..."></textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
              <div class="form-group" style="margin: 0;">
                <label>Prioritas</label>
                <select class="form-input" v-model="planForm.priority" style="height: 40px;">
                  <option value="Low">🟢 Low</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="High">🔴 High</option>
                </select>
              </div>
              <div class="form-group" style="margin: 0;">
                <label>Requester</label>
                <input type="text" class="form-input" v-model="planForm.requester" placeholder="Nama peminta / atasan..." style="height: 40px;" />
              </div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button class="btn btn-secondary" @click="cancelPlanForm" style="cursor: pointer; padding: 8px 18px; border-radius: 8px; font-weight: 600;">Batal</button>
              <button class="btn btn-primary" @click="savePlan" style="cursor: pointer; padding: 8px 20px; border-radius: 8px; font-weight: 600;">
                {{ editingPlanId ? 'Simpan Perubahan' : 'Simpan Task' }}
              </button>
            </div>
          </div>

          <div v-if="plans.length === 0 && !showAddPlan" style="text-align: center; padding: 32px 20px; background: #fff; border-radius: 10px; border: 1.5px dashed var(--color-sand);">
            <p style="font-size: 28px; margin-bottom: 8px;">📋</p>
            <p style="font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 4px;">Belum ada task yang direncanakan</p>
            <p style="font-size: 12.5px; color: var(--text-muted);">Klik "Tambah Task" untuk mulai merencanakan pekerjaanmu</p>
          </div>

          <div v-if="plans.length > 0" style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
            <span style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap;">Filter Prioritas:</span>
            <button @click="planFilterPriority = ''"
              :style="{ background: planFilterPriority === '' ? 'var(--color-terracotta)' : '#ffffff', color: planFilterPriority === '' ? '#fff' : 'var(--text-dark)', borderColor: planFilterPriority === '' ? 'var(--color-terracotta)' : 'var(--color-sand)' }"
              style="border: 1.5px solid; border-radius: 20px; padding: 3px 12px; font-size: 11.5px; font-weight: 700; cursor: pointer; transition: all 0.15s;">
              Semua <span style="opacity:0.8;">({{ plans.length }})</span>
            </button>
            <button @click="planFilterPriority = 'High'"
              :style="{ background: planFilterPriority === 'High' ? '#B91C1C' : '#ffffff', color: planFilterPriority === 'High' ? '#fff' : '#B91C1C', borderColor: '#FCA5A5' }"
              style="border: 1.5px solid; border-radius: 20px; padding: 3px 12px; font-size: 11.5px; font-weight: 700; cursor: pointer; transition: all 0.15s;">
              🔴 High <span style="opacity:0.8;">({{ plans.filter(p => p.priority === 'High').length }})</span>
            </button>
            <button @click="planFilterPriority = 'Medium'"
              :style="{ background: planFilterPriority === 'Medium' ? '#854D0E' : '#ffffff', color: planFilterPriority === 'Medium' ? '#fff' : '#854D0E', borderColor: '#FDE047' }"
              style="border: 1.5px solid; border-radius: 20px; padding: 3px 12px; font-size: 11.5px; font-weight: 700; cursor: pointer; transition: all 0.15s;">
              🟡 Medium <span style="opacity:0.8;">({{ plans.filter(p => p.priority === 'Medium').length }})</span>
            </button>
            <button @click="planFilterPriority = 'Low'"
              :style="{ background: planFilterPriority === 'Low' ? '#166534' : '#ffffff', color: planFilterPriority === 'Low' ? '#fff' : '#166534', borderColor: '#86EFAC' }"
              style="border: 1.5px solid; border-radius: 20px; padding: 3px 12px; font-size: 11.5px; font-weight: 700; cursor: pointer; transition: all 0.15s;">
              🟢 Low <span style="opacity:0.8;">({{ plans.filter(p => p.priority === 'Low').length }})</span>
            </button>
          </div>

          <div v-if="plans.length > 0 && sortedFilteredPlans.length === 0" style="text-align: center; padding: 20px; background: #fff; border-radius: 10px; border: 1.5px dashed var(--color-sand);">
            <p style="font-size: 13px; color: var(--text-muted);">Tidak ada task dengan prioritas <strong>{{ planFilterPriority }}</strong>.</p>
          </div>

          <div v-if="sortedFilteredPlans.length > 0"
            style="display: flex; flex-direction: column; gap: 10px; max-height: 420px; overflow-y: auto; padding-right: 4px; scrollbar-width: thin; scrollbar-color: var(--color-sand) transparent;">
            
            <div v-for="(plan, idx) in sortedFilteredPlans" :key="plan.id"
              style="background: #fff; border: 1.5px solid var(--color-sand); border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; transition: box-shadow 0.2s, border-color 0.2s;"
              @mouseenter="$event.currentTarget.style.boxShadow='0 4px 16px rgba(214,123,82,0.10)'; $event.currentTarget.style.borderColor='var(--color-gold)'"
              @mouseleave="$event.currentTarget.style.boxShadow='none'; $event.currentTarget.style.borderColor='var(--color-sand)'">
              
              <div class="flex-between" style="align-items: flex-start; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 1;">
                  <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {{ formatDate(plan.date) }}
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
                  <button @click="convertPlanToLog(plan)"
                    title="Tandai sudah dikerjakan → pindah ke Riwayat"
                    style="background: #ECFDF5; color: #065F46; border: 1.5px solid #6EE7B7; border-radius: 8px; padding: 4px 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Selesai
                  </button>
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
              
              <p style="font-size: 13.5px; color: var(--text-dark); margin: 0; line-height: 1.5;">{{ plan.tasks }}</p>
            </div>

          </div>
        </div>

        <div class="drawer-section" style="margin-bottom: 24px; padding: 20px; border-radius: 12px; background-color: var(--bg-cream); border: 1.5px solid var(--color-sand);">
          <h3 style="font-size: 15px; margin-bottom: 14px; color: var(--text-dark); display: flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            Penyaringan & Pencarian Log Kerja
          </h3>
          <div style="display: grid; grid-template-columns: 2fr 1.4fr 1fr 1fr; gap: 16px; align-items: end;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 12px; font-weight: 600; color: var(--text-muted);">Cari Kata Kunci</label>
              <input type="text" class="form-input" v-model="searchQuery" placeholder="Cari berasarkan tugas, kategori, hasil, dsb..." />
            </div>
            <div class="form-group" style="margin-bottom: 0; position: relative;">
              <label style="font-size: 12px; font-weight: 600; color: var(--text-muted);">Rentang Tanggal</label>
              <button type="button" class="form-input" @click.stop="showRangePicker = !showRangePicker"
                style="width: 100%; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px; background: #fff; height: 42px; box-sizing: border-box; white-space: nowrap; overflow: hidden;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; color: var(--color-terracotta);"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span style="font-size: 12.5px; color: var(--text-dark); overflow: hidden; text-overflow: ellipsis;">
                  <template v-if="filterStartDate || filterEndDate">
                    {{ filterStartDate ? formatDate(filterStartDate) : '?' }} – {{ filterEndDate ? formatDate(filterEndDate) : '?' }}
                  </template>
                  <template v-else><span style="color: var(--text-muted);">Pilih rentang tanggal...</span></template>
                </span>
              </button>
              <div v-if="showRangePicker" @click.stop style="position: absolute; top: calc(100% + 6px); left: 0; z-index: 999; background: #fff; border: 1.5px solid var(--color-sand); border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.13); padding: 16px; min-width: 280px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                  <button type="button" @click="rangeCalPrevMonth" style="background: none; border: none; cursor: pointer; font-size: 16px; color: var(--text-dark); padding: 4px 8px; border-radius: 6px; line-height: 1;">&lt;</button>
                  <span style="font-weight: 700; font-size: 14px; color: var(--text-dark);">{{ rangeCalMonthLabel }}</span>
                  <button type="button" @click="rangeCalNextMonth" style="background: none; border: none; cursor: pointer; font-size: 16px; color: var(--text-dark); padding: 4px 8px; border-radius: 6px; line-height: 1;">&gt;</button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 4px;">
                  <span v-for="(d, i) in ['S','S','R','K','J','S','M']" :key="'h'+i" style="text-align: center; font-size: 10.5px; font-weight: 700; color: var(--text-muted); padding: 2px 0;">{{ d }}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;">
                  <span v-for="cell in rangeCalCells" :key="cell.key" @click="cell.date ? onRangeCalClick(cell.date) : null"
                    :style="getRangeCellStyle(cell)"
                    style="text-align: center; font-size: 13px; padding: 6px 2px; border-radius: 7px; cursor: pointer; user-select: none; transition: background 0.12s;">
                    {{ cell.label }}
                  </span>
                </div>
                <div style="margin-top: 10px; font-size: 11px; color: var(--text-muted); text-align: center; line-height: 1.4;">
                  <span v-if="!filterStartDate">Klik tanggal mulai</span>
                  <span v-else-if="!filterEndDate">Klik tanggal akhir</span>
                  <span v-else style="color: var(--color-terracotta); font-weight: 600;">✓ Rentang dipilih — klik lagi untuk reset</span>
                </div>
                <button v-if="filterStartDate || filterEndDate" type="button" @click="filterStartDate=''; filterEndDate=''; showRangePicker=false;"
                  style="margin-top: 8px; width: 100%; background: var(--bg-cream); border: 1px solid var(--color-sand); color: var(--text-dark); border-radius: 7px; padding: 6px; font-size: 12px; cursor: pointer; font-weight: 600;">
                  Hapus Rentang
                </button>
              </div>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 12px; font-weight: 600; color: var(--text-muted);">Filter Kategori</label>
              <select class="form-input" v-model="filterCategory" style="height: 42px;">
                <option value="">Semua Kategori</option>
                <option v-for="cat in allCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <button class="btn btn-secondary" style="width: 100%; height: 42px; cursor: pointer; justify-content: center;" @click="resetFilters">Reset Filter</button>
            </div>
          </div>
        </div>

        <div class="grid-2" style="grid-template-columns: 1.5fr 1fr; gap: 24px; margin-bottom: 24px; align-items: stretch;">
          <div class="drawer-section" style="margin-bottom: 0; padding: 20px; border-radius: 12px; display: flex; flex-direction: column; justify-content: space-between;">
            <div class="flex-between" style="border-bottom: 1.5px solid var(--color-sand); padding-bottom: 12px; margin-bottom: 14px; flex-wrap: wrap; gap: 12px;">
              <h3 style="font-size: 15px; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-terracotta);"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                Ringkasan Analitik Performa
              </h3>
              <div style="display: flex; gap: 4px; background: var(--bg-cream); border: 1.5px solid var(--color-sand); border-radius: 8px; padding: 2px;">
                <button class="btn" :style="analyticsPeriod === 'semua' ? { background: 'var(--color-terracotta)', color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '6px' } : { background: 'transparent', color: 'var(--text-dark)', fontSize: '11px', padding: '4px 10px' }" @click="analyticsPeriod = 'semua'">Semua</button>
                <button class="btn" :style="analyticsPeriod === 'today' ? { background: 'var(--color-terracotta)', color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '6px' } : { background: 'transparent', color: 'var(--text-dark)', fontSize: '11px', padding: '4px 10px' }" @click="analyticsPeriod = 'today'">Hari Ini</button>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
              <div style="background-color: var(--bg-cream); border: 1px solid var(--color-sand); border-radius: 12px; padding: 14px; text-align: center;">
                <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Pekerjaan</span>
                <p class="text-mono" style="font-size: 24px; font-weight: bold; color: var(--text-dark); margin-top: 6px;">{{ filteredLogs.length }}</p>
              </div>
              <div style="background-color: var(--bg-cream); border: 1px solid var(--color-sand); border-radius: 12px; padding: 14px; text-align: center;">
                <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Task Plan</span>
                <p class="text-mono" style="font-size: 24px; font-weight: bold; color: var(--text-dark); margin-top: 6px;">{{ plans.length }}</p>
              </div>
              <div style="background-color: var(--bg-cream); border: 1px solid var(--color-sand); border-radius: 12px; padding: 14px; text-align: center;">
                <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Jumlah Hari Rentang</span>
                <p class="text-mono" style="font-size: 24px; font-weight: bold; color: var(--text-dark); margin-top: 6px;">{{ selectedRangeDaysCount }} <span style="font-size: 11px; font-weight: normal;">hari</span></p>
              </div>
              <div style="background-color: var(--bg-cream); border: 1px solid var(--color-sand); border-radius: 12px; padding: 14px; text-align: center;">
                <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Penyelesaian Aksi</span>
                <p class="text-mono" style="font-size: 24px; font-weight: bold; color: var(--text-dark); margin-top: 6px;">{{ nextActionCompletionRate }}</p>
              </div>
            </div>
          </div>
          <div class="drawer-section" style="margin-bottom: 0; padding: 20px; border-radius: 12px; display: flex; flex-direction: column; justify-content: space-between;">
            <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 12px; border-bottom: 1.5px solid var(--color-sand); padding-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-sage);"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></svg>
              Distribusi Kategori
            </h3>
            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 120px; overflow-y: auto; padding-right: 4px;">
              <div v-for="(pct, cat) in categoryPercentages" :key="cat">
                <div class="flex-between" style="font-size: 11.5px; margin-bottom: 4px;">
                  <span style="font-weight: 600; color: var(--text-dark);">{{ cat }}</span>
                  <span class="text-mono" style="font-weight: bold; color: var(--text-muted);">{{ pct.count }}x ({{ pct.percentage }}%)</span>
                </div>
                <div style="width: 100%; background-color: var(--color-sand); height: 6px; border-radius: 10px; overflow: hidden;">
                  <div :style="{ width: pct.percentage + '%', backgroundColor: getCategoryColor(cat) }" style="height: 100%; border-radius: 10px; transition: width 0.3s ease;"></div>
                </div>
              </div>
              <div v-if="filteredLogs.length === 0" style="text-align: center; font-size: 12px; color: var(--text-muted); font-style: italic; margin-top: 10px;">
                Tidak ada data dalam filter aktif ini.
              </div>
            </div>
          </div>
        </div>

        <div class="drawer-section" style="margin-bottom: 0; padding: 22px; border-radius: 12px; min-width: 0; overflow: visible;">
          <div class="flex-between" style="margin-bottom: 18px; align-items: center;">
            <h3 style="font-size: 18px; margin-bottom: 0;">Riwayat Kegiatan Kerja</h3>
            <div class="flex-gap" style="align-items: center; font-size: 13px; color: var(--text-muted);">
              <span>Tampilkan</span>
              <select v-model="itemsPerPage" class="form-input" style="width: 75px; padding: 4px 8px; font-size: 13px; height: auto;">
                <option :value="5">5 entri</option>
                <option :value="10">10 entri</option>
                <option :value="20">20 entri</option>
              </select>
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
                    <td style="min-width: 180px; max-width: 220px; font-size: 13.5px; line-height: 1.4;">
                      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
                        <span :style="log.nextActionCompleted ? { textDecoration: 'line-through', opacity: 0.5, color: '#10B981' } : {}" style="font-style: italic; color: var(--text-muted); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;" :title="log.nextAction">{{ log.nextAction }}</span>
                        <button v-if="log.nextAction && log.nextAction.trim().length > 0"
                                @click="logNextAction(log)"
                                :disabled="log.nextActionCompleted"
                                :title="log.nextActionCompleted ? 'Tindakan Selesai!' : 'Catat Tindakan ini ke Hari Baru'"
                                style="border-radius: 6px; padding: 4px 6px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid; font-size: 11px; font-weight: bold; cursor: pointer; min-width: 28px; height: 24px; transition: all 0.2s; flex-shrink: 0;"
                                :style="log.nextActionCompleted ? { backgroundColor: '#DEF7EC', color: '#0E9F6E', borderColor: '#81E3B4', cursor: 'default' } : { backgroundColor: '#EBF5FF', color: '#1C64F2', borderColor: '#A4CAFE' }">
                          <svg v-if="log.nextActionCompleted" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <svg v-else viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
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
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 8px; margin-bottom: 4px;">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); opacity: 0.5;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              <span style="font-size: 11px; color: var(--text-muted); opacity: 0.6; font-style: italic; letter-spacing: 0.03em;">geser tabel untuk melihat lebih banyak kolom</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); opacity: 0.5;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </div>
            <div class="flex-between" style="margin-top: 20px; padding-top: 14px; border-top: 1.5px solid var(--color-sand); align-items: center;">
              <span style="font-size: 13px; color: var(--text-muted);">Menampilkan <strong>{{ paginationInfo.start }}</strong> sampai <strong>{{ paginationInfo.end }}</strong> dari <strong>{{ filteredAndSortedLogs.length }}</strong> entri</span>
              <div class="flex-gap" style="gap: 6px;">
                <button class="btn btn-secondary" :disabled="currentPage === 1" @click="currentPage--" style="padding: 6px 12px; font-size: 13px; cursor: pointer; border-radius: 8px;">◀ Seb</button>
                <button class="btn btn-secondary" v-for="page in totalPages" :key="page" @click="currentPage = page" :style="currentPage === page ? { background: 'var(--color-terracotta)', color: '#fff', borderColor: 'var(--color-terracotta)', fontWeight: 'bold' } : {}" style="padding: 6px 12px; font-size: 13px; cursor: pointer; border-radius: 8px; min-width: 32px; text-align: center;">{{ page }}</button>
                <button class="btn btn-secondary" :disabled="currentPage === totalPages" @click="currentPage++" style="padding: 6px 12px; font-size: 13px; cursor: pointer; border-radius: 8px;">Sel ▶</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="showFullNotesPage" class="animate-fade-in" style="animation: popIn 0.3s ease;">
        <div class="flex-between" style="border-bottom: 2px solid var(--color-sand); padding-bottom: 16px; margin-bottom: 24px; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button class="btn btn-secondary" @click="showFullNotesPage = false" style="padding: 8px; border-radius: 8px;" title="Kembali ke Logbook">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <div>
              <h2 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--color-terracotta)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                All Notes
              </h2>
              <p style="color: var(--text-muted); font-size: 13.5px; margin-top: 2px;">Simpan ide, referensi, atau rekap meeting dengan rapi.</p>
            </div>
          </div>
          <button class="btn btn-primary" @click="openAddNoteForm">
            + Note Baru
          </button>
        </div>

        <div style="display: flex; gap: 12px; margin-bottom: 24px; align-items: center; background: #fff; padding: 12px; border-radius: 12px; border: 1.5px solid var(--color-sand);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            <span style="font-size: 13px; font-weight: 700; color: var(--text-muted);">Filters:</span>
          </div>
          <input type="date" class="form-input" v-model="noteFilterDate" style="height: 38px; width: auto;" title="Filter berdasarkan tanggal dibuat" />
          <select class="form-input" v-model="noteFilterCategory" style="height: 38px; width: auto;">
            <option value="">Semua Kategori</option>
            <option v-for="cat in noteCategories" :key="'filter-' + cat" :value="cat">{{ cat }}</option>
          </select>
          <button v-if="noteFilterDate || noteFilterCategory" class="btn btn-secondary" @click="noteFilterDate=''; noteFilterCategory=''" style="height: 38px; font-size: 12px;">Reset</button>
        </div>

        <div v-if="filteredNotes.length === 0" style="text-align: center; padding: 60px 20px; color: var(--text-muted); border: 1.5px dashed var(--color-sand); border-radius: 16px; background: var(--bg-cream);">
          <p style="font-size: 32px; margin-bottom: 12px;">📝</p>
          <p style="font-size: 15px; font-weight: 600;">Belum ada catatan yang ditemukan.</p>
        </div>

        <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
          <div v-for="note in filteredNotes" :key="note.id" 
               :style="{ backgroundColor: getNoteColorStyle(note.color).bg }"
               style="border-radius: 16px; padding: 16px; position: relative; transition: all 0.2s;"
               onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 24px rgba(0,0,0,0.06)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            
            <div class="flex-between" style="margin-bottom: 12px; padding: 0 4px;">
              <span :style="{ color: getNoteColorStyle(note.color).headerText }" style="font-size: 15px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                {{ note.category }}
              </span>
              <div style="display: flex; gap: 4px;">
                <button @click="editNote(note)" title="Edit Note" style="background: none; border: none; cursor: pointer; padding: 4px; opacity: 0.6;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" :stroke="getNoteColorStyle(note.color).headerText" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button @click="deleteNote(note.id)" title="Hapus Note" style="background: none; border: none; cursor: pointer; padding: 4px; opacity: 0.6;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" :stroke="getNoteColorStyle(note.color).headerText" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>

            <div style="background-color: #ffffff; border-radius: 12px; padding: 16px; min-height: 120px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;">{{ formatDate(note.date) }}</div>
              <h3 :style="{ color: getNoteColorStyle(note.color).text }" style="font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.3;">
                {{ note.title }}
              </h3>
              <p :style="{ color: getNoteColorStyle(note.color).text }" style="font-size: 13px; color: var(--text-muted); line-height: 1.5; opacity: 0.9; margin: 0; white-space: pre-wrap;">
                {{ note.body }}
              </p>
            </div>
          </div>
        </div>

        <transition name="modal-fade">
          <div v-if="showAddNoteForm" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(44, 38, 33, 0.6); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 99999;" @click.self="cancelNoteForm">
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

                <div class="form-group" style="margin-bottom: 24px;">
                  <label>Isi Note</label>
                  <textarea class="form-input" v-model="noteForm.body" rows="6" placeholder="Ketik isi catatan di sini..." required></textarea>
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
    </div>
  `,
  data() {
    return {
      // Data Logbook yang lama
      showAddLog: false,
      syncToContentOnSave: false,
      logs: [],
      plans: [],
      customCategories: [],
      newCategoryInput: '',
      showCategoryManager: false,
      showAddPlan: false,
      editingPlanId: null,
      planFilterPriority: '',
      planForm: {
        date: new Date().toISOString().split('T')[0],
        category: 'Administrasi',
        tasks: '',
        priority: 'Medium',
        requester: ''
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
      form: {
        date: new Date().toISOString().split('T')[0],
        category: 'Administrasi',
        tasks: '',
        achievements: '',
        nextAction: '',
        documentLink: ''
      },
      
      // Data Khusus Fitur Notes
      showFullNotesPage: false,
      showAddNoteForm: false,
      showNoteCatManager: false,
      newNoteCatInput: '',
      noteFilterCategory: '',
      noteFilterDate: '',
      notes: [],
      noteCategories: ['Psychology', 'Groceries', 'Work', 'Ideas'],
      editingNoteId: null, // Baru: untuk menyimpan ID note yang sedang di-edit
      noteForm: {
        category: 'Work',
        title: '',
        body: ''
      }
    };
  },
  computed: {
    // Computed Logbook (Existing)
    todayStr() {
      return new Date().toISOString().split('T')[0];
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
        const matchesQuery = !q || ['category','tasks','achievements','nextAction','documentLink'].some(k => log[k] && log[k].toLowerCase().includes(q));
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
      const logsWithNextAction = this.filteredLogs.filter(l => l.nextAction && l.nextAction.trim().length > 0);
      if (logsWithNextAction.length === 0) return '0%';
      const completedCount = logsWithNextAction.filter(l => l.nextActionCompleted).length;
      return Math.round((completedCount / logsWithNextAction.length) * 100) + '%';
    },
    sortedFilteredPlans() {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      const today = this.todayStr;
      return [...this.plans]
        .filter(p => !this.planFilterPriority || p.priority === this.planFilterPriority)
        .sort((a, b) => {
          const aOverdue = a.date < today;
          const bOverdue = b.date < today;
          const aToday  = a.date === today;
          const bToday  = b.date === today;
          const aGroup  = aOverdue ? 0 : aToday ? 1 : 2;
          const bGroup  = bOverdue ? 0 : bToday ? 1 : 2;
          if (aGroup !== bGroup) return aGroup - bGroup;
          if (aOverdue) {
            if (a.date !== b.date) return a.date < b.date ? -1 : 1;
          } else {
            if (a.date !== b.date) return a.date < b.date ? -1 : 1;
          }
          return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
        });
    },
    filteredAndSortedLogs() {
      const sorted = [...this.logs.filter(log => {
        const q = this.searchQuery.toLowerCase().trim();
        const matchesQuery = !q || ['category','tasks','achievements','nextAction','documentLink'].some(k => log[k] && log[k].toLowerCase().includes(q));
        const matchesCategory = !this.filterCategory || log.category === this.filterCategory;
        const matchesDates = (!this.filterStartDate || new Date(log.date) >= new Date(this.filterStartDate)) && (!this.filterEndDate || new Date(log.date) <= new Date(this.filterEndDate));
        return matchesQuery && matchesCategory && matchesDates;
      })];
      sorted.sort((a, b) => {
        let valA = this.sortBy === 'date' ? new Date(a[this.sortBy] || 0) : (a[this.sortBy] || '').toString().toLowerCase();
        let valB = this.sortBy === 'date' ? new Date(b[this.sortBy] || 0) : (b[this.sortBy] || '').toString().toLowerCase();
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
      return this.notes.filter(n => {
        const matchCat = !this.noteFilterCategory || n.category === this.noteFilterCategory;
        const matchDate = !this.noteFilterDate || n.date === this.noteFilterDate;
        return matchCat && matchDate;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },
  created() {
    // Load Logbook Data
    const savedCats = WorkspaceStorage.getItem('personal_workspace_job_categories');
    if (savedCats) { try { this.customCategories = JSON.parse(savedCats); } catch (e) { this.customCategories = []; } }
    const savedPlans = WorkspaceStorage.getItem('personal_workspace_job_plans');
    if (savedPlans) { try { this.plans = JSON.parse(savedPlans); } catch (e) { this.plans = []; } }
    const saved = WorkspaceStorage.getItem('personal_workspace_job_logs');
    if (saved) {
      try {
        this.logs = JSON.parse(saved);
        this.logs.forEach((l, i) => { if (!l.id) l.id = 'log-' + i + '-' + Date.now(); });
      } catch (e) { this.logs = []; }
    }
    
    // Load Notes Data
    const savedNotes = WorkspaceStorage.getItem('personal_workspace_job_notes');
    if (savedNotes) { try { this.notes = JSON.parse(savedNotes); } catch(e) { this.notes = []; } }
    const savedNoteCats = WorkspaceStorage.getItem('personal_workspace_job_note_cats');
    if (savedNoteCats) { try { this.noteCategories = JSON.parse(savedNoteCats); } catch(e) {} }
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
      this.planForm.category = this.allCategories[0] || 'Administrasi';
      this.planForm.priority = 'Medium';
      this.planForm.requester = '';
      this.showAddPlan = true;
    },
    startEditPlan(plan) {
      this.editingPlanId = plan.id;
      this.planForm.date = plan.date;
      this.planForm.category = plan.category;
      this.planForm.tasks = plan.tasks;
      this.planForm.priority = plan.priority || 'Medium';
      this.planForm.requester = plan.requester || '';
      this.showAddPlan = true;
      this.$nextTick(() => {
        const el = document.querySelector('.job-logbook');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },
    cancelPlanForm() {
      this.showAddPlan = false;
      this.editingPlanId = null;
      this.planForm.tasks = '';
      this.planForm.date = this.todayStr;
      this.planForm.priority = 'Medium';
      this.planForm.requester = '';
    },
    savePlan() {
      if (!this.planForm.tasks.trim()) { alert('Tugas tidak boleh kosong!'); return; }
      if (this.editingPlanId) {
        const idx = this.plans.findIndex(p => p.id === this.editingPlanId);
        if (idx !== -1) {
          this.plans[idx].date = this.planForm.date;
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
          category: this.planForm.category,
          tasks: this.planForm.tasks.trim(),
          priority: this.planForm.priority,
          requester: this.planForm.requester.trim()
        };
        this.plans.unshift(newPlan);
      }
      this.savePlansToStorage();
      this.planForm.tasks = '';
      this.planForm.date = this.todayStr;
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
    convertPlanToLog(plan) {
      this.form.date = plan.date;
      this.form.category = this.allCategories.includes(plan.category) ? plan.category : this.allCategories[0];
      this.form.tasks = plan.tasks;
      this.form.achievements = '';
      this.form.nextAction = '';
      this.form.documentLink = '';
      this.plans = this.plans.filter(p => p.id !== plan.id);
      this.savePlansToStorage();
      this.showAddLog = true;
      this.$nextTick(() => {
        const formEl = document.querySelector('.job-logbook');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
      });
    },
    savePlansToStorage() {
      WorkspaceStorage.setItem('personal_workspace_job_plans', JSON.stringify(this.plans));
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
    formatDate(d) {
      try { return new Date(d).toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); }
      catch (e) { return d; }
    },
    getCategoryColor(cat) {
      const colors = { 'Administrasi': '#4F46E5', 'HR Operational': '#10B981', 'Coding': '#06B6D4', 'Design': '#EC4899', 'Lainnya': '#6B7280' };
      if (colors[cat]) return colors[cat];
      let hash = 0;
      for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
      return `hsl(${Math.abs(hash) % 360}, 65%, 45%)`;
    },
    saveLog() {
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
        nextAction: this.form.nextAction,
        documentLink: this.form.documentLink
      };
      this.logs.unshift(newLog);
      this.saveToStorage();
      const shouldSync = this.syncToContentOnSave;
      this.form = { date: this.todayStr, category: 'Administrasi', tasks: '', achievements: '', nextAction: '', documentLink: '' };
      this.showAddLog = false;
      this.currentPage = 1;
      if (shouldSync) { this.syncToContent(newLog); this.syncToContentOnSave = false; }
    },
    logNextAction(log) {
      this.form.tasks = log.nextAction;
      this.form.category = this.allCategories.includes(log.category) ? log.category : 'Administrasi';
      this.form.date = this.todayStr;
      this.form.achievements = '';
      this.form.nextAction = '';
      this.form.documentLink = '';
      this.pendingNextActionSourceLogId = log.id;
      this.showAddLog = true;
      this.$nextTick(() => { const el = document.querySelector('.job-logbook'); if (el) el.scrollIntoView({ behavior: 'smooth' }); });
    },
    syncToContent(log) {
      window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'contentTracker' }));
      setTimeout(() => { window.dispatchEvent(new CustomEvent('sync-logbook-content', { detail: { tasks: log.tasks, achievements: log.achievements, category: log.category } })); }, 250);
    },
    deleteLogById(id) {
      if (confirm('Yakin ingin menghapus catatan log kerja ini?')) { this.logs = this.logs.filter(l => l.id !== id && l.date !== id); this.saveToStorage(); }
    },
    toggleSort(field) { if (this.sortBy === field) this.sortDesc = !this.sortDesc; else { this.sortBy = field; this.sortDesc = true; } },
    resetFilters() { this.searchQuery = ''; this.filterStartDate = ''; this.filterEndDate = ''; this.filterCategory = ''; this.showRangePicker = false; },
    saveToStorage() { WorkspaceStorage.setItem('personal_workspace_job_logs', JSON.stringify(this.logs)); },
    exportToExcel() {
      const dataToExport = this.logs.map(log => ({ Tanggal: log.date, Kategori: log.category, 'Tugas / Pekerjaan': log.tasks, Capaian: log.achievements, 'Aksi Selanjutnya': log.nextAction, 'Tautan Dokumen': log.documentLink }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Job Logbook');
      XLSX.writeFile(workbook, 'Job_Logbook_' + new Date().toISOString().slice(0, 10) + '.xlsx');
    },
    exportToPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(44, 38, 33);
      doc.text('Aesthetic Job Logbook', 14, 18);
      doc.setFont('Helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(120, 111, 102);
      doc.text('Daftar riwayat pencatatan tugas, capaian kerja harian, dan dokumen pendukung.', 14, 24);
      doc.autoTable({
        startY: 28,
        head: [['Tanggal', 'Kategori', 'Tugas / Aktivitas', 'Hasil Capaian', 'Aksi Selanjutnya']],
        body: this.logs.map(log => [log.date, log.category, log.tasks || '-', log.achievements || '-', log.nextAction || '-']),
        headStyles: { fillColor: [141, 110, 99], textColor: [255, 255, 255], fontStyle: 'bold' },
        bodyStyles: { textColor: [44, 38, 33], fontSize: 9 },
        alternateRowStyles: { fillColor: [253, 251, 247] },
        margin: { left: 14, right: 14 }
      });
      doc.save('Job_Logbook_' + new Date().toISOString().slice(0, 10) + '.pdf');
    },

    // ── Methods Khusus Fitur Notes ──
    openAddNoteForm() {
      this.editingNoteId = null;
      this.noteForm.title = '';
      this.noteForm.body = '';
      this.noteForm.category = this.noteCategories[0] || 'Work';
      this.showAddNoteForm = true;
    },
    editNote(note) {
      this.editingNoteId = note.id;
      this.noteForm.title = note.title;
      this.noteForm.category = note.category;
      this.noteForm.body = note.body;
      this.showAddNoteForm = true;
    },
    cancelNoteForm() {
      this.showAddNoteForm = false;
      this.editingNoteId = null;
      this.noteForm.title = '';
      this.noteForm.body = '';
    },
    saveNote() {
      if (this.editingNoteId) {
        const idx = this.notes.findIndex(n => n.id === this.editingNoteId);
        if (idx !== -1) {
          this.notes[idx].title = this.noteForm.title;
          this.notes[idx].category = this.noteForm.category;
          this.notes[idx].body = this.noteForm.body;
        }
        this.editingNoteId = null;
      } else {
        const colors = ['pink', 'blue', 'green', 'yellow', 'purple'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const newN = {
          id: 'note-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          category: this.noteForm.category,
          title: this.noteForm.title,
          body: this.noteForm.body,
          color: randomColor
        };
        this.notes.unshift(newN);
      }
      this.saveNotesToStorage();
      this.showAddNoteForm = false;
      this.noteForm.title = '';
      this.noteForm.body = '';
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
        pink: { bg: '#FCE7F3', headerText: '#831843', text: '#2C2621', border: '#f3ccde' },
        blue: { bg: '#DBEAFE', headerText: '#1E3A8A', text: '#2C2621', border: '#becdef' },
        green: { bg: '#D1FAE5', headerText: '#065F46', text: '#2C2621', border: '#bce7c4' },
        yellow: { bg: '#FEF3C7', headerText: '#92400E', text: '#2C2621', border: '#f5f7c4' },
        purple: { bg: '#F3E8FF', headerText: '#4C1D95', text: '#2C2621', border: '#fecbbd' }
      };
      return styles[color] || styles.pink;
    }
  },
  mounted() {
    this._closeRangePicker = () => { if (this.showRangePicker) this.showRangePicker = false; };
    document.addEventListener('click', this._closeRangePicker);
  },
  unmounted() {
    document.removeEventListener('click', this._closeRangePicker);
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
          <h2 style="font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: #3E352F; margin: 0 0 4px 0; line-height: 1.2;">My Memories & Growth</h2>
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

      <!-- VIEW B: GELAS KENANGAN LINEAR FEED TIMELINE (Centered and spanning full width) -->
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
                      </div>

                      <!-- Title of memory -->
                      <h3 class="timeline-moment-title" style="margin: 0 0 8px 0; color: #3E352F; font-size: 18px; font-family: 'Outfit', sans-serif; font-weight: 800; line-height: 1.3; text-align: left;">
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
              <h3 style="font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 850; color: #3E352F; margin: 0 0 10px 0; text-align: center; line-height: 1.3; pointer-events: auto;">
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
        <div class="moment-modal animate-fade-in" style="max-height: 90vh; overflow-y: auto; width: 100%; max-width: 1000px; padding: 24px; border-radius: var(--border-radius-md); box-shadow: var(--shadow-lg); background-color: #FFFFFF;">
          <!-- Modal Header -->
          <div class="flex-between" style="border-bottom: 2px solid var(--color-sand); margin-bottom: 20px; padding-bottom: 14px;">
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 19px; font-weight: 800; color: var(--text-dark); display: inline-flex; align-items: center; gap: 8px; margin: 0;">
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

            <div v-else style="display: grid; grid-template-columns: repeat(auto-fit, minmax(430px, 1fr)); gap: 20px; max-height: 52vh; overflow-y: auto; padding-right: 6px; margin-bottom: 8px;">
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
  created() {
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
      } catch (e) {
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
    window.addEventListener('mousemove', this.handleDragPhotoMove);
    window.addEventListener('mouseup', this.handleDragPhotoEnd);
    window.addEventListener('touchmove', this.handleDragPhotoMove, { passive: false });
    window.addEventListener('touchend', this.handleDragPhotoEnd);
    window.addEventListener('scroll', this.handleScrollRotation);
    window.addEventListener('click', this.handleDocumentClick);
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.handleDragPhotoMove);
    window.removeEventListener('mouseup', this.handleDragPhotoEnd);
    window.removeEventListener('touchmove', this.handleDragPhotoMove);
    window.removeEventListener('touchend', this.handleDragPhotoEnd);
    window.removeEventListener('scroll', this.handleScrollRotation);
    window.removeEventListener('click', this.handleDocumentClick);
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
      
      const isMobile = window.innerWidth < 640;
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
      this.scrollRotation = window.scrollY * 0.12;
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
        <h2 style="font-family: 'Playfair Display', serif; font-weight: 700; color: var(--text-dark);">Content Plan & Tracker</h2>
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
                    {{ item.dueDate }}
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
            <h3 style="font-family: 'Playfair Display', serif; font-weight: 700; color: var(--text-dark);">
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
            <h3 style="font-family: 'Playfair Display', serif; font-weight: 700; color: var(--text-dark); margin: 0;">Pengaturan Kanban & Atribut</h3>
            <button class="close-btn" @click="showSettingsModal = false">×</button>
          </div>
          
          <!-- Column Management -->
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 13.5px; font-family: 'Outfit', sans-serif; font-weight: 700; color: #7A6F66; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Kustom Kolom / Tahapan Status</h4>
            
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
            <h4 style="font-size: 13.5px; font-family: 'Outfit', sans-serif; font-weight: 700; color: #7A6F66; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Atribut Property Visibility (Kartu Depan)</h4>
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
            <h4 style="font-size: 13.5px; font-family: 'Outfit', sans-serif; font-weight: 700; color: #7A6F66; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Warna Visual Notifikasi Urgensi Rilis</h4>
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
        <h4 style="font-family: 'Outfit', sans-serif; font-size: 13.5px; font-weight: 700; color: #1C3B34; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
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
        dueDate: new Date().toISOString().split('T')[0],
        notes: '',
        username: '@nadya'
      }
    };
  },
  created() {
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
      } catch (e) {
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
    window.addEventListener('sync-logbook-content', this.handleSyncEvent);
  },
  beforeUnmount() {
    if (this.handleSyncEvent) {
      window.removeEventListener('sync-logbook-content', this.handleSyncEvent);
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
      } catch (e) {
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

      <!-- ═══ HEADER ═══ -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: #2C2621; margin: 0; display: flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-terracotta);"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            Daily Interview Practice
          </h2>
          <p style="color: var(--text-muted); font-size: 13.5px; margin-top: 4px;">Practice Room : Tarik tuas, acak pertanyaan, rekam suara dengan framework STAR/PREP/PPF.</p>
        </div>
        <!-- Mode switcher + Kelola button -->
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <!-- Mode Toggle Pill -->
          <div style="display: flex; gap: 2px; background: #F3EDE5; border: 1.5px solid #EAE5DD; border-radius: 10px; padding: 3px;">
            <button type="button" @click="setMode('manual')"
                    :style="activeMode==='manual' ? {background:'#1C3B34',color:'#fff'} : {background:'transparent',color:'#5D4F43'}"
                    style="border:none; font-size:12px; padding:0 14px; border-radius:7px; font-weight:700; height:32px; display:inline-flex; align-items:center; gap:5px; cursor:pointer; transition:all 0.18s; white-space:nowrap;">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
              Self-Interview
            </button>
            <button type="button" @click="setMode('ai')"
                    :style="activeMode==='ai' ? {background:'var(--color-terracotta)',color:'#fff'} : {background:'transparent',color:'#5D4F43'}"
                    style="border:none; font-size:12px; padding:0 14px; border-radius:7px; font-weight:700; height:32px; display:inline-flex; align-items:center; gap:5px; cursor:pointer; transition:all 0.18s; white-space:nowrap;">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28Z"></path></svg>
              Interview with AI
            </button>
          </div>
          <!-- Kelola button — disabled in AI mode -->
          <button class="btn btn-secondary" @click="toggleManagePanel"
                  :disabled="activeMode === 'ai'"
                  :style="activeMode==='ai' ? {opacity:'0.4',cursor:'not-allowed'} : {}"
                  style="font-family:'Outfit',sans-serif; font-weight:700; font-size:12.5px; display:inline-flex; align-items:center; gap:6px; border:1.5px solid #EAE5DD; background-color:#FFFFFF; height:36px; padding:0 14px; border-radius:8px; cursor:pointer;">
            <template v-if="showManagePanel && activeMode==='manual'">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              Sembunyikan
            </template>
            <template v-else>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Kelola Pertanyaan
            </template>
          </button>
        </div>
      </div>

      <!-- ═══ MODE BADGE ═══ -->
      <div style="margin-bottom: 18px;">
        <div v-if="activeMode==='manual'" style="display:inline-flex; align-items:center; gap:6px; background:#EBF5F0; border:1.5px solid #A8D5C0; border-radius:8px; padding:6px 14px; font-size:12px; font-weight:700; color:#1C3B34;">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
          Mode: Self-Interview (Manual) — Bank soal dari daftar pertanyaan Anda
        </div>
        <div v-else style="display:inline-flex; align-items:center; gap:6px; background:#FAF0EC; border:1.5px solid #F3C9B5; border-radius:8px; padding:6px 14px; font-size:12px; font-weight:700; color:#9B3A1A;">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28Z"></path></svg>
          Mode: Interview with AI — Bank soal diisi dinamis dari Gemini API
          <span v-if="aiQuestionBank.length > 0" style="background:var(--color-terracotta); color:#fff; border-radius:20px; padding:1px 8px; font-size:10px; margin-left:4px;">{{ aiQuestionBank.length }} soal siap</span>
        </div>
      </div>

      <!-- ═══ MANUAL MODE: Question Manager Panel ═══ -->
      <div v-if="activeMode==='manual'" v-show="showManagePanel" class="questions-manage-drawer animate-fade-in" style="margin-bottom: 28px;">
        <h3 style="font-family:'Outfit',sans-serif; font-size:16px; font-weight:800; color:#1C3B34; margin:0 0 12px 0; display:flex; align-items:center; gap:6px;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:#1C3B34;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
          Kelola & Update Daftar Pertanyaan
        </h3>
        <div style="background:#FFFFFF; border:1.5px solid #EAE5DD; border-radius:12px; padding:16px; display:grid; gap:12px; margin-bottom:16px;">
          <div style="display:grid; grid-template-columns:1fr 2fr; gap:12px;">
            <div>
              <label style="font-size:12px; font-weight:700; color:#7A6F66; display:block; margin-bottom:4px;">Kategori</label>
              <select class="form-input" v-model="formCategory" style="padding:10px; font-size:13px; border:1.5px solid #EAE5DD; height:42px;">
                <option value="General HR">General HR</option>
                <option value="Technical Speciality">Technical Speciality</option>
                <option value="General Technical">General Technical</option>
                <option value="Performance Tuning">Performance Tuning</option>
                <option value="Behavioral & Teamwork">Behavioral & Teamwork</option>
              </select>
            </div>
            <div>
              <label style="font-size:12px; font-weight:700; color:#7A6F66; display:block; margin-bottom:4px;">Teks Pertanyaan</label>
              <input type="text" class="form-input" v-model="formText" placeholder="Contoh: Mengapa kami harus menerima Anda?" style="padding:10px; font-size:13.5px; border:1.5px solid #EAE5DD; height:42px;" />
            </div>
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#7A6F66; display:block; margin-bottom:4px;">Tips / Hints Jawaban</label>
            <textarea class="form-input" v-model="formHints" rows="2" placeholder="Saran kerangka jawaban..." style="padding:10px; font-size:13px; border:1.5px solid #EAE5DD;"></textarea>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:4px;">
            <button v-show="editingId !== null" class="btn btn-secondary" @click="cancelEdit" style="font-size:12.5px; padding:8px 16px;">Batal</button>
            <button class="spin-btn-teal" @click="saveCustomQuestion" style="font-size:13px; padding:8px 24px; box-shadow:none;">
              {{ editingId !== null ? 'Update Pertanyaan' : 'Tambah Pertanyaan' }}
            </button>
          </div>
        </div>
        <div style="overflow-x:auto; background:#FFFFFF; border:1.5px solid #EAE5DD; border-radius:12px;">
          <table class="questions-manage-table">
            <thead>
              <tr>
                <th style="width:20%;">Kategori</th>
                <th style="width:45%;">Pertanyaan</th>
                <th style="width:20%;">Hints</th>
                <th style="width:15%; text-align:center;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in questions" :key="q.id">
                <td><span class="framework-step-pill" style="margin:0;">{{ q.category }}</span></td>
                <td style="font-weight:600; color:#1C3B34;">{{ q.text }}</td>
                <td style="font-size:11.5px; color:#7A6F66;">{{ q.hints }}</td>
                <td style="text-align:center;">
                  <div style="display:flex; gap:6px; justify-content:center;">
                    <button class="card-nav-btn" @click="startEdit(q)" style="background:#FAF4EB; border:1px solid #EAE5DD; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center;">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                    </button>
                    <button class="card-nav-btn" @click="deleteCustomQuestion(q.id)" style="background:#FAF4EB; border:1px solid #EAE5DD; color:#D67B52; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center;">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div style="padding:12px; background:#FCFAF7; text-align:right;">
            <button class="btn btn-secondary" @click="resetDefaultQuestions" style="font-size:12px; padding:6px 12px; border:1.5px dashed #CCC; background:#FFF; display:inline-flex; align-items:center; gap:4px;">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg> Reset ke Default
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ AI MODE: Setup Panel ═══ -->
      <div v-if="activeMode==='ai'" class="animate-fade-in" style="background:#FCFAF7; border:1.5px solid #EAE5DD; border-radius:16px; padding:20px; margin-bottom:24px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:8px;">
          <div>
            <h4 style="font-family:'Outfit',sans-serif; font-size:15px; font-weight:800; color:#1C3B34; margin:0; display:flex; align-items:center; gap:6px;">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--color-terracotta);"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28Z"></path></svg>
              Konfigurasi AI — Rancang Pertanyaan Otomatis
            </h4>
            <p style="font-size:11.5px; color:var(--text-muted); margin:3px 0 0 0;">Isi target posisi & tipe pertanyaan, lalu klik Rancang untuk mengisi bank soal sesi ini.</p>
          </div>
          <span style="font-size:9px; font-weight:800; background:var(--color-terracotta); color:#fff; padding:3px 9px; border-radius:20px;">GEMINI AI</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px;">
          <!-- Target Posisi -->
          <div>
            <label style="font-size:11.5px; font-weight:700; color:#7A6F66; display:block; margin-bottom:5px;">Target Posisi *</label>
            <input type="text" v-model="aiTargetPosition"
                   placeholder="cth: HR Generalist, Data Analyst, Backend Engineer..."
                   style="width:100%; padding:9px 12px; font-size:12.5px; border:1.5px solid #EAE5DD; border-radius:8px; background:#fff; box-sizing:border-box; height:40px;" />
          </div>
          <!-- Tipe Pertanyaan -->
          <div>
            <label style="font-size:11.5px; font-weight:700; color:#7A6F66; display:block; margin-bottom:5px;">Tipe Pertanyaan *</label>
            <div style="display:flex; gap:16px; height:40px; align-items:center;">
              <label style="display:inline-flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; cursor:pointer; color:#5D4F43;">
                <input type="radio" v-model="aiQuestionType" value="General HR" style="accent-color:var(--color-terracotta);" />
                General HR
              </label>
              <label style="display:inline-flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; cursor:pointer; color:#5D4F43;">
                <input type="radio" v-model="aiQuestionType" value="Spesifik & Mendalam" style="accent-color:var(--color-terracotta);" />
                Spesifik & Mendalam
              </label>
            </div>
          </div>
        </div>

        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <!-- Generate button -->
          <button @click="generateQuestionsFromAI" :disabled="isGeneratingAi || !aiTargetPosition.trim()"
                  class="spin-btn-teal"
                  style="font-size:13px; padding:10px 20px; display:inline-flex; align-items:center; gap:6px; box-shadow:none;"
                  :style="(!aiTargetPosition.trim()) ? {opacity:'0.5',cursor:'not-allowed'} : {}">
            <template v-if="isGeneratingAi">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4"></path></svg>
              Menggali Tren Industri...
            </template>
            <template v-else>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28Z"></path></svg>
              Rancang Pertanyaan AI ✨
            </template>
          </button>

          <!-- Reset Topic button -->
          <button v-if="aiTargetPosition || aiQuestionBank.length > 0" @click="resetAiTopic" type="button"
                  style="height:40px; font-size:12.5px; font-weight:700; border-radius:8px; border:1.5px solid #EAE5DD; padding:0 16px; background:#fff; display:inline-flex; align-items:center; gap:5px; cursor:pointer; color:#5D4F43;">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 10 10 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            Reset Topik
          </button>

          <!-- Bank soal info -->
          <span v-if="aiQuestionBank.length > 0" style="font-size:12px; color:#1C3B34; font-weight:700; background:#EBF5F0; border:1px solid #A8D5C0; padding:4px 12px; border-radius:20px;">
            ✓ {{ aiQuestionBank.length }} pertanyaan siap di bank soal
          </span>
        </div>

        <!-- Error -->
        <div v-if="aiQuestionsError" style="margin-top:12px; background:#FDF4F5; border:1px solid #F5C6CB; padding:10px 12px; border-radius:8px; color:#721C24; font-size:12px;">
          ⚠️ {{ aiQuestionsError }}
        </div>

        <!-- AI Question Bank Preview -->
        <div v-if="aiQuestionBank.length > 0" class="animate-fade-in" style="margin-top:16px; background:#fff; border:1.5px solid #EAE5DD; border-radius:12px; padding:14px;">
          <h5 style="font-size:12px; font-weight:800; color:#1C3B34; margin:0 0 10px 0; border-bottom:1.5px dashed #FAF6F0; padding-bottom:8px;">
            Bank Soal Sesi Ini — {{ aiTargetPosition }} ({{ aiQuestionType }})
          </h5>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div v-for="(aq, idx) in aiQuestionBank" :key="idx"
                 style="background:#FCFAF7; border:1px solid #FAF0EC; padding:11px 14px; border-radius:8px; display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
              <div style="flex:1;">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                  <span class="framework-step-pill" style="font-size:9px; margin:0;">{{ aq.framework || 'STAR' }}</span>
                  <span style="font-size:10px; color:var(--text-muted); font-weight:600;">{{ aq.category }}</span>
                </div>
                <div style="font-size:13px; font-weight:700; color:#2C2621; line-height:1.45;">{{ aq.text }}</div>
                <div style="font-size:11.5px; color:#7A6F66; margin-top:3px;"><strong>Hint:</strong> {{ aq.hints }}</div>
              </div>
              <button @click="practiceThisQuestion(aq)"
                      style="font-size:11px; font-weight:700; background:var(--color-terracotta); color:#fff; padding:5px 10px; border-radius:6px; border:none; cursor:pointer; flex-shrink:0;">
                🎯 Latih
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ MAIN GRID ═══ -->
      <div class="interview-grid" style="grid-template-columns: 280px 1fr; gap: 24px;">
        <!-- Left Column -->
        <div class="interview-col-left">
          <div class="interview-prep-banner" style="display: none;">
            <span class="star-deco star-1">★</span>
            <span class="star-deco star-2">✦</span>
            <span class="star-deco star-3">★</span>
            <span class="star-deco star-4">✦</span>
            <h1 class="prep-bubble-title">INTERVIEW</h1>
            <h1 class="prep-bubble-title" style="color:#D67B52; text-shadow:2px 2px 0px #FDFBF7, 3px 3px 0px #E6DCD1;">PREP</h1>
            <p class="prep-bubble-subtitle">framework practice room</p>
          </div>
          <div class="frameworks-container">
            <span class="framework-acc-title" style="display:flex; align-items:center; gap:6px;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg> Frameworks Guide
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
                <p style="margin-bottom:8px; font-weight:bold; color:#1C3B34;">Untuk pertanyaan berbasis perilaku (behavioral):</p>
                <div><span class="framework-step-pill">S - Situation</span> Latar belakang masalah.</div>
                <div><span class="framework-step-pill">T - Task</span> Tanggung jawab & tantangan.</div>
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
                <p style="margin-bottom:8px; font-weight:bold; color:#1C3B34;">Untuk pertanyaan opini atau teknis:</p>
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
                <p style="margin-bottom:8px; font-weight:bold; color:#1C3B34;">Untuk "Ceritakan tentang diri Anda!":</p>
                <div><span class="framework-step-pill">P - Present</span> Posisi & keahlian saat ini.</div>
                <div><span class="framework-step-pill">P - Past</span> Pencapaian masa lalu.</div>
                <div><span class="framework-step-pill">F - Future</span> Prospek & kecocokan Anda.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div style="display:flex; flex-direction:column; gap:20px;">

          <!-- Filter Category (manual only) -->
          <div v-if="activeMode==='manual'" style="display:flex; justify-content:space-between; align-items:center; position:relative;">
            <div style="font-size:13.5px; font-weight:700; color:#7A6F66; display:flex; align-items:center; gap:6px;">
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
              <button class="pomo-category-option" :class="{ active: selectedCategory==='Behavioral & Teamwork' }" @click="selectCategory('Behavioral & Teamwork')">Behavioral & Teamwork</button>
            </div>
          </div>

          <!-- AI mode bank soal info bar -->
          <div v-if="activeMode==='ai'" style="font-size:13px; font-weight:700; color:#7A6F66; display:flex; align-items:center; gap:8px;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--color-terracotta);"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28Z"></path></svg>
            <span v-if="aiQuestionBank.length > 0">Spin dari bank soal AI — <strong>{{ aiTargetPosition }}</strong> ({{ aiQuestionType }})</span>
            <span v-else style="color:#D67B52;">Belum ada bank soal AI. Isi konfigurasi di atas lalu klik Rancang Pertanyaan AI ✨</span>
          </div>

          <!-- Reel Slot -->
          <div class="reel-slot-wrapper">
            <div class="reel-spinner-window">
              <div class="reel-row reel-row-faded">{{ reelAboveText }}</div>
              <div class="reel-row reel-row-center">
                <span style="font-size:11px; font-weight:800; color:#D67B52; text-transform:uppercase; letter-spacing:1.5px; display:block; margin-bottom:6px;">
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

          <!-- Spin buttons -->
          <div style="display:flex; gap:12px; justify-content:center; align-items:center; margin-top:4px;">
            <button class="spin-btn-teal" @click="spinRollOnce" :disabled="isSpinning" style="display:inline-flex; align-items:center; justify-content:center; gap:6px;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline><polyline points="7.5 19.79 7.5 14.67 12 12.01 16.5 14.67 16.5 19.79"></polyline><polyline points="7.5 14.67 12 17.24 16.5 14.67"></polyline><line x1="12" y1="22" x2="12" y2="12.01"></line><line x1="12" y1="12.01" x2="12" y2="2.01"></line></svg>
              Spin!
            </button>
            <button v-if="chosenAfterLever && selectedQ" class="btn btn-secondary" @click="resetToReSpin" style="font-family:'Outfit',sans-serif; font-weight:700; font-size:13.5px; padding:12px 20px; border:1.5px solid #EAE5DD; background:#FFFFFF; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
              Reset Pilihan
            </button>
          </div>

          <!-- Quick Custom (Manual only) -->
          <div v-if="activeMode==='manual'" style="display: none; background:#FCFAF7; border:1.5px solid #EAE5DD; border-radius:14px; padding:16px;">
            <h4 style="font-family:'Outfit',sans-serif; font-size:14px; font-weight:800; color:#1C3B34; margin:0 0 4px 0; display:flex; align-items:center; gap:6px;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="color:#6C5CE7;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
              ✍️ Latih Pertanyaan Kustom Langsung
            </h4>
            <p style="font-size:11px; color:var(--text-muted); margin-bottom:10px;">Ketik pertanyaan spesifik untuk langsung berlatih merekam jawaban.</p>
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="text" v-model="quickCustomQuestionText" placeholder="Ketik pertanyaan kustom Anda..." style="flex:1; padding:8px 12px; font-size:12.5px; border:1.5px solid #EAE5DD; height:38px; border-radius:8px; background:#FFF;" @keyup.enter="practiceQuickCustom" />
              <button @click="practiceQuickCustom" class="spin-btn-teal" style="height:38px; font-size:12px; padding:0 16px; box-shadow:none; display:inline-flex; align-items:center; gap:4px; background:#6C5CE7;">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Latih 🎯
              </button>
            </div>
          </div>

          <!-- Practice Workspace -->
          <div v-if="chosenAfterLever && selectedQ" class="interview-workspace animate-fade-in" style="margin-top:4px;">
            <div class="question-display">
              <span style="font-size:11px; font-weight:700; color:var(--color-terracotta);">READY PRACTICE BENCH</span>
              <h3 style="font-size:18px; font-weight:800; margin-top:4px; color:#1C3B34; line-height:1.45;">{{ selectedQ.text }}</h3>
              <div style="margin-top:8px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span style="font-size:12px; font-weight:700; color:#8F847A; display:inline-flex; align-items:center; gap:4px;">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                  Kategori:
                </span>
                <span class="framework-step-pill" style="display:inline-block; margin:0;">{{ selectedQ.category }}</span>
                <span v-if="selectedQ.framework" style="display:inline-flex; align-items:center; gap:4px; background:#FAF0EC; border:1px solid #F3C9B5; padding:2px 10px; border-radius:20px; font-size:11px; font-weight:800; color:var(--color-terracotta);">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28Z"></path></svg>
                  Framework: {{ selectedQ.framework }}
                </span>
              </div>
            </div>

            <!-- Voice Recorder -->
            <div class="practice-controls">
              <div class="recording-status" v-if="isRecording"><span class="status-dot"></span> Perekaman Aktif...</div>
              <div class="recording-status" style="color:var(--text-muted); font-size:14px; font-family:'Outfit',sans-serif; font-weight:700; display:inline-flex; align-items:center; gap:6px;" v-else>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="color:#1C3B34;"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                Mikrofon Siaga
              </div>
              <div class="audio-record-timeline text-mono" style="font-size:32px; letter-spacing:-1px; margin:8px 0; color:#1C3B34;">{{ formattedTime }}</div>
              <div class="record-btn-group">
                <button v-if="!isRecording" class="btn btn-primary" @click="startRecording" style="font-weight:800; padding:12px 28px; background:#D67B52; border-color:#D67B52; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                  Mulai Merekam
                </button>
                <button v-else class="btn btn-secondary" @click="stopRecording" style="font-weight:800; padding:12px 28px; background:#DC3545; color:#FFF; border-color:#DC3545; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#FFF" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect></svg>
                  Selesai Merekam
                </button>
              </div>
              <div v-if="practiceRuns.length > 0" class="audio-list">
                <h4 style="font-size:13px; font-family:'Outfit',sans-serif; color:#7A6F66; margin-bottom:8px; font-weight:700;">Rekaman Jawaban</h4>
                <div v-for="(run, idx) in practiceRuns" :key="idx" class="audio-item" style="background:#FFF; border:1.5px solid #EAE5DD; border-radius:12px; padding:10px 14px;">
                  <span class="text-mono" style="font-size:12px; font-weight:bold; color:#1C3B34;">Run #{{ idx + 1 }} ({{ run.duration }}s)</span>
                  <audio :src="run.audioUrl" controls style="height:32px;"></audio>
                  <button class="card-nav-btn" @click="deleteRecording(idx)" style="background:#FAF4EB; border:1px solid #EAE5DD; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center;">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Notes + Hint -->
            <div class="drawer-section" style="margin-bottom:0; background:#FFFFFF; border:1.5px solid #EAE5DD; border-radius:16px; padding:20px;">
              <h4 style="font-size:15px; font-family:'Outfit',sans-serif; margin-bottom:12px; font-weight:800; color:#1C3B34;">Poin Kunci & Kerangka Jawaban</h4>
              <div style="background:#FCFAF7; padding:14px; border-left:4px solid #D67B52; border-radius:8px; margin-bottom:16px; font-size:13px; line-height:1.5; color:#5A4E42; display:flex; align-items:flex-start; gap:8px;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="color:#D67B52; flex-shrink:0; margin-top:2px;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                <span><strong>Petunjuk Jawaban:</strong> {{ selectedQ.hints }}</span>
              </div>
              <textarea class="form-input" v-model="savedNotes[selectedQ.id]" rows="6"
                        placeholder="Rancang draf jawaban terbaikmu (STAR/PREP/PPF). Otomatis tersimpan di browser..."
                        style="border:1.5px solid #EAE5DD; border-radius:10px; font-size:13.5px;"
                        @input="saveNotes"></textarea>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="simulator-locked-placeholder animate-fade-in">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--color-sand); display:block; margin:0 auto 16px auto;"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M3 15h18"></path><path d="M9 3v18"></path><path d="M15 3v18"></path></svg>
            <h3 style="font-family:'Outfit',sans-serif; font-weight:800; color:#1C3B34; margin:0 0 8px 0; font-size:18px;">Simulator Belum Aktif</h3>
            <p style="color:#7A6F66; font-size:13.5px; max-width:460px; margin:0 auto 16px auto; line-height:1.55;">
              <template v-if="activeMode==='manual'">Sesuaikan kategori pertanyaan lalu klik <strong>"Spin!"</strong> atau tarik Tuas untuk mengacak pertanyaan.</template>
              <template v-else-if="aiQuestionBank.length === 0">Isi konfigurasi AI di atas, lalu klik <strong>"Rancang Pertanyaan AI ✨"</strong> untuk mengisi bank soal, kemudian klik Spin!</template>
              <template v-else>Bank soal AI siap! Klik <strong>"Spin!"</strong> atau tarik Tuas untuk mulai latihan.</template>
            </p>
            <div style="display:inline-flex; align-items:center; gap:8px; font-size:12px; color:#D67B52; font-weight:700; background:#FAF4EB; padding:8px 16px; border-radius:40px; border:1px solid #E9DEC9;">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="color:#D67B52;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
              <span>{{ activeMode==='manual' ? 'Tips: Gunakan Kelola Pertanyaan untuk menambah soal baru!' : 'Tips: Mode AI — bank soal diisi otomatis dari Gemini!' }}</span>
            </div>
          </div>

        </div>
      </div>
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
  created() {
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
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(320 + Math.random() * 80, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.06, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.05);
      } catch (e) {}
    },
    playWinSound() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.type = 'sine'; osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
          osc.connect(gain); gain.connect(ctx.destination); osc.start(ctx.currentTime + idx * 0.08); osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
        });
      } catch (e) {}
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
        if (idx !== -1) { this.questions[idx].category = this.formCategory; this.questions[idx].text = this.formText.trim(); this.questions[idx].hints = this.formHints.trim() || 'Fokuskan penyampaian dengan kerangka berpikir rasional.'; }
        this.editingId = null;
      } else {
        this.questions.push({ id: Date.now(), category: this.formCategory, text: this.formText.trim(), hints: this.formHints.trim() || 'Fokuskan penyampaian dengan kerangka berpikir rasional.', framework: 'STAR' });
      }
      this.saveQuestionsToLocalStorage(); this.formText = ''; this.formHints = '';
      alert('Pertanyaan berhasil disimpan!');
    },
    startEdit(q) { this.editingId = q.id; this.formCategory = q.category; this.formText = q.text; this.formHints = q.hints; window.scrollTo({ top: 300, behavior: 'smooth' }); },
    cancelEdit() { this.editingId = null; this.formText = ''; this.formHints = ''; },
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
          <h2>Daily Nutrition & Mind Insights</h2>
          <p style="color: var(--text-muted); font-size: 13.5px; margin-top: 4px; max-width: 600px; line-height: 1.6;">
            Nutrisi harian bagi kecerdasan pikiran. Jaga konsistensi belajar dengan mendelegasikan ringkasan konsep, intisari keilmuan, dan kilatan ide kreatif dalam satu timeline teratur.
          </p>
        </div>
        <button class="btn btn-primary" @click="showAddLog = !showAddLog" style="flex-shrink: 0;">
          {{ showAddLog ? 'Tutup Form' : '+ Tambah Insight' }}
        </button>
      </div>

      <!-- FORM TAMBAH INSIGHT -->
      <div v-if="showAddLog" class="drawer-section" style="margin-bottom: 24px; padding: 22px; border-radius: 12px; animation: popIn 0.2s ease;">
        <h3 style="font-size: 17px; margin-bottom: 18px; color: var(--text-dark); display: flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-terracotta);"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
          {{ editingInsightId ? 'Edit Insight' : 'Catat Pembelajaran / Insight Baru' }}
        </h3>
        <form @submit.prevent="saveInsight">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div class="form-group" style="margin: 0;">
              <label>Tanggal</label>
              <input type="date" class="form-input" v-model="form.date" required />
            </div>
            <!-- KATEGORI DROPDOWN + KELOLA -->
            <div class="form-group" style="margin: 0;">
              <label>Topik / Kategori</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <select class="form-input" v-model="form.category" required style="flex: 1;">
                  <option v-for="cat in allInsightCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <button type="button" @click="showCatManager = !showCatManager"
                  style="background: var(--bg-cream); border: 1.5px solid var(--color-sand); border-radius: 8px; padding: 0 10px; height: 42px; cursor: pointer; font-size: 18px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;"
                  title="Kelola kategori">⚙️</button>
              </div>
              <!-- Mini category manager -->
              <div v-if="showCatManager" style="margin-top: 8px; background: #FDFBF7; border: 1.5px solid var(--color-sand); border-radius: 10px; padding: 12px; animation: popIn 0.15s ease;">
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
                    style="background: var(--color-terracotta); color: #fff; border: none; border-radius: 8px; padding: 0 14px; height: 36px; cursor: pointer; font-size: 13px; font-weight: 600; flex-shrink: 0;">
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- SUMBER / SOURCE -->
          <div class="form-group">
            <label>Sumber / Source</label>
            <input type="text" class="form-input" v-model="form.source" placeholder="cth., Buku, Artikel, Podcast, Kursus, YouTube..." />
          </div>

          <div class="form-group">
            <label>Intisari Pemikiran / Judul</label>
            <input type="text" class="form-input" v-model="form.title" placeholder="cth., Strategi Desain Nol-Warna Biru" required />
          </div>
          <div class="form-group">
            <label>Rangkuman Detail (Konsep)</label>
            <textarea class="form-input" v-model="form.details" rows="3" placeholder="Sederhanakan pemahaman materi tersebut dengan kalimatmu sendiri..." required></textarea>
          </div>
          <div class="form-group" style="margin-bottom: 20px;">
            <label>Poin Keberlanjutan / Takeaway Utama</label>
            <input type="text" class="form-input" v-model="form.takeaway" placeholder="Garis besar satu kalimat actionable lesson..." required />
          </div>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn" @click="cancelEditInsight" style="flex: 1; background: var(--bg-cream); border: 1.5px solid var(--color-sand); color: var(--text-dark); cursor: pointer; border-radius: 8px; font-weight: 600;">Batal</button>
            <button type="submit" class="btn btn-primary" style="flex: 2;">{{ editingInsightId ? 'Simpan Perubahan' : 'Simpan Nutrisi Pikiran' }}</button>
          </div>
        </form>
      </div>

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
              <div class="flex-between" style="margin-bottom: 8px; align-items: flex-start; gap: 8px;">
                <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
                  <span class="timeline-category" :style="{ background: getCatColor(ins.category) + '18', color: getCatColor(ins.category), border: '1.5px solid ' + getCatColor(ins.category) + '40' }">
                    {{ ins.category }}
                  </span>
                  <span v-if="ins.source" style="background: var(--bg-cream); border: 1.5px solid var(--color-sand); color: var(--text-muted); border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    {{ ins.source }}
                  </span>
                </div>
                <div style="display: inline-flex; gap: 6px; flex-shrink: 0; align-items: center;">
                  <button class="card-nav-btn" @click="startEditInsight(idx)" title="Edit insight" style="background: #EFF6FF; border: 1.5px solid #93C5FD; border-radius: 6px; padding: 5px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button class="card-nav-btn" @click="deleteInsight(idx)" title="Hapus insight" style="background: #FEF2F2; border: 1.5px solid #FCA5A5; border-radius: 6px; padding: 5px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
              <h3 class="timeline-title">{{ ins.title }}</h3>
              <p style="font-size: 14px; color: var(--text-dark); line-height: 1.6; margin-bottom: 12px;">{{ ins.details }}</p>
              <div class="timeline-takeaway">
                <strong>💡 Takeaway:</strong> {{ ins.takeaway }}
              </div>
            </div>
          </div>
        </div>
      </div>
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
      editingInsightId: null,
      form: {
        date: new Date().toISOString().split('T')[0],
        category: 'Teknologi',
        source: '',
        title: '',
        details: '',
        takeaway: ''
      }
    };
  },
  computed: {
    defaultInsightCategories() {
      return ['Teknologi', 'Produktivitas', 'Filsafat', 'Arsitektur', 'UX Design', 'Bisnis', 'Psikologi'];
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
  created() {
    const savedCats = WorkspaceStorage.getItem('personal_workspace_insight_categories');
    if (savedCats) { try { this.customInsightCategories = JSON.parse(savedCats); } catch(e) { this.customInsightCategories = []; } }

    const saved = WorkspaceStorage.getItem('personal_workspace_nutrition_insights');
    if (saved) {
      try {
        this.insights = JSON.parse(saved);
        this.insights.forEach((ins, i) => { if (!ins.id) ins.id = 'ins-' + i + '-' + Date.now(); });
      } catch(e) { this.insights = []; }
    } else {
      this.insights = [
        { id: 'ins-1', date: '2026-05-28', category: 'Teknologi', source: 'Vue.js Docs', title: 'Why SPA CDNs Boost Developer Workflow', details: 'Using Vue via CDN directly speeds up small tools and static assets logic. You escape complex local package manager installation steps and launch immediately.', takeaway: 'For lightweight standalone apps, clean ESM CDN tags remove build overhead completely.' },
        { id: 'ins-2', date: '2026-05-26', category: 'Produktivitas', source: 'Personal Experience', title: 'The Power of Scattered Visual Flat-lays', details: 'Allowing customized drag-and-drop flat lay positions mirrors natural office setups. A cluttered virtual desk lowers access friction for visual thinkers.', takeaway: 'Interactivity in UI builds deeper emotional ownership for productivity systems.' },
        { id: 'ins-3', date: '2026-05-25', category: 'UX Design', source: 'Color Psychology Article', title: 'Zero Blue Color Psychology', details: 'By selecting terracotta and sage earth-toned cream bases, layouts feel warmer, organic, and closely resemble tangible paper/stickers instead of clinical digital devices.', takeaway: 'Subtle warm palettes foster longer reading retention and reduce screen fatigue.' }
      ];
      this.saveToStorage();
    }
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
      const today = new Date().toISOString().split('T')[0];
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
      catch(e) { return d; }
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
      this.saveToStorage();
      this.form = { date: new Date().toISOString().split('T')[0], category: this.form.category, source: '', title: '', details: '', takeaway: '' };
      this.showAddLog = false;
    },
    startEditInsight(idx) {
      const ins = this.filteredInsights[idx];
      if (!ins) return;
      this.editingInsightId = ins.id;
      this.form = { date: ins.date, category: ins.category, source: ins.source || '', title: ins.title, details: ins.details, takeaway: ins.takeaway };
      this.showAddLog = true;
      this.$nextTick(() => { document.querySelector('.drawer-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    },
    cancelEditInsight() {
      this.editingInsightId = null;
      this.form = { date: new Date().toISOString().split('T')[0], category: 'Teknologi', source: '', title: '', details: '', takeaway: '' };
      this.showAddLog = false;
    },
    deleteInsight(idx) {
      if (!confirm('Hapus insight ini?')) return;
      const sorted = this.filteredInsights;
      const insToDelete = sorted[idx];
      const realIdx = this.insights.findIndex(i => i.id === insToDelete.id);
      if (realIdx !== -1) this.insights.splice(realIdx, 1);
      this.saveToStorage();
    },
    saveToStorage() {
      WorkspaceStorage.setItem('personal_workspace_nutrition_insights', JSON.stringify(this.insights));
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
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: var(--color-forest);"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 6v12"></path><path d="M8 10h8"></path></svg>
                Buat Habit Komitmen Baru
              </h3>
              <button class="close-btn" @click="closeModal" style="font-size: 18px; line-height: 1; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">x</button>
            </div>

            <form @submit.prevent="createHabit">
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
                      <button v-if="!['Kesehatan','Produktivitas','Pikiran','Rutinitas'].includes(cat)"
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

              <button type="submit" class="btn btn-primary" style="width: 100%;">Simpan Komitmen</button>
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
          <h2>Aesthetic Habit Tracker</h2>
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
          <div style="background-color: var(--bg-cream); font-size: 12px; font-weight: 600; color: var(--color-sage); padding: 4px 12px; border-radius: 20px; border: 1px solid var(--color-sand);">
            Rata-rata Harian: {{ chartCompletionRate }}% Selesai
          </div>
        </div>

        <!-- Habit Filter Dropdown -->
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
              <tr v-for="habit in habits" :key="'row-' + habit.id">
                <td class="habit-table-name-cell">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span :style="{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getHabitColor(habit), display: 'inline-block', flexShrink: 0 }"></span>
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px;" :title="habit.name">{{ habit.name }}</span>
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
                    :class="{ 'habit-day-btn-checked': isDayChecked(habit, day) }"
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

        <div v-else class="grid-2" style="grid-template-columns: repeat(2, 1fr); gap: 20px; align-items: start;">
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
              </div>
              <button class="card-nav-btn" @click="removeHabit(habit.id)" title="Hapus Habit" style="padding: 4px; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; background-color: var(--bg-cream); border: 1px solid var(--color-sand);">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #D67B52;"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
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
    activeMonthKey: String
  },
  data() {
    return {
      habits: [],
      hoveredChartDay: null,
      showModal: false,
      selectedChartHabitId: null,
      habitSearchQuery: '',
      showAddCategory: false,
      showCategoryList: false,
      newCategoryInput: '',
      customCategories: [],
      form: {
        name: '',
        category: 'Kesehatan',
        color: 'emerald',
        customColor: '#10b981',
        target: 20
      }
    };
  },
  computed: {
    filteredHabitCards() {
      if (!this.habitSearchQuery.trim()) return this.habits;
      const q = this.habitSearchQuery.trim().toLowerCase();
      return this.habits.filter(h =>
        h.name.toLowerCase().includes(q) ||
        (h.category && h.category.toLowerCase().includes(q))
      );
    },
    allCategories() {
      const base = ['Kesehatan', 'Produktivitas', 'Pikiran', 'Rutinitas'];
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
      let totalSlots = this.habits.length * this.daysInMonth;
      return Math.round((this.totalChecksThisMonth / totalSlots) * 100);
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
  created() {
    const savedCats = WorkspaceStorage.getItem('aesthetic_habit_custom_categories');
    if (savedCats) {
      this.customCategories = JSON.parse(savedCats);
    }
    const saved = WorkspaceStorage.getItem('aesthetic_habit_tracker_habits');
    if (saved) {
      this.habits = JSON.parse(saved);
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
  methods: {
    closeModal() {
      this.showModal = false;
      this.showCategoryList = false;
      this.form.category = this.allCategories[0] || 'Kesehatan';
      this.newCategoryInput = '';
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
      if (!this.customCategories.includes(name) && !['Kesehatan','Produktivitas','Pikiran','Rutinitas'].includes(name)) {
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
      const paddingTop = 15;
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
      const icons = { 'Kesehatan': '❤️', 'Produktivitas': '✨', 'Pikiran': '🧠', 'Rutinitas': '⏰' };
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
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
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
      } catch(e) {}
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
      this.habits = this.habits.map(h => {
        if (h.id !== habitId) return h;
        const historyCopy = { ...h.history };
        const checkedList = historyCopy[this.currentYearMonth] ? [...historyCopy[this.currentYearMonth]] : [];
        let newChecked;
        if (checkedList.includes(day)) {
          newChecked = checkedList.filter(d => d !== day);
        } else {
          newChecked = [...checkedList, day].sort((a, b) => a - b);
        }
        historyCopy[this.currentYearMonth] = newChecked;
        return { ...h, history: historyCopy };
      });
      this.saveToStorage();
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
        history: { [this.currentYearMonth]: [] }
      };
      this.habits.unshift(newHabit);
      this.saveToStorage();
      this.form.name = '';
      this.form.target = 20;
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
        { id: 8, key: 'googleCalendar', num: 8, name: 'google calendar sync' },
        { id: 9, key: 'financialTracker', num: 9, name: 'financial tracker' }
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
    globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
  } catch (e) {}
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
  } catch (e) {}
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
  } catch (e) {}
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
  } catch (e) {}
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
  } catch (e) {}
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
  } catch (e) {}
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
  } catch (e) {}
};

const stopProceduralAmbience = () => {
  if (ambienceNoiseNode) {
    try {
      if (ambienceNoiseNode._sweep) ambienceNoiseNode._sweep.stop();
      if (ambienceNoiseNode._birdTimer) clearInterval(ambienceNoiseNode._birdTimer);
      ambienceNoiseNode.stop();
    } catch (e) {}
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
            <h2 style="font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: #2C2621; margin: 0; line-height: 1.2; letter-spacing: -0.5px;">Jam Pasir Pomodoro</h2>
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
          <h4 style="font-size: 18px; font-weight: bold; color: var(--pomo-primary); font-family: sans-serif;">WAKTU SESI SELESAI!</h4>
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
  mounted() {
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
        } catch (e) {}
      }
      // Load history logs
      const savedLogs = WorkspaceStorage.getItem('personal_workspace_pomo_history_logs');
      if (savedLogs) {
        try {
          this.historyLogs = JSON.parse(savedLogs);
        } catch (e) {
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
      } catch(e) {}
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
      window.dispatchEvent(new CustomEvent('pomo-state-update', { detail: {
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
      window.dispatchEvent(new CustomEvent('pomo-state-update', { detail: state }));
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
          <h2>Google Calendar Sync</h2>
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
      </div>

      <!-- Unauthorized / Connect Akun view as card -->
      <div class="calendar-card" style="text-align: center; padding: 48px 24px;" v-if="needsAuth">
        <div style="margin-bottom: 24px;">
          <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-terracotta); margin: 0 auto 16px auto; display: block;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <h3 style="font-size: 22px; font-weight: 700; color: var(--text-dark);">Hubungkan Akun Google Anda</h3>
          <p style="color: var(--text-muted); max-width: 480px; margin: 10px auto; font-size: 14px; line-height: 1.6;">
            Untuk melihat dan mengelola kegiatan harian Anda secara live, silakan hubungkan workspace ini dengan Google Calendar Anda menggunakan akun login.
          </p>
        </div>

        <div v-if="error" style="background-color: #FDF2F2; color: #DC2626; padding: 14px; border-radius: 8px; margin-bottom: 24px; font-size: 13.5px; display: inline-block; width: 100%; max-width: 580px; border: 1.5px solid #F87171; text-align: left; line-height: 1.5;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline" style="color: #DC2626; display: inline-block; margin-right: 4px; vertical-align: text-bottom;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <strong>Kesalahan Login:</strong> {{ error }}
        </div>

        <div>
          <button class="gsi-material-button" @click="handleGoogleSignIn" :disabled="loading" style="margin-bottom: 12px;">
            <div class="gsi-material-button-content-wrapper">
              <div class="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="display: block;">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              <span class="gsi-material-button-contents" style="margin-left: 10px;">{{ loading ? 'Sedang menghubungkan...' : 'Masuk dengan Google (Popup)' }}</span>
            </div>
          </button>

          <!-- Alternative login options to fix iframe browser sandboxing constraint -->
          <div style="margin-top: 24px; border-top: 1.5px dashed var(--color-sand); padding-top: 20px; max-width: 540px; margin-left: auto; margin-right: auto;">
            <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
              💡 <strong>Mengalami gangguan popup/sandbox di browser?</strong><br>
              Aplikasi ini berada di dalam bingkai (iframe) preview AI Studio yang sering membatasi login popup. Pilih opsi stabil berikut:
            </p>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-secondary" @click="openInNewTab" style="font-size: 13px; padding: 8px 16px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px;">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                Buka di Tab Baru (Sangat Direkomendasikan)
              </button>
              <button class="btn btn-secondary" @click="handleGoogleRedirectSignIn" :disabled="loading" style="font-size: 13px; padding: 8px 16px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px;">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-inline"><path d="M3 12a9 9 0 0 1 9-9 9.75 10 10 0 0 1 6.74 2.74L21 8"></path><path d="M16 3h5v5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 10 10 0 0 1-6.74-2.74L3 16"></path><path d="M8 21H3v-5"></path></svg>
                Coba Metode Redirect
              </button>
            </div>
          </div>
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
      filterGroup: 'all' // 'all', 'today', 'week'
    };
  },
  computed: {
    filteredEvents() {
      if (this.filterGroup === 'all') return this.events;
      const todayStr = new Date().toISOString().split('T')[0];
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
    }
  },
  mounted() {
    this.initFirebase();
  },
  methods: {
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
            if (window.googleCalendarCachedToken) {
              this.accessToken = window.googleCalendarCachedToken;
              this.needsAuth = false;
              this.fetchEvents();
            } else {
              this.needsAuth = true;
            }
          } else {
            this.user = null;
            this.accessToken = null;
            window.googleCalendarCachedToken = null;
            this.needsAuth = true;
          }
          this.loading = false;
        });

        // Handle redirect result if user used redirect login
        this.auth.getRedirectResult()
          .then((result) => {
            if (result && result.credential) {
              this.accessToken = result.credential.accessToken;
              window.googleCalendarCachedToken = result.credential.accessToken;
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
        window.googleCalendarCachedToken = result.credential.accessToken;
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
      window.open(window.location.href, '_blank');
    },
    async handleSignOut() {
      if (this.auth) {
        await this.auth.signOut();
      }
      this.user = null;
      this.accessToken = null;
      window.googleCalendarCachedToken = null;
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
            window.googleCalendarCachedToken = null;
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
      const isConfirmed = window.confirm(`Apakah Anda yakin ingin memasukkan acara ke Google Calendar Anda:\n\n📌 Judul: "${this.newEvent.summary}"\n📅 Hari/Tanggal: ${this.newEvent.startDate}`);
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
      const isConfirmed = window.confirm(`Apakah Anda yakin ingin menghapus acara "${eventItem.summary || 'Acara Tanpa Judul'}" dari Google Calendar? Tindakan ini tidak dapat dibatalkan.`);
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
          <h2 style="display:flex; align-items:center; gap:10px;">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--color-terracotta)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            Financial Tracker
          </h2>
          <p style="color:var(--text-muted); font-size:13.5px; margin-top:4px;">Pantau tabungan, pengeluaran & reimburse (Global Ledger)</p>
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

        <div style="padding:14px 22px 20px;">
          <div v-if="filteredTransactions.length === 0" style="text-align:center; padding:32px; color:var(--text-muted);">
            <p style="font-size:14px;">Belum ada transaksi {{ activeTab !== 'all' ? 'tipe ini' : '' }}</p>
          </div>
          <div v-else style="display:flex; flex-direction:column; gap:8px;">
            <div v-for="tx in filteredTransactions" :key="tx.id" class="fin-tx-row">
              <div class="fin-tx-icon" :style="{ background: getTxBg(tx), color: getTxColor(tx) }">
                <svg v-if="tx.type === 'income'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                <svg v-else-if="tx.type === 'expense' && !tx.isReimburse" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </div>
              <div style="flex:1; min-width:0;">
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                  <span style="font-size:13.5px; font-weight:600; color:var(--text-dark);">{{ tx.description }}</span>
                  <span v-if="tx.isReimburse" class="fin-badge"
                    :style="tx.settled ? { background:'#D1FAE5', color:'#065F46', borderColor:'#6EE7B7' } : { background:'#FEF3C7', color:'#92400E', borderColor:'#FCD34D' }">
                    {{ tx.settled ? '✓ Reimburse Lunas' : '⏳ Reimburse Pending' }}
                  </span>
                  <span class="fin-badge" :style="{ background: getBankColor(tx.bankId) + '15', color: getBankColor(tx.bankId), borderColor: getBankColor(tx.bankId) + '50' }">
                    🏦 {{ getBankName(tx.bankId) }}
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
                  :style="{ color: tx.type === 'income' ? '#10B981' : tx.type === 'expense' ? '#EF4444' : '#F59E0B' }">
                  {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                </span>
                <div style="display:flex; gap:4px;">
                  <button v-if="tx.isReimburse && !tx.settled" @click="settleReimburse(tx)"
                    title="Uang dikembalikan! (Otomatis Tambah Saldo)" style="background:#D1FAE5; border:1.5px solid #6EE7B7; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:11px; font-weight:700; color:#065F46; display:inline-flex; align-items:center; gap:4px;">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Uang Cair (Tambah Saldo)
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
                {{ txForm.type === 'income' ? 'Tambah Saldo' : 'Catat Pengeluaran' }}
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
              <button class="btn btn-primary" @click="saveTx" style="flex:2; cursor:pointer;">Simpan Transaksi</button>
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
      txForm: {
        type: 'expense',
        bankId: '',
        date: new Date().toISOString().split('T')[0],
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

      tabs: [
        { key: 'all', label: 'Semua', color: 'var(--text-dark)' },
        { key: 'income', label: '↑ Masuk', color: '#10B981' },
        { key: 'expense', label: '↓ Keluar', color: '#EF4444' },
        { key: 'reimburse', label: '↺ Reimburse', color: '#F59E0B' },
      ],
    };
  },

  computed: {
    filteredTransactions() {
      let txs = [...this.finDateFilteredTx].sort((a, b) => new Date(b.date) - new Date(a.date));
      if (this.activeTab === 'income') return txs.filter(t => t.type === 'income');
      if (this.activeTab === 'expense') return txs.filter(t => t.type === 'expense' && !t.isReimburse);
      if (this.activeTab === 'reimburse') return txs.filter(t => t.isReimburse);
      return txs;
    },
    finFilteredCount() {
      return this.finDateFilteredTx.length;
    },
    finTodayStr() {
      return new Date().toISOString().split('T')[0];
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
      catch(e) { return d; }
    },
    getTxColor(tx) {
      if (tx.isReimburse) return '#F59E0B';
      if (tx.type === 'income') return '#10B981';
      return '#EF4444';
    },
    getTxBg(tx) {
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
      this.txForm = {
        type: type || 'expense',
        bankId: this.banks[0].id,
        date: new Date().toISOString().split('T')[0],
        amount: null,
        description: '',
        category: '',
        isReimburse: false,
        paidBy: '',
        notes: '',
      };
      this.showTxModal = true;
    },
    saveTx() {
      if (!this.txForm.bankId) return alert('Pilih Bank / Dompet tujuan!');
      if (!this.txForm.description.trim()) return alert('Deskripsi wajib diisi!');
      if (!this.txForm.amount || this.txForm.amount <= 0) return alert('Jumlah harus lebih dari 0!');
      
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
          date: new Date().toISOString().split('T')[0],
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
    closeTxModal() { this.showTxModal = false; },

    saveAll() {
      WorkspaceStorage.setItem('fin_banks', JSON.stringify(this.banks));
      WorkspaceStorage.setItem('fin_transactions', JSON.stringify(this.transactions));
    },
  },

  mounted() {
    try {
      const savedBanks = WorkspaceStorage.getItem('fin_banks');
      if (savedBanks) this.banks = JSON.parse(savedBanks);
    } catch(e) { this.banks = []; }
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
    } catch(e) { this.transactions = []; }
    this._closeFinRangePicker = () => { if (this.showFinRangePicker) this.showFinRangePicker = false; };
    document.addEventListener('click', this._closeFinRangePicker);
  },
  unmounted() {
    if (this._closeFinRangePicker) document.removeEventListener('click', this._closeFinRangePicker);
  },
};
