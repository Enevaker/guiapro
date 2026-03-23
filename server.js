import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createRequire } from 'module';
import crypto from 'crypto';

const require   = createRequire(import.meta.url);
const initSqlJs = require('sql.js');

const __dirname = dirname(fileURLToPath(import.meta.url));
const app       = express();
const PORT      = process.env.PORT || 3000;
const DB_PATH   = join(__dirname, 'guiapro.db');

app.use(express.json({ limit: '20mb' }));
app.use(express.static(join(__dirname, 'dist')));

// ── Sesiones en memoria: token → userId
const sessions = new Map();

let db;

// ── Helpers ──────────────────────────────────────────────────────────────────
const toJ  = (v, def = []) => { try { return JSON.parse(v); } catch { return def; } };
const fromJ = v => JSON.stringify(v ?? null);

function saveDB() {
  try { writeFileSync(DB_PATH, Buffer.from(db.export())); } catch(e) { console.error('saveDB error:', e.message); }
}

function qAll(sql, p = []) {
  try { const r = db.exec(sql, p); return r[0]?.values || []; } catch { return []; }
}
function qOne(sql, p = []) { return qAll(sql, p)[0] || null; }
function run(sql, p = []) { try { db.run(sql, p); } catch(e) { throw e; } }

// ── Row → Object ──────────────────────────────────────────────────────────────
const toUser = r => r ? ({ id:r[0], name:r[1], email:r[2], password:r[3], position:r[4], area:r[5], role:r[6]||'employee', photo:r[7]||null, createdAt:r[8] }) : null;
const safeUser = u => { if(!u) return null; const c={...u}; delete c.password; return c; };

const toProcess = r => r ? ({
  id:r[0], title:r[1], description:r[2], area:r[3], category:r[4],
  steps:toJ(r[5],[]), notes:r[6], tags:toJ(r[7],[]),
  status:r[8], visibility:r[9]||'general', workspaceId:r[10]||null, authorId:r[11],
  likes:toJ(r[12],[]), ratings:toJ(r[13],[]), comments:toJ(r[14],[]), views:r[15]||0,
  createdAt:r[16], updatedAt:r[17]
}) : null;

const toWorkspace = r => r ? ({
  id:r[0], name:r[1], description:r[2], color:r[3],
  managerId:r[4], memberIds:toJ(r[5],[]), inviteCode:r[6], createdAt:r[7]
}) : null;

const toActivity = r => r ? ({
  id:r[0], workspaceId:r[1], processId:r[2], title:r[3], type:r[4]||'execute',
  assignedTo: r[5]==='all' ? 'all' : toJ(r[5],[]),
  dueDate:r[6]||null, createdBy:r[7],
  completions:toJ(r[8],[]), createdAt:r[9]
}) : null;

// ── Auth middleware ────────────────────────────────────────────────────────────
function auth(req, res, next) {
  const token = (req.headers.authorization||'').split(' ')[1];
  if (!token || !sessions.has(token)) return res.status(401).json({ error:'No autorizado' });
  req.userId = sessions.get(token);
  next();
}

