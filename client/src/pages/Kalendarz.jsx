import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useReveal } from '../hooks/useReveal';
import SportIcon, { getSportColor } from '../components/SportIcon';
import EventCard from '../components/EventCard';
import { SPORTS, VOIVODESHIPS } from '../constants';

function Kalendarz() {
  useReveal();
  const [searchParams] = useSearchParams();

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

  const clearFilters = () => {
    setSportType('');
    setVoivodeship('');
    setSearch('');
    setDateFrom('');
    setDateTo('');
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
          <p className="section-label">Kalendarz 2026</p>
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
              {SPORTS.map(s => <option key={s.type} value={s.type}>{s.label}</option>)}
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
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field dark" style={{ minWidth: 140 }} />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field dark" style={{ minWidth: 140 }} />
            <button type="submit" className="btn-primary">Szukaj →</button>
          </form>

          {/* Sport pills */}
          <div className="sport-pills">
            <button
              className={`sport-pill ${!sportType ? 'active' : ''}`}
              style={!sportType ? { background: 'var(--orange)', border: 'none', color: 'white' } : {}}
              onClick={() => setSportType('')}
            >
              Wszystkie
            </button>
            {SPORTS.map(s => {
              const color = getSportColor(s.type);
              const active = sportType === s.type;
              return (
                <button
                  key={s.type}
                  className={`sport-pill ${active ? 'active' : ''}`}
                  style={active ? { background: color } : {}}
                  onClick={() => setSportType(active ? '' : s.type)}
                >
                  <SportIcon type={s.type} size={12} color={active ? 'white' : color} />
                  {s.label}
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
            <div className="center-content">
              <div className="loading-spinner" />
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: 18, marginBottom: 12 }}>Brak wyników dla podanych filtrów</p>
              <button onClick={clearFilters} className="btn-outline">
                Wyczyść filtry
              </button>
            </div>
          ) : (
            <>
              <div className="event-grid">
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
