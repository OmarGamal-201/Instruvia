import { Component } from '@angular/core';
import { BookingService } from 'src/app/services/booking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page5',
  templateUrl: './page5.component.html',
  styleUrls: ['./page5.component.css'],
})
export class Page5Component {
  cardNumber = '';
  cardHolder = '';
  expiry = '';
  cvv = '';

  constructor(public booking: BookingService, private router: Router) {}

  // دالة تنسيق رقم الفيزا: 1234 5678 1234 5678
  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += value[i];
    }
    this.cardNumber = formatted.substring(0, 19); // أقصى حد 16 رقم + 3 مسافات
  }

  // دالة تنسيق التاريخ: MM/YY
  formatExpiry(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      this.expiry = value.substring(0, 2) + '/' + value.substring(2, 4);
    } else {
      this.expiry = value;
    }
  }

  // دالة تنسيق الـ CVV (3 أرقام فقط)
  formatCVV(event: any) {
    this.cvv = event.target.value.replace(/\D/g, '').substring(0, 3);
  }

  goBack() {
    this.router.navigate(['/page4']);
  }

  pay() {
    const data = this.booking.getSnapshot();
    alert(`Payment of $${data.total} successful for ${data.fullName}`);
  }
}
