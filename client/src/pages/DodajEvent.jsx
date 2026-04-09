import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';
import { SPORTS, VOIVODESHIPS, DIFFICULTIES } from '../constants';

const INITIAL_FORM = {
  name: '', sport_type: '', date_start: '', date_end: '', city: '', voivodeship: '',
  description: '', distance: '', difficulty: '', price: '', registration_url: '',
  registration_deadline: '', organizer_name: '', organizer_email: '', event_website: '',
};

function DodajEvent() {
  useReveal();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (payload.price) payload.price = parseInt(payload.price);
      const r = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || 'Błąd serwera');
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="center-content" style={{ minHeight: '60vh' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{'\u2705'}</div>
        <h2>Wydarzenie zgłoszone!</h2>
        <p style={{ color: 'var(--gray)', marginTop: 12, maxWidth: 480 }}>
          Twoje wydarzenie zostało przesłane do moderacji. Nasz zespół sprawdzi je i opublikuje w ciągu 24 godzin.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button className="btn-primary" onClick={() => navigate('/kalendarz')}>Zobacz kalendarz</button>
          <button className="btn-outline" onClick={() => { setSuccess(false); setForm(INITIAL_FORM); }}>
            Dodaj kolejne
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dodaj wydarzenie sportowe | Startivo</title>
        <meta name="description" content="Dodaj swoje zawody sportowe do kalendarza Startivo. Bezpłatna rejestracja dla organizatorów." />
      </Helmet>

      <div className="page-header">
        <div className="container">
          <span className="section-label">Organizatorzy</span>
          <h1 style={{ color: 'white' }}>Dodaj<br/>event</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 480, marginTop: 16 }}>
            Bezpłatne dodanie wydarzenia. Po weryfikacji pojawi się w naszym kalendarzu.
          </p>
        </div>
      </div>

      <div style={{ background: 'var(--cream)', padding: '60px 0 100px' }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Basic info */}
            <div className="event-section-card">
              <h3 style={{ marginBottom: 24, fontSize: 18 }}>Podstawowe informacje</h3>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label className="form-label">Nazwa wydarzenia *</label>
                  <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="np. Runmageddon Warszawa 2026" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Dyscyplina *</label>
                    <select className="input-field" value={form.sport_type} onChange={e => set('sport_type', e.target.value)} required>
                      <option value="">Wybierz...</option>
                      {SPORTS.map(s => <option key={s.type} value={s.type}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Poziom trudności</label>
                    <select className="input-field" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                      <option value="">Wybierz...</option>
                      {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Data rozpoczęcia *</label>
                    <input type="date" className="input-field" value={form.date_start} onChange={e => set('date_start', e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label">Data zakończenia</label>
                    <input type="date" className="input-field" value={form.date_end} onChange={e => set('date_end', e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Miasto *</label>
                    <input className="input-field" value={form.city} onChange={e => set('city', e.target.value)} required placeholder="np. Warszawa" />
                  </div>
                  <div>
                    <label className="form-label">Województwo *</label>
                    <select className="input-field" value={form.voivodeship} onChange={e => set('voivodeship', e.target.value)} required>
                      <option value="">Wybierz...</option>
                      {VOIVODESHIPS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Dystans</label>
                    <input className="input-field" value={form.distance} onChange={e => set('distance', e.target.value)} placeholder="np. 5km / 10km / 21km" />
                  </div>
                  <div>
                    <label className="form-label">Cena (zł)</label>
                    <input type="number" className="input-field" value={form.price} onChange={e => set('price', e.target.value)} placeholder="np. 150" min="0" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Opis</label>
                  <textarea
                    className="input-field"
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    rows={5}
                    placeholder="Opisz swoje wydarzenie — trasy, atrakcje, co wyróżnia imprezę..."
                  />
                </div>
              </div>
            </div>

            {/* Registration */}
            <div className="event-section-card">
              <h3 style={{ marginBottom: 24, fontSize: 18 }}>Zapisy i rejestracja</h3>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label className="form-label">Link do zapisów</label>
                  <input type="url" className="input-field" value={form.registration_url} onChange={e => set('registration_url', e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <label className="form-label">Termin zapisów</label>
                  <input type="date" className="input-field" value={form.registration_deadline} onChange={e => set('registration_deadline', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Strona wydarzenia</label>
                  <input type="url" className="input-field" value={form.event_website} onChange={e => set('event_website', e.target.value)} placeholder="https://..." />
                </div>
              </div>
            </div>

            {/* Organizer */}
            <div className="event-section-card">
              <h3 style={{ marginBottom: 24, fontSize: 18 }}>Dane organizatora</h3>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label className="form-label">Nazwa organizatora</label>
                  <input className="input-field" value={form.organizer_name} onChange={e => set('organizer_name', e.target.value)} placeholder="np. Stowarzyszenie Sportowe XYZ" />
                </div>
                <div>
                  <label className="form-label">Email kontaktowy</label>
                  <input type="email" className="input-field" value={form.organizer_email} onChange={e => set('organizer_email', e.target.value)} placeholder="kontakt@twojafirma.pl" />
                </div>
              </div>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-outline" onClick={() => navigate('/')}>Anuluj</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Wysyłanie...' : 'Wyślij do moderacji →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default DodajEvent;
