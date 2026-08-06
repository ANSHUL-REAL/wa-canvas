import { loadSettings, saveSettings } from "../shared/storage.js";
import { THEMES, applyTheme } from "../shared/themes.js";
import { getByPath, setByPath } from "../shared/utils.js";

let settings = await loadSettings();
const toast = document.querySelector("#toast");
const themeSelect = document.querySelector("#theme");
for (const [id, theme] of Object.entries(THEMES)) themeSelect.add(new Option(theme.label, id));
function render() { document.querySelector("#enabled").checked = settings.enabled; themeSelect.value = settings.theme; document.querySelector("#status-title").textContent = settings.enabled ? "Enhancements active" : "Enhancements paused"; document.querySelectorAll("[data-toggle]").forEach((button) => button.classList.toggle("is-active", Boolean(getByPath(settings, button.dataset.toggle)))); }
async function commit(message) { settings = await saveSettings(settings); render(); toast.textContent = message; toast.classList.add("is-visible"); setTimeout(() => toast.classList.remove("is-visible"), 1400); }
document.querySelector("#enabled").addEventListener("change", (event) => { settings.enabled = event.target.checked; commit(settings.enabled ? "WA Canvas enabled" : "WA Canvas paused"); });
document.querySelectorAll("[data-toggle]").forEach((button) => button.addEventListener("click", () => { const path = button.dataset.toggle; setByPath(settings, path, !getByPath(settings, path)); commit(`${button.querySelector("b").textContent} updated`); }));
themeSelect.addEventListener("change", () => { settings = applyTheme(settings, themeSelect.value); commit(`${THEMES[themeSelect.value].label} theme applied`); });
document.querySelector("#open-options").addEventListener("click", () => chrome.runtime.openOptionsPage());
document.querySelector("#open-whatsapp").addEventListener("click", () => chrome.tabs.create({ url: "https://web.whatsapp.com/" }));
render();
