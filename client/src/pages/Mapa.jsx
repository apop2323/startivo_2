import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import SportIcon, { getSportColor, getSportLabel } from '../components/SportIcon';
import { SPORTS } from '../constants';

const CITY_COORDS = {
  'Warszawa': [52.2297, 21.0122], 'Kraków': [50.0647, 19.9450], 'Wrocław': [51.1079, 17.0385],
  'Gdańsk': [54.3520, 18.6466], 'Gdynia': [54.5189, 18.5305], 'Poznań': [52.4064, 16.9252],
  'Łódź': [51.7592, 19.4560], 'Katowice': [50.2599, 19.0216], 'Lublin': [51.2465, 22.5684],
  'Zakopane': [49.2992, 19.9496], 'Lesko': [49.4698, 22.3299], 'Giżycko': [54.0373, 21.7670],
  'Olsztyn': [53.7784, 20.4801],
};

function getCoords(city) {
  if (CITY_COORDS[city]) return CITY_COORDS[city];
  // Deterministic offset based on city name hash to avoid markers jumping on re-renders
  let hash = 0;
  for (let i = 0; i < city.length; i++) {
    hash = ((hash << 5) - hash + city.charCodeAt(i)) | 0;
  }
  const latOffset = ((hash & 0xffff) / 0xffff - 0.5) * 4;
  const lngOffset = (((hash >> 16) & 0xffff) / 0xffff - 0.5) * 6;
  return [52.0 + latOffset, 19.5 + lngOffset];
}

function Mapa() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [sportFilter, setSportFilter] = useState('');

  const filtered = useMemo(
    () => sportFilter ? events.filter(e => e.sport_type === sportFilter) : events,
    [events, sportFilter]
  );

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
          attribution: '\u00a9 OpenStreetMap contributors \u00a9 CARTO',
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

    map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

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
          <div style="font-weight: 700; color: ${color}; font-size: 14px; margin-bottom: 8px;">${ev.price ? ev.price + ' z\u0142' : 'Bezp\u0142atne'}</div>
          <a href="/event/${ev.slug}" style="color: #FF5C00; font-weight: 600; font-size: 13px;">Zobacz szczeg\u00f3\u0142y \u2192</a>
        </div>
      `);

      marker.on('click', () => setSelected(ev));
      marker.addTo(map);
    });
  }, [filtered]);

  return (
    <>
      <Helmet>
        <title>Mapa startów sportowych w Polsce | Startivo</title>
        <meta name="description" content="Interaktywna mapa zawodów sportowych w Polsce. Znajdź biegi, triathlony, OCR, Hyrox w swojej okolicy." />
      </Helmet>

      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div className="map-topbar">
          <span className="map-topbar-title">Mapa startów</span>
          <span className="map-topbar-count">{filtered.length} wydarzeń</span>
          {SPORTS.map(s => {
            const color = getSportColor(s.type);
            const active = sportFilter === s.type;
            return (
              <button
                key={s.type}
                className={`map-filter-btn ${active ? 'active' : ''}`}
                style={active ? { background: color } : {}}
                onClick={() => setSportFilter(active ? '' : s.type)}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          {loading && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
              <div className="loading-spinner" />
            </div>
          )}
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

          {selected && (
            <div className="map-panel">
              <button className="map-panel-close" onClick={() => setSelected(null)}>
                ✕
              </button>
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
