import { Component } from '@angular/core';
import { ThemeService } from '../shared/theme.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  isDarkMode: boolean = false;
  isOpen: boolean = false;

  constructor(private themeService: ThemeService) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }
}
