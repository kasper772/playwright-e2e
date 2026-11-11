import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { type Booking } from './schemas';

export type { Booking };

// Public demo credentials from the Restful Booker documentation.
const ADMIN = { username: 'admin', password: 'password123' };

/** Thin client for https://restful-booker.herokuapp.com (a public practice API). */
export class BookingApi {
  constructor(private readonly request: APIRequestContext) {}

  async token(credentials = ADMIN): Promise<string | undefined> {
    const response = await this.request.post('/auth', { data: credentials });
    const body = await response.json();
    return body.token;
  }

  create(booking: Booking): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking, headers: { Accept: 'application/json' } });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`, { headers: { Accept: 'application/json' } });
  }

  findByName(firstname: string, lastname: string): Promise<APIResponse> {
    return this.request.get('/booking', { params: { firstname, lastname } });
  }

  update(id: number, booking: Booking, token: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: { Accept: 'application/json', Cookie: `token=${token}` },
    });
  }

  patch(id: number, changes: Partial<Booking>, token: string): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, {
      data: changes,
      headers: { Accept: 'application/json', Cookie: `token=${token}` },
    });
  }

  delete(id: number, token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, {
      headers: token ? { Cookie: `token=${token}` } : {},
    });
  }
}

/** A booking with unique names, so parallel runs never see each other's data. */
export function newBooking(overrides: Partial<Booking> = {}): Booking {
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    firstname: `Ada${id}`,
    lastname: 'Lovelace',
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2027-01-10', checkout: '2027-01-14' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
