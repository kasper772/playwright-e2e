import { expect } from '@playwright/test';
import { z } from 'zod';

/**
 * Checks a response body against its schema and returns it typed.
 *   const booking = matchesSchema(BookingSchema, await response.json());
 * On a mismatch the test fails with every broken field listed.
 */
export function matchesSchema<T extends z.ZodType>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  const details = result.success
    ? ''
    : `\n${z.prettifyError(result.error)}\nReceived: ${JSON.stringify(body, null, 2)}`;
  expect(result.success, `response matches the schema${details}`).toBe(true);
  return result.data as z.infer<T>;
}
