import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HexLogo from './HexLogo';
import CheckIcon from './CheckIcon';
import { getSportColor } from './SportIcon';
import { SPORTS_MAIN } from '../constants';

function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setSubmitted(true);
      setEmail('');
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <footer className="footer">
      {/* Newsletter strip */}
      <div className="footer-newsletter-strip">
        <div className="container">
          <div className="footer-newsletter-inner">
            <div>
              <h3 style={{ color: 'white', marginBottom: 8 }}>
                Bądź pierwszy o nowych startach
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 0 }}>
                Newsletter ze startami, zapiskami i poradnikami — bez spamu.
              </p>
              {submitted ? (
                <p className="alert-success" style={{ marginTop: 16 }}>Zapisano! Dziękujemy.</p>
              ) : (
                <form className="footer-newsletter-form" onSubmit={handleSubmit}>
                  <input
                    type="email"
                    placeholder="twój@email.pl"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit">Zapisz się</button>
                </form>
              )}
            </div>
            <div className="footer-benefits">
              {[
                'Nowe eventy co tydzień',
                'Porady od trenerów i zawodników',
                'Wyprzedź terminy zapisów'
              ].map((b, i) => (
                <div className="footer-benefit" key={i}>
                  <CheckIcon />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer grid */}
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HexLogo size={28} />
              <span style={{ fontFamily: "'Funnel Display', sans-serif", fontWeight: 800, color: 'white', fontSize: 18 }}>
                Startivo
              </span>
            </div>
            <p className="footer-logo-tagline">
              Jedno miejsce.<br/>Wszystkie starty sportowe w Polsce.
            </p>
            <div className="footer-socials">
              <a href="https://facebook.com/startivo" className="footer-social-btn" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://instagram.com/startivo" className="footer-social-btn" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://strava.com/clubs/startivo" className="footer-social-btn" target="_blank" rel="noopener noreferrer" aria-label="Strava">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <p className="footer-col-title">Nawigacja</p>
            <ul className="footer-col-links">
              <li><Link to="/">Strona główna</Link></li>
              <li><Link to="/kalendarz">Kalendarz</Link></li>
              <li><Link to="/mapa">Mapa</Link></li>
              <li><Link to="/artykuly">Artykuły</Link></li>
              <li><Link to="/dodaj">Dodaj event</Link></li>
              <li><Link to="/moje-starty">Moje starty</Link></li>
            </ul>
          </div>

          {/* Col 3: Dyscypliny */}
          <div>
            <p className="footer-col-title">Dyscypliny</p>
            <ul className="footer-col-links">
              {SPORTS_MAIN.map(s => {
                const color = getSportColor(s.type);
                return (
                  <li key={s.type}>
                    <Link to={`/kalendarz?sport_type=${s.type}`}>
                      <span
                        className="footer-sport-dot"
                        style={{ backgroundColor: color, color }}
                      />
                      {s.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Col 4: Organizatorzy */}
          <div>
            <p className="footer-col-title">Dla organizatorów</p>
            <ul className="footer-col-links">
              <li><Link to="/dodaj">Dodaj wydarzenie</Link></li>
              <li><Link to="/wspolpraca">Listing Premium</Link></li>
              <li><Link to="/wspolpraca">Współpraca</Link></li>
            </ul>
          </div>

          {/* Col 5: Info */}
          <div>
            <p className="footer-col-title">Informacje</p>
            <ul className="footer-col-links">
              <li><Link to="/wspolpraca">O Startivo</Link></li>
              <li><Link to="/polityka-prywatnosci">Polityka prywatności</Link></li>
              <li><Link to="/wspolpraca">Kontakt</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Startivo.pl — Wszelkie prawa zastrzeżone</span>
          <span>Made for active Poland</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
