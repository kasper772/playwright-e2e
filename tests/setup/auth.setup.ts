import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { users } from '../../src/data/users';
import { AUTH_FILE } from '../../src/data/paths';

setup('log in as standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(users.standard);
  await expect(page).toHaveURL(/inventory\.html/);
  await page.context().storageState({ path: AUTH_FILE });
});
