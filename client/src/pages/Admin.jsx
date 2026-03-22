import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';

const TOKEN_KEY = 'startivo_admin_token';
const SPORT_TYPES = ['running','hyrox','ocr','triathlon','cycling','trail','other'];
const SPORT_LABELS = { running:'Bieganie', hyrox:'Hyrox', ocr:'OCR', triathlon:'Triathlon', cycling:'Kolarstwo', trail:'Trail', other:'Inne' };

// ==================
// API HELPER
// ==================
function api(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`/api/admin${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Błąd serwera');
    return data;
  });
}

// ==================
// LOGIN SCREEN
// ==================
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (attempts >= 5) {
      setError('Zbyt wiele prób logowania. Poczekaj 15 minut.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }).then(async r => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Nieprawidłowe hasło');
        return d;
      });
      sessionStorage.setItem(TOKEN_KEY, data.token);
      onLogin(data.token);
    } catch (err) {
      setAttempts(a => a + 1);
      setError(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0D0D0D',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div
        className={shake ? 'shake' : ''}
        style={{
          background: '#111318', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: 40, width: '100%', maxWidth: 420,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ marginBottom: 12 }}>
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#FF5C00"/>
              <path d="M11 16L14 11L17 16L14 21L11 16Z" fill="white"/>
              <path d="M17 13L21 16L17 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <div style={{ fontFamily: "'Funnel Display', sans-serif", fontWeight: 800, color: 'white', fontSize: 24 }}>Startivo</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 }}>Panel administratora</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Hasło administratora"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field dark"
              required
              autoFocus
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
                fontSize: 16,
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {error && (
            <div style={{ color: '#ff6b6b', fontSize: 13, padding: '8px 12px', background: 'rgba(255,0,0,0.1)', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || attempts >= 5}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Logowanie...' : 'Zaloguj się →'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==================
// DASHBOARD
// ==================
function Dashboard({ token }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api('/stats', 'GET', null, token).then(setStats).catch(() => {});
  }, [token]);

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Przegląd</h2>
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Opublikowane eventy', val: stats.total_events, color: '#4A90E2' },
            { label: 'Oczekujące', val: stats.pending_events, color: '#FF5C00' },
            { label: 'Subskrybenci', val: stats.subscribers, color: '#4CAF50' },
            { label: 'Nowe zapytania', val: stats.new_inquiries, color: '#E25C5C' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#111318', borderRadius: 12, padding: '20px 24px',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: "'Funnel Display', sans-serif", fontWeight: 800, fontSize: 36, color: s.color }}>
                {s.val}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================
// EVENTS TAB (pending)
// ==================
function PendingEvents({ token, onUpdate }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api('/events?status=pending', 'GET', null, token)
      .then(d => { setEvents(d.events || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    await api(`/events/${id}/approve`, 'POST', null, token);
    load();
    onUpdate();
  };

  const reject = async (id) => {
    if (!window.confirm('Odrzucić to wydarzenie?')) return;
    await api(`/events/${id}/reject`, 'POST', null, token);
    load();
    onUpdate();
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Oczekujące ({events.length})</h2>
      {loading ? (
        <div className="loading-spinner" />
      ) : events.length === 0 ? (
        <div style={{ color: 'rgba(255,255,255,0.4)', padding: '40px 0', textAlign: 'center' }}>
          Brak oczekujących wydarzeń. 🎉
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map(ev => (
            <div key={ev.id} style={{
              background: '#111318', borderRadius: 12, padding: '16px 20px',
              border: '1px solid rgba(255,255,255,0.07)',
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 700, color: 'white', marginBottom: 4 }}>{ev.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                  {ev.city} · {SPORT_LABELS[ev.sport_type] || ev.sport_type} · {new Date(ev.date_start).toLocaleDateString('pl-PL')}
                  {ev.organizer_name && ` · ${ev.organizer_name}`}
                  {ev.organizer_email && ` · ${ev.organizer_email}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => approve(ev.id)}
                  style={{ background: 'rgba(74,144,226,0.15)', color: '#4A90E2', border: '1px solid rgba(74,144,226,0.3)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                >
                  ✅ Zatwierdź
                </button>
                <button
                  onClick={() => reject(ev.id)}
                  style={{ background: 'rgba(226,92,92,0.15)', color: '#E25C5C', border: '1px solid rgba(226,92,92,0.3)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                >
                  ❌ Odrzuć
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================
// ALL EVENTS TAB
// ==================
function AllEvents({ token }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editEvent, setEditEvent] = useState(null);
  const [editForm, setEditForm] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    api('/events', 'GET', null, token)
      .then(d => { setEvents(d.events || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const del = async (id, name) => {
    if (!window.confirm(`Usunąć "${name}"?`)) return;
    await api(`/events/${id}`, 'DELETE', null, token);
    load();
  };

  const toggleFeatured = async (ev) => {
    await api(`/events/${ev.id}`, 'PUT', { featured: !ev.featured }, token);
    load();
  };

  const openEdit = (ev) => {
    setEditEvent(ev);
    setEditForm({ ...ev, date_start: ev.date_start?.split('T')[0], date_end: ev.date_end?.split('T')[0] });
  };

  const saveEdit = async () => {
    await api(`/events/${editEvent.id}`, 'PUT', editForm, token);
    setEditEvent(null);
    load();
  };

  const filtered = events.filter(ev =>
    !search || ev.name.toLowerCase().includes(search.toLowerCase()) || ev.city?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = { published: '#4CAF50', pending: '#FF5C00', rejected: '#E25C5C' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Eventy ({events.length})</h2>
        <input
          className="input-field dark"
          placeholder="Szukaj..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 240 }}
        />
      </div>

      {loading ? <div className="loading-spinner" /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Nazwa</th>
                <th style={{ padding: '8px 12px' }}>Sport</th>
                <th style={{ padding: '8px 12px' }}>Miasto</th>
                <th style={{ padding: '8px 12px' }}>Data</th>
                <th style={{ padding: '8px 12px' }}>Status</th>
                <th style={{ padding: '8px 12px' }}>Featured</th>
                <th style={{ padding: '8px 12px' }}>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ev => (
                <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.name}</td>
                  <td style={{ padding: '10px 12px' }}>{SPORT_LABELS[ev.sport_type] || ev.sport_type}</td>
                  <td style={{ padding: '10px 12px' }}>{ev.city}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{ev.date_start?.split('T')[0]}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ color: statusColor[ev.status] || '#fff', fontWeight: 600, fontSize: 12 }}>
                      {ev.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button
                      onClick={() => toggleFeatured(ev)}
                      style={{ background: ev.featured ? 'rgba(255,92,0,0.2)' : 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: ev.featured ? '#FF5C00' : 'rgba(255,255,255,0.4)', fontSize: 12 }}
                    >
                      {ev.featured ? '★ Tak' : '☆ Nie'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(ev)} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                        ✏️ Edytuj
                      </button>
                      <button onClick={() => del(ev.id, ev.name)} style={{ background: 'rgba(226,92,92,0.1)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#E25C5C', fontSize: 12 }}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      {editEvent && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: '#111318', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ color: 'white' }}>Edytuj: {editEvent.name}</h3>
              <button onClick={() => setEditEvent(null)} style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {[
                { k: 'name', label: 'Nazwa' },
                { k: 'city', label: 'Miasto' },
                { k: 'voivodeship', label: 'Województwo' },
                { k: 'date_start', label: 'Data od', type: 'date' },
                { k: 'date_end', label: 'Data do', type: 'date' },
                { k: 'price', label: 'Cena (zł)', type: 'number' },
                { k: 'distance', label: 'Dystans' },
                { k: 'registration_url', label: 'Link do zapisów' },
                { k: 'organizer_name', label: 'Organizator' },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    className="input-field dark"
                    value={editForm[f.k] || ''}
                    onChange={e => setEditForm(frm => ({ ...frm, [f.k]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Status</label>
                <select className="input-field dark" value={editForm.status || ''} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="pending">pending</option>
                  <option value="published">published</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Sport</label>
                <select className="input-field dark" value={editForm.sport_type || ''} onChange={e => setEditForm(f => ({ ...f, sport_type: e.target.value }))}>
                  {SPORT_TYPES.map(s => <option key={s} value={s}>{SPORT_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Opis</label>
                <textarea className="input-field dark" value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={4} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setEditEvent(null)} className="btn-outline" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.15)' }}>Anuluj</button>
              <button onClick={saveEdit} className="btn-primary">Zapisz zmiany</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================
// ARTICLES TAB
// ==================
function Articles({ token }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editArt, setEditArt] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api('/articles', 'GET', null, token)
      .then(d => { setArticles(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const del = async (id) => {
    if (!window.confirm('Usunąć artykuł?')) return;
    await api(`/articles/${id}`, 'DELETE', null, token);
    load();
  };

  const openEdit = (art) => {
    setCreating(false);
    setEditArt(art);
    setEditForm({ ...art });
  };

  const openCreate = () => {
    setEditArt(null);
    setCreating(true);
    setEditForm({ title: '', slug: '', content: '', excerpt: '', sport_type: 'running', status: 'draft', author_name: 'Redakcja Startivo' });
  };

  const save = async () => {
    if (creating) {
      const slug = editForm.slug || editForm.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await api('/articles', 'POST', { ...editForm, slug }, token);
    } else {
      await api(`/articles/${editArt.id}`, 'PUT', editForm, token);
    }
    setEditArt(null);
    setCreating(false);
    load();
  };

  const isEditing = editArt || creating;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Artykuły ({articles.length})</h2>
        <button className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }} onClick={openCreate}>
          + Nowy artykuł
        </button>
      </div>

      {loading ? <div className="loading-spinner" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {articles.map(art => (
            <div key={art.id} style={{
              background: '#111318', borderRadius: 12, padding: '14px 18px',
              border: '1px solid rgba(255,255,255,0.07)',
              display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 12, alignItems: 'center',
            }}>
              <div>
                <span style={{ fontWeight: 600, color: 'white' }}>{art.title}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginLeft: 10 }}>
                  {SPORT_LABELS[art.sport_type]} · {art.status}
                </span>
              </div>
              <span style={{ color: art.status === 'published' ? '#4CAF50' : '#FF5C00', fontSize: 12, fontWeight: 600 }}>
                {art.status}
              </span>
              <button onClick={() => openEdit(art)} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                ✏️ Edytuj
              </button>
              <button onClick={() => del(art.id)} style={{ background: 'rgba(226,92,92,0.1)', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#E25C5C', fontSize: 12 }}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {isEditing && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: '#111318', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ color: 'white' }}>{creating ? 'Nowy artykuł' : `Edytuj: ${editArt?.title}`}</h3>
              <button onClick={() => { setEditArt(null); setCreating(false); }} style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Tytuł</label>
                <input className="input-field dark" value={editForm.title || ''} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Slug</label>
                  <input className="input-field dark" value={editForm.slug || ''} onChange={e => setEditForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generowany" />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Sport</label>
                  <select className="input-field dark" value={editForm.sport_type || ''} onChange={e => setEditForm(f => ({ ...f, sport_type: e.target.value }))}>
                    {SPORT_TYPES.map(s => <option key={s} value={s}>{SPORT_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Autor</label>
                  <input className="input-field dark" value={editForm.author_name || ''} onChange={e => setEditForm(f => ({ ...f, author_name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Status</label>
                  <select className="input-field dark" value={editForm.status || ''} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Excerpt</label>
                <textarea className="input-field dark" value={editForm.excerpt || ''} onChange={e => setEditForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Treść (Markdown)</label>
                <textarea className="input-field dark" value={editForm.content || ''} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))} rows={12} style={{ fontFamily: 'monospace', fontSize: 13 }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => { setEditArt(null); setCreating(false); }} className="btn-outline" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.15)' }}>Anuluj</button>
              <button onClick={save} className="btn-primary">{creating ? 'Utwórz artykuł' : 'Zapisz zmiany'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================
// SETTINGS TAB
// ==================
function Settings({ token }) {
  const [settings, setSettings] = useState({ hero_headline_1: '', hero_headline_2: '', hero_subtitle: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api('/settings', 'GET', null, token).then(setSettings).catch(() => {});
  }, [token]);

  const save = async (key) => {
    await api('/settings', 'PUT', { key, value: settings[key] }, token);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveAll = async () => {
    for (const key of Object.keys(settings)) {
      await api('/settings', 'PUT', { key, value: settings[key] }, token);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Ustawienia strony</h2>
      <div style={{ background: '#111318', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.07)', maxWidth: 600 }}>
        {[
          { k: 'hero_headline_1', label: 'Hero nagłówek linia 1' },
          { k: 'hero_headline_2', label: 'Hero nagłówek linia 2' },
        ].map(f => (
          <div key={f.k} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6 }}>{f.label}</label>
            <input
              className="input-field dark"
              value={settings[f.k] || ''}
              onChange={e => setSettings(s => ({ ...s, [f.k]: e.target.value }))}
            />
          </div>
        ))}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6 }}>Hero podtytuł</label>
          <textarea
            className="input-field dark"
            value={settings.hero_subtitle || ''}
            onChange={e => setSettings(s => ({ ...s, hero_subtitle: e.target.value }))}
            rows={3}
          />
        </div>
        <button className="btn-primary" onClick={saveAll}>
          {saved ? '✓ Zapisano!' : 'Zapisz ustawienia'}
        </button>
      </div>
    </div>
  );
}

// ==================
// SUBSCRIBERS TAB
// ==================
function Subscribers({ token }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/subscribers', 'GET', null, token)
      .then(d => { setSubs(d.subscribers || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const exportCSV = () => {
    const header = 'Email,Region,Data zapisu\n';
    const rows = subs.map(s => `${s.email},${s.region || ''},${new Date(s.created_at).toLocaleDateString('pl-PL')}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subskrybenci.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Subskrybenci ({subs.length})</h2>
        <button className="btn-outline" style={{ fontSize: 13, padding: '8px 16px' }} onClick={exportCSV}>
          📥 Eksport CSV
        </button>
      </div>
      {loading ? <div className="loading-spinner" /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Email</th>
                <th style={{ padding: '8px 12px' }}>Region</th>
                <th style={{ padding: '8px 12px' }}>Data zapisu</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)' }}>
                  <td style={{ padding: '10px 12px' }}>{s.email}</td>
                  <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.4)' }}>{s.region || '—'}</td>
                  <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.4)' }}>{new Date(s.created_at).toLocaleDateString('pl-PL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==================
// INQUIRIES TAB
// ==================
function Inquiries({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api('/inquiries', 'GET', null, token)
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handle = async (id) => {
    await api(`/inquiries/${id}`, 'PUT', null, token);
    load();
  };

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Zapytania ({items.length})</h2>
      {loading ? <div className="loading-spinner" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => (
            <div key={item.id} style={{
              background: '#111318', borderRadius: 12, padding: '16px 20px',
              border: `1px solid ${item.status === 'new' ? 'rgba(255,92,0,0.3)' : 'rgba(255,255,255,0.07)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'white' }}>{item.name || 'Anonim'}</span>
                  {item.company && <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 8, fontSize: 13 }}>{item.company}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: item.status === 'new' ? '#FF5C00' : 'rgba(255,255,255,0.3)',
                  }}>
                    {item.status}
                  </span>
                  {item.status === 'new' && (
                    <button
                      onClick={() => handle(item.id)}
                      style={{ background: 'rgba(74,144,226,0.15)', color: '#4A90E2', border: '1px solid rgba(74,144,226,0.3)', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
                    >
                      ✓ Obsłużono
                    </button>
                  )}
                </div>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 6 }}>
                {item.email} · {item.inquiry_type} · {new Date(item.created_at).toLocaleDateString('pl-PL')}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{item.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================
// MAIN ADMIN PANEL
// ==================
function Admin() {
  const [token, setToken] = useState(sessionStorage.getItem(TOKEN_KEY));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingCount, setPendingCount] = useState(0);

  const loadPendingCount = useCallback(() => {
    if (!token) return;
    api('/stats', 'GET', null, token)
      .then(d => setPendingCount(d.pending_events || 0))
      .catch(() => {});
  }, [token]);

  useEffect(() => { loadPendingCount(); }, [loadPendingCount]);

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  if (!token) {
    return (
      <>
        <Helmet><title>Admin | Startivo</title></Helmet>
        <LoginScreen onLogin={setToken} />
      </>
    );
  }

  const TABS = [
    { id: 'dashboard', label: 'Przegląd', icon: '📊' },
    { id: 'pending', label: 'Oczekujące', icon: '⏳', badge: pendingCount },
    { id: 'events', label: 'Eventy', icon: '🏃' },
    { id: 'articles', label: 'Artykuły', icon: '📝' },
    { id: 'settings', label: 'Ustawienia', icon: '⚙️' },
    { id: 'subscribers', label: 'Subskrybenci', icon: '📧' },
    { id: 'inquiries', label: 'Zapytania', icon: '💬' },
  ];

  return (
    <>
      <Helmet><title>Admin Panel | Startivo</title></Helmet>
      <div style={{ display: 'flex', height: '100vh', background: '#0A0A0A', color: 'white', fontFamily: 'Inter, sans-serif' }}>

        {/* Sidebar */}
        <div style={{
          width: 240, background: '#0D0F14', borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column',
          flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#FF5C00"/>
                <path d="M11 16L14 11L17 16L14 21L11 16Z" fill="white"/>
              </svg>
              <div>
                <div style={{ fontFamily: "'Funnel Display', sans-serif", fontWeight: 800, fontSize: 16 }}>Startivo</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>PANEL ADMINA</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '12px 0' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '10px 20px', background: activeTab === tab.id ? 'rgba(255,92,0,0.12)' : 'none',
                  border: 'none', borderLeft: activeTab === tab.id ? '2px solid #FF5C00' : '2px solid transparent',
                  color: activeTab === tab.id ? '#FF5C00' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', fontSize: 14, textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: '#FF5C00', color: 'white',
                    borderRadius: 100, fontSize: 11, fontWeight: 700,
                    padding: '2px 7px', minWidth: 20, textAlign: 'center',
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              onClick={logout}
              style={{
                width: '100%', padding: '8px 12px', background: 'rgba(226,92,92,0.1)',
                border: '1px solid rgba(226,92,92,0.2)', borderRadius: 8, color: '#E25C5C',
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
              }}
            >
              ← Wyloguj
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          {activeTab === 'dashboard' && <Dashboard token={token} />}
          {activeTab === 'pending' && <PendingEvents token={token} onUpdate={loadPendingCount} />}
          {activeTab === 'events' && <AllEvents token={token} />}
          {activeTab === 'articles' && <Articles token={token} />}
          {activeTab === 'settings' && <Settings token={token} />}
          {activeTab === 'subscribers' && <Subscribers token={token} />}
          {activeTab === 'inquiries' && <Inquiries token={token} />}
        </div>
      </div>
    </>
  );
}

export default Admin;
