# Oat-CSS Migration Plan

## Overview

Full UI redesign: Water.css + Boxicons → oat-css + Bootstrap Icons.
Modern HTML features, `light-dark()` theming, eliminate unnecessary custom components.

## Decisions

- **CSS**: Keep SCSS for scoped component styles, drop global water_extras.scss
- **Icons**: Boxicons → Bootstrap Icons (9 icons needed, oat-recommended)
- **Theme**: Custom luminous design from scratch, inspired by oat demo themes
- **Dark mode**: `light-dark()` (oat's native approach)

## Icon Mapping

| Boxicons | Bootstrap Icons | File |
|----------|----------------|------|
| `bx-trash` | `trash` | FileField.svelte |
| `bx-trash-alt` | `trash-arrow-up` | FileField.svelte |
| `bx-list-plus` | `plus-circle` | posts/+page.svelte |
| `bx-calendar` | `calendar` | posts/+page.svelte |
| `bx-pen` | `pen` | posts/+page.svelte |
| `bxl-github` | `github` | +page.svelte (home) |
| `bx-dots-vertical` | `three-dots-vertical` | ref-ui/+page.svelte |
| `bx-cart` | `cart` | ref-ui/+page.svelte (demo) |
| `bx-truck` | `truck` | ref-ui/+page.svelte (demo) |

## Components to DELETE

| Component | Replace With |
|-----------|-------------|
| `Dialog.svelte` | `<dialog>` + `commandfor`/`command` (oat) |
| `TabGroup.svelte` | `<ot-tabs>` WebComponent |
| `Tab.svelte` | `<ot-tabs>` role="tab" |
| `TabContent.svelte` | `<ot-tabs>` role="tabpanel" |
| `Spinner.svelte` | `<div aria-busy="true">` (oat) |
| `Stepper.svelte` | `<ot-tabs>` or oat progress |
| `Alerts.svelte` | `<div role="alert" data-variant>` (oat) |
| `ToggleText.svelte` | `<input role="switch">` (oat) |
| `RadioText.svelte` | `<fieldset>` with radios (oat) |
| `DateShow.svelte` | Oat badge pattern |

## Components to KEEP (restyle with oat)

| Component | Changes |
|-----------|---------|
| `LoginBadge.svelte` | Oat dropdown + avatar |
| `LoginForm.svelte` | Oat form fields |
| `LoginGuard.svelte` | No style changes needed |
| `Link2Modal.svelte` | Use native `<dialog>` |
| `Paginator.svelte` | Oat button styles |
| `FileInput.svelte` | Oat form styling |
| `FileField.svelte` | Oat table + icon swap |
| `LocalStorageStore.svelte` | Debug tool, minimal changes |

## Implementation Phases

### Phase 1: Foundation
1. Replace CDN in `app.html` — oat-css + Bootstrap Icons
2. Delete `water_extras.scss`
3. Rewrite `app.scss` — oat theme vars + `light-dark()` + minimal layout
4. Define brand theme in `:root`

### Phase 2: Layout
5. Rewrite `+layout.svelte` — oat semantic layout
6. Rewrite `Nav.svelte` — `<nav><ul><li><a>`

### Phase 3: Components
7. Delete Dialog.svelte, update all usages to native `<dialog>`
8. Delete TabGroup/Tab/TabContent, replace with `<ot-tabs>`
9. Delete Spinner, replace with `<div aria-busy="true">`
10. Delete Alerts, replace with `<div role="alert">`
11. Delete Stepper, replace with oat patterns
12. Delete ToggleText/RadioText, replace with native inputs
13. Delete DateShow, replace with oat badge
14. Restyle auth components with oat forms

### Phase 4: Pages
15. Home page — oat cards
16. Posts list — oat card grid, `<article>` elements
17. Post detail — `<ot-tabs>` for View/Edit/Delete
18. Post edit — oat `<label data-field>` forms
19. Hello page — oat card + code
20. Audit log — oat table
21. Ref-UI — oat component showcase

### Phase 5: Polish
22. View Transitions — `onNavigate()` for SPA transitions
23. Scroll animations — `animation-timeline: view()`
24. Test light/dark mode
25. Responsive refinements
