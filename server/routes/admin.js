const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'change-in-production';

// Multer setup
const uploadDir = path.join(__dirname, '../public/images/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// requireAdmin middleware
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Hasło wymagane' });
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Nieprawidłowe hasło' });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

// GET /api/admin/stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const [total, pending, subs, inquiries] = await Promise.all([
      db.query("SELECT COUNT(*) FROM events WHERE status='published'"),
      db.query("SELECT COUNT(*) FROM events WHERE status='pending'"),
      db.query("SELECT COUNT(*) FROM subscribers"),
      db.query("SELECT COUNT(*) FROM contact_inquiries WHERE status='new'")
    ]);
    res.json({
      total_events: parseInt(total.rows[0].count),
      pending_events: parseInt(pending.rows[0].count),
      subscribers: parseInt(subs.rows[0].count),
      new_inquiries: parseInt(inquiries.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/events
router.get('/events', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status, sport_type, search, page = 1, limit = 20 } = req.query;
    let conditions = [];
    let params = [];
    let idx = 1;

    if (status) { conditions.push(`status = $${idx++}`); params.push(status); }
    if (sport_type) { conditions.push(`sport_type = $${idx++}`); params.push(sport_type); }
    if (search) {
      conditions.push(`(name ILIKE $${idx} OR city ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [data, count] = await Promise.all([
      db.query(`SELECT * FROM events ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx+1}`,
        [...params, parseInt(limit), offset]),
      db.query(`SELECT COUNT(*) FROM events ${where}`, params)
    ]);

    res.json({ events: data.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/events/:id
router.put('/events/:id', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const fields = ['name','sport_type','date_start','date_end','city','voivodeship','description',
      'distance','difficulty','price','registration_url','registration_deadline',
      'organizer_name','organizer_email','event_website','status','featured'];
    const updates = [];
    const params = [];
    let idx = 1;

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = $${idx++}`);
        params.push(req.body[f]);
      }
    });

    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
    params.push(req.params.id);

    const result = await db.query(
      `UPDATE events SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/events/:id
router.delete('/events/:id', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    await db.query("DELETE FROM events WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/events/:id/approve
router.post('/events/:id/approve', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(
      "UPDATE events SET status='published' WHERE id=$1 RETURNING *", [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/events/:id/reject
router.post('/events/:id/reject', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(
      "UPDATE events SET status='rejected' WHERE id=$1 RETURNING *", [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/articles
router.get('/articles', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query("SELECT * FROM articles ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/articles
router.post('/articles', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { title, slug, content, excerpt, author_name, sport_type, status } = req.body;
    const result = await db.query(
      `INSERT INTO articles (title, slug, content, excerpt, author_name, sport_type, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, slug, content, excerpt, author_name || 'Redakcja Startivo', sport_type, status || 'draft']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/articles/:id
router.put('/articles/:id', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const fields = ['title','slug','content','excerpt','author_name','sport_type','status','image_url'];
    const updates = [];
    const params = [];
    let idx = 1;

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = $${idx++}`);
        params.push(req.body[f]);
      }
    });

    params.push(req.params.id);
    const result = await db.query(
      `UPDATE articles SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, params
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/articles/:id
router.delete('/articles/:id', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    await db.query("DELETE FROM articles WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/upload
router.post('/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/images/uploads/${req.file.filename}` });
});

// GET /api/admin/subscribers
router.get('/subscribers', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query("SELECT * FROM subscribers ORDER BY created_at DESC");
    res.json({ subscribers: result.rows, total: result.rows.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/inquiries
router.get('/inquiries', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query("SELECT * FROM contact_inquiries ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/inquiries/:id
router.put('/inquiries/:id', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(
      "UPDATE contact_inquiries SET status='handled' WHERE id=$1 RETURNING *", [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/settings
router.get('/settings', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query("SELECT key, value FROM settings");
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/settings
router.put('/settings', requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { key, value } = req.body;
    await db.query(
      "INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()",
      [key, value]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
