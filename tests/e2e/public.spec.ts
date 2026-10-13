import { test, expect } from '@playwright/test'

// Runs without a session
test.describe('ไม่ได้ login', () => {
    const protectedRoutes = [
        '/', '/dashboard', '/items', '/suppliers', '/recipes', '/receiving', '/quality',
        '/production-planning', '/production', '/inventory', '/transactions',
        '/finished-goods', '/delivery', '/factory-expenses', '/vehicles', '/machines',
    ]

    for (const route of protectedRoutes) {
        test(`${route} ถูกพาไปหน้า login`, async ({ page }) => {
            await page.goto(route)
            await expect(page).toHaveURL(/\/login$/)
        })
    }

    test('หน้า login แสดงฟอร์มครบ', async ({ page }) => {
        await page.goto('/login')
        await expect(page.getByRole('heading', { name: 'MUST ERP' })).toBeVisible()
        await expect(page.getByLabel('อีเมล')).toBeVisible()
        await expect(page.getByLabel('รหัสผ่าน')).toBeVisible()
        await expect(page.getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeEnabled()
    })

    test('รหัสผ่านผิดต้องขึ้นข้อความ error ภาษาไทย', async ({ page }) => {
        await page.goto('/login')
        await page.getByLabel('อีเมล').fill('e2e-test@must-erp.test')
        await page.getByLabel('รหัสผ่าน').fill('wrong-password-123')
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()
        await expect(page.getByText('อีเมลหรือรหัสผ่านไม่ถูกต้อง')).toBeVisible({ timeout: 15_000 })
        await expect(page).toHaveURL(/\/login$/)
    })
})
