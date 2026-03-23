import { useState, useEffect, useRef } from 'react';
import {
  Search, Plus, Star, Heart, ChevronRight, ArrowLeft, Check,
  User, LogOut, Edit3, Trash2, Eye, BookOpen, Home, FileText,
  X, MessageSquare, Clock, TrendingUp, Layers, Users, UserPlus,
  GripVertical, Sun, Moon, Send, AlertCircle, CheckCircle2,
  Save, Globe, Lock, Copy, Settings, Crown, UserCheck, LogIn,
  FolderOpen, ChevronDown, Hash, Briefcase, ClipboardList
} from 'lucide-react';

// ─── Storage ──────────────────────────────────────────────────────────────────
const storage = {
  get: (key, def = null) => {
    try { const v = window.localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
  },
  set: (key, val) => {
    try { window.localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const now = () => new Date().toISOString();
const fmt = (iso) => new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
const avg = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;
const inviteCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

// ─── Theme ───────────────────────────────────────────────────────────────────
const LIGHT = {
  bg: '#f0f4ff', card: '#ffffff', cardAlt: '#f8faff',
  primary: '#3b6ef6', primaryDark: '#2451c7', primaryLight: '#e8effe',
  secondary: '#10b981', secondaryLight: '#d1fae5',
  accent: '#f59e0b', accentLight: '#fef3c7',
  purple: '#8b5cf6', purpleLight: '#ede9fe',
  text: '#1e293b', textSub: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0',
  danger: '#ef4444', dangerLight: '#fee2e2',
  success: '#10b981', successLight: '#d1fae5',
  shadow: '0 2px 12px rgba(59,110,246,0.10)',
  shadowMd: '0 4px 24px rgba(59,110,246,0.14)',
  nav: '#ffffff', overlay: 'rgba(30,41,59,0.45)',
};
const DARK = {
  bg: '#0f172a', card: '#1e293b', cardAlt: '#162032',
  primary: '#60a5fa', primaryDark: '#3b82f6', primaryLight: '#1e3a5f',
  secondary: '#34d399', secondaryLight: '#064e3b',
  accent: '#fbbf24', accentLight: '#1c1500',
  purple: '#a78bfa', purpleLight: '#2e1065',
  text: '#e2e8f0', textSub: '#94a3b8', textMuted: '#64748b',
  border: '#334155',
  danger: '#f87171', dangerLight: '#450a0a',
  success: '#34d399', successLight: '#022c22',
  shadow: '0 2px 12px rgba(0,0,0,0.4)',
  shadowMd: '0 4px 24px rgba(0,0,0,0.5)',
  nav: '#1e293b', overlay: 'rgba(0,0,0,0.65)',
};

const WS_COLORS = ['#3b6ef6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#f97316'];

function injectStyles(t) {
  const id = 'guiapro-styles';
  let el = document.getElementById(id);
  if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
  el.textContent = `
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    html,body,#root{height:100%;width:100%;overflow:hidden}
    body{font-family:'Segoe UI',system-ui,sans-serif;background:${t.bg};color:${t.text};transition:background .3s,color .3s}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-thumb{background:${t.border};border-radius:9px}
    input,textarea,select{font-family:inherit;outline:none}
    button{cursor:pointer;font-family:inherit;border:none;outline:none}
    .scroll{overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch}
    .scroll-x{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;white-space:nowrap;padding-bottom:4px}
    .fade-in{animation:fadeIn .25s ease}
    .slide-up{animation:slideUp .3s cubic-bezier(.4,0,.2,1)}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    .pulse{animation:pulse 1.5s infinite}
    .chip{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap}
    .card{background:${t.card};border-radius:16px;box-shadow:${t.shadow};border:1px solid ${t.border}}
    .tag{background:${t.primaryLight};color:${t.primary};font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px}
    .star-filled{color:#f59e0b;fill:#f59e0b}
    .star-empty{color:${t.border};fill:${t.border}}
    .progress-bar{height:6px;background:${t.border};border-radius:999px;overflow:hidden}
    .progress-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,${t.primary},${t.secondary});transition:width .4s cubic-bezier(.4,0,.2,1)}
    input[type=text],input[type=email],input[type=password],textarea,select{
      width:100%;background:${t.cardAlt};border:1.5px solid ${t.border};border-radius:12px;
      padding:12px 14px;color:${t.text};font-size:15px;transition:border .2s,box-shadow .2s
    }
    input[type=text]:focus,input[type=email]:focus,input[type=password]:focus,textarea:focus,select:focus{
      border-color:${t.primary};box-shadow:0 0 0 3px ${t.primaryLight}
    }
    input::placeholder,textarea::placeholder{color:${t.textMuted}}
    textarea{resize:vertical;min-height:80px}
    .modal-backdrop{position:fixed;inset:0;background:${t.overlay};z-index:100;display:flex;align-items:flex-end;justify-content:center}
    .modal-sheet{background:${t.card};border-radius:24px 24px 0 0;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;padding:24px;animation:slideUp .3s cubic-bezier(.4,0,.2,1)}
    .modal-handle{width:40px;height:4px;background:${t.border};border-radius:999px;margin:0 auto 20px}
    .bottom-nav{position:fixed;bottom:0;left:0;right:0;background:${t.nav};border-top:1px solid ${t.border};display:flex;align-items:center;justify-content:space-around;padding:8px 0 max(8px,env(safe-area-inset-bottom));z-index:50;box-shadow:0 -2px 12px rgba(0,0,0,.06)}
    .nav-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 12px;border-radius:12px;background:transparent;color:${t.textMuted};font-size:10px;font-weight:600;transition:all .18s;border:none;cursor:pointer}
    .nav-item.active{color:${t.primary}}
    .fab{position:fixed;bottom:76px;right:20px;width:56px;height:56px;border-radius:999px;background:${t.primary};color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:${t.shadowMd};z-index:49;transition:transform .18s;border:none;cursor:pointer}
    .fab:active{transform:scale(.94)}
    .section-title{font-size:16px;font-weight:700;color:${t.text};margin-bottom:12px;display:flex;align-items:center;gap:8px}
    .process-card{background:${t.card};border-radius:16px;border:1px solid ${t.border};padding:16px;margin-bottom:10px;transition:transform .15s;cursor:pointer}
    .process-card:active{transform:scale(.98)}
    .avatar{border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;text-transform:uppercase;flex-shrink:0}
    .ws-card{border-radius:18px;border:1px solid ${t.border};padding:18px;margin-bottom:12px;cursor:pointer;transition:transform .15s,box-shadow .15s;background:${t.card}}
    .ws-card:active{transform:scale(.98)}
    .search-bar{display:flex;align-items:center;gap:10px;background:${t.card};border:1.5px solid ${t.border};border-radius:14px;padding:10px 14px;transition:border .2s}
    .search-bar:focus-within{border-color:${t.primary};box-shadow:0 0 0 3px ${t.primaryLight}}
    .search-bar input{background:transparent;border:none;padding:0;font-size:15px;color:${t.text};flex:1;outline:none}
    .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:48px 20px;color:${t.textMuted};text-align:center}
    .empty-icon{width:64px;height:64px;background:${t.primaryLight};border-radius:20px;display:flex;align-items:center;justify-content:center}
    .filter-chip{padding:7px 14px;border-radius:999px;font-size:13px;font-weight:600;border:1.5px solid ${t.border};background:${t.card};color:${t.textSub};white-space:nowrap;cursor:pointer;transition:all .15s;display:inline-block}
    .step-item{display:flex;gap:12px;padding:14px;border-radius:14px;border:1.5px solid ${t.border};background:${t.card};margin-bottom:8px;transition:all .25s;align-items:flex-start;cursor:pointer}
    .step-num{width:28px;height:28px;border-radius:999px;background:${t.primaryLight};color:${t.primary};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;transition:all .25s}
    .comment-box{background:${t.cardAlt};border-radius:14px;padding:14px;margin-bottom:10px;border:1px solid ${t.border}}
    .member-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid ${t.border}}
    .member-row:last-child{border-bottom:none}
    .tab-bar{display:flex;gap:4px;background:${t.cardAlt};border-radius:12px;padding:4px;margin-bottom:16px}
    .tab-btn{flex:1;padding:8px;border-radius:9px;border:none;background:transparent;color:${t.textSub};font-weight:600;font-size:13px;cursor:pointer;transition:all .18s}
    .tab-btn.active{background:${t.card};color:${t.primary};box-shadow:0 1px 4px rgba(0,0,0,.08)}
    .code-box{background:${t.primaryLight};border:2px dashed ${t.primary};border-radius:14px;padding:16px 20px;text-align:center;cursor:pointer;transition:all .15s}
    .code-box:active{opacity:.8}
  `;
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────
function Stars({ rating, size = 16, interactive = false, onChange }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none"
          className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'}
          style={interactive ? { cursor: 'pointer' } : {}}
          onClick={interactive ? () => onChange(i) : undefined}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ))}
    </span>
  );
}

function Avatar({ name = '?', size = 36, color }) {
  const colors = ['#3b6ef6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#f97316'];
  const bg = color || colors[(name.charCodeAt(0)||0) % colors.length];
  return (
    <div className="avatar" style={{ width: size, height: size, background: bg, color: '#fff', fontSize: size * 0.38 }}>
      {name.charAt(0)}
    </div>
  );
}

function WsAvatar({ ws, size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: ws.color || '#3b6ef6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Briefcase size={size * 0.46} color="#fff" />
    </div>
  );
}

function ProcessCard({ proc, users, workspaces, onOpen, t, showWs = false }) {
  const author = users.find(u => u.id === proc.authorId) || {};
  const ws = workspaces?.find(w => w.id === proc.workspaceId);
  const rating = proc.ratings?.length ? avg(proc.ratings.map(r => r.val)) : 0;
  return (
    <div className="process-card" onClick={() => onOpen(proc.id)}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 4, lineHeight: 1.35 }}>{proc.title}</div>
        {proc.description && <div style={{ fontSize: 13, color: t.textSub, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{proc.description}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {proc.area && <span className="chip" style={{ background: t.primaryLight, color: t.primary }}>{proc.area}</span>}
        {proc.category && <span className="chip" style={{ background: t.secondaryLight, color: t.secondary }}>{proc.category}</span>}
        {showWs && ws && <span className="chip" style={{ background: ws.color + '22', color: ws.color }}><Briefcase size={10}/>{ws.name}</span>}
        <span style={{ fontSize: 12, color: t.textMuted }}>{proc.steps?.length || 0} pasos</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar name={author.name || '?'} size={22} />
          <span style={{ fontSize: 12, color: t.textSub }}>{author.name || 'Anónimo'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {rating > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Stars rating={rating} size={12}/><span style={{ fontSize: 12, color: t.textSub }}>{rating}</span></span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: t.textMuted }}><Heart size={12}/><span style={{ fontSize: 12 }}>{proc.likes?.length||0}</span></span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════
function AuthScreen({ onAuth, t }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', password:'', position:'', area:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const submit = () => {
    setError('');
    if (mode === 'register') {
      if (!form.name.trim()||!form.email.trim()||!form.password.trim()||!form.position.trim()||!form.area.trim()) { setError('Completa todos los campos'); return; }
      if (form.password.length < 6) { setError('Contraseña mínimo 6 caracteres'); return; }
      const users = storage.get('gp_users', []);
      if (users.find(u => u.email.toLowerCase() === form.email.toLowerCase())) { setError('Correo ya registrado'); return; }
      const user = { id: uid(), name: form.name.trim(), email: form.email.toLowerCase().trim(), password: form.password, position: form.position.trim(), area: form.area.trim(), role: 'employee', createdAt: now() };
      storage.set('gp_users', [...users, user]);
      setLoading(true);
      setTimeout(() => { setLoading(false); onAuth(user); }, 500);
    } else {
      if (!form.email.trim()||!form.password.trim()) { setError('Ingresa correo y contraseña'); return; }
      const users = storage.get('gp_users', []);
      const user = users.find(u => u.email.toLowerCase() === form.email.toLowerCase().trim() && u.password === form.password);
      if (!user) { setError('Correo o contraseña incorrectos'); return; }
      setLoading(true);
      setTimeout(() => { setLoading(false); onAuth(user); }, 400);
    }
  };

  return (
    <div className="scroll" style={{ minHeight:'100%', background:`linear-gradient(160deg,${t.primaryLight} 0%,${t.bg} 60%)`, padding:'48px 24px 40px' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ textAlign:'center', marginBottom: 40 }}>
          <div style={{ width:76, height:76, borderRadius:24, background:t.primary, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:t.shadowMd }}>
            <BookOpen size={38} color="#fff"/>
          </div>
          <h1 style={{ fontSize:30, fontWeight:800, color:t.primary, letterSpacing:-0.5 }}>GuíaPro</h1>
          <p style={{ color:t.textSub, fontSize:14, marginTop:4 }}>Procesos colaborativos para tu equipo</p>
        </div>
        <div style={{ display:'flex', background:t.card, borderRadius:14, padding:4, marginBottom:24, border:`1px solid ${t.border}` }}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ flex:1, padding:'10px', borderRadius:11, fontWeight:700, fontSize:14, border:'none', cursor:'pointer', background: mode===m ? t.primary : 'transparent', color: mode===m ? '#fff' : t.textSub, transition:'all .2s' }}>
              {m==='login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>
        <div className="card slide-up" style={{ padding:24 }}>
          {mode==='register' && <>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:13, fontWeight:600, color:t.textSub, display:'block', marginBottom:6 }}>Nombre completo *</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Tu nombre"/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:t.textSub, display:'block', marginBottom:6 }}>Puesto *</label>
                <input type="text" value={form.position} onChange={set('position')} placeholder="Tu puesto"/>
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:t.textSub, display:'block', marginBottom:6 }}>Área *</label>
                <input type="text" value={form.area} onChange={set('area')} placeholder="Tu área"/>
              </div>
            </div>
          </>}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:600, color:t.textSub, display:'block', marginBottom:6 }}>Correo electrónico *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="correo@empresa.com"/>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:13, fontWeight:600, color:t.textSub, display:'block', marginBottom:6 }}>Contraseña *</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" onKeyDown={e => e.key==='Enter' && submit()}/>
          </div>
          {error && <div style={{ background:t.dangerLight, color:t.danger, borderRadius:10, padding:'10px 14px', fontSize:13, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
            <AlertCircle size={16}/>{error}
          </div>}
          <button style={{ width:'100%', padding:'13px', borderRadius:12, fontWeight:700, fontSize:15, border:'none', cursor:'pointer', background:t.primary, color:'#fff' }} onClick={submit} disabled={loading}>
            {loading ? <span className="pulse">Cargando…</span> : (mode==='login' ? 'Entrar' : 'Crear cuenta')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// HOME
// ════════════════════════════════════════════════════════════
function HomeScreen({ user, processes, users, workspaces, activities, onOpen, onOpenActivity, onCreateNew, onOpenAdmin, t }) {
  const [search, setSearch] = useState('');

  // processes visible to user: general ones (visible to all) + private workspace ones where user is member/manager
  const myWsIds = workspaces.filter(w => w.managerId === user.id || w.memberIds?.includes(user.id)).map(w => w.id);
  const visible = processes.filter(p => {
    if (p.status !== 'published') return false;
    if (!p.visibility || p.visibility === 'general') return true; // general → visible para todos
    // private → solo miembros del proyecto
    return p.workspaceId && myWsIds.includes(p.workspaceId);
  });

  const isSearching = search.trim().length >= 2;
  const searchResults = isSearching ? visible.filter(p => {
    const q = search.toLowerCase();
    return p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) ||
      p.tags?.some(tg => tg.toLowerCase().includes(q)) || p.area?.toLowerCase().includes(q);
  }) : [];

  // IDs de todos los encargados/managers del sistema
  const allManagerIds = new Set(users.filter(u => ['admin','supervisor','manager'].includes(u.role)).map(u => u.id));
  // IDs de encargados de MIS proyectos (para procesos privados)
  const myWsManagerIds = new Set(workspaces.filter(w => myWsIds.includes(w.id)).map(w => w.managerId));
  const myArea = visible.filter(p => p.area?.toLowerCase() === user.area?.toLowerCase()).slice(0, 5);
  // Recién agregados:
  //   - 'general' publicado por cualquier encargado → visible para todos
  //   - 'private' publicado por encargado de MIS proyectos → solo yo (y el equipo)
  const recent = [...visible].filter(p => {
    const byManager = allManagerIds.has(p.authorId) || myWsManagerIds.has(p.authorId);
    if (!byManager) return false;
    if (!p.visibility || p.visibility === 'general') return true;
    return myWsManagerIds.has(p.authorId);
  }).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0, 8);
  const pendingActivities = (activities || []).filter(a => {
    if (!myWsIds.includes(a.workspaceId)) return false;
    const assigned = a.assignedTo === 'all' || (Array.isArray(a.assignedTo) && a.assignedTo.includes(user.id));
    if (!assigned) return false;
    return !a.completions?.some(c => c.userId === user.id);
  }).slice(0, 5);

  return (
    <div className="scroll" style={{ height:'100%', paddingBottom:80 }}>
      <div style={{ background:`linear-gradient(135deg,${t.primary} 0%,${t.primaryDark} 100%)`, padding:'52px 20px 32px', borderRadius:'0 0 28px 28px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:2 }}>
          <div>
            <p style={{ color:'rgba(255,255,255,.75)', fontSize:14, marginBottom:2 }}>Hola,</p>
            <h2 style={{ color:'#fff', fontSize:24, fontWeight:800, marginBottom:4 }}>{user.name.split(' ')[0]} 👋</h2>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <span style={{ color:'rgba(255,255,255,.65)', fontSize:13 }}>{user.position}{user.area ? ` · ${user.area}` : ''}</span>
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(255,255,255,.2)', borderRadius:20, padding:'3px 10px' }}>
              <span style={{ fontSize:12 }}>{ROLES[user.role||'employee']?.emoji}</span>
              <span style={{ color:'#fff', fontSize:11, fontWeight:700 }}>{ROLES[user.role||'employee']?.label}</span>
            </div>
          </div>
          {user.role === 'admin' && (
            <button onClick={onOpenAdmin}
              style={{ background:'rgba(255,255,255,.2)', border:'2px solid rgba(255,255,255,.4)', borderRadius:14, padding:'10px 14px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, minWidth:64 }}>
              <span style={{ fontSize:20 }}>👑</span>
              <span style={{ color:'#fff', fontSize:10, fontWeight:700, lineHeight:1.2, textAlign:'center' }}>Panel Admin</span>
            </button>
          )}
        </div>
        <div style={{ height:16 }}/>
        <div style={{ background:'rgba(255,255,255,.15)', backdropFilter:'blur(10px)', border:'1.5px solid rgba(255,255,255,.25)', borderRadius:14, display:'flex', alignItems:'center', gap:10, padding:'11px 14px' }}>
          <Search size={18} color="rgba(255,255,255,.8)"/>
          <input style={{ background:'transparent', border:'none', outline:'none', color:'#fff', fontSize:15, flex:1 }} placeholder="Buscar procesos…" value={search} onChange={e => setSearch(e.target.value)}/>
          {search && <button style={{ background:'transparent', border:'none', color:'rgba(255,255,255,.8)', cursor:'pointer', padding:0 }} onClick={() => setSearch('')}><X size={16}/></button>}
        </div>
      </div>

      <div style={{ padding:'20px 16px 0' }}>
        {isSearching ? (
          <>
            <div className="section-title">Resultados <span style={{ fontSize:13, color:t.textMuted, fontWeight:500 }}>({searchResults.length})</span></div>
            {searchResults.length === 0
              ? <div className="empty-state"><div className="empty-icon"><Search size={28} color={t.primary}/></div><p style={{ color:t.text, fontWeight:700 }}>Sin resultados</p></div>
              : searchResults.map(p => <ProcessCard key={p.id} proc={p} users={users} workspaces={workspaces} onOpen={onOpen} t={t} showWs/>)}
          </>
        ) : visible.length === 0 ? (
          <div className="empty-state" style={{ padding:'60px 20px' }}>
            <div className="empty-icon" style={{ width:80, height:80, borderRadius:24 }}><BookOpen size={36} color={t.primary}/></div>
            <h3 style={{ fontSize:18, fontWeight:800, color:t.text }}>¡Bienvenido a GuíaPro!</h3>
            <p style={{ fontSize:14, maxWidth:280, lineHeight:1.6 }}>Crea un Proyecto de Trabajo o publica tu primer proceso.</p>
            <button style={{ marginTop:8, display:'flex', alignItems:'center', gap:8, background:t.primary, color:'#fff', border:'none', borderRadius:12, padding:'12px 24px', fontWeight:700, fontSize:15, cursor:'pointer' }} onClick={onCreateNew}>
              <Plus size={18}/> Crear proceso
            </button>
          </div>
        ) : (
          <>
            {pendingActivities.length > 0 && (
              <div style={{ marginBottom:24 }}>
                <div className="section-title"><ClipboardList size={15}/> Mis actividades pendientes <span style={{ fontSize:12, color:t.textMuted, fontWeight:500 }}>({pendingActivities.length})</span></div>
                {pendingActivities.map(a => {
                  const ws = workspaces.find(w => w.id === a.workspaceId);
                  return (
                    <div key={a.id} onClick={() => onOpenActivity(a)} style={{ background:t.card, borderRadius:14, border:`1.5px solid ${t.border}`, padding:14, marginBottom:8, cursor:'pointer', display:'flex', gap:12, alignItems:'center', transition:'transform .15s' }}>
                      <div style={{ width:40, height:40, borderRadius:11, background:t.primaryLight, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <ClipboardList size={20} color={t.primary}/>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:14, color:t.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.title}</div>
                        <div style={{ fontSize:12, color:t.textMuted }}>{ws?.name}</div>
                      </div>
                      <ChevronRight size={16} color={t.textMuted}/>
                    </div>
                  );
                })}
              </div>
            )}
            {recent.length > 0  && <Section title={<><Clock size={15}/>Recién agregados</>} items={recent} users={users} workspaces={workspaces} onOpen={onOpen} t={t}/>}
            {myArea.length > 0 && <Section title={<><Layers size={15}/>Procesos de tu área</>} items={myArea} users={users} workspaces={workspaces} onOpen={onOpen} t={t}/>}
            {recent.length === 0 && myArea.length === 0 && visible.length > 0 && (
              <Section title={<><Globe size={15}/>Procesos disponibles</>} items={visible.slice(0,8)} users={users} workspaces={workspaces} onOpen={onOpen} t={t}/>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, items, users, workspaces, onOpen, t }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div className="section-title">{title}</div>
      {items.map(p => <ProcessCard key={p.id} proc={p} users={users} workspaces={workspaces} onOpen={onOpen} t={t} showWs/>)}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// WORKSPACES LIST
// ════════════════════════════════════════════════════════════
function WorkspacesScreen({ user, workspaces, processes, users, onOpenWs, onCreateWs, t }) {
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [showJoin, setShowJoin] = useState(false);

  const canManage = ['admin','supervisor','manager'].includes(user.role);
  const myWs = workspaces.filter(w => w.managerId === user.id || w.memberIds?.includes(user.id));
  const managed = myWs.filter(w => w.managerId === user.id);
  const member  = myWs.filter(w => w.managerId !== user.id);

  const handleJoin = () => {
    setJoinError(''); setJoinSuccess('');
    const code = joinCode.trim().toUpperCase();
    if (!code) { setJoinError('Ingresa un código'); return; }
    const ws = workspaces.find(w => w.inviteCode === code);
    if (!ws) { setJoinError('Código inválido o no existe'); return; }
    if (ws.managerId === user.id || ws.memberIds?.includes(user.id)) { setJoinError('Ya eres miembro de este proyecto'); return; }
    onOpenWs(ws.id, 'join');
    setJoinCode(''); setShowJoin(false);
  };

  return (
    <div className="scroll" style={{ height:'100%', paddingBottom:80 }}>
      <div style={{ padding:'56px 16px 0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontSize:22, fontWeight:800, color:t.text }}>Proyectos</h2>
          <button onClick={() => setShowJoin(s => !s)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:12, background:t.primaryLight, color:t.primary, border:'none', fontWeight:700, fontSize:13, cursor:'pointer' }}>
            <LogIn size={15}/> Unirme
          </button>
        </div>

        {/* Join by code */}
        {showJoin && (
          <div className="card" style={{ padding:16, marginBottom:16 }}>
            <p style={{ fontSize:13, fontWeight:700, color:t.text, marginBottom:10 }}>Unirme con código de invitación</p>
            <div style={{ display:'flex', gap:8 }}>
              <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Ej: ABC123" style={{ flex:1, letterSpacing:3, fontWeight:700, textTransform:'uppercase' }} maxLength={6}/>
              <button onClick={handleJoin} style={{ padding:'10px 16px', borderRadius:12, background:t.primary, color:'#fff', border:'none', fontWeight:700, cursor:'pointer' }}>Unirme</button>
            </div>
            {joinError && <p style={{ color:t.danger, fontSize:13, marginTop:8 }}>{joinError}</p>}
          </div>
        )}

        {myWs.length === 0 ? (
          <div className="empty-state" style={{ padding:'60px 20px' }}>
            <div className="empty-icon" style={{ width:80, height:80, borderRadius:24 }}><Briefcase size={36} color={t.primary}/></div>
            <h3 style={{ fontSize:18, fontWeight:800, color:t.text }}>Sin proyectos aún</h3>
            {canManage
              ? <><p style={{ fontSize:14, maxWidth:280, lineHeight:1.6 }}>Crea tu primer proyecto para organizar a tu equipo y sus procesos.</p>
                  <button style={{ marginTop:8, display:'flex', alignItems:'center', gap:8, background:t.primary, color:'#fff', border:'none', borderRadius:12, padding:'12px 24px', fontWeight:700, fontSize:15, cursor:'pointer' }} onClick={onCreateWs}>
                    <Plus size={18}/> Crear proyecto
                  </button></>
              : <p style={{ fontSize:14, maxWidth:280, lineHeight:1.6 }}>Pide el código de invitación a tu encargado para unirte a un proyecto.</p>
            }
          </div>
        ) : (
          <>
            {managed.length > 0 && <>
              <div className="section-title"><Crown size={15} style={{ color:t.accent }}/> Que administro ({managed.length})</div>
              {managed.map(ws => <WsCard key={ws.id} ws={ws} user={user} processes={processes} users={users} onOpen={onOpenWs} t={t}/>)}
            </>}
            {member.length > 0 && <>
              <div className="section-title" style={{ marginTop: managed.length > 0 ? 8 : 0 }}><UserCheck size={15}/> Soy miembro ({member.length})</div>
              {member.map(ws => <WsCard key={ws.id} ws={ws} user={user} processes={processes} users={users} onOpen={onOpenWs} t={t}/>)}
            </>}
          </>
        )}
      </div>

      {canManage && <button className="fab" onClick={onCreateWs} title="Nuevo proyecto"><Plus size={26}/></button>}
    </div>
  );
}

function WsCard({ ws, user, processes, users, onOpen, t }) {
  const isManager = ws.managerId === user.id;
  const manager = users.find(u => u.id === ws.managerId) || {};
  const procCount = processes.filter(p => p.workspaceId === ws.id && p.status === 'published').length;
  const memberCount = (ws.memberIds?.length || 0) + 1; // +1 manager
  return (
    <div className="ws-card" onClick={() => onOpen(ws.id)}>
      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        <WsAvatar ws={ws} size={48}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontWeight:800, fontSize:16, color:t.text }}>{ws.name}</span>
            {isManager && <span className="chip" style={{ background:t.accentLight, color:t.accent, fontSize:11 }}><Crown size={10}/> Encargado</span>}
          </div>
          {ws.description && <p style={{ fontSize:13, color:t.textSub, marginBottom:8, lineHeight:1.4 }}>{ws.description}</p>}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <span style={{ fontSize:12, color:t.textMuted, display:'flex', alignItems:'center', gap:4 }}><Users size={12}/>{memberCount} miembro{memberCount!==1?'s':''}</span>
            <span style={{ fontSize:12, color:t.textMuted, display:'flex', alignItems:'center', gap:4 }}><FileText size={12}/>{procCount} proceso{procCount!==1?'s':''}</span>
          </div>
        </div>
        <ChevronRight size={18} color={t.textMuted}/>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CREATE WORKSPACE
// ════════════════════════════════════════════════════════════
function CreateWorkspaceScreen({ user, onSave, onCancel, editWs, t }) {
  const ex = editWs;
  const [name, setName] = useState(ex?.name || '');
  const [desc, setDesc] = useState(ex?.description || '');
  const [color, setColor] = useState(ex?.color || WS_COLORS[0]);
  const [error, setError] = useState('');

  const save = () => {
    setError('');
    if (!name.trim()) { setError('El nombre es obligatorio'); return; }
    const ws = {
      id: ex?.id || uid(),
      name: name.trim(),
      description: desc.trim(),
      color,
      managerId: user.id,
      memberIds: ex?.memberIds || [],
      inviteCode: ex?.inviteCode || inviteCode(),
      createdAt: ex?.createdAt || now(),
    };
    onSave(ws);
  };

  return (
    <div className="scroll" style={{ height:'100%', paddingBottom:80 }}>
      <div style={{ padding:'56px 16px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <button onClick={onCancel} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:12, padding:8, cursor:'pointer', display:'flex' }}><ArrowLeft size={20} color={t.text}/></button>
          <h2 style={{ fontSize:20, fontWeight:800, color:t.text }}>{ex ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>
        </div>

        {/* Color picker */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:13, fontWeight:700, color:t.textSub, display:'block', marginBottom:10 }}>Color del proyecto</label>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {WS_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                style={{ width:36, height:36, borderRadius:12, background:c, border: color===c ? `3px solid ${t.text}` : '3px solid transparent', cursor:'pointer', transition:'transform .15s', transform: color===c ? 'scale(1.15)' : 'scale(1)' }}>
                {color===c && <Check size={16} color="#fff"/>}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="card" style={{ padding:20, marginBottom:20, display:'flex', gap:14, alignItems:'center' }}>
          <div style={{ width:52, height:52, borderRadius:16, background:color, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Briefcase size={24} color="#fff"/>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:16, color:t.text }}>{name || 'Nombre del proyecto'}</div>
            <div style={{ fontSize:13, color:t.textMuted }}>{desc || 'Descripción opcional'}</div>
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, fontWeight:700, color:t.textSub, display:'block', marginBottom:6 }}>Nombre del proyecto *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Equipo de Ventas Norte"/>
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={{ fontSize:13, fontWeight:700, color:t.textSub, display:'block', marginBottom:6 }}>Descripción (opcional)</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="¿Para qué es este proyecto? ¿Qué tipo de procesos tendrá?" rows={3}/>
        </div>

        {error && <div style={{ background:t.dangerLight, color:t.danger, borderRadius:12, padding:'12px 16px', fontSize:14, marginBottom:16, display:'flex', gap:8 }}><AlertCircle size={16}/>{error}</div>}

        <button style={{ width:'100%', padding:'14px', borderRadius:12, fontWeight:700, fontSize:15, border:'none', cursor:'pointer', background:t.primary, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={save}>
          <Briefcase size={18}/> {ex ? 'Guardar cambios' : 'Crear proyecto'}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ACTIVITIES
// ════════════════════════════════════════════════════════════
function CreateActivityModal({ ws, processes, users, user, onSave, onClose, t }) {
  const wsProcesses = processes.filter(p => p.workspaceId === ws.id && p.status === 'published');
  const members = (ws.memberIds || []).map(id => users.find(u => u.id === id)).filter(Boolean);
  const [procId, setProcId] = useState(wsProcesses[0]?.id || '');
  const [assignTo, setAssignTo] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const toggleMember = (id) => setSelectedMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const save = () => {
    setError('');
    if (!procId) { setError('Selecciona un proceso'); return; }
    if (assignTo === 'specific' && selectedMembers.length === 0) { setError('Selecciona al menos un miembro'); return; }
    const proc = processes.find(p => p.id === procId);
    onSave({ id: uid(), workspaceId: ws.id, processId: procId, title: proc?.title || '', type: 'execute', assignedTo: assignTo === 'all' ? 'all' : selectedMembers, dueDate: dueDate || null, createdBy: user.id, createdAt: now(), completions: [] });
    onClose();
  };

  const Lbl = ({ children }) => <label style={{ fontSize:13, fontWeight:700, color:t.textSub, display:'block', marginBottom:6 }}>{children}</label>;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle"/>
        <h3 style={{ fontSize:18, fontWeight:800, color:t.text, marginBottom:16 }}>Asignar proceso como actividad</h3>

        {wsProcesses.length === 0 ? (
          <div style={{ textAlign:'center', padding:'24px 0' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
            <p style={{ fontWeight:700, color:t.text, marginBottom:6 }}>No hay procesos en este proyecto</p>
            <p style={{ fontSize:13, color:t.textMuted, marginBottom:20 }}>Primero agrega y publica un proceso para poder asignarlo como actividad.</p>
            <button onClick={onClose} style={{ padding:'10px 24px', borderRadius:12, background:t.cardAlt, color:t.textSub, border:`1px solid ${t.border}`, fontWeight:700, cursor:'pointer' }}>Cerrar</button>
          </div>
        ) : (<>
          <div style={{ marginBottom:16 }}>
            <Lbl>Proceso *</Lbl>
            <select value={procId} onChange={e => setProcId(e.target.value)}>
              {wsProcesses.map(p => <option key={p.id} value={p.id}>{p.title} ({p.steps?.length || 0} pasos)</option>)}
            </select>
            {procId && (() => {
              const p = wsProcesses.find(pr => pr.id === procId);
              return p?.description ? (
                <p style={{ fontSize:12, color:t.textMuted, marginTop:6, lineHeight:1.5 }}>{p.description}</p>
              ) : null;
            })()}
          </div>

          <div style={{ marginBottom:16 }}>
            <Lbl>Asignar a</Lbl>
            <div style={{ display:'flex', gap:8, marginBottom:8 }}>
              {[['all','Todos los miembros'],['specific','Específicos']].map(([val,label]) => (
                <button key={val} onClick={() => setAssignTo(val)} style={{ flex:1, padding:'9px', borderRadius:10, border:`1.5px solid ${assignTo===val?t.primary:t.border}`, background:assignTo===val?t.primaryLight:t.card, color:assignTo===val?t.primary:t.textSub, fontWeight:700, fontSize:13, cursor:'pointer', transition:'all .15s' }}>
                  {label}
                </button>
              ))}
            </div>
            {assignTo === 'specific' && (
              <div style={{ maxHeight:140, overflowY:'auto' }}>
                {members.length === 0
                  ? <p style={{ fontSize:13, color:t.textMuted }}>No hay miembros en este proyecto aún.</p>
                  : members.map(m => (
                    <div key={m.id} onClick={() => toggleMember(m.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, cursor:'pointer', background:selectedMembers.includes(m.id)?t.primaryLight:'transparent', marginBottom:4 }}>
                      <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${selectedMembers.includes(m.id)?t.primary:t.border}`, background:selectedMembers.includes(m.id)?t.primary:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {selectedMembers.includes(m.id) && <Check size={12} color="#fff"/>}
                      </div>
                      <Avatar name={m.name||'?'} size={28}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:t.text }}>{m.name}</div>
                        <div style={{ fontSize:11, color:t.textMuted }}>{m.position}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          <div style={{ marginBottom:20 }}>
            <Lbl>Fecha límite (opcional)</Lbl>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}/>
          </div>

          {error && <div style={{ background:t.dangerLight, color:t.danger, borderRadius:10, padding:'10px 14px', fontSize:13, marginBottom:12, display:'flex', gap:8 }}><AlertCircle size={16}/>{error}</div>}
          <div style={{ display:'flex', gap:10 }}>
            <button style={{ flex:1, padding:'12px', borderRadius:12, background:t.cardAlt, color:t.textSub, border:`1px solid ${t.border}`, fontWeight:700, cursor:'pointer' }} onClick={onClose}>Cancelar</button>
            <button style={{ flex:2, padding:'12px', borderRadius:12, background:t.primary, color:'#fff', border:'none', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={save}>
              <ClipboardList size={16}/> Asignar proceso
            </button>
          </div>
        </>)}
      </div>
    </div>
  );
}

function ActivityCard({ activity, processes, users, user, isManager, onOpen, onDelete, t }) {
  const proc = processes.find(p => p.id === activity.processId);
  const stepCount = proc?.steps?.length || 0;
  const isCompleted = activity.completions?.some(c => c.userId === user.id);
  const completionCount = activity.completions?.length || 0;
  const totalAssigned = activity.assignedTo === 'all' ? null : activity.assignedTo?.length || 0;
  const isOverdue = activity.dueDate && new Date(activity.dueDate) < new Date() && !isCompleted;
  return (
    <div onClick={() => onOpen(activity)} style={{ background:t.card, borderRadius:16, border:`1.5px solid ${isCompleted?t.success:isOverdue?t.danger:t.border}`, padding:14, marginBottom:10, cursor:'pointer', display:'flex', gap:12, alignItems:'center', transition:'transform .15s' }}>
      <div style={{ width:42, height:42, borderRadius:12, background:isCompleted?t.successLight:t.primaryLight, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {isCompleted ? <CheckCircle2 size={22} color={t.success}/> : <ClipboardList size={22} color={t.primary}/>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
          <span style={{ fontWeight:700, fontSize:14, color:t.text, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{activity.title}</span>
          {isCompleted && <span style={{ fontSize:11, fontWeight:700, color:t.success, background:t.successLight, padding:'2px 8px', borderRadius:999, flexShrink:0 }}>✓ Hecho</span>}
        </div>
        <div style={{ fontSize:12, color:t.textMuted, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span>{stepCount} paso{stepCount!==1?'s':''}</span>
          {activity.dueDate && <span style={{ color:isOverdue?t.danger:t.textMuted }}>{isOverdue?'⚠️ ':'⏰ '}Vence {fmt(activity.dueDate)}</span>}
          {isManager && <span style={{ display:'flex', alignItems:'center', gap:3 }}><CheckCircle2 size={11}/>{completionCount} completado{completionCount!==1?'s':''}{activity.assignedTo !== 'all' && totalAssigned !== null ? ` / ${totalAssigned}` : ''}</span>}
        </div>
      </div>
      {isManager && (
        <button onClick={e => { e.stopPropagation(); onDelete(activity.id); }} style={{ background:'transparent', border:'none', color:t.textMuted, cursor:'pointer', padding:4, flexShrink:0 }}>
          <Trash2 size={15}/>
        </button>
      )}
    </div>
  );
}

function ActivityView({ activity, process: proc, user, onComplete, onBack, t }) {
  const [done, setDone] = useState({});
  const isCompleted = activity.completions?.some(c => c.userId === user.id);
  const steps = proc?.steps || [];
  const total = steps.length;
  const doneCount = Object.values(done).filter(Boolean).length;
  const allDone = total > 0 && doneCount === total;

  return (
    <div className="scroll" style={{ height:'100%', paddingBottom:80 }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${t.primary} 0%,${t.primaryDark} 100%)`, padding:'52px 20px 24px', borderRadius:'0 0 28px 28px' }}>
        <button onClick={onBack} style={{ background:'rgba(255,255,255,.2)', border:'none', borderRadius:12, padding:8, cursor:'pointer', display:'flex', marginBottom:16 }}>
          <ArrowLeft size={20} color="#fff"/>
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:total>0?14:0 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <ClipboardList size={24} color="#fff"/>
          </div>
          <div>
            <div style={{ color:'rgba(255,255,255,.75)', fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:2 }}>ACTIVIDAD</div>
            <h2 style={{ color:'#fff', fontSize:19, fontWeight:800, lineHeight:1.3 }}>{activity.title}</h2>
          </div>
        </div>
        {total > 0 && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', color:'rgba(255,255,255,.8)', fontSize:12, marginBottom:6 }}>
              <span>Progreso</span><span>{doneCount}/{total} pasos</span>
            </div>
            <div style={{ height:7, background:'rgba(255,255,255,.25)', borderRadius:999 }}>
              <div style={{ height:'100%', width:`${total?(doneCount/total)*100:0}%`, background:'#fff', borderRadius:999, transition:'width .4s' }}/>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding:'20px 16px 0' }}>
        {isCompleted && (
          <div style={{ background:t.successLight, border:`1.5px solid ${t.success}`, borderRadius:14, padding:16, marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
            <CheckCircle2 size={24} color={t.success}/>
            <div>
              <div style={{ fontWeight:700, color:t.success, fontSize:15 }}>¡Actividad completada!</div>
              <div style={{ fontSize:13, color:t.textSub }}>Ya marcaste esta actividad como realizada.</div>
            </div>
          </div>
        )}

        {proc?.description && (
          <div className="card" style={{ padding:16, marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:t.textSub, marginBottom:4, textTransform:'uppercase', letterSpacing:.5 }}>Descripción</div>
            <p style={{ fontSize:14, color:t.text, lineHeight:1.6 }}>{proc.description}</p>
          </div>
        )}

        {steps.length > 0 && (
          <div style={{ marginBottom:16 }}>
            <div className="section-title">Pasos a realizar</div>
            {steps.map((step, i) => {
              const isDone = !!done[i], isNext = !isDone && doneCount === i;
              return (
                <div key={step.id||i} className="step-item"
                  onClick={!isCompleted ? () => setDone(d => ({...d,[i]:!d[i]})) : undefined}
                  style={{ border:`1.5px solid ${isDone?t.success:isNext?t.primary:t.border}`, background:isDone?t.successLight:t.card, cursor:isCompleted?'default':'pointer', boxShadow:isNext?`0 0 0 3px ${t.primaryLight}`:'none' }}>
                  <div className="step-num" style={{ background:isDone?t.success:isNext?t.primary:t.primaryLight, color:isDone||isNext?'#fff':t.primary }}>
                    {isDone ? <Check size={13}/> : i+1}
                  </div>
                  <p style={{ flex:1, fontSize:15, color:isDone?t.textMuted:t.text, textDecoration:isDone?'line-through':'none', lineHeight:1.5 }}>{step.text}</p>
                  <div style={{ width:22, height:22, borderRadius:7, border:`2px solid ${isDone?t.success:isNext?t.primary:t.border}`, background:isDone?t.success:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                    {isDone && <Check size={13} color="#fff"/>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {proc?.notes && (
          <div className="card" style={{ padding:16, marginBottom:16, border:`1.5px solid ${t.accent}30`, background:`${t.accent}10` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, color:t.accent, fontWeight:700, fontSize:14 }}><AlertCircle size={16}/> Notas y tips</div>
            <p style={{ fontSize:14, color:t.text, lineHeight:1.6 }}>{proc.notes}</p>
          </div>
        )}

        {!isCompleted && (
          <button onClick={() => onComplete(activity.id)} disabled={!allDone}
            style={{ width:'100%', padding:'15px', borderRadius:14, fontWeight:700, fontSize:15, border:'none', cursor:!allDone?'not-allowed':'pointer', background:!allDone?t.border:t.success, color:!allDone?t.textMuted:'#fff', display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'all .2s' }}>
            <CheckCircle2 size={20}/>
            {allDone ? '¡Marcar como realizado!' : `Completa todos los pasos (${doneCount}/${total})`}
          </button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// WORKSPACE DETAIL
// ════════════════════════════════════════════════════════════
function WorkspaceDetailScreen({ ws, user, users, processes, workspaces, activities, onBack, onEdit, onDelete, onUpdate, onUpdateWs, onOpenProcess, onCreateProcess, onCreateActivity, onDeleteActivity, onOpenActivity, onApprove, onReject, t }) {
  const [activeTab, setActiveTab] = useState('procesos');
  const [showInvite, setShowInvite] = useState(false);
  const [showDelConfirm, setShowDelConfirm] = useState(false);
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [copied, setCopied] = useState(false);

  const isManager = ws.managerId === user.id;
  const manager = users.find(u => u.id === ws.managerId) || {};
  const members = (ws.memberIds || []).map(id => users.find(u => u.id === id)).filter(Boolean);
  const wsProcesses = processes.filter(p => p.workspaceId === ws.id && (p.status === 'published' || p.authorId === user.id));
  const wsProcessesPublished = wsProcesses.filter(p => p.status === 'published');
  const wsPending = isManager ? processes.filter(p => p.workspaceId === ws.id && p.status === 'pending') : [];
  const wsActivities = (activities || []).filter(a => a.workspaceId === ws.id);

  const copyCode = () => {
    navigator.clipboard?.writeText(ws.inviteCode).catch(()=>{});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const removeMember = (uid) => {
    onUpdateWs({ ...ws, memberIds: (ws.memberIds || []).filter(id => id !== uid) });
  };

  const leaveWorkspace = () => {
    onUpdateWs({ ...ws, memberIds: (ws.memberIds || []).filter(id => id !== user.id) });
    onBack();
  };

  return (
    <div className="scroll" style={{ height:'100%', paddingBottom:80 }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg, ${ws.color}dd 0%, ${ws.color} 100%)`, padding:'52px 20px 24px', borderRadius:'0 0 28px 28px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,.2)', border:'none', borderRadius:12, padding:8, cursor:'pointer', display:'flex' }}>
            <ArrowLeft size={20} color="#fff"/>
          </button>
          <div style={{ display:'flex', gap:8 }}>
            {isManager && <>
              <button onClick={onEdit} style={{ background:'rgba(255,255,255,.2)', border:'none', borderRadius:12, padding:'8px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:'#fff', fontWeight:700, fontSize:13 }}>
                <Edit3 size={14}/> Editar
              </button>
              <button onClick={() => setShowDelConfirm(true)} style={{ background:'rgba(255,255,255,.2)', border:'none', borderRadius:12, padding:8, cursor:'pointer', display:'flex', color:'#fff' }}>
                <Trash2 size={16}/>
              </button>
            </>}
          </div>
        </div>
        <div style={{ display:'flex', gap:14, alignItems:'center' }}>
          <div style={{ width:52, height:52, borderRadius:16, background:'rgba(255,255,255,.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Briefcase size={26} color="#fff"/>
          </div>
          <div>
            <h2 style={{ color:'#fff', fontSize:22, fontWeight:800, marginBottom:2 }}>{ws.name}</h2>
            {ws.description && <p style={{ color:'rgba(255,255,255,.8)', fontSize:13 }}>{ws.description}</p>}
          </div>
        </div>
        <div style={{ display:'flex', gap:16, marginTop:14 }}>
          {[
            [`${members.length + 1}`, 'miembro' + (members.length + 1 !== 1 ? 's' : '')],
            [`${wsProcessesPublished.length}`, 'proceso' + (wsProcessesPublished.length !== 1 ? 's' : '')],
            [`${wsActivities.length}`, 'actividad' + (wsActivities.length !== 1 ? 'es' : '')],
          ].map(([v, l]) => (
            <div key={l} style={{ background:'rgba(255,255,255,.15)', borderRadius:10, padding:'6px 14px', textAlign:'center' }}>
              <div style={{ color:'#fff', fontWeight:800, fontSize:18 }}>{v}</div>
              <div style={{ color:'rgba(255,255,255,.75)', fontSize:11 }}>{l}</div>
            </div>
          ))}
          {isManager && (
            <button onClick={() => setShowInvite(s => !s)} style={{ background:'rgba(255,255,255,.2)', border:'none', borderRadius:10, padding:'6px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:'#fff', fontWeight:700, fontSize:13 }}>
              <UserPlus size={15}/> Invitar
            </button>
          )}
        </div>
      </div>

      <div style={{ padding:'20px 16px 0' }}>
        {/* Invite code panel */}
        {showInvite && isManager && (
          <div className="card" style={{ padding:16, marginBottom:16 }}>
            <p style={{ fontSize:13, fontWeight:700, color:t.text, marginBottom:4 }}>Código de invitación</p>
            <p style={{ fontSize:12, color:t.textMuted, marginBottom:12 }}>Comparte este código con quienes quieres agregar al proyecto</p>
            <div className="code-box" onClick={copyCode}>
              <div style={{ fontSize:28, fontWeight:800, color:t.primary, letterSpacing:6 }}>{ws.inviteCode}</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:8, color:t.primary, fontSize:13, fontWeight:600 }}>
                {copied ? <><CheckCircle2 size={15}/> ¡Copiado!</> : <><Copy size={15}/> Toca para copiar</>}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tab-bar">
          {[['procesos','Procesos'],['actividades','Actividades'],['miembros','Miembros']].map(([id,label]) => (
            <button key={id} className={`tab-btn ${activeTab===id?'active':''}`} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
        </div>

        {/* PROCESOS TAB */}
        {activeTab === 'procesos' && (
          <>
            {isManager && (
              <button onClick={onCreateProcess} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'12px', border:`1.5px dashed ${ws.color}`, borderRadius:14, background:ws.color+'15', color:ws.color, fontWeight:700, cursor:'pointer', fontSize:14, marginBottom:16 }}>
                <Plus size={16}/> Agregar proceso al proyecto
              </button>
            )}

            {/* Procesos enviados por empleados — solo visible para encargado */}
            {isManager && wsPending.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div className="section-title" style={{ color:t.accent }}>⏳ Por aprobar ({wsPending.length})</div>
                {wsPending.map(p => {
                  const author = users.find(u => u.id === p.authorId) || {};
                  return (
                    <div key={p.id} style={{ background:t.card, borderRadius:14, border:`1.5px solid ${t.accent}55`, padding:14, marginBottom:8 }}>
                      <div onClick={() => onOpenProcess(p.id)} style={{ cursor:'pointer', marginBottom:10 }}>
                        <div style={{ fontWeight:700, fontSize:15, color:t.text, marginBottom:4 }}>{p.title}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:t.textMuted }}>
                          <Avatar name={author.name||'?'} size={18}/>
                          <span>Enviado por {author.name||'?'}</span>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={() => onReject(p.id)} style={{ flex:1, padding:'8px', borderRadius:10, background:t.dangerLight, color:t.danger, border:'none', fontWeight:700, fontSize:13, cursor:'pointer' }}>✕ Rechazar</button>
                        <button onClick={() => onApprove(p.id,'private')} style={{ flex:2, padding:'8px', borderRadius:10, background:t.secondaryLight, color:t.secondary, border:'none', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}><CheckCircle2 size={14}/> Publicar en proyecto</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {wsProcessesPublished.length === 0 && wsPending.length === 0
              ? <div className="empty-state"><div className="empty-icon"><FileText size={28} color={t.primary}/></div>
                  <p style={{ fontWeight:700, color:t.text }}>Sin procesos aún</p>
                  {isManager && <p style={{ fontSize:13 }}>Agrega el primer proceso de este proyecto</p>}
                </div>
              : wsProcessesPublished.map(p => <ProcessCard key={p.id} proc={p} users={users} workspaces={workspaces} onOpen={onOpenProcess} t={t}/>)
            }
          </>
        )}

        {/* ACTIVIDADES TAB */}
        {activeTab === 'actividades' && (
          <>
            {isManager && (
              <button onClick={() => setShowCreateActivity(true)} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'12px', border:`1.5px dashed ${ws.color}`, borderRadius:14, background:ws.color+'15', color:ws.color, fontWeight:700, cursor:'pointer', fontSize:14, marginBottom:16 }}>
                <Plus size={16}/> Asignar proceso como actividad
              </button>
            )}
            {wsActivities.length === 0
              ? <div className="empty-state">
                  <div className="empty-icon"><ClipboardList size={28} color={t.primary}/></div>
                  <p style={{ fontWeight:700, color:t.text }}>Sin actividades aún</p>
                  {isManager && <p style={{ fontSize:13 }}>Crea actividades de Repasar o Realizar para tu equipo</p>}
                </div>
              : wsActivities.map(a => (
                  <ActivityCard key={a.id} activity={a} processes={processes} users={users} user={user}
                    isManager={isManager} onOpen={onOpenActivity} onDelete={onDeleteActivity} t={t}/>
                ))
            }
          </>
        )}

        {/* MIEMBROS TAB */}
        {activeTab === 'miembros' && (
          <div className="card" style={{ padding:16 }}>
            {/* Manager */}
            <div className="member-row">
              <Avatar name={manager.name||'?'} size={40}/>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:t.text, fontSize:15 }}>{manager.name}</div>
                <div style={{ fontSize:12, color:t.textMuted }}>{manager.position} · {manager.area}</div>
              </div>
              <span className="chip" style={{ background:t.accentLight, color:t.accent }}><Crown size={11}/>Encargado</span>
            </div>
            {/* Members */}
            {members.length === 0 && !isManager && <p style={{ color:t.textMuted, fontSize:13, padding:'12px 0', textAlign:'center' }}>Solo está el encargado por ahora</p>}
            {members.map(m => (
              <div key={m.id} className="member-row">
                <Avatar name={m.name||'?'} size={40}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:t.text, fontSize:15 }}>{m.name}</div>
                  <div style={{ fontSize:12, color:t.textMuted }}>{m.position} · {m.area}</div>
                </div>
                {isManager
                  ? <button onClick={() => removeMember(m.id)} style={{ background:t.dangerLight, color:t.danger, border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:12, fontWeight:700 }}>Quitar</button>
                  : m.id === user.id && <span style={{ fontSize:12, color:t.textMuted }}>Tú</span>
                }
              </div>
            ))}
            {/* Leave button for non-managers */}
            {!isManager && (
              <button onClick={leaveWorkspace} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', justifyContent:'center', marginTop:12, padding:'12px', borderRadius:12, background:t.dangerLight, color:t.danger, border:'none', fontWeight:700, cursor:'pointer' }}>
                <LogOut size={16}/> Salir del proyecto
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Activity Modal */}
      {showCreateActivity && isManager && (
        <CreateActivityModal ws={ws} processes={processes} users={users} user={user} onSave={onCreateActivity} onClose={() => setShowCreateActivity(false)} t={t}/>
      )}

      {/* Delete confirm */}
      {showDelConfirm && (
        <div className="modal-backdrop" onClick={() => setShowDelConfirm(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"/>
            <h3 style={{ fontSize:18, fontWeight:800, marginBottom:8, color:t.text }}>¿Eliminar proyecto?</h3>
            <p style={{ fontSize:14, color:t.textSub, marginBottom:24 }}>Se eliminará el proyecto y todos los procesos asociados. Esta acción no se puede deshacer.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button style={{ flex:1, padding:'12px', borderRadius:12, background:t.cardAlt, color:t.textSub, border:`1px solid ${t.border}`, fontWeight:700, cursor:'pointer' }} onClick={() => setShowDelConfirm(false)}>Cancelar</button>
              <button style={{ flex:1, padding:'12px', borderRadius:12, background:t.dangerLight, color:t.danger, border:'none', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }} onClick={onDelete}><Trash2 size={16}/> Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// JOIN WORKSPACE MODAL
// ════════════════════════════════════════════════════════════
function JoinWorkspaceModal({ ws, user, onJoin, onCancel, t }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle"/>
        <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:20 }}>
          <div style={{ width:52, height:52, borderRadius:16, background:ws.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Briefcase size={24} color="#fff"/>
          </div>
          <div>
            <h3 style={{ fontSize:18, fontWeight:800, color:t.text }}>{ws.name}</h3>
            {ws.description && <p style={{ fontSize:13, color:t.textSub }}>{ws.description}</p>}
          </div>
        </div>
        <div style={{ background:t.cardAlt, borderRadius:12, padding:'12px 16px', marginBottom:20 }}>
          <p style={{ fontSize:13, color:t.textMuted }}>Al unirte podrás ver y consultar todos los procesos de este proyecto.</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button style={{ flex:1, padding:'12px', borderRadius:12, background:t.cardAlt, color:t.textSub, border:`1px solid ${t.border}`, fontWeight:700, cursor:'pointer' }} onClick={onCancel}>Cancelar</button>
          <button style={{ flex:2, padding:'12px', borderRadius:12, background:ws.color, color:'#fff', border:'none', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }} onClick={onJoin}>
            <UserPlus size={16}/> Unirme al proyecto
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CREATE / EDIT PROCESS
// ════════════════════════════════════════════════════════════
function CreateScreen({ user, processes, workspaces, onSave, onCancel, editProc, defaultWsId, t }) {
  const ex = editProc;
  const [title, setTitle] = useState(ex?.title || '');
  const [desc, setDesc] = useState(ex?.description || '');
  const [area, setArea] = useState(ex?.area || user.area || '');
  const [cat, setCat] = useState(ex?.category || '');
  const [steps, setSteps] = useState(ex?.steps?.length ? ex.steps : [{ id: uid(), text:'' }]);
  const [notes, setNotes] = useState(ex?.notes || '');
  const [tagsInput, setTagsInput] = useState(ex?.tags?.join(', ') || '');
  const [wsId, setWsId] = useState(ex?.workspaceId ?? defaultWsId ?? '');
  const [error, setError] = useState('');
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendWsId, setSendWsId] = useState('');

  const pub = processes.filter(p => p.status === 'published');
  const existingAreas = [...new Set(pub.map(p => p.area).filter(Boolean))].sort();
  const existingCats  = [...new Set(pub.map(p => p.category).filter(Boolean))].sort();
  const myWs = workspaces.filter(w => w.managerId === user.id);
  const memberWs = workspaces.filter(w => w.memberIds?.includes(user.id) && w.managerId !== user.id);
  const isManagerRole = ['admin','supervisor','manager'].includes(user.role) && myWs.length > 0;

  const addStep = () => setSteps(s => [...s, { id: uid(), text:'' }]);
  const removeStep = idx => setSteps(s => s.filter((_,i) => i !== idx));
  const updateStep = (idx, val) => setSteps(s => s.map((st,i) => i===idx ? {...st, text:val} : st));

  const onDragStart = (e,i) => { setDragIdx(i); e.dataTransfer.effectAllowed='move'; };
  const onDragOver  = (e,i) => { e.preventDefault(); setDragOver(i); };
  const onDrop      = (i)   => {
    if (dragIdx===null||dragIdx===i) return;
    const ns=[...steps]; const [mv]=ns.splice(dragIdx,1); ns.splice(i,0,mv);
    setSteps(ns); setDragIdx(null); setDragOver(null);
  };

  const save = (status, overrideWsId) => {
    setError('');
    if (!title.trim()) { setError('El título es obligatorio'); return; }
    if (!steps.some(s => s.text.trim())) { setError('Agrega al menos un paso'); return; }
    const finalWsId = overrideWsId !== undefined ? overrideWsId : (wsId || null);
    // Visibilidad automática: si tiene proyecto → privado, si no → general
    const visibility = finalWsId ? 'private' : 'general';
    const proc = {
      id: ex?.id || uid(),
      title: title.trim(), description: desc.trim(), area: area.trim(), category: cat.trim(),
      steps: steps.filter(s => s.text.trim()),
      notes: notes.trim(),
      tags: tagsInput.split(',').map(tg => tg.trim()).filter(Boolean),
      status, visibility, workspaceId: finalWsId,
      authorId: user.id,
      createdAt: ex?.createdAt || now(), updatedAt: now(),
      likes: ex?.likes||[], ratings: ex?.ratings||[], comments: ex?.comments||[], views: ex?.views||0,
    };
    onSave(proc);
  };

  const Label = ({ children }) => <label style={{ fontSize:13, fontWeight:700, color:t.textSub, display:'block', marginBottom:6 }}>{children}</label>;

  return (
    <div className="scroll" style={{ height:'100%', paddingBottom:100 }}>
      <div style={{ padding:'56px 16px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <button onClick={onCancel} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:12, padding:8, cursor:'pointer', display:'flex' }}><ArrowLeft size={20} color={t.text}/></button>
          <h2 style={{ fontSize:20, fontWeight:800, color:t.text }}>{ex ? 'Editar proceso' : 'Nuevo proceso'}</h2>
        </div>

        {error && <div style={{ background:t.dangerLight, color:t.danger, borderRadius:12, padding:'12px 16px', fontSize:14, marginBottom:16, display:'flex', gap:8 }}><AlertCircle size={16}/>{error}</div>}

        {/* Workspace selector — solo para encargados */}
        {isManagerRole && (
          <div style={{ marginBottom:16 }}>
            <Label>Publicar en</Label>
            <select value={wsId} onChange={e => setWsId(e.target.value)}
              style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center', paddingRight:36 }}>
              <option value="">🌐 General — visible para todos</option>
              {myWs.map(w => <option key={w.id} value={w.id}>🔒 {w.name} — solo el equipo</option>)}
            </select>
            <p style={{ fontSize:12, color: wsId ? t.secondary : t.textMuted, marginTop:6, display:'flex', alignItems:'center', gap:4 }}>
              {wsId ? <><Lock size={11}/> Solo los miembros de este proyecto lo verán</> : <><Globe size={11}/> Todos los usuarios podrán verlo</>}
            </p>
          </div>
        )}

        <div style={{ marginBottom:16 }}><Label>Título del proceso *</Label><input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Cómo realizar un cierre de caja"/></div>
        <div style={{ marginBottom:16 }}><Label>¿Para qué sirve?</Label><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe el objetivo del proceso…" rows={3}/></div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
          <div>
            <Label>Área</Label>
            <input type="text" value={area} onChange={e => setArea(e.target.value)} placeholder="Ej: Ventas" list="areas-list"/>
            <datalist id="areas-list">{existingAreas.map(a => <option key={a} value={a}/>)}</datalist>
          </div>
          <div>
            <Label>Categoría</Label>
            <input type="text" value={cat} onChange={e => setCat(e.target.value)} placeholder="Ej: Operaciones" list="cats-list"/>
            <datalist id="cats-list">{existingCats.map(c => <option key={c} value={c}/>)}</datalist>
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <Label>Pasos del proceso *</Label>
          {steps.map((step,i) => (
            <div key={step.id} draggable onDragStart={e => onDragStart(e,i)} onDragOver={e => onDragOver(e,i)} onDrop={() => onDrop(i)} onDragEnd={() => { setDragIdx(null); setDragOver(null); }}
              style={{ display:'flex', gap:10, padding:'10px 12px', borderRadius:12, border:`1.5px solid ${dragOver===i?t.primary:t.border}`, background:dragOver===i?t.primaryLight:t.card, marginBottom:8, alignItems:'flex-start' }}>
              <GripVertical size={16} style={{ color:t.textMuted, marginTop:4, flexShrink:0, cursor:'grab' }}/>
              <div className="step-num" style={{ marginTop:2 }}>{i+1}</div>
              <input type="text" value={step.text} onChange={e => updateStep(i,e.target.value)} placeholder={`Instrucción del paso ${i+1}…`}
                style={{ flex:1, background:'transparent', border:'none', boxShadow:'none', padding:'2px 0', borderRadius:0 }}/>
              {steps.length>1 && <button style={{ background:'transparent', border:'none', color:t.textMuted, cursor:'pointer', padding:2 }} onClick={() => removeStep(i)}><X size={15}/></button>}
            </div>
          ))}
          <button onClick={addStep} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'10px', border:`1.5px dashed ${t.primary}`, borderRadius:12, background:t.primaryLight, color:t.primary, fontWeight:700, cursor:'pointer', fontSize:14 }}>
            <Plus size={16}/> Agregar paso
          </button>
        </div>

        <div style={{ marginBottom:16 }}><Label>Notas o tips</Label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Consejos o advertencias…" rows={2}/></div>
        <div style={{ marginBottom:28 }}><Label>Etiquetas (separadas por coma)</Label><input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="Ej: caja, cierre, diario"/></div>

        {isManagerRole ? (
          /* ENCARGADO: Borrador | Publicar (visibilidad auto según proyecto) */
          <div style={{ display:'flex', gap:10, paddingBottom:16 }}>
            <button style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'13px', borderRadius:12, fontWeight:700, border:`1px solid ${t.border}`, background:t.cardAlt, color:t.textSub, cursor:'pointer' }} onClick={() => save('draft')}>
              <Save size={16}/> Borrador
            </button>
            <button style={{ flex:2, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'13px', borderRadius:12, fontWeight:700, border:'none', background:t.primary, color:'#fff', cursor:'pointer' }} onClick={() => save('published')}>
              {wsId ? <><Lock size={16}/> Publicar en proyecto</> : <><Globe size={16}/> Publicar general</>}
            </button>
          </div>
        ) : (
          /* EMPLEADO: Borrador | Enviar al encargado */
          <div style={{ display:'flex', gap:10, paddingBottom:16 }}>
            <button style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'13px', borderRadius:12, fontWeight:700, border:`1px solid ${t.border}`, background:t.cardAlt, color:t.textSub, cursor:'pointer' }} onClick={() => save('draft')}>
              <Save size={16}/> Borrador
            </button>
            {memberWs.length > 0 && (
              <button style={{ flex:2, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'13px', borderRadius:12, fontWeight:700, border:'none', background:t.secondary, color:'#fff', cursor:'pointer' }}
                onClick={() => { setSendWsId(memberWs[0]?.id || ''); setShowSendModal(true); }}>
                <Send size={16}/> Enviar al encargado
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal enviar al encargado (empleado) */}
      {showSendModal && (
        <div className="modal-backdrop" onClick={() => setShowSendModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"/>
            <h3 style={{ fontSize:17, fontWeight:800, color:t.text, marginBottom:6 }}>Enviar al encargado</h3>
            <p style={{ fontSize:13, color:t.textSub, marginBottom:16 }}>El encargado revisará tu guía y decidirá si la publica para el equipo.</p>
            <label style={{ fontSize:13, fontWeight:700, color:t.textSub, display:'block', marginBottom:6 }}>Selecciona el proyecto</label>
            <select value={sendWsId} onChange={e => setSendWsId(e.target.value)} style={{ marginBottom:20 }}>
              {memberWs.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <div style={{ display:'flex', gap:10 }}>
              <button style={{ flex:1, padding:'12px', borderRadius:12, background:t.cardAlt, color:t.textSub, border:`1px solid ${t.border}`, fontWeight:700, cursor:'pointer' }} onClick={() => setShowSendModal(false)}>Cancelar</button>
              <button style={{ flex:2, padding:'12px', borderRadius:12, background:t.secondary, color:'#fff', border:'none', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                onClick={() => { save('pending',sendWsId); setShowSendModal(false); }}>
                <Send size={16}/> Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PROCESS VIEW
// ════════════════════════════════════════════════════════════
function ProcessView({ proc, user, users, workspaces, onBack, onEdit, onDelete, onUpdate, t }) {
  const [done, setDone] = useState({});
  const [myRating, setMyRating] = useState(() => proc.ratings?.find(r => r.uid===user.id)?.val||0);
  const [liked, setLiked] = useState(() => !!(proc.likes?.includes(user.id)));
  const [commentText, setCommentText] = useState('');
  const [showDel, setShowDel] = useState(false);
  const didView = useRef(false);

  const author = users.find(u => u.id===proc.authorId)||{};
  const ws = workspaces.find(w => w.id===proc.workspaceId);
  const isOwner = proc.authorId===user.id;
  const isManager = ws?.managerId===user.id;
  const canEdit = isOwner || isManager;
  const total = proc.steps?.length||0;
  const doneCount = Object.values(done).filter(Boolean).length;
  const ratingVal = proc.ratings?.length ? avg(proc.ratings.map(r => r.val)) : 0;

  useEffect(() => {
    if (!didView.current) { didView.current=true; onUpdate({...proc, views:(proc.views||0)+1}); }
  }, []);

  const toggleLike = () => {
    const newLikes = liked ? (proc.likes||[]).filter(id=>id!==user.id) : [...(proc.likes||[]),user.id];
    onUpdate({...proc, likes:newLikes}); setLiked(!liked);
  };
  const rateProc = val => {
    setMyRating(val);
    onUpdate({...proc, ratings:[...(proc.ratings||[]).filter(r=>r.uid!==user.id),{uid:user.id,val}]});
  };
  const addComment = () => {
    if (!commentText.trim()) return;
    onUpdate({...proc, comments:[...(proc.comments||[]),{id:uid(),uid:user.id,text:commentText.trim(),createdAt:now()}]});
    setCommentText('');
  };

  return (
    <div className="scroll" style={{ height:'100%', paddingBottom:80 }}>
      <div style={{ padding:'56px 16px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <button onClick={onBack} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:12, padding:8, cursor:'pointer', display:'flex' }}><ArrowLeft size={20} color={t.text}/></button>
          {canEdit && <div style={{ display:'flex', gap:8 }}>
            <button onClick={onEdit} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:12, background:t.primaryLight, color:t.primary, border:'none', fontWeight:700, fontSize:13, cursor:'pointer' }}><Edit3 size={15}/> Editar</button>
            <button onClick={() => setShowDel(true)} style={{ display:'flex', alignItems:'center', padding:'8px', borderRadius:12, background:t.dangerLight, color:t.danger, border:'none', cursor:'pointer' }}><Trash2 size={15}/></button>
          </div>}
        </div>

        <div className="card" style={{ padding:20, marginBottom:16 }}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
            {ws && <span className="chip" style={{ background:ws.color+'22', color:ws.color }}><Briefcase size={10}/> {ws.name}</span>}
            {proc.area && <span className="chip" style={{ background:t.primaryLight, color:t.primary }}>{proc.area}</span>}
            {proc.category && <span className="chip" style={{ background:t.secondaryLight, color:t.secondary }}>{proc.category}</span>}
            {proc.status==='draft' && <span className="chip" style={{ background:t.dangerLight, color:t.danger }}>Borrador</span>}
          </div>
          <h1 style={{ fontSize:20, fontWeight:800, color:t.text, marginBottom:8, lineHeight:1.35 }}>{proc.title}</h1>
          {proc.description && <p style={{ fontSize:14, color:t.textSub, lineHeight:1.6, marginBottom:12 }}>{proc.description}</p>}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Avatar name={author.name||'?'} size={30}/>
              <div><div style={{ fontSize:13, fontWeight:700, color:t.text }}>{author.name||'Anónimo'}</div><div style={{ fontSize:11, color:t.textMuted }}>{fmt(proc.createdAt)}</div></div>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <span style={{ fontSize:12, color:t.textMuted, display:'flex', alignItems:'center', gap:3 }}><Eye size={13}/>{proc.views||0}</span>
              {ratingVal>0 && <span style={{ fontSize:12, color:t.textSub, display:'flex', alignItems:'center', gap:3 }}><Stars rating={ratingVal} size={13}/>{ratingVal}</span>}
            </div>
          </div>
        </div>

        {total>0 && <div className="card" style={{ padding:'14px 20px', marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:700, color:t.text }}>Progreso</span>
            <span style={{ fontSize:13, fontWeight:700, color:t.primary }}>{doneCount}/{total}</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width:`${total>0?(doneCount/total)*100:0}%`}}/></div>
          {doneCount===total && <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8, color:t.success, fontSize:13, fontWeight:700 }}><CheckCircle2 size={16}/>¡Proceso completado!</div>}
        </div>}

        {proc.steps?.length>0 && <div style={{ marginBottom:16 }}>
          <div className="section-title">Pasos</div>
          {proc.steps.map((step,i) => {
            const isDone=!!done[i], isNext=!isDone&&doneCount===i;
            return (
              <div key={step.id||i} className="step-item" onClick={() => setDone(d => ({...d,[i]:!d[i]}))}
                style={{ border:`1.5px solid ${isDone?t.success:isNext?t.primary:t.border}`, background:isDone?t.successLight:t.card, boxShadow:isNext?`0 0 0 3px ${t.primaryLight}`:'none' }}>
                <div className="step-num" style={{ background:isDone?t.success:isNext?t.primary:t.primaryLight, color:isDone||isNext?'#fff':t.primary }}>{isDone?<Check size={13}/>:i+1}</div>
                <p style={{ flex:1, fontSize:15, color:isDone?t.textMuted:t.text, textDecoration:isDone?'line-through':'none', lineHeight:1.5 }}>{step.text}</p>
                <div style={{ width:22, height:22, borderRadius:7, border:`2px solid ${isDone?t.success:isNext?t.primary:t.border}`, background:isDone?t.success:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                  {isDone && <Check size={13} color="#fff"/>}
                </div>
              </div>
            );
          })}
        </div>}

        {proc.notes && <div className="card" style={{ padding:16, marginBottom:16, border:`1.5px solid ${t.accent}30`, background:`${t.accent}10` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, color:t.accent, fontWeight:700, fontSize:14 }}><AlertCircle size={16}/> Notas y tips</div>
          <p style={{ fontSize:14, color:t.text, lineHeight:1.6 }}>{proc.notes}</p>
        </div>}

        {proc.tags?.length>0 && <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
          {proc.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
        </div>}

        <div className="card" style={{ padding:16, marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <button onClick={toggleLike} style={{ display:'flex', alignItems:'center', gap:8, background:liked?t.dangerLight:t.cardAlt, color:liked?t.danger:t.textSub, border:`1.5px solid ${liked?t.danger:t.border}`, borderRadius:12, padding:'8px 16px', fontWeight:700, fontSize:14, cursor:'pointer', transition:'all .18s' }}>
              <Heart size={18} style={{ fill:liked?t.danger:'none', color:liked?t.danger:t.textSub }}/>
              {liked?'¡Útil!':'Me sirvió'} · {proc.likes?.length||0}
            </button>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:12, color:t.textMuted, marginBottom:4 }}>Tu calificación</div>
              <Stars rating={myRating} size={28} interactive onChange={rateProc}/>
            </div>
          </div>
        </div>

        <div style={{ marginBottom:20 }}>
          <div className="section-title"><MessageSquare size={16}/> Comentarios ({proc.comments?.length||0})</div>
          {(proc.comments||[]).map(c => {
            const cu=users.find(u=>u.id===c.uid)||{};
            return <div key={c.id} className="comment-box">
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Avatar name={cu.name||'?'} size={26}/>
                  <div><div style={{ fontSize:13, fontWeight:700, color:t.text }}>{cu.name||'Anónimo'}</div><div style={{ fontSize:11, color:t.textMuted }}>{fmt(c.createdAt)}</div></div>
                </div>
                {c.uid===user.id && <button style={{ background:'transparent', border:'none', color:t.textMuted, cursor:'pointer' }} onClick={() => onUpdate({...proc, comments:(proc.comments||[]).filter(cm=>cm.id!==c.id)})}><Trash2 size={14}/></button>}
              </div>
              <p style={{ fontSize:14, color:t.text, lineHeight:1.5 }}>{c.text}</p>
            </div>;
          })}
          <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Agrega un comentario…" rows={2} style={{ flex:1, minHeight:70 }}/>
            <button onClick={addComment} style={{ padding:'10px 14px', borderRadius:12, background:t.primary, color:'#fff', border:'none', cursor:'pointer', alignSelf:'flex-end', display:'flex' }}><Send size={16}/></button>
          </div>
        </div>
      </div>

      {showDel && <div className="modal-backdrop" onClick={() => setShowDel(false)}>
        <div className="modal-sheet" onClick={e => e.stopPropagation()}>
          <div className="modal-handle"/>
          <h3 style={{ fontSize:18, fontWeight:800, marginBottom:8, color:t.text }}>¿Eliminar proceso?</h3>
          <p style={{ fontSize:14, color:t.textSub, marginBottom:24 }}>Esta acción no se puede deshacer.</p>
          <div style={{ display:'flex', gap:10 }}>
            <button style={{ flex:1, padding:'12px', borderRadius:12, background:t.cardAlt, color:t.textSub, border:`1px solid ${t.border}`, fontWeight:700, cursor:'pointer' }} onClick={() => setShowDel(false)}>Cancelar</button>
            <button style={{ flex:1, padding:'12px', borderRadius:12, background:t.dangerLight, color:t.danger, border:'none', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }} onClick={onDelete}><Trash2 size={16}/> Eliminar</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MY PROCESSES
// ════════════════════════════════════════════════════════════
function MyProcessesScreen({ user, processes, users, workspaces, onOpen, onEdit, onSubmit, t }) {
  const [sendingProc, setSendingProc] = useState(null); // proc being sent
  const [selectedWs, setSelectedWs] = useState('');

  const mine = processes.filter(p => p.authorId === user.id);
  const pub = mine.filter(p => p.status === 'published');
  const pending = mine.filter(p => p.status === 'pending'); // enviados al encargado
  const personal = mine.filter(p => p.status === 'draft');  // personales (solo yo los veo)

  // Proyectos donde soy miembro (no encargado) → para enviar al encargado
  const memberWs = workspaces.filter(w => w.memberIds?.includes(user.id) && w.managerId !== user.id);

  const openSend = (p) => { setSendingProc(p); setSelectedWs(memberWs[0]?.id || ''); };
  const confirmSend = () => { if (selectedWs && sendingProc) { onSubmit(sendingProc.id, selectedWs); setSendingProc(null); } };

  const ProcRow = ({ p, badge, badgeStyle, actions }) => {
    const ws = workspaces.find(w => w.id === p.workspaceId);
    return (
      <div className="process-card" style={{ position:'relative' }}>
        <div onClick={() => onOpen(p.id)}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
            {badge && <span className="chip" style={badgeStyle}>{badge}</span>}
            {ws && <span className="chip" style={{ background:ws.color+'22', color:ws.color, display:'inline-flex', gap:4 }}><Briefcase size={10}/>{ws.name}</span>}
          </div>
          <div style={{ fontWeight:700, fontSize:15, color:t.text, paddingRight: actions ? 80 : 0 }}>{p.title}</div>
          {p.status === 'published' && (
            <div style={{ display:'flex', gap:12, fontSize:12, color:t.textMuted, marginTop:4 }}>
              <span><Eye size={11} style={{ verticalAlign:'middle' }}/> {p.views||0}</span>
              <span><Heart size={11} style={{ verticalAlign:'middle' }}/> {p.likes?.length||0}</span>
            </div>
          )}
          {p.status === 'pending' && ws && <div style={{ fontSize:12, color:t.textMuted, marginTop:2 }}>Enviado a encargado de <b>{ws.name}</b></div>}
        </div>
        {actions && <div style={{ position:'absolute', top:14, right:14, display:'flex', gap:6 }}>{actions}</div>}
      </div>
    );
  };

  return (
    <div className="scroll" style={{ height:'100%', paddingBottom:80 }}>
      <div style={{ padding:'56px 16px 0' }}>
        <h2 style={{ fontSize:22, fontWeight:800, marginBottom:20, color:t.text }}>Mis guías</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:24 }}>
          {[['📄',pub.length,'Publicados'],['🕐',pending.length,'Enviados'],['📝',personal.length,'Personales']].map(([icon,val,label]) => (
            <div key={label} className="card" style={{ padding:'14px 10px', textAlign:'center' }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
              <div style={{ fontSize:20, fontWeight:800, color:t.text }}>{val}</div>
              <div style={{ fontSize:11, color:t.textMuted }}>{label}</div>
            </div>
          ))}
        </div>

        {mine.length === 0
          ? <div className="empty-state"><div className="empty-icon"><FileText size={28} color={t.primary}/></div><p style={{ fontWeight:700, color:t.text }}>Aún no has creado guías</p></div>
          : <>
            {pub.length > 0 && <>
              <div className="section-title">Publicados en proyectos ({pub.length})</div>
              {pub.map(p => <ProcRow key={p.id} p={p} actions={
                <button onClick={e => { e.stopPropagation(); onEdit(p.id); }} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:10, background:t.primaryLight, color:t.primary, border:'none', fontWeight:700, fontSize:12, cursor:'pointer' }}><Edit3 size={13}/> Editar</button>
              }/>)}
            </>}

            {pending.length > 0 && <>
              <div className="section-title" style={{ marginTop:8 }}>Enviados al encargado ({pending.length})</div>
              {pending.map(p => <ProcRow key={p.id} p={p} badge="⏳ En revisión" badgeStyle={{ background:t.accentLight, color:t.accent }}/>)}
            </>}

            {personal.length > 0 && <>
              <div className="section-title" style={{ marginTop:8 }}>Personales ({personal.length})</div>
              <p style={{ fontSize:12, color:t.textMuted, marginBottom:10 }}>Solo tú puedes verlos. Puedes enviarlos al encargado para que los publique a tu equipo.</p>
              {personal.map(p => <ProcRow key={p.id} p={p} badge="🔒 Personal" badgeStyle={{ background:t.cardAlt, color:t.textSub, border:`1px solid ${t.border}` }} actions={<>
                {memberWs.length > 0 && <button onClick={e => { e.stopPropagation(); openSend(p); }} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:10, background:t.secondaryLight, color:t.secondary, border:'none', fontWeight:700, fontSize:12, cursor:'pointer' }}><Send size={13}/> Enviar</button>}
                <button onClick={e => { e.stopPropagation(); onEdit(p.id); }} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:10, background:t.primaryLight, color:t.primary, border:'none', fontWeight:700, fontSize:12, cursor:'pointer' }}><Edit3 size={13}/> Editar</button>
              </>}/>)}
            </>}
          </>
        }
      </div>

      {/* Modal enviar al encargado */}
      {sendingProc && (
        <div className="modal-backdrop" onClick={() => setSendingProc(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"/>
            <h3 style={{ fontSize:17, fontWeight:800, color:t.text, marginBottom:6 }}>Enviar al encargado</h3>
            <p style={{ fontSize:13, color:t.textSub, marginBottom:16 }}>El encargado revisará <b>"{sendingProc.title}"</b> y decidirá si lo publica para el equipo.</p>
            <label style={{ fontSize:13, fontWeight:700, color:t.textSub, display:'block', marginBottom:6 }}>Selecciona el proyecto</label>
            <select value={selectedWs} onChange={e => setSelectedWs(e.target.value)} style={{ marginBottom:20 }}>
              {memberWs.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <div style={{ display:'flex', gap:10 }}>
              <button style={{ flex:1, padding:'12px', borderRadius:12, background:t.cardAlt, color:t.textSub, border:`1px solid ${t.border}`, fontWeight:700, cursor:'pointer' }} onClick={() => setSendingProc(null)}>Cancelar</button>
              <button style={{ flex:2, padding:'12px', borderRadius:12, background:t.secondary, color:'#fff', border:'none', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={confirmSend}><Send size={16}/> Enviar al encargado</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ROLES CONFIG
// ════════════════════════════════════════════════════════════
const ROLES = {
  admin:      { label: 'Administrador',       emoji: '👑', color: '#8b5cf6' },
  supervisor: { label: 'Sup. de Encargados',  emoji: '⭐', color: '#3b6ef6' },
  manager:    { label: 'Encargado',           emoji: '👔', color: '#10b981' },
  employee:   { label: 'Empleado',            emoji: '👤', color: '#64748b' },
};
function RoleBadge({ role, t }) {
  const r = ROLES[role] || ROLES.employee;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background: r.color+'18', color: r.color, borderRadius:999, padding:'3px 10px', fontSize:12, fontWeight:700 }}>
      {r.emoji} {r.label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════
// ADMIN PANEL
// ════════════════════════════════════════════════════════════
function AdminScreen({ currentUser, users, areas, onBack, onSaveUser, onDeleteUser, onSaveArea, onDeleteArea, t }) {
  const [adminTab, setAdminTab] = useState('users'); // 'users' | 'areas'
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', password:'', position:'', area:'', role:'employee' });
  const [error, setError] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const openCreate = () => { setForm({ name:'', email:'', password:'', position:'', area: areas[0]||'', role:'employee' }); setEditingUser(null); setError(''); setShowCreate(true); };
  const openEdit = (u) => { setForm({ name:u.name, email:u.email, password:u.password, position:u.position||'', area:u.area||'', role:u.role||'employee' }); setEditingUser(u); setError(''); setShowCreate(true); };

  const save = () => {
    setError('');
    if (!form.name.trim()||!form.email.trim()||!form.position.trim()||!form.area.trim()) { setError('Completa todos los campos'); return; }
    if (!editingUser && form.password.length < 6) { setError('Contraseña mínimo 6 caracteres'); return; }
    if (!editingUser && users.find(u => u.email.toLowerCase()===form.email.toLowerCase())) { setError('Correo ya registrado'); return; }
    const saved = {
      id: editingUser?.id || uid(),
      name: form.name.trim(), email: form.email.toLowerCase().trim(),
      password: form.password || editingUser?.password,
      position: form.position.trim(), area: form.area.trim(),
      role: form.role, createdAt: editingUser?.createdAt || now(),
    };
    onSaveUser(saved);
    setShowCreate(false);
  };

  const addArea = () => { if(newAreaName.trim()) { onSaveArea(newAreaName); setNewAreaName(''); } };

  const grouped = Object.keys(ROLES).map(role => ({ role, members: users.filter(u => (u.role||'employee') === role) })).filter(g => g.members.length > 0);

  const Lbl = ({ children }) => <label style={{ fontSize:13, fontWeight:700, color:t.textSub, display:'block', marginBottom:6 }}>{children}</label>;

  return (
    <div className="scroll" style={{ height:'100%', paddingBottom:80 }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${t.purple} 0%,#6d28d9 100%)`, padding:'52px 20px 20px', borderRadius:'0 0 28px 28px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,.2)', border:'none', borderRadius:12, padding:8, cursor:'pointer', display:'flex' }}>
            <ArrowLeft size={20} color="#fff"/>
          </button>
          {adminTab==='users' && (
            <button onClick={openCreate} style={{ background:'rgba(255,255,255,.2)', border:'none', borderRadius:12, padding:'8px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:'#fff', fontWeight:700, fontSize:13 }}>
              <Plus size={16}/> Nuevo usuario
            </button>
          )}
        </div>
        <h2 style={{ color:'#fff', fontSize:22, fontWeight:800, marginBottom:4 }}>Panel de administración</h2>
        <p style={{ color:'rgba(255,255,255,.75)', fontSize:13 }}>{users.length} usuario{users.length!==1?'s':''} · {areas.length} área{areas.length!==1?'s':''}</p>
        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          {[['users','👥 Usuarios'],['areas','🏢 Áreas']].map(([k,label]) => (
            <button key={k} onClick={() => setAdminTab(k)}
              style={{ padding:'8px 18px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:13,
                background: adminTab===k ? '#fff' : 'rgba(255,255,255,.2)',
                color: adminTab===k ? t.purple : '#fff' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Usuarios tab */}
      {adminTab==='users' && (
        <div style={{ padding:'0 16px' }}>
          {grouped.map(({ role, members }) => (
            <div key={role} style={{ marginBottom:24 }}>
              <div className="section-title"><RoleBadge role={role} t={t}/></div>
              <div className="card" style={{ padding:'0 16px' }}>
                {members.map((u, i) => (
                  <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom: i<members.length-1?`1px solid ${t.border}`:'none' }}>
                    <Avatar name={u.name} size={40}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:t.text }}>{u.name} {u.id===currentUser.id&&<span style={{ fontSize:11, color:t.textMuted }}>(tú)</span>}</div>
                      <div style={{ fontSize:12, color:t.textMuted }}>{u.email}</div>
                      <div style={{ fontSize:11, color:t.textMuted }}>{u.position}{u.area ? ` · ${u.area}` : ''}</div>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => openEdit(u)} style={{ background:t.primaryLight, color:t.primary, border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:12, fontWeight:700 }}><Edit3 size={13}/></button>
                      {u.id !== currentUser.id && <button onClick={() => onDeleteUser(u.id)} style={{ background:t.dangerLight, color:t.danger, border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:12, fontWeight:700 }}><Trash2 size={13}/></button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {grouped.length === 0 && <div style={{ textAlign:'center', color:t.textMuted, padding:40 }}>No hay usuarios aún</div>}
        </div>
      )}

      {/* Áreas tab */}
      {adminTab==='areas' && (
        <div style={{ padding:'0 16px' }}>
          <div className="section-title">Áreas registradas</div>
          {/* Agregar nueva área */}
          <div className="card" style={{ padding:16, marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:t.textSub, marginBottom:10 }}>Nueva área</div>
            <div style={{ display:'flex', gap:10 }}>
              <input type="text" value={newAreaName} onChange={e => setNewAreaName(e.target.value)}
                onKeyDown={e => e.key==='Enter' && addArea()}
                placeholder="Ej: Logística, Soporte..."
                style={{ flex:1 }}/>
              <button onClick={addArea}
                style={{ padding:'10px 16px', borderRadius:12, background:t.purple, color:'#fff', border:'none', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                <Plus size={16}/>
              </button>
            </div>
          </div>
          {/* Lista de áreas */}
          <div className="card" style={{ padding:'0 16px' }}>
            {areas.length === 0 && <div style={{ padding:20, color:t.textMuted, textAlign:'center', fontSize:13 }}>Sin áreas registradas</div>}
            {areas.map((area, i) => {
              const count = users.filter(u => u.area === area).length;
              return (
                <div key={area} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 0', borderBottom: i<areas.length-1?`1px solid ${t.border}`:'none' }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:t.primaryLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🏢</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:t.text }}>{area}</div>
                    <div style={{ fontSize:12, color:t.textMuted }}>{count} usuario{count!==1?'s':''}</div>
                  </div>
                  <button onClick={() => onDeleteArea(area)}
                    style={{ background:t.dangerLight, color:t.danger, border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer' }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal crear/editar usuario */}
      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"/>
            <h3 style={{ fontSize:17, fontWeight:800, color:t.text, marginBottom:16 }}>{editingUser ? 'Editar usuario' : 'Crear usuario'}</h3>
            <div style={{ marginBottom:12 }}><Lbl>Nombre completo *</Lbl><input type="text" value={form.name} onChange={set('name')} placeholder="Nombre"/></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <div><Lbl>Puesto *</Lbl><input type="text" value={form.position} onChange={set('position')} placeholder="Puesto"/></div>
              <div>
                <Lbl>Área *</Lbl>
                <select value={form.area} onChange={set('area')}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${t.border}`, background:t.card, color:t.text, fontSize:14, cursor:'pointer' }}>
                  <option value="">— Selecciona —</option>
                  {areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:12 }}><Lbl>Correo *</Lbl><input type="email" value={form.email} onChange={set('email')} placeholder="correo@empresa.com" disabled={!!editingUser} style={{ opacity: editingUser?0.6:1 }}/></div>
            <div style={{ marginBottom:12 }}><Lbl>{editingUser ? 'Nueva contraseña (dejar en blanco para no cambiar)' : 'Contraseña *'}</Lbl><input type="password" value={form.password} onChange={set('password')} placeholder={editingUser ? 'Sin cambios' : '••••••••'}/></div>
            <div style={{ marginBottom:16 }}>
              <Lbl>Rol *</Lbl>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {Object.entries(ROLES).map(([key, r]) => (
                  <button key={key} onClick={() => setForm(f => ({...f, role:key}))}
                    style={{ padding:'10px 8px', borderRadius:12, border:`2px solid ${form.role===key?r.color:t.border}`, background:form.role===key?r.color+'15':t.card, cursor:'pointer', textAlign:'left', transition:'all .15s' }}>
                    <div style={{ fontSize:16 }}>{r.emoji}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:form.role===key?r.color:t.text, marginTop:2 }}>{r.label}</div>
                  </button>
                ))}
              </div>
            </div>
            {error && <div style={{ background:t.dangerLight, color:t.danger, borderRadius:10, padding:'10px 14px', fontSize:13, marginBottom:12, display:'flex', gap:8 }}><AlertCircle size={16}/>{error}</div>}
            <div style={{ display:'flex', gap:10 }}>
              <button style={{ flex:1, padding:'12px', borderRadius:12, background:t.cardAlt, color:t.textSub, border:`1px solid ${t.border}`, fontWeight:700, cursor:'pointer' }} onClick={() => setShowCreate(false)}>Cancelar</button>
              <button style={{ flex:2, padding:'12px', borderRadius:12, background:t.primary, color:'#fff', border:'none', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={save}>
                <CheckCircle2 size={16}/> {editingUser ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PROFILE
// ════════════════════════════════════════════════════════════
function ProfileScreen({ user, users, processes, workspaces, onLogout, onDarkToggle, darkMode, onOpenAdmin, t }) {
  const mine = processes.filter(p => p.authorId===user.id && p.status==='published');
  const myWsCount = workspaces.filter(w => w.managerId===user.id || w.memberIds?.includes(user.id)).length;
  const isAdmin = user.role === 'admin';

  return (
    <div className="scroll" style={{ height:'100%', paddingBottom:80 }}>
      <div style={{ padding:'56px 16px 0' }}>
        <h2 style={{ fontSize:22, fontWeight:800, marginBottom:24, color:t.text }}>Perfil</h2>
        <div className="card" style={{ padding:24, marginBottom:16, textAlign:'center' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}><Avatar name={user.name} size={72}/></div>
          <h3 style={{ fontSize:20, fontWeight:800, color:t.text, marginBottom:4 }}>{user.name}</h3>
          <p style={{ fontSize:14, color:t.textSub, marginBottom:2 }}>{user.position}</p>
          <p style={{ fontSize:13, color:t.textMuted }}>{user.area}</p>
          <p style={{ fontSize:12, color:t.textMuted, marginTop:2 }}>{user.email}</p>
          <div style={{ marginTop:10 }}><RoleBadge role={user.role||'employee'} t={t}/></div>
          <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:16, paddingTop:16, borderTop:`1px solid ${t.border}` }}>
            {[['Procesos',mine.length],['Proyectos',myWsCount],['Likes',mine.reduce((s,p)=>s+(p.likes?.length||0),0)]].map(([l,v]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:800, color:t.primary }}>{v}</div>
                <div style={{ fontSize:12, color:t.textMuted }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {isAdmin && (
          <div className="card" style={{ marginBottom:16, overflow:'hidden' }}>
            <button onClick={onOpenAdmin} style={{ display:'flex', alignItems:'center', gap:14, width:'100%', padding:'16px 20px', background:'transparent', border:'none', color:t.text, fontSize:15, fontWeight:600, cursor:'pointer' }}>
              <span style={{ color:t.purple }}>👑</span>
              Panel de administración
              <span style={{ marginLeft:'auto', color:t.textMuted }}><ChevronRight size={18}/></span>
            </button>
          </div>
        )}
        <div className="card" style={{ marginBottom:16, overflow:'hidden' }}>
          <button onClick={onDarkToggle} style={{ display:'flex', alignItems:'center', gap:14, width:'100%', padding:'16px 20px', background:'transparent', border:'none', color:t.text, fontSize:15, fontWeight:600, cursor:'pointer' }}>
            <span style={{ color:t.primary }}>{darkMode ? <Sun size={20}/> : <Moon size={20}/>}</span>
            {darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            <span style={{ marginLeft:'auto', color:t.textMuted }}><ChevronRight size={18}/></span>
          </button>
        </div>
        <div className="card" style={{ padding:16, marginBottom:16 }}>
          <p style={{ fontSize:13, fontWeight:700, color:t.textSub, marginBottom:6 }}>EQUIPO</p>
          <p style={{ fontSize:14, color:t.textMuted }}>{users.length} miembro{users.length!==1?'s':''} registrado{users.length!==1?'s':''}</p>
          <p style={{ fontSize:14, color:t.textMuted }}>{processes.filter(p=>p.status==='published').length} proceso{processes.filter(p=>p.status==='published').length!==1?'s':''} publicado{processes.filter(p=>p.status==='published').length!==1?'s':''}</p>
          <p style={{ fontSize:14, color:t.textMuted }}>{workspaces.length} proyecto{workspaces.length!==1?'s':''} de trabajo</p>
        </div>
        <button onClick={onLogout} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'14px', borderRadius:12, background:t.dangerLight, color:t.danger, border:'none', fontWeight:700, fontSize:15, cursor:'pointer' }}>
          <LogOut size={18}/> Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════
export default function App() {
  const [darkMode, setDarkMode]     = useState(() => storage.get('gp_dark', false));
  const t = darkMode ? DARK : LIGHT;
  useEffect(() => { injectStyles(t); }, [t]);

  // Seed admin y auto-corregir si ya existe con datos viejos
  const [users, setUsers] = useState(() => {
    let stored = storage.get('gp_users', []);
    const adminBase = { id: 'admin-001', name: 'Administrador', email: 'admin@guiapro.com', password: 'Admin2024!', position: 'Administrador', area: 'General', role: 'admin' };
    if (stored.length === 0) {
      const admin = { ...adminBase, createdAt: new Date().toISOString() };
      storage.set('gp_users', [admin]);
      return [admin];
    }
    // Asegurar que el admin tenga role:'admin' y position correcta
    const idx = stored.findIndex(u => u.id === 'admin-001' || u.email === 'admin@guiapro.com');
    if (idx === -1) {
      stored = [...stored, { ...adminBase, createdAt: new Date().toISOString() }];
    } else {
      stored = stored.map((u, i) => i === idx ? { ...u, role: 'admin', position: u.position === 'Encargado' ? 'Administrador' : u.position } : u);
    }
    storage.set('gp_users', stored);
    return stored;
  });
  const [user, setUser] = useState(() => { const sid=storage.get('gp_session'); return sid ? storage.get('gp_users',[]).find(u=>u.id===sid)||null : null; });
  const [processes, setProcesses]   = useState(() => storage.get('gp_processes', []));
  const [workspaces, setWorkspaces] = useState(() => storage.get('gp_workspaces', []));
  const [activities, setActivities] = useState(() => storage.get('gp_activities', []));
  const [areas, setAreas]           = useState(() => storage.get('gp_areas', ['General','Operaciones','Recursos Humanos','Finanzas','Tecnología','Ventas','Marketing']));
  const [viewActivity, setViewActivity] = useState(null);

  const [tab, setTab]               = useState('home');
  const [viewAdmin, setViewAdmin]   = useState(false);
  const [viewProc, setViewProc]     = useState(null);
  const [editProc, setEditProc]     = useState(null);
  const [creating, setCreating]     = useState(false);
  const [createProcWsId, setCreateProcWsId] = useState(null); // pre-select workspace when creating from ws detail

  const [viewWs, setViewWs]         = useState(null); // workspace detail
  const [editingWs, setEditingWs]   = useState(null); // workspace being edited
  const [creatingWs, setCreatingWs] = useState(false);
  const [joinWs, setJoinWs]         = useState(null); // workspace to join (modal)

  useEffect(() => { storage.set('gp_processes', processes); }, [processes]);
  useEffect(() => { storage.set('gp_users', users); }, [users]);
  useEffect(() => { storage.set('gp_workspaces', workspaces); }, [workspaces]);
  useEffect(() => { storage.set('gp_dark', darkMode); }, [darkMode]);
  useEffect(() => { storage.set('gp_activities', activities); }, [activities]);
  useEffect(() => { storage.set('gp_areas', areas); }, [areas]);

  // ── Botón atrás del móvil: manejar navegación interna
  const navRef = useRef({});
  navRef.current = { viewAdmin, viewProc, creating, creatingWs, viewWs, viewActivity, tab };

  useEffect(() => {
    // Siempre mantener un estado extra en el historial para interceptar el botón atrás
    window.history.pushState({ guiapro: true }, '');

    const handlePop = () => {
      const s = navRef.current;
      // Volver a agregar el estado para que el siguiente "atrás" también se intercepte
      window.history.pushState({ guiapro: true }, '');
      // Cerrar la pantalla activa en orden de prioridad
      if (s.viewAdmin)    { setViewAdmin(false);   return; }
      if (s.viewActivity) { setViewActivity(null); return; }
      if (s.viewProc)     { setViewProc(null);     return; }
      if (s.creating)     { setCreating(false); setEditProc(null); setCreateProcWsId(null); return; }
      if (s.creatingWs)   { setCreatingWs(false); setEditingWs(null); return; }
      if (s.viewWs)       { setViewWs(null);       return; }
      // En pantalla principal: ir a Inicio si no estamos ahí
      if (s.tab !== 'home') { setTab('home'); }
      // Si ya estamos en Inicio, no hacer nada (no salir del app)
    };

    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []); // Solo al montar

  const saveArea   = (name) => { const n = name.trim(); if(n && !areas.includes(n)) setAreas(prev => [...prev, n]); };
  const deleteArea = (name) => { setAreas(prev => prev.filter(a => a !== name)); };

  const handleAuth = (u) => { storage.set('gp_session', u.id); setUser(u); setUsers(storage.get('gp_users',[])); };
  const handleLogout = () => { storage.set('gp_session',null); setUser(null); setTab('home'); setViewProc(null); setCreating(false); setViewWs(null); setViewActivity(null); setViewAdmin(false); };
  const saveUser = (u) => { setUsers(prev => prev.find(x=>x.id===u.id) ? prev.map(x=>x.id===u.id?u:x) : [...prev,u]); };
  const deleteUser = (id) => { setUsers(prev => prev.filter(u=>u.id!==id)); };

  // Processes CRUD
  const saveProcess = (proc) => {
    setProcesses(prev => prev.find(p=>p.id===proc.id) ? prev.map(p=>p.id===proc.id?proc:p) : [...prev,proc]);
    setCreating(false); setEditProc(null); setCreateProcWsId(null);
    if (proc.workspaceId) { setViewWs(workspaces.find(w=>w.id===proc.workspaceId)||null); setTab('workspaces'); }
    else setTab('mine');
  };
  const updateProcess = (proc) => { setProcesses(prev => prev.map(p=>p.id===proc.id?proc:p)); setViewProc(proc); };
  const deleteProcess = (id) => {
    const proc = processes.find(p=>p.id===id);
    setProcesses(prev => prev.filter(p=>p.id!==id));
    setViewProc(null);
    if (proc?.workspaceId) { setViewWs(workspaces.find(w=>w.id===proc.workspaceId)||null); setTab('workspaces'); }
    else setTab('mine');
  };
  const openProcess = (id) => { const p=processes.find(pr=>pr.id===id); if(p) setViewProc(p); };
  const editProcess = (id) => { const p=processes.find(pr=>pr.id===id); if(p) { setEditProc(p); setCreating(true); setViewProc(null); } };

  // Workspaces CRUD
  const saveWorkspace = (ws) => {
    setWorkspaces(prev => prev.find(w=>w.id===ws.id) ? prev.map(w=>w.id===ws.id?ws:w) : [...prev,ws]);
    setCreatingWs(false); setEditingWs(null);
    setViewWs(ws); setTab('workspaces');
  };
  const updateWs = (ws) => { setWorkspaces(prev => prev.map(w=>w.id===ws.id?ws:w)); setViewWs(ws); };
  const deleteWs = (id) => {
    setWorkspaces(prev => prev.filter(w=>w.id!==id));
    setProcesses(prev => prev.filter(p=>p.workspaceId!==id));
    setActivities(prev => prev.filter(a=>a.workspaceId!==id));
    setViewWs(null); setTab('workspaces');
  };
  const openWs = (id, action) => {
    const ws = workspaces.find(w=>w.id===id);
    if (!ws) return;
    if (action==='join') { setJoinWs(ws); return; }
    setViewWs(ws); setTab('workspaces');
  };
  const joinWorkspace = () => {
    if (!joinWs) return;
    const updated = { ...joinWs, memberIds: [...(joinWs.memberIds||[]), user.id] };
    updateWs(updated);
    setJoinWs(null);
    setViewWs(updated); setTab('workspaces');
  };

  // Process submission flow (employee → manager)
  const submitProcess = (procId, wsId) => {
    setProcesses(prev => prev.map(p => p.id === procId ? { ...p, workspaceId: wsId, status: 'pending' } : p));
  };
  const approveProcess = (procId, visibility = 'private') => {
    setProcesses(prev => prev.map(p => p.id === procId ? { ...p, status: 'published', visibility } : p));
  };
  const rejectProcess = (procId) => {
    setProcesses(prev => prev.map(p => p.id === procId ? { ...p, workspaceId: null, status: 'draft' } : p));
  };

  // Activities CRUD
  const saveActivity = (act) => { setActivities(prev => [...prev, act]); };
  const deleteActivity = (id) => { setActivities(prev => prev.filter(a => a.id !== id)); };
  const completeActivity = (id) => {
    const completion = { userId: user?.id, completedAt: now() };
    setActivities(prev => prev.map(a => a.id === id ? { ...a, completions: [...(a.completions||[]).filter(c=>c.userId!==user?.id), completion] } : a));
    setViewActivity(prev => prev?.id === id ? { ...prev, completions: [...(prev.completions||[]).filter(c=>c.userId!==user?.id), completion] } : prev);
  };
  const openActivity = (act) => { setViewActivity(act); };

  if (!user) return <div style={{ height:'100%', overflow:'auto' }}><AuthScreen onAuth={handleAuth} t={t}/></div>;

  // ── View activity
  // ── Admin panel
  if (viewAdmin) return <div style={{ height:'100%', overflow:'hidden', background:t.bg }}>
    <AdminScreen currentUser={user} users={users} areas={areas} onBack={() => setViewAdmin(false)} onSaveUser={saveUser} onDeleteUser={deleteUser} onSaveArea={saveArea} onDeleteArea={deleteArea} t={t}/>
  </div>;

  if (viewActivity) {
    const freshActivity = activities.find(a => a.id === viewActivity.id) || viewActivity;
    const proc = processes.find(p => p.id === freshActivity.processId);
    return <div style={{ height:'100%', overflow:'hidden', background:t.bg }}>
      <ActivityView activity={freshActivity} process={proc} user={user} onComplete={completeActivity} onBack={() => setViewActivity(null)} t={t}/>
    </div>;
  }

  // ── View process
  if (viewProc) {
    const fresh = processes.find(p=>p.id===viewProc.id)||viewProc;
    return <div style={{ height:'100%', overflow:'hidden', background:t.bg }}>
      <ProcessView proc={fresh} user={user} users={users} workspaces={workspaces} onBack={() => setViewProc(null)} onEdit={() => editProcess(fresh.id)} onDelete={() => deleteProcess(fresh.id)} onUpdate={updateProcess} t={t}/>
    </div>;
  }

  // ── Create/edit process
  if (creating) return <div style={{ height:'100%', overflow:'hidden', background:t.bg }}>
    <CreateScreen user={user} processes={processes} workspaces={workspaces} onSave={saveProcess} onCancel={() => { setCreating(false); setEditProc(null); setCreateProcWsId(null); }} editProc={editProc} defaultWsId={createProcWsId} t={t}/>
  </div>;

  // ── Create/edit workspace
  if (creatingWs) return <div style={{ height:'100%', overflow:'hidden', background:t.bg }}>
    <CreateWorkspaceScreen user={user} onSave={saveWorkspace} onCancel={() => { setCreatingWs(false); setEditingWs(null); }} editWs={editingWs} t={t}/>
  </div>;

  // ── Workspace detail
  if (viewWs) {
    const freshWs = workspaces.find(w=>w.id===viewWs.id)||viewWs;
    return <div style={{ height:'100%', overflow:'hidden', background:t.bg }}>
      <WorkspaceDetailScreen
        ws={freshWs} user={user} users={users} processes={processes} workspaces={workspaces}
        activities={activities}
        onBack={() => setViewWs(null)}
        onEdit={() => { setEditingWs(freshWs); setCreatingWs(true); setViewWs(null); }}
        onDelete={() => deleteWs(freshWs.id)}
        onUpdate={updateProcess}
        onUpdateWs={updateWs}
        onOpenProcess={openProcess}
        onCreateProcess={() => { setCreateProcWsId(freshWs.id); setCreating(true); setViewWs(null); }}
        onCreateActivity={saveActivity}
        onDeleteActivity={deleteActivity}
        onOpenActivity={openActivity}
        onApprove={approveProcess}
        onReject={rejectProcess}
        t={t}
      />
    </div>;
  }

  const TABS = [
    { id:'home',       icon:<Home size={22}/>,      label:'Inicio' },
    { id:'workspaces', icon:<Briefcase size={22}/>,  label:'Proyectos' },
    { id:'mine',       icon:<FileText size={22}/>,   label:'Mis guías' },
    { id:'profile',    icon:<User size={22}/>,       label:'Perfil' },
  ];

  return (
    <div style={{ height:'100%', overflow:'hidden', background:t.bg }}>
      <div style={{ height:'100%', overflow:'hidden' }}>
        {tab==='home'       && <HomeScreen user={user} processes={processes} users={users} workspaces={workspaces} activities={activities} onOpen={openProcess} onOpenActivity={openActivity} onCreateNew={() => setCreating(true)} onOpenAdmin={() => setViewAdmin(true)} t={t}/>}
        {tab==='workspaces' && <WorkspacesScreen user={user} workspaces={workspaces} processes={processes} users={users} onOpenWs={openWs} onCreateWs={() => setCreatingWs(true)} t={t}/>}
        {tab==='mine'       && <MyProcessesScreen user={user} processes={processes} users={users} workspaces={workspaces} onOpen={openProcess} onEdit={editProcess} onSubmit={submitProcess} t={t}/>}
        {tab==='profile'    && <ProfileScreen user={user} users={users} processes={processes} workspaces={workspaces} onLogout={handleLogout} onDarkToggle={() => setDarkMode(d=>!d)} darkMode={darkMode} onOpenAdmin={() => setViewAdmin(true)} t={t}/>}
      </div>

      {tab !== 'profile' && tab !== 'workspaces' && (
        <button className="fab" onClick={() => setCreating(true)} title="Nuevo proceso"><Plus size={26}/></button>
      )}

      <nav className="bottom-nav">
        {TABS.map(({ id, icon, label }) => (
          <button key={id} className={`nav-item ${tab===id?'active':''}`} onClick={() => setTab(id)}>
            {icon}<span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Join workspace modal */}
      {joinWs && <JoinWorkspaceModal ws={joinWs} user={user} onJoin={joinWorkspace} onCancel={() => setJoinWs(null)} t={t}/>}
    </div>
  );
}
