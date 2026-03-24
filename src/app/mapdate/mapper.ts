import { Booking } from '../models/booking.model';

export function mapBooking(b: any): Booking {
  return {
    ...b,
    startDate: new Date(b.startDate),
    endDate: new Date(b.endDate),
    createdAt: new Date(b.createdAt),
    updatedAt: new Date(b.updatedAt)
  };
}

export function mapBase(v: any) {
  return {
    ...v,
    createdAt: new Date(v.createdAt),
    updatedAt: new Date(v.updatedAt)
  };
}