/* ================================================================
   supabase.js — Configuración de Supabase
   
   INSTRUCCIONES:
   1. Ve a https://supabase.com y crea un proyecto gratis
   2. En tu proyecto: Settings → API
   3. Copia "Project URL" y pégalo en SUPABASE_URL
   4. Copia "anon public" key y pégalo en SUPABASE_ANON_KEY
   ================================================================ */

const SUPABASE_URL      = 'https://zvhtkwaftophzzjlgnwd.supabase.co';
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

  // Buscar por auth_id primero
  let { data } = await db
    .from('usuarios')
    .select('*')
    .eq('auth_id', session.user.id)
    .maybeSingle();

  // Si no encontró, buscar por email y vincular auth_id
  if (!data) {
    const { data: byEmail } = await db
      .from('usuarios')
      .select('*')
      .eq('email', session.user.email)
      .maybeSingle();
    if (byEmail) {
      await db.from('usuarios').update({ auth_id: session.user.id }).eq('id', byEmail.id);
      data = { ...byEmail, auth_id: session.user.id };
    }
  }
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
  const rolLabels = {
    admin:'Administrador', editor:'Editor', viewer:'Visor',
    medico_operativo:'Médico Operativo', jefa_enfermeria:'Jefa de Enfermería',
    ventanilla_admision:'Ventanilla Admisión', director:'Director', subdirector:'Subdirector'
  };
  const badgeClass = {
    admin:'badge-admin', editor:'badge-editor', viewer:'badge-viewer',
    medico_operativo:'badge-editor', jefa_enfermeria:'badge-editor',
    ventanilla_admision:'badge-viewer', director:'badge-admin', subdirector:'badge-admin'
  };
  document.getElementById('hdr-user').textContent  = user.nombre;
  document.getElementById('hdr-badge').textContent = rolLabels[user.rol] || user.rol;
  document.getElementById('hdr-badge').className   = `badge ${badgeClass[user.rol] || 'badge-viewer'}`;
  if (user.rol !== 'admin') {
    const adminLink = document.getElementById('nav-admin');
    if (adminLink) adminLink.style.display = 'none';
    const adminSec = document.getElementById('nav-admin-sec');
    if (adminSec) adminSec.style.display = 'none';
  }
  if (user.rol === 'ventanilla_admision') {
    document.querySelectorAll('.sidebar-item').forEach(el => {
      if (!el.getAttribute('href')?.includes('admision_urgencias')) el.style.display = 'none';
    });
    document.querySelectorAll('.sidebar-section').forEach(el => el.style.display = 'none');
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
