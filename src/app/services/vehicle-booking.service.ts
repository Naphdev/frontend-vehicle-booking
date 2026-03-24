import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, catchError } from "rxjs";

import { Booking, TripType, BookingStatus } from "../models/booking.model";
import { Vehicle, VehicleStatus } from "../models/vehicle.model";
import { Driver, DriverStatus } from "../models/driver.model";
import { User } from "../models/user.model";

import { IBaseSingleResult } from "../core/models/base-result.model";

import { ConfigurationService } from "../services/configuration.service";
import { HeaderService } from "../services/header.service";

import { map } from 'rxjs/operators';
import { mapBooking } from "../mapdate/mapper";


@Injectable({
  providedIn: "root",
})
export class VehicleBookingService {
  private useMock = false;

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService,
    private headerService: HeaderService,
  ) { }

  private mockVehicles: Vehicle[] = [
    { id: "V001", brand: "Toyota", model: "Camry", licensePlate: "กข 1234", type: "Sedan", status: VehicleStatus.Available, color: "blue", createdAt: new Date(), updatedAt: new Date() },
    { id: "V002", brand: "Honda", model: "CR-V", licensePlate: "คท 5678", type: "SUV", status: VehicleStatus.InUse, color: "yellow", createdAt: new Date(), updatedAt: new Date() },
    { id: "V003", brand: "Mazda", model: "CX-5", licensePlate: "มย 9012", type: "SUV", status: VehicleStatus.Available, color: "green", createdAt: new Date(), updatedAt: new Date() },
    { id: "V004", brand: "Nissan", model: "Teana", licensePlate: "จฉ 3456", type: "Sedan", status: VehicleStatus.Maintenance, color: "red", createdAt: new Date(), updatedAt: new Date() }
  ];

  private mockDrivers: Driver[] = [
    { id: "D001", name: "นายสมชาย ใจดี", qrcodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=tel:+66812345678", status: DriverStatus.Active, createdAt: new Date(), updatedAt: new Date() },
    { id: "D002", name: "นายณเดช คุกิ", qrcodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=tel:+66823456789", status: DriverStatus.Active, createdAt: new Date(), updatedAt: new Date() },
    { id: "D003", name: "นางสาวพรพรรณ พานิช", qrcodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=tel:+66834567890", status: DriverStatus.Active, createdAt: new Date(), updatedAt: new Date() }
  ];

  private mockUsers: User[] = [
    { id: "U001", name: "นายธนกร วิชัย", department: "IT", phone: "0812345678", createdAt: new Date(), updatedAt: new Date() },
    { id: "U002", name: "นางสาวศิริพร แสงทอง", department: "บัญชี", phone: "0823456789", createdAt: new Date(), updatedAt: new Date() },
    { id: "U003", name: "นายกิตติพงษ์ สุขใจ", department: "การตลาด", phone: "0834567890", createdAt: new Date(), updatedAt: new Date() },
    { id: "U004", name: "นางสาวปวีณา ชัยมงคล", department: "HR", phone: "0845678901", createdAt: new Date(), updatedAt: new Date() }
  ];

  private mockBookings: Booking[] = [
    {
      id: "B001",
      bookingNumber: "BK001",
      vehicleId: this.mockVehicles.find(v => v.id === "V001")!,
      driverId: this.mockDrivers.find(d => d.id === "D001")!,
      bookedByUserId: this.mockUsers.find(u => u.id === "U001")!,
      startDate: new Date(2026, 2, 10, 9, 0),
      endDate: new Date(2026, 2, 10, 11, 0),
      status: BookingStatus.Completed,
      title: "Toyota Camry - ลูกค้า VIP Trip",
      purpose: "ลูกค้า VIP Trip",
      origin: "บ้านลูกค้า",
      destination: "โรงแรมสยาม",

      tripType: TripType.OneWay,  
      stops: [
        { name: 'บ้านลูกค้า', order: 1 },
        { name: 'โรงแรมสยาม', order: 2 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "B002",
      bookingNumber: "BK002",
      vehicleId: this.mockVehicles.find(v => v.id === "V002")!,
      driverId: this.mockDrivers.find(d => d.id === "D002")!,
      bookedByUserId: this.mockUsers.find(u => u.id === "U002")!,
      startDate: new Date(2026, 2, 10, 10, 0),
      endDate: new Date(2026, 2, 10, 16, 0),
      status: BookingStatus.Pending,
      title: "Honda CR-V - Delivery งานด่วน",

      purpose: "Delivery งานด่วน",
      origin: "คลังสินค้า",
      destination: "สำนักงานลูกค้า",
      tripType: TripType.OneWay,
      stops: [
        { name: 'คลังสินค้า', order: 1 },
        { name: 'สำนักงานลูกค้า', order: 2 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "B003",
      bookingNumber: "BK003",
      vehicleId: this.mockVehicles.find(v => v.id === "V003")!,
      driverId: this.mockDrivers.find(d => d.id === "D003")!,
      bookedByUserId: this.mockUsers.find(u => u.id === "U003")!,
      startDate: new Date(2026, 2, 25, 14, 0),
      endDate: new Date(2026, 2, 26, 18, 0),
      status: BookingStatus.Approved,
      title: "Mazda CX-5 - อบรมพนักงาน",

      purpose: "อบรมพนักงาน",
      origin: "บ้านลูกค้า",
      destination: "โรงแรมสยาม",
      tripType: TripType.RoundTrip,
      stops: [
        { name: 'บ้านลูกค้า', order: 1 },
        { name: 'โรงแรมสยาม', order: 2 },
        { name: 'บ้านลูกค้า', order: 3 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "B004",
      bookingNumber: "BK004",
      vehicleId: this.mockVehicles.find(v => v.id === "V004")!,
      driverId: this.mockDrivers.find(d => d.id === "D001")!,
      bookedByUserId: this.mockUsers.find(u => u.id === "U004")!,
      startDate: new Date(2026, 2, 15, 10, 0),
      endDate: new Date(2026, 2, 15, 12, 0),
      status: BookingStatus.Approved,
      title: "Nissan Teana - งานประชุม",
      purpose: "งานประชุม",
      origin: "บ้านลูกค้า",
      destination: "โรงแรมสยาม",
      tripType: TripType.MultiStop,
      stops: [
        {
          name: "บ้านลูกค้า",
          order: 1
        },
        {
          name: "สำนักงานสาขา A",
          order: 2
        },
        {
          name: "ร้านอาหารกลางวัน",
          order: 3
        },
        {
          name: "โรงแรมสยาม",
          order: 4
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "B005",
      bookingNumber: "BK005",
      vehicleId: this.mockVehicles.find(v => v.id === "V001")!,
      driverId: this.mockDrivers.find(d => d.id === "D002")!,
      bookedByUserId: this.mockUsers.find(u => u.id === "U002")!,
      startDate: new Date(2026, 2, 20, 11, 0),
      endDate: new Date(2026, 2, 20, 15, 0),
      status: BookingStatus.Completed,
      purpose: "อบรมพนักงาน",
      origin: "บ้านลูกค้า",
      destination: "โรงแรมสยาม",
      title: "Toyota Camry - อบรมพนักงาน",
      tripType: TripType.RoundTrip,
      stops: [
        { name: 'บ้านลูกค้า', order: 1 },
        { name: 'โรงแรมสยาม', order: 2 },
        { name: 'บ้านลูกค้า', order: 3 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "B006",
      bookingNumber: "BK006",
      vehicleId: this.mockVehicles.find(v => v.id === "V002")!,
      driverId: this.mockDrivers.find(d => d.id === "D003")!,
      bookedByUserId: this.mockUsers.find(u => u.id === "U003")!,
      startDate: new Date(2026, 2, 25, 10, 0),
      endDate: new Date(2026, 2, 25, 12, 0),
      status: BookingStatus.Approved,
      purpose: "งานขนส่ง",
      origin: "คลังสินค้า",
      destination: "สำนักงานลูกค้า",
      title: "Honda CR-V - งานขนส่ง",
      tripType: TripType.OneWay,
      stops: [
        { name: 'คลังสินค้า', order: 1 },
        { name: 'สำนักงานลูกค้า', order: 2 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "B007",
      bookingNumber: "BK007",
      vehicleId: this.mockVehicles.find(v => v.id === "V003")!,
      driverId: this.mockDrivers.find(d => d.id === "D001")!,
      bookedByUserId: this.mockUsers.find(u => u.id === "U001")!,
      startDate: new Date(2026, 2, 30, 14, 0),
      endDate: new Date(2026, 2, 30, 18, 0),
      purpose: "อบรมพนักงาน",
      origin: "บ้านลูกค้า",
      destination: "โรงแรมสยาม",
      status: BookingStatus.Approved,
      title: "Mazda CX-5 - อบรมพนักงาน",
      tripType: TripType.RoundTrip,
      stops: [
        { name: 'บ้านลูกค้า', order: 1 },
        { name: 'โรงแรมสยาม', order: 2 },
        { name: 'บ้านลูกค้า', order: 3 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "B008",
      bookingNumber: "BK008",
      vehicleId: this.mockVehicles.find(v => v.id === "V004")!,
      driverId: this.mockDrivers.find(d => d.id === "D002")!,
      bookedByUserId: this.mockUsers.find(u => u.id === "U002")!,
      startDate: new Date(2026, 2, 20, 11, 0),
      endDate: new Date(2026, 2, 20, 15, 0),
      status: BookingStatus.Completed,
      purpose: "งานประชุม",
      origin: "บ้านลูกค้า",
      destination: "โรงแรมสยาม",
      title: "Nissan Teana - งานประชุม",
      tripType: TripType.RoundTrip,
      stops: [
        { name: 'บ้านลูกค้า', order: 1 },
        { name: 'โรงแรมสยาม', order: 2 },
        { name: 'บ้านลูกค้า', order: 3 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
  ];



  getVehicles(): Observable<IBaseSingleResult<Vehicle[]> | undefined> {

    if (this.useMock) {
      return of({ data: this.mockVehicles });
    }

    const baseApi = this.configurationService.Config.baseApi;
    const url = baseApi + "api/vehicles";

    const headers = this.headerService.BuildRequestHeaders();

    return this.http.get<IBaseSingleResult<Vehicle[]>>(url, { headers }).pipe(
      map(res => res),
      catchError(err => {
        console.log("VehicleBookingService[getVehicles]: ", err);
        return of(err);
      })
    );
  }


  getDrivers(): Observable<IBaseSingleResult<Driver[]>> {
    if (this.useMock) {
      return of({ data: this.mockDrivers });
    }

    const baseApi = this.configurationService.Config.baseApi;
    const url = baseApi + "api/drivers";

    const headers = this.headerService.BuildRequestHeaders();

    return this.http.get<IBaseSingleResult<Driver[]>>(url, { headers }).pipe(
      map(res => res),
      catchError(err => {
        console.log("VehicleBookingService[getDrivers]: ", err);
        return of(err);
      })
    );
  }

  getUsers(): Observable<IBaseSingleResult<User[]>> {
    if (this.useMock) {
      return of({ data: this.mockUsers });
    }

    const baseApi = this.configurationService.Config.baseApi;
    const url = baseApi + "api/users";

    const headers = this.headerService.BuildRequestHeaders();

    return this.http.get<IBaseSingleResult<User[]>>(url, { headers }).pipe(
      map(res => res),
      catchError(err => {
        console.log("VehicleBookingService[getUsers]: ", err);
        return of(err);
      })
    );
  }


  getBookings(): Observable<IBaseSingleResult<Booking[]>> {
    if (this.useMock) {
      return of({ data: this.mockBookings });
    }

    const baseApi = this.configurationService.Config.baseApi;
    const url = baseApi + "api/bookings";

    const headers = this.headerService.BuildRequestHeaders();

    return this.http.get<IBaseSingleResult<Booking[]>>(url, { headers }).pipe(
      map(res => ({
        ...res,
        data: res.data.map(mapBooking)
      })),
      catchError(err => {
        console.log("VehicleBookingService[getBookings]: ", err);
        return of(err);
      })
    );
  }

  createBooking(payload: Booking): Observable<IBaseSingleResult<Booking>> {
    if (this.useMock) {
      return of({ data: payload });
    }

    const baseApi = this.configurationService.Config.baseApi;
    const url = baseApi + "api/bookings";

    const headers = this.headerService.BuildRequestHeaders();

    return this.http.post<IBaseSingleResult<Booking>>(url, payload, { headers }).pipe(
      map(res => res),
      catchError(err => {
        console.log("VehicleBookingService[createBooking]: ", err);
        return of(err);
      })
    );
  }

  updateBooking(id: string, payload: Partial<Booking>): Observable<IBaseSingleResult<Booking>> {
  
    // if (this.useMock) {
    //   return of({ data: payload });
    // }
    const baseApi = this.configurationService.Config.baseApi;
    const url = baseApi + "api/bookings/" + id;

    const headers = this.headerService.BuildRequestHeaders();

    return this.http.put<IBaseSingleResult<Booking>>(url, payload, { headers }).pipe(
      map(res => res),
      catchError(err => {
        console.log("VehicleBookingService[updateBooking]: ", err);
        return of(err);
      })
    );
  }

  deleteBooking(id: string): Observable<IBaseSingleResult<boolean>> {
  
    const baseApi = this.configurationService.Config.baseApi;
    const url = baseApi + "api/bookings/" + id;

    const headers = this.headerService.BuildRequestHeaders();

    return this.http.delete<IBaseSingleResult<boolean>>(url, { headers }).pipe(
      map(res => res),
      catchError(err => {
        console.log("VehicleBookingService[deleteBooking]: ", err);
        return of(err);
      })
    );
  }





}
