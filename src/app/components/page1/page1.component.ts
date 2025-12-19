import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';

interface Consultation {
  id: number;
  title: string;
  desc: string;
  price: number;
  duration: string;
}

@Component({
  selector: 'app-page1',
  templateUrl: './page1.component.html',
  styleUrls: ['./page1.component.css'],
})
export class Page1Component {
  selected: Consultation | null = null;

  options: Consultation[] = [
    {
      id: 1,
      title: 'Initial Consultation',
      desc: 'Discuss your career goals and current skills.',
      price: 75,
      duration: '60 min',
    },
    {
      id: 2,
      title: 'Skill Development',
      desc: 'Focus on specific skills to enhance your career.',
      price: 75,
      duration: '60 min',
    },
  ];

  selectCard(opt: any) {
    this.selected = opt;
    this.booking.updateData({ consultation: opt });
  }

  platformFee = 15;

  continue() {
    console.log('Continue pressed, selected:', this.selected);
  }

  constructor(public booking: BookingService, private router: Router) {}


  goNext(currentPage: number) {
    const nextPage = currentPage + 1;
    this.router.navigate([`/page${nextPage}`]);
  }
}
