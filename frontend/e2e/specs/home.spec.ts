import { test, expect } from '@playwright/test';
import { registerAndLogin } from '../helpers/auth.helper';

test.describe('Dashboard Home', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test('home carrega com seções de métricas', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Meta da semana')).toBeVisible();
    await expect(page.getByText('Esta semana')).toBeVisible();
    await expect(page.getByText('Desempenho por matéria')).toBeVisible();
  });

  test('sem metas exibe mensagem informativa', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await expect(
      page.locator('p-message').filter({ hasText: 'Defina sua meta semanal' })
    ).toBeVisible();
  });

  test('sem sessões exibe estado vazio em desempenho', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Nenhuma sessão registrada ainda.')).toBeVisible();
  });

  test('mini-calendário semanal exibe 7 dias', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await expect(page.locator('.day-cell')).toHaveCount(7);
  });

  test('botão Gerar semana está visível na home', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Gerar semana' })).toBeVisible();
  });
});
