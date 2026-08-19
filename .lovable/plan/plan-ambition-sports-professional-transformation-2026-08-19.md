# Plan - Ambition Sports Professional Transformation

Upgrade Ambition Sports to a professional-grade e-commerce experience with real order capabilities and high-energy branding.

## Design & Branding
- **Professional Look**: Enhance visual depth with glassmorphism, glowing borders, and improved spacing.
- **Social Icons**: Replace text placeholders (FB, IG, etc.) with Lucide React icons in Navbar and Footer.
- **Advanced Animations**: Add Framer Motion entrance animations to all sections and product cards.

## E-Commerce & Inquiries
- **Real Inquiries**: Connect all forms to a server function using `submitInquiry` (Resend integration ready).
- **Quote Portal**: New `/quote` page for custom bulk orders with detailed specification inputs.
- **Order Tracking**: `/track-order` page to check status using unique order IDs.
- **Checkout Flow**: Simple professional checkout page with mock payment integration.
- **Product Updates**: Replace placeholders with high-quality themed images and realistic product descriptions.

## Technical Details
- **Server Functions**: Use TanStack Start `createServerFn` for handling form submissions and tracking logic.
- **Email Integration**: Resend for inquiry notification emails (supports mock mode without API key).
- **Icons**: Standardize on `lucide-react` for all visual cues.
- **Routing**: `/quote`, `/track-order`, and `/checkout` routes will be added.

## Workflow
1. Fix current build errors in `src/lib/inquiries.functions.ts`.
2. Update `Navbar` and `Footer` with real social icons and improved styling.
3. Overhaul `index.tsx` for a more "professional" high-energy feel.
4. Create the new e-commerce routes (`/quote`, `/track-order`, `/checkout`).
5. Update product catalogs with "real" data.
6. Connect all forms to the backend server functions.
7. Verify with test submissions.
