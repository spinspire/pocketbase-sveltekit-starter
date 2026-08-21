---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality and accessible markup. Use this skill when the user asks to build or beautify web components, pages, applications, landing pages, dashboards, artifacts, or React/HTML/CSS UI. Generates creative, polished code that avoids generic AI aesthetics, then self-checks it against an objective accessibility and quality rubric.
license: MIT (adapted from anthropics/claude-code/plugins/frontend-design)
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices, then audit it against the self-critique rubric before returning.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:

- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: the model is capable of extraordinary creative work. Don't hold back; show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

## Concrete moves (counter the defaults)

Left to its own devices a model drifts to the statistical center — white background, a blue or purple button, the Inter typeface, a single centered card or a three-column grid. Counter each default on purpose:

- **Typography**: commit to one distinctive family that fits the direction — editorial → Fraunces, Playfair Display, Crimson Pro; product → Clash Display, Satoshi, Cabinet Grotesk; technical → IBM Plex, Source Sans 3; code → JetBrains Mono, Fira Code. Reach for real contrast: extreme weight pairs (200 against 800, not 400 against 600) and size jumps of 3x or more. Avoid Space Grotesk — good, but a known convergence trap.
- **Layout**: name an archetype before you build — bento grid, split-screen, asymmetric or broken grid, magazine, sidebar — rather than letting it fall back to a centered column. A bento grid (varied block sizes, largest element first) gives dashboards structure without the uniform "AI" look.
- **Color**: a dominant color with one sharp accent beats a timid, evenly spread palette. Anchor it to a concrete reference — an IDE theme, a cultural or era aesthetic — not generic brand-blue, and give color semantic meaning where it helps.
- **Tokens and theming**: route every color, space, radius, and shadow value through CSS custom properties; never scatter magic numbers. Implement dark mode by redefining those variables under `.dark`, not by restyling. If the user already has a brand or design system, inject its tokens and skip your defaults entirely.
- **Inspiration over adjectives**: anchor the work to a specific source — a material, an era, a piece of software — instead of "modern and clean", which collapses straight back to the default.
- **Vary across generations**: the font and layout lists above are seeds, not a menu to pick from every time — treat them as starting points and rotate. Do not reach for the same direction, type pairing, or palette twice; if a brief resembles one handled before, deliberately diverge. Two interfaces for different products should not be recognizably the same template. Sameness across outputs is itself a failure, even when each one looks fine on its own.

## Self-critique before returning

Models tend to confidently praise their own mediocre output, so do not ask yourself "does this look good?" Instead run the concrete pass/fail checks below and fix every failure before returning the code. These target WCAG 2.2 AA and basic craft — things checkable from the markup, not matters of taste.

Accessibility:

- Body-text contrast is at least 4.5:1; large text (24px+, or 18.66px+ bold) and the borders of UI controls and meaningful icons are at least 3:1. Meaning is never carried by color alone.
- Semantics are native: `<button>` for actions, `<a href>` for navigation, real `<label>`s for inputs; exactly one `<h1>` with headings in order; `<header>`, `<nav>`, `<main>`, and `<footer>` landmarks.
- Every `<img>` has an `alt` attribute (empty `alt=""` when decorative); icon-only controls carry an accessible name.
- First rule of ARIA: prefer a native element over an ARIA role — no ARIA beats wrong ARIA.
- Every interactive element is keyboard-operable and shows a visible focus indicator; the default outline is never removed without a stronger replacement.
- A `<meta name="viewport">` is present and zoom is not disabled; content reflows to a single column with no horizontal scrolling down to 320px wide.

Craft:

- Type follows a deliberate scale; body `line-height` is at least 1.5; line length stays near 45-75 characters; sizes use `rem`/`em`.
- Spacing follows one consistent scale (4/8px steps or tokens), not ad-hoc values.
- A `@media (prefers-reduced-motion: reduce)` block softens or removes non-essential motion, and nothing flashes more than three times per second.
- No generic-default tells survive: not Inter/Roboto/Arial, not a purple-on-white gradient, not a lone centered card when the brief deserves more.
- The result does not read as a default template, nor like a previous generation. If it resembles a common pattern or something already produced, diverge — change the layout archetype, type pairing, or palette — and regenerate.

## Optional validation

Optional, and cross-platform via npm (Windows, Linux, macOS). Use what is present and skip the rest gracefully — never make these hard requirements.

- **Static, no browser**: `npx html-validate <file>` catches invalid markup, missing `alt`, unlabeled controls, and broken or redundant ARIA, fully offline. The cheapest first gate.
- **Rendered DOM (needs a headless browser)**: `npx pa11y --standard WCAG2AA <url>` (or axe-core) covers computed-contrast and accessible-name checks that only surface once the page is rendered.
- **Vision-only self-critique loop (opt-in)**: under a vision-capable model with a headless browser available, render the result with Playwright — its bundled, isolated Chromium, Firefox, or WebKit, never the user's system browser — screenshot it, and critique the image against the rubric above, iterating until it holds. On a text-only model, skip the screenshot and review the code directly.

## Notes

Guidance here is synthesized and reworded from Anthropic's frontend-aesthetics cookbook and the generator/evaluator pattern in ["Harness design for long-running application development"](https://www.anthropic.com/engineering/harness-design-long-running-apps) (2026-03-24), plus Vercel v0 and shadcn/ui theming. Accessibility thresholds come from WCAG 2.2 — contrast [1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), reflow [1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), text spacing [1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), focus visible [2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) — and MDN. Verified 2026-05-27.
