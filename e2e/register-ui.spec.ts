import { expect, test } from '@playwright/test';

test('formulario accesible, roles públicos y validaciones sin enviar datos', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (request.url().endsWith('/auth/register')) requests.push(request.url()); });
  await page.goto('/registro');
  await expect(page.getByRole('heading', { name: 'Crea tu cuenta' })).toBeVisible();
  const roles = await page.getByLabel('Quiero participar como').locator('option').allTextContents();
  expect(roles).toEqual(['Ciudadano', 'Voluntario', 'Entidad']);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.locator('#nombre-error')).toContainText('Escribe un nombre');
  await expect(page.locator('#correo-error')).toContainText('correo electrónico válido');
  await expect(page.locator('#password-error')).toContainText('Revisa la longitud');
  expect(requests).toEqual([]);
});

test('registro móvil sin desbordamiento y error de conexión comprensible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('**/api/v1/auth/register', route => route.abort('failed'));
  await page.goto('/registro');
  await page.getByLabel('Nombre', { exact: true }).fill('María Niño');
  await page.getByLabel('Correo electrónico').fill('persona@example.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('una-clave-segura');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByRole('status')).toContainText('No se pudo conectar');
  await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/registro-mobile.png', fullPage: true });
});
