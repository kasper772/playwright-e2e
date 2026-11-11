import { test, expect } from '../../src/fixtures';

test.describe('Products', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test('shows six products', async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('sorts by name Z to A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');

    const names = await inventoryPage.names();
    expect(names).toEqual([...names].sort().reverse());
  });

  test('sorts by price low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');

    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts by price high to low', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');

    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('cart badge counts added and removed products', async ({ inventoryPage }) => {
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Bike Light');
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.removeFromCart('Sauce Labs Backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.removeFromCart('Sauce Labs Bike Light');
    await expect(inventoryPage.cartBadge).toBeHidden();
  });
});
