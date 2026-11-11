import { z } from 'zod';

// Response contracts of the Restful Booker API.
// strictObject = an unexpected extra field is also a contract change and fails the check.

export const BookingSchema = z.strictObject({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  totalprice: z.number().int().nonnegative(),
  depositpaid: z.boolean(),
  bookingdates: z.strictObject({
    checkin: z.iso.date(),
    checkout: z.iso.date(),
  }),
  additionalneeds: z.string().optional(),
});

export const CreatedBookingSchema = z.strictObject({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});

export const BookingIdsSchema = z.array(z.strictObject({ bookingid: z.number().int().positive() }));

export const AuthSchema = z.union([
  z.strictObject({ token: z.string().min(1) }),
  z.strictObject({ reason: z.literal('Bad credentials') }),
]);

/** The booking type is derived from the schema, so code and contract never drift apart. */
export type Booking = z.infer<typeof BookingSchema>;
