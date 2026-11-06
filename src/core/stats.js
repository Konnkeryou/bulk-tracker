// Small numeric helpers shared by the maths modules.

export function mean(values) {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function roundTo(value, step) {
  return Math.round(value / step) * step;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Least-squares slope of y on x. Returns null if fewer than 2 distinct x values.
export function linearSlope(points) {
  if (points.length < 2) return null;
  const mx = mean(points.map((p) => p.x));
  const my = mean(points.map((p) => p.y));
  const sxx = points.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  if (sxx === 0) return null;
  const sxy = points.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  return sxy / sxx;
}
