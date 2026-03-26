import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  constructor(private router: Router) { }

  goToNewEvent() {
    this.router.navigate(['/bookings/new']);
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

}
