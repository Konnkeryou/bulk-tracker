// Today: weigh-in, intake vs target, calibration progress, weekly calorie suggestion.

import { esc, n, signed, bar, card, formatDate } from '../dom.js';
import { weeklyRate } from '../../core/trend.js';
import { upsertByDate, append, newId, parseNumber } from '../../core/ops.js';
import { bodyweight, targetRate, calibration, suggestedStart, weeklySuggestion, dayTotals, proteinGoal, MEALS_BY_ID } from '../selectors.js';
import { checkpointInfo } from '../../core/review.js';

const QUICK = ['big_shake', 'pb_honey_shake', 'yoghurt_bowl'];
// Maintenance is computed from the first 14 days of logs whatever you eat, so keep showing it a week past.
const CALIBRATION_VISIBLE_DAYS = 21;

export function render(state, { today }) {
  const s = state.settings;
  const todayWeight = state.weighIns.find((w) => w.date === today);
  const totals = dayTotals(state, today);
  const protein = proteinGoal(state, today);
  const trend = bodyweight(state, today);
  const rate = weeklyRate(state.weighIns, today);
  const need = targetRate(state, today);

  const header = s.bulkStartDate
    ? `Bulk week ${checkpointInfo(state, today).week} · goal ${s.goalKg} kg by ${formatDate(s.goalDate)}`
    : `Calibration day ${Math.max(1, calibration(state, today).day)} of 14 · eat normally`;

  const weigh = card('Morning weigh-in', `
    <form data-form="weigh" class="row">
      <input name="kg" inputmode="decimal" placeholder="kg" value="${todayWeight ? todayWeight.kg : ''}" aria-label="Weight in kg">
      <button>${todayWeight ? 'Update' : 'Save'}</button>
    </form>
    <p class="stats"><b>${n(trend, 1)}</b> kg trend · <b>${signed(rate)}</b> kg/wk · need <b>${signed(need)}</b> kg/wk</p>`);

  const intake = card('Today', `
    <p>${n(totals.kcal)} / ${s.targetKcal ?? '—'} kcal</p>${bar(totals.kcal, s.targetKcal || 3000)}
    <p>${n(totals.protein)} / ${n(protein.target)} g protein <span class="muted">(${n(protein.min)}–${n(protein.max)})</span></p>${bar(totals.protein, protein.target)}
    <div class="chips">${QUICK.map((id) => `<button data-action="quickMeal" data-id="${id}">+ ${esc(MEALS_BY_ID[id].name)} <small>${n(MEALS_BY_ID[id].kcal)} kcal</small></button>`).join('')}</div>`);

  const showCalibration = !s.bulkStartDate || calibration(state, today).day <= CALIBRATION_VISIBLE_DAYS;
  const cards = [s.bulkStartDate ? suggestionCard(state, today) : '', showCalibration ? calibrationCard(state, today) : ''].join('');
  return `<p class="lede">${esc(header)}</p>${weigh}${intake}${cards}`;
}

function calibrationCard(state, today) {
  const cal = calibration(state, today);
  const r = cal.result;
  const progress = `<p>Weigh-ins: week 1 <b>${r.week1Count}</b>/7 · week 2 <b>${r.week2Count}</b>/7 · food days <b>${r.intakeDays}</b>/14</p>`;
  const start = suggestedStart(state, today);
  if (!start) {
    return card('Calibration', `${progress}<p class="muted">${esc(r.reason || '')}. Ends ${formatDate(cal.end)}. Weigh every morning, log everything you eat, waist on days 1/4/8/11/14, photos on days 1 and 14.</p>`);
  }
  return card('Calibration done', `${progress}
    <p>Maintenance ≈ <b>${start.maintenance}</b> kcal (avg intake ${n(r.avgIntake)} kcal, weight change ${signed(r.weeklyChange)} kg/wk).</p>
    <p>To hit the goal you need ${signed(start.rate)} kg/wk → start at <b>${start.target}</b> kcal.</p>
    <button data-action="startBulk" data-kcal="${start.target}" data-maint="${start.maintenance}">${state.settings.bulkStartDate ? 'Set target to' : 'Start bulk at'} ${start.target} kcal</button>`, 'highlight');
}

function suggestionCard(state, today) {
  const sug = weeklySuggestion(state, today);
  const s = state.settings;
  if (!sug.due) return card('Weekly check', `<p>Current target <b>${s.targetKcal}</b> kcal. Next review ${formatDate(sug.nextDue)}.</p><p class="muted">${esc(sug.reason)}</p>`);
  if (sug.action === 'wait') return card('Weekly check', `<p class="muted">${esc(sug.reason)}</p>`);
  const label = sug.action === 'hold' ? 'Keep calories the same' : `${sug.action === 'add' ? 'Add' : 'Cut'} ${Math.abs(sug.kcal)} kcal/day → ${s.targetKcal + sug.kcal}`;
  return card('Weekly check is due', `<p>${esc(sug.reason)}</p><button data-action="applyAdjust" data-kcal="${sug.kcal}" data-reason="${esc(sug.reason)}">${esc(label)}</button>`, 'highlight');
}

export const forms = {
  weigh(data, { store, today }) {
    const kg = parseNumber(data.get('kg'), { label: 'Weight', min: 30, max: 200 });
    store.update((st) => ({ ...st, weighIns: upsertByDate(st.weighIns, { date: today, kg }) }));
    return `Saved ${kg} kg`;
  },
};

export const actions = {
  quickMeal(el, { store, today }) {
    const m = MEALS_BY_ID[el.dataset.id];
    store.update((st) => ({ ...st, meals: append(st.meals, { id: newId('meal'), date: today, recipeId: m.id, name: m.name, servings: 1, kcal: m.kcal, protein: m.protein }) }));
    return `Logged ${m.name}`;
  },
  startBulk(el, { store, today }) {
    const kcal = Number(el.dataset.kcal);
    const maint = Number(el.dataset.maint);
    store.update((st) => ({
      ...st,
      settings: { ...st.settings, bulkStartDate: st.settings.bulkStartDate || today, maintenanceKcal: maint, targetKcal: kcal, lastAdjustmentDate: today },
      calorieLog: append(st.calorieLog, { date: today, targetKcal: kcal, reason: `Calibrated maintenance ${maint}` }),
    }));
    return `Bulk started at ${kcal} kcal`;
  },
  applyAdjust(el, { store, today }) {
    const delta = Number(el.dataset.kcal);
    store.update((st) => {
      const targetKcal = st.settings.targetKcal + delta;
      return { ...st, settings: { ...st.settings, targetKcal, lastAdjustmentDate: today }, calorieLog: append(st.calorieLog, { date: today, targetKcal, reason: el.dataset.reason }) };
    });
    return delta === 0 ? 'Holding calories' : `Target changed by ${signed(delta, 0)} kcal`;
  },
};
