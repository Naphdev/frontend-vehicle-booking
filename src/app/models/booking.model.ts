import { BaseModel } from "./base.model";
import { Driver } from "./driver.model";
import { User } from "./user.model";
import { Vehicle } from "./vehicle.model";

export interface Stop {
  name: string;
  order: number;
}

export interface Booking extends BaseModel {
  id: string;
  bookingNumber: string;
  vehicleId: Vehicle;
  driverId?: Driver; // ถ้ามี
  bookedByUserId: User;
  startDate: Date; // วันเริ่ม
  endDate: Date; // วันจบ
  status: BookingStatus; // สถานะงาน
  title: string; // ชื่อเรื่องสำหรับแสดงใน calendar
  purpose: string;
  origin: string;
  destination: string;
  tripType: TripType;
  stops?: Stop[];
}

export interface CreateBookingPayload {
  vehicleId: string;
  driverId?: string;
  bookedByUserId: string;
  startDate: Date;
  endDate: Date;
  title: string;
  purpose: string;
  origin: string;
  destination: string;
  tripType: TripType;
  stops?: Stop[];
}

export enum TripType {
  OneWay = 'one-way',
  RoundTrip = 'round-trip',
  MultiStop = 'multi-stop'
}

// booking-status.type.ts
export enum BookingStatus {
  Pending = 'pending',
  Approved = 'approved',
  Cancelled = 'cancelled',
  Completed = 'completed'
}

