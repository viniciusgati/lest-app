import { Page } from '@playwright/test';

let counter = 0;

export function uniqueEmail(): string {
  counter++;
  return `e2e-${Date.now()}-${counter}@test.local`;
}

export async function registerAndLogin(
  page: Page,
  email = uniqueEmail(),
  password = 'Test123456'
): Promise<{ email: string; password: string }> {
  await page.goto('/auth/signup');
  await page.locator('#name').fill('Usuário Teste');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#password_confirmation').fill(password);
  await page.getByRole('button', { name: 'Cadastrar' }).click();
  await page.waitForURL('/');
  return { email, password };
}

export async function login(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/auth/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL('/');
}
