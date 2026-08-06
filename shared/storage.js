import { META_KEY, SCHEMA_VERSION, STORAGE_KEY, normalizeSettings } from "./defaults.js";
export async function loadSettings() { const result = await chrome.storage.local.get([STORAGE_KEY]); return normalizeSettings(result[STORAGE_KEY]); }
export async function saveSettings(settings) { const normalized = normalizeSettings(settings); await chrome.storage.local.set({ [STORAGE_KEY]: normalized, [META_KEY]: { schemaVersion: SCHEMA_VERSION, updatedAt: new Date().toISOString() } }); return normalized; }
export async function resetSettings() { await chrome.storage.local.remove([STORAGE_KEY, META_KEY]); return loadSettings(); }
export function watchSettings(callback) { const listener = (changes, area) => { if (area === "local" && changes[STORAGE_KEY]) callback(normalizeSettings(changes[STORAGE_KEY].newValue)); }; chrome.storage.onChanged.addListener(listener); return () => chrome.storage.onChanged.removeListener(listener); }
