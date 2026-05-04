const SUPABASE_URL = 'https://zvhtkwaftophzzjlgnwd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aHRrd2FmdG9waHp6amxnbndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4Mzk0MjAsImV4cCI6MjA5MzQxNTQyMH0.5r3J66MMg2sK5AKJAdSEETDfDxlQrbI0bO10W2dfR3Q';

/* Carga el cliente de Supabase desde CDN.
   No necesitas instalar nada. */
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ── SESIÓN ── */
async function getSession() {
  const { data: { session } } = await db.auth.getSession();
  return session;
}

async function getUser() {
  const session = await getSession();
  if (!session) return null;
  const { data } = await db
    .from('usuarios')
    .select('*')
    .eq('auth_id', session.user.id)
    .single();
  return data;
}

async function requireAuth() {
  try {
    const user = await getUser();
    if (!user) {
      window.location.href = 'index.html';
      return null;
    }
    return user;
  } catch(err) {
    console.error('requireAuth error:', err);
    try {
      const storageKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
      if(storageKey) localStorage.removeItem(storageKey);
    } catch(_) {}
    window.location.href = 'index.html';
    return null;
  }
}

async function logout() {
  await db.auth.signOut();
  window.location.href = 'index.html';
}

/* ── TOAST (notificación) ── */
function showToast(msg, type = '') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = `toast ${type}`;
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── RENDER HEADER ── */
function renderHeader(user) {
  const badgeClass = { admin: 'badge-admin', editor: 'badge-editor', viewer: 'badge-viewer' };
  document.getElementById('hdr-user').textContent  = user.nombre;
  document.getElementById('hdr-badge').textContent = user.rol.charAt(0).toUpperCase() + user.rol.slice(1);
  document.getElementById('hdr-badge').className   = `badge ${badgeClass[user.rol] || 'badge-viewer'}`;
  if (user.rol !== 'admin') {
    const adminLink = document.getElementById('nav-admin');
    if (adminLink) adminLink.style.display = 'none';
    const adminSec = document.getElementById('nav-admin-sec');
    if (adminSec) adminSec.style.display = 'none';
  }
}

/* ── HELPERS ── */
function trunc(s, n) { return s && s.length > n ? s.substring(0, n) + '…' : (s || ''); }

function chkHtml(val, red) {
  return val
    ? `<span class="chk ${red ? 'red' : 'on'}"></span>`
    : `<span class="chk"></span>`;
}

function servClass(sv) {
  const m = { 'Nefro': 'nefro', 'TyO': 'tyo', 'Cx. General': 'gen', 'MI': 'mi', 'Urgencias': 'urg' };
  return m[sv] || 'gen';
}

function triClass(t) {
  const m = { 'Rojo': 'R', 'Naranja': 'N', 'Amarillo': 'A', 'Verde': 'V' };
  return `triaje-${m[t] || 'V'}`;
}
