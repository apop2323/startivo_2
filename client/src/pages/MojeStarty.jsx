import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import SportIcon, { getSportColor } from '../components/SportIcon';
import { formatDatePL, toggleSavedEvent } from '../utils';
import { MY_EVENTS_STORAGE_KEY } from '../constants';

function MojeStarty() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem(MY_EVENTS_STORAGE_KEY) || '[]');
    setSaved(ids);

    if (ids.length > 0) {
      setLoading(true);
      fetch('/api/events?limit=100')
        .then(r => r.json())
        .then(d => {
          const all = d.events || [];
          setEvents(all.filter(e => ids.includes(e.id)));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, []);

  const remove = (id) => {
    const updated = toggleSavedEvent(id, MY_EVENTS_STORAGE_KEY);
    setSaved(updated);
    setEvents(ev => ev.filter(e => e.id !== id));
  };

  return (
    <>
      <Helmet>
        <title>Moje starty | Startivo</title>
        <meta name="description" content="Twoje zapisane starty i wydarzenia sportowe na Startivo." />
      </Helmet>

      <div className="page-header">
        <div className="container">
          <span className="section-label">Profil</span>
          <h1 style={{ color: 'white' }}>Moje<br/>starty</h1>
        </div>
      </div>

      <div style={{ background: 'var(--cream)', padding: '60px 0 100px', minHeight: '50vh' }}>
        <div className="container">
          {loading ? (
            <div className="center-content">
              <div className="loading-spinner" />
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">{'\u{1F3C5}'}</div>
              <h2 style={{ marginBottom: 12 }}>Brak zapisanych startów</h2>
              <p>
                Przeglądaj kalendarz i zapisuj interesujące Cię zawody — znajdziesz je tutaj.
              </p>
              <button className="btn-primary" onClick={() => navigate('/kalendarz')}>
                Przeglądaj kalendarz →
              </button>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 32 }}>
                Zapisane: <strong>{events.length}</strong> wydarzeń
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {events.map(ev => {
                  const color = getSportColor(ev.sport_type);
                  return (
                    <div key={ev.id} className="my-starts-item">
                      <div className="upcoming-icon" style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)` }}>
                        <SportIcon type={ev.sport_type} size={24} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{ev.name}</div>
                        <div style={{ color: 'var(--gray)', fontSize: 13 }}>
                          {ev.city} · {formatDatePL(ev.date_start)}
                          {ev.price ? ` · ${ev.price} zł` : ''}
                        </div>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ fontSize: 13, padding: '8px 16px' }}
                        onClick={() => navigate(`/event/${ev.slug}`)}
                      >
                        Zobacz
                      </button>
                      <button
                        className="my-starts-remove"
                        onClick={() => remove(ev.id)}
                        title="Usuń z listy"
                        aria-label="Usuń z listy"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default MojeStarty;
