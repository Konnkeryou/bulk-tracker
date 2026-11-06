// Rendering helpers. Every user-provided string goes through esc().

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function n(value, digits = 0) {
  return value === null || value === undefined || !Number.isFinite(value) ? '–' : value.toFixed(digits);
}

export function signed(value, digits = 2) {
  if (!Number.isFinite(value)) return '–';
  return (value >= 0 ? '+' : '') + value.toFixed(digits);
}

export function bar(value, target) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return `<div class="bar"><span style="width:${pct}%"></span></div>`;
}

export const STATUS_LABEL = { ok: 'On track', warn: 'Watch', bad: 'Off track', na: 'Not yet' };

export function badge(status) {
  return `<span class="badge ${esc(status)}">${STATUS_LABEL[status] || esc(status)}</span>`;
}

export function card(title, body, extraClass = '') {
  return `<section class="card ${extraClass}">${title ? `<h2>${esc(title)}</h2>` : ''}${body}</section>`;
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
}
