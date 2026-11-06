import { test } from 'node:test';
import assert from 'node:assert/strict';
import { upsertByDate, removeById, parseNumber } from '../src/core/ops.js';
import { validateState, defaultState } from '../src/state-schema.js';

test('upsertByDate replaces same-date entry, keeps order, does not mutate', () => {
  const list = Object.freeze([{ date: '2026-11-08', kg: 69.4 }, { date: '2026-11-07', kg: 69.0 }]);
  const out = upsertByDate(list, { date: '2026-11-07', kg: 69.2 });
  assert.deepEqual(out, [{ date: '2026-11-07', kg: 69.2 }, { date: '2026-11-08', kg: 69.4 }]);
  assert.equal(list[1].kg, 69.0);
});

test('removeById filters out one item', () => {
  assert.deepEqual(removeById([{ id: 'a' }, { id: 'b' }], 'a'), [{ id: 'b' }]);
});

test('parseNumber accepts comma decimals and validates range', () => {
  assert.equal(parseNumber('69,4', { label: 'Weight', min: 30, max: 200 }), 69.4);
  assert.throws(() => parseNumber('abc', { label: 'Weight', min: 30, max: 200 }), /Weight: enter a number/);
  assert.throws(() => parseNumber('300', { label: 'Weight', min: 30, max: 200 }), /between/);
  assert.equal(parseNumber('', { label: 'x', min: 0, max: 1, allowEmpty: true }), null);
});

test('validateState accepts defaults and rejects junk imports', () => {
  const s = defaultState('2026-11-07');
  assert.deepEqual(validateState(s), s);
  assert.throws(() => validateState({ version: 1 }), /settings/);
  assert.throws(() => validateState({ settings: {} }), /weighIns missing/);
  assert.throws(() => validateState({ ...s, weighIns: [{ date: 'nope', kg: 70 }] }), /weighIns/);
  assert.throws(() => validateState(null), /not an object/);
});

test('defaultState: goal 80 kg about 3 months out, user plates', () => {
  const s = defaultState('2026-11-07');
  assert.equal(s.settings.goalKg, 80);
  assert.equal(s.settings.goalDate, '2027-02-06');
  assert.equal(s.settings.plates.length, 5);
});
