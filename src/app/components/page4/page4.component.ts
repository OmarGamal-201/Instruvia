import { Component,OnInit } from '@angular/core';
import { BookingService } from 'src/app/services/booking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page4',
  templateUrl: './page4.component.html',
  styleUrls: ['./page4.component.css'],
})
export class Page4Component {
  fullName = '';
  email = '';
  phone = '';
  notes = '';

  constructor(public booking: BookingService, private router: Router) {}

  goBack() {
    this.router.navigate(['/page3']);
  }


  goNext(currentPage: number) {
    this.booking.updateData({
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      notes: this.notes,
    });
    this.router.navigate(['/page5']);
  }
}
