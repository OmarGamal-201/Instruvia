import { Component } from '@angular/core';

@Component({
  selector: 'app-monthly-earnings',
  templateUrl: './monthly-earning.component.html',
  styleUrls: ['./monthly-earning.component.css'],
})
export class MonthlyEarningComponent {
  selectedTab: string = 'monthly';

  selectTab(tab: string) {
    this.selectedTab = tab;
  }
}
