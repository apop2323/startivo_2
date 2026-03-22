import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

function HexLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#FF5C00"/>
      <path d="M11 16L14 11L17 16L14 21L11 16Z" fill="white"/>
      <path d="M17 13L21 16L17 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { to: '/kalendarz', label: 'Kalendarz' },
    { to: '/mapa', label: 'Mapa' },
    { to: '/artykuly', label: 'Artykuły' },
    { to: '/wspolpraca', label: 'Współpraca' },
  ];

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-inner">
            <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
              <HexLogo />
              <span className="navbar-logo-text">Startivo</span>
            </Link>

            <ul className="navbar-nav">
              {navLinks.map(l => (
                <li key={l.to}>
                  <NavLink to={l.to}>{l.label}</NavLink>
                </li>
              ))}
            </ul>

            <div className="navbar-actions">
              <Link to="/dodaj" className="navbar-cta">
                + Dodaj event
              </Link>
            </div>

            <button
              className="navbar-hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Otwórz menu"
            >
              <span/>
              <span/>
              <span/>
            </button>
          </div>
        </div>
      </nav>

      <div className={`navbar-mobile-overlay${mobileOpen ? ' open' : ''}`}>
        <button
          className="navbar-mobile-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Zamknij menu"
        >
          ✕
        </button>
        {navLinks.map(l => (
          <Link
            key={l.to}
            to={l.to}
            onClick={() => setMobileOpen(false)}
          >
            {l.label}
          </Link>
        ))}
        <Link
          to="/dodaj"
          onClick={() => setMobileOpen(false)}
          style={{ color: '#FF5C00' }}
        >
          + Dodaj event
        </Link>
      </div>
    </>
  );
}

export default Navbar;