// ── DB Init ───────────────────────────────────────────────────────────────────
async function initDB() {
  const SQL = await initSqlJs({
    locateFile: f => join(__dirname, 'node_modules', 'sql.js', 'dist', f)
  });

  db = existsSync(DB_PATH)
    ? new SQL.Database(readFileSync(DB_PATH))
    : new SQL.Database();

  run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE,
    password TEXT, position TEXT, area TEXT,
    role TEXT DEFAULT 'employee', photo TEXT, createdAt TEXT)`);

  run(`CREATE TABLE IF NOT EXISTS processes (
    id TEXT PRIMARY KEY, title TEXT, description TEXT,
    area TEXT, category TEXT, steps TEXT, notes TEXT, tags TEXT,
    status TEXT, visibility TEXT, workspaceId TEXT, authorId TEXT,
    likes TEXT, ratings TEXT, comments TEXT, views INTEGER DEFAULT 0,
    createdAt TEXT, updatedAt TEXT)`);

  run(`CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY, name TEXT, description TEXT,
    color TEXT, managerId TEXT, memberIds TEXT, inviteCode TEXT, createdAt TEXT)`);

  run(`CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY, workspaceId TEXT, processId TEXT,
    title TEXT, type TEXT, assignedTo TEXT, dueDate TEXT,
    createdBy TEXT, completions TEXT, createdAt TEXT)`);

  run(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);

  // Admin seed
  const adminRow = qOne(`SELECT id FROM users WHERE id='admin-001'`);
  if (!adminRow) {
    run(`INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?)`,
      ['admin-001','Administrador','admin@guiapro.com','Admin2024!','Administrador','General','admin',null, new Date().toISOString()]);
    saveDB();
  } else {
    // Asegurar role admin
    run(`UPDATE users SET role='admin' WHERE id='admin-001'`);
    saveDB();
  }

  // Areas por defecto
  const areasRow = qOne(`SELECT value FROM settings WHERE key='areas'`);
  if (!areasRow) {
    run(`INSERT INTO settings VALUES ('areas', ?)`,
      [JSON.stringify(['General','Operaciones','Recursos Humanos','Finanzas','Tecnología','Ventas','Marketing'])]);
    saveDB();
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// RUTAS AUTH
// ══════════════════════════════════════════════════════════════════════════════
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error:'Campos requeridos' });
  const row = qOne(`SELECT * FROM users WHERE lower(email)=lower(?) AND password=?`, [email.trim(), password]);
  if (!row) return res.status(401).json({ error:'Correo o contraseña incorrectos' });
  const user = toUser(row);
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, user.id);
  res.json({ user: safeUser(user), token });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, position, area } = req.body || {};
  if (!name||!email||!password||!position||!area) return res.status(400).json({ error:'Completa todos los campos' });
  if (password.length < 6) return res.status(400).json({ error:'Contraseña mínimo 6 caracteres' });
  const id = crypto.randomUUID();
  try {
    run(`INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, name.trim(), email.toLowerCase().trim(), password, position.trim(), area.trim(), 'employee', null, new Date().toISOString()]);
    saveDB();
    const user = toUser(qOne(`SELECT * FROM users WHERE id=?`, [id]));
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, user.id);
    res.json({ user: safeUser(user), token });
  } catch(e) {
    res.status(400).json({ error: e.message.includes('UNIQUE') ? 'Correo ya registrado' : e.message });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  const row = qOne(`SELECT * FROM users WHERE id=?`, [req.userId]);
  if (!row) return res.status(404).json({ error:'Usuario no encontrado' });
  res.json(safeUser(toUser(row)));
});

app.post('/api/auth/logout', auth, (req, res) => {
  const token = (req.headers.authorization||'').split(' ')[1];
  sessions.delete(token);
  res.json({ ok:true });
});

// ══════════════════════════════════════════════════════════════════════════════
// USUARIOS
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/users', auth, (req, res) => {
  res.json(qAll(`SELECT * FROM users`).map(r => safeUser(toUser(r))));
});

app.post('/api/users', auth, (req, res) => {
  const u = req.body;
  try {
    run(`INSERT OR REPLACE INTO users VALUES (?,?,?,?,?,?,?,?,?)`,
      [u.id, u.name, u.email, u.password||'Temp1234!', u.position, u.area, u.role||'employee', u.photo||null, u.createdAt||new Date().toISOString()]);
    saveDB();
    res.json({ ok:true });
  } catch(e) { res.status(400).json({ error: e.message.includes('UNIQUE') ? 'Email ya registrado' : e.message }); }
});

app.put('/api/users/:id', auth, (req, res) => {
  const u = req.body;
  run(`UPDATE users SET name=?,email=?,position=?,area=?,role=?,photo=? WHERE id=?`,
    [u.name, u.email, u.position, u.area, u.role||'employee', u.photo||null, req.params.id]);
  if (u.password) run(`UPDATE users SET password=? WHERE id=?`, [u.password, req.params.id]);
  saveDB();
  res.json({ ok:true });
});

app.delete('/api/users/:id', auth, (req, res) => {
  run(`DELETE FROM users WHERE id=?`, [req.params.id]);
  saveDB();
  res.json({ ok:true });
});

// ══════════════════════════════════════════════════════════════════════════════
// PROCESOS
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/processes', auth, (req, res) => {
  res.json(qAll(`SELECT * FROM processes`).map(toProcess));
});

