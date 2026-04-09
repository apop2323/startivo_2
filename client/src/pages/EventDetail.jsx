import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SportIcon, { getSportColor, getSportLabel } from '../components/SportIcon';
import { formatDateLongPL, formatDatePL, toggleSavedEvent, isEventSaved, getDifficultyLabel } from '../utils';
import { MY_EVENTS_STORAGE_KEY } from '../constants';

function EventDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertDone, setAlertDone] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/events/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(d => {
        setEvent(d);
        setSaved(isEventSaved(d.id, MY_EVENTS_STORAGE_KEY));
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
    } catch {}
    setAlertDone(true);
  };

  const handleToggleSave = () => {
    if (!event) return;
    toggleSavedEvent(event.id, MY_EVENTS_STORAGE_KEY);
    setSaved(s => !s);
  };

  if (loading) return (
    <div className="center-content">
      <div className="loading-spinner" />
    </div>
  );

  if (!event) return (
    <div className="center-content">
      <h2>Wydarzenie nie znalezione</h2>
      <p style={{ color: 'var(--gray)' }}>Mogło zostać usunięte lub adres URL jest nieprawidłowy.</p>
      <button className="btn-primary" onClick={() => navigate('/kalendarz')}>← Wróć do kalendarza</button>
    </div>
  );

  const color = getSportColor(event.sport_type);
  const dateStr = formatDateLongPL(event.date_start);

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

  const infoItems = [
    { icon: '\u{1F4C5}', label: 'Data', value: dateStr },
    { icon: '\u{1F4CD}', label: 'Miasto', value: `${event.city}, ${event.voivodeship}` },
    event.distance && { icon: '\u{1F4CF}', label: 'Dystans', value: event.distance },
    event.price !== null && { icon: '\u{1F4B0}', label: 'Cena', value: event.price ? `${event.price} zł` : 'Bezpłatne' },
    event.max_participants && { icon: '\u{1F465}', label: 'Max uczestników', value: event.max_participants },
    event.registration_deadline && { icon: '\u{23F0}', label: 'Zapisy do', value: formatDatePL(event.registration_deadline) },
  ].filter(Boolean);

  return (
    <>
      <Helmet>
        <title>{event.name} — {event.city} | Startivo</title>
        <meta name="description" content={`${event.name} — ${dateStr}, ${event.city}. ${event.description ? event.description.slice(0, 150) : ''}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <div className="event-detail-hero" style={{ background: `linear-gradient(135deg, ${color}22 0%, #0D0D0D 60%)` }}>
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>← Wróć</button>
          <div className="event-detail-badges">
            <span className="sport-badge" style={{ background: `${color}22`, color, fontSize: 13 }}>
              <SportIcon type={event.sport_type} size={14} />
              {getSportLabel(event.sport_type)}
            </span>
            {event.difficulty && (
              <span className="event-detail-tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                {getDifficultyLabel(event.difficulty)}
              </span>
            )}
            {event.featured && (
              <span className="event-detail-tag" style={{ background: 'rgba(255,92,0,0.2)', color: '#FF5C00' }}>
                ★ Polecane
              </span>
            )}
          </div>
          <h1 style={{ color: 'white', fontSize: 'clamp(32px, 6vw, 72px)' }}>{event.name}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="event-detail-content">
        <div className="container">
          <div className="event-detail-layout">
            {/* Main */}
            <div>
              <div className="event-info-grid">
                {infoItems.map((item, i) => (
                  <div key={i} className="event-info-card">
                    <div className="event-info-icon">{item.icon}</div>
                    <div className="event-info-label">{item.label}</div>
                    <div className="event-info-value">{item.value}</div>
                  </div>
                ))}
              </div>

              {event.description && (
                <div className="event-section-card">
                  <h3 style={{ marginBottom: 16 }}>O zawodach</h3>
                  <div className="event-description">{event.description}</div>
                </div>
              )}

              {event.organizer_name && (
                <div className="event-section-card" style={{ padding: 24 }}>
                  <h3 style={{ marginBottom: 12, fontSize: 18 }}>Organizator</h3>
                  <p style={{ fontWeight: 600 }}>{event.organizer_name}</p>
                  {event.organizer_email && (
                    <p style={{ color: 'var(--gray)', fontSize: 14, marginTop: 4 }}>{event.organizer_email}</p>
                  )}
                  {event.event_website && (
                    <a href={event.event_website} target="_blank" rel="noopener noreferrer"
                      className="section-link" style={{ display: 'block', marginTop: 8, fontSize: 14 }}>
                      Strona wydarzenia →
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="event-sidebar">
              {/* CTA card */}
              <div className="event-sidebar-card">
                <div className="event-sidebar-price">
                  {event.price ? `${event.price} zł` : 'Bezpłatne'}
                </div>
                <div className="event-sidebar-deadline">
                  {event.registration_deadline
                    ? `Zapisy do ${formatDatePL(event.registration_deadline)}`
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

              {/* Save button */}
              <button
                className={`save-btn ${saved ? 'saved' : ''}`}
                onClick={handleToggleSave}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                {saved ? 'Zapisano w Moich startach' : 'Zapisz w Moich startach'}
              </button>

              {/* Alert form */}
              <div className="event-reminder-card">
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>Przypomnij mi</h3>
                <p style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 16 }}>
                  Wyślemy Ci przypomnienie 7 dni przed startem.
                </p>
                {alertDone ? (
                  <p className="alert-success">Ustawiono przypomnienie!</p>
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
