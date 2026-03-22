import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SportIcon, { getSportColor, getSportLabel } from '../components/SportIcon';

function EventDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertDone, setAlertDone] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/events/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(d => {
        setEvent(d);
        setLoading(false);
        fetch(`/api/events/${d.id}/view`, { method: 'POST' }).catch(() => {});
      })
      .catch(() => { setLoading(false); });
  }, [slug]);

  const handleAlert = async (e) => {
    e.preventDefault();
    if (!alertEmail || !event) return;
    try {
      await fetch(`/api/events/${event.id}/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: alertEmail })
      });
      setAlertDone(true);
    } catch {
      setAlertDone(true);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner" />
    </div>
  );

  if (!event) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 40 }}>
      <h2>Wydarzenie nie znalezione</h2>
      <p style={{ color: 'var(--gray)' }}>Mogło zostać usunięte lub adres URL jest nieprawidłowy.</p>
      <button className="btn-primary" onClick={() => navigate('/kalendarz')}>← Wróć do kalendarza</button>
    </div>
  );

  const color = getSportColor(event.sport_type);
  const dateStr = event.date_start
    ? new Date(event.date_start).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": event.name,
    "startDate": event.date_start,
    "endDate": event.date_end || event.date_start,
    "location": {
      "@type": "Place",
      "name": event.city,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.city,
        "addressRegion": event.voivodeship,
        "addressCountry": "PL"
      }
    },
    "description": event.description,
    "url": `https://startivo.pl/event/${event.slug}`,
    "organizer": event.organizer_name ? {
      "@type": "Organization",
      "name": event.organizer_name
    } : undefined
  };

  return (
    <>
      <Helmet>
        <title>{event.name} — {event.city} | Startivo</title>
        <meta name="description" content={`${event.name} — ${dateStr}, ${event.city}. ${event.description ? event.description.slice(0, 150) : ''}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <div style={{
        minHeight: 400, background: `linear-gradient(135deg, ${color}22 0%, #0D0D0D 60%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '120px 0 60px',
      }}>
        <div className="container">
          <button
            onClick={() => navigate(-1)}
            style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, fontSize: 14 }}
          >
            ← Wróć
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span className="sport-badge" style={{ background: `${color}22`, color, fontSize: 13 }}>
              <SportIcon type={event.sport_type} size={14} />
              {getSportLabel(event.sport_type)}
            </span>
            {event.difficulty && (
              <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                {event.difficulty}
              </span>
            )}
            {event.featured && (
              <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, background: 'rgba(255,92,0,0.2)', color: '#FF5C00', fontWeight: 600 }}>
                ★ Polecane
              </span>
            )}
          </div>
          <h1 style={{ color: 'white', fontSize: 'clamp(32px, 6vw, 72px)' }}>{event.name}</h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ background: 'var(--cream)', padding: '60px 0 100px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40, alignItems: 'start' }}>
            {/* Main */}
            <div>
              {/* Key info row */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 16, marginBottom: 40,
              }}>
                {[
                  { icon: '📅', label: 'Data', value: dateStr },
                  { icon: '📍', label: 'Miasto', value: `${event.city}, ${event.voivodeship}` },
                  event.distance && { icon: '📏', label: 'Dystans', value: event.distance },
                  event.price !== null && { icon: '💰', label: 'Cena', value: event.price ? `${event.price} zł` : 'Bezpłatne' },
                  event.max_participants && { icon: '👥', label: 'Max uczestników', value: event.max_participants },
                  event.registration_deadline && { icon: '⏰', label: 'Zapisy do', value: new Date(event.registration_deadline).toLocaleDateString('pl-PL') },
                ].filter(Boolean).map((item, i) => (
                  <div key={i} style={{
                    background: 'white', borderRadius: 'var(--r-lg)', padding: '16px 20px',
                    border: '1px solid var(--cream-border)',
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {event.description && (
                <div style={{ background: 'white', borderRadius: 'var(--r-xl)', padding: 32, border: '1px solid var(--cream-border)', marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 16 }}>O zawodach</h3>
                  <div style={{ color: '#333', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {event.description}
                  </div>
                </div>
              )}

              {/* Organizer */}
              {event.organizer_name && (
                <div style={{ background: 'white', borderRadius: 'var(--r-xl)', padding: 24, border: '1px solid var(--cream-border)' }}>
                  <h3 style={{ marginBottom: 12, fontSize: 18 }}>Organizator</h3>
                  <p style={{ fontWeight: 600 }}>{event.organizer_name}</p>
                  {event.organizer_email && (
                    <p style={{ color: 'var(--gray)', fontSize: 14, marginTop: 4 }}>{event.organizer_email}</p>
                  )}
                  {event.event_website && (
                    <a href={event.event_website} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--orange)', fontSize: 14, fontWeight: 600, display: 'block', marginTop: 8 }}>
                      Strona wydarzenia →
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ position: 'sticky', top: 100 }}>
              {/* CTA card */}
              <div style={{
                background: 'white', borderRadius: 'var(--r-xl)', padding: 28,
                border: '1px solid var(--cream-border)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: 16,
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Funnel Display', sans-serif", marginBottom: 4 }}>
                  {event.price ? `${event.price} zł` : 'Bezpłatne'}
                </div>
                <div style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 20 }}>
                  {event.registration_deadline
                    ? `Zapisy do ${new Date(event.registration_deadline).toLocaleDateString('pl-PL')}`
                    : 'Sprawdź dostępność'}
                </div>
                {event.registration_url ? (
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ display: 'block', textAlign: 'center', width: '100%' }}
                  >
                    Zapisz się na zawody →
                  </a>
                ) : (
                  <div style={{ color: 'var(--gray)', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>
                    Rejestracja niedostępna
                  </div>
                )}
              </div>

              {/* Alert form */}
              <div style={{
                background: 'white', borderRadius: 'var(--r-xl)', padding: 24,
                border: '1px solid var(--cream-border)',
              }}>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>Przypomnij mi</h3>
                <p style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 16 }}>
                  Wyślemy Ci przypomnienie 7 dni przed startem.
                </p>
                {alertDone ? (
                  <p style={{ color: 'var(--orange)', fontWeight: 600, fontSize: 14 }}>Ustawiono przypomnienie!</p>
                ) : (
                  <form onSubmit={handleAlert} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="email"
                      placeholder="twój@email.pl"
                      value={alertEmail}
                      onChange={e => setAlertEmail(e.target.value)}
                      className="input-field"
                      required
                    />
                    <button type="submit" className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                      Ustaw przypomnienie
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EventDetail;
