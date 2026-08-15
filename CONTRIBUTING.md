# Contributing to WA Canvas

Thanks for helping make WA Canvas better. You do not need to be an expert —
clear bug reports, simpler wording, translations, theme ideas and accessibility
feedback are all real contributions.

If anything here blocks you, open an issue and ask. A question is a valid
contribution.

---

## Getting set up

No build step, no dependencies, no bundler. The extension runs from source.

```bash
git clone https://github.com/<your-username>/wa-canvas.git
cd wa-canvas
node tools/validate.js        # syntax, manifest paths, theme and schema checks
```

Then load it:

1. `chrome://extensions`
2. Developer mode on
3. **Load unpacked** → pick the repo folder
4. After editing, hit ↻ on the extension card, then refresh WhatsApp Web

That's the whole loop.

---

## How the pieces fit

| Location | Runs in | Job |
|---|---|---|
| `content/content.js` | WhatsApp Web page | Reads settings, writes `--wac-*` CSS variables and `wac-*` classes onto `<html>`, and owns the on-page UI (AI panel, panic button, quick nav) |
| `content/content.css` | same | Does the actual visual work. Every theme and blur hangs off the variables and classes above |
| `background/service-worker.js` | extension | Bootstraps default settings, migrates old AI keys, and makes the one AI request. This is the only `fetch()` in the project |
| `options/`, `popup/` | extension pages | The settings UI. Both render from `shared/` |
| `shared/defaults.js` | everywhere | The settings schema and safe deep-merge. The source of truth |
| `shared/themes.js` | everywhere | Every preset palette |

### Two things that will trip you up

**1. `content.js` cannot use ES modules.** MV3 content scripts do not support
`import`, which is why `getPath` and `shortcutMatches` exist in both `shared/`
and `content.js`. If you change one copy, change the other — there is no
compiler to catch it.

**2. Style through variables, not hard-coded values.** `content.js` sets
`--wac-accent`, `--wac-radius`, `--wac-blur` and friends; `content.css` consumes
them. A hard-coded colour will look wrong in nine of the ten themes. Add a
variable instead.

---

## Adding a theme

The best first contribution: **one object in one file**, and the settings UI
picks it up automatically.

In `shared/themes.js`:

```js
nord: {
  label: "Nord",
  description: "Cool arctic blues",              // one short line, shown on the card
  colors: {
    accent: "#88c0d0", sidebar: "#2e3440", chatBackground: "#3b4252",
    header: "#2e3440", surface: "#434c5e", text: "#eceff4",
    mutedText: "#96a0af", outgoingBubble: "#4c6a92", incomingBubble: "#434c5e"
  },
  extras: { radius: 14 }                          // optional appearance overrides
}
```

Checklist:

- [ ] All nine colour keys present — a missing one inherits from whatever was
      applied before and looks broken
- [ ] Readable contrast: aim for WCAG AA (4.5:1) on `text` against `chatBackground`
      and both bubble colours
- [ ] Checked with a wallpaper on and off
- [ ] Screenshot in the pull request

One theme per PR, so each can be judged on its own.

## Adding a setting

1. Add the default to `DEFAULT_SETTINGS` in `shared/defaults.js`. Nested under
   the right group (`appearance`, `privacy`, `productivity`, `accessibility`…)
2. Render a control in the matching `render*()` function in `options/options.js`
   using the existing `toggle()`, `slider()`, `select()` or `color()` helpers —
   they handle binding through `data-path` for you
3. Consume it in `content.js`: either a CSS variable, or `setClass("wac-…", value)`
4. Style the class in `content/content.css`

Anything that could break the page defaults to **off**.

## House style

- Plain modern JavaScript. No build step means no transpiler and no framework
- Settings copy is read by people who are not developers. "Visually conceal
  typing status text only" beats "toggle typing indicator" — say what it
  actually does, including what it does *not* do
- Match the surrounding code
- **No dependencies.** Not one. This ships as source into people's browsers

---

## What will not be merged

These are permanent scope decisions, not open questions:

- **Message automation of any kind** — auto-reply, scheduled sending, bulk or
  mass messaging, auto-forwarding. WA Canvas never sends a message
- **Contact or chat scraping**, exporting other people's data, bulk media
  harvesting
- **Anything that touches encryption**, impersonates a user, or works around
  WhatsApp's security
- **Analytics, telemetry, "anonymous usage stats", remote configuration, or any
  outbound request** other than the AI call the user explicitly triggers
- **Silent AI reads.** Any AI feature must show exactly what will be sent and
  require a deliberate click. Never the conversation, never automatically
- **Features that claim more privacy than they deliver.** "Hide typing" hides it
  in *your* window; a PR that describes it as hiding it from the other person
  will be sent back. Overpromising on privacy is worse than not shipping

---

## Pull requests

1. Branch from `main`: `git checkout -b fix/blur-selector`
2. Run `node tools/validate.js`
3. **Test it in a real browser on real WhatsApp Web.** There are no unit tests;
   the extension working is the only verification that counts. Say what you
   tested and in which themes
4. One logical change per PR
5. Describe the user-visible effect first, the implementation second
6. Flag anything touching permissions, network requests or privacy copy — those
   get a closer read

Commit messages: imperative and specific. `fix chat-list blur after the sidebar
redesign` beats `update content.js`.

## Reporting a bug

WhatsApp Web ships new markup regularly, so "the blur stopped working" is the
most common and most useful report. Please include:

- What broke, and where (chat list / conversation / sidebar / popup / settings)
- Which theme and which toggles were on
- Anything in the console (F12) mentioning `WA Canvas`
- Browser and version

If WhatsApp itself looks broken rather than WA Canvas: flip the master switch
off, confirm it's us, and say so. That one fact saves a lot of guessing.

---

By contributing you agree your work is licensed under the [MIT License](LICENSE),
and that you follow the [Code of Conduct](CODE_OF_CONDUCT.md).
