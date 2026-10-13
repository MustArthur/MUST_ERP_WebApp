import { test as base, expect, type Page } from '@playwright/test'

type PageProblems = { errors: string[]; warnings: string[] }

// Collects runtime problems while a test runs: uncaught exceptions, console errors,
// and failed Supabase requests. 406 = `.single()` found no row, which pages use
// legitimately, so it is reported as a warning rather than a failure.
export const test = base.extend<{ problems: PageProblems }>({
    problems: async ({ page }, use, testInfo) => {
        const problems: PageProblems = { errors: [], warnings: [] }

        page.on('pageerror', err => problems.errors.push(`pageerror: ${err.message}`))
        page.on('console', msg => {
            if (msg.type() === 'error') problems.errors.push(`console: ${msg.text().slice(0, 300)}`)
        })
        page.on('response', res => {
            const url = res.url()
            if (!url.includes('.supabase.co')) return
            const path = new URL(url).pathname
            if (res.status() === 406) problems.warnings.push(`406 ${path}`)
            else if (res.status() >= 400) problems.errors.push(`${res.status()} ${res.request().method()} ${path}`)
        })

        await use(problems)

        if (problems.warnings.length) {
            testInfo.annotations.push({ type: 'warning', description: problems.warnings.join(' | ') })
        }
    },
})

export async function settle(page: Page) {
    // Data loads client-side after hydration; wait for the network to go quiet
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
}

export { expect }
