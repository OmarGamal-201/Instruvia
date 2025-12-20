import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslationService } from '../../services/translation.service';
import { ThemeService } from '../../services/theme.service';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';
// import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, OnDestroy {

  course: any = null;
  courseId: string | null = null;
  isLoading: boolean = true;
  isDarkMode = false;
  currentLang = 'en';
  discountCode: string = '';

  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];
  includedItems = [
    { text: 'lectures', value: 'Full', suffix: '' },
    { text: 'lifetime_access', value: '' },
    { text: 'certificate', value: '' },
    { text: 'money_back_guarantee', value: '' }
  ];

  constructor(
    private translationService: TranslationService,
    private themeService: ThemeService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId');

    if (this.courseId) {
      this.fetchCourseFromAPI(this.courseId);
      console.log(this.course)
    }
  }
  fetchCourseFromAPI(id: string) {
  this.isLoading = true;
  this.http.get(`http://localhost:5000/api/courses/${id}`)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: any) => {
        this.course = response.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading course details:', error);
        this.isLoading = false;
      }
    });
}
  get platformFee(): number {
    return this.course ? (this.course.price * 0.20) : 0;
  }

  get instructorEarnings(): number {
    return this.course ? (this.course.price - this.platformFee) : 0;
  }


  formatNumber(num: number): string {
    if (!num) return '0';
    return num.toLocaleString(this.currentLang === 'ar' ? 'ar-EG' : 'en-US');
  }

  onEnrollClick(): void {
    console.log(`Enrollment for: ${this.course?.title}`);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }
}
