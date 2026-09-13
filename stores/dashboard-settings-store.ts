import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DEFAULT_FRESH_CHICKEN_DAILY_TARGET_KG = 1600

interface DashboardSettingsState {
    /** Daily intake target drawn as a dashed reference line on the Fresh Chicken quantity chart */
    freshChickenDailyTargetKg: number
    /** Whether that reference line is drawn at all */
    freshChickenTargetEnabled: boolean
    setFreshChickenDailyTargetKg: (value: number) => void
    setFreshChickenTargetEnabled: (enabled: boolean) => void
    resetFreshChickenTarget: () => void
}

export const useDashboardSettingsStore = create<DashboardSettingsState>()(
    persist(
        (set) => ({
            freshChickenDailyTargetKg: DEFAULT_FRESH_CHICKEN_DAILY_TARGET_KG,
            freshChickenTargetEnabled: true,
            setFreshChickenDailyTargetKg: (value) => set({ freshChickenDailyTargetKg: value }),
            setFreshChickenTargetEnabled: (enabled) => set({ freshChickenTargetEnabled: enabled }),
            resetFreshChickenTarget: () =>
                set({
                    freshChickenDailyTargetKg: DEFAULT_FRESH_CHICKEN_DAILY_TARGET_KG,
                    freshChickenTargetEnabled: true,
                }),
        }),
        {
            name: 'must-erp-dashboard-settings',
        }
    )
)
