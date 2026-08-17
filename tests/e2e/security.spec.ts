import { expect, test } from '@playwright/test'

test('generating a QR and opening its options triggers no CSP violations', async ({
  page,
}) => {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  await page.goto('/')
  await page
    .getByPlaceholder(/pega o escribe una url/i)
    .fill('https://github.com/anthropics/claude-code')
  await page.getByRole('button', { name: /generar/i }).click()

  await page.getByRole('tab', { name: 'QR' }).click()
  await expect(page.locator('svg').last()).toBeVisible()

  await page.getByRole('button', { name: /opciones/i }).click()
  await expect(
    page.getByText('Corrección de errores', { exact: true }),
  ).toBeVisible()

  const cspViolations = consoleErrors.filter((text) =>
    /content security policy/i.test(text),
  )
  expect(cspViolations).toEqual([])
})

test('a confusable homograph destination shows the interstitial, not an instant redirect', async ({
  page,
}) => {
  await page.goto('/')
  // "аpple.com" con la primera letra en cirílico.
  await page
    .getByPlaceholder(/pega o escribe una url/i)
    .fill('https://аpple.com/login')
  await page.getByRole('button', { name: /generar/i }).click()

  const linkBox = page.getByText(/#v1\./)
  await expect(linkBox).toBeVisible()
  const webLink = (await linkBox.textContent())!.trim()

  await page.goto(webLink)
  await expect(
    page.getByRole('heading', { name: /comprueba este destino/i }),
  ).toBeVisible()
  expect(page.url()).toBe(webLink)

  // xn--pple-....com no existe de verdad: se intercepta la petición para no
  // depender de resolución DNS real en el test.
  await page.route(/xn--/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/plain', body: 'ok' }),
  )
  await page.getByRole('button', { name: /continuar de todos modos/i }).click()
  await page.waitForURL(/xn--/)
})
