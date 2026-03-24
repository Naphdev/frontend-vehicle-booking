import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CalendarComponent } from './pages/calendar/calendar.component';
import { NewBookingComponentComponent } from './pages/new-booking-component/new-booking-component.component';


const routes: Routes = [
  { path: '', redirectTo: 'calendar', pathMatch: 'full' },

  { path: 'calendar', component: CalendarComponent },
  { path: 'bookings/new', component: NewBookingComponentComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}