import { Component, OnInit } from '@angular/core';
import { InstructorService, CoursePerformance } from 'src/app/services/instructor.service';

@Component({
  selector: 'app-course-table',
  templateUrl: './course-table.component.html',
  styleUrls: ['./course-table.component.css'],
})
export class CourseTableComponent implements OnInit {
  courses: CoursePerformance[] = [];
  isLoading = false;

  constructor(private instructorService: InstructorService) {}

  ngOnInit() {
    this.loadCoursePerformance();
  }

  loadCoursePerformance() {
    this.isLoading = true;
    
    this.instructorService.getInstructorStats().subscribe({
      next: (response) => {
        if (response.success && response.dashboard.coursePerformance) {
          this.courses = response.dashboard.coursePerformance;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading course performance:', error);
        this.isLoading = false;
      }
    });
  }
}