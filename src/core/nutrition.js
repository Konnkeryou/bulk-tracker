// Recipe macros and cost computed from per-100 g ingredient data.

export function ingredientMacros(food, grams) {
  const f = grams / 100;
  return {
    kcal: food.kcal * f,
    protein: food.protein * f,
    fat: food.fat * f,
    carbs: food.carbs * f,
    cost: (food.audPerKg * grams) / 1000,
  };
}

export function recipeTotals(recipe, foods) {
  const empty = { kcal: 0, protein: 0, fat: 0, carbs: 0, cost: 0 };
  return recipe.ingredients.reduce((sum, { food: id, g }) => {
    const food = foods[id];
    if (!food) throw new Error(`Recipe "${recipe.id}" uses unknown food "${id}"`);
    const m = ingredientMacros(food, g);
    return {
      kcal: sum.kcal + m.kcal,
      protein: sum.protein + m.protein,
      fat: sum.fat + m.fat,
      carbs: sum.carbs + m.carbs,
      cost: sum.cost + m.cost,
    };
  }, empty);
}

export function perServing(recipe, foods) {
  const t = recipeTotals(recipe, foods);
  const n = recipe.servings;
  return {
    id: recipe.id,
    name: recipe.name,
    kind: recipe.kind,
    kcal: t.kcal / n,
    protein: t.protein / n,
    fat: t.fat / n,
    carbs: t.carbs / n,
    cost: t.cost / n,
  };
}
