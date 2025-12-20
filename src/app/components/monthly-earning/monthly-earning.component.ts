import { Component, OnInit, AfterViewInit } from '@angular/core';
import { InstructorService, MonthlyEarning } from 'src/app/services/instructor.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-monthly-earnings',
  templateUrl: './monthly-earning.component.html',
  styleUrls: ['./monthly-earning.component.css'],
})
export class MonthlyEarningsComponent implements OnInit, AfterViewInit {
  monthlyData: MonthlyEarning[] = [];
  isLoading = false;
  chart: Chart | null = null;

  constructor(private instructorService: InstructorService) { }

  ngOnInit() {
    this.loadMonthlyEarnings();
  }

  ngAfterViewInit() {
    // Chart will be initialized after data is loaded
  }

  loadMonthlyEarnings() {
    this.isLoading = true;

    this.instructorService.getInstructorStats().subscribe({
      next: (response) => {
        if (response.success && response.dashboard.monthlyEarnings) {
          this.monthlyData = response.dashboard.monthlyEarnings;
          setTimeout(() => this.initChart(), 100);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading monthly earnings:', error);
        this.isLoading = false;
      }
    });
  }

  initChart() {
    const ctx = document.getElementById('earningsChart') as HTMLCanvasElement;
    if (!ctx || this.monthlyData.length === 0) return;

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.monthlyData.map(data => data.month);
    const earnings = this.monthlyData.map(data => data.earnings);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Monthly Earnings',
          data: earnings,
          borderColor: '#7b2cff',
          backgroundColor: 'rgba(123, 44, 255, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#7b2cff',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.parsed.y === null) return '';
                return context.parsed.y.toFixed(2);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return '$' + value;
              }
            }
          }
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}