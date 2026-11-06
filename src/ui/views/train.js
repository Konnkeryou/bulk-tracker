// Train: start a session from a template, log sets (kg × reps @ RIR), swap exercises, e1RM charts.

import { esc, n, card, formatDate } from '../dom.js';
import { lineChart } from '../chart.js';
import { e1rm, e1rmHistory, systemLoad } from '../../core/e1rm.js';
import { exerciseSwaps } from '../../core/swaps.js';
import { append, removeById, newId, parseNumber } from '../../core/ops.js';
import { trendAt, latestTrend } from '../../core/trend.js';
import { EXERCISES, EXERCISES_BY_ID, KEY_LIFTS } from '../../data/exercises.js';
import { TEMPLATES, TEMPLATES_BY_ID } from '../../data/templates.js';
import { platesFor } from './plates-ui.js';

const RIR_OPTIONS = [0, 1, 2, 3, 4, 5];

const bwOn = (state) => (date) => trendAt(state.weighIns, date) ?? latestTrend(state.weighIns, date);

export function render(state, ctx) {
  return state.draft ? renderDraft(state, ctx) : renderHome(state, ctx);
}

function renderHome(state, { ui }) {
  const starts = TEMPLATES.map((t) => `<button data-action="startSession" data-id="${t.id}">${esc(t.name)}</button>`).join('');
  const lift = EXERCISES_BY_ID[ui.liftId] || KEY_LIFTS[0];
  const history = e1rmHistory(state.workouts, lift, bwOn(state));
  const chart = lineChart([{ points: history.map((h) => ({ date: h.date, y: h.e1rm })), cls: 'line-a', dots: true }]);
  const options = KEY_LIFTS.map((e) => `<option value="${e.id}" ${e.id === lift.id ? 'selected' : ''}>${esc(e.name)}</option>`).join('');
  const best = history.length ? `Best ${n(Math.max(...history.map((h) => h.e1rm)), 1)} kg` : '';
  const recent = [...state.workouts].reverse().slice(0, 8).map((w) => `
    <li><b>${formatDate(w.date)}</b> ${esc(TEMPLATES_BY_ID[w.templateId]?.name || w.templateId)} · ${w.sets.length} sets
    <button class="link" data-action="deleteWorkout" data-id="${w.id}" aria-label="Delete session">✕</button></li>`).join('');

  return card('Start a session', `<div class="stack">${starts}</div>`) +
    card('Estimated 1RM', `<select data-change="liftId">${options}</select>${chart}<p class="muted">${best} · Epley with RIR added to reps. Bodyweight lifts include body mass.</p>`) +
    card('Recent sessions', recent ? `<ul class="list">${recent}</ul>` : '<p class="muted">No sessions yet.</p>');
}

function renderDraft(state, { ui }) {
  const d = state.draft;
  const t = TEMPLATES_BY_ID[d.templateId];
  const blocks = d.exercises.map((id) => exerciseBlock(state, id, ui)).join('');
  const addOptions = EXERCISES.map((e) => `<option value="${e.id}">${esc(e.name)}</option>`).join('');
  return `<p class="lede">${esc(t?.name || 'Session')} · ${formatDate(d.date)}</p>
    ${t?.note ? `<p class="note">${esc(t.note)}</p>` : ''}
    ${blocks}
    ${card('Add exercise', `<form data-form="addExercise" class="row"><select name="exerciseId">${addOptions}</select><button>Add</button></form>`)}
    <div class="row sticky"><button class="primary" data-action="finishSession">Finish &amp; save</button><button class="danger" data-action="discardSession">Discard</button></div>`;
}

