const express = require('express');
const router = express.Router();

// GET /api/stats
router.get('/stats', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const [total, regions, sports, monthly] = await Promise.all([
      db.query("SELECT COUNT(*) FROM events WHERE status='published'"),
      db.query("SELECT COUNT(DISTINCT voivodeship) FROM events WHERE status='published'"),
      db.query("SELECT COUNT(DISTINCT sport_type) FROM events WHERE status='published'"),
      db.query(`SELECT COUNT(*) FROM events WHERE status='published'
        AND date_start >= date_trunc('month', NOW())
        AND date_start < date_trunc('month', NOW()) + interval '1 month'`)
    ]);
    res.json({
      total_events: parseInt(total.rows[0].count),
      total_regions: parseInt(regions.rows[0].count),
      sport_categories: parseInt(sports.rows[0].count),
      events_this_month: parseInt(monthly.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/stats/by-sport
router.get('/stats/by-sport', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(
      "SELECT sport_type, COUNT(*) as count FROM events WHERE status='published' GROUP BY sport_type"
    );
    const data = {};
    result.rows.forEach(r => { data[r.sport_type] = parseInt(r.count); });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { email, region } = req.body;
    if (!email) return res.status(400).json({ error: 'Email wymagany' });
    await db.query(
      "INSERT INTO subscribers (email, region) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING",
      [email, region]
    );
    res.json({ ok: true, message: 'Zapisano do newslettera!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/contact
router.post('/contact', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, company, email, inquiry_type, message } = req.body;
    if (!email || !message) return res.status(400).json({ error: 'Email i wiadomość wymagane' });
    await db.query(
      "INSERT INTO contact_inquiries (name, company, email, inquiry_type, message) VALUES ($1,$2,$3,$4,$5)",
      [name, company, email, inquiry_type, message]
    );
    res.json({ ok: true, message: 'Wiadomość wysłana!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/settings
router.get('/settings', async (req, res) => {
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

module.exports = router;
