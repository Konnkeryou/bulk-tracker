import { test } from 'node:test';
import assert from 'node:assert/strict';
import { epley, e1rm, isReliable, e1rmHistory, systemLoad } from '../src/core/e1rm.js';

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

test('epley: 100 kg × 5 = 116.67', () => close(epley(100, 5), 116.6666667, 1e-4));
test('epley: a single is the load itself', () => assert.equal(epley(140, 1), 140));
test('epley rejects zero load or zero reps', () => {
  assert.equal(epley(0, 5), null);
  assert.equal(epley(100, 0), null);
});

test('e1rm adds RIR to reps: 100×5 @RIR1 = epley(100, 6) = 120', () => close(e1rm({ load: 100, reps: 5, rir: 1 }), 120));
test('e1rm treats missing/negative RIR as 0', () => {
  close(e1rm({ load: 100, reps: 5 }), epley(100, 5));
  close(e1rm({ load: 100, reps: 5, rir: -2 }), epley(100, 5));
});

test('120 kg deadlift × 10 @RIR1 estimates ≈ 164 kg (near the 160 PR)', () => {
  close(e1rm({ load: 120, reps: 10, rir: 1 }), 164, 1e-6);
});

test('reliability flag beyond 12 effective reps', () => {
  assert.equal(isReliable({ reps: 10, rir: 2 }), true);
  assert.equal(isReliable({ reps: 12, rir: 1 }), false);
});

test('systemLoad: bodyweight lifts add bodyweight to vest load', () => {
  assert.equal(systemLoad({ kg: 10 }, { bodyweight: true }, 69), 79);
  assert.equal(systemLoad({ kg: 0 }, { bodyweight: true }, null), null);
  assert.equal(systemLoad({ kg: 90 }, { bodyweight: false }, 69), 90);
});

test('e1rmHistory picks the best set per session and sorts by date', () => {
  const ex = { id: 'back_squat', bodyweight: false };
  const workouts = [
    { date: '2026-11-10', sets: [{ exerciseId: 'back_squat', kg: 100, reps: 5, rir: 1 }] },
    { date: '2026-11-07', sets: [
      { exerciseId: 'back_squat', kg: 90, reps: 8, rir: 1 },
      { exerciseId: 'back_squat', kg: 100, reps: 3, rir: 2 },
      { exerciseId: 'bench', kg: 50, reps: 8, rir: 1 },
    ] },
  ];
  const h = e1rmHistory(workouts, ex, () => 69);
  assert.deepEqual(h.map((p) => p.date), ['2026-11-07', '2026-11-10']);
  close(h[0].e1rm, 117); // 90 × (1 + 9/30)
  close(h[1].e1rm, 120);
});
