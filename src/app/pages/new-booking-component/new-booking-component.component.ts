import { Component } from '@angular/core';
import { VehicleBookingService } from '../../services/vehicle-booking.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { BookingStatus, TripType } from 'src/app/models/booking.model';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-new-booking-component',
  templateUrl: './new-booking-component.component.html',
  styleUrls: ['./new-booking-component.component.css']
})
export class NewBookingComponentComponent {

  constructor(private bookingService: VehicleBookingService,
    private route: ActivatedRoute,
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

    this.route.queryParams.subscribe(params => {
      const date = params['date'];
      if (date) {
        const startDate = date + 'T09:00';
        this.form.startDate = startDate;

        const endDate = date + 'T17:00';
        this.form.endDate = endDate;

      }
    });
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
    // แปลง string → Js Date object
    const startDate = new Date(this.form.startDate);
    const endDate = new Date(this.form.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // validation 
    if (!this.form.title || !this.form.vehicleId || !this.form.purpose || !this.form.origin || !this.form.destination || !this.form.tripType || !this.form.startDate || !this.form.endDate || !this.form.bookedByUserId) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกข้อมูลให้ครบทุกช่องที่มี *',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.form.tripType === 'multi-stop' && this.form.stops.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเพิ่มจุดแวะอย่างน้อย 1 จุด สำหรับการเดินทางแบบ Multi-stop',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });
      return;
    }

    
    if (startDate < today) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่สามารถเลือกวันก่อนปัจจุบันได้',
        text: 'วันที่เลือกต้องตั้งแต่วันปัจจุบันเป็นต้นไป',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });
      return;
    }

    if (startDate >= endDate) {
      Swal.fire({
        icon: 'warning',
        title: 'วันที่เริ่มต้นต้องน้อยกว่าวันที่สิ้นสุด',
        text: `กรุณาตรวจสอบวันเริ่มต้น ${startDate.toLocaleString()} และวันสิ้นสุด`,
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });
      return;
    }



    // convert date
    const payload = {
      ...this.form,
      
      startDate: startDate, 
      endDate: endDate, 
      
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
            text: `จองตั้งแต่ ${startDate.toLocaleString()} ถึง ${endDate.toLocaleString()}`,
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
            text: err?.error?.message || 'ไม่สามารถสร้าง Booking ได้',
            showConfirmButton: true,
            confirmButtonText: 'OK',
            width: '550px'
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


