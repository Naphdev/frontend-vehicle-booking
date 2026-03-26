import { Component } from '@angular/core';
import { VehicleBookingService } from '../../services/vehicle-booking.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { BookingStatus, TripType } from 'src/app/models/booking.model';



@Component({
  selector: 'app-new-booking-component',
  templateUrl: './new-booking-component.component.html',
  styleUrls: ['./new-booking-component.component.css']
})
export class NewBookingComponentComponent {

  constructor(private bookingService: VehicleBookingService,
    private router: Router
  ) { }
  form: any = {
    title: '',
    vehicleId: null,
    driverId: null,
    bookedByUserId: null,
    purpose: '',
    origin: '',
    destination: '',
    tripType: TripType.OneWay,
    stops: [],
    startDate: '',
    endDate: '',
    status: BookingStatus.Pending
  };

  statusList = Object.values(BookingStatus);
  tripTypeList = Object.values(TripType);


  loading: boolean = false;

  vehicles: any[] = [];
  drivers: any[] = [];
  users: any[] = [];

  ngOnInit() {
    this.loadDropdowns();
  }

  loadDropdowns() {
    this.bookingService.getVehicles().subscribe(res => this.vehicles = res?.data || []);
    this.bookingService.getDrivers().subscribe(res => this.drivers = res?.data || []);
    this.bookingService.getUsers().subscribe(res => this.users = res?.data || []);
  }

  addStop() {
    this.form.stops.push({ name: '', order: this.form.stops.length + 1 });
  }

  removeStop(i: number) {
    this.form.stops.splice(i, 1);
  }

  onTripTypeChange() {
    if (this.form.tripType !== 'multi-stop') {
      this.form.stops = [];
    }
  }

  submit(): void {

    // validation 
    if (!this.form.title || !this.form.vehicleId || !this.form.purpose || !this.form.origin || !this.form.destination || !this.form.tripType || !this.form.startDate || !this.form.endDate) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกข้อมูลให้ครบ',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }

    if (this.form.tripType === 'multi-stop' && this.form.stops.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Multi-stop ต้องมี stops(จุดแวะระหว่างทาง)',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }

    if (this.form.startDate > this.form.endDate) {
      Swal.fire({
        icon: 'warning',
        title: 'วันที่เริ่มต้นต้องน้อยกว่าวันที่สิ้นสุด',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });
      return;
    }

    // convert date
    const payload = {
      ...this.form,
      startDate: new Date(this.form.startDate),
      endDate: new Date(this.form.endDate)
    };

    this.loading = true;

    this.bookingService.createBooking(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'สร้าง Booking สำเร็จ',
            showConfirmButton: true,
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/calendar']);
          });

        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            showConfirmButton: false,
            timer: 1500
          });
        }
      });
  }

  // cancel
  cancel(): void {
    Swal.fire({
      title: 'ยกเลิก?',
      text: 'ข้อมูลที่กรอกจะหาย',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/calendar']);
      }
    });
  }


  back(): void {
    this.router.navigate(['/calendar']);
  }
}


