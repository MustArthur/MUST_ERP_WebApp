import { test as setup, expect } from '@playwright/test'

const authFile = 'tests/.auth/user.json'

// Log in once through the real UI and reuse the session for every authenticated test
setup('authenticate', async ({ page }) => {
    const email = process.env.E2E_EMAIL
    const password = process.env.E2E_PASSWORD
    if (!email || !password) throw new Error('Missing E2E_EMAIL / E2E_PASSWORD in .env.test.local')

    await page.goto('/login')
    await page.getByLabel('อีเมล').fill(email)
    await page.getByLabel('รหัสผ่าน').fill(password)
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })
    await page.context().storageState({ path: authFile })
})
