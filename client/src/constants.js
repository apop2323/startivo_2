// Shared constants for Startivo platform

export const SPORTS = [
  { type: 'running', label: 'Bieganie' },
  { type: 'hyrox', label: 'Hyrox' },
  { type: 'ocr', label: 'OCR' },
  { type: 'triathlon', label: 'Triathlon' },
  { type: 'cycling', label: 'Kolarstwo' },
  { type: 'trail', label: 'Trail Running' },
  { type: 'other', label: 'Inne' },
];

export const SPORTS_MAIN = SPORTS.filter(s => s.type !== 'other');

export const VOIVODESHIPS = [
  'dolnośląskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie', 'łódzkie',
  'małopolskie', 'mazowieckie', 'opolskie', 'podkarpackie', 'podlaskie',
  'pomorskie', 'śląskie', 'świętokrzyskie', 'warmińsko-mazurskie',
  'wielkopolskie', 'zachodniopomorskie',
];

export const DIFFICULTIES = [
  { value: 'easy', label: 'Łatwy' },
  { value: 'medium', label: 'Średni' },
  { value: 'hard', label: 'Trudny' },
  { value: 'extreme', label: 'Ekstremalny' },
];

export const MY_EVENTS_STORAGE_KEY = 'startivo_my_events';
