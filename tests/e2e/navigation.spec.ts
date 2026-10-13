import { test, expect, settle } from './fixtures'

test('เมนู sidebar พาไปทุกหน้าได้', async ({ page, problems }) => {
    await page.goto('/dashboard')
    const targets = ['สินค้า/วัตถุดิบ', 'สูตรการผลิต', 'รับวัตถุดิบ', 'วางแผนการผลิต', 'ค่าใช้จ่าย', 'เครื่องจักร']
    for (const name of targets) {
        await page.getByRole('link', { name, exact: true }).first().click()
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    }
    await settle(page)
    expect(problems.errors, problems.errors.join('\n')).toEqual([])
})

test('คลิกรายการสินค้าแล้วเปิดหน้ารายละเอียด', async ({ page, problems }) => {
    await page.goto('/items')
    await settle(page)
    await page.locator('table tbody tr').first().click()
    await expect(page).toHaveURL(/\/items\/[0-9a-f-]{36}$/, { timeout: 15_000 })
    await settle(page)
    await expect(page.getByText(/ไม่พบ/)).toHaveCount(0)
    expect(problems.errors, problems.errors.join('\n')).toEqual([])
})

test('คลิกซัพพลายเออร์แล้วเปิดหน้ารายละเอียด', async ({ page, problems }) => {
    await page.goto('/suppliers')
    await settle(page)
    await page.locator('table tbody tr').first().click()
    await expect(page).toHaveURL(/\/suppliers\/[0-9a-f-]{36}$/, { timeout: 15_000 })
    await settle(page)
    await expect(page.getByText(/ไม่พบ/)).toHaveCount(0)
    expect(problems.errors, problems.errors.join('\n')).toEqual([])
})
