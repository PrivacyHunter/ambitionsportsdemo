# Plan: Ambition Sports - Professional Transformation

Elevate Ambition Sports into a professional-grade, high-energy e-commerce experience with real functionality, advanced animations, and premium visuals.

## Design & Visuals
- **Premium Aesthetics:** Upgrade UI with glassmorphism, glowing borders, and deeper obsidian tones (`#020617`).
- **Professional Branding:** Ensure all social icons are Lucide components, not text placeholders.
- **High-Energy Animations:** Add reveal animations, smooth transitions, and interactive hover states using Framer Motion.

## Core Features
- **Real Inquiries:** Connect all forms (Home, About, Contact, Catalogs) to a Resend-powered server function for real email delivery.
- **Quote Portal:** Create `/quote` for detailed custom orders and `/track` for status tracking (Pending → Production → Shipped).
- **Checkout Flow:** Add `/checkout` with simulated payment options and order confirmation.
- **Real Product Data:** Replace placeholder content with "real" product details (engineered fabrics, precision stitching specs).

## Technical Details
- **Tech Stack:** React 19, TanStack Start (SSR), Tailwind v4, Framer Motion, Resend.
- **Server Functions:** Use `createServerFn` for email delivery and quote submission.
- **Validation:** Zod-backed forms for robust data collection.
- **Mock Fallback:** Automatic mock mode when `RESEND_API_KEY` is missing to ensure functionality during development.

## Implementation Steps
1. **Refine Foundation:** Update `styles.css` and `Navbar`/`Footer` for a professional look and real icons.
2. **Interactive Pages:** Overhaul Home, About, and Contact with advanced animations and wired forms.
3. **Catalog Overhaul:** Update Sportswear, Activewear, and Casual Wear with detailed product specs and inquiry logic.
4. **New Modules:** Implement `/quote`, `/track`, and `/checkout` routes.
5. **Final Polish:** Verification of email flows and mobile responsiveness.
