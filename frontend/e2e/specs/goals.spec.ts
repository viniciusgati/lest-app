import { test, expect } from '@playwright/test';
import { registerAndLogin } from '../helpers/auth.helper';

test.describe('Metas Semanais', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test('definir meta semanal persiste após salvar', async ({ page }) => {
    await page.goto('/goals');

    // Preencher metas na seção "Definir metas"
    const defineCard = page.locator('p-card').filter({ hasText: 'Definir metas' });

    // Horas de estudo (1º inputNumber na seção)
    const hoursInput = defineCard.locator('.field').nth(0).locator('input');
    await hoursInput.fill('');
    await hoursInput.pressSequentially('10');

    // Questões (2º inputNumber)
    const questionsInput = defineCard.locator('.field').nth(1).locator('input');
    await questionsInput.fill('');
    await questionsInput.pressSequentially('50');

    // % alvo (3º inputNumber)
    const percentInput = defineCard.locator('.field').nth(2).locator('input');
    await percentInput.fill('');
    await percentInput.pressSequentially('70');

    await page.getByRole('button', { name: 'Salvar meta' }).click();

    // Verificar toast de sucesso
    await expect(page.locator('p-toast')).toBeVisible();

    // Recarregar e verificar persistência
    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(defineCard.locator('.field').nth(0).locator('input')).toHaveValue('10');
  });

  test('navegação para /goals exibe página de metas', async ({ page }) => {
    await page.goto('/goals');
    await expect(page.getByText('Metas da Semana')).toBeVisible();
    await expect(page.getByText('Progresso atual')).toBeVisible();
    await expect(page.getByText('Definir metas')).toBeVisible();
  });
});
