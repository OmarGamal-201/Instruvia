import { Component } from '@angular/core';

@Component({
  selector: 'app-course-table',
  templateUrl: './course-table.component.html',
  styleUrls: ['./course-table.component.css'],
})
export class CourseTableComponent {
  courses = [
    {
      name: 'Complete Web Development Bootcamp',
      students: 1245,
      rating: 4.9,
      revenue: 12450,
    },
    {
      name: 'Advanced JavaScript & React',
      students: 892,
      rating: 4.8,
      revenue: 8920,
    },
    {
      name: 'Node.js Backend Mastery',
      students: 708,
      rating: 4.9,
      revenue: 7080,
    },
  ];
}
