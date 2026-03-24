import { test, expect } from '@playwright/test';
import { registerAndLogin } from '../helpers/auth.helper';

test.describe('Perfil do Usuário', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test('navegar para /profile via ícone de usuário no header', async ({ page }) => {
    await page.goto('/');
    await page.locator('p-button[ptooltip="Perfil"]').click();
    await page.waitForURL('/profile');
    await expect(page).toHaveURL('/profile');
  });

  test('tela de perfil exibe formulário com campo Nome', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar' })).toBeVisible();
  });

  test('campo Nome é pré-preenchido com nome do usuário', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('#name')).not.toHaveValue('');
  });

  test('atualizar nome exibe toast de sucesso', async ({ page }) => {
    await page.goto('/profile');

    await page.locator('#name').fill('Nome Atualizado E2E');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.locator('p-toast')).toContainText('Sucesso');
  });

  test('acessar /profile diretamente sem navegar redireciona para a tela correta', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL('/profile');
    await expect(page.locator('p-card')).toBeVisible();
  });
});
