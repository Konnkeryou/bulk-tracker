import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateCheck, waistCheck, photoCheck, dexaCheck, liftChecks, checkpointInfo, buildReview } from '../src/core/review.js';
import { addDays } from '../src/core/dates.js';

const START = '2026-11-07';
const TODAY = addDays(START, 27);
const settings = { goalKg: 80, goalDate: addDays(START, 91), bulkStartDate: START, targetKcal: 3450 };
const gain = (rate) => Array.from({ length: 28 }, (_, i) => ({ date: addDays(START, i), kg: 69 + (rate / 7) * i }));
const base = { weighIns: [], waist: [], meals: [], workouts: [], photos: [], dexa: [], settings };

test('rateCheck: on pace is ok, far behind is bad', () => {
  const onPace = { ...base, weighIns: gain(0.85) };
  assert.equal(rateCheck(onPace, TODAY).status, 'ok');
  const slow = { ...base, weighIns: gain(0.3) };
  assert.equal(rateCheck(slow, TODAY).status, 'bad');
});

test('waistCheck: 1 cm per 4 kg ok; 1 cm per kg bad', () => {
  const weighIns = gain(1); // +~3.9 kg over 27 days
  const ok = waistCheck({ ...base, weighIns, waist: [{ date: START, cm: 76 }, { date: TODAY, cm: 77 }] }, TODAY);
  assert.equal(ok.status, 'ok');
  const bad = waistCheck({ ...base, weighIns, waist: [{ date: START, cm: 76 }, { date: TODAY, cm: 80 }] }, TODAY);
  assert.equal(bad.status, 'bad');
});

test('waistCheck waits until weight is up 1 kg', () => {
  const weighIns = gain(0.1);
  assert.equal(waistCheck({ ...base, weighIns, waist: [{ date: START, cm: 76 }, { date: TODAY, cm: 76.5 }] }, TODAY).status, 'na');
});

test('photoCheck: due every 28 days', () => {
  assert.equal(photoCheck({ photos: [] }, TODAY).status, 'bad');
  assert.equal(photoCheck({ photos: [{ date: START }] }, TODAY).status, 'ok');
  assert.equal(photoCheck({ photos: [{ date: START }] }, addDays(START, 40)).status, 'bad');
});

test('dexaCheck: lean share of gain', () => {
  const dexa = [{ date: START, leanKg: 58, fatKg: 8 }, { date: addDays(START, 180), leanKg: 63, fatKg: 11 }];
  const r = dexaCheck({ dexa });
  assert.equal(r.status, 'ok'); // 5 / 8 = 62.5 %
  assert.equal(dexaCheck({ dexa: dexa.slice(0, 1) }).status, 'na');
});

test('liftChecks: rising e1RM after the baseline fortnight is ok', () => {
  const squat = { id: 'back_squat', name: 'Back squat', bodyweight: false };
  const workouts = [
    { date: START, sets: [{ exerciseId: 'back_squat', kg: 100, reps: 5, rir: 1 }] },
    { date: addDays(START, 25), sets: [{ exerciseId: 'back_squat', kg: 110, reps: 5, rir: 1 }] },
  ];
  const [r] = liftChecks({ ...base, workouts, weighIns: gain(0.85) }, [squat], TODAY);
  assert.equal(r.status, 'ok');
  const [flat] = liftChecks({ ...base, workouts: [workouts[0], { ...workouts[0], date: addDays(START, 25) }], weighIns: gain(0.85) }, [squat], TODAY);
  assert.equal(flat.status, 'warn');
});

test('checkpointInfo: day 1 is week 1, next checkpoint week 4', () => {
  assert.deepEqual(checkpointInfo({ settings }, START), { week: 1, nextCheckpointWeek: 4, nextCheckpointDate: addDays(START, 27) });
  assert.equal(checkpointInfo({ settings }, addDays(START, 30)).nextCheckpointWeek, 8);
});

test('buildReview returns labelled checks with valid statuses', () => {
  const checks = buildReview({ ...base, weighIns: gain(0.85) }, [], TODAY);
  assert.ok(checks.length >= 4);
  for (const c of checks) assert.ok(['ok', 'warn', 'bad', 'na'].includes(c.status), c.id);
});
