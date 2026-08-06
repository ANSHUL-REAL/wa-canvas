import { STORAGE_KEY, normalizeSettings } from "../shared/defaults.js";
import { loadSettings, saveSettings } from "../shared/storage.js";

async function ensureSettings() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  if (!result[STORAGE_KEY]) await saveSettings(await loadSettings());
  else {
    const normalized = normalizeSettings(result[STORAGE_KEY]);
    await chrome.storage.local.set({ [STORAGE_KEY]: normalized });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  ensureSettings().catch((error) => console.error("WA Canvas setup failed", error));
});

chrome.runtime.onStartup.addListener(() => {
  ensureSettings().catch((error) => console.error("WA Canvas startup failed", error));
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "WAC_GROQ") return;
  (async () => {
    const stored = await chrome.storage.local.get("waCanvasGroqApiKey");
    const apiKey = stored.waCanvasGroqApiKey;
    if (!apiKey) throw new Error("No Groq key saved. Open WA Canvas settings, add the key, and press Save.");
    const text = String(message.text || "").trim();
    if (!text) throw new Error("Paste or type some text first.");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        messages: [
          { role: "system", content: "You are a concise WhatsApp writing assistant. Keep the user's language and tone. Return only the requested result, without an introduction." },
          { role: "user", content: `${message.action || "Improve this text"}:\n\n${text.slice(0, 12000)}` }
        ]
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error?.message || `Groq returned error ${response.status}.`);
    return data?.choices?.[0]?.message?.content?.trim() || "Groq returned an empty answer.";
  })().then((result) => sendResponse({ ok: true, result })).catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});
