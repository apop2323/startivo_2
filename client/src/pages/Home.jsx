import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useReveal } from '../hooks/useReveal';
import SportIcon, { getSportColor, getSportLabel } from '../components/SportIcon';
import EventCard from '../components/EventCard';
import { SPORTS_MAIN, VOIVODESHIPS } from '../constants';
import { countdownLabel, formatDatePL } from '../utils';

const PLACEHOLDER_EVENTS = [
  { id: 1, name: 'Runmageddon Warszawa', sport_type: 'ocr', city: 'Warszawa', date_start: '2026-05-16', price: 199, distance: '5km / 12km', slug: 'placeholder' },
  { id: 2, name: 'HYROX Gdańsk', sport_type: 'hyrox', city: 'Gdańsk', date_start: '2026-03-28', price: 399, distance: '8km', slug: 'placeholder' },
  { id: 3, name: 'Triathlon Gdynia', sport_type: 'triathlon', city: 'Gdynia', date_start: '2026-07-19', price: 280, distance: '40km', slug: 'placeholder' },
  { id: 4, name: 'Ultra Trail Zakopane', sport_type: 'trail', city: 'Zakopane', date_start: '2026-08-22', price: 180, distance: '50km', slug: 'placeholder' },
];

const PLACEHOLDER_ARTICLES = [
  { id: 1, title: 'Jak przygotować się do Hyrox?', sport_type: 'hyrox', excerpt: 'Kompletny przewodnik przygotowania do zawodów Hyrox — plan treningowy i strategia.', slug: 'jak-przygotowac-sie-do-hyrox' },
  { id: 2, title: 'OCR dla początkujących — Runmageddon', sport_type: 'ocr', excerpt: 'Wszystko co musisz wiedzieć przed pierwszym startem w Runmageddon.', slug: 'ocr-dla-poczatkujacych-runmageddon' },
  { id: 3, title: 'Triathlon od zera — pierwszy sezon', sport_type: 'triathlon', excerpt: 'Praktyczny przewodnik dla każdego kto chce wystartować w pierwszym triathlonie.', slug: 'triathlon-od-zera-pierwszy-sezon' },
];

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1500;
        const start = performance.now();
        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function Home() {
  useReveal();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [voivFilter, setVoivFilter] = useState('');
  const [stats, setStats] = useState({ total_events: 150, total_regions: 16, sport_categories: 6, events_this_month: 12 });
  const [bySport, setBySport] = useState({});
  const [featured, setFeatured] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [articles, setArticles] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/stats/by-sport').then(r => r.json()).then(setBySport).catch(() => {});
    fetch('/api/events/featured').then(r => r.json()).then(d => setFeatured(Array.isArray(d) ? d : [])).catch(() => {});
    fetch('/api/events?limit=8&status=published').then(r => r.json()).then(d => setUpcoming(d.events || [])).catch(() => {});
    fetch('/api/articles?status=published&limit=3').then(r => r.json()).then(d => setArticles(d.articles || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sportFilter) params.set('sport_type', sportFilter);
    if (voivFilter) params.set('voivodeship', voivFilter);
    navigate(`/kalendarz?${params.toString()}`);
  };

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newsletterEmail }) });
    } catch {}
    setNewsletterDone(true);
  };

  const displayedFeatured = featured.length ? featured : PLACEHOLDER_EVENTS;
  const displayedUpcoming = upcoming.length ? upcoming : PLACEHOLDER_EVENTS.concat(PLACEHOLDER_EVENTS.slice(0, 2));
  const displayedArticles = articles.length ? articles : PLACEHOLDER_ARTICLES;

  return (
    <>
      <Helmet>
        <title>Startivo — Jedno miejsce. Wszystkie starty sportowe w Polsce.</title>
        <meta name="description" content="Startivo to największy agregator zawodów sportowych w Polsce. Biegi, Hyrox, OCR, Triathlon — 150+ wydarzeń, 16 województw." />
      </Helmet>

      {/* ===== 1. HERO ===== */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-grid" />

        <div className="hero-badges">
          <div className="container">
            <div className="hero-badges-inner">
              <span className="hero-tag">#1 platforma startów w Polsce</span>
              <span className="hero-meta">{stats.total_events}+ wydarzeń · {stats.total_regions} województw</span>
            </div>
          </div>
        </div>

        <div className="container">
          <p className="hero-label">POLSKA · SEZON 2026</p>

          <h1 style={{ color: 'white', marginBottom: 24 }}>
            Znajdź swój<br/>
            <span className="text-orange">następny</span> start.
          </h1>

          <p className="hero-subtitle">
            Biegi, triathlony, OCR, Hyrox — wszystkie polskie zawody sportowe w jednym miejscu.
          </p>

          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Szukaj zawodów, miasta..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
              className={sportFilter ? 'has-value' : ''}
            >
              <option value="">Dyscyplina</option>
              {SPORTS_MAIN.map(s => <option key={s.type} value={s.type}>{s.label}</option>)}
            </select>
            <select
              value={voivFilter}
              onChange={e => setVoivFilter(e.target.value)}
              className={voivFilter ? 'has-value' : ''}
            >
              <option value="">Województwo</option>
              {VOIVODESHIPS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <button type="submit">Szukaj →</button>
          </form>

          <div className="sport-tags">
            {SPORTS_MAIN.map(s => (
              <button
                key={s.type}
                className="sport-tag"
                onClick={() => navigate(`/kalendarz?sport_type=${s.type}`)}
              >
                <SportIcon type={s.type} size={14} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 2. STATS STRIP ===== */}
      <section className="stats-strip">
        <div className="container">
          <div className="stats-grid">
            {[
              { target: stats.total_events, suffix: '+', label: 'Wydarzeń' },
              { target: stats.total_regions, suffix: '', label: 'Województw' },
              { target: stats.sport_categories, suffix: '+', label: 'Dyscyplin' },
              { target: stats.events_this_month, suffix: '+', label: 'Startów w marcu' },
            ].map((s, i) => (
              <div key={i} className="stats-item">
                <div className="stats-value">
                  <AnimatedCounter target={s.target} suffix={s.suffix} />
                </div>
                <div className="stats-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. DYSCYPLINY ===== */}
      <section className="section-white section-padded">
        <div className="container">
          <div className="disciplines-grid">
            <div className="reveal">
              <span className="section-label">Dyscypliny</span>
              <h2 style={{ marginBottom: 20 }}>Wybierz swoją dyscyplinę</h2>
              <p style={{ color: 'var(--gray)', lineHeight: 1.7, marginBottom: 28 }}>
                Od biegania ulicznego przez ekstremalne przeszkodówki po triathlon — mamy zawody dla każdego poziomu i gustu sportowego.
              </p>
              <Link to="/kalendarz" className="section-link">
                Zobacz pełny kalendarz →
              </Link>
            </div>
            <div className="reveal d1 discipline-cards">
              {SPORTS_MAIN.map(s => {
                const count = bySport[s.type] || 0;
                const color = getSportColor(s.type);
                return (
                  <div
                    key={s.type}
                    className="discipline-card"
                    onClick={() => navigate(`/kalendarz?sport_type=${s.type}`)}
                    style={{ '--sport-color': color }}
                  >
                    <SportIcon type={s.type} size={32} />
                    <div className="discipline-card-name">{s.label}</div>
                    <div className="discipline-card-count">{count} startów</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4. POLECANE STARTY ===== */}
      <section className="section-cream section-padded">
        <div className="container">
          <div className="reveal section-header">
            <h2>Polecane starty</h2>
            <Link to="/kalendarz" className="section-link">Wszystkie starty →</Link>
          </div>
          <div className="event-grid">
            {displayedFeatured.map((ev, i) => (
              <div key={ev.id} className={`reveal d${Math.min(i + 1, 4)}`}>
                <EventCard event={ev} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. NUMEROWANA LISTA ===== */}
      <section className="section-white section-padded">
        <div className="container">
          <div className="reveal" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 60, flexWrap: 'wrap', gap: 20 }}>
            <h2 style={{ textTransform: 'uppercase' }}>
              Nadchodzące<br/>
              <span className="text-orange">starty</span>
            </h2>
            <Link to="/kalendarz" className="section-link" style={{ alignSelf: 'flex-end' }}>
              Pełny kalendarz →
            </Link>
          </div>
          <div>
            {displayedUpcoming.slice(0, 8).map((ev, i) => {
              const color = getSportColor(ev.sport_type);
              return (
                <Link
                  key={ev.id || i}
                  to={`/event/${ev.slug}`}
                  className="reveal upcoming-item"
                >
                  <span className="upcoming-number">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="upcoming-icon" style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)` }}>
                    <SportIcon type={ev.sport_type} size={24} />
                  </div>
                  <div>
                    <div className="upcoming-name">{ev.name}</div>
                    <div className="upcoming-city">{ev.city}</div>
                  </div>
                  <span className="sport-badge" style={{ background: `${color}15`, color }}>
                    {getSportLabel(ev.sport_type)}
                  </span>
                  <span className="upcoming-date">
                    {formatDatePL(ev.date_start, { day: 'numeric', month: 'short' })}
                  </span>
                  <div className="upcoming-price">
                    <span className="upcoming-price-value">{ev.price ? `${ev.price} zł` : '-'}</span>
                    <span className="upcoming-arrow">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 6. CTA SPLIT ===== */}
      <section className="section-dark" style={{ padding: 0 }}>
        <div className="container" style={{ padding: 0 }}>
          <div className="cta-split">
            <div className="cta-left">
              <span className="section-label">Dołącz do nas</span>
              <h2 style={{ color: 'white', marginBottom: 16 }}>
                Dołącz do tysięcy aktywnych Polaków
              </h2>
              <p style={{ color: 'var(--gray)', marginBottom: 32 }}>
                Bądź na bieżąco z nowymi startami, poradnikami i newsami ze świata sportu.
              </p>
              {newsletterDone ? (
                <p className="alert-success" style={{ fontSize: 16 }}>Zapisano! Dziękujemy.</p>
              ) : (
                <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    placeholder="twój@email.pl"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    className="input-field dark"
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn-primary">Zapisz się</button>
                </form>
              )}
            </div>
            <div className="cta-right">
              <span className="cta-big-number">74K+</span>
              <div className="cta-right-label">aktywnych użytkowników</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 7. ARTYKUŁY ===== */}
      <section className="section-cream section-padded">
        <div className="container">
          <div className="reveal section-header">
            <h2>Poradniki sportowe</h2>
            <Link to="/artykuly" className="section-link">Wszystkie artykuły →</Link>
          </div>
          <div className="article-grid">
            {displayedArticles.map((art, i) => {
              const color = getSportColor(art.sport_type);
              return (
                <Link
                  key={art.id}
                  to={`/artykuly/${art.slug}`}
                  className={`reveal d${i + 1} article-card`}
                >
                  <div className="article-card-thumb" style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)` }}>
                    <SportIcon type={art.sport_type} size={48} />
                  </div>
                  <div className="article-card-body">
                    <span className="sport-badge" style={{ background: `${color}15`, color }}>
                      {getSportLabel(art.sport_type)}
                    </span>
                    <h3 className="article-card-title">{art.title}</h3>
                    <p className="article-card-excerpt">{art.excerpt}</p>
                    <span className="article-card-link">Czytaj dalej →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
