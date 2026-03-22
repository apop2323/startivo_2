import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import SportIcon, { getSportColor, getSportLabel } from '../components/SportIcon';

const STORAGE_KEY = 'startivo_my_events';

function MojeStarty() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setSaved(ids);

    if (ids.length > 0) {
      setLoading(true);
      fetch(`/api/events?limit=100`)
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
    const updated = saved.filter(s => s !== id);
    setSaved(updated);
    setEvents(ev => ev.filter(e => e.id !== id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div className="loading-spinner" />
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🏅</div>
              <h2 style={{ marginBottom: 12 }}>Brak zapisanych startów</h2>
              <p style={{ color: 'var(--gray)', maxWidth: 400, margin: '0 auto 32px' }}>
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
                    <div
                      key={ev.id}
                      style={{
                        background: 'white', borderRadius: 'var(--r-xl)', padding: '20px 24px',
                        border: '1px solid var(--cream-border)',
                        display: 'grid', gridTemplateColumns: '56px 1fr auto auto', gap: 16, alignItems: 'center',
                      }}
                    >
                      <div style={{
                        width: 56, height: 56, borderRadius: 12,
                        background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <SportIcon type={ev.sport_type} size={24} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{ev.name}</div>
                        <div style={{ color: 'var(--gray)', fontSize: 13 }}>
                          {ev.city} · {new Date(ev.date_start).toLocaleDateString('pl-PL')}
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
                        style={{ color: '#ccc', fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                        onClick={() => remove(ev.id)}
                        title="Usuń z listy"
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
