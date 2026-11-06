import { test } from 'node:test';
import assert from 'node:assert/strict';
import { perSidePlates, plateLoad, parseInventory, formatInventory } from '../src/core/plates.js';

// The user's actual plates: 2×20, 2×15, 2×10, 2×5, 1×2.5 (unpaired).
const MINE = [{ kg: 20, count: 2 }, { kg: 15, count: 2 }, { kg: 10, count: 2 }, { kg: 5, count: 2 }, { kg: 2.5, count: 1 }];
const opts = { barKg: 20, inventory: MINE };

test('unpaired plates are not loadable', () => {
  assert.deepEqual(perSidePlates(MINE), [20, 15, 10, 5]);
});

test('max load is 120 kg', () => assert.equal(plateLoad(120, opts).maxTotal, 120));

test('exact load 120 = 20+15+10+5 per side', () => {
  const r = plateLoad(120, opts);
  assert.equal(r.exact, true);
  assert.deepEqual(r.below.perSide, [20, 15, 10, 5]);
});

test('exact load 60 uses the fewest plates (20 per side)', () => {
  const r = plateLoad(60, opts);
  assert.equal(r.exact, true);
  assert.deepEqual(r.below.perSide, [20]);
});

test('every 10 kg from 20 to 120 is loadable', () => {
  for (let kg = 20; kg <= 120; kg += 10) assert.equal(plateLoad(kg, opts).exact, true, `${kg}`);
});

test('55 kg is not loadable: offers 50 and 60', () => {
  const r = plateLoad(55, opts);
  assert.equal(r.exact, false);
  assert.equal(r.below.total, 50);
  assert.equal(r.above.total, 60);
});

test('above max: no "above" option, below is 120', () => {
  const r = plateLoad(130, opts);
  assert.equal(r.below.total, 120);
  assert.equal(r.above, null);
});

test('below bar weight: suggests empty bar', () => {
  const r = plateLoad(15, opts);
  assert.equal(r.exact, false);
  assert.equal(r.above.total, 20);
});

test('buying a 2nd 2.5 and a pair of 1.25s allows 2.5 kg jumps', () => {
  const inv = [...MINE.filter((p) => p.kg !== 2.5), { kg: 2.5, count: 2 }, { kg: 1.25, count: 2 }];
  for (let kg = 20; kg <= 127.5; kg += 2.5) assert.equal(plateLoad(kg, { barKg: 20, inventory: inv }).exact, true, `${kg}`);
});

test('parseInventory round-trips and validates', () => {
  const inv = parseInventory('20x2, 15x2, 10 x 2, 5×2, 2.5kg x1');
  assert.deepEqual(inv, MINE);
  assert.equal(formatInventory(inv), '20x2, 15x2, 10x2, 5x2, 2.5x1');
  assert.throws(() => parseInventory('twenty'), /Can't read/);
  assert.throws(() => parseInventory(''), /at least one/);
  assert.throws(() => parseInventory('200x2'), /out of range/);
});
