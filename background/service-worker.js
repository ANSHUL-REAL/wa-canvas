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

async function migrateLegacyAiKey() {
  const stored = await chrome.storage.local.get(["waCanvasAiCredential", "waCanvasGroqApiKey"]);
  if (!stored.waCanvasAiCredential && stored.waCanvasGroqApiKey) {
    await chrome.storage.local.set({ waCanvasAiCredential: { provider: "groq", endpoint: "https://api.groq.com/openai/v1/chat/completions", model: "llama-3.3-70b-versatile", apiKey: stored.waCanvasGroqApiKey } });
    await chrome.storage.local.remove("waCanvasGroqApiKey");
  }
}

chrome.runtime.onInstalled.addListener(() => {
  ensureSettings().catch((error) => console.error("WA Canvas setup failed", error));
  migrateLegacyAiKey().catch((error) => console.error("WA Canvas AI migration failed", error));
});

chrome.runtime.onStartup.addListener(() => {
  ensureSettings().catch((error) => console.error("WA Canvas startup failed", error));
  migrateLegacyAiKey().catch((error) => console.error("WA Canvas AI migration failed", error));
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "WAC_AI_REQUEST") return;
  (async () => {
    const stored = await chrome.storage.local.get("waCanvasAiCredential");
    const credential = stored.waCanvasAiCredential;
    if (!credential?.apiKey) throw new Error("No AI API key saved. Open AI settings and use Save & test.");
    const endpoint = String(credential.endpoint || "");
    if (!endpoint.startsWith("https://")) throw new Error("The API endpoint must use HTTPS.");
    const text = String(message.text || "").trim();
    if (!text) throw new Error("Paste or type some text first.");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${credential.apiKey}` },
      body: JSON.stringify({
        model: credential.model,
        temperature: 0.4,
        messages: [
          { role: "system", content: "You are a concise WhatsApp writing assistant. Keep the user's language and tone. Return only the requested result, without an introduction." },
          { role: "user", content: `${message.action || "Improve this text"}:\n\n${text.slice(0, 12000)}` }
        ]
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error?.message || `AI provider returned error ${response.status}.`);
    return data?.choices?.[0]?.message?.content?.trim() || "The AI provider returned an empty answer.";
  })().then((result) => sendResponse({ ok: true, result })).catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});
