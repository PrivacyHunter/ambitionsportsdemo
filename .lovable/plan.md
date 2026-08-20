# Plan: Ambition Sports - Final Polish & Advanced Features

Completing the high-end sportswear platform with a unique premium theme, Theme Studio export/import, SEO editor, and mobile-friendly interactions.

## Phase 1: Unique Premium Visual Refinement
- [ ] Overhaul `src/styles.css` with unique "Luxury Matte" obsidian presets and noisy glass textures.
- [ ] Update `src/routes/index.tsx` (Hero/Facilities) with high-end parallax and bento-grid layouts.
- [ ] Fix mobile responsiveness in catalog grids (Sportswear/Activewear/Casualwear) by reducing gaps and adjusting columns.

## Phase 2: Theme Studio Extensions
- [ ] Implement Export/Import (JSON) in `src/routes/_authenticated/panel.tsx` (Theme Studio tab).
- [ ] Add "Layout Preset" selector (Minimalist, Brutalist, Classic) to `ThemeConfig`.

## Phase 3: Admin SEO & Meta Editor
- [ ] Create `src/lib/seo.functions.ts` for CRUD on page metadata.
- [ ] Add "SEO Editor" section to the Admin Control Panel.
- [ ] Wire `head()` in `src/routes/__root.tsx` and leaf routes to use dynamic metadata.

## Phase 4: Mobile & Catalog UX
- [ ] Implement `src/components/QuickViewModal.tsx` for fast product previews.
- [ ] Wire QuickView into all catalog grids.
- [ ] Add drag-and-drop support for product images in `src/routes/_authenticated/panel.tsx`.

## Phase 5: Geolocation & Analytics
- [ ] Finalize the Geolocation tracking write on page view.
- [ ] Add the consent banner for location tracking.

## Phase 6: E-commerce & Branding
- [ ] Wire `branding` settings into `Navbar` and `Footer`.
- [ ] Complete the checkout flow with real Stripe PaymentIntents.
