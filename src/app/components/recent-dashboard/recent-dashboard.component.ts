import { Component } from '@angular/core';

@Component({
  selector: 'app-recent-dashboard',
  templateUrl: './recent-dashboard.component.html',
  styleUrls: ['./recent-dashboard.component.css'],
})
export class RecentDashboardComponent {
  enrollments = [
    {
      letter: 'A',
      name: 'Alice Chen',
      course: 'Complete Web Development',
      price: '$89.99',
      time: '2 hours ago',
    },
    {
      letter: 'B',
      name: 'Bob Smith',
      course: 'Complete Web Development',
      price: '$89.99',
      time: '5 hours ago',
    },
    {
      letter: 'C',
      name: 'Carol Davis',
      course: 'Advanced JavaScript',
      price: '$99.99',
      time: '1 day ago',
    },
  ];

  sessions = [
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
}
