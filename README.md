# Playwright E2E · UI + API tests in TypeScript

[![Playwright tests](https://github.com/kasper772/playwright-e2e/actions/workflows/playwright.yml/badge.svg)](https://github.com/kasper772/playwright-e2e/actions/workflows/playwright.yml)
[![Report](https://img.shields.io/badge/report-latest-45ba4b?logo=playwright)](https://kasper772.github.io/playwright-e2e/)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

End-to-end tests for a demo web shop ([saucedemo.com](https://www.saucedemo.com)) and a
practice REST API ([Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html)),
running in **Chromium, Firefox and WebKit** on every push.

**[▶ Open the latest test report](https://kasper772.github.io/playwright-e2e/)**

## What is covered

| Area | Tests |
|---|---|
| **Login** | valid user, locked-out user, empty / wrong credentials (data-driven), redirect from protected pages |
| **Products** | product count, sorting by name and price, cart badge when adding / removing |
| **Checkout** | cart contents, full order with total = items + tax, required customer fields (data-driven) |
| **Booking API** | create → read, search by name, update → partial update → delete, auth errors, **response contracts (JSON schema)** |

16 UI tests × 3 browsers + 7 API tests + 1 login setup = **56 test runs**.

## How it is built

```
playwright.config.ts   projects: setup → chromium / firefox / webkit, plus api
src/pages/             Page Objects (LoginPage, InventoryPage, CartPage, CheckoutPage)
src/fixtures.ts        custom `test` that hands page objects to tests
src/api/BookingApi.ts  small typed API client + test data builder
src/api/schemas.ts     response contracts (zod); the Booking type is derived from them
src/api/contract.ts    matchesSchema(): validates a response and returns it typed
src/data/              demo users and customer data
tests/setup/           logs in once and saves the session (storageState)
tests/ui/              UI specs
tests/api/             API specs
```

Techniques worth a look:

- **Log in once, reuse the session.** A `setup` project signs in and saves `storageState`;
  UI projects depend on it, so tests start on the products page without repeating the login.
  Login tests opt out with an empty storage state.
- **Page Objects as fixtures.** Tests ask for `loginPage`, `cartPage`… instead of creating them.
- **Stable locators.** `data-test` attributes via `testIdAttribute`, role-based buttons, no CSS chains.
- **Data-driven tests** for negative cases (one loop, one test per case in the report).
- **Contract tests for the API.** Every response is validated against a [zod](https://zod.dev) schema:
  field types, ISO dates, and no unexpected extra fields. A failure lists each broken field.
  A separate test proves the check really catches a broken response.
- **Independent API data.** Every test creates its own booking with a unique name, so tests run in parallel safely.
- **Debuggable failures.** Trace, screenshot and video are kept for failed tests and open from the report.

## Run locally

```bash
npm ci
npx playwright install

npm test              # everything
npm run test:ui       # UI in three browsers
npm run test:api      # API only
npm run test:headed   # watch the browser (Chromium)
npm run report        # open the HTML report
```

## CI

GitHub Actions ([workflow](.github/workflows/playwright.yml)) type-checks the code, runs all
tests and publishes the HTML report to GitHub Pages. It also runs every Monday to notice
changes on the demo sites.
