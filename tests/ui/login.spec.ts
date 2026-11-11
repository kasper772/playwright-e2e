import { test, expect } from '../../src/fixtures';
import { users } from '../../src/data/users';

// These tests check the login form itself, so they start without a saved session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('standard user lands on the products page', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.login(users.standard);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('locked out user sees an error', async ({ loginPage }) => {
    await loginPage.login(users.lockedOut);

    await expect(loginPage.error).toHaveText('Epic sadface: Sorry, this user has been locked out.');
  });

  const invalid = [
    { case: 'empty username', username: '', password: 'secret_sauce', error: 'Username is required' },
    { case: 'empty password', username: 'standard_user', password: '', error: 'Password is required' },
    { case: 'wrong password', username: 'standard_user', password: 'wrong', error: 'Username and password do not match' },
  ];

  for (const { case: name, username, password, error } of invalid) {
    test(`rejects ${name}`, async ({ loginPage }) => {
      await loginPage.username.fill(username);
      await loginPage.password.fill(password);
      await loginPage.loginButton.click();

      await expect(loginPage.error).toContainText(error);
    });
  }

  test('protected pages redirect to login', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await expect(loginPage.error).toContainText("You can only access '/inventory.html' when you are logged in.");
  });
});
