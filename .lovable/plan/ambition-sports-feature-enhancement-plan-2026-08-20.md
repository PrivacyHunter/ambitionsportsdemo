# Ambition Sports Feature Enhancement Plan

Improve visual, functional, and administrative capabilities including Theme Studio presets, SEO previews, Product CRUD media management, geolocation consent, and order notification systems.

## User Review Required
- **Order Email Domain:** Order confirmation emails will default to `onboarding@resend.dev` unless a custom domain is verified in Resend.
- **Geolocation Consent:** A floating consent banner will be added to the footer. Tracking will be disabled until the user clicks "Accept".

## Proposed Changes

### 1. Theme Studio Upgrades
- **Export/Import:** Add JSON file handling to save and load `ThemeConfig`.
- **Presets:** Implement "Luxury Obsidian", "Electric Neon", and "Studio White" presets in the panel.
- **Live Preview:** Ensure instant variable injection into the document root.

### 2. SEO Meta Editor & Preview
- **Editor:** Add `ogImage`, `twitterCard` fields to the SEO tab in `panel.tsx`.
- **Live Preview:** Add a visual "Search Engine Result" and "Social Share Card" preview component in the SEO tab.
- **Automation:** Support setting metadata for products automatically based on product data.

### 3. Catalog & Product CRUD
- **Quick-View Modal:** Already partially implemented; ensure it covers variants (sizes/colors) and high-res gallery browsing.
- **Media Management:** Implement drag-and-drop reordering for product images using `dnd-kit` or a simpler array-swap UI.
- **Variants:** Add a variant manager to the Product CRUD form to handle SKU, stock per size/color.

### 4. Geolocation & Privacy
- **Consent Flow:** Create a `ConsentBanner.tsx` component.
- **Tracking Logic:** Modify `src/routes/api/public/tracking.ts` and client-side `useEffect` hooks to check for `tracking-consent` cookie/localStorage.
- **Consent Page:** Create `/privacy` or `/consent` for detailed settings.

### 5. Order Fulfillment
- **Confirmation Emails:** Update `src/lib/checkout.functions.ts` to call `sendOrderConfirmationEmail` after successful DB insertion.
- **Admin Logging:** Add a `logs` column to the `orders` table or a separate `email_logs` table to track delivery status.

## Technical Details
- **Libraries:** `framer-motion` for modals/animations, `lucide-react` for icons, `resend` for emails.
- **Storage:** Site settings for theme presets will remain in `site_settings` table.
- **Consent:** Use `localStorage` for `ambition_tracking_consent`.
