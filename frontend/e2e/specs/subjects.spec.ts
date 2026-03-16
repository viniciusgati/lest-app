import { test, expect } from '@playwright/test';
import { registerAndLogin } from '../helpers/auth.helper';

test.describe('Matérias e Temas', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test('criar matéria aparece na listagem', async ({ page }) => {
    await page.goto('/subjects');
    await page.getByRole('button', { name: 'Nova Matéria' }).click();

    const dialog = page.locator('p-dialog');
    await expect(dialog).toBeVisible();
    await dialog.locator('#name').fill('Matemática');
    await dialog.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByText('Matemática')).toBeVisible();
  });

  test('criar tema aparece na listagem da matéria', async ({ page }) => {
    // Criar matéria
    await page.goto('/subjects');
    await page.getByRole('button', { name: 'Nova Matéria' }).click();
    await page.locator('p-dialog #name').fill('Português');
    await page.locator('p-dialog').getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Português')).toBeVisible();

    // Navegar para detalhe da matéria
    await page.getByText('Português').click();
    await page.waitForURL(/\/subjects\/\d+/);

    // Criar tema
    await page.getByRole('button', { name: 'Novo Tema' }).click();
    const dialog = page.locator('p-dialog');
    await expect(dialog).toBeVisible();
    await dialog.locator('#name').fill('Interpretação de Texto');
    await dialog.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByText('Interpretação de Texto')).toBeVisible();
  });

  test('editar matéria atualiza nome na listagem', async ({ page }) => {
    await page.goto('/subjects');
    await page.getByRole('button', { name: 'Nova Matéria' }).click();
    await page.locator('p-dialog #name').fill('Física');
    await page.locator('p-dialog').getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Física')).toBeVisible();

    // Editar
    await page.locator('p-card').filter({ hasText: 'Física' }).getByRole('button').first().click();
    const dialog = page.locator('p-dialog');
    await expect(dialog).toBeVisible();
    await dialog.locator('#name').clear();
    await dialog.locator('#name').fill('Física Quântica');
    await dialog.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByText('Física Quântica')).toBeVisible();
  });
});
