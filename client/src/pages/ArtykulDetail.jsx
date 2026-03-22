import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SportIcon, { getSportColor, getSportLabel } from '../components/SportIcon';

function ArtykulDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(d => { setArticle(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner" />
    </div>
  );

  if (!article) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
      <h2>Artykuł nie znaleziony</h2>
      <button className="btn-primary" onClick={() => navigate('/artykuly')}>← Wróć do artykułów</button>
    </div>
  );

  const color = getSportColor(article.sport_type);

  // Simple markdown-like rendering
  const renderContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} style={{ marginTop: 32, marginBottom: 16 }}>{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} style={{ marginTop: 40, marginBottom: 20, fontSize: 'clamp(28px, 4vw, 40px)' }}>{line.slice(2)}</h1>;
      if (line.startsWith('### ')) return <h3 key={i} style={{ marginTop: 24, marginBottom: 12 }}>{line.slice(4)}</h3>;
      if (line.startsWith('- ')) return <li key={i} style={{ marginLeft: 20, marginBottom: 6, color: '#333' }}>{line.slice(2)}</li>;
      if (line.match(/^\d+\./)) return <li key={i} style={{ marginLeft: 20, marginBottom: 6, color: '#333' }}>{line.replace(/^\d+\.\s*/, '')}</li>;
      if (line === '') return <br key={i} />;
      return <p key={i} style={{ marginBottom: 12, lineHeight: 1.8, color: '#333' }}>{line}</p>;
    });
  };

  return (
    <>
      <Helmet>
        <title>{article.title} | Startivo</title>
        <meta name="description" content={article.excerpt || article.title} />
      </Helmet>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${color}22 0%, #0D0D0D 60%)`,
        padding: '120px 0 60px',
      }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <button
            onClick={() => navigate('/artykuly')}
            style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, fontSize: 14 }}
          >
            ← Wszystkie artykuły
          </button>
          <span className="sport-badge" style={{ background: `${color}22`, color, marginBottom: 16, display: 'inline-flex' }}>
            <SportIcon type={article.sport_type} size={14} />
            {getSportLabel(article.sport_type)}
          </span>
          <h1 style={{ color: 'white', fontSize: 'clamp(28px, 5vw, 56px)', marginTop: 12 }}>
            {article.title}
          </h1>
          <div style={{ display: 'flex', gap: 16, marginTop: 24, color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            <span>{article.author_name || 'Redakcja Startivo'}</span>
            <span>·</span>
            <span>{new Date(article.created_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ background: 'var(--cream)', padding: '60px 0 100px' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          {article.excerpt && (
            <div style={{
              background: `${color}11`, border: `1px solid ${color}33`,
              borderRadius: 'var(--r-lg)', padding: '20px 24px', marginBottom: 40,
              fontSize: 17, color: '#444', lineHeight: 1.7,
            }}>
              {article.excerpt}
            </div>
          )}

          <div style={{
            background: 'white', borderRadius: 'var(--r-xl)', padding: 40,
            border: '1px solid var(--cream-border)',
          }}>
            {renderContent(article.content)}
          </div>
        </div>
      </div>
    </>
  );
}

export default ArtykulDetail;
