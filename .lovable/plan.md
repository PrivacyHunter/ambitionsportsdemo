# Plan - Studio v3 & Advanced Admin Controls

Implement enhanced customization video controls, Instagram integration, and strict developer invisibility for Ambition Sports.

## User Review Required

> [!IMPORTANT]
> - Instagram integration requires the Graph API; for this turn, I will implement the UI and a backend service structure ready for your access token.
> - "Developer Invisibility" will mask all developer accounts, logs, and role-assignments from Owners and Admins, keeping them purely "ghost" accounts.

- Does the Instagram integration need to support multiple accounts, or just one primary business account? (Default: One primary account).

## Proposed Changes

### Database & Schema
- Execute migration to add `caption_style` (JSONB), `thumbnail_url`, and `process_type` to `customization_videos`.
- Create `instagram_settings` and `instagram_posts` tables for the social feed integration.

### Customization Studio Enhancements
- **Advanced Editor**: Add font, color, and position (top/center/bottom) controls for video captions in the Control Panel.
- **Media Management**: Add thumbnail selection/upload to the video manager.
- **Catalog Navigation**: Implement search and process-type filters (Sublimation, Embroidery, etc.) in the Studio Manager tab.
- **Video Player**: Add a customer-facing captions toggle with language selection and apply custom styles to the overlay.

### Social Integration
- **Instagram Connect**: Add a new "Instagram Studio" tab to the Control Panel to link accounts and manage synced posts.
- **Auto-Feed**: Implement logic to display Instagram posts (photos/videos) on any page/category via a new component.

### Security & RBAC
- **Strict Developer Masking**: Refactor `src/lib/admin.server.ts` to ensure Developer roles are invisible to Owners and Admins in the staff list, audit logs, and role management.
- **Developer-Only Rights**: Update Account management so only Developers can grant the "Developer" role.

### Resilience & DX
- **Global Error Boundary**: Implement a professional fallback UI in `src/routes/__root.tsx` to prevent blank screens.
- **Theme Guard**: Add a Playwright test to verify `useTheme` is correctly scoped within layout components.

## Technical Details
- **Tables**: `customization_videos` (update), `instagram_settings`, `instagram_posts` (new).
- **Functions**: `upsertCustomizationVideo`, `listAccounts`, `syncInstagramPosts`.
- **Components**: `CaptionOverlay`, `InstagramFeed`, `GlobalErrorBoundary`.
- **Styling**: Tailwind utility classes for dynamic caption positioning and theme consistency.
