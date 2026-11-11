import { test, expect } from '@playwright/test';
import { BookingApi, newBooking } from '../../src/api/BookingApi';

test.describe('Booking API', () => {
  let api: BookingApi;

  test.beforeEach(async ({ request }) => {
    api = new BookingApi(request);
  });

  test('creates a booking and reads it back', async () => {
    const booking = newBooking();

    const created = await api.create(booking);
    expect(created.status()).toBe(200);
    const { bookingid, booking: saved } = await created.json();
    expect(bookingid).toEqual(expect.any(Number));
    expect(saved).toEqual(booking);

    const fetched = await api.get(bookingid);
    expect(fetched.status()).toBe(200);
    expect(await fetched.json()).toEqual(booking);
  });

  test('finds a booking by guest name', async () => {
    const booking = newBooking();
    const { bookingid } = await (await api.create(booking)).json();

    const found = await api.findByName(booking.firstname, booking.lastname);

    expect(found.status()).toBe(200);
    expect(await found.json()).toContainEqual({ bookingid });
  });

  test('full lifecycle: update, partial update, delete', async () => {
    const token = await api.token();
    expect(token, 'auth token').toBeTruthy();
    const { bookingid } = await (await api.create(newBooking())).json();

    const changed = newBooking({ totalprice: 300, depositpaid: false });
    const updated = await api.update(bookingid, changed, token!);
    expect(updated.status()).toBe(200);
    expect(await updated.json()).toEqual(changed);

    const patched = await api.patch(bookingid, { additionalneeds: 'Late checkout' }, token!);
    expect(patched.status()).toBe(200);
    expect(await patched.json()).toMatchObject({ ...changed, additionalneeds: 'Late checkout' });

    const deleted = await api.delete(bookingid, token!);
    expect(deleted.status()).toBe(201);
    expect((await api.get(bookingid)).status()).toBe(404);
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
