const express = require('express');
const router = express.Router();

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/ą/g,'a').replace(/ć/g,'c').replace(/ę/g,'e').replace(/ł/g,'l')
    .replace(/ń/g,'n').replace(/ó/g,'o').replace(/ś/g,'s').replace(/ź/g,'z').replace(/ż/g,'z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { sport_type, voivodeship, date_from, date_to, search, page = 1, limit = 20, status = 'published' } = req.query;

    let conditions = [`e.status = $1`];
    let params = [status];
    let idx = 2;

    if (sport_type) { conditions.push(`e.sport_type = $${idx++}`); params.push(sport_type); }
    if (voivodeship) { conditions.push(`e.voivodeship = $${idx++}`); params.push(voivodeship); }
    if (date_from) { conditions.push(`e.date_start >= $${idx++}`); params.push(date_from); }
    if (date_to) { conditions.push(`e.date_start <= $${idx++}`); params.push(date_to); }
    if (search) {
      conditions.push(`(e.name ILIKE $${idx} OR e.city ILIKE $${idx} OR e.description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = conditions.join(' AND ');

    const [data, count] = await Promise.all([
      db.query(`SELECT * FROM events e WHERE ${where} ORDER BY e.date_start ASC LIMIT $${idx} OFFSET $${idx+1}`,
        [...params, parseInt(limit), offset]),
      db.query(`SELECT COUNT(*) FROM events e WHERE ${where}`, params)
    ]);

    res.json({
      events: data.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/events/featured
router.get('/featured', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(
      "SELECT * FROM events WHERE featured = true AND status = 'published' ORDER BY date_start ASC LIMIT 6"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/events/:slug
router.get('/:slug', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { slug } = req.params;
    let result = await db.query("SELECT * FROM events WHERE slug = $1", [slug]);
    if (result.rows.length === 0) {
      result = await db.query("SELECT * FROM events WHERE id = $1", [parseInt(slug) || 0]);
    }
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/events — submit new event (pending)
router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const {
      name, sport_type, date_start, date_end, city, voivodeship,
      description, distance, difficulty, price, registration_url,
      registration_deadline, organizer_name, organizer_email, event_website
    } = req.body;

    if (!name || !date_start || !city || !voivodeship) {
      return res.status(400).json({ error: 'Wymagane: name, date_start, city, voivodeship' });
    }

    const slug = slugify(name) + '-' + Date.now();
    const result = await db.query(
      `INSERT INTO events (name, slug, sport_type, date_start, date_end, city, voivodeship,
        description, distance, difficulty, price, registration_url, registration_deadline,
        organizer_name, organizer_email, event_website, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'pending')
       RETURNING *`,
      [name, slug, sport_type, date_start, date_end, city, voivodeship,
       description, distance, difficulty, price, registration_url, registration_deadline,
       organizer_name, organizer_email, event_website]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/events/:id/view
router.post('/:id/view', async (req, res) => {
  try {
    const db = req.app.locals.db;
    await db.query("UPDATE events SET view_count = view_count + 1 WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/events/:id/alert
router.post('/:id/alert', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { email, days_before = 7 } = req.body;
    if (!email) return res.status(400).json({ error: 'Email wymagany' });
    await db.query(
      "INSERT INTO event_alerts (event_id, email, days_before) VALUES ($1, $2, $3)",
      [req.params.id, email, days_before]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
