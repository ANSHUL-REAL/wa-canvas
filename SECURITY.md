# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 1.0.x | ✅ |

WA Canvas is distributed as unpacked source. "Upgrading" means pulling the
latest `main` and hitting reload on the extension card.

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Use GitHub's private reporting: **Security → Report a vulnerability** on this
repository.

Include what you can:

- What the flaw allows an attacker to do
- Steps to reproduce, or a proof of concept
- Which file and function you believe is responsible
- Browser and version

**Never paste an API key, private chat text, phone number, or a screenshot
containing personal information into a report** — redact first.

You can expect an acknowledgement within a few days and an honest answer about
whether and when it will be fixed. There is no bounty; this is an unpaid side
project. You will be credited in the release notes unless you'd rather not be.

## What counts as a vulnerability here

The extension runs a content script on `web.whatsapp.com` and stores an API key
in extension storage. Things that matter:

- **API key exposure.** Any path that leaks `waCanvasAiCredential` to the page,
  to a settings export, to the console, or to any host other than the configured
  endpoint. The key is deliberately kept out of exports — a way around that is a
  real bug
- **Data leaving the device unexpectedly.** The AI request in
  `background/service-worker.js` is the only `fetch()` in the project. Any code
  path that sends anything anywhere else, or that puts chat content into that
  request without the user typing it, is serious
- **Injection through page or provider content.** The options page and the
  on-page panel build DOM from stored settings and AI responses. Anywhere
  attacker-influenced text can reach `innerHTML` and execute is a real
  vulnerability
- **Endpoint validation bypass.** The worker requires `https://`. A way to make
  it send a key over plaintext, or to a host the user did not configure, counts
- **Wallpaper data URLs** being made reachable by the page

## What does not count

- **WhatsApp Web changing its markup** and breaking theming or blurs. That is
  the normal failure mode — please open a regular issue
- **Blurs not being real security.** They stop someone reading over your
  shoulder. They are not encryption and were never claimed to be
- **"Hide online" and "hide typing" not hiding you from the other person.**
  Those are visual-only by design and documented as such in the README. WhatsApp
  decides what it tells other people; no extension can change that
- **Your AI provider's handling of what you sent them.** That is between you and
  them — pick a provider whose policy you accept

## Never asked for

WA Canvas will never need your WhatsApp password, verification code, or
encryption keys. **Do not trust any build that asks for them**, and please report
it if you find one distributed under this name.

## Scope note

Vulnerabilities in WhatsApp itself belong to
[Meta's bug bounty programme](https://www.facebook.com/whitehat), not here.
