// Success-metric checks for the Review screen. Each check: {id, label, status, value, target, note}.
// status: 'ok' | 'warn' | 'bad' | 'na'

import { addDays, daysBetween } from './dates.js';
import { latestTrend, trendAt, weeklyRate, sortByDate } from './trend.js';
import { requiredWeeklyRate, dailyIntake, proteinTargets } from './calories.js';
import { e1rmHistory } from './e1rm.js';
import { mean } from './stats.js';

export const WAIST_OK_CM_PER_KG = 0.5; // ≤1 cm waist per 2 kg gained (coaching rule of thumb)
export const WAIST_WARN_CM_PER_KG = 0.8;
export const PHOTO_INTERVAL_DAYS = 28;
export const DEXA_LEAN_SHARE_OK = 0.5;
export const DEXA_LEAN_SHARE_WARN = 0.3;
export const CHECKPOINT_WEEKS = 4;

const check = (id, label, status, value, target, note) => ({ id, label, status, value, target, note });

export function rateCheck({ weighIns, settings }, today) {
  const actual = weeklyRate(weighIns, today);
  const current = latestTrend(weighIns, today);
  const target = current === null ? null : requiredWeeklyRate({ currentKg: current, goalKg: settings.goalKg, today, goalDate: settings.goalDate });
  if (actual === null || target === null) {
    const shown = target === null ? null : `${target.toFixed(2)} kg/wk`;
    return check('rate', 'Trend-weight rate', 'na', null, shown, 'Needs 7+ weigh-ins in the last 14 days.');
  }
  const gap = Math.abs(actual - target);
  const status = gap <= 0.1 ? 'ok' : gap <= 0.25 ? 'warn' : 'bad';
  return check('rate', 'Trend-weight rate', status, `${actual.toFixed(2)} kg/wk`, `${target.toFixed(2)} kg/wk`, 'Least-squares fit of the last 14 days of weigh-ins.');
}

export function waistCheck({ weighIns, waist }, today) {
  const sorted = sortByDate(waist.filter((w) => w.date <= today));
  if (sorted.length < 2) return check('waist', 'Waist vs weight', 'na', null, `≤ ${WAIST_OK_CM_PER_KG} cm/kg`, 'Needs 2+ waist measurements.');
  const first = sorted[0];
  const last = sorted.at(-1);
  const w0 = trendAt(weighIns, first.date);
  const w1 = trendAt(weighIns, last.date);
  if (w0 === null || w1 === null) return check('waist', 'Waist vs weight', 'na', null, null, 'Needs weigh-ins around each waist date.');
  const dKg = w1 - w0;
  const dCm = last.cm - first.cm;
  if (dKg < 1) return check('waist', 'Waist vs weight', 'na', `${dCm.toFixed(1)} cm / ${dKg.toFixed(1)} kg`, null, 'Judged once trend weight is up 1 kg+.');
  const ratio = dCm / dKg;
  const status = ratio <= WAIST_OK_CM_PER_KG ? 'ok' : ratio <= WAIST_WARN_CM_PER_KG ? 'warn' : 'bad';
  return check('waist', 'Waist vs weight', status, `${ratio.toFixed(2)} cm/kg`, `≤ ${WAIST_OK_CM_PER_KG} cm/kg`, `Waist ${signed(dCm)} cm for ${signed(dKg)} kg since ${first.date}.`);
}

// Baseline = best e1RM in the first 14 days logged; current = best in the last 14 days.
export function liftChecks({ workouts, weighIns }, exercises, today) {
  const bodyweightOn = (date) => trendAt(weighIns, date) ?? latestTrend(weighIns, date);
  return exercises.map((ex) => {
    const history = e1rmHistory(workouts.filter((w) => w.date <= today), ex, bodyweightOn);
    if (history.length < 2) return check(`lift-${ex.id}`, ex.name, 'na', null, 'rising e1RM', 'Needs 2+ sessions.');
    const baseEnd = addDays(history[0].date, 13);
    const baseline = Math.max(...history.filter((h) => h.date <= baseEnd).map((h) => h.e1rm));
    const recent = history.filter((h) => h.date >= addDays(today, -13));
    if (recent.length === 0 || history.at(-1).date <= baseEnd) {
      return check(`lift-${ex.id}`, ex.name, 'na', `${baseline.toFixed(1)} kg baseline`, 'rising e1RM', 'Log it again after the baseline fortnight.');
    }
    const current = Math.max(...recent.map((h) => h.e1rm));
    const change = (current - baseline) / baseline;
    const status = change > 0.01 ? 'ok' : change >= -0.01 ? 'warn' : 'bad';
    return check(`lift-${ex.id}`, ex.name, status, `${current.toFixed(1)} kg (${signed(change * 100)}%)`, 'rising e1RM', `Baseline ${baseline.toFixed(1)} kg.`);
  });
}

