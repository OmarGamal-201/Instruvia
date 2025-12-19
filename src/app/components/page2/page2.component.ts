import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';

interface Consultation {
  id: number;
  title: string;
  desc?: string;
  price: number;
  duration: string;
}

@Component({
  selector: 'app-page2',
  templateUrl: './page2.component.html',
  styleUrls: ['./page2.component.css'],
})
export class Page2Component {
  // Optional: إذا جاي من page1 حط selectedConsultation كـ @Input from parent
  @Input() selectedConsultation: Consultation | null = null;

  // Emitted when user presses back / continue
  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<{ date: Date | null }>();

  // available weekdays (0=Sun ... 6=Sat). Example: Mon, Wed, Fri
  availableWeekdays = [1, 3, 5];

  // calendar state
  viewYear!: number;
  viewMonth!: number; // 0-indexed
  calendar: (Date | null)[][] = [];

  // selected date
  selectedDate: Date | null = null;

  select(day: Date | null) {
    this.selectedDate = day;
    this.booking.updateData({
      date: day?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }

  // sample fallback consultation if parent didn't pass one
  fallbackConsultation: Consultation = {
    id: 2,
    title: 'Skill Development',
    desc: 'Focus on specific skills to enhance your career.',
    price: 75,
    duration: '60 min',
  };

  ngOnInit(): void {
    const today = new Date();
    this.viewYear = today.getFullYear();
    this.viewMonth = today.getMonth();
    this.buildCalendar(this.viewYear, this.viewMonth);

    if (!this.selectedConsultation) {
      this.selectedConsultation = this.fallbackConsultation;
    }
  }

  // Build matrix of weeks with Date or null
  buildCalendar(year: number, month: number) {
    const firstOfMonth = new Date(year, month, 1);
    const startDay = firstOfMonth.getDay(); // day index 0..6
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks: (Date | null)[][] = [];
    let week: (Date | null)[] = [];

    // fill blanks before month starts
    for (let i = 0; i < startDay; i++) {
      week.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      week.push(d);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    // fill trailing blanks
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    this.calendar = weeks;
  }

  prevMonth() {
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear--;
    } else {
      this.viewMonth--;
    }
    this.buildCalendar(this.viewYear, this.viewMonth);
  }

  nextMonth() {
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear++;
    } else {
      this.viewMonth++;
    }
    this.buildCalendar(this.viewYear, this.viewMonth);
  }

  isAvailable(day: Date | null) {
    if (!day) return false;
    return this.availableWeekdays.includes(day.getDay());
  }



  formatSelectedDate(): string {
    if (!this.selectedDate) return '';
    const opts: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    };
    return this.selectedDate.toLocaleDateString(undefined, opts);
  }

  continue() {
    this.continueClicked.emit({ date: this.selectedDate });
  }

  // helper: month name
  monthName() {
    return new Date(this.viewYear, this.viewMonth, 1).toLocaleString(
      undefined,
      { month: 'long', year: 'numeric' }
    );
  }
  round(n: number): number {
    return Math.round(n);
  }

  constructor(public booking: BookingService, private router: Router) {}

  goNext(currentPage: number) {
    const nextPage = currentPage + 1;
    this.router.navigate([`/page${nextPage}`]);
  }

  back() {
    // إرجاع للصفحة 2 (لو محتاج تغيير المسار عندك غيّره)
    this.router.navigate(['/page1'], {
      state: { selectedConsultation: this.selectedConsultation },
    });
  }
}
