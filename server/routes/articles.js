const express = require('express');
const router = express.Router();

// GET /api/articles
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status = 'published', sport_type, limit = 20, page = 1 } = req.query;

    let conditions = [`status = $1`];
    let params = [status];
    let idx = 2;

    if (sport_type) { conditions.push(`sport_type = $${idx++}`); params.push(sport_type); }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = conditions.join(' AND ');

    const [data, count] = await Promise.all([
      db.query(`SELECT * FROM articles WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx+1}`,
        [...params, parseInt(limit), offset]),
      db.query(`SELECT COUNT(*) FROM articles WHERE ${where}`, params)
    ]);

    res.json({
      articles: data.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/articles/:slug
router.get('/:slug', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { slug } = req.params;
    let result = await db.query("SELECT * FROM articles WHERE slug = $1", [slug]);
    if (result.rows.length === 0) {
      result = await db.query("SELECT * FROM articles WHERE id = $1", [parseInt(slug) || 0]);
    }
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
