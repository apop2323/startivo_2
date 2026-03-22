import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useReveal } from '../hooks/useReveal';

const PACKAGES = [
  {
    name: 'Basic',
    price: 'Bezpłatne',
    desc: 'Standardowe listing w kalendarzu',
    features: ['Widoczność w kalendarzu', 'Strona eventu', 'Link do zapisów'],
    cta: 'Dodaj bezpłatnie',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '299 zł / rok',
    desc: 'Wyróżnienie i większa widoczność',
    features: ['Wszystko z Basic', 'Oznaczenie "Polecane"', 'Priorytet w wyszukiwaniu', 'Baner na stronie głównej', 'Powiadomienia email do subskrybentów'],
    cta: 'Wybierz Premium',
    highlight: true,
  },
  {
    name: 'Partnerstwo',
    price: 'Wycena indywidualna',
    desc: 'Długoterminowa współpraca medialna',
    features: ['Wszystko z Premium', 'Artykuły sponsorowane', 'Social media coverage', 'Newsletter dedykowany', 'Logo w stopce serwisu'],
    cta: 'Skontaktuj się',
    highlight: false,
  },
];

function Wspolpraca() {
  useReveal();
  const [form, setForm] = useState({ name: '', company: '', email: '', inquiry_type: 'premium', message: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error('Błąd wysyłania');
      setDone(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Współpraca i reklama | Startivo</title>
        <meta name="description" content="Chcesz promować swoje zawody sportowe lub nawiązać współpracę z Startivo? Sprawdź nasze pakiety i skontaktuj się z nami." />
      </Helmet>

      {/* Hero */}
      <div className="page-header" style={{ paddingBottom: 80 }}>
        <div className="container">
          <span className="section-label">Organizatorzy & Partnerzy</span>
          <h1 style={{ color: 'white' }}>Współpraca</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 560, marginTop: 20, fontSize: 18 }}>
            Dotrzyj do tysięcy aktywnych sportowców w Polsce. Promuj swoje zawody, buduj markę i zwiększaj zapisy.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#0A0A0A', padding: '40px 0', borderBottom: '1px solid var(--dark-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, textAlign: 'center' }}>
            {[
              { val: '74K+', label: 'Użytkowników' },
              { val: '150+', label: 'Wydarzeń rocznie' },
              { val: '16', label: 'Województw' },
              { val: '12K+', label: 'Subskrybentów' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: "'Funnel Display', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 4vw, 48px)', color: '#FF5C00', letterSpacing: '-0.04em' }}>{s.val}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Packages */}
      <div style={{ background: 'var(--cream)', padding: '80px 0' }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-label" style={{ justifyContent: 'center', display: 'flex' }}>Pakiety</span>
            <h2>Wybierz odpowiedni plan</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {PACKAGES.map((pkg, i) => (
              <div
                key={i}
                className={`reveal d${i + 1}`}
                style={{
                  background: 'white', borderRadius: 'var(--r-xl)', padding: 32,
                  border: pkg.highlight ? '2px solid var(--orange)' : '1px solid var(--cream-border)',
                  position: 'relative',
                }}
              >
                {pkg.highlight && (
                  <span style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--orange)', color: 'white', fontSize: 11, fontWeight: 700,
                    padding: '4px 12px', borderRadius: 100, whiteSpace: 'nowrap',
                  }}>
                    Najbardziej popularny
                  </span>
                )}
                <h3 style={{ marginBottom: 8 }}>{pkg.name}</h3>
                <div style={{ fontFamily: "'Funnel Display', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 8, color: pkg.highlight ? 'var(--orange)' : 'var(--black)' }}>
                  {pkg.price}
                </div>
                <p style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 24 }}>{pkg.desc}</p>
                <ul style={{ listStyle: 'none', marginBottom: 28 }}>
                  {pkg.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, fontSize: 14 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={pkg.highlight ? 'var(--orange)' : '#666'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={pkg.highlight ? 'btn-primary' : 'btn-outline'}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
                >
                  {pkg.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact form */}
      <div id="contact-form" style={{ background: 'var(--dark)', padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="reveal" style={{ marginBottom: 40, textAlign: 'center' }}>
            <h2 style={{ color: 'white' }}>Napisz do nas</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>Odpowiemy w ciągu 24 godzin roboczych.</p>
          </div>

          {done ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h3 style={{ color: 'white', marginBottom: 8 }}>Wiadomość wysłana!</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Skontaktujemy się z Tobą wkrótce.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6 }}>Imię i nazwisko *</label>
                  <input className="input-field dark" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Jan Kowalski" />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6 }}>Firma / organizacja</label>
                  <input className="input-field dark" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Nazwa firmy" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6 }}>Email *</label>
                <input type="email" className="input-field dark" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="kontakt@firma.pl" />
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6 }}>Temat zapytania</label>
                <select className="input-field dark" value={form.inquiry_type} onChange={e => set('inquiry_type', e.target.value)}>
                  <option value="premium">Pakiet Premium</option>
                  <option value="partnership">Partnerstwo</option>
                  <option value="event">Dodanie wydarzenia</option>
                  <option value="other">Inne</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6 }}>Wiadomość *</label>
                <textarea
                  className="input-field dark"
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  required
                  rows={5}
                  placeholder="Opisz czego szukasz lub o co chcesz zapytać..."
                />
              </div>
              {error && <div style={{ color: '#ff6b6b', fontSize: 14 }}>{error}</div>}
              <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                {loading ? 'Wysyłanie...' : 'Wyślij wiadomość →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default Wspolpraca;
