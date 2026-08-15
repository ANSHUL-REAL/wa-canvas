# Changelog

All notable changes to WA Canvas are documented here.

This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
and the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## [Unreleased]

### Documentation
- Rewrote the README with an explicit **what leaves your device** table and an
  **honest limits** section
- Documented plainly that "hide online" and "hide typing" are visual-only and do
  not stop WhatsApp telling the other person — the previous wording could be
  read as real concealment
- Rewrote PRIVACY.md around the current multi-provider AI panel (xAI, Groq,
  OpenAI, OpenRouter, Together AI) instead of only Groq, with a permission-by-
  permission justification
- Expanded CONTRIBUTING.md with the architecture, the two things that trip people
  up (content scripts cannot use ES modules; style through `--wac-*` variables),
  a theme recipe, and an explicit out-of-scope list
- Expanded SECURITY.md with what does and does not count as a vulnerability here
- Added a Code of Conduct, changelog, issue and pull-request templates

### Added
- `tools/validate.js` — checks syntax, manifest paths, theme completeness,
  version consistency, and that the service worker is still the only place that
  makes a network request
- `tools/pack.js` — builds a distributable zip with no dependencies

### Fixed
- The settings sidebar claimed "no external backend" while the AI panel sends
  text to a third-party provider. Reworded to describe what actually happens

## [1.0.0]

First public release.

### Themes and appearance
- Nine presets — Light, Dark, AMOLED, Discord, macOS, Material, Minimal,
  Glassmorphism, Cyberpunk — plus a fully editable custom palette
- Typography, border radius, three bubble styles, shadows, translucency,
  backdrop blur, panel opacity, animation speed, compact density

### Wallpapers
- Local images and CSS gradients with blur, dim, brightness, scale, repeat and
  position. Stored on-device, never uploaded

### Privacy
- Blur the chat list, names, previews, avatars, the conversation or media
- Reveal on hover or by holding a shortcut
- Panic mode, plus a floating panic button

### Productivity and accessibility
- Focus, zen, reading, compact and collapsed-sidebar modes
- Quick navigation over visible chats
- High contrast, colour-blind palettes, reduced motion, 80–140% font scaling
- Seven editable keyboard shortcuts

### AI panel
- Optional, bring-your-own-key. Draft, summarise, improve and translate
- Speech input via Chrome's Web Speech API
- Only ever sends text the user typed, pasted or dictated
