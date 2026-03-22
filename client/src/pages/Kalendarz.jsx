import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useReveal } from '../hooks/useReveal';
import SportIcon, { getSportColor, getSportLabel } from '../components/SportIcon';

const SPORTS = ['running','hyrox','ocr','triathlon','cycling','trail','other'];
const VOIVODESHIPS = [
  'dolnośląskie','kujawsko-pomorskie','lubelskie','lubuskie','łódzkie',
  'małopolskie','mazowieckie','opolskie','podkarpackie','podlaskie',
  'pomorskie','śląskie','świętokrzyskie','warmińsko-mazurskie','wielkopolskie','zachodniopomorskie'
];
const SPORT_LABELS = { running:'Bieganie', hyrox:'Hyrox', ocr:'OCR', triathlon:'Triathlon', cycling:'Kolarstwo', trail:'Trail', other:'Inne' };

function countdownLabel(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Zakończone';
  if (diff === 0) return 'Dziś!';
  if (diff < 7) return `${diff} dni`;
  return `${Math.ceil(diff/30)} mies.`;
}

function EventCard({ event }) {
  const navigate = useNavigate();
  const color = getSportColor(event.sport_type);
  return (
    <div
      className="event-card"
      onClick={() => navigate(`/event/${event.slug}`)}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div
        className="event-card-thumb"
        style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)` }}
      >
        <span className="sport-badge" style={{ background: `${color}22`, color }}>
          <SportIcon type={event.sport_type} size={12} />
          {getSportLabel(event.sport_type)}
        </span>
        <span className="countdown-badge">{countdownLabel(event.date_start)}</span>
      </div>
      <div className="event-card-body" style={{ flex: 1 }}>
        <div className="event-card-name">{event.name}</div>
        <div className="event-card-meta">
          <span>{new Date(event.date_start).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>{event.city}</span>
          {event.distance && <span>{event.distance}</span>}
        </div>
        {event.difficulty && (
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 100,
            background: 'var(--cream)', color: 'var(--gray)', fontWeight: 600,
          }}>
            {event.difficulty}
          </span>
        )}
      </div>
      <div className="event-card-footer">
        <span className="event-price">{event.price ? `${event.price} zł` : 'Bezpłatne'}</span>
        <button style={{ color, fontWeight: 600, fontSize: 13 }}>Zobacz →</button>
      </div>
    </div>
  );
}

function Kalendarz() {
  useReveal();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sportType, setSportType] = useState(searchParams.get('sport_type') || '');
  const [voivodeship, setVoivodeship] = useState(searchParams.get('voivodeship') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 12;

  const fetchEvents = async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit });
    if (search) params.set('search', search);
    if (sportType) params.set('sport_type', sportType);
    if (voivodeship) params.set('voivodeship', voivodeship);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    try {
      const r = await fetch(`/api/events?${params}`);
      const d = await r.json();
      setEvents(p === 1 ? (d.events || []) : prev => [...prev, ...(d.events || [])]);
      setTotal(d.total || 0);
      setPage(p);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents(1);
  }, [sportType, voivodeship]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents(1);
  };

  return (
    <>
      <Helmet>
        <title>Kalendarz startów sportowych Polska 2026 | Startivo</title>
        <meta name="description" content="Pełny kalendarz zawodów sportowych w Polsce 2026. Biegi, Hyrox, OCR, Triathlon — filtruj po dyscyplinie, województwie i dacie." />
      </Helmet>

      {/* Header */}
      <div className="page-header">
        <div className="container">
          <p className="section-label" style={{ color: 'var(--orange)' }}>Kalendarz 2026</p>
          <h1 style={{ color: 'white' }}>Wszystkie<br/>starty</h1>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#0D0D0D', paddingBottom: 40 }}>
        <div className="container">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 24 }}>
            <input
              type="text"
              placeholder="Szukaj zawodów..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field dark"
              style={{ flex: 1, minWidth: 200 }}
            />
            <select
              value={sportType}
              onChange={e => setSportType(e.target.value)}
              className="input-field dark"
              style={{ minWidth: 140 }}
            >
              <option value="">Wszystkie dyscypliny</option>
              {SPORTS.map(s => <option key={s} value={s}>{SPORT_LABELS[s] || s}</option>)}
            </select>
            <select
              value={voivodeship}
              onChange={e => setVoivodeship(e.target.value)}
              className="input-field dark"
              style={{ minWidth: 170 }}
            >
              <option value="">Wszystkie województwa</option>
              {VOIVODESHIPS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="input-field dark"
              style={{ minWidth: 140 }}
              placeholder="Od"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="input-field dark"
              style={{ minWidth: 140 }}
              placeholder="Do"
            />
            <button type="submit" className="btn-primary">Szukaj →</button>
          </form>

          {/* Sport pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            <button
              onClick={() => setSportType('')}
              style={{
                padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: !sportType ? 'var(--orange)' : 'rgba(255,255,255,0.07)',
                border: !sportType ? 'none' : '1px solid rgba(255,255,255,0.12)',
                color: !sportType ? 'white' : 'rgba(255,255,255,0.6)',
              }}
            >
              Wszystkie
            </button>
            {SPORTS.map(s => {
              const color = getSportColor(s);
              const active = sportType === s;
              return (
                <button
                  key={s}
                  onClick={() => setSportType(active ? '' : s)}
                  style={{
                    padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    background: active ? color : 'rgba(255,255,255,0.07)',
                    border: active ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    color: active ? 'white' : 'rgba(255,255,255,0.6)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <SportIcon type={s} size={12} color={active ? 'white' : color} />
                  {SPORT_LABELS[s]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ background: 'var(--cream)', minHeight: '60vh', padding: '40px 0 80px' }}>
        <div className="container">
          <p style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 24 }}>
            Znaleziono <strong>{total}</strong> wydarzeń
          </p>

          {loading && events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="loading-spinner" />
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray)' }}>
              <p style={{ fontSize: 18, marginBottom: 12 }}>Brak wyników dla podanych filtrów</p>
              <button onClick={() => { setSportType(''); setVoivodeship(''); setSearch(''); fetchEvents(1); }}
                className="btn-outline">
                Wyczyść filtry
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {events.map(ev => <EventCard key={ev.id} event={ev} />)}
              </div>

              {events.length < total && (
                <div style={{ textAlign: 'center', marginTop: 48 }}>
                  <button
                    className="btn-outline"
                    onClick={() => fetchEvents(page + 1)}
                    disabled={loading}
                  >
                    {loading ? 'Ładowanie...' : `Załaduj więcej (${total - events.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Kalendarz;
