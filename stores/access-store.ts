import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { MyAccess } from '@/lib/permissions'

interface AccessState {
    access: MyAccess | null
    isLoading: boolean
    error: string | null
    fetchAccess: () => Promise<MyAccess | null>
    clear: () => void
}

// The current user's ERP membership + page permissions. Middleware enforces the same
// rules server-side; this copy only drives what the UI shows.
export const useAccessStore = create<AccessState>()((set) => ({
    access: null,
    isLoading: true,
    error: null,

    fetchAccess: async () => {
        set({ isLoading: true, error: null })
        const { data, error } = await createClient().rpc('erp_my_access')
        if (error) {
            console.error('Failed to load ERP access:', error)
            set({ isLoading: false, error: 'โหลดสิทธิ์การใช้งานไม่สำเร็จ' })
            return null
        }
        const access = data as MyAccess
        set({ access, isLoading: false })
        return access
    },

    clear: () => set({ access: null, isLoading: false, error: null }),
}))
