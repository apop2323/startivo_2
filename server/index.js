require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

// 1. Env validation
const required = ['DATABASE_URL', 'ADMIN_PASSWORD'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('Missing required env vars:', missing.join(', '));
  process.exit(1);
}

const PORT = process.env.PORT || 3001;
const app = express();

// DB pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
app.locals.db = pool;

// 2. DB init: run schema.sql on startup
async function initDb() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database schema initialized');

    // Check and seed if empty
    const artCount = await pool.query('SELECT COUNT(*) FROM articles');
    if (parseInt(artCount.rows[0].count) === 0) {
      const seed = fs.readFileSync(path.join(__dirname, 'db/seed.sql'), 'utf8');
      await pool.query(seed);
      console.log('Database seeded');
    }

    // Check settings
    const setCount = await pool.query('SELECT COUNT(*) FROM settings');
    if (parseInt(setCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO settings (key, value) VALUES
          ('hero_headline_1', 'ZNAJDŹ SWÓJ'),
          ('hero_headline_2', 'NASTĘPNY START.'),
          ('hero_subtitle', 'Biegi, triathlony, OCR, Hyrox — wszystkie polskie zawody sportowe w jednym miejscu.')
        ON CONFLICT (key) DO NOTHING
      `);
    }
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

// 5. Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// 6. Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zbyt wiele prób logowania. Poczekaj 15 minut.' }
});

app.use('/api/', generalLimiter);
app.use('/api/admin/login', loginLimiter);

// Static uploads
app.use('/images/uploads', express.static(path.join(__dirname, 'public/images/uploads')));

// 7. Routes
const eventsRouter = require('./routes/events');
const articlesRouter = require('./routes/articles');
const adminRouter = require('./routes/admin');
const publicRouter = require('./routes/public');

app.use('/api/events', eventsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/admin', adminRouter);
app.use('/api', publicRouter);

// Sitemap
app.get('/sitemap.xml', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const events = await db.query("SELECT slug, updated_at FROM events WHERE status='published'");
    const pages = ['', '/kalendarz', '/artykuly', '/mapa', '/wspolpraca'];
    const urls = [
      ...pages.map(p => `<url><loc>https://startivo.pl${p}</loc><changefreq>weekly</changefreq></url>`),
      ...events.rows.map(e => `<url><loc>https://startivo.pl/event/${e.slug}</loc><lastmod>${e.updated_at ? e.updated_at.toISOString().split('T')[0] : '2026-01-01'}</lastmod></url>`)
    ];
    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

app.get('/robots.txt', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send('User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://startivo.pl/sitemap.xml\n');
});

app.get('/llms.txt', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# Startivo\n\nStartivo to największy agregator zawodów sportowych w Polsce.\n\n## O serwisie\n\nStartivo agreguje informacje o zawodach sportowych z całej Polski:\n- Biegi uliczne i maratony\n- Zawody OCR (Runmageddon, Spartan Race)\n- HYROX\n- Triathlon\n- Kolarstwo\n- Trail running\n\n## Dane\n\n- API dostępne pod /api/events\n- Ponad 150 wydarzeń rocznie\n- 16 województw\n- 6+ dyscyplin sportowych\n\n## Kontakt\n\nkontakt@startivo.pl\nhttps://startivo.pl\n`);
});

// 8. Serve React build
const buildPath = path.join(__dirname, '../client/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  // 9. SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Startivo API', version: '2.0.0' });
  });
}

// Start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Startivo server running on port ${PORT}`);
  });
});

module.exports = app;
