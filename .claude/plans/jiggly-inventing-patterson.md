# Big Segmented Theme Toggle in TopBar

## Context

The app has a fully working theme system (light/dark/system) powered by `useAppearanceStore` + `useTheme` hook + CSS `[data-theme]` attribute. But the TopBar only shows a tiny icon button that cycles through modes — it's not obvious what mode you're in or what the options are. The user wants a big, obvious 3-option segmented control like the screenshot (Monitor | Sun | Moon with a colored pill indicator on the active option).

## Plan

Replace the single `topbar__icon-btn` theme button in `TopBar.tsx` with a `ThemeToggle` segmented control component. Three icon buttons (Monitor, Sun, Moon) inside a rounded pill track, with a colored sliding indicator on the active selection.

### Create `src/components/ThemeToggle/ThemeToggle.tsx`

A segmented control with 3 buttons:

| Option | Icon | Value |
|--------|------|-------|
| System | `Monitor` | `'system'` |
| Light | `Sun` | `'light'` |
| Dark | `Moon` | `'dark'` |

- Uses `useTheme()` for `theme` and `setTheme`
- Each button calls `setTheme(value)` directly (no cycling)
- Active button gets a colored background indicator (coral/salmon like the screenshot: `#E8706A`)
- The indicator slides with a CSS transition
- Accessible: `role="radiogroup"` on container, `role="radio"` + `aria-checked` on each button, `aria-label="Theme"` on group

### Create `src/components/ThemeToggle/ThemeToggle.css`

- `.theme-toggle` — pill-shaped track with dark background (`var(--bg-tertiary)`), rounded corners, ~44px tall
- `.theme-toggle__option` — each icon button, ~40px wide, centered icon, transparent background, `z-index: 1` above the indicator
- `.theme-toggle__option--active` — icon color changes to white
- `.theme-toggle__indicator` — absolute-positioned colored pill that slides via `transform: translateX()` with a smooth 200ms transition. Color: `#E8706A` (coral, matching the screenshot)
- Dark mode: track bg darker, inactive icon color adjusts

### Modify `src/components/layout/TopBar/TopBar.tsx`

- Import `ThemeToggle`
- Replace the theme icon button block (lines 121-129) with `<ThemeToggle />`
- Remove unused: `cycleTheme` from `useTheme()` destructure, `THEME_ICON`, `THEME_LABEL`, `ThemeIcon` variable, `Moon`/`Monitor` icon imports (only if no longer used)

### Modify `src/components/layout/TopBar/TopBar.css`

No changes needed — the toggle is self-contained in its own CSS file.

## Files

| Action | File |
|--------|------|
| Create | `src/components/ThemeToggle/ThemeToggle.tsx` |
| Create | `src/components/ThemeToggle/ThemeToggle.css` |
| Modify | `src/components/layout/TopBar/TopBar.tsx` |

## Verification

1. `npm run build` — zero errors
2. `npm run lint` — clean
3. `npm run test:run` — all tests pass
4. Visual: TopBar shows 3-icon pill toggle; clicking each icon switches theme immediately with smooth indicator slide
