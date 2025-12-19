import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardData, DashboardStats, ContinueLearning, RecentActivity, RecommendedCourse } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userName: string = 'John';
  stats: DashboardStats = {
    enrolledCourses: 0,
    upcomingSessions: 0,
    certificatesEarned: 0,
    learningStreakDays: 0
  };

  continueLearning: ContinueLearning[] = [];
  recentActivity: RecentActivity[] = [];
  recommended: RecommendedCourse[] = [];
  consultations: any[] = [];

  loading: boolean = true;
  error: string = '';
  currentLanguage: 'en' | 'ar' = 'en';
  isRTL: boolean = false;

  // Translations object
  translations: { [key: string]: { [key: string]: string } } = {
    en: {
      'welcome.back': 'Welcome back',
      'continue.journey': 'Continue your learning journey',
      'stats.enrolled': 'Enrolled Courses',
      'stats.upcoming': 'Upcoming Sessions',
      'stats.certificates': 'Certificates Earned',
      'stats.streak': 'Day Streak',
      'continue.learning': 'Continue Learning',
      'view.all': 'View All',
      'no.courses': 'No courses in progress',
      'browse.courses': 'Browse Courses',
      'progress': 'Progress',
      'lessons': 'lessons',
      'of': 'of',
      'continue': 'Continue',
      'upcoming.consultations': 'Upcoming Consultations',
      'book.more': 'Book More',
      'no.consultations': 'No upcoming consultations',
      'book.session': 'Book a Session',
      'join.session': 'Join Session',
      'recent.activity': 'Recent Activity',
      'no.activity': 'No recent activity',
      'recommended': 'Recommended for You',
      'no.recommendations': 'No recommendations yet',
      'loading': 'Loading your dashboard...',
      'retry': 'Retry'
    },
    ar: {
      'welcome.back': 'مرحباً بعودتك',
      'continue.journey': 'واصل رحلة التعلم الخاصة بك',
      'stats.enrolled': 'الدورات المسجلة',
      'stats.upcoming': 'الجلسات القادمة',
      'stats.certificates': 'الشهادات المكتسبة',
      'stats.streak': 'أيام متتالية',
      'continue.learning': 'واصل التعلم',
      'view.all': 'عرض الكل',
      'no.courses': 'لا توجد دورات قيد التقدم',
      'browse.courses': 'تصفح الدورات',
      'progress': 'التقدم',
      'lessons': 'دروس',
      'of': 'من',
      'continue': 'متابعة',
      'upcoming.consultations': 'الاستشارات القادمة',
      'book.more': 'حجز المزيد',
      'no.consultations': 'لا توجد استشارات قادمة',
      'book.session': 'احجز جلسة',
      'join.session': 'انضم للجلسة',
      'recent.activity': 'النشاط الأخير',
      'no.activity': 'لا يوجد نشاط حديث',
      'recommended': 'موصى به لك',
      'no.recommendations': 'لا توجد توصيات بعد',
      'loading': 'جاري تحميل لوحة التحكم...',
      'retry': 'إعادة المحاولة'
    }
  };

  // For displaying stats with icons
  statsDisplay = [
    { key: 'enrolledCourses', label: 'stats.enrolled', icon: 'book', color: '#0072FF' },
    { key: 'upcomingSessions', label: 'stats.upcoming', icon: 'calendar', color: '#00C6FF' },
    { key: 'certificatesEarned', label: 'stats.certificates', icon: 'award', color: '#FF6B6B' },
    { key: 'learningStreakDays', label: 'stats.streak', icon: 'fire', color: '#FFA500' }
  ];

  constructor(private userService: DashboardService) {}

  ngOnInit(): void {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('language') as 'en' | 'ar' || 'en';
    this.setLanguage(savedLang);
    this.loadDashboardData();
  }

  setLanguage(lang: 'en' | 'ar'): void {
    this.currentLanguage = lang;
    this.isRTL = lang === 'ar';
    localStorage.setItem('language', lang);
    document.documentElement.dir = this.isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  toggleLanguage(): void {
    const newLang: 'en' | 'ar' = this.currentLanguage === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }

  translate(key: string): string {
    const lang = this.currentLanguage;
    return this.translations[lang]?.[key] || key;
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';
    this.userService.getDashboardData().subscribe({
      next: (response) => {
        if (response.success) {
          this.userName = response.data.user.name;
          this.stats = response.data.stats;
          this.continueLearning = response.data.continueLearning;
          this.recentActivity = response.data.recentActivity;
          this.recommended = response.data.recommended;
          this.consultations = response.data.consultations;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });
  }

  getStatValue(key: string): number {
    return this.stats[key as keyof DashboardStats] || 0;
  }

  getContinueLearning(): ContinueLearning[] {
    return this.continueLearning;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  continueCourse(courseId: string): void {
    console.log('Continue course:', courseId);
  }

  joinSession(consultationId: string): void {
    console.log('Join session:', consultationId);
  }

  viewAllCourses(): void {
    console.log('View all courses');
  }

  bookMoreSessions(): void {
    console.log('Book more sessions');
  }
}
