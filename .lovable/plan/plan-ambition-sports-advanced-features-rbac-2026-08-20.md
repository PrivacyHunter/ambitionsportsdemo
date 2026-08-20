# Plan: Ambition Sports - Advanced Features & RBAC

Building a professional e-commerce sportswear platform with RBAC, real email delivery, Stripe integration, and an admin dashboard.

## Phase 1: Authentication & RBAC Foundation
- [ ] Update `src/start.ts` to include `attachSupabaseAuth` middleware.
- [ ] Create `src/lib/auth.functions.ts` to provide role-based access checks (`requireRole`).
- [ ] Implement an `_authenticated` layout to gate admin and developer panels.
- [ ] Create a specific migration to assign the 'developer' role to `aqibasif14@gmail.com` automatically upon signup.

## Phase 2: Real Data & Communications
- [ ] Update `src/lib/inquiries.functions.ts` to save submissions to the `inquiries` table.
- [ ] Update `src/lib/quotes.functions.ts` to save to the `quotes` table and generate real tracking IDs.
- [ ] Update `src/lib/email.server.ts` to use a configurable `ADMIN_EMAIL` env var and fix the `from` address.
- [ ] Replace mock catalog data in `sportswear`, `activewear`, and `casualwear` routes with database-driven products.

## Phase 3: Developer & Admin Dashboard
- [ ] Create `src/routes/admin/index.tsx` (Dashboard overview).
- [ ] Create `src/routes/admin/inquiries.tsx` (Manage inquiries).
- [ ] Create `src/routes/admin/quotes.tsx` (Manage custom orders).
- [ ] Create `src/routes/admin/tracking.tsx` (Geolocation tracking view with map).
- [ ] Implement a "Customization" page for users to design their gear.

## Phase 4: E-commerce & Payments
- [ ] Integrate Stripe in `src/lib/payments.functions.ts` using `PaymentIntents`.
- [ ] Update `src/routes/checkout.tsx` to handle real Stripe payments.
- [ ] Implement order confirmation and storage in the `orders` table.

## Phase 5: Geolocation Service
- [ ] Implement `src/routes/geolocation.tsx` with explicit user consent.
- [ ] Capture device info, browser, and location data using browser APIs and IP-based services.
- [ ] Store tracking data in the `user_tracking` table.

## Technical Details
- **RBAC**: Handled via `user_roles` table and `has_role` DB function.
- **Payments**: Stripe Node.js SDK on the server, Stripe Elements on the client.
- **Email**: Resend for transactional emails.
- **Tracking**: `navigator.geolocation` + IP metadata.
