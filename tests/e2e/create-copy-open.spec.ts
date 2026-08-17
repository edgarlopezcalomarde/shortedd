import { expect, test } from '@playwright/test'

test('paste a URL, generate, copy the web link, and open it to confirm redirect', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/')

  await page
    .getByPlaceholder(/pega o escribe una url/i)
    .fill('https://github.com/anthropics/claude-code')
  await page.getByRole('button', { name: /generar/i }).click()

  const linkBox = page.getByText(/#v1\./)
  await expect(linkBox).toBeVisible()
  const webLink = (await linkBox.textContent())!.trim()

  await page
    .getByRole('button', { name: /copiar/i })
    .first()
    .click()
  const clipboardText = await page.evaluate(() =>
    navigator.clipboard.readText(),
  )
  expect(clipboardText).toBe(webLink)

  const redirectPage = await context.newPage()
  await redirectPage.goto(webLink)
  await redirectPage.waitForURL('https://github.com/anthropics/claude-code**')
  await redirectPage.close()
})

test('an invalid URL shows an inline error and never navigates', async ({
  page,
}) => {
  await page.goto('/')
  await page
    .getByPlaceholder(/pega o escribe una url/i)
    .fill('javascript:alert(1)')
  await page.getByRole('button', { name: /generar/i }).click()

  await expect(page.getByRole('alert')).toBeVisible()
  expect(page.url()).toContain('/')
})

test('opening a corrupt payload shows an error view and does not redirect', async ({
  page,
}) => {
  await page.goto('/#v1.this-is-not-a-valid-payload')
  await expect(
    page.getByRole('heading', { name: /enlace no válido/i }),
  ).toBeVisible()
})