app.post('/api/processes', auth, (req, res) => {
  const p = req.body;
  run(`INSERT OR REPLACE INTO processes VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [p.id, p.title, p.description, p.area, p.category,
     fromJ(p.steps), p.notes, fromJ(p.tags),
     p.status, p.visibility||'general', p.workspaceId||null, p.authorId,
     fromJ(p.likes), fromJ(p.ratings), fromJ(p.comments), p.views||0,
     p.createdAt, p.updatedAt]);
  saveDB();
  res.json({ ok:true });
});

app.put('/api/processes/:id', auth, (req, res) => {
  const p = req.body;
  run(`UPDATE processes SET title=?,description=?,area=?,category=?,steps=?,notes=?,tags=?,
    status=?,visibility=?,workspaceId=?,authorId=?,likes=?,ratings=?,comments=?,views=?,updatedAt=? WHERE id=?`,
    [p.title, p.description, p.area, p.category,
     fromJ(p.steps), p.notes, fromJ(p.tags),
     p.status, p.visibility||'general', p.workspaceId||null, p.authorId,
     fromJ(p.likes), fromJ(p.ratings), fromJ(p.comments), p.views||0,
     p.updatedAt, req.params.id]);
  saveDB();
  res.json({ ok:true });
});

app.delete('/api/processes/:id', auth, (req, res) => {
  run(`DELETE FROM processes WHERE id=?`, [req.params.id]);
  saveDB();
  res.json({ ok:true });
});

// ══════════════════════════════════════════════════════════════════════════════
// PROYECTOS (WORKSPACES)
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/workspaces', auth, (req, res) => {
  res.json(qAll(`SELECT * FROM workspaces`).map(toWorkspace));
});

app.post('/api/workspaces', auth, (req, res) => {
  const w = req.body;
  run(`INSERT OR REPLACE INTO workspaces VALUES (?,?,?,?,?,?,?,?)`,
    [w.id, w.name, w.description, w.color, w.managerId, fromJ(w.memberIds), w.inviteCode, w.createdAt]);
  saveDB();
  res.json({ ok:true });
});

app.put('/api/workspaces/:id', auth, (req, res) => {
  const w = req.body;
  run(`UPDATE workspaces SET name=?,description=?,color=?,managerId=?,memberIds=?,inviteCode=? WHERE id=?`,
    [w.name, w.description, w.color, w.managerId, fromJ(w.memberIds), w.inviteCode, req.params.id]);
  saveDB();
  res.json({ ok:true });
});

app.delete('/api/workspaces/:id', auth, (req, res) => {
  run(`DELETE FROM workspaces WHERE id=?`, [req.params.id]);
  run(`DELETE FROM processes WHERE workspaceId=?`, [req.params.id]);
  run(`DELETE FROM activities WHERE workspaceId=?`, [req.params.id]);
  saveDB();
  res.json({ ok:true });
});

// ══════════════════════════════════════════════════════════════════════════════
// ACTIVIDADES
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/activities', auth, (req, res) => {
  res.json(qAll(`SELECT * FROM activities`).map(toActivity));
});

app.post('/api/activities', auth, (req, res) => {
  const a = req.body;
  const assignedTo = a.assignedTo === 'all' ? 'all' : fromJ(a.assignedTo);
  run(`INSERT OR REPLACE INTO activities VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [a.id, a.workspaceId, a.processId, a.title, a.type||'execute',
     assignedTo, a.dueDate||null, a.createdBy, fromJ(a.completions), a.createdAt]);
  saveDB();
  res.json({ ok:true });
});

app.put('/api/activities/:id', auth, (req, res) => {
  const a = req.body;
  const assignedTo = a.assignedTo === 'all' ? 'all' : fromJ(a.assignedTo);
  run(`UPDATE activities SET workspaceId=?,processId=?,title=?,type=?,assignedTo=?,dueDate=?,completions=? WHERE id=?`,
    [a.workspaceId, a.processId, a.title, a.type, assignedTo, a.dueDate||null, fromJ(a.completions), req.params.id]);
  saveDB();
  res.json({ ok:true });
});

app.delete('/api/activities/:id', auth, (req, res) => {
  run(`DELETE FROM activities WHERE id=?`, [req.params.id]);
  saveDB();
  res.json({ ok:true });
});

// ══════════════════════════════════════════════════════════════════════════════
// ÁREAS
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/areas', auth, (req, res) => {
  const row = qOne(`SELECT value FROM settings WHERE key='areas'`);
  res.json(toJ(row?.[0], ['General','Operaciones','Recursos Humanos','Finanzas','Tecnología','Ventas','Marketing']));
});

app.put('/api/areas', auth, (req, res) => {
  run(`INSERT OR REPLACE INTO settings VALUES ('areas', ?)`, [JSON.stringify(req.body)]);
  saveDB();
  res.json({ ok:true });
});

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.get('*', (req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')));

// ── Start ─────────────────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => console.log(`GuíaPro 🚀 puerto ${PORT}`));
}).catch(e => { console.error('DB init error:', e); process.exit(1); });