export function photoCheck({ photos }, today) {
  const last = sortByDate(photos.filter((p) => p.date <= today)).at(-1);
  if (!last) return check('photos', 'Progress photos', 'bad', 'none yet', `every ${PHOTO_INTERVAL_DAYS} days`, 'Take front/side/back photos and tap "Photos taken".');
  const age = daysBetween(last.date, today);
  const status = age <= PHOTO_INTERVAL_DAYS ? 'ok' : age <= PHOTO_INTERVAL_DAYS + 7 ? 'warn' : 'bad';
  return check('photos', 'Progress photos', status, `${age} days ago`, `every ${PHOTO_INTERVAL_DAYS} days`, `Last set ${last.date}. Next due ${addDays(last.date, PHOTO_INTERVAL_DAYS)}.`);
}

export function dexaCheck({ dexa }) {
  const scans = sortByDate(dexa);
  if (scans.length < 2) return check('dexa', 'DEXA lean share', 'na', `${scans.length} scan(s)`, `≥ ${DEXA_LEAN_SHARE_OK * 100}% of gain lean`, 'Optional: scan at the start and at 6 months.');
  const a = scans[0];
  const b = scans.at(-1);
  const dTotal = b.leanKg + b.fatKg - (a.leanKg + a.fatKg);
  if (dTotal <= 0) return check('dexa', 'DEXA lean share', 'na', null, null, 'No mass gained between scans.');
  const share = (b.leanKg - a.leanKg) / dTotal;
  const status = share >= DEXA_LEAN_SHARE_OK ? 'ok' : share >= DEXA_LEAN_SHARE_WARN ? 'warn' : 'bad';
  return check('dexa', 'DEXA lean share', status, `${(share * 100).toFixed(0)}% lean`, `≥ ${DEXA_LEAN_SHARE_OK * 100}%`, `${a.date} → ${b.date}: ${signed(dTotal)} kg total.`);
}

export function intakeChecks({ meals, weighIns, settings }, today) {
  const days = dailyIntake(meals).filter((d) => d.date >= addDays(today, -6) && d.date <= today);
  if (days.length < 3) return [check('kcal', 'Calories (7 days)', 'na', null, null, 'Log 3+ days of food.')];
  const kcal = mean(days.map((d) => d.kcal));
  const protein = mean(days.map((d) => d.protein));
  const bw = latestTrend(weighIns, today);
  const out = [];
  if (settings.targetKcal) {
    const err = Math.abs(kcal - settings.targetKcal) / settings.targetKcal;
    out.push(check('kcal', 'Calories (7-day avg)', err <= 0.05 ? 'ok' : err <= 0.1 ? 'warn' : 'bad', `${Math.round(kcal)} kcal`, `${settings.targetKcal} kcal`, `${days.length} days logged.`));
  }
  if (bw) {
    const p = proteinTargets(bw);
    out.push(check('protein', 'Protein (7-day avg)', protein >= p.min ? 'ok' : protein >= p.min * 0.9 ? 'warn' : 'bad', `${Math.round(protein)} g`, `${Math.round(p.min)}–${Math.round(p.max)} g`, '1.6–2.2 g/kg.'));
  }
  return out;
}

export function checkpointInfo({ settings }, today) {
  const week = Math.floor(daysBetween(settings.bulkStartDate, today) / 7) + 1;
  const next = Math.ceil(Math.max(week, 1) / CHECKPOINT_WEEKS) * CHECKPOINT_WEEKS;
  return { week, nextCheckpointWeek: next, nextCheckpointDate: addDays(settings.bulkStartDate, next * 7 - 1) };
}

export function buildReview(state, keyLifts, today) {
  return [rateCheck(state, today), waistCheck(state, today), ...intakeChecks(state, today), ...liftChecks(state, keyLifts, today), photoCheck(state, today), dexaCheck(state)];
}

function signed(n) {
  return (n >= 0 ? '+' : '') + n.toFixed(1);
}
