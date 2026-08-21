# Ambition Sports: Professional Refinement & Dashboard Enhancement

The focus of this plan is to address readability issues (large text hiding content), soften visual harshness, enhance theme management, and provide robust tools for content control via the admin dashboard.

## User Review Required

> [!IMPORTANT]
> The theme customizer and alert settings will utilize the `site_settings` table in the database. Ensure these features are accessible only to 'developer' and 'owner' roles as per existing RBAC rules.

- **Theme Customizer**: Should we include font family controls in the instant preview, or keep it strictly to colors (primary/background)?
- **Landing Page Alerts**: Would you prefer browser push notifications in addition to email/Slack for threshold alerts?

## Proposed Changes

### Visual & Theme Refinements
- **Scale Down Large Typography**: Adjust massive headings (`text-8xl`, `text-9xl`) in `HeroSlider.tsx` and other sections to ensure product images/banners aren't obscured.
- **Background Softening**: Continue replacing hard obsidian blacks with softer surface colors or gradients where contrast is too high.
- **Contrast Audit (WCAG)**: Systematic review of text/navigation elements to ensure accessibility standards are met in dark mode.
- **Theme Preview Toggle**: Add a floating UI component for administrators to quickly switch light/dark modes on any page for testing.

### Admin Dashboard (Command Center)
- **Instant Theme Studio**: Create a settings UI to adjust CSS variables (primary color, surface shades) with a real-time preview of the site.
- **Landing Page Content Manager**: A new section to edit hero text, CTA wording, and section descriptions without touching code.
- **Preview Mode**: Implement a "Draft" status for landing page edits, allowing preview before live deployment.
- **Automated Text Verification**: Add logic to verify that critical landing page strings (like "I have approved the plan") render exactly as specified.

### Alerting & Monitoring
- **Alert Configuration**: Settings page for sync failure rates and latency thresholds.
- **Multi-Channel Notifications**: Implement email (via Resend) and Slack webhook integration for critical health alerts.

## Technical Details

### UI Adjustments
- Update `HeroSlider.tsx`: Reduce heading sizes to `text-5xl md:text-7xl lg:text-8xl`.
- Update `src/styles.css`: Define standard `surface-soft` tokens for background transitions.

### Backend & Database
- Update `site_settings` to store `landing_page_content` and `alert_thresholds`.
- Extend `src/lib/admin-alerts.functions.ts` to handle Slack/Generic Webhook delivery.

### Security
- Enforce strict `has_role` checks on the new settings and preview routes.
