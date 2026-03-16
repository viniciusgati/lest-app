import { test, expect } from '@playwright/test';
import { registerAndLogin } from '../helpers/auth.helper';

async function setupSubjectTopicAndGoal(page: import('@playwright/test').Page): Promise<void> {
  // Criar matéria
  await page.goto('/subjects');
  await page.getByRole('button', { name: 'Nova Matéria' }).click();
  await page.locator('p-dialog #name').fill('História');
  await page.locator('p-dialog').getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('História')).toBeVisible();

  // Criar tema
  await page.getByText('História').click();
  await page.waitForURL(/\/subjects\/\d+/);
  await page.getByRole('button', { name: 'Novo Tema' }).click();
  await page.locator('p-dialog #name').fill('Brasil Colônia');
  await page.locator('p-dialog').getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('Brasil Colônia')).toBeVisible();

  // Definir meta (necessário para geração)
  await page.goto('/goals');
  const defineCard = page.locator('p-card').filter({ hasText: 'Definir metas' });
  await defineCard.locator('.field').nth(0).locator('input').pressSequentially('5');
  await defineCard.locator('.field').nth(1).locator('input').pressSequentially('20');
  await defineCard.locator('.field').nth(2).locator('input').pressSequentially('60');
  await page.getByRole('button', { name: 'Salvar meta' }).click();
  await expect(page.locator('p-toast')).toBeVisible();
}

test.describe('Gerar Semana', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    await setupSubjectTopicAndGoal(page);
  });

  test('botão Gerar semana abre dialog de confirmação', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Gerar semana' }).click();
    await expect(page.locator('p-confirmdialog')).toBeVisible();
    await expect(
      page.getByText('Isso substituirá sessões agendadas automaticamente')
    ).toBeVisible();
  });

  test('confirmar geração exibe toast de sucesso', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Gerar semana' }).click();

    // Confirmar dialog
    const confirmDialog = page.locator('p-confirmdialog');
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.locator('.p-confirmdialog-accept-button').click();

    // Toast de sucesso
    await expect(page.locator('p-toast')).toBeVisible({ timeout: 10000 });
  });

  test('gerar semana via Agenda exibe confirmação', async ({ page }) => {
    await page.goto('/agenda');
    await page.getByRole('button', { name: 'Gerar semana' }).click();
    await expect(page.locator('p-confirmdialog')).toBeVisible();
    await expect(
      page.getByText('Isso substituirá sessões agendadas automaticamente')
    ).toBeVisible();
  });

  test('sem matérias, home exibe aviso ao tentar gerar', async ({ page }) => {
    // Novo usuário sem matérias
    const { email } = await registerAndLogin(page);
    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: 'Gerar semana' }).click();

    // Deve exibir toast de aviso, não o confirm dialog
    await expect(page.locator('p-toast')).toBeVisible();
    await expect(page.locator('p-confirmdialog')).not.toBeVisible();
  });
});
