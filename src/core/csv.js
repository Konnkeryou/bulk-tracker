// CSV serialisation (RFC 4180 quoting).

export function csvCell(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCSV(rows, columns) {
  const header = columns.map(csvCell).join(',');
  const body = rows.map((row) => columns.map((c) => csvCell(row[c])).join(','));
  return [header, ...body].join('\n') + '\n';
}

// Flattens workouts into one row per set.
export function workoutSetRows(workouts) {
  return workouts.flatMap((w) =>
    w.sets.map((s, i) => ({ date: w.date, session: w.templateId, set: i + 1, exercise: s.exerciseId, kg: s.kg, reps: s.reps, rir: s.rir })),
  );
}
