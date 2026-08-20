# Implementation Plan - Customization & Contact Enhancements

Upgrade the Customization Studio, implement bulk actions, subtitle management, and update global contact information.

## User Review Required

> [!IMPORTANT]
> - **SRT/VTT Management**: The subtitle tool will allow uploading text files which will be parsed into time-coded captions.
> - **Audit Logs CSV**: Downloads will be restricted to staff (Owner, Admin, Developer).

## Proposed Changes

### 1. Brand & Contact Updates
- Update `DEFAULT_BRANDING` in `src/lib/theme.ts` with the new WhatsApp number (`+923049893054`) and email (`ambitionsports381@gmail.com`).
- Update `src/components/Footer.tsx`, `src/routes/contact.tsx`, and `src/components/Navbar.tsx` to ensure these details are reflected globally.

### 2. Customization Studio Upgrades
#### Subtitle Management
- Add `captions_url` to `customization_videos` table to store SRT/VTT file paths.
- Build an upload tool in the "Studio Manager" tab to handle subtitle files.

#### Bulk Actions
- Implement checkboxes and a batch action bar in the Studio Manager.
- Add `bulkPublishCustomizationVideos`, `bulkDeleteCustomizationVideos`, and `bulkUpdateDisplayOrder` to `src/lib/customization.functions.ts`.

#### Storage Cleanup
- Implement an automated cleanup function in `src/lib/customization.functions.ts` that removes orphaned MP4 files from the `studio-assets` bucket when a video record is deleted or its URL is replaced.

### 3. Admin & Audit Enhancements
- Add `exportAuditLogsCsv` to `src/lib/logs.functions.ts`.
- Add an "Export Logs" section to the Logs tab in `src/routes/_authenticated/panel.tsx` with filters for User, Action Type, and Date Range.

## Technical Details

### Database Schema Updates
```sql
-- Add captions_url and captions_content support
ALTER TABLE public.customization_videos 
ADD COLUMN IF NOT EXISTS captions_url text,
ADD COLUMN IF NOT EXISTS captions_raw text;

-- Add indexes for audit log filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
```

### Storage Cleanup Logic
- Before deleting a video or updating `video_url`, we will check if the old URL points to our Supabase storage.
- If it does, we will call `supabase.storage.from('studio-assets').remove([path])`.
