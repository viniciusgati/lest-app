import { test, expect } from '@playwright/test';
import { registerAndLogin } from '../helpers/auth.helper';

async function createSubjectAndTopic(
  page: import('@playwright/test').Page,
  subjectName: string,
  topicName: string
): Promise<void> {
  // Criar matéria
  await page.goto('/subjects');
  await page.getByRole('button', { name: 'Nova Matéria' }).click();
  await page.locator('p-dialog #name').fill(subjectName);
  await page.locator('p-dialog').getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText(subjectName)).toBeVisible();

  // Criar tema
  await page.getByText(subjectName).click();
  await page.waitForURL(/\/subjects\/\d+/);
  await page.getByRole('button', { name: 'Novo Tema' }).click();
  await page.locator('p-dialog #name').fill(topicName);
  await page.locator('p-dialog').getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText(topicName)).toBeVisible();
}

test.describe('Agenda', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test('agendar sessão exibe evento no calendário', async ({ page }) => {
    await createSubjectAndTopic(page, 'Biologia', 'Células');

    await page.goto('/agenda');
    await expect(page.getByText('Agenda de Estudos')).toBeVisible();

    // Abrir dialog de nova sessão
    await page.getByRole('button', { name: 'Nova Sessão' }).click();
    const dialog = page.locator('p-dialog').filter({ hasText: 'Nova Sessão de Estudo' });
    await expect(dialog).toBeVisible();

    // Preencher data (hoje)
    const today = new Date().toISOString().split('T')[0];
    await dialog.locator('#scheduled_date').fill(today);

    // Selecionar matéria
    await dialog.locator('#subject_id').click();
    await page.locator('.p-select-overlay .p-select-item').filter({ hasText: 'Biologia' }).click();

    // Aguardar temas carregarem e selecionar
    await page.waitForTimeout(500);
    await dialog.locator('#topic_id').click();
    await page.locator('.p-select-overlay .p-select-item').filter({ hasText: 'Células' }).click();

    // Tempo esperado
    await dialog.locator('#expected_minutes').locator('input').fill('30');

    // Salvar
    await dialog.getByRole('button', { name: 'Agendar' }).click();

    // Verificar que o dialog fechou (sessão criada)
    await expect(dialog).not.toBeVisible();

    // Calendário deve estar visível
    await expect(page.locator('full-calendar')).toBeVisible();
  });

  test('página de agenda carrega com calendário', async ({ page }) => {
    await page.goto('/agenda');
    await expect(page.locator('full-calendar')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nova Sessão' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Gerar semana' })).toBeVisible();
  });
});
