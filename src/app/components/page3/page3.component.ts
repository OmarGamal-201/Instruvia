import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-page3',
  templateUrl: './page3.component.html',
  styleUrls: ['./page3.component.css'],
})
export class Page3Component {
  // الوقت المتاح (grid 3x4)
  timeSlots: string[] = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
    '07:00 PM',
  ];

  selectedTime: string | null = null;

  // نحاول نقرأ الـ date والـ selectedConsultation من history state (مررناهم من صفحة 2/1)
  selectedDate: string | null = null;
  selectedConsultation: {
    title?: string;
    price?: number;
    duration?: string;
  } | null = null;

  constructor(public booking: BookingService, private router: Router) {}

  ngOnInit(): void {
    // قراءة من state إذا مرّ عبر router.navigate
    const s: any = history.state ?? {};
    if (s.date) this.selectedDate = s.date;
    if (s.selectedConsultation)
      this.selectedConsultation = s.selectedConsultation;

    // fallback values إذا ما جاش شيء (عشان العرض يشتغل لو فتحت الصفحة مباشرة)
    if (!this.selectedDate) this.selectedDate = '12/19/2025';
    if (!this.selectedConsultation) {
      this.selectedConsultation = {
        title: 'Skill Development',
        price: 75,
        duration: '60 min',
      };
    }
  }

  selectTime(t: string) {
    this.selectedTime = t;
    this.booking.updateData({ time: t });
  }

  back() {
    // إرجاع للصفحة 2 (لو محتاج تغيير المسار عندك غيّره)
    this.router.navigate(['/page2'], {
      state: { selectedConsultation: this.selectedConsultation },
    });
  }

  continue() {
    if (!this.selectedTime) return;
    // ارسال الوقت والـ date للصفحة 4
    this.router.navigate(['/page4'], {
      state: {
        selectedConsultation: this.selectedConsultation,
        date: this.selectedDate,
        time: this.selectedTime,
      },
    });
  }

  // دالة مساعدة لعرض النص الكامل في الـ banner
  selectedBannerText(): string {
    if (!this.selectedTime) return '';
    return `✓ Selected: ${this.selectedTime} on ${this.selectedDate}`;
  }

  goNext(currentPage: number) {
    const nextPage = currentPage + 1;
    this.router.navigate([`/page${nextPage}`]);
  }
}
