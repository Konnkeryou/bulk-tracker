// State shape, defaults, and validation for imports / loaded data.

import { addDays, isISODate } from './core/dates.js';

export const STATE_VERSION = 1;
export const GOAL_WEEKS = 13;

export function defaultState(today) {
  return {
    version: STATE_VERSION,
    settings: {
      heightCm: 189,
      goalKg: 80,
      goalDate: addDays(today, GOAL_WEEKS * 7),
      calibrationStartDate: today,
      bulkStartDate: null,
      maintenanceKcal: null,
      targetKcal: null,
      lastAdjustmentDate: null,
      proteinPerKg: 2.0,
      barKg: 20,
      plates: [{ kg: 20, count: 2 }, { kg: 15, count: 2 }, { kg: 10, count: 2 }, { kg: 5, count: 2 }, { kg: 2.5, count: 1 }],
      avoidShoulderStress: true,
    },
    weighIns: [], // {date, kg}
    waist: [], // {date, cm}
    meals: [], // {id, date, recipeId|null, name, servings, kcal, protein}
    workouts: [], // {id, date, templateId, sets:[{id, exerciseId, kg, reps, rir}]}
    photos: [], // {date}
    dexa: [], // {date, leanKg, fatKg}
    calorieLog: [], // {date, targetKcal, reason}
    draft: null, // in-progress workout
  };
}

const LISTS = {
  weighIns: (x) => isISODate(x.date) && Number.isFinite(x.kg),
  waist: (x) => isISODate(x.date) && Number.isFinite(x.cm),
  meals: (x) => isISODate(x.date) && Number.isFinite(x.kcal) && Number.isFinite(x.protein),
  workouts: (x) => isISODate(x.date) && Array.isArray(x.sets),
  photos: (x) => isISODate(x.date),
  dexa: (x) => isISODate(x.date) && Number.isFinite(x.leanKg) && Number.isFinite(x.fatKg),
  calorieLog: (x) => isISODate(x.date) && Number.isFinite(x.targetKcal),
};

export function validateState(input) {
  if (!input || typeof input !== 'object') throw new Error('Import is not an object');
  if (!input.settings || typeof input.settings !== 'object') throw new Error('Import has no settings');
  for (const [key, ok] of Object.entries(LISTS)) {
    const list = input[key];
    if (!Array.isArray(list)) throw new Error(`Import: ${key} missing`);
    const bad = list.findIndex((x) => !x || !ok(x));
    if (bad >= 0) throw new Error(`Import: ${key}[${bad}] is invalid`);
  }
  return input;
}

// Fills settings added in later versions without dropping user data.
export function migrate(state, today) {
  const defaults = defaultState(today);
  return { ...defaults, ...state, settings: { ...defaults.settings, ...state.settings }, version: STATE_VERSION };
}
