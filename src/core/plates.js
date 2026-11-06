// Plate calculator using only the plates the user owns.
// Plates must go on in pairs, so each plate size gives floor(count / 2) per side.

const UNIT = 0.25; // kg resolution for the subset search

const toUnits = (kg) => Math.round(kg / UNIT);
const fromUnits = (units) => units * UNIT;

export function perSidePlates(inventory) {
  return inventory
    .flatMap(({ kg, count }) => Array.from({ length: Math.floor(count / 2) }, () => kg))
    .sort((a, b) => b - a);
}

// Every achievable per-side load → plate list using the fewest plates.
export function achievablePerSide(inventory) {
  const plates = perSidePlates(inventory);
  const initial = new Map([[0, []]]);
  return plates.reduce((reachable, plate) => {
    const next = new Map(reachable);
    for (const [units, combo] of reachable) {
      const sum = units + toUnits(plate);
      const candidate = [...combo, plate];
      const existing = next.get(sum);
      if (!existing || candidate.length < existing.length) next.set(sum, candidate);
    }
    return next;
  }, initial);
}

function describe(barKg, units, perSide) {
  return { total: barKg + 2 * fromUnits(units), perSide: [...perSide].sort((a, b) => b - a) };
}

// Returns the exact load if possible, else the closest load below and above.
export function plateLoad(targetKg, { barKg, inventory }) {
  const reachable = achievablePerSide(inventory);
  const targetUnits = toUnits((targetKg - barKg) / 2);
  const sums = [...reachable.keys()].sort((a, b) => a - b);
  const maxTotal = barKg + 2 * fromUnits(sums.at(-1));

  if (targetKg < barKg) {
    return { exact: false, below: null, above: describe(barKg, 0, []), maxTotal };
  }
  if (reachable.has(targetUnits)) {
    const exact = describe(barKg, targetUnits, reachable.get(targetUnits));
    return { exact: true, below: exact, above: exact, maxTotal };
  }
  const belowUnits = sums.filter((s) => s < targetUnits).at(-1);
  const aboveUnits = sums.find((s) => s > targetUnits);
  return {
    exact: false,
    below: belowUnits === undefined ? null : describe(barKg, belowUnits, reachable.get(belowUnits)),
    above: aboveUnits === undefined ? null : describe(barKg, aboveUnits, reachable.get(aboveUnits)),
    maxTotal,
  };
}

// Parses "20x2, 15x2, 2.5x1" into [{kg, count}]. Throws on bad input.
export function parseInventory(text) {
  const parts = String(text).split(/[,\n]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) throw new Error('Enter at least one plate, e.g. 20x2');
  return parts.map((part) => {
    const match = part.match(/^(\d+(?:\.\d+)?)\s*(?:kg)?\s*[x×*]\s*(\d+)$/i);
    if (!match) throw new Error(`Can't read "${part}". Use weight x count, e.g. 20x2`);
    const kg = Number(match[1]);
    const count = Number(match[2]);
    if (kg <= 0 || kg > 50 || count < 1 || count > 20) throw new Error(`"${part}" is out of range`);
    return { kg, count };
  });
}

export function formatInventory(inventory) {
  return inventory.map(({ kg, count }) => `${kg}x${count}`).join(', ');
}
