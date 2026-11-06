// Exercise library for: power cage, barbell + plates, bench, rings, rear cable, 10 kg vest, neck harness.
// group: direct swap group. pattern: broader movement. shoulder: shoulder stress level.
// bodyweight: true → e1RM uses bodyweight + added load (kg field = added load).

const ex = (id, name, group, pattern, muscles, opts = {}) => ({ id, name, group, pattern, muscles, barbell: false, bodyweight: false, shoulder: 'low', ...opts });

export const EXERCISES = Object.freeze([
  ex('back_squat', 'Back squat', 'squat', 'knee', ['quads', 'glutes'], { barbell: true, key: true, shoulder: 'med' }),
  ex('pause_squat', 'Pause squat (3 s)', 'squat', 'knee', ['quads', 'glutes'], { barbell: true, shoulder: 'med' }),
  ex('tempo_squat', 'Tempo squat (4 s down)', 'squat', 'knee', ['quads', 'glutes'], { barbell: true, shoulder: 'med' }),
  ex('front_squat', 'Front squat', 'squat', 'knee', ['quads', 'glutes'], { barbell: true }),
  ex('bulgarian_split_squat', 'Bulgarian split squat', 'single_leg', 'knee', ['quads', 'glutes'], { barbell: true }),
  ex('reverse_lunge', 'Reverse lunge', 'single_leg', 'knee', ['quads', 'glutes']),
  ex('deadlift', 'Deadlift', 'hinge', 'hip', ['glutes', 'hamstrings', 'back'], { barbell: true, key: true }),
  ex('deficit_deadlift', 'Deficit deadlift (5 cm)', 'hinge', 'hip', ['glutes', 'hamstrings', 'back'], { barbell: true }),
  ex('paused_deadlift', 'Paused deadlift (below knee)', 'hinge', 'hip', ['glutes', 'hamstrings', 'back'], { barbell: true }),
  ex('rdl', 'Romanian deadlift', 'hip_hinge_acc', 'hip', ['hamstrings', 'glutes'], { barbell: true }),
  ex('single_leg_rdl', 'Single-leg RDL', 'hip_hinge_acc', 'hip', ['hamstrings', 'glutes'], { barbell: true }),
  ex('bench', 'Bench press', 'h_press', 'h_push', ['chest', 'triceps', 'front_delts'], { barbell: true, key: true, shoulder: 'med' }),
  ex('close_grip_bench', 'Close-grip bench', 'h_press', 'h_push', ['triceps', 'chest'], { barbell: true }),
  ex('paused_bench', 'Paused bench (1 s)', 'h_press', 'h_push', ['chest', 'triceps'], { barbell: true, shoulder: 'med' }),
  ex('floor_press', 'Floor press', 'h_press', 'h_push', ['chest', 'triceps'], { barbell: true }),
  ex('pushup', 'Push-up (vest optional)', 'pushup', 'h_push', ['chest', 'triceps'], { bodyweight: true }),
  ex('ring_pushup', 'Ring push-up', 'pushup', 'h_push', ['chest', 'triceps', 'core'], { bodyweight: true }),
  ex('ring_dip', 'Ring dip', 'dip', 'h_push', ['chest', 'triceps'], { bodyweight: true, shoulder: 'high' }),
  ex('ohp', 'Overhead press', 'v_press', 'v_push', ['front_delts', 'triceps'], { barbell: true, key: true, shoulder: 'high' }),
  ex('landmine_style_press', 'Half-kneeling 1-arm barbell press (bar end in corner)', 'v_press', 'v_push', ['front_delts', 'triceps'], { shoulder: 'med' }),
  ex('pike_pushup', 'Pike push-up', 'v_press', 'v_push', ['front_delts', 'triceps'], { bodyweight: true, shoulder: 'high' }),
  ex('pullup', 'Pull-up (vest optional)', 'v_pull', 'v_pull', ['lats', 'biceps'], { bodyweight: true, key: true }),
  ex('chinup', 'Chin-up (vest optional)', 'v_pull', 'v_pull', ['lats', 'biceps'], { bodyweight: true }),
  ex('ring_pullup', 'Ring pull-up', 'v_pull', 'v_pull', ['lats', 'biceps'], { bodyweight: true }),
  ex('cable_pulldown', 'Cable pulldown', 'v_pull', 'v_pull', ['lats', 'biceps']),
  ex('barbell_row', 'Barbell row', 'h_pull', 'h_pull', ['upper_back', 'lats'], { barbell: true }),
  ex('ring_row', 'Ring row (feet elevated = harder)', 'h_pull', 'h_pull', ['upper_back', 'lats'], { bodyweight: true }),
  ex('ring_face_pull', 'Ring face pull', 'rear_delt', 'h_pull', ['rear_delts', 'upper_back']),
  ex('plate_lateral_raise', 'Lateral raise holding 5 kg plates', 'side_delt', 'v_push', ['side_delts']),
  ex('cable_lateral_raise', 'Cable lateral raise / Y-raise', 'side_delt', 'v_push', ['side_delts']),
  ex('barbell_curl', 'Barbell curl', 'biceps', 'arms', ['biceps']),
  ex('ring_curl', 'Ring curl', 'biceps', 'arms', ['biceps'], { bodyweight: true }),
  ex('cable_pushdown', 'Cable pushdown', 'triceps', 'arms', ['triceps']),
  ex('ring_triceps_ext', 'Ring triceps extension', 'triceps', 'arms', ['triceps'], { bodyweight: true }),
  ex('neck_extension', 'Neck harness extension', 'neck_ext', 'neck', ['neck']),
  ex('neck_iso', 'Neck isometric hold (4 directions, hand resistance)', 'neck_iso', 'neck', ['neck']),
  ex('hanging_leg_raise', 'Hanging leg raise', 'core', 'core', ['abs']),
  ex('calf_raise', 'Standing calf raise (bar on back)', 'calves', 'calves', ['calves'], { barbell: true }),
]);

export const EXERCISES_BY_ID = Object.freeze(Object.fromEntries(EXERCISES.map((e) => [e.id, e])));
export const KEY_LIFTS = EXERCISES.filter((e) => e.key);
