import { test, expect } from '@playwright/test'

test.describe('Program selection reflects on Training home', () => {
  test.beforeEach(async ({ page }) => {
    // Mark as onboarded so we skip onboarding
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('keguel_onboarded', 'true')
      localStorage.removeItem('keguel_program')
      localStorage.removeItem('keguel_week')
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('selecting "Control Total" via detail page shows it on Training home', async ({ page }) => {
    // We should be on /training (home)
    await page.waitForSelector('text=PelvicForce')

    // 1. Navigate to Plans tab
    await page.click('a[href="#/program"]')
    await page.waitForURL('**/#/program')

    // 2. Verify we see all program cards
    await expect(page.locator('text=Control Total').first()).toBeVisible()
    await expect(page.locator('text=Erección Plena').first()).toBeVisible()
    await expect(page.locator('text=Máxima Intensidad').first()).toBeVisible()

    // 3. Click on "Control Total" card to go to detail page
    await page.locator('a[href="#/program/control"]').click()
    await page.waitForURL('**/#/program/control')

    // 4. Should see program detail with "Comenzar con este plan" button
    await expect(page.locator('text=Control Total').first()).toBeVisible()
    await expect(page.locator('text=Comenzar con este plan')).toBeVisible()

    // 5. Click "Comenzar con este plan"
    await page.locator('text=Comenzar con este plan').click()

    // 6. Should auto-navigate to Training home
    await page.waitForURL('**/#/training')

    // 7. Verify Training home reflects the selected program
    const heroSection = page.locator('main')
    await expect(heroSection.locator('text=Control Total').first()).toBeVisible({ timeout: 5000 })
    await expect(heroSection.locator('text=Activación').first()).toBeVisible({ timeout: 5000 })
  })

  test('selecting "Erección Plena" via detail page shows it on Training home', async ({ page }) => {
    // Navigate to Plans
    await page.click('a[href="#/program"]')
    await page.waitForURL('**/#/program')

    // Click on "Erección Plena" card
    await page.locator('a[href="#/program/erection"]').click()
    await page.waitForURL('**/#/program/erection')

    // Click "Comenzar con este plan"
    await page.locator('text=Comenzar con este plan').click()

    // Should navigate to Training home
    await page.waitForURL('**/#/training')

    // Verify it shows on home
    const heroSection = page.locator('main')
    await expect(heroSection.locator('text=Erección Plena').first()).toBeVisible({ timeout: 5000 })
    await expect(heroSection.locator('text=Base vascular').first()).toBeVisible({ timeout: 5000 })
  })

  test('switching program updates Training home', async ({ page }) => {
    // First select Control Total via detail page
    await page.click('a[href="#/program"]')
    await page.waitForURL('**/#/program')
    await page.locator('a[href="#/program/control"]').click()
    await page.waitForURL('**/#/program/control')
    await page.locator('text=Comenzar con este plan').click()
    await page.waitForURL('**/#/training')

    // Verify it's on home
    await expect(page.locator('main').locator('text=Control Total').first()).toBeVisible({ timeout: 5000 })

    // Now go to a different program detail to switch
    await page.click('a[href="#/program"]')
    await page.waitForURL('**/#/program')

    // "Control Total" should have "PROGRAMA ACTIVO" badge
    const activeCard = page.locator('a[href="#/program/control"]')
    await expect(activeCard.locator('text=PROGRAMA ACTIVO')).toBeVisible()

    // Click on "Máxima Intensidad" (a different program)
    await page.locator('a[href="#/program/intensity"]').click()
    await page.waitForURL('**/#/program/intensity')

    // Should show "Cambiar a este plan" button
    await expect(page.locator('text=Cambiar a este plan')).toBeVisible()

    // Click it to trigger confirmation modal
    await page.locator('text=Cambiar a este plan').click()

    // Confirmation modal should appear
    await expect(page.locator('text=¿Cambiar de plan?')).toBeVisible()

    // Confirm the switch
    await page.locator('text=Sí, cambiar').click()

    // Should navigate to Training home
    await page.waitForURL('**/#/training')

    // Verify new program is shown
    await expect(page.locator('main').locator('text=Máxima Intensidad').first()).toBeVisible({ timeout: 5000 })
  })

  test('abandoning program returns to home without program', async ({ page }) => {
    // First select a program
    await page.click('a[href="#/program"]')
    await page.waitForURL('**/#/program')
    await page.locator('a[href="#/program/erection"]').click()
    await page.waitForURL('**/#/program/erection')
    await page.locator('text=Comenzar con este plan').click()
    await page.waitForURL('**/#/training')

    // Verify program is active
    await expect(page.locator('main').locator('text=Erección Plena').first()).toBeVisible({ timeout: 5000 })

    // Go to the active program detail
    await page.click('a[href="#/program"]')
    await page.waitForURL('**/#/program')
    await page.locator('a[href="#/program/erection"]').click()
    await page.waitForURL('**/#/program/erection')

    // Should show "Abandonar plan" button
    await expect(page.locator('text=Abandonar plan')).toBeVisible()

    // Click it
    await page.locator('text=Abandonar plan').click()

    // Confirmation modal should appear
    await expect(page.locator('text=¿Abandonar plan?')).toBeVisible()

    // Confirm
    await page.locator('text=Sí, abandonar').click()

    // Should navigate to Training home
    await page.waitForURL('**/#/training')

    // Home should show no program state
    await expect(page.locator('main').locator('text=Elige un programa.').first()).toBeVisible({ timeout: 5000 })
  })
})
