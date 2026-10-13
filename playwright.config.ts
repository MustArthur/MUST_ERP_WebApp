import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

// E2E_BASE_URL / E2E_EMAIL / E2E_PASSWORD live in .env.test.local (gitignored)
dotenv.config({ path: '.env.test.local', quiet: true })

// Local default is 3100, not 3000: other apps on this machine often hold 3000
const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3100'
const isLocal = baseURL.includes('localhost')
const localPort = new URL(baseURL).port || '3100'
const authFile = 'tests/.auth/user.json'

export default defineConfig({
    testDir: './tests/e2e',
    // `next dev` compiles each route on first visit, so local runs need more headroom
    timeout: isLocal ? 120_000 : 30_000,
    expect: { timeout: isLocal ? 30_000 : 5_000 },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : 4,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL,
        locale: 'th-TH',
        timezoneId: 'Asia/Bangkok',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        { name: 'setup', testMatch: /auth\.setup\.ts/ },
        {
            name: 'public',
            testMatch: /public\.spec\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'desktop',
            testIgnore: /public\.spec\.ts/,
            use: { ...devices['Desktop Chrome'], storageState: authFile },
            dependencies: ['setup'],
        },
        {
            name: 'mobile',
            testMatch: /pages\.spec\.ts/,
            use: { ...devices['Pixel 5'], storageState: authFile },
            dependencies: ['setup'],
        },
    ],
    webServer: isLocal
        ? { command: `npx next dev -p ${localPort}`, url: `${baseURL}/login`, reuseExistingServer: false, timeout: 180_000 }
        : undefined,
})
