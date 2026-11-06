// App state persisted to IndexedDB on this device only. Updates are immutable: update(fn) → new state.

import { defaultState, migrate, validateState } from './state-schema.js';
import { todayISO } from './core/dates.js';

const DB_NAME = 'bulk-tracker';
const STORE = 'kv';
const KEY = 'state';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db, mode, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export function createStore({ onChange, onError }) {
  let db = null;
  let state = defaultState(todayISO());
  let persisted = false;

  async function load() {
    try {
      db = await openDb();
      const saved = await tx(db, 'readonly', (s) => s.get(KEY));
      state = saved ? migrate(validateState(saved), todayISO()) : state;
      if (!saved) await save(state);
      persisted = navigator.storage?.persist ? await navigator.storage.persist() : false;
    } catch (err) {
      onError(new Error(`Storage unavailable — data won't be saved this session (${err.message})`));
    }
    onChange(state);
  }

  async function save(next) {
    if (!db) return;
    try {
      await tx(db, 'readwrite', (s) => s.put(next, KEY));
    } catch (err) {
      onError(new Error(`Save failed: ${err.message}`));
    }
  }

  function update(fn) {
    const next = fn(state);
    if (next === state) return state;
    state = next;
    save(next);
    onChange(next);
    return next;
  }

  function replace(imported) {
    return update(() => migrate(validateState(imported), todayISO()));
  }

  return { load, update, replace, get: () => state, isPersisted: () => persisted };
}
