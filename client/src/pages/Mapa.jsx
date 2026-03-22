import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import SportIcon, { getSportColor, getSportLabel } from '../components/SportIcon';

const SPORT_LABELS = { running:'Bieganie', hyrox:'Hyrox', ocr:'OCR', triathlon:'Triathlon', cycling:'Kolarstwo', trail:'Trail', other:'Inne' };

const CITY_COORDS = {
  'Warszawa': [52.2297, 21.0122], 'Kraków': [50.0647, 19.9450], 'Wrocław': [51.1079, 17.0385],
  'Gdańsk': [54.3520, 18.6466], 'Gdynia': [54.5189, 18.5305], 'Poznań': [52.4064, 16.9252],
  'Łódź': [51.7592, 19.4560], 'Katowice': [50.2599, 19.0216], 'Lublin': [51.2465, 22.5684],
  'Zakopane': [49.2992, 19.9496], 'Lesko': [49.4698, 22.3299], 'Giżycko': [54.0373, 21.7670],
  'Olsztyn': [53.7784, 20.4801],
};

function getCoords(city) {
  if (CITY_COORDS[city]) return CITY_COORDS[city];
  // Default to Poland center with some randomness
  return [52.0 + (Math.random() - 0.5) * 4, 19.5 + (Math.random() - 0.5) * 6];
}

function Mapa() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [sportFilter, setSportFilter] = useState('');

  useEffect(() => {
    fetch('/api/events?limit=100&status=published')
      .then(r => r.json())
      .then(d => { setEvents(d.events || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;
      try {
        const L = window.L;
        if (!L) return;

        const map = L.map(mapRef.current, {
          center: [52.0, 19.5],
          zoom: 6,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors © CARTO',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
      } catch {}
    };

    if (window.L) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    const filtered = sportFilter ? events.filter(e => e.sport_type === sportFilter) : events;

    filtered.forEach(ev => {
      const coords = getCoords(ev.city);
      const color = getSportColor(ev.sport_type);

      const marker = L.circleMarker(coords, {
        radius: 10,
        fillColor: color,
        color: 'white',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      });

      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 200px; padding: 4px;">
          <div style="font-weight: 700; font-size: 15px; margin-bottom: 6px;">${ev.name}</div>
          <div style="color: #666; font-size: 13px; margin-bottom: 4px;">${ev.city}, ${ev.voivodeship}</div>
          <div style="color: #999; font-size: 12px; margin-bottom: 8px;">${new Date(ev.date_start).toLocaleDateString('pl-PL')}</div>
          <div style="font-weight: 700; color: ${color}; font-size: 14px; margin-bottom: 8px;">${ev.price ? ev.price + ' zł' : 'Bezpłatne'}</div>
          <a href="/event/${ev.slug}" style="color: #FF5C00; font-weight: 600; font-size: 13px;">Zobacz szczegóły →</a>
        </div>
      `);

      marker.on('click', () => setSelected(ev));
      marker.addTo(map);
    });
  }, [events, sportFilter]);

  const filtered = sportFilter ? events.filter(e => e.sport_type === sportFilter) : events;

  return (
    <>
      <Helmet>
        <title>Mapa startów sportowych w Polsce | Startivo</title>
        <meta name="description" content="Interaktywna mapa zawodów sportowych w Polsce. Znajdź biegi, triathlony, OCR, Hyrox w swojej okolicy." />
      </Helmet>

      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{
          background: '#0D0D0D', padding: '0 20px',
          display: 'flex', alignItems: 'center', gap: 16,
          height: 60, borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0, marginTop: 60,
          flexWrap: 'wrap',
        }}>
          <span style={{ color: 'white', fontFamily: "'Funnel Display', sans-serif", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
            Mapa startów
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, flexShrink: 0 }}>
            {filtered.length} wydarzeń
          </span>
          {Object.entries(SPORT_LABELS).map(([type, label]) => {
            const color = getSportColor(type);
            const active = sportFilter === type;
            return (
              <button
                key={type}
                onClick={() => setSportFilter(active ? '' : type)}
                style={{
                  padding: '4px 12px', borderRadius: 100, fontSize: 12, cursor: 'pointer',
                  background: active ? color : 'rgba(255,255,255,0.07)',
                  border: 'none',
                  color: active ? 'white' : 'rgba(255,255,255,0.5)',
                  fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}>
              <div className="loading-spinner" />
            </div>
          )}
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

          {/* Selected event panel */}
          {selected && (
            <div style={{
              position: 'absolute', bottom: 20, left: 20, zIndex: 1000,
              background: 'white', borderRadius: 16, padding: 20, maxWidth: 300,
              boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
            }}>
              <button
                onClick={() => setSelected(null)}
                style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
              >✕</button>
              <span className="sport-badge" style={{ background: `${getSportColor(selected.sport_type)}15`, color: getSportColor(selected.sport_type) }}>
                <SportIcon type={selected.sport_type} size={12} />
                {getSportLabel(selected.sport_type)}
              </span>
              <h3 style={{ fontSize: 16, marginTop: 10, marginBottom: 6 }}>{selected.name}</h3>
              <p style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 12 }}>
                {selected.city} · {new Date(selected.date_start).toLocaleDateString('pl-PL')}
              </p>
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '10px' }}
                onClick={() => navigate(`/event/${selected.slug}`)}
              >
                Zobacz szczegóły →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Mapa;
