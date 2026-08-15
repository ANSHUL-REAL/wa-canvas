<!-- Lead with the user-visible effect. -->

## What this changes

<!-- One or two sentences. What is different for someone using WA Canvas? -->

## Why

<!-- The bug it fixes or the annoyance it removes. Link an issue if there is one. -->

## How I tested it

<!-- There are no unit tests — the extension working on real WhatsApp Web is the
     only verification that counts. -->

- [ ] `node tools/validate.js` passes
- [ ] Loaded unpacked and refreshed WhatsApp Web
- [ ] Light theme
- [ ] Dark theme
- [ ] At least one colourful theme (which: ______)
- [ ] With a wallpaper on
- [ ] Toggled the feature off again and confirmed WhatsApp returns to normal
- [ ] Master switch off leaves WhatsApp completely untouched

## Checklist

- [ ] No new dependencies
- [ ] New settings are in `DEFAULT_SETTINGS` and rendered from `options.js`
- [ ] Anything that could break the page defaults to **off**
- [ ] Styled through `--wac-*` variables rather than hard-coded colours
- [ ] If I touched `content.js`, I checked whether the duplicated helper in
      `shared/` needs the same change
- [ ] No new network requests, analytics, or automation
- [ ] Settings copy says what the feature actually does — including what it does not

## Privacy impact

<!-- Required if this touches permissions, storage, or anything leaving the
     device. Write "none" if it does not. -->

## Notes for the reviewer

<!-- Anything fragile, any selector you are unsure about. -->
