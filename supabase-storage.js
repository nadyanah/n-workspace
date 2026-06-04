// ============================================================================
// SUPABASE STORAGE LAYER with Secret Password Auth (supabase-storage.js)
// ============================================================================
// Password = identitas user. Siapapun yang pakai password yang sama
// akan mendapat data yang sama, di device manapun.
// ============================================================================

// ⚠️ GANTI DENGAN CREDENTIAL SUPABASE KAMU ⚠️
const SUPABASE_URL = 'https://wsrzmemfhrcxqqseanxm.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcnptZW1maHJjeHFxc2VhbnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzE3NDYsImV4cCI6MjA5NjE0Nzc0Nn0.nAdc3a0GKC9VtMj00pPUVn07cdtGMaCqAAc3Pw7fKOQ';

// Email domain palsu untuk auth Supabase (tidak perlu valid)
const AUTH_EMAIL_DOMAIN = 'nworkspace.app';

const { createClient } = supabase;
const _supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let _currentUserId = null;

// ── Hash password jadi email + password Supabase yang konsisten ──
async function _passwordToCredentials(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode('nworkspace:' + password.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return {
    email: `${hashHex.slice(0, 24)}@${AUTH_EMAIL_DOMAIN}`,
    password: hashHex.slice(24, 56)
  };
}

// ── Login atau daftar otomatis pakai password ──
async function _signInWithPassword(password) {
  const creds = await _passwordToCredentials(password);

  // Coba login dulu
  const { data: signInData, error: signInError } = await _supabaseClient.auth.signInWithPassword({
    email: creds.email,
    password: creds.password
  });

  if (!signInError && signInData?.user) {
    return { user: signInData.user, isNew: false };
  }

  // Kalau belum ada, daftar dulu
  const { data: signUpData, error: signUpError } = await _supabaseClient.auth.signUp({
    email: creds.email,
    password: creds.password
  });

  if (signUpError) throw new Error(signUpError.message);

  // Langsung login setelah daftar
  const { data: retryData, error: retryError } = await _supabaseClient.auth.signInWithPassword({
    email: creds.email,
    password: creds.password
  });

  if (retryError) throw new Error(retryError.message);
  return { user: retryData.user, isNew: true };
}

// ============================================================================
// PASSWORD POPUP UI
// ============================================================================

function _showPasswordPopup() {
  return new Promise((resolve) => {
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = '_ws_overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(44, 38, 33, 0.55);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Outfit', sans-serif;
      opacity: 0; transition: opacity 0.3s ease;
    `;

    // Card
    const card = document.createElement('div');
    card.style.cssText = `
      background: #FDFBF7;
      border-radius: 24px;
      padding: 40px 36px 32px;
      width: 100%; max-width: 380px;
      box-shadow: 0 24px 64px rgba(44, 38, 33, 0.22);
      transform: translateY(16px) scale(0.97);
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
      opacity: 0;
      text-align: center;
      position: relative;
    `;

    card.innerHTML = `
      <div style="font-size: 38px; margin-bottom: 8px;">🗝️</div>
      <h2 style="
        font-family: 'Playfair Display', serif;
        font-size: 22px; font-weight: 700;
        color: #2C2621; margin-bottom: 8px; line-height: 1.3;
      ">Welcome back</h2>
      <p style="
        font-size: 13.5px; color: #6E6359;
        margin-bottom: 28px; line-height: 1.6;
      ">Masukkan secret password kamu untuk<br>membuka workspace & sinkronkan datamu.</p>

      <div style="position: relative; margin-bottom: 16px;">
        <input
          id="_ws_password_input"
          type="password"
          placeholder="secret password..."
          autocomplete="current-password"
          style="
            width: 100%; padding: 13px 44px 13px 18px;
            border: 2px solid #E8DFD8; border-radius: 12px;
            font-size: 15px; font-family: 'Space Mono', monospace;
            color: #2C2621; background: #fff;
            outline: none; transition: border-color 0.2s;
            box-sizing: border-box; letter-spacing: 2px;
          "
        />
        <button id="_ws_toggle_vis" style="
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          font-size: 18px; color: #6E6359; padding: 4px; line-height: 1;
        " tabindex="-1" title="Tampilkan/sembunyikan">👁</button>
      </div>

      <p id="_ws_error_msg" style="
        color: #C23939; font-size: 12.5px; margin-bottom: 12px;
        min-height: 18px; transition: opacity 0.2s;
      "></p>

      <button id="_ws_submit_btn" style="
        width: 100%; padding: 14px;
        background: #D67B52; color: #fff;
        border: none; border-radius: 12px;
        font-size: 15px; font-weight: 600;
        font-family: 'Outfit', sans-serif;
        cursor: pointer; transition: background 0.2s, transform 0.1s;
        display: flex; align-items: center; justify-content: center; gap: 8px;
      ">
        <span id="_ws_btn_text">Masuk ke Workspace</span>
        <span id="_ws_btn_loader" style="display:none; width:16px; height:16px; border:2px solid rgba(255,255,255,0.5); border-top-color:#fff; border-radius:50%; animation:_ws_spin 0.7s linear infinite;"></span>
      </button>

      <p style="font-size: 11.5px; color: #A09488; margin-top: 20px; line-height: 1.6;">
        Password yang sama = data yang sama di semua device.<br>
        Simpan password kamu baik-baik ya! 🔒
      </p>

      <style>
        @keyframes _ws_spin { to { transform: rotate(360deg); } }
        #_ws_password_input:focus { border-color: #D67B52 !important; }
        #_ws_submit_btn:hover:not(:disabled) { background: #C86D44 !important; }
        #_ws_submit_btn:active:not(:disabled) { transform: scale(0.98) !important; }
        #_ws_submit_btn:disabled { opacity: 0.7; cursor: not-allowed; }
      </style>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) scale(1)';
    });

    const input = card.querySelector('#_ws_password_input');
    const submitBtn = card.querySelector('#_ws_submit_btn');
    const btnText = card.querySelector('#_ws_btn_text');
    const btnLoader = card.querySelector('#_ws_btn_loader');
    const errorMsg = card.querySelector('#_ws_error_msg');
    const toggleVis = card.querySelector('#_ws_toggle_vis');

    // Toggle password visibility
    let visible = false;
    toggleVis.addEventListener('click', () => {
      visible = !visible;
      input.type = visible ? 'text' : 'password';
      toggleVis.textContent = visible ? '🙈' : '👁';
    });

    const setLoading = (loading) => {
      submitBtn.disabled = loading;
      btnText.textContent = loading ? 'Membuka workspace...' : 'Masuk ke Workspace';
      btnLoader.style.display = loading ? 'block' : 'none';
    };

    const showError = (msg) => {
      errorMsg.textContent = msg;
      input.style.borderColor = '#C23939';
      input.style.animation = '_ws_shake 0.4s ease';
      setTimeout(() => { input.style.animation = ''; }, 400);
    };

    const clearError = () => {
      errorMsg.textContent = '';
      input.style.borderColor = '#E8DFD8';
    };

    const handleSubmit = async () => {
      const pw = input.value.trim();
      if (!pw) { showError('Password tidak boleh kosong.'); return; }
      if (pw.length < 4) { showError('Password minimal 4 karakter.'); return; }

      clearError();
      setLoading(true);

      try {
        const result = await _signInWithPassword(pw);
        _currentUserId = result.user.id;
        sessionStorage.setItem('_nws_session', btoa(pw));

        // Animate out
        overlay.style.opacity = '0';
        card.style.opacity = '0';
        card.style.transform = 'translateY(-12px) scale(0.97)';
        setTimeout(() => {
          overlay.remove();
          resolve(result.user.id);
        }, 300);
      } catch (err) {
        setLoading(false);
        showError('Gagal masuk. Coba lagi ya!');
        console.error('[Auth]', err.message);
      }
    };

    input.addEventListener('input', clearError);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSubmit(); });
    submitBtn.addEventListener('click', handleSubmit);

    // Add shake keyframe
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `@keyframes _ws_shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }`;
    document.head.appendChild(shakeStyle);

    setTimeout(() => input.focus(), 350);
  });
}

