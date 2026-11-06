import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mealSwaps, exerciseSwaps } from '../src/core/swaps.js';
import { perServing, recipeTotals, ingredientMacros } from '../src/core/nutrition.js';
import { toCSV, csvCell } from '../src/core/csv.js';
import { FOODS } from '../src/data/foods.js';
import { RECIPES } from '../src/data/recipes.js';
import { EXERCISES, EXERCISES_BY_ID } from '../src/data/exercises.js';

test('ingredientMacros scales per-100 g values and cost', () => {
  const m = ingredientMacros({ kcal: 200, protein: 20, fat: 10, carbs: 5, audPerKg: 10 }, 250);
  assert.deepEqual(m, { kcal: 500, protein: 50, fat: 25, carbs: 12.5, cost: 2.5 });
});

test('big shake ≈ 1096 kcal, ≈ 62 g protein', () => {
  const s = perServing(RECIPES.find((r) => r.id === 'big_shake'), FOODS);
  assert.ok(Math.abs(s.kcal - 1096) < 2, `${s.kcal}`);
  assert.ok(Math.abs(s.protein - 62) < 1, `${s.protein}`);
});

test('every recipe references known foods and has positive macros', () => {
  for (const r of RECIPES) {
    const t = recipeTotals(r, FOODS);
    assert.ok(t.kcal > 0 && t.protein > 0, r.id);
  }
  assert.throws(() => recipeTotals({ id: 'x', ingredients: [{ food: 'pork', g: 100 }] }, FOODS), /unknown food/);
});

test('no recipe uses an excluded food', () => {
  const banned = /pork|bacon|ham\b|eggplant|aubergine|prawn|shrimp|oyster|mussel|squid|crab|^milk$|cows?_milk/i;
  for (const r of RECIPES) for (const i of r.ingredients) assert.ok(!banned.test(i.food), `${r.id}: ${i.food}`);
  const fish = RECIPES.flatMap((r) => r.ingredients.map((i) => i.food)).filter((f) => /fish|cod|barramundi|snapper|tuna|salmon/.test(f));
  assert.ok(fish.every((f) => /tuna|salmon/.test(f)), `fish other than salmon/tuna: ${fish}`);
});

test('mealSwaps: candidates stay within 10% kcal AND protein', () => {
  const target = { id: 't', kind: 'main', kcal: 800, protein: 50 };
  const candidates = [
    { id: 'a', kind: 'main', kcal: 400, protein: 26 }, // ×2 → 800/52 ✓
    { id: 'b', kind: 'main', kcal: 800, protein: 30 }, // protein −40% ✗
    { id: 'c', kind: 'shake', kcal: 800, protein: 50 }, // wrong kind ✗
    { id: 't', kind: 'main', kcal: 800, protein: 50 }, // itself ✗
  ];
  const swaps = mealSwaps(target, candidates);
  assert.deepEqual(swaps.map((s) => s.meal.id), ['a']);
  assert.equal(swaps[0].servings, 2);
});

test('mealSwaps on real recipes respect the tolerance', () => {
  const meals = RECIPES.map((r) => perServing(r, FOODS));
  for (const m of meals) {
    for (const s of mealSwaps(m, meals)) {
      assert.ok(Math.abs(s.kcal - m.kcal) / m.kcal <= 0.1);
      assert.ok(Math.abs(s.protein - m.protein) / m.protein <= 0.1);
    }
  }
});

test('exerciseSwaps: same group first; shoulder filter drops high-stress', () => {
  const bench = EXERCISES_BY_ID.bench;
  const swaps = exerciseSwaps(bench, EXERCISES, { avoidShoulderStress: true });
  assert.equal(swaps[0].group, 'h_press');
  assert.ok(!swaps.some((e) => e.shoulder === 'high'));
  assert.ok(exerciseSwaps(bench, EXERCISES).some((e) => e.id === 'ring_dip'));
});

test('csv quotes commas, quotes and newlines', () => {
  assert.equal(csvCell('a,b'), '"a,b"');
  assert.equal(csvCell('say "hi"'), '"say ""hi"""');
  assert.equal(csvCell(null), '');
  assert.equal(toCSV([{ d: '2026-11-07', kg: 69.1 }], ['d', 'kg']), 'd,kg\n2026-11-07,69.1\n');
});
