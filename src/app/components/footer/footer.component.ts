import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  encapsulation: ViewEncapsulation.None, // This is the key!
})
export class FooterComponent implements OnInit {
  isDarkMode: boolean = false;

  ngOnInit(): void {
    this.loadTheme();
  }

  loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-theme');
    } else if (savedTheme === 'light') {
      this.isDarkMode = false;
      document.body.classList.remove('dark-theme');
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      this.isDarkMode = prefersDark;
      if (prefersDark) {
        document.body.classList.add('dark-theme');
      }
      localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }

    // Debug: log to console
    console.log('Theme toggled:', this.isDarkMode ? 'dark' : 'light');
    console.log('Body classes:', document.body.classList);
  }
}
