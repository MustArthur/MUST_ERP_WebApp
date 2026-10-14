-- ==========================================
-- ERP access control: membership + page-level permissions
-- ERP has its own member list instead of reusing profiles / user_roles,
-- which belong to another app sharing this Supabase project.
-- Levels per page: (no row) = hidden, view = read only, edit = read + write.
-- Admins can do everything. Writes go through the erp_admin_* RPCs only.
-- ==========================================

CREATE TYPE public.erp_member_status AS ENUM ('pending', 'active', 'rejected', 'suspended');
CREATE TYPE public.erp_access_level AS ENUM ('view', 'edit');

CREATE TABLE public.erp_members (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    note TEXT,
    status public.erp_member_status NOT NULL DEFAULT 'pending',
    is_admin BOOLEAN NOT NULL DEFAULT false,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    decided_at TIMESTAMPTZ,
    decided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Keep in sync with PAGE_KEYS in lib/permissions.ts
CREATE TABLE public.erp_page_permissions (
    user_id UUID NOT NULL REFERENCES public.erp_members(user_id) ON DELETE CASCADE,
    page_key TEXT NOT NULL CHECK (page_key IN (
        'dashboard', 'items', 'suppliers', 'recipes', 'receiving', 'quality',
        'production_planning', 'production', 'inventory', 'transactions',
        'finished_goods', 'delivery', 'factory_expenses', 'vehicles', 'machines'
    )),
    level public.erp_access_level NOT NULL,
    PRIMARY KEY (user_id, page_key)
);

-- ------------------------------------------
-- Permission checks (used by RLS policies and the app)
-- ------------------------------------------
CREATE OR REPLACE FUNCTION public.erp_is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.erp_members
        WHERE user_id = auth.uid() AND status = 'active' AND is_admin
    )
$$;

CREATE OR REPLACE FUNCTION public.erp_is_member()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.erp_members
        WHERE user_id = auth.uid() AND status = 'active'
    )
$$;

-- True when the caller may view at least one of the given pages
CREATE OR REPLACE FUNCTION public.erp_can_view(pages TEXT[])
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.erp_members m
        WHERE m.user_id = auth.uid() AND m.status = 'active'
          AND (m.is_admin OR EXISTS (
              SELECT 1 FROM public.erp_page_permissions p
              WHERE p.user_id = m.user_id AND p.page_key = ANY (pages)
          ))
    )
$$;

-- True when the caller may edit at least one of the given pages
CREATE OR REPLACE FUNCTION public.erp_can_edit(pages TEXT[])
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.erp_members m
        WHERE m.user_id = auth.uid() AND m.status = 'active'
          AND (m.is_admin OR EXISTS (
              SELECT 1 FROM public.erp_page_permissions p
              WHERE p.user_id = m.user_id AND p.page_key = ANY (pages) AND p.level = 'edit'
          ))
    )
$$;

-- Everything the app needs about the current user in one round trip
CREATE OR REPLACE FUNCTION public.erp_my_access()
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT CASE
        WHEN m.user_id IS NULL THEN
            jsonb_build_object('status', 'none', 'is_admin', false, 'permissions', '{}'::jsonb)
        ELSE jsonb_build_object(
            'status', m.status,
            'is_admin', m.is_admin,
            'full_name', m.full_name,
            'permissions', COALESCE((
                SELECT jsonb_object_agg(p.page_key, p.level)
                FROM public.erp_page_permissions p WHERE p.user_id = m.user_id
            ), '{}'::jsonb),
            'pending_count', CASE WHEN m.is_admin AND m.status = 'active'
                THEN (SELECT count(*) FROM public.erp_members WHERE status = 'pending') END
        )
    END
    FROM (SELECT auth.uid() AS uid) u
    LEFT JOIN public.erp_members m ON m.user_id = u.uid
$$;

