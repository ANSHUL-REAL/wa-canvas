# Privacy Policy

**Last updated: 14 August 2026**

WA Canvas is a local customisation layer for WhatsApp Web. It has no server, no
account, and no analytics. This document describes exactly what is stored and
what — in one specific case — leaves your machine.

## The short version

Nothing leaves your device unless you deliberately set up the AI panel and press
an AI button. When you do, the text in that box and your API key go directly to
the provider *you* chose. They never pass through anything owned by this project.

## What is stored, and where

Everything lives in `chrome.storage.local` on your own machine.

| Stored | Contains |
|---|---|
| `waCanvasSettings` | Theme and colours, typography, layout, wallpaper (including an uploaded image, as a data URL), privacy toggles, focus modes, accessibility options, shortcuts, and your local folders, labels, colour tags, notes and favourites |
| `waCanvasMeta` | Schema version and the timestamp of your last save |
| `waCanvasAiCredential` | Your AI provider, endpoint, model and API key — only if you set one up |

Your API key is kept separate from settings on purpose, and is **excluded from
settings export**, so sharing an exported config cannot leak it.

WA Canvas never asks for and never stores your WhatsApp password, verification
code, phone number, contacts, or message content.

## Network requests

**Normal use makes none.** Themes, wallpapers, blurs, focus modes and
accessibility settings are pure CSS applied in your browser.

**The AI panel is the single exception.** When you click Draft reply, Summarize,
Improve or Translate:

- The extension sends **only the text currently in the AI input box** — text you
  typed, pasted, or dictated yourself
- It goes directly to the endpoint you configured (xAI, Groq, OpenAI,
  OpenRouter, Together AI, or your own OpenAI-compatible endpoint)
- Your API key travels with it, as an `Authorization` header, because that is
  how those APIs authenticate
- The endpoint must be HTTPS; the extension refuses anything else

WA Canvas does **not** read your conversations, does not send anything
automatically, and does not add your chats to the request. Nothing is sent when
the panel is merely open.

Once a request reaches your provider, their terms and privacy policy apply, not
ours. If you would rather nothing ever left the machine, do not configure a key
— every other feature works without one.

Speech recognition uses Chrome's built-in Web Speech API. Depending on your
browser build, Chrome may process that audio on Google's servers; that is a
Chrome behaviour, outside this extension's control, and it only happens while
you hold the microphone button.

## Permissions, and why each exists

| Permission | Why |
|---|---|
| `storage`, `unlimitedStorage` | Save your settings and wallpaper images locally. Wallpapers are large, hence unlimited |
| `https://web.whatsapp.com/*` | Apply theming and controls to the page. This is the only site the content script runs on |
| `https://api.groq.com/*`, `https://api.x.ai/*`, `https://api.openai.com/*`, `https://openrouter.ai/*`, `https://api.together.xyz/*` | Let the background worker reach the AI providers we support out of the box |
| `optional_host_permissions: https://*/*` | **Not granted by default.** Only requested if you point the AI panel at a custom OpenAI-compatible endpoint, since we cannot know that URL in advance. Decline it and the built-in providers still work |

## Analytics and advertising

There are none. No trackers, no pixels, no telemetry, no crash reporting, no
remote configuration, no data sold or shared. There is nowhere for such data to
go, because there is no backend.

## Deleting your data

- **Settings → Reset defaults** clears settings and wallpaper data
- **Remove**, next to the saved API key, deletes the credential
- Uninstalling the extension removes all of its Chrome-managed local storage

## Verifying any of this

This is open-source software you installed yourself from source. Every claim
above can be checked by reading the code — the network request is in
`background/service-worker.js` and is the only `fetch()` in the project.

## Changes

Material changes to this policy will be noted in
[CHANGELOG.md](CHANGELOG.md) alongside the release that makes them.

## Questions

Open an issue, or for anything sensitive follow [SECURITY.md](SECURITY.md).
