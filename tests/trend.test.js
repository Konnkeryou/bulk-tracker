import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trendAt, trendSeries, weeklyRate, latestTrend } from '../src/core/trend.js';
import { addDays, daysBetween } from '../src/core/dates.js';

const series = (start, kgs) => kgs.map((kg, i) => ({ date: addDays(start, i), kg }));

test('trendAt averages the 7 days ending on the date', () => {
  const w = series('2026-11-01', [70, 71, 72, 73, 74, 75, 76, 77]);
  assert.equal(trendAt(w, '2026-11-07'), 73); // 70..76
  assert.equal(trendAt(w, '2026-11-08'), 74); // 71..77
});

test('trendAt uses only available days when some are missing', () => {
  const w = [{ date: '2026-11-01', kg: 70 }, { date: '2026-11-05', kg: 72 }];
  assert.equal(trendAt(w, '2026-11-06'), 71);
  assert.equal(trendAt(w, '2026-11-20'), null);
});

test('trendSeries is sorted and does not mutate input', () => {
  const w = [{ date: '2026-11-03', kg: 71 }, { date: '2026-11-01', kg: 70 }];
  const copy = structuredClone(w);
  const out = trendSeries(w);
  assert.deepEqual(out.map((p) => p.date), ['2026-11-01', '2026-11-03']);
  assert.deepEqual(w, copy);
});

test('weeklyRate recovers a clean linear gain of 0.5 kg/week', () => {
  const w = series('2026-11-01', Array.from({ length: 14 }, (_, i) => 69 + (0.5 / 7) * i));
  assert.ok(Math.abs(weeklyRate(w, '2026-11-14') - 0.5) < 1e-9);
});

test('weeklyRate is robust to alternating ±0.6 kg daily noise', () => {
  const w = series('2026-11-01', Array.from({ length: 14 }, (_, i) => 69 + (0.5 / 7) * i + (i % 2 ? 0.6 : -0.6)));
  const rate = weeklyRate(w, '2026-11-14');
  assert.ok(Math.abs(rate - 0.5) < 0.25, `rate ${rate}`);
});

test('weeklyRate returns null with fewer than 7 points', () => {
  const w = series('2026-11-01', [69, 69.2, 69.4, 69.5, 69.6, 69.8]);
  assert.equal(weeklyRate(w, '2026-11-14'), null);
});

test('latestTrend ignores future-dated entries', () => {
  const w = [{ date: '2026-11-01', kg: 70 }, { date: '2026-12-01', kg: 90 }];
  assert.equal(latestTrend(w, '2026-11-02'), 70);
});

test('daysBetween crosses month and DST boundaries cleanly', () => {
  assert.equal(daysBetween('2026-10-01', '2026-10-08'), 7);
  assert.equal(daysBetween('2026-03-28', '2026-04-11'), 14);
});
