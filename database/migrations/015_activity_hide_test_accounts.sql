-- ==========================================
-- 015: hide test accounts on the activity dashboard (run AFTER 013)
-- Adds p_exclude_test to both admin read RPCs. A test account is any email ending in
-- '.test' (reserved TLD, e.g. e2e-test@must-erp.test). Defaults to false, so callers that
-- don't pass it keep getting everything.
-- ==========================================

DROP FUNCTION IF EXISTS public.erp_admin_activity_summary(TIMESTAMPTZ, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS public.erp_admin_activity_logs(TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT, INT, INT);

-- Everything the dashboard's summary needs for [p_from, p_to) in one round trip.
-- Days are bucketed in Bangkok time.
CREATE OR REPLACE FUNCTION public.erp_admin_activity_summary(
    p_from TIMESTAMPTZ,
    p_to TIMESTAMPTZ,
    p_exclude_test BOOLEAN DEFAULT false
)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    result JSONB;
BEGIN
    IF NOT public.erp_is_admin() THEN
        RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
    END IF;

    WITH logs AS (
        SELECT l.user_id, l.event, l.page_key, l.created_at
        FROM public.erp_activity_logs l
        WHERE l.created_at >= p_from AND l.created_at < p_to
          AND NOT (p_exclude_test AND EXISTS (
              SELECT 1 FROM auth.users tu WHERE tu.id = l.user_id AND tu.email ILIKE '%.test'
          ))
    ),
    views AS (
        SELECT * FROM logs WHERE event = 'page_view'
    ),
    per_user_module AS (
        SELECT user_id, page_key, count(*) AS n
        FROM views WHERE page_key IS NOT NULL
        GROUP BY user_id, page_key
    ),
    per_user AS (
        SELECT user_id,
               count(*) FILTER (WHERE event = 'page_view') AS views,
               count(*) FILTER (WHERE event = 'login') AS logins,
               max(created_at) AS last_at
        FROM logs GROUP BY user_id
    ),
    days AS (
        SELECT generate_series(
            (p_from AT TIME ZONE 'Asia/Bangkok')::date,
            ((p_to - interval '1 microsecond') AT TIME ZONE 'Asia/Bangkok')::date,
            interval '1 day'
        )::date AS day
    ),
    per_day AS (
        SELECT (created_at AT TIME ZONE 'Asia/Bangkok')::date AS day,
               count(*) AS views,
               count(DISTINCT user_id) AS users
        FROM views GROUP BY 1
    )
    SELECT jsonb_build_object(
        'totals', (
            SELECT jsonb_build_object(
                'views', count(*) FILTER (WHERE event = 'page_view'),
                'active_users', count(DISTINCT user_id),
                'logins', count(*) FILTER (WHERE event = 'login')
            ) FROM logs
        ),
        'by_module', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'page_key', s.page_key, 'views', s.views, 'users', s.users, 'last_at', s.last_at
            ) ORDER BY s.views DESC)
            FROM (
                SELECT page_key, count(*) AS views, count(DISTINCT user_id) AS users, max(created_at) AS last_at
                FROM views WHERE page_key IS NOT NULL
                GROUP BY page_key
            ) s
        ), '[]'::jsonb),
        'by_day', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'day', d.day, 'views', COALESCE(p.views, 0), 'users', COALESCE(p.users, 0)
            ) ORDER BY d.day)
            FROM days d LEFT JOIN per_day p ON p.day = d.day
        ), '[]'::jsonb),
        'by_user', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'user_id', pu.user_id,
                'email', COALESCE(m.email, u.email::text),
                'full_name', m.full_name,
                'views', pu.views,
                'logins', pu.logins,
                'last_at', pu.last_at,
                'modules', COALESCE((
                    SELECT jsonb_object_agg(pm.page_key, pm.n)
                    FROM per_user_module pm WHERE pm.user_id = pu.user_id
                ), '{}'::jsonb)
            ) ORDER BY pu.views DESC, pu.last_at DESC)
            FROM per_user pu
            LEFT JOIN public.erp_members m ON m.user_id = pu.user_id
            LEFT JOIN auth.users u ON u.id = pu.user_id
        ), '[]'::jsonb)
    ) INTO result;

    RETURN result;
END $$;

-- Newest-first log rows for [p_from, p_to) with optional filters; total_count is for paging.
CREATE OR REPLACE FUNCTION public.erp_admin_activity_logs(
    p_from TIMESTAMPTZ,
    p_to TIMESTAMPTZ,
    p_user_id UUID DEFAULT NULL,
    p_page_key TEXT DEFAULT NULL,
    p_event TEXT DEFAULT NULL,
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0,
    p_exclude_test BOOLEAN DEFAULT false
)
RETURNS TABLE (
    id BIGINT, created_at TIMESTAMPTZ, user_id UUID, email TEXT, full_name TEXT,
    event TEXT, page_key TEXT, path TEXT, user_agent TEXT, total_count BIGINT
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
#variable_conflict use_column
BEGIN
    IF NOT public.erp_is_admin() THEN
        RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT l.id, l.created_at, l.user_id,
           COALESCE(m.email, u.email::text), m.full_name,
           l.event, l.page_key, l.path, l.user_agent,
           count(*) OVER ()
    FROM public.erp_activity_logs l
    LEFT JOIN public.erp_members m ON m.user_id = l.user_id
    LEFT JOIN auth.users u ON u.id = l.user_id
    WHERE l.created_at >= p_from AND l.created_at < p_to
      AND (p_user_id IS NULL OR l.user_id = p_user_id)
      AND (p_page_key IS NULL OR l.page_key = p_page_key)
      AND (p_event IS NULL OR l.event = p_event)
      AND NOT (p_exclude_test AND EXISTS (
          SELECT 1 FROM auth.users tu WHERE tu.id = l.user_id AND tu.email ILIKE '%.test'
      ))
    ORDER BY l.created_at DESC, l.id DESC
    LIMIT LEAST(GREATEST(p_limit, 1), 200)
    OFFSET GREATEST(p_offset, 0);
END $$;

-- Only signed-in users may call these
REVOKE EXECUTE ON FUNCTION
    public.erp_admin_activity_summary(TIMESTAMPTZ, TIMESTAMPTZ, BOOLEAN),
    public.erp_admin_activity_logs(TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT, INT, INT, BOOLEAN)
    FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION
    public.erp_admin_activity_summary(TIMESTAMPTZ, TIMESTAMPTZ, BOOLEAN),
    public.erp_admin_activity_logs(TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT, INT, INT, BOOLEAN)
    TO authenticated;
