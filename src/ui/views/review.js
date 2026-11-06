// Review: success metrics, checkpoint status, calorie target history.

import { esc, badge, card, formatDate } from '../dom.js';
import { buildReview, checkpointInfo } from '../../core/review.js';
import { KEY_LIFTS } from '../../data/exercises.js';

export function render(state, { today }) {
  const checks = buildReview(state, KEY_LIFTS, today);
  const s = state.settings;
  const cp = s.bulkStartDate ? checkpointInfo(state, today) : null;
  const header = cp
    ? `<p>Week <b>${cp.week}</b> of the bulk. Next checkpoint: week ${cp.nextCheckpointWeek} (${formatDate(cp.nextCheckpointDate)}) — photos, waist, and lift tests.</p>`
    : '<p>Bulk not started yet — finish the 14-day calibration on the Today tab.</p>';

  const rows = checks.map((c) => `<li class="check">
      <div class="row between"><b>${esc(c.label)}</b>${badge(c.status)}</div>
      <div>${c.value ? esc(c.value) : '–'} <span class="muted">target ${c.target ? esc(c.target) : '–'}</span></div>
      ${c.note ? `<div class="muted small">${esc(c.note)}</div>` : ''}</li>`).join('');

  const counts = checks.reduce((acc, c) => ({ ...acc, [c.status]: (acc[c.status] || 0) + 1 }), {});
  const verdict = (counts.bad || 0) > 0 ? 'Something is off track — see red items.' : (counts.warn || 0) > 0 ? 'Mostly on track — watch the amber items.' : 'All checked metrics on track.';

  const log = [...state.calorieLog].reverse().map((l) => `<li>${formatDate(l.date)} · <b>${l.targetKcal}</b> kcal <span class="muted">${esc(l.reason)}</span></li>`).join('');

  return card('Checkpoint', `${header}<p><b>${esc(verdict)}</b></p>`) +
    card('Success metrics', `<ul class="list checks">${rows}</ul>`) +
    card('How these are judged', `<ul class="list small">
      <li><b>Rate:</b> 14-day least-squares weight trend vs the rate needed to reach ${s.goalKg} kg by ${formatDate(s.goalDate)}. ±0.1 kg/wk is on track.</li>
      <li><b>Waist vs weight:</b> ≤0.5 cm waist per kg gained is on track (coaching rule of thumb, not a validated cut-off).</li>
      <li><b>Lifts:</b> best e1RM in the last 14 days vs your first 14 days.</li>
      <li><b>Photos:</b> every 28 days. <b>DEXA:</b> optional at start and 6 months; ≥50% of gained mass as lean is good.</li></ul>`) +
    card('Calorie target history', log ? `<ul class="list small">${log}</ul>` : '<p class="muted">No changes yet.</p>');
}

export const forms = {};
export const actions = {};
