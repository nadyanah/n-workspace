// ============================================================================
// PUSH NOTIFICATIONS — push-notifications.js
// ============================================================================
// - Mendaftarkan Service Worker (sw.js) untuk menerima Web Push
// - Subscribe/unsubscribe ke Push API memakai VAPID key
// - Menyimpan subscription ke tabel `push_subscriptions` di Supabase
//   (dipakai oleh Edge Function untuk mengirim notif sesuai jadwal pengingat)
// - Komponen Vue <push-notif-toggle> → switch "Notifikasi Background"
// ============================================================================

// VAPID public key (lihat PUSH_SETUP.md untuk pasangan private key-nya)
const VAPID_PUBLIC_KEY = 'BK6q5hjI5UQgKGzMvb_hgHNt762mpI70uv7eX9XTvcZSTsmdtDqsgcSKwd3kNYbk_tMIynrgEKQU8TJNtkGeUWo';

function _urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

const PushNotif = {
  _swRegistration: null,
  _initPromise: null,

  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  },

  getPermission() {
    return ('Notification' in window) ? Notification.permission : 'unsupported';
  },

  // -- Daftarkan service worker (dipanggil sekali saat app load) --
  init() {
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      if (!('serviceWorker' in navigator)) return null;
      try {
        const reg = await navigator.serviceWorker.register('./sw.js');
        this._swRegistration = reg;

        // Terima pesan dari SW saat notifikasi diklik → navigasi di dalam app
        navigator.serviceWorker.addEventListener('message', (event) => {
          const data = event.data || {};
          if (data.type !== 'push-notif-click') return;

          if (data.habitId) {
            window.dispatchEvent(new CustomEvent('ws-trigger-habit', { detail: { habitId: data.habitId } }));
          } else if (data.page) {
            window.dispatchEvent(new CustomEvent('ws-navigate', { detail: { page: data.page } }));
          }
        });

        return reg;
      } catch (e) {
        console.error('[PushNotif] Gagal mendaftarkan service worker:', e);
        return null;
      }
    })();

    return this._initPromise;
  },

  // -- Cek apakah device ini sudah subscribe --
  async getSubscriptionStatus() {
    if (!this.isSupported()) return 'unsupported';
    if (Notification.permission === 'denied') return 'denied';

    const reg = await this.init();
    if (!reg) return 'unsupported';

    const sub = await reg.pushManager.getSubscription();
    return sub ? 'on' : 'off';
  },

  // -- Minta izin + subscribe + simpan ke Supabase --
  async subscribe() {
    if (!this.isSupported()) throw new Error('Browser ini tidak mendukung push notification.');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Izin notifikasi tidak diberikan.');

    const reg = await this.init();
    if (!reg) throw new Error('Service worker gagal didaftarkan.');

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: _urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    await this._saveSubscription(sub);
    return sub;
  },

  // -- Unsubscribe + hapus dari Supabase --
  async unsubscribe() {
    const reg = await this.init();
    if (!reg) return;

    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await this._removeSubscription(sub);
      await sub.unsubscribe();
    }
  },

  async _saveSubscription(sub) {
    const client = window._wsSupabaseClient;
    const userId = window._wsGetUserId ? window._wsGetUserId() : null;
    if (!client || !userId) {
      console.warn('[PushNotif] User belum siap, subscription belum disimpan ke Supabase.');
      return;
    }
    const json = sub.toJSON();
    const { error } = await client.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,endpoint' });

    if (error) console.error('[PushNotif] Gagal simpan subscription:', error.message);
  },

  async _removeSubscription(sub) {
    const client = window._wsSupabaseClient;
    const userId = window._wsGetUserId ? window._wsGetUserId() : null;
    if (!client || !userId) return;

    const json = sub.toJSON();
    const { error } = await client
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', json.endpoint);

    if (error) console.error('[PushNotif] Gagal hapus subscription:', error.message);
  }
};

window.PushNotif = PushNotif;

// Daftarkan service worker sesegera mungkin (tidak perlu menunggu storage ready)
PushNotif.init();

// ============================================================================
// KOMPONEN: <push-notif-toggle> — switch "Notifikasi Background"
// ============================================================================
const PushNotifToggle = {
  template: `
    <div style="padding:12px 20px; border-bottom:1px solid var(--color-sand); display:flex; align-items:center; justify-content:space-between; gap:12px;">
      <div style="display:flex; align-items:center; gap:10px; min-width:0;">
        <div style="flex-shrink:0; width:30px; height:30px; border-radius:9px; background:rgba(214,123,82,0.10); display:flex; align-items:center; justify-content:center;">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" :stroke="status === 'on' ? 'var(--color-terracotta,#D67B52)' : 'var(--text-muted)'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
        <div style="min-width:0;">
          <div style="font-size:12.5px; font-weight:700; color:var(--text-dark);">Notifikasi Background</div>
          <div style="font-size:10.5px; color:var(--text-muted); line-height:1.4; margin-top:1px;">{{ statusText }}</div>
        </div>
      </div>

      <button v-if="status !== 'unsupported' && status !== 'denied'"
              @click="toggle" :disabled="loading"
              :style="switchStyle"
              :aria-pressed="status === 'on'"
              title="Aktif/non-aktifkan notifikasi background">
        <span :style="knobStyle"></span>
      </button>
    </div>
  `,

  data() {
    return {
      status: 'checking', // checking | on | off | unsupported | denied
      loading: false
    };
  },

  computed: {
    statusText() {
      switch (this.status) {
        case 'checking':    return 'Memeriksa status...';
        case 'on':          return 'Aktif — notif tetap masuk walau web ditutup';
        case 'off':         return 'Nyalakan agar notif tetap masuk walau web ditutup';
        case 'denied':       return 'Izin notifikasi diblokir di browser. Aktifkan lewat setting browser.';
        case 'unsupported':  return 'Browser ini belum mendukung fitur ini';
        default:            return '';
      }
    },
    switchStyle() {
      const on = this.status === 'on';
      return `width:42px; height:24px; border-radius:999px; border:none; cursor:${this.loading ? 'wait' : 'pointer'}; position:relative; flex-shrink:0; transition:background 0.2s; padding:0; background:${on ? 'var(--color-terracotta,#D67B52)' : '#E8DFD8'}; opacity:${this.loading ? 0.6 : 1};`;
    },
    knobStyle() {
      const on = this.status === 'on';
      return `position:absolute; top:3px; left:${on ? '21px' : '3px'}; width:18px; height:18px; border-radius:50%; background:#fff; transition:left 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.2);`;
    }
  },

  async mounted() {
    this.status = await PushNotif.getSubscriptionStatus();
  },

  methods: {
    async toggle() {
      if (this.loading) return;
      this.loading = true;
      try {
        if (this.status === 'on') {
          await PushNotif.unsubscribe();
          this.status = 'off';
        } else {
          await PushNotif.subscribe();
          this.status = 'on';
        }
      } catch (err) {
        console.error('[PushNotifToggle]', err);
        this.status = await PushNotif.getSubscriptionStatus();
        if (this.status !== 'denied') {
          alert('Gagal mengubah pengaturan notifikasi: ' + (err.message || err));
        }
      } finally {
        this.loading = false;
      }
    }
  }
};

window.PushNotifToggle = PushNotifToggle;
