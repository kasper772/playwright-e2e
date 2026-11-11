import { test, expect } from '@playwright/test';
import { matchesSchema } from '../../src/api/contract';
import { BookingApi, newBooking } from '../../src/api/BookingApi';
import { AuthSchema, BookingIdsSchema, BookingSchema, CreatedBookingSchema } from '../../src/api/schemas';

test.describe('Booking API', () => {
  let api: BookingApi;

  test.beforeEach(async ({ request }) => {
    api = new BookingApi(request);
  });

  test('creates a booking and reads it back', async () => {
    const booking = newBooking();

    const created = await api.create(booking);
    expect(created.status()).toBe(200);
    const createdBody = matchesSchema(CreatedBookingSchema, await created.json());
    expect(createdBody.booking).toEqual(booking);

    const fetched = await api.get(createdBody.bookingid);
    expect(fetched.status()).toBe(200);
    expect(matchesSchema(BookingSchema, await fetched.json())).toEqual(booking);
  });

  test('finds a booking by guest name', async () => {
    const booking = newBooking();
    const { bookingid } = await (await api.create(booking)).json();

    const found = await api.findByName(booking.firstname, booking.lastname);

    expect(found.status()).toBe(200);
    const ids = matchesSchema(BookingIdsSchema, await found.json());
    expect(ids).toContainEqual({ bookingid });
  });

  test('full lifecycle: update, partial update, delete', async () => {
    const token = await api.token();
    expect(token, 'auth token').toBeTruthy();
    const { bookingid } = await (await api.create(newBooking())).json();

    const changed = newBooking({ totalprice: 300, depositpaid: false });
    const updated = await api.update(bookingid, changed, token!);
    expect(updated.status()).toBe(200);
    expect(matchesSchema(BookingSchema, await updated.json())).toEqual(changed);

    const patched = await api.patch(bookingid, { additionalneeds: 'Late checkout' }, token!);
    expect(patched.status()).toBe(200);
    expect(matchesSchema(BookingSchema, await patched.json())).toMatchObject({ ...changed, additionalneeds: 'Late checkout' });

    const deleted = await api.delete(bookingid, token!);
    expect(deleted.status()).toBe(201);
    expect((await api.get(bookingid)).status()).toBe(404);
  });

  test('auth responses follow the contract', async ({ request }) => {
    for (const password of ['password123', 'wrong']) {
      const response = await request.post('/auth', { data: { username: 'admin', password } });
      expect(response.status()).toBe(200);
      matchesSchema(AuthSchema, await response.json());
    }
  });

  test('wrong credentials give no token', async () => {
    expect(await api.token({ username: 'admin', password: 'wrong' })).toBeUndefined();
  });

  test('delete without a token is forbidden', async () => {
    const { bookingid } = await (await api.create(newBooking())).json();

    const response = await api.delete(bookingid);

    expect(response.status()).toBe(403);
    expect((await api.get(bookingid)).status()).toBe(200);
  });
});

// Guards the guard: a broken response must really fail the schema check.
test.describe('Schema check', () => {
  test('rejects a booking with a wrong type, a bad date and an extra field', () => {
    const broken = {
      ...newBooking(),
      totalprice: '150',
      bookingdates: { checkin: '10/01/2027', checkout: '2027-01-14' },
      unexpected: true,
    };

    const result = BookingSchema.safeParse(broken);

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path.join('.'))).toEqual(
      expect.arrayContaining(['totalprice', 'bookingdates.checkin', '']),
    );
  });
});
