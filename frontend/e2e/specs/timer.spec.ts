import { test, expect } from '@playwright/test';
import { registerAndLogin } from '../helpers/auth.helper';

async function setupSessionForToday(page: import('@playwright/test').Page): Promise<void> {
  // Criar matéria e tema
  await page.goto('/subjects');
  await page.getByRole('button', { name: 'Nova Matéria' }).click();
  await page.locator('p-dialog #name').fill('Física');
  await page.locator('p-dialog').getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('Física')).toBeVisible();

  await page.locator('p-card').filter({ hasText: 'Física' }).getByRole('button', { name: 'Temas' }).click();
  await page.waitForURL(/\/subjects\/\d+/);
  await page.getByRole('button', { name: 'Novo Tema' }).click();
  await page.locator('p-dialog #name').fill('Cinemática');
  await page.locator('p-dialog').getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('Cinemática')).toBeVisible();

  // Criar sessão para hoje na Agenda
  await page.goto('/agenda');
  await page.getByRole('button', { name: 'Nova Sessão' }).click();
  const dialog = page.locator('p-dialog').filter({ hasText: 'Nova Sessão de Estudo' });
  await expect(dialog).toBeVisible();

  const today = new Date().toISOString().split('T')[0];
  await dialog.locator('#scheduled_date').fill(today);

  await dialog.locator('#subject_id').click();
  await page.locator('.p-select-overlay .p-select-item').filter({ hasText: 'Física' }).click();

  await page.waitForTimeout(500);
  await dialog.locator('#topic_id').click();
  await page.locator('.p-select-overlay .p-select-item').filter({ hasText: 'Cinemática' }).click();

  await dialog.locator('#expected_minutes').locator('input').fill('30');
  await dialog.getByRole('button', { name: 'Agendar' }).click();
  await expect(dialog).not.toBeVisible();
}

test.describe('Timer de Sessão', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    await setupSessionForToday(page);
  });

  test('dialog de registrar resultado exibe timer com botão Iniciar', async ({ page }) => {
    await page.goto('/agenda');

    // Clicar no evento do calendário criado
    await page.locator('.fc-daygrid-event').first().click();

    // Dialog de detalhe deve aparecer
    const detailDialog = page.locator('p-dialog').filter({ hasText: 'Registrar resultado' });
    await expect(detailDialog).toBeVisible();

    // Clicar em "Registrar resultado"
    await detailDialog.getByRole('button', { name: 'Registrar resultado' }).click();

    // Dialog de conclusão deve aparecer com o timer
    const timerSection = page.locator('app-study-timer');
    await expect(timerSection).toBeVisible();

    // Botão Iniciar deve estar visível
    await expect(timerSection.getByRole('button', { name: 'Iniciar' })).toBeVisible();
  });

  test('timer inicia ao clicar em Iniciar e exibe Pausar e Parar', async ({ page }) => {
    await page.goto('/agenda');
    await page.locator('.fc-daygrid-event').first().click();

    const detailDialog = page.locator('p-dialog').filter({ hasText: 'Registrar resultado' });
    await expect(detailDialog).toBeVisible();
    await detailDialog.getByRole('button', { name: 'Registrar resultado' }).click();

    const timer = page.locator('app-study-timer');
    await expect(timer).toBeVisible();

    await timer.getByRole('button', { name: 'Iniciar' }).click();

    await expect(timer.getByRole('button', { name: 'Pausar' })).toBeVisible();
    await expect(timer.getByRole('button', { name: 'Parar' })).toBeVisible();
    await expect(timer.getByRole('button', { name: 'Iniciar' })).not.toBeVisible();
  });
});
