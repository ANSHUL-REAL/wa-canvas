<div align="center">

<img src="assets/logo.svg" width="88" alt="WA Canvas" />

# WA Canvas

**Make WhatsApp Web feel like your space.**

Themes, wallpapers, privacy blurs, focus modes, accessibility controls and an
optional bring-your-own-key AI panel — as a local layer over WhatsApp Web.

[![CI](https://github.com/ANSHUL-REAL/wa-canvas/actions/workflows/ci.yml/badge.svg)](https://github.com/ANSHUL-REAL/wa-canvas/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-25d366.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-4285F4.svg)](manifest.json)
[![Dependencies](https://img.shields.io/badge/dependencies-0-25d366.svg)](package.json)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-25d366.svg)](CONTRIBUTING.md)

Chrome · Edge · Brave — no build step, no dependencies, no backend of our own.

</div>

> WA Canvas is an independent community project. It is not affiliated with,
> endorsed by, or sponsored by WhatsApp or Meta. WhatsApp is a trademark of its
> respective owner.

---

## Install

1. Download or clone this repository
2. Open `chrome://extensions`
3. Turn on **Developer mode** (top right)
4. Click **Load unpacked** and select the folder containing `manifest.json`
5. Open or refresh [WhatsApp Web](https://web.whatsapp.com/)

Click the toolbar icon for quick toggles, or **Open full settings** for everything.

---

## What it does

### 🎨 Themes and appearance
Nine presets — Light, Dark, AMOLED, Discord, macOS, Material, Minimal,
Glassmorphism, Cyberpunk — plus a fully custom palette. Every preset stays
editable after you pick it.

Typography (five font stacks, size and global scaling), shape (border radius,
three bubble styles), depth (shadows, translucency, backdrop blur, panel
opacity), and motion (animation duration, compact density).

### 🖼 Wallpapers
A local image or any CSS gradient behind your conversation, with blur, dim,
brightness, scale, repeat and position controls. Images are read into
`chrome.storage.local` and **never uploaded anywhere**.

### 🫥 Visual privacy
Blur the chat list, contact names, message previews, avatars, the open
conversation, or media thumbnails — then reveal on hover or by holding a
shortcut. **Panic mode** blurs and darkens the entire interface in one keypress,
and there is a floating panic button on the page.

Read the [honest limits](#honest-limits) below before relying on the online and
typing controls — they change what *you* see, not what the other person sees.

### ⚡ Focus and productivity
Focus, zen, reading, compact and collapsed-sidebar modes. **Quick navigation**
(`Alt+K`) filters your visible chats from the keyboard. Folders, labels, colour
tags and notes are stored on-device.

### ♿ Accessibility
High contrast, colour-blind-friendly palettes, reduced motion, global font
scaling from 80–140%, and visible keyboard focus.

### ✨ AI panel *(optional, bring your own key)*
A side panel that can draft a reply, summarise, improve writing, or translate —
and a microphone button using Chrome's built-in speech recognition.

Works with **xAI/Grok, Groq, OpenAI, OpenRouter, Together AI**, or any
OpenAI-compatible endpoint. It is off until you add a key, and it **only ever
sends the text you typed, pasted or dictated into the box** — never your chats.

### ⌨️ Shortcuts

| Keys | Action |
|---|---|
| `Alt+Shift+P` | Panic mode |
| `Alt+Shift+R` | Hold to reveal blurred content |
| `Alt+Shift+F` | Focus mode |
| `Alt+Shift+Z` | Zen mode |
| `Alt+Shift+S` | Collapse the sidebar |
| `Alt+Shift+A` | Open the AI panel |
| `Alt+K` | Search visible chats |

All seven are editable in settings.

---

## What leaves your device

The short version: **nothing, unless you set up the AI panel and press a button.**

| Feature | Leaves your device? |
|---|---|
| Themes, colours, fonts, layout | No |
| Wallpapers (including uploaded images) | No — stored in `chrome.storage.local` |
| Privacy blurs, panic mode, focus modes | No |
| Folders, labels, tags, notes, favourites | No |
| Analytics, telemetry, crash reports | **None exist** |
| AI panel | **Yes, when you click an AI action** — the text in the box plus your API key go directly to the provider you configured |

There is no WA Canvas server. Nothing is sent to the author. The AI panel talks
straight to your chosen provider, and that request is subject to *their* terms
and privacy policy — not ours.

Your API key is kept in extension storage separately from settings, and is
deliberately excluded from settings export so you cannot leak it by sharing a
config file.

Full detail in [PRIVACY.md](PRIVACY.md).

---

## Honest limits

**"Hide online" and "hide typing" are visual only.** They conceal those
indicators *in your own window*. They do **not** stop WhatsApp telling the other
person that you are online or typing — that happens on WhatsApp's servers, and
no extension can change it. If you want to actually stop it, use WhatsApp's own
privacy settings. Treat these two as decluttering, not concealment.

**Blurs are a screen-privacy tool, not security.** They stop a person walking
past your desk from reading your chats. They do not encrypt anything, and
anyone with access to your unlocked machine can turn them off.

**WhatsApp Web changes without warning.** WA Canvas styles their interface by
targeting elements like `#pane-side` and `#main`. A redesign can break theming
or blurs overnight. This is the normal failure mode of the project and it is
usually a small selector fix — see the [open issues](../../issues).

**AI accuracy is the provider's problem.** Drafts and translations can be wrong
or oddly toned. Read before you send.

**This is a visual layer, on purpose.** WA Canvas does not send messages, bulk
message anyone, scrape contacts, automate anything, touch encryption, or
interfere with WhatsApp's servers. Those aren't missing features — they are
deliberately out of scope, permanently. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## If something looks broken

1. Toolbar icon → flip the **master switch off**. WhatsApp returns to stock instantly.
2. Still odd? Settings → **Reset defaults**.
3. Check the console (F12) for lines mentioning `WA Canvas`, and please
   [open an issue](../../issues/new/choose) with what you find.

---

## Project structure

```
manifest.json           MV3, no build step
assets/                 icons and logo
background/
  service-worker.js     settings bootstrap + the AI proxy request
content/
  content.js            applies everything to WhatsApp Web, owns the on-page UI
  content.css           the CSS variables and classes that styling hangs off
options/                the full settings screen with live preview
popup/                  quick toggles
shared/
  defaults.js           the settings schema and safe merging
  themes.js             every preset palette
  storage.js            load / save / reset / watch
  utils.js              small helpers
ui/base.css             shared styling for popup and options
tools/                  validate and package scripts
```

```bash
node tools/validate.js   # syntax, manifest paths, theme and schema sanity
node tools/pack.js       # build a zip for distribution
```

Two things worth knowing before you edit:

- **`shared/` is ES modules; `content/content.js` is not.** MV3 content scripts
  cannot be modules, so a few helpers are deliberately duplicated there. Change
  both copies or neither.
- **Everything is driven by CSS custom properties.** `content.js` writes
  `--wac-*` variables and toggles `wac-*` classes on `<html>`; `content.css`
  does the actual work. Prefer adding a variable over hard-coding a colour.

---

## Contributing

Bug reports, theme submissions, accessibility improvements, translations and
selector fixes are all welcome — and you do not need to be an expert.

Start with [CONTRIBUTING.md](CONTRIBUTING.md); adding a theme is one object in
one file and makes a great first pull request. There are
[good first issues](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
tagged and waiting.

Please also read the [Code of Conduct](CODE_OF_CONDUCT.md), and report anything
security-related privately via [SECURITY.md](SECURITY.md) rather than as a
public issue.

## License

[MIT](LICENSE) © Anshul Nautiyal — use it, learn from it, improve it, share it.
