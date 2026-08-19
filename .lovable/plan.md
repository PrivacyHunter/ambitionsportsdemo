# Implementation Plan - Ambition Sports Professional E-Commerce & Admin Panel

This plan outlines the steps to transform Ambition Sports into a fully functional, professional e-commerce platform with a robust admin dashboard, real database persistence, and advanced features like geolocation and role-based access control.

## 1. Database Schema & Security (Lovable Cloud / Supabase)
- Create `user_roles` table for RBAC (Admin, Owner, Developer).
- Create `inquiries` table for contact forms.
- Create `quotes` table for custom manufacturing requests.
- Create `products` table for the sportswear catalog.
- Create `orders` table for checkout completions.
- Create `site_settings` table for the Developer Panel (logo, favicon, banners).
- Implement RLS (Row Level Security) and `has_role` security definer function.

## 2. Admin & Developer Dashboard
- `/admin`: Overview dashboard with analytics (total quotes, pending inquiries).
- `/admin/quotes`: View, edit, and update status of custom orders.
- `/admin/inquiries`: Manage contact submissions.
- `/admin/products`: CRUD interface for the catalog.
- `/admin/developer`: Control site-wide assets (Logo, Favicon, Banners, Social Links).
- Implement role-gated access (Developer can access all, Owner can manage admins, Admin can manage orders).

## 3. Core E-Commerce & Catalog
- Replace static placeholders in `/sportswear`, `/activewear`, and `/casual-wear` with dynamic data from the `products` table.
- Add size, color, and quantity options to product pages.
- Wire `/quote` to store real data in the database and trigger notifications.
- Connect `/checkout` to a payment gateway (Stripe/Paddle) via server functions.

## 4. Enhanced Features
- **Geolocation Service**: Capture IP, City, Country, Device, and Browser info for all submissions using a server-side IP lookup.
- **WhatsApp Integration**: Add a floating, customizable WhatsApp icon for instant contact.
- **Email Backend**: Configure Resend with real API keys and a verified sender for reliable delivery.
- **Customization Page**: Create `/customization` detailing Sublimation, Embroidery, and Cut & Sew methods.
- **Live Status Tracker**: Connect `/track` to the live `quotes` table with real status updates.

## 5. Visual & Professional Polishing
- Implement high-energy animations (Framer Motion) throughout the new admin pages.
- Ensure the site meets the standards of a professional graphic designer (perfect typography, neon accents, obsidian theme).

## Technical Details
- **Stack**: TanStack Start v1 (React 19, Vite 8).
- **Backend**: Supabase (PostgreSQL, RLS, Auth).
- **Styling**: Tailwind CSS v4.
- **Email**: Resend.
- **Payments**: Stripe (via `createServerFn`).
- **Icons**: Lucide React.
