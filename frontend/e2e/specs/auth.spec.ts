import { test, expect } from '@playwright/test';
import { registerAndLogin, login, uniqueEmail } from '../helpers/auth.helper';

test.describe('Autenticação', () => {
  test('registro cria conta e redireciona para Home', async ({ page }) => {
    const { email } = await registerAndLogin(page);
    await expect(page).toHaveURL('/');
    await expect(page.locator('p-toolbar')).toBeVisible();
  });

  test('login com credenciais corretas redireciona para Home', async ({ page }) => {
    const email = uniqueEmail();
    const password = 'Test123456';
    await registerAndLogin(page, email, password);

    // Logout first
    await page.locator('p-button[ptooltip="Sair"]').click();
    await page.waitForURL('/auth/login');

    // Login again
    await login(page, email, password);
    await expect(page).toHaveURL('/');
  });

  test('logout redireciona para login', async ({ page }) => {
    await registerAndLogin(page);
    await page.locator('p-button[ptooltip="Sair"]').click();
    await expect(page).toHaveURL('/auth/login');
  });

  test('acesso a rota protegida sem autenticação redireciona para login', async ({ page }) => {
    await page.goto('/subjects');
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('login com senha incorreta exibe mensagem de erro', async ({ page }) => {
    const email = uniqueEmail();
    await registerAndLogin(page, email, 'Test123456');

    await page.locator('p-button[ptooltip="Sair"]').click();
    await page.waitForURL('/auth/login');

    await page.locator('#email').fill(email);
    await page.locator('#password').fill('SenhaErrada1');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.locator('p-message')).toBeVisible();
  });
});
