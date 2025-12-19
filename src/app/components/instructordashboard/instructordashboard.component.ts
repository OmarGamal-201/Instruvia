import { Component } from '@angular/core';
import { DashboardService } from 'src/app/services/stats.service';

@Component({
  selector: 'app-instructordashboard',
  templateUrl: './instructordashboard.component.html',
  styleUrls: ['./instructordashboard.component.css']
})
export class InstructordashboardComponent {
  // ده مخزن هنحط فيه البيانات اللي هتيجي من الباك (بدأناه بأصفار)
  myStats: any = {
    totalRevenue: 0,
    totalEnrollments: 0,
    totalCourses: 0,
    averageRating: 0,
  };

  constructor(private dashService: DashboardService) {}

  ngOnInit() {
    // أول ما الصفحة تحمل، بننادي الخدمة
    this.dashService.getInstructorStats().subscribe((res: any) => {
      // هنا بنقوله: خد البيانات اللي جت من الباك وحطها في المخزن بتاعنا
      this.myStats = res.dashboard.statistics;
    });
  }
}
