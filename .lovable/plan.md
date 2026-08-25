# Fix banners, messaging, newsletter, and Instagram connection

## What will change

1. **Responsive banners**
   - Standardize homepage and inner-page hero heights, spacing, and typography for phone and tablet widths.
   - Keep headings fully visible without covering product imagery or overflowing horizontally.
   - Verify the homepage, Sportswear, Activewear, Casual Wear, About, Contact, and Customization pages at phone and tablet sizes.

2. **Contact messages**
   - Make Contact Us submissions fail visibly when delivery fails instead of showing a false success message.
   - Always save valid inquiries to the backend Inbox so owner/admin/developer users can review them.
   - Send a notification copy to `ambitionsports381@gmail.com` once the email service is connected.
   - Add clear delivery status handling and safe server-side validation.

3. **Newsletter**
   - Turn the footer newsletter field into a working form with validation, loading, success, duplicate-subscription, and error states.
   - Store subscribers in a protected backend table and show them in the admin panel.
   - Send a subscription confirmation when email delivery is configured.

4. **Instagram one-click connection**
   - Replace manual access-token entry with a **Connect Instagram** button in the admin panel.
   - Redirect the client to Instagram/Meta authorization, return through a secure public callback, exchange the code server-side, and save the connected account.
   - Protect the OAuth flow with a short-lived signed state tied to the logged-in admin session.
   - Keep sync, disconnect, reconnect, and connection-status controls in the Instagram panel.

## Required connections

- **Email:** connect the Resend integration so Contact Us and newsletter emails can be delivered.
- **Instagram:** provide `INSTAGRAM_APP_ID` and `INSTAGRAM_APP_SECRET` through the secure secrets form after creating a Meta app with Instagram API access. The callback URL will be the published site URL plus `/api/public/instagram-callback`.

## Technical details

- Keep server-function declaration files thin and move runtime helpers into `.server.ts` modules.
- Add a `newsletter_subscribers` table with explicit grants and row-level policies: public visitors may subscribe; only staff may view/manage subscribers.
- Never expose Instagram tokens or app secrets to the browser.
- Use the existing authenticated admin role checks and Inbox dashboard patterns.
- Test live form behavior, backend persistence, and responsive layouts before completion.
