import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../shared/theme.service';
import Chart from 'chart.js/auto';

interface DashboardStats {
  title: string;
  value: string;
  change: string;
  icon: string;
  link: string;
}

interface PendingReview {
  course: string;
  instructor: string;
  time: string;
  id?: string;
  status?: string;
}

interface RecentActivity {
  title: string;
  details: string;
  time: string;
  icon: string;
  type: 'user' | 'course' | 'consultation' | 'payment';
}

interface HealthMetrics {
  serverUptime: string;
  activeSessions: number;
  responseTime: string;
  errorRate: string;
  systemStatus: string;
}

interface UserDistribution {
  students: number;
  instructors: number;
  admins: number;
  totalUsers: number;
}

@Component({
  selector: 'app-admindashboard',
  templateUrl: './admindashboard.component.html',
  styleUrls: ['./admindashboard.component.css']
})
export class AdmindashboardComponent implements OnInit {
  isDarkMode = false;
  isOpen = false;

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }
  stats: DashboardStats[] = [
    { title: 'Total Users', value: '52,845', change: '+12%', icon: 'assets/icons/users.png', link: 'users' },
    { title: 'Total Courses', value: '5,234', change: '+8%', icon: 'assets/icons/courses.png', link: 'courses' },
    { title: 'Consultations', value: '12,450', change: '+15%', icon: 'assets/icons/consultation.png', link: 'consultations' },
    { title: 'Platform Revenue', value: '$842K', change: '+22%', icon: 'assets/icons/revenue.png', link: 'financials' },
  ];

  pendingReviews: PendingReview[] = [
    { course: 'Machine Learning Fundamentals', instructor: 'Dr. Alan Smith', time: '2 hours ago', id: '1', status: 'pending' },
    { course: 'Blockchain Development', instructor: 'Sarah Lee', time: '5 hours ago', id: '2', status: 'pending' },
    { course: 'iOS App Development', instructor: 'Mike Johnson', time: '1 day ago', id: '3', status: 'pending' },
  ];

  recentActivity: RecentActivity[] = [
    { title: 'New user registration', details: 'john.doe@email.com', time: '5 minutes ago', icon: 'assets/icons/new-user.png', type: 'user' },
    { title: 'Course published', details: 'Advanced React Patterns', time: '1 hour ago', icon: 'assets/icons/course.png', type: 'course' },
    { title: 'Consultation completed', details: 'Sarah J. → Alex K.', time: '2 hours ago', icon: 'assets/icons/consultation.png', type: 'consultation' },
    { title: 'Payout processed', details: 'Dr. Sarah Johnson', time: '2 hours ago', icon: 'assets/icons/payment.png', type: 'payment' },
  ];

  healthMetrics: HealthMetrics = {
    serverUptime: '99.9%',
    activeSessions: 2845,
    responseTime: '145ms',
    errorRate: '0.02%',
    systemStatus: 'operational'
  };

  userDistribution: UserDistribution = {
    students: 45280,
    instructors: 6234,
    admins: 1331,
    totalUsers: 52845
  };

  constructor(private router: Router, private themeService: ThemeService) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  ngOnInit() {
    this.loadDashboardData();
    this.initUserChart();
  }

  goTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

  approve(review: PendingReview) {
    console.log('Approved:', review);
    // Backend integration: Send approval request
    if (review.id) {
      this.updateReviewStatus(review.id, 'approved');
    }
  }

  reject(review: PendingReview) {
    console.log('Rejected:', review);
    // Backend integration: Send rejection request
    if (review.id) {
      this.updateReviewStatus(review.id, 'rejected');
    }
  }

  details(review: PendingReview) {
    console.log('Details:', review);
    // Backend integration: Navigate to review details
    if (review.id) {
      this.router.navigate([`/admin/reviews/${review.id}`]);
    }
  }

  updateReviewStatus(reviewId: string | undefined, status: string) {
    if (reviewId) {
      // TODO: Implement API call to update review status
      // Example: this.reviewService.updateReviewStatus(reviewId, status)
      console.log(`Updating review ${reviewId} to ${status}`);
    }
  }

  initUserChart() {
    const ctx: any = document.getElementById('userChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Students', 'Instructors', 'Admins'],
          datasets: [{
            data: [
              this.userDistribution.students,
              this.userDistribution.instructors,
              this.userDistribution.admins
            ],
            backgroundColor: ['#5B198A', '#7b2cff', '#10b981'],
            borderWidth: 2,
            borderColor: this.isDarkMode ? '#1a1a1a' : '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: this.isDarkMode ? 'white' : '#1f2937',
                padding: 15,
                font: {
                  size: 12
                }
              }
            }
          }
        }
      });
    }
  }


  getActivityIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'user': 'fas fa-user-plus',
      'course': 'fas fa-book',
      'consultation': 'fas fa-comments',
      'payment': 'fas fa-dollar-sign'
    };
    return iconMap[type] || 'fas fa-circle';
  }

  loadDashboardData() {
    // TODO: Implement API calls to load real data
    // Example:
    // this.userService.getStats().subscribe(stats => this.stats = stats);
    // this.courseService.getPendingReviews().subscribe(reviews => this.pendingReviews = reviews);
    // this.activityService.getRecentActivity().subscribe(activities => this.recentActivity = activities);
    // this.healthService.getMetrics().subscribe(metrics => this.healthMetrics = metrics);
    console.log('Loading dashboard data...');
  }

  loadTheme(): void {
    // Theme is now handled by ThemeService
    // This method is kept for backward compatibility
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }
}

