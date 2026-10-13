import { test, expect, settle } from './fixtures'

// Read-only smoke test of every module: page renders, data loads, no runtime errors
const pages = [
    { path: '/dashboard', heading: 'แดชบอร์ด' },
    { path: '/items', heading: 'จัดการรายการสินค้า' },
    { path: '/suppliers', heading: 'ซัพพลายเออร์' },
    { path: '/recipes', heading: 'สูตรการผลิต (BOM)' },
    { path: '/receiving', heading: 'รับวัตถุดิบ' },
    { path: '/quality', heading: 'ควบคุมคุณภาพ (QC)' },
    { path: '/production-planning', heading: 'วางแผนการผลิต' },
    { path: '/production', heading: 'การผลิต' },
    { path: '/inventory', heading: 'คลังสินค้า' },
    { path: '/transactions', heading: 'รายการเคลื่อนไหว' },
    { path: '/finished-goods', heading: 'สินค้าสำเร็จรูป' },
    { path: '/delivery', heading: 'จัดส่งสินค้า' },
    { path: '/factory-expenses', heading: 'ค่าใช้จ่ายโรงงาน' },
    { path: '/vehicles', heading: 'รถขนส่ง' },
    { path: '/machines', heading: 'เครื่องจักร' },
]

for (const { path, heading } of pages) {
    test(`${path} โหลดได้ไม่มี error`, async ({ page, problems }, testInfo) => {
        await page.goto(path)
        await expect(page).toHaveURL(new RegExp(`${path}$`))
        await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible({ timeout: 15_000 })
        await settle(page)

        // No horizontal scroll. Compare against clientWidth (the device width): on mobile,
        // window.innerWidth grows to fit over-wide content, so it would hide the problem.
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect.soft(overflow, 'horizontal overflow (px)').toBeLessThanOrEqual(1)

        // Page-level buttons must not be pushed past the screen edge. A parent with overflow:hidden
        // clips them without creating a scrollbar, so the scrollWidth check alone misses it.
        const clipped = await page.evaluate(() =>
            Array.from(document.querySelectorAll('button, a[href]'))
                // Skip the sidebar/drawer, fixed overlays, and scroll containers that clip by design
                .filter(el => !el.closest('aside, .fixed, [role="dialog"], table, [data-radix-scroll-area-viewport], .overflow-x-auto'))
                .filter(el => {
                    const r = el.getBoundingClientRect()
                    return r.width > 0 && r.height > 0 && (r.right > document.documentElement.clientWidth + 1 || r.left < -1)
                })
                .map(el => (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 30))
        )
        expect.soft(clipped, 'buttons cut off at screen edge').toEqual([])

        await testInfo.attach('screenshot', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })
        expect(problems.errors, problems.errors.join('\n')).toEqual([])
    })
}
