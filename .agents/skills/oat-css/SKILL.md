---
name: oat-css
description: Our preferred CSS framework — ultra-lightweight, semantic HTML UI library (~8KB). Style web UIs with semantic HTML and minimal classes. Override with app-level SCSS only when necessary.
license: MIT
authors: "SpinSpire Team"
---

# Oat CSS

Oat is an ultra-lightweight (~8KB min+gz), zero-dependency, semantic HTML/CSS/JS UI library by [Kailash Nadh](https://nadh.in) (5k+ stars on [GitHub](https://github.com/knadh/oat)). It styles native HTML elements out of the box — no classes needed for basic UIs. Dynamic components use WebComponents with minimal JS.

**Philosophy:** Semantic tags and attributes are styled contextually without classes, forcing best practices and reducing markup class pollution. Only reach for custom CSS when Oat's defaults don't cover your use case.

## Installation

### npm (SvelteKit, Vite, etc.)

```
bun add @knadh/oat
```

In your app entry or root SCSS:

```scss
@import '@knadh/oat/oat.min.css';
```

Import the JS for dynamic components (dialog, dropdown, tabs, toast, tooltip, sidebar):

```ts
import '@knadh/oat/oat.min.js';
```

Or selectively import individual files from `@knadh/oat/css/` and `@knadh/oat/js/`.

### CDN

```html
<link rel="stylesheet" href="https://unpkg.com/@knadh/oat/oat.min.css">
<script src="https://unpkg.com/@knadh/oat/oat.min.js" defer></script>
```

## Core Principle

**Use semantic HTML. Oat styles elements based on their tag and ARIA attributes, not CSS classes.**

```html
<!-- ❌ Class-heavy approach you DON'T need with Oat -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Title</h3>
  </div>
  <div class="card-body">
    <p>Content</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Save</button>
  </div>
</div>

<!-- ✅ Semantic HTML — Oat styles this automatically -->
<article class="card">
  <header>
    <h3>Title</h3>
  </header>
  <p>Content</p>
  <footer>
    <button>Save</button>
  </footer>
</article>
```

## When to Add Custom CSS/SCSS

Only override when:

1. **Brand colors** — redefine CSS variables in `:root` (see Theming below)
2. **Layout** — use Oat's `.hstack`, `.vstack`, `.container`/`.row`/`.col-*` grid, or add your own
3. **Complex compositions** — recipes like stats cards, split buttons, form cards
4. **Custom animations or interactions** — Oat doesn't ship opinionated transitions beyond the basics

Every Oat component below is purely semantic HTML. No custom CSS needed.

## Components

### Typography

```html
<h1>Heading 1</h1>  <h2>Heading 2</h2>  <h3>Heading 3</h3>
<p>Paragraph with <strong>bold</strong>, <em>italic</em>, and <a href="#">a link</a>.</p>
<pre><code>code block</code></pre>
<blockquote>Blockquote</blockquote>
<hr>
<ul><li>List item</li></ul>
<ol><li>Ordered item</li></ol>
```

### Button

`<button>` is styled by default. Use `data-variant` for semantics, `.outline`/`.ghost` for style, `.small`/`.large` for size.

```html
<button>Primary</button>
<button data-variant="secondary">Secondary</button>
<button data-variant="danger">Danger</button>
<button class="outline">Outline</button>
<button class="ghost">Ghost</button>
<button class="small">Small</button>
<button class="large">Large</button>
<button disabled>Disabled</button>
<a href="#" class="button">Link as button</a>
```

Button group:

```html
<menu class="buttons">
  <li><button class="outline">Left</button></li>
  <li><button class="outline">Center</button></li>
  <li><button class="outline">Right</button></li>
</menu>
```

### Card

```html
<article class="card">
  <header>
    <h3>Card Title</h3>
    <p>Description</p>
  </header>
  <p>Content here.</p>
  <footer class="hstack">
    <button class="outline">Cancel</button>
    <button>Save</button>
  </footer>
</article>
```

### Alert

Use `role="alert"` with optional `data-variant` (`success`, `warning`, `error`).

```html
<div role="alert" data-variant="success">
  <strong>Success!</strong> Your changes have been saved.
</div>
<div role="alert" data-variant="warning">
  <strong>Warning!</strong> Please review before continuing.
</div>
<div role="alert">
  <strong>Info</strong> This is a default alert.
</div>
<div role="alert" data-variant="error">
  <strong>Error!</strong> Something went wrong.
</div>
```

### Form

Wrap inputs in `<label data-field>` for proper styling. Input groups use `<fieldset class="group">`.

```html
<form>
  <label data-field>
    Name
    <input type="text" placeholder="Enter your name" />
  </label>
  <label data-field>
    <input type="checkbox" /> I agree
  </label>
  <label data-field>
    <input type="checkbox" role="switch" checked> Toggle
  </label>
  <fieldset class="hstack">
    <legend>Preference</legend>
    <label><input type="radio" name="pref"> A</label>
    <label><input type="radio" name="pref"> B</label>
  </fieldset>
  <fieldset class="group">
    <input type="text" placeholder="Search" />
    <button>Go</button>
  </fieldset>
  <div data-field="error">
    <label>Email</label>
    <input type="email" aria-invalid="true" value="bad" />
    <div class="error" role="status">Invalid email.</div>
  </div>
</form>
```

### Dialog (modal)

Uses native `<dialog>` with `commandfor`/`command` attributes (zero JS required).

```html
<button commandfor="my-dialog" command="show-modal">Open</button>
<dialog id="my-dialog" closedby="any">
  <form method="dialog">
    <header><h3>Title</h3></header>
    <div><p>Content</p></div>
    <footer>
      <button commandfor="my-dialog" command="close" class="outline">Cancel</button>
      <button value="confirm">Confirm</button>
    </footer>
  </form>
</dialog>
```

### Dropdown

Uses `<ot-dropdown>` WebComponent + native Popover API.

```html
<ot-dropdown>
  <button popovertarget="menu" class="outline">Options ▾</button>
  <menu popover id="menu">
    <button role="menuitem">Profile</button>
    <button role="menuitem">Settings</button>
    <hr>
    <button role="menuitem">Logout</button>
  </menu>
</ot-dropdown>
```

### Tabs

Uses `<ot-tabs>` WebComponent.

```html
<ot-tabs>
  <div role="tablist">
    <button role="tab">Account</button>
    <button role="tab">Password</button>
  </div>
  <div role="tabpanel"><h3>Account Settings</h3></div>
  <div role="tabpanel"><h3>Password Settings</h3></div>
</ot-tabs>
```

### Table

```html
<div class="table">
  <table>
    <thead><tr><th>Name</th><th>Status</th></tr></thead>
    <tbody>
      <tr><td>Alice</td><td><span class="badge" data-variant="success">Active</span></td></tr>
    </tbody>
  </table>
</div>
```

### Badge

```html
<span class="badge">Default</span>
<span class="badge" data-variant="success">Success</span>
<span class="badge" data-variant="danger">Danger</span>
<span class="badge" data-variant="warning">Warning</span>
<span class="badge outline">Outline</span>
```

### Accordion

Native `<details>`/`<summary>`.

```html
<details>
  <summary>What is Oat?</summary>
  <p>Oat is a minimal, semantic-first UI library.</p>
</details>
<details name="group">
  <summary>Grouped</summary>
</details>
```

### Progress & Meter

```html
<progress value="60" max="100"></progress>
<meter value="0.8" min="0" max="1" low="0.3" high="0.7" optimum="1"></meter>
```

### Spinner

```html
<div aria-busy="true"></div>
<div aria-busy="true" data-spinner="large"></div>
<button aria-busy="true" disabled>Loading</button>
<div aria-busy="true" data-spinner="large overlay">Content dims</div>
```

### Skeleton

```html
<div role="status" class="skeleton line"></div>
<div role="status" class="skeleton box"></div>
```

### Avatar

```html
<figure data-variant="avatar" aria-label="Jane Doe">
  <img src="/avatar.svg" alt="" />
</figure>
<figure data-variant="avatar" aria-label="Oat">
  <abbr title="Jane Doe">OT</abbr>
</figure>
```

### Sidebar

```html
<div data-sidebar-layout>
  <aside data-sidebar>
    <nav><ul><li><a href="#" aria-current="page">Home</a></li></ul></nav>
  </aside>
  <main>Content</main>
</div>
<!-- With top nav -->
<body data-sidebar-layout>
  <nav data-topnav>
    <button data-sidebar-toggle aria-label="Menu">☰</button>
    <span>App</span>
  </nav>
  <aside data-sidebar>...</aside>
  <main>...</main>
</body>
```

### Toast

```js
ot.toast('Saved!', 'Success', { variant: 'success' })
ot.toast('Error!', 'Oops', { variant: 'danger', placement: 'top-left' })
ot.toast('Warning', null, { variant: 'warning' })
ot.toast('Info', null, { placement: 'top-center' })

// Custom HTML
ot.toast.el(document.querySelector('#my-toast-template'), { duration: 8000 })
// Clear all
ot.toast.clear()
```

### Tooltip

Just use the `title` attribute.

```html
<button title="Save your changes">Save</button>
<button title="On left" data-tooltip-placement="left">Left</button>
<button title="On bottom" data-tooltip-placement="bottom">Bottom</button>
```

### Grid

12-column CSS grid.

```html
<div class="container">
  <div class="row">
    <div class="col-4">4 cols</div>
    <div class="col-4">4 cols</div>
    <div class="col-4">4 cols</div>
  </div>
  <div class="row">
    <div class="col-6">6 cols</div>
    <div class="col-4 offset-2">4 cols offset 2</div>
  </div>
</div>
```

### Utilities

Common utility classes from `utilities.css`:

| Class | Purpose |
|---|---|
| `.hstack` | Horizontal flex container |
| `.vstack` | Vertical flex container |
| `.justify-start/center/end/between` | Flex justify |
| `.items-start/center/end` | Flex align |
| `.gap-{0-8}` | Gap spacing |
| `.mt-{0-8}`, `.mb-{0-8}`, `.mx-{0-8}`, `.my-{0-8}` | Margin |
| `.pt-{0-8}`, `.pb-{0-8}`, `.px-{0-8}`, `.py-{0-8}` | Padding |
| `.text-light` | Muted text |
| `.text-center` | Center text |
| `.align-center` | Center content |
| `.unstyled` | Remove list/button default styles |
| `.table` | Scrollable table wrapper |
| `.badge` | Badge/tag |
| `.button` | Link styled as button |
| `.skeleton` | Loading placeholder |
| `.outline` | Outline variant for buttons |
| `.ghost` | Ghost variant for buttons |
| `.small`, `.large` | Size modifier |

## Theming

If asked to customize the default oat-css theme, first offer to replicate one of the themes from https://oat.ink/demo/
If the user still wants to create a new theme, then override ONLY (minimal) what needs to be overridden in ":root".
Oat uses `light-dark()` for automatic dark mode based on system preference.
See the full list at [theme.css](https://github.com/knadh/oat/blob/master/src/css/01-theme.css).

### Dark mode

Set `data-theme="dark"` on `<body>` to force dark. Oat also auto-detects `prefers-color-scheme`.

### Design tokens

Oat exposes spacing, typography, shadow, and radius tokens:

```scss
.custom {
  padding: var(--space-4);
  margin-block-end: var(--space-6);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-medium);
  transition: transform var(--transition-fast);
}
```

## Community Usage & Extensions

Oat is created by [Kailash Nadh](https://nadh.in) and used in his own projects. The community has built:

- **[oat-chips](https://github.com/someshkar/oat-chips)** — Chip/tag component with filters, colors, selection
- **[oat-animate](https://github.com/dharmeshgurnani/oat-animate)** — Lightweight animation extension with `in-view`, `hover`, `on-load` triggers
- **[oat-table](https://github.com/MADEVAL/Oat-Table)** — Sort, filter, and select rows in semantic `<table>`

Oat is compared alongside Water.css, Pico CSS, and MVP.css as a minimal, classless, or semantic-first CSS framework. Its distinctive traits are the shadcn-inspired aesthetic, WebComponents for dynamic widgets (tabs, dropdown), and the sub-10KB bundle.

## Icons

Oat doesn't bundle an icon set. The approach that fits Oat's philosophy (zero dependencies, vanilla HTML, no build step) is the **SVG sprite** pattern: one `.svg` file referenced via `<use>` in your HTML.

```html
<svg width="24" height="24" fill="currentColor">
  <use href="bootstrap-icons.svg#icon-name"/>
</svg>
```

Style with CSS — size via `width`/`height`, color via `color`/`fill`.

### Recommended: Bootstrap Icons

Lightest sprite (578 KB raw, ~96 KB gzipped), 2,000+ icons, clean design that matches Oat's aesthetic, MIT license.

| Method | Link |
|--------|------|
| CDN | `https://unpkg.com/bootstrap-icons@1.11.3/bootstrap-icons.svg` |
| npm | `npm install bootstrap-icons`, copy `node_modules/bootstrap-icons/bootstrap-icons.svg` |

```html
<svg width="16" height="16" fill="currentColor">
  <use href="bootstrap-icons.svg#check-circle"/>
</svg>
<svg width="24" height="24" fill="currentColor">
  <use href="bootstrap-icons.svg#gear"/>
</svg>
<svg width="20" height="20" fill="currentColor">
  <use href="bootstrap-icons.svg#x-lg"/>
</svg>
```

Browse icons at https://icons.getbootstrap.com — the icon name is the filename without `.svg`.

### Alternative: Tabler Icons

6,128 icons, slightly heavier sprite (2 MB raw, ~700 KB gzipped), more variety and a modern 2px-stroke style. MIT license.

```html
<svg width="24" height="24">
  <use href="tabler-sprite.svg#tabler-refresh"/>
</svg>
```

### Tradeoffs

- **SVG sprite** — one HTTP request, cached after first visit, no JS, no build step. The full set is always loaded regardless of which icons you use (not tree-shakeable).
- **Tree-shakeable npm packages** (Lucide, Boxicons, Heroicons) require a bundler and a framework — they don't fit Oat's vanilla HTML + CSS philosophy. Use them only if you're already committed to a JS build pipeline.
- **Custom sprite** — for maximum minimalism, use a CLI like `svg-sprite` to build a sprite with only the icons you need. Adds a build step but minimizes payload.

### Icon button helper

Oat's `.icon` utility sizes a button for icon-only usage:

```html
<button class="ghost icon" aria-label="Close">
  <svg width="16" height="16" fill="currentColor">
    <use href="bootstrap-icons.svg#x-lg"/>
  </svg>
</button>
```

## Real-world patterns

These compositions use only Oat's built-in components and utility classes — no custom CSS:

**Stats cards (dashboard metrics):**
```html
<div class="container">
  <div class="row">
    <article class="card col-4">
      <header class="hstack justify-between items-center">
        <h4>Revenue</h4>
        <span class="badge" data-variant="success">+12%</span>
      </header>
      <h2>$42,200</h2>
      <progress value="72" max="100"></progress>
    </article>
  </div>
</div>
```

**Form card:**
```html
<article class="card">
  <header><h3>Profile</h3><p class="text-light">Update info</p></header>
  <label data-field>Name <input type="text"></label>
  <label data-field><input type="checkbox" role="switch"> Notifications</label>
  <footer class="hstack justify-end mt-4">
    <button class="outline">Cancel</button>
    <button>Save</button>
  </footer>
</article>
```

**Empty state:**
```html
<article class="card align-center">
  <h3>Nothing here yet</h3>
  <p class="text-light">Create something to get started.</p>
  <footer class="hstack justify-center mt-4">
    <button>New item</button>
  </footer>
</article>
```

## Key Guidelines

1. **Reach for semantic HTML first** — a `<button>` is already styled, a `<dialog>` already works
2. **Use `data-variant`** (not custom classes) for color semantics: `primary`, `secondary`, `success`, `danger`, `warning`
3. **Use ARIA attributes** (`role="alert"`, `aria-busy="true"`, `role="switch"`) — Oat styles them automatically
4. **Prefer Oat's composable components** (card + hstack + badge + progress) over writing custom SCSS
5. **Override CSS variables** for theming instead of writing component-level overrides
6. **Keep HTML clean** — minimal classes, semantic tags, readable structure
7. **Only write custom SCSS when** Oat doesn't provide a component, or your layout needs unique structure not covered by `.hstack`/`.vstack`/`.grid`
