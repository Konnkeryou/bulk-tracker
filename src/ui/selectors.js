// Derived values shared by views.

import { latestTrend, weeklyRate } from '../core/trend.js';
import { maintenanceFromCalibration, requiredWeeklyRate, startingTarget, weeklyAdjustment, dailyIntake, proteinTargets } from '../core/calories.js';
import { daysBetween, addDays } from '../core/dates.js';
import { perServing } from '../core/nutrition.js';
import { FOODS } from '../data/foods.js';
import { RECIPES } from '../data/recipes.js';

export const MEALS = Object.freeze(RECIPES.map((r) => ({ ...perServing(r, FOODS), recipe: r })));
export const MEALS_BY_ID = Object.freeze(Object.fromEntries(MEALS.map((m) => [m.id, m])));
export const ADJUST_INTERVAL_DAYS = 7;

export function bodyweight(state, today) {
  return latestTrend(state.weighIns, today);
}

export function targetRate(state, today) {
  const current = bodyweight(state, today);
  if (current === null) return null;
  const { goalKg, goalDate } = state.settings;
  return requiredWeeklyRate({ currentKg: current, goalKg, today, goalDate });
}

export function calibration(state, today) {
  const start = state.settings.calibrationStartDate;
  const day = daysBetween(start, today) + 1;
  const result = maintenanceFromCalibration({ weighIns: state.weighIns, meals: state.meals, startDate: start });
  return { start, day, done: day > 14, end: addDays(start, 13), result };
}

export function suggestedStart(state, today) {
  const cal = calibration(state, today);
  const rate = targetRate(state, today);
  if (!cal.result.ok || rate === null) return null;
  return { maintenance: cal.result.kcal, rate, target: startingTarget(cal.result.kcal, rate) };
}

export function weeklySuggestion(state, today) {
  const { bulkStartDate, lastAdjustmentDate } = state.settings;
  if (!bulkStartDate) return null;
  const since = lastAdjustmentDate || bulkStartDate;
  const daysSince = daysBetween(since, today);
  const adj = weeklyAdjustment({ actualRate: weeklyRate(state.weighIns, today), targetRate: targetRate(state, today) });
  return { ...adj, due: daysSince >= ADJUST_INTERVAL_DAYS, nextDue: addDays(since, ADJUST_INTERVAL_DAYS) };
}

export function dayTotals(state, date) {
  return dailyIntake(state.meals.filter((m) => m.date === date))[0] || { date, kcal: 0, protein: 0 };
}

export function proteinGoal(state, today) {
  const bw = bodyweight(state, today) ?? 69;
  return proteinTargets(bw, state.settings.proteinPerKg);
}
