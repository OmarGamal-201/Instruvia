import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.css'],
})
export class StatsCardComponent {
  @Input() icon!: string;
  @Input() value: any = '';
  @Input() label!: string;
  @Input() percent!: string;
  @Input() customClass!: string;
}
