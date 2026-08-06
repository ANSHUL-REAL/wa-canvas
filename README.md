# WA Canvas

Make WhatsApp Web feel like your space. WA Canvas is a free, open-source Chrome extension with colorful themes, custom chat backgrounds, privacy tools, accessibility controls, focus modes, shortcuts, and optional Groq-powered writing help.

> WA Canvas is an independent community project. It is not affiliated with, endorsed by, or sponsored by WhatsApp or Meta. WhatsApp is a trademark of its respective owner.

## Why people might like it

- Pick from Light, Dark, AMOLED, Discord, macOS, Material, Minimal, Glass, Cyberpunk, or your own colors.
- Add a local wallpaper or gradient without uploading it anywhere.
- Blur names, previews, avatars, media, or the whole conversation when someone walks past.
- Use panic, focus, zen, reading, compact, and collapsed-sidebar modes.
- Improve readability with larger text, stronger contrast, reduced motion, and color-blind-friendly palettes.
- Find visible chats quickly with a keyboard command.
- Use your own Grok/xAI, Groq, OpenAI, OpenRouter, Together AI, or custom OpenAI-compatible API to draft replies, summarize, translate, and improve writing.
- Speak into the AI panel with Chrome's microphone-powered speech recognition.

## Install it locally

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the folder containing `manifest.json`.
6. Open or refresh [WhatsApp Web](https://web.whatsapp.com/).

Open the extension popup and choose **Open full settings** to customize everything.

## AI setup

AI is completely optional.

1. Create an API key with your chosen provider.
2. Open **WA Canvas settings → AI-ready panel**.
3. Choose the provider, endpoint, and model, then paste your key.
4. Click **Save & test**.
5. Refresh WhatsApp Web and click the floating **AI** button.

The extension sends only the text you manually type, paste, or dictate into the AI box. It does not automatically read or upload your chats. AI usage is subject to your chosen provider's terms and privacy policy.

## Privacy, safety, and WhatsApp rules

WA Canvas is designed as a visual customization layer. It does not send messages automatically, bulk-message people, scrape contacts, bypass encryption, impersonate users, modify WhatsApp servers, or evade platform security.

Most settings, shortcuts, and wallpapers stay in `chrome.storage.local` on your device. The Groq API key is stored separately in extension storage and is never included in exported WA Canvas settings. There is no analytics or advertising code.

No third-party extension can promise permanent compatibility or guarantee that an account will never be affected by future platform-policy changes. Use WA Canvas responsibly, review the source, and follow the current WhatsApp Terms of Service. See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md) for details.

## Default shortcuts

- `Alt+Shift+P` — Panic mode
- `Alt+Shift+R` — Hold to reveal blurred content
- `Alt+Shift+F` — Focus mode
- `Alt+Shift+Z` — Zen mode
- `Alt+Shift+S` — Collapse the sidebar
- `Alt+Shift+A` — Open the AI panel
- `Alt+K` — Search visible chats

You can change every shortcut in settings.

## Help build it

WA Canvas belongs to everyone who wants a calmer, more personal WhatsApp Web experience. Bug reports, theme ideas, accessibility improvements, translations, documentation fixes, and careful new features are welcome.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Keep contributions privacy-first, user-triggered, understandable, and respectful of WhatsApp's rules.

## Project structure

- `background/` — settings setup and Groq requests
- `content/` — WhatsApp Web styling and on-page controls
- `options/` — the full settings screen and preview
- `popup/` — quick controls
- `shared/` — defaults, themes, storage, and helpers
- `assets/` — local icons and branding

## License

Released under the [MIT License](LICENSE). You can use it, learn from it, improve it, and share it.
