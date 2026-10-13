-- ==========================================
-- Tighten ERP RLS: logged-in is not enough, the user must be approved
-- Before: "Authenticated users only" = auth.uid() IS NOT NULL
--         -> anyone who could sign up got full read/write on ERP data
-- After:  "Active users only" = public.is_active_user(auth.uid())
--         (profiles.status = 'active'; set by handle_new_user via allowed_emails)
-- ==========================================

DO $$
DECLARE
    t TEXT;
    erp_tables TEXT[] := ARRAY[
        'categories', 'factory_expense_custom_subcategories', 'factory_expenses',
        'inventory_transactions', 'item_qc_templates', 'item_suppliers', 'items',
        'locations', 'lots', 'machines', 'purchase_receipt_items', 'purchase_receipts',
        'qc_inspection_readings', 'qc_inspections', 'qc_template_parameters', 'qc_templates',
        'quarantine_records', 'recipe_lines', 'recipes', 'stock_entries', 'stock_entry_items',
        'stock_on_hand', 'suppliers', 'units_of_measure', 'vehicles', 'warehouses'
    ];
BEGIN
    FOREACH t IN ARRAY erp_tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated users only" ON public.%I', t);
        -- (select ...) wrapper lets Postgres evaluate the check once per query, not per row
        EXECUTE format(
            'CREATE POLICY "Active users only" ON public.%I FOR ALL TO authenticated
                USING ((SELECT public.is_active_user(auth.uid())))
                WITH CHECK ((SELECT public.is_active_user(auth.uid())))',
            t
        );
    END LOOP;
END $$;
