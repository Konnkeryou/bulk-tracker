// Estimated one-rep max (Epley), with reps-in-reserve added to reps performed.
// e1RM = load × (1 + (reps + RIR) / 30). A set of 1 rep at RIR 0 returns the load itself.

export const RELIABLE_MAX_REPS = 12;

export function epley(load, reps) {
  if (!(load > 0) || !(reps >= 1)) return null;
  if (reps === 1) return load;
  return load * (1 + reps / 30);
}

export function e1rm({ load, reps, rir = 0 }) {
  const safeRir = Number.isFinite(rir) && rir > 0 ? rir : 0;
  return epley(load, reps + safeRir);
}

export function isReliable({ reps, rir = 0 }) {
  return reps + (rir || 0) <= RELIABLE_MAX_REPS;
}

// Total load moved. Bodyweight lifts count body mass plus added load (vest/belt).
export function systemLoad(set, exercise, bodyweightKg) {
  if (exercise?.bodyweight) {
    return bodyweightKg ? bodyweightKg + (set.kg || 0) : null;
  }
  return set.kg;
}

// Best e1RM per workout date for one exercise: [{date, e1rm, reliable}].
export function e1rmHistory(workouts, exercise, bodyweightOn) {
  return workouts
    .map((w) => {
      const sets = w.sets.filter((s) => s.exerciseId === exercise.id && s.reps > 0);
      const estimates = sets
        .map((s) => {
          const load = systemLoad(s, exercise, bodyweightOn(w.date));
          const value = load ? e1rm({ load, reps: s.reps, rir: s.rir }) : null;
          return value ? { value, reliable: isReliable(s) } : null;
        })
        .filter(Boolean);
      if (estimates.length === 0) return null;
      const best = estimates.reduce((a, b) => (b.value > a.value ? b : a));
      return { date: w.date, e1rm: best.value, reliable: best.reliable };
    })
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}
