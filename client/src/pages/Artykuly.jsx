import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useReveal } from '../hooks/useReveal';
import SportIcon, { getSportColor, getSportLabel } from '../components/SportIcon';
import { SPORTS_MAIN } from '../constants';
import { formatDatePL } from '../utils';

function Artykuly() {
  useReveal();
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
          <div className="sport-pills">
            <button
              className={`sport-pill ${!filter ? 'active' : ''}`}
              style={!filter ? { background: 'var(--orange)', border: 'none', color: 'white' } : {}}
              onClick={() => setFilter('')}
            >
              Wszystkie
            </button>
            {SPORTS_MAIN.map(s => {
              const color = getSportColor(s.type);
              const active = filter === s.type;
              return (
                <button
                  key={s.type}
                  className={`sport-pill ${active ? 'active' : ''}`}
                  style={active ? { background: color } : {}}
                  onClick={() => setFilter(active ? '' : s.type)}
                >
                  <SportIcon type={s.type} size={12} color={active ? 'white' : color} />
                  {s.label}
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
            <div className="center-content">
              <div className="loading-spinner" />
            </div>
          ) : articles.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: 18 }}>Brak artykułów dla tej dyscypliny</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {articles.map((art, i) => {
                const color = getSportColor(art.sport_type);
                return (
                  <Link
                    key={art.id}
                    to={`/artykuly/${art.slug}`}
                    className={`reveal d${Math.min(i % 3 + 1, 3)} article-card`}
                  >
                    <div className="article-card-thumb" style={{
                      height: 180,
                      background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                    }}>
                      {art.image_url ? (
                        <img src={art.image_url} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <SportIcon type={art.sport_type} size={56} />
                      )}
                    </div>
                    <div className="article-card-body">
                      <span className="sport-badge" style={{ background: `${color}15`, color, marginBottom: 12 }}>
                        {getSportLabel(art.sport_type)}
                      </span>
                      <h3 style={{ fontSize: 20, lineHeight: 1.3, marginTop: 10, marginBottom: 12 }}>{art.title}</h3>
                      {art.excerpt && (
                        <p className="article-card-excerpt">{art.excerpt}</p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--gray)', fontSize: 12 }}>
                          {art.author_name} · {formatDatePL(art.created_at)}
                        </span>
                        <span className="article-card-link">Czytaj →</span>
                      </div>
                    </div>
                  </Link>
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
