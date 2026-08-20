# Implementation Plan - Ultra-Premium Control Panel & E-Commerce Enhancements

Refining the "Ambition Sports" digital infrastructure with advanced admin features, improved security, and streamlined e-commerce workflows.

## Proposed Changes

### 1. Database & Security Overhaul
- **Migration**: Create `audit_logs` and `email_logs` tables. Add `cover_image` and `sort_order` to `products`.
- **RBAC Hardening**: Remove public sign-up option from UI. Update auth text to be more generic ("Staff Sign In").
- **Audit Logging**: Track Theme Studio exports, imports, and rollbacks.

### 2. Product & Catalog Enhancements
- **Gallery Management**: Update Product CRUD to allow setting a "Cover Image" from the gallery.
- **Drag-and-Drop Improvements**: Add keyboard accessibility (Arrow keys/Space) to reordering logic using `@dnd-kit`'s sortable keyboard coordinates.
- **Quick-View Modal**: Ensure mobile-first responsiveness and high-res image transitions.

### 3. Advanced Admin Tools
- **SEO Bulk Editor Validation**: Add client-side validation for title (50-60 chars) and description (150-160 chars) length.
- **Analytics Export**: Add a "Export to CSV" button in the Analytics dashboard.
- **One-Click Flows**: Implement "Template" buttons that pre-fill site settings and catalog for "Business Site" or "Online Store".

### 4. Communication & Logging
- **Email Confirmation Logs**: Log every order confirmation email (recipient, order ID, status, error) to the database for admin review.

## Technical Details

### Database Schema
```sql
CREATE TABLE audit_logs (id UUID PRIMARY KEY, user_id UUID, action TEXT, details JSONB, created_at TIMESTAMPTZ);
CREATE TABLE email_logs (id UUID PRIMARY KEY, recipient TEXT, subject TEXT, order_id UUID, status TEXT, error TEXT, created_at TIMESTAMPTZ);
ALTER TABLE products ADD COLUMN cover_image TEXT;
ALTER TABLE products ADD COLUMN sort_order INTEGER DEFAULT 0;
```

### Components & Libraries
- **`@dnd-kit`**: Enhanced `SortableContext` with `KeyboardSensor`.
- **`PapaParse`**: (or native JS) for CSV generation in Analytics.
- **`src/routes/auth.tsx`**: Remove "Sign Up" toggle; simplify UI text.
- **`src/lib/logs.functions.ts`**: New server functions for audit and email logs.

## User Review Required

> [!IMPORTANT]
> - Should the "One-Click Store" wipe existing data or just add new products? (Default: append)
> - Do you want the Analytics CSV to include PII like visitor IP addresses? (Default: anonymized)
