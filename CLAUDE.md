# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing website for **Auto Botics** (domain getautobotics.com), an AI agents / automation / chatbots company for small and medium-sized businesses. It is a static site with no build step, no dependencies, and no tests: `index.html`, `styles.css`, `script.js`, and `assets/`.

The source of truth for brand, copy, and visuals is `../Auto_Botics_Brand_Guide_2026.pdf`, which lives in the parent folder and is not in this repo.

The site owner prefers to communicate in Farsi. The site itself is in English.

## Commands

- Run locally: `python -m http.server 8000` from this folder, then open http://localhost:8000
- Deploy: push to `main`. GitHub Pages serves the repo root at https://mitrazaimi-cmd.github.io/getautobotics/ (repo `mitrazaimi-cmd/getautobotics`, public). The custom domain getautobotics.com is not connected yet.
- Visual check without a browser: take a headless Edge screenshot, e.g. `msedge --headless=new --window-size=1440,4200 --screenshot=out.png file:///.../index.html`. Headless Edge will not lay out narrower than about 500px, so for mobile checks load the page inside a 400px-wide `<iframe>` and screenshot that.

## Architecture

**Brand tokens.** Everything is driven by CSS custom properties at the top of `styles.css`. The brand palette is exact and must not drift: Deep Navy `#102A43`, Electric Blue `#1677E8`, Cyan `#19B8E6`, White. `--mist`, `--line`, and `--slate` are supporting tints. Cyan is too low-contrast for text on white, so use it only for accents (path-strip connectors, list bullets, borders on navy). The one typeface is Lexend, loaded from Google Fonts. In the wordmark, "Auto" is navy and "Botics" is blue.

**Page order:** hero, north-star strip, example day (`#example-day`), services, approach, values, contact. The owner asked for this layout: the hero is centered, with the full logo on top and the headline, lede and CTAs below it. The example-day panel sits in its own section, which the nav links to as "Before & after". Don't move the panel back into the hero.

**Example day panel** ("Manual" vs "Automated") is the page's signature interaction, and it spans all three files:
- `index.html`: each task's `.state` and `.time` elements carry `data-manual` / `data-auto` text. The `.total` element carries both values too, but JS animates it instead of swapping it.
- `script.js`: `setMode()` sets `.day[data-mode]`, updates `aria-pressed` on the switch buttons, and swaps text from the data attributes. `countTo()` animates the total in minutes, so if you change task times, also update the hardcoded targets `320` / `10` in `setMode()`.
- `styles.css`: all visual state keys off `.day[data-mode="auto"]`, including the tick fill, time colour, and orbit swoosh rotation. The section has `overflow: hidden` so the swoosh doesn't cause horizontal scroll. The swoosh is hidden below 560px.

The nav collapses to a Menu button at 1000px. With five items, it wraps if that breakpoint is lowered.

**Contact form** has no backend. `script.js` validates name and email, then opens a `mailto:` link to `CONTACT_EMAIL`. That address, `hello@getautobotics.com`, is a placeholder, and it also appears in the footer of `index.html`. Replacing the form with Formspree or Netlify Forms is the intended upgrade.

**Assets.** `assets/logo.png` (full lockup), `mark.png` (AB monogram), `favicon.png`, and `apple-touch-icon.png` were rendered from page 4 of the brand guide PDF with PyMuPDF, then made transparent with Pillow. The robot face inside the mark is transparent, so the mark only reads correctly on light backgrounds, which matches the brand guide's logo rules. To regenerate, render the page region at high DPI rather than extracting the embedded image: the raw image loses its soft mask and comes out as a dark glow.

## Brand and copy rules (from the brand guide)

- Voice: clear business language instead of jargon, confident without hype, practical and outcome-focused, friendly, human. AI gives people time back; it doesn't replace them.
- Core message: "We make AI work for your business." Differentiator: "We understand your business before we automate it."
- Keep the robot detail in the logo subtle. Don't stretch, recolour, or add effects to the logo.
- Don't invent testimonials or client results.
