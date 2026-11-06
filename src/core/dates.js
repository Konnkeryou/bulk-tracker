// Date helpers. All dates are ISO 'YYYY-MM-DD' strings, handled in UTC to avoid DST drift.

const MS_PER_DAY = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isISODate(value) {
  return typeof value === 'string' && ISO_DATE.test(value) && !Number.isNaN(toUTC(value));
}

export function toUTC(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function fromUTC(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso, days) {
  return fromUTC(toUTC(iso) + days * MS_PER_DAY);
}

export function daysBetween(fromIso, toIso) {
  return Math.round((toUTC(toIso) - toUTC(fromIso)) / MS_PER_DAY);
}

export function todayISO(now = new Date()) {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function inRange(iso, startIso, endIso) {
  return iso >= startIso && iso <= endIso;
}
