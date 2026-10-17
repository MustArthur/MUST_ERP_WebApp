import { test, expect, settle } from './fixtures'

// The e2e account is an active, non-admin member with view-only access to every page

test('หน้าแรกพาไปหน้าแรกที่มีสิทธิ์', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/dashboard$/)
})

test('ผู้ใช้ทั่วไปเข้าหน้าผู้ดูแลไม่ได้ และไม่เห็นเมนูผู้ดูแล', async ({ page }) => {
    await page.goto('/admin/members')
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('link', { name: 'ผู้ใช้งาน', exact: true })).toHaveCount(0)
})

test('สิทธิ์ดูอย่างเดียวแสดงแถบแจ้ง', async ({ page, problems }) => {
    await page.goto('/machines')
    await expect(page.getByRole('status').filter({ hasText: 'ดูอย่างเดียว' })).toBeVisible()
    await settle(page)
    expect(problems.errors, problems.errors.join('\n')).toEqual([])
})

test('สมาชิกที่ใช้งานอยู่ถูกพาออกจากหน้าสถานะคำขอ', async ({ page }) => {
    await page.goto('/access')
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 })
})

test('ผู้ใช้ทั่วไปเข้าหน้าประวัติการใช้งานไม่ได้', async ({ page }) => {
    await page.goto('/admin/activity')
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('link', { name: 'ประวัติการใช้งาน' })).toHaveCount(0)
})

test('เปิดหน้าโมดูลแล้วบันทึกการเข้าใช้งานสำเร็จ', async ({ page, problems }) => {
    const logged = page.waitForResponse((res) => res.url().includes('/rpc/erp_log_activity'))
    await page.goto('/items')
    const res = await logged
    expect(res.status(), await res.text()).toBeLessThan(300)
    expect(res.request().postDataJSON()).toMatchObject({ p_event: 'page_view', p_page_key: 'items', p_path: '/items' })
    await settle(page)
    expect(problems.errors, problems.errors.join('\n')).toEqual([])
})
