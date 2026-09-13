// ============================================================================
// WORKSPACE SAFETY UI (workspace-safety-ui.js)
// ============================================================================
// Cara pakai:
// 1. Taruh file ini SETELAH supabase-storage.js di index.html:
//      <script src="supabase-storage.js"></script>
//      <script src="workspace-safety-ui.js"></script>
// 2. Selesai. Banner & tombol export akan otomatis muncul sendiri.
// ============================================================================

(function () {
  // --------------------------------------------------------------------
  // 1) EXPORT / DOWNLOAD BACKUP MANUAL
  // --------------------------------------------------------------------
  // Ambil semua key yang ada di cache WorkspaceStorage saat ini dan
  // download sebagai satu file JSON. User bisa simpan file ini
  // kapan saja sebagai jaring pengaman independen dari Supabase.
  async function downloadWorkspaceBackup() {
    await globalThis._workspaceStorageReady;

    const snapshot = {};
    Object.keys(WorkspaceStorage._cache).forEach((key) => {
      // Skip marker internal, tidak perlu ikut di-backup
      if (key === WorkspaceStorage._MIGRATION_FLAG_KEY) return;
      snapshot[key] = WorkspaceStorage._cache[key];
    });

    const payload = {
      exported_at: new Date().toISOString(),
      data: snapshot,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `workspace-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Restore dari file backup JSON hasil downloadWorkspaceBackup().
  // Sengaja TIDAK auto-jalan — harus dipicu manual oleh user via tombol,
  // supaya tidak ada kejadian "restore" tidak sengaja menimpa data aktif.
  async function restoreWorkspaceBackup(file) {
    await globalThis._workspaceStorageReady;
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed.data !== 'object') {
      throw new Error('Format file backup tidak valid.');
    }
    const keys = Object.keys(parsed.data);
    for (const key of keys) {
      WorkspaceStorage.setItem(key, parsed.data[key]);
    }
    return keys.length;
  }

  globalThis.downloadWorkspaceBackup = downloadWorkspaceBackup;
  globalThis.restoreWorkspaceBackup = restoreWorkspaceBackup;

  // Wrapper simpel dengan feedback alert — ini yang dipanggil dari tombol UI
  // (index.html), supaya kalau gagal user tahu, bukan diam-diam tidak terjadi apa-apa.
  globalThis.triggerWorkspaceBackup = async function () {
    try {
      await downloadWorkspaceBackup();
    } catch (err) {
      alert('Gagal membuat backup: ' + err.message);
    }
  };

  // --------------------------------------------------------------------
  // 2) Tombol backup mengambang TERPISAH sudah tidak dipakai lagi —
  // sekarang tombol "💾 Backup Data" ada di dalam menu Pengaturan & Tema
  // (lihat index.html, sub-btn F). Fungsi downloadWorkspaceBackup() di atas
  // tetap dipasang ke globalThis supaya bisa dipanggil langsung dari sana.
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // 3) BANNER PERINGATAN — muncul kalau sync ke Supabase gagal
  // --------------------------------------------------------------------
  function injectErrorBanner() {
    const banner = document.createElement('div');
    banner.id = '_ws_error_banner';
    banner.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
      background: #C23939; color: #fff; text-align: center;
      padding: 10px 16px; font-family: sans-serif; font-size: 13.5px;
      display: none;
    `;
    banner.innerHTML = `
      ⚠️ Gagal sinkronisasi data ke server. Perubahan yang kamu buat
      SEKARANG mungkin tidak tersimpan. Coba refresh halaman, atau
      backup dulu lewat tombol "💾 Backup Data" sebelum lanjut.
      <button id="_ws_error_dismiss" style="
        margin-left: 10px; background: rgba(255,255,255,0.2); border: none;
        color: #fff; padding: 3px 10px; border-radius: 6px; cursor: pointer;
      ">Tutup</button>
    `;
    document.body.appendChild(banner);
    banner.querySelector('#_ws_error_dismiss').addEventListener('click', () => {
      banner.style.display = 'none';
    });

    // Cek status tiap 3 detik. Sederhana tapi cukup untuk kasus ini —
    // tidak perlu event system tambahan di WorkspaceStorage.
    setInterval(() => {
      if (globalThis.WorkspaceStorage && WorkspaceStorage.hasError) {
        banner.style.display = 'block';
      }
    }, 3000);
  }

  // --------------------------------------------------------------------
  // Jalankan setelah DOM siap
  // --------------------------------------------------------------------
  function init() {
    injectErrorBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
