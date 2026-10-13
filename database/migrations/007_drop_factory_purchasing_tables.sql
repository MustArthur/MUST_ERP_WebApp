-- ==========================================
-- Drop Factory Purchasing App tables
-- The app shared this Supabase project and has been decommissioned (2026-09-28).
-- Its tables allowed anon read/write. Backup: ~/Documents/Factory Purchacing App/db-backup-2026-09-28/
-- public.users is kept: audit_logs / system_settings still reference it.
-- ==========================================

-- Dropped in one statement because purchase_orders <-> purchase_request_items reference each other
DROP TABLE public.po_items,
           public.purchase_request_items,
           public.purchase_orders,
           public.purchase_requests,
           public.notifications;
