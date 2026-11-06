import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maintenanceFromCalibration, requiredWeeklyRate, startingTarget, weeklyAdjustment, dailyIntake, proteinTargets, KCAL_PER_KG_PER_WEEK } from '../src/core/calories.js';
import { addDays } from '../src/core/dates.js';

const START = '2026-11-07';
const days = (n, fn) => Array.from({ length: n }, (_, i) => fn(addDays(START, i), i));

test('dailyIntake sums meals per day', () => {
  const meals = [{ date: 'a', kcal: 500, protein: 30 }, { date: 'a', kcal: 700, protein: 40 }, { date: 'b', kcal: 1000, protein: 50 }];
  assert.deepEqual(dailyIntake(meals), [{ date: 'a', kcal: 1200, protein: 70 }, { date: 'b', kcal: 1000, protein: 50 }]);
});

test('maintenance: 2700 kcal/day and +0.2 kg between weekly means → 2480', () => {
  const weighIns = days(14, (date, i) => ({ date, kg: i < 7 ? 69.0 : 69.2 }));
  const meals = days(14, (date) => ({ date, kcal: 2700, protein: 100 }));
  const r = maintenanceFromCalibration({ weighIns, meals, startDate: START });
  assert.equal(r.ok, true);
  assert.equal(r.kcal, 2480);
});

test('maintenance equals intake when weight is stable', () => {
  const weighIns = days(14, (date) => ({ date, kg: 69 }));
  const meals = days(12, (date) => ({ date, kcal: 2400, protein: 100 }));
  assert.equal(maintenanceFromCalibration({ weighIns, meals, startDate: START }).kcal, 2400);
});

test('maintenance refuses with too few weigh-ins or food days', () => {
  const weighIns = days(14, (date, i) => ({ date, kg: 69 })).filter((_, i) => i % 3 === 0);
  const meals = days(14, (date) => ({ date, kcal: 2400, protein: 100 }));
  assert.equal(maintenanceFromCalibration({ weighIns, meals, startDate: START }).ok, false);
  const full = days(14, (date) => ({ date, kg: 69 }));
  const r = maintenanceFromCalibration({ weighIns: full, meals: meals.slice(0, 9), startDate: START });
  assert.equal(r.ok, false);
  assert.match(r.reason, /food/);
});

test('required rate: 69 → 80 kg in 13 weeks ≈ 0.846 kg/wk', () => {
  const r = requiredWeeklyRate({ currentKg: 69, goalKg: 80, today: '2026-11-07', goalDate: addDays('2026-11-07', 91) });
  assert.ok(Math.abs(r - 11 / 13) < 1e-9);
  assert.equal(requiredWeeklyRate({ currentKg: 69, goalKg: 80, today: '2026-11-07', goalDate: '2026-11-07' }), null);
});

test('starting target = maintenance + rate × 1100, rounded to 50', () => {
  assert.equal(Math.round(KCAL_PER_KG_PER_WEEK), 1100);
  assert.equal(startingTarget(2500, 0.85), 3450); // 2500 + 935 = 3435 → 3450
});

test('weekly rule: within ±0.1 kg/wk holds', () => {
  assert.equal(weeklyAdjustment({ actualRate: 0.78, targetRate: 0.85 }).action, 'hold');
});

test('weekly rule: 0.4 below target adds, capped at +300', () => {
  const r = weeklyAdjustment({ actualRate: 0.45, targetRate: 0.85 });
  assert.equal(r.action, 'add');
  assert.equal(r.kcal, 300);
});

test('weekly rule: 0.2 above target cuts 200', () => {
  const r = weeklyAdjustment({ actualRate: 1.05, targetRate: 0.85 });
  assert.equal(r.action, 'cut');
  assert.equal(r.kcal, -200);
});

test('weekly rule: 0.15 below target adds 150', () => {
  assert.equal(weeklyAdjustment({ actualRate: 0.7, targetRate: 0.85 }).kcal, 150);
});

test('weekly rule waits without data', () => {
  assert.equal(weeklyAdjustment({ actualRate: null, targetRate: 0.85 }).action, 'wait');
});

test('protein targets at 69 kg: 110–152 g, 138 target', () => {
  const p = proteinTargets(69);
  assert.ok(Math.abs(p.min - 110.4) < 1e-9);
  assert.ok(Math.abs(p.max - 151.8) < 1e-9);
  assert.equal(p.target, 138);
});
