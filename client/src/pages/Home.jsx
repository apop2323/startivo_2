import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useReveal } from '../hooks/useReveal';
import SportIcon, { getSportColor, getSportLabel } from '../components/SportIcon';

const VOIVODESHIPS = [
  'dolnośląskie','kujawsko-pomorskie','lubelskie','lubuskie','łódzkie',
  'małopolskie','mazowieckie','opolskie','podkarpackie','podlaskie',
  'pomorskie','śląskie','świętokrzyskie','warmińsko-mazurskie','wielkopolskie','zachodniopomorskie'
];

const SPORTS = [
  { type: 'running', label: 'Bieganie' },
  { type: 'hyrox', label: 'Hyrox' },
  { type: 'ocr', label: 'OCR' },
  { type: 'triathlon', label: 'Triathlon' },
  { type: 'trail', label: 'Trail Running' },
  { type: 'cycling', label: 'Kolarstwo' },
];

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

function countdownLabel(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Zakończone';
  if (diff === 0) return 'Dziś!';
  if (diff === 1) return 'Jutro!';
  if (diff < 7) return `${diff} dni`;
  if (diff < 30) return `${Math.ceil(diff/7)} tyg.`;
  return `${Math.ceil(diff/30)} mies.`;
}

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

function EventCard({ event }) {
  const navigate = useNavigate();
  const color = getSportColor(event.sport_type);

  return (
    <div
      className="event-card"
      onClick={() => navigate(`/event/${event.slug}`)}
    >
      <div
        className="event-card-thumb"
        style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)` }}
      >
        <span className="sport-badge" style={{ background: `${color}22`, color }}>
          <SportIcon type={event.sport_type} size={14} />
          {getSportLabel(event.sport_type)}
        </span>
        <span className="countdown-badge">{countdownLabel(event.date_start)}</span>
      </div>
      <div className="event-card-body">
        <div className="event-card-name">{event.name}</div>
        <div className="event-card-meta">
          <span>{new Date(event.date_start).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>{event.city}</span>
          {event.distance && <span>{event.distance}</span>}
        </div>
      </div>
      <div className="event-card-footer">
        <span className="event-price">{event.price ? `${event.price} zł` : 'Bezpłatne'}</span>
        <button style={{ color, fontWeight: 600, fontSize: 14 }}>Zobacz →</button>
      </div>
    </div>
  );
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
      <section style={{
        minHeight: '100vh',
        background: '#0D0D0D',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingBottom: 72,
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 20% 40%, rgba(255,92,0,0.12) 0%, transparent 70%)',
        }} />
        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,92,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,92,0,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Top badges */}
        <div style={{ position: 'absolute', top: 100, left: 0, right: 0 }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              background: 'rgba(255,92,0,0.15)', border: '1px solid rgba(255,92,0,0.3)',
              color: '#FF5C00', padding: '6px 14px', borderRadius: 100,
              fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
            }}>
              #1 platforma startów w Polsce
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              {stats.total_events}+ wydarzeń · {stats.total_regions} województw
            </span>
          </div>
        </div>

        <div className="container">
          {/* Label */}
          <p style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 12, fontWeight: 600, marginBottom: 24 }}>
            POLSKA · SEZON 2026
          </p>

          {/* H1 */}
          <h1 style={{ color: 'white', marginBottom: 24 }}>
            Znajdź swój<br/>
            <span style={{ color: '#FF5C00' }}>następny</span> start.
          </h1>

          {/* Subtitle */}
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 480, fontSize: 18, marginBottom: 40, lineHeight: 1.6 }}>
            Biegi, triathlony, OCR, Hyrox — wszystkie polskie zawody sportowe w jednym miejscu.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{
            display: 'flex', gap: 8, flexWrap: 'wrap',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 'var(--r-xl)', padding: 8,
            maxWidth: 760,
          }}>
            <input
              type="text"
              placeholder="Szukaj zawodów, miasta..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, minWidth: 160, background: 'transparent', border: 'none',
                color: 'white', padding: '8px 12px', outline: 'none', fontSize: 15,
              }}
            />
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)',
                color: sportFilter ? 'white' : 'rgba(255,255,255,0.4)',
                padding: '8px 12px', borderRadius: 10, outline: 'none', fontSize: 14,
              }}
            >
              <option value="">Dyscyplina</option>
              {SPORTS.map(s => <option key={s.type} value={s.type}>{s.label}</option>)}
            </select>
            <select
              value={voivFilter}
              onChange={e => setVoivFilter(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)',
                color: voivFilter ? 'white' : 'rgba(255,255,255,0.4)',
                padding: '8px 12px', borderRadius: 10, outline: 'none', fontSize: 14,
              }}
            >
              <option value="">Województwo</option>
              {VOIVODESHIPS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <button
              type="submit"
              style={{
                background: '#FF5C00', color: 'white', border: 'none',
                padding: '10px 24px', borderRadius: 10, fontWeight: 600,
                fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Szukaj →
            </button>
          </form>

          {/* Sport tags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
            {SPORTS.map(s => (
              <button
                key={s.type}
                onClick={() => navigate(`/kalendarz?sport_type=${s.type}`)}
                style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: 100,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,92,0,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,92,0,0.4)'; e.currentTarget.style.color = '#FF5C00'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              >
                <SportIcon type={s.type} size={14} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 2. STATS STRIP ===== */}
      <section style={{ background: 'var(--cream)', padding: '48px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0, textAlign: 'center',
          }}>
            {[
              { target: stats.total_events, suffix: '+', label: 'Wydarzeń' },
              { target: stats.total_regions, suffix: '', label: 'Województw' },
              { target: stats.sport_categories, suffix: '+', label: 'Dyscyplin' },
              { target: stats.events_this_month, suffix: '+', label: 'Startów w marcu' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '20px 0',
                borderRight: i < 3 ? '1px solid var(--cream-border)' : 'none',
              }}>
                <div style={{
                  fontFamily: "'Funnel Display', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(40px, 5vw, 60px)',
                  color: 'var(--black)',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                }}>
                  <AnimatedCounter target={s.target} suffix={s.suffix} />
                </div>
                <div style={{ color: 'var(--gray)', fontSize: 14, marginTop: 6, fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. DYSCYPLINY ===== */}
      <section className="section-white" style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 60, alignItems: 'center' }}>
            <div className="reveal">
              <span className="section-label">Dyscypliny</span>
              <h2 style={{ marginBottom: 20 }}>Wybierz swoją dyscyplinę</h2>
              <p style={{ color: 'var(--gray)', lineHeight: 1.7, marginBottom: 28 }}>
                Od biegania ulicznego przez ekstremalne przeszkodówki po triathlon — mamy zawody dla każdego poziomu i gustu sportowego.
              </p>
              <Link to="/kalendarz" style={{ color: 'var(--orange)', fontWeight: 600, fontSize: 15 }}>
                Zobacz pełny kalendarz →
              </Link>
            </div>
            <div className="reveal d1" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 12,
            }}>
              {SPORTS.map((s, i) => {
                const count = bySport[s.type] || 0;
                const color = getSportColor(s.type);
                return (
                  <div
                    key={s.type}
                    onClick={() => navigate(`/kalendarz?sport_type=${s.type}`)}
                    style={{
                      background: 'var(--cream)', borderRadius: 'var(--r-xl)',
                      border: '2px solid transparent', padding: '20px 16px',
                      cursor: 'pointer', transition: 'all 0.2s var(--ease)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = color;
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.background = 'var(--cream)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <SportIcon type={s.type} size={32} />
                    <div style={{ fontWeight: 700, fontSize: 15, marginTop: 10, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ color: 'var(--gray)', fontSize: 13 }}>{count} startów</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4. POLECANE STARTY ===== */}
      <section className="section-cream" style={{ padding: '100px 0' }}>
        <div className="container">
          <div className="reveal" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 40 }}>
            <h2>Polecane starty</h2>
            <Link to="/kalendarz" style={{ color: 'var(--orange)', fontWeight: 600, fontSize: 15 }}>
              Wszystkie starty →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {displayedFeatured.map((ev, i) => (
              <div key={ev.id} className={`reveal d${Math.min(i + 1, 4)}`}>
                <EventCard event={ev} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. NUMEROWANA LISTA ===== */}
      <section className="section-white" style={{ padding: '100px 0' }}>
        <div className="container">
          <div className="reveal" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 60, flexWrap: 'wrap', gap: 20 }}>
            <h2 style={{ textTransform: 'uppercase' }}>
              Nadchodzące<br/>
              <span style={{ color: 'var(--orange)' }}>starty</span>
            </h2>
            <Link to="/kalendarz" style={{ color: 'var(--orange)', fontWeight: 600, fontSize: 15, alignSelf: 'flex-end' }}>
              Pełny kalendarz →
            </Link>
          </div>
          <div>
            {displayedUpcoming.slice(0, 8).map((ev, i) => {
              const color = getSportColor(ev.sport_type);
              return (
                <div
                  key={ev.id || i}
                  className="reveal"
                  onClick={() => navigate(`/event/${ev.slug}`)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '52px 60px 1fr auto auto auto',
                    gap: 16, alignItems: 'center',
                    padding: '16px 0', borderBottom: '1px solid var(--cream-border)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--cream)';
                    e.currentTarget.style.paddingLeft = '8px';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  <span style={{
                    fontFamily: "'Funnel Display', sans-serif", fontWeight: 800,
                    fontSize: 18, color: 'var(--cream-border)', letterSpacing: '-0.02em',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{
                    width: 56, height: 56, borderRadius: 12,
                    background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <SportIcon type={ev.sport_type} size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{ev.name}</div>
                    <div style={{ color: 'var(--gray)', fontSize: 13 }}>{ev.city}</div>
                  </div>
                  <span className="sport-badge" style={{ background: `${color}15`, color }}>
                    {getSportLabel(ev.sport_type)}
                  </span>
                  <span style={{ color: 'var(--gray)', fontSize: 13, whiteSpace: 'nowrap' }}>
                    {new Date(ev.date_start).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 700 }}>{ev.price ? `${ev.price} zł` : '-'}</span>
                    <span style={{ color: 'var(--orange)', fontWeight: 600 }}>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 6. CTA SPLIT ===== */}
      <section className="section-dark" style={{ padding: 0 }}>
        <div className="container" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 460 }}>
            {/* Left */}
            <div style={{ background: '#0A0A0A', padding: '60px 60px 60px 40px' }}>
              <span className="section-label">Dołącz do nas</span>
              <h2 style={{ color: 'white', marginBottom: 16 }}>
                Dołącz do tysięcy aktywnych Polaków
              </h2>
              <p style={{ color: 'var(--gray)', marginBottom: 32 }}>
                Bądź na bieżąco z nowymi startami, poradnikami i newsami ze świata sportu.
              </p>
              {newsletterDone ? (
                <p style={{ color: '#FF5C00', fontWeight: 600, fontSize: 16 }}>Zapisano! Dziękujemy. 🎉</p>
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
            {/* Right */}
            <div style={{
              background: 'linear-gradient(135deg, #1a0a00, #0a0a1a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', position: 'relative',
            }}>
              <span style={{
                fontFamily: "'Funnel Display', sans-serif", fontWeight: 800,
                fontSize: 'clamp(80px, 12vw, 160px)', color: 'rgba(255,92,0,0.08)',
                letterSpacing: '-0.05em', userSelect: 'none', lineHeight: 1,
              }}>
                74K+
              </span>
              <div style={{ position: 'absolute', bottom: 40, right: 40, textAlign: 'right' }}>
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>aktywnych użytkowników</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 7. ARTYKUŁY ===== */}
      <section className="section-cream" style={{ padding: '100px 0' }}>
        <div className="container">
          <div className="reveal" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 40 }}>
            <h2>Poradniki sportowe</h2>
            <Link to="/artykuly" style={{ color: 'var(--orange)', fontWeight: 600, fontSize: 15 }}>
              Wszystkie artykuły →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {displayedArticles.map((art, i) => {
              const color = getSportColor(art.sport_type);
              return (
                <div
                  key={art.id}
                  className={`reveal d${i + 1}`}
                  onClick={() => navigate(`/artykuly/${art.slug}`)}
                  style={{
                    background: 'white', borderRadius: 'var(--r-xl)', overflow: 'hidden',
                    border: '1px solid var(--cream-border)',
                    cursor: 'pointer', transition: 'transform 0.3s var(--ease), box-shadow 0.3s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    height: 160,
                    background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <SportIcon type={art.sport_type} size={48} />
                  </div>
                  <div style={{ padding: 24 }}>
                    <span className="sport-badge" style={{ background: `${color}15`, color, marginBottom: 12 }}>
                      {getSportLabel(art.sport_type)}
                    </span>
                    <h3 style={{ fontSize: 18, marginBottom: 10, marginTop: 12 }}>{art.title}</h3>
                    <p style={{ color: 'var(--gray)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                      {art.excerpt}
                    </p>
                    <span style={{ color: 'var(--orange)', fontWeight: 600, fontSize: 14 }}>Czytaj dalej →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
