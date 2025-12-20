import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../shared/theme.service';
import { AdmindashboardService, DashboardStats as BackendStats, InstructorApplication } from '../../services/admindashboard.service';
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
  isLoading = false;

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  stats: DashboardStats[] = [
    { title: 'Total Users', value: '0', change: '+0%', icon: 'assets/icons/users.png', link: 'users' },
    { title: 'Total Courses', value: '0', change: '+0%', icon: 'assets/icons/courses.png', link: 'courses' },
    { title: 'Consultations', value: '0', change: '+0%', icon: 'assets/icons/consultation.png', link: 'consultations' },
    { title: 'Platform Revenue', value: '$0', change: '+0%', icon: 'assets/icons/revenue.png', link: 'financials' },
  ];

  pendingReviews: PendingReview[] = [];

  recentActivity: RecentActivity[] = [];

  healthMetrics: HealthMetrics = {
    serverUptime: '99.9%',
    activeSessions: 0,
    responseTime: '0ms',
    errorRate: '0.00%',
    systemStatus: 'loading'
  };

  userDistribution: UserDistribution = {
    students: 0,
    instructors: 0,
    admins: 0,
    totalUsers: 0
  };

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private adminService: AdmindashboardService
  ) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  goTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

  approve(review: PendingReview) {
    if (!review.id) return;

    this.adminService.approveInstructorApplication(review.id, { approved: true })
      .subscribe({
        next: (response) => {
          console.log('Approved:', response);
          alert(response.message);
          // Refresh the pending reviews
          this.loadPendingInstructorApplications();
        },
        error: (error) => {
          console.error('Error approving application:', error);
          alert('Failed to approve application');
        }
      });
  }

  reject(review: PendingReview) {
    if (!review.id) return;

    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (!rejectionReason) return;

    this.adminService.approveInstructorApplication(review.id, { 
      approved: false, 
      rejectionReason 
    })
      .subscribe({
        next: (response) => {
          console.log('Rejected:', response);
          alert(response.message);
          // Refresh the pending reviews
          this.loadPendingInstructorApplications();
        },
        error: (error) => {
          console.error('Error rejecting application:', error);
          alert('Failed to reject application');
        }
      });
  }

  details(review: PendingReview) {
    if (review.id) {
      this.router.navigate([`/admin/instructor-applications/${review.id}`]);
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
    this.isLoading = true;
    
    // Load dashboard stats
    this.adminService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success) {
          // Update user distribution
          this.userDistribution = {
            students: response.stats.totalStudents,
            instructors: response.stats.totalInstructors,
            admins: response.stats.totalAdmins,
            totalUsers: response.stats.totalUsers
          };

          // Update stats cards
          this.stats[0].value = response.stats.totalUsers.toLocaleString();
          
          // Convert recent users to activity feed
          this.recentActivity = response.recentUsers.map(user => ({
            title: 'New user registration',
            details: user.email,
            time: this.getRelativeTime(new Date(user.createdAt)),
            icon: 'assets/icons/new-user.png',
            type: 'user' as const
          }));

          // Initialize chart with real data
          setTimeout(() => this.initUserChart(), 100);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading = false;
      }
    });

    // Load pending instructor applications
    this.loadPendingInstructorApplications();
  }

  loadPendingInstructorApplications() {
    this.adminService.getInstructorApplications(1, 5, 'pending').subscribe({
      next: (response) => {
        if (response.success) {
          this.pendingReviews = response.data.map(app => ({
            course: app.specialization || 'No specialization',
            instructor: app.applicant.name,
            time: this.getRelativeTime(new Date(app.submittedAt)),
            id: app._id,
            status: app.status
          }));
        }
      },
      error: (error) => {
        console.error('Error loading pending applications:', error);
      }
    });
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  }

  loadTheme(): void {
    // Theme is now handled by ThemeService
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }
}