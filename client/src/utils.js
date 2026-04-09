// Shared utility functions for Startivo platform

export function countdownLabel(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Zakończone';
  if (diff === 0) return 'Dziś!';
  if (diff === 1) return 'Jutro!';
  if (diff < 7) return `${diff} dni`;
  if (diff < 30) return `${Math.ceil(diff / 7)} tyg.`;
  return `${Math.ceil(diff / 30)} mies.`;
}

export function formatDatePL(dateStr, options) {
  if (!dateStr) return '';
  const defaults = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('pl-PL', options || defaults);
}

export function formatDateLongPL(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pl-PL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

const DIFFICULTY_LABELS = {
  easy: 'Łatwy',
  medium: 'Średni',
  hard: 'Trudny',
  extreme: 'Ekstremalny',
};

export function getDifficultyLabel(value) {
  return DIFFICULTY_LABELS[value] || value;
}

export function toggleSavedEvent(id, storageKey) {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const idx = saved.indexOf(id);
  if (idx > -1) {
    saved.splice(idx, 1);
  } else {
    saved.push(id);
  }
  localStorage.setItem(storageKey, JSON.stringify(saved));
  return saved;
}

export function isEventSaved(id, storageKey) {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  return saved.includes(id);
}
