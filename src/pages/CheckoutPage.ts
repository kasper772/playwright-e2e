import { type Locator, type Page } from '@playwright/test';

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly error: Locator;
  readonly itemTotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly completeHeader: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.finishButton = page.getByTestId('finish');
    this.error = page.getByTestId('error');
    this.itemTotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.completeHeader = page.getByTestId('complete-header');
  }

  async fillCustomer(customer: Partial<Customer>) {
    if (customer.firstName !== undefined) await this.firstName.fill(customer.firstName);
    if (customer.lastName !== undefined) await this.lastName.fill(customer.lastName);
    if (customer.postalCode !== undefined) await this.postalCode.fill(customer.postalCode);
    await this.continueButton.click();
  }

  /** Reads "$12.34" out of a label like "Item total: $12.34". */
  static amount(text: string): number {
    const match = text.match(/\$([\d.]+)/);
    if (!match) throw new Error(`No amount in "${text}"`);
    return Number(match[1]);
  }
}
