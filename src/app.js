// App shell: tabs, rendering, event delegation, toasts, downloads, service worker.

import { createStore } from './store.js';
import { todayISO } from './core/dates.js';
import { platesFor } from './ui/views/plates-ui.js';
import * as today from './ui/views/today.js';
import * as train from './ui/views/train.js';
import * as food from './ui/views/food.js';
import * as body from './ui/views/body.js';
import * as review from './ui/views/review.js';
import * as more from './ui/views/more.js';

const VIEWS = { today, train, food, body, review, more };
const TAB_KEY = 'bulk-tab';
const TOAST_MS = 2200;
const CONFIRM_MS = 3000;

const root = document.getElementById('view');
const tabs = document.getElementById('tabs');
const toastEl = document.getElementById('toast');

const ui = { tab: readTab(), liftId: null, swapFor: null, foodDate: null, openRecipe: null, plateTarget: null };
let pendingConfirm = { key: null, at: 0 };
let toastTimer = null;

const store = createStore({ onChange: () => render(), onError: (err) => toast(err.message, true) });

function readTab() {
  try {
    const t = localStorage.getItem(TAB_KEY);
    return t && VIEWS[t] ? t : 'today';
  } catch {
    return 'today';
  }
}

function writeTab(tab) {
  try { localStorage.setItem(TAB_KEY, tab); } catch { /* storage blocked: tab just won't be remembered */ }
}

function ctx() {
  return { store, ui, today: todayISO(), download, confirmAction };
}

function render() {
  const view = VIEWS[ui.tab];
  try {
    root.innerHTML = view.render(store.get(), ctx());
  } catch (err) {
    root.innerHTML = `<section class="card"><h2>Something broke on this screen</h2><p>${String(err.message).replace(/</g, '&lt;')}</p></section>`;
  }
  for (const b of tabs.querySelectorAll('button')) b.classList.toggle('active', b.dataset.tab === ui.tab);
  tabs.querySelector('[data-tab="train"]').classList.toggle('live', Boolean(store.get().draft));
}

function toast(message, isError = false) {
  if (!message) return;
  toastEl.textContent = message;
  toastEl.className = `toast show ${isError ? 'error' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.className = 'toast'; }, TOAST_MS);
}

// Two taps within 3 s confirm a destructive action (no blocking browser dialogs).
function confirmAction(key) {
  const now = Date.now();
  if (pendingConfirm.key === key && now - pendingConfirm.at < CONFIRM_MS) {
    pendingConfirm = { key: null, at: 0 };
    return true;
  }
  pendingConfirm = { key, at: now };
  return false;
}

async function download(filename, text, type) {
  const file = new File([text], filename, { type });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(file);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function run(fn, ...args) {
  try {
    const message = await fn(...args, ctx());
    render();
    toast(message);
  } catch (err) {
    toast(err.message, true);
  }
}

tabs.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-tab]');
  if (!b) return;
  ui.tab = b.dataset.tab;
  writeTab(ui.tab);
  render();
  window.scrollTo(0, 0);
});

root.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const handler = VIEWS[ui.tab].actions?.[el.dataset.action];
  if (handler) run((c) => handler(el, c));
});

root.addEventListener('submit', (e) => {
  const form = e.target.closest('form[data-form]');
  if (!form) return;
  e.preventDefault();
  const handler = VIEWS[ui.tab].forms?.[form.dataset.form];
  if (handler) run((c) => handler(new FormData(form), c, form));
});

root.addEventListener('change', (e) => {
  const key = e.target.dataset.change;
  if (!key) return;
  if (key === 'liftId') {
    ui.liftId = e.target.value;
    render();
    return;
  }
  const handler = VIEWS[ui.tab].changes?.[key];
  if (handler) run((c) => handler(e.target, c));
});

// Live plate breakdown while typing a barbell weight.
root.addEventListener('input', (e) => {
  if (!e.target.matches('input[data-plates]')) return;
  const hint = e.target.closest('.card')?.querySelector('.plate-hint');
  const kg = Number(String(e.target.value).replace(',', '.'));
  if (hint) hint.textContent = kg > 0 ? platesFor(kg, store.get().settings) : '';
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch((err) => toast(`Offline mode unavailable: ${err.message}`, true));
}

store.load();
