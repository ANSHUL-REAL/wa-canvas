(() => {
  const STORAGE_KEY = "waCanvasSettings";
  const state = { settings: null, revealHeld: false, observer: null, root: null, quickNav: null, aiPanel: null };
  const selectors = {
    app: "#app",
    sidebar: "#pane-side",
    chatRows: "#pane-side [role='listitem'], #pane-side [role='row']",
    conversation: "#main",
    header: "#main > header, #side > header",
    names: "#pane-side [title], #pane-side span[dir='auto']",
    previews: "#pane-side span[title]:not([title='']), #pane-side span[dir='ltr']",
    avatars: "#pane-side img",
    media: "#main img, #main video",
    status: "#main header span"
  };

  function getPath(object, path, fallback) { const value = path.split(".").reduce((current, key) => current?.[key], object); return value ?? fallback; }
  function rgba(hex, opacity) { const value = hex.replace("#", ""); const normalized = value.length === 3 ? value.split("").map((c) => c + c).join("") : value; const number = Number.parseInt(normalized, 16); return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${opacity})`; }
  function fontStack(font) { return ({ system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", inter: "Inter, system-ui, sans-serif", rounded: "'Arial Rounded MT Bold', ui-rounded, sans-serif", serif: "Georgia, 'Times New Roman', serif", mono: "'SFMono-Regular', Consolas, monospace" })[font] ?? font; }
  function setClass(name, active) { document.documentElement.classList.toggle(name, Boolean(active)); }

  function applySettings(settings) {
    state.settings = settings;
    const root = document.documentElement;
    const a = settings.appearance;
    const w = settings.wallpaper;
    root.dataset.waCanvas = settings.enabled ? "enabled" : "disabled";
    root.dataset.waTheme = settings.theme;
    const variables = {
      "--wac-accent": a.accent, "--wac-sidebar": a.sidebar, "--wac-chat": a.chatBackground, "--wac-header": a.header, "--wac-surface": a.surface,
      "--wac-text": a.text, "--wac-muted": a.mutedText, "--wac-outgoing": a.outgoingBubble, "--wac-incoming": a.incomingBubble,
      "--wac-font": fontStack(a.fontFamily), "--wac-font-size": `${a.fontSize * settings.accessibility.fontScale / 100}px`, "--wac-radius": `${a.radius}px`,
      "--wac-speed": `${a.animationSpeed}ms`, "--wac-blur": `${a.blur}px`, "--wac-opacity": `${a.opacity / 100}`, "--wac-shadow": a.shadows ? "0 14px 44px rgba(0,0,0,.22)" : "none",
      "--wac-wallpaper-blur": `${w.blur}px`, "--wac-wallpaper-dim": `${w.dim / 100}`, "--wac-wallpaper-brightness": `${w.brightness}%`, "--wac-wallpaper-size": w.size, "--wac-wallpaper-repeat": w.repeat, "--wac-wallpaper-position": w.position,
      "--wac-ai-width": `${settings.aiPanel.width}px`, "--wac-panel-bg": rgba(a.surface, a.transparency ? a.opacity / 100 : 1)
    };
    for (const [name, value] of Object.entries(variables)) root.style.setProperty(name, value);
    const background = w.mode === "image" && w.dataUrl ? `url("${w.dataUrl}")` : w.mode === "gradient" ? w.gradient : "none";
    root.style.setProperty("--wac-wallpaper", background);
    setClass("wac-transparent", a.transparency); setClass("wac-compact", a.compact); setClass("wac-square-bubbles", a.bubbleStyle === "square"); setClass("wac-pill-bubbles", a.bubbleStyle === "pill");
    setClass("wac-sidebar-collapsed", settings.productivity.sidebarCollapsed); setClass("wac-focus", settings.productivity.focusMode); setClass("wac-zen", settings.productivity.zenMode); setClass("wac-reading", settings.productivity.readingMode);
    setClass("wac-high-contrast", settings.accessibility.highContrast); setClass("wac-reduced-motion", settings.accessibility.reducedMotion); setClass(`wac-cb-${settings.accessibility.colorBlindPalette}`, settings.accessibility.colorBlindPalette !== "none");
    const privacy = settings.privacy; setClass("wac-blur-chat-list", privacy.blurChatList); setClass("wac-blur-names", privacy.blurNames); setClass("wac-blur-previews", privacy.blurPreviews); setClass("wac-blur-avatars", privacy.blurAvatars); setClass("wac-blur-conversation", privacy.blurConversation); setClass("wac-blur-media", privacy.blurMedia); setClass("wac-hide-conversation", privacy.hideConversation); setClass("wac-hide-online", privacy.hideOnline); setClass("wac-hide-typing", privacy.hideTyping); setClass("wac-panic", privacy.panicMode); setClass("wac-reveal-hover", privacy.revealMode === "hover"); setClass("wac-reveal-key", state.revealHeld);
    setClass("wac-wallpaper-active", w.mode !== "none"); setClass("wac-wallpaper-animated", w.animated);
    syncAiPanel();
  }

  async function saveSettings() { if (state.settings) await chrome.storage.local.set({ [STORAGE_KEY]: state.settings }); }
  function toggle(path) { const keys = path.split("."); const last = keys.pop(); const target = keys.reduce((current, key) => current[key], state.settings); target[last] = !target[last]; applySettings(state.settings); saveSettings(); }
  function shortcutMatches(event, shortcut) { const parts = shortcut?.toLowerCase().split("+").map((part) => part.trim()) ?? []; return event.key.toLowerCase() === parts.at(-1) && event.altKey === parts.includes("alt") && event.ctrlKey === parts.includes("ctrl") && event.shiftKey === parts.includes("shift") && event.metaKey === parts.includes("meta"); }

  function createShell() {
    if (document.querySelector("#wac-shell")) return;
    const shell = document.createElement("div"); shell.id = "wac-shell";
    shell.innerHTML = `<button id="wac-assistant-button" aria-label="Open AI assistant" title="AI assistant"><span>AI</span></button><aside id="wac-ai-panel" aria-label="AI assistant panel"><div class="wac-ai-resizer" title="Resize panel"></div><header><div><strong>AI assistant</strong><span>Write, speak, and translate</span></div><div><button data-action="minimize" aria-label="Minimize">-</button><button data-action="close" aria-label="Close">x</button></div></header><section><label class="wac-ai-label" for="wac-ai-input">Message or draft</label><div class="wac-ai-input-wrap"><textarea id="wac-ai-input" placeholder="Paste, type, or use the microphone..."></textarea><button id="wac-microphone" title="Speak into microphone" aria-label="Start microphone">Mic</button></div><div class="wac-ai-actions"><button data-ai-action="Write a friendly, natural reply to this message">Draft reply</button><button data-ai-action="Summarize this clearly in short bullet points">Summarize</button><button data-ai-action="Improve this writing while keeping the same meaning and tone">Improve</button><button data-translate>Translate</button></div><div id="wac-ai-status" role="status"></div><div id="wac-ai-result" hidden><header><b>Result</b><button data-action="copy-result">Copy</button></header><pre></pre></div></section></aside><button id="wac-panic-button" aria-label="Toggle panic mode" title="Panic mode">!</button>`;
    document.body.append(shell); state.aiPanel = shell.querySelector("#wac-ai-panel");
    shell.querySelector("#wac-assistant-button").addEventListener("click", () => toggle("aiPanel.open"));
    shell.querySelector("#wac-panic-button").addEventListener("click", () => toggle("privacy.panicMode"));
    shell.querySelector("[data-action='close']").addEventListener("click", () => toggle("aiPanel.open"));
    shell.querySelector("[data-action='minimize']").addEventListener("click", () => toggle("aiPanel.minimized"));
    shell.querySelectorAll("[data-ai-action]").forEach((button) => button.addEventListener("click", () => runGroq(button.dataset.aiAction)));
    shell.querySelector("[data-translate]").addEventListener("click", () => runAi(`Translate this into ${state.settings.aiPanel.translateTo}. Preserve meaning, names, emojis, and formatting. Return only the translation`));
    shell.querySelector("#wac-microphone").addEventListener("click", startMicrophone);
    shell.querySelector("[data-action='copy-result']").addEventListener("click", async () => { await navigator.clipboard.writeText(shell.querySelector("#wac-ai-result pre").textContent); shell.querySelector("#wac-ai-status").textContent = "Copied."; });
    setupResize(shell.querySelector(".wac-ai-resizer"));
  }

  async function runAi(action) { const input = document.querySelector("#wac-ai-input"); const status = document.querySelector("#wac-ai-status"); const result = document.querySelector("#wac-ai-result"); if (!input.value.trim()) { status.textContent = "Paste, type, or speak some text first."; return; } status.textContent = "AI is thinking..."; result.hidden = true; const response = await chrome.runtime.sendMessage({ type: "WAC_AI_REQUEST", action, text: input.value }); if (!response?.ok) { status.textContent = response?.error || "The AI request failed."; return; } result.querySelector("pre").textContent = response.result; result.hidden = false; status.textContent = "Done."; }
  function runGroq(action) { return runAi(action); }
  function startMicrophone() { const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition; const status = document.querySelector("#wac-ai-status"); if (!Recognition) { status.textContent = "Speech recognition is not supported in this browser."; return; } const recognition = new Recognition(); recognition.lang = state.settings.aiPanel.speechLanguage || "en-US"; recognition.interimResults = true; recognition.continuous = false; const input = document.querySelector("#wac-ai-input"); const button = document.querySelector("#wac-microphone"); let finalText = ""; recognition.onstart = () => { button.classList.add("is-listening"); status.textContent = "Listening..."; }; recognition.onresult = (event) => { finalText = [...event.results].map((item) => item[0].transcript).join(" "); input.value = finalText; }; recognition.onerror = (event) => { status.textContent = `Microphone error: ${event.error}`; }; recognition.onend = () => { button.classList.remove("is-listening"); if (finalText) status.textContent = "Voice added. Choose an AI action."; }; recognition.start(); }
  function syncAiPanel() { if (!state.aiPanel || !state.settings) return; state.aiPanel.classList.toggle("is-open", state.settings.aiPanel.open && state.settings.aiPanel.enabled); state.aiPanel.classList.toggle("is-minimized", state.settings.aiPanel.minimized); document.querySelector("#wac-assistant-button")?.classList.toggle("is-hidden", state.settings.aiPanel.open); }
  function setupResize(handle) { let startX = 0; let startWidth = 0; handle.addEventListener("pointerdown", (event) => { startX = event.clientX; startWidth = state.settings.aiPanel.width; handle.setPointerCapture(event.pointerId); }); handle.addEventListener("pointermove", (event) => { if (!handle.hasPointerCapture(event.pointerId)) return; state.settings.aiPanel.width = Math.min(640, Math.max(280, startWidth + startX - event.clientX)); document.documentElement.style.setProperty("--wac-ai-width", `${state.settings.aiPanel.width}px`); }); handle.addEventListener("pointerup", (event) => { handle.releasePointerCapture(event.pointerId); saveSettings(); }); }

  function createQuickNav() {
    if (state.quickNav) return; const dialog = document.createElement("div"); dialog.id = "wac-quick-nav"; dialog.innerHTML = `<div><header><b>Quick navigation</b><button aria-label="Close">×</button></header><input type="search" placeholder="Search visible chats…" autocomplete="off"><section></section><footer>Enter to open · Esc to close</footer></div>`; document.body.append(dialog); state.quickNav = dialog;
    dialog.querySelector("button").addEventListener("click", closeQuickNav); dialog.addEventListener("click", (event) => { if (event.target === dialog) closeQuickNav(); }); dialog.querySelector("input").addEventListener("input", renderQuickNav); dialog.querySelector("input").addEventListener("keydown", (event) => { if (event.key === "Enter") dialog.querySelector("section button")?.click(); });
  }
  function visibleChats() { return [...document.querySelectorAll(selectors.chatRows)].map((row) => ({ row, name: row.querySelector("[title]")?.getAttribute("title") || row.querySelector("span[dir='auto']")?.textContent?.trim() })).filter((chat) => chat.name); }
  function renderQuickNav() { const input = state.quickNav.querySelector("input"); const query = input.value.toLowerCase(); const results = visibleChats().filter((chat) => chat.name.toLowerCase().includes(query)).slice(0, 10); const section = state.quickNav.querySelector("section"); section.replaceChildren(...results.map((chat) => { const button = document.createElement("button"); button.textContent = chat.name; button.addEventListener("click", () => { chat.row.click(); closeQuickNav(); }); return button; })); if (!results.length) section.innerHTML = "<p>No visible chats found.</p>"; }
  function openQuickNav() { createQuickNav(); state.quickNav.classList.add("is-open"); renderQuickNav(); state.quickNav.querySelector("input").focus(); }
  function closeQuickNav() { state.quickNav?.classList.remove("is-open"); }

  function handleKeydown(event) {
    if (!state.settings || event.repeat) return;
    const s = state.settings.shortcuts;
    if (shortcutMatches(event, s.panic)) { event.preventDefault(); toggle("privacy.panicMode"); }
    else if (shortcutMatches(event, s.focus)) { event.preventDefault(); toggle("productivity.focusMode"); }
    else if (shortcutMatches(event, s.zen)) { event.preventDefault(); toggle("productivity.zenMode"); }
    else if (shortcutMatches(event, s.sidebar)) { event.preventDefault(); toggle("productivity.sidebarCollapsed"); }
    else if (shortcutMatches(event, s.aiPanel)) { event.preventDefault(); toggle("aiPanel.open"); }
    else if (shortcutMatches(event, s.quickNav)) { event.preventDefault(); openQuickNav(); }
    if (shortcutMatches(event, s.reveal)) { state.revealHeld = true; setClass("wac-reveal-key", true); }
    if (event.key === "Escape") closeQuickNav();
  }
  function handleKeyup(event) { if (state.settings && shortcutMatches(event, state.settings.shortcuts.reveal)) { state.revealHeld = false; setClass("wac-reveal-key", false); } }

  function observeApp() { if (state.observer) return; let scheduled = false; state.observer = new MutationObserver(() => { if (scheduled) return; scheduled = true; requestAnimationFrame(() => { scheduled = false; createShell(); }); }); state.observer.observe(document.body, { childList: true, subtree: true }); }
  async function init() { const result = await chrome.storage.local.get(STORAGE_KEY); state.settings = result[STORAGE_KEY]; if (!state.settings) return; createShell(); createQuickNav(); applySettings(state.settings); observeApp(); document.addEventListener("keydown", handleKeydown, true); document.addEventListener("keyup", handleKeyup, true); chrome.storage.onChanged.addListener((changes, area) => { if (area === "local" && changes[STORAGE_KEY]?.newValue) applySettings(changes[STORAGE_KEY].newValue); }); }
  init().catch((error) => console.error("WA Canvas failed to initialize", error));
})();
