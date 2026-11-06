// Minimal responsive SVG line chart (no dependencies, works offline).

import { daysBetween } from '../core/dates.js';
import { esc, n } from './dom.js';

const W = 340;
const H = 170;
const PAD = { l: 34, r: 8, t: 10, b: 22 };

// series: [{points:[{date, y}], cls, dots, line}]
export function lineChart(series, { digits = 1, unit = '' } = {}) {
  const all = series.flatMap((s) => s.points).filter((p) => Number.isFinite(p.y));
  if (all.length < 2) return '<p class="muted">Not enough data for a chart yet.</p>';

  const dates = all.map((p) => p.date).sort();
  const first = dates[0];
  const span = Math.max(1, daysBetween(first, dates.at(-1)));
  const ys = all.map((p) => p.y);
  const pad = Math.max(0.5, (Math.max(...ys) - Math.min(...ys)) * 0.1);
  const yMin = Math.min(...ys) - pad;
  const yMax = Math.max(...ys) + pad;

  const x = (date) => PAD.l + (daysBetween(first, date) / span) * (W - PAD.l - PAD.r);
  const y = (v) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);

  const grid = [yMin + pad, (yMin + yMax) / 2, yMax - pad]
    .map((v) => `<line class="grid" x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${PAD.l - 4}" y="${y(v) + 3}" text-anchor="end">${n(v, digits)}</text>`)
    .join('');

  const paths = series
    .map((s) => {
      const pts = s.points.filter((p) => Number.isFinite(p.y));
      const line = s.line === false ? '' : `<polyline class="${esc(s.cls)}" points="${pts.map((p) => `${x(p.date)},${y(p.y)}`).join(' ')}"/>`;
      const dots = s.dots ? pts.map((p) => `<circle class="${esc(s.cls)}-dot" cx="${x(p.date)}" cy="${y(p.y)}" r="2.5"/>`).join('') : '';
      return line + dots;
    })
    .join('');

  const labels = `<text class="axis" x="${PAD.l}" y="${H - 6}">${esc(first.slice(5))}</text><text class="axis" x="${W - PAD.r}" y="${H - 6}" text-anchor="end">${esc(dates.at(-1).slice(5))}</text>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="chart ${esc(unit)}">${grid}${paths}${labels}</svg>`;
}
