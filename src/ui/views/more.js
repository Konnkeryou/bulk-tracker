// More: plate calculator, settings, export (JSON/CSV) and import.

import { esc, card } from '../dom.js';
import { plateCard } from './plates-ui.js';
import { parseInventory, formatInventory } from '../../core/plates.js';
import { toCSV, workoutSetRows } from '../../core/csv.js';
import { parseNumber } from '../../core/ops.js';
import { isISODate } from '../../core/dates.js';
import { EXERCISES_BY_ID } from '../../data/exercises.js';

export function render(state, ctx) {
  const s = state.settings;
  const settings = card('Settings', `
    <form data-form="settings" class="stack">
      <label>Goal weight (kg)<input name="goalKg" inputmode="decimal" value="${s.goalKg}"></label>
      <label>Goal date<input name="goalDate" type="date" value="${s.goalDate}"></label>
      <label>Calibration start<input name="calibrationStartDate" type="date" value="${s.calibrationStartDate}"></label>
      <label>Daily calorie target (kcal, blank until calibrated)<input name="targetKcal" inputmode="numeric" value="${s.targetKcal ?? ''}"></label>
      <label>Protein (g per kg, 1.6–2.2)<input name="proteinPerKg" inputmode="decimal" value="${s.proteinPerKg}"></label>
      <label>Bar (kg)<input name="barKg" inputmode="decimal" value="${s.barKg}"></label>
      <label>Plates you own (weight x count)<input name="plates" value="${esc(formatInventory(s.plates))}"></label>
      <label class="check-row"><input type="checkbox" name="avoidShoulderStress" ${s.avoidShoulderStress ? 'checked' : ''}> Hide high shoulder-stress swaps</label>
      <button>Save settings</button>
    </form>
    <p class="muted">Setting a calorie target by hand also starts the bulk (weekly checks begin).</p>`);

  const data = card('Your data', `
    <p class="muted">Everything is stored only on this device. ${ctx.store.isPersisted() ? 'Storage is marked persistent.' : 'Add to Home Screen so iOS keeps the data; export weekly as a backup.'}</p>
    <div class="stack">
      <button data-action="exportJSON">Export everything (JSON backup)</button>
      <div class="chips"><button data-action="exportCSV" data-table="weighIns">Weights CSV</button><button data-action="exportCSV" data-table="waist">Waist CSV</button><button data-action="exportCSV" data-table="meals">Food CSV</button><button data-action="exportCSV" data-table="sets">Sets CSV</button></div>
      <label class="file">Import JSON backup (replaces current data)<input type="file" accept="application/json,.json" data-change="importFile"></label>
    </div>`);

  return plateCard(state, ctx.ui) + settings + data;
}

const CSV_TABLES = {
  weighIns: (st) => [st.weighIns, ['date', 'kg']],
  waist: (st) => [st.waist, ['date', 'cm']],
  meals: (st) => [st.meals, ['date', 'name', 'servings', 'kcal', 'protein']],
  sets: (st) => [workoutSetRows(st.workouts).map((r) => ({ ...r, exercise: EXERCISES_BY_ID[r.exercise]?.name || r.exercise })), ['date', 'session', 'set', 'exercise', 'kg', 'reps', 'rir']],
};

export const forms = {
  plateCalc(data, { ui }) {
    ui.plateTarget = parseNumber(data.get('kg'), { label: 'Target', min: 0, max: 500 });
  },
  settings(data, { store, today }) {
    const goalDate = String(data.get('goalDate'));
    const calibrationStartDate = String(data.get('calibrationStartDate'));
    if (!isISODate(goalDate) || goalDate <= today) throw new Error('Goal date must be in the future');
    if (!isISODate(calibrationStartDate)) throw new Error('Calibration start must be a date');
    const next = {
      goalKg: parseNumber(data.get('goalKg'), { label: 'Goal weight', min: 40, max: 150 }),
      goalDate,
      calibrationStartDate,
      targetKcal: parseNumber(data.get('targetKcal'), { label: 'Calorie target', min: 1200, max: 7000, allowEmpty: true }),
      proteinPerKg: parseNumber(data.get('proteinPerKg'), { label: 'Protein g/kg', min: 1.6, max: 2.2 }),
      barKg: parseNumber(data.get('barKg'), { label: 'Bar', min: 5, max: 30 }),
      plates: parseInventory(data.get('plates')),
      avoidShoulderStress: data.get('avoidShoulderStress') === 'on',
    };
    store.update((st) => {
      const startsBulk = next.targetKcal && !st.settings.bulkStartDate;
      const changed = next.targetKcal && next.targetKcal !== st.settings.targetKcal;
      return {
        ...st,
        settings: { ...st.settings, ...next, ...(startsBulk ? { bulkStartDate: today, lastAdjustmentDate: today } : {}) },
        calorieLog: changed ? [...st.calorieLog, { date: today, targetKcal: next.targetKcal, reason: 'Set by hand' }] : st.calorieLog,
      };
    });
    return 'Settings saved';
  },
};

export const actions = {
  exportJSON(_el, { store, download, today }) {
    download(`bulk-backup-${today}.json`, JSON.stringify(store.get(), null, 2), 'application/json');
  },
  exportCSV(el, { store, download, today }) {
    const make = CSV_TABLES[el.dataset.table];
    if (!make) return null;
    const [rows, cols] = make(store.get());
    download(`bulk-${el.dataset.table}-${today}.csv`, toCSV(rows, cols), 'text/csv');
  },
};

export const changes = {
  async importFile(el, { store }) {
    const file = el.files?.[0];
    if (!file) return null;
    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      throw new Error('That file is not valid JSON');
    }
    store.replace(parsed);
    return 'Backup imported';
  },
};
