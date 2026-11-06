// Session templates. Calibration tests now; the full program templates are added in Step 2.

export const TEMPLATES = Object.freeze([
  {
    id: 'test_a', name: 'Calibration test A',
    note: 'Warm up bar×10, ~40/60/75/85% × 5/3/2/1. One set of 5–8 at RIR 1. Safeties set. Pull-ups/dips: max strict reps.',
    exercises: ['back_squat', 'bench', 'pullup', 'ring_dip'],
  },
  {
    id: 'test_b', name: 'Calibration test B',
    note: 'Deadlift: 120 kg for max reps stopping at RIR 1. OHP 5–8 at RIR 1. Row 8–10 at RIR 1. Push-ups max. Neck: 2×15 empty harness, slow, RIR 3+, stop on any pain/tingling/dizziness.',
    exercises: ['deadlift', 'ohp', 'barbell_row', 'pushup', 'neck_extension'],
  },
  { id: 'free', name: 'Free session', note: 'Add any exercise.', exercises: [] },
]);

export const TEMPLATES_BY_ID = Object.freeze(Object.fromEntries(TEMPLATES.map((t) => [t.id, t])));
