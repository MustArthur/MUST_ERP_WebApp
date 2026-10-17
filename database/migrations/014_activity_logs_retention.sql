-- ==========================================
-- 014: keep erp_activity_logs to 180 days (run AFTER 013)
-- Daily at 19:30 UTC = 02:30 Bangkok. Check with: SELECT * FROM cron.job;
-- ==========================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'erp-activity-logs-purge',
    '30 19 * * *',
    $$DELETE FROM public.erp_activity_logs WHERE created_at < now() - interval '180 days'$$
);
