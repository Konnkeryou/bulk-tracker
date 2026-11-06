// Food: day log, add from recipes or custom, recipe library with ±10% swaps and AUD cost.

import { esc, n, bar, card, formatDate } from '../dom.js';
import { mealSwaps } from '../../core/swaps.js';
import { append, removeById, newId, parseNumber } from '../../core/ops.js';
import { addDays } from '../../core/dates.js';
import { FOODS } from '../../data/foods.js';
import { MEALS, MEALS_BY_ID, dayTotals, proteinGoal } from '../selectors.js';

const SERVINGS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const KIND_LABEL = { main: 'Mains (batch cook)', shake: 'Shakes', snack: 'Snacks' };

export function render(state, { ui, today }) {
  const date = ui.foodDate || today;
  const entries = state.meals.filter((m) => m.date === date);
  const totals = dayTotals(state, date);
  const protein = proteinGoal(state, today);
  const target = state.settings.targetKcal;

  const list = entries.map((m) => `<li>${esc(m.name)} ${m.servings !== 1 ? `×${m.servings}` : ''} <span class="muted">${n(m.kcal)} kcal · ${n(m.protein)} g</span>
    <button class="link" data-action="deleteMeal" data-id="${m.id}" aria-label="Delete">✕</button></li>`).join('');
  const options = MEALS.map((m) => `<option value="${m.id}">${esc(m.name)} (${n(m.kcal)} kcal)</option>`).join('');

  const day = card(null, `
    <div class="row between"><button class="link" data-action="foodDay" data-delta="-1">◀</button><b>${formatDate(date)}</b><button class="link" data-action="foodDay" data-delta="1" ${date >= today ? 'disabled' : ''}>▶</button></div>
    <p>${n(totals.kcal)} / ${target ?? '—'} kcal</p>${bar(totals.kcal, target || 3000)}
    <p>${n(totals.protein)} / ${n(protein.target)} g protein</p>${bar(totals.protein, protein.target)}
    <ul class="list">${list || '<li class="muted">Nothing logged</li>'}</ul>`);

  const add = card('Add food', `
    <form data-form="addMeal" class="stack"><select name="mealId">${options}</select>
      <div class="row"><select name="servings">${SERVINGS.map((s) => `<option ${s === 1 ? 'selected' : ''}>${s}</option>`).join('')}</select><button>Add</button></div></form>
    <form data-form="addCustom" class="stack"><input name="name" placeholder="Other food (e.g. kebab)" maxlength="60">
      <div class="row"><input name="kcal" inputmode="numeric" placeholder="kcal"><input name="protein" inputmode="decimal" placeholder="protein g"><button>Add</button></div></form>`);

  return day + add + library(ui);
}

function library(ui) {
  const groups = Object.entries(KIND_LABEL).map(([kind, label]) => {
    const items = MEALS.filter((m) => m.kind === kind).map((m) => recipeItem(m, ui.openRecipe === m.id)).join('');
    return `<h3>${esc(label)}</h3>${items}`;
  }).join('');
  return card('Recipes', `${groups}<p class="muted">Macros from USDA FoodData Central / AFCD per-100 g values; costs are rough AUD Nov 2026, edit to your receipts.</p>`);
}

function recipeItem(m, open) {
  const head = `<button class="recipe-head" data-action="toggleRecipe" data-id="${m.id}"><b>${esc(m.name)}</b><span>${n(m.kcal)} kcal · ${n(m.protein)} g P · $${m.cost.toFixed(2)}/serve</span></button>`;
  if (!open) return head;
  const r = m.recipe;
  const ingredients = r.ingredients.map((i) => `<li>${i.g} g ${esc(FOODS[i.food].name)}</li>`).join('');
  const swaps = mealSwaps(m, MEALS).slice(0, 4).map((s) => `<li>${esc(s.meal.name)} ×${s.servings} <span class="muted">${n(s.kcal)} kcal · ${n(s.protein)} g</span></li>`).join('');
  return `${head}<div class="recipe-body">
    <p>Makes ${r.servings}. Per serve: ${n(m.carbs)} g carbs · ${n(m.fat)} g fat.</p>
    <p>${esc(r.method)}</p><ul class="list small">${ingredients}</ul>
    <p><b>Swaps (kcal &amp; protein within 10%)</b></p><ul class="list small">${swaps || '<li class="muted">None within 10%</li>'}</ul></div>`;
}

export const forms = {
  addMeal(data, { store, ui, today }) {
    const m = MEALS_BY_ID[data.get('mealId')];
    const servings = parseNumber(data.get('servings'), { label: 'Servings', min: 0.25, max: 5 });
    const date = ui.foodDate || today;
    store.update((st) => ({ ...st, meals: append(st.meals, { id: newId('meal'), date, recipeId: m.id, name: m.name, servings, kcal: m.kcal * servings, protein: m.protein * servings }) }));
    return `Logged ${m.name}`;
  },
  addCustom(data, { store, ui, today }) {
    const name = String(data.get('name') || '').trim().slice(0, 60) || 'Other food';
    const kcal = parseNumber(data.get('kcal'), { label: 'kcal', min: 0, max: 5000 });
    const protein = parseNumber(data.get('protein'), { label: 'Protein', min: 0, max: 400, allowEmpty: true }) ?? 0;
    const date = ui.foodDate || today;
    store.update((st) => ({ ...st, meals: append(st.meals, { id: newId('meal'), date, recipeId: null, name, servings: 1, kcal, protein }) }));
    return `Logged ${name}`;
  },
};

export const actions = {
  deleteMeal(el, { store }) {
    store.update((st) => ({ ...st, meals: removeById(st.meals, el.dataset.id) }));
  },
  foodDay(el, { ui, today }) {
    const next = addDays(ui.foodDate || today, Number(el.dataset.delta));
    ui.foodDate = next > today ? today : next;
  },
  toggleRecipe(el, { ui }) {
    ui.openRecipe = ui.openRecipe === el.dataset.id ? null : el.dataset.id;
  },
};
