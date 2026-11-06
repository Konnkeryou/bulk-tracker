// Body: weight + 7-day trend chart, waist, progress-photo dates, DEXA scans.

import { esc, n, card, formatDate } from '../dom.js';
import { lineChart } from '../chart.js';
import { trendSeries } from '../../core/trend.js';
import { upsertByDate, removeByDate, parseNumber } from '../../core/ops.js';
import { addDays, isISODate } from '../../core/dates.js';

const CHART_DAYS = 90;

export function render(state, { today }) {
  const from = addDays(today, -CHART_DAYS);
  const series = trendSeries(state.weighIns).filter((p) => p.date >= from);
  const chart = lineChart([
    { points: series.map((p) => ({ date: p.date, y: p.kg })), cls: 'line-b', dots: true, line: false },
    { points: series.map((p) => ({ date: p.date, y: p.trend })), cls: 'line-a' },
  ]);
  const weights = [...state.weighIns].reverse().slice(0, 14).map((w) => row(w.date, `${w.kg} kg`, 'weighIns')).join('');
  const waist = [...state.waist].reverse().map((w) => row(w.date, `${w.cm} cm`, 'waist')).join('');
  const photos = [...state.photos].reverse().map((p) => row(p.date, 'photos taken', 'photos')).join('');
  const dexa = [...state.dexa].reverse().map((d) => row(d.date, `lean ${d.leanKg} kg · fat ${d.fatKg} kg`, 'dexa')).join('');

  return card('Weight', `${chart}<p class="muted">Dots = morning weigh-ins · line = 7-day trend.</p>
      <form data-form="weighDate" class="row"><input name="date" type="date" value="${today}" max="${today}"><input name="kg" inputmode="decimal" placeholder="kg"><button>Save</button></form>
      <ul class="list small">${weights}</ul>`) +
    card('Waist (at navel, relaxed exhale)', `<form data-form="waist" class="row"><input name="date" type="date" value="${today}" max="${today}"><input name="cm" inputmode="decimal" placeholder="cm"><button>Save</button></form>
      <ul class="list small">${waist || '<li class="muted">None yet</li>'}</ul>`) +
    card('Progress photos (every 4 weeks)', `<p class="muted">Front, side, back · same light, distance, time. Photos stay in your camera roll; this logs the date.</p>
      <button data-action="photosTaken">Photos taken today</button><ul class="list small">${photos}</ul>`) +
    card('DEXA (optional: start + 6 months)', `<form data-form="dexa" class="row wrap"><input name="date" type="date" value="${today}" max="${today}"><input name="lean" inputmode="decimal" placeholder="lean kg"><input name="fat" inputmode="decimal" placeholder="fat kg"><button>Save</button></form>
      <ul class="list small">${dexa || '<li class="muted">None yet</li>'}</ul>`);
}

function row(date, text, list) {
  return `<li>${formatDate(date)} · ${esc(text)} <button class="link" data-action="deleteDated" data-list="${list}" data-date="${date}" aria-label="Delete">✕</button></li>`;
}

function readDate(data, today) {
  const date = String(data.get('date') || today);
  if (!isISODate(date) || date > today) throw new Error('Pick a valid date, not in the future');
  return date;
}

export const forms = {
  weighDate(data, { store, today }) {
    const date = readDate(data, today);
    const kg = parseNumber(data.get('kg'), { label: 'Weight', min: 30, max: 200 });
    store.update((st) => ({ ...st, weighIns: upsertByDate(st.weighIns, { date, kg }) }));
    return 'Weight saved';
  },
  waist(data, { store, today }) {
    const date = readDate(data, today);
    const cm = parseNumber(data.get('cm'), { label: 'Waist', min: 40, max: 200 });
    store.update((st) => ({ ...st, waist: upsertByDate(st.waist, { date, cm }) }));
    return 'Waist saved';
  },
  dexa(data, { store, today }) {
    const date = readDate(data, today);
    const leanKg = parseNumber(data.get('lean'), { label: 'Lean mass', min: 20, max: 150 });
    const fatKg = parseNumber(data.get('fat'), { label: 'Fat mass', min: 1, max: 100 });
    store.update((st) => ({ ...st, dexa: upsertByDate(st.dexa, { date, leanKg, fatKg }) }));
    return 'DEXA saved';
  },
};

const DATED_LISTS = ['weighIns', 'waist', 'photos', 'dexa'];

export const actions = {
  photosTaken(_el, { store, today }) {
    store.update((st) => ({ ...st, photos: upsertByDate(st.photos, { date: today }) }));
    return 'Photo date logged';
  },
  deleteDated(el, { store, confirmAction }) {
    const { list, date } = el.dataset;
    if (!DATED_LISTS.includes(list)) return null;
    if (!confirmAction(`${list}-${date}`)) return 'Tap ✕ again to delete';
    store.update((st) => ({ ...st, [list]: removeByDate(st[list], date) }));
    return 'Deleted';
  },
};
