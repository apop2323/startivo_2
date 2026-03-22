import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useReveal } from '../hooks/useReveal';
import SportIcon, { getSportColor, getSportLabel } from '../components/SportIcon';

const SPORTS = ['running','hyrox','ocr','triathlon','cycling','trail'];

function Artykuly() {
  useReveal();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams({ status: 'published', limit: 30 });
    if (filter) params.set('sport_type', filter);
    fetch(`/api/articles?${params}`)
      .then(r => r.json())
      .then(d => { setArticles(d.articles || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  return (
    <>
      <Helmet>
        <title>Poradniki sportowe | Startivo</title>
        <meta name="description" content="Poradniki sportowe, wskazówki treningowe i wszystko o zawodach sportowych w Polsce — Hyrox, OCR, Triathlon, Bieganie." />
      </Helmet>

      <div className="page-header">
        <div className="container">
          <span className="section-label">Wiedza</span>
          <h1 style={{ color: 'white' }}>Poradniki<br/>sportowe</h1>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#0D0D0D', paddingBottom: 32 }}>
        <div className="container" style={{ paddingTop: 24 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('')}
              style={{
                padding: '7px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer',
                background: !filter ? 'var(--orange)' : 'rgba(255,255,255,0.07)',
                border: 'none',
                color: !filter ? 'white' : 'rgba(255,255,255,0.6)',
                fontWeight: 500,
              }}
            >
              Wszystkie
            </button>
            {SPORTS.map(s => {
              const color = getSportColor(s);
              const active = filter === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(active ? '' : s)}
                  style={{
                    padding: '7px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer',
                    background: active ? color : 'rgba(255,255,255,0.07)',
                    border: 'none',
                    color: active ? 'white' : 'rgba(255,255,255,0.6)',
                    fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <SportIcon type={s} size={12} color={active ? 'white' : color} />
                  {getSportLabel(s)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Articles */}
      <div style={{ background: 'var(--cream)', padding: '60px 0 100px' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div className="loading-spinner" />
            </div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray)' }}>
              <p style={{ fontSize: 18 }}>Brak artykułów dla tej dyscypliny</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {articles.map((art, i) => {
                const color = getSportColor(art.sport_type);
                return (
                  <div
                    key={art.id}
                    className={`reveal d${Math.min(i % 3 + 1, 3)}`}
                    onClick={() => navigate(`/artykuly/${art.slug}`)}
                    style={{
                      background: 'white', borderRadius: 'var(--r-xl)', overflow: 'hidden',
                      border: '1px solid var(--cream-border)', cursor: 'pointer',
                      transition: 'transform 0.3s var(--ease), box-shadow 0.3s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{
                      height: 180, background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {art.image_url ? (
                        <img src={art.image_url} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <SportIcon type={art.sport_type} size={56} />
                      )}
                    </div>
                    <div style={{ padding: 24 }}>
                      <span className="sport-badge" style={{ background: `${color}15`, color, marginBottom: 12 }}>
                        {getSportLabel(art.sport_type)}
                      </span>
                      <h3 style={{ fontSize: 20, lineHeight: 1.3, marginTop: 10, marginBottom: 12 }}>{art.title}</h3>
                      {art.excerpt && (
                        <p style={{ color: 'var(--gray)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                          {art.excerpt}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--gray)', fontSize: 12 }}>
                          {art.author_name} · {new Date(art.created_at).toLocaleDateString('pl-PL')}
                        </span>
                        <span style={{ color, fontWeight: 600, fontSize: 14 }}>Czytaj →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Artykuly;
