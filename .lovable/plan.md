# Visual and Responsiveness Cleanup Plan

Clean up accidental literal text injections, improve mobile responsiveness, and adjust brand element sizing.

## User-Facing Changes

- **Text Cleanup**: Removed large blocks of technical/instructional text that were accidentally displayed on the landing page (Banners, Featured Collection, Testimonials, and Footer).
- **Responsive Layout**:
  - Converted the "Featured Collection" from a horizontal auto-scroller to a responsive grid (1 column on mobile, 2 on tablet, 3 on desktop) for better visibility.
  - Adjusted Hero Banner height for mobile devices to prevent content cutoff.
  - Scaled down heading sizes across all sections to ensure they fit within mobile viewports without overflowing or covering products.
- **Branding Enhancements**:
  - Increased logo size in both the Header and Footer for better visibility.
  - Adjusted Dark Mode colors for product titles and categories to improve readability.

## Technical Details

- **Responsive Typography**: Used smaller font classes (`text-xl`, `text-3xl`) with responsive breakpoints for main headings in `HeroSlider`, `FeaturedProducts`, and `src/routes/index.tsx`.
- **Component Refactoring**:
  - `FeaturedProducts.tsx`: Removed the absolute-positioned auto-scroll logic and refactored to a standard CSS grid.
  - `HeroSlider.tsx`: Added `h-[60vh]` for mobile to maintain aspect ratio and text visibility.
  - `Navbar.tsx` & `Footer.tsx`: Increased `h-` values for logo images.
- **Text Reversion**: Restored meaningful marketing copy in place of the technical instructions previously injected into the UI.
