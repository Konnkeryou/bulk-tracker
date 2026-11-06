// Text and card for plate loading.

import { esc, card } from '../dom.js';
import { plateLoad, formatInventory } from '../../core/plates.js';

export const plateOptions = (settings) => ({ barKg: settings.barKg, inventory: settings.plates });

export const platesFor = (kg, settings) => plateText(plateLoad(kg, plateOptions(settings)));

const side = (option) => (option.perSide.length ? option.perSide.join(' + ') : 'empty bar');

export function plateText(result) {
  if (result.exact) return `Per side: ${side(result.below)}`;
  const parts = [];
  if (result.below) parts.push(`${result.below.total} kg (${side(result.below)})`);
  if (result.above) parts.push(`${result.above.total} kg (${side(result.above)})`);
  const max = !result.above ? ` Max with your plates is ${result.maxTotal} kg.` : '';
  return `Can't load exactly. Closest: ${parts.join(' or ')}.${max}`;
}

export function plateCard(state, ui) {
  const target = ui.plateTarget ?? 100;
  const result = plateLoad(target, plateOptions(state.settings));
  return card('Plate calculator', `
    <form data-form="plateCalc" class="row"><input name="kg" inputmode="decimal" value="${target}" aria-label="Target kg"><button>Calculate</button></form>
    <p class="big">${esc(plateText(result))}</p>
    <p class="muted">Bar ${state.settings.barKg} kg · plates ${esc(formatInventory(state.settings.plates))} · max ${result.maxTotal} kg. Unpaired plates can't be used.</p>`);
}
