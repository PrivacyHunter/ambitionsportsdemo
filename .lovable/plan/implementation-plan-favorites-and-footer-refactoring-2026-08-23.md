# Implementation Plan - Favorites and Footer Refactoring

The user wants to implement a Favorites section, improve the footer typography and responsiveness, and make the footer content configurable via a reusable component.

## User Requirements
- Remove marked technical text from the interface.
- Implement a Favorites section with an "Add to Favorites" button for each item.
- Improve footer typography and spacing for consistency.
- Create a reusable Footer component with configurable text (admin-managed).

## Technical Details

### 1. Database Schema
- Ensure a `site_settings` entry for `footer_content` exists or is handled.
- No new tables required for favorites as it will be client-side initially (per previous pattern), but we could persist it to local storage or a table if needed. Given the user's "Add to Favorites" request, I will implement a dedicated Favorites page/section.

### 2. Configurable Footer
- Update `src/lib/content.server.ts` to handle `footer_content`.
- Update `src/lib/content.functions.ts` with new server functions for footer content.
- Update `src/components/Footer.tsx` to consume this data.
- Update `src/routes/_authenticated/panel.tsx` (ContentTab) to allow editing footer text.

### 3. Favorites System
- Create `src/routes/favorites.tsx`.
- Update `src/components/FeaturedProducts.tsx` to handle "Add to Favorites" properly with visual feedback.
- Update `src/components/Navbar.tsx` to include a link to the Favorites page.

### 4. Cleanup
- Remove the literal text injection from `src/routes/index.tsx`.

## Proposed Changes

### Database/Server
- **src/lib/content.server.ts**: Add `fetchFooterContent` and `updateFooterContent`.
- **src/lib/content.functions.ts**: Add `getFooterContent` and `saveFooterContent` server functions.

### Components
- **src/components/Footer.tsx**: Refactor to use dynamic content and improve typography/spacing.
- **src/components/FeaturedProducts.tsx**: Ensure the heart icon correctly toggles favorites.
- **src/components/Navbar.tsx**: Add a "Favorites" link (perhaps as an icon).

### Routes
- **src/routes/index.tsx**: Remove the literal display text block in the CTA section.
- **src/routes/favorites.tsx**: New route to display favorited items.
- **src/routes/_authenticated/panel.tsx**: Update `ContentTab` to include footer editing.

## Execution Steps
1. Modify `src/lib/content.server.ts` and `src/lib/content.functions.ts`.
2. Create `src/routes/favorites.tsx`.
3. Update `src/components/Navbar.tsx` and `src/components/FeaturedProducts.tsx`.
4. Refactor `src/components/Footer.tsx`.
5. Update Admin Panel (`panel.tsx`).
6. Remove technical text from `src/routes/index.tsx`.
