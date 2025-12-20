import { Component, OnInit } from '@angular/core';
import { InstructorService, RecentEnrollment } from 'src/app/services/instructor.service';

interface EnrollmentDisplay {
  letter: string;
  name: string;
  course: string;
  price: string;
  time: string;
}

interface Session {
  name: string;
  type: string;
  time: string;
  badge?: string;
}

@Component({
  selector: 'app-recent-dashboard',
  templateUrl: './recent-dashboard.component.html',
  styleUrls: ['./recent-dashboard.component.css'],
})
export class RecentDashboardComponent implements OnInit {
  enrollments: EnrollmentDisplay[] = [];
  sessions: Session[] = [
    // This data would come from a consultation/session API
    {
      name: 'David Kim',
      type: 'Career Advice',
      time: 'Today at 3:00 PM',
      badge: 'Soon',
    },
    { name: 'Emma Wilson', type: 'Code Review', time: 'Tomorrow at 2:00 PM' },
    {
      name: 'Frank Martinez',
      type: 'Project Discussion',
      time: 'Thu, Nov 14 at 4:00 PM',
    },
  ];

  isLoading = false;

  constructor(private instructorService: InstructorService) {}

  ngOnInit() {
    this.loadRecentEnrollments();
  }

  loadRecentEnrollments() {
    this.isLoading = true;

    this.instructorService.getInstructorStats().subscribe({
      next: (response) => {
        if (response.success && response.dashboard.recentEnrollments) {
          this.enrollments = response.dashboard.recentEnrollments.map(enrollment => ({
            letter: enrollment.student.name.charAt(0).toUpperCase(),
            name: enrollment.student.name,
            course: enrollment.course.title,
            price: `$${enrollment.course.price.toFixed(2)}`,
            time: this.getRelativeTime(new Date(enrollment.enrolledAt))
          }));
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recent enrollments:', error);
        this.isLoading = false;
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
}