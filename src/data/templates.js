// Session templates: calibration tests + the 4-day upper/lower program (see the plan document).

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
  {
    id: 'upper_a', name: 'Upper A (Mon)',
    note: 'Bench 4×5–8 · Weighted pull-up 4×5–8 · Barbell row 3×8–12 · OHP 3×6–10 (pain-free only) · Plate lateral raise 3×12–20 · Ring curl 3×10–15 · Pushdown 3×10–15. Rest 2–3 min on the first two.',
    exercises: ['bench', 'pullup', 'barbell_row', 'ohp', 'plate_lateral_raise', 'ring_curl', 'cable_pushdown'],
  },
  {
    id: 'lower_a', name: 'Lower A (Tue)',
    note: 'Back squat 4×5–8 · RDL 3×6–10 · Bulgarian split squat 3×8–12/leg · Calf raise 4×10–15 · Hanging leg raise 3×10–15 · Neck harness 2×15–20 (RIR 3+).',
    exercises: ['back_squat', 'rdl', 'bulgarian_split_squat', 'calf_raise', 'hanging_leg_raise', 'neck_extension'],
  },
  {
    id: 'upper_b', name: 'Upper B (Thu)',
    note: 'Paused bench 4×6–10 · Chin-up 3×6–10 · Ring row 3×10–15 · Ring dip 3×6–12 (or close-grip bench if shoulder pinches) · Ring face pull 3×15–20 · Lateral raise 3×12–20 · Ring triceps ext 3×10–15.',
    exercises: ['paused_bench', 'chinup', 'ring_row', 'ring_dip', 'ring_face_pull', 'plate_lateral_raise', 'ring_triceps_ext'],
  },
  {
    id: 'lower_b', name: 'Lower B (Fri/Sat)',
    note: 'Deadlift 3×5–8 (at 120 kg: paused or 5 cm deficit) · Tempo squat 3×6–10 · Reverse lunge 3×10/leg · Single-leg RDL 3×8–10/leg · Calf raise 4×10–15 · Neck isometrics 3×10 s each way.',
    exercises: ['deadlift', 'tempo_squat', 'reverse_lunge', 'single_leg_rdl', 'calf_raise', 'neck_iso'],
  },
  { id: 'free', name: 'Free session', note: 'Add any exercise.', exercises: [] },
]);

export const TEMPLATES_BY_ID = Object.freeze(Object.fromEntries(TEMPLATES.map((t) => [t.id, t])));
