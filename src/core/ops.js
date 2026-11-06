// Pure, immutable list operations used by the store.

export function upsertByDate(list, entry) {
  const rest = list.filter((x) => x.date !== entry.date);
  return [...rest, entry].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function append(list, item) {
  return [...list, item];
}

export function removeById(list, id) {
  return list.filter((x) => x.id !== id);
}

export function removeByDate(list, date) {
  return list.filter((x) => x.date !== date);
}

export function newId(prefix = 'id') {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

// Validates and coerces a number from a form field. Throws a user-readable error.
export function parseNumber(raw, { label, min, max, allowEmpty = false }) {
  const text = String(raw ?? '').trim().replace(',', '.');
  if (text === '' && allowEmpty) return null;
  const value = Number(text);
  if (text === '' || !Number.isFinite(value)) throw new Error(`${label}: enter a number`);
  if (value < min || value > max) throw new Error(`${label}: must be between ${min} and ${max}`);
  return value;
}
