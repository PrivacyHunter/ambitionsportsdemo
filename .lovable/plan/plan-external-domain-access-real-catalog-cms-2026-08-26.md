# Plan: External Domain Access & Real Catalog CMS

## Goal
Make the same owner/admin/developer accounts work securely on the Vercel domains and future `ambitionsports.com`, then turn Products and Banners into real database-managed content with preview, immediate publishing, and scheduled publishing.

## 1. Fix external-domain authentication
- Keep one shared Lovable Cloud auth/database so roles and content remain identical on every domain.
- Make panel errors distinguish an expired/missing session, missing deployment configuration, and insufficient role instead of showing “Access denied” for every failure.
- Make login preserve the intended panel destination and refresh the verified session before opening protected tools.
- Remove the hardcoded Lovable production URL from email/site links and derive the active origin, with one configurable canonical site URL for outgoing email.
- Verify owner/admin/developer role resolution through the secured backend on the active deployment.
- Document the exact public and server environment variables required in both Vercel projects; no private admin credential will be exposed to the browser.

> `ambitionsports.com` currently returns a 404 and is not connected to this app. DNS/deployment connection must be completed at the domain host before app code can serve it.

## 2. Real product manager
- Use the existing `products` database table as the single source of truth.
- Replace hardcoded catalog arrays on Sportswear, Activewear, Casual Wear, and Featured Products with public active-product queries.
- Add complete product actions in the panel: create, edit, duplicate, delete, activate/deactivate, feature/unfeature, reorder, stock, pricing, sizes, colors, description, and image gallery/cover.
- Add explicit confirmation for destructive deletes and show real save/error states.
- Enforce each admin’s `products` permission on the server, not only by hiding the tab.

## 3. Real banner manager
- Add a database-backed banner model with title lines, subtitle, image, CTA label/link, display order, active state, draft/published state, and publishing timestamps.
- Seed the current six banners as the initial real records so the current landing page does not go blank.
- Replace the hardcoded Hero Slider array with published banner records.
- Add create, edit, duplicate, delete, reorder, activate/deactivate, and image/CTA controls in the panel.
- Enforce `content` permission for admin banner changes; owners/developers retain full access.

## 4. Preview and publishing workflow
- Save edits as drafts without changing the public site.
- Add a responsive live preview for products and banners inside the control panel.
- Add “Publish now” to atomically promote a draft to the public site.
- Add “Schedule publish” with date, time, timezone, status, countdown, cancel, and reschedule controls.
- Apply due schedules through a secured public cron endpoint; include a manual “Publish due changes” fallback for environments where a scheduler is not configured.
- Record create/edit/duplicate/delete/publish/schedule/cancel actions in the audit log.

## 5. Domain cleanup and verification
- Remove hardcoded `*.lovable.app` references from app-generated links and messages.
- Do not hardcode a replacement custom domain until the final canonical domain is confirmed; use the active request origin in the meantime.
- Test login, role access, product CRUD, banner CRUD, draft preview, immediate publish, and scheduled publish on local preview and both reachable Vercel deployments.
- Provide the remaining external setup steps for Vercel environment variables and `ambitionsports.com` DNS after code verification.

## Technical details
- Database migrations will include explicit grants, RLS, and server-verified role/permission checks.
- Public routes will read only active, published records; drafts remain staff-only.
- Scheduled publishing will use a signed cron request and never expose backend secrets to the client.
- Existing developer invisibility rules remain unchanged.
