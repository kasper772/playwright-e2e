import { test, expect } from '../../src/fixtures';
import { customer } from '../../src/data/users';
import { CheckoutPage } from '../../src/pages/CheckoutPage';

const products = ['Sauce Labs Backpack', 'Sauce Labs Fleece Jacket'];

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
    for (const product of products) {
      await inventoryPage.addToCart(product);
    }
    await inventoryPage.openCart();
  });

  test('cart lists the chosen products', async ({ cartPage }) => {
    await expect(cartPage.itemNames).toHaveText(products);
  });

  test('completes an order and the totals add up', async ({ page, inventoryPage, cartPage, checkoutPage }) => {
    await cartPage.checkout();
    await checkoutPage.fillCustomer(customer);

    const itemTotal = CheckoutPage.amount(await checkoutPage.itemTotal.innerText());
    const tax = CheckoutPage.amount(await checkoutPage.tax.innerText());
    const total = CheckoutPage.amount(await checkoutPage.total.innerText());
    expect(itemTotal).toBe(29.99 + 49.99);
    expect(total).toBeCloseTo(itemTotal + tax, 2);

    await checkoutPage.finishButton.click();

    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  const missing = [
    { field: 'first name', data: { lastName: customer.lastName, postalCode: customer.postalCode }, error: 'First Name is required' },
    { field: 'last name', data: { firstName: customer.firstName, postalCode: customer.postalCode }, error: 'Last Name is required' },
    { field: 'postal code', data: { firstName: customer.firstName, lastName: customer.lastName }, error: 'Postal Code is required' },
  ];

  for (const { field, data, error } of missing) {
    test(`asks for the ${field}`, async ({ cartPage, checkoutPage }) => {
      await cartPage.checkout();
      await checkoutPage.fillCustomer(data);

      await expect(checkoutPage.error).toContainText(error);
    });
  }
});