// ── Cek session yang sudah ada sebelum minta popup ──
async function _ensureUser() {
  if (_currentUserId) return _currentUserId;

  // Cek session Supabase yang masih aktif
  const { data: { session } } = await _supabaseClient.auth.getSession();
  if (session?.user) {
    _currentUserId = session.user.id;
    return _currentUserId;
  }

  // Coba auto-login dari password yang tersimpan di localStorage
  const storedPwHash = sessionStorage.setItem('_nws_session', btoa(pw));
  if (storedPwHash) {
    try {
      sessionStorage.setItem('_nws_session', btoa(pw));
      const result = await _signInWithPassword(pw);
      _currentUserId = result.user.id;
      return _currentUserId;
    } catch (e) {
      localStorage.removeItem('_nworkspace_pw_hash');
    }
  }

  // Tidak ada session — tampilkan popup
  return await _showPasswordPopup();
}

// ============================================================================
// WORKSPACE STORAGE API
// ============================================================================

const WorkspaceStorage = {
  _cache: {},
  _initialized: false,
  _pendingSaves: {},
  _saveDebounceMs: 800,

  async init() {
    if (this._initialized) return;
    try {
      const userId = await _ensureUser();
      if (!userId) { this._initialized = true; return; }

      const { data, error } = await _supabaseClient
        .from('workspace_storage')
        .select('key, value')
        .eq('user_id', userId);

      if (error) throw error;
      if (data) data.forEach(row => { this._cache[row.key] = row.value; });

      this._initialized = true;
      console.log(`[WorkspaceStorage] Loaded ${data?.length || 0} keys`);
    } catch (err) {
      console.error('[WorkspaceStorage] Error init:', err.message);
      this._initialized = true;
    }
  },

  getItem(key) {
    if (this._cache.hasOwnProperty(key)) return this._cache[key];
    const localVal = localStorage.getItem(key);
    if (localVal !== null) {
      this._cache[key] = localVal;
      this._scheduleSave(key, localVal);
    }
    return localVal;
  },

  setItem(key, value) {
    this._cache[key] = value;
    this._scheduleSave(key, value);
  },

  removeItem(key) {
    delete this._cache[key];
    this._cancelScheduledSave(key);
    this._deleteFromSupabase(key);
  },

  _scheduleSave(key, value) {
    if (this._pendingSaves[key]) clearTimeout(this._pendingSaves[key]);
    this._pendingSaves[key] = setTimeout(() => {
      this._saveToSupabase(key, value);
      delete this._pendingSaves[key];
    }, this._saveDebounceMs);
  },

  _cancelScheduledSave(key) {
    if (this._pendingSaves[key]) {
      clearTimeout(this._pendingSaves[key]);
      delete this._pendingSaves[key];
    }
  },

  async _saveToSupabase(key, value) {
    try {
      const userId = _currentUserId || await _ensureUser();
      if (!userId) return;
      const { error } = await _supabaseClient
        .from('workspace_storage')
        .upsert(
          { user_id: userId, key, value, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,key' }
        );
      if (error) throw error;
    } catch (err) {
      console.error(`[WorkspaceStorage] Gagal simpan "${key}":`, err.message);
    }
  },

  async _deleteFromSupabase(key) {
    try {
      const userId = _currentUserId || await _ensureUser();
      if (!userId) return;
      const { error } = await _supabaseClient
        .from('workspace_storage')
        .delete()
        .eq('user_id', userId)
        .eq('key', key);
      if (error) throw error;
    } catch (err) {
      console.error(`[WorkspaceStorage] Gagal hapus "${key}":`, err.message);
    }
  },

  async migrateFromLocalStorage() {
    const keys = [
      'personal_workspace_assigned_icons','aesthetic_workspace_dominant_color',
      'personal_workspace_job_categories','personal_workspace_job_logs',
      'personal_workspace_calendar_moments','personal_workspace_content_columns',
      'personal_workspace_content_platforms','personal_workspace_content_usernames',
      'personal_workspace_content_visibility','personal_workspace_content_alert_colors',
      'personal_workspace_content_items','personal_workspace_interview_questions',
      'personal_workspace_interview_notes','personal_workspace_nutrition_insights',
      'aesthetic_habit_custom_categories','aesthetic_habit_tracker_habits',
      'personal_workspace_pomo_tracker','personal_workspace_pomo_history_logs',
    ];
    let count = 0;
    for (const key of keys) {
      const val = localStorage.getItem(key);
      if (val !== null && !this._cache.hasOwnProperty(key)) {
        this._cache[key] = val;
        await this._saveToSupabase(key, val);
        count++;
      }
    }
    if (count > 0) console.log(`[WorkspaceStorage] Migrasi ${count} key selesai`);
    return count;
  }
};

window.WorkspaceStorage = WorkspaceStorage;
window._workspaceStorageReady = WorkspaceStorage.init().then(() => WorkspaceStorage.migrateFromLocalStorage());
