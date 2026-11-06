// Calories from calibration data and weekly adjustment rules driven by trend-weight rate.

import { addDays, daysBetween, inRange } from './dates.js';
import { mean, roundTo, clamp } from './stats.js';

export const KCAL_PER_KG = 7700; // approximate energy density of mixed tissue gain/loss
export const KCAL_PER_KG_PER_WEEK = KCAL_PER_KG / 7; // ≈1100 kcal/day per 1 kg/week
export const CALIBRATION_DAYS = 14;
export const MIN_WEIGHINS_PER_WEEK = 4;
export const MIN_INTAKE_DAYS = 10;
export const RATE_TOLERANCE = 0.1; // kg/week either side of target counts as on track
export const MAX_WEEKLY_STEP = 300; // kcal/day change per weekly review
export const KCAL_STEP = 50;

export function dailyIntake(meals) {
  const byDate = meals.reduce((acc, m) => {
    const prev = acc[m.date] || { kcal: 0, protein: 0 };
    return { ...acc, [m.date]: { kcal: prev.kcal + m.kcal, protein: prev.protein + m.protein } };
  }, {});
  return Object.entries(byDate).map(([date, totals]) => ({ date, ...totals }));
}

// Maintenance = average intake − (week-2 mean weight − week-1 mean weight) × 7700 / 7.
export function maintenanceFromCalibration({ weighIns, meals, startDate }) {
  const w1End = addDays(startDate, 6);
  const w2Start = addDays(startDate, 7);
  const w2End = addDays(startDate, CALIBRATION_DAYS - 1);
  const week1 = weighIns.filter((w) => inRange(w.date, startDate, w1End)).map((w) => w.kg);
  const week2 = weighIns.filter((w) => inRange(w.date, w2Start, w2End)).map((w) => w.kg);
  const intakeDays = dailyIntake(meals).filter((d) => inRange(d.date, startDate, w2End));

  const progress = { week1Count: week1.length, week2Count: week2.length, intakeDays: intakeDays.length };
  if (week1.length < MIN_WEIGHINS_PER_WEEK || week2.length < MIN_WEIGHINS_PER_WEEK) {
    return { ok: false, ...progress, reason: `Need ${MIN_WEIGHINS_PER_WEEK}+ weigh-ins in each calibration week` };
  }
  if (intakeDays.length < MIN_INTAKE_DAYS) {
    return { ok: false, ...progress, reason: `Need ${MIN_INTAKE_DAYS}+ days of food logged` };
  }
  const avgIntake = mean(intakeDays.map((d) => d.kcal));
  const weeklyChange = mean(week2) - mean(week1);
  const kcal = roundTo(avgIntake - weeklyChange * KCAL_PER_KG_PER_WEEK, 10);
  return { ok: true, ...progress, avgIntake, weeklyChange, kcal };
}

// Rate needed to reach the goal weight by the goal date, kg/week.
export function requiredWeeklyRate({ currentKg, goalKg, today, goalDate }) {
  const days = daysBetween(today, goalDate);
  if (days <= 0) return null;
  return (goalKg - currentKg) / (days / 7);
}

export function startingTarget(maintenanceKcal, targetRate) {
  return roundTo(maintenanceKcal + targetRate * KCAL_PER_KG_PER_WEEK, KCAL_STEP);
}

// Weekly rule: inside ±tolerance → hold. Otherwise move by the energy gap, capped and rounded.
export function weeklyAdjustment({ actualRate, targetRate, tolerance = RATE_TOLERANCE, maxStep = MAX_WEEKLY_STEP }) {
  if (actualRate === null || targetRate === null) {
    return { action: 'wait', kcal: 0, reason: 'Not enough weigh-ins in the last 14 days (need 7+).' };
  }
  const gap = targetRate - actualRate;
  if (Math.abs(gap) <= tolerance) {
    return { action: 'hold', kcal: 0, reason: `On track: ${fmt(actualRate)} kg/wk vs target ${fmt(targetRate)}.` };
  }
  const kcal = clamp(roundTo(gap * KCAL_PER_KG_PER_WEEK, KCAL_STEP), -maxStep, maxStep);
  const action = kcal > 0 ? 'add' : 'cut';
  const verb = action === 'add' ? 'below' : 'above';
  return { action, kcal, reason: `Gaining ${fmt(actualRate)} kg/wk, ${verb} target ${fmt(targetRate)}.` };
}

export function proteinTargets(bodyKg, perKg = 2.0) {
  return { min: 1.6 * bodyKg, max: 2.2 * bodyKg, target: perKg * bodyKg };
}

function fmt(n) {
  return (n >= 0 ? '+' : '') + n.toFixed(2);
}
