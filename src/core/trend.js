// Trend weight: 7-day rolling mean of morning weigh-ins, and weekly rate of change.

import { addDays, daysBetween, inRange } from './dates.js';
import { mean, linearSlope } from './stats.js';

export const TREND_WINDOW_DAYS = 7;
export const RATE_WINDOW_DAYS = 14;
export const MIN_RATE_POINTS = 7;

export function sortByDate(entries) {
  return [...entries].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

// Mean of weigh-ins in [date-6, date]. Null if none.
export function trendAt(weighIns, date) {
  const start = addDays(date, -(TREND_WINDOW_DAYS - 1));
  const inWindow = weighIns.filter((w) => inRange(w.date, start, date)).map((w) => w.kg);
  return mean(inWindow);
}

export function trendSeries(weighIns) {
  return sortByDate(weighIns).map((w) => ({ date: w.date, kg: w.kg, trend: trendAt(weighIns, w.date) }));
}

export function latestTrend(weighIns, today) {
  const upToToday = weighIns.filter((w) => w.date <= today);
  if (upToToday.length === 0) return null;
  const last = sortByDate(upToToday).at(-1);
  return trendAt(upToToday, last.date);
}

// kg/week from a least-squares fit of raw weigh-ins in the last `windowDays` days.
// A regression over raw points is less sensitive to single noisy days than end-point differences.
export function weeklyRate(weighIns, endDate, windowDays = RATE_WINDOW_DAYS, minPoints = MIN_RATE_POINTS) {
  const start = addDays(endDate, -(windowDays - 1));
  const points = weighIns
    .filter((w) => inRange(w.date, start, endDate))
    .map((w) => ({ x: daysBetween(start, w.date), y: w.kg }));
  if (points.length < minPoints) return null;
  const slopePerDay = linearSlope(points);
  return slopePerDay === null ? null : slopePerDay * 7;
}
