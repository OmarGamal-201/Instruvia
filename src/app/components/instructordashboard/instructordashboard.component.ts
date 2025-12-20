import { Component, OnInit } from '@angular/core';
import { InstructorService, InstructorStats } from 'src/app/services/instructor.service';

@Component({
  selector: 'app-instructordashboard',
  templateUrl: './instructordashboard.component.html',
  styleUrls: ['./instructordashboard.component.css']
})
export class InstructordashboardComponent implements OnInit {
  isLoading = false;
  
  // Statistics data
  myStats: InstructorStats = {
    totalRevenue: 0,
    totalEnrollments: 0,
    totalCourses: 0,
    averageRating: 0,
  };

  constructor(private instructorService: InstructorService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    this.instructorService.getInstructorStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.myStats = response.dashboard.statistics;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading instructor stats:', error);
        this.isLoading = false;
      }
    });
  }

  refreshData() {
    this.loadDashboardData();
  }
}