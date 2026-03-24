import { test, expect, Page } from '@playwright/test';
import { registerAndLogin } from '../helpers/auth.helper';

/**
 * PrimeNG renderiza o dialog em um portal appended ao <body>.
 * O host <p-dialog> fica com display:none; o painel visível tem class .p-dialog.
 * Filtra pelo painel que contém o input #name para evitar conflito com p-confirmDialog.
 */
function formDialog(page: Page) {
  return page.locator('.p-dialog').filter({ has: page.locator('#name') });
}

test.describe('Matérias e Temas', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test('criar matéria aparece na listagem', async ({ page }) => {
    await page.goto('/subjects');
    await page.getByRole('button', { name: 'Nova Matéria' }).click();

    const dialog = formDialog(page);
    await expect(dialog).toBeVisible();
    await dialog.locator('#name').fill('Matemática');
    await dialog.getByRole('button', { name: 'Salvar' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Matemática')).toBeVisible();
  });

  test('criar tema aparece na listagem da matéria', async ({ page }) => {
    // Criar matéria
    await page.goto('/subjects');
    await page.getByRole('button', { name: 'Nova Matéria' }).click();
    const dialog = formDialog(page);
    await expect(dialog).toBeVisible();
    await dialog.locator('#name').fill('Português');
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Português')).toBeVisible();

    // Navegar para detalhe via botão "Temas"
    await page.locator('p-card').filter({ hasText: 'Português' }).getByRole('button', { name: 'Temas' }).click();
    await page.waitForURL(/\/subjects\/\d+/);

    // Criar tema
    await page.getByRole('button', { name: 'Novo Tema' }).click();
    const topicDialog = formDialog(page);
    await expect(topicDialog).toBeVisible();
    await topicDialog.locator('#name').fill('Interpretação de Texto');
    await topicDialog.getByRole('button', { name: 'Salvar' }).click();

    await expect(topicDialog).not.toBeVisible();
    await expect(page.getByText('Interpretação de Texto')).toBeVisible();
  });

  test('editar matéria atualiza nome na listagem', async ({ page }) => {
    await page.goto('/subjects');
    await page.getByRole('button', { name: 'Nova Matéria' }).click();
    const dialog = formDialog(page);
    await expect(dialog).toBeVisible();
    await dialog.locator('#name').fill('Física');
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Física')).toBeVisible();

    // Editar — botão lápis é o segundo botão do card (após "Temas")
    await page.locator('p-card').filter({ hasText: 'Física' }).getByRole('button').nth(1).click();
    const editDialog = formDialog(page);
    await expect(editDialog).toBeVisible();
    await editDialog.locator('#name').clear();
    await editDialog.locator('#name').fill('Física Quântica');
    await editDialog.getByRole('button', { name: 'Salvar' }).click();

    await expect(editDialog).not.toBeVisible();
    await expect(page.getByText('Física Quântica')).toBeVisible();
  });
});

test.describe('Modal — Enter fecha sem navegar', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test('Enter cria matéria, fecha modal e permanece em /subjects', async ({ page }) => {
    await page.goto('/subjects');

    await page.getByRole('button', { name: 'Nova Matéria' }).click();
    const dialog = formDialog(page);
    await expect(dialog).toBeVisible();

    await dialog.locator('#name').fill('Química');
    await dialog.locator('#name').press('Enter');

    // Modal deve fechar
    await expect(dialog).not.toBeVisible();

    // URL não deve ter mudado para detalhe
    await expect(page).toHaveURL('/subjects');

    // Item criado visível na lista
    await expect(page.getByText('Química')).toBeVisible();
  });

  test('Enter edita matéria, fecha modal e permanece em /subjects', async ({ page }) => {
    // Setup: criar matéria via botão
    await page.goto('/subjects');
    await page.getByRole('button', { name: 'Nova Matéria' }).click();
    const dialog = formDialog(page);
    await expect(dialog).toBeVisible();
    await dialog.locator('#name').fill('Biologia');
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Biologia')).toBeVisible();

    // Editar via Enter
    await page.locator('p-card').filter({ hasText: 'Biologia' }).getByRole('button').nth(1).click();
    const editDialog = formDialog(page);
    await expect(editDialog).toBeVisible();

    const input = editDialog.locator('#name');
    await input.clear();
    await input.fill('Biologia Avançada');
    await input.press('Enter');

    // Modal deve fechar
    await expect(editDialog).not.toBeVisible();

    // Deve permanecer em /subjects
    await expect(page).toHaveURL('/subjects');

    // Nome atualizado
    await expect(page.getByText('Biologia Avançada')).toBeVisible();
  });

  test('Enter cria tema, fecha modal e permanece em /subjects/:id', async ({ page }) => {
    // Setup: criar matéria e navegar
    await page.goto('/subjects');
    await page.getByRole('button', { name: 'Nova Matéria' }).click();
    const dialog = formDialog(page);
    await expect(dialog).toBeVisible();
    await dialog.locator('#name').fill('História');
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(dialog).not.toBeVisible();

    await page.locator('p-card').filter({ hasText: 'História' }).getByRole('button', { name: 'Temas' }).click();
    await page.waitForURL(/\/subjects\/\d+/);
    const subjectUrl = page.url();

    // Criar tema via Enter
    await page.getByRole('button', { name: 'Novo Tema' }).click();
    const topicDialog = formDialog(page);
    await expect(topicDialog).toBeVisible();

    await topicDialog.locator('#name').fill('Revolução Industrial');
    await topicDialog.locator('#name').press('Enter');

    // Modal deve fechar
    await expect(topicDialog).not.toBeVisible();

    // Deve permanecer na página da matéria
    await expect(page).toHaveURL(subjectUrl);

    // Tema criado visível
    await expect(page.getByText('Revolução Industrial')).toBeVisible();
  });

  test('Enter longo não navega após dialog fechar', async ({ page }) => {
    await page.goto('/subjects');

    // Criar uma matéria preexistente para haver itens na lista
    await page.getByRole('button', { name: 'Nova Matéria' }).click();
    const setupDialog = formDialog(page);
    await expect(setupDialog).toBeVisible();
    await setupDialog.locator('#name').fill('Pré-existente');
    await setupDialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(setupDialog).not.toBeVisible();

    // Abrir novo modal
    await page.getByRole('button', { name: 'Nova Matéria' }).click();
    const dialog = formDialog(page);
    await expect(dialog).toBeVisible();

    await dialog.locator('#name').fill('Nova Disciplina');

    // Simula Enter longo (keydown + delay + keyup) — reproduz o bug original
    await page.keyboard.down('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.up('Enter');

    // Modal deve fechar
    await expect(dialog).not.toBeVisible();

    // URL deve permanecer em /subjects
    await expect(page).toHaveURL('/subjects');

    await expect(page.getByText('Nova Disciplina')).toBeVisible();
  });
});
