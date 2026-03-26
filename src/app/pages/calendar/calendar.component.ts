import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { VehicleBookingService } from '../../services/vehicle-booking.service';
import { Booking, BookingStatus, TripType } from '../../models/booking.model';
import { Vehicle } from '../../models/vehicle.model';
import { Driver } from '../../models/driver.model';
import { Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})


export class CalendarComponent implements OnInit {
  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  users: any[] = [];

  editForm: any = {};
  isEditMode: boolean = false;
  statusList = Object.values(BookingStatus);
  tripTypeList = Object.values(TripType);

  TripType = TripType;


  selectedBooking: Booking | null = null;
  selectedVehicle: Vehicle | null = null;
  selectedDriver: Driver | null = null;
  selectedBookedByUser: any | null = null;

  showQrCode: boolean = false;
  qrCodeUrl: string = '';
  processedStops: any[] = [];

  statusConfig: Record<BookingStatus, { class: string; color: string }> = {
    [BookingStatus.Pending]: {
      class: 'text-warning',
      color: '#ffc107'
    },
    [BookingStatus.Approved]: {
      class: 'text-success',
      color: '#28a745'
    },
    [BookingStatus.Cancelled]: {
      class: 'text-danger',
      color: '#dc3545'
    },
    [BookingStatus.Completed]: {
      class: 'text-secondary',
      color: '#6c757d'
    }
  };

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    initialDate: new Date(),
    navLinks: true,
    // editable: true,
    dayMaxEvents: true,
    weekends: true,
    eventClick: (info) => this.handleEventClick(info),
    // eventDrop: (info) => this.handleEventDrop(info),
    // eventResize: (info) => this.handleEventResize(info),
    events: []
  };

  constructor(
    private bookingService: VehicleBookingService,
    private router: Router,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.loadBookingEvents();
    this.loadDropdowns();
  }

  loadDropdowns() {
    this.bookingService.getVehicles().subscribe(res => this.vehicles = res?.data || []);
    this.bookingService.getDrivers().subscribe(res => this.drivers = res?.data || []);
    this.bookingService.getUsers().subscribe(res => this.users = res?.data || []);
  }

  loadBookingEvents(): void {
    this.bookingService.getBookings().subscribe(res => {

      const events = res.data.map(booking => ({
        id: booking.id,
        title: booking.title,

        start: booking.startDate,
        end: booking.endDate,

        backgroundColor: this.statusConfig[booking.status]?.color ?? '#3788d8',

        extendedProps: {
          booking,
          vehicle: booking.vehicleId,        // populated object
          driver: booking.driverId,          // populated object
          bookedByUser: booking.bookedByUserId // populated object
        }
      }));

      this.calendarOptions.events = events;

    });
  }

  closeMorePopover() {
    document.querySelector('.fc-popover')?.remove();
  }



  handleEventClick(clickInfo: any) {
    this.closeMorePopover();

    const event = clickInfo.event;
    const booking = event.extendedProps.booking;
    const vehicle = event.extendedProps.vehicle;
    const driver = event.extendedProps.driver;
    const bookedByUser = event.extendedProps.bookedByUser;


    this.selectedBooking = booking;
    this.selectedVehicle = vehicle;
    this.selectedDriver = driver;
    this.selectedBookedByUser = bookedByUser;

    const routeStops: any[] = [];

    routeStops.push({
      name: booking.origin,
      type: 'origin'
    });

    if (booking.tripType === 'multi-stop' && booking.stops?.length) {
      booking.stops.forEach((stop: any) => {
        routeStops.push({
          name: stop.name,
          type: 'waypoint'
        });
      });
    }

    routeStops.push({
      name: booking.destination,
      type: 'destination'
    });

    if (booking.tripType === 'round-trip') {
      routeStops.push({
        name: booking.origin,
        type: 'return'
      });
    }

    this.processedStops = routeStops.map((stop, index) => {
      const stopInfo = this.getStopInfo(stop.type);

      return {
        ...stop,
        label: stopInfo.label,
        borderClass: stopInfo.borderClass
      };
    });

    this.renderer.addClass(document.body, 'modal-open');
  }

  closeModal() {
    this.selectedBooking = null;
    this.selectedVehicle = null;
    this.selectedDriver = null;
    this.showQrCode = false;

    this.isEditMode = false;
    this.renderer.removeClass(document.body, 'modal-open');
  }


  getStopInfo(type: string) {

    switch (type) {

      case 'origin':
        return {
          label: 'Origin',
          borderClass: 'border-success'
        };

      case 'destination':
        return {
          label: 'Destination',
          borderClass: 'border-danger'
        };

      case 'waypoint':
        return {
          label: 'Waypoint',
          borderClass: 'border-warning'
        };

      case 'return':
        return {
          label: 'Return',
          borderClass: 'border-primary'
        };

      default:
        return {
          label: '',
          borderClass: ''
        };
    }

  }

  goToNewEvent() {
    this.router.navigate(['/bookings/new']);
  }


  enableEdit() {
    if (!this.selectedBooking) return;
    this.isEditMode = true;

    this.editForm = {
      title: this.selectedBooking.title ?? '',

      vehicleId: this.selectedBooking.vehicleId?.id ?? null,
      driverId: this.selectedBooking.driverId?.id ?? null,
      bookedByUserId: this.selectedBooking.bookedByUserId?.id ?? null,

      purpose: this.selectedBooking.purpose ?? '',
      origin: this.selectedBooking.origin ?? '',
      destination: this.selectedBooking.destination ?? '',

      tripType: this.selectedBooking.tripType ?? null,

      // clone + reset order
      stops: (this.selectedBooking.stops || []).map((s: any, index: number) => ({
        name: s.name ?? '',
        order: index + 1
      })),

      // format date สำหรับ input type="datetime-local"
      startDate: this.formatDate(this.selectedBooking.startDate),
      endDate: this.formatDate(this.selectedBooking.endDate),

      status: this.selectedBooking.status ?? 'Pending'
    };
  }

  saveEdit() {
    if (!this.selectedBooking) return;
    const bookingId = this.selectedBooking.id;

    if (this.editForm.startDate > this.editForm.endDate) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Start date ต้องน้อยกว่า End date'
      });
      return;
    }

    // ยืนยันก่อนส่ง
    Swal.fire({
      icon: 'question',
      title: 'ยืนยันการแก้ไข?',
      text: 'คุณต้องการบันทึกการแก้ไขนี้หรือไม่',
      showCancelButton: true,
      confirmButtonText: 'ใช่, บันทึก',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.closeModal();


      const payload = {
        ...this.editForm,


        // convert date กลับเป็น Date object
        startDate: new Date(this.editForm.startDate),
        endDate: new Date(this.editForm.endDate),



        // filter stop ว่าง + set order ใหม่
        stops: (this.editForm.stops || [])
          .filter((s: any) => s.name && s.name.trim() !== '')
          .map((s: any, index: number) => ({
            name: s.name.trim(),
            order: index + 1
          }))
      };



      this.bookingService.updateBooking(bookingId, payload)
        .subscribe({
          next: () => {
            // reload calendar
            this.loadBookingEvents();

            this.isEditMode = false;

          },
          error: (err) => {
            console.error('Update failed:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Update failed'
            });
          }
        });
    });
  }

  cancelEdit() {
    Swal.fire({
      icon: 'warning',
      title: 'คุณต้องการยกเลิกการแก้ไข?',
      text: 'คุณจะไม่สามารถกู้คืนการแก้ไขนี้ได้',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ยกเลิกการแก้ไข',
      cancelButtonText: 'ไม่, ดำเนินการต่อ'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isEditMode = false;
      }
    });
  }

  addStop() {
    this.editForm.stops.push({ name: '', order: this.editForm.stops.length + 1 });
  }

  removeStop(i: number) {
    this.editForm.stops.splice(i, 1);
  }

  formatDate(date: any): string {
    if (!date) return '';

    const d = new Date(date);

    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  deleteBooking() {
    if (!this.selectedBooking) return;
    const bookingId = this.selectedBooking.id;
    Swal.fire({
      icon: 'warning',
      title: 'คุณต้องการยกเลิกการจองนี้?',
      text: 'คุณจะไม่สามารถกู้คืนการจองนี้ได้',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ยกเลิกการจอง',
      cancelButtonText: 'ไม่, ดำเนินการต่อ'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.deleteBooking(bookingId).subscribe({
          next: () => {
            this.loadBookingEvents();
            this.closeModal();
          },
          error: (err) => {
            console.error('Delete failed:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Delete failed'
            });
          }
        });
      }
    });
  }

}