function exerciseBlock(state, id, ui) {
  const ex = EXERCISES_BY_ID[id];
  const sets = state.draft.sets.filter((s) => s.exerciseId === id);
  const last = sets.at(-1) || lastSetFor(state.workouts, id);
  const bw = bwOn(state)(state.draft.date);
  const rows = sets.map((s, i) => {
    const load = systemLoad(s, ex, bw);
    const est = load ? e1rm({ load, reps: s.reps, rir: s.rir }) : null;
    return `<li>${i + 1}. ${s.kg} kg × ${s.reps} @RIR ${s.rir} <span class="muted">e1RM ${n(est, 1)}</span>
      <button class="link" data-action="deleteSet" data-id="${s.id}" aria-label="Delete set">✕</button></li>`;
  }).join('');
  const warn = ex.shoulder === 'high' ? '<p class="warn">⚠ High shoulder stress: stop on any pinching pain.</p>' : '';
  const swaps = ui.swapFor === id ? swapList(state, ex) : '';
  const kgLabel = ex.bodyweight ? 'added kg' : 'kg';
  return card(ex.name, `${warn}
    <ul class="list">${rows || '<li class="muted">No sets yet</li>'}</ul>
    <form data-form="addSet" data-ex="${id}" class="setform">
      <label>${kgLabel}<input name="kg" inputmode="decimal" value="${last?.kg ?? (ex.bodyweight ? 0 : '')}" ${ex.barbell ? `data-plates="1"` : ''}></label>
      <label>reps<input name="reps" inputmode="numeric" value="${last?.reps ?? ''}"></label>
      <label>RIR<select name="rir">${RIR_OPTIONS.map((r) => `<option ${r === (last?.rir ?? 2) ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
      <button>Add set</button>
    </form>
    <p class="muted plate-hint">${ex.barbell && last?.kg ? esc(platesFor(last.kg, state.settings)) : ''}</p>
    <div class="row"><button class="link" data-action="toggleSwap" data-id="${id}">Swap</button><button class="link" data-action="removeExercise" data-id="${id}">Remove</button></div>${swaps}`);
}

function swapList(state, ex) {
  const options = exerciseSwaps(ex, EXERCISES, { avoidShoulderStress: state.settings.avoidShoulderStress }).slice(0, 6);
  if (options.length === 0) return '<p class="muted">No swaps for this one.</p>';
  return `<div class="chips">${options.map((o) => `<button data-action="swapExercise" data-from="${ex.id}" data-to="${o.id}">${esc(o.name)}</button>`).join('')}</div>`;
}

function lastSetFor(workouts, id) {
  for (let i = workouts.length - 1; i >= 0; i -= 1) {
    const s = workouts[i].sets.filter((x) => x.exerciseId === id).at(-1);
    if (s) return s;
  }
  return null;
}

const withDraft = (store, fn) => store.update((st) => (st.draft ? { ...st, draft: fn(st.draft) } : st));

export const forms = {
  addSet(data, { store }, form) {
    const exerciseId = form.dataset.ex;
    const ex = EXERCISES_BY_ID[exerciseId];
    const kg = parseNumber(data.get('kg'), { label: ex.bodyweight ? 'Added kg' : 'Weight', min: 0, max: 400 });
    const reps = parseNumber(data.get('reps'), { label: 'Reps', min: 1, max: 100 });
    const rir = parseNumber(data.get('rir'), { label: 'RIR', min: 0, max: 10 });
    withDraft(store, (d) => ({ ...d, sets: append(d.sets, { id: newId('set'), exerciseId, kg, reps: Math.round(reps), rir }) }));
    return `${kg} × ${reps} logged`;
  },
  addExercise(data, { store }) {
    const id = data.get('exerciseId');
    withDraft(store, (d) => (d.exercises.includes(id) ? d : { ...d, exercises: [...d.exercises, id] }));
  },
};

export const actions = {
  startSession(el, { store, today }) {
    const t = TEMPLATES_BY_ID[el.dataset.id];
    store.update((st) => ({ ...st, draft: { id: newId('wo'), date: today, templateId: t.id, exercises: [...t.exercises], sets: [] } }));
  },
  finishSession(_el, { store }) {
    const d = store.get().draft;
    if (!d || d.sets.length === 0) throw new Error('Log at least one set before saving');
    store.update((st) => ({ ...st, workouts: append(st.workouts, { id: d.id, date: d.date, templateId: d.templateId, sets: d.sets }), draft: null }));
    return 'Session saved';
  },
  discardSession(_el, { store, confirmAction }) {
    if (!confirmAction('discard')) return 'Tap Discard again to confirm';
    store.update((st) => ({ ...st, draft: null }));
    return 'Session discarded';
  },
  deleteSet(el, { store }) {
    withDraft(store, (d) => ({ ...d, sets: removeById(d.sets, el.dataset.id) }));
  },
  removeExercise(el, { store }) {
    withDraft(store, (d) => ({ ...d, exercises: d.exercises.filter((x) => x !== el.dataset.id) }));
  },
  toggleSwap(el, { ui }) {
    ui.swapFor = ui.swapFor === el.dataset.id ? null : el.dataset.id;
  },
  swapExercise(el, { store, ui }) {
    const { from, to } = el.dataset;
    ui.swapFor = null;
    withDraft(store, (d) => ({ ...d, exercises: d.exercises.includes(to) ? d.exercises.filter((x) => x !== from) : d.exercises.map((x) => (x === from ? to : x)) }));
    return `Swapped to ${EXERCISES_BY_ID[to].name}`;
  },
  deleteWorkout(el, { store, confirmAction }) {
    if (!confirmAction(`wo-${el.dataset.id}`)) return 'Tap ✕ again to delete the session';
    store.update((st) => ({ ...st, workouts: removeById(st.workouts, el.dataset.id) }));
    return 'Session deleted';
  },
};
