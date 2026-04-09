import React from 'react';

const SPORT_COLORS = {
  running:   '#4A90E2',
  ocr:       '#E25C5C',
  hyrox:     '#FF5C00',
  triathlon: '#26C6DA',
  cycling:   '#4CAF50',
  trail:     '#AB47BC',
  other:     '#8C8B86'
};

const SPORT_LABELS = {
  running:   'Bieganie',
  ocr:       'OCR',
  hyrox:     'Hyrox',
  triathlon: 'Triathlon',
  cycling:   'Kolarstwo',
  trail:     'Trail Running',
  other:     'Inne'
};

export function getSportColor(type) {
  return SPORT_COLORS[type] || SPORT_COLORS.other;
}

export function getSportLabel(type) {
  return SPORT_LABELS[type] || 'Inne';
}

function SportIcon({ type = 'other', size = 28, color }) {
  const c = color || getSportColor(type);

  const icons = {
    running: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13" cy="4" r="1.5"/>
        <path d="M7 17l3-4 2 2 3-5 3 3"/>
        <path d="M6 20l2.5-3M18 20l-2-2.5"/>
        <path d="M9 10l2-2 1.5 1L15 7"/>
      </svg>
    ),
    ocr: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="2" width="4" height="20" rx="1"/>
        <path d="M6 8c0 0 2-2 4 0M14 8c0 0 2-2 4 0"/>
        <path d="M6 14l3-3M15 11l3 3"/>
        <circle cx="6" cy="17" r="1.5"/>
        <circle cx="18" cy="7" r="1.5"/>
      </svg>
    ),
    hyrox: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 12h12"/>
        <rect x="2" y="10" width="4" height="4" rx="1"/>
        <rect x="18" y="10" width="4" height="4" rx="1"/>
        <path d="M9 7v10M15 7v10"/>
      </svg>
    ),
    triathlon: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 16c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>
        <circle cx="7" cy="10" r="2"/>
        <circle cx="17" cy="10" r="2"/>
        <path d="M12 8V4"/>
        <path d="M10 20l2-4 2 4"/>
      </svg>
    ),
    cycling: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="15" r="4"/>
        <circle cx="19" cy="15" r="4"/>
        <path d="M5 15l5-9h4"/>
        <path d="M14 6l5 9"/>
        <path d="M9 6h5"/>
        <path d="M12 6l2 9"/>
      </svg>
    ),
    trail: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20l5-9 4 4 4-7 7 12z"/>
        <circle cx="18" cy="5" r="2"/>
      </svg>
    ),
    other: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    )
  };

  return icons[type] || icons.other;
}

export default SportIcon;