-- ------------------------------------------
-- Requesting access
-- ------------------------------------------
-- New sign-ups from the ERP /signup page carry erp_signup=true in their metadata
CREATE OR REPLACE FUNCTION public.erp_handle_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    IF COALESCE(NEW.raw_user_meta_data->>'erp_signup', '') = 'true' THEN
        INSERT INTO public.erp_members (user_id, email, full_name, note)
        VALUES (
            NEW.id,
            NEW.email,
            NULLIF(left(NEW.raw_user_meta_data->>'full_name', 100), ''),
            NULLIF(left(NEW.raw_user_meta_data->>'note', 300), '')
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END $$;

CREATE TRIGGER erp_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.erp_handle_signup();

-- For people who already have an account (e.g. from the other app) and log in to ERP
CREATE OR REPLACE FUNCTION public.erp_request_access(p_full_name TEXT, p_note TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
    END IF;
    INSERT INTO public.erp_members (user_id, email, full_name, note)
    SELECT u.id, u.email, NULLIF(left(p_full_name, 100), ''), NULLIF(left(p_note, 300), '')
    FROM auth.users u WHERE u.id = auth.uid()
    ON CONFLICT (user_id) DO NOTHING;
END $$;

-- ------------------------------------------
-- Admin RPCs
-- ------------------------------------------
CREATE OR REPLACE FUNCTION public.erp_admin_list_members()
RETURNS TABLE (
    user_id UUID, email TEXT, full_name TEXT, note TEXT,
    status public.erp_member_status, is_admin BOOLEAN,
    requested_at TIMESTAMPTZ, decided_at TIMESTAMPTZ, permissions JSONB
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    IF NOT public.erp_is_admin() THEN
        RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
    END IF;
    RETURN QUERY
    SELECT m.user_id, m.email, m.full_name, m.note, m.status, m.is_admin,
           m.requested_at, m.decided_at,
           COALESCE((
               SELECT jsonb_object_agg(p.page_key, p.level)
               FROM public.erp_page_permissions p WHERE p.user_id = m.user_id
           ), '{}'::jsonb)
    FROM public.erp_members m
    ORDER BY m.requested_at DESC;
END $$;

CREATE OR REPLACE FUNCTION public.erp_admin_set_status(p_user_id UUID, p_status public.erp_member_status)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    IF NOT public.erp_is_admin() THEN
        RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
    END IF;
    IF p_user_id = auth.uid() THEN
        RAISE EXCEPTION 'cannot change your own status' USING ERRCODE = '42501';
    END IF;
    UPDATE public.erp_members
    SET status = p_status, decided_at = now(), decided_by = auth.uid()
    WHERE user_id = p_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'member not found' USING ERRCODE = 'P0002';
    END IF;
END $$;

-- Replaces the member's whole permission set. p_permissions: {"items": "edit", "recipes": "view", ...}
-- Pages missing from the object (or set to "none") end up hidden.
CREATE OR REPLACE FUNCTION public.erp_admin_set_permissions(p_user_id UUID, p_permissions JSONB)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    IF NOT public.erp_is_admin() THEN
        RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.erp_members WHERE user_id = p_user_id) THEN
        RAISE EXCEPTION 'member not found' USING ERRCODE = 'P0002';
    END IF;
    DELETE FROM public.erp_page_permissions WHERE user_id = p_user_id;
    INSERT INTO public.erp_page_permissions (user_id, page_key, level)
    SELECT p_user_id, key, value::public.erp_access_level
    FROM jsonb_each_text(COALESCE(p_permissions, '{}'::jsonb))
    WHERE value IN ('view', 'edit');
END $$;

-- Only signed-in users may call these; the trigger function is never called directly
REVOKE EXECUTE ON FUNCTION
    public.erp_is_admin(), public.erp_is_member(), public.erp_can_view(TEXT[]), public.erp_can_edit(TEXT[]),
    public.erp_my_access(), public.erp_request_access(TEXT, TEXT), public.erp_admin_list_members(),
    public.erp_admin_set_status(UUID, public.erp_member_status), public.erp_admin_set_permissions(UUID, JSONB)
    FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION
    public.erp_is_admin(), public.erp_is_member(), public.erp_can_view(TEXT[]), public.erp_can_edit(TEXT[]),
    public.erp_my_access(), public.erp_request_access(TEXT, TEXT), public.erp_admin_list_members(),
    public.erp_admin_set_status(UUID, public.erp_member_status), public.erp_admin_set_permissions(UUID, JSONB)
    TO authenticated;
REVOKE EXECUTE ON FUNCTION public.erp_handle_signup() FROM PUBLIC, anon, authenticated;

-- ------------------------------------------
-- RLS for the two new tables: read your own row, admins read all, no direct writes
-- ------------------------------------------
ALTER TABLE public.erp_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_page_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own membership or admin" ON public.erp_members
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()) OR (SELECT public.erp_is_admin()));

CREATE POLICY "Read own permissions or admin" ON public.erp_page_permissions
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()) OR (SELECT public.erp_is_admin()));

-- ------------------------------------------
-- Bootstrap (project-specific; applied separately on 2026-10-13, kept here for the record)
-- ------------------------------------------
-- INSERT INTO public.erp_members (user_id, email, status, is_admin, decided_at)
--   SELECT id, email, 'active', true, now() FROM auth.users WHERE id = '8e902b69-a931-4d7b-9f6a-fee292bbfa31';  -- owner
-- INSERT INTO public.erp_members (user_id, email, full_name, status, decided_at)
--   SELECT id, email, 'E2E test (read-only)', 'active', now() FROM auth.users WHERE email = 'e2e-test@must-erp.test';
-- INSERT INTO public.erp_page_permissions (user_id, page_key, level)
--   SELECT u.id, k, 'view' FROM auth.users u, unnest(ARRAY['dashboard','items','suppliers','recipes','receiving','quality',
--     'production_planning','production','inventory','transactions','finished_goods','delivery','factory_expenses',
--     'vehicles','machines']) k WHERE u.email = 'e2e-test@must-erp.test';
-- INSERT INTO public.erp_members (user_id, email)  -- had ERP access via profiles; admin decides
--   SELECT id, email FROM auth.users WHERE id = '4626b264-a396-4d65-8733-a7f95fa4c6b9';
