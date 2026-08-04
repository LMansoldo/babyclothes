import { test, expect } from '@playwright/test';

test('redirects / to /pt by default', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/pt$/);
});

test('submits the waitlist form in pt-BR and shows the confirmation', async ({ page }) => {
  const uniqueEmail = `test-${Date.now()}@example.com`;
  await page.goto('/pt');
  await expect(page).toHaveTitle('ReGrow — Achadinhos com o match perfeito');

  await page.getByLabel('Nome completo').fill('Maria Teste');
  await page.getByLabel('Telefone').fill('11999999999');
  await page.getByLabel('E-mail').fill(uniqueEmail);
  await page.getByLabel('O que você mais busca?').selectOption('roupas');
  await page.getByRole('button', { name: 'Quero entrar na lista de espera' }).click();

  await expect(page.getByText('Você está na lista!')).toBeVisible();
});

test('submits the waitlist form in en and shows the confirmation', async ({ page }) => {
  const uniqueEmail = `test-${Date.now()}-en@example.com`;
  await page.goto('/en');
  await expect(page).toHaveTitle('ReGrow — The perfect match for every little outfit');

  await page.getByLabel('Full name').fill('Test User');
  await page.getByLabel('Phone number').fill('11999999999');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('What are you looking for?').selectOption('roupas');
  await page.getByRole('button', { name: 'Join the waitlist' }).click();

  await expect(page.getByText("You're on the list!")).toBeVisible();
});

test('shows a friendly error without JavaScript (SSR form fallback)', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/pt');

  await page.getByLabel('Nome completo').fill('Maria Sem JS');
  await page.getByLabel('Telefone').fill('11999999999');
  await page.getByLabel('E-mail').fill('invalido');
  await page.getByLabel('O que você mais busca?').selectOption('roupas');
  await page.getByRole('button', { name: 'Quero entrar na lista de espera' }).click();

  await expect(page.getByRole('alert')).toHaveText('E-mail inválido.');
  await context.close();
});
