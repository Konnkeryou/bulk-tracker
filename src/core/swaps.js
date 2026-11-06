// Swaps: meals that keep kcal AND protein within ±10%, and exercises that train the same pattern.

export const MACRO_TOLERANCE = 0.1;
export const SERVING_STEP = 0.25;

const relErr = (actual, target) => (target === 0 ? (actual === 0 ? 0 : Infinity) : Math.abs(actual - target) / target);

// For each candidate, scale the serving (in 0.25 steps) to match kcal, then test both macros.
export function mealSwaps(meal, candidates, { tolerance = MACRO_TOLERANCE, step = SERVING_STEP } = {}) {
  return candidates
    .filter((c) => c.id !== meal.id && c.kind === meal.kind && c.kcal > 0)
    .map((c) => {
      const servings = Math.max(step, Math.round(meal.kcal / c.kcal / step) * step);
      const kcal = c.kcal * servings;
      const protein = c.protein * servings;
      const kcalErr = relErr(kcal, meal.kcal);
      const proteinErr = relErr(protein, meal.protein);
      return { meal: c, servings, kcal, protein, kcalErr, proteinErr };
    })
    .filter((s) => s.kcalErr <= tolerance && s.proteinErr <= tolerance)
    .sort((a, b) => a.kcalErr + a.proteinErr - (b.kcalErr + b.proteinErr));
}

// Same swap group first, then same pattern. Optionally hide high shoulder-stress options.
export function exerciseSwaps(exercise, library, { avoidShoulderStress = false } = {}) {
  return library
    .filter((e) => e.id !== exercise.id)
    .filter((e) => e.group === exercise.group || e.pattern === exercise.pattern)
    .filter((e) => !(avoidShoulderStress && e.shoulder === 'high'))
    .map((e) => ({ exercise: e, score: (e.group === exercise.group ? 2 : 0) + overlap(e.muscles, exercise.muscles) }))
    .sort((a, b) => b.score - a.score)
    .map((s) => s.exercise);
}

function overlap(a = [], b = []) {
  return a.filter((m) => b.includes(m)).length;
}
